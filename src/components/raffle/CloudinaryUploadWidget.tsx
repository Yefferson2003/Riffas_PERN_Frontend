import { Box, Button, Typography, IconButton } from "@mui/material";
import CloseIcon from '@mui/icons-material/Close';
import { useRef, useState } from "react";

interface CloudinaryUploadWidgetProps {
    label: string;
    onUpload: (url: string) => void;
    previewUrl?: string;
    previewWidth?: number;
    previewHeight?: number;
    onClear?: () => void;
    previewStyle?: React.CSSProperties;
}

const CLOUDINARY_UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_PRESET;
const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;

const CloudinaryUploadWidget = ({
    label,
    onUpload,
    previewUrl,
    previewWidth = 320,
    previewHeight = 120,
    onClear,
    previewStyle,
}: CloudinaryUploadWidgetProps) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [loading, setLoading] = useState(false);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setLoading(true);
        const formData = new FormData();
        formData.append("file", file);
        formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
        try {
        const res = await fetch(
            `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
            {
            method: "POST",
            body: formData,
            }
        );
        const data = await res.json();
        if (data.secure_url) {
            onUpload(data.secure_url);
        }
        } finally {
        setLoading(false);
        }
    };

    return (
        <Box>
        <Typography variant="subtitle2" sx={{ mb: 1 }}>{label}</Typography>
        <Button
            variant="outlined"
            fullWidth
            component="span"
            onClick={() => fileInputRef.current?.click()}
            disabled={loading}
            sx={{ mb: 1 }}
        >
            {loading ? "Subiendo..." : label}
        </Button>
        <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            style={{ display: "none" }}
            onChange={handleFileChange}
        />
        {previewUrl && (
            <Box sx={{ mt: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                <img
                    src={previewUrl}
                    alt="preview"
                    style={{
                        width: previewWidth,
                        height: previewHeight,
                        objectFit: 'contain',
                        borderRadius: 12,
                        border: 'none',
                        background: '#fff',
                        boxShadow: '0 4px 16px rgba(0,0,0,0.18)',
                        ...previewStyle,
                    }}
                />
                {onClear && (
                    <IconButton
                        size="small"
                        onClick={onClear}
                        sx={{
                            position: 'absolute',
                            top: 4,
                            right: 4,
                            background: '#fff',
                            border: '1px solid #ccc',
                            zIndex: 2,
                            p: 0.5,
                            '&:hover': { background: '#eee' }
                        }}
                        aria-label="Limpiar imagen"
                    >
                        <CloseIcon fontSize="small" />
                    </IconButton>
                )}
            </Box>
        )}
        </Box>
    );
};

export default CloudinaryUploadWidget;
