import { NextResponse } from "next/server";
import { collection, addDoc, doc, updateDoc, increment, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { sendOrderConfirmationEmail } from "@/lib/email";

export async function POST(request) {
    try {
        const body = await request.json();
        const { items, shippingInfo, total, userId, userEmail } = body;

        if (!items || items.length === 0) {
            return NextResponse.json({ error: "El carrito está vacío." }, { status: 400 });
        }

        // 1. Crear el pedido en la colección 'orders' de Firestore
        const orderData = {
            userId: userId || "guest",
            userEmail: userEmail || shippingInfo.email,
            shippingInfo: {
                name: shippingInfo.name,
                email: shippingInfo.email,
                phone: shippingInfo.phone,
                address: shippingInfo.address,
                city: shippingInfo.city,
                zip: shippingInfo.zip,
                notes: shippingInfo.notes || "",
            },
            items: items.map((item) => ({
                mangaId: item.mangaId,
                mangaTitle: item.mangaTitle,
                volumeId: item.volumeId,
                volumeNumber: item.volumeNumber,
                quantity: item.quantity,
                unitPrice: item.unitPrice,
            })),
            total: total,
            status: "confirmado",
            createdAt: serverTimestamp(),
            emailSent: false,
        };

        const docRef = await addDoc(collection(db, "orders"), orderData);
        const orderId = docRef.id;

        // 2. Descontar stock de cada volumen en Firestore
        for (const item of items) {
            try {
                const volumeRef = doc(db, "mangas", item.mangaId, "volumes", item.volumeId);
                await updateDoc(volumeRef, {
                    stock: increment(-item.quantity),
                });
            } catch (stockError) {
                console.error(`Error al descontar stock del tomo ${item.volumeId}:`, stockError);
            }
        }

        // 3. Enviar correo de confirmación
        let emailSuccess = false;
        try {
            await sendOrderConfirmationEmail({
                orderId,
                customerName: shippingInfo.name,
                customerEmail: shippingInfo.email,
                items,
                total,
                shippingInfo,
            });
            emailSuccess = true;

            // Actualizar el estado de emailSent a true
            await updateDoc(docRef, { emailSent: true });
        } catch (mailError) {
            console.error("Error al enviar el email:", mailError);
        }

        return NextResponse.json({
            success: true,
            orderId,
            emailSent: emailSuccess,
        });
    } catch (error) {
        console.error("Error al procesar la orden:", error);
        return NextResponse.json(
            { error: "Error interno al procesar el pedido." },
            { status: 500 }
        );
    }
}
