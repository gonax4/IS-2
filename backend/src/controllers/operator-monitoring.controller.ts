import {
  Request,
  Response,
} from "express";

import {
  OperatorMonitoringService,
} from "../services/operator-monitoring.service";

const operatorMonitoringService =
  new OperatorMonitoringService();

export class OperatorMonitoringController {
  static async getTechnicians(
    req: Request,
    res: Response
  ) {
    try {
      const operatorId =
        String(req.params.operatorId);

      const technicians =
        await operatorMonitoringService
          .getTechnicians(operatorId);

      return res.json(technicians);

    } catch (error: any) {
      return res.status(400).json({
        message:
          error.message ||
          "Error al obtener técnicos.",
      });
    }
  }

  static async getWorks(
    req: Request,
    res: Response
  ) {
    try {
      const operatorId =
        String(req.params.operatorId);

      const status =
        req.query.status
          ? String(req.query.status)
          : undefined;

      const technicianId =
        req.query.technicianId
          ? String(req.query.technicianId)
          : undefined;

      const priority =
        req.query.priority
          ? String(req.query.priority)
          : undefined;

      const works =
        await operatorMonitoringService
          .getWorks({
            operatorId,
            status,
            technicianId,
            priority,
          });

      return res.json(works);

    } catch (error: any) {
      return res.status(400).json({
        message:
          error.message ||
          "Error al obtener trabajos monitoreados.",
      });
    }
  }

  static async getMetrics(
    req: Request,
    res: Response
  ) {
    try {
      const operatorId =
        String(req.params.operatorId);

      const metrics =
        await operatorMonitoringService
          .getMetrics(operatorId);

      return res.json(metrics);

    } catch (error: any) {
      return res.status(400).json({
        message:
          error.message ||
          "Error al obtener métricas.",
      });
    }
  }
}