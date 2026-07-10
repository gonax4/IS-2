const API_URL =
    import.meta.env.VITE_API_URL ||
    "http://localhost:3000";

const API_BASE =
    API_URL.endsWith("/api")
        ? API_URL
        : `${API_URL}/api`;

export type Category = {
    id: string;
    name: string;
    description?: string | null;
    active: boolean;
};

export type ProblemType = {
    id: string;
    name: string;
    description?: string | null;
    active: boolean;
    categoryId: string;
    category?: Category;
};

export type ClosureReason = {
    id: string;
    name: string;
    description?: string | null;
    active: boolean;
};

export type SlaConfiguration = {
    id: string;
    priority: "BAJO" | "MEDIO" | "ALTO";
    responseHours: number;
};

async function parseResponse(
    response: Response,
    fallbackMessage: string
) {
    const result =
        await response.json()
            .catch(() => null);

    if (!response.ok) {
        throw new Error(
            result?.message ||
            fallbackMessage
        );
    }

    return result;
}

export const OperationalCatalogService = {
    async getCategories() {
        const response =
            await fetch(
                `${API_BASE}/categories`
            );

        return await parseResponse(
            response,
            "No se pudieron cargar las categorías."
        ) as Category[];
    },

    

    async createCategory(data: {
        name: string;
        description?: string;
    }) {
        const response =
            await fetch(
                `${API_BASE}/categories`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(data),
                }
            );

        return await parseResponse(
            response,
            "No se pudo crear la categoría."
        ) as Category;
    },

    async updateCategory(
        id: string,
        data: {
            name?: string;
            description?: string;
            active?: boolean;
        }
    ) {
        const response =
            await fetch(
                `${API_BASE}/categories/${id}`,
                {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(data),
                }
            );

        return await parseResponse(
            response,
            "No se pudo actualizar la categoría."
        ) as Category;
    },

    async toggleCategory(
        id: string,
        active: boolean
    ) {
        const response =
            await fetch(
                `${API_BASE}/categories/${id}/${active ? "activate" : "deactivate"}`,
                {
                    method: "PATCH",
                }
            );

        return await parseResponse(
            response,
            "No se pudo cambiar el estado de la categoría."
        ) as Category;
    },

    async getProblemTypes() {
        const response =
            await fetch(
                `${API_BASE}/problem-types`
            );

        return await parseResponse(
            response,
            "No se pudieron cargar los tipos de problema."
        ) as ProblemType[];
    },

    async createProblemType(data: {
        name: string;
        description?: string;
        categoryId: string;
    }) {
        const response =
            await fetch(
                `${API_BASE}/problem-types`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(data),
                }
            );

        return await parseResponse(
            response,
            "No se pudo crear el tipo de problema."
        ) as ProblemType;
    },

    async updateProblemType(
        id: string,
        data: {
            name?: string;
            description?: string;
            categoryId?: string;
            active?: boolean;
        }
    ) {
        const response =
            await fetch(
                `${API_BASE}/problem-types/${id}`,
                {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(data),
                }
            );

        return await parseResponse(
            response,
            "No se pudo actualizar el tipo de problema."
        ) as ProblemType;
    },

    async toggleProblemType(
        id: string,
        active: boolean
    ) {
        const response =
            await fetch(
                `${API_BASE}/problem-types/${id}/${active ? "activate" : "deactivate"}`,
                {
                    method: "PATCH",
                }
            );

        return await parseResponse(
            response,
            "No se pudo cambiar el estado del tipo de problema."
        ) as ProblemType;
    },

    async getClosureReasons() {
        const response =
            await fetch(
                `${API_BASE}/closure-reasons`
            );

        return await parseResponse(
            response,
            "No se pudieron cargar los motivos de cierre."
        ) as ClosureReason[];
    },

    async createClosureReason(data: {
        name: string;
        description?: string;
    }) {
        const response =
            await fetch(
                `${API_BASE}/closure-reasons`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(data),
                }
            );

        return await parseResponse(
            response,
            "No se pudo crear el motivo de cierre."
        ) as ClosureReason;
    },

    async updateClosureReason(
        id: string,
        data: {
            name?: string;
            description?: string;
            active?: boolean;
        }
    ) {
        const response =
            await fetch(
                `${API_BASE}/closure-reasons/${id}`,
                {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(data),
                }
            );

        return await parseResponse(
            response,
            "No se pudo actualizar el motivo de cierre."
        ) as ClosureReason;
    },

    async toggleClosureReason(
        id: string,
        active: boolean
    ) {
        const response =
            await fetch(
                `${API_BASE}/closure-reasons/${id}/${active ? "activate" : "deactivate"}`,
                {
                    method: "PATCH",
                }
            );

        return await parseResponse(
            response,
            "No se pudo cambiar el estado del motivo de cierre."
        ) as ClosureReason;
    },

    async getSlaConfigurations() {
        const response =
            await fetch(
                `${API_BASE}/sla-configurations`
            );

        return await parseResponse(
            response,
            "No se pudieron cargar los SLA."
        ) as SlaConfiguration[];
    },

    async updateSla(
        priority: "BAJO" | "MEDIO" | "ALTO",
        responseHours: number
    ) {
        const response =
            await fetch(
                `${API_BASE}/sla-configurations/${priority}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        responseHours,
                    }),
                }
            );

        return await parseResponse(
            response,
            "No se pudo actualizar el SLA."
        ) as SlaConfiguration;
    },
    async getActiveCategories() {
        const response =
            await fetch(
                `${API_BASE}/categories/active`
            );

        return await parseResponse(
            response,
            "No se pudieron cargar las categorías activas."
        ) as Category[];
    },

    async getActiveProblemTypes() {
        const response =
            await fetch(
                `${API_BASE}/problem-types/active`
            );

        return await parseResponse(
            response,
            "No se pudieron cargar los tipos de problema activos."
        ) as ProblemType[];
    },

    async getActiveClosureReasons() {
        const response =
            await fetch(
                `${API_BASE}/closure-reasons/active`
            );

        return await parseResponse(
            response,
            "No se pudieron cargar los motivos de cierre activos."
        ) as ClosureReason[];
    },
};