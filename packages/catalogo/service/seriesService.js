import { seriesRepository } from "../repositories/seriesRepository.js";

export const seriesService = {
    async buscarTodasLasSeries(){
        return await seriesRepository.getAllSeries()
    },
    async buscarSeriesPorGenero(genre){
        if (genre > 0){
            return await seriesRepository.getSeriesByGenreId(genre)
        }
        else{
            throw new Error("Ingrese un genero valido");}
    },
    async buscarSeriesPorAutor(author){
        if (author > 0){
            return await seriesRepository.getSeriesByAuthorId(author)
        }
        else{
            throw new Error("Ingrese un autor valido");
            
        }
    },
    async crearSerie(data){
        if(typeof data.title === 'string' && typeof data.description === 'string' && typeof data.imageUrl === 'string' && data.authorId > 0 && data.genreId > 0){
            return await seriesRepository.createSeries(data)
        }
        else{
            throw new Error("Ingrese datos validos");
        }
    },
    async buscarSeriePorId(id){
        if (id > 0){
            return await seriesRepository.getSeriesById(id)
        }
        else{
            throw new Error("Ingrese una id valida");
        }
    },
    async borrarSerie(id){
        if (id > 0){
            return await seriesRepository.deleteSeries(id)
        }
        else{
            throw new Error("Ingrese una id valida");
        }
    },
    async actualizarSerie(id, data){
        if(typeof data.title === 'string' && typeof data.description === 'string' && typeof data.imageUrl === 'string' && data.authorId > 0 && data.genreId > 0 && id > 0){
            return await seriesRepository.updateSeries(id, data)
        }
        else{
            throw new Error("Ingrese datos validos");
        }
    },
    async buscarSeriesPorTitulo(title){
        if (typeof title === 'string' && title.trim() !== '') {
            return await seriesRepository.getSeriesByTitle(title);
        } else {
            throw new Error("Ingrese un título válido");
        }
    },
}