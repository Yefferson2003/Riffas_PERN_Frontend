import CircularProgress from '@mui/material/CircularProgress';
import { Box, Button, FormControl, FormControlLabel, IconButton, InputLabel, MenuItem, Modal, Select, SelectChangeEvent, Switch, TextField, Tooltip, Typography } from "@mui/material";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import React, { useState, useEffect } from "react";
// Importar el componente ClientSelectInput
import ClientSelectInput from "./raffleNumber/ClientSelectInput";
import { Controller, useForm } from "react-hook-form";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { getActiveRafflePayMethods } from "../../api/payMethodeApi";
import { getRaffleNumbersPending, sellNumbers } from "../../api/raffleNumbersApi";
import { getRaffleById } from "../../api/raffleApi";
import { AwardType, ClientSelectType, PayNumbersForm, RaffleNumbersPayments } from "../../types";
import { capitalize, formatCurrencyCOP, formatWithLeadingZeros, handleSendMessageToWhatsApp, redirectToWhatsApp, sendPaymentReminderWhatsApp } from "../../utils";
import { NumbersSelectedType } from "../../views/indexView/RaffleNumbersView";
import { TasaResponseType } from "../../types/tasas";
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
    // Props para ClientSelectInput
    clientSelectInput?: ClientSelectType
    clientPage: number
    setClientPage: React.Dispatch<React.SetStateAction<number>>
    clientSearch: string
    setClientSearch: React.Dispatch<React.SetStateAction<string>>
    isLoadingClientSelectInput?: boolean
    tasas?: TasaResponseType[]
}
    

