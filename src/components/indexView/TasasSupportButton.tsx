import CloseIcon from '@mui/icons-material/Close';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import { Box, Card, CardContent, Fab, IconButton, Paper, Slide, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { getAllUserTasas } from '../../api/tasasApi';


// Recibe el color de la rifa como prop
interface TasasSupportButtonProps {
    raffleColor?: string;
}

const getFabStyle = (color: string) => ({
    position: 'fixed',
    bottom: 24,
    right: 24,
    zIndex: 2000,
    backgroundColor: color,
    color: '#fff',
    '&:hover': {
        backgroundColor: color,
        opacity: 0.9,
    },
});

const getCardStyle = (color: string) => ({
    position: 'fixed',
    bottom: 90,
    right: 24,
    zIndex: 2100,
    minWidth: 320,
    maxWidth: 360,
    boxShadow: 6,
    borderTop: `4px solid ${color}`,
});

const DEFAULT_COLOR = '#1976d2';

const TasasSupportButton: React.FC<TasasSupportButtonProps> = ({ raffleColor }) => {
    const [open, setOpen] = useState(false);
    const { data, isLoading, isError } = useQuery({
        queryKey: ['tasas', 'support'],
        queryFn: getAllUserTasas,
    });

    const tasas = data?.tasas || [];
    const color = raffleColor || DEFAULT_COLOR;

    return (
        <>
            <Fab aria-label="tasas" sx={getFabStyle(color)} onClick={() => setOpen((v) => !v)}>
                <AttachMoneyIcon />
            </Fab>
            <Slide direction="up" in={open} mountOnEnter unmountOnExit>
                <Box sx={getCardStyle(color)}>
                    <Card>
                        <CardContent>
                            <Box display="flex" alignItems="center" justifyContent="space-between">
                                <Typography variant="h6" sx={{ color }}>Tasas de Apoyo</Typography>
                                <IconButton size="small" onClick={() => setOpen(false)}>
                                    <CloseIcon />
                                </IconButton>
                            </Box>
                            <Typography variant="body2" color="text.secondary" mb={1}>
                                Consulta aquí las tasas de referencia para pagos. Solo lectura.
                            </Typography>
                            <TableContainer component={Paper} variant="outlined">
                                <Table size="small">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Moneda</TableCell>
                                            <TableCell align="right">Tasa (por 1 USD)</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {isLoading ? (
                                            <TableRow>
                                                <TableCell colSpan={2}>Cargando...</TableCell>
                                            </TableRow>
                                        ) : isError ? (
                                            <TableRow>
                                                <TableCell colSpan={2} style={{ color: 'red' }}>Error al cargar tasas</TableCell>
                                            </TableRow>
                                        ) : tasas.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={2}>No hay tasas disponibles</TableCell>
                                            </TableRow>
                                        ) : (
                                            tasas.map((tasa) => (
                                                <TableRow key={tasa.id}>
                                                    <TableCell>{tasa.moneda?.name || 'Moneda'}</TableCell>
                                                    <TableCell align="right">{tasa.value}</TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </CardContent>
                    </Card>
                </Box>
            </Slide>
        </>
    );
};

export default TasasSupportButton;
