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
import DeleteIcon from '@mui/icons-material/Delete';
import LocalAtmIcon from '@mui/icons-material/LocalAtm';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import { ClientType, ResponseClientType } from '../../types';
import { Chip, CircularProgress } from '@mui/material';
import { formatCurrencyCOP, formatWithLeadingZeros, handleMessageToWhatsAppAviso, redirectToWhatsApp } from '../../utils';
import useMediaQuery from '@mui/material/useMediaQuery';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import LockIcon from '@mui/icons-material/Lock';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CircleIcon from '@mui/icons-material/Circle';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import ListItemText from '@mui/material/ListItemText';
import CampaignIcon from '@mui/icons-material/Campaign';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import { useQuery } from '@tanstack/react-query';
import { getDataRaffleNumberAvisoWhatsapp, getDataRaffleNumberAvisoWhatsappByClient } from '../../api/raffleNumbersApi';
import { getAwards } from '../../api/awardsApi';
import { sendPaymentReminderWhatsApp } from '../../utils';
import { toast } from 'react-toastify';

// Utilidad para fecha corta (solo fecha, no hora)
function formatDateShort(dateStr?: string) {
    if (!dateStr) return '-';
    const d = new Date(dateStr);
    return d.toLocaleDateString();
}

function getTrafficLightLabel(semaforo?: string) {
    if (semaforo === 'blue') return 'Azul';
    if (semaforo === 'green') return 'Verde';
    if (semaforo === 'orange') return 'Naranja';
    return 'Rojo';
}

function getTrafficLightChipStyles(semaforo?: string) {
    if (semaforo === 'blue') {
        return { bgcolor: '#e3f2fd', color: '#1565c0', borderColor: '#90caf9' };
    }
    if (semaforo === 'green') {
        return { bgcolor: '#e8f5e9', color: '#2e7d32', borderColor: '#81c784' };
    }
    if (semaforo === 'orange') {
        return { bgcolor: '#fff3e0', color: '#ef6c00', borderColor: '#ffb74d' };
    }
    return { bgcolor: '#ffebee', color: '#c62828', borderColor: '#ef9a9a' };
}

function getTrafficLightColor(semaforo?: string) {
    if (semaforo === 'blue') return '#1565c0';
    if (semaforo === 'green') return '#2e7d32';
    if (semaforo === 'orange') return '#ef6c00';
    return '#c62828';
}

function NumberAvisoButton({ raffleId, raffleNumberId }: { raffleId: number; raffleNumberId: number }) {
    const [isSending, setIsSending] = React.useState(false);

    const { data, isFetching, isError, refetch } = useQuery({
        queryKey: ['whatsapp-aviso', raffleId, raffleNumberId],
        queryFn: () => getDataRaffleNumberAvisoWhatsapp({ raffleId, raffleNumberId }),
        enabled: false,
        retry: false,
        staleTime: Infinity,
    });

    const handleClick = async () => {
        if (isSending) return;

        try {
            setIsSending(true);

            let avisoData = data;

            if (!avisoData) {
                const response = await refetch();
                avisoData = response.data;
            }

            if (!avisoData) {
                throw new Error('No se pudieron obtener los datos para el aviso');
            }

            handleMessageToWhatsAppAviso(avisoData);
        } catch (error) {
            console.error(error);
        } finally {
            setIsSending(false);
        }
    };

    return (
        <Tooltip
            title={isError ? 'Sin cliente asignado o error al obtener datos' : 'Enviar aviso por WhatsApp'}
            arrow
        >
            <span>
                <IconButton
                    size="small"
                    onClick={handleClick}
                    disabled={isFetching || isSending}
                    sx={{ color: isError ? 'error.main' : '#FF6B00' }}
                >
                    {isFetching || isSending
                        ? <CircularProgress size={16} sx={{ color: '#FF6B00' }} />
                        : <CampaignIcon fontSize="small" />}
                </IconButton>
            </span>
        </Tooltip>
    );
}

