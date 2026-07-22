import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation, useNavigate, useParams, useSearchParams } from "react-router-dom";
import {
  ArrowLeft,
  Bell,
  BookmarkSimple,
  CalendarBlank,
  CaretRight,
  ChartBar,
  ChatCircle,
  Check,
  CheckCircle,
  ClipboardText,
  Clock,
  EnvelopeSimple,
  Eye,
  FileText,
  Flag,
  Gear,
  Heart,
  Image,
  ListBullets,
  MagnifyingGlass,
  MapPin,
  Megaphone,
  PaperPlaneTilt,
  PencilSimple,
  Plus,
  ShieldCheck,
  SignOut,
  SlidersHorizontal,
  Tag,
  UserCircle,
  UserPlus,
  Users,
  UsersThree,
  WarningCircle,
  X,
} from "@phosphor-icons/react";
import "./portal.css";
import { adminLogin, api, authStore } from "./api.js";

const navItems = [
  ["首页", "/"], ["论坛", "/forum"], ["表白墙", "/confess"], ["联谊活动", "/activities"], ["校园资讯", "/news"], ["好友", "/friends"], ["私信", "/messages"],
];

const demoForumPosts = [
  { id: "1", title: "期末复习自习室座位攻略", summary: "整理了图书馆与教学楼开放时间，欢迎继续补充。", tag: "学习交流", author: "学习委员", stats: "128 赞 · 36 评论" },
  { id: "2", title: "西区食堂新品麻辣香锅测评", summary: "从价格、分量和口味三个方面做了一次简单体验。", tag: "校园生活", author: "校园吃货社", stats: "96 赞 · 24 评论" },
  { id: "3", title: "大学生想做的小生意有哪些？", summary: "想利用课余时间尝试一个低成本项目，征集建议。", tag: "问答互助", author: "创业实践部", stats: "75 赞 · 41 评论" },
];

const demoActivities = [
  { id: "1", title: "夏日草坪音乐节", date: "07 月 25 日 · 18:30", place: "北区大草坪", category: "文娱", capacity: "325 人感兴趣" },
  { id: "2", title: "校园二手市集", date: "07 月 26 日 · 10:00", place: "南区广场", category: "交友", capacity: "276 人感兴趣" },
  { id: "3", title: "考研经验分享会", date: "07 月 28 日 · 19:00", place: "教学楼 A101", category: "竞赛", capacity: "168 人感兴趣" },
];

const demoConfessions = [
  { id: "1", title: "想对图书馆三楼常遇见的你说", body: "谢谢你那天帮我捡起散落的资料，希望还有机会正式认识。", time: "2 小时前" },
  { id: "2", title: "毕业前，想认真感谢我的室友们", body: "四年的日常看似普通，现在回头看却都是很珍贵的记忆。", time: "昨天 21:40" },
];

function PortalLayout({ children, title, eyebrow = "CAMPUS COMMUNITY", action, wide = false }) {
  const navigate = useNavigate();
  const isAdmin = authStore.isAdmin();
  const [keyword, setKeyword] = useState("");
  const submitSearch = (event) => {
    event.preventDefault();
    navigate(`/search?q=${encodeURIComponent(keyword)}`);
  };
  return (
    <div className="portal-shell">
      <header className="portal-header">
        <div className="portal-header-inner">
          <Link className="portal-brand" to="/"><span>同窗</span>圈<i /></Link>
          <nav className="portal-nav">
            {navItems.map(([label, path]) => <NavLink key={path} to={path} className={({ isActive }) => isActive ? "active" : ""}>{label}</NavLink>)}
          </nav>
          <form className="portal-search" onSubmit={submitSearch}><MagnifyingGlass /><input value={keyword} onChange={(event) => setKeyword(event.target.value)} placeholder="搜索校园内容" /></form>
          <Link className="portal-icon-link" to="/messages" aria-label="私信消息"><Bell /><span>私信</span><b /></Link>
          <Link className="portal-admin-link" to={isAdmin ? "/admin" : "/admin/login"}><ShieldCheck />{isAdmin ? "管理后台" : "管理员登录"}</Link>
          <Link className="portal-profile-link" to="/me"><img src="/assets/avatar-linxia.jpg" alt="个人头像" /><span>个人中心</span></Link>
        </div>
      </header>
      <main className={wide ? "portal-main portal-main-wide" : "portal-main"}>
        <div className="portal-page-title">
          <div><span>{eyebrow}</span><h1>{title}</h1></div>
          {action}
        </div>
        {children}
      </main>
    </div>
  );
}

function EmptyState({ icon: Icon = FileText, title = "暂无内容", text = "内容将在接入接口后显示", action, onAction }) {
  return <div className="portal-empty"><Icon weight="duotone" /><h3>{title}</h3><p>{text}</p>{action && <button className="portal-primary" onClick={onAction}><Plus />{action}</button>}</div>;
}

function FilterBar({ tabs, active, onChange, search = true, extra }) {
  return <div className="portal-filterbar"><div className="portal-tabs">{tabs.map((tab) => <button key={tab} className={active === tab ? "active" : ""} onClick={() => onChange(tab)}>{tab}</button>)}</div>{search && <label><MagnifyingGlass /><input placeholder="筛选当前内容" /></label>}{extra}</div>;
}

function StatStrip({ items }) {
  return <div className="portal-stat-strip">{items.map(([label, value, Icon]) => <div key={label}><Icon /><span>{label}</span><strong>{value}</strong></div>)}</div>;
}

