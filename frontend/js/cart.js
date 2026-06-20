import { MENU_ITEMS } from "./data.js";

const STORAGE_KEY = "nanasAkaraCart_v1";

export const formatNaira = (amount) =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(amount);

const read = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { items: [] };
    const parsed = JSON.parse(raw);
    if (!parsed || !Array.isArray(parsed.items)) return { items: [] };
    return { items: parsed.items.filter((i) => i?.id && Number(i?.qty) > 0) };
  } catch {
    return { items: [] };
  }
};

const write = (cart) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
};

const emit = () => {
  const cart = read();
  window.dispatchEvent(new CustomEvent("cart:updated", { detail: cart }));
};

export const cart = {
  get: () => read(),

  clear: () => {
    write({ items: [] });
    emit();
  },

  count: () => read().items.reduce((sum, i) => sum + Number(i.qty || 0), 0),

  add: (itemOrId, qty = 1) => {
    const normalizedItem =
      itemOrId && typeof itemOrId === "object"
        ? {
            id: String(itemOrId.id || itemOrId._id || ""),
            name: itemOrId.name ? String(itemOrId.name) : undefined,
            unitPrice:
              itemOrId.unitPrice !== undefined
                ? Number(itemOrId.unitPrice)
                : itemOrId.price !== undefined
                  ? Number(itemOrId.price)
                  : undefined,
            image: itemOrId.image ? String(itemOrId.image) : undefined,
            category: itemOrId.category ? String(itemOrId.category) : undefined,
          }
        : null;

    const id = normalizedItem?.id || String(itemOrId || "");
    if (!id) return read();
    const cartData = read();
    const safeQty = Math.max(1, Number(qty) || 1);
    const existing = cartData.items.find((i) => i.id === id);
    if (existing) {
      existing.qty += safeQty;
      if (normalizedItem?.name) existing.name = normalizedItem.name;
      if (Number.isFinite(normalizedItem?.unitPrice)) existing.unitPrice = normalizedItem.unitPrice;
      if (normalizedItem?.image) existing.image = normalizedItem.image;
      if (normalizedItem?.category) existing.category = normalizedItem.category;
    } else {
      const fallback = MENU_ITEMS.find((m) => String(m.id) === id);
      cartData.items.push({
        id,
        qty: safeQty,
        name: normalizedItem?.name || fallback?.name,
        unitPrice:
          Number.isFinite(normalizedItem?.unitPrice) ? normalizedItem.unitPrice : Number(fallback?.price),
        image: normalizedItem?.image || fallback?.image,
        category: normalizedItem?.category || fallback?.category,
      });
    }
    write(cartData);
    emit();
    return cartData;
  },

  setQty: (id, qty) => {
    const cartData = read();
    const safeQty = Math.max(0, Number(qty) || 0);
    cartData.items = cartData.items
      .map((i) => (i.id === id ? { ...i, qty: safeQty } : i))
      .filter((i) => i.qty > 0);
    write(cartData);
    emit();
    return cartData;
  },

  remove: (id) => {
    const cartData = read();
    cartData.items = cartData.items.filter((i) => i.id !== id);
    write(cartData);
    emit();
    return cartData;
  },

  lines: () => {
    const cartData = read();
    const map = new Map(MENU_ITEMS.map((m) => [m.id, m]));
    return cartData.items
      .map((i) => {
        const fallback = map.get(i.id);
        const name = i.name || fallback?.name;
        const unitPrice = Number.isFinite(Number(i.unitPrice)) ? Number(i.unitPrice) : Number(fallback?.price);
        if (!name || !Number.isFinite(unitPrice)) return null;
        const qty = Number(i.qty || 0);
        return {
          id: i.id,
          name,
          category: i.category || fallback?.category || "",
          image: i.image || fallback?.image || "assets/images/herosect.png",
          unitPrice,
          qty,
          lineTotal: unitPrice * qty,
        };
      })
      .filter(Boolean);
  },

  totals: (deliveryFee = 0) => {
    const lines = cart.lines();
    const subtotal = lines.reduce((sum, l) => sum + l.lineTotal, 0);
    const fee = Number(deliveryFee || 0);
    return { subtotal, deliveryFee: fee, total: subtotal + fee };
  },
};

