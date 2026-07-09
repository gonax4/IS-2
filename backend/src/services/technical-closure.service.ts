import {
  Status,
  TechnicalClosureResult,
} from "@prisma/client";

import {
  TechnicalClosureRepository,
} from "../repositories/technical-closure.repository";

const technicalClosureRepository =
  new TechnicalClosureRepository();

export class TechnicalClosureService {
  async getByReport(
    reportId: string
  ) {
    return await technicalClosureRepository
      .findByReport(reportId);
  }

  async createClosure(data: {
    reportId: string;
    technicianId: string;
    result: TechnicalClosureResult;
    observations: string;
    closureEvidenceUrl?: string;
    followUpNotes?: string;
  }) {
    if (!data.reportId) {
      throw new Error(
        "El reporte es obligatorio."
      );
    }

    if (!data.technicianId) {
      throw new Error(
        "El técnico es obligatorio."
      );
    }

    if (!data.result) {
      throw new Error(
        "El resultado técnico es obligatorio."
      );
    }

    if (!data.observations?.trim()) {
      throw new Error(
        "Las observaciones de cierre son obligatorias."
      );
    }

    const report =
      await technicalClosureRepository
        .findReportById(data.reportId);

    if (!report) {
      throw new Error(
        "Reporte no encontrado."
      );
    }

    if (report.status !== Status.IN_PROGRESS) {
      throw new Error(
        "Solo se puede cerrar un reporte que está en atención."
      );
    }

    const activeAssignment =
      report.assignments.find(
        (assignment) =>
          assignment.active &&
          assignment.technicianId ===
            data.technicianId
      );

    if (!activeAssignment) {
      throw new Error(
        "Este reporte no está asignado al técnico actual."
      );
    }

    if (!report.fieldWork) {
      throw new Error(
        "Primero debes registrar la trazabilidad del trabajo de campo."
      );
    }

    if (!report.fieldWork.closedAt) {
      throw new Error(
        "Primero debes cerrar el registro de trabajo de campo."
      );
    }

    const hasBefore =
      report.fieldWork.evidences.some(
        (evidence) =>
          evidence.phase === "BEFORE"
      );

    const hasAfter =
      report.fieldWork.evidences.some(
        (evidence) =>
          evidence.phase === "AFTER"
      );

    if (!hasBefore || !hasAfter) {
      throw new Error(
        "Debes registrar evidencias antes y después antes del cierre operativo."
      );
    }

    if (
      !report.technicalAttentions ||
      report.technicalAttentions.length === 0
    ) {
      throw new Error(
        "Primero debes registrar la atención técnica del reporte."
      );
    }

    const followUpRequired =
      data.result ===
      TechnicalClosureResult.FOLLOW_UP_REQUIRED;

    if (
      followUpRequired &&
      !data.followUpNotes?.trim()
    ) {
      throw new Error(
        "Debes indicar las notas de seguimiento requerido."
      );
    }

    return await technicalClosureRepository
      .create({
        reportId:
          data.reportId,

        technicianId:
          data.technicianId,

        result:
          data.result,

        observations:
          data.observations.trim(),

        closureEvidenceUrl:
          data.closureEvidenceUrl,

        followUpRequired,

        followUpNotes:
          data.followUpNotes?.trim(),
      });
  }
}