const Customer = require("../models/customer.model");
const MenuItem = require("../models/menuItem.model");
const Order = require("../models/order.model");
const { APIError } = require("../middlewares/errorApi");
const { calculateDeliveryFee } = require("./delivery.service");
const { generateOrderNumber } = require("../utils/orderNumber");

const upsertCustomer = async ({ fullName, email, phone, deliveryAddress }) => {
  const query = email ? { email: email.toLowerCase() } : phone ? { phone } : null;
  if (!query) return null;

  const update = {
    $set: { fullName, email: email ? email.toLowerCase() : undefined, phone: phone || undefined },
    $setOnInsert: { totalOrders: 0, totalSpent: 0 },
    $push: deliveryAddress ? { addresses: { ...deliveryAddress, phone: phone || undefined } } : undefined,
  };

  if (!deliveryAddress) delete update.$push;
  Object.keys(update.$set).forEach((k) => update.$set[k] === undefined && delete update.$set[k]);

  return Customer.findOneAndUpdate(query, update, { new: true, upsert: true }).exec();
};

const createOrder = async ({ customer, items, deliveryAddress, distanceKm, orderNotes }) => {
  if (!Array.isArray(items) || items.length === 0) throw APIError.badRequest("Order items are required");

  const normalizedItems = items.map((item) => ({
    menuItemId: String(item.menuItemId),
    quantity: Number(item.quantity),
  }));
  const uniqueItemIds = Array.from(new Set(normalizedItems.map((item) => item.menuItemId)));
  const ids = uniqueItemIds;
  const menuItems = await MenuItem.find({ _id: { $in: ids }, isAvailable: true }).lean().exec();
  if (menuItems.length !== ids.length) throw APIError.badRequest("One or more items are not available");

  const byId = new Map(menuItems.map((m) => [String(m._id), m]));
  const aggregatedItems = normalizedItems.reduce((acc, item) => {
    if (!Number.isInteger(item.quantity) || item.quantity < 1) {
      throw APIError.badRequest("Each order item must include a valid quantity");
    }
    acc.set(item.menuItemId, (acc.get(item.menuItemId) || 0) + item.quantity);
    return acc;
  }, new Map());

  const orderItems = Array.from(aggregatedItems.entries()).map(([menuItemId, quantity]) => {
    const m = byId.get(String(menuItemId));
    if (!m) throw APIError.badRequest("Invalid menu item");
    const unitPrice = m.discountedPrice || m.price;
    return { menuItem: m._id, name: m.name, unitPrice, quantity };
  });

  const subtotal = orderItems.reduce((sum, it) => sum + it.unitPrice * it.quantity, 0);
  const deliveryFee = await calculateDeliveryFee({ distanceKm });
  const totalAmount = subtotal + deliveryFee;

  const customerDoc = await upsertCustomer({ ...customer, deliveryAddress });

  const order = await Order.create({
    orderNumber: generateOrderNumber(),
    customer: { fullName: customer.fullName, email: customer.email, phone: customer.phone },
    customerId: customerDoc?._id,
    items: orderItems,
    subtotal,
    deliveryFee,
    totalAmount,
    deliveryAddress,
    distanceKm,
    orderNotes,
  });

  return order;
};

module.exports = { createOrder };