const qs = (sel, root = document) => root.querySelector(sel);

const renderCartPage = () => {
  const root = qs("[data-cart-page]");
  if (!root) return;

  const tableWrap = qs("[data-cart-table]", root);
  const subtotalEl = qs("[data-cart-subtotal]", root);
  const feeEl = qs("[data-cart-fee]", root);
  const totalEl = qs("[data-cart-total]", root);
  const emptyEl = qs("[data-cart-empty]", root);
  const deliveryFee = 1200;

  const lines = cart.lines();
  const totals = cart.totals(deliveryFee);

  if (subtotalEl) subtotalEl.textContent = formatNaira(totals.subtotal);
  if (feeEl) feeEl.textContent = formatNaira(totals.deliveryFee);
  if (totalEl) totalEl.textContent = formatNaira(totals.total);

  if (emptyEl) emptyEl.hidden = lines.length !== 0;

  if (!tableWrap) return;
  if (lines.length === 0) {
    tableWrap.innerHTML = "";
    return;
  }

  const rows = lines
    .map(
      (l) => `
        <tr>
          <td>
            <div style="display:flex; gap:12px; align-items:center;">
              <img src="${l.image}" alt="${l.name}" width="72" height="54" style="border-radius:12px; object-fit:cover; border:1px solid var(--border);" loading="lazy">
              <div>
                <div style="font-weight:850; letter-spacing:-.02em;">${l.name}</div>
                <div style="color:var(--muted); font-size:13px;">${l.category}</div>
              </div>
            </div>
          </td>
          <td>${formatNaira(l.unitPrice)}</td>
          <td>
            <div class="qty" role="group" aria-label="Quantity selector for ${l.name}">
              <button type="button" data-qty-dec="${l.id}" aria-label="Decrease quantity">−</button>
              <input inputmode="numeric" pattern="[0-9]*" value="${l.qty}" aria-label="Quantity value" data-qty-input="${l.id}">
              <button type="button" data-qty-inc="${l.id}" aria-label="Increase quantity">+</button>
            </div>
          </td>
          <td>${formatNaira(l.lineTotal)}</td>
          <td>
            <button type="button" class="btn btn-secondary btn-sm" data-remove="${l.id}">Remove</button>
          </td>
        </tr>
      `
    )
    .join("");

  tableWrap.innerHTML = `
    <table class="table" aria-label="Cart items">
      <thead>
        <tr>
          <th>Item</th>
          <th>Price</th>
          <th>Qty</th>
          <th>Total</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        ${rows}
      </tbody>
    </table>
  `;
};

const bindCartPage = () => {
  const root = qs("[data-cart-page]");
  if (!root) return;

  root.addEventListener("click", (e) => {
    const btn = e.target.closest("button");
    if (!btn) return;

    const removeId = btn.getAttribute("data-remove");
    if (removeId) {
      cart.remove(removeId);
      return;
    }

    const incId = btn.getAttribute("data-qty-inc");
    if (incId) {
      const current = cart.get().items.find((i) => i.id === incId)?.qty || 0;
      cart.setQty(incId, Number(current) + 1);
      return;
    }

    const decId = btn.getAttribute("data-qty-dec");
    if (decId) {
      const current = cart.get().items.find((i) => i.id === decId)?.qty || 0;
      cart.setQty(decId, Math.max(0, Number(current) - 1));
      return;
    }
  });

  root.addEventListener("change", (e) => {
    const input = e.target.closest("input[data-qty-input]");
    if (!input) return;
    const id = input.getAttribute("data-qty-input");
    if (!id) return;
    const raw = String(input.value || "").trim();
    const qty = raw === "" ? 0 : Number(raw);
    if (!Number.isFinite(qty) || qty < 0) return;
    cart.setQty(id, qty);
  });

  window.addEventListener("cart:updated", renderCartPage);
  renderCartPage();
};

bindCartPage();
