import LocalActivityIcon from '@mui/icons-material/LocalActivity';
import SearchIcon from '@mui/icons-material/Search';
import CasinoIcon from '@mui/icons-material/Casino';
import { Chip, Pagination, Skeleton, Button, TextField, InputAdornment, Tooltip } from "@mui/material";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import { getRaffleNumersShared, getRandomAvailableNumberShared } from "../../api/raffleNumbersApi";
import { colorStatusRaffleNumber, formatCurrencyCOP, formatWithLeadingZeros, getChipStyles } from "../../utils";
import ViewRaffleNumberSharedModal from './ViewRaffleNumberSharedModal';
import { AwardType, RaffleSharedType } from '../../types';

type RaffleNumbersSharedProps = {
    awards: AwardType[]
    raffle: RaffleSharedType
    token: string
    price: string
    raffleColor?: string
}

function RaffleNumbersShared({ token, raffle, price, awards, raffleColor}: RaffleNumbersSharedProps) {

    const navigate = useNavigate()

    const primaryColor = raffleColor || '#1976d2';

    const [page, setPage] = useState<number>(1);
    const [rowsPerPage] = useState<number>(100);
    const [selectedNumbers, setSelectedNumbers] = useState<{id: number, number: number, status: string}[]>([]);
    const [searchInput, setSearchInput] = useState<string>('');
    const [searchQuery, setSearchQuery] = useState<string>('');

    // Debug: observar cambios en searchQuery
    useEffect(() => {
        console.log('searchQuery cambió a:', searchQuery);
    }, [searchQuery]);

    // Función para ejecutar la búsqueda manualmente
    const handleSearch = () => {
        console.log('Ejecutando búsqueda manual con valor:', searchInput); // Debug
        setSearchQuery(searchInput);
        setPage(1); // Resetear página cuando se busca
    };

    // Función para limpiar la búsqueda
    const handleClearSearch = () => {
        setSearchInput('');
        setSearchQuery('');
        setPage(1);
    };

    const { data: raffleNumbers, isLoading, refetch } = useQuery({
        queryKey: ['raffleNumbersShared', token, page, rowsPerPage, searchQuery],
        queryFn: () =>getRaffleNumersShared({ 
            page, 
            limit: rowsPerPage, 
            token, 
            search: searchQuery || undefined 
        }),
        enabled: !!token,
    });

    // Mutation para obtener número aleatorio
    const randomNumberMutation = useMutation({
        mutationFn: () => getRandomAvailableNumberShared({ token }),
        onSuccess: (randomNumberData) => {
            if (randomNumberData) {
                // Verificar si el número ya está seleccionado
                const isAlreadySelected = selectedNumbers.some(selected => selected.id === randomNumberData.id);
                
                if (isAlreadySelected) {
                    alert('El número seleccionado ya está en tu lista. Intenta de nuevo.');
                    return;
                }

                // Agregar el número a la selección
                setSelectedNumbers(prev => [...prev, {
                    id: randomNumberData.id,
                    number: randomNumberData.number,
                    status: randomNumberData.status
                }]);
                
                console.log(`¡Número ${randomNumberData.number} agregado a la selección!`);
            }
        },
        onError: (error) => {
            // Manejar errores
            const errorMessage = error instanceof Error ? error.message : 'Error al obtener número aleatorio';
            alert(errorMessage);
        }
    });

    // Función para seleccionar un número aleatorio
    const selectRandomNumber = () => {
        randomNumberMutation.mutate();
    };

    const handlePageChange = (_event: React.ChangeEvent<unknown>, newPage: number)=> {
        setPage(newPage);
    }

    const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value;
        console.log('Input value cambiado:', value); // Debug
        
        // Solo permitir números (permitir string vacío para poder borrar)
        if (value && !/^\d*$/.test(value)) {
            console.log('Valor rechazado por no ser numérico:', value); // Debug
            return;
        }
        
        setSearchInput(value);
    };

    // Manejar Enter en el input para buscar
    const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter') {
            handleSearch();
        }
    };

    const toggleSelectNumber = (raffleNumber: {id: number, number: number, status: string}) => {
        if (raffleNumber.status !== 'available') return;

        setSelectedNumbers(prev => {
            const isSelected = prev.some(num => num.id === raffleNumber.id);
            if (isSelected) {
                return prev.filter(num => num.id !== raffleNumber.id);
            } else {
                return [...prev, {
                    id: raffleNumber.id,
                    number: raffleNumber.number,
                    status: raffleNumber.status
                }];
            }
        });
    }

    const isNumberSelected = (raffleNumberId: number) => {
        return selectedNumbers.some(num => num.id === raffleNumberId);
    }

    const handleOpenModal = () => {
        if (selectedNumbers.length === 0) {
            return;
        }
        // Abrir modal sin depender de un ID específico
        navigate(`?apartarNumbers=true`);
    }

    const handleRefetch = () => {
        refetch()
    }

    return (
        <div>
            <div 
                className="flex flex-col items-center justify-center gap-3 mb-5 text-2xl font-bold"
                style={{ color: primaryColor }}
            >
                <div className='flex items-center gap-2'>
                    <LocalActivityIcon/>
                    <h2>Apartar Boletas</h2>
                </div>
                
                {/* Botón de número aleatorio */}
                <Tooltip title="Elegir un número aleatorio disponible" arrow>
                    <Button
                        variant="contained"
                        startIcon={<CasinoIcon />}
                        onClick={selectRandomNumber}
                        disabled={randomNumberMutation.isPending}
                        sx={{
                            bgcolor: primaryColor,
                            color: 'white',
                            borderRadius: '25px',
                            px: 3,
                            py: 1,
                            fontWeight: 'bold',
                            fontSize: { xs: '0.8rem', sm: '0.9rem' },
                            textTransform: 'none',
                            boxShadow: `0 4px 12px ${primaryColor}40, 0 2px 6px ${primaryColor}20`,
                            '&:hover': {
                                bgcolor: `${primaryColor}dd`,
                                transform: 'scale(1.05)',
                                boxShadow: `0 8px 20px ${primaryColor}50, 0 4px 10px ${primaryColor}30`,
                            },
                            '&:active': {
                                transform: 'scale(0.95)',
                            },
                            '&:disabled': {
                                bgcolor: 'grey.400',
                                color: 'white',
                                opacity: 0.7,
                            },
                            transition: 'all 0.2s ease-in-out',
                        }}
                        size="medium"
                    >
                        {randomNumberMutation.isPending ? 'Eligiendo...' : 'Elegir a la Suerte'}
                    </Button>
                </Tooltip>

                {/* Mostrar números seleccionados */}
                {selectedNumbers.length > 0 && (
                    <div className="w-full max-w-2xl">
                        <p className="mb-2 text-sm font-medium text-center" style={{ color: primaryColor }}>
                            Números seleccionados:
                        </p>
                        <div className="flex flex-wrap justify-center gap-2">
                            {selectedNumbers.map((selectedNumber) => (
                                <Chip
                                    key={selectedNumber.id}
                                    label={formatWithLeadingZeros(selectedNumber.number, raffle.totalNumbers || 0)}
                                    color="primary"
                                    variant="filled"
                                    size="medium"
                                    onDelete={() => {
                                        setSelectedNumbers(prev => 
                                            prev.filter(num => num.id !== selectedNumber.id)
                                        );
                                    }}
                                    sx={{
                                        fontWeight: 'bold',
                                        fontSize: '0.9rem',
                                        bgcolor: primaryColor,
                                        '& .MuiChip-deleteIcon': {
                                            color: 'white',
                                            fontSize: '1.2rem',
                                            '&:hover': {
                                                color: 'rgba(255, 255, 255, 0.8)',
                                            }
                                        }
                                    }}
                                />
                            ))}
                        </div>
                        <div className="mt-2 text-center">
                            <span className="text-sm font-bold" style={{ color: primaryColor }}>
                                Total: {formatCurrencyCOP(+price * selectedNumbers.length)}
                            </span>
                        </div>
                    </div>
                )}
                
                <h3 className='text-xl font-bold'>{formatCurrencyCOP(+price)}</h3>
                <p className="text-sm" style={{ color: primaryColor }}>Precio por boleta</p>
            </div>

            {/* Input de búsqueda con botones - Responsive */}
            <div className="flex justify-center px-4 mb-6">
                <div className="w-full max-w-2xl">
                    {/* Layout para pantallas grandes (md+) */}
                    <div className="hidden gap-3 md:flex">
                        <TextField
                            fullWidth
                            size="small"
                            placeholder="Buscar número específico..."
                            value={searchInput}
                            onChange={handleSearchChange}
                            onKeyPress={handleKeyPress}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchIcon sx={{ color: primaryColor }} />
                                    </InputAdornment>
                                ),
                            }}
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: '25px',
                                    backgroundColor: 'white',
                                    boxShadow: `0 2px 8px ${primaryColor}15`,
                                    '& fieldset': {
                                        borderColor: '#e0e4e7',
                                        borderWidth: '2px',
                                    },
                                    '&:hover fieldset': {
                                        borderColor: primaryColor,
                                        boxShadow: `0 0 0 3px ${primaryColor}20`,
                                    },
                                    '&.Mui-focused fieldset': {
                                        borderColor: primaryColor,
                                        borderWidth: '2px',
                                        boxShadow: `0 0 0 3px ${primaryColor}20`,
                                    },
                                },
                                '& .MuiInputBase-input': {
                                    padding: '12px 16px',
                                    fontSize: '0.95rem',
                                    fontWeight: '500',
                                },
                                '& .MuiInputBase-input::placeholder': {
                                    color: '#94a3b8',
                                    opacity: 1,
                                },
                            }}
                        />
                        
                        <Button
                            variant="contained"
                            onClick={handleSearch}
                            disabled={!searchInput.trim()}
                            sx={{
                                borderRadius: '25px',
                                px: 3,
                                py: 1,
                                minWidth: 'auto',
                                fontWeight: 'bold',
                                backgroundColor: primaryColor,
                                boxShadow: `0 2px 8px ${primaryColor}30`,
                                '&:hover': {
                                    backgroundColor: `${primaryColor}dd`,
                                    boxShadow: `0 4px 12px ${primaryColor}40`,
                                },
                                '&:disabled': {
                                    backgroundColor: '#94a3b8',
                                }
                            }}
                        >
                            Buscar
                        </Button>

                        {searchQuery && (
                            <Button
                                variant="outlined"
                                onClick={handleClearSearch}
                                sx={{
                                    borderRadius: '25px',
                                    px: 3,
                                    py: 1,
                                    minWidth: 'auto',
                                    fontWeight: 'bold',
                                    borderColor: primaryColor,
                                    color: primaryColor,
                                    '&:hover': {
                                        borderColor: `${primaryColor}dd`,
                                        color: `${primaryColor}dd`,
                                        backgroundColor: `${primaryColor}08`,
                                        boxShadow: `0 2px 8px ${primaryColor}20`,
                                    },
                                }}
                            >
                                Limpiar
                            </Button>
                        )}
                    </div>

                    {/* Layout para pantallas pequeñas (móviles) */}
                    <div className="space-y-3 md:hidden">
                        <TextField
                            fullWidth
                            size="small"
                            placeholder="Buscar número específico..."
                            value={searchInput}
                            onChange={handleSearchChange}
                            onKeyPress={handleKeyPress}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchIcon sx={{ color: primaryColor }} />
                                    </InputAdornment>
                                ),
                            }}
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: '20px',
                                    backgroundColor: 'white',
                                    boxShadow: `0 2px 8px ${primaryColor}15`,
                                    '& fieldset': {
                                        borderColor: '#e0e4e7',
                                        borderWidth: '2px',
                                    },
                                    '&:hover fieldset': {
                                        borderColor: primaryColor,
                                        boxShadow: `0 0 0 3px ${primaryColor}20`,
                                    },
                                    '&.Mui-focused fieldset': {
                                        borderColor: primaryColor,
                                        borderWidth: '2px',
                                        boxShadow: `0 0 0 3px ${primaryColor}20`,
                                    },
                                },
                                '& .MuiInputBase-input': {
                                    padding: '10px 14px',
                                    fontSize: '0.9rem',
                                    fontWeight: '500',
                                },
                                '& .MuiInputBase-input::placeholder': {
                                    color: '#94a3b8',
                                    opacity: 1,
                                },
                            }}
                        />
                        
                        <div className="flex w-full gap-2">
                            <Button
                                variant="contained"
                                onClick={handleSearch}
                                disabled={!searchInput.trim()}
                                fullWidth
                                sx={{
                                    borderRadius: '20px',
                                    py: 1.2,
                                    fontWeight: 'bold',
                                    fontSize: '0.9rem',
                                    backgroundColor: primaryColor,
                                    boxShadow: `0 2px 8px ${primaryColor}30`,
                                    '&:hover': {
                                        backgroundColor: `${primaryColor}dd`,
                                        boxShadow: `0 4px 12px ${primaryColor}40`,
                                    },
                                    '&:disabled': {
                                        backgroundColor: '#94a3b8',
                                    }
                                }}
                            >
                                🔍 Buscar
                            </Button>

                            {searchQuery && (
                                <Button
                                    variant="outlined"
                                    onClick={handleClearSearch}
                                    sx={{
                                        borderRadius: '20px',
                                        py: 1.2,
                                        px: 3,
                                        minWidth: 'auto',
                                        fontWeight: 'bold',
                                        fontSize: '0.9rem',
                                        borderColor: primaryColor,
                                        color: primaryColor,
                                        '&:hover': {
                                            borderColor: `${primaryColor}dd`,
                                            color: `${primaryColor}dd`,
                                            backgroundColor: `${primaryColor}08`,
                                            boxShadow: `0 2px 8px ${primaryColor}20`,
                                        },
                                    }}
                                >
                                    ✕
                                </Button>
                            )}
                        </div>
                    </div>

                    {/* Indicador de búsqueda activa - Responsive */}
                    {searchQuery && (
                        <div className="mt-3 text-center">
                            <span className="inline-block px-3 py-1.5 text-xs sm:text-sm font-medium text-white rounded-full border border-blue-200"
                                style={{
                                    backgroundColor: primaryColor,
                                    borderColor: `${primaryColor}80`
                                }}
                            >
                                Buscando: #{formatWithLeadingZeros(+searchQuery, raffle.totalNumbers || 0)}
                            </span>
                        </div>
                    )}
                </div>
            </div>
            
            <section className="grid grid-cols-5 gap-x-1 gap-y-3 md:grid-cols-10 md:grid-rows-10">
                {isLoading ? (
                    // Generamos skeletons del mismo tamaño que los Chip
                    Array.from({ length: rowsPerPage }).map((_, index) => (
                        <Skeleton 
                            key={index}
                            variant="rounded" 
                            height={35} 
                            sx={{ borderRadius: '16px' }}
                        />
                    ))
                ) : raffleNumbers && token && raffle.totalNumbers && raffleNumbers.raffleNumbers.length === 0 ? (
                    <p 
                        className='text-xl font-bold col-span-full'
                        style={{ color: primaryColor }}
                    >
                        No hay resultados...
                    </p>
                ) : (
                    raffleNumbers && raffleNumbers.raffleNumbers.map(raffleNumber => {
                        const isSelected = isNumberSelected(raffleNumber.id);
                        const isAvailable = raffleNumber.status === 'available';
                        
                        return (
                            <Chip
                                key={raffleNumber.id}
                                sx={{
                                    ...getChipStyles(raffleNumber.status),
                                    ...(isSelected && {
                                        backgroundColor: primaryColor + ' !important',
                                        color: 'white !important',
                                        '&:hover': {
                                            backgroundColor: `${primaryColor}dd !important`,
                                        }
                                    })
                                }}
                                label={formatWithLeadingZeros(raffleNumber.number, raffle.totalNumbers || 0)} 
                                variant="filled" 
                                size="small"
                                disabled={!isAvailable}
                                color={isSelected ? undefined : colorStatusRaffleNumber[raffleNumber.status]}
                                onClick={() => {
                                    if (isAvailable) {
                                        toggleSelectNumber(raffleNumber);
                                    }
                                }}
                            />
                        );
                    })
                )}
            </section>

            {/* Botón para abrir modal con números seleccionados */}
            {selectedNumbers.length > 0 && (
                <div className="fixed z-50 transform -translate-x-1/2 bottom-6 left-1/2">
                    <Button
                        variant="contained"
                        size="large"
                        onClick={handleOpenModal}
                        sx={{
                            borderRadius: '25px',
                            px: 4,
                            py: 1.5,
                            fontWeight: 'bold',
                            fontSize: '1rem',
                            bgcolor: primaryColor,
                            boxShadow: `0 8px 20px ${primaryColor}40`,
                            '&:hover': {
                                bgcolor: `${primaryColor}dd`,
                                boxShadow: `0 10px 25px ${primaryColor}50`,
                                transform: 'scale(1.02)',
                            },
                            transition: 'all 0.2s ease-in-out',
                        }}
                    >
                        Apartar {selectedNumbers.length} número{selectedNumbers.length > 1 ? 's' : ''}
                        <span className="ml-2 px-2 py-0.5 bg-white rounded-full text-sm font-bold"
                            style={{ color: primaryColor }}
                        >
                            {formatCurrencyCOP(+price * selectedNumbers.length)}
                        </span>
                    </Button>
                </div>
            )}

            <div className='flex justify-center my-5'>   
                <Pagination  
                    count={raffleNumbers?.totalPages} 
                    onChange={handlePageChange} 
                    page={page}
                    siblingCount={1} 
                    boundaryCount={1}
                    size='small'
                    sx={{
                        '& .MuiPaginationItem-root': {
                            color: primaryColor,
                            '&.Mui-selected': {
                                backgroundColor: primaryColor,
                                color: 'white',
                                '&:hover': {
                                    backgroundColor: `${primaryColor}dd`,
                                },
                            },
                            '&:hover': {
                                backgroundColor: `${primaryColor}20`,
                            },
                        },
                    }}
                /> 
            </div>


            {raffleNumbers && token && <ViewRaffleNumberSharedModal
                totalNumbers={raffle.totalNumbers || 0}
                awards={awards}
                raffle={raffle}
                token={token}
                raffleRefetch={handleRefetch}
                selectedNumbers={selectedNumbers}
                setSelectedNumbers={setSelectedNumbers}
                raffleColor={raffleColor}
            />}
        </div>
    );
}

export default RaffleNumbersShared;
