import { Router } from "express";
import { CategoryController } from "../controllers/category.controller";

const router =
  Router();

router.get(
  "/",
  CategoryController.getAll
);

router.get(
  "/active",
  CategoryController.getActive
);

router.post(
  "/",
  CategoryController.create
);

router.patch(
  "/:id",
  CategoryController.update
);

router.patch(
  "/:id/deactivate",
  CategoryController.deactivate
);

router.patch(
  "/:id/activate",
  CategoryController.activate
);

export default router;