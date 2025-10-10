import { Box, Button, FormControl, FormControlLabel, InputLabel, MenuItem, Modal, Select, SelectChangeEvent, Switch, TextField } from "@mui/material";
import { QueryObserverResult, RefetchOptions, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { sellNumbers } from "../../api/raffleNumbersApi";
import { AwardType, paymentMethodEnum, PayNumbersForm, RaffleNumbersPayments } from "../../types";
import { formatCurrencyCOP, formatWithLeadingZeros, redirectToWhatsApp } from "../../utils";
import ButtonCloseModal from "../ButtonCloseModal";
import PhoneNumberInput from "../PhoneNumberInput";
import { InfoRaffleType } from "./ViewRaffleNumberData";

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
    refetch: (options?: RefetchOptions | undefined) => Promise<QueryObserverResult<{
        raffleNumbers: {
            number: number;
            status: "sold" | "available" | "pending" | "apartado";
            id: number;
            payments: {
                userId: number;
            }[];
        }[];
        total: number;
        totalPages: number;
        currentPage: number;
    } | undefined, Error>>
    awards: AwardType[]
    totalNumbers: number
    infoRaffle: InfoRaffleType,
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
    setUrlWasap: React.Dispatch<React.SetStateAction<string>>
}

type ActionModeType = 'buy' | 'separate';