export function AuthPage({ mode }) {
  const navigate = useNavigate();
  const copy = {
    login: ["欢迎回来", "使用校园账号继续", "登录"],
    register: ["加入同窗圈", "完成校内身份认证", "创建账号"],
    forgot: ["找回密码", "通过邮箱验证码重置", "发送验证码"],
  }[mode];
  const [form, setForm] = useState({ username: "", password: "", nickname: "", college: "", grade: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const field = (key) => ({ value: form[key], onChange: (event) => setForm({ ...form, [key]: event.target.value }) });
  const submit = async (event) => {
    event.preventDefault(); setError("");
    if (mode === "forgot") { setError("找回密码接口暂未开放，请联系管理员重置密码"); return; }
    setBusy(true);
    try {
      if (mode === "register") {
        await api("/auth/register", { method: "POST", body: JSON.stringify(form) });
      }
      const tokens = await api("/auth/login", { method: "POST", body: JSON.stringify({ username: form.username, password: form.password }) }, false);
      authStore.save(tokens);
      navigate("/", { replace: true });
    } catch (err) { authStore.clear(); setError(err.message); }
    finally { setBusy(false); }
  };
  return <div className="auth-screen">
    <section className="auth-visual"><Link className="portal-brand inverse" to="/"><span>同窗</span>圈<i /></Link><div><span>VERIFIED CAMPUS ONLY</span><h1>真实校园<br />自在连接</h1><p>讨论、活动与朋友，都从可信身份开始。</p></div></section>
    <section className="auth-panel"><div className="auth-box"><span className="portal-kicker">ACCOUNT</span><h2>{copy[0]}</h2><p>{copy[1]}</p><form onSubmit={submit}>
      {mode === "register" && <label>昵称<input required maxLength="40" {...field("nickname")} placeholder="请输入昵称" /></label>}
      <label>账号<input required minLength="4" maxLength="50" pattern="[A-Za-z0-9_]+" {...field("username")} placeholder="4-50 位字母、数字或下划线" /></label>
      {mode !== "forgot" && <label>密码<input type="password" required minLength="8" maxLength="72" {...field("password")} placeholder="至少 8 位密码" /></label>}
      {mode === "forgot" && <p className="auth-hint">当前请联系管理员进行密码重置。</p>}
      {mode === "register" && <><label>学院<input maxLength="100" {...field("college")} placeholder="请输入学院（选填）" /></label><label>年级<input maxLength="20" {...field("grade")} placeholder="例如：2026级（选填）" /></label></>}
      {error && <div className="admin-error"><WarningCircle />{error}</div>}
      <button disabled={busy} className="portal-primary auth-submit" type="submit">{busy ? "正在验证…" : copy[2]}<CaretRight /></button>
    </form><div className="auth-links">{mode !== "login" && <Link to="/login">返回登录</Link>}{mode === "login" && <><Link to="/register">注册账号</Link><Link to="/admin/login"><ShieldCheck />管理员登录</Link><Link to="/forgot-password">忘记密码</Link></>}</div></div></section>
  </div>;
}

export function SearchPage() {
  const [params] = useSearchParams();
  const [tab, setTab] = useState("全部");
  const q = params.get("q") || "";
  return <PortalLayout title={q ? `搜索“${q}”` : "全局搜索"} eyebrow="GLOBAL SEARCH"><FilterBar tabs={["全部", "帖子", "表白", "活动", "用户"]} active={tab} onChange={setTab} /><EmptyState icon={MagnifyingGlass} title="暂无搜索结果" text="输入关键词后，可在这里查看跨模块搜索结果" /></PortalLayout>;
}

export function ForumPage() {
  const [tab, setTab] = useState("最新");
  const [categories, setCategories] = useState([]); const [categoryId, setCategoryId] = useState(""); const [posts, setPosts] = useState([]); const [loading, setLoading] = useState(true); const [error, setError] = useState("");
  useEffect(() => { api("/public/forum/categories").then(setCategories).catch((err) => setError(err.message)); }, []);
  useEffect(() => { setLoading(true); const query = new URLSearchParams({ size: "30", sort: tab === "热门" ? "hot" : "latest" }); if (categoryId) query.set("categoryId", categoryId); api(`/public/forum/posts?${query}`).then((data) => { setPosts(data.records || []); setError(""); }).catch((err) => setError(err.message)).finally(() => setLoading(false)); }, [tab, categoryId]);
  return <PortalLayout title="校园论坛" eyebrow="CAMPUS FORUM" action={<Link className="portal-primary" to="/forum/new"><PencilSimple />发布帖子</Link>}><div className="portal-category-row"><button className={!categoryId ? "active" : ""} onClick={() => setCategoryId("")}><Tag />全部板块</button>{categories.map((item) => <button className={String(item.id) === String(categoryId) ? "active" : ""} onClick={() => setCategoryId(String(item.id))} key={item.id}><Tag />{item.name}</button>)}</div><FilterBar tabs={["最新", "热门"]} active={tab} onChange={setTab} />{error ? <div className="admin-error panel"><WarningCircle />{error}</div> : loading ? <div className="admin-loading">正在加载帖子…</div> : posts.length ? <div className="demo-list">{posts.map((post) => <Link className="demo-row" to={`/forum/${post.id}`} key={post.id}><div className="demo-icon"><ChatCircle weight="duotone" /></div><div><span>{post.categoryName}{post.featured ? " · 精华" : ""}</span><h3>{post.title}</h3><p>{post.content}</p><small>{post.author} · {post.likes} 赞 · {post.comments} 评论 · {post.views} 浏览</small></div><CaretRight /></Link>)}</div> : <EmptyState icon={ChatCircle} title="这个板块还没有帖子" text="发布第一篇帖子，开启校园讨论" action="发布帖子" onAction={() => location.hash = "#/forum/new"} />}</PortalLayout>;
}

export function ForumDetailPage() {
  const { id } = useParams();
  const [post, setPost] = useState(null); const [comments, setComments] = useState([]); const [content, setContent] = useState(""); const [error, setError] = useState("");
  const load = async () => { try { const [detail, commentPage] = await Promise.all([api(`/public/forum/posts/${id}`), api(`/public/forum/posts/${id}/comments`)]); setPost(detail); setComments(commentPage.records || []); setError(""); } catch (err) { setError(err.message); } };
  useEffect(() => { load(); }, [id]);
  const toggle = async (kind) => { try { const value = await api(`/forum/posts/${id}/${kind}`, { method: "POST" }); setPost({ ...post, [kind === "like" ? "liked" : "collected"]: value, [kind === "like" ? "likes" : "collections"]: post[kind === "like" ? "likes" : "collections"] + (value ? 1 : -1) }); } catch (err) { setError(err.message); } };
  const comment = async () => { if (!content.trim()) return; try { const item = await api(`/forum/posts/${id}/comments`, { method: "POST", body: JSON.stringify({ parentId: null, content }) }); setComments([...comments, item]); setContent(""); setPost({ ...post, comments: post.comments + 1 }); } catch (err) { setError(err.message); } };
  if (error && !post) return <PortalLayout title="帖子详情"><div className="admin-error panel"><WarningCircle />{error}</div></PortalLayout>;
  if (!post) return <PortalLayout title="帖子详情"><div className="admin-loading">正在加载帖子…</div></PortalLayout>;
  return <PortalLayout title="帖子详情" eyebrow={`POST · ${id}`}><article className="detail-paper"><Link className="back-link" to="/forum"><ArrowLeft />返回论坛</Link><div className="detail-author"><img src={post.avatarUrl || "/assets/avatar-zhouyu.jpg"} alt="作者头像" /><div><strong>{post.author}</strong><span>{post.categoryName} · {(post.createdAt || "").replace("T", " ").slice(0, 16)}</span></div></div><h2>{post.title}</h2><div className="demo-detail-body"><p>{post.content}</p>{post.imageUrls?.map((url) => <img className="post-content-image" src={url} alt="帖子图片" key={url} />)}</div><div className="detail-actions"><button className={post.liked ? "active" : ""} onClick={() => toggle("like")}><Heart weight={post.liked ? "fill" : "regular"} />{post.likes} 赞</button><button className={post.collected ? "active" : ""} onClick={() => toggle("collection")}><BookmarkSimple weight={post.collected ? "fill" : "regular"} />{post.collected ? "已收藏" : "收藏"}</button><span><Eye />{post.views} 浏览</span></div></article><section className="comment-panel"><h2>评论与回复（{post.comments}）</h2><textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder="写下你的评论…" /><button className="portal-primary" onClick={comment}><PaperPlaneTilt />发表评论</button>{error && <div className="admin-error"><WarningCircle />{error}</div>}{comments.length ? <div className="comment-list">{comments.map((item) => <div className="comment-item" key={item.id}><img src={item.avatarUrl || "/assets/avatar-linxia.jpg"} alt="评论者头像" /><div><strong>{item.nickname}</strong><p>{item.content}</p><small>{(item.createdAt || "").replace("T", " ").slice(0, 16)}</small></div></div>)}</div> : <EmptyState icon={ChatCircle} title="暂无评论" text="成为第一个参与讨论的人" />}</section></PortalLayout>;
}

export function ConfessPage() {
  const [tab, setTab] = useState("时间排序");
  const [params] = useSearchParams(); const mine = params.get("mine") === "1"; const [items, setItems] = useState([]); const [loading, setLoading] = useState(true); const [error, setError] = useState("");
  const load = () => { setLoading(true); api(mine ? "/confesses/mine?size=50" : "/public/confesses?size=50").then((data) => { let records = data.records || []; if (tab === "热度排序") records = [...records].sort((a, b) => b.likes - a.likes); setItems(records); setError(""); }).catch((err) => setError(err.message)).finally(() => setLoading(false)); };
  useEffect(load, [mine, tab]);
  const remove = async (event, id) => { event.preventDefault(); if (!window.confirm("确认删除这条表白吗？")) return; await api(`/confesses/${id}`, { method: "DELETE" }); load(); };
  return <PortalLayout title={mine ? "我的表白" : "表白墙"} eyebrow="CONFESSION WALL" action={<Link className="portal-primary" to="/confess/new"><Heart />发布表白</Link>}><div className="confess-intro"><div><ShieldCheck weight="duotone" /><h2>勇敢表达，也尊重每一份心意</h2><p>支持匿名发布；请勿透露他人隐私信息。</p></div><Link to={mine ? "/confess" : "/confess?mine=1"}>{mine ? "返回表白墙" : "查看我的表白"}<CaretRight /></Link></div><FilterBar tabs={["时间排序", "热度排序"]} active={tab} onChange={setTab} />{error ? <div className="admin-error panel"><WarningCircle />{error}</div> : loading ? <div className="admin-loading">正在加载表白…</div> : items.length ? <div className="demo-card-grid">{items.map((item) => <Link to={item.auditStatus === 1 ? `/confess/${item.id}` : "#"} className="confess-demo-card" key={item.id}><span><UserCircle />{item.author} · {(item.createdAt || "").replace("T", " ").slice(0, 16)}</span><h3>{item.content.slice(0, 28)}{item.content.length > 28 ? "…" : ""}</h3><p>{item.content}</p><div><Heart />{item.likes} <ChatCircle />{item.comments}{mine && <><span className={`status-pill status-${item.auditStatus === 1 ? 1 : 2}`}>{item.auditStatus === 0 ? "待审核" : item.auditStatus === 1 ? "已通过" : "未通过"}</span><button className="confess-delete" onClick={(event) => remove(event, item.id)}>删除</button></>}<CaretRight /></div></Link>)}</div> : <EmptyState icon={Heart} title={mine ? "你还没有发布表白" : "表白墙还没有内容"} text="勇敢说出想说的话" />}</PortalLayout>;
}

export function ConfessDetailPage() {
  const { id } = useParams();
  const [confession, setConfession] = useState(null); const [comments, setComments] = useState([]); const [content, setContent] = useState(""); const [error, setError] = useState("");
  const load = async () => { try { const [detail, page] = await Promise.all([api(`/public/confesses/${id}`), api(`/public/confesses/${id}/comments`)]); setConfession(detail); setComments(page.records || []); setError(""); } catch (err) { setError(err.message); } };
  useEffect(() => { load(); }, [id]);
  const like = async () => { try { const liked = await api(`/confesses/${id}/like`, { method: "POST" }); setConfession({ ...confession, liked, likes: confession.likes + (liked ? 1 : -1) }); } catch (err) { setError(err.message); } };
  const comment = async () => { if (!content.trim()) return; try { const item = await api(`/confesses/${id}/comments`, { method: "POST", body: JSON.stringify({ parentId: null, content }) }); setComments([...comments, item]); setContent(""); setConfession({ ...confession, comments: confession.comments + 1 }); } catch (err) { setError(err.message); } };
  if (error && !confession) return <PortalLayout title="表白详情"><div className="admin-error panel"><WarningCircle />{error}</div></PortalLayout>;
  if (!confession) return <PortalLayout title="表白详情"><div className="admin-loading">正在加载表白…</div></PortalLayout>;
  return <PortalLayout title="表白详情" eyebrow={`CONFESSION · ${id}`}><article className="detail-paper confess-paper"><Link className="back-link" to="/confess"><ArrowLeft />返回表白墙</Link><span className="anonymous-label"><UserCircle />{confession.author} · {(confession.createdAt || "").replace("T", " ").slice(0, 16)}</span><div className="demo-detail-body"><p>{confession.content}</p>{confession.imageUrls?.map((url) => <img className="post-content-image" src={url} alt="表白图片" key={url} />)}</div><div className="detail-actions"><button className={confession.liked ? "active" : ""} onClick={like}><Heart weight={confession.liked ? "fill" : "regular"} />{confession.likes} 赞</button><span><ChatCircle />{confession.comments} 评论</span></div></article><section className="comment-panel"><h2>评论</h2><textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder="友善地表达你的想法…" /><button className="portal-primary" onClick={comment}><PaperPlaneTilt />发送评论</button>{error && <div className="admin-error"><WarningCircle />{error}</div>}{comments.length ? <div className="comment-list">{comments.map((item) => <div className="comment-item" key={item.id}><img src={item.avatarUrl || "/assets/avatar-linxia.jpg"} alt="评论头像" /><div><strong>{item.nickname}</strong><p>{item.content}</p><small>{(item.createdAt || "").replace("T", " ").slice(0, 16)}</small></div></div>)}</div> : <EmptyState icon={ChatCircle} title="暂无评论" text="成为第一个评论的人" />}</section></PortalLayout>;
}

export function ActivityPage() {
  const [tab, setTab] = useState("全部活动");
  const [categories, setCategories] = useState([]); const [categoryId, setCategoryId] = useState(""); const [items, setItems] = useState([]); const [loading, setLoading] = useState(true); const [error, setError] = useState("");
  useEffect(() => { api("/public/activities/categories").then(setCategories).catch((err) => setError(err.message)); }, []);
  useEffect(() => { setLoading(true); const path = tab === "我的报名" ? "/activities/mine?size=50" : `/public/activities?size=50${categoryId ? `&categoryId=${categoryId}` : ""}`; api(path).then((data) => { setItems(data.records || []); setError(""); }).catch((err) => setError(err.message)).finally(() => setLoading(false)); }, [tab, categoryId]);
  return <PortalLayout title="联谊活动" eyebrow="CAMPUS EVENTS" action={<Link className="portal-primary" to="/activities/new"><Plus />创建活动</Link>}><StatStrip items={[["可报名活动", String(items.length), CalendarBlank], ["我的报名", String(items.filter((item) => item.signed).length), CheckCircle], ["活动分类", String(categories.length), MapPin]]} /><div className="portal-category-row"><button className={!categoryId ? "active" : ""} onClick={() => setCategoryId("")}><Tag />全部分类</button>{categories.map((item) => <button className={String(categoryId) === String(item.id) ? "active" : ""} onClick={() => setCategoryId(String(item.id))} key={item.id}><Tag />{item.name}</button>)}</div><FilterBar tabs={["全部活动", "我的报名"]} active={tab} onChange={setTab} />{error ? <div className="admin-error panel"><WarningCircle />{error}</div> : loading ? <div className="admin-loading">正在加载活动…</div> : items.length ? <div className="demo-card-grid">{items.map((item) => <Link className="activity-demo-card" to={`/activities/${item.id}`} key={item.id}><div><span>{item.categoryName}</span><CalendarBlank weight="duotone" /></div><h3>{item.title}</h3><p><Clock />{(item.startAt || "").replace("T", " ").slice(0, 16)}</p><p><MapPin />{item.location}</p><small>{item.signedCount} / {item.capacity} 人已报名</small><span className="activity-card-link">{item.signed ? "已报名" : "查看详情"}<CaretRight /></span></Link>)}</div> : <EmptyState icon={CalendarBlank} title={tab === "我的报名" ? "还没有报名活动" : "暂无可报名活动"} text="新活动审核通过后会显示在这里" />}</PortalLayout>;
}

export function ActivityDetailPage() {
  const { id } = useParams();
  const [activity, setActivity] = useState(null); const [error, setError] = useState(""); const [busy, setBusy] = useState(false);
  const load = () => api(`/public/activities/${id}`).then((data) => { setActivity(data); setError(""); }).catch((err) => setError(err.message));
  useEffect(load, [id]);
  const toggleSign = async () => { setBusy(true); try { const signed = await api(`/activities/${id}/sign`, { method: "POST" }); setActivity({ ...activity, signed, signedCount: activity.signedCount + (signed ? 1 : -1) }); } catch (err) { setError(err.message); } finally { setBusy(false); } };
  if (error && !activity) return <PortalLayout title="活动详情"><div className="admin-error panel"><WarningCircle />{error}</div></PortalLayout>;
  if (!activity) return <PortalLayout title="活动详情"><div className="admin-loading">正在加载活动…</div></PortalLayout>;
  return <PortalLayout title="活动详情" eyebrow={`EVENT · ${id}`}><div className="activity-detail"><section className="activity-poster">{activity.posterUrl ? <img src={activity.posterUrl} alt="活动海报" /> : <><CalendarBlank weight="duotone" /><strong>{activity.title}</strong><span>{activity.categoryName}</span></>}</section><section className="activity-info"><Link className="back-link" to="/activities"><ArrowLeft />返回活动列表</Link><span className="status-tag">{activity.status === 1 ? "报名中" : "已结束"}</span><h2>{activity.title}</h2><p>发起人：{activity.creatorName}</p><dl><div><dt><CalendarBlank />开始时间</dt><dd>{activity.startAt.replace("T", " ").slice(0, 16)}</dd></div><div><dt><Clock />结束时间</dt><dd>{activity.endAt.replace("T", " ").slice(0, 16)}</dd></div><div><dt><MapPin />地点</dt><dd>{activity.location}</dd></div><div><dt><UsersThree />参与情况</dt><dd>{activity.signedCount} / {activity.capacity} 人</dd></div></dl><button disabled={busy} className={activity.signed ? "portal-secondary block" : "portal-primary block"} onClick={toggleSign}>{activity.signed ? <><X />{busy ? "处理中…" : "取消报名"}</> : <><Check />{busy ? "处理中…" : "立即报名"}</>}</button>{error && <div className="admin-error"><WarningCircle />{error}</div>}</section></div><section className="detail-section"><h2>活动介绍</h2><div className="demo-detail-body"><p>{activity.content}</p><p>报名截止：{activity.signupDeadline.replace("T", " ").slice(0, 16)}</p></div></section></PortalLayout>;
}

export function NewsPage() {
  const [items, setItems] = useState([]); const [keyword, setKeyword] = useState(""); const [loading, setLoading] = useState(true); const [error, setError] = useState("");
  const load = async (value = "") => { setLoading(true); try { const data = await api(`/public/news?size=50${value ? `&keyword=${encodeURIComponent(value)}` : ""}`); setItems(data.records || []); setError(""); } catch (err) { setError(err.message); } finally { setLoading(false); } };
  useEffect(() => { load(); }, []);
  const featured = items[0];
  return <PortalLayout title="校园资讯" eyebrow="CAMPUS NEWS"><div className="news-toolbar"><form onSubmit={(e) => { e.preventDefault(); load(keyword); }}><MagnifyingGlass /><input value={keyword} onChange={(e) => setKeyword(e.target.value)} placeholder="搜索校园新闻" /><button type="submit">搜索</button></form><Link className="portal-secondary" to="/notices"><Megaphone />系统公告</Link></div>{error ? <div className="admin-error panel"><WarningCircle />{error}</div> : loading ? <div className="admin-loading">正在加载校园新闻…</div> : items.length ? <div className="news-layout"><Link className="news-feature" to={`/news/${featured.id}`}>{featured.coverUrl ? <img src={featured.coverUrl} alt="新闻封面" /> : <Image weight="duotone" />}<div><span>{featured.top ? "TOP STORY" : "FEATURED STORY"}</span><h2>{featured.title}</h2><p>{featured.summary || featured.source}</p></div></Link><section className="news-list">{items.slice(1).map((item) => <Link to={`/news/${item.id}`} key={item.id}><div><span>{item.source || "校园资讯"}{item.top ? " · 置顶" : ""}</span><h3>{item.title}</h3><p>{item.summary || "点击查看新闻详情"}</p><small>{(item.publishedAt || "").replace("T", " ").slice(0, 16)} · {item.views} 浏览</small></div><CaretRight /></Link>)}</section></div> : <EmptyState icon={FileText} title="暂无新闻" text="管理员发布新闻后会显示在这里" />}</PortalLayout>;
}

export function NoticePage() {
  const [items, setItems] = useState([]); const [loading, setLoading] = useState(true); const [error, setError] = useState("");
  useEffect(() => { api("/public/notices?size=50").then((data) => setItems(data.records || [])).catch((err) => setError(err.message)).finally(() => setLoading(false)); }, []);
  return <PortalLayout title="系统公告" eyebrow="OFFICIAL NOTICE"><div className="notice-banner"><Megaphone weight="duotone" /><div><h2>重要通知统一发布</h2><p>请及时关注学校和社区的重要信息。</p></div></div>{error ? <div className="admin-error panel"><WarningCircle />{error}</div> : loading ? <div className="admin-loading">正在加载系统公告…</div> : items.length ? <div className="notice-list">{items.map((item) => <Link to={`/notices/${item.id}`} key={item.id}><Megaphone /><div><span>{item.top ? "置顶公告" : "系统公告"}</span><h3>{item.title}</h3><p>{item.content}</p><small>{(item.publishedAt || "").replace("T", " ").slice(0, 16)}</small></div><CaretRight /></Link>)}</div> : <EmptyState icon={ClipboardText} title="暂无系统公告" text="管理员发布公告后会显示在这里" />}</PortalLayout>;
}

export function NewsDetailPage({ type }) {
  const { id } = useParams();
  const isNotice = type === "notice";
  const [item, setItem] = useState(null); const [error, setError] = useState("");
  useEffect(() => { api(`/public/${isNotice ? "notices" : "news"}/${id}`).then(setItem).catch((err) => setError(err.message)); }, [id, isNotice]);
  if (error) return <PortalLayout title={isNotice ? "公告详情" : "新闻详情"}><div className="admin-error panel"><WarningCircle />{error}</div></PortalLayout>;
  if (!item) return <PortalLayout title={isNotice ? "公告详情" : "新闻详情"}><div className="admin-loading">正在加载正文…</div></PortalLayout>;
  return <PortalLayout title={isNotice ? "公告详情" : "新闻详情"} eyebrow={`${isNotice ? "NOTICE" : "NEWS"} · ${id}`}><article className="article-reader"><Link className="back-link" to={isNotice ? "/notices" : "/news"}><ArrowLeft />返回列表</Link><span>{isNotice ? (item.top ? "置顶公告" : "官方公告") : (item.source || "校园新闻")}</span><h2>{item.title}</h2><p className="article-meta">{(item.publishedAt || "").replace("T", " ").slice(0, 16)}{!isNotice && ` · ${item.views} 浏览`}</p>{!isNotice && item.coverUrl && <div className="article-cover"><img src={item.coverUrl} alt="新闻封面" /></div>}<div className="article-body">{item.content}</div></article></PortalLayout>;
}

function ForumEditor() {
  const navigate = useNavigate(); const [categories, setCategories] = useState([]); const [form, setForm] = useState({ categoryId: "", title: "", content: "", tags: "" }); const [error, setError] = useState(""); const [busy, setBusy] = useState(false);
  useEffect(() => { api("/public/forum/categories").then(setCategories).catch((err) => setError(err.message)); }, []);
  const submit = async (event) => { event.preventDefault(); setBusy(true); setError(""); try { await api("/forum/posts", { method: "POST", body: JSON.stringify({ categoryId: Number(form.categoryId), title: form.title, content: form.content, imageUrls: [], tags: form.tags.split(/[,，]/).map((item) => item.trim()).filter(Boolean).slice(0, 5) }) }); window.alert("帖子已提交，管理员审核通过后会显示在论坛中"); navigate("/forum", { replace: true }); } catch (err) { setError(err.message); } finally { setBusy(false); } };
  return <PortalLayout title="发布帖子" eyebrow="CONTENT EDITOR"><form className="editor-form" onSubmit={submit}><label>帖子标题<input required maxLength="150" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="请输入帖子标题" /></label><label>选择论坛板块<select required value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })}><option value="" disabled>请选择板块</option>{categories.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label><label>帖子正文<textarea required value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} placeholder="写下帖子正文…" /></label><label>标签<input value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} placeholder="最多 5 个，用逗号分隔" /></label>{error && <div className="admin-error"><WarningCircle />{error}</div>}<div className="editor-actions"><button type="button" className="portal-secondary" onClick={() => navigate(-1)}>取消</button><button disabled={busy} className="portal-primary" type="submit"><PaperPlaneTilt />{busy ? "提交中…" : "提交审核"}</button></div></form></PortalLayout>;
}

