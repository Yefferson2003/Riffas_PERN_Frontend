import { Box, Button, FormControl, Modal, Slider, TextField, Typography } from "@mui/material";
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
        banerMovileImgUrl: ''
    }

    const {register, handleSubmit, setValue, watch, reset, formState: {errors}} = useForm({
        defaultValues : initialValues
    })

    const quantity = watch("quantity");
    const startDate = watch("startDate");
    const editDate = watch("editDate");
    const playDate = watch("playDate");

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

    const marks = [
        {
            value: 100,
            label: '100',
        },
        {
            value: 1000,
            label: '1000',
        },
    ];

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
                                value: /^[0-9]+$/, // Solo números
                                message: 'Solo se permiten números',
                            },
                        })}
                    />

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
                        max={1000}
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