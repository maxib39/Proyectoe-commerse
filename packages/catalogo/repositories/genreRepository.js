import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const genreRepository = {
  async createGenre(data) {
    return await prisma.genre.create({
      data: {
        name: data.name,
      },
    });
  },
  async getGenreById(id) {
    return await prisma.genre.findUnique({
      where: { id },
    });
  },
  async getGenreByName(name) {
    return await prisma.genre.findFirst({
      where: { name },
    });
  },
  async getAllGenres() {
    return await prisma.genre.findMany();
  },
  async deleteGenre(id) {
    return await prisma.genre.delete({
      where: { id },
    });
  },
async updateGenre(id, data) {
    return await prisma.genre.update({
      where: { id },
      data: {
        name: data.name,
 
  }});
},
 
}