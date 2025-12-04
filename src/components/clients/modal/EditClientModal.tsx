import { Box, Button, CircularProgress, Modal, Typography } from "@mui/material";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { getClientById, updateClient } from "../../../api/clientApi";
import { ClientFormType } from "../../../types";
import ButtonCloseModal from "../../ButtonCloseModal";
import ClientForm from "../ClientForm";

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

interface EditClientModalProps {
    refetch: () => void;
}

export default function EditClientModal({ refetch, }: EditClientModalProps) {

    const queryClients = useQueryClient();

    const navigate = useNavigate();
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const modalEditClient = queryParams.get('editClient');
    const show = modalEditClient ? true : false;


    const { data: foundClient, isError } = useQuery({
        queryKey: ['client', modalEditClient],
        queryFn: () => getClientById({ clientId: Number(modalEditClient) }),
        enabled: !!modalEditClient,
    })
    
    const initialValues: ClientFormType = {
        address: foundClient?.address ?? '',
        firstName: foundClient?.firstName ?? '',
        lastName: foundClient?.lastName ?? '',
        phone: foundClient?.phone ?? ''
    };


    const { register, handleSubmit, setValue, watch, reset, formState: { errors } } = useForm<ClientFormType>({
        defaultValues: initialValues
    });

    // Sincronizar valores iniciales cuando cambie el cliente
    useEffect(() => {
        reset({
            address: foundClient?.address ?? '',
            firstName: foundClient?.firstName ?? '',
            lastName: foundClient?.lastName ?? '',
            phone: foundClient?.phone ?? ''
        });
    }, [foundClient, reset]);

    const { mutate, isPending } = useMutation({
        mutationFn: (data: { clientId: number, formData: ClientFormType }) => updateClient(data),
        onError(error) {
            toast.error(error.message || 'Error al editar el cliente');
        },
        onSuccess(data) {
            toast.success(data || 'Cliente editado con éxito');
            reset();
            navigate(location.pathname, { replace: true });
            refetch();
            queryClients.invalidateQueries({ queryKey: ['client', modalEditClient] });
        },
    });

    const handleEditClient = (formData: ClientFormType) => {
        if (!foundClient) return;
        mutate({ clientId: foundClient.id, formData });
    };

    if (isError) return <Navigate to="/404"/>;

    if (foundClient) return (
        <Modal
            open={show}
            onClose={() => {
                navigate(location.pathname, { replace: true });
            }}
            aria-labelledby="modal-modal-title"
            aria-describedby="modal-modal-description"
        >
            <Box sx={style}>
                <ButtonCloseModal />
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
                    Editar Cliente
                </Typography>

                <Typography
                    variant="body1"
                    sx={{ textAlign: 'center', mb: 3, color: 'text.secondary', fontWeight: 500 }}
                >
                    Modifica los datos del cliente
                </Typography>

                {isPending ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 180 }}>
                            <CircularProgress size={48} color="primary" />
                        </Box>
                    ) : ( 
                        <form
                            onSubmit={handleSubmit(handleEditClient)}
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
                                    {isPending ? 'Guardando...' : 'Guardar Cambios'}
                                </Button>
                            </Box>
                        </form>
                    
                    )
        }

            </Box>
        </Modal>
    );
}
