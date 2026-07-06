import { Server } from "socket.io";
import { DashboardService } from "./dashboard.servie";

export class SimulatorService {
  private timer: NodeJS.Timeout | null = null;

  constructor(
    private dashboardService: DashboardService,
    private io: Server
  ) {}

  start() {
    if (this.timer) return;

    this.timer = setInterval(async () => {
      try {
        const update = await this.dashboardService.simulateTick();
        this.io.emit("dashboard:update", update);
      } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown simulator error";
        console.error("Simulator tick failed", message);
      }
    }, 2500);
  }
}
