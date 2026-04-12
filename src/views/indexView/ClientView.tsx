import SyncIcon from '@mui/icons-material/Sync';
import DownloadIcon from '@mui/icons-material/Download';
import IconButton from '@mui/material/IconButton';
import { exportClientsToExcel } from '../../utils/exportClientsExcel';
import { Box, Button, CircularProgress, Fade, Pagination, TextField, Tooltip, Typography, MenuItem, Select, InputLabel, FormControl, SelectChangeEvent } from "@mui/material";
import { Dayjs } from 'dayjs';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { useMutation, useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { deleteClient, getClients } from "../../api/clientApi";
import { getRaffles } from '../../api/raffleApi';
import ClientsListTable from "../../components/clients/ClientsListTable";
import BuyNumbersForClientModal from "../../components/clients/modal/BuyNumbersForClientModal";
import CreateClientModal from "../../components/clients/modal/CreateClientModal";
import EditClientModal from "../../components/clients/modal/EditClientModal";
import { ClientType } from "../../types";
import { toast } from 'react-toastify';



function ClientView () {
    const navigate = useNavigate();

    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [page, setPage] = useState(1);
    const [order, setOrder] = useState(3); // 1: Alfa ASC, 2: Alfa DESC, 3: Fecha ASC, 4: Fecha DESC
    const [raffleId, setRaffleId] = useState<number | ''>('');
    const [semaforo, setSemaforo] = useState<string>('');
    const [startDate, setStartDate] = useState<Dayjs | null>(null);
    const [endDate, setEndDate] = useState<Dayjs | null>(null);
    const limit = 15;

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearch(search);
        }, 1500);
        return () => clearTimeout(handler);
    }, [search]);

    // Manejar cambio de orden
    const handleOrderChange = (e:  SelectChangeEvent<number>) => {
        setOrder(e.target.value as number);
        setPage(1);
    };

    const {
        data,
        isLoading,
        isError,
        error,
        refetch
    } = useQuery({
        queryKey: ["clients", { page, limit, search: debouncedSearch, order, raffleId, semaforo, startDate: startDate?.format('YYYY-MM-DD'), endDate: endDate?.format('YYYY-MM-DD') }],
        queryFn: () => getClients({ page, limit, search: debouncedSearch, order, raffleId: raffleId ? Number(raffleId) : undefined, semaforo: semaforo || undefined, startDate: startDate?.format('YYYY-MM-DD'), endDate: endDate?.format('YYYY-MM-DD') }),
    });

    const { data: rafflesData } = useQuery({
        queryKey: ['raffles-filter-clients'],
        queryFn: () => getRaffles({ page: 1, limit: 200 }),
    });

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearch(e.target.value);
        setPage(1);
    };

    const handlePageChange = (_event: React.ChangeEvent<unknown>, newPage: number) => {
        setPage(newPage);
    };

    const handleRaffleChange = (e: SelectChangeEvent<number | ''>) => {
        const selectedValue = e.target.value;
        setRaffleId(selectedValue === '' ? '' : Number(selectedValue));
        setPage(1);
    };

    const handleSemaforoChange = (e: SelectChangeEvent<string>) => {
        setSemaforo(e.target.value);
        setPage(1);
    };

    const totalPages = data?.totalPages || 1;
    const clients = data?.clients || [];

    const handleNavigateModalNewClient = () => {
        navigate('?newClient=true');
    };

    const handleNavigateEditClient = (client: ClientType) => {
        navigate(`?editClient=${client.id}`);
    };

    const handleNavigateBuyNumbers = (client: ClientType) => {
        navigate(`?buyNumbers=${client.id}`);
    }

    const handleRefetch = () => {
        refetch();
    }

    const { mutate: deleteClientMutation , isPending: isDeleting } = useMutation({
        mutationFn: deleteClient,
        onError(error) {
            toast.error(error.message || 'Error al eliminar el cliente');
        },
        onSuccess: () => {
            handleRefetch();
            toast.success('Cliente eliminado exitosamente');
        },
    });

    const handleDeleteClient = (client: ClientType) => {
        if (window.confirm(`¿Estás seguro de que deseas eliminar al cliente ${client.firstName} ${client.lastName}?`)) {
            deleteClientMutation({ clientId: client.id });
        }
    }

    const handleExportClientsToExcel = async () => {
        await exportClientsToExcel({ search: debouncedSearch, order, raffleId: raffleId ? Number(raffleId) : undefined, semaforo: semaforo || undefined, startDate: startDate?.format('YYYY-MM-DD'), endDate: endDate?.format('YYYY-MM-DD') });
    }

    return (
        <Box sx={{ width: '100%', pb: 8, px: { xs: 1, md: 4 }, textAlign: 'center' }}>
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', lg: 'row' }, alignItems: 'center', justifyContent: 'space-between', mb: 6, gap: 3 }}>
                <Box sx={{ width: '100%' }}>
                    <Box
                        sx={{
                            display: 'grid',
                            gridTemplateColumns: { xs: '1fr', md: 'repeat(2, minmax(0, 1fr))' },
                            gap: 2,
                            alignItems: 'start',
                        }}
                    >
                        <TextField
                            id="search"
                            label="Buscar cliente..."
                            variant="outlined"
                            size="small"
                            value={search}
                            onChange={handleSearchChange}
                            sx={{ width: '100%' }}
                        />
                        <FormControl size="small" sx={{ width: '100%' }}>
                            <InputLabel id="order-select-label">Ordenar por</InputLabel>
                            <Select
                                labelId="order-select-label"
                                id="order-select"
                                value={order}
                                label="Ordenar por"
                                onChange={handleOrderChange}
                            >
                                <MenuItem value={1}>Alfabético (Apellido) (A-Z)</MenuItem>
                                <MenuItem value={2}>Alfabético (Apellido) (Z-A)</MenuItem>
                                <MenuItem value={3}>Fecha creación (más reciente primero)</MenuItem>
                                <MenuItem value={4}>Fecha creación (más antiguo primero)</MenuItem>
                            </Select>
                        </FormControl>
                        <FormControl size="small" sx={{ width: '100%' }}>
                            <InputLabel id="raffle-filter-select-label">Filtrar por rifa</InputLabel>
                            <Select
                                labelId="raffle-filter-select-label"
                                id="raffle-filter-select"
                                value={raffleId}
                                label="Filtrar por rifa"
                                onChange={handleRaffleChange}
                            >
                                <MenuItem value="">Todas las rifas</MenuItem>
                                {(rafflesData?.raffles || []).map((raffle) => (
                                    <MenuItem key={raffle.id} value={raffle.id}>{raffle.name}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        <FormControl size="small" sx={{ width: '100%' }}>
                            <InputLabel id="semaforo-filter-select-label">Estado (% vendidos)</InputLabel>
                            <Select
                                labelId="semaforo-filter-select-label"
                                id="semaforo-filter-select"
                                value={semaforo}
                                label="Estado (% vendidos)"
                                onChange={handleSemaforoChange}
                            >
                                <MenuItem value="">Todos los estados</MenuItem>
                                <MenuItem value="blue">🔵 Excelente (&gt;75%)</MenuItem>
                                <MenuItem value="green">🟢 Bueno (50–75%)</MenuItem>
                                <MenuItem value="orange">🟠 Regular (25–50%)</MenuItem>
                                <MenuItem value="red">🔴 Bajo (&lt;25%)</MenuItem>
                            </Select>
                        </FormControl>
                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5 }}>
                                <DatePicker
                                    label="Fecha inicial"
                                    value={startDate}
                                    onChange={(newValue) => {
                                        setStartDate(newValue);
                                        if (!newValue) setEndDate(null);
                                    }}
                                    slotProps={{ textField: { size: 'small', sx: { width: '100%' } } }}
                                    maxDate={endDate || undefined}
                                />
                                <DatePicker
                                    label="Fecha final"
                                    value={endDate}
                                    onChange={setEndDate}
                                    slotProps={{ textField: { size: 'small', sx: { width: '100%' } } }}
                                    minDate={startDate || undefined}
                                    disabled={!startDate}
                                />
                            </Box>
                        </LocalizationProvider>
                    </Box>
                </Box>
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                    <Button
                        variant="contained"
                        color="primary"
                        sx={{ fontWeight: 700, fontSize: 16, borderRadius: 2, boxShadow: 2, minWidth: 160 }}
                        onClick={handleNavigateModalNewClient}
                    >
                        Nuevo Cliente
                    </Button>
                    <Tooltip title="Actualizar clientes" arrow>
                        <IconButton
                            color="info"
                            sx={{ borderRadius: 2, boxShadow: 1, transition: 'transform 0.2s', '&:hover': { transform: 'rotate(-10deg) scale(1.08)', bgcolor: '#e3f2fd' } }}
                            onClick={handleRefetch}
                            disabled={isLoading}
                        >
                            <SyncIcon sx={{ animation: isLoading ? 'spin 1s linear infinite' : 'none', fontSize: 28 }} />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Exportar clientes a Excel" arrow>
                        <IconButton
                            color="success"
                            sx={{ borderRadius: 2, boxShadow: 1, transition: 'transform 0.2s', '&:hover': { bgcolor: '#e8f5e9', color: 'success.main', transform: 'scale(1.12)' } }}
                            onClick={handleExportClientsToExcel}
                        >
                            <DownloadIcon sx={{ fontSize: 28 }} />
                        </IconButton>
                    </Tooltip>
                </Box>
            </Box>

            <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'primary.main', fontSize: 18, letterSpacing: 0.5 }}>
                    Total de clientes: {data?.total || 0}
                </Typography>
            </Box>


            <CreateClientModal
                refetch={handleRefetch}
            />

            <EditClientModal
                refetch={handleRefetch}
            />

            <BuyNumbersForClientModal
                refetch={handleRefetch}
            />

            {isLoading ? (
                <Fade in={isLoading} unmountOnExit>
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 180 }}>
                        <CircularProgress size={48} color="primary" />
                    </Box>
                </Fade>
            ) : isError ? (
                <Typography color="error" variant="h6" sx={{ mt: 4 }}>
                    {error instanceof Error ? error.message : 'Error al cargar los clientes'}
                </Typography>
            ) : clients.length === 0 ? (
                <Typography variant="h5" color="text.secondary" sx={{ mt: 4, fontWeight: 600, letterSpacing: 0.5 }}>
                    No se encontraron clientes. ¡Crea uno nuevo!
                </Typography>
            ) : (
                <Box sx={{ mt: 2 }}>
                    {/* Contador de clientes solo en escritorio/tablet */}
                    
                    <ClientsListTable 
                        clients={clients} 
                        onEdit={handleNavigateEditClient}
                        onBuyNumbers={handleNavigateBuyNumbers}
                        onDelete={handleDeleteClient}
                        isDeleting={isDeleting}
                    />
                </Box>
            )}

            {clients.length > 0 && (
                <Box sx={{ mt: 6, display: 'flex', justifyContent: 'center' }}>
                    <Pagination
                        count={totalPages}
                        showFirstButton
                        showLastButton
                        color="primary"
                        onChange={handlePageChange}
                        page={page}
                        size="large"
                        sx={{ mx: 'auto' }}
                    />
                </Box>
            )}
        </Box>
    );
}

export default ClientView;
