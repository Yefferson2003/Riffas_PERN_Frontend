import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import { LoadingButton } from "@mui/lab";
import { FormControl, IconButton, InputAdornment, InputLabel, OutlinedInput, TextField } from "@mui/material";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { login } from "../../api/authApi";
import ErrorMessage from "../../components/ErrorMessage";
import { useAuth } from "../../hooks/useAuth";
import { UserLoginForm } from "../../types";

function LoginView() {

    const [showPassword, setShowPassword] = useState(false);
    // const token = localStorage.getItem('AUTH_TOKEN')
    const {user} = useAuth()
    const navigate = useNavigate()

    const handleClickShowPassword = () => setShowPassword((show) => !show);

    const handleMouseDownPassword = (event: React.MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();
    };

    const handleMouseUpPassword = (event: React.MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();
    };

    const initialValues: UserLoginForm = {
        email: '',
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
            reset()
            queryClient.invalidateQueries({queryKey: ['user']})
        }
    })

    useEffect(() => {
        if (user) {
            navigate('/')
        }
    }, [user, navigate])
    

    const handleLogin = (formData: UserLoginForm) => mutate(formData)
    
    return (
        <div>
            <form
                onSubmit={handleSubmit(handleLogin)}
                className="space-y-6"
                noValidate
                autoComplete="off"
            >
                <FormControl fullWidth>
                <TextField id="email" label="Email" color="info"
                    {...register('email', {
                        required: "El Email es obligatorio",
                        pattern: {
                            value: /\S+@\S+\.\S+/,
                            message: "E-mail no válido",
                        },
                    })}
                />
                {errors.email && (
                    <ErrorMessage id="error-email">{errors.email.message}</ErrorMessage>
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
                >
                    Iniciar Sesión
                </LoadingButton>
                </FormControl>
            </form>
        </div>
    )
}

export default LoginView