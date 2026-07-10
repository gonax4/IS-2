import {
  Request,
  Response,
} from "express";

import {
  TechnicalClosureService,
} from "../services/technical-closure.service";

const technicalClosureService =
  new TechnicalClosureService();

export class TechnicalClosureController {
  static async createClosure(
    req: Request,
    res: Response
  ) {
    try {
      const closure =
        await technicalClosureService
          .createClosure({
            reportId:
              req.body.reportId,

            technicianId:
              req.body.technicianId,

            result:
              req.body.result,

            closureReasonId:
              req.body.closureReasonId,

            observations:
              req.body.observations,

            closureEvidenceUrl:
              req.body.closureEvidenceUrl,

            followUpNotes:
              req.body.followUpNotes,
          });

      return res.status(201).json(closure);

    } catch (error: any) {
      return res.status(400).json({
        message:
          error.message ||
          "Error al registrar el cierre técnico.",
      });
    }
  }

  static async getByReportId(
    req: Request,
    res: Response
  ) {
    try {
      const closure =
        await technicalClosureService
          .getByReportId(
            String(req.params.reportId)
          );

      return res.json(closure);

    } catch (error: any) {
      return res.status(400).json({
        message:
          error.message ||
          "Error al obtener el cierre técnico.",
      });
    }
  }
}