import { Box, Button, Modal, Typography } from "@mui/material";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { BuyNumberForClientFormType, buyNumbersForClient } from "../../../api/clientApi";
import ButtonCloseModal from "../../ButtonCloseModal";
import NumbersInputModal from "./NumbersInputModal";
import RaffleSelect from "./RaffleSelect";
import { useState } from "react";

const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 500,
    maxWidth: '98vw',
    bgcolor: 'background.paper',
    borderRadius: 4,
    boxShadow: 8,
    p: { xs: 2, sm: 4 },
    maxHeight: '95vh',
    overflowY: 'auto',
    border: 'none',
};


type BuyNumbersForClientModalProps = {
    refetch: () => void;
}

export type RaffleOptionType = { id: number; name: string; identification: string, totalNumbers: number } | null;

export default function BuyNumbersForClientModal({ refetch }: BuyNumbersForClientModalProps) {
    const navigate = useNavigate();
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const modalBuyNumbers = queryParams.get('buyNumbers');
    const show = !!modalBuyNumbers;
    const clientId = modalBuyNumbers ? Number(modalBuyNumbers) : null;

    const [raffleSeleted, setRaffleSeleted] = useState<RaffleOptionType>(null)

    const initialValues: BuyNumberForClientFormType = {
        numbers: [],
        raffleId: 0,
    };

    const { handleSubmit, setValue, watch, reset, formState: { errors }, setError, clearErrors } = useForm<BuyNumberForClientFormType>({
        defaultValues: initialValues
    });

    const { mutate, isPending,} = useMutation({
        mutationFn: buyNumbersForClient,
        onError(error) {
            toast.error(error.message || 'Error al procesar el apartado de números');
        },
        onSuccess() {
            toast.success('Números procesados con éxito');
            reset();
            refetch();
        },
    });

    const onChangeRaffle = (value: number, raffleObj?: RaffleOptionType) => {
        setValue('raffleId', value);
        setRaffleSeleted(raffleObj || null);
    }

    const handleBuyNumbers = (formData: BuyNumberForClientFormType) => {
        let valid = true;
        // Limpiar solo los errores de los campos si ya están corregidos
        if (formData.numbers && formData.numbers.length > 0 && errors.numbers) {
            clearErrors('numbers');
        }
        if (formData.raffleId && formData.raffleId !== 0 && errors.raffleId) {
            clearErrors('raffleId');
        }
        // Validar array de números
        if (!formData.numbers || formData.numbers.length === 0) {
            setError('numbers', { type: 'manual', message: 'Debes agregar al menos un número.' });
            valid = false;
        }
        // Validar id de rifa
        if (!formData.raffleId || formData.raffleId === 0) {
            setError('raffleId', { type: 'manual', message: 'Debes seleccionar una rifa.' });
            valid = false;
        }
        if (!valid) return;

        mutate({buyNumberForClientFormData: formData, clientId: clientId!});
        // console.log('Datos del formulario:', { ...formData, clientId });
    };



    return (
        <Modal
            open={show}
            onClose={() => {
                reset({ numbers: [], raffleId: 0 });
                setRaffleSeleted(null);
                navigate(location.pathname, { replace: true });
            }}
            aria-labelledby="modal-modal-title"
            aria-describedby="modal-modal-description"
        >
            <Box sx={style}>
                <ButtonCloseModal />
                <Typography
                    variant="h5"
                    component="h2"
                    sx={{
                        textAlign: 'center',
                        fontWeight: 700,
                        mb: 2,
                        color: 'primary.main',
                        letterSpacing: 1
                    }}
                >
                    Apartar Números
                </Typography>

                <Typography
                    variant="body1"
                    sx={{ textAlign: 'center', mb: 3, color: 'text.secondary', fontWeight: 500 }}
                >
                    Ingresa los datos para apartar números para el cliente
                </Typography>

                <form
                    onSubmit={handleSubmit(handleBuyNumbers)}
                    style={{ marginTop: 8 , display: 'flex', flexDirection: 'column', gap: 16 }}
                    autoComplete="off"
                >
                    <RaffleSelect
                        value={watch('raffleId')}
                        onChange={onChangeRaffle}
                        error={!!errors.raffleId}
                        helperText={errors.raffleId?.message}
                        show={show}
                    />
                    <NumbersInputModal
                        value={watch('numbers')}
                        onChange={(nums) => setValue('numbers', nums)}
                        error={!!errors.numbers}
                        helperText={errors.numbers?.message}
                        totalNumbersRaffle={raffleSeleted?.totalNumbers || undefined}
                    />
                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                        <Button
                            type="submit"
                            variant="contained"
                            color="primary"
                            disabled={isPending}
                            sx={{
                                width: '100%',
                                maxWidth: 220,
                                fontWeight: 700,
                                fontSize: '1rem',
                                borderRadius: 2,
                                boxShadow: 2,
                                py: 1.5,
                                textTransform: 'none',
                            }}
                        >
                            {isPending ? 'Procesando...' : 'Procesar'}
                        </Button>
                    </Box>
                </form>
            </Box>
        </Modal>
    );
}
