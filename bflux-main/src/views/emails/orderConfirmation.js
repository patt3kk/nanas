const formatMoney = (n) => `₦${Number(n || 0).toLocaleString("en-NG")}`;

module.exports = ({ order }) => {
  const items = order.items
    .map((i) => `<tr><td style="padding:6px 0">${i.name} x${i.quantity}</td><td style="padding:6px 0;text-align:right">${formatMoney(i.unitPrice * i.quantity)}</td></tr>`)
    .join("");

  return `
  <div style="font-family:Arial,sans-serif;max-width:640px;margin:0 auto;color:#111">
    <h2 style="margin:0 0 10px">Order Confirmed</h2>
    <p style="margin:0 0 16px">Hi ${order.customer.fullName || "there"}, your order has been confirmed.</p>
    <p style="margin:0 0 16px"><strong>Order:</strong> ${order.orderNumber}</p>
    <table style="width:100%;border-collapse:collapse">
      ${items}
      <tr><td style="padding:10px 0;border-top:1px solid #eee">Subtotal</td><td style="padding:10px 0;border-top:1px solid #eee;text-align:right">${formatMoney(order.subtotal)}</td></tr>
      <tr><td style="padding:6px 0">Delivery</td><td style="padding:6px 0;text-align:right">${formatMoney(order.deliveryFee)}</td></tr>
      <tr><td style="padding:10px 0;border-top:1px solid #eee"><strong>Total</strong></td><td style="padding:10px 0;border-top:1px solid #eee;text-align:right"><strong>${formatMoney(order.totalAmount)}</strong></td></tr>
    </table>
    <p style="margin:16px 0 0">Delivery address: ${order.deliveryAddress.addressLine1}${order.deliveryAddress.city ? `, ${order.deliveryAddress.city}` : ""}${order.deliveryAddress.state ? `, ${order.deliveryAddress.state}` : ""}</p>
    <p style="margin:16px 0 0">Thank you for choosing Nana's Akara.</p>
  </div>
  `;
};