function ConfessEditor() {
  const navigate = useNavigate(); const [content, setContent] = useState(""); const [anonymous, setAnonymous] = useState(true); const [error, setError] = useState(""); const [busy, setBusy] = useState(false);
  const submit = async (event) => { event.preventDefault(); setBusy(true); setError(""); try { await api("/confesses", { method: "POST", body: JSON.stringify({ content, imageUrls: [], anonymous }) }); window.alert("表白已提交，管理员审核通过后会公开显示"); navigate("/confess?mine=1", { replace: true }); } catch (err) { setError(err.message); } finally { setBusy(false); } };
  return <PortalLayout title="发布表白" eyebrow="CONTENT EDITOR"><form className="editor-form" onSubmit={submit}><label>匿名发布<button type="button" className={`switch ${anonymous ? "on" : ""}`} onClick={() => setAnonymous(!anonymous)}><i />{anonymous ? "已开启" : "已关闭"}</button></label><label>想说的话<textarea required maxLength="5000" value={content} onChange={(e) => setContent(e.target.value)} placeholder="写下想说的话…" /></label><small className="editor-counter">{content.length} / 5000</small>{error && <div className="admin-error"><WarningCircle />{error}</div>}<div className="editor-actions"><button type="button" className="portal-secondary" onClick={() => navigate(-1)}>取消</button><button disabled={busy} className="portal-primary" type="submit"><Heart />{busy ? "提交中…" : "提交审核"}</button></div></form></PortalLayout>;
}

