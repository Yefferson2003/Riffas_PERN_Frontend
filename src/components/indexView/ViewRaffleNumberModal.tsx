import { Alert, Box, Button, FormControl, InputLabel, MenuItem, Modal, Select, TextField } from "@mui/material";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { amountNumber, updateNumber } from "../../api/raffleNumbersApi";
import { PayNumberForm, RaffleNumber, RaffleNumbersPayments } from "../../types";
import { formatCurrencyCOP, formatWithLeadingZeros } from "../../utils";
import ButttonDeleteRaffleNumber from "./ButtonDeleteRaffleNumber";
import RaflleNumberPaymentsHistory from "./RaflleNumberPaymentsHistory";

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

type ViewRaffleNumberModalProps = {
    raffleNumber: RaffleNumber
    setPaymentsSellNumbersModal: React.Dispatch<React.SetStateAction<boolean>>
    setPdfData: React.Dispatch<React.SetStateAction<RaffleNumbersPayments | undefined>>
}

function ViewRaffleNumberModal({raffleNumber,setPaymentsSellNumbersModal, setPdfData} : ViewRaffleNumberModalProps) {
    const navigate = useNavigate(); 
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const modalviewRaffleNumber = queryParams.get('viewRaffleNumber')
    const show = modalviewRaffleNumber ? true : false;
    const raffleNumberId = Number(modalviewRaffleNumber)

    const params = useParams()
    const raffleId = params.raffleId ? +params.raffleId : 0

    const initialValues: PayNumberForm   = {
        amount: +raffleNumber.paymentDue,
        firstName: raffleNumber.firstName || '',
        lastName: raffleNumber.lastName || '',
        identificationType: raffleNumber.identificationType || 'CC',
        identificationNumber: raffleNumber.identificationNumber || '',
        address: raffleNumber.address || '',
        phone: raffleNumber.phone || ''
    }
    const {register, handleSubmit, watch, reset, formState: {errors}} = useForm({
        defaultValues : initialValues
    })
    const { identificationType, address, phone} = watch();

    const queryClient = useQueryClient()
    const {mutate, isPending} = useMutation({
        mutationFn: amountNumber,
        onError(error) {
            toast.error(error.message)
        },
        onSuccess(data) {
            // queryClient.invalidateQueries({queryKey: ['raffleNumbers', search, raffleId, filter, page, limit]})
            queryClient.invalidateQueries({queryKey: ['raffleNumber', raffleId, raffleNumberId]})
            toast.success('Pago Completado')
            reset()
            navigate(location.pathname, {replace: true})
            setPaymentsSellNumbersModal(true)
            setPdfData(data)
        },
    })

    const {mutate: mutateUpdateNumber, isPending: isPendingUpdateNumber} = useMutation({
        mutationFn: updateNumber,
        onError(error) {
            toast.error(error.message)
        },
        onSuccess(data) {
            queryClient.invalidateQueries({queryKey: ['raffleNumber', raffleId, raffleNumberId]})
            toast.success(data)
            navigate(location.pathname, {replace: true})
        },
    })

    const handlePayNumber = (Data :PayNumberForm) => {
        const formData = {
            ...Data,
            amount: +Data.amount
        }

        const data ={
            formData,
            raffleId,
            raffleNumberId
        }
        
        mutate(data)
    }

    const handelUpdateNumber = () => {
        const formData={
            phone,
            address
        }
        
        const data ={
            formData,
            raffleId,
            raffleNumberId
        }
        mutateUpdateNumber(data)
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
            <ButttonDeleteRaffleNumber 
                raffleId={raffleId} 
                raffleNumberId={raffleNumberId}
            />

            <h2 className="mb-5 text-2xl font-bold text-center uppercase text-azul">{'Rifa' + ' - ' +formatWithLeadingZeros(raffleNumber.number)}</h2>

            {raffleNumber.status === 'available' ? (
                <p className="text-center">Valor de la Rifa:<span className="font-bold text-azul"> {formatCurrencyCOP(+raffleNumber.paymentDue)}</span></p>
            ) : (
                <>
                <p className="text-center">Valor total Abonado:<span className="font-bold text-azul"> {formatCurrencyCOP(+raffleNumber.paymentAmount)}</span></p>
                <p className="text-center">Valor de la Deuda:<span className="font-bold text-azul"> {formatCurrencyCOP(+raffleNumber.paymentDue)}</span></p>
                </>
            )}

            {raffleNumber.payments && raffleNumber.payments.length > 0 &&      
                <RaflleNumberPaymentsHistory payments={raffleNumber.payments}/>
            }

            <form 
                onSubmit={handleSubmit(handlePayNumber)}
                className='mt-10 space-y-3 text-center'
                noValidate
                autoComplete="off"
            >
                
                <FormControl size="small" fullWidth
                    sx={{display: 'flex', gap: 2}}
                >
                    <TextField id="amount" label="Monton" variant="outlined" 
                        error={!!errors.amount}
                        helperText={errors.amount?.message}
                        {...register('amount', { 
                            required: 'Monto obligatorio', 
                            pattern: {
                                value: /^[0-9]+$/,
                                message: 'Solo se permiten números',
                            },
                            validate: {
                                maxValue: (value) => 
                                    Number(value) <= +raffleNumber.paymentDue || `El monto no puede superar los ${formatWithLeadingZeros(+raffleNumber.paymentDue)}`,
                            },
                        })}
                    />
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
                        <Select id="identificationType" label="Tipo de Identificación" variant="outlined"
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
                                value: /^[3][0-9]{9}$/,
                                message: "Número de teléfono inválido, debe ser un número colombiano de 10 dígitos",
                            },
                            minLength: {
                                value: 10,
                                message: "El número debe tener 10 dígitos",
                            },
                            maxLength: {
                                value: 10,
                                message: "El número debe tener 10 dígitos",
                            },
                        })}
                    />
                    <TextField id="address" label="Dirección" variant="outlined" 
                        error={!!errors.address}
                        helperText={errors.address?.message}
                        {...register('address', {required: 'Dirección Obligatoria'})}
                    />

                    <Button
                        type="submit"
                        variant="contained"
                        disabled={raffleNumber.status === 'sold' || isPending}
                    >
                        Comprar - Abonar Boleta
                    </Button>
                </FormControl>
                {raffleNumber.status !== 'available' && 
                    <Alert severity="warning">Solo se Actualizara los datos de Teléfono y Dirección.</Alert>
                }
                <Button fullWidth
                    variant="contained"
                    disabled={raffleNumber.status === 'available' || isPendingUpdateNumber}
                    onClick={handelUpdateNumber}
                >
                    Actualizar Campos de contacto
                </Button>
            </form>
            </Box>
        </Modal>
    )
}

export default ViewRaffleNumberModal