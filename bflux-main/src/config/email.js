const nodemailer = require("nodemailer");
const { Resend } = require("resend");
const { env } = require("./env");

const resend = env.RESEND_API_KEY ? new Resend(env.RESEND_API_KEY) : null;

const buildSmtpTransport = () => {
  if (!env.SMTP_HOST || !env.SMTP_USER || !env.SMTP_PASS) return null;
  return nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT || 587,
    secure: Boolean(env.SMTP_PORT && env.SMTP_PORT === 465),
    auth: { user: env.SMTP_USER, pass: env.SMTP_PASS },
  });
};

module.exports = { resend, buildSmtpTransport };

