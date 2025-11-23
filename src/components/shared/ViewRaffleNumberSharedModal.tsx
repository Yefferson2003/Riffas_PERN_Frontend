import { Box, Button, Chip, FormControl, Modal, TextField } from "@mui/material";
import { CheckCircle } from "@mui/icons-material";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { getActiveRafflePayMethods } from "../../api/payMethodeApi";
import { amountNumberShared } from "../../api/raffleNumbersApi";
import { AwardType, PayNumbersSharedFormType, Raffle } from "../../types";
import { capitalizeWords, formatCurrencyCOP, formatWithLeadingZeros, handleDownloadReservationPDF } from "../../utils";
import ButtonCloseModal from "../ButtonCloseModal";
import PhoneNumberInput from "../PhoneNumberInput";

const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 650,
    maxWidth: '95vw',
    bgcolor: '#ffffff',
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    borderRadius: '24px',
    p: 4,
    maxHeight: '90vh',
    overflowY: 'auto',
};

type ViewRaffleNumberSharedModalProps = {
    totalNumbers: number,
    awards: AwardType[]
    raffle: Raffle
    token: string,
    raffleRefetch: () => void
    selectedNumbers: SelectedNumber[]
    setSelectedNumbers: React.Dispatch<React.SetStateAction<SelectedNumber[]>>
    raffleColor?: string
    offers?: Array<{ id: number, minQuantity: number, discountedPrice: string }>
    getTotalWithOffers?: (selectedCount: number) => { total: number, unitPrice: number }
}

type SelectedNumber = {
    id: number;
    number: number;
    status: string;
}

// type PaymentMethod = {
//     id: number;
//     name: string;
//     iconUrl?: string;
//     isActive: boolean;
// }

