const express = require("express");
const { sensorController } = require("../controllers/sensor.controller");

const router = express.Router();

router.get("/", sensorController.getAll);

module.exports = router;
