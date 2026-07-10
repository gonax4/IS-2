import {
  Priority,
} from "@prisma/client";

import {
  prisma,
} from "../config/prisma";

export class SlaConfigurationRepository {
  async findAll() {
    return await prisma.slaConfiguration.findMany({
      orderBy: {
        priority: "asc",
      },
    });
  }

  async upsert(data: {
    priority: Priority;
    responseHours: number;
  }) {
    return await prisma.slaConfiguration.upsert({
      where: {
        priority: data.priority,
      },
      update: {
        responseHours: data.responseHours,
      },
      create: {
        priority: data.priority,
        responseHours: data.responseHours,
      },
    });
  }
}