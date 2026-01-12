import { Box, CircularProgress, Modal, Paper, Typography, Divider, Chip, Stack, Grid, Button } from '@mui/material';
// Función para mostrar el chip de estado igual que en ClientsSharedLinkTable
function renderStatusChip(status: string) {
    if (status === "sold") {
        return (
            <Chip
                label="Vendido"
                color="success"
                size="small"
                sx={{
                    fontWeight: 700,
                    px: 1.5,
                    borderRadius: 2,
                    minWidth: 90,
                    bgcolor: "#e8f5e9",
                    color: "#388e3c",
                }}
            />
        );
    }
    if (status === "apartado") {
        return (
            <Chip
                label="Apartado"
                color="warning"
                size="small"
                sx={{
                    fontWeight: 700,
                    px: 1.5,
                    borderRadius: 2,
                    minWidth: 90,
                    bgcolor: "#fffde7",
                    color: "#fbc02d",
                }}
            />
        );
    }
    if (status === "pending") {
        return (
            <Chip
                label="Pendiente"
                color="warning"
                size="small"
                sx={{
                    fontWeight: 700,
                    px: 1.5,
                    borderRadius: 2,
                    minWidth: 90,
                    bgcolor: "#fff3e0",
                    color: "#ff9800",
                }}
            />
        );
    }
    return (
        <Chip
            label={status.charAt(0).toUpperCase() + status.slice(1).toLowerCase()}
            size="small"
            sx={{ fontWeight: 700, px: 1.5, borderRadius: 2, minWidth: 90 }}
        />
    );
}
import { useMutation, useQuery } from '@tanstack/react-query';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { acceptRaffleNumberShared, getRaffleNumberById, rejectRaffleNumberShared } from '../../api/raffleNumbersApi';
import { toast } from 'react-toastify';
import ButtonCloseModal from '../ButtonCloseModal';
// import RaflleNumberPaymentsHistory from '../indexView/RaflleNumberPaymentsHistory';

const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: { xs: '95vw', sm: 400, md: 500 },
    maxWidth: '95vw',
    bgcolor: '#ffffff',
    border: 'none',
    borderRadius: 3,
    boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.25)',
    p: { xs: 2, sm: 3, md: 4 },
    maxHeight: '95vh',
    overflowY: 'auto',
};

type ViewPaymentsModalProps = {
    onRefetch: () => void
};

