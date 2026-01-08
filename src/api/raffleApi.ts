import { isAxiosError } from "axios";
import api from "../lib/axios";
import { CreateRaffleForm, raffleByIdSchema, raffleSchemaShared, responseGetRafflesSchema, responseGetUsersByRaffle, responseRafflesDetailsNumbers, responseURLSchema, responseURLsSchema, totalByVendedorSchema, totalSchema, UpdateRaffleForm } from "../types";

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

export async function getRaffleShared({ token} : { token: string,}) {
    try {
        const {data} = await api.get('/raffles/shared', {
            params: {
                token,
            }
        })
        
        const response = raffleSchemaShared.safeParse(data)

        

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

export async function getURLsRaffle({ raffleId } : {raffleId: string}) {
    try {
        const {data} = await api.get(`/raffles/${raffleId}/URL`)
        const response = responseURLsSchema.safeParse(data)
        
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
export async function createURLRaffle({ raffleId, expirationDays } : {raffleId: string, expirationDays: number}) {
    try {
        const {data} = await api.post(`/raffles/${raffleId}/URL`, {
            expirationDays
        } )
        const response = responseURLSchema.safeParse(data)
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

export async function deleteURLRaffle({ raffleId, urlId } : {raffleId: string, urlId: number}) {
    try {
        const {data} = await api.delete<string>(`/raffles/${raffleId}/URL/${urlId}`)
        return data
    } catch (error) {
        if (isAxiosError(error) && error.response) {
            console.log(error);
            throw new Error(error.response.data.error);
        }
    }
}

export async function getRafflesDetailsNumbers() {
    try {
        const {data} = await api.get('/raffles/details-numbers')
        const response = responseRafflesDetailsNumbers.safeParse(data)
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

export async function getRaffleById(raffleId: string) {
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



export async function createRaffle({newFormData, } : {newFormData:  CreateRaffleForm,}) {
    try {
        
        const formData = {
            ...newFormData,
            price: +newFormData.price,
            startDate: newFormData.startDate?.toISOString(),
            editDate: newFormData.editDate?.toISOString(),
            playDate: newFormData.playDate?.toISOString(),
            banerImgUrl: newFormData.banerImgUrl,
            banerMovileImgUrl: newFormData.banerMovileImgUrl,
            imgIconoUrl: newFormData.imgIconoUrl,
            // color: newFormData.color
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

export async function updateRaffle({newFormData, raffleId} : {newFormData:  UpdateRaffleForm, raffleId: number, }) {
    try {
        
        // const banerImgUrl = banerImgUrlUpdate === '' ? newFormData.banerImgUrl : banerImgUrlUpdate

        const formData = {
            ...newFormData,
            startDate: newFormData.startDate?.toISOString(),
            editDate: newFormData.editDate?.toISOString(),
            playDate: newFormData.playDate?.toISOString(),
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