import {
  Request,
  Response,
} from "express";

import {
  TechnicalClosureResult,
} from "@prisma/client";

import {
  TechnicalClosureService,
} from "../services/technical-closure.service";

const technicalClosureService =
  new TechnicalClosureService();

export class TechnicalClosureController {
  static async getByReport(
    req: Request,
    res: Response
  ) {
    try {
      const reportId =
        String(req.params.reportId);

      const closure =
        await technicalClosureService
          .getByReport(reportId);

      return res.json(closure);

    } catch (error: any) {
      return res.status(400).json({
        message:
          error.message ||
          "Error al obtener cierre técnico.",
      });
    }
  }

  static async create(
    req: Request,
    res: Response
  ) {
    try {
      const closure =
        await technicalClosureService
          .createClosure({
            reportId:
              String(req.body.reportId || ""),

            technicianId:
              String(req.body.technicianId || ""),

            result:
              req.body.result as TechnicalClosureResult,

            observations:
              String(req.body.observations || ""),

            closureEvidenceUrl:
              req.body.closureEvidenceUrl,

            followUpNotes:
              req.body.followUpNotes,
          });

      return res.status(201).json({
        message:
          "Cierre técnico registrado correctamente.",
        closure,
      });

    } catch (error: any) {
      return res.status(400).json({
        message:
          error.message ||
          "Error al registrar cierre técnico.",
      });
    }
  }
}