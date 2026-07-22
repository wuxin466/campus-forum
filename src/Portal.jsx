import { useEffect, useState } from "react";
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
  ["首页", "/"], ["论坛", "/forum"], ["表白墙", "/confess"], ["联谊活动", "/activities"], ["校园资讯", "/news"],
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
          <Link className="portal-icon-link" to="/messages" aria-label="消息"><Bell /><b /></Link>
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
  const submit = (event) => { event.preventDefault(); localStorage.setItem("campus-demo-auth", "true"); navigate(mode === "forgot" ? "/login" : "/"); };
  return <div className="auth-screen">
    <section className="auth-visual"><Link className="portal-brand inverse" to="/"><span>同窗</span>圈<i /></Link><div><span>VERIFIED CAMPUS ONLY</span><h1>真实校园<br />自在连接</h1><p>讨论、活动与朋友，都从可信身份开始。</p></div></section>
    <section className="auth-panel"><div className="auth-box"><span className="portal-kicker">ACCOUNT</span><h2>{copy[0]}</h2><p>{copy[1]}</p><form onSubmit={submit}>
      {mode === "register" && <label>姓名<input required placeholder="请输入真实姓名" /></label>}
      <label>校园邮箱<input type="email" required placeholder="name@university.edu.cn" /></label>
      {mode !== "forgot" && <label>密码<input type="password" required placeholder="请输入密码" /></label>}
      {mode === "forgot" && <div className="field-row"><label>验证码<input required placeholder="6 位验证码" /></label><button type="button" className="code-button">获取验证码</button></div>}
      {mode === "register" && <label>学院<select><option>请选择学院</option></select></label>}
      <button className="portal-primary auth-submit" type="submit">{copy[2]}<CaretRight /></button>
    </form><div className="auth-links">{mode !== "login" && <Link to="/login">返回登录</Link>}{mode === "login" && <><Link to="/register">注册账号</Link><Link to="/forgot-password">忘记密码</Link></>}</div></div></section>
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
  return <PortalLayout title="校园论坛" eyebrow="CAMPUS FORUM" action={<Link className="portal-primary" to="/forum/new"><PencilSimple />发布帖子</Link>}><div className="portal-category-row">{["全部板块", "学习交流", "校园生活", "闲置交易", "问答互助"].map((item) => <button key={item}><Tag />{item}</button>)}</div><FilterBar tabs={["最新", "热门", "精华", "置顶"]} active={tab} onChange={setTab} /><div className="demo-list">{demoForumPosts.map((post) => <Link className="demo-row" to={`/forum/${post.id}`} key={post.id}><div className="demo-icon"><ChatCircle weight="duotone" /></div><div><span>{post.tag}</span><h3>{post.title}</h3><p>{post.summary}</p><small>{post.author} · {post.stats}</small></div><CaretRight /></Link>)}</div></PortalLayout>;
}

export function ForumDetailPage() {
  const { id } = useParams();
  const [liked, setLiked] = useState(false);
  const post = demoForumPosts.find((item) => item.id === id) || demoForumPosts[0];
  return <PortalLayout title="帖子详情" eyebrow={`POST · ${id}`}><article className="detail-paper"><Link className="back-link" to="/forum"><ArrowLeft />返回论坛</Link><div className="detail-author"><img src="/assets/avatar-zhouyu.jpg" alt="作者头像" /><div><strong>{post.author}</strong><span>{post.tag} · 刚刚更新</span></div><button className="portal-secondary"><UserPlus />关注</button></div><h2>{post.title}</h2><div className="demo-detail-body"><p>{post.summary}</p><p>这里是一段用于验证详情页排版与交互的测试内容。接入后端后，可直接替换为接口返回的富文本正文。</p></div><div className="detail-actions"><button className={liked ? "active" : ""} onClick={() => setLiked(!liked)}><Heart weight={liked ? "fill" : "regular"} />{liked ? "已点赞" : "点赞"}</button><button><BookmarkSimple />收藏</button><button><Flag />举报</button><span><Eye />测试浏览量</span></div></article><section className="comment-panel"><h2>评论与回复</h2><textarea placeholder="写下你的评论…" /><button className="portal-primary"><PaperPlaneTilt />发表评论</button><EmptyState icon={ChatCircle} title="暂无评论" text="成为第一个参与讨论的人" /></section></PortalLayout>;
}

