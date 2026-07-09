const API_URL =
    import.meta.env.VITE_API_URL ||
    "http://localhost:3000";

const API_BASE =
    API_URL.endsWith("/api")
        ? API_URL
        : `${API_URL}/api`;

export type MonitoringMetrics = {
    total: number;
    assigned: number;
    inTransit: number;
    inProgress: number;
    resolved: number;
    averageAssignedToArrivalMinutes: number | null;
    averageArrivalToFieldCloseMinutes: number | null;
    averageAssignedToResolutionMinutes: number | null;
};

export type MonitoringTechnician = {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
};

export type MonitoringWork = {
    assignmentId: string;
    reportId: string;
    title: string;
    problemType: string;
    description: string;
    status: string;
    priority?: string | null;
    address?: string | null;
    assignedAt: string;
    notes?: string | null;

    technician: {
        id: string;
        firstName: string;
        lastName: string;
        email: string;
    };

    assignedBy?: {
        id: string;
        firstName: string;
        lastName: string;
        email: string;
    };

    reportEvidence?: {
        imageUrl: string;
    }[];

    municipality?: {
        id: string;
        name: string;
    } | null;

    fieldWork?: {
        arrivedAt?: string | null;
        closedAt?: string | null;
        notes?: string | null;
        distanceMeters?: number | null;
        evidences?: {
            id: string;
            imageUrl: string;
            phase: "BEFORE" | "AFTER";
        }[];
    } | null;

    technicalAttention?: {
        id: string;
        actionTaken: string;
        technicalResult: string;
        observations?: string | null;
        createdAt: string;
    } | null;

    technicalClosure?: {
        id: string;
        result: string;
        observations: string;
        followUpRequired: boolean;
        followUpNotes?: string | null;
        closureEvidenceUrl?: string | null;
        closedAt: string;
    } | null;

    times: {
        assignedToArrivalMinutes: number | null;
        arrivalToFieldCloseMinutes: number | null;
        assignedToResolutionMinutes: number | null;
    };
};

export type MonitoringFilters = {
    status?: string;
    technicianId?: string;
    priority?: string;
};

export const OperatorMonitoringService = {
    async getTechnicians(
        operatorId: string
    ) {
        const response =
            await fetch(
                `${API_BASE}/operator-monitoring/${operatorId}/technicians`
            );

        const result =
            await response.json()
                .catch(() => null);

        if (!response.ok) {
            throw new Error(
                result?.message ||
                "No se pudieron cargar los técnicos."
            );
        }

        return result as MonitoringTechnician[];
    },

    async getWorks(
        operatorId: string,
        filters?: MonitoringFilters
    ) {
        const params =
            new URLSearchParams();

        if (filters?.status) {
            params.append(
                "status",
                filters.status
            );
        }

        if (filters?.technicianId) {
            params.append(
                "technicianId",
                filters.technicianId
            );
        }

        if (filters?.priority) {
            params.append(
                "priority",
                filters.priority
            );
        }

        const query =
            params.toString();

        const response =
            await fetch(
                `${API_BASE}/operator-monitoring/${operatorId}/works${query ? `?${query}` : ""}`
            );

        const result =
            await response.json()
                .catch(() => null);

        if (!response.ok) {
            throw new Error(
                result?.message ||
                "No se pudieron cargar los trabajos."
            );
        }

        return result as MonitoringWork[];
    },

    async getMetrics(
        operatorId: string
    ) {
        const response =
            await fetch(
                `${API_BASE}/operator-monitoring/${operatorId}/metrics`
            );

        const result =
            await response.json()
                .catch(() => null);

        if (!response.ok) {
            throw new Error(
                result?.message ||
                "No se pudieron cargar las métricas."
            );
        }

        return result as MonitoringMetrics;
    },
};