import { adminApi } from "./admin-api.js";

const TOKEN_KEY = "nanasakara_admin_token";
const USER_KEY = "nanasakara_admin_user";

export const auth = {
  getToken: () => {
    try {
      return localStorage.getItem(TOKEN_KEY) || "";
    } catch {
      return "";
    }
  },
  getUser: () => {
    try {
      const raw = localStorage.getItem(USER_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },
  setSession: ({ token, user }) => {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  },
  clear: () => {
    try {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    } catch {}
  },
  ensure: async () => {
    const token = auth.getToken();
    if (!token) return { ok: false };
    const res = await adminApi.me(token);
    if (!res.ok) return { ok: false };
    auth.setSession({ token, user: res.data.user });
    return { ok: true, user: res.data.user, token };
  },
  logout: async () => {
    const token = auth.getToken();
    if (token) await adminApi.logout(token);
    auth.clear();
  },
};

