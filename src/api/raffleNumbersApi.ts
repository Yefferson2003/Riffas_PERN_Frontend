import { isAxiosError } from "axios";
import api from "../lib/axios";
import { PayNumberForm, PayNumbersForm, RaffleNumberSchema, raffleNumbersExelFilterSchema, raffleNumberSharedSchema, RaffleNumberUpdateForm, RafflePayResponseSchema, responseRaffleNumbersExelSchema, responseRaffleNumbersPendingSchema, responseRaffleNumbersSchema, responseRaffleNumbersSchemaShared } from "../types";

export async function getRaffleNumers({params, raffleId} : {params : object, raffleId: string}) {
    try { 
        console.log(params);
        
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

export async function getRaffleNumbersPending({raffleId, raffleNumbersIds } : {raffleId: string, raffleNumbersIds: number[]}) {
    try {
        const {data} = await api.get(`/raffles-numbers/${raffleId}/number/pending-numbers`, { params: { raffleNumbersIds }});

        const response = responseRaffleNumbersPendingSchema.safeParse(data)

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

export async function getRaffleNumersShared({ token, limit, page } : { token: string, page: number, limit: number}) {
    try { 
        const {data} = await api.get(`/raffles-numbers/shared`, { 
            params: {
                token,
                limit,
                page
            }
        });

        const response = responseRaffleNumbersSchemaShared.safeParse(data)
        
        
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
        const response = RaffleNumberSchema.safeParse(data)
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

export async function getRaffleNumberByIdShared({token, raffleNumberId} : {token: string, raffleNumberId: number}) {
    try {
        const {data} = await api.get(`/raffles-numbers/shared/number/${raffleNumberId}`, {
            params: {
                token
            }
        })
        const response = raffleNumberSharedSchema.safeParse(data)
        
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

export async function sellNumbers({formData, raffleId, params}: {
    formData: PayNumbersForm,
    raffleId: number,
    params: object
}) {
    try {
        const {data} = await api.post(`/raffles-numbers/${raffleId}/sell-numbers`, formData, {params});
        const response = RafflePayResponseSchema.safeParse(data);

        if (response.success) {
            return response.data;
        } else {
            throw new Error('Respuesta del servidor no válida');
        }
    } catch (error) {
        if (isAxiosError(error) && error.response) {
            console.log(error);
            throw new Error(error.response.data.error);
        }
        throw error; // Asegura que cualquier otro error también se propague
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

export async function amountNumberShared({formData, token, raffleNumberId}:{formData : PayNumberForm, token: string, raffleNumberId: number}) {
    try {
        const {data} = await api.post(`/raffles-numbers/shared/amount-number/${raffleNumberId}`, formData, { params:{
            token
        } })
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
