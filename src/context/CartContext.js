"use client";

import { createContext, useContext, useEffect, useState } from "react";
import toast from "react-hot-toast";

const CartContext = createContext({});

export const useCart = () => useContext(CartContext);

export function CartProvider({ children }) {
    const [items, setItems] = useState([]);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [isHydrated, setIsHydrated] = useState(false);

    // 1. Cargar el carrito guardado en localStorage al iniciar
    useEffect(() => {
        try {
            const stored = localStorage.getItem("mangastore_cart");
            if (stored) {
                setItems(JSON.parse(stored));
            }
        } catch (error) {
            console.error("Error al leer el carrito de localStorage:", error);
        } finally {
            setIsHydrated(true);
        }
    }, []);

    // 2. Guardar en localStorage cada vez que cambia el carrito
    useEffect(() => {
        if (isHydrated) {
            localStorage.setItem("mangastore_cart", JSON.stringify(items));
        }
    }, [items, isHydrated]);

    // Agregar tomo al carrito
    const addToCart = (manga, volume, quantity = 1) => {
        setItems((prevItems) => {
            // Buscamos si este tomo puntual ya está en el carrito
            const existingIndex = prevItems.findIndex(
                (item) => item.volumeId === volume.id
            );

            if (existingIndex > -1) {
                // Si ya está, sumamos la cantidad respetando el stock
                const currentQty = prevItems[existingIndex].quantity;
                const newQty = currentQty + quantity;
                const maxStock = volume.stock;

                if (newQty > maxStock) {
                    toast.error(`Solo hay ${maxStock} unidades disponibles en stock.`);
                    return prevItems;
                }

                const updated = [...prevItems];
                updated[existingIndex] = {
                    ...updated[existingIndex],
                    quantity: newQty,
                };
                toast.success(`Sumaste más unidades de ${manga.title} — Tomo #${volume.number}`);
                return updated;
            } else {
                // Si es un tomo nuevo en el carrito, lo agregamos
                if (quantity > volume.stock) {
                    toast.error(`Solo hay ${volume.stock} unidades disponibles.`);
                    return prevItems;
                }

                toast.success(`Agregado: ${manga.title} — Tomo #${volume.number}`);
                return [
                    ...prevItems,
                    {
                        mangaId: manga.id,
                        mangaTitle: manga.title,
                        coverImage: manga.coverImage || "",
                        volumeId: volume.id,
                        volumeNumber: volume.number,
                        unitPrice: volume.price, // en centavos
                        quantity: quantity,
                        maxStock: volume.stock,
                    },
                ];
            }
        });

        setIsDrawerOpen(true); // Abre el drawer lateral al agregar
    };

    // Modificar cantidad (+1 o -1)
    const updateQuantity = (volumeId, newQty) => {
        if (newQty <= 0) {
            removeFromCart(volumeId);
            return;
        }

        setItems((prev) =>
            prev.map((item) => {
                if (item.volumeId === volumeId) {
                    if (newQty > item.maxStock) {
                        toast.error(`Stock máximo alcanzado (${item.maxStock} u.)`);
                        return item;
                    }
                    return { ...item, quantity: newQty };
                }
                return item;
            })
        );
    };

    // Eliminar un tomo puntual
    const removeFromCart = (volumeId) => {
        setItems((prev) => prev.filter((item) => item.volumeId !== volumeId));
        toast("Tomo eliminado del carrito", { icon: "🗑️" });
    };

    // Vaciar carrito
    const clearCart = () => {
        setItems([]);
    };

    // Totales calculados
    const totalItems = items.reduce((acc, item) => acc + item.quantity, 0);
    const totalPrice = items.reduce(
        (acc, item) => acc + item.unitPrice * item.quantity,
        0
    );

    return (
        <CartContext.Provider
            value={{
                items,
                totalItems,
                totalPrice,
                isDrawerOpen,
                setIsDrawerOpen,
                openDrawer: () => setIsDrawerOpen(true),
                closeDrawer: () => setIsDrawerOpen(false),
                addToCart,
                updateQuantity,
                removeFromCart,
                clearCart,
            }}
        >
            {children}
        </CartContext.Provider>
    );
}
