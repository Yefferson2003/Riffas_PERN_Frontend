import { Box, Button, FormControl, Modal, TextField } from "@mui/material";
import { QueryObserverResult, RefetchOptions, useMutation, useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { amountNumberShared, getRaffleNumberByIdShared } from "../../api/raffleNumbersApi";
import { AwardType, PayNumberForm, Raffle } from "../../types";
import { formatCurrencyCOP, formatWithLeadingZeros, handleDownloadReservationPDF } from "../../utils";
import ButtonCloseModal from "../ButtonCloseModal";
import PhoneNumberInput from "../PhoneNumberInput";

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

type ViewRaffleNumberSharedModalProps = {
    totalNumbers: number,
    awards: AwardType[]
    raffle: Raffle
    token: string,
    raffleRefetch: (options?: RefetchOptions | undefined) => Promise<QueryObserverResult<{
        total: number;
        totalPages: number;
        currentPage: number;
        raffleNumbers: {
            number: number;
            status: "available" | "sold" | "pending" | "apartado";
            id: number;
            payments: {
                userId: number;
            }[];
        }[];
    } | undefined, Error>>
}

function ViewRaffleNumberSharedModal({ token, awards, raffle, totalNumbers, raffleRefetch} : ViewRaffleNumberSharedModalProps) {
    
    const navigate = useNavigate(); 
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const modalviewRaffleNumber = queryParams.get('viewRaffleNumber')
    const show = modalviewRaffleNumber ? true : false;
    const raffleNumberId = Number(modalviewRaffleNumber)


    const {data: raffleNumber, isError, refetch} = useQuery({
        queryKey: ['raffleNumberShared', token, raffleNumberId],
        queryFn: () => getRaffleNumberByIdShared({ token, raffleNumberId }),
        enabled: !!token && !!raffleNumberId
    })


    const initialValues: PayNumberForm   = {
        amount: 0,
        firstName: '',
        lastName: '',
        address: '',
        phone: '',
        paymentMethod: 'Apartado'
    }
    
    const {register, handleSubmit, watch, setValue, formState: {errors}, reset} = useForm({
        defaultValues : initialValues
    })
    const { phone} = watch();

    
    const {mutate, isPending} = useMutation({
        mutationFn: amountNumberShared,
        onError(error) {
            toast.error(error.message)
        },
        onSuccess(_, variables) {
            toast.success("Pago Completado");
            raffleRefetch();
            refetch();
            navigate(location.pathname, { replace: true });

            handleDownloadReservationPDF({
            awards,
            reservation: {
                number: raffleNumber?.number || 0, 
                address: variables.formData.address || "",
                firstName: variables.formData.firstName || "",
                lastName: variables.formData.lastName || "",
                phone: variables.formData.phone || "",
                reservedDate: new Date().toISOString(),
            },
            raffle,
            totalNumbers,
            });
        },
    })

    const handleAmountNumber = (Data: PayNumberForm) => {
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
            token,
            raffleNumberId,
        }

        mutate(data);
    }

    useEffect(() => {
        if (raffleNumber) {
            reset({
                amount: 0,
                firstName: raffleNumber.firstName || '',
                lastName: raffleNumber.lastName || '',
                address: raffleNumber.address || '',
                phone: raffleNumber.phone || ''
            })
        }
    }, [raffleNumber, reset])
    

    if (isError) return<Navigate to={'/404'}/>

    if (raffleNumber) return (
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
            
            <h2 className="mb-5 text-2xl font-bold text-center uppercase text-azul">
                {'# ' +formatWithLeadingZeros(raffleNumber.number, totalNumbers)}
            </h2>

            <div className="text-center">
                <p>Valor de la Rifa:<span className="font-bold text-azul"> {formatCurrencyCOP(+raffleNumber.paymentDue)}</span></p>
            </div>


            <form 
                onSubmit={handleSubmit(handleAmountNumber)}
                className='mt-10 space-y-3 text-center'
                noValidate
                autoComplete="off"
            >
                
                <FormControl size="small" fullWidth
                    sx={{display: 'flex', gap: 2}}
                >
                    <TextField 
                    id="amount" 
                    label="Monto" 
                    variant="outlined"
                    disabled
                    {...register("amount")}
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
                        Apartar Boleta
                    </Button>
                </FormControl>
            </form>
            </Box>
        </Modal>
    )
}

export default ViewRaffleNumberSharedModal