// El modal ahora obtiene los IDs desde la query string
const ViewPaymentsModal = ({ onRefetch }: ViewPaymentsModalProps) => {
    const navigate = useNavigate();
    const location = useLocation();
    // Leer el parámetro ?viewPayments=raffleId__raffleNumberId
    const queryParams = new URLSearchParams(location.search);
    const viewPayments = queryParams.get('viewPayments');
    let raffleId = 0;
    let raffleNumberId = 0;
    if (viewPayments) {
        const [raffleIdStr, raffleNumberIdStr] = viewPayments.split('__');
        raffleId = Number(raffleIdStr);
        raffleNumberId = Number(raffleNumberIdStr);
    }

    // Query para obtener los pagos del número de rifa
    const { data, isLoading, isError, refetch } = useQuery({
        queryKey: ['raffleNumberPayments', raffleId, raffleNumberId],
        queryFn: () => getRaffleNumberById({ raffleId, raffleNumberId }),
        enabled: !!raffleId && !!raffleNumberId,
    });

    const {mutate : acceptSharedNumberMutate, isPending: isAcceptingSharedNumberPending} = useMutation({
        mutationFn: acceptRaffleNumberShared,
        onError(error) {
            toast.error(`Error al aceptar el número compartido: ${error}`);
        },
        onSuccess(data) {
            toast.success(data);
            onRefetch();
            refetch();
        },
    })

    const {mutate : rejectSharedNumberMutate, isPending: isRejectingSharedNumberPending} = useMutation({
        mutationFn: rejectRaffleNumberShared,
        onError(error) {
            toast.error(`Error al rechazar el número compartido: ${error}`);
        },
        onSuccess(data) {
            toast.success(data);
            onRefetch();
            refetch();
        },
    })

    const handleOnAcceptSharedNumber = () => {
        if (!raffleId || !raffleNumberId) return;
        acceptSharedNumberMutate({ raffleId, raffleNumberId });
    }
    const handleOnRejectSharedNumber = () => {
        if (!raffleId || !raffleNumberId) return;
        rejectSharedNumberMutate({ raffleId, raffleNumberId });
    }

    const handleClose = () => {
        navigate(location.pathname, { replace: true });
    };

    if (!raffleId || !raffleNumberId) {
        return null; // No renderizar si no hay IDs válidos
    }

    if (isError) return <Navigate to="/404"/>;

    return (
        <Modal open={!!raffleId && !!raffleNumberId} onClose={handleClose} aria-labelledby="modal-payments-title">
            <Box sx={style}>
                <ButtonCloseModal/>
                <Typography id="modal-payments-title" variant="h6" sx={{ mb: 2, fontWeight: 700 }}>
                    Detalles del Número
                </Typography>
                {isLoading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 120 }}>
                        <CircularProgress />
                    </Box>
                ) : isError ? (
                    <Typography color="error">Error al cargar los pagos.</Typography>
                ) : data ? (
                    <>
                        {/* Datos del número de rifa */}
                        <Paper sx={{ p: 2, mb: 3, bgcolor: '#f8fafc', borderRadius: 2 }} elevation={0}>
                            <Grid container spacing={2}>
                                <Grid item xs={12} sm={6}>
                                    <Typography variant="subtitle2" color="text.secondary">Número</Typography>
                                    <Typography variant="h5" sx={{ fontWeight: 700 }}>{data.number}</Typography>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <Typography variant="subtitle2" color="text.secondary">Estado</Typography>
                                    {renderStatusChip(data.status)}
                                </Grid>
                                <Grid item xs={12} sm={12}>
                                    <Typography variant="subtitle2" color="text.secondary">Fecha de reserva</Typography>
                                    <Typography>{data.reservedDate ? new Date(data.reservedDate).toLocaleString() : '—'}</Typography>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <Typography variant="subtitle2" color="text.secondary">Abonado</Typography>
                                    <Typography color="success.main" sx={{ fontWeight: 700 }}>{data.paymentAmount}</Typography>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <Typography variant="subtitle2" color="text.secondary">Deuda</Typography>
                                    <Typography color="error.main" sx={{ fontWeight: 700 }}>{data.paymentDue}</Typography>
                                </Grid>
                            </Grid>
                        </Paper>
                        <Divider sx={{ mb: 2 }}>Pagos válidos</Divider>
                        {data.payments && data.payments.filter((p) => p.isValid).length > 0 ? (
                            <Stack spacing={2}>
                                {data.payments.filter((p) => p.isValid).map((p, idx: number) => (
                                    <Paper key={p.id || idx} sx={{ p: 2, bgcolor: '#f1f5f9', borderRadius: 2 }} elevation={0}>
                                        <Grid container spacing={2}>
                                            <Grid item xs={12} sm={6}>
                                                <Typography variant="subtitle2" color="text.secondary">Monto</Typography>
                                                <Typography sx={{ fontWeight: 700 }}>{p.amount}</Typography>
                                            </Grid>
                                            <Grid item xs={12} sm={6}>
                                                <Typography variant="subtitle2" color="text.secondary">Fecha de pago</Typography>
                                                <Typography>{p.paidAt ? new Date(p.paidAt).toLocaleString() : '—'}</Typography>
                                            </Grid>
                                            {p.reference && (
                                                <Grid item xs={12} sm={6}>
                                                    <Typography variant="subtitle2" color="text.secondary">Referencia</Typography>
                                                    <Typography>{p.reference}</Typography>
                                                </Grid>
                                            )}
                                            {p.rafflePayMethode && (
                                                <Grid item xs={12} sm={12}>
                                                    <Divider sx={{ my: 1 }}>Método de pago</Divider>
                                                    <Stack spacing={0.5}>
                                                        {p.rafflePayMethode.accountHolder && (
                                                            <Typography variant="body2"><b>Titular:</b> {p.rafflePayMethode.accountHolder}</Typography>
                                                        )}
                                                        {p.rafflePayMethode.accountNumber && (
                                                            <Typography variant="body2"><b>N° de cuenta:</b> {p.rafflePayMethode.accountNumber}</Typography>
                                                        )}
                                                        {p.rafflePayMethode.bankName && (
                                                            <Typography variant="body2"><b>Banco:</b> {p.rafflePayMethode.bankName}</Typography>
                                                        )}
                                                        {p.rafflePayMethode.payMethode && (
                                                            <Typography variant="body2"><b>Método:</b> {p.rafflePayMethode.payMethode.name}</Typography>
                                                        )}
                                                    </Stack>
                                                </Grid>
                                            )}
                                        </Grid>
                                    </Paper>
                                ))}
                            </Stack>
                        ) : (
                            <Paper sx={{ p: 2, textAlign: 'center', bgcolor: '#f8fafc' }}>
                                <Typography color="text.secondary">No hay pagos válidos registrados para este número.</Typography>
                            </Paper>
                        )}
                    </>
                ) : (
                    <Paper sx={{ p: 2, textAlign: 'center', bgcolor: '#f8fafc' }}>
                        <Typography color="text.secondary">No hay pagos registrados para este número.</Typography>
                    </Paper>
                )}
                {/* Botones de acción para estado 'apartado' */}
                {data && (
                    <Box sx={{ mt: 3, width: '100%', display: 'flex', gap: 2, justifyContent: 'space-between' }}>
                        <Button
                            variant="contained"
                            color="error"
                            fullWidth
                            sx={{ fontWeight: 700, fontSize: 16, py: 1.5, mr: 1 }}
                            disabled={data.status !== 'apartado' || isRejectingSharedNumberPending || isAcceptingSharedNumberPending
                            }
                            onClick={handleOnRejectSharedNumber}
                        >
                            Rechazar
                        </Button>
                        <Button
                            variant="contained"
                            color="success"
                            fullWidth
                            sx={{ fontWeight: 700, fontSize: 16, py: 1.5, ml: 1 }}
                            disabled={data.status !== 'apartado' || isAcceptingSharedNumberPending || isRejectingSharedNumberPending}
                            onClick={handleOnAcceptSharedNumber}
                        >
                            Aceptar
                        </Button>
                    </Box>
                )}
            </Box>
        </Modal>
    );
};

export default ViewPaymentsModal;
