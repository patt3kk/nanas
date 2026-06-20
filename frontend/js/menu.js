import { api } from "./api.js";
import { ENABLE_MOCK } from "./config.js";
import { CATEGORIES, MENU_ITEMS } from "./data.js";
import { cart, formatNaira } from "./cart.js";
import { filterByCategory, matchQuery, sortItems } from "./search.js";

const qs = (sel, root = document) => root.querySelector(sel);

const state = {
  category: "All",
  query: "",
  sort: "featured",
  items: [],
  categories: [],
  loaded: false,
};

const renderCategoryChips = (wrap) => {
  const cats = state.categories.length ? state.categories : CATEGORIES;
  wrap.innerHTML = cats.map((c) => {
    const pressed = c === state.category ? "true" : "false";
    return `<button type="button" class="chip" aria-pressed="${pressed}" data-category="${c}">${c}</button>`;
  }).join("");
};

const getVisibleItems = () => {
  let items = state.items.length ? [...state.items] : ENABLE_MOCK ? [...MENU_ITEMS] : [];
  if (state.sort === "featured") {
    items = items.sort((a, b) => Number(!!b.bestseller) - Number(!!a.bestseller));
  } else {
    items = sortItems(items, state.sort);
  }
  items = filterByCategory(items, state.category);
  items = items.filter((i) => matchQuery(i, state.query));
  return items;
};

const menuCard = (item) => `
  <article class="card" data-item-id="${item.id}">
    <div class="card-media">
      <img src="${item.image}" alt="${item.name}" loading="lazy" width="800" height="600">
    </div>
    <div class="card-body">
      <div style="display:flex; align-items:flex-start; justify-content:space-between; gap:10px;">
        <div>
          <h3 class="h3" style="font-size:20px;">${item.name}</h3>
          <div class="muted" style="font-size:13px; margin-top:4px;">${item.category}</div>
        </div>
        ${item.bestseller ? `<span class="badge">Bestseller</span>` : ""}
      </div>
      <p class="muted" style="margin-top:2px;">${item.description}</p>
      <div class="price-row" style="margin-top:6px;">
        <div class="price">${formatNaira(item.price)}</div>
        <div style="display:flex; gap:10px; align-items:center;">
          <div class="qty" role="group" aria-label="Quantity selector">
            <button type="button" data-qty-dec aria-label="Decrease quantity">−</button>
            <input value="1" inputmode="numeric" pattern="[0-9]*" aria-label="Quantity value" data-qty-value>
            <button type="button" data-qty-inc aria-label="Increase quantity">+</button>
          </div>
          <button type="button" class="btn btn-primary btn-sm" data-add-to-cart>Add</button>
        </div>
      </div>
    </div>
  </article>
`;

const renderMenu = (grid, emptyEl) => {
  if (!state.loaded) {
    grid.innerHTML = `
      <div class="notice" style="grid-column:1/-1;">
        Loading menu…
      </div>
    `;
    if (emptyEl) emptyEl.hidden = true;
    return;
  }
  const items = getVisibleItems();
  if (items.length === 0) {
    grid.innerHTML = `
      <div class="notice" style="grid-column:1/-1;">
        No menu items available right now.
      </div>
    `;
    if (emptyEl) emptyEl.hidden = false;
    return;
  }
  if (emptyEl) emptyEl.hidden = true;
  grid.innerHTML = items.map(menuCard).join("");
};

export const initMenuPage = () => {
  const page = qs("[data-menu-page]");
  if (!page) return;

  const chipWrap = qs("[data-category-chips]", page);
  const grid = qs("[data-menu-grid]", page);
  const emptyEl = qs("[data-menu-empty]", page);
  const searchInput = qs("[data-menu-search]", page);
  const sortSelect = qs("[data-menu-sort]", page);

  if (!chipWrap || !grid) return;

  renderCategoryChips(chipWrap);
  renderMenu(grid, emptyEl);

  const load = async () => {
    const [catsRes, menuRes] = await Promise.all([api.fetchCategories(), api.fetchMenuItems()]);
    if (catsRes.ok) {
      const cats = Array.isArray(catsRes.data?.items) ? catsRes.data.items : [];
      state.categories = ["All", ...cats.map((c) => c.name).filter(Boolean)];
    }
    if (menuRes.ok) {
      const raw = Array.isArray(menuRes.data?.items) ? menuRes.data.items : [];
      state.items = raw.map((m) => ({
        id: String(m._id),
        name: m.name,
        category: m.category?.name || "",
        image: m.images?.[0] || "assets/images/herosect.png",
        description: m.description || "",
        price: Number(m.discountedPrice ?? m.price ?? 0),
        bestseller: !!m.isFeatured,
      }));
    }
    state.loaded = true;
    if (!state.categories.length) state.categories = ENABLE_MOCK ? CATEGORIES : ["All"];
    renderCategoryChips(chipWrap);
    renderMenu(grid, emptyEl);
  };

  load();

  chipWrap.addEventListener("click", (e) => {
    const btn = e.target.closest("button[data-category]");
    if (!btn) return;
    state.category = btn.getAttribute("data-category") || "All";
    renderCategoryChips(chipWrap);
    renderMenu(grid, emptyEl);
  });

  searchInput?.addEventListener("input", (e) => {
    state.query = e.target.value || "";
    renderMenu(grid, emptyEl);
  });

  sortSelect?.addEventListener("change", (e) => {
    state.sort = e.target.value || "featured";
    renderMenu(grid, emptyEl);
  });

  grid.addEventListener("click", (e) => {
    const card = e.target.closest("[data-item-id]");
    if (!card) return;
    const id = card.getAttribute("data-item-id");
    if (!id) return;

    const inc = e.target.closest("button[data-qty-inc]");
    const dec = e.target.closest("button[data-qty-dec]");
    const addBtn = e.target.closest("button[data-add-to-cart]");
    const qtyInput = qs("input[data-qty-value]", card);

    const current = Number(qtyInput?.value || 1) || 1;

    if (inc && qtyInput) qtyInput.value = String(Math.min(99, current + 1));
    if (dec && qtyInput) qtyInput.value = String(Math.max(1, current - 1));

    if (addBtn) {
      const qty = Number(qtyInput?.value || 1) || 1;
      const item = getVisibleItems().find((i) => String(i.id) === String(id));
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
        qty
      );
      window.dispatchEvent(
        new CustomEvent("ui:toast", {
          detail: { message: `Added ${qty} × to cart` },
        })
      );
    }
  });

  grid.addEventListener("change", (e) => {
    const input = e.target.closest("input[data-qty-value]");
    if (!input) return;
    const raw = String(input.value || "").trim();
    const n = raw === "" ? 1 : Number(raw);
    if (!Number.isFinite(n) || n < 1) input.value = "1";
    if (n > 99) input.value = "99";
  });
};