function ViewRaffleNumberSharedModal({ token, awards, raffle, totalNumbers, raffleRefetch, selectedNumbers, setSelectedNumbers, raffleColor, getTotalWithOffers } : ViewRaffleNumberSharedModalProps) {

    const navigate = useNavigate();
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const modalApartarNumbers = queryParams.get('apartarNumbers')
    const show = modalApartarNumbers ? true : false;

    // Estados para métodos de pago
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<number | null>(null);

    const primaryColor = raffleColor || '#1976d2';

    // Ya no necesitamos consultar un número específico

    // Obtener métodos de pago activos para la rifa
    const {data: payMethods} = useQuery({
        queryKey: ['rafflePayMethods', raffle.id],
        queryFn: () => getActiveRafflePayMethods(raffle.id.toString()),
        enabled: !!raffle.id,
    })

    const initialValues: PayNumbersSharedFormType = {
        amount: 0,
        firstName: '',
        lastName: '',
        address: '',
        phone: '',
        paymentMethod: 0,
        reference: '',
        raffleNumbersIds: []
    }

    const {register, handleSubmit, watch, setValue, formState: {errors}, reset} = useForm({
        defaultValues : initialValues
    })
    const { phone } = watch();

    const {mutate, isPending} = useMutation({
        mutationFn: amountNumberShared,
        onError(error) {
            toast.error(error.message)
        },
        onSuccess(data) {
            toast.success("Números apartados exitosamente");
            raffleRefetch();
            setSelectedNumbers([]);
            setSelectedPaymentMethod(null);
            navigate(location.pathname, { replace: true });

            // Generar PDF para todos los números seleccionados
            if (selectedNumbers.length > 0 && data && data.length > 0) {
                // const reservations = selectedNumbers.map(num => ({
                //     number: num.number,
                //     address: variables.formData.address || "",
                //     firstName: variables.formData.firstName || "",
                //     lastName: variables.formData.lastName || "",
                //     phone: variables.formData.phone || "",
                //     reservedDate: new Date().toISOString(),
                // }));

                handleDownloadReservationPDF({
                    awards,
                    pdfData: data,
                    raffle,
                    totalNumbers,
                });
            }
        },
    })

    const handleAmountNumber = (Data: PayNumbersSharedFormType) => {
        if (!selectedPaymentMethod) {
            toast.warn('Por favor selecciona un método de pago.');
            return;
        }

        if (selectedNumbers.length === 0) {
            toast.warn('No hay números seleccionados.');
            return;
        }

        // Crear array con los IDs de los números seleccionados
        const raffleNumbersIds = selectedNumbers.map(num => num.id);

        const formData = {
            ...Data,
            amount: +Data.amount,
            paymentMethod: selectedPaymentMethod,
            raffleNumbersIds: raffleNumbersIds
        }

        if (!formData.phone) {
            toast.warn('El número de teléfono es obligatorio para continuar.');
            return;
        }

        // Procesar todos los números seleccionados
        const data = {
            formData,
            token,
        }

        mutate(data);
    }



    // Limpiar formulario cuando se abre el modal
    useEffect(() => {
        if (show) {
            reset({
                amount: 0,
                firstName: '',
                lastName: '',
                address: '',
                phone: '',
                paymentMethod: 1,
                reference: '',
                raffleNumbersIds: []
            });
        }
    }, [show, reset])


    return (
        <Modal
            open={show}
            onClose={() => {
                navigate(location.pathname, {replace: true})
                setSelectedNumbers([]);
                setSelectedPaymentMethod(null);
            }}
            aria-labelledby="modal-modal-title"
            aria-describedby="modal-modal-description"
        >
            <Box sx={style}>
                <ButtonCloseModal/>

                {/* Título y números seleccionados */}
                <div className="mb-6 text-center">
                    <h2 
                        className="mb-3 text-2xl font-bold"
                        style={{ color: primaryColor }}
                    >
                        Apartar Boletas
                    </h2>

                    {/* Mostrar números seleccionados */}
                    <div className="flex flex-wrap justify-center gap-2 mb-4">
                        {selectedNumbers.map((num) => (
                            <Chip
                                key={num.id}
                                label={`#${formatWithLeadingZeros(num.number, totalNumbers)}`}
                                color={undefined}
                                sx={{
                                    backgroundColor: primaryColor,
                                    color: 'white',
                                    fontWeight: 'bold',
                                    fontSize: '0.875rem'
                                }}
                                variant="filled"
                                size="small"
                            />
                        ))}
                    </div>

                    <div 
                        className="p-3 mb-4 rounded-lg"
                        style={{ backgroundColor: `${primaryColor}15` }}
                    >
                        <p 
                            className="text-lg font-semibold"
                            style={{ color: primaryColor }}
                        >
                            Valor Total: <span className="text-xl">
                                {getTotalWithOffers
                                    ? formatCurrencyCOP(getTotalWithOffers(selectedNumbers.length).total)
                                    : formatCurrencyCOP(+raffle.price * selectedNumbers.length)}
                            </span>
                        </p>
                        {selectedNumbers.length > 0 && getTotalWithOffers && (
                            <span className="block mt-1 text-xs font-medium" style={{ color: primaryColor }}>
                                Precio unitario: {formatCurrencyCOP(getTotalWithOffers(selectedNumbers.length).unitPrice)}
                            </span>
                        )}
                    </div>

                    {/* Botón para reiniciar selección */}
                    <div className="flex justify-center mb-4">
                        <Button
                            variant="outlined"
                            size="small"
                            onClick={() => {
                                setSelectedNumbers([]);
                                setSelectedPaymentMethod(null);
                                navigate(location.pathname, { replace: true });
                                toast.info('Selección reiniciada');
                            }}
                            sx={{ 
                                borderRadius: 2,
                                borderColor: '#dc2626',
                                color: '#dc2626',
                                '&:hover': {
                                    borderColor: '#dc2626',
                                    backgroundColor: '#dc262610'
                                }
                            }}
                        >
                            Reiniciar Selección
                        </Button>
                    </div>
                </div>

                {/* Métodos de pago */}
                <div className="mb-6">
                    <h3 
                        className="mb-4 text-lg font-semibold text-center"
                        style={{ color: primaryColor }}
                    >
                        Selecciona el método de pago
                    </h3>
                    
                    {/* Grid compacto de métodos de pago */}
                    <div className="flex flex-wrap justify-center gap-4 mb-4">
                        {payMethods?.map((method) => (
                            <button
                                key={method.id}
                                type="button"
                                onClick={() => setSelectedPaymentMethod(method.id)}
                                className={`
                                    relative flex flex-col items-center justify-center p-4 transition-all duration-300 border-2 rounded-2xl min-w-[90px] max-w-[110px] group
                                    ${selectedPaymentMethod === method.id
                                        ? `border-2 transform scale-110 ring-4 ring-opacity-30`
                                        : `border-gray-200 bg-white hover:transform hover:scale-105 hover:border-opacity-60`
                                    }
                                `}
                                style={selectedPaymentMethod === method.id ? {
                                    borderColor: primaryColor,
                                    boxShadow: `0 0 0 4px ${primaryColor}30`,
                                    background: `linear-gradient(135deg, ${primaryColor}10, ${primaryColor}20)`
                                } : {
                                    borderColor: '#e5e7eb'
                                }}
                                onMouseEnter={(e) => {
                                    if (selectedPaymentMethod !== method.id) {
                                        e.currentTarget.style.borderColor = primaryColor;
                                        e.currentTarget.style.opacity = '0.8';
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    if (selectedPaymentMethod !== method.id) {
                                        e.currentTarget.style.borderColor = '#e5e7eb';
                                        e.currentTarget.style.opacity = '1';
                                    }
                                }}
                            >
                                {/* Icono del método de pago con overlay de selección */}
                                <div className="relative flex items-center justify-center w-12 h-12 mb-3">
                                    {method.payMethode?.icon ? (
                                        <img 
                                            src={method.payMethode.icon} 
                                            alt={method.payMethode.name}
                                            className={`
                                                object-contain w-10 h-10 transition-all duration-300
                                                ${selectedPaymentMethod === method.id ? 'brightness-110' : ''}
                                            `}
                                        />
                                    ) : (
                                        <div className={`
                                            flex items-center justify-center w-10 h-10 rounded-full transition-all duration-300
                                            ${selectedPaymentMethod === method.id ? 'bg-blue-200' : 'bg-gray-100'}
                                        `}
                                        style={selectedPaymentMethod === method.id ? {
                                            backgroundColor: `${primaryColor}20`
                                        } : {}}
                                        >
                                            <span className={`
                                                text-sm font-bold
                                                ${selectedPaymentMethod === method.id ? '' : 'text-gray-500'}
                                            `}
                                            style={selectedPaymentMethod === method.id ? {
                                                color: primaryColor
                                            } : {}}
                                            >$</span>
                                        </div>
                                    )}
                                    
                                    {/* Checkmark overlay cuando está seleccionado */}
                                    {selectedPaymentMethod === method.id && (
                                        <div className="absolute flex items-center justify-center -top-1 -right-1 animate-bounce">
                                            <CheckCircle sx={{ 
                                                color: primaryColor, 
                                                fontSize: '1.5rem',
                                                filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))'
                                            }} />
                                        </div>
                                    )}
                                </div>
                                
                                {/* Nombre del método */}
                                <span className={`
                                    text-xs font-semibold text-center leading-tight transition-all duration-300
                                    ${selectedPaymentMethod === method.id ? '' : 'text-gray-700'}
                                `}
                                style={selectedPaymentMethod === method.id ? {
                                    color: primaryColor
                                } : {}}
                                >
                                    {capitalizeWords(method.payMethode?.name || '').length > 14 
                                        ? capitalizeWords(method.payMethode?.name || '').substring(0, 14) + '...'
                                        : capitalizeWords(method.payMethode?.name || '')
                                    }
                                </span>

                                {/* Efecto de brillo en hover */}
                                <div className={`
                                    absolute inset-0 rounded-2xl transition-all duration-300 pointer-events-none
                                    ${selectedPaymentMethod === method.id 
                                        ? 'bg-gradient-to-tr from-transparent via-white/20 to-transparent' 
                                        : 'group-hover:bg-gradient-to-tr group-hover:from-transparent group-hover:via-white/10 group-hover:to-transparent'
                                    }
                                `} />
                            </button>
                        ))}
                    </div>
                    
                    {/* Información detallada del método seleccionado */}
                    {selectedPaymentMethod && payMethods && (
                        <div 
                            className="p-4 mt-6 shadow-inner rounded-2xl"
                            style={{
                                background: `linear-gradient(to right, ${primaryColor}10, ${primaryColor}20)`
                            }}
                        >
                            {(() => {
                                const selectedMethod = payMethods.find(m => m.id === selectedPaymentMethod);
                                if (!selectedMethod) return null;
                                
                                return (
                                    <div className="text-center">
                                        <h4 
                                            className="flex items-center justify-center gap-2 mb-3 text-lg font-bold"
                                            style={{ color: primaryColor }}
                                        >
                                            {selectedMethod.payMethode?.icon && (
                                                <img 
                                                    src={selectedMethod.payMethode.icon} 
                                                    alt={selectedMethod.payMethode.name}
                                                    className="object-contain w-8 h-8"
                                                />
                                            )}
                                            Datos del método seleccionado
                                        </h4>
                                        
                                        <div className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
                                            <div className="p-3 bg-white shadow-sm rounded-xl">
                                                <p className="mb-1 font-semibold" style={{ color: primaryColor }}>Método</p>
                                                <p 
                                                    className="font-bold"
                                                    style={{ color: primaryColor }}
                                                >
                                                    {capitalizeWords(selectedMethod.payMethode?.name || '')}
                                                </p>
                                            </div>
                                            
                                            {selectedMethod.bankName && (
                                                <div className="p-3 bg-white shadow-sm rounded-xl">
                                                    <p className="mb-1 font-semibold" style={{ color: primaryColor }}>Banco</p>
                                                    <p className="font-medium text-gray-800">{capitalizeWords(selectedMethod.bankName)}</p>
                                                </div>
                                            )}
                                            
                                            {selectedMethod.accountHolder && (
                                                <div className="p-3 bg-white shadow-sm rounded-xl">
                                                    <p className="mb-1 font-semibold" style={{ color: primaryColor }}>Titular</p>
                                                    <p className="font-medium text-gray-800">{capitalizeWords(selectedMethod.accountHolder)}</p>
                                                </div>
                                            )}
                                            
                                            {selectedMethod.accountNumber && (
                                                <div className="p-3 bg-white shadow-sm rounded-xl">
                                                    <p className="mb-1 font-semibold" style={{ color: primaryColor }}>Número de cuenta</p>
                                                    <div className="flex flex-col items-center gap-2">
                                                        <p className="flex-1 font-mono text-lg font-bold text-gray-800">{selectedMethod.accountNumber}</p>
                                                        <Button
                                                            variant="outlined"
                                                            size="small"
                                                            onClick={() => {
                                                                navigator.clipboard.writeText(selectedMethod.accountNumber || '');
                                                                toast.success('Número de cuenta copiado al portapapeles');
                                                            }}
                                                            sx={{
                                                                minWidth: 'auto',
                                                                px: 1.5,
                                                                py: 0.5,
                                                                fontSize: '0.75rem',
                                                                borderRadius: 2,
                                                                borderColor: primaryColor,
                                                                color: primaryColor,
                                                                '&:hover': {
                                                                    borderColor: primaryColor,
                                                                    backgroundColor: `${primaryColor}10`
                                                                }
                                                            }}
                                                        >
                                                            📋 Copiar
                                                        </Button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })()}
                        </div>
                    )}
                </div>

                {/* Formulario */}
                <form
                    onSubmit={handleSubmit(handleAmountNumber)}
                    className='space-y-4'
                    noValidate
                    autoComplete="off"
                >
                    <FormControl size="small" fullWidth sx={{display: 'flex', gap: 2}}>
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                            <TextField
                                id="firstName"
                                label="Nombres"
                                variant="outlined"
                                size="small"
                                error={!!errors.firstName}
                                helperText={errors.firstName?.message}
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        '&.Mui-focused fieldset': {
                                            borderColor: primaryColor,
                                        }
                                    },
                                    '& .MuiInputLabel-root.Mui-focused': {
                                        color: primaryColor
                                    }
                                }}
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
                                        '&.Mui-focused fieldset': {
                                            borderColor: primaryColor,
                                        }
                                    },
                                    '& .MuiInputLabel-root.Mui-focused': {
                                        color: primaryColor
                                    }
                                }}
                                {...register('lastName', {required: 'Apellidos Obligatorio'})}
                            />
                        </div>

                        <div>
                            <p className="mb-2 text-sm font-medium" style={{ color: primaryColor }}>Número de teléfono</p>
                            <PhoneNumberInput
                                value={phone}
                                onChange={(value) => {
                                    setValue('phone', value);
                                }}
                                primaryColor={primaryColor}
                            />
                        </div>

                        <TextField
                            id="address"
                            label="Dirección"
                            variant="outlined"
                            size="small"
                            error={!!errors.address}
                            helperText={errors.address?.message}
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    '&.Mui-focused fieldset': {
                                        borderColor: primaryColor,
                                    }
                                },
                                '& .MuiInputLabel-root.Mui-focused': {
                                    color: primaryColor
                                }
                            }}
                            {...register('address', {required: 'Dirección Obligatoria'})}
                        />

                        <TextField
                            id="reference"
                            label="Referencia de pago (opcional)"
                            variant="outlined"
                            size="small"
                            placeholder="Ej: 123456"
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    '&.Mui-focused fieldset': {
                                        borderColor: primaryColor,
                                    }
                                },
                                '& .MuiInputLabel-root.Mui-focused': {
                                    color: primaryColor
                                }
                            }}
                            {...register('reference')}
                        />

                        <Button
                            type="submit"
                            variant="contained"
                            size="large"
                            disabled={selectedNumbers.length === 0 || isPending || !selectedPaymentMethod}
                            sx={{
                                mt: 3,
                                py: 1.5,
                                borderRadius: 3,
                                fontWeight: 'bold',
                                fontSize: '1rem',
                                backgroundColor: primaryColor,
                                color: 'white',
                                '&:hover': {
                                    backgroundColor: primaryColor,
                                    opacity: 0.8
                                },
                                '&:disabled': {
                                    backgroundColor: '#ccc',
                                    color: '#666'
                                }
                            }}
                        >
                            {isPending ? 'Procesando...' : `Apartar ${selectedNumbers.length} Boleta${selectedNumbers.length > 1 ? 's' : ''}`}
                        </Button>
                    </FormControl>
                </form>
            </Box>
        </Modal>
    )
}

export default ViewRaffleNumberSharedModal