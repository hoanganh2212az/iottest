const mqtt = require('mqtt');
const { database } = require('./database');

class MQTTService {
  static instance;
  client;

  constructor() {
    this.client = mqtt.connect("wss://broker.hivemq.com:8884/mqtt");
    this.setupListeners();
  }

  static getInstance() {
    if (!MQTTService.instance) {
      MQTTService.instance = new MQTTService();
    }
    return MQTTService.instance;
  }

  setupListeners() {
    this.client.on("connect", () => {
      console.log("✅ Connected to MQTT broker");
      this.client.subscribe("esp32/lights/log");
      this.client.subscribe("esp32/sensors");
    });

    this.client.on("message", async (topic, message) => {
      try {
        const data = JSON.parse(message.toString());

        if (topic === "esp32/lights/log") {
          const deviceName = this.getDeviceName(data.led);
          const state = data.state === "on" ? "on" : "off";
          const timestamp = data.timestamp || new Date().toISOString().slice(0, 19).replace('T', ' ');

          const deviceKey = this.getDeviceKey(deviceName);

          // ✅ Ghi vào bảng devices
          await database.execute(
            'INSERT INTO devices (device_name, state, timestamp) VALUES (?, ?, ?)',
            [deviceKey, state, timestamp]
          );

          console.log(`💡 Device logged: ${deviceKey} = ${state} @ ${timestamp}`);
        }

        if (topic === "esp32/sensors") {
          const { temp, hum, light, timestamp } = data;
          const ts = timestamp || new Date().toISOString().slice(0, 19).replace('T', ' ');

          // ✅ Ghi vào bảng sensors
          await database.execute(
            'INSERT INTO sensors (temp, hum, light, timestamp) VALUES (?, ?, ?, ?)',
            [temp, hum, light, ts]
          );

          console.log(`🌡 Sensor logged: T=${temp} H=${hum} L=${light} @ ${ts}`);
        }
      } catch (err) {
        console.error("❌ Lỗi xử lý MQTT message:", err.message);
      }
    });
  }

  getDeviceName(ledNumber) {
    switch (ledNumber) {
      case 1: return "Đèn";
      case 2: return "Quạt";
      case 3: return "Điều hòa";
      default: return "Unknown";
    }
  }

  getDeviceKey(deviceName) {
    switch (deviceName) {
      case "Đèn": return "light";
      case "Quạt": return "fan";
      case "Điều hòa": return "air-conditioner";
      default: return "unknown";
    }
  }

  publishDeviceControl(device, state) {
    const ledNumber = this.getLedNumber(device);
    if (ledNumber) {
      const payload = JSON.stringify({
        led: ledNumber,
        state: state ? "on" : "off"
      });
      this.client.publish("esp32/lights/control", payload);
      console.log(`📤 Control sent to ${device}: ${payload}`);
    }
  }

  getLedNumber(device) {
    switch (device) {
      case "light": return 1;
      case "fan": return 2;
      case "aircon": return 3;
      default: return null;
    }
  }

  disconnect() {
    if (this.client.connected) {
      this.client.end();
    }
  }
}

module.exports = MQTTService;
