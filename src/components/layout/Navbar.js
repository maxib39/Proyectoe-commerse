"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { ShoppingBag, User } from "lucide-react";
import styles from "./navbar.module.css";

export default function Navbar() {
    const { user, userData, openUserDrawer } = useAuth();
    const { totalItems, openCartDrawer } = useCart();


    return (
        <header className={styles.navbar}>
            <div className={styles.container}>
                {/* Logo */}
                <Link href="/" className={styles.logo}>
                    <img src="/logo.jpg" alt="Manga Store" width={60} height={60} />
                </Link>

                {/* Acciones (Auth & Carrito) */}
                <div className={styles.actions}>
                    {user ? (
                        <button
                            onClick={openUserDrawer}
                            className={styles.userBtn}
                            aria-label="Abrir menú de usuario"
                            type="button"
                        >
                            <User size={20} />
                        </button>
                    ) : (
                        <Link href="/login" className={styles.loginBtn}>
                            <User size={18} />
                            <span>Ingresar</span>
                        </Link>
                    )}


                    {/* Botón Carrito con Badge */}
                    <button onClick={openCartDrawer} className={styles.cartBtn} aria-label="Abrir carrito">
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
