import {
  Router,
} from "express";

import {
  TechnicalClosureController,
} from "../controllers/technical-closure.controller";

const router =
  Router();

router.get(
  "/report/:reportId",
  TechnicalClosureController.getByReport
);

router.post(
  "/",
  TechnicalClosureController.create
);

export default router;