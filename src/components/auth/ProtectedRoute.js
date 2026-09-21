"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function ProtectedRoute({ children, requireAdmin = false }) {
    const { user, userData, loading, isAdmin } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading) {
            if (!user) {
                // Redirigir a login si no hay sesión
                router.push("/login");
            } else if (requireAdmin && !isAdmin) {
                // Redirigir a la home si la ruta pide admin y el usuario no lo es
                router.push("/");
            }
        }
    }, [user, userData, loading, isAdmin, requireAdmin, router]);

    if (loading) {
        return <div style={{ padding: "2rem", textAlign: "center" }}>Cargando...</div>;
    }

    if (!user || (requireAdmin && !isAdmin)) {
        return null; // Oculta el contenido mientras redirige
    }

    return children;
}
