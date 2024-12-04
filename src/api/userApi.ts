import { isAxiosError } from "axios";
import api from "../lib/axios";
import { PasswordEditForm, responseGetUsersForAdminSchema, UserEditForm, UserForm, userSchema, usersSelect } from "../types";

export async function getUsers(params= {}) {
    try {
        const {data} = await api.get('/users', {params})
        const response = responseGetUsersForAdminSchema.safeParse(data)
        
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
export async function getUsersBySelect() {
    try {
        const {data} = await api.get('/users/select')
        const response = usersSelect.safeParse(data)
        
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

export async function getUserById(userId: number) {
    try {
        const {data} = await api.get(`/users/${userId}`)
        const response = userSchema.safeParse(data)
        
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

export async function createUser(formData: UserForm) {
    try {
        const {data} = await api.post<string>('/auth/create-user', formData)
        return data
    } catch (error) {
        if (isAxiosError(error) && error.response) {
            console.log(error);
            throw new Error(error.response.data.error);
        }
    }
}

export async function editUser({formData, userId} : {formData : UserEditForm, userId: number}) {
    try {
        const {data} = await api.put<string>(`/users/${userId}`, formData)
        return data
    } catch (error) {
        if (isAxiosError(error) && error.response) {
            console.log(error);
            throw new Error(error.response.data.error);
        }
    }
}

export async function editPassowrdUser({formData, userId} : {formData : PasswordEditForm, userId: number}) {
    try {
        const {data} = await api.put<string>(`/users/${userId}/update-password`, formData)
        return data
    } catch (error) {
        if (isAxiosError(error) && error.response) {
            console.log(error);
            throw new Error(error.response.data.error);
        }
    }
}
export async function deleteUser( userId : number) {
    try {
        const {data} = await api.delete<string>(`/users/${userId}`)
        return data
    } catch (error) {
        if (isAxiosError(error) && error.response) {
            console.log(error);
            throw new Error(error.response.data.error);
        }
    }
}