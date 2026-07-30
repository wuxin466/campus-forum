package com.campus.forum.service;

import com.campus.forum.dto.file.FileResponse;
import com.campus.forum.entity.FileObject;
import com.campus.forum.exception.BusinessException;
import com.campus.forum.mapper.FileObjectMapper;
import io.minio.BucketExistsArgs;
import io.minio.GetPresignedObjectUrlArgs;
import io.minio.MakeBucketArgs;
import io.minio.MinioClient;
import io.minio.PutObjectArgs;
import io.minio.RemoveObjectArgs;
import io.minio.http.Method;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.security.MessageDigest;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HexFormat;
import java.util.Locale;
import java.util.Set;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

@Service
@RequiredArgsConstructor
@Slf4j
public class FileService {
    private static final Set<String> ALLOWED_TYPES = Set.of(
            "image/jpeg", "image/png", "image/webp", "image/gif", "application/pdf");
    private static final int URL_EXPIRES_SECONDS = 900;
    private final MinioClient minioClient;
    private final FileObjectMapper fileMapper;

    @Value("${campus.minio.bucket}")
    private String bucket;
    @Value("${campus.minio.max-file-size}")
    private long maxFileSize;
    @Value("${campus.storage.mode:minio}")
    private String storageMode;
    @Value("${campus.storage.local-path:./data/uploads}")
    private String localPath;

    @Transactional
    public FileResponse upload(long userId, MultipartFile file, int accessType) {
        validate(file, accessType);
        String objectName = UUID.randomUUID() + extension(file.getOriginalFilename());
        String objectKey = isLocalStorage() ? objectName : LocalDate.now() + "/" + objectName;
        String sha256;
        try {
            sha256 = sha256(file);
            if (isLocalStorage()) {
                Path target = localFile(objectKey);
                Files.createDirectories(target.getParent());
                try (InputStream stream = file.getInputStream()) {
                    Files.copy(stream, target, StandardCopyOption.REPLACE_EXISTING);
                }
            } else {
                ensureBucket();
                try (InputStream stream = file.getInputStream()) {
                    minioClient.putObject(PutObjectArgs.builder().bucket(bucket).object(objectKey)
                            .contentType(file.getContentType()).stream(stream, file.getSize(), -1).build());
                }
            }
        } catch (Exception exception) {
            log.error("File upload failed, storageMode={}, localPath={}, objectKey={}",
                    storageMode, localPath, objectKey, exception);
            throw new BusinessException(503, "文件存储服务暂不可用");
        }
        FileObject object = new FileObject();
        object.setUploaderId(userId);
        object.setBucketName(isLocalStorage() ? "local" : bucket);
        object.setObjectKey(objectKey);
        object.setOriginalName(file.getOriginalFilename());
        object.setContentType(file.getContentType());
        object.setFileSize(file.getSize());
        object.setSha256(sha256);
        object.setAccessType(accessType);
        object.setStatus(1);
        object.setCreatedAt(LocalDateTime.now());
        object.setDeleted(0);
        try {
            fileMapper.insert(object);
        } catch (RuntimeException exception) {
            removeQuietly(objectKey);
            throw exception;
        }
        return response(object);
    }

    public FileResponse get(long requesterId, boolean admin, long fileId) {
        FileObject object = requireFile(fileId);
        if (object.getAccessType() == 0 && !object.getUploaderId().equals(requesterId) && !admin) {
            throw new BusinessException(403, "没有文件访问权限");
        }
        return response(object);
    }

    public Download download(long fileId) {
        FileObject object = requireFile(fileId);
        if (object.getAccessType() != 1) throw new BusinessException(403, "该文件不是公开文件");
        if ("local".equals(object.getBucketName())) {
            Path path = localFile(object.getObjectKey());
            if (!Files.isRegularFile(path)) throw new BusinessException(404, "文件不存在");
            return new Download(new FileSystemResource(path), object.getContentType(), object.getFileSize(), null);
        }
        return new Download(null, object.getContentType(), object.getFileSize(), response(object).url());
    }

