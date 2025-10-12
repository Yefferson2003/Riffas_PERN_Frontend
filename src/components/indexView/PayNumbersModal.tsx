import { Box, Button, FormControl, FormControlLabel, InputLabel, MenuItem, Modal, Select, SelectChangeEvent, Switch, TextField } from "@mui/material";
import { QueryObserverResult, RefetchOptions, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import React, { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { getRaffleNumbersPending, sellNumbers } from "../../api/raffleNumbersApi";
import { AwardType, paymentMethodEnum, PayNumbersForm, RaffleNumbersPayments } from "../../types";
import { formatCurrencyCOP, formatWithLeadingZeros, redirectToWhatsApp } from "../../utils";
import ButtonCloseModal from "../ButtonCloseModal";
import PhoneNumberInput from "../PhoneNumberInput";
import { InfoRaffleType } from "./ViewRaffleNumberData";
import { NumbersSelectedType } from "../../views/indexView/RaffleNumbersView";

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
    numbersSeleted: NumbersSelectedType[]
    raffleId: number
    rafflePrice: string
    setNumbersSeleted: React.Dispatch<React.SetStateAction<NumbersSelectedType[]>>
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

    const numbersIds = numbersSeleted.map(num => num.numberId);

    const shouldQueryPending = show && numbersIds.length > 0 && numbersSeleted.length > 0 && numbersSeleted[0].status === 'pending'
    
    const { data: pendingNumbers, isLoading: isLoadingPending } = useQuery({
        queryKey: ['raffleNumbersPending', numbersIds],
        queryFn: () => getRaffleNumbersPending({ raffleId: raffleId.toString(), raffleNumbersIds: numbersIds }),
        enabled: shouldQueryPending,
        retry: false
    })

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

    // const handleChangePaymentMethod = (event: SelectChangeEvent<PaymentMethodType>) => {
    //     const value = event.target.value as PaymentMethodType;
    //     setValue('paymentMethod', value);
    // }
    
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

    const {register, handleSubmit, watch, reset, formState: {errors}, setValue, control} = useForm({
        defaultValues : initialValues
    })
    const { phone, amount} = watch();
    
    // Llenar datos automáticamente cuando hay números pendientes
    const isReadOnlyMode = pendingNumbers && pendingNumbers.length > 0;
    const totalDebtToPay = pendingNumbers
        ? pendingNumbers.reduce((total, number) => {
            const due = Number(number.paymentDue) || 0;
            return total + due;
        }, 0)
        : 0;
    const totalAbonado = pendingNumbers
        ? pendingNumbers.reduce((total, number) => {
            const due = Number(number.paymentAmount) || 0;
            return total + due;
        }, 0)
        : 0;
    
    // Efecto para llenar datos del primer elemento
    const [isInitialized, setIsInitialized] = useState(false);

    // Crear una clave única para detectar cambios en números seleccionados
    const numbersKey = numbersIds.join(',');

    // Resetear isInitialized cuando cambian los números seleccionados
    React.useEffect(() => {
        setIsInitialized(false);
    }, [numbersKey]);

    React.useEffect(() => {
        if (isReadOnlyMode && pendingNumbers && pendingNumbers.length > 0 && !isInitialized) {
            const firstNumber = pendingNumbers[0];
            reset({
                raffleNumbersIds: numbersIds,
                firstName: firstNumber.firstName || '',
                lastName: firstNumber.lastName || '',
                address: firstNumber.address || '',
                amount: totalDebtToPay,
                paymentMethod: 'Efectivo',
                phone: firstNumber.phone || '',
            });
            setIsInitialized(true);
        }
    }, [isReadOnlyMode, pendingNumbers, totalDebtToPay, reset, numbersIds, isInitialized]);

    
    React.useEffect(() => {
        reset({
            raffleNumbersIds: [],
            firstName: '',
            lastName: '',
            address: '',
            phone: '',
            amount: 0,
            paymentMethod: 'Efectivo'
        })
        setIsInitialized(false); // También resetear cuando se abre/cierra el modal
    }, [show, reset]);
    
    // Calcular el precio actual por rifa y el total
    const currentRafflePrice = priceEspecial && amount ? +amount : +rafflePrice;
    const totalToPay = isReadOnlyMode ? totalDebtToPay : numbersSeleted.length * currentRafflePrice;
    // Calcular precio original cuando hay números pendientes
    const originalPrice = pendingNumbers && pendingNumbers.length > 0 
        ? (Number(pendingNumbers[0].paymentAmount) || 0) + (Number(pendingNumbers[0].paymentDue) || 0)
        : Number(rafflePrice);
    
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

        const abonoForm = isReadOnlyMode ? (Data.amount ? +Data.amount : 0) : 0;

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
            amount: isReadOnlyMode ? (Data.amount ? +Data.amount : 0) : currentRafflePrice,
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
        // toast.info(Data.amount, { autoClose: 5000, toastId: 'processingToast' });
        mutate(data, {
            onSuccess: () => {
                if (formData.phone) {
                    setUrlWasap(
                        redirectToWhatsApp({
                            totalNumbers,
                            numbers: numbersSeleted,
                            phone: formData.phone,
                            name: formData.firstName,
                            amount: isReadOnlyMode ? abonoForm : priceForm,
                            infoRaffle: {...infoRaffle, amountRaffle: isReadOnlyMode ? String(originalPrice) : (priceEspecial ? Data.amount?.toString() || 'NO HAY' : infoRaffle.amountRaffle)},
                            awards, 
                            reservedDate,
                            abonosPendientes: (isReadOnlyMode && totalAbonado > 0) ? totalAbonado : undefined
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

            {!isReadOnlyMode ? <p className="text-center">Valor de la Rifa:<span className="font-bold text-azul"> {formatCurrencyCOP(currentRafflePrice)}</span></p> : null}

            {isReadOnlyMode &&   <p className="text-center">Valor abonado:<span className="font-bold text-azul"> {formatCurrencyCOP(totalAbonado)}</span></p>}

            <p className="my-5 text-center">Total a pagar: <span className="font-bold text-azul">{formatCurrencyCOP(totalToPay)}</span></p>


            <div className="text-center ">
                <FormControlLabel 
                    labelPlacement="end" 
                    control={
                        <Switch 
                            checked={priceEspecial} 
                            onChange={handleChangePriceSpecial}
                            disabled={isReadOnlyMode}
                        />
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
                    {(priceEspecial || isReadOnlyMode) && (
                        <TextField id="amount" 
                            label={ !isReadOnlyMode ? "Precio Nuevo" : "Monto"}
                            variant="outlined" 
                            error={!!errors.amount}
                            helperText={errors.amount?.message}
                            {...register('amount', {
                            required: 'Monto obligatorio',
                            pattern: {
                                value: /^[0-9]+(?:\.[0-9]{1,2})?$/, // Allows numbers with up to 2 decimal places
                                message: 'El monto debe ser numérico (puede incluir decimales con hasta dos cifras, solo punto)',
                            },
                            validate: {
                                maxValue: (value) => {
                                    if (isReadOnlyMode) {
                                        return Number(value) <= totalDebtToPay || `El monto no puede superar la deuda total de ${formatCurrencyCOP(totalDebtToPay)}`;
                                    }
                                    return Number(value) <= +rafflePrice || `El monto no puede superar los ${formatCurrencyCOP(+rafflePrice)}`;
                                }
                            },
                            })}
                        />
                    )}
                    

                    <Controller
                    name="paymentMethod"
                    control={control}
                    rules={{ required: 'Seleccione un método de pago' }}
                    render={({ field }) => (
                        <FormControl fullWidth error={!!errors.paymentMethod}>
                        <InputLabel id="paymentMethodLabel">Método de pago</InputLabel>
                        <Select
                            {...field}
                            labelId="paymentMethodLabel"
                            label="Método de pago"
                        >
                            <MenuItem disabled value="">
                            Seleccione un método de pago
                            </MenuItem>
                            {paymentMethods.map((method) => (
                            <MenuItem key={method} value={method}>
                                {method}
                            </MenuItem>
                            ))}
                        </Select>
                        {errors.paymentMethod && (
                            <p className="mt-1 text-sm text-red-500">{errors.paymentMethod.message}</p>
                        )}
                        </FormControl>
                    )}
                    />

                    

                    {
                        isReadOnlyMode && pendingNumbers && pendingNumbers.length > 0 ? (
                            <>
                                <div className="p-2 space-y-4 bg-white border-2 border-gray-300 rounded-lg">
                                    <h3 className="mb-2 text-lg font-bold text-center text-azul">Datos del Cliente</h3>
                                    
                                    <div className="grid grid-cols-1 gap-2">
                                        <div className="p-3 border rounded-md bg-gray-50">
                                            <p className="mb-1 text-sm font-semibold text-azul">Nombres</p>
                                            <p className="text-base font-medium text-gray-900">{pendingNumbers[0].firstName || '—'}</p>
                                        </div>

                                        <div className="p-3 border rounded-md bg-gray-50">
                                            <p className="mb-1 text-sm font-semibold text-azul">Apellidos</p>
                                            <p className="text-base font-medium text-gray-900">{pendingNumbers[0].lastName || '—'}</p>
                                        </div>

                                        <div className="p-3 border rounded-md bg-gray-50">
                                            <p className="mb-1 text-sm font-semibold text-azul">Teléfono</p>
                                            <p className="text-base font-medium text-gray-900">{pendingNumbers[0].phone || '—'}</p>
                                        </div>

                                        <div className="p-3 border rounded-md bg-gray-50">
                                            <p className="mb-1 text-sm font-semibold text-azul">Dirección</p>
                                            <p className="text-base font-medium text-gray-900">{pendingNumbers[0].address || '—'}</p>
                                        </div>

                                        <div className="p-3 border-2 border-blue-200 rounded-md bg-blue-50">
                                            <p className="mb-1 text-sm font-semibold text-azul">Monto adeudado (total)</p>
                                            <p className="text-xl font-bold text-azul">{formatCurrencyCOP(totalDebtToPay)}</p>
                                        </div>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <React.Fragment>
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
                            <p className="text-sm text-black text-start">Número de teléfono</p>
                            <PhoneNumberInput
                                
                                value={phone}
                                onChange={(value) => {
                                    if (!isReadOnlyMode) {
                                        setValue('phone', value);
                                    }
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
                                disabled={isReadOnlyMode}
                            >
                                <MenuItem value={'buy'}>Comprar Números</MenuItem>
                                <MenuItem value={'separate'}>Apartar Números</MenuItem>
                            </Select>
                            </FormControl>
                            </React.Fragment>
                            )
                        }
                    
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

                    <Button
                        type="submit"
                        variant="contained"
                        disabled={isPending || isLoadingPending}
                    >
                        {isReadOnlyMode ? 'Abonar Boletas' : actionMode === 'buy' ? 'Comprar Boletas' : 'Apartar Boletas'}
                    </Button>
                </FormControl>
                
            </form>
            </Box>
        </Modal>

    )
}

export default PayNumbersModal