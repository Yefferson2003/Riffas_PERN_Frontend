import CloseIcon from '@mui/icons-material/Close';
import PaymentIcon from '@mui/icons-material/Payment';
import {
    Alert,
    Box,
    Chip,
    Dialog,
    DialogContent,
    DialogTitle,
    Divider,
    IconButton,
    Paper,
    Skeleton,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography,
    useMediaQuery,
    useTheme
} from '@mui/material';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { getRafflePayMethods, toggleRafflePayMethodStatus } from '../../../api/payMethodeApi';
import { getRaffleById } from '../../../api/raffleApi';
import { capitalize } from '../../../utils';
import AssignPayMethodForm from './AssignPayMethodForm';

type RafflePayMethodsModalProps = {
    raffleId: string;
};

// // Mapeo de tipos a iconos
// const getPaymentTypeIcon = (type: string | null) => {
//     switch (type) {
//         case 'bank_transfer':
//             return <AccountBalanceIcon />;
//         case 'digital_wallet':
//             return <AccountBalanceWalletIcon />;
//         case 'cash':
//             return <MonetizationOnIcon />;
//         case 'card':
//             return <CreditCardIcon />;
//         case 'crypto':
//             return <CurrencyBitcoinIcon />;
//         default:
//             return <PaymentIcon />;
//     }
// };

// // Mapeo de tipos a nombres legibles
// const getPaymentTypeName = (type: string | null) => {
//     switch (type) {
//         case 'bank_transfer':
//             return 'Transferencia bancaria';
//         case 'digital_wallet':
//             return 'Billetera digital';
//         case 'cash':
//             return 'Efectivo';
//         case 'card':
//             return 'Tarjeta';
//         case 'crypto':
//             return 'Criptomoneda';
//         default:
//             return 'No especificado';
//     }
// };

