"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import toast from "react-hot-toast";
import styles from "./registro.module.css";

export default function RegisterPage() {
    const [displayName, setDisplayName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const { registerWithEmail, loginWithGoogle } = useAuth();
    const router = useRouter();

    const handleRegister = async (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            toast.error("Las contraseñas no coinciden");
            return;
        }
        if (password.length < 6) {
            toast.error("La contraseña debe tener al menos 6 caracteres");
            return;
        }

        setSubmitting(true);
        try {
            await registerWithEmail(email, password, displayName);
            toast.success("¡Cuenta creada exitosamente!");
            router.push("/");
        } catch (error) {
            toast.error("Error al registrar cuenta: " + error.message);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <main className={styles.container}>
            <div className={styles.card}>
                <h1>Crear Cuenta</h1>
                <p>Unite a MangaStore para guardar tus mangas favoritos</p>

                <form onSubmit={handleRegister} className={styles.form}>
                    <label>Nombre Completo</label>
                    <input
                        type="text"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        placeholder="Tu nombre"
                        required
                    />

                    <label>Email</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="tu@email.com"
                        required
                    />

                    <label>Contraseña</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Mínimo 6 caracteres"
                        required
                    />

                    <label>Confirmar Contraseña</label>
                    <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Repetí tu contraseña"
                        required
                    />

                    <button type="submit" disabled={submitting}>
                        {submitting ? "Creando cuenta..." : "Registrarme"}
                    </button>
                </form>

                <div className={styles.divider}>o</div>

                <button onClick={loginWithGoogle} className={styles.googleBtn}>
                    Registrarme con Google
                </button>

                <p className={styles.footerText}>
                    ¿Ya tenés cuenta? <Link href="/login">Iniciá sesión</Link>
                </p>
            </div>
        </main>
    );
}
