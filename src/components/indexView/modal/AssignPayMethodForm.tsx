import AddIcon from '@mui/icons-material/Add';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Alert,
    Box,
    Button,
    CircularProgress,
    FormControl,
    InputLabel,
    MenuItem,
    Select,
    TextField,
    Typography
} from '@mui/material';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { assignPayMethodToRaffle, getActivePayMethods } from '../../../api/payMethodeApi';
import { AssignPayMethodToRaffleFormType } from '../../../types';
import { capitalize } from '../../../utils';

// Schema de validación basado en el backend
// const assignPayMethodToRaffleSchema = z.object({
//     payMethodeId: z.number({
//         required_error: 'Debe seleccionar un método de pago',
//         invalid_type_error: 'El método de pago debe ser un número'
//     })
//         .int('El ID del método de pago debe ser un número entero')
//         .positive('El ID del método de pago debe ser positivo'),
//     accountNumber: z.string()
//         .min(1, 'El número de cuenta es obligatorio')
//         .max(50, 'El número de cuenta no puede tener más de 50 caracteres')
//         .optional(),
//     accountHolder: z.string()
//         .min(1, 'El titular de la cuenta es obligatorio')
//         .max(100, 'El titular de la cuenta no puede tener más de 100 caracteres')
//         .optional(),
//     bankName: z.string()
//         .max(100, 'El nombre del banco no puede tener más de 100 caracteres')
//         .optional(),
// });

// type AssignPayMethodFormData = z.infer<typeof assignPayMethodToRaffleSchema>;

type AssignPayMethodFormProps = {
    raffleId: string;
    onSuccess?: () => void;
};



