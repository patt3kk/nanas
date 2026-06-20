const qs = (sel, root = document) => root.querySelector(sel);

export const initChat = () => {
  const panel = qs("[data-chat-panel]");
  const toggle = qs("[data-chat-toggle]");
  const closeBtn = qs("[data-chat-close]");
  const form = qs("[data-chat-form]");
  const input = qs("[data-chat-input]");
  const body = qs("[data-chat-body]");

  if (!panel || !toggle) return;

  const open = () => {
    panel.classList.add("is-open");
    toggle.setAttribute("aria-expanded", "true");
    if (input) input.focus();
  };

  const close = () => {
    panel.classList.remove("is-open");
    toggle.setAttribute("aria-expanded", "false");
    toggle.focus();
  };

  toggle.addEventListener("click", () => {
    const isOpen = panel.classList.contains("is-open");
    if (isOpen) close();
    else open();
  });

  closeBtn?.addEventListener("click", close);

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && panel.classList.contains("is-open")) close();
  });

  form?.addEventListener("submit", (e) => {
    e.preventDefault();
    const text = String(input?.value || "").trim();
    if (!text) return;

    const bubble = document.createElement("div");
    bubble.className = "chat-bubble";
    bubble.style.background = "rgba(15,118,110,.10)";
    bubble.style.borderColor = "rgba(15,118,110,.18)";
    bubble.style.color = "var(--text)";
    bubble.textContent = text;
    body?.appendChild(bubble);
    if (input) input.value = "";
    body?.scrollTo({ top: body.scrollHeight, behavior: "smooth" });

    window.setTimeout(() => {
      const reply = document.createElement("div");
      reply.className = "chat-bubble";
      reply.textContent =
        "Thanks—this is a placeholder live chat. For urgent support, use WhatsApp.";
      body?.appendChild(reply);
      body?.scrollTo({ top: body.scrollHeight, behavior: "smooth" });
    }, 450);
  });
};

