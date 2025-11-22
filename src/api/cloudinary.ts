import axios from "axios";

const CLOUDINARY_URL = import.meta.env.VITE_CLOUDINARY_URL;
const CLOUDINARY_PRESET = import.meta.env.VITE_CLOUDINARY_PRESET;

interface UploadResponse {
    secure_url: string;
    public_id: string;
    format: string;
    resource_type: string;
    pages?: number; // Para PDFs
}

interface UploadOptions {
    resource_type?: 'image' | 'video' | 'raw' | 'auto';
    format?: string;
    public_id?: string;
    folder?: string;
    tags?: string[];
}

// 🖼️ Función original para imágenes
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

// 📄 Función para subir PDF como archivo crudo
export const uploadPDFToCloudinary = async (
    pdfBlob: Blob, 
    filename?: string,
    options: UploadOptions = {}
): Promise<UploadResponse> => {
    const formData = new FormData();
    
    // Crear File desde Blob con nombre personalizado
    const pdfFile = new File([pdfBlob], filename || `recibo_${Date.now()}.pdf`, {
        type: 'application/pdf'
    });
    
    formData.append("file", pdfFile);
    formData.append("upload_preset", CLOUDINARY_PRESET);
    formData.append("resource_type", options.resource_type || "raw"); // 'raw' para PDFs
    
    // Opciones adicionales
    if (options.folder) formData.append("folder", options.folder);
    if (options.public_id) formData.append("public_id", options.public_id);
    if (options.tags) formData.append("tags", options.tags.join(','));

    try {
        const response = await axios.post<UploadResponse>(CLOUDINARY_URL, formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });
        
        console.log('📄 PDF subido a Cloudinary:', {
            url: response.data.secure_url,
            public_id: response.data.public_id,
            size: `${(pdfBlob.size / 1024).toFixed(2)} KB`
        });
        
        return response.data;
    } catch (error) {
        console.error('❌ Error al subir PDF a Cloudinary:', error);
        throw new Error(`Error uploading PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
};

// 🖼️ Función para convertir PDF a imagen en Cloudinary
export const uploadPDFAsImageToCloudinary = async (
    pdfBlob: Blob, 
    filename?: string,
    options: UploadOptions & { page?: number } = {}
): Promise<UploadResponse> => {
    const formData = new FormData();
    
    // Crear File desde Blob
    const pdfFile = new File([pdfBlob], filename || `recibo_${Date.now()}.pdf`, {
        type: 'application/pdf'
    });
    
    formData.append("file", pdfFile);
    formData.append("upload_preset", CLOUDINARY_PRESET);
    
    // 🔄 Configuración corregida para evitar errores 400
    // NO usar resource_type="image" para PDFs, Cloudinary lo detecta automáticamente
    
    // Opciones adicionales
    if (options.folder) formData.append("folder", options.folder);
    if (options.public_id) formData.append("public_id", options.public_id);
    if (options.tags) formData.append("tags", options.tags.join(','));
    
    // ⚙️ Transformaciones como parámetros separados (más compatible)
    if (options.format) formData.append("format", options.format);
    if (options.page) formData.append("page", options.page.toString());

    try {
        const response = await axios.post<UploadResponse>(CLOUDINARY_URL, formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });
        
        console.log('🖼️ PDF convertido a imagen en Cloudinary:', {
            url: response.data.secure_url,
            public_id: response.data.public_id,
            format: response.data.format
        });
        
        return response.data;
    } catch (error) {
        console.error('❌ Error al convertir PDF a imagen en Cloudinary:', error);
        
        // 🔄 Si falla la conversión, intentar subirlo como PDF normal
        console.log('🔄 Intentando subir como PDF normal...');
        return await uploadPDFToCloudinary(pdfBlob, filename, {
            ...options,
            resource_type: 'raw'
        });
    }
};


// 📱 Función para generar URL optimizada para WhatsApp
export const generateWhatsAppOptimizedURL = (cloudinaryUrl: string, publicId: string): string => {
    // Extraer el cloud name de la URL
    const cloudNameMatch = cloudinaryUrl.match(/\/\/res\.cloudinary\.com\/([^/]+)\//); 
    const cloudName = cloudNameMatch ? cloudNameMatch[1] : 'default';
    
    // 🎯 Generar URL optimizada para WhatsApp con transformaciones específicas
    const optimizedUrl = `https://res.cloudinary.com/${cloudName}/image/upload/` +
        `q_auto:good,` +     // Calidad automática optimizada
        `f_auto,` +          // Formato automático (WebP si es compatible, sino JPEG)
        `w_800,` +           // Ancho máximo 800px (perfecto para WhatsApp)
        `h_1200,` +          // Alto máximo 1200px 
        `c_fit,` +           // Ajuste proporcional sin distorsión
        `dpr_auto,` +        // Densidad de píxeles automática
        `fl_progressive/` +   // Carga progresiva
        `${publicId}`;
        
    console.log('📱 URL optimizada para WhatsApp generada:', optimizedUrl);
    return optimizedUrl;
};

// 🔍 Función alternativa: URL directa para previsualización
export const generateDirectImageURL = (cloudinaryUrl: string, publicId: string): string => {
    const cloudNameMatch = cloudinaryUrl.match(/\/\/res\.cloudinary\.com\/([^/]+)\//); 
    const cloudName = cloudNameMatch ? cloudNameMatch[1] : 'default';
    
    // 🖼️ URL directa como imagen JPG (garantiza previsualización)
    const directUrl = `https://res.cloudinary.com/${cloudName}/image/upload/` +
        `f_jpg,` +           // Forzar formato JPEG 
        `q_80,` +            // Calidad 80% (buen equilibrio)
        `w_600,` +           // Ancho fijo 600px
        `${publicId}.jpg`;   // Extensión explícita
        
    console.log('🔗 URL directa de imagen generada:', directUrl);
    return directUrl;
};

// 🧪 Función para probar múltiples formatos de URL
export const generateMultipleImageURLs = (cloudinaryUrl: string, publicId: string) => {
    const cloudNameMatch = cloudinaryUrl.match(/\/\/res\.cloudinary\.com\/([^/]+)\//); 
    const cloudName = cloudNameMatch ? cloudNameMatch[1] : 'default';
    
    const urls = {
        // URL original
        original: cloudinaryUrl,
        
        // URL optimizada para WhatsApp
        whatsapp: `https://res.cloudinary.com/${cloudName}/image/upload/q_auto:good,f_auto,w_800,h_1200,c_fit,dpr_auto/${publicId}`,
        
        // URL directa JPEG
        jpeg: `https://res.cloudinary.com/${cloudName}/image/upload/f_jpg,q_80,w_600/${publicId}.jpg`,
        
        // URL PNG (si el original es PNG)
        png: `https://res.cloudinary.com/${cloudName}/image/upload/f_png,q_auto,w_600/${publicId}.png`,
        
        // URL simple sin transformaciones
        simple: `https://res.cloudinary.com/${cloudName}/image/upload/${publicId}`
    };
    
    console.log('🎯 URLs múltiples generadas:', urls);
    return urls;
};

// 📦 Función para subir múltiples PDFs
// export const uploadMultiplePDFsToCloudinary = async (
//     pdfBlobs: { blob: Blob; filename: string }[],
//     options: UploadOptions = {}
// ): Promise<UploadResponse[]> => {
//     console.log(`🚀 Iniciando subida de ${pdfBlobs.length} PDFs a Cloudinary...`);
    
//     const uploadPromises = pdfBlobs.map(async ({ blob, filename }, index) => {
//         const fileOptions = {
//             ...options,
//             public_id: options.public_id ? `${options.public_id}_${index + 1}` : undefined,
//             tags: [...(options.tags || []), `batch_${Date.now()}`, `item_${index + 1}`]
//         };
        
//         try {
//             const result = await uploadPDFToCloudinary(blob, filename, fileOptions);
//             console.log(`✅ PDF ${index + 1}/${pdfBlobs.length} subido: ${filename}`);
//             return result;
//         } catch (error) {
//             console.error(`❌ Error subiendo PDF ${index + 1}: ${filename}`, error);
//             throw error;
//         }
//     });
    
//     try {
//         const results = await Promise.all(uploadPromises);
//         console.log(`🎉 Todos los PDFs (${results.length}) subidos exitosamente`);
//         return results;
//     } catch (error) {
//         console.error('❌ Error en subida masiva de PDFs:', error);
//         throw new Error(`Error uploading multiple PDFs: ${error instanceof Error ? error.message : 'Unknown error'}`);
//     }
// };

// 🖼️ Función para convertir múltiples PDFs a imágenes
// export const uploadMultiplePDFsAsImagesToCloudinary = async (
//     pdfBlobs: { blob: Blob; filename: string }[],
//     options: UploadOptions & { page?: number } = {}
// ): Promise<UploadResponse[]> => {
//     console.log(`🚀 Iniciando conversión de ${pdfBlobs.length} PDFs a imágenes en Cloudinary...`);
    
//     const uploadPromises = pdfBlobs.map(async ({ blob, filename }, index) => {
//         const fileOptions = {
//             ...options,
//             public_id: options.public_id ? `${options.public_id}_img_${index + 1}` : undefined,
//             tags: [...(options.tags || []), `batch_images_${Date.now()}`, `item_${index + 1}`]
//         };
        
//         try {
//             const result = await uploadPDFAsImageToCloudinary(blob, filename, fileOptions);
//             console.log(`✅ PDF ${index + 1}/${pdfBlobs.length} convertido a imagen: ${filename}`);
//             return result;
//         } catch (error) {
//             console.error(`❌ Error convirtiendo PDF ${index + 1} a imagen: ${filename}`, error);
//             throw error;
//         }
//     });
    
//     try {
//         const results = await Promise.all(uploadPromises);
//         console.log(`🎉 Todos los PDFs (${results.length}) convertidos a imágenes exitosamente`);
//         return results;
//     } catch (error) {
//         console.error('❌ Error en conversión masiva de PDFs a imágenes:', error);
//         throw new Error(`Error converting multiple PDFs to images: ${error instanceof Error ? error.message : 'Unknown error'}`);
//     }
// };