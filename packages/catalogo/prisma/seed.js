import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const authors = [
    'Masashi Kishimoto',
    'Eiichiro Oda',
    'Akira Toriyama',
    'Tite Kubo',
    'Hajime Isayama',
    'Koyoharu Gotouge',
    'Gege Akutami',
    'Tatsuki Fujimoto',
    'Kentaro Miura',
    'Takehiko Inoue',
    'Naoko Takeuchi',
    'Hiromu Arakawa',
    'Tsugumi Ohba',
    'Yoshihiro Togashi',
    'Sui Ishida'
  ];

  const genres = [
    'Shonen',
    'Seinen',
    'Shojo',
    'Josei',
    'Isekai',
    'Mecha',
    'Spokon (Deportes)',
    'Slice of Life',
    'Cyberpunk',
    'Fantasía Oscura',
    'Romance',
    'Comedia',
    'Terror / Horror',
    'Misterio',
    'Ciencia Ficción'
  ];

  console.log('Sembrando autores...');
  for (const authorName of authors) {
    await prisma.author.create({
      data: { name: authorName }
    });
  }

  console.log('Sembrando géneros...');
  for (const genreName of genres) {
    await prisma.genre.create({
      data: { name: genreName }
    });
  }

  console.log('¡Base de datos poblada con éxito!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
