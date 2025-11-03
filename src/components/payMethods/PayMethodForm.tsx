import {
    Box,
    FormControl,
    TextField,
    Typography
} from '@mui/material';
import { Controller, Control, FieldErrors } from 'react-hook-form';
import { PayMethodFormType } from '../../types';

interface PayMethodFormProps {
    control: Control<PayMethodFormType>;
    errors: FieldErrors<PayMethodFormType>;
    isSubmitting: boolean;
    isMobile: boolean;
}

function PayMethodForm({ control, errors, isSubmitting, isMobile }: PayMethodFormProps) {
    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 1 }}>
            {/* Campo Nombre */}
            <FormControl fullWidth>
                <Controller
                    name="name"
                    control={control}
                    render={({ field }) => (
                        <TextField
                            {...field}
                            label="Nombre del método"
                            placeholder="Ej: Transferencia bancaria, Efectivo, etc."
                            error={!!errors.name}
                            helperText={errors.name?.message}
                            disabled={isSubmitting}
                            autoFocus={!isMobile}
                            fullWidth
                            variant="outlined"
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: 2
                                }
                            }}
                        />
                    )}
                />
            </FormControl>

            {/* Información adicional */}
            <Box sx={{ 
                bgcolor: 'info.light', 
                color: 'info.contrastText',
                p: 2, 
                borderRadius: 2,
                border: 1,
                borderColor: 'info.main'
            }}>
                <Typography variant="body2" sx={{ fontWeight: 500, mb: 1 }}>
                    📝 Información importante:
                </Typography>
                <Typography variant="caption" component="div">
                    • Podrás configurar detalles específicos (cuenta, titular, etc.) cuando asignes este método a una rifa
                </Typography>
                <Typography variant="caption" component="div">
                    • El nombre debe ser descriptivo y único
                </Typography>
            </Box>
        </Box>
    );
}

export default PayMethodForm;