const ContactMessage = require("../models/contactMessage.model");
const { env } = require("../config");
const { sendEmail } = require("./email.service");
const contactNotification = require("../views/emails/contactNotification");

const createContactMessage = async (payload) => {
  const message = await ContactMessage.create(payload);

  if (env.ADMIN_ALERT_EMAIL) {
    await sendEmail({
      to: env.ADMIN_ALERT_EMAIL,
      subject: `New Contact Message - ${message.subject || "Nana's Akara"}`,
      html: contactNotification({ message }),
    });
  }

  return message;
};

module.exports = { createContactMessage };

