
import { authorService } from "../service/authrorService.js";

export async function authorRoutes(fastify, options) {
    fastify.get('/authors', async (request, reply) => {
        console.log('[authorRoutes] GET /authors');
        try{
            const authors = await authorService.buscarTodoslosAutores();
            return authors;
        }
        catch(error){
            console.error('[authorRoutes] Error buscando autores:', error);
            reply.status(500).send({error: 'Error buscando autores'});
        }}
    );
    fastify.post('/authors', async (request, reply) => {
    const { name } = request.body;
    console.log('[authorRoutes] POST /authors body=', request.body);
    try{
    const newAuthor = await authorService.crearAutor(name);
    return newAuthor;
    }
    catch(error){
        console.error('[authorRoutes] Error creando autor:', error);
        reply.status(500).send({error: error.message || 'Error creando autor'});
    }
  });
  fastify.get('/authors/:id', async (request, reply) => {
    let { id } = request.params;
    if(typeof id === 'string') {
      id = parseInt(id,10)
    }
    if (isNaN(id)) {
            return reply.status(400).send({ error: 'El ID de autor debe ser un número' });
        }
    try{
    const author = await authorService.buscarAutorPorId(id);
    if (!author) {
      reply.status(404).send({ error: 'Autor no encontrado' });
    } else {
      return author;
    }
}    catch(error){
    reply.status(500).send({error: 'Error buscando autor'});
}  });
    fastify.put('/authors/:id', async (request, reply) => {
    let { id } = request.params;
    const { name } = request.body;
    console.log('[authorRoutes] PUT /authors/' + id + ' body=', request.body);
     if(typeof id === 'string') {
      id = parseInt(id,10)
    }
    if (isNaN(id)) {
            return reply.status(400).send({ error: 'El ID de autor debe ser un número' });
        }
    try{
    const updatedAuthor = await authorService.actualizarAutor(id,name);
    if (!updatedAuthor) {
      reply.status(404).send({ error: 'Autor no encontrado' });
    } else {
      return updatedAuthor;
    }
}    catch(error){
    console.error('[authorRoutes] Error actualizando autor:', error);
    reply.status(500).send({error: error.message || 'Error actualizando autor'});
}  });
    fastify.delete('/authors/:id', async (request, reply) => {
    let { id } = request.params;
    console.log('[authorRoutes] DELETE /authors/' + id);
     if(typeof id === 'string') {
      id = parseInt(id,10)
    }
    if (isNaN(id)) {
            return reply.status(400).send({ error: 'El ID de autor debe ser un número' });
        }
    try{
    const deletedAuthor = await authorService.borrarAutor(id);
    if (!deletedAuthor) {
      reply.status(404).send({ error: 'Autor no encontrado' });
    } else {
      return deletedAuthor;
    }
}    catch(error){
    console.error('[authorRoutes] Error eliminando autor:', error);
    reply.status(500).send({error: error.message || 'Error eliminando autor'});
} });

}
