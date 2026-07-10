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

const API_URL =
    import.meta.env.VITE_API_URL ||
    "http://localhost:3000";

type Report = {
    id: string;
    title?: string;
    category: string;
    problemType: string;
    description: string;
    status: string;
    address?: string;
    createdAt: string;
    evidences?: {
        imageUrl: string;
    }[];
};

type CampoConfig = {
    label: string;
    placeholder: string;
    descripcion: string;
    minLength?: number;
};

type CatalogoAtencion = {
    checklist: string[];
    camposObligatorios: CampoConfig[];
    acciones: string[];
};

const catalogoAtencion: Record<string, CatalogoAtencion> = {
    "Robos y asaltos": {
        checklist: [
            "Verificar zona de incidencia",
            "Documentar frecuencia del problema",
            "Notificar a unidad de seguridad",
        ],
        camposObligatorios: [
            {
                label: "Zona de riesgo",
                placeholder: "Ej: Esquina de Av. Arequipa con Jr. Moquegua",
                descripcion: "Indica la calle o cruce donde ocurren los incidentes.",
                minLength: 10,
            },
            {
                label: "Frecuencia reportada",
                placeholder: "Ej: Todos los días entre 9pm y 12am",
                descripcion: "Horario o días en que suele ocurrir.",
                minLength: 10,
            },
        ],
        acciones: [
            "Reparación — Coordinar con serenazgo",
            "Mitigación — Instalar cámara de vigilancia",
            "Derivación — Derivar a PNP",
        ],
    },

    "Consumo de alcohol en la vía pública": {
        checklist: [
            "Identificar personas involucradas",
            "Verificar si hay menores de edad",
            "Documentar hora y lugar exacto",
        ],
        camposObligatorios: [
            {
                label: "Número de personas",
                placeholder: "Ej: 4 personas en la vereda",
                descripcion: "Cantidad aproximada de personas involucradas.",
                minLength: 5,
            },
            {
                label: "Hora del incidente",
                placeholder: "Ej: Aproximadamente 10:30pm",
                descripcion: "Hora en que se encontró el problema.",
                minLength: 5,
            },
        ],
        acciones: [
            "Reparación — Dispersar a las personas",
            "Mitigación — Llamar a serenazgo",
            "Derivación — Derivar a PNP",
        ],
    },

    "Venta ambulante no autorizada": {
        checklist: [
            "Identificar tipo de producto vendido",
            "Verificar si obstruye el paso peatonal",
            "Documentar ubicación exacta del puesto",
        ],
        camposObligatorios: [
            {
                label: "Tipo de comercio",
                placeholder: "Ej: Venta de comida en vereda frente al parque",
                descripcion: "Describe qué se vende y cómo está instalado.",
                minLength: 10,
            },
            {
                label: "Nivel de obstrucción",
                placeholder: "Ej: Bloquea el 50% de la vereda",
                descripcion: "Indica si impide el paso de peatones o vehículos.",
                minLength: 10,
            },
        ],
        acciones: [
            "Reparación — Solicitar retiro del puesto",
            "Mitigación — Notificar a fiscalización",
            "Derivación — Derivar a municipio",
        ],
    },

    "Personas sospechosas": {
        checklist: [
            "Describir características de las personas",
            "Verificar si hay comportamiento amenazante",
            "Notificar a serenazgo de inmediato",
        ],
        camposObligatorios: [
            {
                label: "Descripción de las personas",
                placeholder: "Ej: 2 personas con capucha rondando el área",
                descripcion: "Características físicas o comportamiento observado.",
                minLength: 10,
            },
            {
                label: "Tiempo en el lugar",
                placeholder: "Ej: Llevan aproximadamente 1 hora en la zona",
                descripcion: "Cuánto tiempo llevan en el área según vecinos.",
                minLength: 10,
            },
        ],
        acciones: [
            "Reparación — Coordinar patrullaje en la zona",
            "Mitigación — Aumentar presencia de serenazgo",
            "Derivación — Derivar a PNP",
        ],
    },

    "Ruidos molestos": {
        checklist: [
            "Identificar fuente del ruido",
            "Verificar horario de ocurrencia",
            "Medir nivel aproximado de ruido",
        ],
        camposObligatorios: [
            {
                label: "Fuente del ruido",
                placeholder: "Ej: Local de música en Jr. Lima 234",
                descripcion: "Indica de dónde proviene el ruido.",
                minLength: 10,
            },
            {
                label: "Horario del problema",
                placeholder: "Ej: Desde las 11pm hasta las 3am",
                descripcion: "En qué horario se produce el ruido.",
                minLength: 5,
            },
        ],
        acciones: [
            "Reparación — Solicitar reducción de volumen",
            "Mitigación — Notificar a fiscalización",
            "Derivación — Derivar a policía",
        ],
    },

    "Acumulación de basura": {
        checklist: [
            "Verificar volumen acumulado",
            "Identificar punto crítico",
            "Tomar evidencia fotográfica",
        ],
        camposObligatorios: [
            {
                label: "Volumen estimado",
                placeholder: "Ej: 3 metros cúbicos aproximadamente",
                descripcion: "Estimación del tamaño o cantidad de residuos.",
                minLength: 5,
            },
            {
                label: "Punto exacto",
                placeholder: "Ej: Vereda frente al número 245 de Av. Lima",
                descripcion: "Ubicación precisa dentro de la dirección reportada.",
                minLength: 10,
            },
        ],
        acciones: [
            "Reparación — Programar recojo",
            "Mitigación — Limpieza inmediata parcial",
            "Derivación — Área de limpieza municipal",
        ],
    },

    "Mal olor en la vía pública": {
        checklist: [
            "Identificar fuente del olor",
            "Verificar si hay residuos o aguas servidas",
            "Documentar zona afectada",
        ],
        camposObligatorios: [
            {
                label: "Fuente probable del olor",
                placeholder: "Ej: Desagüe tapado en la esquina de Av. Lima",
                descripcion: "Indica de dónde parece provenir el mal olor.",
                minLength: 10,
            },
            {
                label: "Extensión del área afectada",
                placeholder: "Ej: Media cuadra de Av. Lima",
                descripcion: "Cuánto espacio abarca el problema.",
                minLength: 5,
            },
        ],
        acciones: [
            "Reparación — Limpiar la fuente del olor",
            "Mitigación — Aplicar desinfectante",
            "Derivación — Derivar a saneamiento",
        ],
    },

    "Contaminación de áreas verdes": {
        checklist: [
            "Verificar tipo de contaminación",
            "Identificar área afectada",
            "Documentar daño a la vegetación",
        ],
        camposObligatorios: [
            {
                label: "Tipo de contaminación",
                placeholder: "Ej: Vertido de aceite en el parque",
                descripcion: "Describe qué tipo de contaminante se encontró.",
                minLength: 10,
            },
            {
                label: "Área afectada",
                placeholder: "Ej: 20 metros cuadrados del parque central",
                descripcion: "Extensión aproximada del área contaminada.",
                minLength: 5,
            },
        ],
        acciones: [
            "Reparación — Limpiar área contaminada",
            "Mitigación — Cercar zona afectada",
            "Derivación — Derivar a medio ambiente",
        ],
    },

    "Residuos fuera de contenedores": {
        checklist: [
            "Verificar estado del contenedor",
            "Estimar cantidad de residuos fuera",
            "Identificar si hay riesgo de salud",
        ],
        camposObligatorios: [
            {
                label: "Estado del contenedor",
                placeholder: "Ej: Contenedor lleno y desbordado",
                descripcion: "Describe el estado actual del contenedor.",
                minLength: 10,
            },
            {
                label: "Cantidad de residuos",
                placeholder: "Ej: 5 bolsas grandes fuera del contenedor",
                descripcion: "Estimación de residuos fuera del contenedor.",
                minLength: 5,
            },
        ],
        acciones: [
            "Reparación — Recoger residuos y limpiar",
            "Mitigación — Colocar señalización",
            "Derivación — Solicitar vaciado urgente",
        ],
    },

    "Quema de residuos": {
        checklist: [
            "Verificar si el fuego está activo",
            "Identificar tipo de material quemado",
            "Evaluar riesgo de propagación",
        ],
        camposObligatorios: [
            {
                label: "Estado del incendio",
                placeholder: "Ej: Fuego controlado en contenedor de basura",
                descripcion: "Describe si el fuego está activo o ya apagado.",
                minLength: 10,
            },
            {
                label: "Material quemado",
                placeholder: "Ej: Bolsas de plástico y cartones",
                descripcion: "Tipo de residuos que se están quemando.",
                minLength: 5,
            },
        ],
        acciones: [
            "Reparación — Apagar el fuego",
            "Mitigación — Llamar a bomberos",
            "Derivación — Derivar a defensa civil",
        ],
    },

    "Pistas en mal estado": {
        checklist: [
            "Evaluar extensión del daño",
            "Verificar riesgo vial",
            "Medir área afectada",
        ],
        camposObligatorios: [
            {
                label: "Metros afectados",
                placeholder: "Ej: 15 metros lineales de pista dañada",
                descripcion: "Longitud aproximada del tramo en mal estado.",
                minLength: 5,
            },
            {
                label: "Nivel de riesgo",
                placeholder: "Ej: Alto — huecos de más de 20cm de profundidad",
                descripcion: "Indica si representa peligro inmediato.",
                minLength: 10,
            },
        ],
        acciones: [
            "Reparación — Reparación en sitio",
            "Mitigación — Señalización temporal",
            "Derivación — Derivar a infraestructura",
        ],
    },

    "Alumbrado público defectuoso": {
        checklist: [
            "Identificar cantidad de postes afectados",
            "Verificar tipo de falla",
            "Revisar zona de cobertura",
        ],
        camposObligatorios: [
            {
                label: "Número de postes",
                placeholder: "Ej: 3 postes consecutivos sin luz",
                descripcion: "Cantidad de postes afectados en el tramo.",
                minLength: 5,
            },
            {
                label: "Tipo de falla",
                placeholder: "Ej: Lámpara quemada / cable cortado / poste dañado",
                descripcion: "Describe visualmente cuál es el problema.",
                minLength: 5,
            },
        ],
        acciones: [
            "Reparación — Reemplazo de luminaria",
            "Mitigación — Revisión de cableado",
            "Derivación — Derivar a empresa eléctrica",
        ],
    },

    "Veredas en mal estado": {
        checklist: [
            "Evaluar extensión del daño",
            "Verificar riesgo para peatones",
            "Identificar causa del deterioro",
        ],
        camposObligatorios: [
            {
                label: "Metros afectados",
                placeholder: "Ej: 10 metros de vereda levantada",
                descripcion: "Longitud aproximada de la vereda dañada.",
                minLength: 5,
            },
            {
                label: "Tipo de daño",
                placeholder: "Ej: Losas levantadas por raíces de árbol",
                descripcion: "Describe qué tipo de daño presenta la vereda.",
                minLength: 10,
            },
        ],
        acciones: [
            "Reparación — Reparar losas dañadas",
            "Mitigación — Señalizar zona peligrosa",
            "Derivación — Derivar a infraestructura",
        ],
    },

    "Semáforos inoperativos": {
        checklist: [
            "Verificar cuántos semáforos están afectados",
            "Evaluar riesgo de accidentes",
            "Coordinar tráfico manualmente si es necesario",
        ],
        camposObligatorios: [
            {
                label: "Semáforos afectados",
                placeholder: "Ej: 2 semáforos en la intersección de Av. Lima",
                descripcion: "Cantidad y ubicación de semáforos inoperativos.",
                minLength: 10,
            },
            {
                label: "Tipo de falla",
                placeholder: "Ej: Sin energía / pantalla rota / luces parpadeando",
                descripcion: "Describe qué falla presenta el semáforo.",
                minLength: 5,
            },
        ],
        acciones: [
            "Reparación — Solicitar reparación técnica",
            "Mitigación — Control manual del tráfico",
            "Derivación — Derivar a empresa de señalización",
        ],
    },

    "Señalización dañada": {
        checklist: [
            "Identificar tipo de señal dañada",
            "Verificar si genera riesgo vial",
            "Documentar ubicación exacta",
        ],
        camposObligatorios: [
            {
                label: "Tipo de señal",
                placeholder: "Ej: Señal de pare caída / líneas de cruce borradas",
                descripcion: "Describe qué tipo de señalización está dañada.",
                minLength: 10,
            },
            {
                label: "Nivel de riesgo",
                placeholder: "Ej: Alto — señal irreconocible",
                descripcion: "Si la señal dañada representa riesgo inmediato.",
                minLength: 5,
            },
        ],
        acciones: [
            "Reparación — Reemplazar señal dañada",
            "Mitigación — Señalización temporal",
            "Derivación — Derivar a tránsito",
        ],
    },

    "Congestión vehicular": {
        checklist: [
            "Identificar causa de la congestión",
            "Estimar longitud de la cola vehicular",
            "Verificar si hay accidente involucrado",
        ],
        camposObligatorios: [
            {
                label: "Causa de la congestión",
                placeholder: "Ej: Obras en la vía reducen carriles",
                descripcion: "Describe qué está causando el problema de tráfico.",
                minLength: 10,
            },
            {
                label: "Impacto estimado",
                placeholder: "Ej: Cola de 3 cuadras, demora aproximada 20 min",
                descripcion: "Longitud de la cola y tiempo de demora estimado.",
                minLength: 10,
            },
        ],
        acciones: [
            "Reparación — Desviar el tráfico",
            "Mitigación — Control manual del flujo",
            "Derivación — Derivar a policía de tránsito",
        ],
    },

    "Autos abandonados": {
        checklist: [
            "Verificar placa del vehículo",
            "Estimar tiempo de abandono",
            "Verificar si obstruye el tráfico",
        ],
        camposObligatorios: [
            {
                label: "Placa del vehículo",
                placeholder: "Ej: ABC-123 o sin placa visible",
                descripcion: "Número de placa del vehículo abandonado.",
                minLength: 5,
            },
            {
                label: "Tiempo de abandono",
                placeholder: "Ej: Vecinos indican que lleva 3 días ahí",
                descripcion: "Tiempo aproximado que lleva abandonado.",
                minLength: 10,
            },
        ],
        acciones: [
            "Reparación — Solicitar grúa municipal",
            "Mitigación — Señalizar el vehículo",
            "Derivación — Derivar a policía de tránsito",
        ],
    },

    "Exceso de velocidad": {
        checklist: [
            "Identificar zona de riesgo",
            "Verificar señalización de velocidad",
            "Evaluar frecuencia del problema",
        ],
        camposObligatorios: [
            {
                label: "Zona de riesgo",
                placeholder: "Ej: Cuadra 5 de Av. Lima frente al colegio",
                descripcion: "Indica el tramo donde se produce el exceso de velocidad.",
                minLength: 10,
            },
            {
                label: "Frecuencia del problema",
                placeholder: "Ej: Principalmente en horas de salida escolar",
                descripcion: "Cuándo o con qué frecuencia ocurre.",
                minLength: 10,
            },
        ],
        acciones: [
            "Reparación — Instalar reductor de velocidad",
            "Mitigación — Colocar señalización adicional",
            "Derivación — Derivar a policía de tránsito",
        ],
    },

    "Estacionamiento en zonas prohibidas": {
        checklist: [
            "Verificar señalización de zona prohibida",
            "Documentar placa del vehículo",
            "Verificar si obstruye entrada o paso",
        ],
        camposObligatorios: [
            {
                label: "Placa del vehículo",
                placeholder: "Ej: XYZ-456",
                descripcion: "Número de placa del vehículo mal estacionado.",
                minLength: 5,
            },
            {
                label: "Tipo de obstrucción",
                placeholder: "Ej: Bloquea entrada de emergencias",
                descripcion: "Qué está obstruyendo el vehículo.",
                minLength: 10,
            },
        ],
        acciones: [
            "Reparación — Solicitar retiro del vehículo",
            "Mitigación — Notificar al propietario",
            "Derivación — Derivar a policía de tránsito",
        ],
    },

    "Transporte público deficiente": {
        checklist: [
            "Identificar línea de transporte afectada",
            "Verificar tipo de deficiencia",
            "Documentar horario del problema",
        ],
        camposObligatorios: [
            {
                label: "Línea afectada",
                placeholder: "Ej: Ruta 5 — Av. Arequipa hacia Miraflores",
                descripcion: "Indica qué línea o ruta presenta el problema.",
                minLength: 10,
            },
            {
                label: "Tipo de deficiencia",
                placeholder: "Ej: Unidades en mal estado, baja frecuencia",
                descripcion: "Describe cuál es el problema con el servicio.",
                minLength: 10,
            },
        ],
        acciones: [
            "Reparación — Reportar a concesionaria",
            "Mitigación — Notificar a supervisión de transporte",
            "Derivación — Derivar a autoridad de transporte",
        ],
    },
};

