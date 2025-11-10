import { Box, Button, FormControl, Modal, Slider, TextField, Typography, Popover } from "@mui/material";
import { MobileDateTimePicker } from "@mui/x-date-pickers";
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DemoContainer } from '@mui/x-date-pickers/internals/demo';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { useMutation, useQueryClient } from "@tanstack/react-query";
import dayjs from "dayjs";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { uploadImageToCloudinary } from "../../api/cloudinary";
import { createRaffle } from "../../api/raffleApi";
import { CreateRaffleForm } from "../../types";
import ButtonCloseModal from "../ButtonCloseModal";
import PhoneNumberInput from "../PhoneNumberInput";
import UploadImageButton from "./UploadImageButton";

const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 550,
    maxWidth: '100vw',
    bgcolor: '#f1f5f9',
    border: '2px solid #000',
    boxShadow: 24,
    p: 4,
    maxHeight: '95vh', 
    overflowY: 'auto',
};

type AddRaffleModalProps = {
    search: string
    page: number
    rowsPerPage: number
}

function AddRaffleModal({search, page, rowsPerPage} : AddRaffleModalProps) {
    // MODAL //
    const navigate = useNavigate(); 
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const modalAddRaffle = queryParams.get('newRaffle')
    const show = modalAddRaffle ? true : false;

    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [selectedFileMobile, setSelectedFileMobile] = useState<File | null>(null); // Nuevo estado para la segunda imagen
    const [colorPickerAnchor, setColorPickerAnchor] = useState<HTMLElement | null>(null);

    const initialValues: CreateRaffleForm   = {
        name: '',
        nitResponsable: '',
        nameResponsable: '',
        description: '',
        startDate: dayjs().startOf('day'),
        editDate: null,
        playDate: null,
        price: '',
        banerImgUrl: '',
        quantity: 1000,
        banerMovileImgUrl: '',
        color: '#1976d2',
        contactRifero: '',
    }

    const {register, handleSubmit, setValue, watch, reset, formState: {errors}} = useForm({
        defaultValues : initialValues
    })

    const quantity = watch("quantity");
    const startDate = watch("startDate");
    const editDate = watch("editDate");
    const playDate = watch("playDate");
    const contactRifero = watch("contactRifero");

    useEffect(() => {
        if (playDate) {
            const fechaLimite = playDate.subtract(30, "minute"); 
            setValue("editDate", fechaLimite);
        }
    }, [playDate, setValue]);

    const queryClient = useQueryClient()
    const {mutate, isPending} = useMutation({
        mutationFn: createRaffle,
        onError(error) {
            toast.error(error.message)
        },
        onSuccess(data) {
            queryClient.invalidateQueries({queryKey: ['raffles', search, page, rowsPerPage]})
            reset()
            toast.success(data)
            navigate(location.pathname, {replace: true})
        },
    })

    const validateDates = () => {
        const today = dayjs();
        if (!startDate) {
            return 'La fecha de inicio es obligatoria';
        }
        if (!editDate) {
            return 'La fecha límite de compra es obligatoria';
        }
        if (!playDate) {
            return 'La fecha de juego es obligatoria';
        }
        
        if (startDate?.isBefore(today, 'day')) {
            return 'La fecha de inicio no puede ser anterior a hoy.';
        }
        if (editDate?.isBefore(today, 'day')) {
            return 'La fecha límite de compra no puede ser anterior a hoy.';
        }
        if (playDate?.isBefore(today, 'day')) {
            return 'La fecha de juego no puede ser anterior a hoy.';
        }

        
        if (startDate?.isAfter(editDate, 'day')) {
            return 'La fecha de inicio no puede ser posterior a la fecha límite de compra.';
        }
        if (editDate?.isAfter(playDate, 'day')) {
            return 'La fecha límite de compra no puede ser posterior a la fecha de juego.';
        }

        return null;
    };

    const handleCreateRaffle = async (data: CreateRaffleForm) => {
        const dateValidationError = validateDates();
        if (dateValidationError) {
            toast.warning(dateValidationError);
            return;
        }

        let banerImgUrl = '';
        let banerMovileImgUrl = ''; // Nueva variable para la segunda imagen

        if (selectedFile) {
            banerImgUrl = await uploadImageToCloudinary(selectedFile);
        }

        if (selectedFileMobile) {
            banerMovileImgUrl = await uploadImageToCloudinary(selectedFileMobile);
        }

        const newRaffleData = {
            newFormData: {
                ...data,
            },
            banerImgUrl,
            banerMovileImgUrl
        };

        // if (!banerImgUrl || !banerMovileImgUrl) {
        //     toast.error('Imagenes no cargadas')
        //     return
        // }

        mutate(newRaffleData);
    };

    const valuetext = (value: number | number[]) => {
        return (value as number).toString();
    };


    const marks = [{
            value: 100,
            label: '100',
        },];
    for (let i = 1000; i <= 10000; i += 1000) { // Increment by 1000 for better spacing
        marks.push({
            value: i,
            label: i.toString(),
        });
    }

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
        <Modal
        open={show}
            onClose={() => {
                navigate(location.pathname, {replace: true})
            }}
            aria-labelledby="modal-modal-title"
            aria-describedby="modal-modal-description"
        >
            <Box sx={style}>
            <ButtonCloseModal/>
            <h2 className="mb-5 text-2xl font-bold text-center text-azul">Crear Rifa</h2>
            <p className="mb-5 text-xl font-bold text-center">LLena este formulario para crear una rifa</p>

            <form 
                onSubmit={handleSubmit(handleCreateRaffle)}
                className='mt-10 space-y-3 text-center'
                noValidate
                autoComplete="off"
            >
                
                <FormControl size="small" fullWidth
                    sx={{display: 'flex', gap: 2}}
                >
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
                        value={+quantity}
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

                    <UploadImageButton setSelectedFile={setSelectedFile} label="Subir Imagen Principal" />
                    <UploadImageButton setSelectedFile={setSelectedFileMobile} label="Subir Imagen Móvil" /> 
                    
                </FormControl>
                
                <Button
                    type="submit"
                    variant="contained"
                    fullWidth
                    disabled={isPending}
                >
                    Crear Rifa
                </Button>
            </form>
            </Box>
        </Modal>
    )
}

export default AddRaffleModal