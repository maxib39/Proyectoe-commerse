"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { ShoppingBag, User, LogOut } from "lucide-react";
import styles from "./navbar.module.css";

export default function Navbar() {
    const { user, userData, logout } = useAuth();
    const { totalItems, openDrawer } = useCart();

    return (
        <header className={styles.navbar}>
            <div className={styles.container}>
                {/* Logo */}
                <Link href="/" className={styles.logo}>
                    📚 <span>MangaStore</span>
                </Link>

                {/* Links de Navegación */}
                <nav className={styles.navLinks}>
                    {userData?.role === "admin" && (
                        <Link href="/admin" className={styles.adminLink}>
                            Panel Admin
                        </Link>
                    )}
                </nav>

                {/* Acciones (Auth & Carrito) */}
                <div className={styles.actions}>
                    {user ? (
                        <div className={styles.userMenu}>
                            <Link href="/mis-pedidos" className={styles.link}>
                                Mis Pedidos
                            </Link>
                            <span className={styles.userName}>
                                Hola, {userData?.displayName || user.email?.split("@")[0]}
                            </span>
                            <button onClick={logout} className={styles.logoutBtn} title="Cerrar sesión">
                                <LogOut size={18} />
                            </button>
                        </div>
                    ) : (
                        <Link href="/login" className={styles.loginBtn}>
                            <User size={18} />
                            <span>Ingresar</span>
                        </Link>
                    )}


                    {/* Botón Carrito con Badge */}
                    <button onClick={openDrawer} className={styles.cartBtn} aria-label="Abrir carrito">
                        <ShoppingBag size={22} />
                        {totalItems > 0 && (
                            <span className={styles.badge}>{totalItems}</span>
                        )}
                    </button>
                </div>
            </div>
        </header>
    );
}
