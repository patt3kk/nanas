import { BRAND, MENU_ITEMS, TESTIMONIALS, FAQS, OPEN_POSITIONS } from "./data.js";
import { api } from "./api.js";
import { cart, formatNaira } from "./cart.js";
import { initMenuPage } from "./menu.js";
import { initCheckoutPage } from "./checkout.js";
import { initChat } from "./chat.js";
import { ENABLE_MOCK } from "./config.js";

const qs = (sel, root = document) => root.querySelector(sel);
const qsa = (sel, root = document) => [...root.querySelectorAll(sel)];

let siteSettings = null;

const pickText = (...values) => {
  const value = values.find((item) => typeof item === "string" && item.trim());
  return value ? value.trim() : "";
};

const buildWhatsAppLink = ({ phone, message }) => {
  const digits = String(phone || "").replace(/[^\d]/g, "");
  if (!digits) return "#";
  const text = encodeURIComponent(message || BRAND.whatsappMessage);
  return `https://wa.me/${digits}?text=${text}`;
};

const applySocialLink = (label, url) => {
  const anchors = qsa(`a[aria-label="${label}"]`);
  anchors.forEach((anchor) => {
    if (!url) {
      anchor.setAttribute("href", "#");
      anchor.setAttribute("aria-disabled", "true");
      anchor.tabIndex = -1;
      return;
    }
    anchor.href = url;
    anchor.removeAttribute("aria-disabled");
    anchor.removeAttribute("tabindex");
  });
};

const applySiteSettings = (settings) => {
  const contact = settings?.contact || {};
  const socialLinks = settings?.socialLinks || {};

  document.title = pickText(settings?.seo?.title, document.title) || document.title;

  const supportEmail = pickText(contact.email, BRAND.email);
  qsa("a[href^='mailto:']").forEach((anchor) => {
    anchor.href = `mailto:${supportEmail}`;
    anchor.textContent = supportEmail;
  });

  applySocialLink("Instagram", socialLinks.instagram);
  applySocialLink("X", socialLinks.twitter);
  applySocialLink("Facebook", socialLinks.facebook);
};

const loadSiteSettings = async () => {
  const res = await api.fetchSettings();
  if (!res.ok) return null;
  return res.data?.settings || null;
};

const setYear = () => {
  const el = qs("[data-year]");
  if (el) el.textContent = String(new Date().getFullYear());
};

const setActiveNav = () => {
  const path = (location.pathname.split("/").pop() || "index.html").toLowerCase();
  qsa('[data-nav-link]').forEach((a) => {
    const href = (a.getAttribute("href") || "").toLowerCase();
    if (href === path) a.setAttribute("aria-current", "page");
    else a.removeAttribute("aria-current");
  });
};

const setupMobileNav = () => {
  const toggle = qs("[data-nav-toggle]");
  const mobile = qs("[data-mobile-nav]");
  if (!toggle || !mobile) return;

  const setOpen = (open) => {
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
    mobile.hidden = !open;
  };

  setOpen(false);

  toggle.addEventListener("click", () => {
    const open = toggle.getAttribute("aria-expanded") === "true";
    setOpen(!open);
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") setOpen(false);
  });

  mobile.addEventListener("click", (e) => {
    const a = e.target.closest("a");
    if (a) setOpen(false);
  });
};

const setupCartCount = () => {
  const el = qs("[data-cart-count]");
  if (!el) return;

  const render = () => {
    const n = cart.count();
    el.textContent = String(n);
    el.hidden = n === 0;
  };

  window.addEventListener("cart:updated", render);
  render();
};

const setupToast = () => {
  const toast = qs("[data-toast]");
  if (!toast) return;
  let timer = 0;

  const show = (message) => {
    toast.textContent = String(message || "");
    toast.classList.add("is-visible");
    window.clearTimeout(timer);
    timer = window.setTimeout(() => toast.classList.remove("is-visible"), 2200);
  };

  window.addEventListener("ui:toast", (e) => show(e.detail?.message));
};

const setupScrollReveal = () => {
  const nodes = qsa(".fade-in");
  if (!nodes.length) return;

  const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
  if (reduce) {
    nodes.forEach((n) => n.classList.add("is-inview"));
    return;
  }

  if (!("IntersectionObserver" in window)) {
    nodes.forEach((n) => n.classList.add("is-inview"));
    return;
  }

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add("is-inview");
          io.unobserve(e.target);
        }
      });
    },
    { root: null, threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
  );

  nodes.forEach((n) => io.observe(n));
};

const setupWhatsApp = () => {
  const el = qs("[data-whatsapp]");
  if (!el) return;
  const phone = pickText(siteSettings?.contact?.whatsapp, siteSettings?.contact?.phone, BRAND.phone);
  el.href = buildWhatsAppLink({ phone, message: BRAND.whatsappMessage });
};