function AssignPayMethodForm({ raffleId, onSuccess }: AssignPayMethodFormProps) {
    const [isExpanded, setIsExpanded] = useState(false);
    const queryClient = useQueryClient();

    const { 
        data: payMethods, 
        isLoading: isLoadingPayMethods,
        isError: isErrorPayMethods 
    } = useQuery({
        queryKey: ['activePayMethods'],
        queryFn: getActivePayMethods,
        retry: 2
    });

    const initialValues = {
        payMethodeId: 0, // Sin selección inicial
        accountNumber: '',
        accountHolder: '',
        bankName: '',
    }

    const {
        control,
        handleSubmit,
        reset,
        watch,
        formState: { errors }
    } = useForm<AssignPayMethodToRaffleFormType>({
        defaultValues: initialValues,
        mode: 'onChange'
    });

    const payMethodeId = watch('payMethodeId');

    const { mutate, isPending} = useMutation({
        mutationFn: assignPayMethodToRaffle,
        onSuccess: () => {
            toast.success('Método de pago asignado correctamente');
            reset();
            setIsExpanded(false);
            queryClient.invalidateQueries({ queryKey: ['rafflePayMethods', raffleId] });
            onSuccess?.();
        },
        onError: (error: Error) => {
            toast.error(error.message || 'Error al asignar método de pago');
        }
    });

    const onSubmit = (data: AssignPayMethodToRaffleFormType) => {
        // Validación adicional antes de enviar
        if (!data.payMethodeId || data.payMethodeId === 0) {
            toast.error('Debe seleccionar un método de pago');
            return;
        }
        
        mutate({ raffleId, assignPayMethodToRaffleFormData: data });
    };

    const handleAccordionChange = (_event: React.SyntheticEvent, expanded: boolean) => {
        setIsExpanded(expanded);
        if (!expanded) {
            reset(); // Limpiar formulario al cerrar
        }
    };

    return (
        <Box sx={{ mt: 2 }}>
            <Accordion 
                expanded={isExpanded} 
                onChange={handleAccordionChange}
                sx={{
                    border: '1px solid',
                    borderColor: 'divider',
                    '&:before': {
                        display: 'none',
                    },
                    boxShadow: 1
                }}
            >
                <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    sx={{
                        bgcolor: 'primary.main',
                        color: 'primary.contrastText',
                        '&:hover': {
                            bgcolor: 'primary.dark',
                        },
                        '& .MuiAccordionSummary-content': {
                            alignItems: 'center'
                        }
                    }}
                >
                    <AddIcon sx={{ mr: 1 }} />
                    <Typography variant="subtitle1" fontWeight="medium">
                        Asignar Nuevo Método de Pago
                    </Typography>
                </AccordionSummary>

                <AccordionDetails sx={{ p: 3 }}>
                    {isErrorPayMethods && (
                        <Alert severity="error" sx={{ mb: 2 }}>
                            Error al cargar los métodos de pago disponibles
                        </Alert>
                    )}

                    <Box
                        component="form"
                        onSubmit={handleSubmit(onSubmit)}
                        sx={{
                            display: 'grid',
                            gap: 2,
                            gridTemplateColumns: {
                                xs: '1fr',
                                sm: 'repeat(2, 1fr)'
                            }
                        }}
                    >
                        {/* Selector de método de pago */}
                        <FormControl 
                            fullWidth 
                            error={!!errors.payMethodeId}
                            sx={{ gridColumn: { xs: '1', sm: '1 / -1' } }}
                        >
                            <InputLabel>Método de Pago *</InputLabel>
                            <Controller
                                name="payMethodeId"
                                control={control}
                                rules={{
                                    required: 'Debe seleccionar un método de pago',
                                    validate: (value) => {
                                        if (!value || value === 0) {
                                            return 'Debe seleccionar un método de pago válido';
                                        }
                                        return true;
                                    }
                                }}
                                render={({ field }) => (
                                    <Select
                                        {...field}
                                        label="Método de Pago *"
                                        disabled={isLoadingPayMethods || isPending}
                                        value={field.value || ''}
                                        onChange={(e) => field.onChange(Number(e.target.value))}
                                        error={!!errors.payMethodeId}
                                    >
                                        <MenuItem value="" disabled>
                                            <em>Seleccione un método de pago</em>
                                        </MenuItem>
                                        {isLoadingPayMethods ? (
                                            <MenuItem disabled>
                                                <CircularProgress size={20} sx={{ mr: 1 }} />
                                                Cargando...
                                            </MenuItem>
                                        ) : (
                                            payMethods?.map((method) => (
                                                <MenuItem key={method.id} value={method.id}>
                                                    {capitalize(method.name)}
                                                </MenuItem>
                                            ))
                                        )}
                                    </Select>
                                )}
                            />
                            {errors.payMethodeId && (
                                <Typography variant="caption" color="error" sx={{ mt: 0.5 }}>
                                    {errors.payMethodeId.message}
                                </Typography>
                            )}
                        </FormControl>

                        {/* Número de cuenta */}
                        <Controller
                            name="accountNumber"
                            control={control}
                            render={({ field }) => (
                                <TextField
                                    {...field}
                                    label="Número de Cuenta"
                                    fullWidth
                                    error={!!errors.accountNumber}
                                    helperText={errors.accountNumber?.message}
                                    disabled={isPending}
                                    placeholder="Ej: 1234567890"
                                />
                            )}
                        />

                        {/* Titular de la cuenta */}
                        <Controller
                            name="accountHolder"
                            control={control}
                            render={({ field }) => (
                                <TextField
                                    {...field}
                                    label="Titular de la Cuenta"
                                    fullWidth
                                    error={!!errors.accountHolder}
                                    helperText={errors.accountHolder?.message}
                                    disabled={isPending}
                                    placeholder="Nombre del titular"
                                />
                            )}
                        />

                        {/* Nombre del banco */}
                        <Controller
                            name="bankName"
                            control={control}
                            render={({ field }) => (
                                <TextField
                                    {...field}
                                    label="Nombre del Banco"
                                    fullWidth
                                    error={!!errors.bankName}
                                    helperText={errors.bankName?.message}
                                    disabled={isPending}
                                    placeholder="Ej: Banco de Bogotá"
                                    sx={{ gridColumn: { xs: '1', sm: '1 / -1' } }}
                                />
                            )}
                        />

                        {/* Botones */}
                        <Box 
                            sx={{ 
                                gridColumn: '1 / -1',
                                display: 'flex', 
                                gap: 2, 
                                justifyContent: 'flex-end',
                                mt: 1
                            }}
                        >
                            <Button
                                type="button"
                                variant="outlined"
                                onClick={() => {
                                    reset();
                                    setIsExpanded(false);
                                }}
                                disabled={isPending}
                            >
                                Cancelar
                            </Button>
                            <Button
                                type="submit"
                                variant="contained"
                                disabled={isPending || !payMethodeId || payMethodeId === 0 || !!errors.payMethodeId}
                                startIcon={isPending ? 
                                    <CircularProgress size={16} /> : 
                                    <AddIcon />
                                }
                            >
                                {isPending ? 'Asignando...' : 'Asignar Método'}
                            </Button>
                        </Box>
                    </Box>
                </AccordionDetails>
            </Accordion>
        </Box>
    );
}

export default AssignPayMethodForm;