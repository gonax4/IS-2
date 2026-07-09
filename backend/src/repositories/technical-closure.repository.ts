import {
  Status,
  TechnicalClosureResult,
} from "@prisma/client";

import {
  prisma,
} from "../config/prisma";

export class TechnicalClosureRepository {
  async findReportById(
    reportId: string
  ) {
    return await prisma.report.findUnique({
      where: {
        id: reportId,
      },

      include: {
        fieldWork: {
          include: {
            evidences: true,
          },
        },

        technicalAttentions: {
          orderBy: {
            createdAt: "desc",
          },
        },

        assignments: true,

        technicalClosure: true,
      },
    });
  }

  async findByReport(
    reportId: string
  ) {
    return await prisma.technicalClosure.findUnique({
      where: {
        reportId,
      },

      include: {
        technician: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },

        report: {
          include: {
            evidences: true,
            municipality: true,
            fieldWork: {
              include: {
                evidences: true,
              },
            },
            technicalAttentions: true,
          },
        },
      },
    });
  }

  async create(data: {
    reportId: string;
    technicianId: string;
    result: TechnicalClosureResult;
    observations: string;
    closureEvidenceUrl?: string;
    followUpRequired: boolean;
    followUpNotes?: string;
  }) {
    return await prisma.$transaction(
      async (tx) => {
        const closure =
          await tx.technicalClosure.upsert({
            where: {
              reportId:
                data.reportId,
            },

            update: {
              technicianId:
                data.technicianId,

              result:
                data.result,

              observations:
                data.observations,

              closureEvidenceUrl:
                data.closureEvidenceUrl,

              followUpRequired:
                data.followUpRequired,

              followUpNotes:
                data.followUpNotes,

              closedAt:
                new Date(),
            },

            create: {
              reportId:
                data.reportId,

              technicianId:
                data.technicianId,

              result:
                data.result,

              observations:
                data.observations,

              closureEvidenceUrl:
                data.closureEvidenceUrl,

              followUpRequired:
                data.followUpRequired,

              followUpNotes:
                data.followUpNotes,
            },

            include: {
              technician: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  email: true,
                },
              },
            },
          });

        await tx.report.update({
          where: {
            id:
              data.reportId,
          },

          data: {
            status:
              Status.RESOLVED,

            resolvedAt:
              new Date(),
          },
        });

        return closure;
      }
    );
  }
}