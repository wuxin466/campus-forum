package com.campus.forum.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.campus.forum.dto.auth.ForgotPasswordResponse;
import com.campus.forum.entity.AuthRefreshToken;
import com.campus.forum.entity.PasswordResetCode;
import com.campus.forum.entity.User;
import com.campus.forum.exception.BusinessException;
import com.campus.forum.mapper.AuthRefreshTokenMapper;
import com.campus.forum.mapper.PasswordResetCodeMapper;
import com.campus.forum.mapper.UserMapper;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.time.LocalDateTime;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service @RequiredArgsConstructor
public class PasswordRecoveryService {
    private final UserMapper userMapper;
    private final PasswordResetCodeMapper codeMapper;
    private final AuthRefreshTokenMapper refreshTokenMapper;
    private final PasswordEncoder passwordEncoder;
    private final JavaMailSender mailSender;
    private final SecureRandom random = new SecureRandom();
    @Value("${campus.password-reset.expose-code:false}") private boolean exposeCode;
    @Value("${campus.password-reset.mail-enabled:true}") private boolean mailEnabled;
    @Value("${campus.password-reset.from:noreply@campus.local}") private String from;

    @Transactional
    public ForgotPasswordResponse request(String rawEmail) {
        String email = rawEmail.trim().toLowerCase();
        User user = userMapper.selectOne(Wrappers.<User>lambdaQuery().eq(User::getEmail, email));
        if (user == null) return new ForgotPasswordResponse("如果邮箱已绑定，验证码将发送到该邮箱", null);
        LocalDateTime minuteAgo = LocalDateTime.now().minusMinutes(1);
        if (codeMapper.selectCount(Wrappers.<PasswordResetCode>lambdaQuery()
                .eq(PasswordResetCode::getUserId, user.getId()).ge(PasswordResetCode::getCreatedAt, minuteAgo)) > 0) {
            throw BusinessException.badRequest("验证码发送过于频繁，请一分钟后再试");
        }
        String code = String.format("%06d", random.nextInt(1_000_000));
        PasswordResetCode record = new PasswordResetCode();
        record.setUserId(user.getId()); record.setCodeHash(hash(code));
        record.setExpiresAt(LocalDateTime.now().plusMinutes(10)); record.setCreatedAt(LocalDateTime.now());
        codeMapper.insert(record);
        if (mailEnabled) {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(from); message.setTo(email); message.setSubject("同窗圈密码重置验证码");
            message.setText("你的验证码是 " + code + "，10分钟内有效。如非本人操作请忽略。");
            mailSender.send(message);
        }
        return new ForgotPasswordResponse(mailEnabled ? "验证码已发送，请查收邮箱" : "本地开发验证码已生成",
                exposeCode ? code : null);
    }

    @Transactional
    public void reset(String rawEmail, String code, String newPassword) {
        User user = userMapper.selectOne(Wrappers.<User>lambdaQuery().eq(User::getEmail, rawEmail.trim().toLowerCase()));
        if (user == null) throw BusinessException.badRequest("验证码无效或已过期");
        PasswordResetCode record = codeMapper.selectOne(Wrappers.<PasswordResetCode>lambdaQuery()
                .eq(PasswordResetCode::getUserId, user.getId()).isNull(PasswordResetCode::getUsedAt)
                .ge(PasswordResetCode::getExpiresAt, LocalDateTime.now()).orderByDesc(PasswordResetCode::getId).last("LIMIT 1"));
        if (record == null || !MessageDigest.isEqual(hash(code).getBytes(StandardCharsets.UTF_8), record.getCodeHash().getBytes(StandardCharsets.UTF_8))) {
            throw BusinessException.badRequest("验证码无效或已过期");
        }
        record.setUsedAt(LocalDateTime.now()); codeMapper.updateById(record);
        updatePassword(user, newPassword);
    }

    @Transactional
    public void adminReset(long userId, String newPassword) {
        User user = userMapper.selectById(userId);
        if (user == null) throw new BusinessException(404, "用户不存在");
        updatePassword(user, newPassword);
    }

    private void updatePassword(User user, String password) {
        user.setPasswordHash(passwordEncoder.encode(password)); userMapper.updateById(user);
        AuthRefreshToken update = new AuthRefreshToken(); update.setRevokedAt(LocalDateTime.now());
        refreshTokenMapper.update(update, Wrappers.<AuthRefreshToken>lambdaUpdate()
                .eq(AuthRefreshToken::getUserId, user.getId()).isNull(AuthRefreshToken::getRevokedAt));
    }
    private String hash(String value) {
        try { return java.util.HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256").digest(value.getBytes(StandardCharsets.UTF_8))); }
        catch (Exception e) { throw new IllegalStateException(e); }
    }
}