function ActivityEditor() {
  const navigate = useNavigate(); const [categories, setCategories] = useState([]);
  const toLocalInput = (date) => { const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000); return local.toISOString().slice(0, 16); };
  const initialTimes = () => { const now = new Date(); const start = new Date(now.getTime() + 24 * 60 * 60 * 1000); const end = new Date(start.getTime() + 2 * 60 * 60 * 1000); const deadline = new Date(start.getTime() - 12 * 60 * 60 * 1000); return { startAt: toLocalInput(start), endAt: toLocalInput(end), signupDeadline: toLocalInput(deadline) }; };
  const [form, setForm] = useState(() => ({ categoryId: "", title: "", posterUrl: "", content: "", location: "", ...initialTimes(), capacity: 50 })); const [error, setError] = useState(""); const [busy, setBusy] = useState(false);
  useEffect(() => { api("/public/activities/categories").then(setCategories).catch((err) => setError(err.message)); }, []);
  const change = (key, value) => setForm({ ...form, [key]: value });
  const submit = async (event) => { event.preventDefault(); const now = Date.now(); if (new Date(form.startAt).getTime() <= now) { setError("活动开始时间必须晚于当前时间"); return; } if (new Date(form.endAt).getTime() <= now) { setError("活动结束时间必须晚于当前时间"); return; } if (new Date(form.signupDeadline).getTime() <= now) { setError("报名截止时间必须晚于当前时间"); return; } if (form.signupDeadline >= form.startAt) { setError("报名截止时间必须早于活动开始时间"); return; } if (form.endAt <= form.startAt) { setError("结束时间必须晚于开始时间"); return; } setBusy(true); setError(""); try { await api("/activities", { method: "POST", body: JSON.stringify({ ...form, categoryId: Number(form.categoryId), capacity: Number(form.capacity), posterUrl: form.posterUrl || "" }) }); window.alert("活动已提交，管理员审核通过后会公开显示"); navigate("/activities", { replace: true }); } catch (err) { setError(err.message); } finally { setBusy(false); } };
  const minimumTime = toLocalInput(new Date());
  return <PortalLayout title="创建活动" eyebrow="CONTENT EDITOR"><form className="editor-form" onSubmit={submit}><div className="activity-time-note"><Clock />当前时间：{new Date().toLocaleString("zh-CN", { hour12: false })}，三个时间都必须晚于现在。</div><div className="field-grid"><label>活动名称<input required maxLength="120" value={form.title} onChange={(e) => change("title", e.target.value)} /></label><label>活动分类<select required value={form.categoryId} onChange={(e) => change("categoryId", e.target.value)}><option value="" disabled>请选择分类</option>{categories.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label><label>开始时间<input required min={minimumTime} type="datetime-local" value={form.startAt} onChange={(e) => change("startAt", e.target.value)} /></label><label>结束时间<input required min={form.startAt || minimumTime} type="datetime-local" value={form.endAt} onChange={(e) => change("endAt", e.target.value)} /></label><label>报名截止<input required min={minimumTime} max={form.startAt || undefined} type="datetime-local" value={form.signupDeadline} onChange={(e) => change("signupDeadline", e.target.value)} /></label><label>人数上限<input required type="number" min="1" value={form.capacity} onChange={(e) => change("capacity", e.target.value)} /></label><label>活动地点<input required maxLength="200" value={form.location} onChange={(e) => change("location", e.target.value)} /></label><label>海报地址<input maxLength="500" value={form.posterUrl} onChange={(e) => change("posterUrl", e.target.value)} placeholder="图片 URL（选填）" /></label></div><label>活动介绍<textarea required value={form.content} onChange={(e) => change("content", e.target.value)} /></label>{error && <div className="admin-error"><WarningCircle />{error}</div>}<div className="editor-actions"><button type="button" className="portal-secondary" onClick={() => navigate(-1)}>取消</button><button disabled={busy} className="portal-primary" type="submit"><CalendarBlank />{busy ? "提交中…" : "提交审核"}</button></div></form></PortalLayout>;
}

