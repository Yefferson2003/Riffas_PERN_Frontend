import { FormControl, InputLabel, MenuItem, Select, TextField } from "@mui/material"
import { FieldErrors, UseFormRegister, UseFormWatch } from "react-hook-form"
import { UserForm as UserFormulario } from "../../types"

type UserFormProps = {
    register: UseFormRegister<UserFormulario>
    errors: FieldErrors<UserFormulario>
    watch: UseFormWatch<UserFormulario>
}

function UserForm({register, errors, watch,} : UserFormProps) {

    const {password, identificationType, rolName} = watch();

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
                            value: /^[3][0-9]{9}$/,
                            message: "Número de teléfono inválido, debe ser un número colombiano de 10 dígitos",
                        },
                        minLength: {
                            value: 10,
                            message: "El número debe tener 10 dígitos",
                        },
                        maxLength: {
                            value: 10,
                            message: "El número debe tener 10 dígitos",
                        },
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
                
                <TextField id="password" label="Contraseña" variant="outlined" 
                    error={!!errors.password}
                    helperText={errors.password?.message}
                    {...register('password', {
                        required: 'Contraseña obligatoria',
                        minLength: {
                            value: 8,
                            message: 'La contraseña debe tener al menos 8 caracteres',
                        },
                        pattern: {
                            value: /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)[A-Za-z\d]{8,}$/,
                            message: 'Debe contener al menos una letra mayúscula, una letra minúscula y un número',
                        },
                    })}
                />
                <TextField id="confirmPassword" label="Confirmar Contraseña" variant="outlined" 
                    error={!!errors.confirmPassword}
                    helperText={errors.confirmPassword?.message}
                    {...register('confirmPassword', { 
                        required: 'Contraseña obligatoria', 
                        minLength: {
                            value: 8,
                            message: "La contraseña debe ser mas larga",
                        },
                        validate: value => value === password || 'Las Contraseñas no son iguales'
                    })}
                />
                <FormControl>
                    <InputLabel id="identificationTypelabel">Rol</InputLabel>
                    <Select id="rolName" label="Rol" variant="outlined" 
                        defaultValue={rolName}
                        {...register('rolName', {required: 'Seleccione un tipo'})}
                    >
                        <MenuItem value={'vendedor'}>Vendedor</MenuItem>
                        <MenuItem value={'responsable'}>Responsable</MenuItem>
                    </Select>
                </FormControl>
                

            </FormControl>
        </div>
    )
}

export default UserForm