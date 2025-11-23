import CloseIcon from '@mui/icons-material/Close';
import DeleteIcon from '@mui/icons-material/Delete';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import {
    Alert,
    Box,
    Button,
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
    TextField,
    Typography,
    useMediaQuery
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { createRaffleOffer, deleteRaffleOffer, getAllRaffleOffers, toggleRaffleOfferStatus } from "../../../api/raffleOfferApi";
import { RaffleOfferFormType } from "../../../types";
import { formatCurrencyCOP } from '../../../utils';


interface RaffleOffersModalProps {
    raffleId: string;
    rafflePrice: number;
}

function RaffleOffersModal({ raffleId, rafflePrice }: RaffleOffersModalProps) {
    const theme = useTheme();
    const isSmallDevice = useMediaQuery(theme.breakpoints.down('sm'));
    const location = useLocation();
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false);
    const queryClient = useQueryClient();

    const searchParams = new URLSearchParams(location.search);
    const viewOffersRaffle = searchParams.get('viewOffersRaffle');

    // Formulario de creación
    const [form, setForm] = useState<RaffleOfferFormType>({ minQuantity: 1, discountedPrice: 0 });

    // Query para obtener ofertas
    const {
        data: raffleOffers,
        isLoading,
        isError,
        error
    } = useQuery({
        queryKey: ['raffleOffers', raffleId],
        queryFn: () => getAllRaffleOffers(raffleId),
        enabled: !!raffleId && isOpen,
        retry: 2
    });

    // Mutación para crear oferta
    const { mutate: createOffer, isPending: isCreating } = useMutation({
        mutationFn: createRaffleOffer,
        onSuccess: () => {
            toast.success('Oferta creada correctamente');
            queryClient.invalidateQueries({ queryKey: ['raffleOffers', raffleId] });
            setForm({ minQuantity: 1, discountedPrice: 0 });
        },
        onError: (error: Error) => {
            toast.error(error.message || 'Error al crear la oferta');
        }
    });

    // Mutación para activar/desactivar oferta
    const { mutate: toggleStatus, isPending: isToggling } = useMutation({
        mutationFn: toggleRaffleOfferStatus,
        onSuccess: () => {
            toast.success('Estado actualizado correctamente');
            queryClient.invalidateQueries({ queryKey: ['raffleOffers', raffleId] });
        },
        onError: (error: Error) => {
            toast.error(error.message || 'Error al cambiar el estado');
        }
    });

    // Mutación para eliminar oferta
    const { mutate: deleteOffer, isPending: isDeleting } = useMutation({
        mutationFn: deleteRaffleOffer,
        onSuccess: () => {
            toast.success('Oferta eliminada correctamente');
            queryClient.invalidateQueries({ queryKey: ['raffleOffers', raffleId] });
        },
        onError: (error: Error) => {
            toast.error(error.message || 'Error al eliminar la oferta');
        }
    });

    // Handlers para acciones de la tabla
    const handleToggleStatus = (raffleOfferId: number) => {
        toggleStatus({ raffleId, raffleOfferId });
    };

    const handleDeleteOffer = (raffleOfferId: number) => {
        deleteOffer({ raffleId, raffleOfferId });
    };

    useEffect(() => {
        setIsOpen(viewOffersRaffle === 'true');
    }, [viewOffersRaffle]);

    const handleClose = () => {
        navigate(location.pathname);
        setIsOpen(false);
    };

    const handleCreateOffer = (e: React.FormEvent) => {
        e.preventDefault();
        createOffer({ raffleId, formData: form });
    };

    const renderSkeletonTable = () => (
        <TableContainer component={Paper} sx={{ mt: 2 }}>
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell>Cantidad mínima</TableCell>
                        <TableCell>Precio con descuento</TableCell>
                        <TableCell align="center">Estado</TableCell>
                        <TableCell align="center">Acciones</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {Array.from({ length: 3 }).map((_, index) => (
                        <TableRow key={index}>
                            <TableCell><Skeleton variant="text" width="80%" /></TableCell>
                            <TableCell><Skeleton variant="text" width="70%" /></TableCell>
                            <TableCell align="center"><Skeleton variant="rectangular" width={60} height={24} /></TableCell>
                            <TableCell align="center"><Skeleton variant="rectangular" width={60} height={24} /></TableCell>
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
            PaperProps={{ sx: { borderRadius: isSmallDevice ? 0 : 2, m: isSmallDevice ? 0 : 2 } }}
        >
            <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <LocalOfferIcon sx={{ color: theme.palette.primary.main }} />
                    <Typography variant="h6" component="span" sx={{ color: theme.palette.primary.main }}>
                        Ofertas por cantidad
                    </Typography>
                </Box>
                <IconButton onClick={handleClose} size="small">
                    <CloseIcon />
                </IconButton>
            </DialogTitle>
            <Divider />
            <DialogContent sx={{ p: { xs: 1, sm: 2 } }}>
                {/* Formulario para crear oferta */}
                <Box
                    component="form"
                    onSubmit={handleCreateOffer}
                    sx={{
                        mb: 3,
                        display: 'flex',
                        flexDirection: { xs: 'column', sm: 'row' },
                        gap: { xs: 2, sm: 3 },
                        flexWrap: 'wrap',
                        alignItems: { xs: 'stretch', sm: 'center' },
                        justifyContent: { xs: 'flex-start', sm: 'center' },
                        width: '100%',
                        maxWidth: 600,
                        mx: 'auto',
                    }}
                >
                    <Typography variant="body2" color="text.secondary" sx={{ mb: { xs: 1, sm: 0 }, minWidth: { xs: '100%', sm: 180 } }}>
                        Valor original por boleta: <b>{formatCurrencyCOP(rafflePrice)}</b>
                    </Typography>
                    <TextField
                        label="Cantidad mínima"
                        type="number"
                        size="small"
                        required
                        value={form.minQuantity}
                        onChange={e => setForm(f => ({ ...f, minQuantity: Number(e.target.value) }))}
                        sx={{ minWidth: { xs: '100%', sm: 120 }, flex: 1 }}
                        inputProps={{ min: 1 }}
                    />
                    <TextField
                        label="Precio con descuento"
                        type="number"
                        size="small"
                        required
                        value={form.discountedPrice}
                        onChange={e => setForm(f => ({ ...f, discountedPrice: Number(e.target.value) }))}
                        sx={{ minWidth: { xs: '100%', sm: 120 }, flex: 1 }}
                        inputProps={{ min: 0 }}
                    />
                    <Button
                        type="submit"
                        variant="contained"
                        color="primary"
                        disabled={isCreating}
                        sx={{ minWidth: { xs: '100%', sm: 120 }, flex: 1, mt: { xs: 1, sm: 0 } }}
                    >
                        Crear oferta
                    </Button>
                </Box>
                <Divider sx={{ my: 2 }} />
                {isLoading && renderSkeletonTable()}
                {isError && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        Error al cargar las ofertas: {error?.message || 'Error desconocido'}
                    </Alert>
                )}
                {!isLoading && !isError && raffleOffers && (
                    <TableContainer component={Paper} sx={{ mt: 2 }}>
                        <Table size={isSmallDevice ? "small" : "medium"}>
                            <TableHead>
                                <TableRow sx={{ bgcolor: 'grey.50' }}>
                                    <TableCell>Cantidad mínima</TableCell>
                                    <TableCell>Precio con descuento</TableCell>
                                    <TableCell align="center">Estado</TableCell>
                                    <TableCell align="center">Acciones</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {raffleOffers.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={4} align="center">
                                            <Typography variant="body2" color="text.secondary">
                                                No hay ofertas registradas para esta rifa.
                                            </Typography>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    raffleOffers.map((offer) => (
                                        <TableRow key={offer.id}>
                                            <TableCell>{offer.minQuantity}</TableCell>
                                            <TableCell>{formatCurrencyCOP(+offer.discountedPrice)}</TableCell>
                                            <TableCell align="center">
                                                <Button
                                                    size="small"
                                                    variant={offer.isActive ? "contained" : "outlined"}
                                                    color={offer.isActive ? "success" : "warning"}
                                                    
                                                    onClick={() => handleToggleStatus(offer.id)}
                                                    disabled={isToggling}
                                                >
                                                    {offer.isActive ? "Activo" : "Inactivo"}
                                                </Button>
                                            </TableCell>
                                            <TableCell align="center">
                                                <IconButton
                                                    color="error"
                                                    onClick={() => handleDeleteOffer(offer.id)}
                                                    disabled={isDeleting}
                                                >
                                                    <DeleteIcon />
                                                </IconButton>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                )}
            </DialogContent>
        </Dialog>
    );
}

export default RaffleOffersModal;
