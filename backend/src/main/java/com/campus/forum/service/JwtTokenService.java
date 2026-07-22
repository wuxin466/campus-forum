package com.campus.forum.service;

import com.campus.forum.dto.auth.TokenResponse;
import com.campus.forum.entity.User;
import java.time.Duration;
import java.time.Instant;
import java.util.List;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.JwtClaimsSet;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;
import org.springframework.security.oauth2.jwt.JwsHeader;
import org.springframework.stereotype.Service;

@Service
public class JwtTokenService {
    private final JwtEncoder encoder;
    private final String issuer;
    private final Duration accessDuration;

    public JwtTokenService(JwtEncoder encoder,
            @Value("${campus.jwt.issuer}") String issuer,
            @Value("${campus.jwt.access-token-minutes}") long minutes) {
        this.encoder = encoder;
        this.issuer = issuer;
        this.accessDuration = Duration.ofMinutes(minutes);
    }

    public TokenResponse issue(User user, String refreshToken, long refreshExpiresIn) {
        Instant now = Instant.now();
        String role = switch (user.getRole()) {
            case 2 -> "SUPER_ADMIN";
            case 1 -> "ADMIN";
            default -> "USER";
        };
        JwtClaimsSet claims = JwtClaimsSet.builder()
                .issuer(issuer).issuedAt(now).expiresAt(now.plus(accessDuration))
                .subject(user.getId().toString())
                .claim("username", user.getUsername())
                .claim("roles", List.of(role)).build();
        String token = encoder.encode(JwtEncoderParameters.from(
                JwsHeader.with(MacAlgorithm.HS256).build(), claims)).getTokenValue();
        return new TokenResponse(token, refreshToken, "Bearer", accessDuration.toSeconds(), refreshExpiresIn);
    }
}
