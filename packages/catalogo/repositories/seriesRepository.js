import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const seriesRepository = {
  async createSeries(data) {
    return await prisma.series.create({
      data: {
        title: data.title,
        description: data.description,
        imageUrl: data.imageUrl,
        authorId: data.authorId,
        genreId: data.genreId,
      },
    });
  },
  async getSeriesById(id) {
    return await prisma.series.findUnique({
      where: { id },
    });
  },
  async getAllSeries() {
    return await prisma.series.findMany();
  },
  async deleteSeries(id) {
    return await prisma.series.delete({
      where: { id },
    });
  },
  async updateSeries(id, data) {
    return await prisma.series.update({
      where: { id },
      data: {
        title: data.title,
        description: data.description,
        imageUrl: data.imageUrl,
        authorId: data.authorId,
        genreId: data.genreId,
      },
    });
},
async getSeriesByAuthorId(authorId) {
    return await prisma.series.findMany({
      where: { authorId },
    });
  },
  async getSeriesByGenreId(genreId) {
    return await prisma.series.findMany({
      where: { genreId },
    });
  },
async getSeriesByTitle(title) {
    return await prisma.series.findMany({
      where: { title: { contains: title, mode: 'insensitive' } },
    });
  },
 
}