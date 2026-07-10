import {
  Priority,
} from "@prisma/client";

import {
  SlaConfigurationRepository,
} from "../repositories/sla-configuration.repository";

const slaConfigurationRepository =
  new SlaConfigurationRepository();

export class SlaConfigurationService {
  async getAll() {
    const existing =
      await slaConfigurationRepository.findAll();

    const priorities:
      Priority[] = [
        Priority.BAJO,
        Priority.MEDIO,
        Priority.ALTO,
      ];

    const missing =
      priorities.filter(
        (priority) =>
          !existing.some(
            (item) =>
              item.priority === priority
          )
      );

    for (const priority of missing) {
      await slaConfigurationRepository.upsert({
        priority,
        responseHours:
          priority === Priority.ALTO
            ? 24
            : priority === Priority.MEDIO
              ? 48
              : 72,
      });
    }

    return await slaConfigurationRepository.findAll();
  }

  async upsert(data: {
    priority: Priority;
    responseHours: number;
  }) {
    if (!data.priority) {
      throw new Error("La prioridad es obligatoria.");
    }

    if (
      !data.responseHours ||
      data.responseHours <= 0
    ) {
      throw new Error("Las horas objetivo deben ser mayores a cero.");
    }

    return await slaConfigurationRepository.upsert(data);
  }
}