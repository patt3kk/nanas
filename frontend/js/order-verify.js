import { api } from "./api.js";
import { cart, formatNaira } from "./cart.js";

const qs = (sel, root = document) => root.querySelector(sel);

const getReference = () => {
  const url = new URL(window.location.href);
  return url.searchParams.get("reference") || url.searchParams.get("trxref") || "";
};

const initOrderVerify = async () => {
  const statusEl = qs("[data-verify-status]");
  const detailsEl = qs("[data-verify-details]");
  const reference = getReference();

  if (!reference) {
    if (statusEl) statusEl.textContent = "Missing payment reference";
    if (detailsEl) detailsEl.textContent = "Return to checkout and try again.";
    return;
  }

  const res = await api.verifyOrderPayment(reference);
  if (!res.ok) {
    if (statusEl) statusEl.textContent = "Verification failed";
    if (detailsEl) detailsEl.textContent = res.error.message || "Unable to verify payment.";
    return;
  }

  const order = res.data?.order;
  if (statusEl) statusEl.textContent = "Payment confirmed";
  if (detailsEl) {
    detailsEl.innerHTML = `
      <div style="display:grid; gap:6px;">
        <div><strong>Order:</strong> ${order?.orderNumber || "-"}</div>
        <div><strong>Amount:</strong> ${Number.isFinite(Number(order?.totalAmount)) ? formatNaira(order.totalAmount) : "-"}</div>
        <div><strong>Status:</strong> ${order?.status || "Confirmed"}</div>
      </div>
    `;
  }
  cart.clear();
};

initOrderVerify();

