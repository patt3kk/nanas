import { adminApi } from "./admin-api.js";
import { auth } from "./auth.js";
import { formatNaira } from "../../js/cart.js";

const qs = (sel, root = document) => root.querySelector(sel);
const qsa = (sel, root = document) => [...root.querySelectorAll(sel)];

const STATUS_OPTIONS = ["Pending", "Confirmed", "Preparing", "Ready", "Completed", "Cancelled"];

const setText = (el, v) => {
  if (!el) return;
  el.textContent = v === undefined || v === null ? "—" : String(v);
};

const showSection = (key) => {
  qsa("[data-admin-section]").forEach((s) => {
    s.hidden = s.getAttribute("data-admin-section") !== key;
  });
  qsa("[data-admin-nav]").forEach((b) => {
    const active = b.getAttribute("data-admin-nav") === key;
    if (active) b.setAttribute("aria-current", "page");
    else b.removeAttribute("aria-current");
  });
  const title = qs("[data-admin-title]");
  const map = {
    overview: "Dashboard Overview",
    menu: "Menu Management",
    orders: "Order Management",
    customers: "Customer Management",
    contacts: "Contact Management",
    careers: "Career Applications",
    admins: "Admin Management",
    settings: "System Settings",
  };
  if (title) title.textContent = map[key] || "Dashboard";
};

const renderMetrics = (wrap, totals) => {
  if (!wrap) return;
  const cards = [
    { label: "Total Orders", value: totals.totalOrders },
    { label: "Total Revenue", value: formatNaira(totals.totalRevenue || 0) },
    { label: "Total Customers", value: totals.totalCustomers },
    { label: "Total Menu Items", value: totals.totalMenuItems },
  ];
  wrap.innerHTML = cards
    .map(
      (c) => `
      <div class="card">
        <div class="card-body">
          <div class="muted" style="font-size:13px;">${c.label}</div>
          <div style="margin-top:8px; font-weight:950; font-size:26px; letter-spacing:-.03em;">${c.value}</div>
        </div>
      </div>
    `
    )
    .join("");
};

const renderRecentOrders = (wrap, items) => {
  if (!wrap) return;
  if (!items || items.length === 0) {
    wrap.innerHTML = `<div class="notice">No orders yet.</div>`;
    return;
  }
  wrap.innerHTML = `
    <table class="table" aria-label="Recent orders">
      <thead>
        <tr>
          <th>Order</th>
          <th>Customer</th>
          <th>Amount</th>
          <th>Status</th>
          <th>Payment</th>
          <th>Date</th>
        </tr>
      </thead>
      <tbody>
        ${items
          .map(
            (o) => `
          <tr>
            <td style="font-weight:850;">${o.orderNumber || "-"}</td>
            <td>${o.customer?.fullName || "-"}</td>
            <td>${Number.isFinite(Number(o.totalAmount)) ? formatNaira(o.totalAmount) : "-"}</td>
            <td>${o.status || "-"}</td>
            <td>${o.paymentStatus || "-"}</td>
            <td>${o.createdAt ? new Date(o.createdAt).toLocaleString() : "-"}</td>
          </tr>
        `
          )
          .join("")}
      </tbody>
    </table>
  `;
};

const renderMenuTable = (wrap, items) => {
  if (!wrap) return;
  if (!items || items.length === 0) {
    wrap.innerHTML = `<div class="notice">No menu items found.</div>`;
    return;
  }
  wrap.innerHTML = `
    <table class="table" aria-label="Menu items">
      <thead>
        <tr>
          <th>Name</th>
          <th>Category</th>
          <th>Price</th>
          <th>Available</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        ${items
          .map(
            (m) => `
          <tr data-menu-row="${m._id}">
            <td style="font-weight:850;">${m.name}</td>
            <td>${m.category?.name || ""}</td>
            <td>${formatNaira(Number(m.discountedPrice ?? m.price ?? 0))}</td>
            <td>${m.isAvailable ? "Yes" : "No"}</td>
            <td style="white-space:nowrap;">
              <button class="btn btn-secondary btn-sm" type="button" data-menu-edit="${m._id}">Edit</button>
              <button class="btn btn-secondary btn-sm" type="button" data-menu-images="${m._id}">Images</button>
              <button class="btn btn-secondary btn-sm" type="button" data-menu-delete="${m._id}">Delete</button>
            </td>
          </tr>
        `
          )
          .join("")}
      </tbody>
    </table>
  `;
};

