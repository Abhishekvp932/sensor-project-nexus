import { DashboardRepository } from "../repository/dashboard.repository";
import { createReading, createSensors, getSensorTypes } from "../utils/sensorSimulator";


export class DashboardService {
  constructor(private dashboardRepository: DashboardRepository) {}

  async ensureSeedData() {
    const count = await this.dashboardRepository.countSensors();
    if (count >= 1000) return;

    await this.dashboardRepository.insertSensors(createSensors(1000));
  }

  async getSensors(query: {
    page?: string;
    limit?: string;
    sensorType?: string;
    status?: string;
    location?: string;
    search?: string;
  }) {
    const page = Math.max(Number(query.page) || 1, 1);
    const limit = Math.min(Math.max(Number(query.limit) || 25, 1), 100);
    const result = await this.dashboardRepository.findSensors({
      page,
      limit,
      sensorType: query.sensorType,
      status: query.status,
      location: query.location,
      search: query.search?.trim(),
    });

    return {
      sensors: result.items,
      pagination: {
        page,
        limit,
        total: result.total,
        totalPages: Math.ceil(result.total / limit),
      },
    };
  }

  async getLatestReadings(limit?: string) {
    return this.dashboardRepository.findLatestReadings(Math.min(Number(limit) || 100, 200));
  }

  async getSummary() {
    const [summary] = await this.dashboardRepository.getSummary();
    const totals = summary?.totals?.[0] ?? {
      totalSensors: 0,
      activeSensors: 0,
      warningSensors: 0,
      criticalSensors: 0,
      offlineSensors: 0,
    };

    return {
      totals,
      byType: this.mapAggregation(summary?.byType),
      byStatus: this.mapAggregation(summary?.byStatus),
      sensorTypes: getSensorTypes(),
    };
  }

  async getSensorHistory(sensorId: string) {
    const sensor = await this.dashboardRepository.findSensorHistory(sensorId);
    if (!sensor) {
      const error = new Error("Sensor not found") as Error & { statusCode: number };
      error.statusCode = 404;
      throw error;
    }
    return sensor;
  }

  async simulateTick() {
    const sensors = await this.dashboardRepository.findAllSensorIdentities();
    const sampleSize = Math.min(160, sensors.length);
    const shuffled = sensors.sort(() => 0.5 - Math.random()).slice(0, sampleSize);

    const updatedSensors = await Promise.all(
      shuffled.map((sensor) =>
        this.dashboardRepository.updateSensorReading(
          sensor.sensorId,
          createReading(sensor.sensorType, sensor.activeStatus)
        )
      )
    );

    return {
      updatedSensors: updatedSensors.filter(Boolean),
      summary: await this.getSummary(),
      timestamp: new Date().toISOString(),
    };
  }

  private mapAggregation(items: Array<{ _id: string; count: number }> = []) {
    return items.map((item) => ({
      name: item._id,
      count: item.count,
    }));
  }
}
