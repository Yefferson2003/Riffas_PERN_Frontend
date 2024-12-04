import axios from "axios";

const CLOUDINARY_URL = import.meta.env.VITE_CLOUDINARY_URL;
const CLOUDINARY_PRESET = import.meta.env.VITE_CLOUDINARY_PRESET;

interface UploadResponse {
    secure_url: string;
}

export const uploadImageToCloudinary = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", CLOUDINARY_PRESET);

    const response = await axios.post<UploadResponse>(CLOUDINARY_URL, formData, {
        headers: {
            "Content-Type": "multipart/form-data",
        },
    });
    console.log(response.data);
    console.log(response.data.secure_url);
    
    return response.data.secure_url;
};