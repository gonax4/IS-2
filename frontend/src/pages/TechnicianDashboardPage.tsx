import {
    useEffect,
    useMemo,
    useState,
} from "react";

import {
    useNavigate,
} from "react-router-dom";

import {
    AssignmentService,
} from "../services/assignment.service";

import {
    statusLabels,
} from "../utils/reportLabels";

import {
    formatTargetDate,
    getPriorityLabel,
    getSlaViewState,
} from "../utils/sla.utils";

type Assignment = {
    id: string;
    reportId: string;
    technicianId: string;
    assignedById: string;
    assignedAt: string;
    notes?: string;
    active: boolean;
    report: {
        id: string;
        title?: string;
        problemType: string;
        description: string;
        status: string;
        priority?: string;
        targetDate?: string | null;
        address?: string;
        createdAt: string;
        evidences?: {
            imageUrl: string;
        }[];
    };
};

type TechnicianFilter =
    | "ALL"
    | "ASSIGNED"
    | "IN_TRANSIT"
    | "IN_PROGRESS";

export default function TechnicianDashboardPage() {
    const navigate =
        useNavigate();

    const [assignments, setAssignments] =
        useState<Assignment[]>([]);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");

    const [filter, setFilter] =
        useState<TechnicianFilter>("ALL");

    const userId =
        localStorage.getItem("userId") || "";

    const firstName =
        localStorage.getItem("firstName") ||
        localStorage.getItem("userName") ||
        "Técnico";

    const fetchAssignments =
        async () => {
            try {
                setLoading(true);
                setError("");

                if (!userId) {
                    throw new Error(
                        "No se encontró el técnico en sesión."
                    );
                }

                const data =
                    await AssignmentService
                        .getAssignmentsByTechnician(userId);

                setAssignments(data || []);

            } catch (error: any) {
                setError(
                    error.message ||
                    "No se pudieron cargar los trabajos asignados."
                );

            } finally {
                setLoading(false);
            }
        };

    useEffect(() => {
        fetchAssignments();
    }, []);

    const filteredAssignments =
        useMemo(() => {
            if (filter === "ALL") {
                return assignments;
            }

            return assignments.filter((assignment) =>
                assignment.report.status === filter
            );
        }, [assignments, filter]);

    const buttonClass = (
        value: TechnicianFilter
    ) => `
        w-full
        text-left
        rounded-xl
        px-4
        py-4
        font-semibold
        transition
        ${
            filter === value
                ? "bg-white/25"
                : "bg-white/10 hover:bg-white/20"
        }
    `;

    const logout =
        () => {
            localStorage.clear();
            navigate("/login");
        };

    return (
        <div className="
            min-h-screen
            bg-[#F5F7FA]
            flex
        ">
            <aside className="
                w-[280px]
                bg-[#0B513B]
                text-white
                min-h-screen
                p-7
                flex
                flex-col
                justify-between
            ">
                <div>
                    <h1 className="
                        text-3xl
                        font-bold
                        mb-12
                    ">
                        reporta<span className="text-yellow-400">Ya</span>
                    </h1>

                    <nav className="
                        space-y-4
                    ">
                        <button
                            onClick={() => setFilter("ALL")}
                            className={buttonClass("ALL")}
                        >
                            Trabajos asignados
                        </button>

                        <button
                            onClick={() => setFilter("ASSIGNED")}
                            className={buttonClass("ASSIGNED")}
                        >
                            Aceptados
                        </button>

                        <button
                            onClick={() => setFilter("IN_TRANSIT")}
                            className={buttonClass("IN_TRANSIT")}
                        >
                            En traslado
                        </button>

                        <button
                            onClick={() => setFilter("IN_PROGRESS")}
                            className={buttonClass("IN_PROGRESS")}
                        >
                            En atención
                        </button>
                    </nav>
                </div>

                <button
                    onClick={logout}
                    className="
                        w-full
                        bg-red-600
                        hover:bg-red-700
                        rounded-xl
                        px-4
                        py-4
                        font-bold
                    "
                >
                    Cerrar sesión
                </button>
            </aside>

            <main className="
                flex-1
                p-10
            ">
                <p className="
                    text-green-700
                    font-bold
                    mb-2
                ">
                    Panel técnico
                </p>

                <h2 className="
                    text-5xl
                    font-bold
                    text-[#03152E]
                ">
                    Bienvenido, {firstName}
                </h2>

                <p className="
                    text-gray-500
                    text-lg
                    mt-4
                    mb-10
                ">
                    Consulta y gestión de trabajos asignados.
                </p>

                {loading ? (
                    <div className="
                        bg-white
                        border
                        rounded-3xl
                        p-8
                        text-gray-500
                    ">
                        Cargando trabajos asignados...
                    </div>
                ) : error ? (
                    <div className="
                        bg-red-50
                        border
                        border-red-200
                        text-red-700
                        rounded-3xl
                        p-8
                        font-semibold
                    ">
                        {error}
                    </div>
                ) : filteredAssignments.length === 0 ? (
                    <div className="
                        bg-white
                        border
                        rounded-3xl
                        p-8
                    ">
                        <h3 className="
                            text-3xl
                            font-bold
                            text-[#03152E]
                        ">
                            Sin trabajos asignados
                        </h3>

                        <p className="
                            text-gray-500
                            mt-2
                        ">
                            Cuando el operador te asigne un reporte,
                            aparecerá en esta sección.
                        </p>
                    </div>
                ) : (
                    <div className="
                        space-y-6
                    ">
                        {filteredAssignments.map((assignment) => {
                            const report =
                                assignment.report;

                            const imageUrl =
                                report.evidences?.[0]?.imageUrl ||
                                "https://placehold.co/600x400?text=Sin+evidencia";

                            const slaState =
                                getSlaViewState(
                                    report.targetDate,
                                    report.status
                                );

                            return (
                                <div
                                    key={assignment.id}
                                    className="
                                        bg-white
                                        border
                                        rounded-3xl
                                        p-6
                                        flex
                                        gap-6
                                        shadow-sm
                                    "
                                >
                                    <img
                                        src={imageUrl}
                                        alt={report.problemType}
                                        className="
                                            w-[260px]
                                            h-[180px]
                                            object-cover
                                            rounded-2xl
                                        "
                                    />

                                    <div className="
                                        flex-1
                                    ">
                                        <div className="
                                            flex
                                            justify-between
                                            gap-4
                                            items-start
                                        ">
                                            <div>
                                                <h3 className="
                                                    text-2xl
                                                    font-bold
                                                    text-[#03152E]
                                                ">
                                                    {report.title || report.problemType}
                                                </h3>

                                                <p className="
                                                    text-gray-500
                                                    mt-1
                                                ">
                                                    {report.problemType}
                                                </p>
                                            </div>

                                            <span className="
                                                bg-blue-100
                                                text-blue-700
                                                rounded-full
                                                px-4
                                                py-2
                                                font-bold
                                            ">
                                                {statusLabels[report.status] || report.status}
                                            </span>
                                        </div>

                                        <p className="
                                            text-gray-700
                                            mt-4
                                        ">
                                            {report.description}
                                        </p>

                                        <div className="
                                            mt-5
                                            grid
                                            grid-cols-1
                                            md:grid-cols-2
                                            xl:grid-cols-4
                                            gap-4
                                            text-sm
                                            text-gray-600
                                        ">
                                            <p>
                                                <strong>Dirección:</strong>{" "}
                                                {report.address || "No registrada"}
                                            </p>

                                            <p>
                                                <strong>Prioridad:</strong>{" "}
                                                {getPriorityLabel(report.priority)}
                                            </p>

                                            <p>
                                                <strong>Fecha objetivo:</strong>{" "}
                                                {formatTargetDate(report.targetDate)}
                                            </p>

                                            <p>
                                                <strong>Asignado:</strong>{" "}
                                                {new Date(assignment.assignedAt).toLocaleDateString()}
                                            </p>
                                        </div>

                                        <div className="
                                            mt-4
                                            flex
                                            items-center
                                            gap-3
                                            flex-wrap
                                        ">
                                            <span className={`
                                                px-3
                                                py-1
                                                rounded-full
                                                text-xs
                                                font-bold
                                                ${slaState.className}
                                            `}>
                                                {slaState.label}
                                            </span>

                                            <span className="
                                                text-sm
                                                text-gray-500
                                            ">
                                                {slaState.description}
                                            </span>
                                        </div>

                                        {assignment.notes && (
                                            <div className="
                                                bg-gray-50
                                                border
                                                rounded-2xl
                                                p-4
                                                mt-5
                                                text-gray-700
                                            ">
                                                <strong>Indicaciones:</strong>{" "}
                                                {assignment.notes}
                                            </div>
                                        )}

                                        <button
                                            onClick={() =>
                                                navigate(
                                                    `/technician/reports/${report.id}`
                                                )
                                            }
                                            className="
                                                mt-6
                                                bg-blue-700
                                                hover:bg-blue-800
                                                text-white
                                                rounded-xl
                                                px-5
                                                py-3
                                                font-bold
                                            "
                                        >
                                            Ver detalle
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </main>
        </div>
    );
}