function RafflePayMethodsModal({ raffleId }: RafflePayMethodsModalProps) {
    const theme = useTheme();
    const isSmallDevice = useMediaQuery(theme.breakpoints.down('sm'));
    const location = useLocation();
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false);
    const queryClient = useQueryClient();

    const searchParams = new URLSearchParams(location.search);
    const viewPayMethodesRaffle = searchParams.get('viewPayMethodesRaffle');

    // Obtener datos de la rifa para el color
    const { data: raffle } = useQuery({
        queryKey: ['raffles', raffleId],
        queryFn: () => getRaffleById(raffleId),
        enabled: isOpen,
    });

    const { 
        data: rafflePayMethods, 
        isLoading, 
        isError, 
        error 
    } = useQuery({
        queryKey: ['rafflePayMethods', raffleId],
        queryFn: () => getRafflePayMethods(raffleId),
        enabled: !!raffleId && isOpen,
        retry: 2
    });

    const { mutate: toggleStatus, isPending: isTogglingStatus } = useMutation({
        mutationFn: toggleRafflePayMethodStatus,
        onSuccess: (data) => {
            toast.success(data || 'Estado actualizado correctamente');
            queryClient.invalidateQueries({ queryKey: ['rafflePayMethods', raffleId] });
        },
        onError: (error: Error) => {
            toast.error(error.message || 'Error al cambiar el estado');
        }
    });

    useEffect(() => {
        setIsOpen(viewPayMethodesRaffle === 'true');
    }, [viewPayMethodesRaffle]);

    const handleClose = () => {
        navigate(location.pathname);
        setIsOpen(false);
    };

    const handleToggleStatus = (rafflePayMethodId: number) => {
        toggleStatus({rafflePayMethodId});
    };



    const renderSkeletonTable = () => (
        <TableContainer component={Paper} sx={{ mt: 2 }}>
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell>Método de Pago</TableCell>
                        <TableCell>Número de Cuenta</TableCell>
                        <TableCell>Titular</TableCell>
                        <TableCell>Banco</TableCell>
                        <TableCell align="center">Estado</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {Array.from({ length: 3 }).map((_, index) => (
                        <TableRow key={index}>
                            <TableCell><Skeleton variant="text" width="80%" /></TableCell>
                            <TableCell><Skeleton variant="text" width="70%" /></TableCell>
                            <TableCell><Skeleton variant="text" width="90%" /></TableCell>
                            <TableCell><Skeleton variant="text" width="80%" /></TableCell>
                            <TableCell align="center">
                                <Skeleton variant="rectangular" width={60} height={24} />
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );

    return (
        <Dialog
            open={isOpen}
            onClose={handleClose}
            maxWidth="md"
            fullWidth
            fullScreen={isSmallDevice}
            PaperProps={{
                sx: {
                    borderRadius: isSmallDevice ? 0 : 2,
                    m: isSmallDevice ? 0 : 2
                }
            }}
        >
            <DialogTitle
                sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    pb: 1
                }}
            >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <PaymentIcon sx={{ color: raffle?.color || '#1976d2' }} />
                    <Typography 
                        variant="h6" 
                        component="span"
                        sx={{ color: raffle?.color || '#1976d2' }}
                    >
                        Métodos de Pago
                    </Typography>
                </Box>
                <IconButton onClick={handleClose} size="small">
                    <CloseIcon />
                </IconButton>
            </DialogTitle>

            <Divider />

            <DialogContent sx={{ p: { xs: 1, sm: 2 } }}>
                {isLoading && renderSkeletonTable()}

                {isError && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        Error al cargar los métodos de pago: {error?.message || 'Error desconocido'}
                    </Alert>
                )}

                {!isLoading && !isError && rafflePayMethods && (
                    <>
                        {/* Formulario para asignar nuevos métodos de pago */}
                        <AssignPayMethodForm 
                            raffleId={raffleId}
                            onSuccess={() => {
                                // Refrescar la lista después de asignar
                                // El componente ya maneja la invalidación de queries
                            }}
                        />

                        <Divider sx={{ my: 3 }} />

                        {rafflePayMethods.length === 0 ? (
                            <Paper
                                sx={{
                                    p: 4,
                                    textAlign: 'center',
                                    bgcolor: 'grey.50'
                                }}
                            >
                                <PaymentIcon sx={{ fontSize: 48, color: 'grey.400', mb: 2 }} />
                                <Typography variant="h6" color="text.secondary" gutterBottom>
                                    No hay métodos de pago configurados
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Esta rifa aún no tiene métodos de pago asignados.
                                </Typography>
                            </Paper>
                        ) : (
                            <>
                                <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                                    Métodos de pago disponibles para esta rifa ({rafflePayMethods.length})
                                </Typography>

                                <TableContainer component={Paper} sx={{ mt: 2 }}>
                                    <Table size={isSmallDevice ? "small" : "medium"}>
                                        <TableHead>
                                            <TableRow sx={{ bgcolor: 'grey.50' }}>
                                                <TableCell>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                        <PaymentIcon fontSize="small" />
                                                        <Typography variant="subtitle2" fontWeight="bold">
                                                            Método de Pago
                                                        </Typography>
                                                    </Box>
                                                </TableCell>
                                                {!isSmallDevice && (
                                                    <>
                                                        <TableCell>
                                                            <Typography variant="subtitle2" fontWeight="bold">
                                                                Número de Cuenta
                                                            </Typography>
                                                        </TableCell>
                                                        <TableCell>
                                                            <Typography variant="subtitle2" fontWeight="bold">
                                                                Titular
                                                            </Typography>
                                                        </TableCell>
                                                        <TableCell>
                                                            <Typography variant="subtitle2" fontWeight="bold">
                                                                Banco
                                                            </Typography>
                                                        </TableCell>
                                                    </>
                                                )}
                                                <TableCell align="center">
                                                    <Typography variant="subtitle2" fontWeight="bold">
                                                        Estado
                                                    </Typography>
                                                </TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {rafflePayMethods.map((payMethod) => (
                                                <TableRow 
                                                    key={payMethod.id}
                                                    sx={{ 
                                                        '&:nth-of-type(odd)': { bgcolor: 'action.hover' },
                                                        '&:hover': { bgcolor: 'action.selected' }
                                                    }}
                                                >
                                                    <TableCell>
                                                        <Typography variant="body2" fontWeight="medium">
                                                            {capitalize(payMethod.payMethode.name)}
                                                        </Typography>
                                                        {isSmallDevice && (
                                                            <Box sx={{ mt: 1 }}>
                                                                {payMethod.accountNumber && (
                                                                    <Typography variant="caption" color="text.secondary" display="block">
                                                                        Cuenta: {payMethod.accountNumber}
                                                                    </Typography>
                                                                )}
                                                                {payMethod.accountHolder && (
                                                                    <Typography variant="caption" color="text.secondary" display="block">
                                                                        Titular: {payMethod.accountHolder}
                                                                    </Typography>
                                                                )}
                                                                {payMethod.bankName && (
                                                                    <Typography variant="caption" color="text.secondary" display="block">
                                                                        Banco: {payMethod.bankName}
                                                                    </Typography>
                                                                )}
                                                            </Box>
                                                        )}
                                                    </TableCell>
                                                    {!isSmallDevice && (
                                                        <>
                                                            <TableCell>
                                                                <Typography variant="body2">
                                                                    {payMethod.accountNumber || '-'}
                                                                </Typography>
                                                            </TableCell>
                                                            <TableCell>
                                                                <Typography variant="body2">
                                                                    {payMethod.accountHolder || '-'}
                                                                </Typography>
                                                            </TableCell>
                                                            <TableCell>
                                                                <Typography variant="body2">
                                                                    {payMethod.bankName || '-'}
                                                                </Typography>
                                                            </TableCell>
                                                        </>
                                                    )}
                                                    <TableCell align="center">
                                                        <Chip
                                                            label={payMethod.isActive ? 'Activo' : 'Inactivo'}
                                                            color={payMethod.isActive ? 'success' : 'default'}
                                                            size="small"
                                                            variant={payMethod.isActive ? 'filled' : 'outlined'}
                                                            clickable
                                                            disabled={isTogglingStatus}
                                                            onClick={() => handleToggleStatus(payMethod.id)}
                                                            sx={{
                                                                cursor: 'pointer',
                                                                transition: 'all 0.2s ease',
                                                                ...(payMethod.isActive && {
                                                                    backgroundColor: raffle?.color || '#4caf50',
                                                                    '&:hover': {
                                                                        backgroundColor: raffle?.color || '#4caf50',
                                                                        opacity: 0.8,
                                                                        transform: 'scale(1.05)',
                                                                    },
                                                                }),
                                                                ...(!payMethod.isActive && {
                                                                    '&:hover': {
                                                                        backgroundColor: 'grey.400',
                                                                        transform: 'scale(1.05)',
                                                                    },
                                                                }),
                                                                '&:disabled': {
                                                                    opacity: 0.6,
                                                                    cursor: 'not-allowed'
                                                                }
                                                            }}
                                                            title={isTogglingStatus ? 
                                                                'Actualizando estado...' : 
                                                                `Clic para ${payMethod.isActive ? 'desactivar' : 'activar'}`
                                                            }
                                                        />
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            </>
                        )}
                    </>
                )}
            </DialogContent>
        </Dialog>
    );
}

export default RafflePayMethodsModal;