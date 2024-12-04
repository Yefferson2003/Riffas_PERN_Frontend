import { Box, Button, Modal } from "@mui/material";
import { useForm } from "react-hook-form";
import { useLocation, useNavigate } from "react-router-dom";
import { UserForm as UserFormulario } from "../../types";
import ButtonCloseModal from "../ButtonCloseModal";
import UserForm from "./UserForm";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createUser } from "../../api/userApi";
import { toast } from "react-toastify";

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

type AddUserModalProps = {
    filter: object,
    page: number,
    rowsPerPag: number
}

function AddUserModal({filter, page, rowsPerPag} : AddUserModalProps) {

    // MODAL //
    const navigate = useNavigate(); 
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const modalAddUser = queryParams.get('newUser')
    const show = modalAddUser ? true : false;

    const initialValues : UserFormulario = {
        firstName: '',
        lastName: '',
        identificationType: 'CC',
        identificationNumber: '',
        phone: '',
        address: '',
        email: '',
        password: '',
        confirmPassword: '',
        rolName: 'vendedor'
    }

    const {register, handleSubmit, reset, watch, formState: {errors}} = useForm({
        defaultValues : initialValues
    })
    const queryClient = useQueryClient()
    const {mutate, isPending} = useMutation({
        mutationFn: createUser,
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

    const handleCreateUser = (formData : UserFormulario) => mutate(formData)


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

            <h2 className="mb-5 text-2xl font-bold text-center text-azul">Crear Usuario</h2>
            <p className="mb-5 text-xl font-bold text-center">LLena este formulario para crear un nuevo usuario</p>

            <form 
                onSubmit={handleSubmit(handleCreateUser)}
                className='mt-10 space-y-3 text-center'
                noValidate
                autoComplete="off"
            >
                <UserForm
                    register={register}
                    errors={errors}
                    watch={watch}
                />
                
                <Button
                    type="submit"
                    variant="contained"
                    disabled={isPending}
                >
                    Guardar Usuario
                </Button>
            </form>
            
            </Box>
        </Modal>
    )
}

export default AddUserModal