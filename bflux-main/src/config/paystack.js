const axios = require("axios");
const { env } = require("./env");

const paystackHttp = axios.create({
  baseURL: "https://api.paystack.co",
  headers: env.PAYSTACK_SECRET_KEY
    ? {
        Authorization: `Bearer ${env.PAYSTACK_SECRET_KEY}`,
        "Content-Type": "application/json",
      }
    : { "Content-Type": "application/json" },
  timeout: 20000,
});

module.exports = { paystackHttp };

