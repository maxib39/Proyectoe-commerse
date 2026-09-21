"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { formatPrice } from "@/lib/utils";
import toast from "react-hot-toast";
import styles from "../admin.module.css";

export default function AdminPedidosPage() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchAllOrders = async () => {
        try {
            const snap = await getDocs(collection(db, "orders"));
            const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));

            // Ordenar más recientes primero
            list.sort((a, b) => {
                const dateA = a.createdAt?.seconds || 0;
                const dateB = b.createdAt?.seconds || 0;
                return dateB - dateA;
            });

            setOrders(list);
        } catch (err) {
            console.error(err);
            toast.error("Error al cargar pedidos.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAllOrders();
    }, []);

    // Cambiar estado en Firestore
    const handleStatusChange = async (orderId, newStatus) => {
        try {
            await updateDoc(doc(db, "orders", orderId), {
                status: newStatus,
            });
            toast.success(`Pedido #${orderId} actualizado a "${newStatus}"`);
            setOrders((prev) =>
                prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
            );
        } catch (error) {
            toast.error("No se pudo actualizar el estado.");
            console.error(error);
        }
    };

    if (loading) {
        return <div className={styles.loading}>Cargando pedidos...</div>;
    }

    return (
        <div>
            <h1 className={styles.pageTitle}>Gestión de Pedidos</h1>
            <p className={styles.pageSubtitle}>Revisá todas las compras y actualizá su estado de despacho</p>

            {orders.length === 0 ? (
                <p>No hay pedidos registrados.</p>
            ) : (
                <div className={styles.tableWrapper}>
                    <table className={styles.adminTable}>
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Cliente / Email</th>
                                <th>Dirección</th>
                                <th>Tomos</th>
                                <th>Total</th>
                                <th>Estado Actual</th>
                            </tr>
                        </thead>
                        <tbody>
                            {orders.map((order) => (
                                <tr key={order.id}>
                                    <td><strong>#{order.id.slice(0, 6)}...</strong></td>
                                    <td>
                                        {order.shippingInfo?.name || "Sin nombre"}<br />
                                        <small style={{ color: "#6b7280" }}>{order.userEmail}</small>
                                    </td>
                                    <td>
                                        {order.shippingInfo?.address}, {order.shippingInfo?.city}
                                    </td>
                                    <td>
                                        {order.items?.length || 0} tomos
                                    </td>
                                    <td>
                                        <strong>{formatPrice(order.total)}</strong>
                                    </td>
                                    <td>
                                        <select
                                            value={order.status || "confirmado"}
                                            onChange={(e) => handleStatusChange(order.id, e.target.value)}
                                            className={styles.statusSelect}
                                        >
                                            <option value="confirmado">Confirmado</option>
                                            <option value="enviado">Enviado</option>
                                            <option value="entregado">Entregado</option>
                                        </select>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
