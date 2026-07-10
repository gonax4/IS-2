import {
    useEffect,
    useState,
} from "react";

import {
    Link,
    useSearchParams,
} from "react-router-dom";

const API_URL =
    import.meta.env.VITE_API_URL ||
    "http://localhost:3000";

const API_BASE =
    API_URL.endsWith("/api")
        ? API_URL
        : `${API_URL}/api`;

export default function TechnicianApplicationVerifyEmailPage() {
    const [searchParams] =
        useSearchParams();

    const [loading, setLoading] =
        useState(true);

    const [message, setMessage] =
        useState("");

    const [error, setError] =
        useState("");

    useEffect(() => {
        const verifyEmail =
            async () => {
                const token =
                    searchParams.get("token");

                if (!token) {
                    setError(
                        "Token de verificación no encontrado."
                    );
                    setLoading(false);
                    return;
                }

                const storageKey =
                    `technician-application-verified-${token}`;

                if (
                    sessionStorage.getItem(storageKey) === "true"
                ) {
                    setMessage(
                        "Correo verificado correctamente. Tu postulación ya puede ser revisada por el operador."
                    );
                    setError("");
                    setLoading(false);
                    return;
                }

                try {
                    setLoading(true);
                    setError("");
                    setMessage("");

                    const response =
                        await fetch(
                            `${API_BASE}/technician-applications/verify-email?token=${token}`
                        );

                    const result =
                        await response.json()
                            .catch(() => null);

                    if (!response.ok) {
                        throw new Error(
                            result?.message ||
                            "No se pudo verificar el correo."
                        );
                    }

                    sessionStorage.setItem(
                        storageKey,
                        "true"
                    );

                    setError("");
                    setMessage(
                        result?.message ||
                        "Correo verificado correctamente. Tu postulación ya puede ser revisada por el operador."
                    );

                } catch (error: any) {
                    if (
                        sessionStorage.getItem(storageKey) === "true"
                    ) {
                        setError("");
                        setMessage(
                            "Correo verificado correctamente. Tu postulación ya puede ser revisada por el operador."
                        );
                        return;
                    }

                    setError(
                        error.message ||
                        "No se pudo verificar el correo."
                    );

                } finally {
                    setLoading(false);
                }
            };

        verifyEmail();
    }, [searchParams]);

    return (
        <div className="
            min-h-screen
            bg-[#F5F7FA]
            flex
            items-center
            justify-center
            p-6
        ">
            <div className="
                bg-white
                border
                rounded-3xl
                shadow-sm
                p-8
                max-w-xl
                w-full
                text-center
                space-y-5
            ">
                <h1 className="
                    text-3xl
                    font-bold
                    text-[#03152E]
                ">
                    Verificación de postulación técnica
                </h1>

                {loading && (
                    <p className="
                        text-gray-600
                        font-semibold
                    ">
                        Verificando correo...
                    </p>
                )}

                {!loading && message && (
                    <div className="
                        bg-green-50
                        border
                        border-green-200
                        text-green-700
                        rounded-2xl
                        p-4
                        font-semibold
                    ">
                        {message}
                    </div>
                )}

                {!loading && error && !message && (
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

                <Link
                    to="/login"
                    className="
                        inline-block
                        bg-[#03152E]
                        text-white
                        font-bold
                        rounded-xl
                        px-6
                        py-3
                    "
                >
                    Volver al login
                </Link>
            </div>
        </div>
    );
}