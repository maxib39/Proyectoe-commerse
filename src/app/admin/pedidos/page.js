"use client";

import React, { useEffect, useState } from "react";
import { collection, getDocs, doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { formatPrice } from "@/lib/utils";
import toast from "react-hot-toast";
import styles from "../admin.module.css";

export default function AdminPedidosPage() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedOrders, setExpandedOrders] = useState({});

    const toggleExpand = (orderId) => {
        setExpandedOrders((prev) => ({
            ...prev,
            [orderId]: !prev[orderId],
        }));
    };

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
                                <th>Detalle</th>
                            </tr>
                        </thead>
                        <tbody>
                            {orders.map((order) => {
                                const isExpanded = expandedOrders[order.id];
                                return (
                                <React.Fragment key={order.id}>
                                    <tr>
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
                                        <td>
                                            <button 
                                                onClick={() => toggleExpand(order.id)}
                                                style={{ padding: "6px 12px", background: "#f3f4f6", border: "1px solid #d1d5db", borderRadius: "4px", cursor: "pointer", fontSize: "12px" }}
                                            >
                                                {isExpanded ? "Ocultar" : "Ver"}
                                            </button>
                                        </td>
                                    </tr>
                                    {isExpanded && (
                                        <tr>
                                            <td colSpan="7" style={{ backgroundColor: "#f9fafb", padding: "16px", borderBottom: "2px solid #e5e7eb" }}>
                                                <div style={{ display: "flex", gap: "32px", alignItems: "flex-start" }}>
                                                    <div style={{ flex: 1 }}>
                                                        <h4 style={{ margin: "0 0 12px 0", fontSize: "14px", color: "#374151" }}>Detalle de Tomos</h4>
                                                        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
                                                            <thead>
                                                                <tr style={{ borderBottom: "1px solid #e5e7eb", textAlign: "left" }}>
                                                                    <th style={{ padding: "8px 4px" }}>Manga</th>
                                                                    <th style={{ padding: "8px 4px" }}>Tomo</th>
                                                                    <th style={{ padding: "8px 4px", textAlign: "center" }}>Cant.</th>
                                                                    <th style={{ padding: "8px 4px", textAlign: "right" }}>Precio Unit.</th>
                                                                    <th style={{ padding: "8px 4px", textAlign: "right" }}>Subtotal</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                {order.items?.map((item, idx) => (
                                                                    <tr key={idx} style={{ borderBottom: "1px solid #f3f4f6" }}>
                                                                        <td style={{ padding: "8px 4px" }}><strong>{item.mangaTitle}</strong></td>
                                                                        <td style={{ padding: "8px 4px" }}>#{item.volumeNumber}</td>
                                                                        <td style={{ padding: "8px 4px", textAlign: "center" }}>{item.quantity}</td>
                                                                        <td style={{ padding: "8px 4px", textAlign: "right" }}>{formatPrice(item.unitPrice)}</td>
                                                                        <td style={{ padding: "8px 4px", textAlign: "right" }}>{formatPrice(item.unitPrice * item.quantity)}</td>
                                                                    </tr>
                                                                ))}
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                    <div style={{ width: "250px", backgroundColor: "#ffffff", padding: "16px", borderRadius: "6px", border: "1px solid #e5e7eb", fontSize: "13px" }}>
                                                        <h4 style={{ margin: "0 0 12px 0", fontSize: "14px", color: "#374151" }}>Datos de Envío</h4>
                                                        <p style={{ margin: "0 0 8px 0" }}><strong>Destinatario:</strong> {order.shippingInfo?.name}</p>
                                                        <p style={{ margin: "0 0 8px 0" }}><strong>Teléfono:</strong> {order.shippingInfo?.phone}</p>
                                                        <p style={{ margin: "0 0 8px 0" }}><strong>Dirección:</strong> {order.shippingInfo?.address}, {order.shippingInfo?.city} (CP: {order.shippingInfo?.zip})</p>
                                                        {order.shippingInfo?.notes && (
                                                            <p style={{ margin: "0", color: "#6b7280" }}><strong>Notas:</strong> {order.shippingInfo.notes}</p>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </React.Fragment>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
