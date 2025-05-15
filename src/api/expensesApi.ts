import { isAxiosError } from "axios";
import api from "../lib/axios";
import { ExpenseFormType, expensesSchema, responseExpensesSchema, responseExpensesTotal, responseExpensesWithUserSchema } from "../types";

export type PaginationType = {
    page: number;
    limit: number;
}

type ExpensesType = {
    raffleId: string;
    expenseId: string;
    params: PaginationType;
    expenseData: ExpenseFormType
}

export async function getExpenses( {raffleId, params} :  Pick<ExpensesType, 'raffleId' | 'params'>) {
    try {
        const url = `/raffles/${raffleId}/expenses-by-raffle`
        const { data } = await api.get(url, {params})
        
        const response = responseExpensesWithUserSchema.safeParse(data)
        
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
export async function getExpensesTotal( {raffleId} :  Pick<ExpensesType, 'raffleId'>) {
    try {
        const url = `/raffles/${raffleId}/expenses-total`
        const { data } = await api.get(url)
        
        const response = responseExpensesTotal.safeParse(data)
        
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
export async function getExpensesTotalByUser( {raffleId} :  Pick<ExpensesType, 'raffleId'>) {
    try {
        const url = `/raffles/${raffleId}/expenses-total-user`
        const { data } = await api.get(url)
        
        const response = responseExpensesTotal.safeParse(data)
        
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

export async function getExpensesByUser( {raffleId, params} :  Pick<ExpensesType, 'raffleId' | 'params'>) {
    try {
        const url = `/raffles/${raffleId}/expenses`
        const { data } = await api.get(url, {params})
        
        const response = responseExpensesSchema.safeParse(data)
        
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

export async function getExpensesById( {raffleId, expenseId} :  Pick<ExpensesType, 'raffleId' | 'expenseId'>) {
    try {
        const url = `/raffles/${raffleId}/expenses/${expenseId}`
        const { data } = await api.get(url,)
        
        const response = expensesSchema.safeParse(data)
        
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

export async function addExpense( { raffleId, expenseData } :  Pick<ExpensesType, 'raffleId' | 'expenseData'>) {
    try {
        const url = `/raffles/${raffleId}/expenses`
        const { data } = await api.post<string>(url, expenseData)
        return data
    } catch (error) {
        if (isAxiosError(error) && error.response) {
            console.log(error);
            throw new Error(error.response.data.error);
        }
    }
}

export async function updateExpense( { raffleId, expenseData, expenseId } :  Pick<ExpensesType, 'raffleId' | 'expenseData' | 'expenseId'>) {
    try {
        const url = `/raffles/${raffleId}/expenses/${expenseId}`
        const { data } = await api.put<string>(url, expenseData)
        return data
    } catch (error) {
        if (isAxiosError(error) && error.response) {
            console.log(error);
            throw new Error(error.response.data.error);
        }
    }
}

export async function deleteExpense( { raffleId, expenseId } :  Pick<ExpensesType, 'raffleId' | 'expenseId'>) {
    try {
        const url = `/raffles/${raffleId}/expenses/${expenseId}`
        const { data } = await api.delete<string>(url)
        return data
    } catch (error) {
        if (isAxiosError(error) && error.response) {
            console.log(error);
            throw new Error(error.response.data.error);
        }
    }
}