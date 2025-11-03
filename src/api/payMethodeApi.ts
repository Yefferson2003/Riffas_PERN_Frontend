import { isAxiosError } from "axios";
import api from "../lib/axios";
import { AssignPayMethodToRaffleFormType, payMethodeSchema, payMethodesSchema, PayMethodFormType, rafflePayMethodeSchemaArray } from "../types";

type PayMethodeApi = {
    payMethodId: string | number;
    formData: PayMethodFormType;
    assignPayMethodToRaffleFormData: AssignPayMethodToRaffleFormType
    raffleId: string | number;
    rafflePayMethodId: string | number;
}

// Obtener todos los métodos de pago (solo admin)
export async function getPayMethods() {
    try {
        const { data } = await api.get('/payment-methods');

        const response = payMethodesSchema.safeParse(data)
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

// Obtener métodos de pago activos
export async function getActivePayMethods() {
    try {
        const { data } = await api.get('/payment-methods/active');
            const response = payMethodesSchema.safeParse(data)
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

// Obtener un método de pago por ID
export async function getPayMethodById({ payMethodId }: Pick<PayMethodeApi, 'payMethodId'>) {
    try {
        const { data } = await api.get(`/payment-methods/${payMethodId}`);
        const response = payMethodeSchema.safeParse(data);
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

// Crear un nuevo método de pago
export async function createPayMethod({formData}: Pick<PayMethodeApi, 'formData'>) {
    try {
        const { data } = await api.post<string>('/payment-methods', formData);
        return data;
    } catch (error) {
        if (isAxiosError(error) && error.response) {
            console.log(error);
            throw new Error(error.response.data.error);
        }
    }
}

// Actualizar un método de pago
export async function updatePayMethod({ payMethodId, formData }: Pick<PayMethodeApi, 'payMethodId' | 'formData'>) {
    try {
        const { data } = await api.put<string>(`/payment-methods/${payMethodId}`, formData);
        return data;
    } catch (error) {
        if (isAxiosError(error) && error.response) {
            console.log(error);
            throw new Error(error.response.data.error);
        }
    }
}

// Cambiar estado activo/inactivo de un método de pago
export async function togglePayMethodStatus(payMethodId: string | number) {
    try {
        const { data } = await api.patch<string>(`/payment-methods/${payMethodId}/status-isActive`);
        return data;
    } catch (error) {
        if (isAxiosError(error) && error.response) {
            console.log(error);
            throw new Error(error.response.data.error);
        }
    }
}

// ===== MÉTODOS DE PAGO POR RIFA =====

// Obtener métodos de pago de una rifa específica (todos)
export async function getRafflePayMethods(raffleId: string | number) {
    try {
        const { data } = await api.get(`/raffle-payment-methods/${raffleId}/payment-methods/all`);
        const response = rafflePayMethodeSchemaArray.safeParse(data);
        console.log(response.error);
        
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

// Obtener métodos de pago activos de una rifa específica (para el select de pagos)
export async function getActiveRafflePayMethods(raffleId: string | number) {
    try {
        const { data } = await api.get(`/raffle-payment-methods/${raffleId}/payment-methods`);
        const response = rafflePayMethodeSchemaArray.safeParse(data);
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

// // Obtener todos los métodos de pago de una rifa (incluidos inactivos)
// export async function getAllRafflePayMethods(raffleId: string | number) {
//     try {
//         const { data } = await api.get(`/raffle-payment-methods/${raffleId}/payment-methods/all`);
//         return data;
//     } catch (error) {
//         if (isAxiosError(error) && error.response) {
//             console.log(error);
//             throw new Error(error.response.data.error);
//         }
//     }
// }

// Asignar método de pago a una rifa
export async function assignPayMethodToRaffle({ raffleId, assignPayMethodToRaffleFormData }:  Pick<PayMethodeApi, 'assignPayMethodToRaffleFormData' | 'raffleId'> ) {
    try {
        const { data } = await api.post(`/raffle-payment-methods/${raffleId}/payment-methods`, assignPayMethodToRaffleFormData);
        return data;
    } catch (error) {
        if (isAxiosError(error) && error.response) {
            console.log(error);
            throw new Error(error.response.data.error);
        }
    }
}

// // Actualizar método de pago asignado a una rifa
// export async function updateRafflePayMethod({ 
//     rafflePayMethodId, 
//     updateData 
// }: { 
//     rafflePayMethodId: string | number; 
//     updateData: {
//         accountNumber?: string;
//         accountHolder?: string;
//         type?: 'bank_transfer' | 'digital_wallet' | 'cash' | 'card' | 'crypto';
//         bankName?: string;
//         instructions?: string;
//         fee?: number;
//         order?: number;
//         isActive?: boolean;
//     }
// }) {
//     try {
//         const { data } = await api.put(`/raffle-payment-methods/payment-methods/${rafflePayMethodId}`, updateData);
//         return data;
//     } catch (error) {
//         if (isAxiosError(error) && error.response) {
//             console.log(error);
//             throw new Error(error.response.data.error);
//         }
//     }
// }

// // Actualizar orden de métodos de pago
// export async function updatePayMethodsOrder({ 
//     raffleId, 
//     payMethodsOrder 
// }: { 
//     raffleId: string | number; 
//     payMethodsOrder: Array<{ id: number; order: number }> 
// }) {
//     try {
//         const { data } = await api.patch(`/raffle-payment-methods/${raffleId}/payment-methods/order`, {
//             payMethodsOrder
//         });
//         return data;
//     } catch (error) {
//         if (isAxiosError(error) && error.response) {
//             console.log(error);
//             throw new Error(error.response.data.error);
//         }
//     }
// }

// Cambiar estado activo/inactivo de un método de pago de rifa
export async function toggleRafflePayMethodStatus({ rafflePayMethodId }: Pick<PayMethodeApi, 'rafflePayMethodId'>) {
    try {
        const { data } = await api.patch<string>(`/raffle-payment-methods/payment-methods/${rafflePayMethodId}/deactivate`);
        return data;
    } catch (error) {
        if (isAxiosError(error) && error.response) {
            console.log(error);
            throw new Error(error.response.data.error);
        }
    }
}

// // Eliminar asignación de método de pago a rifa
// export async function removePayMethodFromRaffle(rafflePayMethodId: string | number) {
//     try {
//         const { data } = await api.delete(`/raffle-payment-methods/payment-methods/${rafflePayMethodId}`);
//         return data;
//     } catch (error) {
//         if (isAxiosError(error) && error.response) {
//             console.log(error);
//             throw new Error(error.response.data.error);
//         }
//     }
// }