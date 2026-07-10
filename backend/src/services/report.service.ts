import { ReportRepository }
  from "../repositories/report.repository";

import { ReportFactory }
  from "../factories/report.factory";

import {
  ReportCategory,
  Status,
  Priority,
} from "@prisma/client";

import {
  prisma,
} from "../config/prisma";

import { GeocodingService }
  from "./geocoding.service";

import { NotificationService }
  from "./notification.service";

import { ReportFollowRepository }
  from "../repositories/report-follow.repository";

import { MunicipalityRepository }
  from "../repositories/municipality.repository";

import { resolveMunicipalityNameFromLocation }
  from "../utils/municipalityResolver";

import { UserRepository }
  from "../repositories/user.repository";

export class ReportService {

  private reportRepository =
    new ReportRepository();

  private notificationService =
    new NotificationService();

  private reportFollowRepository =
    new ReportFollowRepository();

  private municipalityRepository =
    new MunicipalityRepository();

  private userRepository =
    new UserRepository();

  private getStatusLabel(
    status: Status
  ) {

    const labels:
      Record<Status, string> = {
        REGISTERED: "Registrado",
        VALIDATING: "En validación",
        APPROVED: "Aprobado",
        REJECTED: "Rechazado",
        PRIORITIZED: "Priorizado",
        ASSIGNED: "Asignado",
        IN_TRANSIT: "En traslado",
        IN_PROGRESS: "En proceso",
        RESOLVED: "Resuelto",
      };

    return labels[status];
  }

    private async calculateTargetDateByPriority(
      priority: Priority
    ) {
      const slaConfiguration =
        await prisma.slaConfiguration.findUnique({
          where: {
            priority,
          },
        });

      if (!slaConfiguration) {
        return null;
      }

      const targetDate =
        new Date();

      targetDate.setHours(
        targetDate.getHours() +
        slaConfiguration.responseHours
      );

      return targetDate;
    }

  async createReport(data: {

    title: string;

    category: ReportCategory;

    problemType: string;

    description: string;

    latitude?: number;

    longitude?: number;

    address?: string;

    isAnonymous?: boolean;

    userId: string;

    imageUrls: string[];
  }) {

    let address:
      string | undefined =
      data.address;

    let district:
      string | null =
      null;

    let province:
      string | null =
      null;

    let department:
      string | null =
      null;

    if (
      data.latitude !== undefined &&
      data.longitude !== undefined
    ) {
      const locationDetails =
        await GeocodingService
          .getLocationDetails(
            data.latitude,
            data.longitude
          );

      address =
        address ||
        locationDetails.address ||
        undefined;

      district =
        locationDetails.district;

      province =
        locationDetails.province;

      department =
        locationDetails.department;
    }

    if (
      !address &&
      data.latitude !== undefined &&
      data.longitude !== undefined
    ) {
      address =
        await GeocodingService
          .getAddress(
            data.latitude,
            data.longitude
          );
    }

    const municipalityName =
      resolveMunicipalityNameFromLocation({
        district,
        province,
        department,
        address,
      });

    let municipalityId:
      string | undefined =
      undefined;

    if (municipalityName) {
      const municipality =
        await this
          .municipalityRepository
          .findOrCreateByName(
            municipalityName
          );

      municipalityId =
        municipality.id;
    }

    const reportData =
      ReportFactory.create({

        ...data,

        address,

        municipalityId,
      });

    const report =
      await this
        .reportRepository
        .create(reportData);

    if (data.imageUrls.length > 0) {

      await this
        .reportRepository
        .createEvidences(

          report.id,

          data.imageUrls
        );
    }

    return report;
  }

  async getReportsWithLocation() {
    return await this
      .reportRepository
      .findReportsWithLocation();
  }

  async getReportsByUser(
    userId: string
  ) {

    return await this
      .reportRepository
      .findByUser(userId);
  }

  async getReportsByCategory(
    category: ReportCategory
  ) {

    return await this
      .reportRepository
      .findByCategory(category);
  }

  async getReportsByProblemType(
    problemType: string
  ) {

    return await this
      .reportRepository
      .findByProblemType(
        problemType
      );
  }

  async getTopProblems() {

    return await this
      .reportRepository
      .getTopProblems();
  }

  async getReportsByStatus(
    status: Status
  ) {

    return await this
      .reportRepository
      .findByStatus(status);
  }

  async getReportsByStatusForOperator(
    operatorId: string,
    status: Status
  ) {
    const operator =
      await this
        .userRepository
        .findById(
          operatorId
        );

    if (!operator) {
      throw new Error(
        "Operador no encontrado"
      );
    }

    if (operator.role !== "OPERATOR") {
      throw new Error(
        "El usuario no es operador municipal"
      );
    }

    if (!operator.municipalityId) {
      throw new Error(
        "El operador no tiene una municipalidad asignada"
      );
    }

    return await this
      .reportRepository
      .findByStatusAndMunicipality(
        status,
        operator.municipalityId
      );
  }