export function ConfessPage() {
  const [tab, setTab] = useState("时间排序");
  return <PortalLayout title="表白墙" eyebrow="CONFESSION WALL" action={<Link className="portal-primary" to="/confess/new"><Heart />发布表白</Link>}><div className="confess-intro"><div><ShieldCheck weight="duotone" /><h2>勇敢表达，也尊重每一份心意</h2><p>支持匿名发布；请勿透露他人隐私信息。</p></div><Link to="/me">查看我的表白<CaretRight /></Link></div><FilterBar tabs={["时间排序", "热度排序", "我的关注"]} active={tab} onChange={setTab} /><div className="demo-card-grid">{demoConfessions.map((item) => <Link to={`/confess/${item.id}`} className="confess-demo-card" key={item.id}><span><UserCircle />匿名表白 · {item.time}</span><h3>{item.title}</h3><p>{item.body}</p><div><Heart />点赞 <ChatCircle />评论 <CaretRight /></div></Link>)}</div></PortalLayout>;
}

export function ConfessDetailPage() {
  const { id } = useParams();
  const confession = demoConfessions.find((item) => item.id === id) || demoConfessions[0];
  return <PortalLayout title="表白详情" eyebrow={`CONFESSION · ${id}`}><article className="detail-paper confess-paper"><Link className="back-link" to="/confess"><ArrowLeft />返回表白墙</Link><span className="anonymous-label"><UserCircle />匿名同学 · {confession.time}</span><h2>{confession.title}</h2><div className="demo-detail-body"><p>{confession.body}</p><p>这是一条用于验证点赞、评论和举报入口的虚拟表白数据。</p></div><div className="detail-actions"><button><Heart />点赞</button><button><ChatCircle />评论</button><button><Flag />举报</button></div></article><section className="comment-panel"><h2>评论</h2><textarea placeholder="友善地表达你的想法…" /><button className="portal-primary"><PaperPlaneTilt />发送评论</button><EmptyState icon={ChatCircle} title="暂无评论" text="评论内容将在这里显示" /></section></PortalLayout>;
}

export function ActivityPage() {
  const [tab, setTab] = useState("全部活动");
  return <PortalLayout title="联谊活动" eyebrow="CAMPUS EVENTS" action={<Link className="portal-primary" to="/activities/new"><Plus />创建活动</Link>}><StatStrip items={[["可报名活动", "3", CalendarBlank], ["我的报名", "0", CheckCircle], ["待签到", "0", MapPin]]} /><FilterBar tabs={["全部活动", "文娱", "交友", "竞赛", "我的报名"]} active={tab} onChange={setTab} extra={<button className="portal-secondary"><SlidersHorizontal />筛选</button>} /><div className="demo-card-grid">{demoActivities.map((item) => <Link className="activity-demo-card" to={`/activities/${item.id}`} key={item.id}><div><span>{item.category}</span><CalendarBlank weight="duotone" /></div><h3>{item.title}</h3><p><Clock />{item.date}</p><p><MapPin />{item.place}</p><small>{item.capacity}</small><span className="activity-card-link">查看详情<CaretRight /></span></Link>)}</div></PortalLayout>;
}

export function ActivityDetailPage() {
  const { id } = useParams();
  const [joined, setJoined] = useState(false);
  const activity = demoActivities.find((item) => item.id === id) || demoActivities[0];
  return <PortalLayout title="活动详情" eyebrow={`EVENT · ${id}`}><div className="activity-detail"><section className="activity-poster"><CalendarBlank weight="duotone" /><strong>{activity.title}</strong><span>测试活动海报区域</span></section><section className="activity-info"><Link className="back-link" to="/activities"><ArrowLeft />返回活动列表</Link><span className="status-tag">报名中</span><h2>{activity.title}</h2><dl><div><dt><CalendarBlank />时间</dt><dd>{activity.date}</dd></div><div><dt><MapPin />地点</dt><dd>{activity.place}</dd></div><div><dt><UsersThree />参与情况</dt><dd>{activity.capacity}</dd></div></dl><button className={joined ? "portal-secondary block" : "portal-primary block"} onClick={() => setJoined(!joined)}>{joined ? <><X />取消报名</> : <><Check />立即报名</>}</button><span className="text-link">报名名单待接口接入</span></section></div><section className="detail-section"><h2>活动介绍</h2><div className="demo-detail-body"><p>这是用于验证活动详情、报名与取消报名状态的虚拟活动。</p><p>正式接入接口后，可显示主办方、人数上限、签到码与注意事项。</p></div></section></PortalLayout>;
}