export function EditorPage({ type }) {
  if (type === "forum") return <ForumEditor />;
  if (type === "confess") return <ConfessEditor />;
  if (type === "activity") return <ActivityEditor />;
  return <LegacyEditor type={type} />;
}

function LegacyEditor({ type }) {
  const navigate = useNavigate();
  const config = {
    confess: ["发布表白", "想对谁说", "匿名发布", "写下想说的话…"],
    activity: ["创建活动", "活动名称", "活动分类", "填写活动介绍…"],
  }[type];
  const [anonymous, setAnonymous] = useState(type === "confess");
  const categoryOptions = type === "forum" ? ["学习交流", "校园生活", "闲置交易", "问答互助"] : ["文娱活动", "交友联谊", "竞赛实践"];
  return <PortalLayout title={config[0]} eyebrow="CONTENT EDITOR"><form className="editor-form" onSubmit={(event) => { event.preventDefault(); navigate(type === "forum" ? "/forum" : type === "confess" ? "/confess" : "/activities"); }}><label>{config[1]}<input required placeholder={`请输入${config[1]}`} /></label><label>{config[2]}{type === "confess" ? <button type="button" className={`switch ${anonymous ? "on" : ""}`} onClick={() => setAnonymous(!anonymous)}><i />{anonymous ? "已开启" : "已关闭"}</button> : <select required defaultValue=""><option value="" disabled>请选择</option>{categoryOptions.map((item) => <option key={item} value={item}>{item}</option>)}</select>}</label>{type === "activity" && <div className="field-grid"><label>活动时间<input type="datetime-local" required /></label><label>报名人数上限<input type="number" min="1" /></label><label>活动地点<input placeholder="输入校内地点" /></label><label>报名截止时间<input type="datetime-local" /></label></div>}<label>内容<textarea required placeholder={config[3]} /></label><div className="upload-zone"><Image weight="duotone" /><strong>上传图片</strong><span>支持拖拽或点击选择</span></div><div className="editor-actions"><button type="button" className="portal-secondary" onClick={() => navigate(-1)}>取消</button><button className="portal-primary" type="submit"><PaperPlaneTilt />提交发布</button></div></form></PortalLayout>;
}

export function UserSpacePage() {
  const { id } = useParams();
  const [user, setUser] = useState(null); const [error, setError] = useState(""); const [busy, setBusy] = useState(false);
  useEffect(() => { api(id === "me" ? "/users/me" : `/users/${id}`).then(setUser).catch((err) => setError(err.message)); }, [id]);
  const addFriend = async () => { setBusy(true); try { await api(`/users/friends/${id}`, { method: "POST" }); setUser({ ...user, friend: true }); } catch (err) { setError(err.message); } finally { setBusy(false); } };
  if (error && !user) return <PortalLayout title="用户主页"><div className="admin-error panel"><WarningCircle />{error}</div></PortalLayout>;
  if (!user) return <PortalLayout title="用户主页"><div className="admin-loading">正在加载用户资料…</div></PortalLayout>;
  const mine = id === "me";
  return <PortalLayout title="用户主页" eyebrow={`USER · ${user.id}`}><section className="user-hero"><img src={user.avatarUrl || "/assets/avatar-linxia.jpg"} alt="用户头像" /><div><span><ShieldCheck weight={user.verified || user.verifyStatus === 2 ? "fill" : "regular"} />{user.verified || user.verifyStatus === 2 ? "校内认证" : "普通校园用户"}</span><h2>{user.nickname}</h2><p>{[user.college, user.grade].filter(Boolean).join(" · ") || "学院与年级暂未填写"}<br />{user.bio || "这个人还没有填写个人简介。"}</p></div><div>{mine ? <Link className="portal-primary" to="/me"><PencilSimple />编辑资料</Link> : <><button disabled={busy || user.friend} className={user.friend ? "portal-secondary" : "portal-primary"} onClick={addFriend}>{user.friend ? <Check /> : <UserPlus />}{user.friend ? "已是好友" : busy ? "发送中…" : "添加好友"}</button><Link className="portal-secondary" to={`/messages/${id}`}><ChatCircle />私信</Link></>}</div></section><StatStrip items={[["账号状态", "正常", ShieldCheck], ["学院", user.college || "未填写", FileText], ["年级", user.grade || "未填写", Users]]} /><FilterBar tabs={["主页", "发帖记录", "收藏"]} active="主页" onChange={() => {}} search={false} />{error && <div className="admin-error"><WarningCircle />{error}</div>}<EmptyState icon={FileText} title="暂无公开动态" text="该用户发布的公开内容将在这里显示" /></PortalLayout>;
}

export function FriendPage({ tab: defaultTab = "friends" }) {
  const [tab, setTab] = useState(defaultTab === "requests" ? "好友申请" : "好友列表");
  const [items, setItems] = useState([]); const [searching, setSearching] = useState(false); const [keyword, setKeyword] = useState(""); const [results, setResults] = useState([]); const [loading, setLoading] = useState(true); const [error, setError] = useState(""); const [notice, setNotice] = useState("");
  const load = () => { setLoading(true); api(tab === "好友申请" ? "/users/friend-requests" : "/users/friends").then((data) => { setItems(data || []); setError(""); }).catch((err) => setError(err.message)).finally(() => setLoading(false)); };
  useEffect(load, [tab]);
  const search = async (event) => { event.preventDefault(); if (!keyword.trim()) return; setLoading(true); try { setResults(await api(`/users/search?keyword=${encodeURIComponent(keyword.trim())}`)); setError(""); } catch (err) { setError(err.message); } finally { setLoading(false); } };
  const applyFriend = async (user) => { try { await api(`/users/friends/${user.id}`, { method: "POST" }); setNotice("好友申请已发送"); setResults(results.filter((item) => item.id !== user.id)); } catch (err) { setError(err.message); } };
  const handleRequest = async (request, accept) => { try { await api(`/users/friend-requests/${request.requestId}/${accept ? "accept" : "reject"}`, { method: "POST" }); setNotice(accept ? "已添加为好友" : "已拒绝申请"); load(); } catch (err) { setError(err.message); } };
  const removeFriend = async (user) => { if (!window.confirm(`确认删除好友“${user.nickname}”吗？`)) return; try { await api(`/users/friends/${user.id}`, { method: "DELETE" }); setNotice("好友已删除"); load(); } catch (err) { setError(err.message); } };
  const display = searching ? results : items;
  return <PortalLayout title="好友" eyebrow="SOCIAL CONNECTIONS" action={<button className="portal-primary" onClick={() => { setSearching(!searching); setResults([]); setKeyword(""); }}><UserPlus />{searching ? "返回好友" : "添加好友"}</button>}><FilterBar tabs={["好友列表", "好友申请"]} active={tab} onChange={(value) => { setTab(value); setSearching(false); }} search={false} />{searching && <form className="friend-search" onSubmit={search}><label><MagnifyingGlass /><input autoFocus value={keyword} onChange={(e) => setKeyword(e.target.value)} placeholder="输入昵称或学院搜索" /></label><button className="portal-primary" type="submit">搜索用户</button></form>}{notice && <div className="profile-success"><CheckCircle />{notice}</div>}{error && <div className="admin-error"><WarningCircle />{error}</div>}{loading ? <div className="admin-loading">正在加载好友数据…</div> : display.length ? <div className="friend-grid">{display.map((item) => <article className="friend-card" key={item.requestId || item.id}><img src={item.avatarUrl || "/assets/avatar-linxia.jpg"} alt="用户头像" /><div><h3>{item.nickname}</h3><p>{[item.college, item.grade].filter(Boolean).join(" · ") || "校园用户"}</p>{item.bio && <span>{item.bio}</span>}</div><div>{searching ? item.friend ? <span className="status-pill">已是好友</span> : <button className="portal-primary" onClick={() => applyFriend(item)}><UserPlus />申请好友</button> : tab === "好友申请" ? <><button className="portal-primary" onClick={() => handleRequest(item, true)}><Check />同意</button><button className="portal-secondary" onClick={() => handleRequest(item, false)}><X />拒绝</button></> : <><Link className="portal-secondary" to={`/messages/${item.id}`}><ChatCircle />私信</Link><button className="friend-remove" onClick={() => removeFriend(item)}>删除</button></>}</div></article>)}</div> : <EmptyState icon={searching || tab === "好友申请" ? UserPlus : Users} title={searching ? "没有找到相关用户" : tab === "好友申请" ? "暂无好友申请" : "好友列表为空"} text={searching ? "换一个昵称或学院关键词试试" : "通过添加好友建立校园连接"} />}</PortalLayout>;
}

