import { Request, Response } from "express";
import { ProblemTypeService } from "../services/problem-type.service";

const problemTypeService =
  new ProblemTypeService();

export class ProblemTypeController {
  static async getAll(
    req: Request,
    res: Response
  ) {
    try {
      const problemTypes =
        await problemTypeService.getAll();

      return res.json(problemTypes);

    } catch (error: any) {
      return res.status(400).json({
        message:
          error.message ||
          "Error al obtener tipos de problema.",
      });
    }
  }

  static async getActive(
    req: Request,
    res: Response
  ) {
    try {
      const problemTypes =
        await problemTypeService.getActive();

      return res.json(problemTypes);

    } catch (error: any) {
      return res.status(400).json({
        message:
          error.message ||
          "Error al obtener tipos activos.",
      });
    }
  }

  static async create(
    req: Request,
    res: Response
  ) {
    try {
      const problemType =
        await problemTypeService.create({
          name: req.body.name,
          description: req.body.description,
          categoryId: req.body.categoryId,
        });

      return res.status(201).json(problemType);

    } catch (error: any) {
      return res.status(400).json({
        message:
          error.message ||
          "Error al crear tipo de problema.",
      });
    }
  }

  static async update(
    req: Request,
    res: Response
  ) {
    try {
      const problemType =
        await problemTypeService.update(
          String(req.params.id),
          {
            name: req.body.name,
            description: req.body.description,
            categoryId: req.body.categoryId,
            active: req.body.active,
          }
        );

      return res.json(problemType);

    } catch (error: any) {
      return res.status(400).json({
        message:
          error.message ||
          "Error al actualizar tipo de problema.",
      });
    }
  }

  static async deactivate(
    req: Request,
    res: Response
  ) {
    try {
      const problemType =
        await problemTypeService.deactivate(
          String(req.params.id)
        );

      return res.json(problemType);

    } catch (error: any) {
      return res.status(400).json({
        message:
          error.message ||
          "Error al desactivar tipo de problema.",
      });
    }
  }

  static async activate(
    req: Request,
    res: Response
  ) {
    try {
      const problemType =
        await problemTypeService.activate(
          String(req.params.id)
        );

      return res.json(problemType);

    } catch (error: any) {
      return res.status(400).json({
        message:
          error.message ||
          "Error al activar tipo de problema.",
      });
    }
  }
}