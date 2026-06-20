module.exports = ({ application }) => {
  return `
  <div style="font-family:Arial,sans-serif;max-width:640px;margin:0 auto;color:#111">
    <h2 style="margin:0 0 10px">New Career Application</h2>
    <p style="margin:0 0 8px"><strong>Name:</strong> ${application.name}</p>
    <p style="margin:0 0 8px"><strong>Email:</strong> ${application.email}</p>
    <p style="margin:0 0 8px"><strong>Phone:</strong> ${application.phone || "-"}</p>
    <p style="margin:0 0 8px"><strong>Position:</strong> ${application.position}</p>
    <p style="margin:0 0 8px"><strong>CV:</strong> ${application.cvUrl ? `<a href="${application.cvUrl}">${application.cvUrl}</a>` : "-"}</p>
    ${application.coverLetter ? `<p style="margin:16px 0 0;white-space:pre-wrap">${application.coverLetter}</p>` : ""}
  </div>
  `;
};

