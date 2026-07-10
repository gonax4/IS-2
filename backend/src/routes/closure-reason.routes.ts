import { Router } from "express";
import { ClosureReasonController } from "../controllers/closure-reason.controller";

const router =
  Router();

router.get(
  "/",
  ClosureReasonController.getAll
);

router.get(
  "/active",
  ClosureReasonController.getActive
);

router.post(
  "/",
  ClosureReasonController.create
);

router.patch(
  "/:id",
  ClosureReasonController.update
);

router.patch(
  "/:id/deactivate",
  ClosureReasonController.deactivate
);

router.patch(
  "/:id/activate",
  ClosureReasonController.activate
);

export default router;