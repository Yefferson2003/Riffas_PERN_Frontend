import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import { Button, CircularProgress, Pagination, TextField, Typography, Box, Fade, Tooltip } from "@mui/material";
import SyncIcon from '@mui/icons-material/Sync';
import { getClients } from "../../api/clientApi";
import CreateClientModal from "../../components/clients/modal/CreateClientModal";
import EditClientModal from "../../components/clients/modal/EditClientModal";
import ClientsListTable from "../../components/clients/ClientsListTable";
import { ClientType } from "../../types";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import BuyNumbersForClientModal from "../../components/clients/modal/BuyNumbersForClientModal";



function ClientView () {
    const location = useLocation();

    const navigate = useNavigate();

    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [page, setPage] = useState(1);
    const limit = 15;

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearch(search);
        }, 1500);
        return () => clearTimeout(handler);
    }, [search]);

    const {
        data,
        isLoading,
        isError,
        error,
        refetch
    } = useQuery({
        queryKey: ["clients", { page, limit, search: debouncedSearch }],
        queryFn: () => getClients({ page, limit, search: debouncedSearch }),
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


    useEffect(() => {
        if (location.state?.showSuccess) {
            toast.success(location.state.message || 'Números procesados con éxito');
            // Limpiar el estado para evitar mostrar el toast en cada render
            window.history.replaceState({}, document.title, location.pathname + location.search);
        }
    }, [location.state, location.pathname, location.search]);

    return (
        <Box sx={{ width: '100%', pb: 8, px: { xs: 1, md: 4 }, textAlign: 'center' }}>
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', lg: 'row' }, alignItems: 'center', justifyContent: 'space-between', mb: 6, gap: 3 }}>
                <TextField
                    id="search"
                    label="Buscar cliente..."
                    variant="outlined"
                    size="small"
                    value={search}
                    onChange={handleSearchChange}
                    sx={{ width: { xs: '100%', sm: 300 } }}
                />
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
                        <Button
                            variant="outlined"
                            color="info"
                            sx={{ borderRadius: 2, minWidth: 48, px: 2, boxShadow: 1, transition: 'transform 0.2s', '&:hover': { transform: 'rotate(-10deg) scale(1.08)', bgcolor: '#e3f2fd' } }}
                            onClick={handleRefetch}
                            startIcon={<SyncIcon sx={{ animation: isLoading ? 'spin 1s linear infinite' : 'none' }} />}
                            disabled={isLoading}
                        >
                            <span style={{ display: 'none' }}>Actualizar</span>
                        </Button>
                    </Tooltip>
                </Box>
            </Box>
            <style>{`
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            `}</style>

            <ToastContainer position="top-right" autoClose={2500} hideProgressBar={false} newestOnTop closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover />

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
