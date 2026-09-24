"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { formatPrice } from "@/lib/utils";
import toast from "react-hot-toast";
import Link from "next/link";
import styles from "./checkout.module.css";

export default function CheckoutPage() {
    const { items, totalPrice, clearCart } = useCart();
    const { user, userData } = useAuth();
    const router = useRouter();

    const [shippingInfo, setShippingInfo] = useState({
        name: userData?.displayName || "",
        email: user?.email || "",
        phone: "",
        address: "",
        city: "",
        zip: "",
        notes: "",
    });

    const [isSubmitting, setIsSubmitting] = useState(false);

    // Si no hay productos, mostramos aviso
    if (items.length === 0) {
        return (
            <main className={styles.emptyContainer}>
                <h2>Tu carrito está vacío</h2>
                <p>Agregá algunos mangas antes de pasar por caja.</p>
                <Link href="/catalogo" className={styles.backBtn}>
                    Explorar Catálogo
                </Link>
            </main>
        );
    }

    const handleChange = (e) => {
        const { name, value } = e.target;
        setShippingInfo((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const response = await fetch("/api/orders", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    items,
                    shippingInfo,
                    total: totalPrice,
                    userId: user?.uid || null,
                    userEmail: user?.email || shippingInfo.email,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "No se pudo procesar la orden.");
            }

            toast.success("¡Pedido confirmado con éxito!");
            clearCart(); // Vacía el carrito local

            // Redirige a la página de éxito pasando el ID y el email
            router.push(`/compra-exitosa?orderId=${data.orderId}&email=${encodeURIComponent(shippingInfo.email)}`);
        } catch (error) {
            toast.error(error.message || "Ocurrió un error inesperado.");
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };
    if (!user) {
        return (<div className={styles.formSection} style={{ textAlign: "center", padding: "2.5rem 1.5rem" }}>
            <h2>Iniciar Sesión Requerido</h2>
            <p style={{ color: "#6b7280", fontSize: "0.95rem", marginBottom: "1.5rem" }}>
                Para poder confirmar tu pedido y enviarte el comprobante de compra por correo, necesitás tener una cuenta e iniciar sesión.
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                <Link
                    href="/login?redirect=/checkout"
                    className={styles.submitBtn}
                    style={{ textDecoration: "none", display: "block" }}
                >
                    Iniciar Sesión
                </Link>

                <Link
                    href="/registro?redirect=/checkout"
                    className={styles.backBtn}
                    style={{ width: "100%", textDecoration: "none", display: "block" }}
                >
                    Crear Cuenta Nueva
                </Link>
            </div>

            <div className={styles.disclaimer} style={{ marginTop: "1.5rem" }}>
                💡 Guardaremos tus datos de envío e historial de tomos en tu perfil de usuario.
            </div>
        </div>)
    }

    return (
        <main className={styles.container}>
            <h1 className={styles.title}>Finalizar Compra</h1>

            <div className={styles.layout}>
                {/* Formulario de Envío */}
                <form onSubmit={handleSubmit} className={styles.formSection}>
                    <h2>Datos de Entrega</h2>

                    <div className={styles.fieldGroup}>
                        <label htmlFor="name">Nombre y Apellido *</label>
                        <input
                            id="name"
                            name="name"
                            type="text"
                            required
                            value={shippingInfo.name}
                            onChange={handleChange}
                            placeholder="Ej. Juan Pérez"
                        />
                    </div>

                    <div className={styles.row}>
                        <div className={styles.fieldGroup}>
                            <label htmlFor="email">Correo Electrónico (para el comprobante) *</label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                required
                                value={shippingInfo.email}
                                onChange={handleChange}
                                placeholder="tu@email.com"
                            />
                        </div>

                        <div className={styles.fieldGroup}>
                            <label htmlFor="phone">Teléfono / WhatsApp *</label>
                            <input
                                id="phone"
                                name="phone"
                                type="tel"
                                required
                                value={shippingInfo.phone}
                                onChange={handleChange}
                                placeholder="Ej. 11 2345 6789"
                            />
                        </div>
                    </div>

                    <div className={styles.fieldGroup}>
                        <label htmlFor="address">Calle, Número y Piso/Depto *</label>
                        <input
                            id="address"
                            name="address"
                            type="text"
                            required
                            value={shippingInfo.address}
                            onChange={handleChange}
                            placeholder="Ej. Av. Corrientes 1234, 4to B"
                        />
                    </div>

                    <div className={styles.row}>
                        <div className={styles.fieldGroup}>
                            <label htmlFor="city">Ciudad / Localidad *</label>
                            <input
                                id="city"
                                name="city"
                                type="text"
                                required
                                value={shippingInfo.city}
                                onChange={handleChange}
                                placeholder="Ej. CABA"
                            />
                        </div>

                        <div className={styles.fieldGroup}>
                            <label htmlFor="zip">Código Postal *</label>
                            <input
                                id="zip"
                                name="zip"
                                type="text"
                                required
                                value={shippingInfo.zip}
                                onChange={handleChange}
                                placeholder="Ej. 1043"
                            />
                        </div>
                    </div>

                    <div className={styles.fieldGroup}>
                        <label htmlFor="notes">Notas o aclaraciones para la entrega (Opcional)</label>
                        <textarea
                            id="notes"
                            name="notes"
                            rows={3}
                            value={shippingInfo.notes}
                            onChange={handleChange}
                            placeholder="Ej. Dejar en recepción o timbre 4B"
                        />
                    </div>

                    <button type="submit" disabled={isSubmitting} className={styles.submitBtn}>
                        {isSubmitting ? "Procesando pedido..." : "Confirmar y Simular Compra"}
                    </button>
                </form>

                {/* Resumen del Carrito */}
                <aside className={styles.summarySection}>
                    <h2>Resumen del Pedido</h2>

                    <div className={styles.summaryList}>
                        {items.map((item) => (
                            <div key={item.volumeId} className={styles.summaryItem}>
                                <div>
                                    <strong>{item.mangaTitle}</strong>
                                    <p>Tomo #{item.volumeNumber} (x{item.quantity})</p>
                                </div>
                                <span>{formatPrice(item.unitPrice * item.quantity)}</span>
                            </div>
                        ))}
                    </div>

                    <div className={styles.totalBox}>
                        <span>Total a pagar</span>
                        <strong>{formatPrice(totalPrice)}</strong>
                    </div>

                    <p className={styles.disclaimer}>
                        ℹ️ Esta es una simulación. Al confirmar se descontará el stock y te llegará un email con el detalle de la compra.
                    </p>
                </aside>
            </div>
        </main>
    );
}
