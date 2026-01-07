import { Box, Typography, Tooltip } from '@mui/material';
import { TrendingUp } from '@mui/icons-material';

interface RaffleProgressBarProps {
    numbersByStatus?: {
        available: number;
        sold: number;
        pending: number;
        apartado: number;
    };
    totalNumbers: number;
    variant?: 'default' | 'shared'; // Nueva prop para cambiar el estilo
    raffleColor?: string; // Nueva prop para el color de la rifa
}

function RaffleProgressBar({ numbersByStatus, totalNumbers, variant = 'default', raffleColor }: RaffleProgressBarProps) {
    if (!numbersByStatus || totalNumbers === 0) return null;

    const { available, sold, pending, apartado } = numbersByStatus;

    // Para la versión shared, combinamos todos los valores excepto disponibles
    const isSharedVersion = variant === 'shared';
    
    // Usar el color de la rifa o el color por defecto
    const primaryColor = raffleColor || '#1976d2';
    
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
                background: `linear-gradient(135deg, ${primaryColor}ee, ${primaryColor}aa)`, // Usa el color de la rifa
                borderRadius: 3, // Más redondeado
                boxShadow: `0 8px 32px ${primaryColor}40, 0 4px 16px ${primaryColor}25`, // Sombras con el color de la rifa
                border: '2px solid rgba(255, 255, 255, 0.2)', // Borde sutil
                position: 'relative',
                overflow: 'hidden',
                '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.1) 50%, transparent 70%)',
                    animation: 'shimmer 3s infinite',
                    pointerEvents: 'none'
                },
                '@keyframes shimmer': {
                    '0%': { transform: 'translateX(-100%)' },
                    '100%': { transform: 'translateX(100%)' }
                }
            }}>
                {/* Título para versión shared */}
                <Box sx={{ textAlign: 'center', mb: { xs: 2, sm: 3 }, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                    <TrendingUp sx={{ color: 'white', fontSize: { xs: '1.5rem', sm: '2rem' } }} />
                    <Typography variant="h4" sx={{ 
                        color: 'white', // Texto blanco para contraste
                        fontWeight: 'bold',
                        fontSize: { xs: '1.5rem', sm: '2rem' },
                        textShadow: '0 2px 4px rgba(0,0,0,0.3)', // Sombra en el texto
                        letterSpacing: '0.5px' // Espaciado de letras
                    }}>
                        {combinedPercentage.toFixed(1)}% Vendidos
                    </Typography>
                </Box>

                {/* Barra de progreso simplificada */}
                <Box sx={{ position: 'relative', mb: { xs: 2, sm: 2.5 } }}>
                    <Box sx={{
                        width: '100%',
                        height: { xs: 16, sm: 20, md: 24 }, // Más alta
                        borderRadius: { xs: 8, sm: 10, md: 12 }, // Más redondeada
                        backgroundColor: 'rgba(255, 255, 255, 0.2)', // Fondo semitransparente
                        position: 'relative',
                        overflow: 'hidden',
                        border: '1px solid rgba(255, 255, 255, 0.3)', // Borde sutil
                        boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1)' // Sombra interior
                    }}>
                        {/* Progreso combinado */}
                        {combined > 0 && (
                            <Box sx={{
                                position: 'absolute',
                                left: 0,
                                top: 0,
                                width: `${combinedPercentage}%`,
                                height: '100%',
                                background: `linear-gradient(45deg, ${primaryColor} 0%, ${primaryColor}dd 25%, ${primaryColor}aa 50%, ${primaryColor}cc 75%, ${primaryColor} 100%)`, // Gradiente con el color de la rifa
                                borderRadius: combinedPercentage === 100 ? { xs: 8, sm: 10, md: 12 } : { xs: '8px 0 0 8px', sm: '10px 0 0 10px', md: '12px 0 0 12px' },
                                transition: 'width 0.8s cubic-bezier(0.4, 0, 0.2, 1)', // Transición más suave
                                backgroundSize: '200% 100%',
                                animation: 'gradientShift 4s ease-in-out infinite', // Animación del gradiente
                                boxShadow: `0 2px 8px ${primaryColor}60`, // Sombra colorida con el color de la rifa
                                '@keyframes gradientShift': {
                                    '0%, 100%': { backgroundPosition: '0% 50%' },
                                    '50%': { backgroundPosition: '100% 50%' }
                                }
                            }} />
                        )}
                    </Box>


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
                color: primaryColor,
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
                    
                    {/* Pendientes (ahora color dorado) */}
                    {pendingPercentage > 0 && (
                        <Box sx={{
                            position: 'absolute',
                            left: `${soldProgress}%`,
                            top: 0,
                            width: `${pendingPercentage}%`,
                            height: '100%',
                            backgroundColor: '#ffd700', // Amarillo puro (gold) ahora para pendientes
                        }} />
                    )}
                    
                    {/* Apartados (ahora color warning) */}
                    {apartadoPercentage > 0 && (
                        <Box sx={{
                            position: 'absolute',
                            left: `${pendingProgress}%`,
                            top: 0,
                            width: `${apartadoPercentage}%`,
                            height: '100%',
                            backgroundColor: '#ed6c02', // Amarillo warning de MUI ahora para apartados
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
                            backgroundColor: '#ffd700', // Amarillo puro (gold) ahora para pendientes
                            borderRadius: '50%', 
                            mx: 'auto', 
                            mb: { xs: 0.25, sm: 0.5 }
                        }} />
                        <Typography variant="caption" sx={{ 
                            fontWeight: 'bold', 
                            color: '#b8860b', // Color de texto dorado oscuro para contraste
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
                            backgroundColor: '#ed6c02', // Amarillo warning de MUI ahora para apartados
                            borderRadius: '50%', 
                            mx: 'auto', 
                            mb: { xs: 0.25, sm: 0.5 }
                        }} />
                        <Typography variant="caption" sx={{ 
                            fontWeight: 'bold', 
                            color: '#e65100', // Color de texto warning más oscuro de MUI
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