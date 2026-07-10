import { prisma }
  from "../config/prisma";

import {
  Status,
  ReportCategory,
  Priority,
} from "@prisma/client";

type CreateReportInput = {
  title: string;

  category: ReportCategory | string;

  problemType: string;

  categoryId?: string;

  problemTypeId?: string;

  description: string;

  latitude?: number;

  longitude?: number;

  address?: string;

  isAnonymous?: boolean;

  userId: string;

  status: Status;

  municipalityId?: string;
};

const normalizeReportCategory = (
  category?: ReportCategory | string
): ReportCategory => {
  if (!category) {
    return ReportCategory.INFRASTRUCTURE;
  }

  const value =
    String(category).toUpperCase();

  if (
    value === ReportCategory.SECURITY ||
    value.includes("SEGURIDAD")
  ) {
    return ReportCategory.SECURITY;
  }

  if (
    value === ReportCategory.ENVIRONMENT ||
    value.includes("AMBIENTE") ||
    value.includes("LIMPIEZA")
  ) {
    return ReportCategory.ENVIRONMENT;
  }

  if (
    value === ReportCategory.MOBILITY ||
    value.includes("MOVILIDAD") ||
    value.includes("TRÁNSITO") ||
    value.includes("TRANSITO")
  ) {
    return ReportCategory.MOBILITY;
  }

  if (
    value === ReportCategory.INFRASTRUCTURE ||
    value.includes("INFRAESTRUCTURA") ||
    value.includes("SERVICIOS")
  ) {
    return ReportCategory.INFRASTRUCTURE;
  }

  return ReportCategory.INFRASTRUCTURE;
};

const getResolvedVisibilityDate = () => {
  const thirtyDaysAgo =
    new Date();

  thirtyDaysAgo.setDate(
    thirtyDaysAgo.getDate() - 30
  );

  return thirtyDaysAgo;
};

export class ReportRepository {

  async create(
    data: CreateReportInput
  ) {
    return await prisma.report.create({
      data: {
        title:
          data.title,

        category:
          normalizeReportCategory(
            data.category
          ),

        problemType:
          data.problemType,

        categoryId:
          data.categoryId,

        problemTypeId:
          data.problemTypeId,

        description:
          data.description,

        latitude:
          data.latitude,

        longitude:
          data.longitude,

        address:
          data.address,

        isAnonymous:
          data.isAnonymous ?? false,

        userId:
          data.userId,

        status:
          data.status,

        municipalityId:
          data.municipalityId,
      },
    });
  }

  async createEvidences(

    reportId: string,

    imageUrls: string[]
  ) {

    return await prisma
      .reportEvidence
      .createMany({

        data:
          imageUrls.map(
            (imageUrl) => ({

              reportId,

              imageUrl,
            })
          ),
      });
  }



  async findByUser(
    userId: string
  ) {

    return await prisma.report.findMany({

      where: { userId },

      include: {

        evidences: true,

        user: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },

      orderBy: {
        createdAt: "desc",
      },
    });

  }

  async findByCategory(
    category: ReportCategory
  ) {

    return await prisma.report.findMany({
      where: { category },

      orderBy: {
        createdAt: "desc",
      },
    });
  }

async findByProblemType(problemType: string) {
  const resolvedVisibilityDate =
    getResolvedVisibilityDate();

  return await prisma.report.findMany({
    where: {
      problemType,

      OR: [
        {
          status: {
            in: [
              "APPROVED",
              "PRIORITIZED",
              "ASSIGNED",
              "IN_PROGRESS",
            ],
          },
        },
        {
          status: "RESOLVED",
          resolvedAt: {
            gte: resolvedVisibilityDate,
          },
        },
      ],
    },

    include: {
      evidences: true,
      user: {
        select: {
          firstName: true,
          lastName: true,
        },
      },
    },

    orderBy: {
      createdAt: "desc",
    },
  });
}
  async getTopProblems() {
    const resolvedVisibilityDate =
      getResolvedVisibilityDate();

    return await prisma.report.groupBy({
      by: ["problemType"],

      where: {
        OR: [
          {
            status: {
              in: [
                "APPROVED",
                "PRIORITIZED",
                "ASSIGNED",
                "IN_PROGRESS",
              ],
            },
          },
          {
            status: "RESOLVED",
            resolvedAt: {
              gte: resolvedVisibilityDate,
            },
          },
        ],
      },

      _count: {
        problemType: true,
      },

      orderBy: {
        _count: {
          problemType: "desc",
        },
      },
    });
  }

  async findByStatus(
    status: Status
  ) {

    return await prisma
      .report
      .findMany({

        where: {
          status,
        },

        include: {

          evidences: true,

          user: {
            select: {
              firstName: true,
              lastName: true,
            },
          },
        },

        orderBy: {
          createdAt: "desc",
        },
      });
  }

  async findByStatusAndMunicipality(
    status: Status,
    municipalityId: string
  ) {
    return await prisma
      .report
      .findMany({
        where: {
          status,
          municipalityId,
        },

        include: {
          evidences: true,

          user: {
            select: {
              firstName: true,
              lastName: true,
            },
          },

          municipality: true,
        },

        orderBy: {
          createdAt: "desc",
        },
      });
  }

  async updateStatus(
    id: string,
    status: Status
  ) {
    return await prisma
      .report
      .update({
        where: {
          id,
        },

        data: {
          status,

          resolvedAt:
            status === "RESOLVED"
              ? new Date()
              : null,
        },
      });
  }

  async findReportsWithLocation() {
    const resolvedVisibilityDate =
      getResolvedVisibilityDate();

    return await prisma.report.findMany({
      where: {
        latitude: {
          not: null,
        },

        longitude: {
          not: null,
        },

        OR: [
          {
            status: {
              in: [
                "APPROVED",
                "PRIORITIZED",
                "ASSIGNED",
                "IN_PROGRESS",
              ],
            },
          },
          {
            status: "RESOLVED",
            resolvedAt: {
              gte: resolvedVisibilityDate,
            },
          },
        ],
      },

      include: {
        evidences: true,
        user: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },

      orderBy: {
        createdAt: "desc",
      },
    });
  }


  async updatePrioritization(id: string, data: {
    impact: string;
    probability: string;
    priority: Priority;
    operationalType: string;
    targetDate: Date;
    justification: string;
    status: Status;
  }) {
    return await prisma.report.update({
      where: { id },
      data: {
        impact: data.impact,
        probability: data.probability,
        priority: data.priority,
        operationalType: data.operationalType,
        targetDate: data.targetDate,
        justification: data.justification,
        status: data.status,
      },
      include: {
        evidences: true,
        user: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
    });
  }

  async findById(id: string) {
    return await prisma.report.findUnique({
      where: {
        id,
      },

      include: {
        evidences: true,

        user: {
          select: {
            firstName: true,
            lastName: true,
          },
        },

        municipality: true,

        assignments: {
          include: {
            technician: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                technicianProfile: {
                  include: {
                    municipality: true,
                  },
                },
              },
            },
          },
        },

        fieldWork: {
          include: {
            evidences: true,
          },
        },

        technicalAttentions: true,

        technicalClosure: {
          include: {
            closureReason: true,

            technician: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        },
      },
    });
  }
}