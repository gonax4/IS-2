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

const API_URL =
    import.meta.env.VITE_API_URL ||
    "http://localhost:3000";

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

type Report = {
    id: string;
    title?: string;
    problemType: string;
    description: string;
    status: string;
    priority?: string;
    address?: string;
    latitude?: number;
    longitude?: number;

    evidences?: {
        imageUrl: string;
    }[];

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

    technicalAttentions?: {
        id: string;
        actionTaken: string;
        technicalResult: string;
        observations?: string | null;
        createdAt: string;
    }[];

    technicalClosure?: {
        id: string;
        result: string;
        observations: string;
        closureEvidenceUrl?: string | null;
        followUpRequired: boolean;
        followUpNotes?: string | null;
        closedAt: string;
        technician?: {
            firstName: string;
            lastName: string;
            email: string;
        };
    } | null;
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

export default function TechnicianReportDetailPage() {
    const { id } =
        useParams();

    const navigate =
        useNavigate();

    const [report, setReport] =
        useState<Report | null>(null);

    const [loading, setLoading] =
        useState(true);

    const [submitting, setSubmitting] =
        useState(false);

    const fetchReport =
        async () => {
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
                        "No se pudo cargar el trabajo."
                    );
                }

                setReport(data);

            } catch (error) {
                console.error(error);

            } finally {
                setLoading(false);
            }
        };

    useEffect(() => {
        fetchReport();
    }, [id]);

    const updateStatus =
        async (status: string) => {
            if (!report) {
                return;
            }

            try {
                setSubmitting(true);

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

                if (!response.ok) {
                    const error =
                        await response.json()
                            .catch(() => null);

                    throw new Error(
                        error?.message ||
                        "No se pudo actualizar el estado."
                    );
                }

                await fetchReport();

            } catch (error: any) {
                alert(
                    error.message ||
                    "No se pudo actualizar el estado."
                );

            } finally {
                setSubmitting(false);
            }
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

    if (!report) {
        return (
            <div className="
                min-h-screen
                flex
                items-center
                justify-center
                text-3xl
                font-bold
            ">
                Trabajo no encontrado
            </div>
        );
    }

    const imageUrl =
        report.evidences?.[0]?.imageUrl ||
        "https://placehold.co/1200x600?text=Sin+evidencia";

    const beforeEvidences =
        report.fieldWork?.evidences
            ?.filter((evidence) =>
                evidence.phase === "BEFORE"
            ) || [];

    const afterEvidences =
        report.fieldWork?.evidences
            ?.filter((evidence) =>
                evidence.phase === "AFTER"
            ) || [];

    const latestAttention =
        report.technicalAttentions?.[0];

    return (
        <div className="
            min-h-screen
            bg-[#F5F7FA]
            p-8
        ">
            <div className="
                max-w-6xl
                mx-auto
                space-y-8
            ">
                <button
                    onClick={() =>
                        navigate("/technician")
                    }
                    className="
                        text-blue-700
                        font-bold
                    "
                >
                    ← Volver al panel técnico
                </button>

                <div className="
                    bg-white
                    border
                    rounded-3xl
                    p-8
                    shadow-sm
                    space-y-8
                ">
                    <div className="
                        flex
                        justify-between
                        gap-6
                        items-start
                    ">
                        <div>
                            <p className="
                                text-green-700
                                font-bold
                                mb-2
                            ">
                                Detalle del trabajo
                            </p>

                            <h1 className="
                                text-5xl
                                font-bold
                                text-[#03152E]
                            ">
                                {report.title || report.problemType}
                            </h1>

                            <p className="
                                text-gray-500
                                text-xl
                                mt-3
                            ">
                                {report.problemType}
                            </p>
                        </div>

                        <span className="
                            bg-blue-100
                            text-blue-700
                            rounded-full
                            px-5
                            py-3
                            font-bold
                        ">
                            {statusLabels[report.status] || report.status}
                        </span>
                    </div>

                    <img
                        src={imageUrl}
                        alt={report.problemType}
                        className="
                            w-full
                            h-[420px]
                            object-cover
                            rounded-3xl
                        "
                    />

                    <div className="
                        grid
                        grid-cols-1
                        lg:grid-cols-2
                        gap-8
                    ">
                        <div>
                            <h2 className="
                                text-2xl
                                font-bold
                                mb-3
                            ">
                                Descripción
                            </h2>

                            <p className="
                                text-gray-700
                                leading-relaxed
                            ">
                                {report.description}
                            </p>
                        </div>

                        <div className="
                            bg-gray-50
                            border
                            rounded-2xl
                            p-6
                            space-y-3
                        ">
                            <h2 className="
                                text-2xl
                                font-bold
                            ">
                                Datos operativos
                            </h2>

                            <p>
                                <strong>Prioridad:</strong>{" "}
                                {report.priority || "No definida"}
                            </p>

                            <p>
                                <strong>Ubicación:</strong>{" "}
                                {report.address || "No registrada"}
                            </p>

                            {report.latitude && report.longitude && (
                                <a
                                    href={`https://www.google.com/maps?q=${report.latitude},${report.longitude}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="
                                        inline-block
                                        text-blue-700
                                        font-bold
                                        hover:underline
                                    "
                                >
                                    Abrir en Google Maps
                                </a>
                            )}

                            {report.fieldWork && (
                                <>
                                    <p>
                                        <strong>Llegada:</strong>{" "}
                                        {formatDateTime(report.fieldWork.arrivedAt)}
                                    </p>

                                    <p>
                                        <strong>Cierre de visita:</strong>{" "}
                                        {formatDateTime(report.fieldWork.closedAt)}
                                    </p>

                                    <p>
                                        <strong>Distancia registrada:</strong>{" "}
                                        {
                                            report.fieldWork.distanceMeters !==
                                            null &&
                                            report.fieldWork.distanceMeters !==
                                            undefined
                                                ? `${report.fieldWork.distanceMeters} m`
                                                : "No calculada"
                                        }
                                    </p>
                                </>
                            )}
                        </div>
                    </div>

                    <div className="
                        bg-gray-50
                        border
                        rounded-2xl
                        p-6
                        space-y-4
                    ">
                        <h2 className="
                            text-2xl
                            font-bold
                            text-[#03152E]
                        ">
                            Acciones del técnico
                        </h2>

                        {report.status === "ASSIGNED" && (
                            <button
                                disabled={submitting}
                                onClick={() =>
                                    updateStatus("IN_TRANSIT")
                                }
                                className="
                                    bg-yellow-500
                                    hover:bg-yellow-600
                                    disabled:bg-gray-400
                                    text-white
                                    rounded-xl
                                    px-5
                                    py-3
                                    font-bold
                                "
                            >
                                Iniciar traslado
                            </button>
                        )}

                        {report.status === "IN_TRANSIT" && (
                            <button
                                disabled={submitting}
                                onClick={() =>
                                    updateStatus("IN_PROGRESS")
                                }
                                className="
                                    bg-blue-700
                                    hover:bg-blue-800
                                    disabled:bg-gray-400
                                    text-white
                                    rounded-xl
                                    px-5
                                    py-3
                                    font-bold
                                "
                            >
                                Iniciar atención
                            </button>
                        )}

                        {report.status === "IN_PROGRESS" && (
                            <div className="
                                grid
                                grid-cols-1
                                md:grid-cols-3
                                gap-4
                            ">
                                <button
                                    onClick={() =>
                                        navigate(
                                            `/technician/reports/${report.id}/attend`
                                        )
                                    }
                                    className="
                                        bg-green-700
                                        text-white
                                        font-bold
                                        rounded-2xl
                                        py-4
                                        hover:bg-green-800
                                        transition
                                    "
                                >
                                    Atender reporte
                                </button>

                                <button
                                    onClick={() =>
                                        navigate(
                                            `/technician/reports/${report.id}/fieldwork`
                                        )
                                    }
                                    className="
                                        bg-blue-700
                                        text-white
                                        font-bold
                                        rounded-2xl
                                        py-4
                                        hover:bg-blue-800
                                        transition
                                    "
                                >
                                    Registrar evidencia y trazabilidad
                                </button>

                                <button
                                    onClick={() =>
                                        navigate(
                                            `/technician/reports/${report.id}/closure`
                                        )
                                    }
                                    className="
                                        bg-[#03152E]
                                        text-white
                                        font-bold
                                        rounded-2xl
                                        py-4
                                        hover:bg-black
                                        transition
                                    "
                                >
                                    Registrar resultado técnico y cerrar
                                </button>
                            </div>
                        )}

                        {report.status === "RESOLVED" && (
                            <div className="
                                space-y-6
                            ">
                                {report.technicalClosure ? (
                                    <div className="
                                        bg-white
                                        border
                                        rounded-2xl
                                        p-6
                                        space-y-4
                                    ">
                                        <h3 className="
                                            text-xl
                                            font-bold
                                            text-[#03152E]
                                        ">
                                            Cierre operativo registrado
                                        </h3>

                                        <p>
                                            <strong>Resultado técnico:</strong>{" "}
                                            {
                                                technicalClosureResultLabels[
                                                    report.technicalClosure.result
                                                ] ||
                                                report.technicalClosure.result
                                            }
                                        </p>

                                        <p>
                                            <strong>Observaciones de cierre:</strong>{" "}
                                            {report.technicalClosure.observations}
                                        </p>

                                        {report.technicalClosure.followUpRequired && (
                                            <p>
                                                <strong>Seguimiento requerido:</strong>{" "}
                                                {
                                                    report.technicalClosure.followUpNotes ||
                                                    "No indicado"
                                                }
                                            </p>
                                        )}

                                        <p>
                                            <strong>Fecha de cierre:</strong>{" "}
                                            {
                                                formatDateTime(
                                                    report.technicalClosure.closedAt
                                                )
                                            }
                                        </p>

                                        {report.technicalClosure.technician && (
                                            <p>
                                                <strong>Técnico responsable:</strong>{" "}
                                                {
                                                    `${report.technicalClosure.technician.firstName} ${report.technicalClosure.technician.lastName}`
                                                }
                                            </p>
                                        )}

                                        {report.technicalClosure.closureEvidenceUrl && (
                                            <img
                                                src={report.technicalClosure.closureEvidenceUrl}
                                                alt="Evidencia de cierre"
                                                className="
                                                    w-full
                                                    max-w-md
                                                    rounded-2xl
                                                    border
                                                    object-cover
                                                "
                                            />
                                        )}
                                    </div>
                                ) : (
                                    <p className="
                                        text-gray-500
                                    ">
                                        El reporte está resuelto, pero aún no se encontró un cierre técnico registrado.
                                    </p>
                                )}

                                {latestAttention && (
                                    <div className="
                                        bg-white
                                        border
                                        rounded-2xl
                                        p-6
                                        space-y-3
                                    ">
                                        <h3 className="
                                            text-xl
                                            font-bold
                                            text-[#03152E]
                                        ">
                                            Atención técnica previa
                                        </h3>

                                        <p>
                                            <strong>Acción realizada:</strong>{" "}
                                            {latestAttention.actionTaken}
                                        </p>

                                        <p>
                                            <strong>Resultado técnico:</strong>{" "}
                                            {latestAttention.technicalResult}
                                        </p>

                                        <p>
                                            <strong>Observaciones:</strong>{" "}
                                            {
                                                latestAttention.observations ||
                                                "Sin observaciones"
                                            }
                                        </p>
                                    </div>
                                )}

                                <div className="
                                    bg-white
                                    border
                                    rounded-2xl
                                    p-6
                                    space-y-4
                                ">
                                    <h3 className="
                                        text-xl
                                        font-bold
                                        text-[#03152E]
                                    ">
                                        Evidencias de campo
                                    </h3>

                                    <div className="
                                        grid
                                        grid-cols-1
                                        md:grid-cols-2
                                        gap-6
                                    ">
                                        <div>
                                            <p className="
                                                font-bold
                                                mb-3
                                            ">
                                                Fotos antes
                                            </p>

                                            <div className="
                                                grid
                                                grid-cols-2
                                                gap-3
                                            ">
                                                {beforeEvidences.length > 0 ? (
                                                    beforeEvidences.map((evidence) => (
                                                        <img
                                                            key={evidence.id}
                                                            src={evidence.imageUrl}
                                                            alt="Antes"
                                                            className="
                                                                h-[120px]
                                                                w-full
                                                                object-cover
                                                                rounded-xl
                                                                border
                                                            "
                                                        />
                                                    ))
                                                ) : (
                                                    <p className="text-gray-500">
                                                        Sin fotos antes.
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        <div>
                                            <p className="
                                                font-bold
                                                mb-3
                                            ">
                                                Fotos después
                                            </p>

                                            <div className="
                                                grid
                                                grid-cols-2
                                                gap-3
                                            ">
                                                {afterEvidences.length > 0 ? (
                                                    afterEvidences.map((evidence) => (
                                                        <img
                                                            key={evidence.id}
                                                            src={evidence.imageUrl}
                                                            alt="Después"
                                                            className="
                                                                h-[120px]
                                                                w-full
                                                                object-cover
                                                                rounded-xl
                                                                border
                                                            "
                                                        />
                                                    ))
                                                ) : (
                                                    <p className="text-gray-500">
                                                        Sin fotos después.
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {![
                            "ASSIGNED",
                            "IN_TRANSIT",
                            "IN_PROGRESS",
                            "RESOLVED",
                        ].includes(report.status) && (
                            <p className="
                                text-gray-500
                            ">
                                No hay acciones disponibles para este estado.
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}