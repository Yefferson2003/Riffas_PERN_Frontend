import LocalActivityIcon from '@mui/icons-material/LocalActivity';
import SearchIcon from '@mui/icons-material/Search';
import CasinoIcon from '@mui/icons-material/Casino';
import { Chip, Pagination, Skeleton, Button, TextField, InputAdornment, Tooltip } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import { getRaffleNumersShared } from "../../api/raffleNumbersApi";
import { colorStatusRaffleNumber, formatCurrencyCOP, formatWithLeadingZeros, getChipStyles } from "../../utils";
import ViewRaffleNumberSharedModal from './ViewRaffleNumberSharedModal';
import { AwardType, RaffleSharedType } from '../../types';

type RaffleNumbersSharedProps = {
    awards: AwardType[]
    raffle: RaffleSharedType
    token: string
    price: string
}

function RaffleNumbersShared({ token, raffle, price, awards}: RaffleNumbersSharedProps) {

    const navigate = useNavigate()

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

    // Función para seleccionar un número aleatorio disponible
    const selectRandomNumber = () => {
        if (!raffleNumbers?.raffleNumbers) return;

        // Filtrar números disponibles de la página actual
        const availableNumbers = raffleNumbers.raffleNumbers.filter(
            num => num.status === 'available' && !selectedNumbers.some(selected => selected.id === num.id)
        );

        if (availableNumbers.length === 0) {
            // Si no hay números disponibles en la página actual, mostrar mensaje
            alert('No hay números disponibles en esta página. Cambia de página para encontrar números disponibles.');
            return;
        }

        // Seleccionar un número aleatorio
        const randomIndex = Math.floor(Math.random() * availableNumbers.length);
        const randomNumber = availableNumbers[randomIndex];

        // Agregarlo a la selección
        toggleSelectNumber({
            id: randomNumber.id,
            number: randomNumber.number,
            status: randomNumber.status
        });
    };

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
            <div className="flex flex-col items-center justify-center gap-3 mb-5 text-2xl font-bold text-azul">
                <div className='flex items-center gap-2'>
                    <LocalActivityIcon/>
                    <h2>Apartar Boletas</h2>
                </div>
                
                {/* Botón de número aleatorio */}
                <Tooltip title="Seleccionar número aleatorio de esta página" arrow>
                    <Button
                        variant="contained"
                        startIcon={<CasinoIcon />}
                        onClick={selectRandomNumber}
                        sx={{
                            bgcolor: 'primary.main',
                            color: 'white',
                            borderRadius: '25px',
                            px: 3,
                            py: 1,
                            fontWeight: 'bold',
                            fontSize: { xs: '0.8rem', sm: '0.9rem' },
                            textTransform: 'none',
                            '&:hover': {
                                bgcolor: 'primary.dark',
                                transform: 'scale(1.05)',
                                boxShadow: '0 4px 12px rgba(20, 70, 160, 0.3)',
                            },
                            '&:active': {
                                transform: 'scale(0.95)',
                            },
                            transition: 'all 0.2s ease-in-out',
                            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
                        }}
                        size="medium"
                    >
                        Número de la Suerte
                    </Button>
                </Tooltip>
                
                <h3 className='text-xl font-bold'>{formatCurrencyCOP(+price)}</h3>
                <p className="text-sm text-gray-600">Precio por boleta</p>
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
                                        <SearchIcon sx={{ color: '#1446A0' }} />
                                    </InputAdornment>
                                ),
                            }}
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: '25px',
                                    backgroundColor: 'white',
                                    '& fieldset': {
                                        borderColor: '#e0e4e7',
                                        borderWidth: '2px',
                                    },
                                    '&:hover fieldset': {
                                        borderColor: '#1446A0',
                                    },
                                    '&.Mui-focused fieldset': {
                                        borderColor: '#1446A0',
                                        borderWidth: '2px',
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
                                backgroundColor: '#1446A0',
                                '&:hover': {
                                    backgroundColor: '#0f3a8a',
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
                                    borderColor: '#1446A0',
                                    color: '#1446A0',
                                    '&:hover': {
                                        borderColor: '#0f3a8a',
                                        color: '#0f3a8a',
                                        backgroundColor: 'rgba(20, 70, 160, 0.04)',
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
                                        <SearchIcon sx={{ color: '#1446A0' }} />
                                    </InputAdornment>
                                ),
                            }}
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: '20px',
                                    backgroundColor: 'white',
                                    '& fieldset': {
                                        borderColor: '#e0e4e7',
                                        borderWidth: '2px',
                                    },
                                    '&:hover fieldset': {
                                        borderColor: '#1446A0',
                                    },
                                    '&.Mui-focused fieldset': {
                                        borderColor: '#1446A0',
                                        borderWidth: '2px',
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
                                    backgroundColor: '#1446A0',
                                    '&:hover': {
                                        backgroundColor: '#0f3a8a',
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
                                        borderColor: '#1446A0',
                                        color: '#1446A0',
                                        '&:hover': {
                                            borderColor: '#0f3a8a',
                                            color: '#0f3a8a',
                                            backgroundColor: 'rgba(20, 70, 160, 0.04)',
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
                            <span className="inline-block px-3 py-1.5 text-xs sm:text-sm font-medium text-blue-700 bg-blue-100 rounded-full border border-blue-200">
                                🎯 Buscando: #{formatWithLeadingZeros(+searchQuery, raffle.totalNumbers || 0)}
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
                    <p className='text-xl font-bold col-span-full text-azul'>No hay resultados...</p>
                ) : (
                    raffleNumbers && raffleNumbers.raffleNumbers.map(raffleNumber => {
                        const isSelected = isNumberSelected(raffleNumber.id);
                        const isAvailable = raffleNumber.status === 'available';
                        
                        return (
                            <Chip
                                key={raffleNumber.id}
                                sx={getChipStyles(raffleNumber.status)}
                                label={formatWithLeadingZeros(raffleNumber.number, raffle.totalNumbers || 0)} 
                                variant="filled" 
                                size="small"
                                disabled={!isAvailable}
                                color={isSelected ? 'primary' : colorStatusRaffleNumber[raffleNumber.status]}
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
                            boxShadow: '0 8px 20px rgba(0,0,0,0.15)',
                            '&:hover': {
                                boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
                            }
                        }}
                    >
                        Apartar {selectedNumbers.length} número{selectedNumbers.length > 1 ? 's' : ''}
                        <span className="ml-2 px-2 py-0.5 bg-white text-blue-600 rounded-full text-sm font-bold">
                            {formatCurrencyCOP(+price * selectedNumbers.length)}
                        </span>
                    </Button>
                </div>
            )}

            <div className='flex justify-center my-5'>   
                <Pagination  
                    count={raffleNumbers?.totalPages} 
                    color="primary" 
                    onChange={handlePageChange} 
                    page={page}
                    siblingCount={1} 
                    boundaryCount={1}
                    size='small'
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
            />}
        </div>
    );
}

export default RaffleNumbersShared;