  async updateReportStatus(
    id: string,
    status: Status
  ) {

    const previousReport =
      await this
        .reportRepository
        .findById(id);

    if (!previousReport) {
      throw new Error(
        "Reporte no encontrado"
      );
    }

    const updatedReport =
      await this
        .reportRepository
        .updateStatus(
          id,
          status
        );

    const followers =
      await this
        .reportFollowRepository
        .findFollowersByReport(id);

    const userIdsToNotify =
      new Set<string>();

    userIdsToNotify.add(
      previousReport.userId
    );

    followers.forEach((follower) => {
      userIdsToNotify.add(
        follower.userId
      );
    });

    const statusText =
      this.getStatusLabel(status);

    const notifications =
      Array
        .from(userIdsToNotify)
        .map((userId) => ({
          userId,

          reportId:
            id,

          title:
            "Cambio de estado en reporte",

          message:
            `El reporte "${previousReport.title || previousReport.problemType}" cambió a ${statusText}.`,
        }));

    await this
      .notificationService
      .createMany(notifications);

    return updatedReport;
  }

  async getReportById(id: string) {

    const report =
      await this
        .reportRepository
        .findById(id);

    if (!report) {

      throw new Error(
        "Reporte no encontrado"
      );
    }

    return report;
  }

    async prioritizeReport(id: string, data: {
    impact: "BAJO" | "MEDIO" | "ALTO";
    probability: "BAJO" | "MEDIO" | "ALTO";
    operationalType: string;
    targetDate?: string;
    justification: string;
  }) {
    const report =
      await this
        .reportRepository
        .findById(id);

    if (!report) {
      throw new Error(
        "Reporte no encontrado"
      );
    }

    if (
      report.status !== Status.APPROVED &&
      report.status !== Status.PRIORITIZED
    ) {
      throw new Error(
        "Solo se pueden priorizar reportes aprobados."
      );
    }

    if (!data.operationalType?.trim()) {
      throw new Error(
        "El tipo operativo es obligatorio."
      );
    }

    if (!data.justification?.trim()) {
      throw new Error(
        "La justificación es obligatoria."
      );
    }

    let computedPriority:
      Priority =
      Priority.BAJO;

    if (
      (data.impact === "ALTO" && data.probability === "ALTO") ||
      (data.impact === "ALTO" && data.probability === "MEDIO") ||
      (data.impact === "MEDIO" && data.probability === "ALTO")
    ) {
      computedPriority =
        Priority.ALTO;

    } else if (
      (data.impact === "MEDIO" && data.probability === "MEDIO") ||
      (data.impact === "ALTO" && data.probability === "BAJO") ||
      (data.impact === "BAJO" && data.probability === "ALTO") ||
      (data.impact === "MEDIO" && data.probability === "BAJO")
    ) {
      computedPriority =
        Priority.MEDIO;
    }

    let targetDate =
      await this
        .calculateTargetDateByPriority(
          computedPriority
        );

    if (!targetDate && data.targetDate) {
      const manualTargetDate =
        new Date(`${data.targetDate}T00:00:00`);

      if (
        Number.isNaN(
          manualTargetDate.getTime()
        )
      ) {
        throw new Error(
          "La fecha objetivo no es válida."
        );
      }

      targetDate =
        manualTargetDate;
    }

    if (!targetDate) {
      throw new Error(
        `No existe una configuración SLA para la prioridad ${computedPriority}.`
      );
    }

    const updatedReport =
      await this
        .reportRepository
        .updatePrioritization(id, {
          impact:
            data.impact,

          probability:
            data.probability,

          priority:
            computedPriority,

          operationalType:
            data.operationalType.trim(),

          targetDate,

          justification:
            data.justification.trim(),

          status:
            Status.PRIORITIZED,
        });

    const followers =
      await this
        .reportFollowRepository
        .findFollowersByReport(id);

    const userIdsToNotify =
      new Set<string>();

    userIdsToNotify.add(
      report.userId
    );

    followers.forEach((follower) =>
      userIdsToNotify.add(
        follower.userId
      )
    );

    await this
      .notificationService
      .createMany(
        Array
          .from(userIdsToNotify)
          .map((userId) => ({
            userId,

            reportId:
              id,

            title:
              "Reporte priorizado",

            message:
              `El reporte "${report.title || report.problemType}" fue priorizado como ${computedPriority}. Fecha objetivo: ${targetDate.toLocaleDateString("es-PE")}.`,
          }))
      );

    return updatedReport;
  }
}