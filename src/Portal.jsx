import { useEffect, useRef, useState } from "react";
import {
  Link,
  NavLink,
  useLocation,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";
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
  Newspaper,
  PaperPlaneTilt,
  PencilSimple,
  Plus,
  ShieldCheck,
  SignOut,
  SlidersHorizontal,
  Tag,
  Trash,
  UserCircle,
  UserPlus,
  Users,
  UsersThree,
  WarningCircle,
  X,
} from "@phosphor-icons/react";
import "./portal.css";
import { adminLogin, api, authStore, publicFileUrl } from "./api.js";

const navItems = [
  ["首页", "/"],
  ["论坛", "/forum"],
  ["表白墙", "/confess"],
  ["联谊活动", "/activities"],
  ["校园资讯", "/news"],
  ["好友", "/friends"],
  ["私信", "/messages"],
  ["校园认证", "/verification"],
];

const demoForumPosts = [
  {
    id: "1",
    title: "期末复习自习室座位攻略",
    summary: "整理了图书馆与教学楼开放时间，欢迎继续补充。",
    tag: "学习交流",
    author: "学习委员",
    stats: "128 赞 · 36 评论",
  },
  {
    id: "2",
    title: "西区食堂新品麻辣香锅测评",
    summary: "从价格、分量和口味三个方面做了一次简单体验。",
    tag: "校园生活",
    author: "校园吃货社",
    stats: "96 赞 · 24 评论",
  },
  {
    id: "3",
    title: "大学生想做的小生意有哪些？",
    summary: "想利用课余时间尝试一个低成本项目，征集建议。",
    tag: "问答互助",
    author: "创业实践部",
    stats: "75 赞 · 41 评论",
  },
];

const demoActivities = [
  {
    id: "1",
    title: "夏日草坪音乐节",
    date: "07 月 25 日 · 18:30",
    place: "北区大草坪",
    category: "文娱",
    capacity: "325 人感兴趣",
  },
  {
    id: "2",
    title: "校园二手市集",
    date: "07 月 26 日 · 10:00",
    place: "南区广场",
    category: "交友",
    capacity: "276 人感兴趣",
  },
  {
    id: "3",
    title: "考研经验分享会",
    date: "07 月 28 日 · 19:00",
    place: "教学楼 A101",
    category: "竞赛",
    capacity: "168 人感兴趣",
  },
];

const demoConfessions = [
  {
    id: "1",
    title: "想对图书馆三楼常遇见的你说",
    body: "谢谢你那天帮我捡起散落的资料，希望还有机会正式认识。",
    time: "2 小时前",
  },
  {
    id: "2",
    title: "毕业前，想认真感谢我的室友们",
    body: "四年的日常看似普通，现在回头看却都是很珍贵的记忆。",
    time: "昨天 21:40",
  },
];

function PortalLayout({
  children,
  title,
  eyebrow = "CAMPUS COMMUNITY",
  action,
  wide = false,
}) {
  const navigate = useNavigate();
  const isAdmin = authStore.isAdmin();
  const [keyword, setKeyword] = useState("");
  const [headerUser, setHeaderUser] = useState(null);
  useEffect(() => {
    if (!authStore.access()) return undefined;
    let active = true;
    api("/users/me")
      .then((user) => {
        if (active) setHeaderUser(user);
      })
      .catch(() => {});
    const syncProfile = (event) => setHeaderUser(event.detail);
    window.addEventListener("campus:profile-updated", syncProfile);
    return () => {
      active = false;
      window.removeEventListener("campus:profile-updated", syncProfile);
    };
  }, []);
  const submitSearch = (event) => {
    event.preventDefault();
    navigate(`/search?q=${encodeURIComponent(keyword)}`);
  };
  return (
    <div className="portal-shell">
      <header className="portal-header">
        <div className="portal-header-inner">
          <Link className="portal-brand" to="/">
            <span>同窗</span>圈<i />
          </Link>
          <nav className="portal-nav">
            {navItems.map(([label, path]) => (
              <NavLink
                key={path}
                to={path}
                className={({ isActive }) => (isActive ? "active" : "")}
              >
                {label}
              </NavLink>
            ))}
          </nav>
          <form className="portal-search" onSubmit={submitSearch}>
            <MagnifyingGlass />
            <input
              value={keyword}
              onChange={(event) => setKeyword(event.target.value)}
              placeholder="搜索校园内容"
            />
          </form>
          <Link
            className="portal-icon-link"
            to="/messages"
            aria-label="私信消息"
          >
            <Bell />
            <span>私信</span>
            <b />
          </Link>
          <Link
            className="portal-admin-link"
            to={isAdmin ? "/admin" : "/admin/login"}
          >
            <ShieldCheck />
            {isAdmin ? "管理后台" : "管理员登录"}
          </Link>
          <Link className="portal-profile-link" to="/me">
            <img
              src={headerUser?.avatarUrl || "/assets/avatar-linxia.jpg"}
              alt="个人头像"
            />
            <span>个人中心</span>
          </Link>
        </div>
      </header>
      <main className={wide ? "portal-main portal-main-wide" : "portal-main"}>
        <div className="portal-page-title">
          <div>
            <span>{eyebrow}</span>
            <h1>{title}</h1>
          </div>
          {action}
        </div>
        {children}
      </main>
    </div>
  );
}

function EmptyState({
  icon: Icon = FileText,
  title = "暂无内容",
  text = "内容将在接入接口后显示",
  action,
  onAction,
}) {
  return (
    <div className="portal-empty">
      <Icon weight="duotone" />
      <h3>{title}</h3>
      <p>{text}</p>
      {action && (
        <button className="portal-primary" onClick={onAction}>
          <Plus />
          {action}
        </button>
      )}
    </div>
  );
}

function FilterBar({ tabs, active, onChange, search = true, extra }) {
  return (
    <div className="portal-filterbar">
      <div className="portal-tabs">
        {tabs.map((tab) => (
          <button
            key={tab}
            className={active === tab ? "active" : ""}
            onClick={() => onChange(tab)}
          >
            {tab}
          </button>
        ))}
      </div>
      {search && (
        <label>
          <MagnifyingGlass />
          <input placeholder="筛选当前内容" />
        </label>
      )}
      {extra}
    </div>
  );
}

function StatStrip({ items }) {
  return (
    <div className="portal-stat-strip">
      {items.map(([label, value, Icon]) => (
        <div key={label}>
          <Icon />
          <span>{label}</span>
          <strong>{value}</strong>
        </div>
      ))}
    </div>
  );
}

function Pagination({ page, pages, onChange }) {
  if (!pages || pages <= 1) return null;
  return (
    <nav className="portal-pagination" aria-label="分页">
      <button disabled={page <= 1} onClick={() => onChange(page - 1)}>
        上一页
      </button>
      <span>
        第 {page} / {pages} 页
      </span>
      <button disabled={page >= pages} onClick={() => onChange(page + 1)}>
        下一页
      </button>
    </nav>
  );
}

