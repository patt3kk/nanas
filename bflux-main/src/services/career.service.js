const CareerApplication = require("../models/careerApplication.model");
const { env } = require("../config");
const { sendEmail } = require("./email.service");
const careerNotification = require("../views/emails/careerNotification");

const createCareerApplication = async (payload) => {
  const application = await CareerApplication.create(payload);

  if (env.ADMIN_ALERT_EMAIL) {
    await sendEmail({
      to: env.ADMIN_ALERT_EMAIL,
      subject: `New Career Application - ${application.position}`,
      html: careerNotification({ application }),
    });
  }

  return application;
};

module.exports = { createCareerApplication };

