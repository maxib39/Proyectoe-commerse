import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const authorRepository = {
  async createAuthor(name) {
    return await prisma.author.create({
      data: { name },
    });
  },
  async getAuthorById(id) {
    return await prisma.author.findUnique({
      where: { id },
    });
  },
  async getAuthorByName(name) {
    return await prisma.author.findFirst({
      where: { name },
    });
  },
  async getAllAuthors() {
    return await prisma.author.findMany();
  },
  async deleteAuthor(id) {
    return await prisma.author.delete({
      where: { id },
    });
  },
  async updateAuthor(id, name) {
    return await prisma.author.update({
      where: { id },
      data: { name },
    });
  }

};