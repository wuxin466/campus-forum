import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bell,
  BookmarkSimple,
  CalendarBlank,
  CaretDown,
  ChatCircle,
  CheckCircle,
  Fire,
  Heart,
  Image,
  MagnifyingGlass,
  MapPin,
  PaperPlaneTilt,
  PencilSimpleLine,
  Plus,
  ShieldCheck,
  UsersThree,
  X,
} from "@phosphor-icons/react";

const posts = {
  推荐: [
    {
      id: 1,
      author: "林夏",
      meta: "新闻传播学院 · 2 小时前",
      title: "把夏天留在校园：西区图书馆前的凌霄花开了",
      body: "傍晚路过时刚好遇上最好看的光。准备毕业以后才发现，最舍不得的是这些普通又具体的瞬间。",
      tags: ["校园随手拍", "毕业季"],
      likes: 286,
      comments: 42,
      liked: false,
      saved: false,
    },
    {
      id: 2,
      author: "周屿",
      meta: "计算机学院 · 3 小时前",
      title: "大三转方向到前端，暑假应该怎么安排学习节奏？",
      body: "目前能独立写 Vue 项目，想用两个月补齐工程化和实习作品集，想听听学长学姐的真实建议。",
      tags: ["学习互助", "求建议"],
      likes: 128,
      comments: 36,
      liked: false,
      saved: true,
    },
  ],
  关注: [
    {
      id: 3,
      author: "校羽毛球协会",
      meta: "校园组织 · 42 分钟前",
      title: "周五晚新生体验场，还剩 8 个名额",
      body: "球拍和球由协会提供，零基础也可以来。想参加的同学记得提前报名。",
      tags: ["社团活动", "运动"],
      likes: 79,
      comments: 18,
      liked: true,
      saved: false,
    },
  ],
  最新: [
    {
      id: 4,
      author: "匿名同学",
      meta: "校内认证用户 · 8 分钟前",
      title: "求问：暑假东区食堂还有哪些窗口营业？",
      body: "晚上七点左右下课，想找一个还开着的窗口，知道的同学麻烦分享一下。",
      tags: ["校园生活", "互助"],
      likes: 12,
      comments: 9,
      liked: false,
      saved: false,
    },
  ],
};

const activities = [
  { date: "25", month: "JUL", title: "夏日草坪音乐节", place: "北区大草坪", people: 325, color: "coral" },
  { date: "26", month: "JUL", title: "校园二手市集", place: "南区广场", people: 276, color: "blue" },
  { date: "28", month: "JUL", title: "考研经验分享会", place: "教学楼 A101", people: 168, color: "lime" },
];

const hotTopics = [
  ["期末复习自习室座位攻略", "1.2万"],
  ["西区食堂新品麻辣香锅测评", "8763"],
  ["大学生想做的小生意有哪些？", "6541"],
  ["今年军训防晒攻略来了", "5320"],
  ["图书馆空调太冷怎么办", "4218"],
];

