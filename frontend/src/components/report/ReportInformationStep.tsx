import {
    useEffect,
    useMemo,
    useState,
} from "react";

import type {
    Dispatch,
    SetStateAction,
} from "react";

import type {
    ReportFormValues,
} from "../../types/report.types";

import {
    OperationalCatalogService,
} from "../../services/operationalCatalog.service";

import type {
    Category,
    ProblemType,
} from "../../services/operationalCatalog.service";

type Props = {
    formData: ReportFormValues;

    setFormData:
    Dispatch<
        SetStateAction<
            ReportFormValues
        >
    >;

    errors:
    Partial<
        Record<
            keyof ReportFormValues,
            string
        >
    >;
};

export default function ReportInformationStep({
    formData,
    setFormData,
    errors,
}: Props) {
    const [categories, setCategories] =
        useState<Category[]>([]);

    const [problemTypes, setProblemTypes] =
        useState<ProblemType[]>([]);

    const [loadingCatalog, setLoadingCatalog] =
        useState(true);

    const [catalogError, setCatalogError] =
        useState("");

    useEffect(() => {
        const loadCatalog =
            async () => {
                try {
                    setLoadingCatalog(true);
                    setCatalogError("");

                    const [
                        categoriesData,
                        problemTypesData,
                    ] =
                        await Promise.all([
                            OperationalCatalogService
                                .getActiveCategories(),

                            OperationalCatalogService
                                .getActiveProblemTypes(),
                        ]);

                    setCategories(categoriesData);
                    setProblemTypes(problemTypesData);

                } catch (error: any) {
                    setCatalogError(
                        error.message ||
                        "No se pudo cargar el catálogo operativo."
                    );

                } finally {
                    setLoadingCatalog(false);
                }
            };

        loadCatalog();
    }, []);

    const filteredProblemTypes =
        useMemo(() => {
            if (!formData.categoryId) {
                return [];
            }

            return problemTypes.filter(
                (problemType) =>
                    problemType.categoryId === formData.categoryId
            );
        }, [
            problemTypes,
            formData.categoryId,
        ]);

    return (
        <div>
            {catalogError && (
                <div className="
                    mb-6
                    bg-red-50
                    border
                    border-red-200
                    text-red-700
                    rounded-2xl
                    p-4
                    font-semibold
                ">
                    {catalogError}
                </div>
            )}

            <div className="
                grid
                md:grid-cols-2
                gap-6
            ">
                <div>
                    <label className="
                        block
                        text-lg
                        font-medium
                        mb-3
                    ">
                        Categoría *
                    </label>

                    <select
                        value={formData.categoryId || ""}
                        disabled={loadingCatalog}
                        onChange={(event) => {
                            const categoryId =
                                event.target.value;

                            const selectedCategory =
                                categories.find(
                                    (category) =>
                                        category.id === categoryId
                                );

                            setFormData((prev) => ({
                                ...prev,

                                categoryId,

                                category:
                                    selectedCategory?.name || "",

                                problemTypeId: "",

                                problemType: "",
                            }));
                        }}
                        className="
                            w-full
                            border
                            rounded-2xl
                            p-4
                            text-lg
                            bg-white
                        "
                    >
                        <option value="">
                            {
                                loadingCatalog
                                    ? "Cargando categorías..."
                                    : "Selecciona categoría"
                            }
                        </option>

                        {categories.map((category) => (
                            <option
                                key={category.id}
                                value={category.id}
                            >
                                {category.name}
                            </option>
                        ))}
                    </select>

                    {errors.category && (
                        <p className="
                            text-red-500
                            mt-2
                        ">
                            {errors.category}
                        </p>
                    )}
                </div>

                <div>
                    <label className="
                        block
                        text-lg
                        font-medium
                        mb-3
                    ">
                        Tipo de problema *
                    </label>

                    <select
                        value={formData.problemTypeId || ""}
                        disabled={
                            loadingCatalog ||
                            !formData.categoryId
                        }
                        onChange={(event) => {
                            const problemTypeId =
                                event.target.value;

                            const selectedProblemType =
                                problemTypes.find(
                                    (problemType) =>
                                        problemType.id === problemTypeId
                                );

                            setFormData((prev) => ({
                                ...prev,

                                problemTypeId,

                                problemType:
                                    selectedProblemType?.name || "",
                            }));
                        }}
                        className="
                            w-full
                            border
                            rounded-2xl
                            p-4
                            text-lg
                            bg-white
                        "
                    >
                        <option value="">
                            {
                                formData.categoryId
                                    ? "Selecciona un tipo de problema"
                                    : "Primero selecciona una categoría"
                            }
                        </option>

                        {filteredProblemTypes.map((problemType) => (
                            <option
                                key={problemType.id}
                                value={problemType.id}
                            >
                                {problemType.name}
                            </option>
                        ))}
                    </select>

                    {errors.problemType && (
                        <p className="
                            text-red-500
                            mt-2
                        ">
                            {errors.problemType}
                        </p>
                    )}
                </div>
            </div>

            <div className="mt-8">
                <label className="
                    block
                    text-lg
                    font-medium
                    mb-3
                ">
                    Título del reporte *
                </label>

                <input
                    type="text"
                    value={formData.title}
                    onChange={(event) =>
                        setFormData((prev) => ({
                            ...prev,
                            title: event.target.value,
                        }))
                    }
                    placeholder="Ej. Personas bebiendo frente al parque"
                    className="
                        w-full
                        border
                        rounded-2xl
                        p-4
                        text-lg
                    "
                />

                {errors.title && (
                    <p className="
                        text-red-500
                        mt-2
                    ">
                        {errors.title}
                    </p>
                )}
            </div>

            <div className="mt-8">
                <label className="
                    block
                    text-lg
                    font-medium
                    mb-3
                ">
                    Descripción del problema *
                </label>

                <textarea
                    rows={8}
                    value={formData.description}
                    onChange={(event) =>
                        setFormData((prev) => ({
                            ...prev,
                            description: event.target.value,
                        }))
                    }
                    placeholder="Describe lo que está ocurriendo..."
                    className="
                        w-full
                        border
                        rounded-2xl
                        p-4
                        text-lg
                        resize-none
                    "
                />

                {errors.description && (
                    <p className="
                        text-red-500
                        mt-2
                    ">
                        {errors.description}
                    </p>
                )}
            </div>

            <div className="
                mt-8
                border
                rounded-2xl
                p-6
                flex
                items-center
                justify-between
            ">
                <div>
                    <h3 className="
                        text-xl
                        font-medium
                    ">
                        ¿Deseas enviar el reporte
                        de forma anónima?
                    </h3>

                    <p className="
                        text-gray-500
                        mt-2
                    ">
                        Tu identidad no será visible
                        para otros usuarios.
                    </p>
                </div>

                <button
                    type="button"
                    onClick={() =>
                        setFormData((prev) => ({
                            ...prev,
                            isAnonymous:
                                !prev.isAnonymous,
                        }))
                    }
                    className={`
                        w-16
                        h-9
                        rounded-full
                        flex
                        items-center
                        px-1
                        transition
                        ${
                            formData.isAnonymous
                                ? "bg-blue-600"
                                : "bg-gray-300"
                        }
                    `}
                >
                    <div className={`
                        w-7
                        h-7
                        rounded-full
                        bg-white
                        transition
                        ${
                            formData.isAnonymous
                                ? "ml-auto"
                                : ""
                        }
                    `} />
                </button>
            </div>
        </div>
    );
}