import express, { Application } from "express";
import dotenv from "dotenv";
import http from "http";
import connectDB from "./config/Database/mongoDB";
import cors from "cors";
import dashboardRouter from "./router/dashboard.router";
import { errorMiddleware } from "./middlewares/error.middleware";
import { initializeSocket } from "./config/socket";
import { DashboardRepository } from "./repository/dashboard.repository";
import { DashboardService } from "./service/dashboard.servie";
import { SimulatorService } from "./service/simulator.service";

dotenv.config();

const app: Application = express();

const corsOptions = {
  origin: process.env.CLIENT_URL,
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());

app.use("/api/dashboard", dashboardRouter);
app.use(errorMiddleware);

const PORT = process.env.PORT || 4000;

const startServer = async () => {
  await connectDB();

  const server = http.createServer(app);
  const io = initializeSocket(server);
  const dashboardService = new DashboardService(new DashboardRepository());
  const simulatorService = new SimulatorService(dashboardService, io);

  await dashboardService.ensureSeedData();
  simulatorService.start();

  server.listen(PORT, () => {
    console.log(`Server running on port: ${PORT}`);
  });
};

startServer().catch((error) => {
  console.error("Unable to start server", error);
  process.exit(1);
});
