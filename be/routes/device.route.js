const express = require("express");
const { deviceController } = require("../controllers/device.controller");

const router = express.Router();

router.get("/", deviceController.getAll);
router.get("/status", deviceController.getStatus);
router.post("/toggle", deviceController.toggle);

module.exports = router;