function RaffleAvisoByClientButton({ raffleId, clientId }: { raffleId: number; clientId: number }) {
    const [isSending, setIsSending] = React.useState(false);

    const { data, isFetching, isError, refetch } = useQuery({
        queryKey: ['whatsapp-aviso-client', raffleId, clientId],
        queryFn: () => getDataRaffleNumberAvisoWhatsappByClient({ raffleId, clienteId: clientId }),
        enabled: false,
        retry: false,
        staleTime: Infinity,
    });

    const handleClick = async () => {
        if (isSending) return;

        try {
            setIsSending(true);

            let avisoData = data;
            

            if (!avisoData) {
                const response = await refetch();
                avisoData = response.data;
            }

            if (!avisoData) {
                throw new Error('No se pudieron obtener los datos para el aviso general');
            }

            handleMessageToWhatsAppAviso(avisoData);
        } catch (error) {
            console.error(error);
        } finally {
            setIsSending(false);
        }
    };

    return (
        <Tooltip
            title={isError ? 'Sin datos para aviso general' : 'Enviar aviso general de la rifa'}
            arrow
        >
            <span>
                <IconButton
                    size="small"
                    onClick={handleClick}
                    disabled={isFetching || isSending}
                    sx={{ color: isError ? 'error.main' : '#ef6c00' }}
                >
                    {isFetching || isSending
                        ? <CircularProgress size={16} sx={{ color: '#ef6c00' }} />
                        : <CampaignIcon fontSize="small" />}
                </IconButton>
            </span>
        </Tooltip>
    );
}

function NumberPaymentReminderButton({
    raffleId,
    raffleName,
    rafflePlayDate,
    rafflePrice,
    totalNumbers,
    raffleNumber,
    phone,
    name,
    reservedDate,
    paymentDue,
}: {
    raffleId: number;
    raffleName: string;
    rafflePlayDate: string;
    rafflePrice: string;
    totalNumbers: number;
    raffleNumber: number;
    phone: string;
    name: string;
    reservedDate: string | null;
    paymentDue: number;
}) {
    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);

    const { data: awards = [], isLoading: isLoadingAwards } = useQuery({
        queryKey: ['client-reminder-awards', raffleId],
        queryFn: () => getAwards({ raffleId: String(raffleId) }),
        enabled: open,
        retry: false,
        staleTime: 5 * 60 * 1000,
    });

    const openWhatsAppUrl = (url: string) => {
        const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
        if (isMobile) {
            window.location.href = url;
        } else {
            window.open(url, '_blank');
        }
    };

    const handleSendReminder = (award?: { id: number; name: string; playDate: string }) => {
        if (!phone) {
            toast.warn('El número no tiene teléfono asignado.');
            return;
        }

        try {
            const url = sendPaymentReminderWhatsApp({
                totalNumbers,
                number: raffleNumber,
                phone,
                name,
                amount: 0,
                infoRaffle: {
                    name: raffleName,
                    amountRaffle: rafflePrice,
                    playDate: rafflePlayDate,
                    description: '',
                    responsable: '',
                },
                awards: [],
                reservedDate,
                award,
                abonosPendientes: paymentDue,
            });

            if (!url) {
                toast.error('No se pudo generar el mensaje de recordatorio.');
                return;
            }

            openWhatsAppUrl(url);
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Hubo un error al enviar recordatorio.';
            toast.error(message);
        }
    };

    return (
        <>
            <Tooltip title="Recordar pago" arrow>
                <span>
                    <IconButton
                        size="small"
                        onClick={(event) => setAnchorEl(event.currentTarget)}
                        sx={{ color: '#059669' }}
                    >
                        <AttachMoneyIcon fontSize="small" />
                    </IconButton>
                </span>
            </Tooltip>

            <Menu
                anchorEl={anchorEl}
                open={open}
                onClose={() => setAnchorEl(null)}
                PaperProps={{
                    sx: {
                        width: 360,
                        maxWidth: '90vw',
                        borderRadius: 2,
                    },
                }}
            >
                {isLoadingAwards ? (
                    <MenuItem disabled>Cargando premios...</MenuItem>
                ) : awards.length === 0 ? (
                    <MenuItem
                        onClick={() => {
                            handleSendReminder(undefined);
                            setAnchorEl(null);
                        }}
                    >
                        <ListItemText primary="Recordar pago (sin premio)" secondary="No hay premios disponibles" />
                    </MenuItem>
                ) : (
                    awards.map((award) => (
                        <MenuItem
                            key={award.id}
                            onClick={() => {
                                handleSendReminder(award);
                                setAnchorEl(null);
                            }}
                        >
                            <ListItemText primary={award.name} secondary={new Date(award.playDate).toLocaleString()} />
                        </MenuItem>
                    ))
                )}
            </Menu>
        </>
    );
}

