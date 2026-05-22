import 'dotenv/config.js';
import Fastify from 'fastify';
import cors from '@fastify/cors';
import fastifyJwt from '@fastify/jwt';
import { authRoutes } from './routes/authRoutes.js';

const fastify = Fastify({ logger: true });

// Configuración de CORS
fastify.register(cors, { 
  origin: '*', // En producción, deberías especificar el dominio de tu frontend
});

// Configuración de JWT
fastify.register(fastifyJwt, {
  secret: process.env.JWT_SECRET || 'supersecret_development_key_change_me_in_prod'
});

// Registrar rutas
fastify.register(authRoutes, { prefix: '/api/auth' });

const start = async () => {
  try {
    const port = process.env.PORT || 3002;
    await fastify.listen({ port, host: '0.0.0.0' });
    console.log(`Auth service running on port ${port}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
