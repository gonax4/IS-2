import { Request, Response } from "express";
import { CategoryService } from "../services/category.service";

const categoryService =
  new CategoryService();

export class CategoryController {
  static async getAll(
    req: Request,
    res: Response
  ) {
    try {
      const categories =
        await categoryService.getAll();

      return res.json(categories);

    } catch (error: any) {
      return res.status(400).json({
        message:
          error.message ||
          "Error al obtener categorías.",
      });
    }
  }

  static async getActive(
    req: Request,
    res: Response
  ) {
    try {
      const categories =
        await categoryService.getActive();

      return res.json(categories);

    } catch (error: any) {
      return res.status(400).json({
        message:
          error.message ||
          "Error al obtener categorías activas.",
      });
    }
  }

  static async create(
    req: Request,
    res: Response
  ) {
    try {
      const category =
        await categoryService.create({
          name: req.body.name,
          description: req.body.description,
        });

      return res.status(201).json(category);

    } catch (error: any) {
      return res.status(400).json({
        message:
          error.message ||
          "Error al crear categoría.",
      });
    }
  }

  static async update(
    req: Request,
    res: Response
  ) {
    try {
      const category =
        await categoryService.update(
          String(req.params.id),
          {
            name: req.body.name,
            description: req.body.description,
            active: req.body.active,
          }
        );

      return res.json(category);

    } catch (error: any) {
      return res.status(400).json({
        message:
          error.message ||
          "Error al actualizar categoría.",
      });
    }
  }

  static async deactivate(
    req: Request,
    res: Response
  ) {
    try {
      const category =
        await categoryService.deactivate(
          String(req.params.id)
        );

      return res.json(category);

    } catch (error: any) {
      return res.status(400).json({
        message:
          error.message ||
          "Error al desactivar categoría.",
      });
    }
  }

  static async activate(
    req: Request,
    res: Response
  ) {
    try {
      const category =
        await categoryService.activate(
          String(req.params.id)
        );

      return res.json(category);

    } catch (error: any) {
      return res.status(400).json({
        message:
          error.message ||
          "Error al activar categoría.",
      });
    }
  }
}