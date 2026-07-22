# 数据库说明

当前脚本面向 **MySQL 8.0+**，与前端和计划中的 Spring Boot + MyBatis-Plus 后端对齐。

## 执行顺序

1. 创建数据库：`CREATE DATABASE campus_forum CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;`
2. 执行 `V1__init_schema.sql`。
3. 执行 `V2__seed_basic_data.sql`。

正式后端建议引入 Flyway，将这两个文件放到 `src/main/resources/db/migration/`，由应用自动迁移。数据库账号建议只授权 `campus_forum`，不要用 root 连接应用。

## 设计约定

- `sys_user` 避免与数据库系统用户概念混淆；实体可命名为 `User` 并使用 `@TableName("sys_user")`。
- 所有密码仅保存 BCrypt 摘要；刷新令牌只保存 SHA-256 摘要。
- 表白匿名只对普通用户隐藏，`user_id` 必须保留，便于审核和举报追溯。
- `content_like`、`user_collection` 使用 `biz_type + biz_id` 支撑多种业务；这类多态关联由 Service 校验目标是否存在，数据库无法直接声明目标外键。
- `forum_comment` 同时服务帖子和表白，`biz_type=1` 为帖子、`2` 为表白。
- 帖子/表白/评论使用逻辑删除，MyBatis-Plus 全局逻辑删除字段配置为 `deleted`。
- 图片内容存 MinIO；业务表仅存展示 URL，`file_object` 保存对象元数据与鉴权信息。
- 点赞数、评论数、收藏数和报名数是展示冗余字段。事务内写明细并更新计数；接入 Redis 后可异步落库并定期校准。
- `message` 是私信原始消息；`notification` 是点赞、评论、审核等站内通知，二者不要混用。

## 前端字段对应

| 前端能力 | 数据来源 |
| --- | --- |
| 推荐 / 最新帖子 | `forum_post` + `sys_user` + `forum_category` |
| 关注动态 | `user_friend` 关联好友发布的 `forum_post` |
| 帖子标签 | `forum_tag` + `forum_post_tag` |
| 点赞状态及数量 | `content_like` + 主表 `like_count` |
| 收藏状态及数量 | `user_collection` + `forum_post.collect_count` |
| 评论与回复 | `forum_comment.parent_id/root_id` |
| 正在发生 / 活动报名 | `activity` + `activity_sign` |
| 校园热榜 | Redis Sorted Set，数据回源 `forum_post` |
| 消息红点 | `notification`、`message` 的未读索引 |
| 校内认证 | `sys_user.verify_status` |

## 并发注意事项

报名接口需要事务与原子条件更新：只有 `signed_count < capacity` 时才递增，防止超卖。点赞、收藏、报名均依赖唯一索引保证接口幂等；遇到重复键应返回“已操作”，而不是产生重复记录。