export function NewsPage() {
  const [tab, setTab] = useState("校园新闻");
  return <PortalLayout title="校园资讯" eyebrow="CAMPUS NEWS"><FilterBar tabs={["校园新闻", "媒体聚焦", "院系动态"]} active={tab} onChange={setTab} extra={<Link className="portal-secondary" to="/notices"><Megaphone />系统公告</Link>} /><div className="news-layout"><section className="news-feature"><Image weight="duotone" /><div><span>FEATURED STORY</span><h2>头条新闻区域</h2><p>新闻摘要将在接口接入后显示。</p></div></section><section><EmptyState icon={FileText} title="暂无新闻" text="图文资讯列表与分页将在这里显示" /></section></div></PortalLayout>;
}

export function NoticePage() {
  return <PortalLayout title="系统公告" eyebrow="OFFICIAL NOTICE"><div className="notice-banner"><Megaphone weight="duotone" /><div><h2>重要通知统一发布</h2><p>支持全局弹窗、置顶和已读状态。</p></div></div><FilterBar tabs={["全部", "重要", "已读"]} active="全部" onChange={() => {}} /><EmptyState icon={ClipboardText} title="暂无系统公告" text="公告列表将在接入接口后显示" /></PortalLayout>;
}

export function NewsDetailPage({ type }) {
  const { id } = useParams();
  const isNotice = type === "notice";
  return <PortalLayout title={isNotice ? "公告详情" : "新闻详情"} eyebrow={`${isNotice ? "NOTICE" : "NEWS"} · ${id}`}><article className="article-reader"><Link className="back-link" to={isNotice ? "/notices" : "/news"}><ArrowLeft />返回列表</Link><span>{isNotice ? "官方公告" : "校园新闻"}</span><h2>标题将在这里显示</h2><p className="article-meta">发布时间 · 来源 · 浏览量</p><div className="article-cover"><Image weight="duotone" /><span>{isNotice ? "公告封面（可选）" : "新闻封面"}</span></div><div className="article-body">正文内容区域将在接入详情接口后渲染。</div></article></PortalLayout>;
}

export function EditorPage({ type }) {
  const navigate = useNavigate();
  const config = {
    forum: ["发布帖子", "帖子标题", "选择论坛板块", "写下帖子正文…"],
    confess: ["发布表白", "想对谁说", "匿名发布", "写下想说的话…"],
    activity: ["创建活动", "活动名称", "活动分类", "填写活动介绍…"],
  }[type];
  const [anonymous, setAnonymous] = useState(type === "confess");
  const categoryOptions = type === "forum" ? ["学习交流", "校园生活", "闲置交易", "问答互助"] : ["文娱活动", "交友联谊", "竞赛实践"];
  return <PortalLayout title={config[0]} eyebrow="CONTENT EDITOR"><form className="editor-form" onSubmit={(event) => { event.preventDefault(); navigate(type === "forum" ? "/forum" : type === "confess" ? "/confess" : "/activities"); }}><label>{config[1]}<input required placeholder={`请输入${config[1]}`} /></label><label>{config[2]}{type === "confess" ? <button type="button" className={`switch ${anonymous ? "on" : ""}`} onClick={() => setAnonymous(!anonymous)}><i />{anonymous ? "已开启" : "已关闭"}</button> : <select required defaultValue=""><option value="" disabled>请选择</option>{categoryOptions.map((item) => <option key={item} value={item}>{item}</option>)}</select>}</label>{type === "activity" && <div className="field-grid"><label>活动时间<input type="datetime-local" required /></label><label>报名人数上限<input type="number" min="1" /></label><label>活动地点<input placeholder="输入校内地点" /></label><label>报名截止时间<input type="datetime-local" /></label></div>}<label>内容<textarea required placeholder={config[3]} /></label><div className="upload-zone"><Image weight="duotone" /><strong>上传图片</strong><span>支持拖拽或点击选择</span></div><div className="editor-actions"><button type="button" className="portal-secondary" onClick={() => navigate(-1)}>取消</button><button className="portal-primary" type="submit"><PaperPlaneTilt />提交发布</button></div></form></PortalLayout>;
}

