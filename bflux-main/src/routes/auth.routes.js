const express = require("express");
const { validate } = require("../middlewares/validate.middleware");
const { adminLoginSchema } = require("../validators/auth.validation");
const { adminLogin, me, logout } = require("../controllers/auth.controller");
const { authRequired } = require("../middlewares/auth.middleware");

const router = express.Router();

router.post("/admin/login", validate(adminLoginSchema), adminLogin);
router.get("/me", authRequired, me);
router.post("/logout", authRequired, logout);

module.exports = router;
