import { Box, Button, Modal } from "@mui/material";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { editUser } from "../../api/userApi";
import { User, UserEditForm } from "../../types";
import ButtonCloseModal from "../ButtonCloseModal";
import UserFormEdit from "./UserFormEdit";

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

type EditUserModalProps = {
    filter: object,
    page: number,
    rowsPerPag: number
    userId: number
    user: User
}

function EditUserModal({filter, page, rowsPerPag, userId, user} : EditUserModalProps) {

    // MODAL //
    const navigate = useNavigate(); 
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const modalAddUser = queryParams.get('editUser')
    const show = modalAddUser ? true : false;

    const initialValues : UserEditForm = {
        firstName: user.firstName,
        lastName: user.lastName,
        identificationType: user.identificationType,
        identificationNumber: user.identificationNumber,
        phone: user.phone,
        address: user.address,
        email: user.email,
    }

    const {register, handleSubmit, reset, watch, formState: {errors}} = useForm({
        defaultValues : initialValues
    })
    const queryClient = useQueryClient()
    const {mutate, isPending} = useMutation({
        mutationFn: editUser,
        onError(error) {
            toast.error(error.message)
        },
        onSuccess(data) {
            queryClient.invalidateQueries({queryKey: ['userList',filter, page, rowsPerPag]})
            queryClient.invalidateQueries({queryKey: ['user', userId]})
            reset()
            toast.success(data)
            navigate(location.pathname, {replace: true})
        },
    })

    const handleCreateUser = (formData : UserEditForm) => mutate({formData, userId})


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

            <h2 className="mb-5 text-2xl font-bold text-center text-azul">Edit Usuario</h2>
            <p className="mb-5 text-xl font-bold text-center">LLena este formulario para editar un usuario</p>

            <form 
                onSubmit={handleSubmit(handleCreateUser)}
                className='mt-10 space-y-3 text-center'
                noValidate
                autoComplete="off"
            >
                <UserFormEdit
                    register={register}
                    errors={errors}
                    watch={watch}
                />
                
                <Button
                    type="submit"
                    variant="contained"
                    disabled={isPending}
                >
                    Editar Usuario
                </Button>
            </form>
            
            </Box>
        </Modal>
    )
}

export default EditUserModal