import { Request, Response } from "express";
import { DashboardService } from "../service/dashboard.servie";

export class DashboardController{
    constructor(private dashboardService :DashboardService){}

    getSensors = async (req: Request, res: Response) => {
       try {
         const data = await this.dashboardService.getSensors(req.query as Record<string, string>);
        res.status(200).json({ success: true, data });
       } catch (error) {
        const err = error as Error;
         res.status(500).json({msg:err.message});
       }
    };

    getLatestReadings = async (req: Request, res: Response) => {
       try {
         const data = await this.dashboardService.getLatestReadings(req.query.limit as string);
        res.status(200).json({ success: true, data });
       } catch (error) {
        const err = error as Error;
        res.status(500).json({msg:err.message});
       }
    };

    getSummary = async (_req: Request, res: Response) => {
      try {
          const data = await this.dashboardService.getSummary();
        res.status(200).json({ success: true, data });
      } catch (error) {
        const err =error as Error;
        res.status(500).json({msg:err.message});
      }
    };

    getSensorHistory = async (req: Request, res: Response) => {
        try {
            const data = await this.dashboardService.getSensorHistory(req.params.sensorId as string);
        res.status(200).json({ success: true, data });
        } catch (error) {
            const err = error as Error;
            res.status(500).json({msg:err.message});
        }
    };

    simulateTick = async (_req: Request, res: Response) => {
      try {
          const data = await this.dashboardService.simulateTick();
        res.status(200).json({ success: true, data });
      } catch (error) {
        const err = error as Error;
        res.status(500).json({msg:err.message});
      }
    };
}
