"use client";

import { useEffect, useState } from "react";
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { formatPrice } from "@/lib/utils";
import Link from "next/link";
import { Package, ChevronDown, ChevronUp, Clock, CheckCircle2, Truck, ShoppingBag } from "lucide-react";
import styles from "./pedidos.module.css";

function MisPedidosContent() {
    const { user } = useAuth();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedOrders, setExpandedOrders] = useState({});

    useEffect(() => {
        async function fetchUserOrders() {
            if (!user) return;

            try {
                // Consultar pedidos del usuario logueado ordenados por fecha
                const ordersRef = collection(db, "orders");
                // Si no creaste un índice compuesto en Firestore todavía, filtramos por userId y ordenamos en cliente:
                const q = query(ordersRef, where("userId", "==", user.uid));
                const querySnapshot = await getDocs(q);

                const ordersList = querySnapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                }));

                // Ordenar del más reciente al más antiguo
                ordersList.sort((a, b) => {
                    const dateA = a.createdAt?.seconds ? a.createdAt.seconds : new Date(a.createdAt || 0).getTime() / 1000;
                    const dateB = b.createdAt?.seconds ? b.createdAt.seconds : new Date(b.createdAt || 0).getTime() / 1000;
                    return dateB - dateA;
                });

                setOrders(ordersList);
            } catch (error) {
                console.error("Error al cargar pedidos:", error);
            } finally {
                setLoading(false);
            }
        }

        fetchUserOrders();
    }, [user]);

    // Alternar desplegable de detalle del pedido
    const toggleExpand = (orderId) => {
        setExpandedOrders((prev) => ({
            ...prev,
            [orderId]: !prev[orderId],
        }));
    };

    // Helper para formatear la fecha
    const formatDate = (timestamp) => {
        if (!timestamp) return "Fecha no disponible";
        const date = timestamp.seconds ? new Date(timestamp.seconds * 1000) : new Date(timestamp);
        return new Intl.DateTimeFormat("es-AR", {
            day: "2-digit",
            month: "long",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        }).format(date);
    };

    // Helper para mostrar el badge de estado con su color
    const getStatusBadge = (status) => {
        switch (status?.toLowerCase()) {
            case "entregado":
                return (
                    <span className={`${styles.badge} ${styles.badgeDelivered}`}>
                        <CheckCircle2 size={14} /> Entregado
                    </span>
                );
            case "enviado":
                return (
                    <span className={`${styles.badge} ${styles.badgeShipped}`}>
                        <Truck size={14} /> En camino
                    </span>
                );
            default:
                return (
                    <span className={`${styles.badge} ${styles.badgeConfirmed}`}>
                        <Clock size={14} /> Confirmado
                    </span>
                );
        }
    };

    if (loading) {
        return <div className={styles.loading}>Cargando tus pedidos...</div>;
    }

    return (
        <main className={styles.container}>
            <Link href="/catalogo" className={styles.backLink}>
                ← Explorar el catálogo
            </Link>
            <header className={styles.header}>
                <h1>Mis Pedidos</h1>
                <p>Revisá el estado de tus compras y el detalle de cada tomo solicitado</p>
            </header>

            {orders.length === 0 ? (
                <div className={styles.emptyState}>
                    <Package size={56} className={styles.emptyIcon} />
                    <h2>Aún no realizaste ningún pedido</h2>
                    <p>Tus compras confirmadas aparecerán listadas acá.</p>
                    <Link href="/catalogo" className={styles.catalogBtn}>
                        <ShoppingBag size={18} />
                        <span>Explorar Catálogo</span>
                    </Link>
                </div>
            ) : (
                <div className={styles.ordersList}>
                    {orders.map((order) => {
                        const isExpanded = expandedOrders[order.id];

                        return (
                            <article key={order.id} className={styles.orderCard}>
                                {/* Cabecera de la tarjeta */}
                                <div className={styles.cardHeader}>
                                    <div className={styles.headerMain}>
                                        <span className={styles.orderId}>Pedido #{order.id}</span>
                                        <span className={styles.orderDate}>{formatDate(order.createdAt)}</span>
                                    </div>
                                    <div className={styles.headerStatus}>
                                        {getStatusBadge(order.status)}
                                        <span className={styles.totalPrice}>{formatPrice(order.total)}</span>
                                    </div>
                                </div>

                                {/* Botón para expandir/colapsar */}
                                <button
                                    onClick={() => toggleExpand(order.id)}
                                    className={styles.expandBtn}
                                >
                                    <span>{isExpanded ? "Ocultar detalle" : `Ver detalle (${order.items?.length || 0} tomos)`}</span>
                                    {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                                </button>

                                {/* Sección desplegable con los tomos y envío */}
                                {isExpanded && (
                                    <div className={styles.cardBody}>
                                        <div className={styles.itemsTableWrapper}>
                                            <table className={styles.itemsTable}>
                                                <thead>
                                                    <tr>
                                                        <th>Manga</th>
                                                        <th>Tomo</th>
                                                        <th className={styles.alignCenter}>Cant.</th>
                                                        <th className={styles.alignRight}>Precio Unit.</th>
                                                        <th className={styles.alignRight}>Subtotal</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {order.items?.map((item, idx) => (
                                                        <tr key={idx}>
                                                            <td><strong>{item.mangaTitle}</strong></td>
                                                            <td>Tomo #{item.volumeNumber}</td>
                                                            <td className={styles.alignCenter}>{item.quantity}</td>
                                                            <td className={styles.alignRight}>{formatPrice(item.unitPrice)}</td>
                                                            <td className={styles.alignRight}>
                                                                {formatPrice(item.unitPrice * item.quantity)}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>

                                        {/* Información de entrega */}
                                        {order.shippingInfo && (
                                            <div className={styles.shippingDetails}>
                                                <h4>Datos de Envío:</h4>
                                                <p>
                                                    <strong>Destinatario:</strong> {order.shippingInfo.name} ({order.shippingInfo.phone})
                                                </p>
                                                <p>
                                                    <strong>Dirección:</strong> {order.shippingInfo.address}, {order.shippingInfo.city} (CP: {order.shippingInfo.zip})
                                                </p>
                                                {order.shippingInfo.notes && (
                                                    <p>
                                                        <strong>Aclaración:</strong> {order.shippingInfo.notes}
                                                    </p>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </article>
                        );
                    })}
                </div>
            )}
        </main>
    );
}

export default function MisPedidosPage() {
    return (
        <ProtectedRoute>
            <MisPedidosContent />
        </ProtectedRoute>
    );
}
