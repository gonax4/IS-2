import {
    useEffect,
    useState,
} from "react";

import type {
    FormEvent,
} from "react";

import {
    useNavigate,
} from "react-router-dom";

import {
    OperationalCatalogService,
} from "../services/operationalCatalog.service";

import type {
    Category,
    ClosureReason,
    ProblemType,
    SlaConfiguration,
} from "../services/operationalCatalog.service";

type Tab =
    "CATEGORIES" |
    "CLOSURE" |
    "SLA";

export default function OperatorCatalogPage() {
    const navigate =
        useNavigate();

    const [tab, setTab] =
        useState<Tab>("CATEGORIES");

    const [categories, setCategories] =
        useState<Category[]>([]);

    const [problemTypes, setProblemTypes] =
        useState<ProblemType[]>([]);

    const [closureReasons, setClosureReasons] =
        useState<ClosureReason[]>([]);

    const [slaConfigurations, setSlaConfigurations] =
        useState<SlaConfiguration[]>([]);

    const [categoryForm, setCategoryForm] =
        useState({
            id: "",
            name: "",
            description: "",
        });

    const [problemTypeForm, setProblemTypeForm] =
        useState({
            id: "",
            name: "",
            description: "",
            categoryId: "",
        });

    const [closureForm, setClosureForm] =
        useState({
            id: "",
            name: "",
            description: "",
        });

    const [loading, setLoading] =
        useState(true);

    const [saving, setSaving] =
        useState(false);

    const [error, setError] =
        useState("");

    const [successMessage, setSuccessMessage] =
        useState("");

    const loadCatalog =
        async () => {
            try {
                setLoading(true);
                setError("");

                const [
                    categoriesData,
                    problemTypesData,
                    closureReasonsData,
                    slaData,
                ] =
                    await Promise.all([
                        OperationalCatalogService
                            .getCategories(),

                        OperationalCatalogService
                            .getProblemTypes(),

                        OperationalCatalogService
                            .getClosureReasons(),

                        OperationalCatalogService
                            .getSlaConfigurations(),
                    ]);

                setCategories(categoriesData);
                setProblemTypes(problemTypesData);
                setClosureReasons(closureReasonsData);
                setSlaConfigurations(slaData);

            } catch (error: any) {
                setError(
                    error.message ||
                    "No se pudo cargar el catálogo operativo."
                );

            } finally {
                setLoading(false);
            }
        };

    useEffect(() => {
        loadCatalog();
    }, []);

    const resetMessages =
        () => {
            setError("");
            setSuccessMessage("");
        };

    const handleCategorySubmit =
        async (
            event: FormEvent
        ) => {
            event.preventDefault();

            if (!categoryForm.name.trim()) {
                setError("Ingresa el nombre de la categoría.");
                return;
            }

            try {
                setSaving(true);
                resetMessages();

                if (categoryForm.id) {
                    await OperationalCatalogService
                        .updateCategory(
                            categoryForm.id,
                            {
                                name:
                                    categoryForm.name,

                                description:
                                    categoryForm.description,
                            }
                        );

                    setSuccessMessage(
                        "Categoría actualizada correctamente."
                    );

                } else {
                    await OperationalCatalogService
                        .createCategory({
                            name:
                                categoryForm.name,

                            description:
                                categoryForm.description,
                        });

                    setSuccessMessage(
                        "Categoría creada correctamente."
                    );
                }

                setCategoryForm({
                    id: "",
                    name: "",
                    description: "",
                });

                await loadCatalog();

            } catch (error: any) {
                setError(
                    error.message ||
                    "No se pudo guardar la categoría."
                );

            } finally {
                setSaving(false);
            }
        };

    const handleProblemTypeSubmit =
        async (
            event: FormEvent
        ) => {
            event.preventDefault();

            if (!problemTypeForm.name.trim()) {
                setError("Ingresa el nombre del tipo de problema.");
                return;
            }

            if (!problemTypeForm.categoryId) {
                setError("Selecciona una categoría.");
                return;
            }

            try {
                setSaving(true);
                resetMessages();

                if (problemTypeForm.id) {
                    await OperationalCatalogService
                        .updateProblemType(
                            problemTypeForm.id,
                            {
                                name:
                                    problemTypeForm.name,

                                description:
                                    problemTypeForm.description,

                                categoryId:
                                    problemTypeForm.categoryId,
                            }
                        );

                    setSuccessMessage(
                        "Tipo de problema actualizado correctamente."
                    );

                } else {
                    await OperationalCatalogService
                        .createProblemType({
                            name:
                                problemTypeForm.name,

                            description:
                                problemTypeForm.description,

                            categoryId:
                                problemTypeForm.categoryId,
                        });

                    setSuccessMessage(
                        "Tipo de problema creado correctamente."
                    );
                }

                setProblemTypeForm({
                    id: "",
                    name: "",
                    description: "",
                    categoryId: "",
                });

                await loadCatalog();

            } catch (error: any) {
                setError(
                    error.message ||
                    "No se pudo guardar el tipo de problema."
                );

            } finally {
                setSaving(false);
            }
        };

    const handleClosureSubmit =
        async (
            event: FormEvent
        ) => {
            event.preventDefault();

            if (!closureForm.name.trim()) {
                setError("Ingresa el nombre del resultado técnico.");
                return;
            }

            try {
                setSaving(true);
                resetMessages();

                if (closureForm.id) {
                    await OperationalCatalogService
                        .updateClosureReason(
                            closureForm.id,
                            {
                                name:
                                    closureForm.name,

                                description:
                                    closureForm.description,
                            }
                        );

                    setSuccessMessage(
                        "Resultado técnico actualizado correctamente."
                    );

                } else {
                    await OperationalCatalogService
                        .createClosureReason({
                            name:
                                closureForm.name,

                            description:
                                closureForm.description,
                        });

                    setSuccessMessage(
                        "Resultado técnico creado correctamente."
                    );
                }

                setClosureForm({
                    id: "",
                    name: "",
                    description: "",
                });

                await loadCatalog();

            } catch (error: any) {
                setError(
                    error.message ||
                    "No se pudo guardar el resultado técnico."
                );

            } finally {
                setSaving(false);
            }
        };

    const handleUpdateSla =
        async (
            priority: "BAJO" | "MEDIO" | "ALTO",
            responseHours: number
        ) => {
            try {
                setSaving(true);
                resetMessages();

                await OperationalCatalogService
                    .updateSla(
                        priority,
                        responseHours
                    );

                setSuccessMessage(
                    "Tiempo objetivo actualizado correctamente."
                );

                await loadCatalog();

            } catch (error: any) {
                setError(
                    error.message ||
                    "No se pudo actualizar el SLA."
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
                Cargando catálogo operativo...
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
                            US21 - Configuración operativa
                        </p>

                        <h1 className="
                            text-4xl
                            lg:text-5xl
                            font-bold
                            text-[#03152E]
                            mt-2
                        ">
                            Catálogo operativo del sistema
                        </h1>

                        <p className="
                            text-gray-500
                            mt-3
                            text-lg
                            max-w-3xl
                        ">
                            Administra categorías, tipos de problema, resultados técnicos y tiempos objetivo por prioridad.
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
                    flex
                    flex-wrap
                    gap-3
                ">
                    <button
                        onClick={() =>
                            setTab("CATEGORIES")
                        }
                        className={`
                            px-5
                            py-3
                            rounded-xl
                            font-bold
                            ${
                                tab === "CATEGORIES"
                                    ? "bg-[#03152E] text-white"
                                    : "bg-white border text-[#03152E]"
                            }
                        `}
                    >
                        Categorías y problemas
                    </button>

                    <button
                        onClick={() =>
                            setTab("CLOSURE")
                        }
                        className={`
                            px-5
                            py-3
                            rounded-xl
                            font-bold
                            ${
                                tab === "CLOSURE"
                                    ? "bg-[#03152E] text-white"
                                    : "bg-white border text-[#03152E]"
                            }
                        `}
                    >
                        Resultados técnicos
                    </button>

                    <button
                        onClick={() =>
                            setTab("SLA")
                        }
                        className={`
                            px-5
                            py-3
                            rounded-xl
                            font-bold
                            ${
                                tab === "SLA"
                                    ? "bg-[#03152E] text-white"
                                    : "bg-white border text-[#03152E]"
                            }
                        `}
                    >
                        SLA por prioridad
                    </button>
                </div>

                {tab === "CATEGORIES" && (
                    <section className="
                        grid
                        grid-cols-1
                        xl:grid-cols-2
                        gap-8
                    ">
                        <div className="
                            bg-white
                            border
                            rounded-3xl
                            p-6
                            space-y-6
                        ">
                            <h2 className="
                                text-2xl
                                font-bold
                                text-[#03152E]
                            ">
                                Gestión de categorías
                            </h2>

                            <form
                                onSubmit={handleCategorySubmit}
                                className="
                                    space-y-4
                                "
                            >
                                <input
                                    value={categoryForm.name}
                                    onChange={(event) =>
                                        setCategoryForm((prev) => ({
                                            ...prev,
                                            name: event.target.value,
                                        }))
                                    }
                                    placeholder="Nombre de categoría"
                                    className="
                                        w-full
                                        border
                                        rounded-xl
                                        p-3
                                    "
                                />

                                <textarea
                                    value={categoryForm.description}
                                    onChange={(event) =>
                                        setCategoryForm((prev) => ({
                                            ...prev,
                                            description: event.target.value,
                                        }))
                                    }
                                    placeholder="Descripción"
                                    className="
                                        w-full
                                        border
                                        rounded-xl
                                        p-3
                                        min-h-[90px]
                                    "
                                />

                                <div className="
                                    flex
                                    gap-3
                                ">
                                    <button
                                        type="submit"
                                        disabled={saving}
                                        className="
                                            bg-blue-700
                                            text-white
                                            font-bold
                                            rounded-xl
                                            px-5
                                            py-3
                                            disabled:bg-gray-300
                                        "
                                    >
                                        {
                                            categoryForm.id
                                                ? "Actualizar categoría"
                                                : "Crear categoría"
                                        }
                                    </button>

                                    {categoryForm.id && (
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setCategoryForm({
                                                    id: "",
                                                    name: "",
                                                    description: "",
                                                })
                                            }
                                            className="
                                                bg-white
                                                border
                                                font-bold
                                                rounded-xl
                                                px-5
                                                py-3
                                            "
                                        >
                                            Cancelar
                                        </button>
                                    )}
                                </div>
                            </form>

                            <div className="
                                space-y-3
                            ">
                                {categories.map((category) => (
                                    <div
                                        key={category.id}
                                        className="
                                            border
                                            rounded-2xl
                                            p-4
                                            flex
                                            justify-between
                                            gap-4
                                            items-start
                                        "
                                    >
                                        <div>
                                            <p className="
                                                font-bold
                                                text-[#03152E]
                                            ">
                                                {category.name}
                                            </p>

                                            <p className="
                                                text-sm
                                                text-gray-500
                                            ">
                                                {category.description || "Sin descripción"}
                                            </p>

                                            <span className={`
                                                inline-block
                                                mt-2
                                                rounded-full
                                                px-3
                                                py-1
                                                text-xs
                                                font-bold
                                                ${
                                                    category.active
                                                        ? "bg-green-100 text-green-700"
                                                        : "bg-gray-100 text-gray-500"
                                                }
                                            `}>
                                                {
                                                    category.active
                                                        ? "Activa"
                                                        : "Inactiva"
                                                }
                                            </span>
                                        </div>

                                        <div className="
                                            flex
                                            flex-col
                                            gap-2
                                        ">
                                            <button
                                                onClick={() =>
                                                    setCategoryForm({
                                                        id: category.id,
                                                        name: category.name,
                                                        description: category.description || "",
                                                    })
                                                }
                                                className="
                                                    text-blue-700
                                                    font-bold
                                                "
                                            >
                                                Editar
                                            </button>

                                            <button
                                                onClick={async () => {
                                                    await OperationalCatalogService
                                                        .toggleCategory(
                                                            category.id,
                                                            !category.active
                                                        );

                                                    await loadCatalog();
                                                }}
                                                className="
                                                    text-red-700
                                                    font-bold
                                                "
                                            >
                                                {
                                                    category.active
                                                        ? "Desactivar"
                                                        : "Activar"
                                                }
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="
                            bg-white
                            border
                            rounded-3xl
                            p-6
                            space-y-6
                        ">
                            <h2 className="
                                text-2xl
                                font-bold
                                text-[#03152E]
                            ">
                                Gestión de tipos de problema
                            </h2>

                            <form
                                onSubmit={handleProblemTypeSubmit}
                                className="
                                    space-y-4
                                "
                            >
                                <select
                                    value={problemTypeForm.categoryId}
                                    onChange={(event) =>
                                        setProblemTypeForm((prev) => ({
                                            ...prev,
                                            categoryId: event.target.value,
                                        }))
                                    }
                                    className="
                                        w-full
                                        border
                                        rounded-xl
                                        p-3
                                        bg-white
                                    "
                                >
                                    <option value="">
                                        Selecciona una categoría
                                    </option>

                                    {categories
                                        .filter((category) => category.active)
                                        .map((category) => (
                                            <option
                                                key={category.id}
                                                value={category.id}
                                            >
                                                {category.name}
                                            </option>
                                        ))}
                                </select>

                                <input
                                    value={problemTypeForm.name}
                                    onChange={(event) =>
                                        setProblemTypeForm((prev) => ({
                                            ...prev,
                                            name: event.target.value,
                                        }))
                                    }
                                    placeholder="Nombre del tipo de problema"
                                    className="
                                        w-full
                                        border
                                        rounded-xl
                                        p-3
                                    "
                                />

                                <textarea
                                    value={problemTypeForm.description}
                                    onChange={(event) =>
                                        setProblemTypeForm((prev) => ({
                                            ...prev,
                                            description: event.target.value,
                                        }))
                                    }
                                    placeholder="Descripción"
                                    className="
                                        w-full
                                        border
                                        rounded-xl
                                        p-3
                                        min-h-[90px]
                                    "
                                />

                                <div className="
                                    flex
                                    gap-3
                                ">
                                    <button
                                        type="submit"
                                        disabled={saving}
                                        className="
                                            bg-blue-700
                                            text-white
                                            font-bold
                                            rounded-xl
                                            px-5
                                            py-3
                                            disabled:bg-gray-300
                                        "
                                    >
                                        {
                                            problemTypeForm.id
                                                ? "Actualizar tipo"
                                                : "Crear tipo"
                                        }
                                    </button>

                                    {problemTypeForm.id && (
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setProblemTypeForm({
                                                    id: "",
                                                    name: "",
                                                    description: "",
                                                    categoryId: "",
                                                })
                                            }
                                            className="
                                                bg-white
                                                border
                                                font-bold
                                                rounded-xl
                                                px-5
                                                py-3
                                            "
                                        >
                                            Cancelar
                                        </button>
                                    )}
                                </div>
                            </form>

                            <div className="
                                space-y-3
                            ">
                                {problemTypes.map((problemType) => (
                                    <div
                                        key={problemType.id}
                                        className="
                                            border
                                            rounded-2xl
                                            p-4
                                            flex
                                            justify-between
                                            gap-4
                                            items-start
                                        "
                                    >
                                        <div>
                                            <p className="
                                                font-bold
                                                text-[#03152E]
                                            ">
                                                {problemType.name}
                                            </p>

                                            <p className="
                                                text-sm
                                                text-gray-500
                                            ">
                                                Categoría: {problemType.category?.name || "No definida"}
                                            </p>

                                            <p className="
                                                text-sm
                                                text-gray-500
                                            ">
                                                {problemType.description || "Sin descripción"}
                                            </p>

                                            <span className={`
                                                inline-block
                                                mt-2
                                                rounded-full
                                                px-3
                                                py-1
                                                text-xs
                                                font-bold
                                                ${
                                                    problemType.active
                                                        ? "bg-green-100 text-green-700"
                                                        : "bg-gray-100 text-gray-500"
                                                }
                                            `}>
                                                {
                                                    problemType.active
                                                        ? "Activo"
                                                        : "Inactivo"
                                                }
                                            </span>
                                        </div>

                                        <div className="
                                            flex
                                            flex-col
                                            gap-2
                                        ">
                                            <button
                                                onClick={() =>
                                                    setProblemTypeForm({
                                                        id: problemType.id,
                                                        name: problemType.name,
                                                        description: problemType.description || "",
                                                        categoryId: problemType.categoryId,
                                                    })
                                                }
                                                className="
                                                    text-blue-700
                                                    font-bold
                                                "
                                            >
                                                Editar
                                            </button>

                                            <button
                                                onClick={async () => {
                                                    await OperationalCatalogService
                                                        .toggleProblemType(
                                                            problemType.id,
                                                            !problemType.active
                                                        );

                                                    await loadCatalog();
                                                }}
                                                className="
                                                    text-red-700
                                                    font-bold
                                                "
                                            >
                                                {
                                                    problemType.active
                                                        ? "Desactivar"
                                                        : "Activar"
                                                }
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>
                )}

                {tab === "CLOSURE" && (
                    <section className="
                        grid
                        grid-cols-1
                        xl:grid-cols-[420px_1fr]
                        gap-8
                    ">
                        <div className="
                            bg-white
                            border
                            rounded-3xl
                            p-6
                            space-y-6
                        ">
                            <h2 className="
                                text-2xl
                                font-bold
                                text-[#03152E]
                            ">
                                Resultado técnico / motivo de cierre
                            </h2>

                            <form
                                onSubmit={handleClosureSubmit}
                                className="
                                    space-y-4
                                "
                            >
                                <input
                                    value={closureForm.name}
                                    onChange={(event) =>
                                        setClosureForm((prev) => ({
                                            ...prev,
                                            name: event.target.value,
                                        }))
                                    }
                                    placeholder="Ej. Resuelto en sitio"
                                    className="
                                        w-full
                                        border
                                        rounded-xl
                                        p-3
                                    "
                                />

                                <textarea
                                    value={closureForm.description}
                                    onChange={(event) =>
                                        setClosureForm((prev) => ({
                                            ...prev,
                                            description: event.target.value,
                                        }))
                                    }
                                    placeholder="Descripción del resultado técnico"
                                    className="
                                        w-full
                                        border
                                        rounded-xl
                                        p-3
                                        min-h-[110px]
                                    "
                                />

                                <div className="
                                    flex
                                    gap-3
                                ">
                                    <button
                                        type="submit"
                                        disabled={saving}
                                        className="
                                            bg-blue-700
                                            text-white
                                            font-bold
                                            rounded-xl
                                            px-5
                                            py-3
                                            disabled:bg-gray-300
                                        "
                                    >
                                        {
                                            closureForm.id
                                                ? "Actualizar resultado"
                                                : "Crear resultado"
                                        }
                                    </button>

                                    {closureForm.id && (
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setClosureForm({
                                                    id: "",
                                                    name: "",
                                                    description: "",
                                                })
                                            }
                                            className="
                                                bg-white
                                                border
                                                font-bold
                                                rounded-xl
                                                px-5
                                                py-3
                                            "
                                        >
                                            Cancelar
                                        </button>
                                    )}
                                </div>
                            </form>
                        </div>

                        <div className="
                            bg-white
                            border
                            rounded-3xl
                            p-6
                            space-y-3
                        ">
                            <h2 className="
                                text-2xl
                                font-bold
                                text-[#03152E]
                            ">
                                Catálogo de resultados técnicos
                            </h2>

                            {closureReasons.map((reason) => (
                                <div
                                    key={reason.id}
                                    className="
                                        border
                                        rounded-2xl
                                        p-4
                                        flex
                                        justify-between
                                        gap-4
                                        items-start
                                    "
                                >
                                    <div>
                                        <p className="
                                            font-bold
                                            text-[#03152E]
                                        ">
                                            {reason.name}
                                        </p>

                                        <p className="
                                            text-sm
                                            text-gray-500
                                        ">
                                            {reason.description || "Sin descripción"}
                                        </p>

                                        <span className={`
                                            inline-block
                                            mt-2
                                            rounded-full
                                            px-3
                                            py-1
                                            text-xs
                                            font-bold
                                            ${
                                                reason.active
                                                    ? "bg-green-100 text-green-700"
                                                    : "bg-gray-100 text-gray-500"
                                            }
                                        `}>
                                            {
                                                reason.active
                                                    ? "Activo"
                                                    : "Inactivo"
                                            }
                                        </span>
                                    </div>

                                    <div className="
                                        flex
                                        flex-col
                                        gap-2
                                    ">
                                        <button
                                            onClick={() =>
                                                setClosureForm({
                                                    id: reason.id,
                                                    name: reason.name,
                                                    description: reason.description || "",
                                                })
                                            }
                                            className="
                                                text-blue-700
                                                font-bold
                                            "
                                        >
                                            Editar
                                        </button>

                                        <button
                                            onClick={async () => {
                                                await OperationalCatalogService
                                                    .toggleClosureReason(
                                                        reason.id,
                                                        !reason.active
                                                    );

                                                await loadCatalog();
                                            }}
                                            className="
                                                text-red-700
                                                font-bold
                                            "
                                        >
                                            {
                                                reason.active
                                                    ? "Desactivar"
                                                    : "Activar"
                                            }
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {tab === "SLA" && (
                        <SlaSection
                            slaConfigurations={slaConfigurations}
                            saving={saving}
                            onSave={handleUpdateSla}
                        />
                    )}
            </div>
        </div>
    );
}
function SlaSection({
    slaConfigurations,
    saving,
    onSave,
}: {
    slaConfigurations: SlaConfiguration[];
    saving: boolean;
    onSave: (
        priority: "BAJO" | "MEDIO" | "ALTO",
        responseHours: number
    ) => Promise<void>;
}) {
    const [values, setValues] =
        useState<Record<"BAJO" | "MEDIO" | "ALTO", number>>({
            BAJO: 72,
            MEDIO: 48,
            ALTO: 24,
        });

    useEffect(() => {
        setValues({
            BAJO:
                slaConfigurations.find((item) => item.priority === "BAJO")
                    ?.responseHours || 72,

            MEDIO:
                slaConfigurations.find((item) => item.priority === "MEDIO")
                    ?.responseHours || 48,

            ALTO:
                slaConfigurations.find((item) => item.priority === "ALTO")
                    ?.responseHours || 24,
        });
    }, [slaConfigurations]);

    return (
        <section className="
            bg-white
            border
            rounded-3xl
            p-6
            space-y-6
        ">
            <div>
                <h2 className="
                    text-2xl
                    font-bold
                    text-[#03152E]
                ">
                    Tiempos objetivo por prioridad
                </h2>

                <p className="
                    text-gray-500
                    mt-2
                ">
                    Define las horas máximas esperadas para atender reportes según su prioridad.
                </p>
            </div>

            <div className="
                grid
                grid-cols-1
                md:grid-cols-3
                gap-5
            ">
                {(["BAJO", "MEDIO", "ALTO"] as const)
                    .map((priority) => (
                        <div
                            key={priority}
                            className="
                                border
                                rounded-2xl
                                p-5
                                space-y-4
                            "
                        >
                            <h3 className="
                                text-xl
                                font-bold
                                text-[#03152E]
                            ">
                                Prioridad {priority}
                            </h3>

                            <label className="
                                block
                                text-sm
                                font-bold
                                text-gray-600
                            ">
                                Horas objetivo
                            </label>

                            <input
                                type="number"
                                min={1}
                                value={values[priority]}
                                onChange={(event) =>
                                    setValues((prev) => ({
                                        ...prev,
                                        [priority]:
                                            Number(event.target.value),
                                    }))
                                }
                                className="
                                    w-full
                                    border
                                    rounded-xl
                                    p-3
                                "
                            />

                            <button
                                onClick={() =>
                                    onSave(
                                        priority,
                                        values[priority]
                                    )
                                }
                                disabled={saving}
                                className="
                                    w-full
                                    bg-blue-700
                                    text-white
                                    font-bold
                                    rounded-xl
                                    py-3
                                    disabled:bg-gray-300
                                "
                            >
                                Guardar SLA
                            </button>
                        </div>
                    ))}
            </div>
        </section>
    );
}