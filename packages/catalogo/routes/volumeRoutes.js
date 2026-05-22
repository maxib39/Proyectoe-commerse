import {volumeService} from '../service/volumeService.js';

export async function volumeRoutes(fastify, options) {
    fastify.post('/volumes', async(request, reply) => {
        try{
            const volume = await volumeService.crearVolume(request.body);
            return volume
        }
        catch(error){
            reply.status(500).send({error: 'Error creando volumen'})
        };
    });
    fastify.get('/volumes', async(request, reply) => {
        try{
            const volumes = await volumeService.buscarTodosLosVolumenes();
            return volumes
        }
        catch(error){
            reply.status(500).send({error: 'Error buscando volumenes'})
        };
    });
    fastify.get('/volumes/:id', async(request, reply) => {
        let {id} = request.params;
        if (typeof id === 'string') {
            id = parseInt(id,10)
        };
        if (isNaN(id)) {
            return reply.status(400).send({ error: 'El ID de volumen debe ser un número' });
        }
        try{
            const volume = await volumeService.buscarVolumePorId(id);
            if (volume) {
                return volume;
            } else {
                return reply.status(404).send({ error: 'Volumen no encontrado' });
            }
        }
        catch(error){
            reply.status(500).send({error: 'Error buscando volumen'})

        }
    });
    fastify.get('/volumes/series/:seriesId', async(request, reply) => {
        let {seriesId} = request.params;
        if (typeof seriesId === 'string') {
            seriesId = parseInt(seriesId,10)
        };
        if (isNaN(seriesId)) {
            return reply.status(400).send({ error: 'El seriesId debe ser un número' });
        }
        try{
            const volumes = await volumeService.buscarVolumenesPorSerie(seriesId);
            return volumes
        }
        catch(error){
            reply.status(500).send({error: 'Error buscando volumenes por serie'})
        };
    });
    fastify.delete('/volumes/:id', async(request, reply) => {
        let {id} = request.params;
        if (typeof id === 'string') {
            id = parseInt(id,10)
        };
        if (isNaN(id)) {
            return reply.status(400).send({ error: 'El ID de volumen debe ser un número' });
        }
        try{
            const result = await volumeService.borrarVolume(id);
            if (result) {
                return { message: 'Volumen eliminado exitosamente' };
            } else {
                return reply.status(404).send({ error: 'Volumen no encontrado' });
            }
        }
        catch(error){
            reply.status(500).send({error: 'Error eliminando volumen'})
        };
    });
    fastify.put('/volumes/price/:id', async(request, reply) => {
         let {id} = request.params;
        if (typeof id === 'string') {
            id = parseInt(id,10)
        };
        if (isNaN(id)) {
            return reply.status(400).send({ error: 'El ID de volumen debe ser un número' });
        }
        const {price} = request.body;
        try{
            const volume = await volumeService.actualizarVolumePrice(id,price);
            if (volume) {
                return volume;
            } else {
                return reply.status(404).send({ error: 'Volumen no encontrado' });
            }
        }
        catch(error){
            reply.status(500).send({error: 'Error actualizando precio del volumen'})
        }
    });
    fastify.put('/volumes/stock/:id', async(request, reply) => {
         let {id} = request.params;
        if (typeof id === 'string') {
            id = parseInt(id,10)
        };
        if (isNaN(id)) {
            return reply.status(400).send({ error: 'El ID de volumen debe ser un número' });
        }
        const {stock} = request.body;
        try{
            const volume = await volumeService.actualizarVolumeStock(id, {stock});
            if (volume) {
                return volume;
            } else {
                return reply.status(404).send({ error: 'Volumen no encontrado' });
            }
        }
        catch(error){
            reply.status(500).send({error: 'Error actualizando stock del volumen'})
        }
    });
    fastify.post('/volumes/:id/buy', async(request, reply) => {
         let {id} = request.params;
        if (typeof id === 'string') {
            id = parseInt(id,10)
        };
        if (isNaN(id)) {
            return reply.status(400).send({ error: 'El ID de volumen debe ser un número' });
        }
        try{
            const volume = await volumeService.comprarVolume(id);
            if (volume) {
                return { message: 'Compra exitosa', volume };
            } else {
                return reply.status(404).send({ error: 'Volumen no encontrado' });
            }
        }
        catch(error){
            if (error.message === 'Sin stock disponible') {
                return reply.status(400).send({ error: 'Sin stock disponible' });
            }
            reply.status(500).send({error: 'Error al procesar la compra'})
        }
    });
}