export function MessagePage({ conversation = false }) {
  const { id } = useParams();
  const navigate = useNavigate(); const myId = authStore.userId(); const [conversations, setConversations] = useState([]); const [messages, setMessages] = useState([]); const [contact, setContact] = useState(null); const [draft, setDraft] = useState(""); const [keyword, setKeyword] = useState(""); const [loading, setLoading] = useState(true); const [error, setError] = useState(""); const [busy, setBusy] = useState(false);
  const loadConversations = async () => { try { setConversations(await api("/messages/conversations")); } catch (err) { setError(err.message); } };
  useEffect(() => { loadConversations().finally(() => setLoading(false)); }, []);
  useEffect(() => { if (!conversation || !id) return; setLoading(true); Promise.all([api(`/messages/with/${id}?size=100`), api(`/users/${id}`), api(`/messages/with/${id}/read`, { method: "POST" })]).then(([page, user]) => { setMessages([...(page.records || [])].reverse()); setContact(user); setError(""); loadConversations(); }).catch((err) => setError(err.message)).finally(() => setLoading(false)); }, [conversation, id]);
  const send = async (event) => { event.preventDefault(); if (!draft.trim()) return; setBusy(true); setError(""); try { const item = await api(`/messages/${id}`, { method: "POST", body: JSON.stringify({ messageType: 0, content: draft.trim(), fileUrl: null }) }); setMessages([...messages, item]); setDraft(""); await loadConversations(); } catch (err) { setError(err.message); } finally { setBusy(false); } };
  const filtered = conversations.filter((item) => `${item.nickname}${item.lastMessage}`.toLowerCase().includes(keyword.toLowerCase()));
  return <PortalLayout title="消息中心" eyebrow="MESSAGES" wide><div className="message-shell"><aside className="message-list"><div className="message-list-head"><h2>私信</h2><Link to="/friends"><UserPlus /></Link></div><label><MagnifyingGlass /><input value={keyword} onChange={(e) => setKeyword(e.target.value)} placeholder="搜索会话" /></label>{loading && !conversations.length ? <div className="message-loading">正在加载…</div> : filtered.length ? <div className="conversation-list">{filtered.map((item) => <button className={String(id) === String(item.userId) ? "active" : ""} onClick={() => navigate(`/messages/${item.userId}`)} key={item.userId}><img src={item.avatarUrl || "/assets/avatar-linxia.jpg"} alt="联系人头像" /><div><strong>{item.nickname}</strong><span>{item.lastMessage}</span></div><time>{(item.lastMessageAt || "").replace("T", " ").slice(5, 16)}</time>{item.unreadCount > 0 && <b>{item.unreadCount}</b>}</button>)}</div> : <EmptyState icon={ChatCircle} title="暂无会话" text="先从好友列表选择一位好友私信" />}</aside><section className="conversation">{conversation ? <><div className="conversation-head"><Link to="/messages"><ArrowLeft /></Link><img src={contact?.avatarUrl || "/assets/avatar-linxia.jpg"} alt="联系人头像" /><div><strong>{contact?.nickname || "联系人"}</strong><span>{contact?.college || "校园用户"} · {id}</span></div></div><div className="conversation-body">{loading ? <div className="message-loading">正在加载聊天记录…</div> : messages.length ? <div className="message-bubbles">{messages.map((item) => <div className={item.senderId === myId ? "message-bubble mine" : "message-bubble"} key={item.id}><p>{item.content}</p><span>{(item.createdAt || "").replace("T", " ").slice(5, 16)}{item.senderId === myId && (item.read ? " · 已读" : " · 已发送")}</span></div>)}</div> : <EmptyState icon={ChatCircle} title="开始一段对话" text="发送第一条好友私信" />}</div>{error && <div className="admin-error message-error"><WarningCircle />{error}</div>}<form className="message-composer" onSubmit={send}><input value={draft} onChange={(e) => setDraft(e.target.value)} maxLength="5000" placeholder="输入消息…" /><button disabled={busy || !draft.trim()} className="send-button" type="submit"><PaperPlaneTilt weight="fill" /></button></form></> : <EmptyState icon={EnvelopeSimple} title="选择一条会话" text="从左侧会话列表开始聊天，或前往好友列表发起私信" />}</section></div></PortalLayout>;
}

export function PersonalCenterPage() {
  const [tab, setTab] = useState("个人资料");
  const [profile, setProfile] = useState(null); const [error, setError] = useState(""); const [saved, setSaved] = useState(""); const [busy, setBusy] = useState(false);
  const navigate = useNavigate();
  useEffect(() => { api("/users/me").then(setProfile).catch((err) => setError(err.message)); }, []);
  const change = (key, value) => setProfile({ ...profile, [key]: value });
  const save = async (event) => { event.preventDefault(); setBusy(true); setError(""); setSaved(""); try { const updated = await api("/users/me", { method: "PUT", body: JSON.stringify({ nickname: profile.nickname, avatarUrl: profile.avatarUrl || "", college: profile.college || "", grade: profile.grade || "", bio: profile.bio || "" }) }); setProfile(updated); setSaved("资料已保存"); } catch (err) { setError(err.message); } finally { setBusy(false); } };
  const logout = async () => {
    const refreshToken = authStore.refresh();
    try { if (refreshToken) await api("/auth/logout", { method: "POST", body: JSON.stringify({ refreshToken }) }, false); } catch { /* 本地仍需退出 */ }
    authStore.clear(); navigate("/login", { replace: true });
  };
  if (!profile) return <PortalLayout title="个人中心" eyebrow="MY SPACE"><div className={error ? "admin-error panel" : "admin-loading"}>{error || "正在加载个人资料…"}</div></PortalLayout>;
  return <PortalLayout title="个人中心" eyebrow="MY SPACE" action={<button className="portal-secondary" onClick={logout}><SignOut />退出登录</button>}><section className="profile-editor"><div className="profile-avatar-wrap"><img src={profile.avatarUrl || "/assets/avatar-linxia.jpg"} alt="我的头像" /></div><div><h2>{profile.nickname}</h2><p><ShieldCheck weight={profile.verifyStatus === 2 ? "fill" : "regular"} />{profile.verifyStatus === 2 ? "校内身份已认证" : `账号：${profile.username}`}</p></div><Link className="portal-secondary" to="/users/me">查看公开主页</Link></section><FilterBar tabs={["个人资料", "我的表白", "我的帖子", "我的评论", "我的收藏", "我的报名", "消息通知"]} active={tab} onChange={setTab} search={false} />{tab === "个人资料" ? <form className="profile-form" onSubmit={save}><div className="field-grid"><label>昵称<input required maxLength="40" value={profile.nickname || ""} onChange={(e) => change("nickname", e.target.value)} /></label><label>头像地址<input maxLength="500" value={profile.avatarUrl || ""} onChange={(e) => change("avatarUrl", e.target.value)} placeholder="图片 URL（选填）" /></label><label>年级<input maxLength="20" value={profile.grade || ""} onChange={(e) => change("grade", e.target.value)} placeholder="例如：2026级" /></label><label>学院<input maxLength="100" value={profile.college || ""} onChange={(e) => change("college", e.target.value)} placeholder="请输入学院" /></label></div><label>个人简介<textarea maxLength="300" value={profile.bio || ""} onChange={(e) => change("bio", e.target.value)} placeholder="介绍一下自己…" /></label>{error && <div className="admin-error"><WarningCircle />{error}</div>}{saved && <div className="profile-success"><CheckCircle />{saved}</div>}<button disabled={busy} className="portal-primary" type="submit"><Check />{busy ? "保存中…" : "保存资料"}</button></form> : <EmptyState icon={BookmarkSimple} title={`${tab}暂无内容`} text="相关数据将在接入接口后显示" />}</PortalLayout>;
}

const adminSections = [
  ["overview", "数据概览", ChartBar], ["users", "用户管理", Users], ["reviews", "帖子审核", ClipboardText], ["confesses", "表白审核", Heart], ["activities", "活动审核", CalendarBlank], ["content", "内容管理", FileText], ["categories", "板块管理", ListBullets], ["reports", "举报管理", Flag], ["sensitive", "敏感词配置", WarningCircle],
];

