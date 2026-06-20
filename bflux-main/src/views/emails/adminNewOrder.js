const formatMoney = (n) => `₦${Number(n || 0).toLocaleString("en-NG")}`;

module.exports = ({ order }) => {
  return `
  <div style="font-family:Arial,sans-serif;max-width:640px;margin:0 auto;color:#111">
    <h2 style="margin:0 0 10px">New Paid Order</h2>
    <p style="margin:0 0 8px"><strong>Order:</strong> ${order.orderNumber}</p>
    <p style="margin:0 0 8px"><strong>Customer:</strong> ${order.customer.fullName} ${order.customer.phone ? `(${order.customer.phone})` : ""}</p>
    <p style="margin:0 0 8px"><strong>Total:</strong> ${formatMoney(order.totalAmount)}</p>
    <p style="margin:0 0 16px"><strong>Delivery:</strong> ${order.deliveryAddress.addressLine1}${order.deliveryAddress.city ? `, ${order.deliveryAddress.city}` : ""}${order.deliveryAddress.state ? `, ${order.deliveryAddress.state}` : ""}</p>
  </div>
  `;
};

