import { Box, Button, Modal } from "@mui/material";
import { QueryObserverResult, RefetchOptions, useMutation, useQueryClient } from "@tanstack/react-query";
import dayjs from "dayjs";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useLocation, useNavigate, useOutletContext } from "react-router-dom";
import { toast } from "react-toastify";
import { updateRaffle } from "../../api/raffleApi";
import { Raffle, UpdateRaffleForm, User } from "../../types";
import ButtonCloseModal from "../ButtonCloseModal";
import RaffleFormFieldsUpdate from "../raffle/RaffleFormFieldsUpdate";

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

    const [colorPickerAnchor, setColorPickerAnchor] = useState<HTMLElement | null>(null);

    const initialValues: UpdateRaffleForm   = {
        name: raffle.name,
        nitResponsable: raffle.nitResponsable,
        nameResponsable: raffle.nameResponsable,
        description: raffle.description,
        startDate: dayjs(raffle.startDate),
        editDate: dayjs(raffle.editDate),
        playDate: dayjs(raffle.playDate),
        banerImgUrl: raffle.banerImgUrl,
        banerMovileImgUrl: raffle.banerMovileImgUrl,
        imgIconoUrl: raffle.imgIconoUrl,
        color: raffle.color || '#1976d2',
        contactRifero: raffle.contactRifero || '',
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



    const handleUpdateRaffle = async (data: UpdateRaffleForm) => {
        const dateValidationError = validateDates();
        if (dateValidationError) {
            toast.warning(dateValidationError);
            return;
        }
        mutate({ newFormData: data, raffleId: raffle.id });
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
                banerMovileImgUrl: raffle.banerMovileImgUrl,
                color: raffle.color || '#1976d2',
                contactRifero: raffle.contactRifero || '',
            })
        }
    }, [raffle, reset])
    

    if (user.rol.name === 'admin' || user.rol.name === 'responsable') {
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
                    <h2 
                        className="mb-5 text-2xl font-bold text-center"
                        style={{ color: raffle?.color || '#1976d2' }}
                    >
                        Actualizar Rifa
                    </h2>
                    <p className="mb-5 text-xl font-bold text-center">LLena este formulario para actualizar una rifa</p>

                    <form 
                        onSubmit={handleSubmit(handleUpdateRaffle)}
                        className='mt-10 space-y-3 text-center'
                        noValidate
                        autoComplete="off"
                    >
                        <RaffleFormFieldsUpdate
                            register={register}
                            setValue={setValue}
                            watch={watch}
                            errors={errors}
                            colorPickerAnchor={colorPickerAnchor}
                            setColorPickerAnchor={setColorPickerAnchor}
                        />
                        <Button
                            type="submit"
                            variant="contained"
                            fullWidth
                            disabled={isPending}
                            sx={{
                                backgroundColor: raffle?.color || '#1976d2',
                                '&:hover': {
                                    backgroundColor: raffle?.color || '#1976d2',
                                    opacity: 0.9,
                                },
                            }}
                        >
                            Actualizar Rifa
                        </Button>
                    </form>
                </Box>
            </Modal>
        );
    }
}

export default UpdateRaffleModal