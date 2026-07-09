import {
  Priority,
  Role,
  Status,
} from "@prisma/client";

import {
  OperatorMonitoringRepository,
} from "../repositories/operator-monitoring.repository";

const operatorMonitoringRepository =
  new OperatorMonitoringRepository();

function diffMinutes(
  start?: Date | string | null,
  end?: Date | string | null
) {
  if (!start || !end) {
    return null;
  }

  const startTime =
    new Date(start).getTime();

  const endTime =
    new Date(end).getTime();

  if (
    Number.isNaN(startTime) ||
    Number.isNaN(endTime)
  ) {
    return null;
  }

  const diff =
    Math.round(
      (endTime - startTime) / 60000
    );

  return diff >= 0
    ? diff
    : null;
}

function average(
  values: number[]
) {
  if (values.length === 0) {
    return null;
  }

  const total =
    values.reduce(
      (sum, value) =>
        sum + value,
      0
    );

  return Math.round(
    total / values.length
  );
}

export class OperatorMonitoringService {
  private async validateOperator(
    operatorId: string
  ) {
    const operator =
      await operatorMonitoringRepository
        .findOperatorById(operatorId);

    if (!operator) {
      throw new Error(
        "Operador no encontrado."
      );
    }

    if (operator.role !== Role.OPERATOR) {
      throw new Error(
        "El usuario no es operador municipal."
      );
    }

    if (!operator.municipalityId) {
      throw new Error(
        "El operador no tiene una municipalidad asignada."
      );
    }

    return operator;
  }

  async getTechnicians(
    operatorId: string
  ) {
    const operator =
      await this.validateOperator(
        operatorId
      );

    return await operatorMonitoringRepository
      .findTechniciansByMunicipality(
        operator.municipalityId!
      );
  }

  async getWorks(data: {
    operatorId: string;
    status?: string;
    technicianId?: string;
    priority?: string;
  }) {
    const operator =
      await this.validateOperator(
        data.operatorId
      );

    const status =
      data.status
        ? data.status as Status
        : undefined;

    const priority =
      data.priority
        ? data.priority as Priority
        : undefined;

    const assignments =
      await operatorMonitoringRepository
        .findAssignedWorksByMunicipality({
          municipalityId:
            operator.municipalityId!,

          status,

          technicianId:
            data.technicianId,

          priority,
        });

    return assignments.map((assignment) => {
      const report =
        assignment.report;

      const fieldWork =
        report.fieldWork;

      const technicalClosure =
        report.technicalClosure;

      const assignedToArrivalMinutes =
        diffMinutes(
          assignment.assignedAt,
          fieldWork?.arrivedAt
        );

      const arrivalToFieldCloseMinutes =
        diffMinutes(
          fieldWork?.arrivedAt,
          fieldWork?.closedAt
        );

      const assignedToResolutionMinutes =
        diffMinutes(
          assignment.assignedAt,
          report.resolvedAt
        );

      return {
        assignmentId:
          assignment.id,

        reportId:
          report.id,

        title:
          report.title,

        problemType:
          report.problemType,

        description:
          report.description,

        status:
          report.status,

        priority:
          report.priority,

        address:
          report.address,

        assignedAt:
          assignment.assignedAt,

        notes:
          assignment.notes,

        technician:
          assignment.technician,

        assignedBy:
          assignment.assignedBy,

        reportEvidence:
          report.evidences,

        municipality:
          report.municipality,

        fieldWork:
          fieldWork,

        technicalAttention:
          report.technicalAttentions?.[0] || null,

        technicalClosure:
          technicalClosure,

        times: {
          assignedToArrivalMinutes,
          arrivalToFieldCloseMinutes,
          assignedToResolutionMinutes,
        },
      };
    });
  }

  async getMetrics(
    operatorId: string
  ) {
    const works =
      await this.getWorks({
        operatorId,
      });

    const assignedCount =
      works.filter(
        (work) =>
          work.status === Status.ASSIGNED
      ).length;

    const inTransitCount =
      works.filter(
        (work) =>
          work.status === Status.IN_TRANSIT
      ).length;

    const inProgressCount =
      works.filter(
        (work) =>
          work.status === Status.IN_PROGRESS
      ).length;

    const resolvedCount =
      works.filter(
        (work) =>
          work.status === Status.RESOLVED
      ).length;

    const assignedToArrivalValues =
      works
        .map((work) =>
          work.times.assignedToArrivalMinutes
        )
        .filter(
          (value): value is number =>
            value !== null
        );

    const arrivalToCloseValues =
      works
        .map((work) =>
          work.times.arrivalToFieldCloseMinutes
        )
        .filter(
          (value): value is number =>
            value !== null
        );

    const assignedToResolutionValues =
      works
        .map((work) =>
          work.times.assignedToResolutionMinutes
        )
        .filter(
          (value): value is number =>
            value !== null
        );

    return {
      total:
        works.length,

      assigned:
        assignedCount,

      inTransit:
        inTransitCount,

      inProgress:
        inProgressCount,

      resolved:
        resolvedCount,

      averageAssignedToArrivalMinutes:
        average(assignedToArrivalValues),

      averageArrivalToFieldCloseMinutes:
        average(arrivalToCloseValues),

      averageAssignedToResolutionMinutes:
        average(assignedToResolutionValues),
    };
  }
}