function PayNumbersModal({ refetch, awards, totalNumbers,infoRaffle, numbersSeleted, raffleId, rafflePrice, setNumbersSeleted, setPaymentsSellNumbersModal, setPdfData, setUrlWasap} : PayNumbersModalProps) {

    const queryClient = useQueryClient()
    const paymentMethods = paymentMethodEnum.options
    
    // MODAL //
    const navigate = useNavigate(); 
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const modalSellNumbers = queryParams.get('sellNumbers')
    const show = modalSellNumbers ? true : false;
    
    // Estado para gestionar el modo de acción (comprar o separar) 
    const [priceEspecial, setPriceEspecial] = useState(false)
    const [actionMode, setActionMode] = useState<ActionModeType>('buy')
    const [reservedDate, setReservedDate] = useState<string | null>('')
        

    const handleOnChange = ( e: SelectChangeEvent) => {
        const selectedMode = e.target.value as ActionModeType;
        setActionMode(selectedMode);
        
        // Si el modo es 'separate' (Apartar Números), cambiar método de pago a 'Apartado'
        if (selectedMode === 'separate') {
            setValue('paymentMethod', 'Apartado');
        }
    }

    const handleChangePriceSpecial = (event: React.ChangeEvent<HTMLInputElement>) => {
        const isChecked = event.target.checked;
        setPriceEspecial(isChecked);
        
        // Si se desactiva el precio especial, resetear amount a 0
        if (!isChecked) {
            setValue('amount', 0);
        }
    };
    
    const initialValues: PayNumbersForm   = {
        raffleNumbersIds: [],
        firstName: '',
        lastName: '',
        // identificationType: 'CC',
        // identificationNumber: '',
        address: '',
        phone: '',
        amount: 0,
        paymentMethod: 'Efectivo'
    }

    const {register, handleSubmit, watch, reset, formState: {errors}, setValue} = useForm({
        defaultValues : initialValues
    })
    const { phone, amount, paymentMethod} = watch();
    
    // Calcular el precio actual por rifa y el total
    const currentRafflePrice = priceEspecial && amount ? +amount : +rafflePrice;
    const totalToPay = numbersSeleted.length * currentRafflePrice;
    
    const {mutate, isPending} = useMutation({
        mutationFn: sellNumbers,
        onError(error) {
            console.log(error.message);
            
            toast.error(error.message)
        },
        onSuccess(data) {
            refetch()
            // queryClient.invalidateQueries({queryKey: ['raffleNumbers', search, raffleId, filter, page, limit]})
            queryClient.invalidateQueries({queryKey: ['recaudo', raffleId]})
            queryClient.invalidateQueries({queryKey: ['recaudoByVendedor', raffleId]})
            toast.success('Rifas Compradas')
            reset()
            setPriceEspecial(false)
            setActionMode('buy')
            setNumbersSeleted([])
            navigate(location.pathname, {replace: true})    
            setPaymentsSellNumbersModal(true)
            setPdfData(data)
            setReservedDate(data[0].reservedDate)
        },
    }) 

    const priceForm = actionMode === 'buy' ? currentRafflePrice : 0

    const handleFormSubmit = (Data : PayNumbersForm) => { 

        if (priceEspecial && (Data.amount === undefined || Data.amount < 1)) {
            toast.error('El monto no puede ser 0 si precio especial está activo')
            return
        }

        if (!Data.paymentMethod) {
            toast.error('Debe seleccionar un método de pago')
            return
        }
        
        const formData = { 
            ...Data,
            amount: currentRafflePrice,
            raffleNumbersIds: numbersSeleted.map((item) => item.numberId) 
        } 
        let params = {}

        if (actionMode === 'separate') {
            params = { separar: true }
        }

        if (priceEspecial) {
            params = { ...params, descuento: true }
        }

        const data = { 
            formData, 
            raffleId, 
            params
        } 
        mutate(data, {
            onSuccess: () => {
                if (formData.phone) {
                    setUrlWasap(
                        redirectToWhatsApp({
                            totalNumbers,
                            numbers: numbersSeleted,
                            phone: formData.phone,
                            name: formData.firstName,
                            amount: priceForm,
                            infoRaffle: {...infoRaffle, amountRaffle: priceEspecial ? Data.amount?.toString() || 'NO HAY' : infoRaffle.amountRaffle},
                            awards, 
                            reservedDate,
                            
                        })
                    )
                    
                }
            }
        })
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
                    .map((num) => formatWithLeadingZeros(num.number, totalNumbers))
                    .join(" | ")}`
                : "No hay números seleccionados."}
            </p>

            <p className="text-center">Valor de la Rifa:<span className="font-bold text-azul"> {formatCurrencyCOP(currentRafflePrice)}</span></p>

            <p className="my-5 text-center">Total a pagar: <span className="font-bold text-azul">{formatCurrencyCOP(totalToPay)}</span></p>


            <div className="text-center ">
                <FormControlLabel 
                    labelPlacement="end" 
                    control={
                        <Switch checked={priceEspecial} onChange={handleChangePriceSpecial} />
                    }
                    label="Aplicar Precio Especial"
                />
            </div>
        
            <form 
                onSubmit={handleSubmit(handleFormSubmit)}
                className='mt-10 space-y-3 text-center'
                noValidate
                autoComplete="off"
            >
                
                <FormControl size="small" fullWidth
                    sx={{display: 'flex', gap: 2}}
                >   
                    {priceEspecial && (
                        <TextField id="amount" label="Precio Nuevo" variant="outlined" 
                            error={!!errors.amount}
                            helperText={errors.amount?.message}
                            {...register('amount', {
                            required: 'Monto obligatorio',
                            pattern: {
                                value: /^[0-9]+(?:\.[0-9]{1,2})?$/, // Allows numbers with up to 2 decimal places
                                message: 'El monto debe ser numérico (puede incluir decimales con hasta dos cifras, solo punto)',
                            },
                            validate: {
                                maxValue: (value) =>
                                Number(value) <= +rafflePrice || `El monto no puede superar los ${formatCurrencyCOP(+rafflePrice)}`, // Use formatCurrencyCOP here for consistency
                            },
                            })}
                        />
                    )}
                    
                    <FormControl error={!!errors.paymentMethod}>
                    <InputLabel id="paymentMethodLabel">Método de pago</InputLabel>
                    <Select
                        labelId="paymentMethodLabel"
                        id="paymentMethod"
                        label="Método de pago"
                        value={paymentMethod || ''}
                        onChange={(e) => setValue('paymentMethod', e.target.value as typeof paymentMethods[number])}
                    >
                        <MenuItem disabled value={''}>Seleccione un método de pago</MenuItem>
                        {paymentMethods.map((method) => (
                            <MenuItem key={method} value={method}>{method}</MenuItem>
                        ))}
                    </Select>
                    {errors.paymentMethod && (
                        <p className="mt-1 text-sm text-red-500">{errors.paymentMethod.message}</p>
                    )}
                    </FormControl>

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
                    
                    {/* <FormControl>
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
                    /> */}
                    
                    <p className="text-sm text-black text-start">Número de teléfono</p>
                    <PhoneNumberInput
                        value={phone}
                        onChange={(value) => {
                            setValue('phone', value);
                        }}
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