export function UserSpacePage() {
  const { id } = useParams();
  const [followed, setFollowed] = useState(false);
  return <PortalLayout title="用户主页" eyebrow={`USER · ${id}`}><section className="user-hero"><img src="/assets/avatar-zhouyu.jpg" alt="用户头像" /><div><span><ShieldCheck weight="fill" />校内认证</span><h2>用户昵称</h2><p>个人简介、学院、年级等资料将在这里显示。</p></div><div><button className={followed ? "portal-secondary" : "portal-primary"} onClick={() => setFollowed(!followed)}>{followed ? <Check /> : <UserPlus />}{followed ? "已关注" : "关注"}</button><Link className="portal-secondary" to={`/messages/${id}`}><ChatCircle />私信</Link></div></section><StatStrip items={[["帖子", "—", FileText], ["关注", "—", UserPlus], ["好友", "—", Users]]} /><FilterBar tabs={["主页", "发帖记录", "收藏"]} active="主页" onChange={() => {}} search={false} /><EmptyState icon={FileText} title="暂无公开动态" text="该用户公开内容将在接入接口后显示" /></PortalLayout>;
}

export function FriendPage({ tab: defaultTab = "friends" }) {
  const [tab, setTab] = useState(defaultTab === "requests" ? "好友申请" : "好友列表");
  return <PortalLayout title="好友" eyebrow="SOCIAL CONNECTIONS" action={<button className="portal-primary"><UserPlus />添加好友</button>}><FilterBar tabs={["好友列表", "好友申请", "黑名单"]} active={tab} onChange={setTab} /><EmptyState icon={tab === "好友申请" ? UserPlus : Users} title={tab === "好友申请" ? "暂无好友申请" : tab === "黑名单" ? "黑名单为空" : "好友列表为空"} text="好友关系数据将在接入接口后显示" /></PortalLayout>;
}

export function MessagePage({ conversation = false }) {
  const { id } = useParams();
  return <PortalLayout title="消息中心" eyebrow="MESSAGES" wide><div className="message-shell"><aside className="message-list"><div className="message-list-head"><h2>私信</h2><button><Plus /></button></div><label><MagnifyingGlass /><input placeholder="搜索联系人" /></label><EmptyState icon={ChatCircle} title="暂无会话" text="新消息会显示在这里" /></aside><section className="conversation">{conversation ? <><div className="conversation-head"><Link to="/messages"><ArrowLeft /></Link><img src="/assets/avatar-zhouyu.jpg" alt="联系人头像" /><div><strong>联系人</strong><span>校内认证用户 · {id}</span></div></div><div className="conversation-body"><EmptyState icon={ChatCircle} title="开始一段对话" text="文本与图片消息将在这里显示" /></div><div className="message-composer"><button><Image /></button><input placeholder="输入消息…" /><button className="send-button"><PaperPlaneTilt weight="fill" /></button></div></> : <EmptyState icon={EnvelopeSimple} title="选择一条会话" text="从左侧会话列表开始聊天" />}</section></div></PortalLayout>;
}

export function PersonalCenterPage() {
  const [tab, setTab] = useState("个人资料");
  const navigate = useNavigate();
  const logout = () => { localStorage.setItem("campus-demo-auth", "false"); navigate("/login", { replace: true }); };
  return <PortalLayout title="个人中心" eyebrow="MY SPACE" action={<button className="portal-secondary" onClick={logout}><SignOut />退出登录</button>}><section className="profile-editor"><div className="profile-avatar-wrap"><img src="/assets/avatar-linxia.jpg" alt="我的头像" /><button><PencilSimple /></button></div><div><h2>林同学</h2><p><ShieldCheck weight="fill" />校内身份已认证</p></div><Link className="portal-secondary" to="/users/me">查看公开主页</Link></section><FilterBar tabs={["个人资料", "我的表白", "我的帖子", "我的评论", "我的收藏", "我的报名", "消息通知"]} active={tab} onChange={setTab} search={false} />{tab === "个人资料" ? <form className="profile-form"><div className="field-grid"><label>昵称<input placeholder="请输入昵称" /></label><label>性别<select><option>请选择</option></select></label><label>年级<select><option>请选择</option></select></label><label>学院<select><option>请选择</option></select></label></div><label>个人简介<textarea placeholder="介绍一下自己…" /></label><button type="button" className="portal-primary"><Check />保存资料</button></form> : <EmptyState icon={BookmarkSimple} title={`${tab}暂无内容`} text="相关数据将在接入接口后显示" />}</PortalLayout>;
}

