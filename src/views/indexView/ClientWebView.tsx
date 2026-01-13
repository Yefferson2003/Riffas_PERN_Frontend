
import { Box, CircularProgress, Fade, FormControl, InputLabel, MenuItem, Pagination, Select, SelectChangeEvent, TextField, Typography } from "@mui/material";
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { useQuery } from "@tanstack/react-query";
import { Dayjs } from 'dayjs';
import { useEffect, useState } from "react";
import { getClientsSharedLinkAll } from "../../api/clientApi";
import ClientsSharedLinkTable from "../../components/clients/ClientsSharedLinkTable";
import { StatusRaffleNumbersType } from '../../types';

function ClientWebView() {
    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [page, setPage] = useState(1);
    const [startDate, setStartDate] = useState<Dayjs | null>(null);
    const [endDate, setEndDate] = useState<Dayjs | null>(null);
    const [filter, setFilter] = useState<StatusRaffleNumbersType | string>(''); // '' para todos
    const limit = 10;

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearch(search);
        }, 1000);
        return () => clearTimeout(handler);
    }, [search]);

    const {
        data,
        isLoading,
        isError,
        error,
        refetch
    } = useQuery({
        queryKey: ["clients-shared-link", { page, limit, search: debouncedSearch, filter, startDate: startDate?.format('YYYY-MM-DD'), endDate: endDate?.format('YYYY-MM-DD') }],
        queryFn: () => getClientsSharedLinkAll({
            page,
            limit,
            search: debouncedSearch,
            filter: filter ? filter : '',
            startDate: startDate?.format('YYYY-MM-DD'),
            endDate: endDate?.format('YYYY-MM-DD')
        }),
    });
    const handleFilterChange = (event: SelectChangeEvent<string>) => {
        setFilter(event.target.value);
        setPage(1);
    };

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearch(e.target.value);
        setPage(1);
    };

    const handlePageChange = (_event: React.ChangeEvent<unknown>, newPage: number) => {
        setPage(newPage);
    };

    const handleRefetch = () => {
        refetch();
    };

    const totalPages = data?.totalPages || 1;

    return (
        <Box sx={{ width: '100%', pb: 8, px: { xs: 1, md: 4 }, textAlign: 'center' }}>
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', lg: 'row' }, alignItems: 'center', justifyContent: 'space-between', mb: 6, gap: 3 }}>
                <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2, alignItems: { xs: 'stretch', md: 'center' }, width: '100%' }}>
                    <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2, width: '100%' }}>
                        <TextField
                            id="search"
                            label="Buscar cliente..."
                            variant="outlined"
                            size="small"
                            value={search}
                            onChange={handleSearchChange}
                            sx={{ width: { xs: '100%', md: 300 } }}
                        />
                        <FormControl size="small" sx={{ minWidth: { xs: '100%', md: 180 } }}>
                            <InputLabel id="status-filter-label">Estado</InputLabel>
                            <Select
                                labelId="status-filter-label"
                                id="status-filter"
                                value={filter}
                                label="Estado"
                                onChange={handleFilterChange}
                            >
                                <MenuItem value="">Todos</MenuItem>
                                <MenuItem value="apartado">Por confirmar (apartado)</MenuItem>
                            </Select>
                        </FormControl>
                    </Box>
                    <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2, width: { xs: '100%', md: 'auto' }, mt: { xs: 2, md: 0 } }}>
                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                            <DatePicker
                                label="Fecha inicial"
                                value={startDate}
                                onChange={(newValue) => {
                                    setStartDate(newValue);
                                    if (!newValue) setEndDate(null);
                                }}
                                slotProps={{ textField: { size: 'small', sx: { minWidth: { xs: '100%', md: 130 } } } }}
                                maxDate={endDate || undefined}
                            />
                            <DatePicker
                                label="Fecha final"
                                value={endDate}
                                onChange={setEndDate}
                                slotProps={{ textField: { size: 'small', sx: { minWidth: { xs: '100%', md: 130 } } } }}
                                minDate={startDate || undefined}
                                disabled={!startDate}
                            />
                        </LocalizationProvider>
                    </Box>
                </Box>
            </Box>

            <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'primary.main', fontSize: 18, letterSpacing: 0.5 }}>
                    Total de registros: {data?.total || 0}
                </Typography>
            </Box>

            {isLoading ? (
                <Fade in={isLoading} unmountOnExit>
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 180 }}>
                        <CircularProgress size={48} color="primary" />
                    </Box>
                </Fade>
            ) : isError ? (
                <Typography color="error" variant="h6" sx={{ mt: 4 }}>
                    {error instanceof Error ? error.message : 'Error al cargar los datos'}
                </Typography>
            ) : (
                <Box sx={{ mt: 2, textAlign: 'left' }}>
                    <ClientsSharedLinkTable
                        clients={data?.clients || []}
                        onRefetch={handleRefetch}
                    />
                </Box>
            )}

            {(data?.totalPages ?? 0) > 1 && (
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

export default ClientWebView;
