const NewsletterSubscriber = require("../models/newsletterSubscriber.model");
const { env } = require("../config");
const { sendEmail } = require("./email.service");
const newsletterNotification = require("../views/emails/newsletterNotification");

const subscribeToNewsletter = async ({ email, source }) => {
  const normalized = String(email || "").trim().toLowerCase();
  if (!normalized) return null;

  const subscriber = await NewsletterSubscriber.findOneAndUpdate(
    { email: normalized },
    { $set: { isActive: true, source: source || undefined } },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  ).exec();

  if (env.ADMIN_ALERT_EMAIL) {
    await sendEmail({
      to: env.ADMIN_ALERT_EMAIL,
      subject: `Newsletter Subscription - ${subscriber.email}`,
      html: newsletterNotification({ subscriber }),
    });
  }

  return subscriber;
};

module.exports = { subscribeToNewsletter };

