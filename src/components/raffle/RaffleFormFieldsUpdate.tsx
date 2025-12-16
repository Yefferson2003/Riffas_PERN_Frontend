import { Box, FormControl, Popover, TextField, Typography } from "@mui/material";
import { MobileDateTimePicker } from "@mui/x-date-pickers";
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DemoContainer } from '@mui/x-date-pickers/internals/demo';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { FieldErrors, UseFormRegister, UseFormSetValue, UseFormWatch } from "react-hook-form";
import { UpdateRaffleForm } from "../../types";
import PhoneNumberInput from "../PhoneNumberInput";
import CloudinaryUploadWidget from "./CloudinaryUploadWidget";

// Formulario para editar/crear rifa usando UpdateRaffleForm

type RaffleFormFieldsUpdateProps = {
    register: UseFormRegister<UpdateRaffleForm>;
    setValue: UseFormSetValue<UpdateRaffleForm>;
    watch: UseFormWatch<UpdateRaffleForm>;
    errors: FieldErrors<UpdateRaffleForm>;
    colorPickerAnchor: HTMLElement | null;
    setColorPickerAnchor: (el: HTMLElement | null) => void;
};

const RaffleFormFieldsUpdate = ({
    register,
    setValue,
    watch,
    errors,
    colorPickerAnchor,
    setColorPickerAnchor,
}: RaffleFormFieldsUpdateProps) => {
    const startDate = watch("startDate");
    const editDate = watch("editDate");
    const playDate = watch("playDate");
    const contactRifero = watch("contactRifero");
    // Si la imagen no ha cambiado, usar la de props iniciales (del defaultValues)
    const banerImgUrl = watch("banerImgUrl") || '';
    const banerMovileImgUrl = watch("banerMovileImgUrl") || '';
    const imgIconoUrl = watch("imgIconoUrl") || '';
    const color = watch("color");

    // Colores predefinidos
    const presetColors = [
        '#1976d2', '#d32f2f', '#388e3c', '#f57c00', '#7b1fa2', '#c2185b',
        '#00796b', '#5d4037', '#455a64', '#e91e63', '#9c27b0', '#673ab7',
    ];

    const handleColorSelect = (color: string) => {
        setValue('color', color);
        setColorPickerAnchor(null);
    };

    return (
        <FormControl size="small" fullWidth sx={{ display: 'flex', gap: 2 }}>
        <TextField id="name" label="Nombre" variant="outlined"
            error={!!errors.name}
            helperText={errors.name?.message}
            {...register('name', { required: 'Nombre Obligatorio' })}
        />
        <TextField id="nameResponsable" label="Representante Legal" variant="outlined"
            error={!!errors.nameResponsable}
            helperText={errors.nameResponsable?.message}
            {...register('nameResponsable', { required: 'Nombre del Responsable Obligatorio' })}
        />
        <TextField id="nitResponsable" label="Número de identificación" variant="outlined"
            error={!!errors.nitResponsable}
            helperText={errors.nitResponsable?.message}
            {...register('nitResponsable', {
            required: 'Nit Obligatorio',
            pattern: {
                value: /^[0-9]+$/,
                message: 'Solo se permiten números',
            },
            })}
        />
        <div>
            <p className="mb-2 text-sm font-medium text-gray-700">Número de contacto para clientes</p>
            <PhoneNumberInput
            value={contactRifero || ''}
            onChange={(value) => {
                setValue('contactRifero', value);
            }}
            />
            <p className="mt-1 text-xs text-gray-500">
            Número de WhatsApp para contacto con los clientes
            </p>
        </div>
        <TextField id="description" label="Descripción" variant="outlined"
            error={!!errors.description}
            helperText={errors.description?.message}
            multiline
            maxRows={4}
            {...register('description', {
            required: 'Descripción Obligatoria',
            minLength: {
                value: 10,
                message: "la descripción debe tener minimo 10 caracteres",
            },
            })}
        />
        {/* Campo de color mejorado */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <TextField
            id="color"
            label="Color de la rifa"
            variant="outlined"
            value={color || ''}
            error={!!errors.color}
            helperText={errors.color?.message || 'Selecciona el color principal de la rifa'}
            {...register('color')}
            sx={{ flex: 1 }}
            />
            <Box sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 1
            }}>
            <Box
                onClick={(e) => setColorPickerAnchor(e.currentTarget)}
                sx={{
                width: '50px',
                height: '50px',
                backgroundColor: color || '#1976d2',
                borderRadius: '12px',
                cursor: 'pointer',
                border: '3px solid #fff',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15), 0 2px 6px rgba(0, 0, 0, 0.1)',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                '&:hover': {
                    transform: 'scale(1.05)',
                    boxShadow: '0 6px 16px rgba(0, 0, 0, 0.2), 0 3px 8px rgba(0, 0, 0, 0.15)',
                },
                '&:active': {
                    transform: 'scale(0.98)',
                },
                }}
            />
            <Typography variant="caption" sx={{ color: '#666', fontSize: '0.7rem' }}>
                Elegir color
            </Typography>
            </Box>
        </Box>
        <Popover
            open={Boolean(colorPickerAnchor)}
            anchorEl={colorPickerAnchor}
            onClose={() => setColorPickerAnchor(null)}
            anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'center',
            }}
            transformOrigin={{
            vertical: 'top',
            horizontal: 'center',
            }}
            sx={{
            '& .MuiPopover-paper': {
                borderRadius: '16px',
                padding: '16px',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
                border: '1px solid rgba(0, 0, 0, 0.05)',
            }
            }}
        >
            <Box sx={{ width: '280px' }}>
            <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
                Selecciona un color
            </Typography>
            <Box sx={{
                display: 'grid',
                gridTemplateColumns: 'repeat(6, 1fr)',
                gap: 1.5,
                mb: 3
            }}>
                {presetColors.map((color) => (
                <Box
                    key={color}
                    sx={{
                    width: 32,
                    height: 32,
                    backgroundColor: color,
                    borderRadius: '8px',
                    cursor: 'pointer',
                    border: '2px solid #fff',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.10)',
                    '&:hover': {
                        border: '2px solid #1976d2',
                    },
                    }}
                    onClick={() => handleColorSelect(color)}
                />
                ))}
            </Box>
            <Box sx={{ textAlign: 'center' }}>
                <input
                type="color"
                value={color || '#1976d2'}
                onChange={(e) => setValue('color', e.target.value)}
                style={{
                    width: '60px',
                    height: '40px',
                    border: '2px solid #e0e0e0',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    backgroundColor: 'transparent',
                }}
                />
            </Box>
            </Box>
        </Popover>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DemoContainer components={['MobileDateTimePicker']}>
            <MobileDateTimePicker label="Fecha de Inicio"
                value={startDate}
                onChange={(date) => setValue('startDate', date, { shouldValidate: true })}
                format="DD/MM/YYYY HH:mm"
            />
            <MobileDateTimePicker label="Fecha de juego"
                value={playDate}
                onChange={(date) => setValue('playDate', date, { shouldValidate: true })}
                format="DD/MM/YYYY HH:mm"
            />
            <MobileDateTimePicker label="Fecha limite de Compra"
                value={editDate}
                onChange={(date) => setValue('editDate', date, { shouldValidate: true })}
                format="DD/MM/YYYY HH:mm"
            />
            </DemoContainer>
        </LocalizationProvider>
        {/* Banner principal */}
        <CloudinaryUploadWidget
            label="Subir Banner Principal"
            onUpload={url => setValue('banerImgUrl', url, { shouldValidate: true })}
            previewUrl={banerImgUrl}
            previewWidth={320}
            previewHeight={120}
            onClear={() => setValue('banerImgUrl', '', { shouldValidate: true })}
            previewStyle={{
                boxShadow: '0 4px 16px rgba(0,0,0,0.18)',
                borderRadius: 12,
                border: 'none',
                background: '#fff',
            }}
        />
        {/* Banner móvil */}
        <CloudinaryUploadWidget
            label="Subir Banner Móvil"
            onUpload={url => setValue('banerMovileImgUrl', url, { shouldValidate: true })}
            previewUrl={banerMovileImgUrl}
            previewWidth={180}
            previewHeight={120}
            onClear={() => setValue('banerMovileImgUrl', '', { shouldValidate: true })}
            previewStyle={{
                boxShadow: '0 4px 16px rgba(0,0,0,0.18)',
                borderRadius: 12,
                border: 'none',
                background: '#fff',
            }}
        />
        {/* Icono */}
        <CloudinaryUploadWidget
            label="Subir Icono"
            onUpload={url => setValue('imgIconoUrl', url, { shouldValidate: true })}
            previewUrl={imgIconoUrl ?? undefined}
            previewWidth={80}
            previewHeight={80}
            onClear={() => setValue('imgIconoUrl', '', { shouldValidate: true })}
            previewStyle={{
                boxShadow: '0 4px 16px rgba(0,0,0,0.18)',
                borderRadius: 12,
                border: 'none',
                background: '#fff',
            }}
        />
        </FormControl>
    );
};

export default RaffleFormFieldsUpdate;