const catalogoDefault: CatalogoAtencion = {
    checklist: [
        "Verificar incidencia en sitio",
        "Documentar hallazgos",
        "Tomar fotografías si es posible",
    ],
    camposObligatorios: [
        {
            label: "Observaciones de campo",
            placeholder: "Ej: Se encontró el problema tal como fue reportado.",
            descripcion: "Describe lo que encontraste al llegar al lugar.",
            minLength: 10,
        },
    ],
    acciones: [
        "Reparación — Evaluar situación",
        "Mitigación — Tomar medidas correctivas",
        "Derivación — Derivar si es necesario",
    ],
};

const resultadosTecnicos = [
    {
        valor: "Aparentemente resuelto",
        etiqueta: "Aparentemente resuelto",
    },
    {
        valor: "Parcialmente atendido",
        etiqueta: "Parcialmente atendido",
    },
    {
        valor: "Requiere intervención adicional",
        etiqueta: "Requiere intervención adicional",
    },
    {
        valor: "Caso derivado",
        etiqueta: "Caso derivado",
    },
    {
        valor: "No se pudo verificar",
        etiqueta: "No se pudo verificar",
    },
];

const pasosSidebar = [
    "Verificación en sitio",
    "Datos requeridos",
    "Acción realizada",
    "Resultado preliminar",
];

