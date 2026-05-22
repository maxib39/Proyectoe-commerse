import { volumeRepository } from "../repositories/volumeRepository.js";

export const volumeService = {
    async crearVolume(data){
        if(data.volNumber > 0 && data.price > 0 && data.stock >= 0 && data.seriesId > 0){
            return await volumeRepository.createVolume(data)
        }
        else{
            throw new Error("Ingrese datos validos");
        }
    },
    async buscarVolumePorId(id){
        if (id > 0){
            return await volumeRepository.getVolumeById(id)
        }
        else{
            throw new Error("Ingrese una id valida");
        }
    },
    async buscarTodosLosVolumenes(){
        return await volumeRepository.getAllVolumes()
    },
    async buscarVolumenesPorSerie(seriesId){
        if (seriesId > 0){
            return await volumeRepository.getVolumesBySeriesId(seriesId)
        }
        else{
            throw new Error("Ingrese una seriesId valida");
        }
    },
    async borrarVolume(id){
        if (id > 0){
            return await volumeRepository.deleteVolume(id)
        }
        else{
            throw new Error("Ingrese una id valida");
        }
    },
    async actualizarVolumePrice(id, data){
        if (data.price > 0 && id > 0){
            return await volumeRepository.updateVolumeprice(id, data)
        }
        else{
            throw new Error("Ingrese datos validos");
        }
    },
    async actualizarVolumeStock(id, data){
        if (data.stock > 0 && id > 0){
            return await volumeRepository.updateVolumeStock(id, data)
        }
        else{
            throw new Error("Ingrese datos validos");
        }
    },
    async comprarVolume(id){
        if (id > 0){
            return await volumeRepository.buyVolume(id)
        }
        else{
            throw new Error("Ingrese una id valida");
        }
    }
}