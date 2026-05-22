import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { OAuth2Client } from 'google-auth-library';
import { sendVerificationEmail } from '../utils/email.js';
import crypto from 'crypto';

const prisma = new PrismaClient();
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID || '444821259766-4ago5nilpj194q1ckmiih5salbmqt7br.apps.googleusercontent.com');

export async function authRoutes(fastify, options) {
  
  // REGISTRO TRADICIONAL
  fastify.post('/register', async (request, reply) => {
    const { email, password, username } = request.body;
    
    if (!email || !password || !username) {
      return reply.status(400).send({ error: "Faltan campos obligatorios" });
    }

    try {
      const existingUser = await prisma.user.findUnique({ where: { email } });
      if (existingUser) {
        return reply.status(400).send({ error: "El email ya está registrado" });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const verificationToken = crypto.randomBytes(32).toString('hex');

      const user = await prisma.user.create({
        data: {
          email,
          username,
          password: hashedPassword,
          verificationToken,
          isEmailVerified: false
        }
      });

      // Enviar correo de verificación (no bloquea la respuesta por completo si hay delay, pero aquí lo esperamos)
      await sendVerificationEmail(email, verificationToken);

      return reply.status(201).send({ message: "Usuario registrado. Por favor verifica tu email.", userId: user.id });
    } catch (error) {
      console.error("Register Error:", error);
      return reply.status(500).send({ error: "Error en el servidor al registrar" });
    }
  });

  // VERIFICACIÓN DE EMAIL
  fastify.get('/verify', async (request, reply) => {
    const { token } = request.query;

    if (!token) return reply.status(400).send({ error: "Token no proporcionado" });

    try {
      const user = await prisma.user.findFirst({
        where: { verificationToken: token }
      });

      if (!user) return reply.status(400).send({ error: "Token inválido o expirado" });

      await prisma.user.update({
        where: { id: user.id },
        data: {
          isEmailVerified: true,
          verificationToken: null
        }
      });

      return reply.status(200).send({ message: "Email verificado correctamente." });
    } catch (error) {
      console.error("Verify Error:", error);
      return reply.status(500).send({ error: "Error interno verificando el token" });
    }
  });

  // LOGIN TRADICIONAL
  fastify.post('/login', async (request, reply) => {
    const { email, password } = request.body;

    try {
      const user = await prisma.user.findUnique({ where: { email } });

      if (!user || !user.password) {
        return reply.status(401).send({ error: "Credenciales inválidas" });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return reply.status(401).send({ error: "Credenciales inválidas" });
      }

      if (!user.isEmailVerified) {
        return reply.status(403).send({ error: "Por favor, verifica tu correo electrónico antes de iniciar sesión." });
      }

      // Generar JWT
      const token = fastify.jwt.sign({ id: user.id, email: user.email, username: user.username, rol: user.rol });
      return reply.send({ token, user: { id: user.id, email: user.email, username: user.username, rol: user.rol } });
    } catch (error) {
      console.error("Login Error:", error);
      return reply.status(500).send({ error: "Error al iniciar sesión" });
    }
  });

  // LOGIN CON GOOGLE
  fastify.post('/google', async (request, reply) => {
    const { credential } = request.body; // El JWT que devuelve Google

    try {
      const ticket = await client.verifyIdToken({
        idToken: credential,
        audience: process.env.GOOGLE_CLIENT_ID || '444821259766-4ago5nilpj194q1ckmiih5salbmqt7br.apps.googleusercontent.com',
      });
      
      const payload = ticket.getPayload();
      const { email, name, sub } = payload; // sub es el googleId

      let user = await prisma.user.findUnique({ where: { email } });

      if (!user) {
        // Crear el usuario si no existe
        user = await prisma.user.create({
          data: {
            email,
            username: name,
            googleId: sub,
            isEmailVerified: true, // Google ya verificó este email
          }
        });
      } else if (!user.googleId) {
        // Si ya existía pero no estaba linkeado con Google
        user = await prisma.user.update({
          where: { email },
          data: { googleId: sub, isEmailVerified: true }
        });
      }

      // Generar JWT de nuestra aplicación
      const token = fastify.jwt.sign({ id: user.id, email: user.email, username: user.username, rol: user.rol });
      return reply.send({ token, user: { id: user.id, email: user.email, username: user.username, rol: user.rol } });
    } catch (error) {
      console.error("Google Auth Error:", error);
      return reply.status(401).send({ error: "Error autenticando con Google" });
    }
  });

}
