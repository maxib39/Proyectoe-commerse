import 'dotenv/config.js'
import Fastify from 'fastify';
import { seriesRoutes } from './routes/seriesRoutes.js';
import { genreRoutes } from './routes/genreRoutes.js';
import { volumeRoutes } from './routes/volumeRoutes.js';
import {authorRoutes} from './routes/authorRoutes.js';
const fastify = Fastify();
const PORT = process.env.PORT || 3001;

fastify.register(seriesRoutes, { prefix: '/api/catalogo' });
fastify.register(genreRoutes, { prefix: '/api/catalogo' });
fastify.register(volumeRoutes, { prefix: '/api/catalogo' });
fastify.register(authorRoutes, { prefix: '/api/catalogo' });

const start = async () => {
    try{
        await fastify.listen({ port: PORT });
    } catch (err) {
        console.error('Error starting server:', err);
        process.exit(1);
    }
};
start();