function RafflePaymentReminderButton({
    raffleId,
    raffleName,
    rafflePlayDate,
    rafflePrice,
    totalNumbers,
    numbers,
    phone,
    name,
    reservedDate,
    paymentDue,
}: {
    raffleId: number;
    raffleName: string;
    rafflePlayDate: string;
    rafflePrice: string;
    totalNumbers: number;
    numbers: number[];
    phone: string;
    name: string;
    reservedDate: string | null;
    paymentDue: number;
}) {
    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);

    const { data: awards = [], isLoading: isLoadingAwards } = useQuery({
        queryKey: ['client-reminder-awards-group', raffleId],
        queryFn: () => getAwards({ raffleId: String(raffleId) }),
        enabled: open,
        retry: false,
        staleTime: 5 * 60 * 1000,
    });

    const openWhatsAppUrl = (url: string) => {
        const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
        if (isMobile) {
            window.location.href = url;
        } else {
            window.open(url, '_blank');
        }
    };

    const handleSendReminder = (award?: { id: number; name: string; playDate: string }) => {
        if (!phone) {
            toast.warn('El cliente no tiene teléfono asignado.');
            return;
        }

        if (!numbers.length) {
            toast.warn('No hay números con deuda para recordar.');
            return;
        }

        try {
            const url = sendPaymentReminderWhatsApp({
                totalNumbers,
                number: numbers,
                phone,
                name,
                amount: 0,
                infoRaffle: {
                    name: raffleName,
                    amountRaffle: rafflePrice,
                    playDate: rafflePlayDate,
                    description: '',
                    responsable: '',
                },
                awards: [],
                reservedDate,
                award,
                abonosPendientes: paymentDue,
            });

            if (!url) {
                toast.error('No se pudo generar el mensaje de recordatorio.');
                return;
            }

            openWhatsAppUrl(url);
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Hubo un error al enviar recordatorio.';
            toast.error(message);
        }
    };

    return (
        <>
            <Tooltip title="Recordar pago (general rifa)" arrow>
                <span>
                    <IconButton
                        size="small"
                        onClick={(event) => setAnchorEl(event.currentTarget)}
                        disabled={!numbers.length}
                        sx={{ color: '#059669' }}
                    >
                        <AttachMoneyIcon fontSize="small" />
                    </IconButton>
                </span>
            </Tooltip>

            <Menu
                anchorEl={anchorEl}
                open={open}
                onClose={() => setAnchorEl(null)}
                PaperProps={{
                    sx: {
                        width: 360,
                        maxWidth: '90vw',
                        borderRadius: 2,
                    },
                }}
            >
                {isLoadingAwards ? (
                    <MenuItem disabled>Cargando premios...</MenuItem>
                ) : awards.length === 0 ? (
                    <MenuItem
                        onClick={() => {
                            handleSendReminder(undefined);
                            setAnchorEl(null);
                        }}
                    >
                        <ListItemText primary="Recordar pago (sin premio)" secondary="No hay premios disponibles" />
                    </MenuItem>
                ) : (
                    awards.map((award) => (
                        <MenuItem
                            key={award.id}
                            onClick={() => {
                                handleSendReminder(award);
                                setAnchorEl(null);
                            }}
                        >
                            <ListItemText primary={award.name} secondary={new Date(award.playDate).toLocaleString()} />
                        </MenuItem>
                    ))
                )}
            </Menu>
        </>
    );
}