const adminSections = [
  ["overview", "数据概览", ChartBar], ["users", "用户管理", Users], ["reviews", "内容审核", ClipboardText], ["activities", "活动审核", CalendarBlank], ["content", "内容管理", FileText], ["categories", "板块管理", ListBullets], ["reports", "举报管理", Flag], ["sensitive", "敏感词配置", WarningCircle],
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

const reviewKinds = { reviews: ["帖子", "posts", "post"], activities: ["活动", "activities", "activity"] };

function AdminRows({ section, refreshOverview }) {
  const [rows, setRows] = useState([]); const [loading, setLoading] = useState(true); const [error, setError] = useState("");
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
  const audit = async (row, status) => { const kind = reviewKinds[section][2]; const reason = status === 2 ? (window.prompt("请输入驳回原因") || "内容不符合社区规范") : "审核通过"; await api(`/admin/audits/${kind}/${row.id}`, { method: "POST", body: JSON.stringify({ status, reason }) }); await load(); refreshOverview(); };
  const handleReport = async (row, status) => { const result = window.prompt("请输入处理结果", status === 2 ? "举报成立，已处理相关内容" : "举报不成立") || "已完成核查"; await api(`/admin/reports/${row.id}/handle`, { method: "POST", body: JSON.stringify({ status, result }) }); await load(); refreshOverview(); };
  if (loading) return <div className="admin-loading">正在加载管理数据…</div>;
  if (error) return <div className="admin-error panel"><WarningCircle />{error}<button onClick={load}>重试</button></div>;
  if (!rows.length) return <EmptyState icon={section === "users" ? Users : section === "reports" ? Flag : ClipboardText} title="当前没有待处理数据" text="新数据出现后会自动进入相应管理列表" />;
  return <div className="admin-data-list">{rows.map((row) => <div className="admin-data-row" key={row.id}><div><strong>{row.nickname || row.username || row.title || row.description || `记录 #${row.id}`}</strong><span>{section === "users" ? `${row.username} · ${row.college || "学院未填写"}` : section === "reports" ? `举报人：${row.reporterName || row.reporterId} · 业务编号 ${row.bizId}` : row.content || row.location || `提交人编号 ${row.userId}`}</span></div><span className={`status-pill status-${row.status}`}>{section === "users" ? (row.status === 1 ? "正常" : "已封禁") : section === "reports" ? (["", "待处理", "成立", "不成立"][row.status] || "未知") : "待审核"}</span><time>{(row.createdAt || row.updatedAt || "").replace("T", " ").slice(0, 16) || "—"}</time><div className="admin-row-actions">{section === "users" ? <button onClick={() => userStatus(row)}>{row.status === 1 ? "封禁" : "解封"}</button> : section === "reports" ? <><button className="approve" onClick={() => handleReport(row, 2)}>成立</button><button onClick={() => handleReport(row, 3)}>驳回</button></> : <><button className="approve" onClick={() => audit(row, 1)}>通过</button><button onClick={() => audit(row, 2)}>驳回</button></>}</div></div>)}</div>;
}

export function AdminPage() {
  const { section = "overview" } = useParams();
  const navigate = useNavigate();
  const current = adminSections.find(([key]) => key === section) || adminSections[0];
  const logout = () => { authStore.clear(); navigate("/admin/login", { replace: true }); };
  const supported = ["users", "reviews", "activities", "reports"].includes(section);
  return <PortalLayout title="管理员后台" eyebrow="ADMIN CONSOLE" wide><div className="admin-layout"><aside className="admin-sidebar"><div className="admin-mark"><ShieldCheck weight="fill" /><div><strong>运营工作台</strong><span>管理员权限</span></div></div>{adminSections.map(([key, label, Icon]) => <NavLink key={key} to={`/admin/${key}`} className={section === key ? "active" : ""}><Icon />{label}<CaretRight /></NavLink>)}</aside><section className="admin-content"><div className="admin-content-head"><div><span>ADMIN MODULE</span><h2>{current[1]}</h2></div><button className="portal-secondary" onClick={logout}><SignOut />退出后台</button></div>{section === "overview" ? <><StatStrip items={[["用户管理", "实时", Users], ["内容审核", "实时", ClipboardText], ["活动审核", "实时", CalendarBlank], ["举报处理", "实时", Flag]]} /><div className="admin-grid"><Link className="admin-chart" to="/admin/reviews"><ClipboardText weight="duotone" /><h3>内容审核</h3><p>审核待发布帖子与违规内容</p></Link><Link className="admin-chart" to="/admin/reports"><Flag weight="duotone" /><h3>举报处理</h3><p>核查用户举报并记录处理结果</p></Link></div></> : supported ? <><div className="admin-table"><div className="admin-table-head"><span>名称 / 内容</span><span>状态</span><span>更新时间</span><span>操作</span></div><AdminRows section={section} refreshOverview={() => {}} /></div></> : <EmptyState icon={current[2]} title={`${current[1]}即将接入`} text="当前版本已优先完成用户、审核与举报管理" />}</section></div></PortalLayout>;
}
