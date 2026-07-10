import { Router } from "express";
import { ProblemTypeController } from "../controllers/problem-type.controller";

const router =
  Router();

router.get(
  "/",
  ProblemTypeController.getAll
);

router.get(
  "/active",
  ProblemTypeController.getActive
);

router.post(
  "/",
  ProblemTypeController.create
);

router.patch(
  "/:id",
  ProblemTypeController.update
);

router.patch(
  "/:id/deactivate",
  ProblemTypeController.deactivate
);

router.patch(
  "/:id/activate",
  ProblemTypeController.activate
);

export default router;