export function AuthPage({ mode }) {
  const navigate = useNavigate();
  const copy = {
    login: ["欢迎回来", "使用校园账号继续", "登录"],
    register: ["加入同窗圈", "完成校内身份认证", "创建账号"],
    forgot: ["找回密码", "通过邮箱验证码重置", "发送验证码"],
  }[mode];
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    nickname: "",
    college: "",
    grade: "",
    code: "",
    newPassword: "",
  });
  const [resetStep, setResetStep] = useState(1);
  const [hint, setHint] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const field = (key) => ({
    value: form[key],
    onChange: (event) => setForm({ ...form, [key]: event.target.value }),
  });
  const submit = async (event) => {
    event.preventDefault();
    setError("");
    setBusy(true);
    try {
      if (mode === "forgot") {
        if (resetStep === 1) {
          const result = await api(
            "/auth/forgot-password",
            { method: "POST", body: JSON.stringify({ email: form.email }) },
            false,
          );
          setHint(
            result.developmentCode
              ? `${result.message}：${result.developmentCode}`
              : result.message,
          );
          setResetStep(2);
          return;
        }
        await api(
          "/auth/reset-password",
          {
            method: "POST",
            body: JSON.stringify({
              email: form.email,
              code: form.code,
              newPassword: form.newPassword,
            }),
          },
          false,
        );
        setHint("密码重置成功，请使用新密码登录");
        setTimeout(() => navigate("/login", { replace: true }), 800);
        return;
      }
      if (mode === "register") {
        await api("/auth/register", {
          method: "POST",
          body: JSON.stringify(form),
        });
      }
      const tokens = await api(
        "/auth/login",
        {
          method: "POST",
          body: JSON.stringify({
            username: form.username,
            password: form.password,
          }),
        },
        false,
      );
      authStore.save(tokens);
      navigate("/", { replace: true });
    } catch (err) {
      authStore.clear();
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };
  return (
    <div className="auth-screen">
      <section className="auth-visual">
        <Link className="portal-brand inverse" to="/">
          <span>同窗</span>圈<i />
        </Link>
        <div>
          <span>VERIFIED CAMPUS ONLY</span>
          <h1>
            真实校园
            <br />
            自在连接
          </h1>
          <p>讨论、活动与朋友，都从可信身份开始。</p>
        </div>
      </section>
      <section className="auth-panel">
        <div className="auth-box">
          <span className="portal-kicker">ACCOUNT</span>
          <h2>{copy[0]}</h2>
          <p>{copy[1]}</p>
          <form onSubmit={submit}>
            {mode === "register" && (
              <label>
                昵称
                <input
                  required
                  maxLength="40"
                  {...field("nickname")}
                  placeholder="请输入昵称"
                />
              </label>
            )}
            {mode !== "forgot" && (
              <label>
                账号
                <input
                  required
                  minLength="4"
                  maxLength="50"
                  pattern="[A-Za-z0-9_]+"
                  {...field("username")}
                  placeholder="4-50 位字母、数字或下划线"
                />
              </label>
            )}
            {(mode === "register" || mode === "forgot") && (
              <label>
                邮箱
                <input
                  type="email"
                  required
                  maxLength="120"
                  {...field("email")}
                  placeholder="用于找回密码"
                  disabled={mode === "forgot" && resetStep === 2}
                />
              </label>
            )}
            {mode !== "forgot" && (
              <label>
                密码
                <input
                  type="password"
                  required
                  minLength="8"
                  maxLength="72"
                  {...field("password")}
                  placeholder="至少 8 位密码"
                />
              </label>
            )}
            {mode === "forgot" && resetStep === 2 && (
              <>
                <label>
                  验证码
                  <input
                    required
                    inputMode="numeric"
                    pattern="\d{6}"
                    maxLength="6"
                    {...field("code")}
                    placeholder="6 位验证码"
                  />
                </label>
                <label>
                  新密码
                  <input
                    type="password"
                    required
                    minLength="8"
                    maxLength="72"
                    {...field("newPassword")}
                    placeholder="至少 8 位密码"
                  />
                </label>
              </>
            )}
            {mode === "register" && (
              <>
                <label>
                  学院
                  <input
                    maxLength="100"
                    {...field("college")}
                    placeholder="请输入学院（选填）"
                  />
                </label>
                <label>
                  年级
                  <input
                    maxLength="20"
                    {...field("grade")}
                    placeholder="例如：2026级（选填）"
                  />
                </label>
              </>
            )}
            {error && (
              <div className="admin-error">
                <WarningCircle />
                {error}
              </div>
            )}
            {hint && (
              <div className="profile-success">
                <CheckCircle />
                {hint}
              </div>
            )}
            <button
              disabled={busy}
              className="portal-primary auth-submit"
              type="submit"
            >
              {busy
                ? "正在验证…"
                : mode === "forgot" && resetStep === 2
                  ? "重置密码"
                  : copy[2]}
              <CaretRight />
            </button>
          </form>
          <div className="auth-links">
            {mode !== "login" && <Link to="/login">返回登录</Link>}
            {mode === "login" && (
              <>
                <Link to="/register">注册账号</Link>
                <Link to="/admin/login">
                  <ShieldCheck />
                  管理员登录
                </Link>
                <Link to="/forgot-password">忘记密码</Link>
              </>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

export function SearchPage() {
  const [params] = useSearchParams();
  const q = params.get("q") || "";
  const [tab, setTab] = useState("全部");
  const [page, setPage] = useState(1);
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    if (!q.trim()) {
      setData({});
      return;
    }
    setLoading(true);
    setError("");
    api(
      `/public/search?keyword=${encodeURIComponent(q.trim())}&page=${page}&size=10`,
    )
      .then((result) => setData(result))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [q, page]);
  useEffect(() => {
    setPage(1);
  }, [q, tab]);
  const records = (key) => data[key]?.records || [];
  const results = [
    ...(tab === "全部" || tab === "帖子"
      ? records("posts").map((item) => ({
          id: `post-${item.id}`,
          type: "帖子",
          icon: ChatCircle,
          title: item.title,
          text: item.content,
          meta: `${item.categoryName || "论坛"} · ${item.author || "同学"}`,
          to: `/forum/${item.id}`,
        }))
      : []),
    ...(tab === "全部" || tab === "表白"
      ? records("confesses").map((item) => ({
          id: `confess-${item.id}`,
          type: "表白",
          icon: Heart,
          title: item.content?.slice(0, 36) || "表白",
          text: item.content,
          meta: `${item.author || "匿名同学"} · ${item.likes || 0} 赞`,
          to: `/confess/${item.id}`,
        }))
      : []),
    ...(tab === "全部" || tab === "活动"
      ? records("activities").map((item) => ({
          id: `activity-${item.id}`,
          type: "活动",
          icon: CalendarBlank,
          title: item.title,
          text: item.content || item.location,
          meta: `${item.categoryName || "活动"} · ${item.location || "地点待定"}`,
          to: `/activities/${item.id}`,
        }))
      : []),
    ...(tab === "全部" || tab === "用户"
      ? records("users").map((item) => ({
          id: `user-${item.id}`,
          type: "用户",
          icon: UserCircle,
          title: item.nickname,
          text:
            item.bio ||
            [item.college, item.grade].filter(Boolean).join(" · ") ||
            "校园用户",
          meta: item.verified ? "校内认证" : "普通用户",
          avatar: item.avatarUrl,
          to: `/users/${item.id}`,
        }))
      : []),
    ...(tab === "全部" || tab === "新闻"
      ? records("news").map((item) => ({
          id: `news-${item.id}`,
          type: "新闻",
          icon: Newspaper,
          title: item.title,
          text: item.summary,
          meta: `${item.source || "校园资讯"} · ${item.views || 0} 浏览`,
          to: `/news/${item.id}`,
        }))
      : []),
    ...(tab === "全部" || tab === "公告"
      ? records("notices").map((item) => ({
          id: `notice-${item.id}`,
          type: "公告",
          icon: Megaphone,
          title: item.title,
          text: item.content,
          meta: "系统公告",
          to: `/notices/${item.id}`,
        }))
      : []),
  ];
  const keys =
    tab === "全部"
      ? ["posts", "confesses", "activities", "users", "news", "notices"]
      : [
          {
            帖子: "posts",
            表白: "confesses",
            活动: "activities",
            用户: "users",
            新闻: "news",
            公告: "notices",
          }[tab],
        ];
  const total = keys.reduce((sum, key) => sum + (data[key]?.total || 0), 0);
  const pages = Math.max(0, ...keys.map((key) => data[key]?.pages || 0));
  return (
    <PortalLayout title={q ? `搜索“${q}”` : "全局搜索"} eyebrow="GLOBAL SEARCH">
      <FilterBar
        tabs={["全部", "帖子", "表白", "活动", "用户", "新闻", "公告"]}
        active={tab}
        onChange={setTab}
        search={false}
      />
      <StatStrip
        items={[
          ["匹配结果", String(total), MagnifyingGlass],
          ["帖子", String(data.posts?.total || 0), ChatCircle],
          ["新闻", String(data.news?.total || 0), Newspaper],
          ["公告", String(data.notices?.total || 0), Megaphone],
        ]}
      />
      {error ? (
        <div className="admin-error panel">
          <WarningCircle />
          {error}
        </div>
      ) : loading ? (
        <div className="admin-loading">正在搜索校园内容…</div>
      ) : !q.trim() ? (
        <EmptyState
          icon={MagnifyingGlass}
          title="输入关键词开始搜索"
          text="可以搜索帖子、表白、活动、用户、新闻和公告"
        />
      ) : results.length ? (
        <>
          <div className="search-result-list">
            {results.map((item) => (
              <Link className="search-result-row" to={item.to} key={item.id}>
                {item.avatar ? (
                  <img src={item.avatar} alt="用户头像" />
                ) : (
                  <div className="search-result-icon">
                    <item.icon weight="duotone" />
                  </div>
                )}
                <div>
                  <span>{item.type}</span>
                  <h3>{item.title}</h3>
                  <p>{item.text}</p>
                  <small>{item.meta}</small>
                </div>
                <CaretRight />
              </Link>
            ))}
          </div>
          <Pagination page={page} pages={pages} onChange={setPage} />
        </>
      ) : (
        <EmptyState
          icon={MagnifyingGlass}
          title="暂无搜索结果"
          text="换一个关键词试试，或检查内容是否已通过审核"
        />
      )}
    </PortalLayout>
  );
}

export function ForumPage() {
  const [tab, setTab] = useState("最新");
  const [categories, setCategories] = useState([]);
  const [categoryId, setCategoryId] = useState("");
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  useEffect(() => {
    api("/public/forum/categories")
      .then(setCategories)
      .catch((err) => setError(err.message));
  }, []);
  useEffect(() => {
    setLoading(true);
    const query = new URLSearchParams({
      page: String(page),
      size: "12",
      sort: tab === "热门" ? "hot" : "latest",
    });
    if (categoryId) query.set("categoryId", categoryId);
    api(`/public/forum/posts?${query}`)
      .then((data) => {
        setPosts(data.records || []);
        setPages(data.pages || 0);
        setError("");
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [tab, categoryId, page]);
  useEffect(() => {
    setPage(1);
  }, [tab, categoryId]);
  return (
    <PortalLayout
      title="校园论坛"
      eyebrow="CAMPUS FORUM"
      action={
        <Link className="portal-primary" to="/forum/new">
          <PencilSimple />
          发布帖子
        </Link>
      }
    >
      <div className="portal-category-row">
        <button
          className={!categoryId ? "active" : ""}
          onClick={() => setCategoryId("")}
        >
          <Tag />
          全部板块
        </button>
        {categories.map((item) => (
          <button
            className={String(item.id) === String(categoryId) ? "active" : ""}
            onClick={() => setCategoryId(String(item.id))}
            key={item.id}
          >
            <Tag />
            {item.name}
          </button>
        ))}
      </div>
      <FilterBar tabs={["最新", "热门"]} active={tab} onChange={setTab} />
      {error ? (
        <div className="admin-error panel">
          <WarningCircle />
          {error}
        </div>
      ) : loading ? (
        <div className="admin-loading">正在加载帖子…</div>
      ) : posts.length ? (
        <div className="demo-list">
          {posts.map((post) => (
            <Link className="demo-row" to={`/forum/${post.id}`} key={post.id}>
              <div className="demo-icon">
                <ChatCircle weight="duotone" />
              </div>
              <div>
                <span>
                  {post.categoryName}
                  {post.featured ? " · 精华" : ""}
                </span>
                <h3>{post.title}</h3>
                <p>{post.content}</p>
                <small>
                  {post.author} · {post.likes} 赞 · {post.comments} 评论 ·{" "}
                  {post.views} 浏览
                </small>
              </div>
              <CaretRight />
            </Link>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={ChatCircle}
          title="这个板块还没有帖子"
          text="发布第一篇帖子，开启校园讨论"
          action="发布帖子"
          onAction={() => (location.hash = "#/forum/new")}
        />
      )}
      <Pagination page={page} pages={pages} onChange={setPage} />
    </PortalLayout>
  );
}

function ReportModal({ target, onClose }) {
  const [reasonType, setReasonType] = useState("1");
  const [description, setDescription] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const submit = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      await api("/reports", {
        method: "POST",
        body: JSON.stringify({
          bizType: target.bizType,
          bizId: target.bizId,
          reasonType: Number(reasonType),
          description: description.trim(),
          evidenceUrls: [],
        }),
      });
      setDone(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };
  return (
    <div className="admin-modal-backdrop" onMouseDown={onClose}>
      <form
        className="report-modal"
        onMouseDown={(event) => event.stopPropagation()}
        onSubmit={submit}
      >
        <div className="report-modal-head">
          <div>
            <Flag />
            <h3>举报{target.label}</h3>
          </div>
          <button type="button" onClick={onClose}>
            <X />
          </button>
        </div>
        {done ? (
          <div className="report-success">
            <CheckCircle weight="fill" />
            <h3>举报已提交</h3>
            <p>管理员处理后会通过消息通知你。</p>
            <button className="portal-primary" type="button" onClick={onClose}>
              完成
            </button>
          </div>
        ) : (
          <>
            <label>
              举报原因
              <select
                value={reasonType}
                onChange={(event) => setReasonType(event.target.value)}
              >
                <option value="1">垃圾广告</option>
                <option value="2">辱骂或人身攻击</option>
                <option value="3">色情低俗内容</option>
                <option value="4">泄露他人隐私</option>
                <option value="5">虚假或误导信息</option>
                <option value="6">其他违规内容</option>
              </select>
            </label>
            <label>
              补充说明
              <textarea
                required
                maxLength="500"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="请描述具体问题，便于管理员核实"
              />
            </label>
            {error && (
              <div className="admin-error">
                <WarningCircle />
                {error}
              </div>
            )}
            <div className="editor-actions">
              <button
                className="portal-secondary"
                type="button"
                onClick={onClose}
              >
                取消
              </button>
              <button
                className="report-submit"
                disabled={busy || !description.trim()}
                type="submit"
              >
                <Flag />
                {busy ? "提交中…" : "提交举报"}
              </button>
            </div>
          </>
        )}
      </form>
    </div>
  );
}

function CommentList({ comments, onReply, onReport }) {
  const names = Object.fromEntries(
    comments.map((item) => [item.userId, item.nickname]),
  );
  return (
    <div className="comment-list">
      {comments.map((item) => (
        <div
          className={`comment-item ${item.parentId ? "comment-reply" : ""}`}
          key={item.id}
        >
          <img
            src={item.avatarUrl || "/assets/avatar-linxia.jpg"}
            alt="评论头像"
          />
          <div>
            <strong>
              {item.nickname}
              {item.replyUserId && (
                <span className="reply-to">
                  {" "}
                  回复 {names[item.replyUserId] || "一位同学"}
                </span>
              )}
            </strong>
            <p>{item.content}</p>
            <small>
              {(item.createdAt || "").replace("T", " ").slice(0, 16)}
            </small>
            <button
              className="comment-reply-button"
              onClick={() => onReply(item)}
            >
              回复
            </button>
            <button
              className="comment-report-button"
              onClick={() => onReport(item)}
            >
              <Flag />
              举报
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

export function ForumDetailPage() {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [content, setContent] = useState("");
  const [replyingTo, setReplyingTo] = useState(null);
  const [reporting, setReporting] = useState(null);
  const [error, setError] = useState("");
  const load = async () => {
    try {
      const [detail, commentPage] = await Promise.all([
        api(`/public/forum/posts/${id}`),
        api(`/public/forum/posts/${id}/comments`),
      ]);
      setPost(detail);
      setComments(commentPage.records || []);
      setError("");
    } catch (err) {
      setError(err.message);
    }
  };
  useEffect(() => {
    load();
  }, [id]);
  const toggle = async (kind) => {
    try {
      const value = await api(`/forum/posts/${id}/${kind}`, { method: "POST" });
      setPost({
        ...post,
        [kind === "like" ? "liked" : "collected"]: value,
        [kind === "like" ? "likes" : "collections"]:
          post[kind === "like" ? "likes" : "collections"] + (value ? 1 : -1),
      });
    } catch (err) {
      setError(err.message);
    }
  };
  const comment = async () => {
    if (!content.trim()) return;
    try {
      const item = await api(`/forum/posts/${id}/comments`, {
        method: "POST",
        body: JSON.stringify({ parentId: replyingTo?.id || null, content }),
      });
      setComments([...comments, item]);
      setContent("");
      setReplyingTo(null);
      setPost({ ...post, comments: post.comments + 1 });
    } catch (err) {
      setError(err.message);
    }
  };
  if (error && !post)
    return (
      <PortalLayout title="帖子详情">
        <div className="admin-error panel">
          <WarningCircle />
          {error}
        </div>
      </PortalLayout>
    );
  if (!post)
    return (
      <PortalLayout title="帖子详情">
        <div className="admin-loading">正在加载帖子…</div>
      </PortalLayout>
    );
  return (
    <PortalLayout title="帖子详情" eyebrow={`POST · ${id}`}>
      <article className="detail-paper">
        <Link className="back-link" to="/forum">
          <ArrowLeft />
          返回论坛
        </Link>
        <div className="detail-author">
          <img
            src={post.avatarUrl || "/assets/avatar-zhouyu.jpg"}
            alt="作者头像"
          />
          <div>
            <strong>{post.author}</strong>
            <span>
              {post.categoryName} ·{" "}
              {(post.createdAt || "").replace("T", " ").slice(0, 16)}
            </span>
          </div>
        </div>
        <h2>{post.title}</h2>
        <div className="demo-detail-body">
          <p>{post.content}</p>
          {post.imageUrls?.map((url) => (
            <img
              className="post-content-image"
              src={url}
              alt="帖子图片"
              key={url}
            />
          ))}
        </div>
        <div className="detail-actions">
          <button
            className={post.liked ? "active" : ""}
            onClick={() => toggle("like")}
          >
            <Heart weight={post.liked ? "fill" : "regular"} />
            {post.likes} 赞
          </button>
          <button
            className={post.collected ? "active" : ""}
            onClick={() => toggle("collection")}
          >
            <BookmarkSimple weight={post.collected ? "fill" : "regular"} />
            {post.collected ? "已收藏" : "收藏"}
          </button>
          <span>
            <Eye />
            {post.views} 浏览
          </span>
          <button
            className="report-entry"
            onClick={() =>
              setReporting({ bizType: 2, bizId: post.id, label: "帖子" })
            }
          >
            <Flag />
            举报
          </button>
        </div>
      </article>
      <section className="comment-panel">
        <h2>评论与回复（{post.comments}）</h2>
        {replyingTo && (
          <div className="replying-banner">
            <span>
              正在回复 <strong>{replyingTo.nickname}</strong>
            </span>
            <button onClick={() => setReplyingTo(null)}>取消回复</button>
          </div>
        )}
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={
            replyingTo ? `回复 ${replyingTo.nickname}…` : "写下你的评论…"
          }
        />
        <button className="portal-primary" onClick={comment}>
          <PaperPlaneTilt />
          {replyingTo ? "发送回复" : "发表评论"}
        </button>
        {error && (
          <div className="admin-error">
            <WarningCircle />
            {error}
          </div>
        )}
        {comments.length ? (
          <CommentList
            comments={comments}
            onReply={(item) => {
              setReplyingTo(item);
              setContent("");
            }}
            onReport={(item) =>
              setReporting({ bizType: 4, bizId: item.id, label: "评论" })
            }
          />
        ) : (
          <EmptyState
            icon={ChatCircle}
            title="暂无评论"
            text="成为第一个参与讨论的人"
          />
        )}
      </section>
      {reporting && (
        <ReportModal target={reporting} onClose={() => setReporting(null)} />
      )}
    </PortalLayout>
  );
}

export function ConfessPage() {
  const [tab, setTab] = useState("时间排序");
  const [params] = useSearchParams();
  const mine = params.get("mine") === "1";
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const load = () => {
    setLoading(true);
    api(mine ? `/confesses/mine?page=${page}&size=12` : `/public/confesses?page=${page}&size=12`)
      .then((data) => {
        let records = data.records || [];
        if (tab === "热度排序")
          records = [...records].sort((a, b) => b.likes - a.likes);
        setItems(records);
        setPages(data.pages || 0);
        setError("");
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };
  useEffect(() => {
    load();
  }, [mine, tab, page]);
  useEffect(() => { setPage(1); }, [mine, tab]);
  const remove = async (event, id) => {
    event.preventDefault();
    if (!window.confirm("确认删除这条表白吗？")) return;
    await api(`/confesses/${id}`, { method: "DELETE" });
    load();
  };
  return (
    <PortalLayout
      title={mine ? "我的表白" : "表白墙"}
      eyebrow="CONFESSION WALL"
      action={
        <Link className="portal-primary" to="/confess/new">
          <Heart />
          发布表白
        </Link>
      }
    >
      <div className="confess-intro">
        <div>
          <ShieldCheck weight="duotone" />
          <h2>勇敢表达，也尊重每一份心意</h2>
          <p>支持匿名发布；请勿透露他人隐私信息。</p>
        </div>
        <Link to={mine ? "/confess" : "/confess?mine=1"}>
          {mine ? "返回表白墙" : "查看我的表白"}
          <CaretRight />
        </Link>
      </div>
      <FilterBar
        tabs={["时间排序", "热度排序"]}
        active={tab}
        onChange={setTab}
      />
      {error ? (
        <div className="admin-error panel">
          <WarningCircle />
          {error}
        </div>
      ) : loading ? (
        <div className="admin-loading">正在加载表白…</div>
      ) : items.length ? (
        <div className="demo-card-grid">
          {items.map((item) => (
            <Link
              to={item.auditStatus === 1 ? `/confess/${item.id}` : "#"}
              className="confess-demo-card"
              key={item.id}
            >
              <span>
                <UserCircle />
                {item.author} ·{" "}
                {(item.createdAt || "").replace("T", " ").slice(0, 16)}
              </span>
              <h3>
                {item.content.slice(0, 28)}
                {item.content.length > 28 ? "…" : ""}
              </h3>
              <p>{item.content}</p>
              <div>
                <Heart />
                {item.likes} <ChatCircle />
                {item.comments}
                {mine && (
                  <>
                    <span
                      className={`status-pill status-${item.auditStatus === 1 ? 1 : 2}`}
                    >
                      {item.auditStatus === 0
                        ? "待审核"
                        : item.auditStatus === 1
                          ? "已通过"
                          : "未通过"}
                    </span>
                    <button
                      className="confess-delete"
                      onClick={(event) => remove(event, item.id)}
                    >
                      删除
                    </button>
                  </>
                )}
                <CaretRight />
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Heart}
          title={mine ? "你还没有发布表白" : "表白墙还没有内容"}
          text="勇敢说出想说的话"
        />
      )}
      <Pagination page={page} pages={pages} onChange={setPage} />
    </PortalLayout>
  );
}

export function ConfessDetailPage() {
  const { id } = useParams();
  const [confession, setConfession] = useState(null);
  const [comments, setComments] = useState([]);
  const [content, setContent] = useState("");
  const [replyingTo, setReplyingTo] = useState(null);
  const [reporting, setReporting] = useState(null);
  const [error, setError] = useState("");
  const load = async () => {
    try {
      const [detail, page] = await Promise.all([
        api(`/public/confesses/${id}`),
        api(`/public/confesses/${id}/comments`),
      ]);
      setConfession(detail);
      setComments(page.records || []);
      setError("");
    } catch (err) {
      setError(err.message);
    }
  };
  useEffect(() => {
    load();
  }, [id]);
  const like = async () => {
    try {
      const liked = await api(`/confesses/${id}/like`, { method: "POST" });
      setConfession({
        ...confession,
        liked,
        likes: confession.likes + (liked ? 1 : -1),
      });
    } catch (err) {
      setError(err.message);
    }
  };
  const comment = async () => {
    if (!content.trim()) return;
    try {
      const item = await api(`/confesses/${id}/comments`, {
        method: "POST",
        body: JSON.stringify({ parentId: replyingTo?.id || null, content }),
      });
      setComments([...comments, item]);
      setContent("");
      setReplyingTo(null);
      setConfession({ ...confession, comments: confession.comments + 1 });
    } catch (err) {
      setError(err.message);
    }
  };
  if (error && !confession)
    return (
      <PortalLayout title="表白详情">
        <div className="admin-error panel">
          <WarningCircle />
          {error}
        </div>
      </PortalLayout>
    );
  if (!confession)
    return (
      <PortalLayout title="表白详情">
        <div className="admin-loading">正在加载表白…</div>
      </PortalLayout>
    );
  return (
    <PortalLayout title="表白详情" eyebrow={`CONFESSION · ${id}`}>
      <article className="detail-paper confess-paper">
        <Link className="back-link" to="/confess">
          <ArrowLeft />
          返回表白墙
        </Link>
        <span className="anonymous-label">
          <UserCircle />
          {confession.author} ·{" "}
          {(confession.createdAt || "").replace("T", " ").slice(0, 16)}
        </span>
        <div className="demo-detail-body">
          <p>{confession.content}</p>
          {confession.imageUrls?.map((url) => (
            <img
              className="post-content-image"
              src={url}
              alt="表白图片"
              key={url}
            />
          ))}
        </div>
        <div className="detail-actions">
          <button className={confession.liked ? "active" : ""} onClick={like}>
            <Heart weight={confession.liked ? "fill" : "regular"} />
            {confession.likes} 赞
          </button>
          <span>
            <ChatCircle />
            {confession.comments} 评论
          </span>
          <button
            className="report-entry"
            onClick={() =>
              setReporting({ bizType: 3, bizId: confession.id, label: "表白" })
            }
          >
            <Flag />
            举报
          </button>
        </div>
      </article>
      <section className="comment-panel">
        <h2>评论与回复</h2>
        {replyingTo && (
          <div className="replying-banner">
            <span>
              正在回复 <strong>{replyingTo.nickname}</strong>
            </span>
            <button onClick={() => setReplyingTo(null)}>取消回复</button>
          </div>
        )}
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={
            replyingTo ? `回复 ${replyingTo.nickname}…` : "友善地表达你的想法…"
          }
        />
        <button className="portal-primary" onClick={comment}>
          <PaperPlaneTilt />
          {replyingTo ? "发送回复" : "发送评论"}
        </button>
        {error && (
          <div className="admin-error">
            <WarningCircle />
            {error}
          </div>
        )}
        {comments.length ? (
          <CommentList
            comments={comments}
            onReply={(item) => {
              setReplyingTo(item);
              setContent("");
            }}
            onReport={(item) =>
              setReporting({ bizType: 4, bizId: item.id, label: "评论" })
            }
          />
        ) : (
          <EmptyState
            icon={ChatCircle}
            title="暂无评论"
            text="成为第一个评论的人"
          />
        )}
      </section>
      {reporting && (
        <ReportModal target={reporting} onClose={() => setReporting(null)} />
      )}
    </PortalLayout>
  );
}

export function ActivityPage() {
  const [tab, setTab] = useState("全部活动");
  const [categories, setCategories] = useState([]);
  const [categoryId, setCategoryId] = useState("");
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  useEffect(() => {
    api("/public/activities/categories")
      .then(setCategories)
      .catch((err) => setError(err.message));
  }, []);
  useEffect(() => {
    setLoading(true);
    const path =
      tab === "我的报名"
        ? `/activities/mine?page=${page}&size=12`
        : `/public/activities?page=${page}&size=12${categoryId ? `&categoryId=${categoryId}` : ""}`;
    api(path)
      .then((data) => {
        setItems(data.records || []);
        setPages(data.pages || 0);
        setError("");
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [tab, categoryId, page]);
  useEffect(() => { setPage(1); }, [tab, categoryId]);
  return (
    <PortalLayout
      title="联谊活动"
      eyebrow="CAMPUS EVENTS"
      action={
        <Link className="portal-primary" to="/activities/new">
          <Plus />
          创建活动
        </Link>
      }
    >
      <StatStrip
        items={[
          ["可报名活动", String(items.length), CalendarBlank],
          [
            "我的报名",
            String(items.filter((item) => item.signed).length),
            CheckCircle,
          ],
          ["活动分类", String(categories.length), MapPin],
        ]}
      />
      <div className="portal-category-row">
        <button
          className={!categoryId ? "active" : ""}
          onClick={() => setCategoryId("")}
        >
          <Tag />
          全部分类
        </button>
        {categories.map((item) => (
          <button
            className={String(categoryId) === String(item.id) ? "active" : ""}
            onClick={() => setCategoryId(String(item.id))}
            key={item.id}
          >
            <Tag />
            {item.name}
          </button>
        ))}
      </div>
      <FilterBar
        tabs={["全部活动", "我的报名"]}
        active={tab}
        onChange={setTab}
      />
      {error ? (
        <div className="admin-error panel">
          <WarningCircle />
          {error}
        </div>
      ) : loading ? (
        <div className="admin-loading">正在加载活动…</div>
      ) : items.length ? (
        <div className="demo-card-grid">
          {items.map((item) => (
            <Link
              className="activity-demo-card"
              to={`/activities/${item.id}`}
              key={item.id}
            >
              <div>
                <span>{item.categoryName}</span>
                <CalendarBlank weight="duotone" />
              </div>
              <h3>{item.title}</h3>
              <p>
                <Clock />
                {(item.startAt || "").replace("T", " ").slice(0, 16)}
              </p>
              <p>
                <MapPin />
                {item.location}
              </p>
              <small>
                {item.signedCount} / {item.capacity} 人已报名
              </small>
              <span className="activity-card-link">
                {item.signed ? "已报名" : "查看详情"}
                <CaretRight />
              </span>
            </Link>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={CalendarBlank}
          title={tab === "我的报名" ? "还没有报名活动" : "暂无可报名活动"}
          text="新活动审核通过后会显示在这里"
        />
      )}
      <Pagination page={page} pages={pages} onChange={setPage} />
    </PortalLayout>
  );
}

export function ActivityDetailPage() {
  const { id } = useParams();
  const [activity, setActivity] = useState(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const load = () =>
    api(`/public/activities/${id}`)
      .then((data) => {
        setActivity(data);
        setError("");
      })
      .catch((err) => setError(err.message));
  useEffect(() => {
    load();
  }, [id]);
  const toggleSign = async () => {
    setBusy(true);
    try {
      const signed = await api(`/activities/${id}/sign`, { method: "POST" });
      setActivity({
        ...activity,
        signed,
        signedCount: activity.signedCount + (signed ? 1 : -1),
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };
  if (error && !activity)
    return (
      <PortalLayout title="活动详情">
        <div className="admin-error panel">
          <WarningCircle />
          {error}
        </div>
      </PortalLayout>
    );
  if (!activity)
    return (
      <PortalLayout title="活动详情">
        <div className="admin-loading">正在加载活动…</div>
      </PortalLayout>
    );
  const formatTime = (value) =>
    value ? value.replace("T", " ").slice(0, 16) : "时间待定";
  return (
    <PortalLayout title="活动详情" eyebrow={`EVENT · ${id}`}>
      <div className="activity-detail">
        <section className="activity-poster">
          {activity.posterUrl ? (
            <img src={activity.posterUrl} alt="活动海报" />
          ) : (
            <>
              <CalendarBlank weight="duotone" />
              <strong>{activity.title}</strong>
              <span>{activity.categoryName}</span>
            </>
          )}
        </section>
        <section className="activity-info">
          <Link className="back-link" to="/activities">
            <ArrowLeft />
            返回活动列表
          </Link>
          <span className="status-tag">
            {activity.status === 1 ? "报名中" : "已结束"}
          </span>
          <h2>{activity.title}</h2>
          <p>发起人：{activity.creatorName || "校园用户"}</p>
          <dl>
            <div>
              <dt>
                <CalendarBlank />
                开始时间
              </dt>
              <dd>{formatTime(activity.startAt)}</dd>
            </div>
            <div>
              <dt>
                <Clock />
                结束时间
              </dt>
              <dd>{formatTime(activity.endAt)}</dd>
            </div>
            <div>
              <dt>
                <MapPin />
                地点
              </dt>
              <dd>{activity.location || "地点待定"}</dd>
            </div>
            <div>
              <dt>
                <UsersThree />
                参与情况
              </dt>
              <dd>
                {activity.signedCount || 0} / {activity.capacity || 0} 人
              </dd>
            </div>
          </dl>
          <button
            disabled={busy}
            className={
              activity.signed
                ? "portal-secondary block"
                : "portal-primary block"
            }
            onClick={toggleSign}
          >
            {activity.signed ? (
              <>
                <X />
                {busy ? "处理中…" : "取消报名"}
              </>
            ) : (
              <>
                <Check />
                {busy ? "处理中…" : "立即报名"}
              </>
            )}
          </button>
          {error && (
            <div className="admin-error">
              <WarningCircle />
              {error}
            </div>
          )}
        </section>
      </div>
      <section className="detail-section">
        <h2>活动介绍</h2>
        <div className="demo-detail-body">
          <p>{activity.content || "暂无活动介绍"}</p>
          <p>报名截止：{formatTime(activity.signupDeadline)}</p>
        </div>
      </section>
    </PortalLayout>
  );
}

export function NewsPage() {
  const [items, setItems] = useState([]);
  const [keyword, setKeyword] = useState("");
  const [appliedKeyword, setAppliedKeyword] = useState("");
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const load = async (value = "", requestedPage = page) => {
    setLoading(true);
    try {
      const data = await api(
        `/public/news?page=${requestedPage}&size=10${value ? `&keyword=${encodeURIComponent(value)}` : ""}`,
      );
      setItems(data.records || []);
      setPages(data.pages || 0);
      setError("");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    load("", 1);
  }, []);
  useEffect(() => { if (page > 1 || appliedKeyword) load(appliedKeyword, page); }, [page]);
  const featured = items[0];
  return (
    <PortalLayout title="校园资讯" eyebrow="CAMPUS NEWS">
      <div className="news-toolbar">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setAppliedKeyword(keyword.trim()); setPage(1); load(keyword.trim(), 1);
          }}
        >
          <MagnifyingGlass />
          <input
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="搜索校园新闻"
          />
          <button type="submit">搜索</button>
        </form>
        <Link className="portal-secondary" to="/notices">
          <Megaphone />
          系统公告
        </Link>
      </div>
      {error ? (
        <div className="admin-error panel">
          <WarningCircle />
          {error}
        </div>
      ) : loading ? (
        <div className="admin-loading">正在加载校园新闻…</div>
      ) : items.length ? (
        <div className="news-layout">
          <Link className="news-feature" to={`/news/${featured.id}`}>
            {featured.coverUrl ? (
              <img src={featured.coverUrl} alt="新闻封面" />
            ) : (
              <Image weight="duotone" />
            )}
            <div>
              <span>{featured.top ? "TOP STORY" : "FEATURED STORY"}</span>
              <h2>{featured.title}</h2>
              <p>{featured.summary || featured.source}</p>
            </div>
          </Link>
          <section className="news-list">
            {items.slice(1).map((item) => (
              <Link to={`/news/${item.id}`} key={item.id}>
                <div>
                  <span>
                    {item.source || "校园资讯"}
                    {item.top ? " · 置顶" : ""}
                  </span>
                  <h3>{item.title}</h3>
                  <p>{item.summary || "点击查看新闻详情"}</p>
                  <small>
                    {(item.publishedAt || "").replace("T", " ").slice(0, 16)} ·{" "}
                    {item.views} 浏览
                  </small>
                </div>
                <CaretRight />
              </Link>
            ))}
          </section>
        </div>
      ) : (
        <EmptyState
          icon={FileText}
          title="暂无新闻"
          text="管理员发布新闻后会显示在这里"
        />
      )}
      <Pagination page={page} pages={pages} onChange={setPage} />
    </PortalLayout>
  );
}

export function NoticePage() {
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  useEffect(() => {
    api(`/public/notices?page=${page}&size=10`)
      .then((data) => { setItems(data.records || []); setPages(data.pages || 0); })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [page]);
  return (
    <PortalLayout title="系统公告" eyebrow="OFFICIAL NOTICE">
      <div className="notice-banner">
        <Megaphone weight="duotone" />
        <div>
          <h2>重要通知统一发布</h2>
          <p>请及时关注学校和社区的重要信息。</p>
        </div>
      </div>
      {error ? (
        <div className="admin-error panel">
          <WarningCircle />
          {error}
        </div>
      ) : loading ? (
        <div className="admin-loading">正在加载系统公告…</div>
      ) : items.length ? (
        <div className="notice-list">
          {items.map((item) => (
            <Link to={`/notices/${item.id}`} key={item.id}>
              <Megaphone />
              <div>
                <span>{item.top ? "置顶公告" : "系统公告"}</span>
                <h3>{item.title}</h3>
                <p>{item.content}</p>
                <small>
                  {(item.publishedAt || "").replace("T", " ").slice(0, 16)}
                </small>
              </div>
              <CaretRight />
            </Link>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={ClipboardText}
          title="暂无系统公告"
          text="管理员发布公告后会显示在这里"
        />
      )}
      <Pagination page={page} pages={pages} onChange={setPage} />
    </PortalLayout>
  );
}

export function NewsDetailPage({ type }) {
  const { id } = useParams();
  const isNotice = type === "notice";
  const [item, setItem] = useState(null);
  const [error, setError] = useState("");
  useEffect(() => {
    api(`/public/${isNotice ? "notices" : "news"}/${id}`)
      .then(setItem)
      .catch((err) => setError(err.message));
  }, [id, isNotice]);
  if (error)
    return (
      <PortalLayout title={isNotice ? "公告详情" : "新闻详情"}>
        <div className="admin-error panel">
          <WarningCircle />
          {error}
        </div>
      </PortalLayout>
    );
  if (!item)
    return (
      <PortalLayout title={isNotice ? "公告详情" : "新闻详情"}>
        <div className="admin-loading">正在加载正文…</div>
      </PortalLayout>
    );
  return (
    <PortalLayout
      title={isNotice ? "公告详情" : "新闻详情"}
      eyebrow={`${isNotice ? "NOTICE" : "NEWS"} · ${id}`}
    >
      <article className="article-reader">
        <Link className="back-link" to={isNotice ? "/notices" : "/news"}>
          <ArrowLeft />
          返回列表
        </Link>
        <span>
          {isNotice
            ? item.top
              ? "置顶公告"
              : "官方公告"
            : item.source || "校园新闻"}
        </span>
        <h2>{item.title}</h2>
        <p className="article-meta">
          {(item.publishedAt || "").replace("T", " ").slice(0, 16)}
          {!isNotice && ` · ${item.views} 浏览`}
        </p>
        {!isNotice && item.coverUrl && (
          <div className="article-cover">
            <img src={item.coverUrl} alt="新闻封面" />
          </div>
        )}
        <div className="article-body">{item.content}</div>
      </article>
    </PortalLayout>
  );
}

function ImageUploader({
  value = [],
  onChange,
  multiple = false,
  label = "上传图片",
}) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const images = Array.isArray(value) ? value : value ? [value] : [];
  const upload = async (event) => {
    const limit = multiple ? Math.max(0, 6 - images.length) : 1;
    const files = Array.from(event.target.files || []).slice(0, limit);
    if (!files.length) return;
    setUploading(true);
    setError("");
    try {
      const uploaded = [];
      for (const file of files) {
        const body = new FormData();
        body.append("file", file);
        body.append("accessType", "1");
        const result = await api("/files", { method: "POST", body });
        uploaded.push(publicFileUrl(result.id));
      }
      onChange(multiple ? [...images, ...uploaded].slice(0, 6) : uploaded);
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  };
  return (
    <div className="image-uploader">
      <div className="image-uploader-head">
        <strong>{label}</strong>
        <span>{multiple ? `${images.length} / 6` : "选填"}</span>
      </div>
      <label className={`image-upload-button ${uploading ? "disabled" : ""}`}>
        <Image weight="duotone" />
        {uploading
          ? "上传中…"
          : images.length && !multiple
            ? "更换图片"
            : "选择本地图片"}
        <input
          disabled={uploading || (multiple && images.length >= 6)}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          multiple={multiple}
          onChange={upload}
        />
      </label>
      {images.length > 0 && (
        <div className="image-upload-previews">
          {images.map((url) => (
            <div className="image-upload-preview" key={url}>
              <img src={url} alt="上传预览" />
              <button
                type="button"
                aria-label="移除图片"
                onClick={() => onChange(images.filter((item) => item !== url))}
              >
                <X />
              </button>
            </div>
          ))}
        </div>
      )}
      {error && (
        <div className="image-upload-error">
          <WarningCircle />
          {error}
        </div>
      )}
    </div>
  );
}

function ForumEditor() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({
    categoryId: "",
    title: "",
    content: "",
    tags: "",
    imageUrls: [],
  });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    api("/public/forum/categories")
      .then(setCategories)
      .catch((err) => setError(err.message));
  }, []);
  const submit = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      await api("/forum/posts", {
        method: "POST",
        body: JSON.stringify({
          categoryId: Number(form.categoryId),
          title: form.title,
          content: form.content,
          imageUrls: form.imageUrls,
          tags: form.tags
            .split(/[,，]/)
            .map((item) => item.trim())
            .filter(Boolean)
            .slice(0, 5),
        }),
      });
      window.alert("帖子已提交，管理员审核通过后会显示在论坛中");
      navigate("/me", { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };
  return (
    <PortalLayout title="发布帖子" eyebrow="CONTENT EDITOR">
      <form className="editor-form" onSubmit={submit}>
        <label>
          帖子标题
          <input
            required
            maxLength="150"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="请输入帖子标题"
          />
        </label>
        <label>
          选择论坛板块
          <select
            required
            value={form.categoryId}
            onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
          >
            <option value="" disabled>
              请选择板块
            </option>
            {categories.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          帖子正文
          <textarea
            required
            value={form.content}
            onChange={(e) => setForm({ ...form, content: e.target.value })}
            placeholder="写下帖子正文…"
          />
        </label>
        <label>
          标签
          <input
            value={form.tags}
            onChange={(e) => setForm({ ...form, tags: e.target.value })}
            placeholder="最多 5 个，用逗号分隔"
          />
        </label>
        <ImageUploader
          value={form.imageUrls}
          onChange={(imageUrls) => setForm({ ...form, imageUrls })}
          multiple
        />
        {error && (
          <div className="admin-error">
            <WarningCircle />
            {error}
          </div>
        )}
        <div className="editor-actions">
          <button
            type="button"
            className="portal-secondary"
            onClick={() => navigate(-1)}
          >
            取消
          </button>
          <button disabled={busy} className="portal-primary" type="submit">
            <PaperPlaneTilt />
            {busy ? "提交中…" : "提交审核"}
          </button>
        </div>
      </form>
    </PortalLayout>
  );
}

function ConfessEditor() {
  const navigate = useNavigate();
  const [content, setContent] = useState("");
  const [imageUrls, setImageUrls] = useState([]);
  const [anonymous, setAnonymous] = useState(true);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const submit = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      await api("/confesses", {
        method: "POST",
        body: JSON.stringify({ content, imageUrls, anonymous }),
      });
      window.alert("表白已提交，管理员审核通过后会公开显示");
      navigate("/confess?mine=1", { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };
  return (
    <PortalLayout title="发布表白" eyebrow="CONTENT EDITOR">
      <form className="editor-form" onSubmit={submit}>
        <label>
          匿名发布
          <button
            type="button"
            className={`switch ${anonymous ? "on" : ""}`}
            onClick={() => setAnonymous(!anonymous)}
          >
            <i />
            {anonymous ? "已开启" : "已关闭"}
          </button>
        </label>
        <label>
          想说的话
          <textarea
            required
            maxLength="5000"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="写下想说的话…"
          />
        </label>
        <small className="editor-counter">{content.length} / 5000</small>
        <ImageUploader value={imageUrls} onChange={setImageUrls} multiple />
        {error && (
          <div className="admin-error">
            <WarningCircle />
            {error}
          </div>
        )}
        <div className="editor-actions">
          <button
            type="button"
            className="portal-secondary"
            onClick={() => navigate(-1)}
          >
            取消
          </button>
          <button disabled={busy} className="portal-primary" type="submit">
            <Heart />
            {busy ? "提交中…" : "提交审核"}
          </button>
        </div>
      </form>
    </PortalLayout>
  );
}

function ActivityEditor() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const toLocalInput = (date) => {
    const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
    return local.toISOString().slice(0, 16);
  };
  const initialTimes = () => {
    const now = new Date();
    const start = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const end = new Date(start.getTime() + 2 * 60 * 60 * 1000);
    const deadline = new Date(start.getTime() - 12 * 60 * 60 * 1000);
    return {
      startAt: toLocalInput(start),
      endAt: toLocalInput(end),
      signupDeadline: toLocalInput(deadline),
    };
  };
  const [form, setForm] = useState(() => ({
    categoryId: "",
    title: "",
    posterUrl: "",
    content: "",
    location: "",
    ...initialTimes(),
    capacity: 50,
  }));
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    api("/public/activities/categories")
      .then(setCategories)
      .catch((err) => setError(err.message));
  }, []);
  const change = (key, value) => setForm({ ...form, [key]: value });
  const submit = async (event) => {
    event.preventDefault();
    const now = Date.now();
    if (new Date(form.startAt).getTime() <= now) {
      setError("活动开始时间必须晚于当前时间");
      return;
    }
    if (new Date(form.endAt).getTime() <= now) {
      setError("活动结束时间必须晚于当前时间");
      return;
    }
    if (new Date(form.signupDeadline).getTime() <= now) {
      setError("报名截止时间必须晚于当前时间");
      return;
    }
    if (form.signupDeadline >= form.startAt) {
      setError("报名截止时间必须早于活动开始时间");
      return;
    }
    if (form.endAt <= form.startAt) {
      setError("结束时间必须晚于开始时间");
      return;
    }
    setBusy(true);
    setError("");
    try {
      await api("/activities", {
        method: "POST",
        body: JSON.stringify({
          ...form,
          categoryId: Number(form.categoryId),
          capacity: Number(form.capacity),
          posterUrl: form.posterUrl || "",
        }),
      });
      window.alert("活动已提交，管理员审核通过后会公开显示");
      navigate("/activities", { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };
  const minimumTime = toLocalInput(new Date());
  return (
    <PortalLayout title="创建活动" eyebrow="CONTENT EDITOR">
      <form className="editor-form" onSubmit={submit}>
        <div className="activity-time-note">
          <Clock />
          当前时间：{new Date().toLocaleString("zh-CN", { hour12: false })}
          ，三个时间都必须晚于现在。
        </div>
        <div className="field-grid">
          <label>
            活动名称
            <input
              required
              maxLength="120"
              value={form.title}
              onChange={(e) => change("title", e.target.value)}
            />
          </label>
          <label>
            活动分类
            <select
              required
              value={form.categoryId}
              onChange={(e) => change("categoryId", e.target.value)}
            >
              <option value="" disabled>
                请选择分类
              </option>
              {categories.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            开始时间
            <input
              required
              min={minimumTime}
              type="datetime-local"
              value={form.startAt}
              onChange={(e) => change("startAt", e.target.value)}
            />
          </label>
          <label>
            结束时间
            <input
              required
              min={form.startAt || minimumTime}
              type="datetime-local"
              value={form.endAt}
              onChange={(e) => change("endAt", e.target.value)}
            />
          </label>
          <label>
            报名截止
            <input
              required
              min={minimumTime}
              max={form.startAt || undefined}
              type="datetime-local"
              value={form.signupDeadline}
              onChange={(e) => change("signupDeadline", e.target.value)}
            />
          </label>
          <label>
            人数上限
            <input
              required
              type="number"
              min="1"
              value={form.capacity}
              onChange={(e) => change("capacity", e.target.value)}
            />
          </label>
          <label>
            活动地点
            <input
              required
              maxLength="200"
              value={form.location}
              onChange={(e) => change("location", e.target.value)}
            />
          </label>
          <div className="profile-upload-field">
            <ImageUploader
              label="上传活动海报"
              value={form.posterUrl ? [form.posterUrl] : []}
              onChange={(urls) => change("posterUrl", urls[0] || "")}
            />
          </div>
        </div>
        <label>
          活动介绍
          <textarea
            required
            value={form.content}
            onChange={(e) => change("content", e.target.value)}
          />
        </label>
        {error && (
          <div className="admin-error">
            <WarningCircle />
            {error}
          </div>
        )}
        <div className="editor-actions">
          <button
            type="button"
            className="portal-secondary"
            onClick={() => navigate(-1)}
          >
            取消
          </button>
          <button disabled={busy} className="portal-primary" type="submit">
            <CalendarBlank />
            {busy ? "提交中…" : "提交审核"}
          </button>
        </div>
      </form>
    </PortalLayout>
  );
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
  const categoryOptions =
    type === "forum"
      ? ["学习交流", "校园生活", "闲置交易", "问答互助"]
      : ["文娱活动", "交友联谊", "竞赛实践"];
  return (
    <PortalLayout title={config[0]} eyebrow="CONTENT EDITOR">
      <form
        className="editor-form"
        onSubmit={(event) => {
          event.preventDefault();
          navigate(
            type === "forum"
              ? "/forum"
              : type === "confess"
                ? "/confess"
                : "/activities",
          );
        }}
      >
        <label>
          {config[1]}
          <input required placeholder={`请输入${config[1]}`} />
        </label>
        <label>
          {config[2]}
          {type === "confess" ? (
            <button
              type="button"
              className={`switch ${anonymous ? "on" : ""}`}
              onClick={() => setAnonymous(!anonymous)}
            >
              <i />
              {anonymous ? "已开启" : "已关闭"}
            </button>
          ) : (
            <select required defaultValue="">
              <option value="" disabled>
                请选择
              </option>
              {categoryOptions.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          )}
        </label>
        {type === "activity" && (
          <div className="field-grid">
            <label>
              活动时间
              <input type="datetime-local" required />
            </label>
            <label>
              报名人数上限
              <input type="number" min="1" />
            </label>
            <label>
              活动地点
              <input placeholder="输入校内地点" />
            </label>
            <label>
              报名截止时间
              <input type="datetime-local" />
            </label>
          </div>
        )}
        <label>
          内容
          <textarea required placeholder={config[3]} />
        </label>
        <div className="upload-zone">
          <Image weight="duotone" />
          <strong>上传图片</strong>
          <span>支持拖拽或点击选择</span>
        </div>
        <div className="editor-actions">
          <button
            type="button"
            className="portal-secondary"
            onClick={() => navigate(-1)}
          >
            取消
          </button>
          <button className="portal-primary" type="submit">
            <PaperPlaneTilt />
            提交发布
          </button>
        </div>
      </form>
    </PortalLayout>
  );
}

export function UserSpacePage() {
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [tab, setTab] = useState("公开动态");
  const [items, setItems] = useState([]);
  const [contentLoading, setContentLoading] = useState(true);
  useEffect(() => {
    api(id === "me" ? "/users/me" : `/users/${id}`)
      .then(setUser)
      .catch((err) => setError(err.message));
  }, [id]);
  useEffect(() => {
    let active = true;
    setContentLoading(true);
    const endpoints =
      tab === "公开表白"
        ? [`/users/${id}/confesses?size=50`, "confess"]
        : [`/users/${id}/posts?size=50`, "post"];
    api(endpoints[0])
      .then((data) => {
        if (active)
          setItems(
            (data.records || []).map((item) => ({
              ...item,
              contentType: endpoints[1],
            })),
          );
      })
      .catch((err) => {
        if (active) setError(err.message);
      })
      .finally(() => {
        if (active) setContentLoading(false);
      });
    return () => {
      active = false;
    };
  }, [id, tab]);
  const addFriend = async () => {
    setBusy(true);
    try {
      await api(`/users/friends/${id}`, { method: "POST" });
      setUser({ ...user, friend: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };
  if (error && !user)
    return (
      <PortalLayout title="用户主页">
        <div className="admin-error panel">
          <WarningCircle />
          {error}
        </div>
      </PortalLayout>
    );
  if (!user)
    return (
      <PortalLayout title="用户主页">
        <div className="admin-loading">正在加载用户资料…</div>
      </PortalLayout>
    );
  const mine = id === "me";
  return (
    <PortalLayout title="用户主页" eyebrow={`USER · ${user.id}`}>
      <section className="user-hero">
        <img
          src={user.avatarUrl || "/assets/avatar-linxia.jpg"}
          alt="用户头像"
        />
        <div>
          <span>
            <ShieldCheck
              weight={
                user.verified || user.verifyStatus === 2 ? "fill" : "regular"
              }
            />
            {user.verified || user.verifyStatus === 2
              ? "校内认证"
              : "普通校园用户"}
          </span>
          <h2>{user.nickname}</h2>
          <p>
            {[user.college, user.grade].filter(Boolean).join(" · ") ||
              "学院与年级暂未填写"}
            <br />
            {user.bio || "这个人还没有填写个人简介。"}
          </p>
        </div>
        <div>
          {mine ? (
            <Link className="portal-primary" to="/me">
              <PencilSimple />
              编辑资料
            </Link>
          ) : (
            <>
              <button
                disabled={busy || user.friend}
                className={user.friend ? "portal-secondary" : "portal-primary"}
                onClick={addFriend}
              >
                {user.friend ? <Check /> : <UserPlus />}
                {user.friend ? "已是好友" : busy ? "发送中…" : "添加好友"}
              </button>
              <Link className="portal-secondary" to={`/messages/${id}`}>
                <ChatCircle />
                私信
              </Link>
            </>
          )}
        </div>
      </section>
      <StatStrip
        items={[
          ["公开内容", String(items.length), FileText],
          ["学院", user.college || "未填写", FileText],
          ["年级", user.grade || "未填写", Users],
        ]}
      />
      <FilterBar
        tabs={["公开动态", "公开表白"]}
        active={tab}
        onChange={setTab}
        search={false}
      />
      {error && (
        <div className="admin-error">
          <WarningCircle />
          {error}
        </div>
      )}
      {contentLoading ? (
        <div className="admin-loading">正在加载公开内容…</div>
      ) : items.length ? (
        <div className="profile-content-list">
          {items.map((item) => (
            <Link
              key={`${item.contentType}-${item.id}`}
              to={
                item.contentType === "confess"
                  ? `/confess/${item.id}`
                  : `/forum/${item.id}`
              }
            >
              <div className="profile-content-icon">
                {item.contentType === "confess" ? <Heart /> : <FileText />}
              </div>
              <div>
                <strong>
                  {item.title || item.content?.slice(0, 50) || "校园动态"}
                </strong>
                <span>
                  {(item.createdAt || "").replace("T", " ").slice(0, 16)} ·{" "}
                  {item.likes || 0} 赞 · {item.comments || 0} 评论
                </span>
                {item.content && <p>{item.content.slice(0, 120)}</p>}
              </div>
              <CaretRight />
            </Link>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={tab === "公开表白" ? Heart : FileText}
          title={`暂无${tab}`}
          text="该用户审核通过的公开内容将在这里显示"
        />
      )}
    </PortalLayout>
  );
}

export function FriendPage({ tab: defaultTab = "friends" }) {
  const [tab, setTab] = useState(
    defaultTab === "requests" ? "好友申请" : "好友列表",
  );
  const [items, setItems] = useState([]);
  const [searching, setSearching] = useState(false);
  const [keyword, setKeyword] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const load = () => {
    setLoading(true);
    api(tab === "好友申请" ? "/users/friend-requests" : "/users/friends")
      .then((data) => {
        setItems(data || []);
        setError("");
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };
  useEffect(() => {
    load();
  }, [tab]);
  const search = async (event) => {
    event.preventDefault();
    if (!keyword.trim()) return;
    setLoading(true);
    try {
      setResults(
        await api(
          `/users/search?keyword=${encodeURIComponent(keyword.trim())}`,
        ),
      );
      setError("");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  const applyFriend = async (user) => {
    try {
      await api(`/users/friends/${user.id}`, { method: "POST" });
      setNotice("好友申请已发送");
      setResults(results.filter((item) => item.id !== user.id));
    } catch (err) {
      setError(err.message);
    }
  };
  const handleRequest = async (request, accept) => {
    try {
      await api(
        `/users/friend-requests/${request.requestId}/${accept ? "accept" : "reject"}`,
        { method: "POST" },
      );
      setNotice(accept ? "已添加为好友" : "已拒绝申请");
      load();
    } catch (err) {
      setError(err.message);
    }
  };
  const removeFriend = async (user) => {
    if (!window.confirm(`确认删除好友“${user.nickname}”吗？`)) return;
    try {
      await api(`/users/friends/${user.id}`, { method: "DELETE" });
      setNotice("好友已删除");
      load();
    } catch (err) {
      setError(err.message);
    }
  };
  const display = searching ? results : items;
  return (
    <PortalLayout
      title="好友"
      eyebrow="SOCIAL CONNECTIONS"
      action={
        <button
          className="portal-primary"
          onClick={() => {
            setSearching(!searching);
            setResults([]);
            setKeyword("");
          }}
        >
          <UserPlus />
          {searching ? "返回好友" : "添加好友"}
        </button>
      }
    >
      <FilterBar
        tabs={["好友列表", "好友申请"]}
        active={tab}
        onChange={(value) => {
          setTab(value);
          setSearching(false);
        }}
        search={false}
      />
      {searching && (
        <form className="friend-search" onSubmit={search}>
          <label>
            <MagnifyingGlass />
            <input
              autoFocus
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="输入昵称或学院搜索"
            />
          </label>
          <button className="portal-primary" type="submit">
            搜索用户
          </button>
        </form>
      )}
      {notice && (
        <div className="profile-success">
          <CheckCircle />
          {notice}
        </div>
      )}
      {error && (
        <div className="admin-error">
          <WarningCircle />
          {error}
        </div>
      )}
      {loading ? (
        <div className="admin-loading">正在加载好友数据…</div>
      ) : display.length ? (
        <div className="friend-grid">
          {display.map((item) => (
            <article className="friend-card" key={item.requestId || item.id}>
              <img
                src={item.avatarUrl || "/assets/avatar-linxia.jpg"}
                alt="用户头像"
              />
              <div>
                <h3>{item.nickname}</h3>
                <p>
                  {[item.college, item.grade].filter(Boolean).join(" · ") ||
                    "校园用户"}
                </p>
                {item.bio && <span>{item.bio}</span>}
              </div>
              <div>
                {searching ? (
                  item.friend ? (
                    <span className="status-pill">已是好友</span>
                  ) : (
                    <button
                      className="portal-primary"
                      onClick={() => applyFriend(item)}
                    >
                      <UserPlus />
                      申请好友
                    </button>
                  )
                ) : tab === "好友申请" ? (
                  <>
                    <button
                      className="portal-primary"
                      onClick={() => handleRequest(item, true)}
                    >
                      <Check />
                      同意
                    </button>
                    <button
                      className="portal-secondary"
                      onClick={() => handleRequest(item, false)}
                    >
                      <X />
                      拒绝
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      className="portal-secondary"
                      to={`/messages/${item.id}`}
                    >
                      <ChatCircle />
                      私信
                    </Link>
                    <button
                      className="friend-remove"
                      onClick={() => removeFriend(item)}
                    >
                      删除
                    </button>
                  </>
                )}
              </div>
            </article>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={searching || tab === "好友申请" ? UserPlus : Users}
          title={
            searching
              ? "没有找到相关用户"
              : tab === "好友申请"
                ? "暂无好友申请"
                : "好友列表为空"
          }
          text={
            searching
              ? "换一个昵称或学院关键词试试"
              : "通过添加好友建立校园连接"
          }
        />
      )}
    </PortalLayout>
  );
}

export function MessagePage({ conversation = false }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const myId = authStore.userId();
  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [contact, setContact] = useState(null);
  const [draft, setDraft] = useState("");
  const [keyword, setKeyword] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const loadConversations = async () => {
    try {
      setConversations(await api("/messages/conversations"));
    } catch (err) {
      setError(err.message);
    }
  };
  useEffect(() => {
    loadConversations().finally(() => setLoading(false));
  }, []);
  useEffect(() => {
    if (!conversation || !id) return;
    setLoading(true);
    Promise.all([
      api(`/messages/with/${id}?size=100`),
      api(`/users/${id}`),
      api(`/messages/with/${id}/read`, { method: "POST" }),
    ])
      .then(([page, user]) => {
        setMessages([...(page.records || [])].reverse());
        setContact(user);
        setError("");
        loadConversations();
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [conversation, id]);
  const send = async (event) => {
    event.preventDefault();
    if (!draft.trim()) return;
    setBusy(true);
    setError("");
    try {
      const item = await api(`/messages/${id}`, {
        method: "POST",
        body: JSON.stringify({
          messageType: 0,
          content: draft.trim(),
          fileUrl: null,
        }),
      });
      setMessages([...messages, item]);
      setDraft("");
      await loadConversations();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };
  const filtered = conversations.filter((item) =>
    `${item.nickname}${item.lastMessage}`
      .toLowerCase()
      .includes(keyword.toLowerCase()),
  );
  return (
    <PortalLayout title="消息中心" eyebrow="MESSAGES" wide>
      <div className="message-shell">
        <aside className="message-list">
          <div className="message-list-head">
            <h2>私信</h2>
            <Link to="/friends">
              <UserPlus />
            </Link>
          </div>
          <label>
            <MagnifyingGlass />
            <input
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="搜索会话"
            />
          </label>
          {loading && !conversations.length ? (
            <div className="message-loading">正在加载…</div>
          ) : filtered.length ? (
            <div className="conversation-list">
              {filtered.map((item) => (
                <button
                  className={String(id) === String(item.userId) ? "active" : ""}
                  onClick={() => navigate(`/messages/${item.userId}`)}
                  key={item.userId}
                >
                  <img
                    src={item.avatarUrl || "/assets/avatar-linxia.jpg"}
                    alt="联系人头像"
                  />
                  <div>
                    <strong>{item.nickname}</strong>
                    <span>{item.lastMessage}</span>
                  </div>
                  <time>
                    {(item.lastMessageAt || "").replace("T", " ").slice(5, 16)}
                  </time>
                  {item.unreadCount > 0 && <b>{item.unreadCount}</b>}
                </button>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={ChatCircle}
              title="暂无会话"
              text="先从好友列表选择一位好友私信"
            />
          )}
        </aside>
        <section className="conversation">
          {conversation ? (
            <>
              <div className="conversation-head">
                <Link to="/messages">
                  <ArrowLeft />
                </Link>
                <img
                  src={contact?.avatarUrl || "/assets/avatar-linxia.jpg"}
                  alt="联系人头像"
                />
                <div>
                  <strong>{contact?.nickname || "联系人"}</strong>
                  <span>
                    {contact?.college || "校园用户"} · {id}
                  </span>
                </div>
              </div>
              <div className="conversation-body">
                {loading ? (
                  <div className="message-loading">正在加载聊天记录…</div>
                ) : messages.length ? (
                  <div className="message-bubbles">
                    {messages.map((item) => (
                      <div
                        className={
                          item.senderId === myId
                            ? "message-bubble mine"
                            : "message-bubble"
                        }
                        key={item.id}
                      >
                        <p>{item.content}</p>
                        <span>
                          {(item.createdAt || "")
                            .replace("T", " ")
                            .slice(5, 16)}
                          {item.senderId === myId &&
                            (item.read ? " · 已读" : " · 已发送")}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <EmptyState
                    icon={ChatCircle}
                    title="开始一段对话"
                    text="发送第一条好友私信"
                  />
                )}
              </div>
              {error && (
                <div className="admin-error message-error">
                  <WarningCircle />
                  {error}
                </div>
              )}
              <form className="message-composer" onSubmit={send}>
                <input
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  maxLength="5000"
                  placeholder="输入消息…"
                />
                <button
                  disabled={busy || !draft.trim()}
                  className="send-button"
                  type="submit"
                >
                  <PaperPlaneTilt weight="fill" />
                </button>
              </form>
            </>
          ) : (
            <EmptyState
              icon={EnvelopeSimple}
              title="选择一条会话"
              text="从左侧会话列表开始聊天，或前往好友列表发起私信"
            />
          )}
        </section>
      </div>
    </PortalLayout>
  );
}

export function PersonalCenterPage() {
  const [tab, setTab] = useState("个人资料");
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState("");
  const [busy, setBusy] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [items, setItems] = useState([]);
  const [contentLoading, setContentLoading] = useState(false);
  const [contentError, setContentError] = useState("");
  const navigate = useNavigate();
  useEffect(() => {
    api("/users/me")
      .then(setProfile)
      .catch((err) => setError(err.message));
  }, []);
  useEffect(() => {
    const endpoints = {
      我的表白: "/confesses/mine?size=50",
      我的帖子: "/forum/posts/mine?size=50",
      我的评论: "/forum/comments/mine?size=50",
      我的收藏: "/forum/collections/mine?size=50",
      我的报名: "/activities/mine?size=50",
      消息通知: "/notifications?size=50",
    };
    if (!endpoints[tab]) {
      setItems([]);
      setContentError("");
      return;
    }
    let active = true;
    setContentLoading(true);
    setContentError("");
    api(endpoints[tab])
      .then((data) => {
        if (active) setItems(data.records || []);
      })
      .catch((err) => {
        if (active) setContentError(err.message);
      })
      .finally(() => {
        if (active) setContentLoading(false);
      });
    return () => {
      active = false;
    };
  }, [tab]);
  const change = (key, value) => setProfile({ ...profile, [key]: value });
  const save = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError("");
    setSaved("");
    try {
      const updated = await api("/users/me", {
        method: "PUT",
        body: JSON.stringify({
          nickname: profile.nickname,
          avatarUrl: profile.avatarUrl || "",
          college: profile.college || "",
          grade: profile.grade || "",
          bio: profile.bio || "",
        }),
      });
      setProfile(updated);
      window.dispatchEvent(
        new CustomEvent("campus:profile-updated", { detail: updated }),
      );
      setSaved("资料已保存");
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };
  const logout = async () => {
    const refreshToken = authStore.refresh();
    try {
      if (refreshToken)
        await api(
          "/auth/logout",
          { method: "POST", body: JSON.stringify({ refreshToken }) },
          false,
        );
    } catch {
      /* 本地仍需退出 */
    }
    authStore.clear();
    navigate("/login", { replace: true });
  };
  const itemTarget = (item) =>
    tab === "我的表白"
      ? `/confess/${item.id}`
      : tab === "我的报名"
        ? `/activities/${item.id}`
        : tab === "我的评论"
          ? item.bizType === 2
            ? `/confess/${item.bizId}`
            : `/forum/${item.bizId}`
          : tab === "消息通知"
            ? item.bizType === 2
              ? `/confess/${item.bizId}`
              : item.bizId
                ? `/forum/${item.bizId}`
                : "/messages"
            : `/forum/${item.id}`;
  const itemTitle = (item) =>
    tab === "我的表白"
      ? item.content || "表白内容"
      : tab === "我的评论"
        ? item.content
        : tab === "消息通知"
          ? item.title
          : item.title;
  const itemMeta = (item) =>
    tab === "我的报名"
      ? `${item.location} · ${(item.startAt || "").replace("T", " ").slice(0, 16)}`
      : tab === "消息通知"
        ? `${item.actorName || "系统"} · ${item.read ? "已读" : "未读"}`
        : tab === "我的评论"
          ? `评论于 ${(item.createdAt || "").replace("T", " ").slice(0, 16)}`
          : `${item.categoryName || (item.anonymous ? "匿名发布" : "公开发布") || "校园内容"} · ${(item.createdAt || "").replace("T", " ").slice(0, 16)}`;
  const auditText = (item) =>
    item.auditStatus === 1
      ? "已通过"
      : item.auditStatus === 2
        ? `已驳回${item.auditReason ? `：${item.auditReason}` : ""}`
        : "待审核";
  const markAllRead = async () => {
    setBusy(true);
    try {
      await api("/notifications/read-all", { method: "POST" });
      setItems(items.map((item) => ({ ...item, read: true })));
    } catch (err) {
      setContentError(err.message);
    } finally {
      setBusy(false);
    }
  };
  const removeOwnContent = async (event, item) => {
    event.preventDefault();
    event.stopPropagation();
    if (
      !window.confirm(
        `确认删除这条${tab === "我的帖子" ? "帖子" : "评论"}吗？删除后无法恢复。`,
      )
    )
      return;
    setBusy(true);
    setContentError("");
    try {
      await api(
        tab === "我的帖子"
          ? `/forum/posts/${item.id}`
          : `/forum/comments/${item.id}`,
        { method: "DELETE" },
      );
      setItems((current) => current.filter((entry) => entry.id !== item.id));
    } catch (err) {
      setContentError(err.message);
    } finally {
      setBusy(false);
    }
  };
  const changePassword = async (event) => {
    event.preventDefault();
    setError("");
    setSaved("");
    if (passwordForm.newPassword.length < 8) {
      setError("新密码至少需要 8 位");
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setError("两次输入的新密码不一致");
      return;
    }
    setBusy(true);
    try {
      await api("/auth/change-password", {
        method: "POST",
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        }),
      });
      authStore.clear();
      window.alert("密码修改成功，请使用新密码重新登录");
      navigate("/login", { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };
  if (!profile)
    return (
      <PortalLayout title="个人中心" eyebrow="MY SPACE">
        <div className={error ? "admin-error panel" : "admin-loading"}>
          {error || "正在加载个人资料…"}
        </div>
      </PortalLayout>
    );
  return (
    <PortalLayout
      title="个人中心"
      eyebrow="MY SPACE"
      action={
        <button className="portal-secondary" onClick={logout}>
          <SignOut />
          退出登录
        </button>
      }
    >
      <section className="profile-editor">
        <div className="profile-avatar-wrap">
          <img
            src={profile.avatarUrl || "/assets/avatar-linxia.jpg"}
            alt="我的头像"
          />
        </div>
        <div>
          <h2>{profile.nickname}</h2>
          <p>
            <ShieldCheck
              weight={profile.verifyStatus === 2 ? "fill" : "regular"}
            />
            {profile.verifyStatus === 2
              ? "校内身份已认证"
              : `账号：${profile.username}`}
          </p>
        </div>
        <Link className="portal-secondary" to="/users/me">
          查看公开主页
        </Link>
      </section>
      <FilterBar
        tabs={[
          "个人资料",
          "账号安全",
          "我的表白",
          "我的帖子",
          "我的评论",
          "我的收藏",
          "我的报名",
          "消息通知",
        ]}
        active={tab}
        onChange={setTab}
        search={false}
        extra={
          tab === "消息通知" && items.some((item) => !item.read) ? (
            <button
              className="portal-secondary"
              disabled={busy}
              onClick={markAllRead}
            >
              <CheckCircle />
              全部已读
            </button>
          ) : null
        }
      />
      {tab === "个人资料" ? (
        <form className="profile-form" onSubmit={save}>
          <div className="field-grid">
            <label>
              昵称
              <input
                required
                maxLength="40"
                value={profile.nickname || ""}
                onChange={(e) => change("nickname", e.target.value)}
              />
            </label>
            <div className="profile-upload-field">
              <ImageUploader
                label="上传头像"
                value={profile.avatarUrl ? [profile.avatarUrl] : []}
                onChange={(urls) => change("avatarUrl", urls[0] || "")}
              />
            </div>
            <label>
              年级
              <input
                maxLength="20"
                value={profile.grade || ""}
                onChange={(e) => change("grade", e.target.value)}
                placeholder="例如：2026级"
              />
            </label>
            <label>
              学院
              <input
                maxLength="100"
                value={profile.college || ""}
                onChange={(e) => change("college", e.target.value)}
                placeholder="请输入学院"
              />
            </label>
          </div>
          <label>
            个人简介
            <textarea
              maxLength="300"
              value={profile.bio || ""}
              onChange={(e) => change("bio", e.target.value)}
              placeholder="介绍一下自己…"
            />
          </label>
          {error && (
            <div className="admin-error">
              <WarningCircle />
              {error}
            </div>
          )}
          {saved && (
            <div className="profile-success">
              <CheckCircle />
              {saved}
            </div>
          )}
          <button disabled={busy} className="portal-primary" type="submit">
            <Check />
            {busy ? "保存中…" : "保存资料"}
          </button>
        </form>
      ) : tab === "账号安全" ? (
        <form className="profile-form security-form" onSubmit={changePassword}>
          <div className="security-intro">
            <ShieldCheck weight="duotone" />
            <div>
              <h3>修改登录密码</h3>
              <p>修改成功后，当前登录状态将退出，需要使用新密码重新登录。</p>
            </div>
          </div>
          <label>
            当前密码
            <input
              required
              type="password"
              autoComplete="current-password"
              value={passwordForm.currentPassword}
              onChange={(event) =>
                setPasswordForm({
                  ...passwordForm,
                  currentPassword: event.target.value,
                })
              }
              placeholder="请输入当前密码"
            />
          </label>
          <div className="field-grid">
            <label>
              新密码
              <input
                required
                type="password"
                minLength="8"
                maxLength="72"
                autoComplete="new-password"
                value={passwordForm.newPassword}
                onChange={(event) =>
                  setPasswordForm({
                    ...passwordForm,
                    newPassword: event.target.value,
                  })
                }
                placeholder="至少 8 位"
              />
            </label>
            <label>
              确认新密码
              <input
                required
                type="password"
                minLength="8"
                maxLength="72"
                autoComplete="new-password"
                value={passwordForm.confirmPassword}
                onChange={(event) =>
                  setPasswordForm({
                    ...passwordForm,
                    confirmPassword: event.target.value,
                  })
                }
                placeholder="再次输入新密码"
              />
            </label>
          </div>
          {error && (
            <div className="admin-error">
              <WarningCircle />
              {error}
            </div>
          )}
          <button disabled={busy} className="portal-primary" type="submit">
            <ShieldCheck />
            {busy ? "修改中…" : "确认修改密码"}
          </button>
        </form>
      ) : contentLoading ? (
        <div className="admin-loading">正在加载{tab}…</div>
      ) : contentError ? (
        <div className="admin-error panel">
          <WarningCircle />
          {contentError}
        </div>
      ) : items.length ? (
        <div className="profile-content-list">
          {items.map((item) => (
            <Link
              to={itemTarget(item)}
              onClick={(event) => {
                if (
                  (tab === "我的帖子" || tab === "我的表白") &&
                  item.auditStatus !== 1
                )
                  event.preventDefault();
              }}
              key={item.id}
              className={`${tab === "消息通知" && !item.read ? "unread" : ""} ${(tab === "我的帖子" || tab === "我的表白") && item.auditStatus !== 1 ? "pending" : ""}`}
            >
              <div className="profile-content-icon">
                {tab === "我的报名" ? (
                  <CalendarBlank />
                ) : tab === "消息通知" ? (
                  <Bell />
                ) : tab === "我的表白" ? (
                  <Heart />
                ) : tab === "我的评论" ? (
                  <ChatCircle />
                ) : (
                  <FileText />
                )}
              </div>
              <div>
                <strong>{itemTitle(item)}</strong>
                <span>{itemMeta(item)}</span>
                {(tab === "我的帖子" || tab === "我的表白") && (
                  <small className={`profile-audit audit-${item.auditStatus}`}>
                    {auditText(item)}
                  </small>
                )}
                {tab === "消息通知" && item.content && <p>{item.content}</p>}
              </div>
              {(tab === "我的帖子" || tab === "我的评论") && (
                <button
                  type="button"
                  className="profile-delete-button"
                  disabled={busy}
                  onClick={(event) => removeOwnContent(event, item)}
                >
                  <Trash />
                  删除
                </button>
              )}
              <CaretRight />
            </Link>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={BookmarkSimple}
          title={`${tab}暂无内容`}
          text="产生相关记录后会显示在这里"
        />
      )}
    </PortalLayout>
  );
}

const adminSections = [
  ["overview", "数据概览", ChartBar],
  ["users", "用户管理", Users],
  ["passwords", "重置用户密码", ShieldCheck],
  ["verifications", "校园认证", ShieldCheck],
  ["reviews", "帖子审核", ClipboardText],
  ["published", "已发布帖子", FileText],
  ["confesses", "表白审核", Heart],
  ["activities", "活动审核", CalendarBlank],
  ["content", "内容管理", FileText],
  ["categories", "板块管理", ListBullets],
  ["reports", "举报管理", Flag],
  ["sensitive", "敏感词配置", WarningCircle],
];

export function VerificationPage() {
  const [status, setStatus] = useState(undefined);
  const [form, setForm] = useState({
    realName: "",
    studentNo: "",
    college: "",
    credentialUrl: "",
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const load = () =>
    api("/verifications/mine")
      .then(setStatus)
      .catch((err) => setError(err.message));
  useEffect(() => {
    load();
  }, []);
  const change = (key, value) => setForm({ ...form, [key]: value });
  const submit = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      await api("/verifications", {
        method: "POST",
        body: JSON.stringify(form),
      });
      setNotice("认证申请已提交，请等待管理员审核");
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };
  const stateText =
    status?.status === 0
      ? "待管理员审核"
      : status?.status === 1
        ? "校园认证已通过"
        : status?.status === 2
          ? `认证未通过：${status.rejectReason || "资料不符合要求"}`
          : "尚未提交认证";
  return (
    <PortalLayout title="校园实名认证" eyebrow="CAMPUS VERIFICATION">
      <section className="verification-card">
        <div className="security-intro">
          <ShieldCheck weight="duotone" />
          <div>
            <h3>{stateText}</h3>
            <p>认证资料仅供管理员审核，不会展示在公开主页。</p>
          </div>
        </div>
        {status?.status === 0 || status?.status === 1 ? (
          <div className="profile-success">
            <CheckCircle />
            {stateText}
          </div>
        ) : (
          <form className="profile-form" onSubmit={submit}>
            <div className="field-grid">
              <label>
                真实姓名
                <input
                  required
                  maxLength="50"
                  value={form.realName}
                  onChange={(e) => change("realName", e.target.value)}
                />
              </label>
              <label>
                学号
                <input
                  required
                  maxLength="50"
                  value={form.studentNo}
                  onChange={(e) => change("studentNo", e.target.value)}
                />
              </label>
              <label>
                学院
                <input
                  required
                  maxLength="100"
                  value={form.college}
                  onChange={(e) => change("college", e.target.value)}
                />
              </label>
            </div>
            <ImageUploader
              label="上传学生证或校园卡证明"
              value={form.credentialUrl ? [form.credentialUrl] : []}
              onChange={(urls) => change("credentialUrl", urls[0] || "")}
            />
            {error && (
              <div className="admin-error">
                <WarningCircle />
                {error}
              </div>
            )}
            {notice && (
              <div className="profile-success">
                <CheckCircle />
                {notice}
              </div>
            )}
            <button
              disabled={busy || !form.credentialUrl}
              className="portal-primary"
              type="submit"
            >
              <ShieldCheck />
              {busy ? "提交中…" : "提交认证申请"}
            </button>
          </form>
        )}
      </section>
    </PortalLayout>
  );
}

export function AdminLoginPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const submit = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      await adminLogin(form.username, form.password);
      navigate("/admin", { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };
  return (
    <div className="auth-screen admin-login-screen">
      <section className="auth-visual">
        <Link className="portal-brand inverse" to="/">
          <span>同窗</span>圈<i />
        </Link>
        <div>
          <span>AUTHORIZED STAFF ONLY</span>
          <h1>
            校园运营
            <br />
            管理后台
          </h1>
          <p>审核内容、处理举报并维护社区秩序。</p>
        </div>
      </section>
      <section className="auth-panel">
        <div className="auth-box">
          <span className="portal-kicker">ADMIN CONSOLE</span>
          <h2>管理员登录</h2>
          <p>请使用已分配管理员角色的校园账号</p>
          <form onSubmit={submit}>
            <label>
              账号
              <input
                autoFocus
                required
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
                placeholder="请输入账号"
              />
            </label>
            <label>
              密码
              <input
                type="password"
                required
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="请输入密码"
              />
            </label>
            {error && (
              <div className="admin-error">
                <WarningCircle />
                {error}
              </div>
            )}
            <button
              disabled={busy}
              className="portal-primary auth-submit"
              type="submit"
            >
              <ShieldCheck />
              {busy ? "正在验证…" : "进入管理后台"}
            </button>
          </form>
          <div className="auth-links">
            <Link to="/">返回社区首页</Link>
            <Link to="/login">普通用户登录</Link>
          </div>
        </div>
      </section>
    </div>
  );
}

const reviewKinds = {
  reviews: ["帖子", "posts", "post"],
  confesses: ["表白", "confesses", "confess"],
  activities: ["活动", "activities", "activity"],
  verifications: ["认证申请", "verifications", "verification"],
};

function AdminRows({ section, refreshOverview }) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [rejecting, setRejecting] = useState(null);
  const [reason, setReason] = useState("");
  const [notice, setNotice] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [viewingActivity, setViewingActivity] = useState(null);
  const [handlingReport, setHandlingReport] = useState(null);
  const [reportStatus, setReportStatus] = useState(2);
  const [reportResult, setReportResult] = useState("");
  const auditLock = useRef(false);
  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const path =
        section === "users"
          ? "/admin/users?size=50"
          : section === "reports"
            ? "/admin/reports?size=50"
            : section === "published"
              ? "/admin/posts?size=50"
              : section === "verifications"
                ? "/admin/verifications?status=0&size=50"
                : `/admin/audits/${reviewKinds[section][1]}?size=50`;
      const page = await api(path);
      setRows(page.records || []);
    } catch (err) {
      setError(err.message);
      if (/403|权限/.test(err.message)) authStore.clear();
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    load();
  }, [section]);
  const applyUserStatus = async (row, status, reason) => {
    setSubmitting(true);
    setError("");
    try {
      await api(
        `/admin/users/${row.id}/status?status=${status}&reason=${encodeURIComponent(reason)}`,
        { method: "POST" },
      );
      setNotice(
        status === 2
          ? `账号 ${row.username} 已封禁`
          : `账号 ${row.username} 已解封`,
      );
      await load();
      refreshOverview();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };
  const userStatus = async (row) => {
    await applyUserStatus(
      row,
      row.status === 1 ? 2 : 1,
      row.status === 1 ? "管理员后台封禁" : "解除封禁",
    );
  };
  const applyPostStatus = async (row, restoring, reason = "") => {
    setSubmitting(true);
    setError("");
    try {
      await api(
        restoring
          ? `/admin/posts/${row.id}/restore`
          : `/admin/posts/${row.id}/down?reason=${encodeURIComponent(reason.trim())}`,
        { method: "POST" },
      );
      setNotice(restoring ? "帖子已恢复上架" : "帖子已下架并通知发布者");
      await load();
      refreshOverview();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };
  const togglePostStatus = async (row) => {
    await applyPostStatus(
      row,
      row.status === 2,
      row.status === 1 ? "管理员后台下架" : "",
    );
  };
  const submitAudit = async (row, status, auditReason) => {
    if (auditLock.current) return;
    auditLock.current = true;
    setSubmitting(true);
    setError("");
    try {
      const kind = reviewKinds[section][2];
      const path =
        section === "verifications"
          ? `/admin/verifications/${row.id}/audit`
          : `/admin/audits/${kind}/${row.id}`;
      await api(path, {
        method: "POST",
        body: JSON.stringify({ status, reason: auditReason }),
      });
      setNotice(status === 1 ? "审核已通过" : "内容已驳回");
      setRejecting(null);
      setReason("");
      await load();
      refreshOverview();
    } catch (err) {
      setError(err.message);
    } finally {
      auditLock.current = false;
      setSubmitting(false);
    }
  };
  const audit = async (row, status) => {
    if (status === 2) {
      setRejecting(row);
      setReason("");
      return;
    }
    await submitAudit(row, 1, "审核通过");
  };
  const handleReport = (row, status) => {
    setHandlingReport(row);
    setReportStatus(status);
    setReportResult(
      status === 2
        ? "经核查举报成立，相关违规内容已下架处理"
        : "经核查未发现违规，举报不成立",
    );
    setError("");
  };
  const submitReport = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      await api(`/admin/reports/${handlingReport.id}/handle`, {
        method: "POST",
        body: JSON.stringify({
          status: reportStatus,
          result: reportResult.trim(),
        }),
      });
      setNotice(
        reportStatus === 2
          ? "举报已判定成立，目标内容已自动处置"
          : "举报已驳回，目标内容保持不变",
      );
      setHandlingReport(null);
      await load();
      refreshOverview();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };
  const formatAuditTime = (value) =>
    value ? value.replace("T", " ").slice(0, 16) : "未填写";
  if (loading) return <div className="admin-loading">正在加载管理数据…</div>;
  if (error)
    return (
      <div className="admin-error panel">
        <WarningCircle />
        {error}
        <button onClick={load}>重试</button>
      </div>
    );
  if (!rows.length)
    return (
      <EmptyState
        icon={
          section === "users"
            ? Users
            : section === "reports"
              ? Flag
              : ClipboardText
        }
        title="当前没有待处理数据"
        text="新数据出现后会自动进入相应管理列表"
      />
    );
  return (
    <>
      {notice && (
        <div className="profile-success">
          <CheckCircle />
          {notice}
        </div>
      )}
      <div className="admin-data-list">
        {rows.map((row) => (
          <div className="admin-data-row" key={row.id}>
            <div>
              <strong>
                {row.nickname ||
                  row.username ||
                  row.title ||
                  row.description ||
                  `记录 #${row.id}`}
              </strong>
              <span>
                {section === "users"
                  ? `${row.username} · ${row.college || "学院未填写"}`
                  : section === "reports"
                    ? `举报人：${row.reporterName || row.reporterId} · ${["", "用户", "帖子", "表白", "评论", "活动", "私信"][row.bizType] || "未知目标"} #${row.bizId}`
                    : row.content || row.location || `提交人编号 ${row.userId}`}
              </span>
            </div>
            <span className={`status-pill status-${row.status}`}>
              {section === "users"
                ? row.status === 1
                  ? "正常"
                  : "已封禁"
                : section === "reports"
                  ? ["待处理", "核查中", "成立", "不成立"][row.status] || "未知"
                  : section === "published"
                    ? row.status === 1
                      ? "已发布"
                      : "已下架"
                    : "待审核"}
            </span>
            <time>
              {(row.createdAt || row.updatedAt || "")
                .replace("T", " ")
                .slice(0, 16) || "—"}
            </time>
            <div className="admin-row-actions">
              {section === "users" ? (
                <button
                  disabled={submitting || row.id === authStore.userId()}
                  onClick={() => userStatus(row)}
                >
                  {row.id === authStore.userId()
                    ? "当前账号"
                    : row.status === 1
                      ? "封禁"
                      : "解封"}
                </button>
              ) : section === "reports" ? (
                row.status < 2 ? (
                  <>
                    <button
                      className="approve"
                      disabled={submitting}
                      onClick={() => handleReport(row, 2)}
                    >
                      判定成立
                    </button>
                    <button
                      disabled={submitting}
                      onClick={() => handleReport(row, 3)}
                    >
                      判定不成立
                    </button>
                  </>
                ) : (
                  <span className="report-result-text">
                    {row.handleResult || "已完成处理"}
                  </span>
                )
              ) : section === "published" ? (
                <button
                  className={row.status === 1 ? "reject-confirm" : "approve"}
                  disabled={submitting}
                  onClick={() => togglePostStatus(row)}
                >
                  {row.status === 1 ? "下架" : "恢复上架"}
                </button>
              ) : (
                <>
                  {section === "activities" && (
                    <button onClick={() => setViewingActivity(row)}>
                      详情
                    </button>
                  )}
                  <button
                    className="approve"
                    disabled={submitting}
                    onClick={() => audit(row, 1)}
                  >
                    通过
                  </button>
                  <button disabled={submitting} onClick={() => audit(row, 2)}>
                    驳回
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
      {viewingActivity && (
        <div
          className="admin-modal-backdrop"
          onMouseDown={() => setViewingActivity(null)}
        >
          <section
            className="admin-reject-modal activity-audit-modal"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div>
              <CalendarBlank />
              <h3>活动审核详情</h3>
            </div>
            {viewingActivity.posterUrl && (
              <img
                className="activity-audit-poster"
                src={viewingActivity.posterUrl}
                alt="活动海报"
              />
            )}
            <h4>{viewingActivity.title}</h4>
            <dl>
              <div>
                <dt>活动地点</dt>
                <dd>{viewingActivity.location || "未填写"}</dd>
              </div>
              <div>
                <dt>开始时间</dt>
                <dd>{formatAuditTime(viewingActivity.startAt)}</dd>
              </div>
              <div>
                <dt>结束时间</dt>
                <dd>{formatAuditTime(viewingActivity.endAt)}</dd>
              </div>
              <div>
                <dt>报名截止</dt>
                <dd>{formatAuditTime(viewingActivity.signupDeadline)}</dd>
              </div>
              <div>
                <dt>人数上限</dt>
                <dd>{viewingActivity.capacity || 0} 人</dd>
              </div>
            </dl>
            <p className="activity-audit-content">
              {viewingActivity.content || "暂无活动介绍"}
            </p>
            <div className="editor-actions">
              <button
                type="button"
                className="portal-secondary"
                onClick={() => setViewingActivity(null)}
              >
                关闭
              </button>
              <button
                type="button"
                disabled={submitting}
                onClick={() => {
                  setViewingActivity(null);
                  audit(viewingActivity, 2);
                }}
              >
                驳回
              </button>
              <button
                type="button"
                className="portal-primary"
                disabled={submitting}
                onClick={() => {
                  const row = viewingActivity;
                  setViewingActivity(null);
                  audit(row, 1);
                }}
              >
                通过审核
              </button>
            </div>
          </section>
        </div>
      )}
      {rejecting && (
        <div
          className="admin-modal-backdrop"
          onMouseDown={() => setRejecting(null)}
        >
          <form
            className="admin-reject-modal"
            onMouseDown={(event) => event.stopPropagation()}
            onSubmit={(event) => {
              event.preventDefault();
              submitAudit(rejecting, 2, reason);
            }}
          >
            <div>
              <WarningCircle />
              <h3>驳回{reviewKinds[section][0]}</h3>
            </div>
            <p>驳回后内容不会公开展示，发布者可以在“我的内容”中查看原因。</p>
            <label>
              驳回原因
              <textarea
                autoFocus
                required
                maxLength="255"
                value={reason}
                onChange={(event) => setReason(event.target.value)}
                placeholder="请填写明确的驳回原因"
              />
            </label>
            <div className="editor-actions">
              <button
                type="button"
                className="portal-secondary"
                onClick={() => setRejecting(null)}
              >
                取消
              </button>
              <button
                disabled={submitting || !reason.trim()}
                className="reject-confirm"
                type="submit"
              >
                {submitting ? "处理中…" : "确认驳回"}
              </button>
            </div>
          </form>
        </div>
      )}
      {handlingReport && (
        <div
          className="admin-modal-backdrop"
          onMouseDown={() => setHandlingReport(null)}
        >
          <form
            className="admin-reject-modal report-handle-modal"
            onMouseDown={(event) => event.stopPropagation()}
            onSubmit={submitReport}
          >
            <div>
              <Flag />
              <h3>{reportStatus === 2 ? "确认举报成立" : "确认举报不成立"}</h3>
            </div>
            <p>
              {reportStatus === 2
                ? "确认后系统将自动处置目标：封禁用户或下架帖子、表白、评论、活动及私信。"
                : "确认后目标内容保持不变，并将处理结论通知举报人。"}
            </p>
            <label>
              处理结论
              <textarea
                autoFocus
                required
                maxLength="500"
                value={reportResult}
                onChange={(event) => setReportResult(event.target.value)}
                placeholder="请输入清晰的核查结果"
              />
            </label>
            {error && (
              <div className="admin-error">
                <WarningCircle />
                {error}
              </div>
            )}
            <div className="editor-actions">
              <button
                type="button"
                className="portal-secondary"
                onClick={() => setHandlingReport(null)}
              >
                取消
              </button>
              <button
                disabled={submitting || !reportResult.trim()}
                className={
                  reportStatus === 2 ? "reject-confirm" : "portal-primary"
                }
                type="submit"
              >
                {submitting ? "处理中…" : "确认提交"}
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}

function AdminSettings({ type }) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const sensitive = type === "sensitive";
  const path = sensitive ? "/admin/sensitive-words" : "/admin/categories";
  const load = async () => {
    setLoading(true);
    try {
      setRows(await api(path));
      setError("");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    load();
  }, [type]);
  const create = async () => {
    const name = window.prompt(sensitive ? "请输入敏感词" : "请输入板块名称");
    if (!name) return;
    const body = sensitive
      ? { word: name, level: 2, status: 1 }
      : {
          name,
          code:
            window.prompt("请输入英文板块编码（小写）", "new-section") ||
            "new-section",
          description: "",
          sortNo: rows.length + 1,
          status: 1,
        };
    try {
      await api(path, { method: "POST", body: JSON.stringify(body) });
      await load();
    } catch (err) {
      setError(err.message);
    }
  };
  const toggle = async (row) => {
    const body = sensitive
      ? { word: row.word, level: row.level, status: row.status === 1 ? 0 : 1 }
      : {
          name: row.name,
          code: row.code,
          description: row.description || "",
          sortNo: row.sortNo,
          status: row.status === 1 ? 0 : 1,
        };
    await api(`${path}/${row.id}`, {
      method: "PUT",
      body: JSON.stringify(body),
    });
    await load();
  };
  const remove = async (row) => {
    if (!window.confirm(`确认删除“${row.word}”吗？`)) return;
    await api(`${path}/${row.id}`, { method: "DELETE" });
    await load();
  };
  return (
    <>
      <div className="admin-toolbar">
        <button className="portal-primary" onClick={create}>
          <Plus />
          {sensitive ? "新增敏感词" : "新增板块"}
        </button>
      </div>
      <div className="admin-table">
        <div className="admin-table-head">
          <span>{sensitive ? "敏感词" : "板块名称 / 编码"}</span>
          <span>规则</span>
          <span>状态</span>
          <span>操作</span>
        </div>
        {loading ? (
          <div className="admin-loading">正在加载配置…</div>
        ) : error ? (
          <div className="admin-error panel">
            <WarningCircle />
            {error}
          </div>
        ) : !rows.length ? (
          <EmptyState title="暂无配置" text="点击右上角按钮添加第一条配置" />
        ) : (
          <div className="admin-data-list">
            {rows.map((row) => (
              <div className="admin-data-row" key={row.id}>
                <div>
                  <strong>{row.word || row.name}</strong>
                  <span>
                    {sensitive
                      ? row.level === 2
                        ? "命中后拦截提交"
                        : "命中后替换"
                      : `${row.code} · ${row.description || "暂无描述"}`}
                  </span>
                </div>
                <span>
                  {sensitive ? `等级 ${row.level}` : `排序 ${row.sortNo}`}
                </span>
                <span
                  className={`status-pill status-${row.status === 1 ? 1 : 2}`}
                >
                  {row.status === 1 ? "启用" : "停用"}
                </span>
                <div className="admin-row-actions">
                  <button onClick={() => toggle(row)}>
                    {row.status === 1 ? "停用" : "启用"}
                  </button>
                  {sensitive && (
                    <button onClick={() => remove(row)}>删除</button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

function AdminContent() {
  const [tab, setTab] = useState("news");
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState(null);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  const labels = { news: "校园新闻", notices: "系统公告", banners: "轮播图" };
  const localTime = (date) =>
    new Date(date.getTime() - date.getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 16);
  const emptyForm = () => {
    const now = new Date();
    return {
      title: "",
      summary: "",
      content: "",
      coverUrl: "",
      source: "校方",
      top: false,
      targetType: 0,
      imageUrl: "",
      linkUrl: "",
      sortNo: rows.length + 1,
      startAt: localTime(now),
      endAt: localTime(new Date(now.getTime() + 30 * 86400000)),
    };
  };
  const [form, setForm] = useState(emptyForm);
  const load = async () => {
    setLoading(true);
    try {
      const data = await api(`/admin/${tab}?size=50`);
      setRows(data.records || data || []);
      setError("");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    load();
  }, [tab]);
  const openCreate = () => {
    setForm(emptyForm());
    setError("");
    setEditing({ id: null });
  };
  const openEdit = (row) => {
    setForm({
      ...emptyForm(),
      ...row,
      top: row.isTop === 1 || row.top === true,
      startAt: row.startAt?.slice(0, 16) || emptyForm().startAt,
      endAt: row.endAt?.slice(0, 16) || emptyForm().endAt,
    });
    setError("");
    setEditing({ id: row.id });
  };
  const save = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      let body;
      if (tab === "news")
        body = {
          title: form.title,
          summary: form.summary,
          content: form.content,
          coverUrl: form.coverUrl,
          source: form.source,
          top: form.top,
        };
      else if (tab === "notices")
        body = {
          title: form.title,
          content: form.content,
          targetType: Number(form.targetType),
          top: form.top,
        };
      else
        body = {
          title: form.title,
          imageUrl: form.imageUrl,
          linkUrl: form.linkUrl,
          sortNo: Number(form.sortNo),
          startAt: form.startAt,
          endAt: form.endAt,
        };
      await api(`/admin/${tab}${editing.id ? `/${editing.id}` : ""}`, {
        method: editing.id ? "PUT" : "POST",
        body: JSON.stringify(body),
      });
      setEditing(null);
      setNotice(
        `${labels[tab]}${editing.id ? "更新" : "创建"}成功${!editing.id && tab !== "banners" ? "，请在列表中点击发布" : ""}`,
      );
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };
  const publish = async (row) => {
    try {
      await api(
        `/admin/${tab}/${row.id}/${row.status === 1 ? "unpublish" : "publish"}`,
        { method: "POST" },
      );
      setNotice(row.status === 1 ? "内容已下架" : "内容已发布");
      await load();
    } catch (err) {
      setError(err.message);
    }
  };
  const removeBanner = async (row) => {
    if (!window.confirm("确认删除该轮播图吗？")) return;
    await api(`/admin/banners/${row.id}`, { method: "DELETE" });
    await load();
  };
  const change = (key, value) => setForm({ ...form, [key]: value });
  return (
    <>
      <FilterBar
        tabs={Object.entries(labels).map(([, label]) => label)}
        active={labels[tab]}
        onChange={(label) => {
          setTab(Object.keys(labels).find((key) => labels[key] === label));
          setNotice("");
        }}
        search={false}
        extra={
          <button className="portal-primary" onClick={openCreate}>
            <Plus />
            新建{labels[tab]}
          </button>
        }
      />
      {notice && (
        <div className="profile-success">
          <CheckCircle />
          {notice}
        </div>
      )}
      <div className="admin-table">
        <div className="admin-table-head">
          <span>标题</span>
          <span>类型</span>
          <span>状态</span>
          <span>操作</span>
        </div>
        {loading ? (
          <div className="admin-loading">正在加载内容…</div>
        ) : error && !editing ? (
          <div className="admin-error panel">
            <WarningCircle />
            {error}
          </div>
        ) : !rows.length ? (
          <EmptyState
            title={`暂无${labels[tab]}`}
            text="点击新建按钮发布第一条内容"
          />
        ) : (
          <div className="admin-data-list">
            {rows.map((row) => (
              <div className="admin-data-row" key={row.id}>
                <div>
                  <strong>{row.title}</strong>
                  <span>{row.summary || row.content || row.imageUrl}</span>
                </div>
                <span>{labels[tab]}</span>
                <span
                  className={`status-pill status-${row.status === 1 ? 1 : 2}`}
                >
                  {tab === "banners"
                    ? "展示中"
                    : row.status === 1
                      ? "已发布"
                      : "草稿"}
                </span>
                <div className="admin-row-actions">
                  <button onClick={() => openEdit(row)}>编辑</button>
                  {tab === "banners" ? (
                    <button onClick={() => removeBanner(row)}>删除</button>
                  ) : (
                    <button className="approve" onClick={() => publish(row)}>
                      {row.status === 1 ? "下架" : "发布"}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      {editing && (
        <div
          className="admin-modal-backdrop"
          onMouseDown={() => setEditing(null)}
        >
          <form
            className="admin-content-modal"
            onMouseDown={(event) => event.stopPropagation()}
            onSubmit={save}
          >
            <div className="admin-content-modal-head">
              <div>
                <span>CONTENT EDITOR</span>
                <h3>
                  {editing.id ? "编辑" : "新建"}
                  {labels[tab]}
                </h3>
              </div>
              <button type="button" onClick={() => setEditing(null)}>
                <X />
              </button>
            </div>
            <label>
              标题
              <input
                autoFocus
                required
                maxLength={tab === "banners" ? 100 : 150}
                value={form.title}
                onChange={(e) => change("title", e.target.value)}
              />
            </label>
            {tab === "news" && (
              <>
                <label>
                  摘要
                  <textarea
                    maxLength="500"
                    value={form.summary || ""}
                    onChange={(e) => change("summary", e.target.value)}
                  />
                </label>
                <label>
                  正文
                  <textarea
                    className="content-textarea"
                    required
                    value={form.content || ""}
                    onChange={(e) => change("content", e.target.value)}
                  />
                </label>
                <label>
                  来源
                  <input
                    maxLength="100"
                    value={form.source || ""}
                    onChange={(e) => change("source", e.target.value)}
                  />
                </label>
                <ImageUploader
                  label="上传新闻封面"
                  value={form.coverUrl ? [form.coverUrl] : []}
                  onChange={(urls) => change("coverUrl", urls[0] || "")}
                />
              </>
            )}
            {tab === "notices" && (
              <>
                <label>
                  公告正文
                  <textarea
                    className="content-textarea"
                    required
                    value={form.content || ""}
                    onChange={(e) => change("content", e.target.value)}
                  />
                </label>
                <label>
                  通知范围
                  <select
                    value={form.targetType}
                    onChange={(e) => change("targetType", e.target.value)}
                  >
                    <option value="0">全部用户</option>
                    <option value="1">普通用户</option>
                    <option value="2">管理员</option>
                  </select>
                </label>
              </>
            )}
            {tab === "banners" && (
              <>
                <ImageUploader
                  label="上传轮播图片"
                  value={form.imageUrl ? [form.imageUrl] : []}
                  onChange={(urls) => change("imageUrl", urls[0] || "")}
                />
                <label>
                  跳转地址
                  <input
                    maxLength="500"
                    value={form.linkUrl || ""}
                    onChange={(e) => change("linkUrl", e.target.value)}
                    placeholder="选填"
                  />
                </label>
                <div className="field-grid">
                  <label>
                    开始展示
                    <input
                      required
                      type="datetime-local"
                      value={form.startAt}
                      onChange={(e) => change("startAt", e.target.value)}
                    />
                  </label>
                  <label>
                    结束展示
                    <input
                      required
                      min={form.startAt}
                      type="datetime-local"
                      value={form.endAt}
                      onChange={(e) => change("endAt", e.target.value)}
                    />
                  </label>
                  <label>
                    排序
                    <input
                      type="number"
                      value={form.sortNo}
                      onChange={(e) => change("sortNo", e.target.value)}
                    />
                  </label>
                </div>
              </>
            )}
            {tab !== "banners" && (
              <label className="admin-check">
                <input
                  type="checkbox"
                  checked={form.top}
                  onChange={(e) => change("top", e.target.checked)}
                />
                置顶显示
              </label>
            )}
            {error && (
              <div className="admin-error">
                <WarningCircle />
                {error}
              </div>
            )}
            <div className="editor-actions">
              <button
                type="button"
                className="portal-secondary"
                onClick={() => setEditing(null)}
              >
                取消
              </button>
              <button
                disabled={busy || (tab === "banners" && !form.imageUrl)}
                className="portal-primary"
                type="submit"
              >
                <Check />
                {busy ? "保存中…" : "保存内容"}
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}

function AdminPasswordReset() {
  const [form, setForm] = useState({ userId: "", newPassword: "" });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const submit = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError("");
    setNotice("");
    try {
      await api(`/admin/users/${form.userId}/reset-password`, {
        method: "POST",
        body: JSON.stringify({ newPassword: form.newPassword }),
      });
      setNotice(`用户 #${form.userId} 的密码已重置，旧登录状态已失效`);
      setForm({ ...form, newPassword: "" });
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };
  return (
    <form className="profile-form security-form" onSubmit={submit}>
      <div className="security-intro">
        <ShieldCheck weight="duotone" />
        <div>
          <h3>管理员重置用户密码</h3>
          <p>从“用户管理”查看用户编号。重置后，该用户所有刷新令牌立即失效。</p>
        </div>
      </div>
      <label>
        用户编号
        <input
          required
          type="number"
          min="1"
          value={form.userId}
          onChange={(e) => setForm({ ...form, userId: e.target.value })}
          placeholder="例如：15"
        />
      </label>
      <label>
        新密码
        <input
          required
          type="password"
          minLength="8"
          maxLength="72"
          value={form.newPassword}
          onChange={(e) => setForm({ ...form, newPassword: e.target.value })}
          placeholder="至少 8 位"
        />
      </label>
      {error && (
        <div className="admin-error">
          <WarningCircle />
          {error}
        </div>
      )}
      {notice && (
        <div className="profile-success">
          <CheckCircle />
          {notice}
        </div>
      )}
      <button disabled={busy} className="portal-primary" type="submit">
        <ShieldCheck />
        {busy ? "重置中…" : "确认重置密码"}
      </button>
    </form>
  );
}

function AdminOverview() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  useEffect(() => {
    api("/admin/overview")
      .then(setData)
      .catch((err) => setError(err.message));
  }, []);
  if (error)
    return (
      <div className="admin-error panel">
        <WarningCircle />
        {error}
      </div>
    );
  if (!data) return <div className="admin-loading">正在统计运营数据…</div>;
  const pendingContent = data.pendingPosts + data.pendingConfesses;
  const queue = [
    ["待审核帖子", data.pendingPosts, "/admin/reviews"],
    ["待审核表白", data.pendingConfesses, "/admin/confesses"],
    ["待审核活动", data.pendingActivities, "/admin/activities"],
    ["待处理举报", data.pendingReports, "/admin/reports"],
  ];
  const maxQueue = Math.max(1, ...queue.map((item) => item[1]));
  return (
    <>
      <StatStrip
        items={[
          ["用户总数", String(data.totalUsers), Users],
          ["待审核内容", String(pendingContent), ClipboardText],
          ["待审核活动", String(data.pendingActivities), CalendarBlank],
          ["待处理举报", String(data.pendingReports), Flag],
        ]}
      />
      <div className="admin-overview-grid">
        <section className="overview-panel">
          <div className="overview-panel-head">
            <div>
              <span>PROCESSING QUEUE</span>
              <h3>待办队列</h3>
            </div>
            <ClipboardText />
          </div>
          <div className="overview-bars">
            {queue.map(([label, value, path]) => (
              <Link to={path} key={label}>
                <div>
                  <span>{label}</span>
                  <strong>{value}</strong>
                </div>
                <i>
                  <b
                    style={{
                      width: `${Math.max(value ? 8 : 0, (value / maxQueue) * 100)}%`,
                    }}
                  />
                </i>
              </Link>
            ))}
          </div>
        </section>
        <section className="overview-panel">
          <div className="overview-panel-head">
            <div>
              <span>COMMUNITY STATUS</span>
              <h3>社区状态</h3>
            </div>
            <Users />
          </div>
          <div className="overview-metrics">
            <div>
              <strong>{data.activeUsers}</strong>
              <span>正常用户</span>
            </div>
            <div>
              <strong>{data.bannedUsers}</strong>
              <span>封禁用户</span>
            </div>
            <div>
              <strong>{data.publishedPosts}</strong>
              <span>已发布帖子</span>
            </div>
          </div>
          <Link className="portal-secondary overview-link" to="/admin/users">
            查看用户管理
            <CaretRight />
          </Link>
        </section>
      </div>
    </>
  );
}

export function AdminPage() {
  const { section = "overview" } = useParams();
  const navigate = useNavigate();
  const current =
    adminSections.find(([key]) => key === section) || adminSections[0];
  const logout = () => {
    authStore.clear();
    navigate("/admin/login", { replace: true });
  };
  const supported = [
    "users",
    "verifications",
    "reviews",
    "published",
    "confesses",
    "activities",
    "reports",
  ].includes(section);
  return (
    <PortalLayout title="管理员后台" eyebrow="ADMIN CONSOLE" wide>
      <div className="admin-layout">
        <aside className="admin-sidebar">
          <div className="admin-mark">
            <ShieldCheck weight="fill" />
            <div>
              <strong>运营工作台</strong>
              <span>管理员权限</span>
            </div>
          </div>
          {adminSections.map(([key, label, Icon]) => (
            <NavLink
              key={key}
              to={`/admin/${key}`}
              className={section === key ? "active" : ""}
            >
              <Icon />
              {label}
              <CaretRight />
            </NavLink>
          ))}
        </aside>
        <section className="admin-content">
          <div className="admin-content-head">
            <div>
              <span>ADMIN MODULE</span>
              <h2>{current[1]}</h2>
            </div>
            <button className="portal-secondary" onClick={logout}>
              <SignOut />
              退出后台
            </button>
          </div>
          {section === "overview" ? (
            <AdminOverview />
          ) : section === "passwords" ? (
            <AdminPasswordReset />
          ) : supported ? (
            <div className="admin-table">
              <div className="admin-table-head">
                <span>名称 / 内容</span>
                <span>状态</span>
                <span>更新时间</span>
                <span>操作</span>
              </div>
              <AdminRows section={section} refreshOverview={() => {}} />
            </div>
          ) : section === "content" ? (
            <AdminContent />
          ) : section === "categories" || section === "sensitive" ? (
            <AdminSettings type={section} />
          ) : (
            <EmptyState
              icon={current[2]}
              title={`${current[1]}即将接入`}
              text="该模块正在建设中"
            />
          )}
        </section>
      </div>
    </PortalLayout>
  );
}
