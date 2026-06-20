const SiteSetting = require("../models/siteSetting.model");

const getSettings = async () => {
  const settings = await SiteSetting.findOne({ key: "default" }).lean().exec();
  return settings;
};

const upsertSettings = async (payload) => {
  const settings = await SiteSetting.findOneAndUpdate(
    { key: "default" },
    { $set: payload, $setOnInsert: { key: "default" } },
    { new: true, upsert: true }
  ).exec();
  return settings;
};

module.exports = { getSettings, upsertSettings };

