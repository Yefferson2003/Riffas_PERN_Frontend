import { Box, Typography, Tooltip } from '@mui/material';

interface RaffleProgressBarProps {
    numbersByStatus?: {
        available: number;
        sold: number;
        pending: number;
        apartado: number;
    };
    totalNumbers: number;
    variant?: 'default' | 'shared'; // Nueva prop para cambiar el estilo
}

function RaffleProgressBar({ numbersByStatus, totalNumbers, variant = 'default' }: RaffleProgressBarProps) {
    if (!numbersByStatus || totalNumbers === 0) return null;

    const { available, sold, pending, apartado } = numbersByStatus;

    // Para la versión shared, combinamos todos los valores excepto disponibles
    const isSharedVersion = variant === 'shared';
    
    if (isSharedVersion) {
        // En shared: combinamos sold + pending + apartado vs available
        const combined = sold + pending + apartado;
        const combinedPercentage = (combined / totalNumbers) * 100;
        // const availablePercentage = (available / totalNumbers) * 100;

        return (
            <Box sx={{ 
                width: '100%', 
                maxWidth: '100%',
                mx: 'auto', 
                p: { xs: 2, sm: 3 },
                bg: 'white',
                borderRadius: 2,
                boxShadow: '0 2px 4px -1px rgb(0 0 0 / 0.1)'
            }}>
                {/* Título para versión shared */}
                <Typography variant="h6" sx={{ 
                    textAlign: 'center', 
                    mb: { xs: 1.5, sm: 2 }, 
                    color: '#1446A0',
                    fontWeight: 'bold',
                    fontSize: { xs: '1.1rem', sm: '1.25rem' }
                }}>
                    Progreso de Rifa
                </Typography>

                {/* Barra de progreso simplificada */}
                <Box sx={{ position: 'relative', mb: { xs: 2, sm: 2.5 } }}>
                    <Box sx={{
                        width: '100%',
                        height: { xs: 12, sm: 14, md: 16 },
                        borderRadius: { xs: 6, sm: 7, md: 8 },
                        backgroundColor: '#f3f4f6',
                        position: 'relative',
                        overflow: 'hidden'
                    }}>
                        {/* Progreso combinado */}
                        {combined > 0 && (
                            <Box sx={{
                                position: 'absolute',
                                left: 0,
                                top: 0,
                                width: `${combinedPercentage}%`,
                                height: '100%',
                                backgroundColor: 'linear-gradient(45deg, #10b981 30%, #059669 90%)', // Gradiente verde
                                background: 'linear-gradient(45deg, #10b981 30%, #059669 90%)',
                                borderRadius: combinedPercentage === 100 ? { xs: 6, sm: 7, md: 8 } : { xs: '6px 0 0 6px', sm: '7px 0 0 7px', md: '8px 0 0 8px' },
                                transition: 'width 0.5s ease-in-out'
                            }} />
                        )}
                    </Box>

                    {/* Porcentaje */}
                    <Typography variant="body2" sx={{ 
                        textAlign: 'center', 
                        mt: { xs: 0.75, sm: 1 }, 
                        fontWeight: 'bold',
                        color: '#374151',
                        fontSize: { xs: '0.85rem', sm: '0.95rem' }
                    }}>
                        {combinedPercentage.toFixed(1)}% Vendidos
                    </Typography>
                </Box>

                {/* Estadísticas simplificadas
                <Box sx={{ 
                    display: 'grid', 
                    gridTemplateColumns: { xs: '1fr 1fr', sm: '1fr 1fr' }, 
                    gap: { xs: 3, sm: 4 },
                    textAlign: 'center'
                }}>
                    <Box sx={{
                        p: { xs: 1.5, sm: 2 },
                        borderRadius: 2,
                        bgcolor: 'rgba(16, 185, 129, 0.05)',
                        border: '1px solid rgba(16, 185, 129, 0.2)'
                    }}>
                        <Box sx={{ 
                            width: { xs: 12, sm: 14 }, 
                            height: { xs: 12, sm: 14 }, 
                            backgroundColor: '#10b981', 
                            borderRadius: '50%', 
                            mx: 'auto', 
                            mb: { xs: 0.75, sm: 1 }
                        }} />
                        <Typography variant="caption" sx={{ 
                            fontWeight: 'bold', 
                            color: '#059669',
                            fontSize: { xs: '0.75rem', sm: '0.85rem' },
                            display: 'block'
                        }}>
                            Vendidos
                        </Typography>
                        <Typography variant="h5" sx={{ 
                            color: '#374151',
                            fontSize: { xs: '1.2rem', sm: '1.4rem' },
                            fontWeight: 'bold',
                            mt: 0.5
                        }}>
                            {combined}
                        </Typography>
                        <Typography variant="caption" sx={{ 
                            color: '#6b7280',
                            fontSize: { xs: '0.7rem', sm: '0.8rem' }
                        }}>
                            ({combinedPercentage.toFixed(1)}%)
                        </Typography>
                    </Box>

                    <Box sx={{
                        p: { xs: 1.5, sm: 2 },
                        borderRadius: 2,
                        bgcolor: 'rgba(107, 114, 128, 0.05)',
                        border: '1px solid rgba(107, 114, 128, 0.2)'
                    }}>
                        <Box sx={{ 
                            width: { xs: 12, sm: 14 }, 
                            height: { xs: 12, sm: 14 }, 
                            backgroundColor: '#f3f4f6', 
                            borderRadius: '50%', 
                            mx: 'auto', 
                            mb: { xs: 0.75, sm: 1 },
                            border: '2px solid #d1d5db'
                        }} />
                        <Typography variant="caption" sx={{ 
                            fontWeight: 'bold', 
                            color: '#6b7280',
                            fontSize: { xs: '0.75rem', sm: '0.85rem' },
                            display: 'block'
                        }}>
                            Disponibles
                        </Typography>
                        <Typography variant="h5" sx={{ 
                            color: '#374151',
                            fontSize: { xs: '1.2rem', sm: '1.4rem' },
                            fontWeight: 'bold',
                            mt: 0.5
                        }}>
                            {available}
                        </Typography>
                        <Typography variant="caption" sx={{ 
                            color: '#6b7280',
                            fontSize: { xs: '0.7rem', sm: '0.8rem' }
                        }}>
                            ({availablePercentage.toFixed(1)}%)
                        </Typography>
                    </Box>
                </Box> */}
            </Box>
        );
    }

    // Versión original para el dashboard normal
    // Calcular porcentajes
    const soldPercentage = (sold / totalNumbers) * 100;
    const pendingPercentage = (pending / totalNumbers) * 100;
    const apartadoPercentage = (apartado / totalNumbers) * 100;
    const availablePercentage = (available / totalNumbers) * 100;

    // Calcular progreso acumulativo para el efecto de barras apiladas
    const soldProgress = soldPercentage;
    const pendingProgress = soldPercentage + pendingPercentage;
    const apartadoProgress = soldPercentage + pendingPercentage + apartadoPercentage;

    return (
        <Box sx={{ 
            width: '100%', 
            maxWidth: '100%',
            mx: 'auto', 
            p: { xs: 2, sm: 2, md: 3 },
            bg: 'white',
            borderRadius: 2,
            boxShadow: '0 2px 4px -1px rgb(0 0 0 / 0.1)'
        }}>
            {/* Título */}
            <Typography variant="h6" sx={{ 
                textAlign: 'center', 
                mb: { xs: 1.5, sm: 2 }, 
                color: '#1446A0',
                fontWeight: 'bold',
                fontSize: { xs: '1.1rem', sm: '1.25rem' }
            }}>
                Estado de la Rifa
            </Typography>

            {/* Barra de progreso compuesta */}
            <Box sx={{ position: 'relative', mb: { xs: 2, sm: 2.5 } }}>
                {/* Barra base (disponibles) */}
                <Box sx={{
                    width: '100%',
                    height: { xs: 8, sm: 10, md: 12 },
                    borderRadius: { xs: 4, sm: 5, md: 6 },
                    backgroundColor: '#f3f4f6', // Gris claro para disponibles
                    position: 'relative',
                    overflow: 'hidden'
                }}>
                    {/* Vendidos */}
                    {soldProgress > 0 && (
                        <Box sx={{
                            position: 'absolute',
                            left: 0,
                            top: 0,
                            width: `${soldProgress}%`,
                            height: '100%',
                            backgroundColor: '#10b981',
                            borderRadius: soldProgress === 100 ? { xs: 4, sm: 5, md: 6 } : { xs: '4px 0 0 4px', sm: '5px 0 0 5px', md: '6px 0 0 6px' }
                        }} />
                    )}
                    
                    {/* Pendientes */}
                    {pendingPercentage > 0 && (
                        <Box sx={{
                            position: 'absolute',
                            left: `${soldProgress}%`,
                            top: 0,
                            width: `${pendingPercentage}%`,
                            height: '100%',
                            backgroundColor: '#f59e0b'
                        }} />
                    )}
                    
                    {/* Apartados */}
                    {apartadoPercentage > 0 && (
                        <Box sx={{
                            position: 'absolute',
                            left: `${pendingProgress}%`,
                            top: 0,
                            width: `${apartadoPercentage}%`,
                            height: '100%',
                            backgroundColor: '#8b5cf6',
                            borderRadius: apartadoProgress === 100 ? { xs: 4, sm: 5, md: 6 } : { xs: '0 4px 4px 0', sm: '0 5px 5px 0', md: '0 6px 6px 0' }
                        }} />
                    )}
                </Box>

                {/* Porcentaje total vendido */}
                <Typography variant="body2" sx={{ 
                    textAlign: 'center', 
                    mt: { xs: 0.5, sm: 1 }, 
                    fontWeight: 'bold',
                    color: '#374151',
                    fontSize: { xs: '0.75rem', sm: '0.875rem' }
                }}>
                    {((sold + pending + apartado) / totalNumbers * 100).toFixed(1)}% Completado
                </Typography>
            </Box>

            {/* Leyenda con estadísticas - más compacta */}
            <Box sx={{ 
                display: 'grid', 
                gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(4, 1fr)' }, 
                gap: { xs: 1, sm: 1.5, md: 2 },
                textAlign: 'center'
            }}>
                <Tooltip title={`${sold} números vendidos`} arrow>
                    <Box>
                        <Box sx={{ 
                            width: { xs: 8, sm: 10, md: 12 }, 
                            height: { xs: 8, sm: 10, md: 12 }, 
                            backgroundColor: '#10b981', 
                            borderRadius: '50%', 
                            mx: 'auto', 
                            mb: { xs: 0.25, sm: 0.5 }
                        }} />
                        <Typography variant="caption" sx={{ 
                            fontWeight: 'bold', 
                            color: '#059669',
                            fontSize: { xs: '0.6rem', sm: '0.75rem' },
                            display: 'block'
                        }}>
                            Vendidos
                        </Typography>
                        <Typography variant="body2" sx={{ 
                            color: '#374151',
                            fontSize: { xs: '0.75rem', sm: '0.875rem' },
                            fontWeight: 'bold'
                        }}>
                            {sold}
                        </Typography>
                        <Typography variant="caption" sx={{ 
                            color: '#6b7280',
                            fontSize: { xs: '0.6rem', sm: '0.75rem' }
                        }}>
                            ({soldPercentage.toFixed(1)}%)
                        </Typography>
                    </Box>
                </Tooltip>

                <Tooltip title={`${pending} números pendientes`} arrow>
                    <Box>
                        <Box sx={{ 
                            width: { xs: 8, sm: 10, md: 12 }, 
                            height: { xs: 8, sm: 10, md: 12 }, 
                            backgroundColor: '#f59e0b', 
                            borderRadius: '50%', 
                            mx: 'auto', 
                            mb: { xs: 0.25, sm: 0.5 }
                        }} />
                        <Typography variant="caption" sx={{ 
                            fontWeight: 'bold', 
                            color: '#d97706',
                            fontSize: { xs: '0.6rem', sm: '0.75rem' },
                            display: 'block'
                        }}>
                            Pendientes
                        </Typography>
                        <Typography variant="body2" sx={{ 
                            color: '#374151',
                            fontSize: { xs: '0.75rem', sm: '0.875rem' },
                            fontWeight: 'bold'
                        }}>
                            {pending}
                        </Typography>
                        <Typography variant="caption" sx={{ 
                            color: '#6b7280',
                            fontSize: { xs: '0.6rem', sm: '0.75rem' }
                        }}>
                            ({pendingPercentage.toFixed(1)}%)
                        </Typography>
                    </Box>
                </Tooltip>

                <Tooltip title={`${apartado} números apartados`} arrow>
                    <Box>
                        <Box sx={{ 
                            width: { xs: 8, sm: 10, md: 12 }, 
                            height: { xs: 8, sm: 10, md: 12 }, 
                            backgroundColor: '#8b5cf6', 
                            borderRadius: '50%', 
                            mx: 'auto', 
                            mb: { xs: 0.25, sm: 0.5 }
                        }} />
                        <Typography variant="caption" sx={{ 
                            fontWeight: 'bold', 
                            color: '#7c3aed',
                            fontSize: { xs: '0.6rem', sm: '0.75rem' },
                            display: 'block'
                        }}>
                            Apartados
                        </Typography>
                        <Typography variant="body2" sx={{ 
                            color: '#374151',
                            fontSize: { xs: '0.75rem', sm: '0.875rem' },
                            fontWeight: 'bold'
                        }}>
                            {apartado}
                        </Typography>
                        <Typography variant="caption" sx={{ 
                            color: '#6b7280',
                            fontSize: { xs: '0.6rem', sm: '0.75rem' }
                        }}>
                            ({apartadoPercentage.toFixed(1)}%)
                        </Typography>
                    </Box>
                </Tooltip>

                <Tooltip title={`${available} números disponibles`} arrow>
                    <Box>
                        <Box sx={{ 
                            width: { xs: 8, sm: 10, md: 12 }, 
                            height: { xs: 8, sm: 10, md: 12 }, 
                            backgroundColor: '#f3f4f6', 
                            borderRadius: '50%', 
                            mx: 'auto', 
                            mb: { xs: 0.25, sm: 0.5 },
                            border: '1px solid #d1d5db'
                        }} />
                        <Typography variant="caption" sx={{ 
                            fontWeight: 'bold', 
                            color: '#6b7280',
                            fontSize: { xs: '0.6rem', sm: '0.75rem' },
                            display: 'block'
                        }}>
                            Disponibles
                        </Typography>
                        <Typography variant="body2" sx={{ 
                            color: '#374151',
                            fontSize: { xs: '0.75rem', sm: '0.875rem' },
                            fontWeight: 'bold'
                        }}>
                            {available}
                        </Typography>
                        <Typography variant="caption" sx={{ 
                            color: '#6b7280',
                            fontSize: { xs: '0.6rem', sm: '0.75rem' }
                        }}>
                            ({availablePercentage.toFixed(1)}%)
                        </Typography>
                    </Box>
                </Tooltip>
            </Box>
        </Box>
    );
}

export default RaffleProgressBar;