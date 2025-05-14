import { isAxiosError } from "axios";
import api from "../lib/axios";
import {AwardFormType, awardsShema, responseAwards } from "../types";

type AwardsType = {
    raffleId: string
    awardData: AwardFormType
    awardId: string
}

export async function getAwards({ raffleId } : Pick<AwardsType, 'raffleId'>) {
    try {
        const url = `/raffles/${raffleId}/awards`
        const {data} = await api.get(url)

        const response = responseAwards.safeParse(data)
        if (response) {
            return response.data
        }

    } catch (error) {
        if (isAxiosError(error) && error.response) {
            console.log(error);
            throw new Error(error.response.data.error);
        }
    }
}
export async function getAwardById({ raffleId, awardId} : Pick<AwardsType, 'raffleId' | 'awardId'>) {
    try {
        const url = `/raffles/${raffleId}/awards/${awardId}`
        const {data} = await api.get(url)

        const response = awardsShema.safeParse(data)
        if (response) {
            return response.data
        }

    } catch (error) {
        if (isAxiosError(error) && error.response) {
            console.log(error);
            throw new Error(error.response.data.error);
        }
    }
}
export async function createAward({ raffleId, awardData} : Pick<AwardsType, 'raffleId' | 'awardData'>) {
    try {
        const url = `/raffles/${raffleId}/awards`
        const {data} = await api.post<string>(url, awardData)

        return data

    } catch (error) {
        if (isAxiosError(error) && error.response) {
            console.log(error);
            throw new Error(error.response.data.error);
        }
    }
}

export async function updateAward({ raffleId, awardData, awardId} : Pick<AwardsType, 'raffleId' | 'awardId' | 'awardData'>) {
    try {
        const url = `/raffles/${raffleId}/awards/${awardId}`
        const {data} = await api.put<string>(url, awardData)

        return data

    } catch (error) {
        if (isAxiosError(error) && error.response) {
            console.log(error);
            throw new Error(error.response.data.error);
        }
    }
}

export async function deleteAward({ raffleId, awardId} : Pick<AwardsType, 'raffleId' | 'awardId'>) {
    try {
        const url = `/raffles/${raffleId}/awards/${awardId}`
        const {data} = await api.delete<string>(url)

        return data

    } catch (error) {
        if (isAxiosError(error) && error.response) {
            console.log(error);
            throw new Error(error.response.data.error);
        }
    }
}