import { isAxiosError } from "axios";
import api from "../lib/axios";
import { CreateRaffleForm, raffleByIdSchema, responseGetRafflesSchema, responseGetUsersByRaffle, totalByVendedorSchema, totalSchema, UpdateRaffleForm } from "../types";

export async function getRaffles(params = {}) {
    try {
        const {data} = await api.get('/raffles', {params})
        const response = responseGetRafflesSchema.safeParse(data)
        if (response.success) {
            return response.data
        }
    } catch (error) {
        if (isAxiosError(error) && error.response) {
            console.log(error);
            throw new Error(error.response.data.error);
        }
    }
}

export async function getRaffleById(raffleId: number) {
    try {
        const {data} = await api.get(`/raffles/${raffleId}`)
        const response = raffleByIdSchema.safeParse(data)
        if (response.success) {
            return response.data
        }
    } catch (error) {
        if (isAxiosError(error) && error.response) {
            console.log(error);
            throw new Error(error.response.data.error);
        }
    }
}

export async function getUsersByRaffle(raffleId : number) {
    try {
        const {data} = await api.get(`/raffles/${raffleId}/assing-user`)
        const response = responseGetUsersByRaffle.safeParse(data)
        if (response.success) {
            return response.data
        }
    } catch (error) {
        if (isAxiosError(error) && error.response) {
            // console.log(error);
            throw new Error(error.response.data.error);
        }
    }
}

export async function getRecaudoByRaffle(raffleId : number) {
    try {
        const {data} = await api.get(`/raffles/${raffleId}/recaudo`)
        const response = totalSchema.safeParse(data)
        console.log(response.error);
        
        if (response.success) {
            return response.data
        }
    } catch (error) {
        if (isAxiosError(error) && error.response) {
            // console.log(error);
            throw new Error(error.response.data.error);
        }
    }
}
export async function getRecaudoByVendedor(raffleId : number) {
    try {
        const {data} = await api.get(`/raffles/${raffleId}/recaudoByVendedor`)
        const response = totalByVendedorSchema.safeParse(data)
        console.log(response.error);
        if (response.success) {
            return response.data
        }
    } catch (error) {
        if (isAxiosError(error) && error.response) {
            // console.log(error);
            throw new Error(error.response.data.error);
        }
    }
}



export async function createRaffle({newFormData, banerImgUrl} : {newFormData:  CreateRaffleForm, banerImgUrl: string}) {
    try {
        
        const formData = {
            ...newFormData,
            price: +newFormData.price,
            startDate: newFormData.startDate?.toISOString(),
            editDate: newFormData.editDate?.toISOString(),
            playDate: newFormData.playDate?.toISOString(),
            banerImgUrl: banerImgUrl
        }
        const {data} = await api.post<string>('/raffles', formData)
        return data
    } catch (error) {
        if (isAxiosError(error) && error.response) {
            console.log(error);
            throw new Error(error.response.data.error);
        }
    }
}

export async function updateRaffle({newFormData, banerImgUrlUpdate, raffleId} : {newFormData:  UpdateRaffleForm, banerImgUrlUpdate: string, raffleId: number}) {
    try {
        
        const banerImgUrl = banerImgUrlUpdate === '' ? newFormData.banerImgUrl : banerImgUrlUpdate

        const formData = {
            ...newFormData,
            startDate: newFormData.startDate?.toISOString(),
            editDate: newFormData.editDate?.toISOString(),
            playDate: newFormData.playDate?.toISOString(),
            banerImgUrl
        }
        const {data} = await api.put<string>(`/raffles/${raffleId}`, formData)
        return data
    } catch (error) {
        if (isAxiosError(error) && error.response) {
            console.log(error);
            throw new Error(error.response.data.error);
        }
    }
}

export async function assingUser({raffleId, userId } : {raffleId: number, userId: number }) {
    try {
        const {data} = await api.post<string>(`/raffles/${raffleId}/assing-user/${userId}`)
        return data
    } catch (error) {
        if (isAxiosError(error) && error.response) {
            console.log(error);
            throw new Error(error.response.data.error);
        }
    }
}
export async function deleteAssingUser({raffleId, userId } : {raffleId: number, userId: number }) {
    try {
        const {data} = await api.delete<string>(`/raffles/${raffleId}/assing-user/${userId}`)
        return data
    } catch (error) {
        if (isAxiosError(error) && error.response) {
            console.log(error);
            throw new Error(error.response.data.error);
        }
    }
}
export async function deleteRaffle(raffleId: number ) {
    try {
        const {data} = await api.delete<string>(`/raffles/${raffleId}`)
        return data
    } catch (error) {
        if (isAxiosError(error) && error.response) {
            console.log(error);
            throw new Error(error.response.data.error);
        }
    }
}