import {
  Router,
} from "express";

import {
  TechnicalClosureController,
} from "../controllers/technical-closure.controller";

const router =
  Router();

router.post(
  "/",
  TechnicalClosureController.createClosure
);

router.get(
  "/report/:reportId",
  TechnicalClosureController.getByReportId
);



export default router;