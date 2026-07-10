import { Status } from "@prisma/client";
import { ReportRepository } from "../repositories/report.repository";
import { TechnicalAttentionRepository } from "../repositories/technical-attention.repository";

const reportRepository =
  new ReportRepository();

const technicalAttentionRepository =
  new TechnicalAttentionRepository();

export class TechnicalAttentionService {
  async createAttention(data: {
    reportId: string;
    technicianId: string;
    checklist: Record<string, boolean>;
    fieldValues: Record<string, string>;
    actionTaken: string;
    technicalResult: string;
    observations?: string;
  }) {
    if (!data.reportId) {
      throw new Error("El reporte es obligatorio.");
    }

    if (!data.technicianId) {
      throw new Error("El técnico es obligatorio.");
    }

    if (!data.actionTaken) {
      throw new Error("La acción o situación registrada es obligatoria.");
    }

    if (!data.technicalResult) {
      throw new Error("El resultado técnico es obligatorio.");
    }

    const report =
      await reportRepository.findById(data.reportId);

    if (!report) {
      throw new Error("Reporte no encontrado.");
    }

    if (report.status !== Status.IN_PROGRESS) {
      throw new Error(
        "Solo se puede atender un reporte que está en atención."
      );
    }

    return await technicalAttentionRepository.create(data);
  }

  async getByReport(reportId: string) {
    return await technicalAttentionRepository.findByReport(reportId);
  }

  async getLatestByReport(reportId: string) {
    return await technicalAttentionRepository.findLatestByReport(reportId);
  }
}