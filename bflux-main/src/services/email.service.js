const { resend, buildSmtpTransport } = require("../config/email");
const { env } = require("../config");
const { logger } = require("../config/logger");
const { APIError } = require("../middlewares/errorApi");

const sendEmail = async ({ to, subject, html }) => {
  if (!env.FROM_EMAIL) throw APIError.internalServerError("FROM_EMAIL is not configured");
  if (!to) throw APIError.badRequest("Recipient email is required");

  if (resend) {
    await resend.emails.send({ from: env.FROM_EMAIL, to, subject, html });
    return;
  }

  const transport = buildSmtpTransport();
  if (!transport) {
    logger.warn("Email not sent: no Resend key and no SMTP configured", { to, subject });
    return;
  }

  await transport.sendMail({ from: env.FROM_EMAIL, to, subject, html });
};

module.exports = { sendEmail };
