import {
    useEffect,
    useMemo,
    useState,
} from "react";

import {
    useNavigate,
    useParams,
} from "react-router-dom";

import {
    statusLabels,
} from "../utils/reportLabels";

import {
    TechnicalClosureService,
    technicalClosureResultDescriptions,
    technicalClosureResultLabels,
} from "../services/technicalClosure.service";

import type {
    TechnicalClosureResult,
} from "../services/technicalClosure.service";

const API_URL =
    import.meta.env.VITE_API_URL ||
    "http://localhost:3000";

type Report = {
    id: string;
    title: string;
    problemType: string;
    description: string;
    status: string;
    address?: string;
    priority?: string;
    evidences?: {
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
        evidences: {
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
};

function fileToBase64(
    file: File
) {
    return new Promise<string>(
        (resolve, reject) => {
            const reader =
                new FileReader();

            reader.onload =
                () => {
                    const image =
                        new Image();

                    image.onload =
                        () => {
                            const maxWidth =
                                1000;

                            const scale =
                                Math.min(
                                    1,
                                    maxWidth / image.width
                                );

                            const canvas =
                                document.createElement("canvas");

                            canvas.width =
                                image.width * scale;

                            canvas.height =
                                image.height * scale;

                            const context =
                                canvas.getContext("2d");

                            if (!context) {
                                reject(
                                    new Error(
                                        "No se pudo procesar la imagen."
                                    )
                                );
                                return;
                            }

                            context.drawImage(
                                image,
                                0,
                                0,
                                canvas.width,
                                canvas.height
                            );

                            resolve(
                                canvas.toDataURL(
                                    "image/jpeg",
                                    0.75
                                )
                            );
                        };

                    image.onerror =
                        () => reject(
                            new Error(
                                "No se pudo cargar la imagen."
                            )
                        );

                    image.src =
                        String(reader.result);
                };

            reader.onerror =
                () => reject(
                    new Error(
                        "No se pudo leer la imagen."
                    )
                );

            reader.readAsDataURL(file);
        }
    );
}

function formatDateTime(
    value?: string | null
) {
    if (!value) {
        return "No registrado";
    }

    return new Date(value)
        .toLocaleString();
}

const closureResults:
    TechnicalClosureResult[] = [
        "RESOLVED_ON_SITE",
        "TEMPORARY_MITIGATION",
        "NO_INCIDENT_FOUND",
        "DUPLICATE",
        "OUT_OF_SCOPE",
        "FOLLOW_UP_REQUIRED",
    ];

export default function TechnicianClosurePage() {
    const navigate =
        useNavigate();

    const { id } =
        useParams();

    const [report, setReport] =
        useState<Report | null>(null);

    const [selectedResult, setSelectedResult] =
        useState<TechnicalClosureResult | "">("");

    const [observations, setObservations] =
        useState("");

    const [followUpNotes, setFollowUpNotes] =
        useState("");

    const [closureEvidenceUrl, setClosureEvidenceUrl] =
        useState("");

    const [loading, setLoading] =
        useState(true);

    const [saving, setSaving] =
        useState(false);

    const [error, setError] =
        useState("");

    const [successMessage, setSuccessMessage] =
        useState("");

    const technicianId =
        localStorage.getItem("userId") || "";

    const latestAttention =
        useMemo(() => {
            return report
                ?.technicalAttentions
                ?.[0];
        }, [report]);

    const beforeEvidences =
        report?.fieldWork?.evidences
            ?.filter((evidence) =>
                evidence.phase === "BEFORE"
            ) || [];

    const afterEvidences =
        report?.fieldWork?.evidences
            ?.filter((evidence) =>
                evidence.phase === "AFTER"
            ) || [];

    useEffect(() => {
        const fetchReport =
            async () => {
                try {
                    setLoading(true);
                    setError("");

                    const response =
                        await fetch(
                            `${API_URL}/api/reports/${id}`
                        );

                    const data =
                        await response.json();

                    if (!response.ok) {
                        throw new Error(
                            data?.message ||
                            "No se pudo cargar el reporte."
                        );
                    }

                    setReport(data);

                } catch (error: any) {
                    setError(
                        error.message ||
                        "No se pudo cargar el cierre técnico."
                    );

                } finally {
                    setLoading(false);
                }
            };

        fetchReport();
    }, [id]);

    const handleEvidenceChange =
        async (
            event: React.ChangeEvent<HTMLInputElement>
        ) => {
            const file =
                event.target.files?.[0];

            if (!file) {
                return;
            }

            try {
                setError("");

                const imageUrl =
                    await fileToBase64(file);

                setClosureEvidenceUrl(
                    imageUrl
                );

            } catch (error: any) {
                setError(
                    error.message ||
                    "No se pudo cargar la evidencia de cierre."
                );

            } finally {
                event.target.value = "";
            }
        };

    const canSubmit =
        selectedResult &&
        observations.trim() &&
        (
            selectedResult !== "FOLLOW_UP_REQUIRED" ||
            followUpNotes.trim()
        ) &&
        !saving;

    const handleSubmit =
        async (
            event: React.FormEvent
        ) => {
            event.preventDefault();

            if (!id || !report) {
                return;
            }

            if (!technicianId) {
                setError(
                    "No se encontró el técnico en sesión."
                );
                return;
            }

            if (!canSubmit) {
                setError(
                    "Completa el resultado técnico y las observaciones de cierre."
                );
                return;
            }

            const confirmed =
                window.confirm(
                    "¿Deseas registrar el cierre operativo? El reporte pasará a Resuelto."
                );

            if (!confirmed) {
                return;
            }

            try {
                setSaving(true);
                setError("");
                setSuccessMessage("");

                await TechnicalClosureService
                    .createClosure({
                        reportId:
                            id,

                        technicianId,

                        result:
                            selectedResult as TechnicalClosureResult,

                        observations,

                        closureEvidenceUrl:
                            closureEvidenceUrl ||
                            undefined,

                        followUpNotes:
                            followUpNotes ||
                            undefined,
                    });

                setSuccessMessage(
                    "Cierre técnico registrado correctamente."
                );

                setTimeout(() => {
                    navigate(
                        `/technician/reports/${id}`
                    );
                }, 1000);

            } catch (error: any) {
                setError(
                    error.message ||
                    "No se pudo registrar el cierre técnico."
                );

            } finally {
                setSaving(false);
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
                Reporte no encontrado
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
                <button
                    onClick={() =>
                        navigate(
                            `/technician/reports/${report.id}/fieldwork`
                        )
                    }
                    className="
                        text-blue-700
                        font-semibold
                        hover:underline
                    "
                >
                    ← Volver a trazabilidad
                </button>

                <section className="
                    bg-white
                    border
                    rounded-3xl
                    shadow-sm
                    p-6
                    lg:p-8
                    space-y-8
                ">
                    <div className="
                        grid
                        grid-cols-1
                        lg:grid-cols-[1fr_360px]
                        gap-8
                        items-start
                    ">
                        <div>
                            <p className="
                                text-green-700
                                font-semibold
                            ">
                                US19 - Cierre operativo
                            </p>

                            <h1 className="
                                text-4xl
                                lg:text-5xl
                                font-bold
                                text-[#03152E]
                                mt-2
                                leading-tight
                            ">
                                Registrar resultado técnico
                            </h1>

                            <p className="
                                text-gray-500
                                mt-4
                                max-w-3xl
                                text-lg
                                leading-relaxed
                            ">
                                Selecciona el resultado final de la atención, registra observaciones de cierre y confirma el cierre operativo del reporte.
                            </p>
                        </div>

                        <div className="
                            bg-blue-50
                            border
                            border-blue-100
                            rounded-2xl
                            p-5
                            space-y-3
                        ">
                            <h2 className="
                                font-bold
                                text-[#03152E]
                                text-lg
                            ">
                                Reporte a cerrar
                            </h2>

                            <p>
                                <strong>Título:</strong>{" "}
                                {report.title}
                            </p>

                            <p>
                                <strong>Tipo:</strong>{" "}
                                {report.problemType}
                            </p>

                            <p>
                                <strong>Estado:</strong>{" "}
                                {
                                    statusLabels[report.status] ||
                                    report.status
                                }
                            </p>

                            <p>
                                <strong>Prioridad:</strong>{" "}
                                {report.priority || "No definida"}
                            </p>

                            <p>
                                <strong>Municipalidad:</strong>{" "}
                                {
                                    report.municipality?.name ||
                                    "No definida"
                                }
                            </p>
                        </div>
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

                    {successMessage && (
                        <div className="
                            bg-green-50
                            border
                            border-green-200
                            text-green-700
                            rounded-2xl
                            p-4
                            font-semibold
                        ">
                            {successMessage}
                        </div>
                    )}

                    <div className="
                        grid
                        grid-cols-1
                        lg:grid-cols-[360px_1fr]
                        gap-8
                    ">
                        <aside className="
                            space-y-6
                        ">
                            <div className="
                                bg-gray-50
                                border
                                rounded-2xl
                                p-5
                                space-y-3
                            ">
                                <h2 className="
                                    text-xl
                                    font-bold
                                    text-[#03152E]
                                ">
                                    Resumen operativo
                                </h2>

                                <p>
                                    <strong>Llegada:</strong>{" "}
                                    {
                                        formatDateTime(
                                            report.fieldWork?.arrivedAt
                                        )
                                    }
                                </p>

                                <p>
                                    <strong>Cierre de visita:</strong>{" "}
                                    {
                                        formatDateTime(
                                            report.fieldWork?.closedAt
                                        )
                                    }
                                </p>

                                <p>
                                    <strong>Distancia registrada:</strong>{" "}
                                    {
                                        report.fieldWork?.distanceMeters !==
                                        null &&
                                        report.fieldWork?.distanceMeters !==
                                        undefined
                                            ? `${report.fieldWork.distanceMeters} m`
                                            : "No calculada"
                                    }
                                </p>

                                <p>
                                    <strong>Notas de campo:</strong>{" "}
                                    {
                                        report.fieldWork?.notes ||
                                        "Sin notas"
                                    }
                                </p>
                            </div>

                            <div className="
                                bg-gray-50
                                border
                                rounded-2xl
                                p-5
                                space-y-3
                            ">
                                <h2 className="
                                    text-xl
                                    font-bold
                                    text-[#03152E]
                                ">
                                    Atención técnica
                                </h2>

                                {latestAttention ? (
                                    <>
                                        <p>
                                            <strong>Acción:</strong>{" "}
                                            {latestAttention.actionTaken}
                                        </p>

                                        <p>
                                            <strong>Resultado:</strong>{" "}
                                            {latestAttention.technicalResult}
                                        </p>

                                        <p>
                                            <strong>Observaciones:</strong>{" "}
                                            {
                                                latestAttention.observations ||
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
                                p-5
                                space-y-4
                            ">
                                <h2 className="
                                    text-xl
                                    font-bold
                                    text-[#03152E]
                                ">
                                    Evidencias de campo
                                </h2>

                                <p className="
                                    text-sm
                                    font-semibold
                                    text-gray-600
                                ">
                                    Antes
                                </p>

                                <div className="
                                    grid
                                    grid-cols-2
                                    gap-2
                                ">
                                    {beforeEvidences.map((evidence) => (
                                        <img
                                            key={evidence.id}
                                            src={evidence.imageUrl}
                                            alt="Antes"
                                            className="
                                                h-[90px]
                                                w-full
                                                object-cover
                                                rounded-xl
                                                border
                                            "
                                        />
                                    ))}
                                </div>

                                <p className="
                                    text-sm
                                    font-semibold
                                    text-gray-600
                                ">
                                    Después
                                </p>

                                <div className="
                                    grid
                                    grid-cols-2
                                    gap-2
                                ">
                                    {afterEvidences.map((evidence) => (
                                        <img
                                            key={evidence.id}
                                            src={evidence.imageUrl}
                                            alt="Después"
                                            className="
                                                h-[90px]
                                                w-full
                                                object-cover
                                                rounded-xl
                                                border
                                            "
                                        />
                                    ))}
                                </div>
                            </div>
                        </aside>

                        <form
                            onSubmit={handleSubmit}
                            className="
                                space-y-8
                            "
                        >
                            <div className="
                                bg-gray-50
                                border
                                rounded-2xl
                                p-6
                                space-y-5
                            ">
                                <h2 className="
                                    text-2xl
                                    font-bold
                                    text-[#03152E]
                                ">
                                    Resultado técnico final
                                </h2>

                                <div className="
                                    grid
                                    grid-cols-1
                                    md:grid-cols-2
                                    gap-4
                                ">
                                    {closureResults.map((result) => (
                                        <label
                                            key={result}
                                            className={`
                                                border
                                                rounded-2xl
                                                p-4
                                                cursor-pointer
                                                bg-white
                                                transition
                                                ${
                                                    selectedResult === result
                                                        ? "border-blue-600 ring-2 ring-blue-100"
                                                        : "hover:bg-gray-50"
                                                }
                                            `}
                                        >
                                            <input
                                                type="radio"
                                                name="result"
                                                value={result}
                                                checked={
                                                    selectedResult === result
                                                }
                                                onChange={() =>
                                                    setSelectedResult(result)
                                                }
                                                className="mr-2"
                                            />

                                            <span className="
                                                font-bold
                                                text-[#03152E]
                                            ">
                                                {
                                                    technicalClosureResultLabels[result]
                                                }
                                            </span>

                                            <p className="
                                                text-sm
                                                text-gray-500
                                                mt-2
                                            ">
                                                {
                                                    technicalClosureResultDescriptions[result]
                                                }
                                            </p>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {selectedResult === "FOLLOW_UP_REQUIRED" && (
                                <div className="
                                    bg-yellow-50
                                    border
                                    border-yellow-200
                                    rounded-2xl
                                    p-6
                                    space-y-3
                                ">
                                    <h2 className="
                                        text-2xl
                                        font-bold
                                        text-[#03152E]
                                    ">
                                        Seguimiento requerido
                                    </h2>

                                    <textarea
                                        value={followUpNotes}
                                        onChange={(event) =>
                                            setFollowUpNotes(
                                                event.target.value
                                            )
                                        }
                                        placeholder="Describe la tarea complementaria, nueva visita o seguimiento requerido."
                                        className="
                                            w-full
                                            border
                                            rounded-xl
                                            p-4
                                            bg-white
                                            min-h-[130px]
                                            resize-none
                                        "
                                    />
                                </div>
                            )}

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
                                    Observaciones de cierre
                                </h2>

                                <textarea
                                    value={observations}
                                    onChange={(event) =>
                                        setObservations(
                                            event.target.value
                                        )
                                    }
                                    placeholder="Registra el motivo del cierre, acciones finales, condiciones observadas y cualquier detalle relevante."
                                    className="
                                        w-full
                                        border
                                        rounded-xl
                                        p-4
                                        bg-white
                                        min-h-[160px]
                                        resize-none
                                    "
                                />
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
                                    Evidencia de cierre
                                </h2>

                                <p className="
                                    text-gray-500
                                    text-sm
                                ">
                                    Opcionalmente adjunta una imagen adicional que sustente el cierre operativo.
                                </p>

                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleEvidenceChange}
                                    className="
                                        w-full
                                        border
                                        rounded-xl
                                        p-3
                                        bg-white
                                    "
                                />

                                {closureEvidenceUrl && (
                                    <div className="
                                        relative
                                        w-full
                                        max-w-sm
                                    ">
                                        <img
                                            src={closureEvidenceUrl}
                                            alt="Evidencia de cierre"
                                            className="
                                                w-full
                                                h-[180px]
                                                object-cover
                                                rounded-2xl
                                                border
                                            "
                                        />

                                        <button
                                            type="button"
                                            onClick={() =>
                                                setClosureEvidenceUrl("")
                                            }
                                            className="
                                                absolute
                                                top-2
                                                right-2
                                                bg-red-600
                                                text-white
                                                rounded-full
                                                w-8
                                                h-8
                                                font-bold
                                            "
                                        >
                                            ×
                                        </button>
                                    </div>
                                )}
                            </div>

                            <button
                                type="submit"
                                disabled={!canSubmit}
                                className="
                                    w-full
                                    bg-green-700
                                    text-white
                                    font-bold
                                    text-lg
                                    rounded-2xl
                                    py-4
                                    hover:bg-green-800
                                    transition
                                    disabled:bg-gray-300
                                    disabled:cursor-not-allowed
                                "
                            >
                                {
                                    saving
                                        ? "Registrando cierre..."
                                        : "Registrar cierre operativo"
                                }
                            </button>
                        </form>
                    </div>
                </section>
            </div>
        </div>
    );
}