import { Router } from "express";
import { TechnicianApplicationController } from "../controllers/technician-application.controller";

const router =
  Router();

const technicianApplicationController =
  new TechnicianApplicationController();

router.post(
  "/",
  technicianApplicationController.create.bind(
    technicianApplicationController
  )
);

router.get(
  "/verify-email",
  technicianApplicationController.verifyEmail.bind(
    technicianApplicationController
  )
);

router.get(
  "/",
  technicianApplicationController.getAll.bind(
    technicianApplicationController
  )
);

router.get(
  "/pending",
  technicianApplicationController.getPending.bind(
    technicianApplicationController
  )
);

router.patch(
  "/:id/approve",
  technicianApplicationController.approve.bind(
    technicianApplicationController
  )
);

router.patch(
  "/:id/reject",
  technicianApplicationController.reject.bind(
    technicianApplicationController
  )
);

export default router;