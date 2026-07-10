const API_URL =
    import.meta.env.VITE_API_URL ||
    "http://localhost:3000";

const API_BASE =
    API_URL.endsWith("/api")
        ? API_URL
        : `${API_URL}/api`;

export type TechnicalClosure = {
    id: string;
    reportId: string;
    technicianId: string;
    result: string;
    closureReasonId?: string | null;
    observations: string;
    closureEvidenceUrl?: string | null;
    followUpRequired: boolean;
    followUpNotes?: string | null;
    closedAt: string;
};

export type CreateTechnicalClosureInput = {
    reportId: string;
    technicianId: string;
    result?: string;
    closureReasonId?: string;
    observations: string;
    closureEvidenceUrl?: string;
    followUpNotes?: string;
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

export const technicalClosureResultLabels:
    Record<string, string> = {
        RESOLVED_ON_SITE:
            "Resuelto en sitio",

        TEMPORARY_MITIGATION:
            "Mitigación temporal",

        NO_INCIDENT_FOUND:
            "No se encontró incidencia",

        DUPLICATE:
            "Duplicado",

        OUT_OF_SCOPE:
            "Fuera de competencia",

        FOLLOW_UP_REQUIRED:
            "Seguimiento requerido",
    };

export const technicalClosureResultDescriptions:
    Record<string, string> = {
        RESOLVED_ON_SITE:
            "El problema fue atendido completamente en el lugar.",

        TEMPORARY_MITIGATION:
            "Se aplicó una solución parcial o medida de contención.",

        NO_INCIDENT_FOUND:
            "El técnico no encontró el problema reportado en campo.",

        DUPLICATE:
            "El caso corresponde a un reporte repetido.",

        OUT_OF_SCOPE:
            "El caso no corresponde a la competencia municipal.",

        FOLLOW_UP_REQUIRED:
            "Se requiere una nueva visita, tarea complementaria o seguimiento posterior.",
    };

export const getTechnicalClosureResultLabel =
    (result?: string | null) => {
        if (!result) {
            return "No definido";
        }

        return technicalClosureResultLabels[result] ||
            result;
    };

export const TechnicalClosureService = {
    async createClosure(
        data: CreateTechnicalClosureInput
    ) {
        const response =
            await fetch(
                `${API_BASE}/technical-closures`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body:
                        JSON.stringify(data),
                }
            );

        return await parseResponse(
            response,
            "No se pudo registrar el cierre técnico."
        ) as TechnicalClosure;
    },

    async getByReportId(
        reportId: string
    ) {
        const response =
            await fetch(
                `${API_BASE}/technical-closures/report/${reportId}`
            );

        return await parseResponse(
            response,
            "No se pudo obtener el cierre técnico."
        ) as TechnicalClosure | null;
    },
};