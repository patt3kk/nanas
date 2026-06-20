import { API_BASE_URL } from "../../js/config.js";

const withTimeout = async (promise, ms = 12000) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), ms);
  try {
    const result = await promise(controller.signal);
    return result;
  } finally {
    clearTimeout(timeoutId);
  }
};

const normalize = async (fn) => {
  try {
    const data = await fn();
    return { ok: true, data };
  } catch (e) {
    return { ok: false, error: { message: e?.message || "Something went wrong" } };
  }
};

const jsonRequest = async (path, { method = "GET", body, token } = {}) => {
  const url = `${API_BASE_URL}${path}`;
  return withTimeout(async (signal) => {
    const res = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
      signal,
    });
    const contentType = res.headers.get("Content-Type") || "";
    const payload = contentType.includes("application/json") ? await res.json() : await res.text();
    if (!res.ok) throw new Error((payload && payload.message) || `Request failed (${res.status})`);
    return payload;
  });
};

const formRequest = async (path, { method = "POST", formData, token } = {}) => {
  const url = `${API_BASE_URL}${path}`;
  return withTimeout(async (signal) => {
    const res = await fetch(url, {
      method,
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: formData,
      signal,
    });
    const payload = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(payload?.message || `Request failed (${res.status})`);
    return payload;
  });
};

export const adminApi = {
  login: (payload) =>
    normalize(async () => {
      return jsonRequest("/api/auth/admin/login", { method: "POST", body: payload });
    }),
  me: (token) =>
    normalize(async () => {
      return jsonRequest("/api/auth/me", { token });
    }),
  logout: (token) =>
    normalize(async () => {
      return jsonRequest("/api/auth/logout", { method: "POST", token });
    }),

  overview: (token) =>
    normalize(async () => {
      return jsonRequest("/api/admin/analytics/overview", { token });
    }),

  listCategories: (token) =>
    normalize(async () => {
      return jsonRequest("/api/admin/categories", { token });
    }),

  listMenuItems: ({ token, q }) =>
    normalize(async () => {
      const qs = q ? `?q=${encodeURIComponent(q)}` : "";
      return jsonRequest(`/api/admin/menu-items${qs}`, { token });
    }),
  createMenuItem: ({ token, payload }) =>
    normalize(async () => {
      return jsonRequest("/api/admin/menu-items", { method: "POST", body: payload, token });
    }),
  updateMenuItem: ({ token, id, payload }) =>
    normalize(async () => {
      return jsonRequest(`/api/admin/menu-items/${encodeURIComponent(id)}`, { method: "PUT", body: payload, token });
    }),
  deleteMenuItem: ({ token, id }) =>
    normalize(async () => {
      return jsonRequest(`/api/admin/menu-items/${encodeURIComponent(id)}`, { method: "DELETE", token });
    }),
  uploadMenuImages: ({ token, id, files }) =>
    normalize(async () => {
      const fd = new FormData();
      [...files].forEach((f) => fd.append("images", f));
      return formRequest(`/api/admin/menu-items/${encodeURIComponent(id)}/images`, { formData: fd, token });
    }),

  listOrders: ({ token, q }) =>
    normalize(async () => {
      const qs = q ? `?q=${encodeURIComponent(q)}` : "";
      return jsonRequest(`/api/admin/orders${qs}`, { token });
    }),
  updateOrder: ({ token, id, payload }) =>
    normalize(async () => {
      return jsonRequest(`/api/admin/orders/${encodeURIComponent(id)}`, { method: "PUT", body: payload, token });
    }),

  listCustomers: ({ token, q }) =>
    normalize(async () => {
      const qs = q ? `?q=${encodeURIComponent(q)}` : "";
      return jsonRequest(`/api/admin/customers${qs}`, { token });
    }),
  listCustomerOrders: ({ token, id }) =>
    normalize(async () => {
      return jsonRequest(`/api/admin/customers/${encodeURIComponent(id)}/orders`, { token });
    }),

  listContactMessages: ({ token, q }) =>
    normalize(async () => {
      const qs = q ? `?q=${encodeURIComponent(q)}` : "";
      return jsonRequest(`/api/admin/contact-messages${qs}`, { token });
    }),
  updateContactMessage: ({ token, id, payload }) =>
    normalize(async () => {
      return jsonRequest(`/api/admin/contact-messages/${encodeURIComponent(id)}`, { method: "PUT", body: payload, token });
    }),
  deleteContactMessage: ({ token, id }) =>
    normalize(async () => {
      return jsonRequest(`/api/admin/contact-messages/${encodeURIComponent(id)}`, { method: "DELETE", token });
    }),

  listCareerApplications: ({ token, q }) =>
    normalize(async () => {
      const qs = q ? `?q=${encodeURIComponent(q)}` : "";
      return jsonRequest(`/api/admin/career-applications${qs}`, { token });
    }),
  updateCareerApplication: ({ token, id, payload }) =>
    normalize(async () => {
      return jsonRequest(`/api/admin/career-applications/${encodeURIComponent(id)}`, { method: "PUT", body: payload, token });
    }),

  listUsers: ({ token, q }) =>
    normalize(async () => {
      const qs = q ? `?q=${encodeURIComponent(q)}` : "";
      return jsonRequest(`/api/admin/users${qs}`, { token });
    }),
  createUser: ({ token, payload }) =>
    normalize(async () => {
      return jsonRequest("/api/admin/users", { method: "POST", body: payload, token });
    }),
  updateUser: ({ token, id, payload }) =>
    normalize(async () => {
      return jsonRequest(`/api/admin/users/${encodeURIComponent(id)}`, { method: "PUT", body: payload, token });
    }),
  deleteUser: ({ token, id }) =>
    normalize(async () => {
      return jsonRequest(`/api/admin/users/${encodeURIComponent(id)}`, { method: "DELETE", token });
    }),
  resetUserPassword: ({ token, id, password }) =>
    normalize(async () => {
      return jsonRequest(`/api/admin/users/${encodeURIComponent(id)}/reset-password`, {
        method: "POST",
        body: { password },
        token,
      });
    }),

  getSettings: (token) =>
    normalize(async () => {
      return jsonRequest("/api/admin/settings", { token });
    }),
  updateSettings: ({ token, payload }) =>
    normalize(async () => {
      return jsonRequest("/api/admin/settings", { method: "PUT", body: payload, token });
    }),
};

