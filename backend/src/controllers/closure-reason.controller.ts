import { Request, Response } from "express";
import { ClosureReasonService } from "../services/closure-reason.service";

const closureReasonService =
  new ClosureReasonService();

export class ClosureReasonController {
  static async getAll(
    req: Request,
    res: Response
  ) {
    try {
      const reasons =
        await closureReasonService.getAll();

      return res.json(reasons);

    } catch (error: any) {
      return res.status(400).json({
        message:
          error.message ||
          "Error al obtener motivos de cierre.",
      });
    }
  }

  static async getActive(
    req: Request,
    res: Response
  ) {
    try {
      const reasons =
        await closureReasonService.getActive();

      return res.json(reasons);

    } catch (error: any) {
      return res.status(400).json({
        message:
          error.message ||
          "Error al obtener motivos activos.",
      });
    }
  }

  static async create(
    req: Request,
    res: Response
  ) {
    try {
      const reason =
        await closureReasonService.create({
          name: req.body.name,
          description: req.body.description,
        });

      return res.status(201).json(reason);

    } catch (error: any) {
      return res.status(400).json({
        message:
          error.message ||
          "Error al crear motivo de cierre.",
      });
    }
  }

  static async update(
    req: Request,
    res: Response
  ) {
    try {
      const reason =
        await closureReasonService.update(
          String(req.params.id),
          {
            name: req.body.name,
            description: req.body.description,
            active: req.body.active,
          }
        );

      return res.json(reason);

    } catch (error: any) {
      return res.status(400).json({
        message:
          error.message ||
          "Error al actualizar motivo de cierre.",
      });
    }
  }

  static async deactivate(
    req: Request,
    res: Response
  ) {
    try {
      const reason =
        await closureReasonService.deactivate(
          String(req.params.id)
        );

      return res.json(reason);

    } catch (error: any) {
      return res.status(400).json({
        message:
          error.message ||
          "Error al desactivar motivo de cierre.",
      });
    }
  }

  static async activate(
    req: Request,
    res: Response
  ) {
    try {
      const reason =
        await closureReasonService.activate(
          String(req.params.id)
        );

      return res.json(reason);

    } catch (error: any) {
      return res.status(400).json({
        message:
          error.message ||
          "Error al activar motivo de cierre.",
      });
    }
  }
}