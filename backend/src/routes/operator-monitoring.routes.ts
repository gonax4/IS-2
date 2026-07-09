import {
  Router,
} from "express";

import {
  OperatorMonitoringController,
} from "../controllers/operator-monitoring.controller";

const router =
  Router();

router.get(
  "/:operatorId/technicians",
  OperatorMonitoringController.getTechnicians
);

router.get(
  "/:operatorId/works",
  OperatorMonitoringController.getWorks
);

router.get(
  "/:operatorId/metrics",
  OperatorMonitoringController.getMetrics
);

export default router;