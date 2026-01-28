import { Alert, Box, Button, FormControl, FormControlLabel, InputLabel, MenuItem, Modal, Select, Switch, TextField, Typography } from "@mui/material";
import { QueryObserverResult, RefetchOptions, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react"; // Importa el componente de entrada de teléfono
import { useForm } from "react-hook-form";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { getActiveRafflePayMethods } from "../../api/payMethodeApi";
import { amountNumber, updateNumber } from "../../api/raffleNumbersApi";
import { AwardType, ClientSelectType, PayNumberForm, Raffle, RaffleNumber, RaffleNumbersPayments, RaffleNumbersResponseType } from "../../types";
import { capitalize, formatCurrencyCOP, formatWithLeadingZeros, handleSendMessageToWhatsApp, redirectToWhatsApp, sendPaymentReminderWhatsApp } from "../../utils";
import PhoneNumberInput from "../PhoneNumberInput";
import ButtonsRaffleModal from "./raffleNumber/ButtonsRaffleModal";
import ClientSelectInput from "./raffleNumber/ClientSelectInput";
import RaflleNumberPaymentsHistory from "./RaflleNumberPaymentsHistory";
import { InfoRaffleType } from "./ViewRaffleNumberData";

const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: { xs: '95vw', sm: 600, md: 700, lg: 800 },
    maxWidth: '95vw',
    bgcolor: '#ffffff',
    border: 'none',
    borderRadius: 3,
    boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.25)',
    p: { xs: 2, sm: 3, md: 4 },
    maxHeight: '95vh', 
    overflowY: 'auto',
};

type ViewRaffleNumberModalProps = {
    clientSelectInput?: ClientSelectType
    clientPage: number
    clientSearch: string
    setClientPage: React.Dispatch<React.SetStateAction<number>>
    setClientSearch: React.Dispatch<React.SetStateAction<string>>
    isLoadingClients: boolean
    pdfData: RaffleNumbersPayments
    raffle: Raffle
    awards: AwardType[]
    totalNumbers: number,
    infoRaffle: InfoRaffleType,
    raffleNumber: RaffleNumber
    setPaymentsSellNumbersModal: React.Dispatch<React.SetStateAction<boolean>>
    setPdfData: React.Dispatch<React.SetStateAction<RaffleNumbersPayments | undefined>>
    refetch: (options?: RefetchOptions) => Promise<QueryObserverResult<RaffleNumbersResponseType | undefined, Error>>
    setUrlWasap: React.Dispatch<React.SetStateAction<string>>
}

