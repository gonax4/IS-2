import {
  TechnicianApplicationStatus,
  Role,
} from "@prisma/client";

import bcrypt from "bcryptjs";

import {
  prisma,
} from "../config/prisma";

export class TechnicianApplicationRepository {
  async findUserByEmail(
    email: string
  ) {
    return await prisma.user.findUnique({
      where: {
        email,
      },
    });
  }

  async findByEmail(
    email: string
  ) {
    return await prisma.technicianApplication.findUnique({
      where: {
        email,
      },

      include: {
        municipality: true,
      },
    });
  }

  async findById(
    applicationId: string
  ) {
    return await prisma.technicianApplication.findUnique({
      where: {
        id: applicationId,
      },

      include: {
        municipality: true,
      },
    });
  }

  async findByVerificationToken(
    token: string
  ) {
    return await prisma.technicianApplication.findFirst({
      where: {
        emailVerificationToken: token,
      },

      include: {
        municipality: true,
      },
    });
  }

  async verifyEmail(
    applicationId: string
  ) {
    return await prisma.technicianApplication.update({
      where: {
        id: applicationId,
      },

      data: {
        emailVerified: true,
        emailVerificationToken: null,
        emailVerificationExpires: null,
      },

      include: {
        municipality: true,
      },
    });
  }

  async create(data: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    dni: string;
    municipalityId: string;
    skills: string[];
    experience: string;
    emailVerified: boolean;
    emailVerificationToken: string;
    emailVerificationExpires: Date;
  }) {
    return await prisma.technicianApplication.create({
      data: {
        firstName:
          data.firstName,

        lastName:
          data.lastName,

        email:
          data.email,

        phone:
          data.phone,

        dni:
          data.dni,

        municipalityId:
          data.municipalityId,

        skills:
          data.skills,

        experience:
          data.experience,

        emailVerified:
          data.emailVerified,

        emailVerificationToken:
          data.emailVerificationToken,

        emailVerificationExpires:
          data.emailVerificationExpires,

        status:
          TechnicianApplicationStatus.PENDING,
      },

      include: {
        municipality: true,
      },
    });
  }

  async findPending() {
    return await prisma.technicianApplication.findMany({
      where: {
        status:
          TechnicianApplicationStatus.PENDING,
      },

      include: {
        municipality: true,
      },

      orderBy: {
        createdAt: "desc",
      },
    });
  }

  async findPendingByMunicipality(
    municipalityId: string
  ) {
    return await prisma.technicianApplication.findMany({
      where: {
        status:
          TechnicianApplicationStatus.PENDING,

        municipalityId,
      },

      include: {
        municipality: true,
      },

      orderBy: {
        createdAt: "desc",
      },
    });
  }

  async findAll() {
    return await prisma.technicianApplication.findMany({
      include: {
        municipality: true,
      },

      orderBy: {
        createdAt: "desc",
      },
    });
  }

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

  async approve(
    applicationId: string,
    reviewedById?: string
  ) {
    const application =
      await prisma.technicianApplication.findUnique({
        where: {
          id: applicationId,
        },

        include: {
          municipality: true,
        },
      });

    if (!application) {
      throw new Error("La postulación no existe.");
    }

    if (application.status !== TechnicianApplicationStatus.PENDING) {
      throw new Error("La postulación ya fue revisada.");
    }

    if (!application.emailVerified) {
      throw new Error(
        "No se puede aprobar la postulación porque el correo aún no fue verificado."
      );
    }

    const temporaryPassword =
      "Tecnico123";

    const hashedPassword =
      await bcrypt.hash(
        temporaryPassword,
        10
      );

    return await prisma.$transaction(async (tx) => {
      const technician =
        await tx.user.upsert({
          where: {
            email:
              application.email,
          },

          update: {
            firstName:
              application.firstName,

            lastName:
              application.lastName,

            password:
              hashedPassword,

            role:
              Role.TECHNICIAN,

            emailVerified:
              true,

            emailVerificationToken:
              null,

            emailVerificationExpires:
              null,
          },

          create: {
            email:
              application.email,

            firstName:
              application.firstName,

            lastName:
              application.lastName,

            password:
              hashedPassword,

            role:
              Role.TECHNICIAN,

            emailVerified:
              true,

            emailVerificationToken:
              null,

            emailVerificationExpires:
              null,
          },
        });

      await tx.technicianProfile.upsert({
        where: {
          userId:
            technician.id,
        },

        update: {
          municipalityId:
            application.municipalityId,

          skills:
            application.skills,

          available:
            true,
        },

        create: {
          userId:
            technician.id,

          municipalityId:
            application.municipalityId,

          skills:
            application.skills,

          available:
            true,
        },
      });

      const updatedApplication =
        await tx.technicianApplication.update({
          where: {
            id:
              applicationId,
          },

          data: {
            status:
              TechnicianApplicationStatus.APPROVED,

            reviewedAt:
              new Date(),

            reviewedById,
          },

          include: {
            municipality: true,
          },
        });

      return {
        application:
          updatedApplication,

        technician,

        temporaryPassword,
      };
    });
  }

  async reject(
    applicationId: string,
    reviewedById?: string
  ) {
    const application =
      await prisma.technicianApplication.findUnique({
        where: {
          id: applicationId,
        },

        include: {
          municipality: true,
        },
      });

    if (!application) {
      throw new Error("La postulación no existe.");
    }

    if (application.status !== TechnicianApplicationStatus.PENDING) {
      throw new Error("La postulación ya fue revisada.");
    }

    return await prisma.technicianApplication.update({
      where: {
        id:
          applicationId,
      },

      data: {
        status:
          TechnicianApplicationStatus.REJECTED,

        reviewedAt:
          new Date(),

        reviewedById,
      },

      include: {
        municipality: true,
      },
    });
  }
}