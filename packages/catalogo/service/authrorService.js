import { authorRepository } from "../repositories/authorRepository.js";
import { genreRepository } from "../repositories/genreRepository.js";

export const authorService = {
    async buscarTodoslosAutores(){
        return await authorRepository.getAllAuthors()
    },
    async crearAutor(name){
        const trimmed = typeof name === 'string' ? name.trim() : '';
        if (!trimmed) {
            throw new Error("El nombre debe ser una cadena no vacía");
        }
        const existingGenre = await genreRepository.getGenreByName(trimmed);
        if (existingGenre) {
            throw new Error("No se puede usar un nombre que ya pertenece a un género");
        }
        const existingAuthor = await authorRepository.getAuthorByName(trimmed);
        if (existingAuthor) {
            throw new Error("Ya existe un autor con ese nombre");
        }
        return await authorRepository.createAuthor(trimmed)
    },
    async buscarAutorPorId(autor){
        if (autor > 0){
            return await authorRepository.getAuthorById(autor)
        }
        else{
            throw new Error("Ingrese una id valida");
            
        }
    },
    async borrarAutor(autor){
        if (autor > 0){
            return await authorRepository.deleteAuthor(autor)
        }
        else{
            throw new Error("Ingrese una id valida");
            
        }
    },
    async actualizarAutor(autor,name){
        const trimmed = typeof name === 'string' ? name.trim() : '';
        if (trimmed && autor > 0){
            const existingGenre = await genreRepository.getGenreByName(trimmed);
            if (existingGenre) {
                throw new Error("No se puede usar un nombre que ya pertenece a un género");
            }
            const existingAuthor = await authorRepository.getAuthorByName(trimmed);
            if (existingAuthor && existingAuthor.id !== autor) {
                throw new Error("Ya existe un autor con ese nombre");
            }
            return await authorRepository.updateAuthor(autor, trimmed)
        }
        else{
            throw new Error("El nombre debe ser una cadena");
            
        }    
    },
}
    
