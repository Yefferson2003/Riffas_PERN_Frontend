import { isAxiosError } from "axios";
import api from "../lib/axios";

export type WhatsappSendRaffleSummaryPayload = {
    to: string;
    imageUrl: string;
    name: string;
    actionMessage: string;
    raffleName: string;
    numbers: string;
    price: string;
    debt: string;
    playDate: string;
};

type WhatsappApi = { 
    payload: WhatsappSendRaffleSummaryPayload;
}

export async function sendWhatsappRaffleSummary({ payload }: Pick<WhatsappApi, 'payload'>) {
    try {
        const { data } = await api.post("/whatsapp/send-message", payload);
        return data;
    } catch (error) {
        if (isAxiosError(error) && error.response) {
            console.log(error);
            throw new Error(error.response.data.error);
        }
        throw error;
    }
}
