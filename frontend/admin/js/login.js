import { adminApi } from "./admin-api.js";
import { auth } from "./auth.js";

const qs = (sel, root = document) => root.querySelector(sel);

const init = async () => {
  const form = qs("[data-admin-login-form]");
  const btn = qs("[data-admin-login-btn]");
  const err = qs("[data-admin-login-error]");
  const cont = qs("[data-admin-continue]");

  const session = await auth.ensure();
  if (session.ok) {
    if (cont) cont.hidden = false;
  }

  form?.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (err) err.textContent = "";
    const payload = Object.fromEntries(new FormData(form).entries());
    if (btn) {
      btn.disabled = true;
      btn.setAttribute("aria-busy", "true");
      btn.textContent = "Signing in…";
    }

    const res = await adminApi.login(payload);
    if (btn) {
      btn.disabled = false;
      btn.setAttribute("aria-busy", "false");
      btn.textContent = "Sign In";
    }

    if (!res.ok) {
      if (err) err.textContent = res.error.message;
      return;
    }

    auth.setSession({ token: res.data.token, user: res.data.user });
    const url = new URL(window.location.href);
    const redirect = url.searchParams.get("redirect") || "dashboard.html";
    window.location.href = redirect;
  });
};

init();

