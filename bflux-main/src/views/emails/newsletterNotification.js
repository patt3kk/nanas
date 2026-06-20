module.exports = ({ subscriber }) => {
  return `
  <div style="font-family:Arial,sans-serif;max-width:640px;margin:0 auto;color:#111">
    <h2 style="margin:0 0 10px">New Newsletter Subscription</h2>
    <p style="margin:0 0 8px"><strong>Email:</strong> ${subscriber.email}</p>
    <p style="margin:0 0 8px"><strong>Source:</strong> ${subscriber.source || "-"}</p>
    <p style="margin:0 0 8px"><strong>Date:</strong> ${new Date(subscriber.createdAt).toISOString()}</p>
  </div>
  `;
};

