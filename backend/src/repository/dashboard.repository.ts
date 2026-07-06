
import { Sensor, SensorModel, SensorReading } from "../models/sensor.model";

type SensorFilter = Record<string, unknown>;

export class DashboardRepository {
  countSensors() {
    return SensorModel.countDocuments();
  }

  insertSensors(sensors: Sensor[]) {
    return SensorModel.insertMany(sensors, { ordered: false });
  }

  async findSensors(params: {
    page: number;
    limit: number;
    sensorType?: string;
    status?: string;
    location?: string;
    search?: string;
  }) {
    const filter = this.buildFilter(params);
    const skip = (params.page - 1) * params.limit;
    const [items, total] = await Promise.all([
      SensorModel.find(filter)
        .sort({ sensorId: 1 })
        .skip(skip)
        .limit(params.limit)
        .lean(),
      SensorModel.countDocuments(filter),
    ]);

    return { items, total };
  }

  findLatestReadings(limit = 100) {
    return SensorModel.find()
      .sort({ "latestReading.timestamp": -1 })
      .limit(limit)
      .select("-history")
      .lean();
  }

  getSummary() {
    return SensorModel.aggregate([
      {
        $facet: {
          totals: [
            {
              $group: {
                _id: null,
                totalSensors: { $sum: 1 },
                activeSensors: { $sum: { $cond: ["$activeStatus", 1, 0] } },
                warningSensors: {
                  $sum: { $cond: [{ $eq: ["$latestReading.status", "warning"] }, 1, 0] },
                },
                criticalSensors: {
                  $sum: { $cond: [{ $eq: ["$latestReading.status", "critical"] }, 1, 0] },
                },
                offlineSensors: {
                  $sum: { $cond: [{ $eq: ["$latestReading.status", "offline"] }, 1, 0] },
                },
              },
            },
          ],
          byType: [{ $group: { _id: "$sensorType", count: { $sum: 1 } } }, { $sort: { _id: 1 } }],
          byStatus: [
            { $group: { _id: "$latestReading.status", count: { $sum: 1 } } },
            { $sort: { _id: 1 } },
          ],
        },
      },
    ]);
  }

  findSensorHistory(sensorId: string) {
    return SensorModel.findOne({ sensorId }).select("sensorId sensorName sensorType unit location history").lean();
  }

  async updateSensorReading(sensorId: string, reading: SensorReading) {
    return SensorModel.findOneAndUpdate(
      { sensorId },
      {
        $set: { latestReading: reading, activeStatus: reading.status !== "offline" },
        $push: { history: { $each: [reading], $slice: -30 } },
      },
      { returnDocument: "after"  }
    )
      .select("-history")
      .lean();
  }

  findAllSensorIdentities() {
    return SensorModel.find().select("sensorId sensorType activeStatus").lean();
  }

  private buildFilter(params: {
    sensorType?: string;
    status?: string;
    location?: string;
    search?: string;
  }): SensorFilter {
    const filter: SensorFilter = {};

    if (params.sensorType && params.sensorType !== "all") {
      filter.sensorType = params.sensorType;
    }

    if (params.status && params.status !== "all") {
      filter["latestReading.status"] = params.status;
    }

    if (params.location && params.location !== "all") {
      filter["location.zone"] = params.location;
    }

    if (params.search) {
      const expression = new RegExp(params.search, "i");
      filter.$or = [{ sensorId: expression }, { sensorName: expression }, { "location.zone": expression }];
    }

    return filter;
  }
}
