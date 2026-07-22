SET NAMES utf8mb4;

INSERT INTO forum_category (name, code, description, sort_no)
VALUES ('校园生活', 'campus-life', '校园见闻与日常分享', 10),
       ('学习互助', 'study-help', '课程、考试与学习经验交流', 20),
       ('社团活动', 'club', '社团招新与活动交流', 30),
       ('失物招领', 'lost-found', '校园失物招领', 40),
       ('闲置交易', 'marketplace', '校内闲置物品交流', 50)
ON DUPLICATE KEY UPDATE name = VALUES(name), description = VALUES(description), sort_no = VALUES(sort_no);

INSERT INTO activity_category (name, code, sort_no)
VALUES ('文娱', 'entertainment', 10),
       ('运动', 'sports', 20),
       ('学习分享', 'study', 30),
       ('公益志愿', 'volunteer', 40),
       ('市集', 'market', 50)
ON DUPLICATE KEY UPDATE name = VALUES(name), sort_no = VALUES(sort_no);

INSERT INTO forum_tag (name)
VALUES ('校园随手拍'), ('毕业季'), ('学习互助'), ('求建议'), ('社团活动'), ('运动'), ('校园动态')
ON DUPLICATE KEY UPDATE name = VALUES(name);
