import crypto from "crypto";

import {
  TechnicianApplicationRepository,
} from "../repositories/technician-application.repository";

import {
  EmailService,
} from "./email.service";

const technicianApplicationRepository =
  new TechnicianApplicationRepository();

const emailService =
  new EmailService();

const FRONTEND_URL =
  process.env.FRONTEND_URL ||
  "http://localhost:5173";

const emailRegex =
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export class TechnicianApplicationService {
  async createApplication(data: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    dni?: string;
    municipalityId?: string;
    skills: string[];
    experience?: string;
  }) {
    if (!data.firstName?.trim()) {
      throw new Error("Los nombres son obligatorios.");
    }

    if (!data.lastName?.trim()) {
      throw new Error("Los apellidos son obligatorios.");
    }

    if (!data.email?.trim()) {
      throw new Error("El correo es obligatorio.");
    }

    if (!emailRegex.test(data.email.trim())) {
      throw new Error("Ingresa un correo válido.");
    }

    if (!data.phone?.trim()) {
      throw new Error("El teléfono es obligatorio.");
    }

    if (!/^\d{9}$/.test(data.phone.trim())) {
      throw new Error("El teléfono debe tener 9 dígitos.");
    }

    if (!data.dni?.trim()) {
      throw new Error("El DNI es obligatorio.");
    }

    if (!/^\d{8}$/.test(data.dni.trim())) {
      throw new Error("El DNI debe tener 8 dígitos.");
    }

    if (!data.municipalityId) {
      throw new Error("Debe seleccionar una municipalidad.");
    }

    if (!data.skills || data.skills.length === 0) {
      throw new Error("Debe seleccionar al menos una habilidad.");
    }

    if (!data.experience?.trim()) {
      throw new Error("La experiencia es obligatoria.");
    }

    const email =
      data.email.trim().toLowerCase();

    const existingUser =
      await technicianApplicationRepository.findUserByEmail(
        email
      );

    if (existingUser) {
      throw new Error(
        "Este correo ya está registrado en el sistema. Usa otro correo para postular como técnico."
      );
    }

    const existingApplication =
      await technicianApplicationRepository.findByEmail(
        email
      );

    if (existingApplication) {
      throw new Error(
        "Ya existe una postulación registrada con este correo."
      );
    }

    const emailVerificationToken =
      crypto.randomBytes(32).toString("hex");

    const emailVerificationExpires =
      new Date(
        Date.now() + 1000 * 60 * 60 * 24
      );

    const application =
      await technicianApplicationRepository.create({
        firstName:
          data.firstName.trim(),

        lastName:
          data.lastName.trim(),

        email,

        phone:
          data.phone.trim(),

        dni:
          data.dni.trim(),

        municipalityId:
          data.municipalityId,

        skills:
          data.skills,

        experience:
          data.experience.trim(),

        emailVerified:
          false,

        emailVerificationToken,

        emailVerificationExpires,
      });

    const verificationUrl =
      `${FRONTEND_URL}/technician-application/verify-email?token=${emailVerificationToken}`;

    await emailService.sendEmail({
      to:
        email,

      subject:
        "Verifica tu correo para completar tu postulación técnica",

      html: `
        <h2>Verificación de postulación técnica</h2>

        <p>Hola ${application.firstName},</p>

        <p>Para completar tu postulación como técnico de campo, debes verificar tu correo.</p>

        <p>
          <a href="${verificationUrl}">
            Verificar correo
          </a>
        </p>

        <p>Este enlace vencerá en 24 horas.</p>
      `,
    });

    return application;
  }

  async verifyEmail(
    token: string
  ) {
    if (!token) {
      throw new Error("Token inválido.");
    }

    const application =
      await technicianApplicationRepository
        .findByVerificationToken(token);

    if (!application) {
      throw new Error(
        "Token inválido o postulación no encontrada."
      );
    }

    if (application.emailVerified) {
      return application;
    }

    if (
      !application.emailVerificationExpires ||
      application.emailVerificationExpires < new Date()
    ) {
      throw new Error(
        "El enlace de verificación ha vencido."
      );
    }

    return await technicianApplicationRepository
      .verifyEmail(application.id);
  }

  async getPendingApplications() {
    return await technicianApplicationRepository.findPending();
  }

  async getAllApplications() {
    return await technicianApplicationRepository.findAll();
  }

  async getPendingApplicationsForOperator(
    operatorId: string
  ) {
    const operator =
      await technicianApplicationRepository.findOperatorById(
        operatorId
      );

    if (!operator) {
      throw new Error("Operador no encontrado.");
    }

    if (operator.role !== "OPERATOR") {
      throw new Error("El usuario no es operador municipal.");
    }

    if (!operator.municipalityId) {
      throw new Error("El operador no tiene municipalidad asignada.");
    }

    return await technicianApplicationRepository
      .findPendingByMunicipality(
        operator.municipalityId
      );
  }

  async approveApplication(
    applicationId: string,
    reviewedById?: string
  ) {
    const application =
      await technicianApplicationRepository
        .findById(applicationId);

    if (!application) {
      throw new Error("Postulación no encontrada.");
    }

    if (!application.emailVerified) {
      throw new Error(
        "No se puede aprobar la postulación porque el correo aún no fue verificado."
      );
    }

    return await technicianApplicationRepository.approve(
      applicationId,
      reviewedById
    );
  }

  async rejectApplication(
    applicationId: string,
    reviewedById?: string
  ) {
    return await technicianApplicationRepository.reject(
      applicationId,
      reviewedById
    );
  }
}