function Post({ post, onUpdate }) {
  const avatar = post.author === "周屿" || post.author === "校羽毛球协会" ? "/assets/avatar-zhouyu.jpg" : "/assets/avatar-linxia.jpg";
  return (
    <article className="post-row">
      <div className="post-avatar"><img src={avatar} alt={`${post.author}的头像`} /></div>
      <div className="post-content">
        <div className="post-topline">
          <div><strong>{post.author}</strong><span>{post.meta}</span></div>
          <button className="icon-button" aria-label="更多操作"><span>•••</span></button>
        </div>
        <h3>{post.title}</h3>
        <p>{post.body}</p>
        <div className="tags">{post.tags.map((tag) => <span key={tag}>#{tag}</span>)}</div>
        <div className="post-actions">
          <button className={post.liked ? "active" : ""} onClick={() => onUpdate(post.id, "liked")}>
            <Heart weight={post.liked ? "fill" : "regular"} /> {post.likes + (post.liked ? 1 : 0)}
          </button>
          <button><ChatCircle /> {post.comments}</button>
          <button className={post.saved ? "active" : ""} onClick={() => onUpdate(post.id, "saved")}>
            <BookmarkSimple weight={post.saved ? "fill" : "regular"} /> {post.saved ? "已收藏" : "收藏"}
          </button>
          <button><PaperPlaneTilt /> 分享</button>
        </div>
      </div>
    </article>
  );
}

export function HomePage() {
  const navigate = useNavigate();
  const [activeNav, setActiveNav] = useState("首页");
  const [feedTab, setFeedTab] = useState("推荐");
  const [query, setQuery] = useState("");
  const [feed, setFeed] = useState(posts);
  const [showComposer, setShowComposer] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [draft, setDraft] = useState("");
  const [joined, setJoined] = useState([]);

  const visiblePosts = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    if (!keyword) return feed[feedTab];
    return Object.values(feed).flat().filter((post) => `${post.title}${post.body}${post.tags.join("")}`.toLowerCase().includes(keyword));
  }, [feed, feedTab, query]);

  const updatePost = (id, key) => {
    setFeed((current) => Object.fromEntries(Object.entries(current).map(([tab, list]) => [
      tab,
      list.map((post) => post.id === id ? { ...post, [key]: !post[key] } : post),
    ])));
  };

  const publish = () => {
    if (!draft.trim()) return;
    const newPost = {
      id: Date.now(), author: "林同学", meta: "软件学院 · 刚刚", title: draft.trim(), body: "", tags: ["校园动态"], likes: 0, comments: 0, liked: false, saved: false,
    };
    setFeed((current) => ({ ...current, 推荐: [newPost, ...current.推荐] }));
    setFeedTab("推荐");
    setDraft("");
    setShowComposer(false);
  };

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="topbar-inner">
          <button className="brand" onClick={() => navigate("/")}><span>同窗</span>圈<i /></button>
          <nav aria-label="主导航">
            {["首页", "论坛", "表白墙", "联谊活动", "校园资讯"].map((item) => (
              <button key={item} className={activeNav === item ? "active" : ""} onClick={() => {
                const paths = { 首页: "/", 论坛: "/forum", 表白墙: "/confess", 联谊活动: "/activities", 校园资讯: "/news" };
                setActiveNav(item);
                navigate(paths[item]);
              }}>{item}</button>
            ))}
          </nav>
          <div className="top-actions">
            <label className="search-box">
              <MagnifyingGlass />
              <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="搜索帖子、活动或同学" />
              {query && <button onClick={() => setQuery("")} aria-label="清空搜索"><X /></button>}
            </label>
            <div className="notification-wrap">
              <button className="notification-button" onClick={() => setShowNotifications(!showNotifications)} aria-label="消息通知"><Bell /><b /></button>
              {showNotifications && (
                <div className="notification-popover">
                  <strong>消息通知</strong>
                  <p><Heart weight="fill" /> 苏柚点赞了你的帖子</p>
                  <p><ChatCircle weight="fill" /> 你收到 3 条新回复</p>
                </div>
              )}
            </div>
            <button className="profile-button" onClick={() => navigate("/me")}><img src="/assets/avatar-linxia.jpg" alt="林同学的头像" /><span>林同学</span><CaretDown /></button>
          </div>
        </div>
      </header>

      <main className="page">
        {activeNav !== "首页" && (
          <div className="route-notice"><CheckCircle weight="fill" /> 已切换到「{activeNav}」模块，本原型重点展示首页体验。</div>
        )}

        <section className="hero">
          <img src="/assets/campus-friends-hero.png" alt="四位大学生坐在校园草坪上交流" />
          <div className="hero-copy">
            <span className="eyebrow"><ShieldCheck weight="fill" /> 校园实名社区</span>
            <h1>发现校园<br /><em>新鲜事</em></h1>
            <p>分享日常，找到同频伙伴。<br />每一次连接，都从真实开始。</p>
            <button onClick={() => setShowComposer(true)}><PencilSimpleLine /> 发布动态</button>
          </div>
          <div className="verified"><ShieldCheck weight="fill" /><div><strong>校内认证</strong><span>真实身份 · 安全友善</span></div></div>
        </section>

        <div className="content-grid">
          <section className="feed-section">
            <div className="section-head">
              <div><span className="section-kicker">CAMPUS NOW</span><h2>{query ? `搜索结果 · ${visiblePosts.length}` : "此刻校园"}</h2></div>
              {!query && <div className="feed-tabs">{["关注", "推荐", "最新"].map((tab) => <button key={tab} className={feedTab === tab ? "active" : ""} onClick={() => setFeedTab(tab)}>{tab}</button>)}</div>}
            </div>
            <div className="feed-list">
              {visiblePosts.map((post) => <Post key={post.id} post={post} onUpdate={updatePost} />)}
              {!visiblePosts.length && <div className="empty-state"><MagnifyingGlass /><strong>没有找到相关内容</strong><span>换一个关键词试试</span></div>}
            </div>
          </section>

          <aside className="sidebar">
            <section className="side-section">
              <div className="side-heading"><h2>正在发生</h2><button onClick={() => navigate("/activities")}>查看全部</button></div>
              <div className="activity-list">
                {activities.map((activity, index) => (
                  <article className="activity clickable" key={activity.title} onClick={() => navigate(`/activities/${index + 1}`)}>
                    <div className={`date-tile ${activity.color}`}><span>{activity.month}</span><strong>{activity.date}</strong></div>
                    <div><h3>{activity.title}</h3><p><MapPin /> {activity.place}</p><span>{activity.people} 人感兴趣</span></div>
                    <button className={joined.includes(index) ? "joined" : ""} onClick={(event) => { event.stopPropagation(); setJoined((current) => current.includes(index) ? current.filter((item) => item !== index) : [...current, index]); }}>{joined.includes(index) ? "已关注" : <Plus />}</button>
                  </article>
                ))}
              </div>
            </section>

            <section className="side-section hot-section">
              <div className="side-heading"><h2>校园热榜</h2><Fire weight="fill" /></div>
              <ol>{hotTopics.map(([title, count], index) => <li key={title}><button className="hot-link" onClick={() => navigate(`/forum/${index + 1}`)}><b>{index + 1}</b><span>{title}</span><small>{count}</small></button></li>)}</ol>
              <button className="all-link" onClick={() => navigate("/forum")}>查看完整热榜 <PaperPlaneTilt /></button>
            </section>

            <div className="trust-note"><ShieldCheck weight="duotone" /><div><strong>可信的校园社区</strong><span>仅向认证在校师生开放</span></div></div>
          </aside>
        </div>
      </main>

      <button className="floating-publish" onClick={() => setShowComposer(true)}><PencilSimpleLine weight="bold" /><span>发布</span></button>

      {showComposer && (
        <div className="modal-backdrop" onMouseDown={() => setShowComposer(false)}>
          <section className="composer" onMouseDown={(event) => event.stopPropagation()}>
            <div className="composer-head"><div><span>CREATE A POST</span><h2>分享此刻</h2></div><button onClick={() => setShowComposer(false)}><X /></button></div>
            <textarea autoFocus value={draft} onChange={(event) => setDraft(event.target.value)} placeholder="校园里发生了什么新鲜事？" />
            <div className="composer-footer"><button className="add-image"><Image /> 添加图片</button><button className="submit" disabled={!draft.trim()} onClick={publish}>发布动态 <PaperPlaneTilt weight="fill" /></button></div>
          </section>
        </div>
      )}
    </div>
  );
}
