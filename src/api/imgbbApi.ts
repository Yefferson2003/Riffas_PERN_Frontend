import axios from "axios";

const IMGBB_API_KEY = import.meta.env.VITE_IMGBB_API_KEY;
const IMGBB_API_URL = "https://api.imgbb.com/1/upload";


/**
 * Sube una imagen a imgbb y retorna la URL de la imagen
 * @param imgElement HTMLImageElement generado por html2canvas
 * @returns URL de la imagen subida
 */
export const uploadImageToImgbb = async (imgElement: HTMLImageElement): Promise<string> => {
	// Extraer base64 del src del <img>
	const src = imgElement.src;
	// src es tipo 'data:image/png;base64,...'
	const base64 = src.split(',')[1];
	if (!base64) throw new Error('No se pudo extraer el base64 de la imagen');

	const expiration = 2592000; // 1 mes en segundos
	const url = `${IMGBB_API_URL}?expiration=${expiration}&key=${IMGBB_API_KEY}`;
	const formData = new FormData();
	formData.append("image", base64);

	try {
		const response = await axios.post(url, formData);
		if (response.data && response.data.data && response.data.data.url) {
			return response.data.data.url_viewer;
		}
		throw new Error("No se pudo obtener la URL de la imagen subida a imgbb");
	} catch (error) {
		console.error("❌ Error al subir imagen a imgbb:", error);
		throw error;
}
};
