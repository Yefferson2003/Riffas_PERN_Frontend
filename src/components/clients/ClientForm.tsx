import { UseFormRegister, FieldErrors, UseFormSetValue, UseFormWatch } from "react-hook-form";
import { ClientFormType } from "../../types";
import { Box, TextField, Typography } from "@mui/material";
import PhoneNumberInput from "../PhoneNumberInput";

interface ClientFormProps {
    register: UseFormRegister<ClientFormType>;
    errors: FieldErrors<ClientFormType>;
    setValue: UseFormSetValue<ClientFormType>
    watch: UseFormWatch<ClientFormType>
}

export default function ClientForm({ register, errors, setValue, watch }: ClientFormProps) {
    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2 }}>
                <TextField
                    label="Nombre"
                    fullWidth
                    variant="outlined"
                    size="small"
                    {...register("firstName", { required: "El nombre es obligatorio" })}
                    error={!!errors.firstName}
                    helperText={errors.firstName?.message}
                />
                <TextField
                    label="Apellido"
                    fullWidth
                    variant="outlined"
                    size="small"
                    {...register("lastName", { required: "El apellido es obligatorio" })}
                    error={!!errors.lastName}
                    helperText={errors.lastName?.message}
                />
            </Box>
            <Box>
                <Typography sx={{ mb: 2, fontSize: '0.875rem', fontWeight: 500, color: 'text.primary' }}>
                    Número de contacto para clientes
                </Typography>
                <PhoneNumberInput
                    value={typeof (watch) === 'function' ? watch('phone') ?? '' : ''}
                    onChange={(value) => setValue && setValue('phone', value ?? null)}
                />
                <Typography variant="caption" color="error">
                    {errors.phone?.message}
                </Typography>
            </Box>
            
            <TextField
                label="Dirección"
                fullWidth
                variant="outlined"
                size="small"
                {...register("address", {
                    required: "La dirección es obligatoria",
                    minLength: {
                        value: 4,
                        message: "La dirección debe tener al menos 4 caracteres"
                    }
                })}
                error={!!errors.address}
                helperText={errors.address?.message}
            />
        </Box>
    );
}
