import { seriesService } from "../service/seriesService.js";

export async function seriesRoutes(fastify, options) {
    fastify.get('/series', async(request, reply) => {
        try{
            const series = await seriesService.buscarTodasLasSeries();
            return series
        }
        catch(error){
            reply.status(500).send({error: 'Error buscando mangas'})
        };
    });
    fastify.get('/series/:id',async(request, reply) => {
        let {id} = request.params;
        if (typeof id === 'string') {
            id = parseInt(id,10)
        };
        if (isNaN(id)) {
            return reply.status(400).send({ error: 'El ID debe ser un número' });
        }
        try{
            const series = await seriesService.buscarSeriePorId(id);
            if (series) {
                return series;
            } else {
                return reply.status(404).send({ error: 'Serie no encontrada' });
            }
        }catch(error){
            reply.status(500).send({error: 'Error buscando manga'});
        };
    });
    fastify.get('/series/genre', async(request, reply) => {
        let {genre} =request.params;
        if (typeof genre === 'string') {
            genre = parseInt(genre,10)
        };
        if (isNaN(genre)) {
            return reply.status(400).send({ error: 'El ID de género debe ser un número' });
        }
        try{
            const series = await seriesService.buscarSeriesPorGenero(genre);
            return series
        }
        catch(error){
            reply.status(500).send({error: 'Error buscando mangas'})
        };
    });
     fastify.get('/series/author', async(request, reply) => {
        let {author} = request.params;
         if (typeof author === 'string') {
            author = parseInt(genre,10)
        };
        if (isNaN(author)) {
            return reply.status(400).send({ error: 'El ID del autor debe ser un número' });
        }
        try{
            const series = await seriesService.buscarSeriesPorAutor(author);
            return series
        }
        catch(error){
            reply.status(500).send({error: 'Error buscando mangas'})
        };
    });
    fastify.get('/series/title', async(request, reply) => {
        let {title} = request.params;
        if (typeof title !== 'string' || title.trim() === '') {
            return reply.status(400).send({ error: 'El título debe ser una cadena de texto no vacía' });
        }
        try{
            const series = await seriesService.buscarSeriesPorTitulo(title);
            return series
        }
        catch(error){
            reply.status(500).send({error: 'Error buscando mangas'})
        };
    });
    fastify.post('/series', async(request, reply) => {
        const data = request.body;
        try{
            const newSeries = await seriesService.crearSerie(data);
            reply.status(201).send(newSeries);
        }
        catch(error){
            reply.status(500).send({error: 'Error creando manga'})
        };
    });
    fastify.delete('/series/:id', async(request, reply) => {
        let {id} = request.params;
        if (typeof id === 'string') {
            id = parseInt(id,10)
        };
        if (isNaN(id)) {
            return reply.status(400).send({ error: 'El ID debe ser un número' });
        }
        try{
            const series = await seriesService.eliminarSerie(id);
            if (series) {
                return series;
            } else {
                return reply.status(404).send({ error: 'Serie no encontrada' });
            }
        }catch(error){
            reply.status(500).send({error: 'Error eliminando manga'});
        };
    });
    fastify.put('/series/:id', async(request, reply) => {
        let {id} = request.params;
        if (typeof id === 'string') {
            id = parseInt(id,10)
        };
        if (isNaN(id)) {
            return reply.status(400).send({ error: 'El ID debe ser un número' });
        }
        const data = request.body;
        try{
            const updatedSeries = await seriesService.actualizarSerie(id, data);
            if (updatedSeries) {
                return updatedSeries;
            } else {
                return reply.status(404).send({ error: 'Serie no encontrada' });
            }
        }catch(error){
            reply.status(500).send({error: 'Error actualizando manga'});
        };
    });

}