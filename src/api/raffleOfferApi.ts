import { isAxiosError } from "axios";
import api from "../lib/axios";
import { RaffleOfferFormType, responseRaffleOffersSchema, RaffleOffersSchema } from "../types";

export type RaffleOfferApiParams = {
    raffleId: string | number;
    raffleOfferId: string | number;
    formData: RaffleOfferFormType;
};

// Obtener ofertas activas de una rifa
export async function getRaffleOffers(raffleId: string | number) {
    try {
        const { data } = await api.get(`/raffle-offers/${raffleId}/offers`);
        // Aquí podrías validar con zod si tienes un schema
        const response = responseRaffleOffersSchema.safeParse(data);

        if (response.success) {
            return response.data;
        }
    } catch (error) {
        if (isAxiosError(error) && error.response) {
            throw new Error(error.response.data.error);
        }
    }
}

// Obtener todas las ofertas de una rifa (incluidas inactivas)
export async function getAllRaffleOffers(raffleId: string | number) {
    try {
        const { data } = await api.get(`/raffle-offers/${raffleId}/offers/all`);
        const response = responseRaffleOffersSchema.safeParse(data);

        if (response.success) {
            return response.data;
        }
    } catch (error) {
        if (isAxiosError(error) && error.response) {
            throw new Error(error.response.data.error);
        }
    }
}

// Obtener oferta por ID
export async function getRaffleOfferById({ raffleId, raffleOfferId }: Pick<RaffleOfferApiParams, 'raffleId' | 'raffleOfferId'>) {
    try {
        const { data } = await api.get(`/raffle-offers/${raffleId}/offers/${raffleOfferId}`);
        const response = RaffleOffersSchema.safeParse(data);

        if (response.success) {
            return response.data;
        }
    } catch (error) {
        if (isAxiosError(error) && error.response) {
            throw new Error(error.response.data.error);
        }
    }
}

// Crear oferta para una rifa
export async function createRaffleOffer({ raffleId, formData }: Pick<RaffleOfferApiParams, 'raffleId' | 'formData'>) {
    try {
        const { data } = await api.post<string>(`/raffle-offers/${raffleId}/offers`, formData);
        return data
    } catch (error) {
        if (isAxiosError(error) && error.response) {
            throw new Error(error.response.data.error);
        }
    }
}

// Actualizar oferta de una rifa
export async function updateRaffleOffer({ raffleId, raffleOfferId, formData }: RaffleOfferApiParams) {
    try {
        const { data } = await api.put<string>(`/raffle-offers/${raffleId}/offers/${raffleOfferId}`, formData);
        return data;
    } catch (error) {
        if (isAxiosError(error) && error.response) {
            throw new Error(error.response.data.error);
        }
    }
}

// Cambiar estado de oferta (activar/desactivar)
export async function toggleRaffleOfferStatus({ raffleId, raffleOfferId }: Pick<RaffleOfferApiParams, 'raffleId' | 'raffleOfferId'>) {
    try {
        const { data } = await api.patch<string>(`/raffle-offers/${raffleId}/offers/${raffleOfferId}`);
        return data;
    } catch (error) {
        if (isAxiosError(error) && error.response) {
            throw new Error(error.response.data.error);
        }
    }
}

// Eliminar oferta
export async function deleteRaffleOffer({ raffleId, raffleOfferId }: Pick<RaffleOfferApiParams, 'raffleId' | 'raffleOfferId'>) {
    try {
        const { data } = await api.delete<string>(`/raffle-offers/${raffleId}/offers/${raffleOfferId}`);
        return data;
    } catch (error) {
        if (isAxiosError(error) && error.response) {
            throw new Error(error.response.data.error);
        }
    }
}
