import {
    Close as CloseIcon,
    Payment as PaymentIcon,
    Save as SaveIcon
} from '@mui/icons-material';
import {
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    IconButton,
    Typography,
    useMediaQuery,
    useTheme
} from '@mui/material';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { createPayMethod } from '../../api/payMethodeApi';
import { PayMethodFormType } from '../../types';
import PayMethodForm from './PayMethodForm';


interface CreatePayMethodModalProps {
    open: boolean;
    onClose: () => void;
}

function CreatePayMethodModal({ open, onClose}: CreatePayMethodModalProps) {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const queryClient = useQueryClient();
    
    const initialFormData: PayMethodFormType = {
        name: '',
    }


    const {
        control,
        handleSubmit,
        reset,
        formState: { errors, isValid }
    } = useForm<PayMethodFormType>({defaultValues: initialFormData});

    // Mutation para crear método de pago
    const {mutate, isPending} = useMutation({
        mutationFn: createPayMethod,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['payMethods'] });
            toast.success('Método de pago creado exitosamente');
            handleClose();
        },
        onError: (error: Error) => {
            toast.error(error.message || 'Error al crear el método de pago');
        }
    });

    const onSubmit = async (formData: PayMethodFormType) => {
        mutate({formData});
    };

    const handleClose = () => {
        reset();
        onClose();
    };

    return (
        <Dialog
            open={open}
            onClose={handleClose}
            maxWidth="sm"
            fullWidth
            fullScreen={isMobile}
            PaperProps={{
                sx: {
                    borderRadius: { xs: 0, sm: 2 },
                    m: { xs: 0, sm: 2 }
                }
            }}
        >
            {/* Header */}
            <DialogTitle sx={{ 
                pb: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
            }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <PaymentIcon sx={{ color: '#1976d2', fontSize: 28 }} />
                    <Typography variant="h6" component="div" sx={{ fontWeight: 600, color: '#1976d2' }}>
                        Crear Método de Pago
                    </Typography>
                </Box>
                
                <IconButton
                    onClick={handleClose}
                    disabled={isPending}
                    sx={{ 
                        color: 'text.secondary',
                        '&:hover': { bgcolor: 'action.hover' }
                    }}
                >
                    <CloseIcon />
                </IconButton>
            </DialogTitle>

            {/* Content */}
            <DialogContent sx={{ pb: 2, pt: 2 }}>
                <Box component="form" onSubmit={handleSubmit(onSubmit)}>
                    <PayMethodForm
                        control={control}
                        errors={errors}
                        isSubmitting={isPending}
                        isMobile={isMobile}
                    />
                </Box>
            </DialogContent>

            {/* Actions */}
            <DialogActions sx={{ 
                px: 3, 
                pb: 3, 
                pt: 1,
                gap: 1,
                flexDirection: { xs: 'column', sm: 'row' }
            }}>
                <Button
                    onClick={handleClose}
                    disabled={isPending}
                    variant="outlined"
                    sx={{
                        minWidth: { xs: '100%', sm: 120 },
                        borderRadius: 2,
                        textTransform: 'none',
                        order: { xs: 2, sm: 1 }
                    }}
                >
                    Cancelar
                </Button>
                
                <Button
                    onClick={handleSubmit(onSubmit)}
                    disabled={!isValid || isPending}
                    variant="contained"
                    startIcon={isPending ? null : <SaveIcon />}
                    sx={{
                        minWidth: { xs: '100%', sm: 140 },
                        borderRadius: 2,
                        textTransform: 'none',
                        fontWeight: 600,
                        bgcolor: '#1976d2',
                        '&:hover': {
                            bgcolor: '#1565c0'
                        },
                        order: { xs: 1, sm: 2 }
                    }}
                >
                    {isPending ? 'Creando...' : 'Crear Método'}
                </Button>
            </DialogActions>
        </Dialog>
    );
}

export default CreatePayMethodModal;