module.exports = ({ message }) => {
  return `
  <div style="font-family:Arial,sans-serif;max-width:640px;margin:0 auto;color:#111">
    <h2 style="margin:0 0 10px">New Contact Message</h2>
    <p style="margin:0 0 8px"><strong>Name:</strong> ${message.name}</p>
    <p style="margin:0 0 8px"><strong>Email:</strong> ${message.email}</p>
    <p style="margin:0 0 8px"><strong>Subject:</strong> ${message.subject || "-"}</p>
    <p style="margin:16px 0 0;white-space:pre-wrap">${message.message}</p>
  </div>
  `;
};

