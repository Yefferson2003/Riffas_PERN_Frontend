import { isAxiosError } from "axios";
import api from "../lib/axios";
import { engagelaSdkConfigSchema } from "../types";


type EngageLabType = {
    id: string;
    name: string;
    timezone: string;
}

export async function createOrganization( {name, timezone} : Pick<EngageLabType, "name" | "timezone">) {
    try {
        const { data } = await api.post<string>('/engagelab/create-org', { name, timezone })
        
        return data
    } catch (error) {
        if (isAxiosError(error) && error.response) {
            console.log(error);
            throw new Error(error.response.data.error);
        }
    }
}

export async function getWhatsAppSdkConfig() {
    try {
        const { data } = await api.get('/engagelab/sdk-config')

        const response = engagelaSdkConfigSchema.safeParse(data)

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