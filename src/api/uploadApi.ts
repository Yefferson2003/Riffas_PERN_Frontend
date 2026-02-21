import { isAxiosError } from "axios";
import api from "../lib/axios";

type UploadImageResponse = {
    url: string;
}

export const uploadImageToB2 = async (file: File): Promise<string> => {
    try {
        const formData = new FormData();
        formData.append("image", file);

        const response = await api.post<UploadImageResponse>(
            "/upload",
            formData,
            {
            headers: {
                "Content-Type": "multipart/form-data",
            },
            }
        );

        return response.data.url;
    } catch (error) {
        if (isAxiosError(error) && error.response) {
            throw new Error(error.response.data.error);
        }
        throw error;
    }
}