import { isAxiosError } from "axios";
import api from "../lib/axios";
import { ClientFormType, ClientType, responseClientSchema, responseClientsSchema } from "../types";

type ClientApi = { 
    page: number;
    limit: number;
    search: string;
    clientId: ClientType['id'];
    formData: ClientFormType;
    buyNumberForClientFormData: BuyNumberForClientFormType;
}

export type BuyNumberForClientFormType = {
    numbers: string[];
    raffleId: number;
    // option: 'comprar' | 'apartar';
}

export async function buyNumbersForClient({ clientId, buyNumberForClientFormData }: Pick<ClientApi, 'clientId' | 'buyNumberForClientFormData'>) {
    try {
        const { data } = await api.post<string>(`/clients/${clientId}/buy-numbers`, buyNumberForClientFormData);
        
        return data;
    } catch (error) {
        if (isAxiosError(error) && error.response) {
            console.log(error);
            throw new Error(error.response.data.error);

        }
    }
}

export async function getClients( { page, limit, search } : Pick<ClientApi, 'page' | 'limit' | 'search'>) {
    try {
        const { data } = await api.get("/clients", { params: { 
            page, 
            limit, 
            search 
        } });
        
        const response = responseClientsSchema.safeParse(data);
        
        if (response.success) {
            return response.data;
        }
    } catch (error) {
        if (isAxiosError(error) && error.response) {
            console.log(error);
            throw new Error(error.response.data.error);
        }
    }
}

export async function getClientById({ clientId } : Pick<ClientApi, 'clientId'>) {
    try {
        const { data } = await api.get(`/clients/${clientId}`);
    const response = responseClientSchema.safeParse(data);
        if (response.success) {
            return response.data;
        }
    } catch (error) {
        if (isAxiosError(error) && error.response) {
            console.log(error);
            throw new Error(error.response.data.error);
        }
    }
}

export async function createClient( { formData } : Pick<ClientApi, 'formData'>) {
    try {
        const { data } = await api.post<string>("/clients", formData);
        return data
    } catch (error) {
        if (isAxiosError(error) && error.response) {
            console.log(error);
            throw new Error(error.response.data.error);
        }
    }
}

export async function updateClient( { clientId, formData } : Pick<ClientApi, 'clientId' | 'formData'>) {
    try {
        const { data } = await api.put<string>(`/clients/${clientId}`, formData);
        return data
    } catch (error) {
        if (isAxiosError(error) && error.response) {
            console.log(error);
            throw new Error(error.response.data.error);
        }
    }
}

// Exportar todos los clientes y sus datos completos (sin paginación)
export async function getClientsForExport() {
    try {
        const { data } = await api.get("/clients/export-all");
        // No paginación, retorna todos los clientes
        const response = responseClientsSchema.safeParse(data);
        if (response.success) {
            return response.data;
        }
        throw new Error("Respuesta inválida del backend");
    } catch (error) {
        if (isAxiosError(error) && error.response) {
            console.log(error);
            throw new Error(error.response.data.error);
        }
        throw error;
    }
}
