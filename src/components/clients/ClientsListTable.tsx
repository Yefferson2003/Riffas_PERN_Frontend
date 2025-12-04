import * as React from 'react';
import Box from '@mui/material/Box';
import Collapse from '@mui/material/Collapse';
import IconButton from '@mui/material/IconButton';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import EditIcon from '@mui/icons-material/Edit';
import LocalAtmIcon from '@mui/icons-material/LocalAtm';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import { ClientType, ResponseClientType } from '../../types';
import { Chip } from '@mui/material';
import { formatCurrencyCOP, formatDateTimeLarge, formatWithLeadingZeros } from '../../utils';

interface ClientsListTableProps {
    clients: ResponseClientType[];
    onEdit: (client: ClientType) => void;
    onBuyNumbers: (client: ClientType) => void
}

function Row({ client, onEdit, onBuyNumbers }: Pick<ClientsListTableProps, 'onEdit' | 'onBuyNumbers'> & { client: ResponseClientType }) {
    const [open, setOpen] = React.useState(false);

    // Agrupar los números por rifa
    const groupedByRaffle = React.useMemo(() => {
        if (!client.raffleNumbers) return [];
        const groups: Record<string, typeof client.raffleNumbers> = {};
        client.raffleNumbers.forEach(num => {
            const raffleId = num.raffle?.id || num.raffleId;
            if (!groups[raffleId]) groups[raffleId] = [];
            groups[raffleId].push(num);
        });
        return Object.entries(groups);
    }, [client]);

    // Función para capitalizar el estado
    const capitalize = (text: string) => text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();

    // Colores para el chip de estado
    const getChipColor = (status: string) => {
        if (status === 'apartado') return 'warning';
        if (status === 'sold') return 'success';
        if (status === 'pending') return 'info';
        return 'default';
    };

    return (
        <React.Fragment>
            <TableRow sx={{ '& > *': { borderBottom: 'unset' } }}>
                <TableCell>
                    <IconButton
                        aria-label="expand row"
                        size="small"
                        onClick={() => setOpen(!open)}
                    >
                        {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                    </IconButton>
                </TableCell>
                <TableCell component="th" scope="row">
                    {client.firstName} {client.lastName}
                </TableCell>
                <TableCell>{client.phone || 'Sin teléfono'}</TableCell>
                <TableCell>{client.address || 'Sin dirección'}</TableCell>
                <TableCell align="center" sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                    <Tooltip title="Editar cliente" arrow>
                        <IconButton color="primary" onClick={() => onEdit(client)} size="small">
                            <EditIcon />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Vender números" arrow>
                        <IconButton color="success" onClick={() => onBuyNumbers(client)} size="small">
                            <LocalAtmIcon />
                        </IconButton>
                    </Tooltip>
                </TableCell>
            </TableRow>
            <TableRow>
                <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={5}>
                    <Collapse in={open} timeout="auto" unmountOnExit>
                        <Box sx={{ margin: 2 }}>
                            <Typography variant="h6" gutterBottom component="div">
                                Números
                            </Typography>
                            <Typography variant="body2" color="info.main" sx={{ mb: 2, fontWeight: 500 }}>
                                Se mostrarán los últimos 50 números asociados a este cliente.
                            </Typography>
                            {groupedByRaffle.length === 0 ? (
                                <Typography variant="body2" color="text.secondary">No tiene números asociados.</Typography>
                            ) : (
                                groupedByRaffle.map(([raffleId, numbers]) => {
                                    const raffleColor = numbers[0].raffle?.color || undefined;
                                    return (
                                        <Box
                                            key={raffleId}
                                            sx={{
                                                mb: 2,
                                                p: 2,
                                                border: `2px solid ${raffleColor || '#1976d2'}`,
                                                borderRadius: 3,
                                                boxShadow: `0 2px 8px ${raffleColor || '#1976d2'}22`,
                                                background: raffleColor ? `${raffleColor}11` : undefined,
                                            }}
                                        >
                                            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1, color: raffleColor || 'primary.main' }}>
                                                Rifa: {numbers[0].raffle?.name || `ID ${raffleId}`}
                                                
                                            </Typography>
                                            <Table size="small" aria-label="números">
                                                <TableHead>
                                                    <TableRow>
                                                        <TableCell>Número</TableCell>
                                                        <TableCell>Fecha apartado</TableCell>
                                                        <TableCell>Estado</TableCell>
                                                        <TableCell>Abonos</TableCell>
                                                        <TableCell>Deuda</TableCell>
                                                    </TableRow>
                                                </TableHead>
                                                <TableBody>
                                                    {numbers.map(num => (
                                                        <TableRow key={num.id}>
                                                            <TableCell>
                                                                {formatWithLeadingZeros(num.number, num.raffle?.totalNumbers || 0)}
                                                            </TableCell>
                                                            <TableCell>{num.reservedDate ? formatDateTimeLarge(num.reservedDate) : '-'}</TableCell>
                                                            <TableCell>
                                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                                    <Box>
                                                                        <Chip
                                                                            label={capitalize(num.status)}
                                                                            color={getChipColor(num.status)}
                                                                            size="small"
                                                                            sx={{
                                                                                fontWeight: 700,
                                                                                px: 1.5,
                                                                                borderRadius: 2,
                                                                                minWidth: 90,
                                                                                justifyContent: 'center',
                                                                                bgcolor: num.status === 'apartado' ? '#fffde7' : undefined,
                                                                                color: num.status === 'apartado' ? '#fbc02d' : undefined
                                                                            }}
                                                                        />
                                                                    </Box>
                                                                </Box>
                                                            </TableCell>
                                                            <TableCell sx={{ bgcolor: '#e8f5e9', color: '#388e3c', fontWeight: 700 }}>
                                                                {formatCurrencyCOP(+num.paymentAmount)}
                                                            </TableCell>
                                                            <TableCell sx={{ bgcolor: '#ffebee', color: '#d32f2f', fontWeight: 700 }}>
                                                                {formatCurrencyCOP(+num.paymentDue)}
                                                            </TableCell>
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        </Box>
                                    );
                                })
                            )}
                        </Box>
                    </Collapse>
                </TableCell>
            </TableRow>
        </React.Fragment>
    );
}

export default function ClientsListTable({ clients, onEdit, onBuyNumbers }: ClientsListTableProps) {
    return (
        <TableContainer component={Paper} sx={{ mt: 2, borderRadius: 3, boxShadow: 3 }}>
            <Table aria-label="collapsible table">
                <TableHead>
                    <TableRow>
                        <TableCell />
                        <TableCell>Nombre</TableCell>
                        <TableCell>Teléfono</TableCell>
                        <TableCell>Dirección</TableCell>
                        <TableCell align="center">Acciones</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {clients.map((client: ClientType) => (
                        <Row 
                            key={client.id} 
                            client={client} 
                            onEdit={onEdit}
                            onBuyNumbers={onBuyNumbers}
                            />
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );
}
