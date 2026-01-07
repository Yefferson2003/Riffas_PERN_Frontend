import SyncIcon from '@mui/icons-material/Sync';
import DownloadIcon from '@mui/icons-material/Download';
import IconButton from '@mui/material/IconButton';
import { exportClientsToExcel } from '../../utils/exportClientsExcel';
import { Box, Button, CircularProgress, Fade, Pagination, TextField, Tooltip, Typography, MenuItem, Select, InputLabel, FormControl, SelectChangeEvent } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getClients } from "../../api/clientApi";
import ClientsListTable from "../../components/clients/ClientsListTable";
import BuyNumbersForClientModal from "../../components/clients/modal/BuyNumbersForClientModal";
import CreateClientModal from "../../components/clients/modal/CreateClientModal";
import EditClientModal from "../../components/clients/modal/EditClientModal";
import { ClientType } from "../../types";



function ClientView () {
    const navigate = useNavigate();

    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [page, setPage] = useState(1);
    const [order, setOrder] = useState(3); // 1: Alfa ASC, 2: Alfa DESC, 3: Fecha ASC, 4: Fecha DESC
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
        queryKey: ["clients", { page, limit, search: debouncedSearch, order }],
        queryFn: () => getClients({ page, limit, search: debouncedSearch, order }),
    });

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearch(e.target.value);
        setPage(1);
    };

    const handlePageChange = (_event: React.ChangeEvent<unknown>, newPage: number) => {
        setPage(newPage);
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

    return (
        <Box sx={{ width: '100%', pb: 8, px: { xs: 1, md: 4 }, textAlign: 'center' }}>
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', lg: 'row' }, alignItems: 'center', justifyContent: 'space-between', mb: 6, gap: 3 }}>
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                    <TextField
                        id="search"
                        label="Buscar cliente..."
                        variant="outlined"
                        size="small"
                        value={search}
                        onChange={handleSearchChange}
                        sx={{ width: { xs: '100%', sm: 300 } }}
                    />
                    <FormControl size="small" sx={{ minWidth: 180 }}>
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
                            onClick={exportClientsToExcel}
                        >
                            <DownloadIcon sx={{ fontSize: 28 }} />
                        </IconButton>
                    </Tooltip>
                </Box>
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
                    <ClientsListTable 
                        clients={clients} 
                        onEdit={handleNavigateEditClient}
                        onBuyNumbers={handleNavigateBuyNumbers}
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
