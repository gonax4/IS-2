import { ProblemTypeRepository } from "../repositories/problem-type.repository";

const problemTypeRepository =
  new ProblemTypeRepository();

export class ProblemTypeService {
  async getAll() {
    return await problemTypeRepository.findAll();
  }

  async getActive() {
    return await problemTypeRepository.findActive();
  }

  async create(data: {
    name: string;
    description?: string;
    categoryId: string;
  }) {
    if (!data.name?.trim()) {
      throw new Error("El nombre del tipo de problema es obligatorio.");
    }

    if (!data.categoryId) {
      throw new Error("La categoría es obligatoria.");
    }

    return await problemTypeRepository.create({
      name: data.name.trim(),
      description: data.description?.trim() || undefined,
      categoryId: data.categoryId,
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
    if (!id) {
      throw new Error("El tipo de problema es obligatorio.");
    }

    return await problemTypeRepository.update(id, {
      name: data.name?.trim(),
      description: data.description?.trim(),
      categoryId: data.categoryId,
      active: data.active,
    });
  }

  async deactivate(id: string) {
    return await problemTypeRepository.deactivate(id);
  }

  async activate(id: string) {
    return await problemTypeRepository.activate(id);
  }
}