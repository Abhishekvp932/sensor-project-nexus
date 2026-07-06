import { Schema, model, HydratedDocument } from "mongoose";

export type SensorStatus = "normal" | "warning" | "critical" | "offline";

export interface SensorReading {
  timestamp: Date;
  value: number;
  unit: string;
  status: SensorStatus;
}

export interface Sensor {
  sensorId: string;
  sensorName: string;
  sensorType: string;
  unit: string;
  location: {
    zone: string;
    floor: string;
    rack: string;
    room: string;
  };
  activeStatus: boolean;
  latestReading: SensorReading;
  history: SensorReading[];
}

export type SensorDocument = HydratedDocument<Sensor>;

const readingSchema = new Schema<SensorReading>(
  {
    timestamp: { type: Date, required: true },
    value: { type: Number, required: true },
    unit: { type: String, required: true },
    status: {
      type: String,
      enum: ["normal", "warning", "critical", "offline"],
      required: true,
    },
  },
  { _id: false }
);

const sensorSchema = new Schema<Sensor>(
  {
    sensorId: { type: String, required: true, unique: true, index: true },
    sensorName: { type: String, required: true },
    sensorType: { type: String, required: true, index: true },
    unit: { type: String, required: true },
    location: {
      zone: { type: String, required: true, index: true },
      floor: { type: String, required: true },
      rack: { type: String, required: true },
      room: { type: String, required: true },
    },
    activeStatus: { type: Boolean, required: true, default: true },
    latestReading: { type: readingSchema, required: true },
    history: { type: [readingSchema], default: [] },
  },
  { timestamps: true }
);

sensorSchema.index({ sensorType: 1, "latestReading.status": 1 });
sensorSchema.index({ sensorName: "text", sensorId: "text", "location.zone": "text" });

export const SensorModel = model<Sensor>("Sensor", sensorSchema);