type ActionModeType = 'buy' | 'separate';
function PayNumbersModal({ refetch, awards, totalNumbers,infoRaffle, numbersSeleted, raffleId, rafflePrice, setNumbersSeleted, setPaymentsSellNumbersModal, setPdfData, setUrlWasap, clientPage, setClientPage, clientSearch, setClientSearch, isLoadingClientSelectInput, clientSelectInput, tasas } : PayNumbersModalProps) {

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

    const shouldQueryPending = show && numbersIds.length > 0 && numbersSeleted.length > 0 && (numbersSeleted[0].status === 'pending' || numbersSeleted[0].status === 'apartado');
    
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
        setSelectedClientId(''); // Resetear el cliente seleccionado
    }, [show, reset]);
    
    
    // Calcular el precio actual por rifa y el total
    const ValueRaffleNumber = pendingNumbers && pendingNumbers.length > 0 
        ? (+pendingNumbers[0].paymentAmount + +pendingNumbers[0].paymentDue) 
        : +rafflePrice;
    const currentRafflePrice = (priceEspecial && amount)
        ? +amount
        : (isReadOnlyMode ? totalDebtToPay : +rafflePrice);
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
                            priceRaffleNumber: originalPrice,
                            abonosPendientes: (isReadOnlyMode && totalAbonado > 0) ? totalAbonado : undefined
                        })
                    )
                    
                }
            }
        })
    }

    // Estado local para el cliente seleccionado
    const [selectedClientId, setSelectedClientId] = useState<number | ''>('');

    // Verificar si todos los números seleccionados están disponibles
    const allAvailable = numbersSeleted.length > 0 && numbersSeleted.every(n => n.status === 'available');

    // Cuando selecciona un cliente, rellenar los datos
    useEffect(() => {
        if (selectedClientId && clientSelectInput) {
            const client = clientSelectInput.clients.find((c) => c.id === selectedClientId);
            if (client) {
                setValue('firstName', client.firstName || '');
                setValue('lastName', client.lastName || '');
                setValue('phone', client.phone || '');
                setValue('address', client.address || '');
            }
        }
    }, [selectedClientId, clientSelectInput, setValue]);

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
            
            <div className="flex flex-col items-center w-full mb-6">
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', mb: 2 }}>
                    <Box sx={{ flex: 1 }} />
                    <h2
                        className="mb-0 text-3xl font-extrabold tracking-tight text-center drop-shadow-sm"
                        style={raffle?.color ? { color: raffle.color } : {}}
                    >
                        Comprar Números
                    </h2>
                    <Box sx={{ flex: 1, display: 'flex', justifyContent: 'flex-end' }}>
                        {/* Botón de recordatorio para números pendientes */}
                        {isReadOnlyMode && pendingNumbers && pendingNumbers.length > 0 && pendingNumbers[0].phone && (
                            <IconButton
                                component="a"
                                href={sendPaymentReminderWhatsApp({
                                    totalNumbers: numbersSeleted.length,
                                    amount: totalAbonado,
                                    numbers: numbersSeleted.map(n => ({ numberId: n.numberId, number: n.number })),
                                    phone: pendingNumbers[0].phone,
                                    name: `${pendingNumbers[0].firstName} ${pendingNumbers[0].lastName}`,
                                    infoRaffle: {
                                        name: raffle?.description || infoRaffle.name,
                                        description: raffle?.description || infoRaffle.description,
                                        amountRaffle: raffle?.price || infoRaffle.amountRaffle,
                                        responsable: raffle?.nameResponsable || infoRaffle.responsable,
                                        playDate: raffle?.playDate || infoRaffle.playDate,
                                        contactRifero: raffle?.contactRifero ?? undefined,
                                    },
                                    reservedDate: pendingNumbers[0].reservedDate,
                                    abonosPendientes: totalDebtToPay,
                                    awards,
                                })}
                                target="_blank"
                                rel="noopener noreferrer"
                                sx={{ 
                                    bgcolor: '#fee2e2', 
                                    '&:hover': { bgcolor: '#fecaca' }, 
                                    borderRadius: 2,
                                    width: 40,
                                    height: 40
                                }}
                            >
                                <Tooltip title={`Enviar recordatorio de pago`}>
                                    <img
                                        src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg"
                                        alt="WhatsApp"
                                        width={20}
                                        height={20}
                                        style={{ display: 'block' }}
                                    />
                                </Tooltip>
                            </IconButton>
                        )}
                    </Box>
                </Box>
                <p
                    className="mb-1 text-lg font-semibold text-center"
                    style={raffle?.color ? { color: raffle.color } : {}}
                >
                    Llena este formulario para comprar los números seleccionados
                </p>
                <div className="w-16 h-1 rounded-full" style={raffle?.color ? { background: raffle.color } : { background: '#1976d2' }}></div>
            </div>
            <p
                className="mb-2 text-base font-semibold tracking-wide text-center"
                style={raffle?.color ? { color: raffle.color } : {}}
            >
                Números seleccionados
            </p>
            {isLoadingPending ? (
                <div className="flex items-center justify-center mb-4">
                    <CircularProgress style={{ color: raffle?.color || '#1976d2' }} />
                </div>
            ) : (
                <div className="flex flex-wrap justify-center gap-3 mb-4">
                    {numbersSeleted.length > 0
                        ? numbersSeleted.map((num) => (
                            <span
                                key={num.numberId}
                                className={`rounded-xl px-4 py-2 text-lg font-bold shadow border transition-all duration-200 ${raffle?.color ? '' : 'bg-blue-50 border-blue-400 text-blue-700'}`}
                                style={raffle?.color ? { borderColor: raffle.color, color: raffle.color, background: `${raffle.color}15` } : {}}
                            >
                                {formatWithLeadingZeros(num.number, totalNumbers)}
                            </span>
                        ))
                        : <span className="text-base text-slate-500">No hay números seleccionados.</span>
                    }
                </div>
            )}


            {/* Sección de resumen financiero estilizada con Tailwind */}
            {(isReadOnlyMode && pendingNumbers && pendingNumbers.length > 0) ? (
                <div className="flex flex-col items-center gap-2 my-5 w-full max-w-[480px] mx-auto">
                    <div
                        className="w-full px-6 py-4 text-center border rounded-lg shadow-sm"
                        style={raffle?.color ? { borderColor: raffle.color, background: `${raffle.color}15` } : {}}
                    >
                        <div className="mb-1 text-base font-bold" style={raffle?.color ? { color: raffle.color } : {}}>
                            Valor del número
                        </div>
                        <div className="text-xl font-bold" style={raffle?.color ? { color: raffle.color } : {}}>
                            {formatCurrencyCOP(ValueRaffleNumber)}
                        </div>
                    </div>
                    <div className="flex flex-wrap justify-center w-full gap-4 mt-2">
                        <div
                            className="rounded-md px-4 py-2 min-w-[100px] text-center flex-1 border"
                            style={{
                                background: '#e6f9ed',
                                borderColor: '#34a853',
                            }}
                        >
                            <div className="text-xs font-bold" style={{ color: '#34a853' }}>Abonado</div>
                            <div className="text-lg font-bold" style={{ color: '#34a853' }}>{formatCurrencyCOP(totalAbonado)}</div>
                        </div>
                        <div
                            className="rounded-md px-4 py-2 min-w-[100px] text-center flex-1 border"
                            style={{
                                background: '#fde8e8',
                                borderColor: '#ea4335',
                            }}
                        >
                            <div className="text-xs font-bold" style={{ color: '#ea4335' }}>Pendiente</div>
                            <div className="text-lg font-bold" style={{ color: '#ea4335' }}>{formatCurrencyCOP(totalDebtToPay)}</div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="w-full max-w-[480px] mx-auto">
                    <div
                        className="px-6 py-4 text-center border rounded-lg shadow-sm"
                        style={raffle?.color ? { borderColor: raffle.color, background: `${raffle.color}15` } : {}}
                    >
                        <div className="mb-1 text-base font-bold" style={raffle?.color ? { color: raffle.color } : {}}>
                            Valor del número
                        </div>
                        <div className="text-xl font-bold" style={raffle?.color ? { color: raffle.color } : {}}>
                            {formatCurrencyCOP(ValueRaffleNumber)}
                        </div>
                    </div>
                </div>
            )}

            {/* Total a pagar siempre visible, tamaño reducido */}
            <div className="flex justify-center w-full my-4">
                <div
                    className={`w-full rounded-2xl shadow-lg px-0 py-4 text-center font-bold border text-2xl tracking-wide ${raffle?.color ? '' : 'bg-blue-50 border-blue-400 text-blue-700'}`}
                    style={raffle?.color ? { borderColor: raffle.color, color: raffle.color, background: `${raffle.color}10` } : {}}
                >
                    <span className="block mb-1 text-base font-bold" style={raffle?.color ? { color: raffle.color } : {}}>
                        Total a pagar
                    </span>
                    <span className="block text-3xl font-extrabold" style={raffle?.color ? { color: raffle.color } : {}}>
                        {formatCurrencyCOP(totalToPay)}
                    </span>
                </div>
            </div>

            {/* Tasas de conversión */}
            {tasas && tasas.length > 0 && (
                <Box
                    sx={{
                        display: 'inline-block',
                        bgcolor: '#f1f5f9',
                        border: `1px solid ${raffle?.color || '#1976d2'}40`,
                        borderRadius: 2,
                        px: 2,
                        py: 1,
                        mb: 2,
                        boxShadow: '0 2px 8px 0 rgb(0 0 0 / 0.04)',
                        fontSize: '0.95em',
                        width: '100%',
                        textAlign: 'center'
                    }}
                >
                    <Typography variant="subtitle2" sx={{ color: '#64748b', fontWeight: 500, mb: 1, fontSize: '0.95em' }}>
                        Equivalente en otras monedas:
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 2 }}>
                        {tasas.map((tasa) => {
                            const valor = totalToPay * Number(tasa.value);
                            return (
                                <Box key={tasa.id} sx={{ mx: 0.5, color: '#334155', fontWeight: 500, fontSize: '0.95em' }}>
                                    {tasa.moneda.symbol} {valor.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} <span style={{ color: '#64748b', fontSize: '0.85em' }}>({tasa.moneda.name})</span>
                                </Box>
                            );
                        })}
                    </Box>
                </Box>
            )}


            {!pendingNumbers &&
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
            }
        
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
                    

                    {isLoadingPayMethods ? (
                        <div className="flex items-center justify-center py-4">
                            <CircularProgress style={{ color: raffle?.color || '#1976d2' }} />
                        </div>
                    ) : (
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
                                    Seleccione un método de pago
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
                    )}

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
                            {/* ClientSelectInput solo si todos los números están disponibles */}
                            {allAvailable && (
                                <ClientSelectInput
                                    raffleNumberStatus="available"
                                    clientSelectInput={clientSelectInput}
                                    selectedClientId={selectedClientId}
                                    setSelectedClientId={setSelectedClientId}
                                    clientPage={clientPage}
                                    setClientPage={setClientPage}
                                    clientSearch={clientSearch}
                                    setClientSearch={setClientSearch}
                                    isLoadingClients={isLoadingClientSelectInput}
                                />
                            )}
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
                                InputLabelProps={{ shrink: true }}
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
                                InputLabelProps={{ shrink: true }}
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
                                        setValue('phone', value || '');
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
                                InputLabelProps={{ shrink: true }}
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