
import {
    Add as AddIcon,
    Edit as EditIcon,
    Payment as PaymentIcon
} from '@mui/icons-material';
import {
    Alert,
    Box,
    Button,
    Chip,
    Paper,
    Skeleton,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography
} from '@mui/material';
import { 
    useQuery, 
    useMutation,
    useQueryClient 
} from '@tanstack/react-query';
import { useState } from 'react';
import { getPayMethods, togglePayMethodStatus } from '../../api/payMethodeApi';
import { toast } from 'react-toastify';
import { CreatePayMethodModal, EditPayMethodModal } from '../../components/payMethods';
import { PayMethodeType } from '../../types';

function PayMethodeView() {
    const queryClient = useQueryClient();
    
    // Estados para modales
    const [openCreateModal, setOpenCreateModal] = useState(false);
    const [openEditModal, setOpenEditModal] = useState(false);
    const [editingMethod, setEditingMethod] = useState<PayMethodeType | null>(null);

    // Query para obtener métodos de pago
    const { data: payMethods, isLoading, error } = useQuery({
        queryKey: ['payMethods'],
        queryFn: getPayMethods,
        retry: 2
    });

    // Mutation para cambiar estado
    const toggleStatusMutation = useMutation({
        mutationFn: togglePayMethodStatus,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['payMethods'] });
            toast.success('Estado actualizado correctamente');
        },
        onError: (error: Error) => {
            toast.error(error.message || 'Error al actualizar el estado');
        }
    });

    const handleToggleStatus = (payMethodId: number) => {
        toggleStatusMutation.mutate(payMethodId);
    };

    const handleEdit = (method: PayMethodeType) => {
        setEditingMethod(method);
        setOpenEditModal(true);
    };

    const handleCreate = () => {
        setOpenCreateModal(true);
    };

    const handleCloseCreateModal = () => {
        setOpenCreateModal(false);
    };

    const handleCloseEditModal = () => {
        setOpenEditModal(false);
        setEditingMethod(null);
    };

    if (error) {
        return (
            <Box sx={{ p: 3 }}>
                <Alert severity="error">
                    Error al cargar los métodos de pago: {error.message}
                </Alert>
            </Box>
        );
    }

    return (
        <Box sx={{ p: { xs: 2, sm: 3 }, maxWidth: 1200, mx: 'auto' }}>
            {/* Header */}
            <Box sx={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                mb: 3,
                flexDirection: { xs: 'column', sm: 'row' },
                gap: 2
            }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <PaymentIcon sx={{ 
                        fontSize: { xs: 24, sm: 32 }, 
                        color: 'primary.main',
                        display: { xs: 'none', sm: 'block' }
                    }} />
                    <Typography variant="h4" component="h1" sx={{ 
                        fontWeight: 'bold',
                        color: 'text.primary',
                        fontSize: { xs: '1.5rem', sm: '2.125rem' }
                    }}>
                        Métodos de Pago
                    </Typography>
                </Box>
                
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={handleCreate}
                    sx={{
                        minWidth: { xs: '100%', sm: 'auto' },
                        borderRadius: 2,
                        textTransform: 'none',
                        fontWeight: 600
                    }}
                >
                    Crear Método
                </Button>
            </Box>

            {/* Loading skeleton */}
            {isLoading && (
                <Paper elevation={2} sx={{ borderRadius: 2, overflow: 'hidden' }}>
                    <Box sx={{ p: 2 }}>
                        {Array.from({ length: 5 }).map((_, index) => (
                            <Skeleton
                                key={index}
                                variant="rectangular"
                                height={60}
                                sx={{ mb: 1, borderRadius: 1 }}
                            />
                        ))}
                    </Box>
                </Paper>
            )}

            {/* Responsive Table */}
            {!isLoading && payMethods && (
                <Paper elevation={2} sx={{ borderRadius: 2, overflow: 'hidden' }}>
                    <TableContainer sx={{ 
                        overflowX: { xs: 'auto', sm: 'visible' }
                    }}>
                        <Table size='small' sx={{ minWidth: { xs: 300, sm: 500 } }}>
                            <TableHead sx={{ bgcolor: 'grey.50' }}>
                                <TableRow>
                                    <TableCell sx={{ 
                                        fontWeight: 'bold', 
                                        fontSize: { xs: '0.75rem', sm: '0.875rem' },
                                        py: { xs: 1, sm: 1.5 },
                                        px: { xs: 1, sm: 2 }
                                    }}>
                                        Método
                                    </TableCell>
                                    <TableCell sx={{ 
                                        fontWeight: 'bold', 
                                        fontSize: { xs: '0.75rem', sm: '0.875rem' },
                                        py: { xs: 1, sm: 1.5 },
                                        px: { xs: 1, sm: 2 }
                                    }}>
                                        Estado
                                    </TableCell>
                                    <TableCell 
                                        align="center" 
                                        sx={{ 
                                            fontWeight: 'bold', 
                                            fontSize: { xs: '0.75rem', sm: '0.875rem' },
                                            py: { xs: 1, sm: 1.5 },
                                            px: { xs: 1, sm: 2 }
                                        }}
                                    >
                                        Acciones
                                    </TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {payMethods.map((method) => (
                                    <TableRow 
                                        key={method.id}
                                        hover
                                        sx={{ '&:hover': { bgcolor: 'action.hover' } }}
                                    >
                                        <TableCell sx={{ 
                                            py: { xs: 1, sm: 1.5 },
                                            px: { xs: 1, sm: 2 },
                                            maxWidth: { xs: 120, sm: 200 }
                                        }}>
                                            <Typography 
                                                variant="body2" 
                                                sx={{ 
                                                    fontWeight: 500,
                                                    fontSize: { xs: '0.8rem', sm: '0.875rem' },
                                                    wordBreak: 'break-word',
                                                    hyphens: 'auto',
                                                    lineHeight: 1.3,
                                                    whiteSpace: 'normal',
                                                    textTransform: 'capitalize'
                                                }}
                                            >
                                                {method.name}
                                            </Typography>
                                        </TableCell>

                                        <TableCell sx={{ 
                                            py: { xs: 1, sm: 1.5 },
                                            px: { xs: 1, sm: 2 }
                                        }}>
                                            <Chip
                                                label={method.isActive ? 'Activo' : 'Inactivo'}
                                                color={method.isActive ? 'success' : 'default'}
                                                size="small"
                                                clickable
                                                onClick={() => handleToggleStatus(method.id)}
                                                disabled={toggleStatusMutation.isPending}
                                                title={method.isActive ? 'Clic para desactivar' : 'Clic para activar'}
                                                sx={{ 
                                                    fontWeight: 500,
                                                    fontSize: { xs: '0.65rem', sm: '0.75rem' },
                                                    height: { xs: 20, sm: 24 },
                                                    cursor: 'pointer',
                                                    '& .MuiChip-label': {
                                                        px: { xs: 0.5, sm: 1 }
                                                    },
                                                    '&:hover': {
                                                        bgcolor: method.isActive ? 'success.dark' : 'grey.400',
                                                        color: 'white'
                                                    },
                                                    '&.Mui-disabled': {
                                                        opacity: 0.6,
                                                        cursor: 'not-allowed'
                                                    },
                                                    transition: 'all 0.2s ease-in-out'
                                                }}
                                            />
                                        </TableCell>

                                        <TableCell align="center" sx={{ 
                                            py: { xs: 1, sm: 1.5 },
                                            px: { xs: 0.5, sm: 2 }
                                        }}>
                                            <Button
                                                onClick={() => handleEdit(method)}
                                                variant="outlined"
                                                size="small"
                                                startIcon={<EditIcon />}
                                                sx={{
                                                    fontSize: { xs: '0.7rem', sm: '0.8rem' },
                                                    py: { xs: 0.25, sm: 0.5 },
                                                    px: { xs: 1, sm: 1.5 },
                                                    minWidth: { xs: 'auto', sm: 'auto' },
                                                    borderRadius: 1,
                                                    textTransform: 'none',
                                                    fontWeight: 500,
                                                    '& .MuiButton-startIcon': {
                                                        margin: { xs: '0 2px 0 0', sm: '0 4px 0 -2px' },
                                                        '& > svg': {
                                                            fontSize: { xs: '0.9rem', sm: '1.1rem' }
                                                        }
                                                    }
                                                }}
                                            >
                                                <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>
                                                    Editar
                                                </Box>
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Paper>
            )}

            {/* Empty State */}
            {!isLoading && payMethods && payMethods.length === 0 && (
                <Paper 
                    elevation={1} 
                    sx={{ 
                        p: 4, 
                        textAlign: 'center', 
                        borderRadius: 2,
                        bgcolor: 'grey.50'
                    }}
                >
                    <PaymentIcon sx={{ fontSize: 64, color: 'grey.400', mb: 2 }} />
                    <Typography variant="h6" color="text.secondary" gutterBottom>
                        No hay métodos de pago
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                        Crea tu primer método de pago para comenzar
                    </Typography>
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={handleCreate}
                        sx={{ borderRadius: 2, textTransform: 'none' }}
                    >
                        Crear Método
                    </Button>
                </Paper>
            )}

            {/* Modal para crear método de pago */}
            <CreatePayMethodModal
                open={openCreateModal}
                onClose={handleCloseCreateModal}
            />

            {/* Modal para editar método de pago */}
            <EditPayMethodModal
                open={openEditModal}
                onClose={handleCloseEditModal}
                payMethod={editingMethod}
            />
        </Box>
    );
}

export default PayMethodeView;
