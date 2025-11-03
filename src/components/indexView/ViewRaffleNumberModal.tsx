import { Alert, Box, Button, FormControl, FormControlLabel, InputLabel, MenuItem, Modal, Select, Switch, TextField } from "@mui/material";
import { QueryObserverResult, RefetchOptions, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react"; // Importa el componente de entrada de teléfono
import { useForm } from "react-hook-form";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { getActiveRafflePayMethods } from "../../api/payMethodeApi";
import { amountNumber, updateNumber } from "../../api/raffleNumbersApi";
import { AwardType, PayNumberForm, Raffle, RaffleNumber, RaffleNumbersPayments, RaffleNumbersResponseType } from "../../types";
import { capitalize, formatCurrencyCOP, formatWithLeadingZeros, redirectToWhatsApp, sendPaymentReminderWhatsApp } from "../../utils";
import PhoneNumberInput from "../PhoneNumberInput";
import ButtonsRaffleModal from "./raffleNumber/ButtonsRaffleModal";
import RaflleNumberPaymentsHistory from "./RaflleNumberPaymentsHistory";
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

type ViewRaffleNumberModalProps = {
    pdfData: RaffleNumbersPayments
    raffle: Raffle
    awards: AwardType[]
    totalNumbers: number,
    infoRaffle: InfoRaffleType,
    raffleNumber: RaffleNumber
    setPaymentsSellNumbersModal: React.Dispatch<React.SetStateAction<boolean>>
    setPdfData: React.Dispatch<React.SetStateAction<RaffleNumbersPayments | undefined>>
    refect: (options?: RefetchOptions) => Promise<QueryObserverResult<RaffleNumbersResponseType | undefined, Error>>
    setUrlWasap: React.Dispatch<React.SetStateAction<string>>
}

function ViewRaffleNumberModal({ awards, pdfData, raffle, totalNumbers, infoRaffle, raffleNumber,setPaymentsSellNumbersModal, setPdfData, refect, setUrlWasap} : ViewRaffleNumberModalProps) {
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

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setPriceEspecial(event.target.checked);
    };

    const initialValues: PayNumberForm  = {
        amount: raffleNumber.status === 'available' ? 0 : (+raffleNumber.paymentDue),
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
            toast.success('Pago Completado')
            reset()
            refect()
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
                        reservedDate: pdfData[0].reservedDate
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
                reservedDate: pdfData[0].reservedDate
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
    
    const handleSendPaymentReminderWhatsApp = () => {
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
                reservedDate: pdfData[0].reservedDate
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
                refect={refect}
                raffleNumberStatus={raffleNumber.status}
                handleToWasap={handleToWasap}
                handleSendPaymentReminderWhatsApp={handleSendPaymentReminderWhatsApp}
            />
            
            <h2 className="mb-5 text-2xl font-bold text-center uppercase text-azul">{'# ' +formatWithLeadingZeros(raffleNumber.number, totalNumbers)}</h2>

            {raffleNumber.status === 'available' ? (
                <div className="text-center">
                    <p>Valor de la Rifa:<span className="font-bold text-azul"> {formatCurrencyCOP(+raffleNumber.paymentDue)}</span></p>
                    <FormControlLabel  labelPlacement="bottom" control={
                        <Switch checked={priceEspecial} onChange={handleChange}/>
                    } label="Aplicar Precio Especial" />
                </div>
                
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
                    <TextField id="amount" label="Monto" variant="outlined" 
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
                            Number(value) <= +raffleNumber.paymentDue || `El monto no puede superar los ${formatCurrencyCOP(+raffleNumber.paymentDue)}`, // Use formatCurrencyCOP here for consistency
                        },
                        })}
                    />
                    
                    {raffleNumber.status != 'sold' &&
                        <>
                        <FormControl error={!!errors.paymentMethod}>
                        <InputLabel id="paymentMethodLabel">Método de pago</InputLabel>
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
                            <p className="mt-1 text-sm text-red-500">{errors.paymentMethod.message}</p>
                        )}
                        </FormControl>
                        
                        {!isLoadingPayMethods && rafflePayMethods && rafflePayMethods.length === 0 && (
                            <Alert severity="warning" sx={{ fontSize: '0.875rem', textAlign: 'justify' }}>
                                <strong>Atención:</strong> No hay métodos de pago configurados para esta rifa. Contacte al administrador.
                            </Alert>
                        )}
                        
                        <TextField 
                            id="reference" 
                            label="Referencia de pago (opcional)" 
                            variant="outlined" 
                            placeholder="Ej: 123456"
                            {...register('reference')}
                        />
                        
                        <Alert severity="info" sx={{ fontSize: '0.875rem', textAlign: 'justify' }}>
                            <strong>Información:</strong> Si el monto es 0, el método de pago se establecerá automáticamente como "Apartado" para reservar el número.
                        </Alert>
                        </>
                    }


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

                    

                    <Button
                        type="submit"
                        variant="contained"
                        disabled={
                            raffleNumber.status === 'sold' || 
                            isPending || 
                            isLoadingPayMethods || 
                            (rafflePayMethods && rafflePayMethods.length === 0)
                        }
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