import nodemailer from 'nodemailer';

// Configuración de Mailtrap para pruebas locales
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || "sandbox.smtp.mailtrap.io",
  port: process.env.EMAIL_PORT || 2525,
  auth: {
    user: process.env.EMAIL_USER || "usuario_ejemplo", // Será reemplazado por env
    pass: process.env.EMAIL_PASS || "pass_ejemplo"
  }
});

export const sendVerificationEmail = async (toEmail, token) => {
  const verificationUrl = `http://localhost:5173/verify?token=${token}`;

  const mailOptions = {
    from: '"E-commerce Manga" <noreply@ecommerce-manga.com>',
    to: toEmail,
    subject: "Verifica tu correo electrónico",
    html: `
      <h2>¡Bienvenido a E-commerce Manga!</h2>
      <p>Gracias por registrarte. Por favor, verifica tu correo electrónico haciendo clic en el siguiente enlace:</p>
      <a href="${verificationUrl}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Verificar Correo</a>
      <p>Si el botón no funciona, copia y pega el siguiente enlace en tu navegador:</p>
      <p>${verificationUrl}</p>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Email de verificación enviado a ${toEmail}`);
  } catch (error) {
    console.error("Error al enviar email:", error);
    throw new Error("No se pudo enviar el email de verificación");
  }
};
