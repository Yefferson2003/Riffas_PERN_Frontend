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
import { formatCurrencyCOP, formatWithLeadingZeros } from '../../utils';
import useMediaQuery from '@mui/material/useMediaQuery';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import LockIcon from '@mui/icons-material/Lock';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

// Utilidad para fecha corta (solo fecha, no hora)
function formatDateShort(dateStr?: string) {
    if (!dateStr) return '-';
    const d = new Date(dateStr);
    return d.toLocaleDateString();
}

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


    // Chips personalizados para el estado
    const renderStatusChip = (status: string) => {
        if (status === 'sold') {
            return <Chip icon={<CheckCircleIcon sx={{ color: '#43a047' }} />} label="Vendido" color="success" size="small" sx={{ fontWeight: 700, px: 1.5, borderRadius: 2, minWidth: 110, maxWidth: 110, justifyContent: 'center', bgcolor: '#e8f5e9', color: '#388e3c' }} />;
        }
        if (status === 'apartado') {
            return <Chip icon={<LockIcon sx={{ color: '#fbc02d' }} />} label="Apartado" color="warning" size="small" sx={{ fontWeight: 700, px: 1.5, borderRadius: 2, minWidth: 110, maxWidth: 110, justifyContent: 'center', bgcolor: '#fffde7', color: '#fbc02d' }} />;
        }
        if (status === 'pending') {
            return <Chip icon={<AccessTimeIcon sx={{ color: '#0288d1' }} />} label="Pendiente" color="info" size="small" sx={{ fontWeight: 700, px: 1.5, borderRadius: 2, minWidth: 110, maxWidth: 110, justifyContent: 'center', bgcolor: '#e3f2fd', color: '#0288d1' }} />;
        }
        return <Chip label={status.charAt(0).toUpperCase() + status.slice(1).toLowerCase()} size="small" sx={{ fontWeight: 700, px: 1.5, borderRadius: 2, minWidth: 110, maxWidth: 110, justifyContent: 'center' }} />;
    };

    return (
        <React.Fragment>
            <TableRow sx={{ '& > *': { borderBottom: 'unset' }, '& td, & th': { whiteSpace: { xs: 'nowrap', sm: 'unset' }, fontSize: { xs: 13, sm: 15 } } }}>
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
                    <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 0.5 }}>
                        <span>{client.firstName}</span>
                        <span>{client.lastName}</span>
                    </Box>
                </TableCell>
                <TableCell>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                        <span style={{ wordBreak: 'break-all' }}>{client.phone || 'Sin teléfono'}</span>
                    </Box>
                </TableCell>
                <TableCell>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                        <span style={{ wordBreak: 'break-all' }}>{client.address || 'Sin dirección'}</span>
                    </Box>
                </TableCell>
                <TableCell align="center" sx={{ display: 'flex', gap: 1, justifyContent: 'center', flexWrap: { xs: 'wrap', sm: 'nowrap' } }}>
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
                        <Box sx={{ margin: 2, overflowX: 'auto' }}>
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
                                                overflowX: 'auto',
                                            }}
                                        >
                                            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1, color: raffleColor || 'primary.main', fontSize: { xs: 15, sm: 17 } }}>
                                                Rifa: {numbers[0].raffle?.name || `ID ${raffleId}`}
                                            </Typography>
                                            <Table size="small" aria-label="números" sx={{ minWidth: 420 }}>
                                                <TableHead>
                                                    <TableRow>
                                                        <TableCell sx={{ minWidth: 70 }}>Número</TableCell>
                                                        <TableCell sx={{ minWidth: 120 }}>Fecha apartado</TableCell>
                                                        <TableCell sx={{ minWidth: 80 }}>Estado</TableCell>
                                                        <TableCell sx={{ minWidth: 90 }}>Abonos</TableCell>
                                                        <TableCell sx={{ minWidth: 90 }}>Deuda</TableCell>
                                                    </TableRow>
                                                </TableHead>
                                                <TableBody>
                                                    {numbers.map(num => (
                                                        <TableRow key={num.id}>
                                                            <TableCell>
                                                                {formatWithLeadingZeros(num.number, num.raffle?.totalNumbers || 0)}
                                                            </TableCell>
                                                            <TableCell>{formatDateShort(num.reservedDate ?? undefined)}</TableCell>
                                                            <TableCell>
                                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                                    <Box>
                                                                        {renderStatusChip(num.status)}
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
    const isMobile = useMediaQuery('(max-width:600px)');

    if (isMobile) {
        // Vista tipo tarjeta para móvil, centrada a la izquierda y acordeón para los números
        return (
            <Stack spacing={2} sx={{ mt: 2, alignItems: 'flex-start' }}>
                {clients.map((client: ResponseClientType) => {
                    // Agrupar números por rifa
                    const groupedByRaffle = (client.raffleNumbers || []).reduce((acc, num) => {
                        const raffleId = num.raffle?.id || num.raffleId;
                        if (!acc[raffleId]) acc[raffleId] = [];
                        acc[raffleId].push(num);
                        return acc;
                    }, {} as Record<string, typeof client.raffleNumbers>);
                    return (
                        <Card key={client.id} sx={{ borderRadius: 3, boxShadow: 3, p: 1, minWidth: 0, width: '100%', maxWidth: 420 }}>
                            <CardContent sx={{ pb: 1 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                                    <Typography variant="h6" sx={{ fontWeight: 700, fontSize: 17 }}>
                                        {client.firstName} {client.lastName}
                                    </Typography>
                                </Box>
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, mb: 1 }}>
                                    <Typography variant="body2" color="text.secondary">
                                        <b>Teléfono:</b> {client.phone || 'Sin teléfono'}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        <b>Dirección:</b> {client.address || 'Sin dirección'}
                                    </Typography>
                                </Box>
                                <Divider sx={{ my: 1 }} />
                                <Accordion sx={{ boxShadow: 'none', bgcolor: 'transparent' }}>
                                    <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls="panel-numeros-content" id={`panel-numeros-header-${client.id}`}>
                                        <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'primary.main' }}>
                                            Números (últimos 50)
                                        </Typography>
                                    </AccordionSummary>
                                    <AccordionDetails sx={{ p: 0 }}>
                                        {Object.keys(groupedByRaffle).length === 0 ? (
                                            <Typography variant="body2" color="text.secondary" sx={{ px: 2, pb: 1 }}>No tiene números asociados.</Typography>
                                        ) : (
                                            Object.entries(groupedByRaffle).map(([raffleId, numbers]) => {
                                                if (!numbers || numbers.length === 0) return null;
                                                const raffleColor = numbers[0].raffle?.color || undefined;
                                                return (
                                                    <Box key={raffleId} sx={{ mb: 1.5, p: 1, border: `2px solid ${raffleColor || '#1976d2'}`, borderRadius: 2, background: raffleColor ? `${raffleColor}11` : undefined }}>
                                                        <Typography variant="body2" sx={{ fontWeight: 700, color: raffleColor || 'primary.main', mb: 0.5 }}>
                                                            Rifa: {numbers[0].raffle?.name || `ID ${raffleId}`}
                                                        </Typography>
                                                        <Stack spacing={0.5} divider={<Divider flexItem />}>
                                                            {numbers.map(num => (
                                                                <Box key={num.id} sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, py: 0.5 }}>
                                                                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap', mb: 0.5 }}>
                                                                        {num.status === 'sold' && (
                                                                            <Chip icon={<CheckCircleIcon sx={{ color: '#43a047' }} />} label="Vendido" color="success" size="small" sx={{ fontWeight: 700, px: 1.5, borderRadius: 2, minWidth: 110, maxWidth: 110, justifyContent: 'center', bgcolor: '#e8f5e9', color: '#388e3c' }} />
                                                                        )}
                                                                        {num.status === 'apartado' && (
                                                                            <Chip icon={<LockIcon sx={{ color: '#fbc02d' }} />} label="Apartado" color="warning" size="small" sx={{ fontWeight: 700, px: 1.5, borderRadius: 2, minWidth: 110, maxWidth: 110, justifyContent: 'center', bgcolor: '#fffde7', color: '#fbc02d' }} />
                                                                        )}
                                                                        {num.status === 'pending' && (
                                                                            <Chip icon={<AccessTimeIcon sx={{ color: '#0288d1' }} />} label="Pendiente" color="info" size="small" sx={{ fontWeight: 700, px: 1.5, borderRadius: 2, minWidth: 110, maxWidth: 110, justifyContent: 'center', bgcolor: '#e3f2fd', color: '#0288d1' }} />
                                                                        )}
                                                                        {num.status !== 'sold' && num.status !== 'apartado' && num.status !== 'pending' && (
                                                                            <Chip label={num.status.charAt(0).toUpperCase() + num.status.slice(1).toLowerCase()} size="small" sx={{ fontWeight: 700, px: 1.5, borderRadius: 2, minWidth: 110, maxWidth: 110, justifyContent: 'center' }} />
                                                                        )}
                                                                    </Box>
                                                                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, fontSize: 13 }}>
                                                                        <Box sx={{ flex: '1 1 45%', minWidth: 120, mb: 0.5 }}>
                                                                            <b>Número:</b> {formatWithLeadingZeros(num.number, num.raffle?.totalNumbers || 0)}
                                                                        </Box>
                                                                        <Box sx={{ flex: '1 1 45%', minWidth: 120, mb: 0.5 }}>
                                                                            <b>Fecha:</b> {formatDateShort(num.reservedDate ?? undefined)}
                                                                        </Box>
                                                                        <Box sx={{ flex: '1 1 45%', minWidth: 120, mb: 0.5, color: '#388e3c', fontWeight: 700 }}>
                                                                            <b>Abonos:</b> {formatCurrencyCOP(+num.paymentAmount)}
                                                                        </Box>
                                                                        <Box sx={{ flex: '1 1 45%', minWidth: 120, mb: 0.5, color: '#d32f2f', fontWeight: 700 }}>
                                                                            <b>Deuda:</b> {formatCurrencyCOP(+num.paymentDue)}
                                                                        </Box>
                                                                    </Box>
                                                                </Box>
                                                            ))}
                                                        </Stack>
                                                    </Box>
                                                );
                                            })
                                        )}
                                    </AccordionDetails>
                                </Accordion>
                            </CardContent>
                            <CardActions sx={{ justifyContent: 'flex-end', gap: 1 }}>
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
                            </CardActions>
                        </Card>
                    );
                })}
            </Stack>
        );
    }

    // Vista de tabla tradicional para escritorio/tablet
    return (
        <Box sx={{ width: '100%', overflowX: 'auto', mt: 2 }}>
            <TableContainer component={Paper} sx={{ borderRadius: 3, boxShadow: 3, minWidth: 360 }}>
                <Table aria-label="collapsible table" size="small" sx={{ minWidth: 600 }}>
                    <TableHead>
                        <TableRow>
                            <TableCell sx={{ width: 40 }} />
                            <TableCell sx={{ minWidth: 120 }}>Nombre</TableCell>
                            <TableCell sx={{ minWidth: 120 }}>Teléfono</TableCell>
                            <TableCell sx={{ minWidth: 140 }}>Dirección</TableCell>
                            <TableCell align="center" sx={{ minWidth: 120 }}>Acciones</TableCell>
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
        </Box>
    );
}