function ViewRaffleNumberModal({ clientSelectInput, clientPage, clientSearch, setClientPage, setClientSearch, isLoadingClients, awards, pdfData, raffle, totalNumbers, infoRaffle, raffleNumber,setPaymentsSellNumbersModal, setPdfData, refetch, setUrlWasap} : ViewRaffleNumberModalProps) {
    const navigate = useNavigate(); 
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const modalviewRaffleNumber = queryParams.get('viewRaffleNumber')
    const show = modalviewRaffleNumber ? true : false;
    const raffleNumberId = Number(modalviewRaffleNumber)

    const params = useParams()
    const raffleId = params.raffleId ? +params.raffleId : 0

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

    const [priceEspecial, setPriceEspecial] = useState(false)
    // Estado para el cliente seleccionado
    const [selectedClientId, setSelectedClientId] = useState<number | ''>('');

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setPriceEspecial(event.target.checked);
    };

    const initialValues: PayNumberForm  = {
        amount: 0, // Siempre inicia en 0
        firstName: raffleNumber.firstName || '',
        lastName: raffleNumber.lastName || '',
        // identificationType: raffleNumber.identificationType || 'CC',
        // identificationNumber: raffleNumber.identificationNumber || '',
        address: raffleNumber.address || '',
        phone: raffleNumber.phone || '',
        paymentMethod: 0, // Se actualizará con useEffect cuando tengamos los datos
        reference: ''
    }
    const {register, handleSubmit, watch, reset, setValue, formState: {errors}} = useForm({
        defaultValues : initialValues
    })

    // Registrar el campo paymentMethod manualmente para validación
    const paymentMethodField = register('paymentMethod', {
        required: 'Debe seleccionar un método de pago'
    });
    const { address, phone, paymentMethod} = watch();

    // Establecer método de pago por defecto cuando se cargen los datos
    useEffect(() => {
        if (rafflePayMethods && rafflePayMethods.length > 0 && paymentMethod === 0) {
            // Buscar método "efectivo" primero
            const efectivoMethod = rafflePayMethods.find(
                method => method.payMethode.name.toLowerCase() === 'efectivo'
            );
            
            // Si existe efectivo, usarlo; si no, usar el primero disponible
            const defaultMethod = efectivoMethod || rafflePayMethods[0];
            setValue('paymentMethod', defaultMethod.id);
        }
    }, [rafflePayMethods, paymentMethod, setValue]);

    const queryClient = useQueryClient()
    const {mutate, isPending} = useMutation({
        mutationFn: amountNumber,
        onError(error) {
            toast.error(error.message)
        },
        onSuccess(data) {

            queryClient.invalidateQueries({queryKey: ['raffleNumber', raffleId, raffleNumberId]})
            queryClient.invalidateQueries({queryKey: ['recaudo', raffleId]})
            queryClient.invalidateQueries({queryKey: ['recaudoByVendedor', raffleId]})
            toast.success('Pago realizado')
            handleSendMessageToWhatsApp({
                awards, 
                totalNumbers, 
                uploadToCloudinary: true, 
                pdfData: data || [], 
                phoneNumber: watch('phone'), 
                raffle
            })
            reset()
            refetch()
            navigate(location.pathname, {replace: true})
            setPaymentsSellNumbersModal(true)
            
            
            setPdfData(data)
            setPriceEspecial(false)
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

    const handlePayNumber = (Data: PayNumberForm) => {
        const formData = {
            ...Data,
            amount: +Data.amount
        }

        if (!formData.phone) {
            toast.warn('El número de teléfono es obligatorio para continuar.');
            return;
        }

        const data = {
            formData,
            raffleId,
            raffleNumberId,
            params: priceEspecial ? { descuento: true } : {}
        }

        mutate(data, {
            onSuccess: () => {
                if (formData.phone) {
                    setUrlWasap(redirectToWhatsApp({ 
                        numbers: [{numberId: 0,number: raffleNumber.number}], 
                        phone: formData.phone, 
                        name: formData.firstName, 
                        amount: priceEspecial ? 0 : formData.amount, 
                        infoRaffle: {...infoRaffle, amountRaffle: priceEspecial ? Data.amount?.toString() || 'NO HAY' : infoRaffle.amountRaffle}, 
                        payments: raffleNumber.payments, 
                        totalNumbers, 
                        awards, 
                        reservedDate: pdfData[0].reservedDate,
                        priceRaffleNumber: priceEspecial ? 0 : +raffleNumber.paymentDue + +raffleNumber.paymentAmount
                    }))
                }
            }
        });
    }
    
    const handleToWasap = () => {
        const firstName = watch('firstName');
        const phone = watch('phone');
        const amount = watch('amount');

        if (raffleNumber.status !== 'available') {
            const url = redirectToWhatsApp({
                numbers: [{ numberId: 0, number: raffleNumber.number }],
                phone,
                name: firstName,
                amount,
                infoRaffle,
                payments: raffleNumber.payments,
                statusRaffleNumber: raffleNumber.status,
                totalNumbers,
                awards, 
                reservedDate: pdfData[0].reservedDate,
                priceRaffleNumber: priceEspecial ? 0 : +raffleNumber.paymentDue + +raffleNumber.paymentAmount
            });
            setUrlWasap(url);

            // Detect if device is mobile
            const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
            if (isMobile) {
                window.location.href = url;
            } else {
                window.open(url, '_blank');
            }
        }
    }
    
    const handleSendPaymentReminderWhatsApp = (award: AwardType | undefined) => {
        const firstName = watch('firstName');
        const phone = watch('phone');
        const amount = watch('amount');

        if (raffleNumber.status !== 'available') {
            const url = sendPaymentReminderWhatsApp({
                numbers: [{ numberId: 0, number: raffleNumber.number }],
                phone,
                name: firstName,
                amount,
                infoRaffle,
                payments: raffleNumber.payments,
                statusRaffleNumber: raffleNumber.status,
                totalNumbers,
                awards, 
                reservedDate: pdfData[0].reservedDate,
                award,
                abonosPendientes: +raffleNumber.paymentDue
            });
            setUrlWasap(url);

            // Detect if device is mobile
            const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
            if (isMobile) {
                window.location.href = url;
            } else {
                window.open(url, '_blank');
            }
        }
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

    // Cuando selecciona un cliente, rellenar los datos
    useEffect(() => {
    if (selectedClientId && clientSelectInput) {
        const client = clientSelectInput.clients.find(c => c.id === selectedClientId);
        if (client) {
            setValue('firstName', client.firstName || '');
            setValue('lastName', client.lastName || '');
            setValue('phone', client.phone || '');
            setValue('address', client.address || '');
            // reset({
            //     firstName: client.firstName || '',
            //     lastName: client.lastName || '',
            //     phone: client.phone || '',
            //     address: client.address || ''
            // }); // Reiniciar el formulario antes de establecer nuevos valores
        }
    }
    }, [selectedClientId, clientSelectInput, setValue]);

    // Función para cerrar el modal y reiniciar paginación/búsqueda de clientes
    const handleCloseModal = () => {
        // Reiniciar paginación y búsqueda de clientes
        setClientPage(1);
        setClientSearch('');
        navigate(location.pathname, {replace: true});
    };

    return (
        <Modal
            open={show}
            onClose={handleCloseModal}
            aria-labelledby="modal-modal-title"
            aria-describedby="modal-modal-description"
        >
            <Box sx={style}>
                {/* Header con botones de acción */}
                <Box sx={{ 
                    display: 'flex', 
                    flexDirection: { xs: 'column', sm: 'row' },
                    justifyContent: 'space-between', 
                    alignItems: { xs: 'stretch', sm: 'center' },
                    gap: { xs: 2, sm: 0 },
                    mb: 3,
                    pb: 2,
                    borderBottom: '2px solid #e2e8f0'
                }}>
                    <Box sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: { xs: 'center', sm: 'flex-start' },
                        gap: 2 
                    }}>
                        <Box sx={{ textAlign: { xs: 'center', sm: 'left' } }}>
                            <Typography variant="h4" sx={{ 
                                fontWeight: 'bold', 
                                color: raffle?.color || '#1976d2',
                                fontSize: { xs: '1.25rem', sm: '1.5rem', md: '2rem' }
                            }}>
                                # {formatWithLeadingZeros(raffleNumber.number, totalNumbers)}
                            </Typography>
                            <Typography variant="body2" sx={{ 
                                color: '#64748b',
                                fontSize: { xs: '0.875rem', sm: '1rem' }
                            }}>
                                {raffleNumber.status === 'available' ? 'Disponible' : 
                                    raffleNumber.status === 'sold' ? 'Vendido' :
                                    raffleNumber.status === 'pending' ? 'Pendiente' : 'Apartado'
                                    
                                }
                            </Typography>
                        </Box>
                    </Box>
                    
                    <Box sx={{ 
                        display: 'flex',
                        justifyContent: { xs: 'center', sm: 'flex-end' },
                        width: { xs: '100%', sm: 'auto' }
                    }}>
                        <ButtonsRaffleModal
                            name={raffleNumber.firstName || ''}
                            number={raffleNumber.number}
                            telefono={raffleNumber.phone || ''}
                            awards={awards}
                            totalNumbers={totalNumbers}
                            pdfData={pdfData}
                            raffle={raffle}
                            raffleId={raffleId} 
                            raffleNumberId={raffleNumberId}
                            refetch={refetch}
                            raffleNumberStatus={raffleNumber.status}
                            handleToWasap={handleToWasap}
                            handleSendPaymentReminderWhatsApp={handleSendPaymentReminderWhatsApp}
                        />
                    </Box>
                </Box>

                {/* Información del estado financiero */}
                <Box sx={{ 
                    mb: 3, 
                    p: 3, 
                    bgcolor: '#f8fafc',
                    border: `2px solid ${raffle?.color || '#1976d2'}`, 
                    borderRadius: 2,
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                }}>
                    {raffleNumber.status === 'available' ? (
                        <Box sx={{ textAlign: 'center' }}>
                            <Typography variant="h6" sx={{ color: raffle?.color || '#1976d2', fontWeight: 'bold', mb: 2 }}>
                                Valor de la Rifa: {formatCurrencyCOP(+raffleNumber.paymentDue)}
                            </Typography>
                            <FormControlLabel  
                                labelPlacement="bottom" 
                                control={
                                    <Switch 
                                        checked={priceEspecial} 
                                        onChange={handleChange}
                                        sx={{
                                            '& .MuiSwitch-switchBase.Mui-checked': {
                                                color: raffle?.color || '#1976d2',
                                            },
                                            '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                                                backgroundColor: raffle?.color || '#1976d2',
                                            },
                                        }}
                                    />
                                } 
                                label="Aplicar Precio Especial"
                                sx={{ 
                                    '& .MuiFormControlLabel-label': { 
                                        fontSize: '0.875rem',
                                        color: '#64748b'
                                    }
                                }}
                            />
                        </Box>
                    ) : (
                        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2, textAlign: 'center' }}>
                            <Box>
                                <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 500 }}>
                                    Total Abonado:
                                </Typography>
                                <Typography variant="h6" sx={{ color: '#059669', fontWeight: 'bold' }}>
                                    {formatCurrencyCOP(+raffleNumber.paymentAmount)}
                                </Typography>
                            </Box>
                            <Box>
                                <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 500 }}>
                                    Saldo Pendiente:
                                </Typography>
                                <Typography variant="h6" sx={{ 
                                    color: Number(raffleNumber.paymentDue) > 0 ? '#dc2626' : '#059669', 
                                    fontWeight: 'bold' 
                                }}>
                                    {formatCurrencyCOP(+raffleNumber.paymentDue)}
                                </Typography>
                            </Box>
                        </Box>
                    )}
                </Box>

                {/* Historial de pagos */}
                {raffleNumber.payments && raffleNumber.payments.length > 0 && (
                    <Box sx={{ mb: 3 }}>
                        <RaflleNumberPaymentsHistory payments={raffleNumber.payments}/>
                    </Box>
                )}

                {/* Formulario de pago/actualización */}
                <Box component="form" onSubmit={handleSubmit(handlePayNumber)} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
                        {raffleNumber.status !== 'sold' && (
                            <TextField 
                                id="amount" 
                                label="Monto" 
                                variant="outlined" 
                                size="small"
                                error={!!errors.amount}
                                helperText={errors.amount?.message}
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        '& fieldset': {
                                            borderColor: `${raffle?.color || '#1976d2'}40`,
                                        },
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
                                        value: /^[0-9]+(?:\.[0-9]{1,2})?$/,
                                        message: 'El monto debe ser numérico (puede incluir decimales con hasta dos cifras, solo punto)',
                                    },
                                    validate: {
                                        maxValue: (value) =>
                                        Number(value) <= +raffleNumber.paymentDue || `El monto no puede superar los ${formatCurrencyCOP(+raffleNumber.paymentDue)}`,
                                    },
                                })}
                            />
                        )}


                        {raffleNumber.status != 'sold' && (
                            <FormControl error={!!errors.paymentMethod} size="small">
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
                                    labelId="paymentMethodLabel"
                                    id="paymentMethod"
                                    label="Método de pago"
                                    value={paymentMethod || ''}
                                    onChange={(e) => {
                                        const selectedValue = Number(e.target.value);
                                        setValue('paymentMethod', selectedValue);
                                        paymentMethodField.onChange(e);
                                    }}
                                    disabled={isLoadingPayMethods}
                                    ref={paymentMethodField.ref}
                                    name={paymentMethodField.name}
                                    sx={{
                                        '& .MuiOutlinedInput-notchedOutline': {
                                            borderColor: `${raffle?.color || '#1976d2'}40`,
                                        },
                                        '&:hover .MuiOutlinedInput-notchedOutline': {
                                            borderColor: raffle?.color || '#1976d2',
                                        },
                                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                            borderColor: raffle?.color || '#1976d2',
                                        },
                                    }}
                                >
                                    <MenuItem disabled value={''}>
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
                                    <Typography variant="caption" sx={{ color: 'error.main', mt: 0.5 }}>
                                        {errors.paymentMethod.message}
                                    </Typography>
                                )}
                            </FormControl>
                        )}
                    </Box>

                    {raffleNumber.status != 'sold' && (
                        <>
                            <TextField 
                                id="reference" 
                                label="Referencia de pago (opcional)" 
                                variant="outlined" 
                                size="small"
                                placeholder="Ej: 123456"
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        '& fieldset': {
                                            borderColor: `${raffle?.color || '#1976d2'}40`,
                                        },
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
                            
                            {!isLoadingPayMethods && rafflePayMethods && rafflePayMethods.length === 0 && (
                                <Alert severity="warning" sx={{ fontSize: '0.875rem' }}>
                                    <strong>Atención:</strong> No hay métodos de pago configurados para esta rifa. Contacte al administrador.
                                </Alert>
                            )}
                            
                            <Alert severity="info" sx={{ fontSize: '0.875rem' }}>
                                <strong>Información:</strong> Si el monto es 0, el método de pago se establecerá automáticamente como "Apartado" para reservar el número.
                            </Alert>
                        </>
                    )}

                    <ClientSelectInput
                        raffleNumberStatus={raffleNumber.status}
                        clientSelectInput={clientSelectInput}
                        selectedClientId={selectedClientId}
                        setSelectedClientId={setSelectedClientId}
                        clientPage={clientPage}
                        clientSearch={clientSearch}
                        setClientPage={setClientPage}
                        setClientSearch={setClientSearch}
                        isLoadingClients={isLoadingClients}
                    />

                    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
                        <TextField 
                            id="firstName" 
                            label="Nombres" 
                            variant="outlined" 
                            size="small"
                            error={!!errors.firstName}
                            helperText={errors.firstName?.message}
                            
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    '& fieldset': {
                                        borderColor: `${raffle?.color || '#1976d2'}40`,
                                    },
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
                        <TextField 
                            id="lastName" 
                            label="Apellidos" 
                            variant="outlined" 
                            size="small"
                            error={!!errors.lastName}
                            helperText={errors.lastName?.message}
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    '& fieldset': {
                                        borderColor: `${raffle?.color || '#1976d2'}40`,
                                    },
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
                    </Box>

                    <Box>
                        <Typography variant="body2" sx={{ color: '#64748b', mb: 1 }}>
                            Número de teléfono
                        </Typography>
                        <PhoneNumberInput
                            value={phone}
                            onChange={(value) => {
                                setValue('phone', value);
                            }}
                        />
                    </Box>

                    <TextField 
                        id="address" 
                        label="Dirección" 
                        variant="outlined" 
                        size="small"
                        error={!!errors.address}
                        helperText={errors.address?.message}
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                '& fieldset': {
                                    borderColor: `${raffle?.color || '#1976d2'}40`,
                                },
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

                    <Button
                        type="submit"
                        variant="contained"
                        size="large"
                        sx={{ 
                            bgcolor: raffle?.color || '#1976d2', 
                            '&:hover': { 
                                bgcolor: raffle?.color ? `${raffle.color}dd` : '#1565c0' 
                            },
                            py: 1.5,
                            fontWeight: 'bold'
                        }}
                        disabled={
                            raffleNumber.status === 'sold' || 
                            isPending || 
                            isLoadingPayMethods || 
                            (rafflePayMethods && rafflePayMethods.length === 0)
                        }
                    >
                        {isPending ? 'Procesando...' : 'Comprar - Abonar Boleta'}
                    </Button>

                    {raffleNumber.status !== 'available' && (
                        <>
                            <Alert severity="warning" sx={{ fontSize: '0.875rem' }}>
                                Solo se actualizarán los datos de Teléfono y Dirección.
                            </Alert>
                            
                            <Button 
                                variant="outlined"
                                size="large"
                                sx={{ 
                                    borderColor: raffle?.color || '#1976d2', 
                                    color: raffle?.color || '#1976d2',
                                    '&:hover': { 
                                        bgcolor: raffle?.color ? `${raffle.color}15` : '#f0f4ff', 
                                        borderColor: raffle?.color || '#1565c0' 
                                    },
                                    py: 1.5,
                                    fontWeight: 'bold'
                                }}
                                disabled={isPendingUpdateNumber}
                                onClick={handelUpdateNumber}
                            >
                                {isPendingUpdateNumber ? 'Actualizando...' : 'Actualizar Campos de Contacto'}
                            </Button>
                        </>
                    )}
                </Box>
            </Box>
        </Modal>
    )
}

export default ViewRaffleNumberModal