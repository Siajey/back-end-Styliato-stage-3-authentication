const express = require("express");
const router = express.Router();

//prefix router User
const user = require("./auth");
router.use("/", user);

//prefix router User
const dev = require("./dev");
router.use("/dev", dev);



module.exports = router;
