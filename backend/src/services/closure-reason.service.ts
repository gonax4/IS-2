import { ClosureReasonRepository } from "../repositories/closure-reason.repository";

const closureReasonRepository =
  new ClosureReasonRepository();

export class ClosureReasonService {
  async getAll() {
    return await closureReasonRepository.findAll();
  }

  async getActive() {
    return await closureReasonRepository.findActive();
  }

  async create(data: {
    name: string;
    description?: string;
  }) {
    if (!data.name?.trim()) {
      throw new Error("El nombre del motivo de cierre es obligatorio.");
    }

    return await closureReasonRepository.create({
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
      throw new Error("El motivo de cierre es obligatorio.");
    }

    return await closureReasonRepository.update(id, {
      name: data.name?.trim(),
      description: data.description?.trim(),
      active: data.active,
    });
  }

  async deactivate(id: string) {
    return await closureReasonRepository.deactivate(id);
  }

  async activate(id: string) {
    return await closureReasonRepository.activate(id);
  }
}