export function AdminLoginPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const submit = async (event) => {
    event.preventDefault(); setBusy(true); setError("");
    try { await adminLogin(form.username, form.password); navigate("/admin", { replace: true }); }
    catch (err) { setError(err.message); }
    finally { setBusy(false); }
  };
  return <div className="auth-screen admin-login-screen"><section className="auth-visual"><Link className="portal-brand inverse" to="/"><span>同窗</span>圈<i /></Link><div><span>AUTHORIZED STAFF ONLY</span><h1>校园运营<br />管理后台</h1><p>审核内容、处理举报并维护社区秩序。</p></div></section><section className="auth-panel"><div className="auth-box"><span className="portal-kicker">ADMIN CONSOLE</span><h2>管理员登录</h2><p>请使用已分配管理员角色的校园账号</p><form onSubmit={submit}><label>账号<input autoFocus required value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} placeholder="请输入账号" /></label><label>密码<input type="password" required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="请输入密码" /></label>{error && <div className="admin-error"><WarningCircle />{error}</div>}<button disabled={busy} className="portal-primary auth-submit" type="submit"><ShieldCheck />{busy ? "正在验证…" : "进入管理后台"}</button></form><div className="auth-links"><Link to="/">返回社区首页</Link><Link to="/login">普通用户登录</Link></div></div></section></div>;
}

const reviewKinds = { reviews: ["帖子", "posts", "post"], confesses: ["表白", "confesses", "confess"], activities: ["活动", "activities", "activity"] };

