import { prisma } from "../config/prisma";

export class CategoryRepository {
  async findAll() {
    return await prisma.category.findMany({
      include: {
        problemTypes: {
          orderBy: {
            name: "asc",
          },
        },
      },
      orderBy: {
        name: "asc",
      },
    });
  }

  async findActive() {
    return await prisma.category.findMany({
      where: {
        active: true,
      },
      include: {
        problemTypes: {
          where: {
            active: true,
          },
          orderBy: {
            name: "asc",
          },
        },
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
    return await prisma.category.create({
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
    return await prisma.category.update({
      where: {
        id,
      },
      data,
    });
  }

  async deactivate(id: string) {
    return await prisma.category.update({
      where: {
        id,
      },
      data: {
        active: false,
      },
    });
  }

  async activate(id: string) {
    return await prisma.category.update({
      where: {
        id,
      },
      data: {
        active: true,
      },
    });
  }
}