const setupNewsletter = () => {
  qsa("[data-newsletter-form]").forEach((form) => {
    const input = qs('input[type="email"]', form);
    const btn = qs('button[type="submit"]', form);

    const setBusy = (busy) => {
      if (!btn) return;
      btn.disabled = !!busy;
      btn.setAttribute("aria-busy", busy ? "true" : "false");
    };

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const email = String(input?.value || "").trim();
      if (!email) {
        window.dispatchEvent(
          new CustomEvent("ui:toast", { detail: { message: "Enter your email." } })
        );
        return;
      }

      setBusy(true);
      const res = await api.submitNewsletter({ email, source: window.location.pathname || "/" });
      setBusy(false);
      if (!res.ok) {
        window.dispatchEvent(
          new CustomEvent("ui:toast", { detail: { message: res.error.message } })
        );
        return;
      }
      if (input) input.value = "";
      window.dispatchEvent(
        new CustomEvent("ui:toast", {
          detail: { message: "Welcome—you're subscribed." },
        })
      );
    });
  });
};

const setupContactForm = () => {
  const form = qs("[data-contact-form]");
  if (!form) return;
  const btn = qs('button[type="submit"]', form);

  const setBusy = (busy) => {
    if (!btn) return;
    btn.disabled = !!busy;
    btn.setAttribute("aria-busy", busy ? "true" : "false");
    btn.textContent = busy ? "Sending…" : "Send Message";
  };

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const payload = Object.fromEntries(new FormData(form).entries());
    const required = ["name", "email", "subject", "message"];
    const missing = required.filter((k) => !String(payload[k] || "").trim());
    if (missing.length) {
      window.dispatchEvent(
        new CustomEvent("ui:toast", {
          detail: { message: "Please complete all fields." },
        })
      );
      return;
    }

    setBusy(true);
    const res = await api.submitContactForm(payload);
    setBusy(false);
    if (!res.ok) {
      window.dispatchEvent(
        new CustomEvent("ui:toast", { detail: { message: res.error.message } })
      );
      return;
    }
    form.reset();
    window.dispatchEvent(
      new CustomEvent("ui:toast", {
        detail: { message: "Message received. We’ll reply soon." },
      })
    );
  });
};

const setupCareersForm = () => {
  const form = qs("[data-careers-form]");
  if (!form) return;
  const btn = qs('button[type="submit"]', form);

  const setBusy = (busy) => {
    if (!btn) return;
    btn.disabled = !!busy;
    btn.setAttribute("aria-busy", busy ? "true" : "false");
    btn.textContent = busy ? "Submitting…" : "Submit Application";
  };

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const fd = new FormData(form);
    const required = ["name", "email", "phone", "position", "coverLetter"];
    const missing = required.filter((k) => !String(fd.get(k) || "").trim());
    if (missing.length) {
      window.dispatchEvent(
        new CustomEvent("ui:toast", {
          detail: { message: "Please complete all required fields." },
        })
      );
      return;
    }

    setBusy(true);
    const res = await api.submitCareerApplication(fd);
    setBusy(false);
    if (!res.ok) {
      window.dispatchEvent(
        new CustomEvent("ui:toast", { detail: { message: res.error.message } })
      );
      return;
    }
    form.reset();
    window.dispatchEvent(
      new CustomEvent("ui:toast", {
        detail: { message: "Application received. Thank you." },
      })
    );
  });
};

const renderHomeBestSellers = async () => {
  const wrap = qs("[data-home-bestsellers]");
  if (!wrap) return;
  wrap.innerHTML = `
    <div class="notice" style="grid-column:1/-1;">
      Loading best sellers…
    </div>
  `;

  const res = await api.fetchMenuItems();
  const items = res.ok
    ? (Array.isArray(res.data?.items) ? res.data.items : [])
        .map((m) => ({
          id: String(m._id),
          name: m.name,
          description: m.description || "",
          image: m.images?.[0] || "assets/images/herosect.png",
          price: Number(m.discountedPrice ?? m.price ?? 0),
          bestseller: !!m.isFeatured,
          category: m.category?.name || "",
        }))
        .sort((a, b) => Number(!!b.bestseller) - Number(!!a.bestseller))
        .slice(0, 6)
    : ENABLE_MOCK
      ? MENU_ITEMS.slice(0, 6)
      : [];

  if (items.length === 0) {
    wrap.innerHTML = `
      <div class="notice" style="grid-column:1/-1;">
        Unable to load menu right now.
      </div>
    `;
    return;
  }

  wrap.innerHTML = items
    .map(
      (item) => `
      <article class="card" data-home-item="${item.id}">
        <div class="card-media">
          <img src="${item.image}" alt="${item.name}" loading="lazy" width="800" height="600">
        </div>
        <div class="card-body">
          <h3 class="h3" style="font-size:20px;">${item.name}</h3>
          <p class="muted">${item.description}</p>
          <div class="price-row">
            <div class="price">${formatNaira(item.price)}</div>
            <button type="button" class="btn btn-primary btn-sm" data-home-add="${item.id}">Add to Cart</button>
          </div>
        </div>
      </article>
    `
    )
    .join("");

  if (wrap.getAttribute("data-bound") !== "true") {
    wrap.setAttribute("data-bound", "true");
    wrap.addEventListener("click", (e) => {
      const btn = e.target.closest("button[data-home-add]");
      if (!btn) return;
      const id = btn.getAttribute("data-home-add");
      if (!id) return;
      const item = items.find((i) => String(i.id) === String(id));
      cart.add(
        item
          ? {
              id: item.id,
              name: item.name,
              unitPrice: item.price,
              image: item.image,
              category: item.category,
            }
          : id,
        1
      );
      window.dispatchEvent(
        new CustomEvent("ui:toast", { detail: { message: "Added to cart." } })
      );
    });
  }
};

