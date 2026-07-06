import { Sensor, SensorReading, SensorStatus } from "../models/sensor.model";

const sensorTypes = ["temperature", "humidity", "co2", "vibration", "voltage", "pressure"];
const zones = ["North", "South", "East", "West", "Core", "Edge"];

const sensorUnits: Record<string, string> = {
  temperature: "C",
  humidity: "%",
  co2: "ppm",
  vibration: "mm/s",
  voltage: "V",
  pressure: "kPa",
};

export const getSensorTypes = () => sensorTypes;

const randomNumber = (min: number, max: number) => {
  return Number((Math.random() * (max - min) + min).toFixed(2));
};

const getRandomValue = (sensorType: string) => {
  if (sensorType === "temperature") return randomNumber(18, 42);
  if (sensorType === "humidity") return randomNumber(25, 85);
  if (sensorType === "co2") return randomNumber(350, 1800);
  if (sensorType === "vibration") return randomNumber(0.1, 8);
  if (sensorType === "voltage") return randomNumber(190, 250);
  return randomNumber(85, 130);
};

const getStatus = (sensorType: string, value: number, isOffline: boolean): SensorStatus => {
  if (isOffline) return "offline";

  if (sensorType === "temperature") {
    if (value >= 38) return "critical";
    if (value >= 32) return "warning";
  }

  if (sensorType === "humidity") {
    if (value >= 80) return "critical";
    if (value >= 70 || value <= 35) return "warning";
  }

  if (sensorType === "co2") {
    if (value >= 1400) return "critical";
    if (value >= 1000) return "warning";
  }

  if (sensorType === "vibration") {
    if (value >= 6.5) return "critical";
    if (value >= 4.5) return "warning";
  }

  if (sensorType === "voltage") {
    if (value <= 198 || value >= 246) return "critical";
    if (value <= 205 || value >= 240) return "warning";
  }

  if (sensorType === "pressure") {
    if (value <= 90 || value >= 125) return "critical";
    if (value <= 95 || value >= 120) return "warning";
  }

  return "normal";
};

export const createReading = (sensorType: string, activeStatus = true): SensorReading => {
  const isOffline = !activeStatus || Math.random() < 0.02;
  const value = isOffline ? 0 : getRandomValue(sensorType);

  return {
    timestamp: new Date(),
    value,
    unit: sensorUnits[sensorType] || "",
    status: getStatus(sensorType, value, isOffline),
  };
};

export const createSensors = (count = 1000): Sensor[] => {
  const sensors: Sensor[] = [];

  for (let index = 0; index < count; index++) {
    const sensorType = sensorTypes[index % sensorTypes.length];
    const sensorNumber = String(index + 1).padStart(4, "0");
    const activeStatus = Math.random() > 0.03;
    const latestReading = createReading(sensorType, activeStatus);

    sensors.push({
      sensorId: `SNS-${sensorNumber}`,
      sensorName: `${sensorType.toUpperCase()} Sensor ${sensorNumber}`,
      sensorType,
      unit: sensorUnits[sensorType],
      location: {
        zone: zones[index % zones.length],
        floor: `F${(index % 8) + 1}`,
        rack: `R${(index % 40) + 1}`,
        room: `Room ${(index % 24) + 1}`,
      },
      activeStatus,
      latestReading,
      history: [latestReading],
    });
  }

  return sensors;
};
