import { prisma } from "../config/prisma";

export class ProblemTypeRepository {
  async findAll() {
    return await prisma.problemType.findMany({
      include: {
        category: true,
      },
      orderBy: {
        name: "asc",
      },
    });
  }

  async findActive() {
    return await prisma.problemType.findMany({
      where: {
        active: true,
        category: {
          active: true,
        },
      },
      include: {
        category: true,
      },
      orderBy: {
        name: "asc",
      },
    });
  }

  async create(data: {
    name: string;
    description?: string;
    categoryId: string;
  }) {
    return await prisma.problemType.create({
      data: {
        name: data.name,
        description: data.description,
        categoryId: data.categoryId,
        active: true,
      },
      include: {
        category: true,
      },
    });
  }

  async update(
    id: string,
    data: {
      name?: string;
      description?: string;
      categoryId?: string;
      active?: boolean;
    }
  ) {
    return await prisma.problemType.update({
      where: {
        id,
      },
      data,
      include: {
        category: true,
      },
    });
  }

  async deactivate(id: string) {
    return await prisma.problemType.update({
      where: {
        id,
      },
      data: {
        active: false,
      },
      include: {
        category: true,
      },
    });
  }

  async activate(id: string) {
    return await prisma.problemType.update({
      where: {
        id,
      },
      data: {
        active: true,
      },
      include: {
        category: true,
      },
    });
  }
}