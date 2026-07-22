# Campus Forum Backend

校园论坛后端，基础技术栈为 Java 17、Spring Boot 3.5、MyBatis-Plus、MySQL 8、Redis、MinIO 和 RabbitMQ。

## 已具备

- `/api` 统一接口前缀和 `{ code, msg, data }` 返回结构
- Bean Validation 与全局异常处理
- BCrypt 密码摘要
- JWT 无状态认证和管理员路径鉴权
- MyBatis-Plus 分页、自动时间字段和逻辑删除
- Flyway 数据库迁移
- Redis、RabbitMQ、MinIO 配置入口
- 注册、登录和当前用户三个基础接口

## 本地配置

复制 `.env.example` 中的配置到 IDE 环境变量或本机安全配置中。不要提交真实数据库密码、JWT 密钥或 MinIO 密钥。

应用默认从后端根目录下的 `database/` 加载 Flyway 迁移，所以启动命令的工作目录应为本目录。部署时也可以通过 `FLYWAY_LOCATIONS` 指向迁移文件的绝对目录或 classpath 目录。

## 已实现接口

| 方法 | 地址 | 是否登录 | 说明 |
| --- | --- | --- | --- |
| POST | `/api/auth/register` | 否 | 用户注册 |
| POST | `/api/auth/login` | 否 | 登录并返回 Access Token |
| GET | `/api/auth/me` | 是 | 获取当前登录用户 |
| POST | `/api/auth/refresh` | 否 | 轮换 Refresh Token 并签发新令牌 |
| POST | `/api/auth/logout` | 否 | 撤销 Refresh Token |
| POST | `/api/auth/change-password` | 是 | 修改密码并撤销全部刷新令牌 |
| GET | `/api/public/forum/categories` | 否 | 查询启用板块 |
| GET | `/api/public/forum/posts` | 否 | 帖子分页，可传 `categoryId/keyword/sort` |
| GET | `/api/public/forum/posts/{id}` | 否 | 帖子详情并增加浏览量 |
| GET | `/api/public/forum/posts/{id}/comments` | 否 | 评论分页 |
| POST | `/api/forum/posts` | 是 | 发布帖子，默认进入待审核 |
| POST | `/api/forum/posts/{id}/comments` | 是 | 评论或回复 |
| POST | `/api/forum/posts/{id}/like` | 是 | 切换点赞，返回当前状态 |
| POST | `/api/forum/posts/{id}/collection` | 是 | 切换收藏，返回当前状态 |
| GET | `/api/users/me` | 是 | 获取个人资料 |
| PUT | `/api/users/me` | 是 | 编辑昵称、头像、学院、年级和简介 |
| GET | `/api/users/{id}` | 是 | 获取他人主页资料 |
| GET | `/api/users/search?keyword=` | 是 | 按昵称或学院搜索用户 |
| POST | `/api/users/friends/{targetUserId}` | 是 | 发送好友申请 |
| GET | `/api/users/friend-requests` | 是 | 查询待处理好友申请 |
| POST | `/api/users/friend-requests/{id}/accept` | 是 | 接受好友申请 |
| POST | `/api/users/friend-requests/{id}/reject` | 是 | 拒绝好友申请 |
| GET | `/api/users/friends` | 是 | 查询好友列表 |
| DELETE | `/api/users/friends/{friendId}` | 是 | 删除好友 |
| GET | `/api/public/home` | 否 | 首页帖子、活动和热榜聚合数据 |
| GET | `/api/public/activities/categories` | 否 | 活动分类 |
| GET | `/api/public/activities` | 否 | 即将开始的活动分页 |
| GET | `/api/public/activities/{id}` | 否 | 活动详情 |
| POST | `/api/activities` | 是 | 创建活动，默认进入待审核 |
| POST | `/api/activities/{id}/sign` | 是 | 报名或取消报名，返回当前状态 |
| GET | `/api/activities/mine` | 是 | 我的报名记录 |
| GET | `/api/public/confesses` | 否 | 审核通过的表白分页 |
| GET | `/api/public/confesses/{id}` | 否 | 表白详情 |
| GET | `/api/public/confesses/{id}/comments` | 否 | 表白评论分页 |
| POST | `/api/confesses` | 是 | 匿名或实名发布表白 |
| GET | `/api/confesses/mine` | 是 | 我的表白及审核状态 |
| DELETE | `/api/confesses/{id}` | 是 | 删除自己的表白 |
| POST | `/api/confesses/{id}/comments` | 是 | 评论或回复表白 |
| POST | `/api/confesses/{id}/like` | 是 | 切换表白点赞状态 |
| GET | `/api/public/news` | 否 | 校园资讯分页和搜索 |
| GET | `/api/public/news/{id}` | 否 | 资讯详情并增加浏览量 |
| GET | `/api/public/notices` | 否 | 系统公告分页 |
| GET | `/api/notifications` | 是 | 当前用户通知分页 |
| GET | `/api/notifications/unread-count` | 是 | 未读通知数量 |
| POST | `/api/notifications/{id}/read` | 是 | 标记单条通知已读 |
| POST | `/api/notifications/read-all` | 是 | 全部标记已读 |
| POST | `/api/messages/{receiverId}` | 是 | 向好友发送文本、图片或文件消息 |
| GET | `/api/messages/conversations` | 是 | 会话列表及各会话未读数 |
| GET | `/api/messages/with/{otherId}` | 是 | 与指定好友的聊天记录分页并标记已读 |
| GET | `/api/messages/unread-count` | 是 | 私信未读总数 |
| POST | `/api/messages/with/{otherId}/read` | 是 | 标记指定会话已读 |
| POST | `/api/files` | 是 | 上传图片或 PDF 到 MinIO |
| GET | `/api/files/{id}` | 是 | 获取15分钟临时访问地址 |
| DELETE | `/api/files/{id}` | 是 | 上传者或管理员删除文件 |
| GET | `/api/admin/users` | 管理员 | 用户分页和搜索 |
| POST | `/api/admin/users/{id}/status` | 管理员 | 封禁或恢复用户 |
| GET | `/api/admin/audits/posts` | 管理员 | 待审核帖子 |
| GET | `/api/admin/audits/confesses` | 管理员 | 待审核表白 |
| GET | `/api/admin/audits/activities` | 管理员 | 待审核活动 |
| POST | `/api/admin/audits/{type}/{id}` | 管理员 | 通过或驳回内容 |
| POST | `/api/reports` | 是 | 举报用户、帖子、表白、评论、活动或私信 |
| GET | `/api/reports/mine` | 是 | 我的举报记录 |
| GET | `/api/admin/reports` | 管理员 | 举报分页与状态筛选 |
| POST | `/api/admin/reports/{id}/handle` | 管理员 | 处理或驳回举报 |
| POST | `/api/admin/news` | 管理员 | 创建新闻草稿 |
| PUT | `/api/admin/news/{id}` | 管理员 | 编辑新闻 |
| POST | `/api/admin/news/{id}/publish` | 管理员 | 发布新闻 |
| POST | `/api/admin/news/{id}/unpublish` | 管理员 | 下架新闻 |
| POST | `/api/admin/notices` | 管理员 | 创建公告草稿 |
| PUT | `/api/admin/notices/{id}` | 管理员 | 编辑公告 |
| POST | `/api/admin/notices/{id}/publish` | 管理员 | 发布公告 |
| POST | `/api/admin/notices/{id}/unpublish` | 管理员 | 下架公告 |
| GET | `/api/public/banners` | 否 | 当前有效轮播图 |
| POST | `/api/admin/banners` | 管理员 | 创建轮播图 |
| PUT | `/api/admin/banners/{id}` | 管理员 | 编辑轮播图 |
| DELETE | `/api/admin/banners/{id}` | 管理员 | 删除轮播图 |

登录后的请求使用请求头：`Authorization: Bearer <accessToken>`。

## 后续模块顺序

1. 前端真实接口对接
2. WebSocket 实时私信
3. Redis 热榜与缓存
4. RabbitMQ 异步通知

刷新令牌表已经建立，但刷新 Token 接口尚未实现；实现时只将 Refresh Token 的 SHA-256 摘要落库，并支持主动注销和多设备撤销。