const renderTestimonials = async () => {
  const wrap = qs("[data-testimonials]");
  if (!wrap) return;
  const res = await api.fetchTestimonials();
  const items = res.ok
    ? (Array.isArray(res.data?.items) ? res.data.items : []).map((item) => ({
        name: item.customerName,
        area: "Customer",
        rating: Number(item.rating || 5),
        quote: item.comment,
      }))
    : TESTIMONIALS;

  wrap.innerHTML = items.map((t) => {
    const stars = Array.from({ length: 5 })
      .map((_, i) => (i < t.rating ? "★" : "☆"))
      .join("");
    return `
      <article class="card" style="min-width:280px; scroll-snap-align:start;">
        <div class="card-body">
          <div class="stars" aria-label="${t.rating} out of 5 stars">${stars}</div>
          <p style="margin-top:8px; font-weight:700; letter-spacing:-.01em;">“${t.quote}”</p>
          <div class="muted" style="margin-top:10px; font-size:13px;">${t.name} • ${t.area}</div>
        </div>
      </article>
    `;
  }).join("");

  const track = wrap;
  track.style.display = "flex";
  track.style.gap = "16px";
  track.style.overflowX = "auto";
  track.style.scrollSnapType = "x mandatory";
  track.style.paddingBottom = "6px";

  const prev = qs("[data-testimonials-prev]");
  const next = qs("[data-testimonials-next]");

  const scrollBy = (dir) => {
    const w = Math.min(340, track.clientWidth);
    track.scrollBy({ left: dir * w, behavior: "smooth" });
  };

  prev?.addEventListener("click", () => scrollBy(-1));
  next?.addEventListener("click", () => scrollBy(1));
};

const renderFaq = () => {
  const wrap = qs("[data-faq]");
  if (!wrap) return;
  wrap.innerHTML = FAQS.map(
    (f, idx) => `
      <details class="card" style="overflow:hidden;">
        <summary style="list-style:none; cursor:pointer; padding:16px 18px; font-weight:850; letter-spacing:-.02em; display:flex; align-items:center; justify-content:space-between; gap:12px;">
          <span>${f.q}</span>
          <span aria-hidden="true" class="muted">${idx === 0 ? "−" : "+"}</span>
        </summary>
        <div style="padding:0 18px 18px; color:var(--muted);">${f.a}</div>
      </details>
    `
  ).join("");

  qsa("details", wrap).forEach((d) => {
    d.addEventListener("toggle", () => {
      const symbol = qs("summary span.muted", d);
      if (!symbol) return;
      symbol.textContent = d.open ? "−" : "+";
    });
  });
};

const renderPositions = () => {
  const wrap = qs("[data-positions]");
  if (!wrap) return;
  wrap.innerHTML = OPEN_POSITIONS.map(
    (p) => `
      <article class="card">
        <div class="card-body">
          <div style="display:flex; align-items:flex-start; justify-content:space-between; gap:12px;">
            <div>
              <h3 class="h3" style="font-size:20px;">${p.title}</h3>
              <div class="muted" style="margin-top:4px;">${p.location} • ${p.type}</div>
            </div>
            <span class="badge">Open</span>
          </div>
          <div style="margin-top:10px; display:flex; gap:10px; flex-wrap:wrap;">
            <a class="btn btn-secondary btn-sm" href="#apply">Apply</a>
            <a class="btn btn-primary btn-sm" href="contact.html">Ask a Question</a>
          </div>
        </div>
      </article>
    `
  ).join("");
};

const init = () => {
  loadSiteSettings().then((settings) => {
    siteSettings = settings;
    if (siteSettings) {
      applySiteSettings(siteSettings);
    }
    setupWhatsApp();
  });
  setYear();
  setActiveNav();
  setupMobileNav();
  setupCartCount();
  setupToast();
  setupScrollReveal();
  setupNewsletter();
  setupContactForm();
  setupCareersForm();
  initChat();
  initMenuPage();
  initCheckoutPage();
  renderHomeBestSellers();
  renderTestimonials();
  renderFaq();
  renderPositions();
  document.body.classList.add("is-loaded");
};

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
