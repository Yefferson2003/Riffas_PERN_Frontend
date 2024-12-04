import { isAxiosError } from "axios";
import api from "../lib/axios";
import { responseGetNumbersByUser } from "../types";

export async function GetPaymnetsRaffleNumbersByUser({params ={}, raffleId} : {params : object, raffleId: number}) {
    try {
        const {data} = await api.get(`/payments/${raffleId}`, {params})
        const response = responseGetNumbersByUser.safeParse(data)
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
export async function GetPaymnetsRaffleNumbers({params ={}, raffleId} : {params : object, raffleId: number}) {
    try {
        const {data} = await api.get(`/payments/${raffleId}/numbers`, {params})
        const response = responseGetNumbersByUser.safeParse(data)
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