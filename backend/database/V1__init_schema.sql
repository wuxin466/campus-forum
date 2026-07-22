-- Campus Forum / MySQL 8.0+
-- 建议由 Flyway 执行本文件；数据库本身由运维或 docker-compose 预先创建。
SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

CREATE TABLE IF NOT EXISTS sys_user (
    id              BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '用户ID',
    username        VARCHAR(50) NOT NULL COMMENT '登录账号',
    password_hash   VARCHAR(100) NOT NULL COMMENT 'BCrypt密码摘要',
    nickname        VARCHAR(40) NOT NULL COMMENT '昵称',
    avatar_url      VARCHAR(500) NULL COMMENT '头像文件访问地址',
    college         VARCHAR(100) NULL COMMENT '学院',
    grade           VARCHAR(20) NULL COMMENT '年级，如2024级',
    student_no      VARCHAR(50) NULL COMMENT '学工号（加密或脱敏保存）',
    bio             VARCHAR(300) NULL COMMENT '个人简介',
    role            TINYINT UNSIGNED NOT NULL DEFAULT 0 COMMENT '角色：0用户 1管理员 2超级管理员',
    verify_status   TINYINT UNSIGNED NOT NULL DEFAULT 0 COMMENT '校内认证：0未认证 1审核中 2已认证 3驳回',
    status          TINYINT UNSIGNED NOT NULL DEFAULT 1 COMMENT '状态：0禁用 1正常 2封禁',
    last_login_at   DATETIME NULL COMMENT '最后登录时间',
    created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted         TINYINT UNSIGNED NOT NULL DEFAULT 0 COMMENT '逻辑删除',
    PRIMARY KEY (id),
    UNIQUE KEY uk_user_username (username),
    UNIQUE KEY uk_user_student_no (student_no),
    KEY idx_user_nickname (nickname),
    KEY idx_user_status_created (status, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='用户表';

CREATE TABLE IF NOT EXISTS auth_refresh_token (
    id              BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    user_id         BIGINT UNSIGNED NOT NULL,
    token_hash      CHAR(64) NOT NULL COMMENT 'Refresh Token的SHA-256摘要',
    device_info     VARCHAR(255) NULL,
    expires_at      DATETIME NOT NULL,
    revoked_at      DATETIME NULL,
    created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uk_refresh_token_hash (token_hash),
    KEY idx_refresh_user_expire (user_id, expires_at),
    CONSTRAINT fk_refresh_user FOREIGN KEY (user_id) REFERENCES sys_user (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='刷新令牌表';

CREATE TABLE IF NOT EXISTS user_friend (
    id              BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    requester_id    BIGINT UNSIGNED NOT NULL COMMENT '申请人',
    addressee_id    BIGINT UNSIGNED NOT NULL COMMENT '被申请人',
    status          TINYINT UNSIGNED NOT NULL DEFAULT 0 COMMENT '0待同意 1好友 2拒绝 3已删除',
    remark          VARCHAR(40) NULL COMMENT '申请人设置的好友备注',
    applied_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    handled_at      DATETIME NULL,
    updated_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uk_friend_pair (requester_id, addressee_id),
    KEY idx_friend_addressee_status (addressee_id, status),
    KEY idx_friend_requester_status (requester_id, status),
    CONSTRAINT ck_friend_not_self CHECK (requester_id <> addressee_id),
    CONSTRAINT fk_friend_requester FOREIGN KEY (requester_id) REFERENCES sys_user (id),
    CONSTRAINT fk_friend_addressee FOREIGN KEY (addressee_id) REFERENCES sys_user (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='好友申请及关系表';

CREATE TABLE IF NOT EXISTS forum_category (
    id              BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    name            VARCHAR(50) NOT NULL,
    code            VARCHAR(50) NOT NULL COMMENT '接口使用的稳定编码',
    description     VARCHAR(200) NULL,
    icon_url        VARCHAR(500) NULL,
    sort_no         INT NOT NULL DEFAULT 0,
    status          TINYINT UNSIGNED NOT NULL DEFAULT 1 COMMENT '0停用 1启用',
    created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted         TINYINT UNSIGNED NOT NULL DEFAULT 0,
    PRIMARY KEY (id),
    UNIQUE KEY uk_forum_category_code (code),
    KEY idx_forum_category_sort (status, sort_no)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='论坛板块表';

CREATE TABLE IF NOT EXISTS forum_post (
    id              BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    user_id         BIGINT UNSIGNED NOT NULL,
    category_id     BIGINT UNSIGNED NOT NULL,
    title           VARCHAR(150) NOT NULL,
    content         LONGTEXT NOT NULL,
    cover_url       VARCHAR(500) NULL,
    image_urls      JSON NULL COMMENT '帖子图片URL数组',
    view_count      INT UNSIGNED NOT NULL DEFAULT 0,
    like_count      INT UNSIGNED NOT NULL DEFAULT 0,
    comment_count   INT UNSIGNED NOT NULL DEFAULT 0,
    collect_count   INT UNSIGNED NOT NULL DEFAULT 0,
    is_top          TINYINT UNSIGNED NOT NULL DEFAULT 0,
    is_featured     TINYINT UNSIGNED NOT NULL DEFAULT 0 COMMENT '是否精华',
    audit_status    TINYINT UNSIGNED NOT NULL DEFAULT 0 COMMENT '0待审核 1通过 2驳回',
    audit_reason    VARCHAR(255) NULL,
    status          TINYINT UNSIGNED NOT NULL DEFAULT 1 COMMENT '0下架 1正常',
    created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted         TINYINT UNSIGNED NOT NULL DEFAULT 0,
    PRIMARY KEY (id),
    KEY idx_post_feed (audit_status, status, is_top, created_at),
    KEY idx_post_category_time (category_id, created_at),
    KEY idx_post_user_time (user_id, created_at),
    FULLTEXT KEY ft_post_title_content (title, content),
    CONSTRAINT fk_post_user FOREIGN KEY (user_id) REFERENCES sys_user (id),
    CONSTRAINT fk_post_category FOREIGN KEY (category_id) REFERENCES forum_category (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='论坛帖子表';

CREATE TABLE IF NOT EXISTS forum_tag (
    id              BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    name            VARCHAR(30) NOT NULL,
    use_count       INT UNSIGNED NOT NULL DEFAULT 0,
    created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uk_forum_tag_name (name),
    KEY idx_forum_tag_hot (use_count)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='帖子标签表';

CREATE TABLE IF NOT EXISTS forum_post_tag (
    post_id         BIGINT UNSIGNED NOT NULL,
    tag_id          BIGINT UNSIGNED NOT NULL,
    PRIMARY KEY (post_id, tag_id),
    KEY idx_post_tag_tag (tag_id, post_id),
    CONSTRAINT fk_post_tag_post FOREIGN KEY (post_id) REFERENCES forum_post (id),
    CONSTRAINT fk_post_tag_tag FOREIGN KEY (tag_id) REFERENCES forum_tag (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='帖子标签关联表';

CREATE TABLE IF NOT EXISTS confess (
    id              BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    user_id         BIGINT UNSIGNED NOT NULL COMMENT '匿名仅对前台隐藏，后台仍可追溯',
    content         TEXT NOT NULL,
    image_urls      JSON NULL,
    is_anonymous    TINYINT UNSIGNED NOT NULL DEFAULT 1,
    like_count      INT UNSIGNED NOT NULL DEFAULT 0,
    comment_count   INT UNSIGNED NOT NULL DEFAULT 0,
    audit_status    TINYINT UNSIGNED NOT NULL DEFAULT 0 COMMENT '0待审核 1通过 2驳回',
    audit_reason    VARCHAR(255) NULL,
    status          TINYINT UNSIGNED NOT NULL DEFAULT 1 COMMENT '0下架 1正常',
    created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted         TINYINT UNSIGNED NOT NULL DEFAULT 0,
    PRIMARY KEY (id),
    KEY idx_confess_feed (audit_status, status, created_at),
    KEY idx_confess_user_time (user_id, created_at),
    CONSTRAINT fk_confess_user FOREIGN KEY (user_id) REFERENCES sys_user (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='表白墙内容表';

CREATE TABLE IF NOT EXISTS forum_comment (
    id              BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    biz_type        TINYINT UNSIGNED NOT NULL COMMENT '1论坛帖子 2表白',
    biz_id          BIGINT UNSIGNED NOT NULL COMMENT '帖子或表白ID',
    parent_id       BIGINT UNSIGNED NULL COMMENT '父评论ID',
    root_id         BIGINT UNSIGNED NULL COMMENT '根评论ID，便于分页',
    user_id         BIGINT UNSIGNED NOT NULL,
    reply_user_id   BIGINT UNSIGNED NULL COMMENT '被回复用户',
    content         VARCHAR(1000) NOT NULL,
    like_count      INT UNSIGNED NOT NULL DEFAULT 0,
    audit_status    TINYINT UNSIGNED NOT NULL DEFAULT 1 COMMENT '0待审 1通过 2驳回',
    created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted         TINYINT UNSIGNED NOT NULL DEFAULT 0,
    PRIMARY KEY (id),
    KEY idx_comment_biz_time (biz_type, biz_id, root_id, created_at),
    KEY idx_comment_user_time (user_id, created_at),
    CONSTRAINT fk_comment_parent FOREIGN KEY (parent_id) REFERENCES forum_comment (id),
    CONSTRAINT fk_comment_root FOREIGN KEY (root_id) REFERENCES forum_comment (id),
    CONSTRAINT fk_comment_user FOREIGN KEY (user_id) REFERENCES sys_user (id),
    CONSTRAINT fk_comment_reply_user FOREIGN KEY (reply_user_id) REFERENCES sys_user (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='论坛及表白评论表';

CREATE TABLE IF NOT EXISTS content_like (
    id              BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    user_id         BIGINT UNSIGNED NOT NULL,
    biz_type        TINYINT UNSIGNED NOT NULL COMMENT '1帖子 2表白 3评论',
    biz_id          BIGINT UNSIGNED NOT NULL,
    created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uk_like_user_biz (user_id, biz_type, biz_id),
    KEY idx_like_biz (biz_type, biz_id, created_at),
    CONSTRAINT fk_like_user FOREIGN KEY (user_id) REFERENCES sys_user (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='统一点赞明细表';

CREATE TABLE IF NOT EXISTS activity_category (
    id              BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    name            VARCHAR(50) NOT NULL,
    code            VARCHAR(50) NOT NULL,
    sort_no         INT NOT NULL DEFAULT 0,
    status          TINYINT UNSIGNED NOT NULL DEFAULT 1,
    created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uk_activity_category_code (code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='活动分类表';

CREATE TABLE IF NOT EXISTS activity (
    id              BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    category_id     BIGINT UNSIGNED NOT NULL,
    creator_id      BIGINT UNSIGNED NOT NULL,
    title           VARCHAR(120) NOT NULL,
    poster_url      VARCHAR(500) NULL,
    content         LONGTEXT NOT NULL,
    location        VARCHAR(200) NOT NULL,
    start_at        DATETIME NOT NULL,
    end_at          DATETIME NOT NULL,
    signup_deadline DATETIME NOT NULL,
    capacity        INT UNSIGNED NOT NULL COMMENT '人数上限',
    signed_count    INT UNSIGNED NOT NULL DEFAULT 0,
    view_count      INT UNSIGNED NOT NULL DEFAULT 0,
    audit_status    TINYINT UNSIGNED NOT NULL DEFAULT 0 COMMENT '0待审核 1通过 2驳回',
    audit_reason    VARCHAR(255) NULL,
    status          TINYINT UNSIGNED NOT NULL DEFAULT 1 COMMENT '0取消 1报名中 2已满 3已结束',
    created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted         TINYINT UNSIGNED NOT NULL DEFAULT 0,
    PRIMARY KEY (id),
    KEY idx_activity_feed (audit_status, status, start_at),
    KEY idx_activity_category_time (category_id, start_at),
    KEY idx_activity_creator (creator_id, created_at),
    CONSTRAINT ck_activity_time CHECK (end_at > start_at),
    CONSTRAINT fk_activity_category FOREIGN KEY (category_id) REFERENCES activity_category (id),
    CONSTRAINT fk_activity_creator FOREIGN KEY (creator_id) REFERENCES sys_user (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='联谊活动表';

CREATE TABLE IF NOT EXISTS activity_sign (
    id              BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    activity_id     BIGINT UNSIGNED NOT NULL,
    user_id         BIGINT UNSIGNED NOT NULL,
    status          TINYINT UNSIGNED NOT NULL DEFAULT 1 COMMENT '0已取消 1已报名 2已签到',
    signed_at       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '报名时间',
    checkin_at      DATETIME NULL COMMENT '签到时间',
    updated_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uk_activity_sign (activity_id, user_id),
    KEY idx_activity_sign_user (user_id, status, signed_at),
    CONSTRAINT fk_activity_sign_activity FOREIGN KEY (activity_id) REFERENCES activity (id),
    CONSTRAINT fk_activity_sign_user FOREIGN KEY (user_id) REFERENCES sys_user (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='活动报名表';

CREATE TABLE IF NOT EXISTS news (
    id              BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    author_id       BIGINT UNSIGNED NOT NULL,
    title           VARCHAR(150) NOT NULL,
    summary         VARCHAR(500) NULL,
    content         LONGTEXT NOT NULL,
    cover_url       VARCHAR(500) NULL,
    source          VARCHAR(100) NULL,
    view_count      INT UNSIGNED NOT NULL DEFAULT 0,
    is_top          TINYINT UNSIGNED NOT NULL DEFAULT 0,
    status          TINYINT UNSIGNED NOT NULL DEFAULT 0 COMMENT '0草稿 1已发布 2下架',
    published_at    DATETIME NULL,
    created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted         TINYINT UNSIGNED NOT NULL DEFAULT 0,
    PRIMARY KEY (id),
    KEY idx_news_feed (status, is_top, published_at),
    CONSTRAINT fk_news_author FOREIGN KEY (author_id) REFERENCES sys_user (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='校园新闻表';

CREATE TABLE IF NOT EXISTS system_notice (
    id              BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    publisher_id    BIGINT UNSIGNED NOT NULL,
    title           VARCHAR(150) NOT NULL,
    content         LONGTEXT NOT NULL,
    target_type     TINYINT UNSIGNED NOT NULL DEFAULT 0 COMMENT '0全体 1普通用户 2管理员',
    is_top          TINYINT UNSIGNED NOT NULL DEFAULT 0,
    status          TINYINT UNSIGNED NOT NULL DEFAULT 0 COMMENT '0草稿 1发布 2下架',
    published_at    DATETIME NULL,
    created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted         TINYINT UNSIGNED NOT NULL DEFAULT 0,
    PRIMARY KEY (id),
    KEY idx_notice_feed (status, is_top, published_at),
    CONSTRAINT fk_notice_publisher FOREIGN KEY (publisher_id) REFERENCES sys_user (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='系统公告表';

CREATE TABLE IF NOT EXISTS user_collection (
    id              BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    user_id         BIGINT UNSIGNED NOT NULL,
    biz_type        TINYINT UNSIGNED NOT NULL COMMENT '1帖子 2活动 3新闻',
    biz_id          BIGINT UNSIGNED NOT NULL,
    created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uk_collection_user_biz (user_id, biz_type, biz_id),
    KEY idx_collection_user_time (user_id, created_at),
    KEY idx_collection_biz (biz_type, biz_id),
    CONSTRAINT fk_collection_user FOREIGN KEY (user_id) REFERENCES sys_user (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户收藏表';

CREATE TABLE IF NOT EXISTS message (
    id              BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    sender_id       BIGINT UNSIGNED NOT NULL,
    receiver_id     BIGINT UNSIGNED NOT NULL,
    message_type    TINYINT UNSIGNED NOT NULL DEFAULT 0 COMMENT '0文本 1图片 2文件',
    content         TEXT NULL,
    file_url        VARCHAR(500) NULL,
    is_read         TINYINT UNSIGNED NOT NULL DEFAULT 0,
    read_at         DATETIME NULL,
    created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_by_sender   TINYINT UNSIGNED NOT NULL DEFAULT 0,
    deleted_by_receiver TINYINT UNSIGNED NOT NULL DEFAULT 0,
    PRIMARY KEY (id),
    KEY idx_message_sender_receiver (sender_id, receiver_id, created_at),
    KEY idx_message_receiver_unread (receiver_id, is_read, created_at),
    CONSTRAINT ck_message_not_self CHECK (sender_id <> receiver_id),
    CONSTRAINT fk_message_sender FOREIGN KEY (sender_id) REFERENCES sys_user (id),
    CONSTRAINT fk_message_receiver FOREIGN KEY (receiver_id) REFERENCES sys_user (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='私信消息表';

CREATE TABLE IF NOT EXISTS notification (
    id              BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    user_id         BIGINT UNSIGNED NOT NULL COMMENT '接收人',
    actor_id        BIGINT UNSIGNED NULL COMMENT '触发人，系统通知时为空',
    type            TINYINT UNSIGNED NOT NULL COMMENT '1点赞 2评论 3好友申请 4审核 5系统',
    title           VARCHAR(100) NOT NULL,
    content         VARCHAR(500) NULL,
    biz_type        TINYINT UNSIGNED NULL,
    biz_id          BIGINT UNSIGNED NULL,
    is_read         TINYINT UNSIGNED NOT NULL DEFAULT 0,
    read_at         DATETIME NULL,
    created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY idx_notification_user_unread (user_id, is_read, created_at),
    CONSTRAINT fk_notification_user FOREIGN KEY (user_id) REFERENCES sys_user (id),
    CONSTRAINT fk_notification_actor FOREIGN KEY (actor_id) REFERENCES sys_user (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='站内通知表';

CREATE TABLE IF NOT EXISTS report (
    id              BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    reporter_id     BIGINT UNSIGNED NOT NULL,
    biz_type        TINYINT UNSIGNED NOT NULL COMMENT '1用户 2帖子 3表白 4评论 5活动 6私信',
    biz_id          BIGINT UNSIGNED NOT NULL,
    reason_type     TINYINT UNSIGNED NOT NULL COMMENT '举报原因枚举',
    description     VARCHAR(500) NULL,
    evidence_urls   JSON NULL,
    status          TINYINT UNSIGNED NOT NULL DEFAULT 0 COMMENT '0待处理 1处理中 2已处理 3驳回',
    handler_id      BIGINT UNSIGNED NULL,
    handle_result   VARCHAR(500) NULL,
    handled_at      DATETIME NULL,
    created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uk_report_repeat (reporter_id, biz_type, biz_id),
    KEY idx_report_status_time (status, created_at),
    CONSTRAINT fk_report_reporter FOREIGN KEY (reporter_id) REFERENCES sys_user (id),
    CONSTRAINT fk_report_handler FOREIGN KEY (handler_id) REFERENCES sys_user (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='举报表';

CREATE TABLE IF NOT EXISTS file_object (
    id              BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    uploader_id     BIGINT UNSIGNED NOT NULL,
    bucket_name     VARCHAR(100) NOT NULL,
    object_key      VARCHAR(500) NOT NULL COMMENT 'MinIO对象键',
    original_name   VARCHAR(255) NOT NULL,
    content_type    VARCHAR(100) NOT NULL,
    file_size       BIGINT UNSIGNED NOT NULL,
    sha256          CHAR(64) NULL,
    access_type     TINYINT UNSIGNED NOT NULL DEFAULT 0 COMMENT '0私有 1公开',
    status          TINYINT UNSIGNED NOT NULL DEFAULT 1 COMMENT '0禁用 1正常',
    created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted         TINYINT UNSIGNED NOT NULL DEFAULT 0,
    PRIMARY KEY (id),
    UNIQUE KEY uk_file_object (bucket_name, object_key),
    KEY idx_file_uploader_time (uploader_id, created_at),
    CONSTRAINT fk_file_uploader FOREIGN KEY (uploader_id) REFERENCES sys_user (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='MinIO文件元数据表';

CREATE TABLE IF NOT EXISTS banner (
    id              BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    title           VARCHAR(100) NOT NULL,
    image_url       VARCHAR(500) NOT NULL,
    link_url        VARCHAR(500) NULL,
    sort_no         INT NOT NULL DEFAULT 0,
    status          TINYINT UNSIGNED NOT NULL DEFAULT 1,
    start_at        DATETIME NULL,
    end_at          DATETIME NULL,
    created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted         TINYINT UNSIGNED NOT NULL DEFAULT 0,
    PRIMARY KEY (id),
    KEY idx_banner_active (status, sort_no, start_at, end_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='首页轮播图表';

CREATE TABLE IF NOT EXISTS admin_audit_log (
    id              BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    admin_id        BIGINT UNSIGNED NOT NULL,
    action          VARCHAR(50) NOT NULL COMMENT 'AUDIT_POST/BAN_USER等',
    biz_type        VARCHAR(30) NOT NULL,
    biz_id          BIGINT UNSIGNED NOT NULL,
    result          TINYINT UNSIGNED NOT NULL COMMENT '0失败 1成功',
    detail          JSON NULL,
    ip_address      VARCHAR(45) NULL,
    created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY idx_audit_biz (biz_type, biz_id, created_at),
    KEY idx_audit_admin_time (admin_id, created_at),
    CONSTRAINT fk_audit_admin FOREIGN KEY (admin_id) REFERENCES sys_user (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='管理员操作审计日志';

SET FOREIGN_KEY_CHECKS = 1;
