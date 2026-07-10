import { prisma } from "../config/prisma";

export class ClosureReasonRepository {
  async findAll() {
    return await prisma.closureReason.findMany({
      orderBy: {
        name: "asc",
      },
    });
  }

  async findActive() {
    return await prisma.closureReason.findMany({
      where: {
        active: true,
      },
      orderBy: {
        name: "asc",
      },
    });
  }

  async create(data: {
    name: string;
    description?: string;
  }) {
    return await prisma.closureReason.create({
      data: {
        name: data.name,
        description: data.description,
        active: true,
      },
    });
  }

  async update(
    id: string,
    data: {
      name?: string;
      description?: string;
      active?: boolean;
    }
  ) {
    return await prisma.closureReason.update({
      where: {
        id,
      },
      data,
    });
  }

  async deactivate(id: string) {
    return await prisma.closureReason.update({
      where: {
        id,
      },
      data: {
        active: false,
      },
    });
  }

  async activate(id: string) {
    return await prisma.closureReason.update({
      where: {
        id,
      },
      data: {
        active: true,
      },
    });
  }
}