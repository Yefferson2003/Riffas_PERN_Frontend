


import { isAxiosError } from "axios";
import api from "../lib/axios";
import { ClientFormType, ClientSelectSchema, ClientsListForExportSchema, ClientType, responseClientSchema, responseClientsSchema, responseClientsSharedLinkSchema, StatusRaffleNumbersType } from "../types";

export type ClientApi = { 
    page: number;
    order: number;
    filter: StatusRaffleNumbersType | string;
    limit: number;
    search: string;
    clientId: ClientType['id'];
    formData: ClientFormType;
    buyNumberForClientFormData: BuyNumberForClientFormType;
    startDate: string | undefined
    endDate: string | undefined
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

export async function getClientsSharedLinkAll( { page, limit, search, filter, startDate, endDate } : Pick<ClientApi, 'page' | 'limit' | 'search' | 'filter' | 'startDate' | 'endDate'>) {
    try {
        const { data } = await api.get("/clients/shared-link", { params: { 
            page, 
            limit, 
            search, 
            filter,
            startDate,
            endDate
        } });
        
        const response = responseClientsSharedLinkSchema.safeParse(data);
        
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

export async function getClients( { page, limit, search, order, startDate, endDate } : Pick<ClientApi, 'page' | 'limit' | 'search' | 'order' | 'startDate' | 'endDate'>) {
    try {
        const { data } = await api.get("/clients", { params: { 
            page, 
            limit, 
            search, 
            order,
            startDate,
            endDate
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
export async function getClientsForExport({ search, order, startDate, endDate} : Pick<ClientApi, "search" | 'order' | 'startDate' | 'endDate'> ) {
    try {
        const { data } = await api.get("/clients/export-all", { params: { 
            search,
            order,
            startDate,
            endDate
        } });
        // No paginación, retorna todos los clientes
        const response = ClientsListForExportSchema.safeParse(data);
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

// Obtener todos los clientes para exportación (sin paginación, datos completos)
export async function getClientsForSelect({ page, limit, search } : Pick<ClientApi, 'page' | 'limit' | 'search'>) {
    try {
        const { data } = await api.get("/clients/select-input", { params: { 
            page, 
            limit, 
            search 
        } });
        // Validar con el schema si es necesario
        const response = ClientSelectSchema.safeParse(data);
        console.log('error page',response.error);
        
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


