import { Box, Button, FormControl, InputLabel, MenuItem, Modal, Select, SelectChangeEvent, TextField } from "@mui/material";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { sellNumbers } from "../../api/raffleNumbersApi";
import { PayNumbersForm, RaffleNumbersPayments } from "../../types";
import { formatCurrencyCOP, formatWithLeadingZeros } from "../../utils";
import ButtonCloseModal from "../ButtonCloseModal";
import { useState } from "react";

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

type PayNumbersModalProps = {
    numbersSeleted: {
        numberId: number;
        number: number;
    }[]
    raffleId: number
    rafflePrice: string
    setNumbersSeleted: React.Dispatch<React.SetStateAction<{
        numberId: number;
        number: number;
    }[]>>
    setPaymentsSellNumbersModal: React.Dispatch<React.SetStateAction<boolean>>
    setPdfData: React.Dispatch<React.SetStateAction<RaffleNumbersPayments | undefined>>
}

function PayNumbersModal({numbersSeleted, raffleId, rafflePrice, setNumbersSeleted, setPaymentsSellNumbersModal, setPdfData} : PayNumbersModalProps) {
    
    // MODAL //
    const navigate = useNavigate(); 
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const modalSellNumbers = queryParams.get('sellNumbers')
    const show = modalSellNumbers ? true : false;

    // Estado para gestionar el modo de acción (comprar o separar) 
    const [actionMode, setActionMode] = useState<string>('buy')

    const handleOnChange = ( e: SelectChangeEvent<string>) => {
        setActionMode(e.target.value)
    }

    const initialValues: PayNumbersForm   = {
        raffleNumbersIds: [],
        firstName: '',
        lastName: '',
        identificationType: 'CC',
        identificationNumber: '',
        address: '',
        phone: ''
    }

    const {register, handleSubmit, watch, reset, formState: {errors}} = useForm({
        defaultValues : initialValues
    })
    const { identificationType} = watch();
    
    const {mutate, isPending} = useMutation({
        mutationFn: sellNumbers,
        onError(error) {
            toast.error(error.message)
        },
        onSuccess(data) {
            // queryClient.invalidateQueries({queryKey: ['raffleNumbers', search, raffleId, filter, page, limit]})
            toast.success('Rifas Compradas')
            reset()
            setNumbersSeleted([])
            navigate(location.pathname, {replace: true})
            setPaymentsSellNumbersModal(true)
            setPdfData(data)
        },
    }) 
    const handleFormSubmit = (Data : PayNumbersForm) => { 
        const formData = { 
            ...Data, 
            raffleNumbersIds: numbersSeleted.map((item) => item.numberId) 
        } 
        const data = { 
            formData, 
            raffleId, 
            params: actionMode === 'separate' ? { separar: true } : {} 
        } 
        mutate(data)
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
            <h2 className="mb-5 text-2xl font-bold text-center text-azul">Comprar Numeros</h2>
            <p className="mb-5 text-xl font-bold text-center">LLena este formulario para comprar los numeros seleccionados</p>
            <p className="text-center">Números seleccionados</p>
            <p className="font-bold text-center text-azul text-wrap"> {
                numbersSeleted.length > 0
                ? `${numbersSeleted
                    .map((num) => formatWithLeadingZeros(num.number))
                    .join(" | ")}`
                : "No hay números seleccionados."}
            </p>
            <p className="mt-1 text-center">Total a pagar: <span className="font-bold text-azul">{formatCurrencyCOP(numbersSeleted.length * +rafflePrice)}</span></p>

            <form 
                onSubmit={handleSubmit(handleFormSubmit)}
                className='mt-10 space-y-3 text-center'
                noValidate
                autoComplete="off"
            >
                
                <FormControl size="small" fullWidth
                    sx={{display: 'flex', gap: 2}}
                >
                    <TextField id="firstName" label="Nombres" variant="outlined" 
                        error={!!errors.firstName}
                        helperText={errors.firstName?.message}
                        {...register('firstName', {required: 'Nombres Obligatorio'})}
                    />
                    <TextField id="lastName" label="Apellidos" variant="outlined" 
                        error={!!errors.lastName}
                        helperText={errors.lastName?.message}
                        {...register('lastName', {required: 'Apellidos Obligatorio'})}
                    />
                    <FormControl>
                        <InputLabel id="identificationTypelabel">Tipo de Indentificación</InputLabel>
                        <Select id="identificationType" label="Tipo de Identificación"          variant="outlined"
                            defaultValue={identificationType}
                            {...register('identificationType', {required: 'Seleccione un tipo'})}
                        >
                            <MenuItem value={'TI'}>TI</MenuItem>
                            <MenuItem value={'CC'}>CC</MenuItem>
                            <MenuItem value={'CE'}>CE</MenuItem>
                        </Select>
                    </FormControl>
                    <TextField id="identificationNumber" label="Número de documento" variant="outlined"
                        error={!!errors.identificationNumber}
                        helperText={errors.identificationNumber?.message}
                        {...register('identificationNumber', {
                            required: 'Nombres Obligatorios',
                            pattern: {
                                value: /^[0-9]+$/, // Solo números
                                message: 'Solo se permiten números',
                            },
                        })}
                    />
                    <TextField id="phone" label="Teléfono" variant="outlined" 
                        error={!!errors.phone}
                        helperText={errors.phone?.message}
                        {...register('phone', {
                            required: "El Teléfono es obligatorio",
                            pattern: {
                                value: /^[0-9]+$/, // Solo números
                                message: 'Solo se permiten números',
                            },
                        })}
                    />
                    <TextField id="address" label="Dirección" variant="outlined" 
                        error={!!errors.address}
                        helperText={errors.address?.message}
                        {...register('address', {required: 'Dirección Obligatoria'})}
                    />

                    <FormControl>
                    <InputLabel id="actionModeTypelabel">Tipo de reserva</InputLabel>
                    <Select
                        id="actionModeTypelabel"
                        label="Tipo de reserva"
                        value={actionMode}
                        onChange={handleOnChange}
                    >
                        <MenuItem value={'buy'}>Comprar Números</MenuItem>
                        <MenuItem value={'separate'}>Apartar Números</MenuItem>
                    </Select>
                    </FormControl>

                    <Button
                        type="submit"
                        variant="contained"
                        disabled={isPending}
                    >
                        Reservar Boletas
                    </Button>
                </FormControl>
                
            </form>
            </Box>
        </Modal>

    )
}

export default PayNumbersModal