const renderOrdersTable = (wrap, items) => {
  if (!wrap) return;
  if (!items || items.length === 0) {
    wrap.innerHTML = `<div class="notice">No orders found.</div>`;
    return;
  }
  wrap.innerHTML = `
    <table class="table" aria-label="Orders">
      <thead>
        <tr>
          <th>Order</th>
          <th>Customer</th>
          <th>Amount</th>
          <th>Status</th>
          <th>Payment</th>
          <th>Date</th>
        </tr>
      </thead>
      <tbody>
        ${items
          .map((o) => {
            const opts = STATUS_OPTIONS.map(
              (s) => `<option value="${s}" ${o.status === s ? "selected" : ""}>${s}</option>`
            ).join("");
            return `
              <tr>
                <td style="font-weight:850;">${o.orderNumber || "-"}</td>
                <td>${o.customer?.fullName || "-"}</td>
                <td>${Number.isFinite(Number(o.totalAmount)) ? formatNaira(o.totalAmount) : "-"}</td>
                <td>
                  <select class="input" data-order-status="${o._id}">
                    ${opts}
                  </select>
                </td>
                <td>${o.paymentStatus || "-"}</td>
                <td>${o.createdAt ? new Date(o.createdAt).toLocaleString() : "-"}</td>
              </tr>
            `;
          })
          .join("")}
      </tbody>
    </table>
  `;
};

const renderCustomersTable = (wrap, items) => {
  if (!wrap) return;
  if (!items || items.length === 0) {
    wrap.innerHTML = `<div class="notice">No customers found.</div>`;
    return;
  }
  wrap.innerHTML = `
    <table class="table" aria-label="Customers">
      <thead>
        <tr>
          <th>Name</th>
          <th>Email</th>
          <th>Phone</th>
          <th>Total Orders</th>
          <th>Total Spent</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        ${items
          .map(
            (c) => `
          <tr>
            <td style="font-weight:850;">${c.fullName || "-"}</td>
            <td>${c.email || "-"}</td>
            <td>${c.phone || "-"}</td>
            <td>${c.totalOrders || 0}</td>
            <td>${formatNaira(Number(c.totalSpent || 0))}</td>
            <td><button class="btn btn-secondary btn-sm" type="button" data-customer-orders="${c._id}">Order History</button></td>
          </tr>
        `
          )
          .join("")}
      </tbody>
    </table>
  `;
};

