"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import toast from "react-hot-toast";
import styles from "./login.module.css";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const { loginWithEmail, loginWithGoogle } = useAuth();
    const router = useRouter();

    const handleEmailLogin = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await loginWithEmail(email, password);
            toast.success("¡Bienvenido de nuevo!");
            router.push("/");
        } catch (error) {
            toast.error("Credenciales inválidas o error de conexión.");
            console.error(error);
        } finally {
            setSubmitting(false);
        }
    };

    const handleGoogleLogin = async () => {
        try {
            await loginWithGoogle();
            toast.success("Sesión iniciada con Google");
            router.push("/");
        } catch (error) {
            toast.error("No se pudo iniciar sesión con Google");
            console.error(error);
        }
    };

    return (
        <main className={styles.container}>
            <div className={styles.card}>
                <h1>Iniciar Sesión</h1>
                <p>Accedé a tu cuenta para continuar con tus compras</p>

                <form onSubmit={handleEmailLogin} className={styles.form}>
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
                        placeholder="••••••••"
                        required
                    />

                    <button type="submit" disabled={submitting}>
                        {submitting ? "Ingresando..." : "Ingresar"}
                    </button>
                </form>

                <div className={styles.divider}>o</div>

                <button onClick={handleGoogleLogin} className={styles.googleBtn}>
                    Continuar con Google
                </button>

                <p className={styles.footerText}>
                    ¿No tenés cuenta? <Link href="/registro">Registrate acá</Link>
                </p>
            </div>
        </main>
    );
}
