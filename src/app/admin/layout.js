"use client";

import ProtectedRoute from "@/components/auth/ProtectedRoute";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, BookOpen, ShoppingCart, ArrowLeft } from "lucide-react";
import styles from "./admin.module.css";

function AdminLayoutContent({ children }) {
    const pathname = usePathname();

    const navItems = [
        { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
        { label: "Mangas y Tomos", href: "/admin/mangas", icon: BookOpen },
        { label: "Gestión de Pedidos", href: "/admin/pedidos", icon: ShoppingCart },
    ];

    return (
        <div className={styles.adminContainer}>
            {/* Barra de navegación del Admin */}
            <aside className={styles.sidebar}>
                <div className={styles.sidebarHeader}>
                    <h2>⚙️ Panel Admin</h2>
                </div>

                <nav className={styles.navMenu}>
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`${styles.navLink} ${isActive ? styles.navLinkActive : ""}`}
                            >
                                <Icon size={18} />
                                <span>{item.label}</span>
                            </Link>
                        );
                    })}
                </nav>

                <div className={styles.sidebarFooter}>
                    <Link href="/" className={styles.backToStore}>
                        <ArrowLeft size={16} />
                        <span>Volver a la Tienda</span>
                    </Link>
                </div>
            </aside>

            {/* Contenido principal de cada página del admin */}
            <section className={styles.mainContent}>{children}</section>
        </div>
    );
}

export default function AdminLayout({ children }) {
    return (
        <ProtectedRoute requireAdmin={true}>
            <AdminLayoutContent>{children}</AdminLayoutContent>
        </ProtectedRoute>
    );
}
