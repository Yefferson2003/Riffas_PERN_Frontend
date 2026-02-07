import { isAxiosError } from "axios";
import api from "../lib/axios";
import { MonedaType, responseMonedaSchema, responseTasaSchema, TasaType } from "../types/tasas";


type TasasApiType = {
    monedaId: MonedaType['id'];
    formDataMoneda: Omit<MonedaType, 'id'>
    tasaId: TasaType['id'];
    formDataTasa: Pick<TasaType, 'value'>;
    raffleId: number;
}

// MONEDAS
export async function getAllMonedas() {
    try {
        const { data } = await api.get('/tasas');
        
        const response = responseMonedaSchema.safeParse(data);
        
        if (response.success) {
            return response.data.monedas
        }

    } catch (error) {
        if (isAxiosError(error) && error.response) {
            throw new Error(error.response.data.error);
        }
        throw error;
    }
}

export async function createMoneda({formDataMoneda}: Pick<TasasApiType, 'formDataMoneda'>) {
    try {
        const { data } = await api.post<string>('/tasas', formDataMoneda);
        return data;
    } catch (error) {
        if (isAxiosError(error) && error.response) {
            throw new Error(error.response.data.error);
        }
        throw error;
    }
}

export async function updateMoneda({ monedaId, formDataMoneda }: Pick<TasasApiType, 'monedaId' | 'formDataMoneda'>) {
    try {
        const { data } = await api.put<string>(`/tasas/${monedaId}`, formDataMoneda);
        return data;
    } catch (error) {
        if (isAxiosError(error) && error.response) {
            throw new Error(error.response.data.error);
        }
        throw error;
    }
}

export async function deleteMoneda({ monedaId }: Pick<TasasApiType, 'monedaId'>) {
    try {
        const { data } = await api.delete<string>(`/tasas/${monedaId}`);
        return data;
    } catch (error) {
        if (isAxiosError(error) && error.response) {
            throw new Error(error.response.data.error);
        }
        throw error;
    }
}

// USER TASAS
export async function getAllUserTasas() {
    try {
        const { data } = await api.get('/tasas/user-tasas');
        const response = responseTasaSchema.safeParse(data);
        if (response.success) {
            return response.data;
        }
        // Si el parseo falla, retorna un objeto vacío compatible
        return { tasas: [] };
    } catch (error) {
        if (isAxiosError(error) && error.response) {
            throw new Error(error.response.data.error);
        }
        throw error;
    }
}

export async function getAllUserTasasSharedUrl({ raffleId }: Pick<TasasApiType, 'raffleId'>) {
    try {
        const { data } = await api.get('/tasas/user-tasas/shared-url/' + raffleId);
        const response = responseTasaSchema.safeParse(data);
        if (response.success) {
            return response.data;
        }
        // Si el parseo falla, retorna un objeto vacío compatible
        return { tasas: [] };
    } catch (error) {
        if (isAxiosError(error) && error.response) {
            throw new Error(error.response.data.error);
        }
        throw error;
    }
}

export async function createUserTasa({ monedaId, formDataTasa }: Pick<TasasApiType, 'monedaId' | 'formDataTasa'>) {
    try {
        const { data } = await api.post<string>(`/tasas/user-tasas/moneda/${monedaId}`, formDataTasa);
        return data;
    } catch (error) {
        if (isAxiosError(error) && error.response) {
            throw new Error(error.response.data.error);
        }
        throw error;
    }
}

export async function updateUserTasa({ tasaId, formDataTasa }: Pick<TasasApiType, 'tasaId' | 'formDataTasa'>) {
    try {
        const { data } = await api.put<string>(`/tasas/user-tasas/${tasaId}`, formDataTasa);
        return data;
    } catch (error) {
        if (isAxiosError(error) && error.response) {
            throw new Error(error.response.data.error);
        }
        throw error;
    }
}

export async function deleteUserTasa({ tasaId }: Pick<TasasApiType, 'tasaId'>) {
    try {
        const { data } = await api.delete(`/tasas/user-tasas/${tasaId}`);
        return data;
    } catch (error) {
        if (isAxiosError(error) && error.response) {
            throw new Error(error.response.data.error);
        }
        throw error;
    }
}