function AdminRows({ section, refreshOverview }) {
  const [rows, setRows] = useState([]); const [loading, setLoading] = useState(true); const [error, setError] = useState("");
  const [rejecting, setRejecting] = useState(null); const [reason, setReason] = useState(""); const [notice, setNotice] = useState(""); const [submitting, setSubmitting] = useState(false);
  const auditLock = useRef(false);
  const load = async () => {
    setLoading(true); setError("");
    try {
      const path = section === "users" ? "/admin/users?size=50" : section === "reports" ? "/admin/reports?size=50" : `/admin/audits/${reviewKinds[section][1]}?size=50`;
      const page = await api(path); setRows(page.records || []);
    } catch (err) { setError(err.message); if (/403|权限/.test(err.message)) authStore.clear(); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, [section]);
  const userStatus = async (row) => { const status = row.status === 1 ? 2 : 1; const reason = status === 2 ? (window.prompt("请输入封禁原因") || "后台封禁") : "解除封禁"; await api(`/admin/users/${row.id}/status?status=${status}&reason=${encodeURIComponent(reason)}`, { method: "POST" }); await load(); };
  const submitAudit = async (row, status, auditReason) => { if (auditLock.current) return; auditLock.current = true; setSubmitting(true); setError(""); try { const kind = reviewKinds[section][2]; await api(`/admin/audits/${kind}/${row.id}`, { method: "POST", body: JSON.stringify({ status, reason: auditReason }) }); setNotice(status === 1 ? "审核已通过" : "内容已驳回"); setRejecting(null); setReason(""); await load(); refreshOverview(); } catch (err) { setError(err.message); } finally { auditLock.current = false; setSubmitting(false); } };
  const audit = async (row, status) => { if (status === 2) { setRejecting(row); setReason(""); return; } await submitAudit(row, 1, "审核通过"); };
  const handleReport = async (row, status) => { const result = window.prompt("请输入处理结果", status === 2 ? "举报成立，已处理相关内容" : "举报不成立") || "已完成核查"; await api(`/admin/reports/${row.id}/handle`, { method: "POST", body: JSON.stringify({ status, result }) }); await load(); refreshOverview(); };
  if (loading) return <div className="admin-loading">正在加载管理数据…</div>;
  if (error) return <div className="admin-error panel"><WarningCircle />{error}<button onClick={load}>重试</button></div>;
  if (!rows.length) return <EmptyState icon={section === "users" ? Users : section === "reports" ? Flag : ClipboardText} title="当前没有待处理数据" text="新数据出现后会自动进入相应管理列表" />;
  return <>{notice && <div className="profile-success"><CheckCircle />{notice}</div>}<div className="admin-data-list">{rows.map((row) => <div className="admin-data-row" key={row.id}><div><strong>{row.nickname || row.username || row.title || row.description || `记录 #${row.id}`}</strong><span>{section === "users" ? `${row.username} · ${row.college || "学院未填写"}` : section === "reports" ? `举报人：${row.reporterName || row.reporterId} · 业务编号 ${row.bizId}` : row.content || row.location || `提交人编号 ${row.userId}`}</span></div><span className={`status-pill status-${row.status}`}>{section === "users" ? (row.status === 1 ? "正常" : "已封禁") : section === "reports" ? (["", "待处理", "成立", "不成立"][row.status] || "未知") : "待审核"}</span><time>{(row.createdAt || row.updatedAt || "").replace("T", " ").slice(0, 16) || "—"}</time><div className="admin-row-actions">{section === "users" ? <button onClick={() => userStatus(row)}>{row.status === 1 ? "封禁" : "解封"}</button> : section === "reports" ? <><button className="approve" onClick={() => handleReport(row, 2)}>成立</button><button onClick={() => handleReport(row, 3)}>驳回</button></> : <><button className="approve" disabled={submitting} onClick={() => audit(row, 1)}>通过</button><button disabled={submitting} onClick={() => audit(row, 2)}>驳回</button></>}</div></div>)}</div>{rejecting && <div className="admin-modal-backdrop" onMouseDown={() => setRejecting(null)}><form className="admin-reject-modal" onMouseDown={(event) => event.stopPropagation()} onSubmit={(event) => { event.preventDefault(); submitAudit(rejecting, 2, reason); }}><div><WarningCircle /><h3>驳回{reviewKinds[section][0]}</h3></div><p>驳回后内容不会公开展示，发布者可以在“我的内容”中查看原因。</p><label>驳回原因<textarea autoFocus required maxLength="255" value={reason} onChange={(event) => setReason(event.target.value)} placeholder="请填写明确的驳回原因" /></label><div className="editor-actions"><button type="button" className="portal-secondary" onClick={() => setRejecting(null)}>取消</button><button disabled={submitting || !reason.trim()} className="reject-confirm" type="submit">{submitting ? "处理中…" : "确认驳回"}</button></div></form></div>}</>;
}

function AdminSettings({ type }) {
  const [rows, setRows] = useState([]); const [loading, setLoading] = useState(true); const [error, setError] = useState("");
  const sensitive = type === "sensitive";
  const path = sensitive ? "/admin/sensitive-words" : "/admin/categories";
  const load = async () => { setLoading(true); try { setRows(await api(path)); setError(""); } catch (err) { setError(err.message); } finally { setLoading(false); } };
  useEffect(() => { load(); }, [type]);
  const create = async () => {
    const name = window.prompt(sensitive ? "请输入敏感词" : "请输入板块名称"); if (!name) return;
    const body = sensitive ? { word: name, level: 2, status: 1 } : { name, code: window.prompt("请输入英文板块编码（小写）", "new-section") || "new-section", description: "", sortNo: rows.length + 1, status: 1 };
    try { await api(path, { method: "POST", body: JSON.stringify(body) }); await load(); } catch (err) { setError(err.message); }
  };
  const toggle = async (row) => {
    const body = sensitive ? { word: row.word, level: row.level, status: row.status === 1 ? 0 : 1 } : { name: row.name, code: row.code, description: row.description || "", sortNo: row.sortNo, status: row.status === 1 ? 0 : 1 };
    await api(`${path}/${row.id}`, { method: "PUT", body: JSON.stringify(body) }); await load();
  };
  const remove = async (row) => { if (!window.confirm(`确认删除“${row.word}”吗？`)) return; await api(`${path}/${row.id}`, { method: "DELETE" }); await load(); };
  return <><div className="admin-toolbar"><button className="portal-primary" onClick={create}><Plus />{sensitive ? "新增敏感词" : "新增板块"}</button></div><div className="admin-table"><div className="admin-table-head"><span>{sensitive ? "敏感词" : "板块名称 / 编码"}</span><span>规则</span><span>状态</span><span>操作</span></div>{loading ? <div className="admin-loading">正在加载配置…</div> : error ? <div className="admin-error panel"><WarningCircle />{error}</div> : !rows.length ? <EmptyState title="暂无配置" text="点击右上角按钮添加第一条配置" /> : <div className="admin-data-list">{rows.map((row) => <div className="admin-data-row" key={row.id}><div><strong>{row.word || row.name}</strong><span>{sensitive ? (row.level === 2 ? "命中后拦截提交" : "命中后替换") : `${row.code} · ${row.description || "暂无描述"}`}</span></div><span>{sensitive ? `等级 ${row.level}` : `排序 ${row.sortNo}`}</span><span className={`status-pill status-${row.status === 1 ? 1 : 2}`}>{row.status === 1 ? "启用" : "停用"}</span><div className="admin-row-actions"><button onClick={() => toggle(row)}>{row.status === 1 ? "停用" : "启用"}</button>{sensitive && <button onClick={() => remove(row)}>删除</button>}</div></div>)}</div>}</div></>;
}

function AdminContent() {
  const [tab, setTab] = useState("news"); const [rows, setRows] = useState([]); const [loading, setLoading] = useState(true); const [error, setError] = useState(""); const [editing, setEditing] = useState(false); const [busy, setBusy] = useState(false); const [notice, setNotice] = useState("");
  const labels = { news: "校园新闻", notices: "系统公告", banners: "轮播图" };
  const localTime = (date) => new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
  const emptyForm = () => { const now = new Date(); return { title: "", summary: "", content: "", coverUrl: "", source: "校方", top: false, targetType: 0, imageUrl: "", linkUrl: "", sortNo: rows.length + 1, startAt: localTime(now), endAt: localTime(new Date(now.getTime() + 30 * 86400000)) }; };
  const [form, setForm] = useState(emptyForm);
  const load = async () => { setLoading(true); try { const data = await api(`/admin/${tab}?size=50`); setRows(data.records || data || []); setError(""); } catch (err) { setError(err.message); } finally { setLoading(false); } };
  useEffect(() => { load(); }, [tab]);
  const openCreate = () => { setForm(emptyForm()); setError(""); setEditing(true); };
  const create = async (event) => { event.preventDefault(); setBusy(true); setError(""); try { let body; if (tab === "news") body = { title: form.title, summary: form.summary, content: form.content, coverUrl: form.coverUrl, source: form.source, top: form.top }; else if (tab === "notices") body = { title: form.title, content: form.content, targetType: Number(form.targetType), top: form.top }; else body = { title: form.title, imageUrl: form.imageUrl, linkUrl: form.linkUrl, sortNo: Number(form.sortNo), startAt: form.startAt, endAt: form.endAt }; await api(`/admin/${tab}`, { method: "POST", body: JSON.stringify(body) }); setEditing(false); setNotice(`${labels[tab]}创建成功${tab === "banners" ? "" : "，请在列表中点击发布"}`); await load(); } catch (err) { setError(err.message); } finally { setBusy(false); } };
  const publish = async (row) => { try { await api(`/admin/${tab}/${row.id}/${row.status === 1 ? "unpublish" : "publish"}`, { method: "POST" }); setNotice(row.status === 1 ? "内容已下架" : "内容已发布"); await load(); } catch (err) { setError(err.message); } };
  const removeBanner = async (row) => { if (!window.confirm("确认删除该轮播图吗？")) return; await api(`/admin/banners/${row.id}`, { method: "DELETE" }); await load(); };
  const change = (key, value) => setForm({ ...form, [key]: value });
  return <><FilterBar tabs={Object.entries(labels).map(([, label]) => label)} active={labels[tab]} onChange={(label) => { setTab(Object.keys(labels).find((key) => labels[key] === label)); setNotice(""); }} search={false} extra={<button className="portal-primary" onClick={openCreate}><Plus />新建{labels[tab]}</button>} />{notice && <div className="profile-success"><CheckCircle />{notice}</div>}<div className="admin-table"><div className="admin-table-head"><span>标题</span><span>类型</span><span>状态</span><span>操作</span></div>{loading ? <div className="admin-loading">正在加载内容…</div> : error && !editing ? <div className="admin-error panel"><WarningCircle />{error}</div> : !rows.length ? <EmptyState title={`暂无${labels[tab]}`} text="点击新建按钮发布第一条内容" /> : <div className="admin-data-list">{rows.map((row) => <div className="admin-data-row" key={row.id}><div><strong>{row.title}</strong><span>{row.summary || row.content || row.imageUrl}</span></div><span>{labels[tab]}</span><span className={`status-pill status-${row.status === 1 ? 1 : 2}`}>{tab === "banners" ? "展示中" : row.status === 1 ? "已发布" : "草稿"}</span><div className="admin-row-actions">{tab === "banners" ? <button onClick={() => removeBanner(row)}>删除</button> : <button className="approve" onClick={() => publish(row)}>{row.status === 1 ? "下架" : "发布"}</button>}</div></div>)}</div>}</div>{editing && <div className="admin-modal-backdrop" onMouseDown={() => setEditing(false)}><form className="admin-content-modal" onMouseDown={(event) => event.stopPropagation()} onSubmit={create}><div className="admin-content-modal-head"><div><span>CONTENT EDITOR</span><h3>新建{labels[tab]}</h3></div><button type="button" onClick={() => setEditing(false)}><X /></button></div><label>标题<input autoFocus required maxLength={tab === "banners" ? 100 : 150} value={form.title} onChange={(e) => change("title", e.target.value)} /></label>{tab === "news" && <><label>摘要<textarea maxLength="500" value={form.summary} onChange={(e) => change("summary", e.target.value)} /></label><label>正文<textarea className="content-textarea" required value={form.content} onChange={(e) => change("content", e.target.value)} /></label><div className="field-grid"><label>来源<input maxLength="100" value={form.source} onChange={(e) => change("source", e.target.value)} /></label><label>封面地址<input maxLength="500" value={form.coverUrl} onChange={(e) => change("coverUrl", e.target.value)} placeholder="图片 URL（选填）" /></label></div></>}{tab === "notices" && <><label>公告正文<textarea className="content-textarea" required value={form.content} onChange={(e) => change("content", e.target.value)} /></label><label>通知范围<select value={form.targetType} onChange={(e) => change("targetType", e.target.value)}><option value="0">全部用户</option><option value="1">普通用户</option><option value="2">管理员</option></select></label></>}{tab === "banners" && <><label>图片地址<input required maxLength="500" value={form.imageUrl} onChange={(e) => change("imageUrl", e.target.value)} placeholder="请输入轮播图片 URL" /></label><label>跳转地址<input maxLength="500" value={form.linkUrl} onChange={(e) => change("linkUrl", e.target.value)} placeholder="选填" /></label><div className="field-grid"><label>开始展示<input required type="datetime-local" value={form.startAt} onChange={(e) => change("startAt", e.target.value)} /></label><label>结束展示<input required min={form.startAt} type="datetime-local" value={form.endAt} onChange={(e) => change("endAt", e.target.value)} /></label><label>排序<input type="number" value={form.sortNo} onChange={(e) => change("sortNo", e.target.value)} /></label></div></>}{tab !== "banners" && <label className="admin-check"><input type="checkbox" checked={form.top} onChange={(e) => change("top", e.target.checked)} />置顶显示</label>}{error && <div className="admin-error"><WarningCircle />{error}</div>}<div className="editor-actions"><button type="button" className="portal-secondary" onClick={() => setEditing(false)}>取消</button><button disabled={busy} className="portal-primary" type="submit"><Check />{busy ? "保存中…" : "保存内容"}</button></div></form></div>}</>;
}

export function AdminPage() {
  const { section = "overview" } = useParams();
  const navigate = useNavigate();
  const current = adminSections.find(([key]) => key === section) || adminSections[0];
  const logout = () => { authStore.clear(); navigate("/admin/login", { replace: true }); };
  const supported = ["users", "reviews", "confesses", "activities", "reports"].includes(section);
  return <PortalLayout title="管理员后台" eyebrow="ADMIN CONSOLE" wide><div className="admin-layout"><aside className="admin-sidebar"><div className="admin-mark"><ShieldCheck weight="fill" /><div><strong>运营工作台</strong><span>管理员权限</span></div></div>{adminSections.map(([key, label, Icon]) => <NavLink key={key} to={`/admin/${key}`} className={section === key ? "active" : ""}><Icon />{label}<CaretRight /></NavLink>)}</aside><section className="admin-content"><div className="admin-content-head"><div><span>ADMIN MODULE</span><h2>{current[1]}</h2></div><button className="portal-secondary" onClick={logout}><SignOut />退出后台</button></div>{section === "overview" ? <><StatStrip items={[["用户管理", "实时", Users], ["内容审核", "实时", ClipboardText], ["活动审核", "实时", CalendarBlank], ["举报处理", "实时", Flag]]} /><div className="admin-grid"><Link className="admin-chart" to="/admin/reviews"><ClipboardText weight="duotone" /><h3>内容审核</h3><p>审核待发布帖子与违规内容</p></Link><Link className="admin-chart" to="/admin/reports"><Flag weight="duotone" /><h3>举报处理</h3><p>核查用户举报并记录处理结果</p></Link></div></> : supported ? <div className="admin-table"><div className="admin-table-head"><span>名称 / 内容</span><span>状态</span><span>更新时间</span><span>操作</span></div><AdminRows section={section} refreshOverview={() => {}} /></div> : section === "content" ? <AdminContent /> : section === "categories" || section === "sensitive" ? <AdminSettings type={section} /> : <EmptyState icon={current[2]} title={`${current[1]}即将接入`} text="该模块正在建设中" />}</section></div></PortalLayout>;
}
