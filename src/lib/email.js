import nodemailer from "nodemailer";
import { formatPrice } from "./utils";

// 1. Configurar el transporter de Nodemailer
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// 2. Función para enviar el correo de confirmación
export async function sendOrderConfirmationEmail({ orderId, customerName, customerEmail, items, total, shippingInfo }) {
  // Generar las filas de la tabla de productos para el correo
  const itemsRows = items
    .map(
      (item) => `
      <tr style="border-bottom: 1px solid #e5e7eb;">
        <td style="padding: 10px 0;">
          <strong>${item.mangaTitle}</strong><br />
          <span style="color: #6b7280; font-size: 13px;">Tomo #${item.volumeNumber}</span>
        </td>
        <td style="padding: 10px 0; text-align: center;">${item.quantity}</td>
        <td style="padding: 10px 0; text-align: right;">${formatPrice(item.unitPrice)}</td>
        <td style="padding: 10px 0; text-align: right; font-weight: bold;">
          ${formatPrice(item.unitPrice * item.quantity)}
        </td>
      </tr>
    `
    )
    .join("");

  const htmlContent = `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f3f4f6; margin: 0; padding: 20px; }
        .card { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05); }
        .header { background-color: #111827; color: #ffffff; padding: 24px; text-align: center; }
        .content { padding: 24px; }
        .table { width: 100%; border-collapse: collapse; margin-top: 16px; font-size: 14px; }
        .total-box { margin-top: 20px; padding: 16px; background-color: #f9fafb; border-radius: 6px; text-align: right; font-size: 16px; }
        .footer { padding: 16px; text-align: center; font-size: 12px; color: #9ca3af; background-color: #f9fafb; }
      </style>
    </head>
    <body>
      <div class="card">
        <div class="header">
          <h1 style="margin:0; font-size: 24px;"><img src="/logo.jpg" alt="Manga Store" width="50" height="50" />MangaStore</h1>
          <p style="margin: 6px 0 0 0; color: #9ca3af; font-size: 14px;">¡Gracias por tu compra, ${customerName}!</p>
        </div>

        <div class="content">
          <p style="font-size: 15px; color: #374151;">
            Tu pedido <strong>#${orderId}</strong> ha sido confirmado con éxito. A continuación tenés el resumen de tus tomos:
          </p>

          <table class="table">
            <thead>
              <tr style="border-bottom: 2px solid #e5e7eb; text-align: left; color: #6b7280;">
                <th style="padding-bottom: 8px;">Manga</th>
                <th style="padding-bottom: 8px; text-align: center;">Cant.</th>
                <th style="padding-bottom: 8px; text-align: right;">Precio</th>
                <th style="padding-bottom: 8px; text-align: right;">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              ${itemsRows}
            </tbody>
          </table>

          <div class="total-box">
            <span>Total abonado:</span>
            <strong style="font-size: 20px; color: #111827; margin-left: 8px;">${formatPrice(total)}</strong>
          </div>

          <div style="margin-top: 24px; font-size: 13px; color: #6b7280; border-top: 1px solid #e5e7eb; padding-top: 16px;">
            <p style="margin: 0 0 4px 0;"><strong>Dirección de envío:</strong></p>
            <p style="margin: 0;">${shippingInfo.address}, ${shippingInfo.city} (CP: ${shippingInfo.zip})</p>
            <p style="margin: 4px 0 0 0;">Teléfono de contacto: ${shippingInfo.phone}</p>
          </div>
        </div>

        <div class="footer">
          <p style="margin:0;">MangaStore Argentina — Simulación de compra e-commerce</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return transporter.sendMail({
    from: `"MangaStore 📚" <${process.env.EMAIL_USER}>`,
    to: customerEmail,
    subject: `Confirmación de pedido #${orderId} — MangaStore`,
    html: htmlContent,
  });
}
