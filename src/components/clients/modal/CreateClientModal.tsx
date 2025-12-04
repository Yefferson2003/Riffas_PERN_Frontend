import { Box, Modal, Typography, Button } from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";
import ButtonCloseModal from "../../ButtonCloseModal";
import { ClientFormType } from "../../../types";
import { useForm } from "react-hook-form";
import ClientForm from "../ClientForm";
import { useMutation } from "@tanstack/react-query";
import { createClient } from "../../../api/clientApi";
import { toast } from "react-toastify";

const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 500,
    maxWidth: '98vw',
    bgcolor: 'background.paper',
    borderRadius: 4,
    boxShadow: 8,
    p: { xs: 2, sm: 4 },
    maxHeight: '95vh',
    overflowY: 'auto',
    border: 'none',
};

type CreateClientModalProps = {
    refetch: () => void
}

export default function CreateClientModal({refetch}: CreateClientModalProps) {

     // MODAL //
    const navigate = useNavigate(); 
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const modalAddClient = queryParams.get('newClient')
    const show = modalAddClient ? true : false;

    const initialValues: ClientFormType   = {
        address: '',
        firstName: '',
        lastName: '',
        phone: ''
    }

    const {register, handleSubmit, setValue, watch, reset, formState: {errors}} = useForm<ClientFormType>({
        defaultValues : initialValues
    })

    const { mutate, isPending} = useMutation({
        mutationFn: createClient,
        onError(error) {
            toast.error(error.message || 'Error al crear el cliente');
        },
        onSuccess() {
            toast.success('Cliente creado con éxito');
            reset();
            refetch();
        },
    })

    const handleCreateClient = (formData: ClientFormType) => {
        mutate({formData});
    }

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
                <Typography
                    variant="h5"
                    component="h2"
                    sx={{
                        textAlign: 'center',
                        fontWeight: 700,
                        mb: 2,
                        color: 'primary.main',
                        letterSpacing: 1
                    }}
                >
                    Crear Nuevo Cliente
                </Typography>

                <Typography
                    variant="body1"
                    sx={{ textAlign: 'center', mb: 3, color: 'text.secondary', fontWeight: 500 }}
                >
                    Completa el formulario para agregar un cliente
                </Typography>

                <form
                    onSubmit={handleSubmit(handleCreateClient)}
                    style={{ marginTop: 8 }}
                    autoComplete="off"
                >
                    <ClientForm
                        register={register}
                        errors={errors}
                        setValue={setValue}
                        watch={watch}
                    />

                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                        <Button
                            type="submit"
                            variant="contained"
                            color="primary"
                            disabled={isPending}
                            sx={{
                                width: '100%',
                                maxWidth: 220,
                                fontWeight: 700,
                                fontSize: '1rem',
                                borderRadius: 2,
                                boxShadow: 2,
                                py: 1.5,
                                textTransform: 'none',
                            }}
                        >
                            {isPending ? 'Creando Cliente...' : 'Crear Cliente'}
                        </Button>
                    </Box>
                </form>
            </Box>
        </Modal>
    );
}