function RaffleWhatsappButton({
    totalNumbers,
    numbers,
    phone,
    name,
    raffleName,
    rafflePlayDate,
    rafflePrice,
    raffleDescription,
    raffleResponsable,
    reservedDate,
    paymentAmount,
    paymentDue,
}: {
    totalNumbers: number;
    numbers: number[];
    phone: string;
    name: string;
    raffleName: string;
    rafflePlayDate: string;
    rafflePrice: string;
    raffleDescription: string;
    raffleResponsable: string;
    reservedDate: string | null;
    paymentAmount: number;
    paymentDue: number;
}) {
    const handleSendUserMessage = () => {
        if (!phone) {
            toast.warn('El cliente no tiene teléfono asignado.');
            return;
        }

        if (!numbers.length) {
            toast.warn('No hay números para enviar en el mensaje.');
            return;
        }

        try {
            const url = redirectToWhatsApp({
                totalNumbers,
                amount: paymentAmount,
                number: numbers,
                phone,
                name,
                infoRaffle: {
                    name: raffleName,
                    amountRaffle: rafflePrice,
                    playDate: rafflePlayDate,
                    description: raffleDescription,
                    responsable: raffleResponsable,
                },
                payments: [],
                awards: [],
                reservedDate,
                statusRaffleNumber: 'pending',
                priceRaffleNumber: Number(rafflePrice || 0),
                abonosPendientes: paymentDue,
            });

            if (!url) {
                toast.error('No se pudo generar el mensaje para WhatsApp.');
                return;
            }

            const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
            if (isMobile) {
                window.location.href = url;
            } else {
                window.open(url, '_blank');
            }
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Error al generar el mensaje de WhatsApp.';
            toast.error(message);
        }
    };

    return (
        <Tooltip title="Mensaje WhatsApp (general rifa)" arrow>
            <span>
                <IconButton
                    size="small"
                    onClick={handleSendUserMessage}
                    disabled={!numbers.length}
                    sx={{ color: '#16a34a' }}
                >
                    <WhatsAppIcon fontSize="small" />
                </IconButton>
            </span>
        </Tooltip>
    );
}

function NumberWhatsappButton({
    totalNumbers,
    raffleNumber,
    phone,
    name,
    raffleName,
    rafflePlayDate,
    rafflePrice,
    reservedDate,
    status,
    paymentAmount,
    paymentDue,
    raffleDescription,
    raffleResponsable,
}: {
    totalNumbers: number;
    raffleNumber: number;
    phone: string;
    name: string;
    raffleName: string;
    rafflePlayDate: string;
    rafflePrice: string;
    reservedDate: string | null;
    status: 'sold' | 'pending' | 'apartado' | 'available';
    paymentAmount: number;
    paymentDue: number;
    raffleDescription: string;
    raffleResponsable: string;
}) {
    const handleSendUserMessage = () => {
        if (!phone) {
            toast.warn('El cliente no tiene teléfono asignado.');
            return;
        }

        try {
            const url = redirectToWhatsApp({
                totalNumbers,
                amount: paymentAmount,
                numbers: [{ numberId: 0, number: raffleNumber }],
                phone,
                name,
                infoRaffle: {
                    name: raffleName,
                    amountRaffle: rafflePrice,
                    playDate: rafflePlayDate,
                    description: raffleDescription,
                    responsable: raffleResponsable,
                },
                payments: [],
                awards: [],
                reservedDate,
                statusRaffleNumber: status === 'available' ? undefined : status,
                priceRaffleNumber: paymentAmount + paymentDue,
            });

            if (!url) {
                toast.error('No se pudo generar el mensaje para WhatsApp.');
                return;
            }

            const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
            if (isMobile) {
                window.location.href = url;
            } else {
                window.open(url, '_blank');
            }
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Error al generar el mensaje de WhatsApp.';
            toast.error(message);
        }
    };

    return (
        <Tooltip title="Mensaje al usuario" arrow>
            <span>
                <IconButton
                    size="small"
                    onClick={handleSendUserMessage}
                    sx={{ color: '#16a34a' }}
                >
                    <WhatsAppIcon fontSize="small" />
                </IconButton>
            </span>
        </Tooltip>
    );
}

interface ClientsListTableProps {
    clients: ResponseClientType[];
    onEdit: (client: ClientType) => void;
    onBuyNumbers: (client: ClientType) => void;
    onDelete: (client: ClientType) => void;
    isDeleting: boolean;
}

