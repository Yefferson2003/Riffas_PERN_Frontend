import { isAxiosError } from "axios";
import api from "../lib/axios";
import { PayNumberForm, PayNumbersForm, raffleNumberSchema, raffleNumbersExelFilterSchema, RaffleNumberUpdateForm, RafflePayResponseSchema, responseRaffleNumbersExelSchema, responseRaffleNumbersSchema } from "../types";

export async function getRaffleNumers({params, raffleId} : {params : object, raffleId: string}) {
    try { 
        const {data} = await api.get(`/raffles-numbers/${raffleId}`, { params });
        const response = responseRaffleNumbersSchema.safeParse(data)
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
export async function getRaffleNumersExelFilter({params, raffleId} : {params : object, raffleId: string}) {
    try { 
        const {data} = await api.get(`/raffles-numbers/${raffleId}/exel-filter`, { params });
        const response = raffleNumbersExelFilterSchema.safeParse(data)
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
export async function getRaffleNumersExel({params, raffleId} : {params : object, raffleId: number}) {
    try { 
        const {data} = await api.get(`/raffles-numbers/${raffleId}/exel`, {params})
        const response = responseRaffleNumbersExelSchema.safeParse(data)
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

export async function getRaffleNumberById({raffleId, raffleNumberId} : {raffleId: number, raffleNumberId: number}) {
    try {
        const {data} = await api.get(`/raffles-numbers/${raffleId}/number/${raffleNumberId}`)
        const response = raffleNumberSchema.safeParse(data)
        console.log(response.error);
        
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

export async function sellNumbers({formData, raffleId, params}:{formData : PayNumbersForm, raffleId: number, params : object}) {
    try {
        const {data} = await api.post(`/raffles-numbers/${raffleId}/sell-numbers`, formData, {params})
        const response = RafflePayResponseSchema.safeParse(data)
        console.log(response.error);
        
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

export async function amountNumber({formData, raffleId, raffleNumberId, params}:{formData : PayNumberForm, raffleId: number, raffleNumberId: number, params: object}) {
    try {
        const {data} = await api.post(`/raffles-numbers/${raffleId}/amount-number/${raffleNumberId}`, formData, {params})
        const response = RafflePayResponseSchema.safeParse(data)
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
export async function updateNumber({formData, raffleId, raffleNumberId}:{formData : RaffleNumberUpdateForm, raffleId: number, raffleNumberId: number}) {
    try {
        const {data} = await api.put<string>(`/raffles-numbers/${raffleId}/update-number/${raffleNumberId}`, formData)
        return data
    } catch (error) {
        if (isAxiosError(error) && error.response) {
            console.log(error);
            throw new Error(error.response.data.error);
        }
    }
}
export async function deleteNumberClient({raffleId, raffleNumberId}:{ raffleId: number, raffleNumberId: number}) {
    try {
        const {data} = await api.delete<string>(`/raffles-numbers/${raffleId}/delete-client/${raffleNumberId}`)
        return data
    } catch (error) {
        if (isAxiosError(error) && error.response) {
            console.log(error);
            throw new Error(error.response.data.error);
        }
    }
}
