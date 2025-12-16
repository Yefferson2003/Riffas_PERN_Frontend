import { Box, FormControl, Popover, Slider, TextField, Typography } from "@mui/material";
import { MobileDateTimePicker } from "@mui/x-date-pickers";
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DemoContainer } from '@mui/x-date-pickers/internals/demo';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { FieldErrors, UseFormRegister, UseFormSetValue, UseFormWatch } from "react-hook-form";
import { CreateRaffleForm } from "../../types";
import PhoneNumberInput from "../PhoneNumberInput";
import CloudinaryUploadWidget from "./CloudinaryUploadWidget";

type RaffleFormFieldsProps = {
    register: UseFormRegister<CreateRaffleForm>
    setValue: UseFormSetValue<CreateRaffleForm>
    watch: UseFormWatch<CreateRaffleForm>
    errors: FieldErrors<CreateRaffleForm>
    colorPickerAnchor: HTMLElement | null;
    setColorPickerAnchor: (el: HTMLElement | null) => void;
};

const RaffleFormFields = ({
    register, 
    setValue, 
    watch,
    errors,
    colorPickerAnchor,
    setColorPickerAnchor
}: RaffleFormFieldsProps) => {
    const startDate = watch("startDate");
    const editDate = watch("editDate");
    const contactRifero = watch("contactRifero");
    const quantity = watch("quantity");
    // Para previsualización de imágenes
    const banerImgUrl = watch("banerImgUrl");
    const banerMovileImgUrl = watch("banerMovileImgUrl");
    const imgIconoUrl = watch("imgIconoUrl");

    const marks = [{ value: 100, label: '100' }];
    for (let i = 1000; i <= 10000; i += 1000) {
        marks.push({ value: i, label: i.toString() });
    }

    const valuetext = (value: number | number[]) => {
        return (value as number).toString();
    };

    // Colores predefinidos populares para rifas
    const presetColors = [
        '#1976d2', // Azul MUI
        '#d32f2f', // Rojo
        '#388e3c', // Verde
        '#f57c00', // Naranja
        '#7b1fa2', // Púrpura
        '#c2185b', // Rosa
        '#00796b', // Teal
        '#5d4037', // Marrón
        '#455a64', // Gris azulado
        '#e91e63', // Pink
        '#9c27b0', // Purple
        '#673ab7', // Deep Purple
    ];

    const handleColorSelect = (color: string) => {
        setValue('color', color);
        setColorPickerAnchor(null);
    };

    return (
        <FormControl size="small" fullWidth sx={{display: 'flex', gap: 2}}>

            <TextField id="name" label="Nombre" variant="outlined"
                error={!!errors.name}
                helperText={errors.name?.message}
                {...register('name', {required: 'Nombre Obligatorio'})}
            />
            <TextField id="nameResponsable" label="Representante Legal" variant="outlined" 
                error={!!errors.nameResponsable}
                helperText={errors.nameResponsable?.message}
                {...register('nameResponsable', {required: 'Nombre del Responsable Obligatorio'})}
            />
            
            <TextField id="nitResponsable" label="Número de identificación" variant="outlined" 
                error={!!errors.nitResponsable}
                helperText={errors.nitResponsable?.message}
                {...register('nitResponsable', {required: 'Nit Obligatorio',
                    pattern: {
                        value: /^[0-9]+$/, // Solo números
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
                {...register('description', {required: 'Descripción Obligatoria',minLength: {
                    value: 10,
                    message: "la descripción debe tener minimo 10 caracteres",
                },})}
            />
            
            <TextField id="price" label="Precio" variant="outlined" 
                error={!!errors.price}
                helperText={errors.price?.message}
                {...register('price', {required: 'Precio Obligatorio',
                    pattern: {
                        value: /^[0-9]+(?:\.[0-9]{1,2})?$/, // Solo números
                        message: 'Solo se permiten números',
                    },
                })}
                
            />

            {/* Campo de color mejorado */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <TextField 
                    id="color" 
                    label="Color de la rifa" 
                    variant="outlined" 
                    value={watch('color')}
                    error={!!errors.color}
                    helperText={errors.color?.message || 'Selecciona el color principal de la rifa'}
                    {...register('color', {required: 'Color Obligatorio'})}
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
                            backgroundColor: watch('color') || '#1976d2',
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

            {/* Popover con selector de colores */}
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
                    
                    {/* Colores predefinidos */}
                    <Box sx={{ 
                        display: 'grid', 
                        gridTemplateColumns: 'repeat(6, 1fr)', 
                        gap: 1.5, 
                        mb: 3 
                    }}>
                        {presetColors.map((color) => (
                            <Box
                                key={color}
                                onClick={() => handleColorSelect(color)}
                                sx={{
                                    width: '36px',
                                    height: '36px',
                                    backgroundColor: color,
                                    borderRadius: '8px',
                                    cursor: 'pointer',
                                    border: watch('color') === color ? '3px solid #1976d2' : '2px solid #fff',
                                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                                    transition: 'all 0.2s ease',
                                    '&:hover': {
                                        transform: 'scale(1.1)',
                                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                                    },
                                }}
                            />
                        ))}
                    </Box>

                    {/* Input de color HTML5 más estilizado */}
                    <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="body2" sx={{ mb: 1, color: '#666' }}>
                            O elige un color personalizado:
                        </Typography>
                        <input
                            type="color"
                            value={watch('color') || '#1976d2'}
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

            <Box sx={{ width: '100%', px: 3}}>
            <Typography id="input-slider" gutterBottom>
                Cantidad de Números
            </Typography>
            <Slider
                aria-label="Quantity"
                value={quantity !== undefined ? +quantity : 1000}
                defaultValue={1000}
                getAriaValueText={valuetext}
                valueLabelDisplay="auto"
                step={100}
                marks={marks}
                min={100}
                max={10000}
                onChange={(_, value) => setValue("quantity", value as number)}
            />
            </Box>

            <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DemoContainer components={['MobileDateTimePicker']}>
                <MobileDateTimePicker label="Fecha de Inicio" 
                    value={startDate}
                    onChange={(date) => setValue('startDate', date, { shouldValidate: true })}
                    format="DD/MM/YYYY HH:mm"
                />
                <MobileDateTimePicker label="Fecha de juego" 
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
            />
            {/* Banner móvil */}
            <CloudinaryUploadWidget
                label="Subir Banner Móvil"
                onUpload={url => setValue('banerMovileImgUrl', url, { shouldValidate: true })}
                previewUrl={banerMovileImgUrl}
                previewWidth={180}
                previewHeight={120}
                onClear={() => setValue('banerMovileImgUrl', '', { shouldValidate: true })}
            />
            {/* Icono */}
            <CloudinaryUploadWidget
                label="Subir Icono"
                onUpload={url => setValue('imgIconoUrl', url, { shouldValidate: true })}
                previewUrl={imgIconoUrl ?? undefined}
                previewWidth={80}
                previewHeight={80}
                onClear={() => setValue('imgIconoUrl', '', { shouldValidate: true })}
            />

        </FormControl>
    );
};

export default RaffleFormFields;