function Row({ client, onEdit, onBuyNumbers, onDelete, isDeleting }: Pick<ClientsListTableProps, 'onEdit' | 'onBuyNumbers' | 'onDelete' | 'isDeleting'> & { client: ResponseClientType }) {
    const [open, setOpen] = React.useState(false);
    const clientPhone = client.phone || '';
    const clientName = `${client.firstName || ''} ${client.lastName || ''}`.trim();

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
                <TableCell>
                    {client.status ? (
                        <Box sx={{ display: 'flex', flexDirection: 'row', gap: 0.5, alignItems: 'flex-start' }}>
                            <Chip
                                icon={<CircleIcon sx={{ color: getTrafficLightColor(client.status.semaforo), opacity: 1 }} />}
                                label={`${client.status.soldPercentage.toFixed(2)}%`}
                                size="small"
                                variant="outlined"
                                sx={{
                                    fontWeight: 700,
                                    borderRadius: 2,
                                    ...getTrafficLightChipStyles(client.status.semaforo),
                                    '& .MuiChip-icon': {
                                        color: `${getTrafficLightColor(client.status.semaforo)} !important`,
                                        opacity: 1,
                                    },
                                }}
                            />
                        </Box>
                    ) : (
                        <Chip label="Sin datos" size="small" variant="outlined" sx={{ borderRadius: 2 }} />
                    )}
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
                    <Tooltip title="Eliminar cliente" arrow>
                        <IconButton color="error" onClick={() => onDelete(client)} size="small"
                            disabled={isDeleting}
                        >
                            <DeleteIcon />
                        </IconButton>
                    </Tooltip>
                </TableCell>
            </TableRow>
            <TableRow>
                <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
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
                                    const raffleTotalNumbers = numbers.length;
                                    const raffleTotalPaid = numbers.reduce((sum, num) => sum + (Number(num.paymentAmount) || 0), 0);
                                    const raffleTotalDebt = numbers.reduce((sum, num) => sum + (Number(num.paymentDue) || 0), 0);
                                    const raffleNumbersWithDebt = numbers.filter((num) => Number(num.paymentDue) > 0);
                                    const raffleIdNumber = Number(raffleId);
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
                                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, mb: 1 }}>
                                                <Typography variant="subtitle1" sx={{ fontWeight: 700, color: raffleColor || 'primary.main', fontSize: { xs: 15, sm: 17 } }}>
                                                    Rifa: {numbers[0].raffle?.name || `ID ${raffleId}`}
                                                </Typography>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                    <RaffleAvisoByClientButton raffleId={raffleIdNumber} clientId={client.id} />
                                                    <RafflePaymentReminderButton
                                                        raffleId={raffleIdNumber}
                                                        raffleName={numbers[0].raffle?.name || `Rifa ${raffleId}`}
                                                        rafflePlayDate={numbers[0].raffle?.playDate || new Date().toISOString()}
                                                        rafflePrice={numbers[0].raffle?.price || '0'}
                                                        totalNumbers={numbers[0].raffle?.totalNumbers || numbers.length}
                                                        numbers={raffleNumbersWithDebt.map((num) => num.number)}
                                                        phone={clientPhone}
                                                        name={clientName}
                                                        reservedDate={raffleNumbersWithDebt[0]?.reservedDate || null}
                                                        paymentDue={raffleTotalDebt}
                                                    />
                                                    <RaffleWhatsappButton
                                                        totalNumbers={numbers[0].raffle?.totalNumbers || numbers.length}
                                                        numbers={numbers.map((num) => num.number)}
                                                        phone={clientPhone}
                                                        name={clientName}
                                                        raffleName={numbers[0].raffle?.name || `Rifa ${raffleId}`}
                                                        rafflePlayDate={numbers[0].raffle?.playDate || new Date().toISOString()}
                                                        rafflePrice={numbers[0].raffle?.price || '0'}
                                                        raffleDescription={numbers[0].raffle?.description || ''}
                                                        raffleResponsable={numbers[0].raffle?.nameResponsable || ''}
                                                        reservedDate={numbers[0].reservedDate || null}
                                                        paymentAmount={raffleTotalPaid}
                                                        paymentDue={raffleTotalDebt}
                                                    />
                                                </Box>
                                            </Box>
                                            <Box
                                                sx={{
                                                    display: 'flex',
                                                    gap: 2,
                                                    flexWrap: 'wrap',
                                                    alignItems: 'center',
                                                    mb: 1.5,
                                                }}
                                            >
                                                <Chip
                                                    label={`Total numeros: ${raffleTotalNumbers}`}
                                                    size="small"
                                                    sx={{
                                                        fontWeight: 700,
                                                        borderRadius: 2,
                                                        bgcolor: '#e3f2fd',
                                                        color: '#1565c0'
                                                    }}
                                                />
                                                <Chip
                                                    label={`Deuda total: ${formatCurrencyCOP(raffleTotalDebt)}`}
                                                    size="small"
                                                    sx={{
                                                        fontWeight: 700,
                                                        borderRadius: 2,
                                                        bgcolor: '#ffebee',
                                                        color: '#c62828'
                                                    }}
                                                />
                                            </Box>
                                                <Table size="small" aria-label="números" sx={{ minWidth: 480 }}>
                                                <TableHead>
                                                    <TableRow>
                                                        <TableCell sx={{ minWidth: 70 }}>Número</TableCell>
                                                        <TableCell sx={{ minWidth: 120 }}>Fecha apartado</TableCell>
                                                        <TableCell sx={{ minWidth: 80 }}>Estado</TableCell>
                                                        <TableCell sx={{ minWidth: 90 }}>Abonos</TableCell>
                                                        <TableCell sx={{ minWidth: 90 }}>Deuda</TableCell>
                                                        <TableCell sx={{ minWidth: 60 }}>Aviso</TableCell>
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
                                                            <TableCell>
                                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                                    <NumberAvisoButton raffleId={num.raffleId} raffleNumberId={num.id} />
                                                                    <NumberWhatsappButton
                                                                        totalNumbers={num.raffle?.totalNumbers || numbers.length}
                                                                        raffleNumber={num.number}
                                                                        phone={clientPhone}
                                                                        name={clientName}
                                                                        raffleName={num.raffle?.name || `Rifa ${num.raffleId}`}
                                                                        rafflePlayDate={num.raffle?.playDate || new Date().toISOString()}
                                                                        rafflePrice={num.raffle?.price || '0'}
                                                                        reservedDate={num.reservedDate || null}
                                                                        status={num.status}
                                                                        paymentAmount={+num.paymentAmount}
                                                                        paymentDue={+num.paymentDue}
                                                                        raffleDescription={num.raffle?.description || ''}
                                                                        raffleResponsable={num.raffle?.nameResponsable || ''}
                                                                    />
                                                                    {(num.status === 'apartado' || num.status === 'pending') && (
                                                                        <NumberPaymentReminderButton
                                                                            raffleId={num.raffleId}
                                                                            raffleName={num.raffle?.name || `Rifa ${num.raffleId}`}
                                                                            rafflePlayDate={num.raffle?.playDate || new Date().toISOString()}
                                                                            rafflePrice={num.raffle?.price || '0'}
                                                                            totalNumbers={num.raffle?.totalNumbers || numbers.length}
                                                                            raffleNumber={num.number}
                                                                            phone={clientPhone}
                                                                            name={clientName}
                                                                            reservedDate={num.reservedDate || null}
                                                                            paymentDue={+num.paymentDue}
                                                                        />
                                                                    )}
                                                                </Box>
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

