import express from "express";
import cors from "cors";

import authRoutes from "./routes/auth.routes";
import reportRoutes from "./routes/report.routes";
import uploadRoutes from "./routes/upload.routes";
import reportFollowRoutes from "./routes/report-follow.routes";
import notificationRoutes from "./routes/notification.routes";
import technicianApplicationRoutes from "./routes/technician-application.routes";
import assignmentRoutes from "./routes/assignment.routes";
import categoryRoutes from "./routes/category.routes";
import problemTypeRoutes from "./routes/problem-type.routes";
import closureReasonRoutes from "./routes/closure-reason.routes";
import slaConfigurationRoutes from "./routes/sla-configuration.routes";
import municipalityRoutes from "./routes/municipality.routes";
import technicalAttentionRoutes from "./routes/technical-attention.routes";
import fieldWorkRoutes from "./routes/fieldwork.routes";
import technicalClosureRoutes from "./routes/technical-closure.routes";
import operatorMonitoringRoutes from "./routes/operator-monitoring.routes";

const app = express();

app.use(cors());
app.use(express.json({limit: "25mb",}));
app.use(express.json({limit: "25mb",}));

app.use("/api/auth", authRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/uploads", uploadRoutes);
app.use("/api/report-follows", reportFollowRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/technician-applications", technicianApplicationRoutes);
app.use("/api/assignments", assignmentRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/problem-types", problemTypeRoutes);
app.use("/api/closure-reasons", closureReasonRoutes);
app.use("/api/sla-configurations", slaConfigurationRoutes);
app.use("/api/municipalities", municipalityRoutes);
app.use("/api/technical-attentions", technicalAttentionRoutes);
app.use("/api/fieldwork", fieldWorkRoutes);
app.use("/api/technical-closures", technicalClosureRoutes);
app.use("/api/operator-monitoring", operatorMonitoringRoutes);

app.get("/", (req, res) => {res.send("API ReportaYA funcionando");});

export default app;