const renderCustomerOrders = (wrap, items) => {
  if (!wrap) return;
  if (!items || items.length === 0) {
    wrap.innerHTML = `<div class="notice">No orders for this customer.</div>`;
    return;
  }
  wrap.innerHTML = `
    <div class="card" style="margin-top:14px;">
      <div class="card-body">
        <div class="footer-title" style="margin:0;">Customer Order History</div>
        <div style="margin-top:12px;">
          <table class="table" aria-label="Customer order history">
            <thead>
              <tr>
                <th>Order</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Payment</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              ${items
                .map(
                  (o) => `
                <tr>
                  <td style="font-weight:850;">${o.orderNumber || "-"}</td>
                  <td>${Number.isFinite(Number(o.totalAmount)) ? formatNaira(o.totalAmount) : "-"}</td>
                  <td>${o.status || "-"}</td>
                  <td>${o.paymentStatus || "-"}</td>
                  <td>${o.createdAt ? new Date(o.createdAt).toLocaleString() : "-"}</td>
                </tr>
              `
                )
                .join("")}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;
};

const renderContactsTable = (wrap, items) => {
  if (!wrap) return;
  if (!items || items.length === 0) {
    wrap.innerHTML = `<div class="notice">No messages found.</div>`;
    return;
  }
  wrap.innerHTML = `
    <table class="table" aria-label="Contact messages">
      <thead>
        <tr>
          <th>From</th>
          <th>Subject</th>
          <th>Message</th>
          <th>Read</th>
          <th>Date</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        ${items
          .map(
            (m) => `
          <tr>
            <td style="font-weight:850;">${m.name}<div class="muted" style="font-size:12px;">${m.email}</div></td>
            <td>${m.subject || "-"}</td>
            <td style="max-width:360px;">${m.message}</td>
            <td>${m.isRead ? "Yes" : "No"}</td>
            <td>${m.createdAt ? new Date(m.createdAt).toLocaleString() : "-"}</td>
            <td style="white-space:nowrap;">
              <button class="btn btn-secondary btn-sm" type="button" data-contact-toggle="${m._id}">${m.isRead ? "Mark Unread" : "Mark Read"}</button>
              <button class="btn btn-secondary btn-sm" type="button" data-contact-delete="${m._id}">Delete</button>
            </td>
          </tr>
        `
          )
          .join("")}
      </tbody>
    </table>
  `;
};

const renderCareersTable = (wrap, items) => {
  if (!wrap) return;
  if (!items || items.length === 0) {
    wrap.innerHTML = `<div class="notice">No applications found.</div>`;
    return;
  }
  const statusOptions = ["submitted", "reviewing", "shortlisted", "rejected", "hired"];
  wrap.innerHTML = `
    <table class="table" aria-label="Career applications">
      <thead>
        <tr>
          <th>Candidate</th>
          <th>Position</th>
          <th>Status</th>
          <th>CV</th>
          <th>Date</th>
        </tr>
      </thead>
      <tbody>
        ${items
          .map((a) => {
            const opts = statusOptions
              .map((s) => `<option value="${s}" ${a.status === s ? "selected" : ""}>${s}</option>`)
              .join("");
            return `
              <tr>
                <td style="font-weight:850;">${a.name}<div class="muted" style="font-size:12px;">${a.email}</div></td>
                <td>${a.position}</td>
                <td>
                  <select class="input" data-career-status="${a._id}">
                    ${opts}
                  </select>
                </td>
                <td>${a.cvUrl ? `<a class="btn btn-secondary btn-sm" href="${a.cvUrl}" target="_blank" rel="noopener">Download</a>` : "-"}</td>
                <td>${a.createdAt ? new Date(a.createdAt).toLocaleString() : "-"}</td>
              </tr>
            `;
          })
          .join("")}
      </tbody>
    </table>
  `;
};

const renderUsersTable = (wrap, items) => {
  if (!wrap) return;
  if (!items || items.length === 0) {
    wrap.innerHTML = `<div class="notice">No admins found.</div>`;
    return;
  }
  wrap.innerHTML = `
    <table class="table" aria-label="Admins">
      <thead>
        <tr>
          <th>Name</th>
          <th>Email</th>
          <th>Role</th>
          <th>Active</th>
          <th>Last Login</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        ${items
          .map(
            (u) => `
          <tr>
            <td style="font-weight:850;">${u.name}</td>
            <td>${u.email}</td>
            <td>${u.role}</td>
            <td>${u.isActive ? "Yes" : "No"}</td>
            <td>${u.lastLogin ? new Date(u.lastLogin).toLocaleString() : "-"}</td>
            <td style="white-space:nowrap;">
              <button class="btn btn-secondary btn-sm" type="button" data-user-edit="${u._id}">Edit</button>
              <button class="btn btn-secondary btn-sm" type="button" data-user-delete="${u._id}">Delete</button>
            </td>
          </tr>
        `
          )
          .join("")}
      </tbody>
    </table>
  `;
};

const init = async () => {
  const session = await auth.ensure();
  if (!session.ok) {
    const url = new URL("login.html", window.location.href);
    url.searchParams.set("redirect", "dashboard.html");
    window.location.href = url.toString();
    return;
  }

  const token = session.token;
  const user = session.user;

  setText(qs("[data-admin-user-name]"), user.name);
  setText(qs("[data-admin-user-email]"), user.email);
  setText(qs("[data-admin-user-role]"), user.role);

  const superOnly = qs("[data-admin-super-only]");
  if (superOnly) superOnly.hidden = user.role !== "super-admin";

  qs("[data-admin-logout]")?.addEventListener("click", async () => {
    await auth.logout();
    window.location.href = "login.html";
  });

  qsa("[data-admin-nav]").forEach((b) => {
    b.addEventListener("click", () => showSection(b.getAttribute("data-admin-nav")));
  });

  const metricsWrap = qs("[data-admin-metrics]");
  const recentWrap = qs("[data-admin-recent-orders]");

  const menuForm = qs("[data-admin-menu-form]");
  const menuMsg = qs("[data-admin-menu-msg]");
  const menuTable = qs("[data-admin-menu-table]");
  const menuSearch = qs("[data-admin-menu-search]");
  const menuReset = qs("[data-admin-menu-reset]");
  const catSelect = qs("[data-admin-categories]");

  const ordersTable = qs("[data-admin-orders-table]");
  const ordersSearch = qs("[data-admin-orders-search]");
  const ordersStatus = qs("[data-admin-orders-status]");

  const customersTable = qs("[data-admin-customers-table]");
  const customersSearch = qs("[data-admin-customers-search]");
  const customerOrdersWrap = qs("[data-admin-customer-orders]");

  const contactsTable = qs("[data-admin-contacts-table]");
  const contactsSearch = qs("[data-admin-contacts-search]");

  const careersTable = qs("[data-admin-careers-table]");
  const careersSearch = qs("[data-admin-careers-search]");

  const usersForm = qs("[data-admin-users-form]");
  const usersMsg = qs("[data-admin-users-msg]");
  const usersTable = qs("[data-admin-users-table]");
  const usersSearch = qs("[data-admin-users-search]");
  const usersReset = qs("[data-admin-users-reset]");

  const settingsForm = qs("[data-admin-settings-form]");
  const settingsMsg = qs("[data-admin-settings-msg]");

  const refreshOverview = async () => {
    const res = await adminApi.overview(token);
    if (!res.ok) return;
    renderMetrics(metricsWrap, res.data.totals || {});
    renderRecentOrders(recentWrap, res.data.recentOrders || []);
  };

  const refreshCategories = async () => {
    const res = await adminApi.listCategories(token);
    if (!res.ok || !catSelect) return;
    const items = res.data.items || [];
    catSelect.innerHTML = items.map((c) => `<option value="${c._id}">${c.name}</option>`).join("");
  };

  let cachedMenu = [];
  const refreshMenu = async () => {
    const q = String(menuSearch?.value || "").trim();
    const res = await adminApi.listMenuItems({ token, q });
    if (!res.ok) return;
    cachedMenu = res.data.items || [];
    renderMenuTable(menuTable, cachedMenu);
  };

  const resetMenuForm = () => {
    if (!menuForm) return;
    menuForm.reset();
    qs('input[name="id"]', menuForm).value = "";
    if (menuMsg) menuMsg.textContent = "";
  };

  menuReset?.addEventListener("click", resetMenuForm);
  menuSearch?.addEventListener("input", () => refreshMenu());

  menuForm?.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (menuMsg) menuMsg.textContent = "";
    const fd = new FormData(menuForm);
    const id = String(fd.get("id") || "");
    const payload = {
      name: String(fd.get("name") || "").trim(),
      description: String(fd.get("description") || "").trim() || undefined,
      category: String(fd.get("category") || ""),
      price: Number(fd.get("price") || 0),
      discountedPrice: fd.get("discountedPrice") ? Number(fd.get("discountedPrice")) : undefined,
      isFeatured: String(fd.get("isFeatured")) === "true",
      isAvailable: String(fd.get("isAvailable")) === "true",
    };
    if (!payload.name || !payload.category || !Number.isFinite(payload.price)) {
      if (menuMsg) menuMsg.textContent = "Please provide valid name, category, and price.";
      return;
    }

    const res = id
      ? await adminApi.updateMenuItem({ token, id, payload })
      : await adminApi.createMenuItem({ token, payload });

    if (!res.ok) {
      if (menuMsg) menuMsg.textContent = res.error.message;
      return;
    }
    resetMenuForm();
    await refreshMenu();
    await refreshOverview();
    if (menuMsg) menuMsg.textContent = "Saved.";
  });

  menuTable?.addEventListener("click", async (e) => {
    const editId = e.target.closest("[data-menu-edit]")?.getAttribute("data-menu-edit");
    const delId = e.target.closest("[data-menu-delete]")?.getAttribute("data-menu-delete");
    const imgId = e.target.closest("[data-menu-images]")?.getAttribute("data-menu-images");

    if (editId && menuForm) {
      const item = cachedMenu.find((m) => String(m._id) === String(editId));
      if (!item) return;
      qs('input[name="id"]', menuForm).value = item._id;
      qs('input[name="name"]', menuForm).value = item.name || "";
      qs('textarea[name="description"]', menuForm).value = item.description || "";
      qs('select[name="category"]', menuForm).value = item.category?._id || "";
      qs('input[name="price"]', menuForm).value = String(item.price ?? "");
      qs('input[name="discountedPrice"]', menuForm).value = item.discountedPrice ? String(item.discountedPrice) : "";
      qs('select[name="isFeatured"]', menuForm).value = item.isFeatured ? "true" : "false";
      qs('select[name="isAvailable"]', menuForm).value = item.isAvailable ? "true" : "false";
      showSection("menu");
      return;
    }

    if (delId) {
      const ok = window.confirm("Delete this menu item?");
      if (!ok) return;
      const res = await adminApi.deleteMenuItem({ token, id: delId });
      if (!res.ok) return;
      await refreshMenu();
      await refreshOverview();
      return;
    }

    if (imgId) {
      const input = document.createElement("input");
      input.type = "file";
      input.accept = "image/*";
      input.multiple = true;
      input.onchange = async () => {
        if (!input.files || input.files.length === 0) return;
        const res = await adminApi.uploadMenuImages({ token, id: imgId, files: input.files });
        if (!res.ok) {
          if (menuMsg) menuMsg.textContent = res.error.message;
          return;
        }
        await refreshMenu();
        if (menuMsg) menuMsg.textContent = "Images uploaded.";
      };
      input.click();
    }
  });

  let cachedOrders = [];
  const refreshOrders = async () => {
    const qRaw = String(ordersSearch?.value || "").trim();
    const status = String(ordersStatus?.value || "").trim();
    const q = status ? `${qRaw}${qRaw ? " " : ""}${status}`.trim() : qRaw;
    const res = await adminApi.listOrders({ token, q });
    if (!res.ok) return;
    cachedOrders = res.data.items || [];
    renderOrdersTable(ordersTable, cachedOrders);
  };

  ordersSearch?.addEventListener("input", () => refreshOrders());
  ordersStatus?.addEventListener("change", () => refreshOrders());

  ordersTable?.addEventListener("change", async (e) => {
    const sel = e.target.closest("select[data-order-status]");
    if (!sel) return;
    const id = sel.getAttribute("data-order-status");
    const status = sel.value;
    await adminApi.updateOrder({ token, id, payload: { status } });
    await refreshOverview();
  });

  let cachedCustomers = [];
  const refreshCustomers = async () => {
    const q = String(customersSearch?.value || "").trim();
    const res = await adminApi.listCustomers({ token, q });
    if (!res.ok) return;
    cachedCustomers = res.data.items || [];
    renderCustomersTable(customersTable, cachedCustomers);
    if (customerOrdersWrap) customerOrdersWrap.innerHTML = "";
  };

  customersSearch?.addEventListener("input", () => refreshCustomers());

  customersTable?.addEventListener("click", async (e) => {
    const id = e.target.closest("[data-customer-orders]")?.getAttribute("data-customer-orders");
    if (!id) return;
    const res = await adminApi.listCustomerOrders({ token, id });
    if (!res.ok) return;
    renderCustomerOrders(customerOrdersWrap, res.data.items || []);
  });

  let cachedContacts = [];
  const refreshContacts = async () => {
    const q = String(contactsSearch?.value || "").trim();
    const res = await adminApi.listContactMessages({ token, q });
    if (!res.ok) return;
    cachedContacts = res.data.items || [];
    renderContactsTable(contactsTable, cachedContacts);
  };

  contactsSearch?.addEventListener("input", () => refreshContacts());

  contactsTable?.addEventListener("click", async (e) => {
    const toggleId = e.target.closest("[data-contact-toggle]")?.getAttribute("data-contact-toggle");
    const delId = e.target.closest("[data-contact-delete]")?.getAttribute("data-contact-delete");
    if (toggleId) {
      const msg = cachedContacts.find((m) => String(m._id) === String(toggleId));
      if (!msg) return;
      await adminApi.updateContactMessage({ token, id: toggleId, payload: { isRead: !msg.isRead } });
      await refreshContacts();
    }
    if (delId) {
      const ok = window.confirm("Delete this message?");
      if (!ok) return;
      await adminApi.deleteContactMessage({ token, id: delId });
      await refreshContacts();
    }
  });

  let cachedCareers = [];
  const refreshCareers = async () => {
    const q = String(careersSearch?.value || "").trim();
    const res = await adminApi.listCareerApplications({ token, q });
    if (!res.ok) return;
    cachedCareers = res.data.items || [];
    renderCareersTable(careersTable, cachedCareers);
  };

  careersSearch?.addEventListener("input", () => refreshCareers());

  careersTable?.addEventListener("change", async (e) => {
    const sel = e.target.closest("select[data-career-status]");
    if (!sel) return;
    const id = sel.getAttribute("data-career-status");
    const status = sel.value;
    await adminApi.updateCareerApplication({ token, id, payload: { status } });
  });

  let cachedUsers = [];
  const refreshUsers = async () => {
    const q = String(usersSearch?.value || "").trim();
    const res = await adminApi.listUsers({ token, q });
    if (!res.ok) return;
    cachedUsers = res.data.items || [];
    renderUsersTable(usersTable, cachedUsers);
  };

  const resetUsersForm = () => {
    if (!usersForm) return;
    usersForm.reset();
    qs('input[name="id"]', usersForm).value = "";
    if (usersMsg) usersMsg.textContent = "";
  };

  usersReset?.addEventListener("click", resetUsersForm);
  usersSearch?.addEventListener("input", () => refreshUsers());

  usersForm?.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (usersMsg) usersMsg.textContent = "";
    const fd = new FormData(usersForm);
    const id = String(fd.get("id") || "");
    const name = String(fd.get("name") || "").trim();
    const email = String(fd.get("email") || "").trim();
    const role = String(fd.get("role") || "admin");
    const isActive = String(fd.get("isActive") || "true") === "true";
    const password = String(fd.get("password") || "");

    const payload = { name, email, role, isActive };
    if (!name || !email) {
      if (usersMsg) usersMsg.textContent = "Name and email are required.";
      return;
    }

    const res = id
      ? await adminApi.updateUser({ token, id, payload: { ...payload, ...(password ? { password } : {}) } })
      : await adminApi.createUser({ token, payload: { ...payload, password: password || "" } });

    if (!res.ok) {
      if (usersMsg) usersMsg.textContent = res.error.message;
      return;
    }

    if (id && password) {
      await adminApi.resetUserPassword({ token, id, password });
    }

    resetUsersForm();
    await refreshUsers();
    if (usersMsg) usersMsg.textContent = "Saved.";
  });

  usersTable?.addEventListener("click", async (e) => {
    const editId = e.target.closest("[data-user-edit]")?.getAttribute("data-user-edit");
    const delId = e.target.closest("[data-user-delete]")?.getAttribute("data-user-delete");

    if (editId && usersForm) {
      const u = cachedUsers.find((x) => String(x._id) === String(editId));
      if (!u) return;
      qs('input[name="id"]', usersForm).value = u._id;
      qs('input[name="name"]', usersForm).value = u.name || "";
      qs('input[name="email"]', usersForm).value = u.email || "";
      qs('select[name="role"]', usersForm).value = u.role || "admin";
      qs('select[name="isActive"]', usersForm).value = u.isActive ? "true" : "false";
      qs('input[name="password"]', usersForm).value = "";
      showSection("admins");
    }

    if (delId) {
      const ok = window.confirm("Delete this admin?");
      if (!ok) return;
      const res = await adminApi.deleteUser({ token, id: delId });
      if (!res.ok) return;
      await refreshUsers();
    }
  });

  const fillSettingsForm = (settings) => {
    if (!settingsForm) return;
    qs('input[name="company.name"]', settingsForm).value = settings.company?.name || "";
    qs('input[name="company.tagline"]', settingsForm).value = settings.company?.tagline || "";
    qs('input[name="contact.email"]', settingsForm).value = settings.contact?.email || "";
    qs('input[name="contact.phone"]', settingsForm).value = settings.contact?.phone || "";
  };

  const refreshSettings = async () => {
    const res = await adminApi.getSettings(token);
    if (!res.ok) return;
    fillSettingsForm(res.data.settings || {});
  };

  settingsForm?.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (settingsMsg) settingsMsg.textContent = "";
    const fd = new FormData(settingsForm);
    const payload = {
      company: {
        name: String(fd.get("company.name") || "").trim() || undefined,
        tagline: String(fd.get("company.tagline") || "").trim() || undefined,
      },
      contact: {
        email: String(fd.get("contact.email") || "").trim() || undefined,
        phone: String(fd.get("contact.phone") || "").trim() || undefined,
      },
    };
    const res = await adminApi.updateSettings({ token, payload });
    if (!res.ok) {
      if (settingsMsg) settingsMsg.textContent = res.error.message;
      return;
    }
    if (settingsMsg) settingsMsg.textContent = "Saved.";
    await refreshSettings();
  });

  showSection("overview");
  await refreshOverview();
  await refreshCategories();
  await refreshMenu();
  await refreshOrders();
  await refreshCustomers();
  await refreshContacts();
  await refreshCareers();
  if (user.role === "super-admin") await refreshUsers();
  await refreshSettings();
};

init();

