import mqtt from 'mqtt';
import { SensorData, DeviceData } from '../types';

class MQTTService {
  private client: mqtt.MqttClient;
  private static instance: MQTTService;
  private sensorDataCallback: ((data: SensorData) => void) | null = null;
  private deviceDataCallback: ((data: DeviceData) => void) | null = null;
  private sensorIdCounter: number = 50;
  private deviceIdCounter: number = 50;

  private constructor() {
    this.client = mqtt.connect("wss://broker.hivemq.com:8884/mqtt");
    this.setupListeners();
  }

  public static getInstance(): MQTTService {
    if (!MQTTService.instance) {
      MQTTService.instance = new MQTTService();
    }
    return MQTTService.instance;
  }

  private setupListeners() {
    this.client.on("connect", () => {
      console.log("Connected to MQTT broker");
      this.client.subscribe("esp32/lights/log");
      this.client.subscribe("esp32/sensors");
    });

    this.client.on("message", (topic, message) => {
      const data = JSON.parse(message.toString());

      if (topic === "esp32/lights/log" && this.deviceDataCallback) {
        const deviceName = this.getDeviceName(data.led);
        const deviceData: DeviceData = {
          id: (this.deviceIdCounter++).toString(),
          name: deviceName,
          status: data.state === "on",
          timestamp: data.timestamp
        };
        this.deviceDataCallback(deviceData);
        this.saveDeviceState(deviceName, data.state === "on");
      }

      if (topic === "esp32/sensors" && this.sensorDataCallback) {
        const sensorData: SensorData = {
          id: (this.sensorIdCounter++).toString(),
          temperature: data.temp,
          humidity: data.hum,
          light: data.light,
          timestamp: data.timestamp
        };
        this.sensorDataCallback(sensorData);
      }
    });
  }

  private getDeviceName(ledNumber: number): string {
    switch (ledNumber) {
      case 1:
        return "Đèn";
      case 2:
        return "Quạt";
      case 3:
        return "Điều hòa";
      default:
        return "Unknown";
    }
  }

  private saveDeviceState(deviceName: string, state: boolean) {
    const deviceKey = this.getDeviceKey(deviceName);
    if (deviceKey) {
      localStorage.setItem(`device_${deviceKey}`, JSON.stringify(state));
    }
  }

  public getInitialDeviceStates() {
    return {
      light: JSON.parse(localStorage.getItem('device_light') || 'false'),
      fan: JSON.parse(localStorage.getItem('device_fan') || 'false'),
      aircon: JSON.parse(localStorage.getItem('device_aircon') || 'false')
    };
  }

  private getDeviceKey(deviceName: string): string | null {
    switch (deviceName) {
      case "Đèn":
        return "light";
      case "Quạt":
        return "fan";
      case "Điều hòa":
        return "aircon";
      default:
        return null;
    }
  }

  public onSensorData(callback: (data: SensorData) => void) {
    this.sensorDataCallback = callback;
  }

  public onDeviceData(callback: (data: DeviceData) => void) {
    this.deviceDataCallback = callback;
  }

  public publishDeviceControl(device: string, state: boolean) {
    const ledNumber = this.getLedNumber(device);
    if (ledNumber) {
      const payload = JSON.stringify({
        led: ledNumber,
        state: state ? "on" : "off"
      });
      this.client.publish("esp32/lights/control", payload);
      this.saveDeviceState(this.getDeviceName(ledNumber), state);
    }
  }

  private getLedNumber(device: string): number | null {
    switch (device) {
      case "light":
        return 1;
      case "fan":
        return 2;
      case "aircon":
        return 3;
      default:
        return null;
    }
  }

  public disconnect() {
    if (this.client.connected) {
      this.client.end();
    }
  }
}

export default MQTTService