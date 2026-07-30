ALTER TABLE sys_user
    ADD COLUMN email VARCHAR(120) NULL COMMENT '用于账号找回的邮箱' AFTER username,
    ADD UNIQUE KEY uk_user_email (email);

CREATE TABLE IF NOT EXISTS password_reset_code (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    user_id BIGINT UNSIGNED NOT NULL,
    code_hash CHAR(64) NOT NULL,
    expires_at DATETIME NOT NULL,
    used_at DATETIME NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY idx_reset_user_created (user_id, created_at),
    CONSTRAINT fk_reset_user FOREIGN KEY (user_id) REFERENCES sys_user(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='密码找回验证码';

CREATE TABLE IF NOT EXISTS campus_verification (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    user_id BIGINT UNSIGNED NOT NULL,
    real_name VARCHAR(50) NOT NULL,
    student_no VARCHAR(50) NOT NULL,
    college VARCHAR(100) NOT NULL,
    credential_url VARCHAR(500) NOT NULL,
    status TINYINT UNSIGNED NOT NULL DEFAULT 0 COMMENT '0待审核 1通过 2驳回',
    reject_reason VARCHAR(255) NULL,
    reviewer_id BIGINT UNSIGNED NULL,
    reviewed_at DATETIME NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY idx_verification_status_created (status, created_at),
    KEY idx_verification_user_created (user_id, created_at),
    CONSTRAINT fk_verification_user FOREIGN KEY (user_id) REFERENCES sys_user(id),
    CONSTRAINT fk_verification_reviewer FOREIGN KEY (reviewer_id) REFERENCES sys_user(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='校园实名认证申请';
