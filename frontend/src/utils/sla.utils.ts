export type SlaViewState = {
    label: string;
    description: string;
    className: string;
};

export const formatTargetDate =
    (targetDate?: string | null) => {
        if (!targetDate) {
            return "No asignado";
        }

        return new Intl.DateTimeFormat(
            "es-PE",
            {
                dateStyle: "medium",
                timeStyle: "short",
            }
        ).format(new Date(targetDate));
    };

export const getSlaViewState =
    (
        targetDate?: string | null,
        status?: string
    ): SlaViewState => {
        if (!targetDate) {
            return {
                label: "Sin SLA",
                description: "Este reporte todavía no tiene una fecha objetivo asignada.",
                className: "bg-gray-100 text-gray-700",
            };
        }

        if (
            status === "RESOLVED" ||
            status === "REJECTED"
        ) {
            return {
                label: "Finalizado",
                description: "El reporte ya terminó su flujo operativo.",
                className: "bg-green-100 text-green-700",
            };
        }

        const now =
            new Date().getTime();

        const target =
            new Date(targetDate).getTime();

        const diffMs =
            target - now;

        const diffHours =
            diffMs / (1000 * 60 * 60);

        if (diffMs < 0) {
            return {
                label: "SLA vencido",
                description: "El reporte superó su tiempo objetivo de atención.",
                className: "bg-red-100 text-red-700",
            };
        }

        if (diffHours <= 6) {
            return {
                label: "Próximo a vencer",
                description: "El reporte está cerca de superar su tiempo objetivo.",
                className: "bg-yellow-100 text-yellow-700",
            };
        }

        return {
            label: "Dentro del plazo",
            description: "El reporte se encuentra dentro del tiempo objetivo.",
            className: "bg-blue-100 text-blue-700",
        };
    };

export const getPriorityLabel =
    (priority?: string | null) => {
        if (!priority) {
            return "Sin prioridad";
        }

        const labels:
            Record<string, string> = {
                ALTO: "Alta",
                MEDIO: "Media",
                BAJO: "Baja",
                HIGH: "Alta",
                MEDIUM: "Media",
                LOW: "Baja",
            };

        return labels[priority] || priority;
    };