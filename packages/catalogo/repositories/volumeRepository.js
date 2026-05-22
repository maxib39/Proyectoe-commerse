import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const volumeRepository = {
  async createVolume(data) {
    return await prisma.volume.create({
      data: {
        volNumber: data.volNumber,
        price: data.price,
        stock: data.stock,
        seriesId: data.seriesId,
      },
    });
  },
  async getVolumeById(id) {
    return await prisma.volume.findUnique({
      where: { id },
    });
  },
  async getAllVolumes() {
    return await prisma.volume.findMany();
  },
  async getVolumesBySeriesId(seriesId) {
    return await prisma.volume.findMany({
      where: { seriesId },
    });
  },
  async deleteVolume(id) {
    return await prisma.volume.delete({
      where: { id },
    });
  },
async updateVolumeprice(id, data) {

  return await prisma.volume.update({
    where: { id },
    data: { price: data.price },
  });
},
 async updateVolumeStock(id, data) {
  // Get current volume to calculate new stock
  const currentVolume = await prisma.volume.findUnique({
    where: { id },
  });
  
  if (!currentVolume) {
    throw new Error('Volume not found');
  }
  
  const newStock = currentVolume.stock + data.stock;
  
  return await prisma.volume.update({
    where: { id },
    data: { stock: newStock },
  });
},
 async buyVolume(id) {
   const currentVolume = await prisma.volume.findUnique({
     where: { id },
   });
   
   if (!currentVolume) {
     throw new Error('Volume not found');
   }
   
   if (currentVolume.stock <= 0) {
     throw new Error('Sin stock disponible');
   }
   
   return await prisma.volume.update({
     where: { id },
     data: { stock: currentVolume.stock - 1 },
   });
 }
}