import {
  Router,
} from "express";

import {
  SlaConfigurationController,
} from "../controllers/sla-configuration.controller";

const router =
  Router();

router.get(
  "/",
  SlaConfigurationController.getAll
);

router.put(
  "/:priority",
  SlaConfigurationController.upsert
);

export default router;