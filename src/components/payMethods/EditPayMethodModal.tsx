import React from 'react';
import {
    Close as CloseIcon,
    Edit as EditIcon,
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
import { updatePayMethod } from '../../api/payMethodeApi';
import { PayMethodeType, PayMethodFormType } from '../../types';
import PayMethodForm from './PayMethodForm';

interface EditPayMethodModalProps {
    open: boolean;
    onClose: () => void;
    payMethod: PayMethodeType | null;
}

function EditPayMethodModal({ open, onClose, payMethod }: EditPayMethodModalProps) {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const queryClient = useQueryClient();

    const {
        control,
        handleSubmit,
        reset,
        formState: { errors, isValid }
    } = useForm<PayMethodFormType>({
        defaultValues: {
            name: payMethod?.name || '',
        }
    });

    // Mutation para actualizar método de pago
    const { mutate, isPending } = useMutation({
        mutationFn: updatePayMethod,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['payMethods'] });
            toast.success('Método de pago actualizado exitosamente');
            handleClose();
        },
        onError: (error: Error) => {
            toast.error(error.message || 'Error al actualizar el método de pago');
        }
    });

    const onSubmit = async (formData: PayMethodFormType) => {
        if (!payMethod) return;
        
        mutate({
            payMethodId: payMethod.id,
            formData
        });
    };

    const handleClose = () => {
        if (isPending) return;
        
        reset();
        onClose();
    };

    // Actualizar el formulario cuando cambie el método de pago
    React.useEffect(() => {
        if (payMethod) {
            reset({
                name: payMethod.name
            });
        }
    }, [payMethod, reset]);

    if (!payMethod) return null;

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
                    <EditIcon sx={{ color: 'primary.main', fontSize: 28 }} />
                    <Box>
                        <Typography variant="h6" component="div" sx={{ fontWeight: 600 }}>
                            Editar Método de Pago
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                            ID: {payMethod.id} • Estado: {payMethod.isActive ? 'Activo' : 'Inactivo'}
                        </Typography>
                    </Box>
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
                        order: { xs: 1, sm: 2 }
                    }}
                >
                    {isPending ? 'Guardando...' : 'Guardar Cambios'}
                </Button>
            </DialogActions>
        </Dialog>
    );
}

export default EditPayMethodModal;