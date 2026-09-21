"use client";

import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { formatPrice } from "@/lib/utils";
import { DollarSign, PackageCheck, BookCopy, Clock } from "lucide-react";
import styles from "./admin.module.css";

export default function AdminDashboardPage() {
    const [metrics, setMetrics] = useState({
        totalRevenue: 0,
        totalOrders: 0,
        pendingOrders: 0,
        totalMangas: 0,
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchMetrics() {
            try {
                // 1. Obtener todos los pedidos
                const ordersSnap = await getDocs(collection(db, "orders"));
                let revenue = 0;
                let pending = 0;

                ordersSnap.docs.forEach((doc) => {
                    const data = doc.data();
                    revenue += data.total || 0;
                    if (data.status === "confirmado") pending++;
                });

                // 2. Obtener mangas
                const mangasSnap = await getDocs(collection(db, "mangas"));

                setMetrics({
                    totalRevenue: revenue,
                    totalOrders: ordersSnap.size,
                    pendingOrders: pending,
                    totalMangas: mangasSnap.size,
                });
            } catch (error) {
                console.error("Error al cargar métricas:", error);
            } finally {
                setLoading(false);
            }
        }

        fetchMetrics();
    }, []);

    if (loading) {
        return <div className={styles.loading}>Cargando métricas...</div>;
    }

    return (
        <div>
            <h1 className={styles.pageTitle}>Dashboard General</h1>
            <p className={styles.pageSubtitle}>Resumen de actividad y rendimiento de MangaStore</p>

            {/* Tarjetas de Métricas */}
            <div className={styles.statsGrid}>
                <div className={styles.statCard}>
                    <div className={styles.statIcon} style={{ background: "#dcfce7", color: "#16a34a" }}>
                        <DollarSign size={24} />
                    </div>
                    <div>
                        <span className={styles.statLabel}>Ventas Totales</span>
                        <h3 className={styles.statValue}>{formatPrice(metrics.totalRevenue)}</h3>
                    </div>
                </div>

                <div className={styles.statCard}>
                    <div className={styles.statIcon} style={{ background: "#dbeafe", color: "#2563eb" }}>
                        <PackageCheck size={24} />
                    </div>
                    <div>
                        <span className={styles.statLabel}>Total Pedidos</span>
                        <h3 className={styles.statValue}>{metrics.totalOrders}</h3>
                    </div>
                </div>

                <div className={styles.statCard}>
                    <div className={styles.statIcon} style={{ background: "#fef3c7", color: "#d97706" }}>
                        <Clock size={24} />
                    </div>
                    <div>
                        <span className={styles.statLabel}>Pedidos por Enviar</span>
                        <h3 className={styles.statValue}>{metrics.pendingOrders}</h3>
                    </div>
                </div>

                <div className={styles.statCard}>
                    <div className={styles.statIcon} style={{ background: "#f3e8ff", color: "#9333ea" }}>
                        <BookCopy size={24} />
                    </div>
                    <div>
                        <span className={styles.statLabel}>Títulos en Catálogo</span>
                        <h3 className={styles.statValue}>{metrics.totalMangas}</h3>
                    </div>
                </div>
            </div>
        </div>
    );
}
