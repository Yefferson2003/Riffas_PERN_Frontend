import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import {
    Box,
    Chip,
    Collapse,
    IconButton,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Tooltip,
    Typography,
    useMediaQuery,
} from "@mui/material";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ClientSharedLinkType } from "../../types";
import {
    capitalize,
    formatCurrencyCOP,
    formatDateTimeLarge,
    formatWithLeadingZeros,
} from "../../utils";
import ViewPaymentsModal from "./ViewPaymentsModal";
import { useMutation } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { acceptRaffleNumberShared, rejectRaffleNumberShared } from "../../api/raffleNumbersApi";

// interface RaffleNumberShared {
//     id: number;
//     number: number;
//     reservedDate: string;
//     paymentAmount: string;
//     paymentDue: string;
//     status: string;
//     raffle: {
//         id: number;
//         name: string;
//         playDate: string;
//         price: string;
//         color?: string;
//     };
// }

// interface ClientSharedLink {
//     id: number;
//     firstName: string;
//     lastName: string;
//     phone: string;
//     address: string;
//     raffleNumbers: RaffleNumberShared[];
// }

interface ClientsSharedLinkTableProps {
    clients: ClientSharedLinkType[];
    onRefetch: () => void
}

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

const ClientsSharedLinkTable: React.FC<ClientsSharedLinkTableProps> = ({
    clients,
    onRefetch
}) => {

    const navigate = useNavigate();
    const isMobile = useMediaQuery("(max-width:600px)");
    const handleViewPayments = (raffleId: number, raffleNumberId: number) => {
        navigate(`?viewPayments=${raffleId}__${raffleNumberId}`);
    };
    const [openRows, setOpenRows] = React.useState<Record<number, boolean>>({});
    const [openCards, setOpenCards] = useState<Record<number, boolean>>({});


    const {mutate : acceptSharedNumberMutate, isPending: isAcceptingSharedNumberPending} = useMutation({
            mutationFn: acceptRaffleNumberShared,
            onError(error) {
                toast.error(`Error al aceptar el número compartido: ${error}`);
            },
            onSuccess(data) {
                toast.success(data);
                onRefetch();
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
            },
        })
    
        const handleOnAcceptSharedNumber = (raffleId: number, raffleNumberId: number) => {
            acceptSharedNumberMutate({ raffleId, raffleNumberId });
        }
        const handleOnRejectSharedNumber = (raffleId: number, raffleNumberId: number) => {
            rejectSharedNumberMutate({ raffleId, raffleNumberId });
        }

    if (!clients || clients.length === 0) {
        return (
        <Typography
            variant="h6"
            color="text.secondary"
            sx={{ mt: 4, fontWeight: 600, letterSpacing: 0.5, textAlign: "center" }}
        >
            No se encontraron clientes.
        </Typography>
        );
    }

    if (isMobile) {
        // Vista móvil: tarjetas desplegables
        return (
            <Box
                sx={{
                    width: "100%",
                    mt: 2,
                    display: "flex",
                    flexDirection: "column",
                    gap: 2,
                }}
            >
                {clients.map((client) => {
                    const groupedByRaffle = (client.raffleNumbers || []).reduce(
                        (acc, num) => {
                            const raffleId = num.raffle?.id;
                            if (!acc[raffleId]) acc[raffleId] = [];
                            acc[raffleId].push(num);
                            return acc;
                        },
                        {} as Record<string, typeof client.raffleNumbers>
                    );
                    const isOpen = !!openCards[client.id];
                    return (
                        <Paper key={client.id} sx={{ p: 2, borderRadius: 3, boxShadow: 3 }}>
                            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                                <Box>
                                    <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>
                                        {client.firstName} {client.lastName}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Teléfono: {client.phone || "Sin teléfono"}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Dirección: {client.address || "Sin dirección"}
                                    </Typography>
                                </Box>
                                <IconButton
                                    aria-label="expand card"
                                    size="small"
                                    onClick={() =>
                                        setOpenCards((prev) => ({
                                            ...prev,
                                            [client.id]: !isOpen,
                                        }))
                                    }
                                >
                                    {isOpen ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                                </IconButton>
                            </Box>
                            <Collapse in={isOpen} timeout="auto" unmountOnExit>
                                <Box sx={{ mt: 2 }}>
                                    {Object.keys(groupedByRaffle).length === 0 ? (
                                        <Typography
                                            variant="body2"
                                            color="text.secondary"
                                            sx={{ mt: 1 }}
                                        >
                                            No tiene números asociados.
                                        </Typography>
                                    ) : (
                                        Object.entries(groupedByRaffle).map(([raffleId, numbers]) => {
                                            const raffleColor = numbers[0].raffle?.color || undefined;
                                            return (
                                                <Box
                                                    key={raffleId}
                                                    sx={{
                                                        mt: 2,
                                                        mb: 2,
                                                        p: 2,
                                                        border: `2px solid ${raffleColor || "#1976d2"}`,
                                                        borderRadius: 2,
                                                        background: raffleColor
                                                            ? `${raffleColor}11`
                                                            : undefined,
                                                    }}
                                                >
                                                    <Typography
                                                        sx={{
                                                            fontWeight: 700,
                                                            color: raffleColor || "primary.main",
                                                            mb: 1,
                                                        }}
                                                    >
                                                        Rifa: {capitalize(numbers[0].raffle?.name) || `ID ${raffleId}`}
                                                    </Typography>
                                                    <Typography
                                                        sx={{ fontSize: 14, color: "text.secondary", mb: 1 }}
                                                    >
                                                        Precio: {formatCurrencyCOP(Number(numbers[0].raffle?.price))} |
                                                        Fecha de juego: {formatDateTimeLarge(numbers[0].raffle?.playDate)}
                                                    </Typography>
                                                    {numbers.map((num) => (
                                                        <Paper
                                                            key={num.id}
                                                            sx={{
                                                                mb: 1,
                                                                p: 1.5,
                                                                borderRadius: 2,
                                                                background: "#fafafa",
                                                                boxShadow: 1,
                                                            }}
                                                        >
                                                            <Box
                                                                sx={{
                                                                    display: "flex",
                                                                    flexDirection: "column",
                                                                    gap: 0.5,
                                                                }}
                                                            >
                                                                <Box
                                                                    sx={{
                                                                        display: "flex",
                                                                        gap: 1,
                                                                        alignItems: "center",
                                                                    }}
                                                                >
                                                                    <Chip
                                                                        label={`#${num.number}`}
                                                                        size="small"
                                                                        sx={{
                                                                            fontWeight: 700,
                                                                            bgcolor: "primary.light",
                                                                            color: "primary.main",
                                                                        }}
                                                                    />
                                                                    {renderStatusChip(num.status)}
                                                                    <Tooltip title="Ver pagos">
                                                                        <IconButton
                                                                            color="info"
                                                                            onClick={() => handleViewPayments(num.raffle?.id, num.id)}
                                                                            sx={{ ml: 1 }}
                                                                        >
                                                                            <ReceiptLongIcon />
                                                                        </IconButton>
                                                                    </Tooltip>
                                                                    <Tooltip title="Aceptar pago">
                                                                        <span>
                                                                            <IconButton color="success"
                                                                                onClick={() => {
                                                                                    if (num.raffle?.id !== undefined) {
                                                                                        handleOnAcceptSharedNumber(num.raffle.id, num.id);
                                                                                    } else {
                                                                                        toast.error("ID de rifa no disponible");
                                                                                    }
                                                                                }}
                                                                                disabled={num.status !== 'apartado' || isAcceptingSharedNumberPending}
                                                                            >
                                                                                <CheckCircleIcon />
                                                                            </IconButton>
                                                                        </span>
                                                                    </Tooltip>
                                                                    <Tooltip title="Rechazar pago">
                                                                        <span>
                                                                            <IconButton color="error"
                                                                                onClick={() => {
                                                                                    if (num.raffle?.id !== undefined) {
                                                                                        handleOnRejectSharedNumber(num.raffle.id, num.id);
                                                                                    } else {
                                                                                        toast.error("ID de rifa no disponible");
                                                                                    }
                                                                                }}
                                                                                disabled={num.status !== 'apartado' || isRejectingSharedNumberPending}
                                                                            >
                                                                                <CancelIcon />
                                                                            </IconButton>
                                                                        </span>
                                                                    </Tooltip>
                                                                </Box>
                                                                <Typography
                                                                    variant="body2"
                                                                    sx={{ color: "text.secondary" }}
                                                                >
                                                                    Fecha reserva: {formatDateTimeLarge(num.reservedDate)}
                                                                </Typography>
                                                                <Typography
                                                                    variant="body2"
                                                                    sx={{ color: "success.main", fontWeight: 700 }}
                                                                >
                                                                    Abono: {formatCurrencyCOP(Number(num.paymentAmount))}
                                                                </Typography>
                                                                <Typography
                                                                    variant="body2"
                                                                    sx={{ color: "error.main", fontWeight: 700 }}
                                                                >
                                                                    Deuda: {formatCurrencyCOP(Number(num.paymentDue))}
                                                                </Typography>
                                                                {/* Sección de pago debajo de cada número en móvil */}
                                                                {num.lastValidPayment && (
                                                                    <Box sx={{ mt: 1, p: 1, borderRadius: 2, background: '#f5f5f5', display: 'flex', flexDirection: 'column', gap: 1 }}>
                                                                        <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1, color: 'primary.main' }}>
                                                                            Último pago válido
                                                                        </Typography>
                                                                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                                                                            {num.lastValidPayment.amount && (
                                                                                <Chip label={`Monto: ${formatCurrencyCOP(Number(num.lastValidPayment.amount))}`} color="success" sx={{ fontWeight: 600 }} />
                                                                            )}
                                                                            {num.lastValidPayment.reference && (
                                                                                <Chip label={`Referencia: ${num.lastValidPayment.reference}`} color="info" sx={{ fontWeight: 600 }} />
                                                                            )}
                                                                            {num.lastValidPayment.paidAt && (
                                                                                <Chip label={`Fecha pago: ${formatDateTimeLarge(num.lastValidPayment.paidAt)}`} color="primary" sx={{ fontWeight: 600 }} />
                                                                            )}
                                                                            {num.lastValidPayment.createdAt && (
                                                                                <Chip label={`Creado: ${formatDateTimeLarge(num.lastValidPayment.createdAt)}`} color="default" sx={{ fontWeight: 600 }} />
                                                                            )}
                                                                        </Box>
                                                                        {num.lastValidPayment.rafflePayMethode && (
                                                                            <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center' }}>
                                                                                <Typography variant="body2" sx={{ fontWeight: 600, color: 'secondary.main' }}>
                                                                                    Método de pago:
                                                                                </Typography>
                                                                                <Chip label={capitalize(num.lastValidPayment.rafflePayMethode.payMethode?.name) || 'Sin método'} color="secondary" sx={{ fontWeight: 600 }} />
                                                                                {num.lastValidPayment.rafflePayMethode.accountHolder && (
                                                                                    <Chip label={`Titular: ${num.lastValidPayment.rafflePayMethode.accountHolder}`} sx={{ fontWeight: 600 }} />
                                                                                )}
                                                                                {num.lastValidPayment.rafflePayMethode.accountNumber && (
                                                                                    <Chip label={`Cuenta: ${num.lastValidPayment.rafflePayMethode.accountNumber}`} sx={{ fontWeight: 600 }} />
                                                                                )}
                                                                                {num.lastValidPayment.rafflePayMethode.bankName && (
                                                                                    <Chip label={`Banco: ${num.lastValidPayment.rafflePayMethode.bankName}`} sx={{ fontWeight: 600 }} />
                                                                                )}
                                                                            </Box>
                                                                        )}
                                                                    </Box>
                                                                )}
                                                            </Box>
                                                        </Paper>
                                                    ))}
                                                </Box>
                                            );
                                        })
                                    )}
                                </Box>
                            </Collapse>
                        </Paper>
                    );
                })}
                <ViewPaymentsModal
                    onRefetch={onRefetch}
                />
            </Box>
        );
    }

    // Vista escritorio (tabla)
    return (
        <Box sx={{ width: "100%", overflowX: "auto", mt: 2 }}>
        <TableContainer
            component={Paper}
            sx={{ borderRadius: 3, boxShadow: 3, minWidth: 360 }}
        >
            <Table
            aria-label="collapsible table"
            size="small"
            sx={{ minWidth: 700 }}
            >
            <TableHead>
                <TableRow>
                <TableCell
                    sx={{
                    width: 40,
                    bgcolor: "primary.main",
                    color: "primary.contrastText",
                    fontWeight: 700,
                    fontSize: 16,
                    letterSpacing: 0.5,
                    borderBottom: "2px solid #1976d2",
                    }}
                />
                <TableCell
                    sx={{
                    minWidth: 180,
                    bgcolor: "primary.main",
                    color: "primary.contrastText",
                    fontWeight: 700,
                    fontSize: 16,
                    letterSpacing: 0.5,
                    borderBottom: "2px solid #1976d2",
                    }}
                >
                    Nombre
                </TableCell>
                <TableCell
                    sx={{
                    minWidth: 120,
                    bgcolor: "primary.main",
                    color: "primary.contrastText",
                    fontWeight: 700,
                    fontSize: 16,
                    letterSpacing: 0.5,
                    borderBottom: "2px solid #1976d2",
                    }}
                >
                    Teléfono
                </TableCell>
                <TableCell
                    sx={{
                    minWidth: 140,
                    bgcolor: "primary.main",
                    color: "primary.contrastText",
                    fontWeight: 700,
                    fontSize: 16,
                    letterSpacing: 0.5,
                    borderBottom: "2px solid #1976d2",
                    }}
                >
                    Dirección
                </TableCell>
                </TableRow>
            </TableHead>
            <TableBody>
                {clients.map((client) => {
                const groupedByRaffle = (client.raffleNumbers || []).reduce(
                    (acc, num) => {
                    const raffleId = num.raffle?.id;
                    if (!acc[raffleId]) acc[raffleId] = [];
                    acc[raffleId].push(num);
                    return acc;
                    },
                    {} as Record<string, typeof client.raffleNumbers>
                );
                const isOpen = !!openRows[client.id];
                return (
                    <React.Fragment key={client.id}>
                    <TableRow sx={{ "& > *": { borderBottom: "unset" } }}>
                        <TableCell>
                        <IconButton
                            aria-label="expand row"
                            size="small"
                            onClick={() =>
                            setOpenRows((prev) => ({
                                ...prev,
                                [client.id]: !isOpen,
                            }))
                            }
                        >
                            {isOpen ? (
                            <KeyboardArrowUpIcon />
                            ) : (
                            <KeyboardArrowDownIcon />
                            )}
                        </IconButton>
                        </TableCell>
                        <TableCell component="th" scope="row">
                        {client.firstName} {client.lastName}
                        </TableCell>
                        <TableCell>{client.phone || "Sin teléfono"}</TableCell>
                        <TableCell>{client.address || "Sin dirección"}</TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell
                        style={{ paddingBottom: 0, paddingTop: 0 }}
                        colSpan={4}
                        >
                        <Collapse in={isOpen} timeout="auto" unmountOnExit>
                            <Box sx={{ margin: 2, overflowX: "auto" }}>
                            {Object.keys(groupedByRaffle).length === 0 ? (
                                <Typography variant="body2" color="text.secondary">
                                No tiene números asociados.
                                </Typography>
                            ) : (
                                Object.entries(groupedByRaffle).map(
                                ([raffleId, numbers]) => {
                                    const raffleColor =
                                    numbers[0].raffle?.color || undefined;
                                    return (
                                    <Box
                                        key={raffleId}
                                        sx={{
                                        mb: 2,
                                        p: 2,
                                        border: `2px solid ${
                                            raffleColor || "#1976d2"
                                        }`,
                                        borderRadius: 3,
                                        boxShadow: `0 2px 8px ${
                                            raffleColor || "#1976d2"
                                        }22`,
                                        background: raffleColor
                                            ? `${raffleColor}11`
                                            : undefined,
                                        overflowX: "auto",
                                        }}
                                    >
                                        <Box
                                        sx={{
                                            display: "flex",
                                            flexWrap: "wrap",
                                            gap: 2,
                                            mb: 1,
                                        }}
                                        >
                                        <Typography
                                            component="span"
                                            sx={{
                                            color: "text.secondary",
                                            fontWeight: 500,
                                            fontSize: 15,
                                            }}
                                        >
                                            Rifa:
                                        </Typography>
                                        <Typography
                                            component="span"
                                            sx={{
                                            color: raffleColor || "primary.main",
                                            fontWeight: 700,
                                            fontSize: 16,
                                            }}
                                        >
                                            {capitalize(numbers[0].raffle?.name) ||
                                            `ID ${raffleId}`}
                                        </Typography>
                                        <Typography
                                            component="span"
                                            sx={{
                                            color: "text.secondary",
                                            fontWeight: 500,
                                            fontSize: 15,
                                            }}
                                        >
                                            Precio:
                                        </Typography>
                                        <Typography
                                            component="span"
                                            sx={{
                                            color: raffleColor || "primary.main",
                                            fontWeight: 700,
                                            fontSize: 16,
                                            }}
                                        >
                                            {formatCurrencyCOP(
                                            Number(numbers[0].raffle?.price)
                                            )}
                                        </Typography>
                                        <Typography
                                            component="span"
                                            sx={{
                                            color: "text.secondary",
                                            fontWeight: 500,
                                            fontSize: 15,
                                            }}
                                        >
                                            Fecha de juego:
                                        </Typography>
                                        <Typography
                                            component="span"
                                            sx={{
                                            color: raffleColor || "primary.main",
                                            fontWeight: 700,
                                            fontSize: 16,
                                            }}
                                        >
                                            {formatDateTimeLarge(
                                            numbers[0].raffle?.playDate
                                            )}
                                        </Typography>
                                        </Box>
                                        <Table
                                        size="small"
                                        aria-label="números"
                                        sx={{ minWidth: 420 }}
                                        >
                                        <TableHead>
                                            <TableRow>
                                            <TableCell sx={{ minWidth: 70 }}>
                                                Número
                                            </TableCell>
                                            <TableCell sx={{ minWidth: 120 }}>
                                                Fecha reserva
                                            </TableCell>
                                            <TableCell sx={{ minWidth: 80 }}>
                                                Estado
                                            </TableCell>
                                            <TableCell sx={{ minWidth: 90 }}>
                                                Abono
                                            </TableCell>
                                            <TableCell sx={{ minWidth: 90 }}>
                                                Deuda
                                            </TableCell>
                                            <TableCell sx={{ minWidth: 120 }}>
                                                Opciones
                                            </TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {numbers.map((num) => (
                                                <React.Fragment key={num.id}>
                                                    <TableRow>
                                                        <TableCell>
                                                            #{formatWithLeadingZeros(
                                                                num.number,
                                                                numbers[0].raffle?.totalNumbers || 0
                                                            )}
                                                        </TableCell>
                                                        <TableCell>
                                                            {formatDateTimeLarge(num.reservedDate)}
                                                        </TableCell>
                                                        <TableCell>
                                                            {renderStatusChip(num.status)}
                                                        </TableCell>
                                                        <TableCell>
                                                            <Typography
                                                                component="span"
                                                                sx={{ color: "success.main", fontWeight: 700 }}
                                                            >
                                                                {formatCurrencyCOP(Number(num.paymentAmount))}
                                                            </Typography>
                                                        </TableCell>
                                                        <TableCell>
                                                            <Typography
                                                                component="span"
                                                                sx={{ color: "error.main", fontWeight: 700 }}
                                                            >
                                                                {formatCurrencyCOP(Number(num.paymentDue))}
                                                            </Typography>
                                                        </TableCell>
                                                        <TableCell>
                                                            <Box sx={{ display: "inline-flex", gap: 1 }}>
                                                                <Tooltip title="Ver pagos">
                                                                    <IconButton
                                                                        color="info"
                                                                        onClick={() => handleViewPayments(num.raffle?.id, num.id)}
                                                                    >
                                                                        <ReceiptLongIcon />
                                                                    </IconButton>
                                                                </Tooltip>
                                                                <Tooltip title="Aceptar pago">
                                                                    <span>
                                                                        <IconButton color="success"
                                                                            onClick={() => {
                                                                                if (num.raffle?.id !== undefined) {
                                                                                    handleOnAcceptSharedNumber(num.raffle.id, num.id);
                                                                                } else {
                                                                                    toast.error("ID de rifa no disponible");
                                                                                }
                                                                            }}
                                                                            disabled={num.status !== 'apartado' || isAcceptingSharedNumberPending}
                                                                        >
                                                                            <CheckCircleIcon />
                                                                        </IconButton>
                                                                    </span>
                                                                </Tooltip>
                                                                <Tooltip title="Rechazar pago">
                                                                    <span>
                                                                        <IconButton color="error"
                                                                            onClick={() => {
                                                                                if (num.raffle?.id !== undefined) {
                                                                                    handleOnRejectSharedNumber(num.raffle.id, num.id);
                                                                                } else {
                                                                                    toast.error("ID de rifa no disponible");
                                                                                }
                                                                            }}
                                                                            disabled={num.status !== 'apartado' || isRejectingSharedNumberPending}
                                                                        >
                                                                            <CancelIcon />
                                                                        </IconButton>
                                                                    </span>
                                                                </Tooltip>
                                                            </Box>
                                                        </TableCell>
                                                    </TableRow>
                                                    {/* Sección de pago debajo de cada número */}
                                                    {num.lastValidPayment && (
                                                        <TableRow>
                                                            <TableCell colSpan={6} sx={{ p: 0, background: '#f5f5f5' }}>
                                                                <Box sx={{ p: 2, borderRadius: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
                                                                    <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1, color: 'primary.main' }}>
                                                                        Último pago válido
                                                                    </Typography>
                                                                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                                                                        {num.lastValidPayment.amount && (
                                                                            <Chip label={`Monto: ${formatCurrencyCOP(Number(num.lastValidPayment.amount))}`} color="success" sx={{ fontWeight: 600 }} />
                                                                        )}
                                                                        {num.lastValidPayment.reference && (
                                                                            <Chip label={`Referencia: ${num.lastValidPayment.reference}`} color="info" sx={{ fontWeight: 600 }} />
                                                                        )}
                                                                        {num.lastValidPayment.paidAt && (
                                                                            <Chip label={`Fecha pago: ${formatDateTimeLarge(num.lastValidPayment.paidAt)}`} color="primary" sx={{ fontWeight: 600 }} />
                                                                        )}
                                                                        {num.lastValidPayment.createdAt && (
                                                                            <Chip label={`Creado: ${formatDateTimeLarge(num.lastValidPayment.createdAt)}`} color="default" sx={{ fontWeight: 600 }} />
                                                                        )}
                                                                    </Box>
                                                                    {num.lastValidPayment.rafflePayMethode && (
                                                                        <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center' }}>
                                                                            <Typography variant="body2" sx={{ fontWeight: 600, color: 'secondary.main' }}>
                                                                                Método de pago:
                                                                            </Typography>
                                                                            <Chip label={capitalize(num.lastValidPayment.rafflePayMethode.payMethode?.name) || 'Sin método'} color="secondary" sx={{ fontWeight: 600 }} />
                                                                            {num.lastValidPayment.rafflePayMethode.accountHolder && (
                                                                                <Chip label={`Titular: ${num.lastValidPayment.rafflePayMethode.accountHolder}`} sx={{ fontWeight: 600 }} />
                                                                            )}
                                                                            {num.lastValidPayment.rafflePayMethode.accountNumber && (
                                                                                <Chip label={`Cuenta: ${num.lastValidPayment.rafflePayMethode.accountNumber}`} sx={{ fontWeight: 600 }} />
                                                                            )}
                                                                            {num.lastValidPayment.rafflePayMethode.bankName && (
                                                                                <Chip label={`Banco: ${num.lastValidPayment.rafflePayMethode.bankName}`} sx={{ fontWeight: 600 }} />
                                                                            )}
                                                                        </Box>
                                                                    )}
                                                                </Box>
                                                            </TableCell>
                                                        </TableRow>
                                                    )}
                                                </React.Fragment>
                                            ))}
                                        </TableBody>
                                        </Table>
                                    </Box>
                                    );
                                }
                                )
                            )}
                            </Box>
                        </Collapse>
                        </TableCell>
                    </TableRow>
                    </React.Fragment>
                );
                })}
            </TableBody>
            </Table>
        </TableContainer>
        <ViewPaymentsModal
            onRefetch={onRefetch}
        />
        </Box>
    );
};

export default ClientsSharedLinkTable;
