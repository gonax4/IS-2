import {
    useEffect,
    useMemo,
    useState,
} from "react";

import {
    useNavigate,
} from "react-router-dom";

import {
    statusLabels,
} from "../utils/reportLabels";

import {
    OperatorMonitoringService,
} from "../services/operatorMonitoring.service";

import type {
    MonitoringMetrics,
    MonitoringTechnician,
    MonitoringWork,
} from "../services/operatorMonitoring.service";

const technicalClosureResultLabels:
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

function formatDateTime(
    value?: string | null
) {
    if (!value) {
        return "No registrado";
    }

    return new Date(value)
        .toLocaleString();
}

function formatMinutes(
    value?: number | null
) {
    if (
        value === null ||
        value === undefined
    ) {
        return "No calculado";
    }

    if (value < 60) {
        return `${value} min`;
    }

    const hours =
        Math.floor(value / 60);

    const minutes =
        value % 60;

    return `${hours} h ${minutes} min`;
}

function getPriorityClass(
    priority?: string | null
) {
    if (priority === "ALTO") {
        return "bg-red-100 text-red-700";
    }

    if (priority === "MEDIO") {
        return "bg-yellow-100 text-yellow-700";
    }

    if (priority === "BAJO") {
        return "bg-green-100 text-green-700";
    }

    return "bg-gray-100 text-gray-600";
}

