import { api } from "./api.js";
import { cart, formatNaira } from "./cart.js";

const qs = (sel, root = document) => root.querySelector(sel);

const getValue = (name) =>
  String(qs(`[name="${name}"]`)?.value || "").trim();

const setBusy = (btn, busy) => {
  if (!btn) return;
  btn.disabled = !!busy;
  btn.setAttribute("aria-busy", busy ? "true" : "false");
  btn.textContent = busy ? "Processing…" : "Pay Securely with Paystack";
};

const validate = () => {
  const required = [
    ["fullName", "Full Name"],
    ["email", "Email Address"],
    ["phone", "Phone Number"],
    ["address", "Delivery Address"],
    ["city", "City"],
    ["state", "State"],
  ];
  const missing = required.filter(([key]) => !getValue(key));
  return missing.length ? missing.map(([, label]) => label) : null;
};

const renderSummary = () => {
  const wrap = qs("[data-checkout-summary]");
  if (!wrap) return;

  const deliveryFee = 1200;
  const lines = cart.lines();
  const totals = cart.totals(deliveryFee);

  if (lines.length === 0) {
    wrap.innerHTML = `
      <div class="notice">
        Your cart is empty. Visit the menu to add items before checking out.
      </div>
    `;
    return;
  }

  const itemsHtml = lines
    .map(
      (l) => `
        <div class="line">
          <div>
            <div style="font-weight:850; letter-spacing:-.02em;">${l.name}</div>
            <div class="muted" style="font-size:13px;">${l.qty} × ${formatNaira(
        l.unitPrice
      )}</div>
          </div>
          <div style="font-weight:850;">${formatNaira(l.lineTotal)}</div>
        </div>
      `
    )
    .join("");

  wrap.innerHTML = `
    <div class="card">
      <div class="card-body">
        <div style="display:flex; align-items:flex-start; justify-content:space-between; gap:12px;">
          <div>
            <div class="footer-title" style="margin:0;">Order Summary</div>
            <div class="muted" style="font-size:13px;">Review before payment</div>
          </div>
          <a class="btn btn-secondary btn-sm" href="cart.html">Edit Cart</a>
        </div>
        <div style="margin-top:14px; display:grid; gap:10px;">
          ${itemsHtml}
        </div>
        <div style="margin-top:12px;">
          <div class="line">
            <div class="muted">Subtotal</div>
            <div style="font-weight:850;">${formatNaira(totals.subtotal)}</div>
          </div>
          <div class="line">
            <div class="muted">Delivery Fee</div>
            <div style="font-weight:850;">${formatNaira(totals.deliveryFee)}</div>
          </div>
          <div class="line" style="border-bottom:0;">
            <div style="font-weight:900;">Total</div>
            <div style="font-weight:900;">${formatNaira(totals.total)}</div>
          </div>
        </div>
        <div class="notice" style="margin-top:14px;">
          Payments are processed securely by Paystack. Nana’s Akara never stores your card details.
        </div>
      </div>
    </div>
  `;
};

export const initCheckoutPage = () => {
  const page = qs("[data-checkout-page]");
  if (!page) return;

  const payBtn = qs("[data-paystack-button]", page);
  const form = qs("[data-checkout-form]", page);

  renderSummary();
  window.addEventListener("cart:updated", renderSummary);

  const handlePay = async () => {
    const missing = validate();
    if (missing) {
      window.dispatchEvent(
        new CustomEvent("ui:toast", {
          detail: { message: `Please fill: ${missing.join(", ")}` },
        })
      );
      return;
    }

    const lines = cart.lines();
    if (lines.length === 0) {
      window.dispatchEvent(
        new CustomEvent("ui:toast", {
          detail: { message: "Your cart is empty." },
        })
      );
      return;
    }

    const payload = {
      customer: {
        fullName: getValue("fullName"),
        email: getValue("email"),
        phone: getValue("phone"),
      },
      deliveryAddress: {
        addressLine1: getValue("address"),
        city: getValue("city"),
        state: getValue("state"),
        notes: getValue("notes"),
      },
      distanceKm: 0,
      items: lines.map((l) => ({
        menuItemId: l.id,
        quantity: l.qty,
      })),
      orderNotes: getValue("notes"),
    };

    setBusy(payBtn, true);
    const orderRes = await api.createOrder(payload);
    if (!orderRes.ok) {
      setBusy(payBtn, false);
      window.dispatchEvent(
        new CustomEvent("ui:toast", {
          detail: { message: orderRes.error.message },
        })
      );
      return;
    }

    const payRes = await api.initializePaystackPayment({
      orderId: orderRes.data?.order?._id,
      email: payload.customer.email,
    });

    setBusy(payBtn, false);
    if (!payRes.ok) {
      window.dispatchEvent(
        new CustomEvent("ui:toast", {
          detail: { message: payRes.error.message },
        })
      );
      return;
    }

    window.dispatchEvent(
      new CustomEvent("ui:toast", {
        detail: { message: "Redirecting to Paystack…" },
      })
    );

    const url = payRes.data?.data?.authorization_url;
    if (url) window.location.href = url;
  };

  payBtn?.addEventListener("click", handlePay);
  form?.addEventListener("submit", (e) => {
    e.preventDefault();
    handlePay();
  });
};
