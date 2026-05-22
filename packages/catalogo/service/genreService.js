import { genreRepository } from "../repositories/genreRepository.js";
import { authorRepository } from "../repositories/authorRepository.js";

export const genreService = {
    async buscarTodosLosGeneros(){
        return await genreRepository.getAllGenres()
    },
    async crearGenero(data){
        const trimmed = typeof data.name === 'string' ? data.name.trim() : '';
        if (trimmed === ''){
            throw new Error("Ingrese un nombre de género válido");
        }
        const existingAuthor = await authorRepository.getAuthorByName(trimmed);
        if (existingAuthor) {
            throw new Error("No se puede usar un nombre que ya pertenece a un autor");
        }
        const existingGenre = await genreRepository.getGenreByName(trimmed);
        if (existingGenre) {
            throw new Error("Ya existe un género con ese nombre");
        }
        return await genreRepository.createGenre({ name: trimmed })
    },
    async buscarGeneroPorId(id){
        if (id>0){
            return await genreRepository.getGenreById(id)
        }
        else{
            throw new Error("Ingrese una id válida");
        }
    },
    async borrarGenero(id){
        if (id>0){
            return await genreRepository.deleteGenre(id)
        }
        else{
            throw new Error("Ingrese una id válida");
        }
    },
    async actualizarGenero(id,data){
        const trimmed = typeof data.name === 'string' ? data.name.trim() : '';
        if (trimmed === '' || id <= 0){
            throw new Error("Ingrese valores válidos");            
        }
        const existingAuthor = await authorRepository.getAuthorByName(trimmed);
        if (existingAuthor) {
            throw new Error("No se puede usar un nombre que ya pertenece a un autor");
        }
        const existingGenre = await genreRepository.getGenreByName(trimmed);
        if (existingGenre && existingGenre.id !== id) {
            throw new Error("Ya existe un género con ese nombre");
        }
        return await genreRepository.updateGenre(id, { name: trimmed })
    }
}