export default function OperatorMonitoringPage() {
    const navigate =
        useNavigate();

    const operatorId =
        localStorage.getItem("userId") || "";

    const [works, setWorks] =
        useState<MonitoringWork[]>([]);

    const [technicians, setTechnicians] =
        useState<MonitoringTechnician[]>([]);

    const [metrics, setMetrics] =
        useState<MonitoringMetrics | null>(null);

    const [selectedStatus, setSelectedStatus] =
        useState("");

    const [selectedTechnicianId, setSelectedTechnicianId] =
        useState("");

    const [selectedPriority, setSelectedPriority] =
        useState("");

    const [selectedWork, setSelectedWork] =
        useState<MonitoringWork | null>(null);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");

    const loadInitialData =
        async () => {
            if (!operatorId) {
                setError(
                    "No se encontró el operador en sesión."
                );
                return;
            }

            try {
                setLoading(true);
                setError("");

                const [
                    techniciansData,
                    metricsData,
                ] =
                    await Promise.all([
                        OperatorMonitoringService
                            .getTechnicians(operatorId),

                        OperatorMonitoringService
                            .getMetrics(operatorId),
                    ]);

                setTechnicians(
                    techniciansData
                );

                setMetrics(
                    metricsData
                );

            } catch (error: any) {
                setError(
                    error.message ||
                    "No se pudo cargar el monitoreo."
                );

            } finally {
                setLoading(false);
            }
        };

    const loadWorks =
        async () => {
            if (!operatorId) {
                return;
            }

            try {
                setLoading(true);
                setError("");

                const worksData =
                    await OperatorMonitoringService
                        .getWorks(
                            operatorId,
                            {
                                status:
                                    selectedStatus || undefined,

                                technicianId:
                                    selectedTechnicianId || undefined,

                                priority:
                                    selectedPriority || undefined,
                            }
                        );

                setWorks(worksData);

                if (
                    selectedWork &&
                    !worksData.some(
                        (work) =>
                            work.assignmentId ===
                            selectedWork.assignmentId
                    )
                ) {
                    setSelectedWork(null);
                }

            } catch (error: any) {
                setError(
                    error.message ||
                    "No se pudieron cargar los trabajos."
                );

            } finally {
                setLoading(false);
            }
        };

    useEffect(() => {
        loadInitialData();
    }, []);

    useEffect(() => {
        loadWorks();
    }, [
        selectedStatus,
        selectedTechnicianId,
        selectedPriority,
    ]);

    const visibleWork =
        useMemo(() => {
            return selectedWork || works[0] || null;
        }, [selectedWork, works]);

    const beforeEvidences =
        visibleWork?.fieldWork?.evidences
            ?.filter((evidence) =>
                evidence.phase === "BEFORE"
            ) || [];

    const afterEvidences =
        visibleWork?.fieldWork?.evidences
            ?.filter((evidence) =>
                evidence.phase === "AFTER"
            ) || [];

    if (loading && works.length === 0) {
        return (
            <div className="
                min-h-screen
                flex
                items-center
                justify-center
                text-3xl
                font-bold
            ">
                Cargando monitoreo...
            </div>
        );
    }

    return (
        <div className="
            min-h-screen
            bg-[#F5F7FA]
            p-6
            lg:p-8
        ">
            <div className="
                max-w-7xl
                mx-auto
                space-y-8
            ">
                <div className="
                    flex
                    flex-col
                    lg:flex-row
                    justify-between
                    gap-4
                    items-start
                    lg:items-center
                ">
                    <div>
                        <p className="
                            text-blue-700
                            font-bold
                        ">
                            US20 - Monitoreo municipal
                        </p>

                        <h1 className="
                            text-4xl
                            lg:text-5xl
                            font-bold
                            text-[#03152E]
                            mt-2
                        ">
                            Ejecución de técnicos
                        </h1>

                        <p className="
                            text-gray-500
                            mt-3
                            text-lg
                        ">
                            Supervisa trabajos asignados, estados, evidencias, tiempos y resultados técnicos.
                        </p>
                    </div>

                    <button
                        onClick={() =>
                            navigate("/operator")
                        }
                        className="
                            bg-white
                            border
                            rounded-xl
                            px-5
                            py-3
                            font-bold
                            text-[#03152E]
                            hover:bg-gray-50
                        "
                    >
                        Volver al panel
                    </button>
                </div>

                {error && (
                    <div className="
                        bg-red-50
                        border
                        border-red-200
                        text-red-700
                        rounded-2xl
                        p-4
                        font-semibold
                    ">
                        {error}
                    </div>
                )}

                <section className="
                    grid
                    grid-cols-1
                    md:grid-cols-2
                    xl:grid-cols-4
                    gap-4
                ">
                    <div className="
                        bg-white
                        border
                        rounded-2xl
                        p-5
                    ">
                        <p className="text-gray-500">
                            Total monitoreado
                        </p>

                        <h2 className="
                            text-4xl
                            font-bold
                            text-[#03152E]
                        ">
                            {metrics?.total || 0}
                        </h2>
                    </div>

                    <div className="
                        bg-white
                        border
                        rounded-2xl
                        p-5
                    ">
                        <p className="text-gray-500">
                            En ejecución
                        </p>

                        <h2 className="
                            text-4xl
                            font-bold
                            text-blue-700
                        ">
                            {
                                (metrics?.assigned || 0) +
                                (metrics?.inTransit || 0) +
                                (metrics?.inProgress || 0)
                            }
                        </h2>
                    </div>

                    <div className="
                        bg-white
                        border
                        rounded-2xl
                        p-5
                    ">
                        <p className="text-gray-500">
                            Resueltos
                        </p>

                        <h2 className="
                            text-4xl
                            font-bold
                            text-green-700
                        ">
                            {metrics?.resolved || 0}
                        </h2>
                    </div>

                    <div className="
                        bg-white
                        border
                        rounded-2xl
                        p-5
                    ">
                        <p className="text-gray-500">
                            Promedio asignación → resolución
                        </p>

                        <h2 className="
                            text-2xl
                            font-bold
                            text-[#03152E]
                        ">
                            {
                                formatMinutes(
                                    metrics?.averageAssignedToResolutionMinutes
                                )
                            }
                        </h2>
                    </div>
                </section>

                <section className="
                    bg-white
                    border
                    rounded-3xl
                    p-5
                    lg:p-6
                    space-y-5
                ">
                    <h2 className="
                        text-2xl
                        font-bold
                        text-[#03152E]
                    ">
                        Filtros
                    </h2>

                    <div className="
                        grid
                        grid-cols-1
                        md:grid-cols-4
                        gap-4
                    ">
                        <select
                            value={selectedStatus}
                            onChange={(event) =>
                                setSelectedStatus(
                                    event.target.value
                                )
                            }
                            className="
                                border
                                rounded-xl
                                p-3
                                bg-white
                            "
                        >
                            <option value="">
                                Todos los estados
                            </option>
                            <option value="ASSIGNED">
                                Asignado
                            </option>
                            <option value="IN_TRANSIT">
                                En traslado
                            </option>
                            <option value="IN_PROGRESS">
                                En atención
                            </option>
                            <option value="RESOLVED">
                                Resuelto
                            </option>
                        </select>

                        <select
                            value={selectedTechnicianId}
                            onChange={(event) =>
                                setSelectedTechnicianId(
                                    event.target.value
                                )
                            }
                            className="
                                border
                                rounded-xl
                                p-3
                                bg-white
                            "
                        >
                            <option value="">
                                Todos los técnicos
                            </option>

                            {technicians.map((technician) => (
                                <option
                                    key={technician.id}
                                    value={technician.id}
                                >
                                    {technician.firstName} {technician.lastName}
                                </option>
                            ))}
                        </select>

                        <select
                            value={selectedPriority}
                            onChange={(event) =>
                                setSelectedPriority(
                                    event.target.value
                                )
                            }
                            className="
                                border
                                rounded-xl
                                p-3
                                bg-white
                            "
                        >
                            <option value="">
                                Todas las prioridades
                            </option>
                            <option value="ALTO">
                                Alta
                            </option>
                            <option value="MEDIO">
                                Media
                            </option>
                            <option value="BAJO">
                                Baja
                            </option>
                        </select>

                        <button
                            onClick={() => {
                                setSelectedStatus("");
                                setSelectedTechnicianId("");
                                setSelectedPriority("");
                                setSelectedWork(null);
                            }}
                            className="
                                bg-[#03152E]
                                text-white
                                font-bold
                                rounded-xl
                                p-3
                                hover:bg-black
                            "
                        >
                            Limpiar filtros
                        </button>
                    </div>
                </section>

                <section className="
                    grid
                    grid-cols-1
                    xl:grid-cols-[1fr_420px]
                    gap-8
                ">
                    <div className="
                        bg-white
                        border
                        rounded-3xl
                        p-5
                        lg:p-6
                        space-y-4
                    ">
                        <h2 className="
                            text-2xl
                            font-bold
                            text-[#03152E]
                        ">
                            Panel de trabajos asignados
                        </h2>

                        {works.length === 0 ? (
                            <div className="
                                border
                                rounded-2xl
                                p-6
                                text-gray-500
                            ">
                                No hay trabajos con los filtros seleccionados.
                            </div>
                        ) : (
                            <div className="
                                overflow-x-auto
                            ">
                                <table className="
                                    w-full
                                    border-collapse
                                    text-left
                                ">
                                    <thead>
                                        <tr className="
                                            border-b
                                            text-gray-500
                                            text-sm
                                        ">
                                            <th className="py-3 pr-4">
                                                Reporte
                                            </th>
                                            <th className="py-3 pr-4">
                                                Técnico
                                            </th>
                                            <th className="py-3 pr-4">
                                                Estado
                                            </th>
                                            <th className="py-3 pr-4">
                                                Prioridad
                                            </th>
                                            <th className="py-3 pr-4">
                                                Tiempos
                                            </th>
                                            <th className="py-3 pr-4">
                                                Acción
                                            </th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {works.map((work) => (
                                            <tr
                                                key={work.assignmentId}
                                                className="
                                                    border-b
                                                    align-top
                                                    hover:bg-gray-50
                                                "
                                            >
                                                <td className="py-4 pr-4">
                                                    <p className="
                                                        font-bold
                                                        text-[#03152E]
                                                    ">
                                                        {work.title}
                                                    </p>

                                                    <p className="
                                                        text-sm
                                                        text-gray-500
                                                    ">
                                                        {work.problemType}
                                                    </p>

                                                    <p className="
                                                        text-xs
                                                        text-gray-400
                                                        mt-1
                                                    ">
                                                        Asignado: {formatDateTime(work.assignedAt)}
                                                    </p>
                                                </td>

                                                <td className="py-4 pr-4">
                                                    <p className="font-semibold">
                                                        {work.technician.firstName} {work.technician.lastName}
                                                    </p>

                                                    <p className="
                                                        text-sm
                                                        text-gray-500
                                                    ">
                                                        {work.technician.email}
                                                    </p>
                                                </td>

                                                <td className="py-4 pr-4">
                                                    <span className="
                                                        inline-block
                                                        bg-blue-100
                                                        text-blue-700
                                                        rounded-full
                                                        px-3
                                                        py-1
                                                        text-sm
                                                        font-bold
                                                    ">
                                                        {
                                                            statusLabels[work.status] ||
                                                            work.status
                                                        }
                                                    </span>
                                                </td>

                                                <td className="py-4 pr-4">
                                                    <span className={`
                                                        inline-block
                                                        rounded-full
                                                        px-3
                                                        py-1
                                                        text-sm
                                                        font-bold
                                                        ${getPriorityClass(work.priority)}
                                                    `}>
                                                        {work.priority || "No definida"}
                                                    </span>
                                                </td>

                                                <td className="
                                                    py-4
                                                    pr-4
                                                    text-sm
                                                    text-gray-600
                                                    space-y-1
                                                ">
                                                    <p>
                                                        Asig. → llegada:{" "}
                                                        {formatMinutes(work.times.assignedToArrivalMinutes)}
                                                    </p>

                                                    <p>
                                                        Llegada → cierre visita:{" "}
                                                        {formatMinutes(work.times.arrivalToFieldCloseMinutes)}
                                                    </p>

                                                    <p>
                                                        Asig. → resolución:{" "}
                                                        {formatMinutes(work.times.assignedToResolutionMinutes)}
                                                    </p>
                                                </td>

                                                <td className="py-4 pr-4">
                                                    <button
                                                        onClick={() =>
                                                            setSelectedWork(work)
                                                        }
                                                        className="
                                                            bg-[#03152E]
                                                            text-white
                                                            rounded-xl
                                                            px-4
                                                            py-2
                                                            font-bold
                                                            hover:bg-black
                                                        "
                                                    >
                                                        Ver monitoreo
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>

                    <aside className="
                        bg-white
                        border
                        rounded-3xl
                        p-5
                        lg:p-6
                        space-y-6
                        h-fit
                    ">
                        <h2 className="
                            text-2xl
                            font-bold
                            text-[#03152E]
                        ">
                            Detalle de ejecución
                        </h2>

                        {!visibleWork ? (
                            <p className="text-gray-500">
                                Selecciona un trabajo para ver sus evidencias, notas y tiempos.
                            </p>
                        ) : (
                            <>
                                <div className="
                                    bg-blue-50
                                    border
                                    border-blue-100
                                    rounded-2xl
                                    p-4
                                    space-y-2
                                ">
                                    <p className="font-bold text-[#03152E]">
                                        {visibleWork.title}
                                    </p>

                                    <p>
                                        <strong>Tipo:</strong>{" "}
                                        {visibleWork.problemType}
                                    </p>

                                    <p>
                                        <strong>Estado:</strong>{" "}
                                        {
                                            statusLabels[visibleWork.status] ||
                                            visibleWork.status
                                        }
                                    </p>

                                    <p>
                                        <strong>Técnico:</strong>{" "}
                                        {visibleWork.technician.firstName} {visibleWork.technician.lastName}
                                    </p>

                                    <p>
                                        <strong>Municipalidad:</strong>{" "}
                                        {
                                            visibleWork.municipality?.name ||
                                            "No definida"
                                        }
                                    </p>
                                </div>

                                <div className="
                                    space-y-2
                                    text-sm
                                    text-gray-700
                                ">
                                    <p>
                                        <strong>Asignación:</strong>{" "}
                                        {formatDateTime(visibleWork.assignedAt)}
                                    </p>

                                    <p>
                                        <strong>Llegada:</strong>{" "}
                                        {formatDateTime(visibleWork.fieldWork?.arrivedAt)}
                                    </p>

                                    <p>
                                        <strong>Cierre de visita:</strong>{" "}
                                        {formatDateTime(visibleWork.fieldWork?.closedAt)}
                                    </p>

                                    <p>
                                        <strong>Distancia:</strong>{" "}
                                        {
                                            visibleWork.fieldWork?.distanceMeters !==
                                            null &&
                                            visibleWork.fieldWork?.distanceMeters !==
                                            undefined
                                                ? `${visibleWork.fieldWork.distanceMeters} m`
                                                : "No calculada"
                                        }
                                    </p>
                                </div>

                                <div className="
                                    bg-gray-50
                                    border
                                    rounded-2xl
                                    p-4
                                    space-y-2
                                ">
                                    <h3 className="
                                        font-bold
                                        text-[#03152E]
                                    ">
                                        Notas de campo
                                    </h3>

                                    <p className="text-gray-600">
                                        {
                                            visibleWork.fieldWork?.notes ||
                                            "No hay notas registradas."
                                        }
                                    </p>
                                </div>

                                <div className="
                                    bg-gray-50
                                    border
                                    rounded-2xl
                                    p-4
                                    space-y-3
                                ">
                                    <h3 className="
                                        font-bold
                                        text-[#03152E]
                                    ">
                                        Atención técnica
                                    </h3>

                                    {visibleWork.technicalAttention ? (
                                        <>
                                            <p>
                                                <strong>Acción:</strong>{" "}
                                                {visibleWork.technicalAttention.actionTaken}
                                            </p>

                                            <p>
                                                <strong>Resultado:</strong>{" "}
                                                {visibleWork.technicalAttention.technicalResult}
                                            </p>

                                            <p>
                                                <strong>Observaciones:</strong>{" "}
                                                {
                                                    visibleWork.technicalAttention.observations ||
                                                    "Sin observaciones"
                                                }
                                            </p>
                                        </>
                                    ) : (
                                        <p className="text-gray-500">
                                            No hay atención técnica registrada.
                                        </p>
                                    )}
                                </div>

                                <div className="
                                    bg-gray-50
                                    border
                                    rounded-2xl
                                    p-4
                                    space-y-3
                                ">
                                    <h3 className="
                                        font-bold
                                        text-[#03152E]
                                    ">
                                        Cierre operativo
                                    </h3>

                                    {visibleWork.technicalClosure ? (
                                        <>
                                            <p>
                                                <strong>Resultado:</strong>{" "}
                                                {
                                                    technicalClosureResultLabels[
                                                        visibleWork.technicalClosure.result
                                                    ] ||
                                                    visibleWork.technicalClosure.result
                                                }
                                            </p>

                                            <p>
                                                <strong>Observaciones:</strong>{" "}
                                                {visibleWork.technicalClosure.observations}
                                            </p>

                                            {visibleWork.technicalClosure.followUpRequired && (
                                                <p>
                                                    <strong>Seguimiento:</strong>{" "}
                                                    {
                                                        visibleWork.technicalClosure.followUpNotes ||
                                                        "No indicado"
                                                    }
                                                </p>
                                            )}
                                        </>
                                    ) : (
                                        <p className="text-gray-500">
                                            Aún no hay cierre operativo.
                                        </p>
                                    )}
                                </div>

                                <div className="
                                    space-y-4
                                ">
                                    <div>
                                        <h3 className="
                                            font-bold
                                            text-[#03152E]
                                            mb-2
                                        ">
                                            Fotos antes
                                        </h3>

                                        <div className="
                                            grid
                                            grid-cols-2
                                            gap-2
                                        ">
                                            {beforeEvidences.length > 0 ? (
                                                beforeEvidences.map((evidence) => (
                                                    <img
                                                        key={evidence.id}
                                                        src={evidence.imageUrl}
                                                        alt="Antes"
                                                        className="
                                                            h-[100px]
                                                            w-full
                                                            object-cover
                                                            rounded-xl
                                                            border
                                                        "
                                                    />
                                                ))
                                            ) : (
                                                <p className="
                                                    text-sm
                                                    text-gray-500
                                                ">
                                                    Sin fotos antes.
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    <div>
                                        <h3 className="
                                            font-bold
                                            text-[#03152E]
                                            mb-2
                                        ">
                                            Fotos después
                                        </h3>

                                        <div className="
                                            grid
                                            grid-cols-2
                                            gap-2
                                        ">
                                            {afterEvidences.length > 0 ? (
                                                afterEvidences.map((evidence) => (
                                                    <img
                                                        key={evidence.id}
                                                        src={evidence.imageUrl}
                                                        alt="Después"
                                                        className="
                                                            h-[100px]
                                                            w-full
                                                            object-cover
                                                            rounded-xl
                                                            border
                                                        "
                                                    />
                                                ))
                                            ) : (
                                                <p className="
                                                    text-sm
                                                    text-gray-500
                                                ">
                                                    Sin fotos después.
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    {visibleWork.technicalClosure?.closureEvidenceUrl && (
                                        <div>
                                            <h3 className="
                                                font-bold
                                                text-[#03152E]
                                                mb-2
                                            ">
                                                Evidencia de cierre
                                            </h3>

                                            <img
                                                src={visibleWork.technicalClosure.closureEvidenceUrl}
                                                alt="Evidencia de cierre"
                                                className="
                                                    w-full
                                                    h-[160px]
                                                    object-cover
                                                    rounded-xl
                                                    border
                                                "
                                            />
                                        </div>
                                    )}
                                </div>

                                <button
                                    onClick={() =>
                                        navigate(
                                            `/operator/report/${visibleWork.reportId}`
                                        )
                                    }
                                    className="
                                        w-full
                                        bg-blue-700
                                        text-white
                                        rounded-2xl
                                        py-4
                                        font-bold
                                        hover:bg-blue-800
                                    "
                                >
                                    Abrir reporte
                                </button>
                            </>
                        )}
                    </aside>
                </section>
            </div>
        </div>
    );
}