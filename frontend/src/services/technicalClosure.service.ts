const API_URL =
    import.meta.env.VITE_API_URL ||
    "http://localhost:3000";

const API_BASE =
    API_URL.endsWith("/api")
        ? API_URL
        : `${API_URL}/api`;

export type TechnicalClosureResult =
    "RESOLVED_ON_SITE" |
    "TEMPORARY_MITIGATION" |
    "NO_INCIDENT_FOUND" |
    "DUPLICATE" |
    "OUT_OF_SCOPE" |
    "FOLLOW_UP_REQUIRED";

export type TechnicalClosureRequest = {
    reportId: string;
    technicianId: string;
    result: TechnicalClosureResult;
    observations: string;
    closureEvidenceUrl?: string;
    followUpNotes?: string;
};

export const technicalClosureResultLabels:
    Record<TechnicalClosureResult, string> = {
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
    Record<TechnicalClosureResult, string> = {
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

export const TechnicalClosureService = {
    async getByReport(
        reportId: string
    ) {
        const response =
            await fetch(
                `${API_BASE}/technical-closures/report/${reportId}`
            );

        if (!response.ok) {
            return null;
        }

        return await response.json();
    },

    async createClosure(
        data: TechnicalClosureRequest
    ) {
        const response =
            await fetch(
                `${API_BASE}/technical-closures`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(data),
                }
            );

        const result =
            await response.json()
                .catch(() => null);

        if (!response.ok) {
            throw new Error(
                result?.message ||
                "No se pudo registrar el cierre técnico."
            );
        }

        return result;
    },
};