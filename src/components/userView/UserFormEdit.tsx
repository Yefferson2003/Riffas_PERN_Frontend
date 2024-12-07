import { FormControl, InputLabel, MenuItem, Select, TextField } from "@mui/material"
import { FieldErrors, UseFormRegister, UseFormWatch } from "react-hook-form"
import { UserEditForm } from "../../types"

type UserFormProps = {
    register: UseFormRegister<UserEditForm>
    errors: FieldErrors<UserEditForm>
    watch: UseFormWatch<UserEditForm>
}

function UserFormEdit({register, errors, watch,} : UserFormProps) {

    const {identificationType} = watch();

    return (
        <div>
            <FormControl size="small" fullWidth
                sx={{display: 'flex', gap: 2}}
            >
                <TextField id="firstName" label="Nombres" variant="outlined" 
                    error={!!errors.firstName}
                    helperText={errors.firstName?.message}
                    {...register('firstName', {required: 'Nombres Obligatorios'})}
                />
                <TextField id="lastName" label="Apellidos" variant="outlined" 
                    error={!!errors.lastName}
                    helperText={errors.lastName?.message}
                    {...register('lastName', {required: 'Apellidos Obligatorios'})}
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
                <TextField id="phone" label="Teléfono" variant="outlined" 
                    error={!!errors.phone}
                    helperText={errors.phone?.message}
                    {...register('phone', {
                        required: "El Teléfono es obligatorio",
                        pattern: {
                            value: /^[0-9]+$/, 
                            message: 'Solo se permiten números',
                        }
                    })}
                />
                <TextField id="address" label="Dirección" variant="outlined" 
                    error={!!errors.address}
                    helperText={errors.address?.message}
                    {...register('address', {required: 'Dirección Obligatoria'})}
                />
                <TextField id="email" label="Correo" variant="outlined" 
                    error={!!errors.email}
                    helperText={errors.email?.message}
                    {...register('email', {
                        required: "El Correo es obligatorio",
                        pattern: {
                            value: /\S+@\S+\.\S+/,
                            message: "E-mail no válido",
                        },
                    })}
                />
            </FormControl>
        </div>
    )
}

export default UserFormEdit