    @Transactional
    public void delete(long requesterId, boolean admin, long fileId) {
        FileObject object = requireFile(fileId);
        if (!object.getUploaderId().equals(requesterId) && !admin) {
            throw new BusinessException(403, "没有文件删除权限");
        }
        try {
            if ("local".equals(object.getBucketName())) {
                Files.deleteIfExists(localFile(object.getObjectKey()));
            } else {
                minioClient.removeObject(RemoveObjectArgs.builder().bucket(object.getBucketName())
                        .object(object.getObjectKey()).build());
            }
        } catch (Exception exception) {
            throw new BusinessException(503, "文件存储服务暂不可用");
        }
        fileMapper.deleteById(fileId);
    }

    private FileObject requireFile(long id) {
        FileObject object = fileMapper.selectById(id);
        if (object == null || object.getStatus() != 1) throw new BusinessException(404, "文件不存在");
        return object;
    }

    private FileResponse response(FileObject object) {
        if ("local".equals(object.getBucketName())) {
            return new FileResponse(object.getId(), object.getOriginalName(), object.getContentType(),
                    object.getFileSize(), object.getSha256(), object.getAccessType(),
                    "/api/public/files/" + object.getId(), 0, object.getCreatedAt());
        }
        try {
            String url = minioClient.getPresignedObjectUrl(GetPresignedObjectUrlArgs.builder()
                    .method(Method.GET).bucket(object.getBucketName()).object(object.getObjectKey())
                    .expiry(URL_EXPIRES_SECONDS).build());
            return new FileResponse(object.getId(), object.getOriginalName(), object.getContentType(),
                    object.getFileSize(), object.getSha256(), object.getAccessType(), url,
                    URL_EXPIRES_SECONDS, object.getCreatedAt());
        } catch (Exception exception) {
            throw new BusinessException(503, "无法生成文件访问地址");
        }
    }

    private void validate(MultipartFile file, int accessType) {
        if (file == null || file.isEmpty()) throw BusinessException.badRequest("请选择要上传的文件");
        if (file.getSize() > maxFileSize) throw BusinessException.badRequest("文件不能超过10MB");
        if (!ALLOWED_TYPES.contains(file.getContentType())) throw BusinessException.badRequest("不支持的文件类型");
        if (accessType != 0 && accessType != 1) throw BusinessException.badRequest("文件访问类型错误");
    }

    private void ensureBucket() throws Exception {
        if (!minioClient.bucketExists(BucketExistsArgs.builder().bucket(bucket).build())) {
            minioClient.makeBucket(MakeBucketArgs.builder().bucket(bucket).build());
        }
    }

    private String sha256(MultipartFile file) throws Exception {
        MessageDigest digest = MessageDigest.getInstance("SHA-256");
        try (InputStream stream = file.getInputStream()) {
            byte[] buffer = new byte[8192];
            int read;
            while ((read = stream.read(buffer)) != -1) digest.update(buffer, 0, read);
        }
        return HexFormat.of().formatHex(digest.digest());
    }

    private String extension(String name) {
        if (name == null) return "";
        int index = name.lastIndexOf('.');
        if (index < 0 || name.length() - index > 10) return "";
        return name.substring(index).toLowerCase(Locale.ROOT).replaceAll("[^a-z0-9.]", "");
    }

    private void removeQuietly(String objectKey) {
        try {
            if (isLocalStorage()) Files.deleteIfExists(localFile(objectKey));
            else minioClient.removeObject(RemoveObjectArgs.builder().bucket(bucket).object(objectKey).build());
        } catch (Exception ignored) { }
    }

    private boolean isLocalStorage() { return "local".equalsIgnoreCase(storageMode); }

    private Path localFile(String objectKey) {
        Path root = Path.of(localPath).toAbsolutePath().normalize();
        Path target = root.resolve(objectKey).normalize();
        if (!target.startsWith(root)) throw BusinessException.badRequest("非法文件路径");
        return target;
    }

    public record Download(Resource resource, String contentType, long size, String redirectUrl) { }
}
