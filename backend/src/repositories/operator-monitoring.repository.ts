import {
  Priority,
  Status,
} from "@prisma/client";

import {
  prisma,
} from "../config/prisma";

export class OperatorMonitoringRepository {
  async findOperatorById(
    operatorId: string
  ) {
    return await prisma.user.findUnique({
      where: {
        id: operatorId,
      },

      include: {
        municipality: true,
      },
    });
  }

  async findTechniciansByMunicipality(
    municipalityId: string
  ) {
    return await prisma.user.findMany({
      where: {
        role: "TECHNICIAN",

        technicianProfile: {
          is: {
            municipalityId,
          },
        },
      },

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

      orderBy: {
        firstName: "asc",
      },
    });
  }

  async findAssignedWorksByMunicipality(data: {
    municipalityId: string;
    status?: Status;
    technicianId?: string;
    priority?: Priority;
  }) {
    const monitoredStatuses:
      Status[] = [
        Status.ASSIGNED,
        Status.IN_TRANSIT,
        Status.IN_PROGRESS,
        Status.RESOLVED,
      ];

    return await prisma.reportAssignment.findMany({
      where: {
        active: true,

        technicianId:
          data.technicianId || undefined,

        report: {
          municipalityId:
            data.municipalityId,

          status:
            data.status
              ? data.status
              : {
                  in: monitoredStatuses,
                },

          priority:
            data.priority || undefined,
        },
      },

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

        assignedBy: {
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
                evidences: {
                  orderBy: {
                    createdAt: "asc",
                  },
                },
              },
            },

            technicalAttentions: {
              orderBy: {
                createdAt: "desc",
              },
            },

            technicalClosure: {
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
            },
          },
        },
      },

      orderBy: {
        assignedAt: "desc",
      },
    });
  }
}