const campoExtra: CampoConfig = {
    label: "Observaciones adicionales",
    placeholder: "Ej: Detalles relevantes no cubiertos arriba, o N/A si no aplica.",
    descripcion: "Información adicional relevante para el caso.",
    minLength: 2,
};

export default function TechnicianAttendPage() {
    const { id } =
        useParams();

    const navigate =
        useNavigate();

    const [report, setReport] =
        useState<Report | null>(null);

    const [loading, setLoading] =
        useState(true);

    const [saving, setSaving] =
        useState(false);

    const [savedMessage, setSavedMessage] =
        useState("");

    const [errorMessage, setErrorMessage] =
        useState("");

    const [errores, setErrores] =
        useState<Record<string, string>>({});

    const [checklistCompletado, setChecklistCompletado] =
        useState<Record<string, boolean>>({});

    const [campos, setCampos] =
        useState<Record<string, string>>({});

    const [accionSeleccionada, setAccionSeleccionada] =
        useState("");

    const [resultadoSeleccionado, setResultadoSeleccionado] =
        useState("");

    const technicianId =
        localStorage.getItem("userId") || "";

    const catalogo =
        useMemo(() => {
            const base =
                report
                    ? catalogoAtencion[report.problemType] ??
                      catalogoDefault
                    : catalogoDefault;

            return {
                ...base,
                camposObligatorios: [
                    ...base.camposObligatorios,
                    campoExtra,
                ],
            };
        }, [report]);

    const storageKey =
        `technician-attend-${id}`;

    useEffect(() => {
        const fetchReport =
            async () => {
                try {
                    setLoading(true);
                    setErrorMessage("");

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
                    setErrorMessage(
                        error.message ||
                        "No se pudo cargar el reporte."
                    );

                } finally {
                    setLoading(false);
                }
            };

        fetchReport();
    }, [id]);

    useEffect(() => {
        if (!report) {
            return;
        }

        const saved =
            localStorage.getItem(storageKey);

        if (saved) {
            try {
                const parsed =
                    JSON.parse(saved);

                setChecklistCompletado(
                    parsed.checklistCompletado ??
                    catalogo.checklist.reduce(
                        (acc, item) => ({
                            ...acc,
                            [item]: false,
                        }),
                        {}
                    )
                );

                setCampos(
                    parsed.campos ??
                    catalogo.camposObligatorios.reduce(
                        (acc, campo) => ({
                            ...acc,
                            [campo.label]: "",
                        }),
                        {}
                    )
                );

                setAccionSeleccionada(
                    parsed.accionSeleccionada ?? ""
                );

                setResultadoSeleccionado(
                    parsed.resultadoSeleccionado ?? ""
                );

                return;

            } catch {
                localStorage.removeItem(storageKey);
            }
        }

        setChecklistCompletado(
            catalogo.checklist.reduce(
                (acc, item) => ({
                    ...acc,
                    [item]: false,
                }),
                {}
            )
        );

        setCampos(
            catalogo.camposObligatorios.reduce(
                (acc, campo) => ({
                    ...acc,
                    [campo.label]: "",
                }),
                {}
            )
        );
    }, [
        report,
        catalogo,
        storageKey,
    ]);

    useEffect(() => {
        if (!id || !report) {
            return;
        }

        localStorage.setItem(
            storageKey,
            JSON.stringify({
                checklistCompletado,
                campos,
                accionSeleccionada,
                resultadoSeleccionado,
            })
        );
    }, [
        id,
        report,
        storageKey,
        checklistCompletado,
        campos,
        accionSeleccionada,
        resultadoSeleccionado,
    ]);

    const toggleChecklist =
        (item: string) => {
            setChecklistCompletado((prev) => ({
                ...prev,
                [item]: !prev[item],
            }));
        };

    const validar =
        (): Record<string, string> => {
            const nuevosErrores:
                Record<string, string> = {};

            catalogo.camposObligatorios.forEach((campo) => {
                const valor =
                    campos[campo.label] ?? "";

                if (valor.trim() === "") {
                    nuevosErrores[campo.label] =
                        "Este campo es obligatorio.";

                } else if (
                    campo.minLength &&
                    valor.trim().length < campo.minLength
                ) {
                    nuevosErrores[campo.label] =
                        `Debe tener al menos ${campo.minLength} caracteres.`;
                }
            });

            if (!accionSeleccionada) {
                nuevosErrores["accion"] =
                    "Debes seleccionar una acción realizada.";
            }

            if (!resultadoSeleccionado) {
                nuevosErrores["resultado"] =
                    "Debes seleccionar una evaluación preliminar.";
            }

            return nuevosErrores;
        };

    const saveTechnicalAttention =
        async () => {
            if (!report) {
                return;
            }

            if (!technicianId) {
                throw new Error(
                    "No se encontró el técnico en sesión."
                );
            }

            const checklistPayload =
                catalogo.checklist.map((item) => ({
                    item,
                    checked:
                        Boolean(checklistCompletado[item]),
                }));

            const response =
                await fetch(
                    `${API_URL}/api/technical-attentions`,
                    {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body:
                            JSON.stringify({
                                reportId:
                                    report.id,

                                technicianId,

                                checklist:
                                    checklistPayload,

                                fieldValues:
                                    campos,

                                actionTaken:
                                    accionSeleccionada,

                                technicalResult:
                                    resultadoSeleccionado,

                                observations:
                                    campos["Observaciones adicionales"] ||
                                    undefined,
                            }),
                    }
                );

            const data =
                await response.json()
                    .catch(() => null);

            if (!response.ok) {
                throw new Error(
                    data?.message ||
                    "No se pudo guardar la atención técnica."
                );
            }

            const statusResponse =
                await fetch(
                    `${API_URL}/api/reports/${report.id}/status`,
                    {
                        method: "PATCH",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body:
                            JSON.stringify({
                                status:
                                    "IN_PROGRESS",
                            }),
                    }
                );

            const statusData =
                await statusResponse.json()
                    .catch(() => null);

            if (!statusResponse.ok) {
                throw new Error(
                    statusData?.message ||
                    "La atención fue guardada, pero no se pudo actualizar el estado."
                );
            }

            localStorage.removeItem(storageKey);
        };

    const guardarYSalir =
        async () => {
            if (!report) {
                return;
            }

            const nuevosErrores =
                validar();

            if (Object.keys(nuevosErrores).length > 0) {
                setErrores(nuevosErrores);
                return;
            }

            try {
                setSaving(true);
                setErrores({});
                setErrorMessage("");
                setSavedMessage("");

                await saveTechnicalAttention();

                setSavedMessage(
                    "Atención guardada correctamente."
                );

                setTimeout(() => {
                    navigate(
                        `/technician/reports/${report.id}`
                    );
                }, 800);

            } catch (error: any) {
                setErrorMessage(
                    error.message ||
                    "No se pudo guardar la atención."
                );

            } finally {
                setSaving(false);
            }
        };

    const guardarYContinuar =
        async () => {
            if (!report) {
                return;
            }

            const nuevosErrores =
                validar();

            if (Object.keys(nuevosErrores).length > 0) {
                setErrores(nuevosErrores);
                return;
            }

            try {
                setSaving(true);
                setErrores({});
                setErrorMessage("");
                setSavedMessage("");

                await saveTechnicalAttention();

                setSavedMessage(
                    "Atención guardada correctamente. Continuando a trazabilidad."
                );

                setTimeout(() => {
                    navigate(
                        `/technician/reports/${report.id}/fieldwork`
                    );
                }, 800);

            } catch (error: any) {
                setErrorMessage(
                    error.message ||
                    "No se pudo guardar la atención."
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
            flex
        ">
            <aside className="
                w-[260px]
                min-h-screen
                bg-[#03152E]
                text-white
                p-6
                flex
                flex-col
                justify-between
                sticky
                top-0
            ">
                <div>
                    <h1 className="
                        text-4xl
                        font-bold
                        mb-10
                    ">
                        reporta
                        <span className="text-yellow-400">
                            Ya
                        </span>
                    </h1>

                    <p className="
                        text-white/50
                        text-xs
                        uppercase
                        tracking-wide
                        mb-3
                    ">
                        Trabajo actual
                    </p>

                    <div className="
                        bg-white/10
                        rounded-2xl
                        p-4
                        space-y-2
                        mb-8
                    ">
                        <p className="
                            font-semibold
                            text-lg
                        ">
                            {report.problemType}
                        </p>

                        <p className="
                            text-white/60
                            text-sm
                        ">
                            {report.address || "Ubicación no disponible"}
                        </p>

                        <span className="
                            inline-block
                            bg-blue-400
                            text-black
                            text-xs
                            font-bold
                            px-3
                            py-1
                            rounded-full
                        ">
                            {statusLabels[report.status] || report.status}
                        </span>
                    </div>

                    <p className="
                        text-white/50
                        text-xs
                        uppercase
                        tracking-wide
                        mb-4
                    ">
                        Progreso de atención
                    </p>

                    <div className="space-y-4">
                        {pasosSidebar.map((paso, index) => (
                            <div
                                key={paso}
                                className="
                                    flex
                                    items-center
                                    gap-3
                                "
                            >
                                <div className="
                                    w-7
                                    h-7
                                    rounded-full
                                    bg-white/20
                                    flex
                                    items-center
                                    justify-center
                                    text-xs
                                    font-bold
                                ">
                                    {index + 1}
                                </div>

                                <span className="
                                    text-white/70
                                    text-sm
                                ">
                                    {paso}
                                </span>
                            </div>
                        ))}
                    </div>

                    <div className="
                        mt-8
                        bg-white/5
                        border
                        border-white/10
                        rounded-2xl
                        p-4
                    ">
                        <p className="
                            text-white/50
                            text-xs
                            leading-relaxed
                        ">
                            Este registro es preliminar. El checklist es una guía operativa y no es obligatorio marcar todos los puntos.
                        </p>
                    </div>
                </div>
            </aside>

            <main className="
                flex-1
                p-10
                overflow-y-auto
            ">
                <button
                    onClick={() =>
                        navigate(
                            `/technician/reports/${report.id}`
                        )
                    }
                    className="
                        text-blue-600
                        font-semibold
                        mb-8
                        hover:underline
                        block
                    "
                >
                    ← Volver al detalle del reporte
                </button>

                <h2 className="
                    text-5xl
                    font-bold
                    mb-2
                    text-[#03152E]
                ">
                    Atender reporte
                </h2>

                <p className="
                    text-gray-500
                    text-xl
                    mb-10
                ">
                    Documenta lo que encontraste y realizaste en el lugar. Este registro es preliminar y continuará en la trazabilidad de campo.
                </p>

                {errorMessage && (
                    <div className="
                        bg-red-50
                        border
                        border-red-200
                        text-red-700
                        rounded-2xl
                        px-6
                        py-4
                        mb-6
                        font-semibold
                    ">
                        {errorMessage}
                    </div>
                )}

                {savedMessage && (
                    <div className="
                        bg-green-50
                        border
                        border-green-200
                        text-green-700
                        rounded-2xl
                        px-6
                        py-4
                        mb-6
                        font-semibold
                    ">
                        ✓ {savedMessage}
                    </div>
                )}

                <div className="space-y-6">
                    <div className="
                        bg-white
                        rounded-3xl
                        border
                        shadow-sm
                        p-8
                    ">
                        <div className="
                            flex
                            items-start
                            justify-between
                            gap-4
                            mb-4
                        ">
                            <div>
                                <h3 className="
                                    text-3xl
                                    font-bold
                                    text-[#03152E]
                                ">
                                    {report.title || report.problemType}
                                </h3>

                                <p className="
                                    text-gray-500
                                    mt-1
                                ">
                                    {report.address || "Ubicación no disponible"}
                                </p>
                            </div>

                            <span className="
                                bg-blue-100
                                text-blue-700
                                px-4
                                py-2
                                rounded-full
                                font-semibold
                                whitespace-nowrap
                            ">
                                {statusLabels[report.status] || report.status}
                            </span>
                        </div>

                        <p className="
                            text-gray-600
                            text-lg
                            leading-relaxed
                        ">
                            {report.description}
                        </p>
                    </div>

                    <div className="
                        bg-white
                        rounded-3xl
                        border
                        shadow-sm
                        p-8
                    ">
                        <div className="
                            flex
                            items-center
                            gap-3
                            mb-6
                        ">
                            <div className="
                                w-8
                                h-8
                                rounded-full
                                bg-[#03152E]
                                text-white
                                flex
                                items-center
                                justify-center
                                font-bold
                                text-sm
                            ">
                                1
                            </div>

                            <h3 className="
                                text-2xl
                                font-bold
                                text-[#03152E]
                            ">
                                Verificación en sitio
                            </h3>
                        </div>

                        <p className="
                            text-sm
                            text-gray-500
                            mb-4
                        ">
                            Marca solo lo que pudiste verificar. No es obligatorio completar todos los puntos.
                        </p>

                        <div className="space-y-3">
                            {catalogo.checklist.map((item) => (
                                <button
                                    key={item}
                                    type="button"
                                    onClick={() =>
                                        toggleChecklist(item)
                                    }
                                    className="
                                        flex
                                        items-center
                                        gap-3
                                        cursor-pointer
                                        w-full
                                        text-left
                                        group
                                    "
                                >
                                    <span className={`
                                        w-6
                                        h-6
                                        rounded-lg
                                        border-2
                                        flex
                                        items-center
                                        justify-center
                                        transition
                                        flex-shrink-0
                                        ${
                                            checklistCompletado[item]
                                                ? "bg-[#03152E] border-[#03152E]"
                                                : "border-gray-300 group-hover:border-gray-400"
                                        }
                                    `}>
                                        {checklistCompletado[item] && (
                                            <span className="
                                                text-white
                                                text-xs
                                                font-bold
                                            ">
                                                ✓
                                            </span>
                                        )}
                                    </span>

                                    <span className={
                                        checklistCompletado[item]
                                            ? "line-through text-gray-400"
                                            : "text-gray-700"
                                    }>
                                        {item}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="
                        bg-white
                        rounded-3xl
                        border
                        shadow-sm
                        p-8
                    ">
                        <div className="
                            flex
                            items-center
                            gap-3
                            mb-6
                        ">
                            <div className="
                                w-8
                                h-8
                                rounded-full
                                bg-[#03152E]
                                text-white
                                flex
                                items-center
                                justify-center
                                font-bold
                                text-sm
                            ">
                                2
                            </div>

                            <h3 className="
                                text-2xl
                                font-bold
                                text-[#03152E]
                            ">
                                Datos requeridos
                            </h3>
                        </div>

                        <p className="
                            text-sm
                            text-gray-500
                            mb-4
                        ">
                            Registra los datos mínimos encontrados en campo para este tipo de problema.
                        </p>

                        <div className="
                            grid
                            grid-cols-1
                            sm:grid-cols-2
                            xl:grid-cols-4
                            gap-4
                        ">
                            {catalogo.camposObligatorios.map((campo) => (
                                <div
                                    key={campo.label}
                                    className={
                                        campo.label === campoExtra.label
                                            ? "sm:col-span-2"
                                            : ""
                                    }
                                >
                                    <label className="
                                        block
                                        text-sm
                                        font-medium
                                        text-gray-700
                                        mb-1
                                    ">
                                        {campo.label} *
                                    </label>

                                    <p className="
                                        text-xs
                                        text-gray-400
                                        mb-2
                                    ">
                                        {campo.descripcion}
                                    </p>

                                    <input
                                        type="text"
                                        value={
                                            campos[campo.label] || ""
                                        }
                                        onChange={(event) => {
                                            setCampos((prev) => ({
                                                ...prev,
                                                [campo.label]:
                                                    event.target.value,
                                            }));

                                            if (errores[campo.label]) {
                                                setErrores((prev) => {
                                                    const err = {
                                                        ...prev,
                                                    };

                                                    delete err[campo.label];

                                                    return err;
                                                });
                                            }
                                        }}
                                        placeholder={campo.placeholder}
                                        className={`
                                            w-full
                                            border
                                            rounded-xl
                                            px-4
                                            py-3
                                            outline-none
                                            focus:ring-2
                                            text-gray-700
                                            ${
                                                errores[campo.label]
                                                    ? "border-red-400 focus:ring-red-300"
                                                    : "focus:ring-[#03152E]"
                                            }
                                        `}
                                    />

                                    {errores[campo.label] && (
                                        <p className="
                                            text-red-500
                                            text-xs
                                            mt-1
                                        ">
                                            {errores[campo.label]}
                                        </p>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="
                        bg-white
                        rounded-3xl
                        border
                        shadow-sm
                        p-8
                    ">
                        <div className="
                            flex
                            items-center
                            gap-3
                            mb-6
                        ">
                            <div className="
                                w-8
                                h-8
                                rounded-full
                                bg-[#03152E]
                                text-white
                                flex
                                items-center
                                justify-center
                                font-bold
                                text-sm
                            ">
                                3
                            </div>

                            <h3 className="
                                text-2xl
                                font-bold
                                text-[#03152E]
                            ">
                                Acción técnica realizada
                            </h3>
                        </div>

                        <p className="
                            text-sm
                            text-gray-500
                            mb-4
                        ">
                            ¿Qué intervención realizaste o gestionaste en el lugar?
                        </p>

                        <div className="
                            grid
                            grid-cols-1
                            md:grid-cols-3
                            gap-3
                        ">
                            {catalogo.acciones.map((accion) => (
                                <button
                                    key={accion}
                                    type="button"
                                    onClick={() => {
                                        setAccionSeleccionada(accion);

                                        if (errores["accion"]) {
                                            setErrores((prev) => {
                                                const err = {
                                                    ...prev,
                                                };

                                                delete err["accion"];

                                                return err;
                                            });
                                        }
                                    }}
                                    className={`
                                        p-4
                                        rounded-2xl
                                        border-2
                                        text-left
                                        text-sm
                                        font-medium
                                        transition
                                        ${
                                            accionSeleccionada === accion
                                                ? "border-[#03152E] bg-[#03152E] text-white"
                                                : errores["accion"]
                                                    ? "border-red-300 text-gray-700"
                                                    : "border-gray-200 hover:border-gray-400 text-gray-700"
                                        }
                                    `}
                                >
                                    {accion}
                                </button>
                            ))}
                        </div>

                        {errores["accion"] && (
                            <p className="
                                text-red-500
                                text-xs
                                mt-3
                            ">
                                {errores["accion"]}
                            </p>
                        )}
                    </div>

                    <div className="
                        bg-white
                        rounded-3xl
                        border
                        shadow-sm
                        p-8
                    ">
                        <div className="
                            flex
                            items-center
                            gap-3
                            mb-6
                        ">
                            <div className="
                                w-8
                                h-8
                                rounded-full
                                bg-[#03152E]
                                text-white
                                flex
                                items-center
                                justify-center
                                font-bold
                                text-sm
                            ">
                                4
                            </div>

                            <h3 className="
                                text-2xl
                                font-bold
                                text-[#03152E]
                            ">
                                Evaluación preliminar del resultado
                            </h3>
                        </div>

                        <p className="
                            text-sm
                            text-gray-500
                            mb-4
                        ">
                            Indica cómo quedó el caso. Esta evaluación será complementada en el cierre formal.
                        </p>

                        <div className="space-y-2">
                            {resultadosTecnicos.map((resultado) => (
                                <button
                                    key={resultado.valor}
                                    type="button"
                                    onClick={() => {
                                        setResultadoSeleccionado(
                                            resultado.valor
                                        );

                                        if (errores["resultado"]) {
                                            setErrores((prev) => {
                                                const err = {
                                                    ...prev,
                                                };

                                                delete err["resultado"];

                                                return err;
                                            });
                                        }
                                    }}
                                    className={`
                                        flex
                                        items-center
                                        gap-3
                                        cursor-pointer
                                        w-full
                                        text-left
                                        p-3
                                        rounded-xl
                                        transition
                                        ${
                                            resultadoSeleccionado === resultado.valor
                                                ? "bg-[#03152E]/5"
                                                : "hover:bg-gray-50"
                                        }
                                    `}
                                >
                                    <span className={`
                                        w-6
                                        h-6
                                        rounded-full
                                        border-2
                                        flex
                                        items-center
                                        justify-center
                                        transition
                                        flex-shrink-0
                                        ${
                                            resultadoSeleccionado === resultado.valor
                                                ? "border-[#03152E] bg-[#03152E]"
                                                : errores["resultado"]
                                                    ? "border-red-300"
                                                    : "border-gray-300"
                                        }
                                    `}>
                                        {resultadoSeleccionado === resultado.valor && (
                                            <span className="
                                                w-2.5
                                                h-2.5
                                                rounded-full
                                                bg-white
                                                block
                                            " />
                                        )}
                                    </span>

                                    <span className={
                                        resultadoSeleccionado === resultado.valor
                                            ? "text-[#03152E] font-semibold"
                                            : "text-gray-700"
                                    }>
                                        {resultado.etiqueta}
                                    </span>
                                </button>
                            ))}
                        </div>

                        {errores["resultado"] && (
                            <p className="
                                text-red-500
                                text-xs
                                mt-3
                            ">
                                {errores["resultado"]}
                            </p>
                        )}
                    </div>

                    <div className="
                        pb-10
                        space-y-3
                    ">
                        <div className="
                            flex
                            flex-col
                            md:flex-row
                            gap-4
                        ">
                            <button
                                onClick={guardarYSalir}
                                disabled={saving}
                                className="
                                    flex-1
                                    rounded-2xl
                                    p-5
                                    text-lg
                                    font-semibold
                                    transition
                                    border-2
                                    border-[#03152E]
                                    text-[#03152E]
                                    hover:bg-[#03152E]
                                    hover:text-white
                                    disabled:border-gray-200
                                    disabled:text-gray-400
                                    disabled:cursor-not-allowed
                                "
                            >
                                {
                                    saving
                                        ? "Guardando..."
                                        : "Guardar y salir"
                                }
                            </button>

                            <button
                                onClick={guardarYContinuar}
                                disabled={saving}
                                className="
                                    flex-1
                                    rounded-2xl
                                    p-5
                                    text-lg
                                    font-semibold
                                    transition
                                    bg-[#03152E]
                                    hover:bg-[#052444]
                                    text-white
                                    disabled:bg-gray-200
                                    disabled:text-gray-400
                                    disabled:cursor-not-allowed
                                "
                            >
                                {
                                    saving
                                        ? "Guardando..."
                                        : "Guardar y continuar a trazabilidad →"
                                }
                            </button>
                        </div>

                        <p className="
                            text-center
                            text-gray-400
                            text-sm
                        ">
                            Este registro es preliminar. El cierre formal se realizará en US19.
                        </p>
                    </div>
                </div>
            </main>
        </div>
    );
}