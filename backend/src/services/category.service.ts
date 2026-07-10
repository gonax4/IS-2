import { CategoryRepository } from "../repositories/category.repository";

const categoryRepository =
  new CategoryRepository();

export class CategoryService {
  async getAll() {
    return await categoryRepository.findAll();
  }

  async getActive() {
    return await categoryRepository.findActive();
  }

  async create(data: {
    name: string;
    description?: string;
  }) {
    if (!data.name?.trim()) {
      throw new Error("El nombre de la categoría es obligatorio.");
    }

    return await categoryRepository.create({
      name: data.name.trim(),
      description: data.description?.trim() || undefined,
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
    if (!id) {
      throw new Error("La categoría es obligatoria.");
    }

    return await categoryRepository.update(id, {
      name: data.name?.trim(),
      description: data.description?.trim(),
      active: data.active,
    });
  }

  async deactivate(id: string) {
    return await categoryRepository.deactivate(id);
  }

  async activate(id: string) {
    return await categoryRepository.activate(id);
  }
}