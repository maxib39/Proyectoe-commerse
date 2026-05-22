import {genreService} from  '../service/genreService.js';

export async function genreRoutes(fastify,options) {
    fastify.get('/genres', async(request, reply) => {
        console.log('[genreRoutes] GET /genres');
        try{
            const genres = await genreService.buscarTodosLosGeneros();
            return genres
        }
        catch(error){
            console.error('[genreRoutes] Error buscando géneros:', error)
            reply.status(500).send({error: 'Error buscando géneros'})
        };
    });
    fastify.post('/genres', async(request, reply) => {
        const {name} = request.body;
        console.log('[genreRoutes] POST /genres body=', request.body);
        try{
            const newGenre = await genreService.crearGenero({ name });
            return newGenre;
        }
        catch(error){
            console.error('[genreRoutes] Error creando género:', error)
            reply.status(500).send({error: error.message || 'Error creando género'})
        }
    });
    fastify.get('/genres/:id', async(request, reply) => {
        let {id} = request.params;
        if (typeof id === 'string') {
            id = parseInt(id,10)
        };
        if (isNaN(id)) {
            return reply.status(400).send({ error: 'El ID de género debe ser un número' });
        }
        try{
            const genre = await genreService.buscarGeneroPorId(id);
            if (genre) {
                return genre;
            } else {
                return reply.status(404).send({ error: 'Género no encontrado' });
            }
        }catch(error){
            reply.status(500).send({error: 'Error buscando género'})
        }
    });
    fastify.put('/genres/:id', async(request, reply) => {
        let {id} = request.params;
        if (typeof id === 'string') {
            id = parseInt(id,10)
        };
        console.log('[genreRoutes] PUT /genres/' + id + ' body=', request.body);
        if (isNaN(id)) {
            return reply.status(400).send({ error: 'El ID de género debe ser un número' });
        }
        const {name} = request.body;
        try{
            const genre = await genreService.actualizarGenero(id,{ name });
            if (genre) {
                return genre;
            } else {
                return reply.status(404).send({ error: 'Género no encontrado' });
            }
        }catch(error){
            console.error('[genreRoutes] Error actualizando género:', error)
            reply.status(500).send({error: error.message || 'Error actualizando género'})
        }
    });
    fastify.delete('/genres/:id', async(request, reply) => {
        let {id} = request.params;
        console.log('[genreRoutes] DELETE /genres/' + id);
        if (typeof id === 'string') {
            id = parseInt(id,10)
        };
        if (isNaN(id)) {
            return reply.status(400).send({ error: 'El ID de género debe ser un número' });
        }
        try{
            const result = await genreService.borrarGenero(id);
            if (result) {
                return { message: 'Género eliminado exitosamente' };
            } else {
                return reply.status(404).send({ error: 'Género no encontrado' });
            }
        }
        catch(error){
            console.error('[genreRoutes] Error eliminando género:', error)
            reply.status(500).send({error: error.message || 'Error eliminando género'})
        };
});
    
}