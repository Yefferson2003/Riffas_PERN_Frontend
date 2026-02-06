import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Accordion, AccordionDetails, AccordionSummary, Alert, Box, Button, Card, CardContent, CardActions, CircularProgress, Divider, FormControl, IconButton, InputLabel, MenuItem, Modal, Paper, Select, TextField, Typography, Grid, Table, TableHead, TableBody, TableRow, TableCell, TableContainer } from "@mui/material";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { createMoneda, createUserTasa, deleteMoneda, getAllMonedas, getAllUserTasas, deleteUserTasa, updateUserTasa } from '../../api/tasasApi';
import { User } from "../../types";
import { MonedaType, TasaType } from "../../types/tasas";
import { formatCurrencyCOP } from '../../utils';

interface TasasModalProps {
    open: boolean;
    onClose: () => void;
    rol: User['rol']["name"]
}

function TasasModal({ open, onClose, rol }: TasasModalProps) {
    // Estado y handlers para edición inline de tasa
    const [editTasaId, setEditTasaId] = useState<number | null>(null);
    const [editTasaValue, setEditTasaValue] = useState<string>('');

    const { mutate: mutateUpdateTasa, isPending: isUpdatingTasa } = useMutation({
        mutationFn: updateUserTasa,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tasas'] });
            setEditTasaId(null);
            setEditTasaValue('');
            toast.success('Tasa actualizada correctamente');
        },
        onError(error) {
            toast.error(error.message || 'Error al actualizar tasa');
        },
    });

    function handleEditTasa(tasaId: TasaType['id']) {
        const tasa = tasas?.tasas?.find(t => t.id === tasaId);
        if (tasa) {
            setEditTasaId(tasa.id);
            setEditTasaValue(String(tasa.value));
        }
    }
    function handleSaveEditTasa(tasaId: TasaType['id']) {
        if (!editTasaValue || isNaN(Number(editTasaValue)) || Number(editTasaValue) <= 0) {
            toast.error('El valor debe ser mayor a 0');
            return;
        }
        mutateUpdateTasa({ tasaId: tasaId, formDataTasa: { value: Number(editTasaValue) } });
    }
    function handleCancelEditTasa() {
        setEditTasaId(null);
        setEditTasaValue('');
    }
    

    const initialValuesMoneda : Omit<MonedaType, 'id'> = {
        name: '',
        symbol: '',
    }

    // Formulario para crear moneda
    const { register, handleSubmit, reset, formState: { errors } } = useForm({
        defaultValues: initialValuesMoneda
    });

    // Formulario para crear tasa
    const initialValuesTasa: Omit<TasaType, 'id' | 'userResponsableId' | 'moneda'> = { 
        monedaId: 0, 
        value: 0,
    };
    const { register: registerTasa, handleSubmit: handleSubmitTasa, reset: resetTasa, formState: { errors: errorsTasa } } = useForm({
        defaultValues: initialValuesTasa
    });
    const [selectedMoneda, setSelectedMoneda] = useState('');

    // Query para obtener monedas
    const queryClient = useQueryClient();
    const { data: monedas, isLoading } = useQuery({
        queryKey: ['monedas'],
        queryFn: getAllMonedas,
        enabled: open
    });

    // Query para obtener tasas
    const { data: tasas, isLoading: isLoadingTasas } = useQuery({
        queryKey: ['tasas'],
        queryFn: getAllUserTasas,
        enabled: open
    });

    // Mutación para eliminar tasa
    const { mutate: mutateDeleteTasa, isPending: isDeletingTasa } = useMutation({
        mutationFn: deleteUserTasa,
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['tasas'] });
            toast.success(data || 'Tasa eliminada correctamente');
        }
    });

    // Mutación para crear tasa
    const { mutate: mutateCreateTasa, isPending: isCreatingTasa } = useMutation({
        mutationFn: createUserTasa,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tasas'] });
            resetTasa();
            setSelectedMoneda('');
            toast.success('Tasa creada correctamente');
        },
        onError(error) {
            toast.error(error.message || 'Error al crear tasa');
        },
    });

    const { mutate: mutateCreateMoneda, isPending: isCreating } = useMutation({
        mutationFn: createMoneda,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['monedas'] });
            reset();
        },
        onError(error) {
            toast.error(error.message || 'Error al crear moneda');
        },
    });

    // Mutación para eliminar moneda
    const { mutate: mutateDeleteMoneda, isPending: isDeleting } = useMutation({
        mutationFn: deleteMoneda,
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['monedas'] });
            toast.success(data || 'Moneda eliminada correctamente');
        }
    });

    const onSubmit = (data: Omit<MonedaType, 'id'>) => {
        mutateCreateMoneda({ formDataMoneda: data });
    };

    const onSubmitTasa = (data: Omit<TasaType, 'id' | 'userResponsableId' | 'moneda'>) => {
        if (!data.monedaId) {
            toast.error('Selecciona una moneda');
            return;
        }
        mutateCreateTasa({ monedaId: Number(data.monedaId), formDataTasa: { value: Number(data.value) } });
    };

    if (rol === 'vendedor') return null;

    return (
        <Modal
        open={open}
        onClose={() => (
            onClose(),
            reset()
        )}
        aria-labelledby="tasas-modal-title"
        aria-describedby="tasas-modal-description"
        >
        <Box sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: { xs: '98vw', sm: 400, md: 650 },
            maxWidth: '98vw',
            bgcolor: '#f1f5f9',
            border: '2px solid #000',
            boxShadow: 24,
            p: { xs: 1, sm: 2, md: 4 },
            maxHeight: { xs: '98vh', md: '90vh' },
            overflowY: 'auto',
        }}>
            <h2 id="tasas-modal-title" className="mb-4 text-xl font-bold text-center text-azul">Tasas de moneda y cambio</h2>

            { rol === 'admin' && (
                <>
                    <Divider sx={{ my: 3 }} />
                    <Accordion sx={{ mb: 2 }}>
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                            <Typography variant="h6" color="primary">Monedas</Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                            <Alert severity="info" sx={{ mb: 2 }}>
                                Aquí puedes crear y eliminar monedas. Las monedas creadas estarán disponibles para asociar tasas. Una moneda es, por ejemplo, "Bolívar" con símbolo "VES".
                            </Alert>
                            {/* Formulario para agregar moneda */}
                            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-2 mb-4">
                                <TextField
                                    label="Nombre"
                                    {...register('name', { required: 'El nombre es requerido' })}
                                    error={!!errors.name}
                                    helperText={errors.name?.message}
                                    size="small"
                                />
                                <TextField
                                    label="Símbolo"
                                    {...register('symbol', { required: 'El símbolo es requerido' })}
                                    error={!!errors.symbol}
                                    helperText={errors.symbol?.message}
                                    size="small"
                                />
                                <Button type="submit" variant="contained" color="primary" disabled={isCreating}>
                                    {isCreating ? 'Agregando...' : 'Agregar Moneda'}
                                </Button>
                            </form>
                            {/* Tabla de monedas */}
                            {isLoading ? <CircularProgress size={24} /> : (
                                <TableContainer component={Paper} sx={{ maxHeight: { xs: 180, sm: 220, md: 260 } }}>
                                    <Table size="small" stickyHeader>
                                        <TableHead>
                                            <TableRow>
                                                <TableCell>Nombre</TableCell>
                                                <TableCell sx={{ textAlign: 'center' }}>Símbolo</TableCell>
                                                <TableCell sx={{ textAlign: 'center' }}>Opciones</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {monedas && monedas.map((moneda: MonedaType) => (
                                                <TableRow key={moneda.id}>
                                                    <TableCell >{moneda.name}</TableCell>
                                                    <TableCell sx={{ textAlign: 'center' }}>{moneda.symbol}</TableCell>
                                                    <TableCell sx={{ textAlign: 'center' }}>
                                                        <IconButton color="error" size="small" onClick={() => mutateDeleteMoneda({ monedaId: moneda.id })} disabled={isDeleting}>
                                                            <DeleteIcon />
                                                        </IconButton>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            )}
                        </AccordionDetails>
                    </Accordion>

                    
                </>
            )}

            {/* Sección Tasas */}
            <Paper elevation={2} sx={{ p: 2, bgcolor: '#fff', mb: 2 }}>
                <Typography variant="h6" color="primary" gutterBottom>
                    Tasas
                </Typography>
                <Accordion sx={{ mb: 2 }}>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography variant="subtitle1">Agregar nueva tasa</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                        <Alert severity="info" sx={{ mb: 2 }}>
                            El valor de la tasa es el equivalente de la moneda seleccionada a un dólar estadounidense (USD). Ejemplo: si 1 USD = 36.5 VES, entonces el valor es 36.5
                        </Alert>
                        {/* Formulario para agregar tasa */}
                        <form onSubmit={handleSubmitTasa(onSubmitTasa)} className="flex flex-col gap-2 mb-4">
                            <FormControl size="small" fullWidth error={!!errorsTasa.monedaId}>
                                <InputLabel id="moneda-select-label">Moneda</InputLabel>
                                <Select
                                    labelId="moneda-select-label"
                                    label="Moneda"
                                    {...registerTasa('monedaId', { required: 'Selecciona una moneda' })}
                                    value={selectedMoneda}
                                    onChange={e => {
                                        setSelectedMoneda(e.target.value);
                                    }}
                                >
                                    <MenuItem value=""><em>Selecciona una moneda</em></MenuItem>
                                    {monedas && monedas.map((moneda: MonedaType) => (
                                        <MenuItem key={moneda.id} value={moneda.id}>{moneda.name} ({moneda.symbol})</MenuItem>
                                    ))}
                                </Select>
                                {errorsTasa.monedaId && <Typography color="error" variant="caption">{errorsTasa.monedaId.message as string}</Typography>}
                            </FormControl>
                            <TextField
                                label="Valor de la tasa"
                                type="number"
                                inputProps={{ min: 0.01, step: 'any' }}
                                {...registerTasa('value', {
                                    required: 'El valor es requerido',
                                    min: {
                                        value: 0.01,
                                        message: 'El valor debe ser mayor a 0'
                                    },
                                    validate: value => parseFloat(String(value)) > 0 || 'El valor debe ser mayor a 0'
                                })}
                                error={!!errorsTasa.value}
                                helperText={errorsTasa.value?.message}
                                size="small"
                            />
                            <Button type="submit" variant="contained" color="primary" disabled={isCreatingTasa}>
                                {isCreatingTasa ? 'Agregando...' : 'Agregar Tasa'}
                            </Button>
                        </form>
                    </AccordionDetails>
                </Accordion>
                {/* Cards de tasas */}
                <Typography variant="subtitle1" sx={{ mt: 2, mb: 1 }}>
                    Tasas registradas
                </Typography>
                {isLoadingTasas ? (
                    <div className='mx-auto text-center'>
                        <CircularProgress size={24} />
                    </div>
                ) : (
                    <Grid container spacing={2}>
                        {tasas && tasas.tasas.length === 0 && (
                            <Grid item xs={12}>
                                <Alert severity="info">No hay tasas registradas.</Alert>
                            </Grid>
                        )}
                        {tasas && tasas.tasas.map((tasa) => (
                            <Grid item xs={12} key={tasa.id}>
                                <Card variant="outlined" sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                                    <CardContent>
                                        <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                                            {tasa.moneda.name} <span style={{ color: '#888' }}>({tasa.moneda.symbol})</span>
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            Valor (1 USD):
                                        </Typography>
                                        {editTasaId === tasa.id ? (
                                            <TextField
                                                value={editTasaValue}
                                                onChange={e => setEditTasaValue(e.target.value)}
                                                type="number"
                                                size="small"
                                                inputProps={{ min: 0.01, step: 'any' }}
                                                sx={{ width: 110, mt: 1 }}
                                                autoFocus
                                                disabled={isUpdatingTasa}
                                            />
                                        ) : (
                                            <Typography variant="h6" sx={{ mt: 1 }}>
                                                {formatCurrencyCOP(Number(tasa.value))}
                                            </Typography>
                                        )}
                                    </CardContent>
                                    <CardActions sx={{ justifyContent: 'flex-end', gap: 1, pb: 2 }}>
                                        {editTasaId === tasa.id ? (
                                            <>
                                                <Button size="small" color="success" variant="contained" onClick={() => handleSaveEditTasa(tasa.id)} disabled={isUpdatingTasa}>
                                                    Guardar
                                                </Button>
                                                <Button size="small" color="inherit" variant="outlined" onClick={handleCancelEditTasa} disabled={isUpdatingTasa}>
                                                    Cancelar
                                                </Button>
                                            </>
                                        ) : (
                                            <>
                                                <IconButton color="primary" size="small" onClick={() => handleEditTasa(tasa.id)}>
                                                    <EditIcon />
                                                </IconButton>
                                                <IconButton color="error" size="small" onClick={() => mutateDeleteTasa({ tasaId: tasa.id })} disabled={isDeletingTasa}>
                                                    <DeleteIcon />
                                                </IconButton>
                                            </>
                                        )}
                                    </CardActions>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                )}
            </Paper>
        </Box>
        </Modal>
    );
}

export default TasasModal;
