import { API_BASE_URL } from "./config.js";

const withTimeout = async (promise, ms = 10000) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), ms);
  try {
    const result = await promise(controller.signal);
    return result;
  } finally {
    clearTimeout(timeoutId);
  }
};

const jsonRequest = async (path, { method = "GET", body, headers } = {}) => {
  const url = `${API_BASE_URL}${path}`;
  return withTimeout(async (signal) => {
    const res = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        ...(headers || {}),
      },
      body: body ? JSON.stringify(body) : undefined,
      signal,
    });
    const contentType = res.headers.get("Content-Type") || "";
    const payload = contentType.includes("application/json")
      ? await res.json()
      : await res.text();
    if (!res.ok) {
      const message =
        (payload && payload.message) || `Request failed (${res.status})`;
      throw new Error(message);
    }
    return payload;
  });
};

const normalize = async (fn) => {
  try {
    const data = await fn();
    return { ok: true, data };
  } catch (e) {
    return {
      ok: false,
      error: { message: e?.message || "Something went wrong" },
    };
  }
};

export const api = {
  fetchMenuItems: () =>
    normalize(async () => {
      return jsonRequest("/api/menu");
    }),

  fetchCategories: () =>
    normalize(async () => {
      return jsonRequest("/api/categories");
    }),

  fetchTestimonials: () =>
    normalize(async () => {
      return jsonRequest("/api/testimonials");
    }),

  fetchSettings: () =>
    normalize(async () => {
      return jsonRequest("/api/settings");
    }),

  submitNewsletter: (payload) =>
    normalize(async () => {
      return jsonRequest("/api/newsletter", { method: "POST", body: payload });
    }),

  submitContactForm: (payload) =>
    normalize(async () => {
      return jsonRequest("/api/contact", { method: "POST", body: payload });
    }),

  submitCareerApplication: (formData) =>
    normalize(async () => {
      return withTimeout(async (signal) => {
        const res = await fetch(`${API_BASE_URL}/api/careers`, {
          method: "POST",
          body: formData,
          signal,
        });
        const payload = await res.json().catch(() => ({}));
        if (!res.ok) {
          throw new Error(payload?.message || `Request failed (${res.status})`);
        }
        return payload;
      });
    }),

  createOrder: (payload) =>
    normalize(async () => {
      return jsonRequest("/api/orders", { method: "POST", body: payload });
    }),

  initializePaystackPayment: (payload) =>
    normalize(async () => {
      return jsonRequest("/api/payments/initialize", {
        method: "POST",
        body: payload,
      });
    }),

  verifyOrderPayment: (reference) =>
    normalize(async () => {
      if (!reference) throw new Error("Missing payment reference");
      return jsonRequest(`/api/orders/verify/${encodeURIComponent(reference)}`);
    }),
};
