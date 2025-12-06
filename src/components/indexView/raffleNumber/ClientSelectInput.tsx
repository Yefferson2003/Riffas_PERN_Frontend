import { Box, FormControl, InputLabel, MenuItem, Select, Typography, Alert, TextField, Pagination, Stack, CircularProgress } from '@mui/material';
import React, { useState, useEffect, useCallback } from 'react';
import debounce from 'lodash.debounce';
import { ClientSelectType, RaffleNumber } from '../../../types';


type ClientSelectInputProps = {
    raffleNumberStatus: RaffleNumber['status'];
    clientSelectInput?: ClientSelectType;
    selectedClientId: number | "";
    setSelectedClientId: React.Dispatch<React.SetStateAction<number | "">>;
    clientSearch: string;
    setClientSearch: (value: string) => void;
    clientPage: number;
    setClientPage: (value: number) => void;
    isLoadingClients?: boolean;
}


function ClientSelectInput({
    raffleNumberStatus,
    clientSelectInput,
    selectedClientId,
    setSelectedClientId,
    clientSearch,
    setClientSearch,
    clientPage,
    setClientPage,
    isLoadingClients = false,
}: ClientSelectInputProps) {
    // Estado local para el input de búsqueda
    const [searchInput, setSearchInput] = useState(clientSearch);

    // Debounce para búsqueda
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const debouncedSetClientSearch = useCallback(
        debounce((value: string) => {
            setClientSearch(value);
        }, 1500),
        [setClientSearch]
    );

    useEffect(() => {
        setSearchInput(clientSearch);
    }, [clientSearch]);

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchInput(e.target.value);
        debouncedSetClientSearch(e.target.value);
    };

    const handlePageChange = (_event: React.ChangeEvent<unknown>, value: number) => {
        setClientPage(value);
    };


    // Mostrar loader si está cargando, aunque no haya datos aún
    if (raffleNumberStatus !== 'available') return null;
    if (!clientSelectInput && isLoadingClients) {
        return (
            <Box sx={{ mb: 2, px: 2 }}>
                <Stack spacing={1}>
                    <TextField
                        size="small"
                        label="Buscar cliente"
                        value={searchInput}
                        onChange={handleSearchChange}
                        placeholder="Nombre, apellido o teléfono"
                        fullWidth
                        disabled={isLoadingClients}
                    />
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 2 }}>
                        <CircularProgress size={28} />
                    </Box>
                </Stack>
            </Box>
        );
    }
    if (!clientSelectInput) return null;

    return (
        <Box sx={{ mb: 2, px: 2 }}>
            <Stack spacing={1}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <TextField
                        size="small"
                        label="Buscar cliente"
                        value={searchInput}
                        onChange={handleSearchChange}
                        placeholder="Nombre, apellido o teléfono"
                        fullWidth
                        disabled={isLoadingClients}
                        sx={{ flex: 1 }}
                    />
                    {clientSelectInput.totalPages > 1 && (
                        <Pagination
                            count={clientSelectInput.totalPages}
                            page={clientPage}
                            onChange={handlePageChange}
                            color="primary"
                            size="small"
                            sx={{ minWidth: 0 }}
                            disabled={isLoadingClients}
                        />
                    )}
                </Box>
                <FormControl fullWidth size="small">
                    <InputLabel id="select-client-label">Seleccionar Cliente (opcional)</InputLabel>
                    <Select
                        labelId="select-client-label"
                        value={selectedClientId === '' ? '' : selectedClientId}
                        label="Seleccionar Cliente (opcional)"
                        onChange={e => setSelectedClientId(Number(e.target.value))}
                        renderValue={value => {
                            if (value === 0 || value === undefined) return 'Elegir cliente...';
                            const client = clientSelectInput.clients.find(c => c.id === value);
                            return client ? `${client.firstName || ''} ${client.lastName || ''} (${client.phone || 'Sin teléfono'})` : '';
                        }}
                        disabled={isLoadingClients}
                        displayEmpty
                    >
                        {clientSelectInput.clients.length === 0 ? (
                            <MenuItem disabled value="no-clients">
                                <em>No hay clientes</em>
                            </MenuItem>
                        ) : (
                            clientSelectInput.clients.map(client => (
                                <MenuItem key={client.id} value={client.id}>
                                    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                                        <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                                            {client.firstName || ''} {client.lastName || ''}
                                        </Typography>
                                        <Typography variant="body2" sx={{ color: '#64748b' }}>
                                            {client.phone || 'Sin teléfono'}
                                        </Typography>
                                    </Box>
                                </MenuItem>
                            ))
                        )}
                    </Select>
                </FormControl>
                {isLoadingClients && (
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 1 }}>
                        <CircularProgress size={28} />
                    </Box>
                )}
                <Alert severity="info" sx={{ fontSize: '0.95em' }}>
                    Puedes buscar y seleccionar un cliente previamente registrado para autocompletar los datos. Si no lo encuentras, puedes llenar los campos manualmente.
                </Alert>
                {/* La paginación ahora está junto al input de búsqueda */}
            </Stack>
        </Box>
    );
}

export default ClientSelectInput;
