"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { X, User, LogOut, ShoppingBag, ShieldCheck } from "lucide-react";
import styles from "./userDrawer.module.css";

export default function UserDrawer() {
    const {
        userData,
        isUserDrawerOpen, // Usamos el nombre específico para evitar colisión con el carrito
        closeUserDrawer,
        logout,
        user,
        loading
    } = useAuth();

    // Si el drawer no está abierto, no renderizamos nada
    if (!isUserDrawerOpen) return null;

    const handleClose = () => {
        closeUserDrawer();
    };

    const handleLogout = async () => {
        await logout();
        closeUserDrawer();
    };

    return (
        <div className={styles.overlay} onClick={handleClose}>
            {/* Detenemos la propagación del clic dentro del panel */}
            <div className={styles.drawer} onClick={(e) => e.stopPropagation()}>

                {/* Encabezado */}
                <div className={styles.header}>
                    <div className={styles.headerTitle}>
                        <User size={20} />
                        <span className={styles.headerText}>Mi Perfil</span>
                    </div>
                    <button onClick={handleClose} className={styles.closeBtn} title="Cerrar">
                        <X size={20} />
                    </button>
                </div>

                {/* Contenido del Menú */}
                <div className={styles.userMenu}>
                    <div className={styles.userInfo}>
                        <span className={styles.greeting}>Hola,</span>
                        <span className={styles.userName}>
                            {loading
                                ? "Cargando..."
                                : userData?.displayName || user?.email?.split("@")[0] || "Usuario"}
                        </span>
                    </div>

                    <nav className={styles.navLinks}>
                        <Link href="/mis-pedidos" className={styles.link} onClick={handleClose}>
                            <ShoppingBag size={18} />
                            <span>Mis Pedidos</span>
                        </Link>

                        {/* Validamos que userData ya haya cargado antes de comprobar el rol */}
                        {!loading && userData?.role === "admin" && (
                            <Link href="/admin" className={styles.adminLink} onClick={handleClose}>
                                <ShieldCheck size={18} />
                                <span>Panel Admin</span>
                            </Link>
                        )}
                    </nav>

                    <button onClick={handleLogout} className={styles.logoutBtn} title="Cerrar sesión">
                        <LogOut size={18} />
                        <span>Cerrar sesión</span>
                    </button>
                </div>

            </div>
        </div>
    );
}