export default function ClientsListTable({ clients, onEdit, onBuyNumbers, onDelete, isDeleting }: ClientsListTableProps) {
    const isMobile = useMediaQuery('(max-width:600px)');

    if (isMobile) {
        // Vista tipo tarjeta para móvil, centrada a la izquierda y acordeón para los números
        return (
            <Stack spacing={2} sx={{ mt: 2, alignItems: 'flex-start' }}>
                {clients.map((client: ResponseClientType) => {
                    const clientPhone = client.phone || '';
                    const clientName = `${client.firstName || ''} ${client.lastName || ''}`.trim();
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
                                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap', mb: 1 }}>
                                    {client.status ? (
                                        <>
                                            <Chip
                                                label={getTrafficLightLabel(client.status.semaforo)}
                                                size="small"
                                                variant="outlined"
                                                sx={{
                                                    fontWeight: 700,
                                                    borderRadius: 2,
                                                    ...getTrafficLightChipStyles(client.status.semaforo),
                                                }}
                                            />
                                            <Chip
                                                label={`Vendidos: ${client.status.soldNumbers}/${client.status.totalNumbers}`}
                                                size="small"
                                                variant="outlined"
                                                sx={{ fontWeight: 700, borderRadius: 2 }}
                                            />
                                            <Chip
                                                label={`${client.status.soldPercentage.toFixed(2)}%`}
                                                size="small"
                                                variant="outlined"
                                                sx={{ fontWeight: 700, borderRadius: 2 }}
                                            />
                                        </>
                                    ) : (
                                        <Chip label="Estado: Sin datos" size="small" variant="outlined" sx={{ borderRadius: 2 }} />
                                    )}
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
                                                const raffleTotalNumbers = numbers.length;
                                                const raffleTotalPaid = numbers.reduce((sum, num) => sum + (Number(num.paymentAmount) || 0), 0);
                                                const raffleTotalDebt = numbers.reduce((sum, num) => sum + (Number(num.paymentDue) || 0), 0);
                                                const raffleNumbersWithDebt = numbers.filter((num) => Number(num.paymentDue) > 0);
                                                const raffleIdNumber = Number(raffleId);
                                                return (
                                                    <Box key={raffleId} sx={{ mb: 1.5, p: 1, border: `2px solid ${raffleColor || '#1976d2'}`, borderRadius: 2, background: raffleColor ? `${raffleColor}11` : undefined }}>
                                                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, mb: 0.5 }}>
                                                            <Typography variant="body2" sx={{ fontWeight: 700, color: raffleColor || 'primary.main' }}>
                                                                Rifa: {numbers[0].raffle?.name || `ID ${raffleId}`}
                                                            </Typography>
                                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                                <RaffleAvisoByClientButton raffleId={raffleIdNumber} clientId={client.id} />
                                                                <RafflePaymentReminderButton
                                                                    raffleId={raffleIdNumber}
                                                                    raffleName={numbers[0].raffle?.name || `Rifa ${raffleId}`}
                                                                    rafflePlayDate={numbers[0].raffle?.playDate || new Date().toISOString()}
                                                                    rafflePrice={numbers[0].raffle?.price || '0'}
                                                                    totalNumbers={numbers[0].raffle?.totalNumbers || numbers.length}
                                                                    numbers={raffleNumbersWithDebt.map((num) => num.number)}
                                                                    phone={clientPhone}
                                                                    name={clientName}
                                                                    reservedDate={raffleNumbersWithDebt[0]?.reservedDate || null}
                                                                    paymentDue={raffleTotalDebt}
                                                                />
                                                                <RaffleWhatsappButton
                                                                    totalNumbers={numbers[0].raffle?.totalNumbers || numbers.length}
                                                                    numbers={numbers.map((num) => num.number)}
                                                                    phone={clientPhone}
                                                                    name={clientName}
                                                                    raffleName={numbers[0].raffle?.name || `Rifa ${raffleId}`}
                                                                    rafflePlayDate={numbers[0].raffle?.playDate || new Date().toISOString()}
                                                                    rafflePrice={numbers[0].raffle?.price || '0'}
                                                                    raffleDescription={numbers[0].raffle?.description || ''}
                                                                    raffleResponsable={numbers[0].raffle?.nameResponsable || ''}
                                                                    reservedDate={numbers[0].reservedDate || null}
                                                                    paymentAmount={raffleTotalPaid}
                                                                    paymentDue={raffleTotalDebt}
                                                                />
                                                            </Box>
                                                        </Box>
                                                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 1 }}>
                                                            <Chip
                                                                label={`Total numeros: ${raffleTotalNumbers}`}
                                                                size="small"
                                                                sx={{
                                                                    fontWeight: 700,
                                                                    borderRadius: 2,
                                                                    bgcolor: '#e3f2fd',
                                                                    color: '#1565c0'
                                                                }}
                                                            />
                                                            <Chip
                                                                label={`Deuda total: ${formatCurrencyCOP(raffleTotalDebt)}`}
                                                                size="small"
                                                                sx={{
                                                                    fontWeight: 700,
                                                                    borderRadius: 2,
                                                                    bgcolor: '#ffebee',
                                                                    color: '#c62828'
                                                                }}
                                                            />
                                                        </Box>
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
                                                                        <Box sx={{ flex: '1 1 100%', display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                                                                            <Typography variant="caption" color="text.secondary"><b>Aviso:</b></Typography>
                                                                            <NumberAvisoButton raffleId={num.raffleId} raffleNumberId={num.id} />
                                                                            <NumberWhatsappButton
                                                                                totalNumbers={num.raffle?.totalNumbers || numbers.length}
                                                                                raffleNumber={num.number}
                                                                                phone={clientPhone}
                                                                                name={clientName}
                                                                                raffleName={num.raffle?.name || `Rifa ${num.raffleId}`}
                                                                                rafflePlayDate={num.raffle?.playDate || new Date().toISOString()}
                                                                                rafflePrice={num.raffle?.price || '0'}
                                                                                reservedDate={num.reservedDate || null}
                                                                                status={num.status}
                                                                                paymentAmount={+num.paymentAmount}
                                                                                paymentDue={+num.paymentDue}
                                                                                raffleDescription={num.raffle?.description || ''}
                                                                                raffleResponsable={num.raffle?.nameResponsable || ''}
                                                                            />
                                                                            {(num.status === 'apartado' || num.status === 'pending') && (
                                                                                <NumberPaymentReminderButton
                                                                                    raffleId={num.raffleId}
                                                                                    raffleName={num.raffle?.name || `Rifa ${num.raffleId}`}
                                                                                    rafflePlayDate={num.raffle?.playDate || new Date().toISOString()}
                                                                                    rafflePrice={num.raffle?.price || '0'}
                                                                                    totalNumbers={num.raffle?.totalNumbers || numbers.length}
                                                                                    raffleNumber={num.number}
                                                                                    phone={clientPhone}
                                                                                    name={clientName}
                                                                                    reservedDate={num.reservedDate || null}
                                                                                    paymentDue={+num.paymentDue}
                                                                                />
                                                                            )}
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
                                <Tooltip title="Eliminar cliente" arrow>
                                    <IconButton color="error" onClick={() => onDelete(client)} size="small"
                                        disabled={isDeleting}
                                    >
                                        <DeleteIcon />
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
                            <TableCell sx={{ width: 40, bgcolor: 'primary.main', color: 'primary.contrastText', fontWeight: 700, fontSize: 16, letterSpacing: 0.5, borderBottom: '2px solid #1976d2' }} />
                            <TableCell sx={{ minWidth: 120, bgcolor: 'primary.main', color: 'primary.contrastText', fontWeight: 700, fontSize: 16, letterSpacing: 0.5, borderBottom: '2px solid #1976d2' }}>Nombre</TableCell>
                            <TableCell sx={{ minWidth: 120, bgcolor: 'primary.main', color: 'primary.contrastText', fontWeight: 700, fontSize: 16, letterSpacing: 0.5, borderBottom: '2px solid #1976d2' }}>Teléfono</TableCell>
                            <TableCell sx={{ minWidth: 140, bgcolor: 'primary.main', color: 'primary.contrastText', fontWeight: 700, fontSize: 16, letterSpacing: 0.5, borderBottom: '2px solid #1976d2' }}>Dirección</TableCell>
                            <TableCell sx={{ minWidth: 170, bgcolor: 'primary.main', color: 'primary.contrastText', fontWeight: 700, fontSize: 16, letterSpacing: 0.5, borderBottom: '2px solid #1976d2' }}>Estado (% Vendidos)</TableCell>
                            <TableCell align="center" sx={{ minWidth: 120, bgcolor: 'primary.main', color: 'primary.contrastText', fontWeight: 700, fontSize: 16, letterSpacing: 0.5, borderBottom: '2px solid #1976d2' }}>Acciones</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {clients.map((client: ResponseClientType) => (
                            <Row 
                                key={client.id} 
                                client={client} 
                                onEdit={onEdit}
                                onBuyNumbers={onBuyNumbers}
                                onDelete={onDelete}
                                isDeleting={isDeleting}
                            />
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
}
