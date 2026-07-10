import {
  TechnicalClosureRepository,
} from "../repositories/technical-closure.repository";

const technicalClosureRepository =
  new TechnicalClosureRepository();

type CreateTechnicalClosureInput = {
  reportId: string;
  technicianId: string;
  result?: string;
  closureReasonId?: string;
  observations: string;
  closureEvidenceUrl?: string;
  followUpNotes?: string;
};

function isFollowUpReason(
  reasonName: string
) {
  const value =
    reasonName
      .toUpperCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");

  return (
    value.includes("SEGUIMIENTO") ||
    value.includes("FOLLOW")
  );
}

export class TechnicalClosureService {
  async createClosure(
    data: CreateTechnicalClosureInput
  ) {
    if (!data.reportId) {
      throw new Error("El reporte es obligatorio.");
    }

    if (!data.technicianId) {
      throw new Error("El técnico es obligatorio.");
    }

    if (!data.observations?.trim()) {
      throw new Error("Las observaciones de cierre son obligatorias.");
    }

    let result =
      data.result?.trim();

    let followUpRequired =
      false;

    if (data.closureReasonId) {
      const closureReason =
        await technicalClosureRepository
          .findClosureReasonById(
            data.closureReasonId
          );

      if (!closureReason) {
        throw new Error(
          "El motivo de cierre seleccionado no existe."
        );
      }

      if (!closureReason.active) {
        throw new Error(
          "El motivo de cierre seleccionado está inactivo."
        );
      }

      result =
        closureReason.name;

      followUpRequired =
        isFollowUpReason(
          closureReason.name
        );
    }

    if (!result) {
      throw new Error(
        "El resultado técnico es obligatorio."
      );
    }

    if (
      followUpRequired &&
      !data.followUpNotes?.trim()
    ) {
      throw new Error(
        "Debes registrar las notas de seguimiento."
      );
    }

    return await technicalClosureRepository
      .create({
        reportId:
          data.reportId,

        technicianId:
          data.technicianId,

        result,

        closureReasonId:
          data.closureReasonId,

        observations:
          data.observations.trim(),

        closureEvidenceUrl:
          data.closureEvidenceUrl,

        followUpRequired,

        followUpNotes:
          data.followUpNotes?.trim() ||
          undefined,
      });
  }

  async getByReportId(
    reportId: string
  ) {
    return await technicalClosureRepository
      .findByReportId(reportId);
  }
}