import { Box, Button, FormControl, Modal, TextField } from "@mui/material";
import { useLocation, useNavigate, useOutletContext } from "react-router-dom";
import ButtonCloseModal from "../ButtonCloseModal";
import { Raffle, UpdateRaffleForm, User } from "../../types";
import { useEffect, useState } from "react";
import dayjs from "dayjs";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { uploadImageToCloudinary } from "../../api/cloudinary";
import { QueryObserverResult, RefetchOptions, useMutation, useQueryClient } from "@tanstack/react-query";
import { updateRaffle } from "../../api/raffleApi";
import { LocalizationProvider, MobileDateTimePicker } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DemoContainer } from "@mui/x-date-pickers/internals/demo";
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

type UpdateRaffleModalProps = {
    raffle: Raffle
    refechtRaffle: (options?: RefetchOptions | undefined) => Promise<QueryObserverResult<{
    id: number;
    name: string;
    nitResponsable: string;
    nameResponsable: string;
    description: string;
    startDate: string;
    playDate: string;
    editDate: string;
    price: string;
    banerImgUrl: string;
    banerMovileImgUrl: string;
    userRiffle: {
        userId: number;
    }[] | null;
} | undefined, Error>>
}
function UpdateRaffleModal({raffle, refechtRaffle} : UpdateRaffleModalProps) {
    const user : User = useOutletContext();
    // MODAL //
    const navigate = useNavigate(); 
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const modalUpdateRaffle = queryParams.get('updateRaffle')
    const show = modalUpdateRaffle ? true : false;

    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [selectedFileMobile, setSelectedFileMobile] = useState<File | null>(null); 

    const initialValues: UpdateRaffleForm   = {
        name: raffle.name,
        nitResponsable: raffle.nitResponsable,
        nameResponsable: raffle.nameResponsable,
        description: raffle.description,
        startDate: dayjs(raffle.startDate),
        editDate: dayjs(raffle.editDate),
        playDate: dayjs(raffle.playDate),
        banerImgUrl: raffle.banerImgUrl,
        banerMovileImgUrl: raffle.banerMovileImgUrl
    }

    const {register, handleSubmit, setValue, watch, reset, formState: {errors}} = useForm({
        defaultValues : initialValues
    })


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
        mutationFn: updateRaffle,
        onError(error) {
            toast.error(error.message)
        },
        onSuccess(data) {
            queryClient.invalidateQueries({queryKey: ['raffles', raffle.id ]})
            refechtRaffle()
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
        
        // if (startDate?.isBefore(today, 'day')) {
        //     return 'La fecha de inicio no puede ser anterior a hoy.';
        // }
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

    const handleUpdateRaffle = async (Data : UpdateRaffleForm) => {
        const dateValidationError = validateDates();
        if (dateValidationError) {
            toast.warning(dateValidationError)
            return;
        }

        let banerImgUrlUpdate = '';
        let banerMovileImgUrl = ''; // Nueva variable para la segunda imagen

        if (selectedFile) {
            banerImgUrlUpdate = await uploadImageToCloudinary(selectedFile);
        }

        if (selectedFileMobile) {
            banerMovileImgUrl = await uploadImageToCloudinary(selectedFileMobile);
        }

        const data = {
            newFormData: Data,
            banerImgUrlUpdate,
            banerMovileImgUrl,
            raffleId: raffle.id
        }
        
        mutate(data)
    }

    useEffect(() => {
        if (raffle) {
            reset({
                name: raffle.name,
                nitResponsable: raffle.nitResponsable,
                nameResponsable: raffle.nameResponsable,
                description: raffle.description,
                startDate: dayjs(raffle.startDate),
                editDate: dayjs(raffle.editDate),
                playDate: dayjs(raffle.playDate),
                banerImgUrl: raffle.banerImgUrl,
                banerMovileImgUrl: raffle.banerMovileImgUrl
            })
        }
    }, [raffle, reset])
    

    if (user.rol.name === 'admin' || user.rol.name === 'responsable') return (
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
            <h2 className="mb-5 text-2xl font-bold text-center text-azul">Actualizar Rifa</h2>
            <p className="mb-5 text-xl font-bold text-center">LLena este formulario para actualizar una rifa</p>

            <form 
                onSubmit={handleSubmit(handleUpdateRaffle)}
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
                    
                    <TextField id="nameResponsable" label="Representante Legal" variant="outlined" 
                        error={!!errors.nameResponsable}
                        helperText={errors.nameResponsable?.message}
                        {...register('nameResponsable', {required: 'Nombre del Responsable Obligatorio'})}
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

                    <UploadImageButton setSelectedFile={setSelectedFile} label="Subir Imagen Principal" />
                    <UploadImageButton setSelectedFile={setSelectedFileMobile} label="Subir Imagen Móvil" /> 

                    <Button
                        type="submit"
                        variant="contained"
                        fullWidth
                        disabled={isPending}
                    >
                        Actualizar Rifa
                    </Button>
                </FormControl>
            </form>
            
            </Box>
        </Modal>
    )
}

export default UpdateRaffleModal