import { Box, Button, FormControl, FormControlLabel, InputLabel, MenuItem, Modal, Select, SelectChangeEvent, Switch, TextField } from "@mui/material";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import React, { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { getActiveRafflePayMethods } from "../../api/payMethodeApi";
import { getRaffleNumbersPending, sellNumbers } from "../../api/raffleNumbersApi";
import { getRaffleById } from "../../api/raffleApi";
import { AwardType, PayNumbersForm, RaffleNumbersPayments } from "../../types";
import { capitalize, formatCurrencyCOP, formatWithLeadingZeros, handleSendMessageToWhatsApp, redirectToWhatsApp } from "../../utils";
import { NumbersSelectedType } from "../../views/indexView/RaffleNumbersView";
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
    refetch: () => void
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

    // Obtener datos de la rifa para el color
    const { data: raffle } = useQuery({
        queryKey: ['raffle', raffleId],
        queryFn: () => getRaffleById(raffleId.toString()),
        enabled: !!raffleId
    });
    
    
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
    // Efecto para llenar datos del primer elemento
    const [isInitialized, setIsInitialized] = useState(false);

    const numbersIds = numbersSeleted.map(num => num.numberId);

    const shouldQueryPending = show && numbersIds.length > 0 && numbersSeleted.length > 0 && numbersSeleted[0].status === 'pending'
    
    const { data: pendingNumbers, isLoading: isLoadingPending } = useQuery({
        queryKey: ['raffleNumbersPending', numbersIds],
        queryFn: () => getRaffleNumbersPending({ raffleId: raffleId.toString(), raffleNumbersIds: numbersIds }),
        enabled: shouldQueryPending,
        retry: false
    })

    // Obtener métodos de pago activos de la rifa
    const {
        data: rafflePayMethods,
        isLoading: isLoadingPayMethods,
        isError: isErrorPayMethods
    } = useQuery({
        queryKey: ['activeRafflePayMethods', raffleId],
        queryFn: () => getActiveRafflePayMethods(raffleId),
        enabled: !!raffleId && show,
        retry: 2
    });

    const handleOnChange = ( e: SelectChangeEvent) => {
        const selectedMode = e.target.value as ActionModeType;
        setActionMode(selectedMode);
        
        // Si el modo es 'separate' (Apartar Números), buscar y seleccionar método "apartado"
        if (selectedMode === 'separate' && rafflePayMethods) {
            const apartadoMethod = rafflePayMethods.find(
                method => method.payMethode.name.toLowerCase() === 'apartado'
            );
            if (apartadoMethod) {
                setValue('paymentMethod', apartadoMethod.id);
            }
        } else if (selectedMode === 'buy' && rafflePayMethods) {
            // Si el modo es 'buy', buscar "efectivo" o usar el primero disponible
            const efectivoMethod = rafflePayMethods.find(
                method => method.payMethode.name.toLowerCase() === 'efectivo'
            );
            const defaultMethod = efectivoMethod || rafflePayMethods[0];
            setValue('paymentMethod', defaultMethod.id);
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
        paymentMethod: 0, // Se actualizará con useEffect cuando tengamos los datos
        reference: ''
    }

    const {register, handleSubmit, watch, reset, formState: {errors}, setValue, control} = useForm({
        defaultValues : initialValues
    })
    const { phone, amount, paymentMethod} = watch();

    // Establecer método de pago por defecto cuando se cargen los datos
    React.useEffect(() => {
        if (rafflePayMethods && rafflePayMethods.length > 0 && paymentMethod === 0 && !isInitialized) {
            // Buscar método "efectivo" primero
            const efectivoMethod = rafflePayMethods.find(
                method => method.payMethode.name.toLowerCase() === 'efectivo'
            );
            
            // Si existe efectivo, usarlo; si no, usar el primero disponible
            const defaultMethod = efectivoMethod || rafflePayMethods[0];
            setValue('paymentMethod', defaultMethod.id);
        }
    }, [rafflePayMethods, paymentMethod, setValue, isInitialized]);
    
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
    


    // Crear una clave única para detectar cambios en números seleccionados
    const numbersKey = numbersIds.join(',');

    // Resetear isInitialized cuando cambian los números seleccionados
    React.useEffect(() => {
        setIsInitialized(false);
    }, [numbersKey]);

    React.useEffect(() => {
        if (isReadOnlyMode && pendingNumbers && pendingNumbers.length > 0 && !isInitialized && rafflePayMethods) {
            const firstNumber = pendingNumbers[0];
            
            // Buscar método "efectivo" por defecto para modo readonly
            const efectivoMethod = rafflePayMethods.find(
                method => method.payMethode.name.toLowerCase() === 'efectivo'
            );
            const defaultPayMethod = efectivoMethod || rafflePayMethods[0];
            
            reset({
                raffleNumbersIds: numbersIds,
                firstName: firstNumber.firstName || '',
                lastName: firstNumber.lastName || '',
                address: firstNumber.address || '',
                amount: totalDebtToPay,
                paymentMethod: defaultPayMethod.id,
                phone: firstNumber.phone || '',
                reference: ''
            });
            setIsInitialized(true);
        }
    }, [isReadOnlyMode, pendingNumbers, totalDebtToPay, reset, numbersIds, isInitialized, rafflePayMethods]);

    
    React.useEffect(() => {
        reset({
            raffleNumbersIds: [],
            firstName: '',
            lastName: '',
            address: '',
            phone: '',
            amount: 0,
            paymentMethod: 0
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
            if (raffle) {
                handleSendMessageToWhatsApp({
                    awards, 
                    totalNumbers, 
                    uploadToCloudinary: true, 
                    pdfData: data || [], 
                    phoneNumber: watch('phone'), 
                    raffle
                })
            }
            reset({
                raffleNumbersIds: [],
                firstName: '',
                lastName: '',
                address: '',
                phone: '',
                amount: 0,
                paymentMethod: 0,
                reference: ''
            })
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
            
            <h2 
                className="mb-5 text-2xl font-bold text-center"
                style={{ color: raffle?.color || '#1976d2' }}
            >
                Comprar Numeros
            </h2>
            <p 
                className="mb-5 text-xl font-bold text-center"
                style={{ color: raffle?.color || '#1976d2' }}
            >
                LLena este formulario para comprar los numeros seleccionados
            </p>
            <p 
                className="text-center"
                style={{ color: raffle?.color || '#1976d2' }}
            >
                Números seleccionados
            </p>
            <p 
                className="font-bold text-center text-wrap"
                style={{ color: raffle?.color || '#1976d2' }}
            > {
                numbersSeleted.length > 0
                ? `${numbersSeleted
                    .map((num) => formatWithLeadingZeros(num.number, totalNumbers))
                    .join(" | ")}`
                : "No hay números seleccionados."}
            </p>

            {!isReadOnlyMode ? 
                <p className="text-center">
                    Valor de la Rifa:
                    <span 
                        className="font-bold" 
                        style={{ color: raffle?.color || '#1976d2' }}
                    >
                        {" "}{formatCurrencyCOP(currentRafflePrice)}
                    </span>
                </p> : null}

            {isReadOnlyMode &&   
                <p className="text-center">
                    Valor abonado:
                    <span 
                        className="font-bold" 
                        style={{ color: raffle?.color || '#1976d2' }}
                    >
                        {" "}{formatCurrencyCOP(totalAbonado)}
                    </span>
                </p>}

            <p className="my-5 text-center">
                Total a pagar: 
                <span 
                    className="font-bold" 
                    style={{ color: raffle?.color || '#1976d2' }}
                >
                    {formatCurrencyCOP(totalToPay)}
                </span>
            </p>


            <div className="text-center ">
                <FormControlLabel 
                    labelPlacement="end" 
                    control={
                        <Switch 
                            checked={priceEspecial} 
                            onChange={handleChangePriceSpecial}
                            disabled={isReadOnlyMode}
                            sx={{
                                '& .MuiSwitch-switchBase.Mui-checked': {
                                    color: raffle?.color || '#1976d2',
                                },
                                '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                                    backgroundColor: raffle?.color || '#1976d2',
                                }
                            }}
                        />
                    }
                    label={
                        <span style={{ color: raffle?.color || '#1976d2', fontWeight: 'bold' }}>
                            Aplicar Precio Especial
                        </span>
                    }
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
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    '&:hover fieldset': {
                                        borderColor: raffle?.color || '#1976d2',
                                    },
                                    '&.Mui-focused fieldset': {
                                        borderColor: raffle?.color || '#1976d2',
                                    },
                                },
                                '& .MuiInputLabel-root.Mui-focused': {
                                    color: raffle?.color || '#1976d2',
                                },
                            }}
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
                        <InputLabel 
                            id="paymentMethodLabel"
                            sx={{
                                '&.Mui-focused': {
                                    color: raffle?.color || '#1976d2',
                                },
                            }}
                        >
                            Método de pago
                        </InputLabel>
                        <Select
                            {...field}
                            labelId="paymentMethodLabel"
                            label="Método de pago"
                            value={field.value || ''}
                            onChange={(e) => {
                                const selectedValue = Number(e.target.value);
                                field.onChange(selectedValue);
                            }}
                            disabled={isLoadingPayMethods}
                            sx={{
                                '&:hover .MuiOutlinedInput-notchedOutline': {
                                    borderColor: raffle?.color || '#1976d2',
                                },
                                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                    borderColor: raffle?.color || '#1976d2',
                                },
                            }}
                        >
                            <MenuItem disabled value="">
                                {isLoadingPayMethods ? 'Cargando métodos...' : 'Seleccione un método de pago'}
                            </MenuItem>
                            {isErrorPayMethods ? (
                                <MenuItem disabled value={'error'}>
                                    Error al cargar métodos de pago
                                </MenuItem>
                            ) : (
                                rafflePayMethods?.map((payMethod) => {
                                    const hasExtraData = payMethod.accountNumber || payMethod.accountHolder || payMethod.bankName;
                                    
                                    return (
                                        <MenuItem key={payMethod.id} value={payMethod.id}>
                                            {hasExtraData ? (
                                                <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', fontWeight: 'bold' }}>
                                                        {capitalize(payMethod.payMethode.name)}
                                                    </Box>
                                                    <Box sx={{ fontSize: '0.75rem', color: 'text.secondary', mt: 0.5 }}>
                                                        {payMethod.accountNumber && (
                                                            <Box component="span">Cuenta: {payMethod.accountNumber}</Box>
                                                        )}
                                                        {payMethod.accountHolder && (
                                                            <Box component="span" sx={{ ml: payMethod.accountNumber ? 1 : 0 }}>
                                                                {payMethod.accountNumber && ' | '}Titular: {payMethod.accountHolder}
                                                            </Box>
                                                        )}
                                                        {payMethod.bankName && (
                                                            <Box component="span" sx={{ display: 'block', mt: 0.25 }}>
                                                                Banco: {payMethod.bankName}
                                                            </Box>
                                                        )}
                                                    </Box>
                                                </Box>
                                            ) : (
                                                <Box sx={{ display: 'flex', alignItems: 'center', fontWeight: 'bold' }}>
                                                    {capitalize(payMethod.payMethode.name)}
                                                </Box>
                                            )}
                                        </MenuItem>
                                    );
                                })
                            )}
                        </Select>
                        {errors.paymentMethod && (
                            <p className="mt-1 text-sm text-red-500">{errors.paymentMethod.message}</p>
                        )}
                        </FormControl>
                    )}
                    />

                    {!isLoadingPayMethods && rafflePayMethods && rafflePayMethods.length === 0 && (
                        <div className="p-3 text-sm text-yellow-800 bg-yellow-100 border border-yellow-400 rounded-md">
                            <strong>Atención:</strong> No hay métodos de pago configurados para esta rifa. Contacte al administrador.
                        </div>
                    )}

                    <TextField 
                        id="reference" 
                        label="Referencia de pago (opcional)" 
                        variant="outlined" 
                        placeholder="Ej: 123456"
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                '&:hover fieldset': {
                                    borderColor: raffle?.color || '#1976d2',
                                },
                                '&.Mui-focused fieldset': {
                                    borderColor: raffle?.color || '#1976d2',
                                },
                            },
                            '& .MuiInputLabel-root.Mui-focused': {
                                color: raffle?.color || '#1976d2',
                            },
                        }}
                        {...register('reference')}
                    />

                    {
                        isReadOnlyMode && pendingNumbers && pendingNumbers.length > 0 ? (
                            <>
                                <div className="p-2 space-y-4 bg-white border-2 border-gray-300 rounded-lg">
                                    <h3 
                                        className="mb-2 text-lg font-bold text-center"
                                        style={{ color: raffle?.color || '#1976d2' }}
                                    >
                                        Datos del Cliente
                                    </h3>
                                    
                                    <div className="grid grid-cols-1 gap-2">
                                        <div className="p-3 border rounded-md bg-gray-50">
                                            <p 
                                                className="mb-1 text-sm font-semibold"
                                                style={{ color: raffle?.color || '#1976d2' }}
                                            >
                                                Nombres
                                            </p>
                                            <p className="text-base font-medium text-gray-900">{pendingNumbers[0].firstName || '—'}</p>
                                        </div>

                                        <div className="p-3 border rounded-md bg-gray-50">
                                            <p 
                                                className="mb-1 text-sm font-semibold"
                                                style={{ color: raffle?.color || '#1976d2' }}
                                            >
                                                Apellidos
                                            </p>
                                            <p className="text-base font-medium text-gray-900">{pendingNumbers[0].lastName || '—'}</p>
                                        </div>

                                        <div className="p-3 border rounded-md bg-gray-50">
                                            <p 
                                                className="mb-1 text-sm font-semibold"
                                                style={{ color: raffle?.color || '#1976d2' }}
                                            >
                                                Teléfono
                                            </p>
                                            <p className="text-base font-medium text-gray-900">{pendingNumbers[0].phone || '—'}</p>
                                        </div>

                                        <div className="p-3 border rounded-md bg-gray-50">
                                            <p 
                                                className="mb-1 text-sm font-semibold"
                                                style={{ color: raffle?.color || '#1976d2' }}
                                            >
                                                Dirección
                                            </p>
                                            <p className="text-base font-medium text-gray-900">{pendingNumbers[0].address || '—'}</p>
                                        </div>

                                        <div 
                                            className="p-3 border-2 rounded-md"
                                            style={{ 
                                                borderColor: raffle?.color || '#1976d2',
                                                backgroundColor: raffle?.color ? `${raffle.color}15` : '#e3f2fd'
                                            }}
                                        >
                                            <p 
                                                className="mb-1 text-sm font-semibold"
                                                style={{ color: raffle?.color || '#1976d2' }}
                                            >
                                                Monto adeudado (total)
                                            </p>
                                            <p 
                                                className="text-xl font-bold"
                                                style={{ color: raffle?.color || '#1976d2' }}
                                            >
                                                {formatCurrencyCOP(totalDebtToPay)}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <React.Fragment>
                            <TextField id="firstName" label="Nombres" variant="outlined" 
                                error={!!errors.firstName}
                                helperText={errors.firstName?.message}
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        '&:hover fieldset': {
                                            borderColor: raffle?.color || '#1976d2',
                                        },
                                        '&.Mui-focused fieldset': {
                                            borderColor: raffle?.color || '#1976d2',
                                        },
                                    },
                                    '& .MuiInputLabel-root.Mui-focused': {
                                        color: raffle?.color || '#1976d2',
                                    },
                                }}
                                {...register('firstName', {required: 'Nombres Obligatorio'})}
                            />
                            <TextField id="lastName" label="Apellidos" variant="outlined" 
                                error={!!errors.lastName}
                                helperText={errors.lastName?.message}
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        '&:hover fieldset': {
                                            borderColor: raffle?.color || '#1976d2',
                                        },
                                        '&.Mui-focused fieldset': {
                                            borderColor: raffle?.color || '#1976d2',
                                        },
                                    },
                                    '& .MuiInputLabel-root.Mui-focused': {
                                        color: raffle?.color || '#1976d2',
                                    },
                                }}
                                {...register('lastName', {required: 'Apellidos Obligatorio'})}
                            />
                            <p 
                                className="text-sm text-start"
                                style={{ color: raffle?.color || '#1976d2' }}
                            >
                                Número de teléfono
                            </p>
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
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        '&:hover fieldset': {
                                            borderColor: raffle?.color || '#1976d2',
                                        },
                                        '&.Mui-focused fieldset': {
                                            borderColor: raffle?.color || '#1976d2',
                                        },
                                    },
                                    '& .MuiInputLabel-root.Mui-focused': {
                                        color: raffle?.color || '#1976d2',
                                    },
                                }}
                                {...register('address', {required: 'Dirección Obligatoria'})}
                            />
                            <FormControl>
                            <InputLabel 
                                id="actionModeTypelabel"
                                sx={{
                                    '&.Mui-focused': {
                                        color: raffle?.color || '#1976d2',
                                    },
                                }}
                            >
                                Tipo de reserva
                            </InputLabel>
                            <Select
                                id="actionModeTypelabel"
                                label="Tipo de reserva"
                                value={actionMode}
                                onChange={handleOnChange}
                                disabled={isReadOnlyMode}
                                sx={{
                                    '&:hover .MuiOutlinedInput-notchedOutline': {
                                        borderColor: raffle?.color || '#1976d2',
                                    },
                                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                        borderColor: raffle?.color || '#1976d2',
                                    },
                                }}
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
                        sx={{
                            bgcolor: raffle?.color || '#1976d2',
                            '&:hover': {
                                bgcolor: raffle?.color ? `${raffle.color}dd` : '#1565c0'
                            }
                        }}
                        disabled={
                            isPending || 
                            isLoadingPending || 
                            isLoadingPayMethods || 
                            (rafflePayMethods && rafflePayMethods.length === 0)
                        }
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