"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, ShoppingBag, ArrowRight } from "lucide-react";
import styles from "./exito.module.css";
import { Suspense } from "react";

function CompraExitosaContent() {
    const searchParams = useSearchParams();
    const orderId = searchParams.get("orderId");
    const email = searchParams.get("email");

    return (
        <div className={styles.card}>
            <CheckCircle2 size={64} className={styles.icon} />
            <h1>¡Gracias por tu compra!</h1>
            <p className={styles.subtitle}>Tu pedido fue procesado exitosamente.</p>

            {orderId && (
                <div className={styles.orderBox}>
                    <span>Número de Pedido:</span>
                    <strong>#{orderId}</strong>
                </div>
            )}

            <p className={styles.emailText}>
                Te enviamos un comprobante detallado con todos tus tomos a:
                <br />
                <strong>{email || "tu correo electrónico"}</strong>
            </p>

            <div className={styles.actions}>
                <Link href="/catalogo" className={styles.catalogBtn}>
                    <ShoppingBag size={18} />
                    <span>Seguir Comprando</span>
                </Link>
                <Link href="/mis-pedidos" className={styles.ordersBtn}>
                    <span>Ver Mis Pedidos</span>
                    <ArrowRight size={18} />
                </Link>
            </div>
        </div>
    );
}

export default function CompraExitosaPage() {
    return (
        <main className={styles.container}>
            <Suspense fallback={<div>Cargando comprobante...</div>}>
                <CompraExitosaContent />
            </Suspense>
        </main>
    );
}
