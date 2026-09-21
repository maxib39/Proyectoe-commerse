"use client";

import { useCart } from "@/context/CartContext";
import { formatPrice } from "@/lib/utils";
import CartItem from "./CartItem";
import { X, ShoppingBag, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import styles from "./cartDrawer.module.css";

export default function CartDrawer() {
    const {
        items,
        totalPrice,
        totalItems,
        isCartDrawerOpen,
        closeCartDrawer,
        updateQuantity,
        removeFromCart,
        clearCart,
    } = useCart();
    const router = useRouter();

    if (!isCartDrawerOpen) return null;

    const handleCheckout = () => {
        closeCartDrawer();
        router.push("/checkout");
    };

    return (
        <div className={styles.overlay} onClick={closeCartDrawer}>
            <div className={styles.drawer} onClick={(e) => e.stopPropagation()}>
                {/* Encabezado del Carrito */}
                <div className={styles.header}>
                    <div className={styles.headerTitle}>
                        <ShoppingBag size={20} />
                        <h3>Tu Carrito ({totalItems})</h3>
                    </div>
                    <button onClick={closeCartDrawer} className={styles.closeBtn}>
                        <X size={20} />
                    </button>
                </div>

                {/* Lista de Tomos */}
                <div className={styles.content}>
                    {items.length === 0 ? (
                        <div className={styles.empty}>
                            <p>Tu carrito está vacío.</p>
                            <span>¡Explorá el catálogo para sumar tomos!</span>
                        </div>
                    ) : (
                        <div className={styles.itemList}>
                            {items.map((item) => (
                                <CartItem
                                    key={item.volumeId}
                                    item={item}
                                    onUpdateQty={updateQuantity}
                                    onRemove={removeFromCart}
                                />
                            ))}
                        </div>
                    )}
                </div>

                {/* Pie del Carrito con Totales */}
                {items.length > 0 && (
                    <div className={styles.footer}>
                        <div className={styles.subtotalRow}>
                            <span>Subtotal</span>
                            <span className={styles.totalAmount}>{formatPrice(totalPrice)}</span>
                        </div>

                        <button onClick={handleCheckout} className={styles.checkoutBtn}>
                            <span>Iniciar Compra</span>
                            <ArrowRight size={18} />
                        </button>

                        <button onClick={clearCart} className={styles.clearBtn}>
                            Vaciar Carrito
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
