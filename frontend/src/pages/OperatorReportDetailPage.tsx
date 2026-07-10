import {
    useEffect,
    useState,
} from "react";

import {
    useNavigate,
    useParams,
} from "react-router-dom";

import {
    statusLabels,
} from "../utils/reportLabels";

import AssignmentSection
    from "../components/assignment/AssignmentSection";

const API_URL =
    import.meta.env.VITE_API_URL ||
    "http://localhost:3000";

type PriorityValue =
    "ALTO" |
    "MEDIO" |
    "BAJO";

type Report = {
    id: string;
    title: string;
    problemType: string;
    description: string;
    status: string;

    priority?: PriorityValue;
    impact?: PriorityValue;
    probability?: PriorityValue;
    operationalType?: string;
    targetDate?: string;
    justification?: string;

    createdAt: string;

    latitude?: number;
    longitude?: number;
    address?: string;

    municipalityId?: string | null;

    municipality?: {
        id: string;
        name: string;
        district?: string | null;
        province?: string | null;
        department?: string | null;
    } | null;

    evidences: {
        imageUrl: string;
    }[];

    isAnonymous: boolean;

    user?: {
        firstName: string;
        lastName: string;
    };

    message?: string;
};

export default function OperatorReportDetailPage() {
    const navigate =
        useNavigate();

    const { id } =
        useParams();

    const [report, setReport] =
        useState<Report | null>(null);

    const [loading, setLoading] =
        useState(true);

    const [impact, setImpact] =
        useState<PriorityValue>("BAJO");

    const [probability, setProbability] =
        useState<PriorityValue>("BAJO");

    const [operationalType, setOperationalType] =
        useState("");

    const [targetDate, setTargetDate] =
        useState("");

    const [justification, setJustification] =
        useState("");

    const [submitting, setSubmitting] =
        useState(false);

    const fetchReport = async () => {
        try {
            setLoading(true);

            const response =
                await fetch(
                    `${API_URL}/api/reports/${id}`
                );

            const data =
                await response.json();

            if (!response.ok) {
                throw new Error(
                    data?.message ||
                    "No se pudo obtener el reporte."
                );
            }

            setReport(data);

            setImpact(
                data.impact ||
                "BAJO"
            );

            setProbability(
                data.probability ||
                "BAJO"
            );

            setOperationalType(
                data.operationalType ||
                ""
            );

            setTargetDate(
                data.targetDate
                    ? data.targetDate.slice(0, 10)
                    : ""
            );

            setJustification(
                data.justification ||
                ""
            );

        } catch (error) {
            console.error(error);
            setReport(null);

        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReport();
    }, [id]);

    const updateStatus = async (
        status: string
    ) => {
        if (!report) {
            return;
        }

        try {
            const response =
                await fetch(
                    `${API_URL}/api/reports/${report.id}/status`,
                    {
                        method: "PATCH",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({
                            status,
                        }),
                    }
                );

            const data =
                await response.json()
                    .catch(() => null);

            if (!response.ok) {
                throw new Error(
                    data?.message ||
                    "No se pudo actualizar el estado."
                );
            }

            navigate("/operator");

        } catch (error: any) {
            console.error(error);
            alert(
                error.message ||
                "Hubo un error al actualizar el estado."
            );
        }
    };

    const handlePrioritize = async (
        event: React.FormEvent
    ) => {
        event.preventDefault();

        if (
            !operationalType ||
            !targetDate ||
            !justification
        ) {
            alert(
                "Por favor, completa todos los campos de priorización."
            );
            return;
        }

        const selectedDate =
            new Date(`${targetDate}T00:00:00`);

        const todayDate =
            new Date();

        todayDate.setHours(0, 0, 0, 0);

        if (selectedDate < todayDate) {
            alert(
                "La fecha objetivo no puede ser una fecha pasada."
            );
            return;
        }

        setSubmitting(true);

        try {
            const response =
                await fetch(
                    `${API_URL}/api/reports/${id}/prioritize`,
                    {
                        method: "PATCH",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({
                            impact,
                            probability,
                            operationalType,
                            targetDate,
                            justification,
                        }),
                    }
                );

            const data =
                await response.json()
                    .catch(() => null);

            if (!response.ok) {
                throw new Error(
                    data?.message ||
                    "No se pudo priorizar el reporte."
                );
            }

            alert(
                "Reporte priorizado correctamente."
            );

            await fetchReport();

        } catch (error: any) {
            console.error(error);

            alert(
                error.message ||
                "Hubo un error al procesar la priorización."
            );

        } finally {
            setSubmitting(false);
        }
    };

    const priorityClass = (
        priority?: string
    ) => {
        if (priority === "ALTO") {
            return "bg-red-100 text-red-800 border-red-200";
        }

        if (priority === "MEDIO") {
            return "bg-orange-100 text-orange-800 border-orange-200";
        }

        if (priority === "BAJO") {
            return "bg-green-100 text-green-800 border-green-200";
        }

        return "bg-gray-100 text-gray-700 border-gray-200";
    };

    if (loading) {
        return (
            <div className="
                min-h-screen
                flex
                items-center
                justify-center
                text-3xl
                font-bold
            ">
                Cargando...
            </div>
        );
    }

    if (!report || report.message) {
        return (
            <div className="
                min-h-screen
                flex
                items-center
                justify-center
                text-3xl
                font-bold
            ">
                Reporte no encontrado
            </div>
        );
    }

    const canEvaluate =
        report.status === "REGISTERED";

    const canPrioritize =
        report.status === "APPROVED" ||
        report.status === "PRIORITIZED";

    const canAssign =
        report.status === "PRIORITIZED" ||
        report.status === "ASSIGNED";
    
        const today =
    new Date()
        .toISOString()
        .split("T")[0];

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
                <button
                    onClick={() =>
                        navigate("/operator")
                    }
                    className="
                        text-blue-600
                        font-semibold
                        hover:underline
                    "
                >
                    ← Volver
                </button>

                <div className="
                    grid
                    grid-cols-1
                    xl:grid-cols-[1fr_420px]
                    gap-8
                    items-start
                ">
                    <main className="
                        bg-white
                        rounded-3xl
                        border
                        shadow-sm
                        p-6
                        lg:p-8
                        space-y-10
                    ">
                        <section className="
                            flex
                            flex-col
                            lg:flex-row
                            lg:items-start
                            lg:justify-between
                            gap-6
                        ">
                            <div>
                                <h1 className="
                                    text-4xl
                                    lg:text-5xl
                                    font-bold
                                    text-[#03152E]
                                    leading-tight
                                ">
                                    {
                                        report.title ||
                                        report.problemType
                                    }
                                </h1>

                                <div className="
                                    mt-4
                                    flex
                                    items-center
                                    gap-3
                                    flex-wrap
                                ">
                                    <p className="
                                        text-lg
                                        font-semibold
                                        text-gray-700
                                    ">
                                        {
                                            report.isAnonymous
                                                ? "Anónimo"
                                                : `${report.user?.firstName || ""} ${report.user?.lastName || ""}`
                                        }
                                    </p>

                                    <p className="
                                        text-gray-500
                                    ">
                                        {
                                            new Date(
                                                report.createdAt
                                            ).toLocaleDateString()
                                        }
                                    </p>
                                </div>
                            </div>

                            <div className="
                                flex
                                flex-row
                                lg:flex-col
                                gap-2
                                lg:items-end
                                flex-wrap
                            ">
                                <span className="
                                    bg-yellow-100
                                    text-yellow-700
                                    px-5
                                    py-3
                                    rounded-full
                                    font-semibold
                                ">
                                    {
                                        statusLabels[report.status] ||
                                        report.status
                                    }
                                </span>

                                {report.priority && (
                                    <span className={`
                                        px-5
                                        py-3
                                        rounded-full
                                        font-semibold
                                        border
                                        ${priorityClass(report.priority)}
                                    `}>
                                        Prioridad: {report.priority}
                                    </span>
                                )}
                            </div>
                        </section>

                        <section>
                            <img
                                src={
                                    report.evidences?.[0]?.imageUrl ||
                                    "https://placehold.co/1200x600?text=Sin+Evidencia"
                                }
                                alt={report.problemType}
                                className="
                                    w-full
                                    max-h-[520px]
                                    object-cover
                                    rounded-3xl
                                    border
                                "
                            />
                        </section>

                        <section className="
                            grid
                            grid-cols-1
                            lg:grid-cols-2
                            gap-10
                        ">
                            <div>
                                <h2 className="
                                    text-3xl
                                    font-bold
                                    mb-6
                                    text-[#03152E]
                                ">
                                    Descripción
                                </h2>

                                <p className="
                                    text-lg
                                    text-gray-600
                                    leading-relaxed
                                ">
                                    {report.description}
                                </p>
                            </div>

                            <div>
                                <h2 className="
                                    text-3xl
                                    font-bold
                                    mb-6
                                    text-[#03152E]
                                ">
                                    Datos municipales
                                </h2>

                                <div className="
                                    bg-blue-50
                                    border
                                    border-blue-100
                                    rounded-2xl
                                    p-6
                                    space-y-3
                                ">
                                    <p>
                                        <strong>Municipalidad:</strong>{" "}
                                        {
                                            report.municipality?.name ||
                                            "No definida"
                                        }
                                    </p>

                                    <p>
                                        <strong>Distrito:</strong>{" "}
                                        {
                                            report.municipality?.district ||
                                            "No definido"
                                        }
                                    </p>

                                    <p>
                                        <strong>Provincia:</strong>{" "}
                                        {
                                            report.municipality?.province ||
                                            "No definida"
                                        }
                                    </p>

                                    <p>
                                        <strong>Departamento:</strong>{" "}
                                        {
                                            report.municipality?.department ||
                                            "No definido"
                                        }
                                    </p>
                                </div>
                            </div>
                        </section>

                        <section>
                            <h2 className="
                                text-3xl
                                font-bold
                                mb-6
                                text-[#03152E]
                            ">
                                Ubicación
                            </h2>

                            <div className="
                                bg-gray-50
                                rounded-2xl
                                p-6
                                border
                            ">
                                <p className="
                                    text-gray-500
                                    mb-2
                                ">
                                    Dirección registrada
                                </p>

                                <p className="
                                    text-xl
                                    font-semibold
                                    leading-relaxed
                                    text-[#03152E]
                                ">
                                    {
                                        report.address ||
                                        "Ubicación no disponible"
                                    }
                                </p>

                                {
                                    report.latitude &&
                                    report.longitude && (
                                        <div className="
                                            mt-6
                                            space-y-4
                                        ">
                                            <p className="
                                                text-sm
                                                text-gray-500
                                            ">
                                                Latitud: {report.latitude} | Longitud: {report.longitude}
                                            </p>

                                            <iframe
                                                title="Ubicación del reporte"
                                                width="100%"
                                                height="320"
                                                loading="lazy"
                                                className="
                                                    rounded-2xl
                                                    border
                                                "
                                                src={`https://www.google.com/maps?q=${report.latitude},${report.longitude}&z=17&output=embed`}
                                            />

                                            <a
                                                href={`https://www.google.com/maps?q=${report.latitude},${report.longitude}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="
                                                    inline-block
                                                    text-blue-700
                                                    font-semibold
                                                    hover:underline
                                                "
                                            >
                                                Abrir ubicación en Google Maps
                                            </a>
                                        </div>
                                    )
                                }
                            </div>
                        </section>

                        <section>
                            <h2 className="
                                text-3xl
                                font-bold
                                mb-6
                                text-[#03152E]
                            ">
                                Evidencias
                            </h2>

                            <div className="
                                flex
                                gap-4
                                flex-wrap
                            ">
                                {
                                    report.evidences?.length
                                        ? report.evidences.map(
                                            (
                                                evidence,
                                                index
                                            ) => (
                                                <img
                                                    key={index}
                                                    src={evidence.imageUrl}
                                                    alt="Evidencia"
                                                    className="
                                                        w-[150px]
                                                        h-[150px]
                                                        rounded-2xl
                                                        object-cover
                                                        border
                                                    "
                                                />
                                            )
                                        )
                                        : (
                                            <p className="
                                                text-gray-500
                                            ">
                                                No hay evidencias registradas.
                                            </p>
                                        )
                                }
                            </div>
                        </section>
                    </main>

                    <aside className="
                        bg-white
                        rounded-3xl
                        border
                        shadow-sm
                        p-6
                        lg:p-8
                        h-fit
                        space-y-6
                        xl:sticky
                        xl:top-8
                    ">
                        {canEvaluate && (
                            <div className="
                                space-y-4
                            ">
                                <h2 className="
                                    text-2xl
                                    font-bold
                                    text-[#03152E]
                                ">
                                    Evaluar reporte
                                </h2>

                                <p className="
                                    text-gray-500
                                    text-sm
                                ">
                                    Revisa la descripción, ubicación y evidencias antes de aprobar o rechazar.
                                </p>

                                <hr />

                                <button
                                    onClick={() =>
                                        updateStatus("APPROVED")
                                    }
                                    className="
                                        w-full
                                        bg-green-600
                                        hover:bg-green-700
                                        text-white
                                        rounded-2xl
                                        p-4
                                        text-xl
                                        font-semibold
                                        transition
                                    "
                                >
                                    Aprobar reporte
                                </button>

                                <button
                                    onClick={() =>
                                        updateStatus("REJECTED")
                                    }
                                    className="
                                        w-full
                                        bg-red-600
                                        hover:bg-red-700
                                        text-white
                                        rounded-2xl
                                        p-4
                                        text-xl
                                        font-semibold
                                        transition
                                    "
                                >
                                    Rechazar reporte
                                </button>
                            </div>
                        )}

                        {canPrioritize && (
                            <form
                                onSubmit={handlePrioritize}
                                className="
                                    space-y-5
                                "
                            >
                                <h2 className="
                                    text-2xl
                                    font-bold
                                    text-[#03152E]
                                ">
                                    Priorización
                                </h2>

                                <hr />

                                <div>
                                    <label className="
                                        block
                                        text-sm
                                        font-semibold
                                        text-gray-700
                                        mb-1
                                    ">
                                        Impacto del problema
                                    </label>

                                    <select
                                        value={impact}
                                        onChange={(event) =>
                                            setImpact(
                                                event.target.value as PriorityValue
                                            )
                                        }
                                        className="
                                            w-full
                                            border
                                            rounded-xl
                                            p-3
                                        "
                                    >
                                        <option value="BAJO">Bajo</option>
                                        <option value="MEDIO">Medio</option>
                                        <option value="ALTO">Alto</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="
                                        block
                                        text-sm
                                        font-semibold
                                        text-gray-700
                                        mb-1
                                    ">
                                        Probabilidad
                                    </label>

                                    <select
                                        value={probability}
                                        onChange={(event) =>
                                            setProbability(
                                                event.target.value as PriorityValue
                                            )
                                        }
                                        className="
                                            w-full
                                            border
                                            rounded-xl
                                            p-3
                                        "
                                    >
                                        <option value="BAJO">Baja</option>
                                        <option value="MEDIO">Media</option>
                                        <option value="ALTO">Alta</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="
                                        block
                                        text-sm
                                        font-semibold
                                        text-gray-700
                                        mb-1
                                    ">
                                        Tipo operativo
                                    </label>

                                    <input
                                        value={operationalType}
                                        onChange={(event) =>
                                            setOperationalType(
                                                event.target.value
                                            )
                                        }
                                        className="
                                            w-full
                                            border
                                            rounded-xl
                                            p-3
                                        "
                                        placeholder="Ej. Limpieza, infraestructura, movilidad"
                                    />
                                </div>

                                <div>
                                    <label className="
                                        block
                                        text-sm
                                        font-semibold
                                        text-gray-700
                                        mb-1
                                    ">
                                        Fecha objetivo
                                    </label>

                                    <input
                                        type="date"
                                        min={today}
                                        value={targetDate}
                                        onChange={(event) =>
                                            setTargetDate(
                                                event.target.value
                                            )
                                        }
                                        className="
                                            w-full
                                            border
                                            rounded-xl
                                            p-3
                                        "
                                    />
                                </div>

                                <div>
                                    <label className="
                                        block
                                        text-sm
                                        font-semibold
                                        text-gray-700
                                        mb-1
                                    ">
                                        Justificación
                                    </label>

                                    <textarea
                                        value={justification}
                                        onChange={(event) =>
                                            setJustification(
                                                event.target.value
                                            )
                                        }
                                        className="
                                            w-full
                                            border
                                            rounded-xl
                                            p-3
                                            min-h-[120px]
                                        "
                                        placeholder="Explica por qué se asigna esta prioridad."
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="
                                        w-full
                                        bg-blue-700
                                        hover:bg-blue-800
                                        disabled:bg-gray-400
                                        text-white
                                        rounded-2xl
                                        p-4
                                        text-xl
                                        font-semibold
                                        transition
                                    "
                                >
                                    {
                                        submitting
                                            ? "Guardando..."
                                            : "Guardar priorización"
                                    }
                                </button>
                            </form>
                        )}

                        {report.priority && (
                            <div className="
                                bg-gray-50
                                rounded-2xl
                                p-5
                                space-y-3
                                border
                            ">
                                <h3 className="
                                    font-bold
                                    text-lg
                                    text-[#03152E]
                                ">
                                    Datos de priorización
                                </h3>

                                <p>
                                    <strong>Prioridad:</strong>{" "}
                                    {report.priority}
                                </p>

                                {report.operationalType && (
                                    <p>
                                        <strong>Tipo operativo:</strong>{" "}
                                        {report.operationalType}
                                    </p>
                                )}

                                {report.targetDate && (
                                    <p>
                                        <strong>Fecha objetivo:</strong>{" "}
                                        {
                                            new Date(
                                                report.targetDate
                                            ).toLocaleDateString()
                                        }
                                    </p>
                                )}

                                {report.justification && (
                                    <p>
                                        <strong>Justificación:</strong>{" "}
                                        {report.justification}
                                    </p>
                                )}
                            </div>
                        )}

                        {
                            !canEvaluate &&
                            !canPrioritize &&
                            !canAssign && (
                                <div>
                                    <h2 className="
                                        text-2xl
                                        font-bold
                                        text-[#03152E]
                                    ">
                                        Acciones no disponibles
                                    </h2>

                                    <p className="
                                        text-gray-500
                                        mt-2
                                    ">
                                        Este reporte ya avanzó a otra etapa del flujo.
                                    </p>
                                </div>
                            )
                        }
                    </aside>
                </div>

                {canAssign && (
                    <div className="
                        bg-white
                        rounded-3xl
                        border
                        shadow-sm
                        p-6
                        lg:p-8
                    ">
                        <AssignmentSection
                            reportId={report.id}
                            reportTitle={report.title}
                            problemType={report.problemType}
                            address={report.address}
                            priority={report.priority}
                            municipalityId={
                                report.municipalityId || undefined
                            }
                            municipalityName={
                                report.municipality?.name || undefined
                            }
                            isReassignment={
                                report.status === "ASSIGNED"
                            }
                            onAssigned={fetchReport}
                        />
                    </div>
                )}
            </div>
        </div>
    );
}