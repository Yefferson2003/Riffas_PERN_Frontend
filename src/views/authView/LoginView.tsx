import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import { LoadingButton } from "@mui/lab";
import { FormControl, IconButton, InputAdornment, InputLabel, OutlinedInput, TextField } from "@mui/material";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { login } from "../../api/authApi";
import ErrorMessage from "../../components/ErrorMessage";
import { UserLoginForm } from "../../types";
import { useNavigate } from 'react-router-dom';

function LoginView() {

    const [showPassword, setShowPassword] = useState(false);
    const token = localStorage.getItem('AUTH_TOKEN')
    // const {user} = useAuth()
    const navigate = useNavigate()

    const handleClickShowPassword = () => setShowPassword((show) => !show);

    const handleMouseDownPassword = (event: React.MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();
    };

    const handleMouseUpPassword = (event: React.MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();
    };

    const initialValues: UserLoginForm = {
        identificationNumber: '',
        password: '',
    }
    const { register, handleSubmit, reset, formState: { errors } } = useForm({ defaultValues: initialValues })

    const queryClient = useQueryClient()
    const {mutate, isPending} = useMutation({
        mutationFn: login,
        onError(error) {
            toast.error(error.message)
        },
        onSuccess() {
            queryClient.invalidateQueries({queryKey: ['user']})
            reset()
            navigate('/')
        }
    })

    const handleLogin = (formData: UserLoginForm) => {mutate(formData)}
    
    return (
        <div>
            <form
                onSubmit={handleSubmit(handleLogin)}
                className="space-y-6"
                noValidate
                autoComplete="off"
            >
                <FormControl fullWidth>
                <TextField id="identificationNumber" label="Número de Identificación" color="info"
                    {...register('identificationNumber', {
                        required: "La Identificación es obligatorio",
                    })}
                />
                {errors.identificationNumber && (
                    <ErrorMessage id="error-email">{errors.identificationNumber.message}</ErrorMessage>
                )}
                </FormControl>
                
                <FormControl fullWidth>
                <InputLabel color="info" htmlFor="password">Contraseña</InputLabel>
                <OutlinedInput
                    color="info"
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    endAdornment={
                    <InputAdornment position="end">
                        <IconButton
                        aria-label={
                            showPassword ? 'hide the password' : 'display the password'
                        }
                        onClick={handleClickShowPassword}
                        onMouseDown={handleMouseDownPassword}
                        onMouseUp={handleMouseUpPassword}
                        edge="end"
                        >
                        {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                        </IconButton>
                    </InputAdornment>
                    }
                    label="Contraseña"
                    {...register('password', { required: 'Contraseña obligatoria' })}
                />
                {errors.password && (
                    <ErrorMessage>{errors.password.message}</ErrorMessage>
                )}
                </FormControl>
                
                <FormControl fullWidth>
                <LoadingButton type="submit" variant="contained" color="primary"
                    id="button-login" loadingIndicator='Cargando...'
                    loading={isPending}
                    disabled={!!token}
                >
                    Iniciar Sesión
                </LoadingButton>
                </FormControl>
            </form>
        </div>
    )
}

export default LoginView