import { Router } from "express";
import { DashboardController } from "../controller/dashboard.controller";
import { asyncHandler } from "../middlewares/asyncHandler";
import { DashboardRepository } from "../repository/dashboard.repository";
import { DashboardService } from "../service/dashboard.servie";


const router = Router();
const repository = new DashboardRepository();
const service = new DashboardService(repository);
const controller = new DashboardController(service);

router.get("/sensors", asyncHandler(controller.getSensors));
router.get("/readings/latest", asyncHandler(controller.getLatestReadings));
router.get("/summary", asyncHandler(controller.getSummary));
router.get("/sensors/:sensorId/history", asyncHandler(controller.getSensorHistory));
router.post("/simulate/tick", asyncHandler(controller.simulateTick));


export default router;
