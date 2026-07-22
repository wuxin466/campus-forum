package com.campus.forum.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.campus.forum.dto.auth.LoginRequest;
import com.campus.forum.dto.auth.RegisterRequest;
import com.campus.forum.dto.auth.TokenResponse;
import com.campus.forum.dto.auth.ChangePasswordRequest;
import com.campus.forum.entity.AuthRefreshToken;
import com.campus.forum.dto.user.UserProfileResponse;
import com.campus.forum.entity.User;
import com.campus.forum.exception.BusinessException;
import com.campus.forum.mapper.UserMapper;
import com.campus.forum.mapper.AuthRefreshTokenMapper;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.time.Duration;
import java.util.Base64;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.beans.factory.annotation.Value;

@Service
@RequiredArgsConstructor
public class AuthService {
    private final UserMapper userMapper;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenService jwtTokenService;
    private final AuthRefreshTokenMapper refreshTokenMapper;
    private final SecureRandom secureRandom = new SecureRandom();

    @Value("${campus.jwt.refresh-token-days}")
    private long refreshTokenDays;

    @Transactional
    public UserProfileResponse register(RegisterRequest request) {
        boolean exists = userMapper.exists(Wrappers.<User>lambdaQuery().eq(User::getUsername, request.username()));
        if (exists) throw BusinessException.badRequest("账号已存在");
        User user = new User();
        user.setUsername(request.username());
        user.setPasswordHash(passwordEncoder.encode(request.password()));
        user.setNickname(request.nickname());
        user.setCollege(request.college());
        user.setGrade(request.grade());
        user.setRole(0);
        user.setVerifyStatus(0);
        user.setStatus(1);
        user.setDeleted(0);
        userMapper.insert(user);
        return UserProfileResponse.from(user);
    }

    @Transactional
    public TokenResponse login(LoginRequest request, String deviceInfo) {
        User user = userMapper.selectOne(Wrappers.<User>lambdaQuery().eq(User::getUsername, request.username()));
        if (user == null || !passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            throw new BusinessException(401, "账号或密码错误");
        }
        if (user.getStatus() == 0 || user.getStatus() == 2) {
            throw new BusinessException(403, "账号已被禁用或封禁");
        }
        user.setLastLoginAt(LocalDateTime.now());
        userMapper.updateById(user);
        return issueTokens(user, deviceInfo);
    }

    @Transactional
    public TokenResponse refresh(String rawToken, String deviceInfo) {
        AuthRefreshToken stored = refreshTokenMapper.selectOne(Wrappers.<AuthRefreshToken>lambdaQuery()
                .eq(AuthRefreshToken::getTokenHash, hash(rawToken)));
        if (stored == null || stored.getRevokedAt() != null || stored.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new BusinessException(401, "刷新令牌无效或已过期");
        }
        User user = userMapper.selectById(stored.getUserId());
        if (user == null || user.getStatus() != 1) throw new BusinessException(401, "用户状态异常");
        stored.setRevokedAt(LocalDateTime.now());
        refreshTokenMapper.updateById(stored);
        return issueTokens(user, deviceInfo);
    }

    @Transactional
    public void logout(String rawToken) {
        AuthRefreshToken stored = refreshTokenMapper.selectOne(Wrappers.<AuthRefreshToken>lambdaQuery()
                .eq(AuthRefreshToken::getTokenHash, hash(rawToken)));
        if (stored != null && stored.getRevokedAt() == null) {
            stored.setRevokedAt(LocalDateTime.now());
            refreshTokenMapper.updateById(stored);
        }
    }

    @Transactional
    public void changePassword(long userId, ChangePasswordRequest request) {
        User user = userMapper.selectById(userId);
        if (user == null) throw new BusinessException(404, "用户不存在");
        if (!passwordEncoder.matches(request.currentPassword(), user.getPasswordHash())) {
            throw BusinessException.badRequest("当前密码错误");
        }
        if (passwordEncoder.matches(request.newPassword(), user.getPasswordHash())) {
            throw BusinessException.badRequest("新密码不能与当前密码相同");
        }
        user.setPasswordHash(passwordEncoder.encode(request.newPassword()));
        userMapper.updateById(user);
        AuthRefreshToken update = new AuthRefreshToken();
        update.setRevokedAt(LocalDateTime.now());
        refreshTokenMapper.update(update, Wrappers.<AuthRefreshToken>lambdaUpdate()
                .eq(AuthRefreshToken::getUserId, userId).isNull(AuthRefreshToken::getRevokedAt));
    }

    public UserProfileResponse currentUser(long userId) {
        User user = userMapper.selectById(userId);
        if (user == null) throw new BusinessException(404, "用户不存在");
        return UserProfileResponse.from(user);
    }

    private TokenResponse issueTokens(User user, String deviceInfo) {
        byte[] bytes = new byte[48];
        secureRandom.nextBytes(bytes);
        String rawToken = Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
        long expiresIn = Duration.ofDays(refreshTokenDays).toSeconds();
        AuthRefreshToken stored = new AuthRefreshToken();
        stored.setUserId(user.getId()); stored.setTokenHash(hash(rawToken));
        stored.setDeviceInfo(deviceInfo == null ? null : deviceInfo.substring(0, Math.min(deviceInfo.length(), 255)));
        stored.setExpiresAt(LocalDateTime.now().plusDays(refreshTokenDays));
        stored.setCreatedAt(LocalDateTime.now());
        refreshTokenMapper.insert(stored);
        return jwtTokenService.issue(user, rawToken, expiresIn);
    }

    private String hash(String value) {
        try {
            return java.util.HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256")
                    .digest(value.getBytes(StandardCharsets.UTF_8)));
        } catch (Exception exception) {
            throw new IllegalStateException("SHA-256 unavailable", exception);
        }
    }
}
