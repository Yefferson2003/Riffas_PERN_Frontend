import { Box, Button, Modal } from "@mui/material";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import dayjs from "dayjs";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { createRaffle } from "../../api/raffleApi";
import { CreateRaffleForm } from "../../types";
import ButtonCloseModal from "../ButtonCloseModal";
import RaffleFormFields from "../raffle/RaffleFormFields";

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
    imgIconoUrl: '',
    color: '#1976d2',
    contactRifero: '',
    
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
        }// Nueva variable para la segunda imagen

        const newRaffleData = {
            newFormData: {
                ...data,
            },
        };

        // if (!banerImgUrl || !banerMovileImgUrl) {
        //     toast.error('Imagenes no cargadas')
        //     return
        // }

        mutate(newRaffleData);
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
                
                <RaffleFormFields
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
                >
                    Crear Rifa
                </Button>
            </form>
            </Box>
        </Modal>
    )
}

export default AddRaffleModal