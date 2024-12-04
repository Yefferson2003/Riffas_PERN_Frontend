import { Box, Button, FormControl, Modal, TextField } from "@mui/material";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { editPassowrdUser } from "../../api/userApi";
import { PasswordEditForm } from "../../types";
import ButtonCloseModal from "../ButtonCloseModal";

const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 550,
    maxWidth: '100vw',
    bgcolor: '#f1f5f9',
    border: '2px solid #000',
    boxShadow: 24,
    p: 4,
    maxHeight: '95vh', 
    overflowY: 'auto',
};

type EditPasswordUserModalProps = {
    filter: object,
    page: number,
    rowsPerPag: number
}

function EditPasswordUserModal({filter, page, rowsPerPag} : EditPasswordUserModalProps) {
    // MODAL //
    const navigate = useNavigate(); 
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const modalEditPasswordUser = queryParams.get('editPasswordUser')
    const show = modalEditPasswordUser ? true : false;
    const userId = Number(modalEditPasswordUser)

    const initialValues : PasswordEditForm  = {
        password: '',
        confirmPassword: '',
    }

    const {register, handleSubmit, reset, watch, formState: {errors}} = useForm({
        defaultValues : initialValues
    })

    const {password} = watch();

    const queryClient = useQueryClient()
    const {mutate, isPending} = useMutation({
        mutationFn: editPassowrdUser,
        onError(error) {
            toast.error(error.message)
        },
        onSuccess(data) {
            queryClient.invalidateQueries({queryKey: ['userList',filter, page, rowsPerPag]})
            reset()
            toast.success(data)
            navigate(location.pathname, {replace: true})
        },
    })

    const handleUpdatePasswordUser = (formData : PasswordEditForm) => mutate({formData, userId})

    return (
        <Modal
        open={show}
            onClose={() => {
                navigate(location.pathname, {replace: true})
            }}
            aria-labelledby="modal-modal-title"
            aria-describedby="modal-modal-description"
        >
            <Box sx={style}>
            <ButtonCloseModal/>
            <h2 className="mb-5 text-2xl font-bold text-center text-azul">Editar Contraseña</h2>
            <p className="mb-5 text-xl font-bold text-center">LLena este formulario para editar la contraseña del usuario</p>

            <form 
                onSubmit={handleSubmit(handleUpdatePasswordUser)}
                className='mt-10 space-y-3 text-center'
                noValidate
                autoComplete="off"
            >
                <FormControl size="small" fullWidth
                    sx={{display: 'flex', gap: 2}}
                >
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
                </FormControl>
                <Button
                    type="submit"
                    variant="contained"
                    disabled={isPending}
                >
                    Actualizar Contraseña
                </Button>
            </form>
            </Box>
        </Modal>
    )
}

export default EditPasswordUserModal