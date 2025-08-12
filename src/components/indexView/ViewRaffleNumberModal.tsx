import { Alert, Box, Button, FormControl, FormControlLabel, IconButton, InputLabel, MenuItem, Modal, Select, Switch, TextField, Tooltip } from "@mui/material";
import { QueryObserverResult, RefetchOptions, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react"; // Importa el componente de entrada de teléfono
import { useForm } from "react-hook-form";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { amountNumber, updateNumber } from "../../api/raffleNumbersApi";
import { AwardType, PayNumberForm, Raffle, RaffleNumber, RaffleNumbersPayments, RaffleNumbersResponseType } from "../../types";
import { formatCurrencyCOP, formatWithLeadingZeros, handleDownloadPDF, redirectToWhatsApp } from "../../utils";
import PhoneNumberInput from "../PhoneNumberInput";
import ButtonsRaffleModal from "./raffleNumber/ButtonsRaffleModal";
import RaflleNumberPaymentsHistory from "./RaflleNumberPaymentsHistory";
import { InfoRaffleType } from "./ViewRaffleNumberData";
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';

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

    const [priceEspecial, setPriceEspecial] = useState(false)

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setPriceEspecial(event.target.checked);
    };

    const initialValues: PayNumberForm   = {
        amount: +raffleNumber.paymentDue,
        firstName: raffleNumber.firstName || '',
        lastName: raffleNumber.lastName || '',
        identificationType: raffleNumber.identificationType || 'CC',
        identificationNumber: raffleNumber.identificationNumber || '',
        address: raffleNumber.address || '',
        phone: raffleNumber.phone || ''
    }
    const {register, handleSubmit, watch, reset, setValue, formState: {errors}} = useForm({
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
            queryClient.invalidateQueries({queryKey: ['raffleNumber', raffleId, raffleNumberId]})
            queryClient.invalidateQueries({queryKey: ['recaudo', raffleId]})
            queryClient.invalidateQueries({queryKey: ['recaudoByVendedor', raffleId]})
            toast.success('Pago Completado')
            reset()
            refect()
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
                    setUrlWasap(redirectToWhatsApp({ numbers: [{numberId: 0,number: raffleNumber.number}], phone: formData.phone, name: formData.firstName, amount: formData.amount, infoRaffle, payments: raffleNumber.payments, totalNumbers}))
                    
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
                totalNumbers
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
                raffleId={raffleId} 
                raffleNumberId={raffleNumberId}
                refect={refect}
                raffleNumberStatus={raffleNumber.status}
                handleToWasap={handleToWasap}
            />

            {raffleNumber.status != 'available' &&
                <div>
                    <IconButton
                        href=''
                        onClick={() => handleDownloadPDF({awards, pdfData, raffle})}
                    >
                        <Tooltip title='Descargar PDF'>
                            <PictureAsPdfIcon color="error"/>
                        </Tooltip>
                    </IconButton>
                </div>
            }

            
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
                                value: /^[0-9]+$/,
                                message: 'Solo se permiten números',
                            },
                            validate: {
                                maxValue: (value) => 
                                    Number(value) <= +raffleNumber.paymentDue || `El monto no puede superar los ${formatWithLeadingZeros(+raffleNumber.paymentDue, totalNumbers)}`,
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