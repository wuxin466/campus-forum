const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api";

const ACCESS_KEY = "campus-access-token";
const REFRESH_KEY = "campus-refresh-token";

export const authStore = {
  access: () => localStorage.getItem(ACCESS_KEY),
  refresh: () => localStorage.getItem(REFRESH_KEY),
  save: (tokens) => {
    localStorage.setItem(ACCESS_KEY, tokens.accessToken);
    localStorage.setItem(REFRESH_KEY, tokens.refreshToken);
  },
  clear: () => {
    localStorage.removeItem(ACCESS_KEY);
    localStorage.removeItem(REFRESH_KEY);
  },
  roles: () => {
    try {
      const payload = JSON.parse(atob((localStorage.getItem(ACCESS_KEY) || "").split(".")[1]));
      return payload.roles || [];
    } catch { return []; }
  },
  isAdmin: () => authStore.roles().some((role) =>
    role === "ADMIN" || role === "SUPER_ADMIN" || role === "ROLE_ADMIN" || role === "ROLE_SUPER_ADMIN"),
  userId: () => {
    try { return Number(JSON.parse(atob((localStorage.getItem(ACCESS_KEY) || "").split(".")[1])).sub); }
    catch { return null; }
  },
};

async function parse(response) {
  const body = await response.json().catch(() => ({}));
  if (!response.ok || body.code !== 200) throw new Error(body.msg || `请求失败（${response.status}）`);
  return body.data;
}

export async function api(path, options = {}, retry = true) {
  const multipart = typeof FormData !== "undefined" && options.body instanceof FormData;
  const headers = { ...(options.body && !multipart ? { "Content-Type": "application/json" } : {}), ...options.headers };
  const token = authStore.access();
  if (token) headers.Authorization = `Bearer ${token}`;
  const response = await fetch(`${API_BASE}${path}`, { ...options, headers });
  if (response.status === 401 && retry && authStore.refresh()) {
    try {
      const tokens = await parse(await fetch(`${API_BASE}/auth/refresh`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken: authStore.refresh() }),
      }));
      authStore.save(tokens);
      return api(path, options, false);
    } catch { authStore.clear(); }
  }
  return parse(response);
}

export const publicFileUrl = (id) => `${API_BASE}/public/files/${id}`;

export async function adminLogin(username, password) {
  const tokens = await api("/auth/login", { method: "POST", body: JSON.stringify({ username, password }) }, false);
  authStore.save(tokens);
  if (!authStore.isAdmin()) {
    authStore.clear();
    throw new Error("该账号不是管理员，请先为账号分配管理员角色");
  }
  return tokens;
}
