import {
  Request,
  Response,
} from "express";

import {
  Priority,
} from "@prisma/client";

import {
  SlaConfigurationService,
} from "../services/sla-configuration.service";

const slaConfigurationService =
  new SlaConfigurationService();

export class SlaConfigurationController {
  static async getAll(
    req: Request,
    res: Response
  ) {
    try {
      const configurations =
        await slaConfigurationService.getAll();

      return res.json(configurations);

    } catch (error: any) {
      return res.status(400).json({
        message:
          error.message ||
          "Error al obtener configuraciones SLA.",
      });
    }
  }

  static async upsert(
    req: Request,
    res: Response
  ) {
    try {
      const configuration =
        await slaConfigurationService.upsert({
          priority:
            req.params.priority as Priority,

          responseHours:
            Number(req.body.responseHours),
        });

      return res.json(configuration);

    } catch (error: any) {
      return res.status(400).json({
        message:
          error.message ||
          "Error al guardar configuración SLA.",
      });
    }
  }
}