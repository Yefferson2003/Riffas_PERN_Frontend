import CloseIcon from '@mui/icons-material/Close';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import { Box, Card, CardContent, Fab, IconButton, Paper, Slide, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { getAllUserTasasSharedUrl } from '../../api/tasasApi';

interface TasasSupportSharedButtonProps {
    raffleId: number;
    raffleColor?: string;
    bottom?: number | string;
    right?: number | string;
}

const getFabStyle = (color: string, bottom: number | string, left: number | string) => ({
    position: 'fixed',
    bottom,
    left,
    zIndex: 2000,
    backgroundColor: color,
    color: '#fff',
    boxShadow: '0 4px 16px rgba(0,0,0,0.18)', // sombra gris estándar
    animation: 'tasas-pulse 2s infinite',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    '&:hover': {
        backgroundColor: color,
        opacity: 0.9,
        transform: 'scale(1.1)',
        boxShadow: '0 8px 24px rgba(0,0,0,0.22)',
    },
});

const getCardStyle = (color: string, bottom: number | string, left: number | string) => ({
    position: 'fixed',
    bottom: typeof bottom === 'number' ? bottom + 66 : `calc(${bottom} + 66px)`,
    left,
    zIndex: 2100,
    minWidth: 320,
    maxWidth: 360,
    boxShadow: 6,
    borderTop: `4px solid ${color}`,
});

const DEFAULT_COLOR = '#1976d2';

const TasasSupportSharedButton: React.FC<TasasSupportSharedButtonProps> = ({ raffleId, raffleColor, bottom = 10 }) => {
    // Usar left en vez de right para el lado contrario
    const left = 24;
    const [open, setOpen] = useState(false);
    const color = raffleColor || DEFAULT_COLOR;
    const { data, isLoading, isError } = useQuery({
        queryKey: ['tasasShared', raffleId],
        queryFn: () => getAllUserTasasSharedUrl({ raffleId }),
        enabled: !!raffleId,
    });

    const tasas = data?.tasas || [];

    // No mostrar el botón si no hay tasas y no está cargando
    if (!isLoading && !isError && (!tasas || tasas.length === 0)) return null;

    return (
        <>
            <style>{`
                @keyframes tasas-pulse {
                    0% { box-shadow: 0 4px 16px rgba(0,0,0,0.18); }
                    50% { box-shadow: 0 8px 24px rgba(0,0,0,0.22); }
                    100% { box-shadow: 0 4px 16px rgba(0,0,0,0.18); }
                }
            `}</style>
            <Fab aria-label="tasas" sx={getFabStyle(color, bottom, left)} onClick={() => setOpen((v) => !v)}>
                <AttachMoneyIcon />
            </Fab>
            <Slide direction="up" in={open} mountOnEnter unmountOnExit>
                <Box sx={getCardStyle(color, bottom, left)}>
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

export default TasasSupportSharedButton;
