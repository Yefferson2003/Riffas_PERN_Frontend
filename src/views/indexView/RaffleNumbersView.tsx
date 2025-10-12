import LocalActivityIcon from '@mui/icons-material/LocalActivity';
import { Chip, FormControl, FormControlLabel, MenuItem, Select, SelectChangeEvent, Skeleton, Switch, TextField } from "@mui/material";
import { useQueries } from '@tanstack/react-query';
import debounce from 'lodash.debounce';
import { useCallback, useEffect, useState } from "react";
import { useMediaQuery } from 'react-responsive';
import { Navigate, useNavigate, useOutletContext, useParams } from "react-router-dom";
import { toast } from 'react-toastify';
import { getAwards } from '../../api/awardsApi';
import { getExpensesTotal, getExpensesTotalByUser } from '../../api/expensesApi';
import { getRaffleById } from '../../api/raffleApi';
import { getRaffleNumers } from '../../api/raffleNumbersApi';
import NumbersSeleted from '../../components/indexView/NumbersSeleted';
import PayNumbersModal from '../../components/indexView/PayNumbersModal';
import PaymentSellNumbersModal from '../../components/indexView/PaymentSellNumbersModal';
import Recaudo from '../../components/indexView/Recaudo';
import RecaudoByVendedor from '../../components/indexView/RecaudoByVendedor';
import UpdateRaffleModal from '../../components/indexView/UpdateRaffleModal';
import ViewRaffleNumberData from '../../components/indexView/ViewRaffleNumberData';
import ViewUsersOfRaffleModal from '../../components/indexView/ViewUsersOfRaffleModal';
import ViewAdminExpensesModal from '../../components/indexView/modal/Expenses/ViewAdminExpensesModal';
import ViewExpensesByUserModal from '../../components/indexView/modal/Expenses/ViewExpensesByUserModal';
import ShareURLRaffleModal from '../../components/indexView/modal/ShareURLRaffleModal';
import Awards from '../../components/indexView/raffle/Awards';
import RaffleSideBar from '../../components/indexView/raffle/RaffleSideBar';
import MobileErrorBoundary from '../../components/shared/MobileErrorBoundary';
import MobileSafePagination from '../../components/shared/MobileSafePagination';
import socket from '../../socket';
import { paymentMethodEnum, PaymentMethodType, RaffleNumber, RaffleNumbersPayments, User } from "../../types";
import { colorStatusRaffleNumber, formatCurrencyCOP, formatDateTimeLarge, formatWithLeadingZeros, getChipStyles } from "../../utils";
import { exelRaffleNumbersFilter, exelRaffleNumbersFilterDetails } from '../../utils/exel';
import LoaderView from "../LoaderView";
import '../../styles/mobile-fixes.css';

export type NumbersSelectedType = {
    numberId: number, 
    number: number, 
    status: RaffleNumber['status']
    firstName?: string | null
    lastName?: string | null
}

const styleForm = {
    width: '100%',
    // maxWidth: 800,
    display: 'flex',
    gap: 1,
    alignItems: 'center',
    justifyContent: {
        xs: 'center',        // Centrado en pantallas pequeñas
        sm: 'space-between', // Espaciado entre elementos en pantallas grandes
    },
    flexDirection: {
        xs: 'column', // Para pantallas pequeñas
        sm: 'row',    // Para pantallas más grandes
    },
}

function RaffleNumbersView() {
    const navigate = useNavigate()

    const isSmallDevice = useMediaQuery({ maxWidth: 768 });
    const paymentMethods = paymentMethodEnum.options
    
    const { raffleId } = useParams<{ raffleId: string }>();
    // const parsedRaffleId = raffleId ? parseInt(raffleId, 10) : undefined;
    const user : User = useOutletContext();
    const [page, setPage] = useState<number>(1);
    const [rowsPerPage] = useState<number>(100);
    const [urlWasap, setUrlWasap] = useState<string>('')

    const [paymentsSellNumbersModal, setPaymentsSellNumbersModal] = useState(false);
    const [pdfData, setPdfData] = useState<RaffleNumbersPayments | undefined>();


    const [optionSeleted, setOptionSeleted] = useState(false)
    const [numbersSeleted, setNumbersSeleted] = useState<NumbersSelectedType[]>([])

    const [filter, setFilter] = useState<{ sold?: boolean; available?: boolean; pending?: boolean }>({});
    const [paymentMethodFilter, setPaymentMethodFilter] = useState<PaymentMethodType | ''>('');
    const [inputValues, setInputValues] = useState({ 
        search: '', 
        searchAmount: '' 
    });
    const [searchParams, setSearchParams] = useState({ 
        search: '', 
        searchAmount: '' 
    }); 

    // Debounced search params con mejor manejo de errores
    const updateSearchParams = useCallback(
        debounce((values: { search: string; searchAmount: string }) => {
            try {
                setSearchParams(values);
            } catch (error) {
                console.error('Error actualizando parámetros de búsqueda:', error);
            }
        }, 2000),
        []
    );
    
    useEffect(() => {
        return () => {
            updateSearchParams.cancel();
        };
    }, [updateSearchParams]);


    const handleChangeSearchParams = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;


        if (name === 'searchAmount' && value && !/^\d*$/.test(value)) {
            toast.error('Solo se permiten números en el campo de monto.', { autoClose: 2000 });
            return;
        }

        const newValues = { ...inputValues, [name]: value };
        setInputValues(newValues);


        updateSearchParams(newValues);
    };
    
    // const handleChangeSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    //     setSearchParams(prev => ({ ...prev, search: e.target.value }));
    // }
    
    // const handleChangeSearchAmount = (e: React.ChangeEvent<HTMLInputElement>) => {
    //     setSearchParams(prev => ({ ...prev, searchAmount: e.target.value }));
    // }

    const handleFilterChange = (e: SelectChangeEvent<string>) => {
        // Definir un tipo específico para los filtros
        interface FilterOptions {
            sold?: boolean;
            available?: boolean;
            pending?: boolean;
            apartado?: boolean;
        }

        const filters: Record<string, FilterOptions> = {
            all: {},
            sold: { sold: true },
            available: { available: true },
            pending: { pending: true },
            apartado: { apartado: true },
        };

        // Actualizar el uso de setFilter
        setFilter(filters[e.target.value] || {});

        // Reset all other filters
        // setPaymentMethodFilter('');
        setSearchParams({ search: '', searchAmount: '' });
        const empty = { search: '', searchAmount: '' };
        setInputValues(empty);
        setSearchParams(empty);
        updateSearchParams.cancel();
        setPage(1);
    };

    const handlePageChange = (_event: React.ChangeEvent<unknown>, newPage: number) => {
        try {
            // Validaciones básicas
            if (!newPage || newPage < 1) {
                console.warn('Página inválida:', newPage);
                return;
            }
            
            // En móviles, agregar un pequeño delay para evitar clicks múltiples
            if (isSmallDevice) {
                setTimeout(() => setPage(newPage), 50);
            } else {
                setPage(newPage);
            }
        } catch (error) {
            console.error('Error al cambiar de página:', error);
            toast.error('Error al cambiar de página');
        }
    }

    const handleSwitchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setOptionSeleted(e.target.checked)
    }

    const handlePaymentMethodFilterChange = (e: SelectChangeEvent<string>) => {
        const value = e.target.value;
        const parsed = paymentMethodEnum.safeParse(value);
        if (parsed.success) {
            setPaymentMethodFilter(parsed.data);
        } else {
            setPaymentMethodFilter('')
        }
        setPage(1); // Reset page when filter changes
    }

    // const { data: raffleNumbers, isLoading : isLoadingRaffleNumbers, isError : isErrorRaffleNumbers, refetch} = useRaffleNumbers(parsedRaffleId!, {filter, page, limit: rowsPerPage, search});

    // const { data: raffle, isLoading :isLoadingRaffle , isError: isErrorRaffle } = useRaffleById(parsedRaffleId!);
    
    const [raffleNumbersData, raffleData, awardsData, expensesTotalData, expensesTotalByUserData] = useQueries({
        queries: [
            {
                queryKey: ['raffleNumbers', searchParams.search, raffleId, filter, page, rowsPerPage, searchParams.searchAmount, paymentMethodFilter],
                queryFn: () => getRaffleNumers({ raffleId: raffleId!, params: { page, limit: rowsPerPage, search: searchParams.search, amount: searchParams.searchAmount, ...(paymentMethodFilter && { paymentMethod: paymentMethodFilter }), ...filter} }),
                enabled: !!raffleId,
            },
            {
                queryKey: ['raffles', raffleId],
                queryFn: () => getRaffleById(raffleId!),
            },
            {
                queryKey: ['awards', raffleId],
                queryFn: () => getAwards({ raffleId: raffleId! }),
            },
            // Solo mostrar el total de gastos si es admin o vendedor responsable
            {
                queryKey: ['expensesTotal', raffleId],
                queryFn: () => getExpensesTotal({ raffleId: raffleId! }),
                enabled: !!raffleId && (user.rol.name !== 'vendedor' ),
            },
            // Solo mostrar el total de gastos por usuario si es vendedor responsable
            {
                queryKey: ['expensesTotalByUser', raffleId],
                queryFn: () => getExpensesTotalByUser({ raffleId: raffleId! }),
                enabled: !!raffleId && user.rol.name !== 'admin',
            },
        ]
    });

    const { data: raffleNumbers, isLoading : isLoadingRaffleNumbers, isError : isErrorRaffleNumbers, refetch } = raffleNumbersData
    const { data: raffle, isLoading :isLoadingRaffle , isError: isErrorRaffle, refetch: refechtRaffle} = raffleData
    const { data: awards, refetch: refechtAwards} = awardsData
    const { data: expenseTotal, refetch: refechtExpenseTotal, isLoading: isLoadingExpenseTotal} = expensesTotalData
    const { data: expenseTotalByUser, refetch: refechtExpenseTotalByUser,} = expensesTotalByUserData
    
    const handleNavigateViewRaffleNumber = (raffleNumberId: number) => {
        navigate(`?viewRaffleNumber=${raffleNumberId}`)
    }

    const MAX_SELECTED_NUMBERS = 20; 
    const toggleSelectNumber = (raffleNumberId: number, raffleNumberStatus: RaffleNumber['status'], raffleNumber: number, firstName: string, lastName: string) => {
        if (raffleNumberStatus !== 'available' && raffleNumberStatus !== 'pending') return;

        let nameValidate = ''

        if (numbersSeleted.length > 0 && numbersSeleted[0].status !== raffleNumberStatus) return;
        if (numbersSeleted.length > 0 && numbersSeleted[0].firstName && numbersSeleted[0].lastName) {
            nameValidate = `${numbersSeleted[0].firstName} ${numbersSeleted[0].lastName}`
        }

        if ((firstName || lastName) && nameValidate && nameValidate !== `${firstName} ${lastName}`) return;

        setNumbersSeleted((prevSelected) => {
            if (prevSelected.length >= MAX_SELECTED_NUMBERS) return prevSelected;

            const isSelected = prevSelected.some((item) => item.numberId === raffleNumberId);
            return isSelected
                ? prevSelected.filter((item) => item.numberId !== raffleNumberId)
                : [...prevSelected, { numberId: raffleNumberId, number: raffleNumber, status: raffleNumberStatus, firstName, lastName }];
        });
    };

    const isVisibleRaffleNumbes = (rafflePayments: { userId: number }[]) =>
        user.rol.name === 'vendedor' && !rafflePayments.some(payment => payment.userId === user.id);

    const isOptionSelectedNumber= (raffleNumberStatus: RaffleNumber['status']) => {
        return optionSeleted && (raffleNumberStatus === 'available' || raffleNumberStatus === 'pending');
    }
    
    useEffect(() => {
        const handleUpdateQuery = (data: { raffleId: number }) => {
            try {
                if (raffleId && data.raffleId === +raffleId) { 
                    refetch();
                }
            } catch (error) {
                console.error('Error en socket update:', error);
            }
        };

        socket.on('sellNumbers', handleUpdateQuery);
        socket.on('sellNumber', handleUpdateQuery);

        return () => {
            socket.off('sellNumbers', handleUpdateQuery);
            socket.off('sellNumber', handleUpdateQuery);
        };
    }, [raffleId, refetch]);

    // Efecto para detectar problemas en móviles
    // useEffect(() => {
    //     if (isSmallDevice) {
    //         // Log información del dispositivo móvil
    //         console.log('Dispositivo móvil detectado:', {
    //             userAgent: navigator.userAgent,
    //             viewport: { width: window.innerWidth, height: window.innerHeight },
    //             screen: { width: screen.width, height: screen.height }
    //         });

    //         // Detectar problemas de memoria en móviles
    //         const checkMemory = () => {
    //             if ('memory' in performance) {
    //                 const memInfo = (performance as unknown as { memory: { usedJSHeapSize: number; jsHeapSizeLimit: number } }).memory;
    //                 if (memInfo.usedJSHeapSize / memInfo.jsHeapSizeLimit > 0.9) {
    //                     console.warn('Memoria alta detectada en móvil');
    //                 }
    //             }
    //         };

    //         const memoryCheck = setInterval(checkMemory, 30000); // Check cada 30 segundos

    //         return () => {
    //             clearInterval(memoryCheck);
    //         };
    //     }
    // }, [isSmallDevice]);

    // useEffect(() => {
    //     socket.on("connect", () => {
    //     console.log("Conectado con id:", socket.id);
    //     });

    //     socket.on("sellNumbers", (data) => {
    //     console.log("Evento recibido:", data);
    //     });

    //     return () => {
    //     socket.off("connect");
    //     socket.off("sellNumbers");
    //     };
    // }, []);

    if (isLoadingRaffle) return <LoaderView />;
    if (isErrorRaffle || isErrorRaffleNumbers) return <Navigate to={'/404'} />;

    if (
        raffle &&
        !isLoadingRaffle &&
        user.rol.name !== 'admin' &&
        raffle.userRiffle &&
        !raffle.userRiffle.some(r => r.userId === user.id)
    ) {
        return <Navigate to={'/404'} />;
    }
    
    return (
        <section className={`flex flex-col-reverse w-full pb-10 text-center lg:flex-col *:bg-white *:p-2 gap-5 *:rounded-xl mobile-safe ${isSmallDevice ? 'mobile-device' : ''}`}>
            
            {raffle &&
                <RaffleSideBar 
                    raffleId={raffleId!} 
                    raffle={raffle}
                    totalNumbers={raffle.totalNumbers || 0}
                />
            }
            
            <div className="space-y-3">
                <div className="flex flex-col items-center lg:justify-between lg:flex-row">
                <div className="flex flex-col items-center lg:flex-row">
                    <h2 className="text-2xl font-bold lg:text-start lg:text-3xl text-azul">{raffle?.name}</h2>

                </div>

                    <div className="text-xl">
                        <p>{raffle?.nitResponsable}</p>
                        <p>{raffle?.nameResponsable}</p>
                    </div>
                </div>

                <p className="text-justify">{raffle?.description}</p>

                <Awards 
                    awards={awards}
                    refecht={refechtAwards}
                    raffleDate={raffle?.playDate}
                />
                
                {raffle && 
                <div className="space-y-3 md:justify-between md:flex md:space-y-0">
                    <div>
                        <p className="text-xl font-bold text-azul">Inicio</p>
                        <p>{formatDateTimeLarge(raffle.startDate)}</p>   
                    </div>

                    <div>
                        <p className="text-xl font-bold text-azul">Limite de Compra</p>
                        <p>{formatDateTimeLarge(raffle.editDate)}</p>
                    </div>
                    <div>
                        <p className="text-xl font-bold text-azul">Juega</p>
                        <p>{formatDateTimeLarge(raffle.playDate)}</p>
                    </div>
                </div>}
                
                { raffle && raffleId && user.rol.name !== 'vendedor' && 
                    <Recaudo 
                        raffleId={+raffleId}
                        expenseTotal={expenseTotal!}
                        expenseTotalByUser={expenseTotalByUser! || 0}
                    />
                }
                { raffle && raffleId && user.rol.name == 'vendedor' && 
                    <RecaudoByVendedor 
                        raffleId={+raffleId}
                        expenseTotalByUser={expenseTotalByUser!}
                    />
                }

                <img 
                    className="w-full lg:h-40 lg:object-cover"
                    src={isSmallDevice ? raffle?.banerMovileImgUrl || '/banner_default.jpg' : raffle?.banerImgUrl  || '/banner_default.jpg'}
                    alt="banner riffa" 
                />
            </div>

            <div>
                <div className="flex items-center justify-center gap-2 mb-5 text-2xl font-bold text-azul">
                    <LocalActivityIcon/>
                    <h2>Comprar Boletas</h2>
                </div>
                
                <div className='flex flex-col items-center justify-center gap-3 p-4 mb-5 rounded-lg shadow-sm bg-gray-50'>
                    {/* Precio de la rifa */}
                    {raffle && (
                        <div className="text-center">
                            <h3 className='text-2xl font-bold text-azul sm:text-3xl'>
                                {formatCurrencyCOP(+raffle.price)}
                            </h3>
                            <p className="text-sm text-gray-600 sm:text-base">Precio por boleta</p>
                        </div>
                    )}
                    
                    {/* Controles de filtrado */}
                    <div className="w-full max-w-6xl mx-auto ">
                        <FormControl size="small"
                            variant='filled'
                            fullWidth
                            sx={styleForm}
                        >
                            <Select
                                labelId="demo-simple-select-label"
                                id="demo-simple-select"
                                value={Object.keys(filter)[0] || 'all'}
                                onChange={handleFilterChange}
                                fullWidth
                            >
                                <MenuItem value={'all'}>Todos</MenuItem>
                                <MenuItem value={'available'}>Disponibles</MenuItem>
                                <MenuItem value={'pending'}>Pendientes</MenuItem>
                                <MenuItem value={'sold'}>Vendidos</MenuItem>
                                <MenuItem value={'apartado'}>Apartados</MenuItem>
                            </Select>
                            
                            <Select
                                labelId="demo-simple-select-label-method"
                                id="demo-simple-select-method"
                                fullWidth
                                value={paymentMethodFilter}
                                onChange={handlePaymentMethodFilterChange}
                                displayEmpty
                                renderValue={(selected) => {
                                    if (!selected) {
                                        return <p>Método de pago</p>;
                                    }
                                    return selected;
                                }}
                            >
                                <MenuItem value={''}>
                                    <em>Todos los métodos</em>
                                </MenuItem>
                                {paymentMethods.map(method => (
                                    <MenuItem key={method} value={method}>
                                        {method}
                                    </MenuItem>
                                ))}
                            </Select>
                            
                            <TextField 
                                fullWidth
                                id='search' 
                                label="Buscar Número" 
                                size='small'
                                variant='filled'
                                name='search'
                                value={inputValues.search}
                                onChange={handleChangeSearchParams}
                                className="min-w-0"
                            />
                            
                            {filter.pending === true && (
                                <TextField 
                                    id='searchAmount' 
                                    label="Buscar por Monto" 
                                    size='small'
                                    fullWidth
                                    variant='filled'
                                    name='searchAmount'
                                    value={inputValues.searchAmount}
                                    onChange={handleChangeSearchParams}
                                    className="min-w-0"
                                />
                            )}
                        </FormControl>
                    </div>
                    
                    {/* Botones de descarga */}
                    {user.rol.name !== 'vendedor' &&
                        (searchParams.search || searchParams.searchAmount || Object.keys(filter).length > 0 || paymentMethodFilter) &&
                        raffleNumbers && (
                            <div className="flex flex-col w-full max-w-4xl gap-3 mt-4 sm:flex-row sm:justify-center sm:gap-4">
                                <button
                                    className="flex-1 px-4 py-3 text-sm font-semibold text-white transition-all duration-200 rounded-lg sm:flex-none sm:px-6 bg-azul hover:bg-blue-600 hover:scale-105 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                                    onClick={() => {
                                        toast.info('Descargando archivo...', { autoClose: 2000 });
                                        exelRaffleNumbersFilterDetails(
                                            raffleId!,
                                            {
                                                search: searchParams.search,
                                                amount: searchParams.searchAmount,
                                                ...filter,
                                                paymentMethod: paymentMethodFilter
                                            },
                                            raffle?.totalNumbers || 0,
                                            paymentMethodFilter
                                        );
                                    }}
                                >
                                    <span className="flex items-center justify-center gap-2">
                                        📄 <span className="hidden sm:inline">Descargar Búsqueda</span> Detallada
                                    </span>
                                </button>
                                <button
                                    className="flex-1 px-4 py-3 text-sm font-semibold text-white transition-all duration-200 rounded-lg sm:flex-none sm:px-6 bg-azul hover:bg-blue-600 hover:scale-105 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                                    onClick={() => {
                                        toast.info('Descargando archivo...', { autoClose: 2000 });
                                        exelRaffleNumbersFilter(
                                            raffleId!,
                                            {
                                                search: searchParams.search,
                                                amount: searchParams.searchAmount,
                                                ...filter,
                                            },
                                            raffle?.totalNumbers || 0
                                        );
                                    }}
                                >
                                    <span className="flex items-center justify-center gap-2">
                                        📁 <span className="hidden sm:inline">Descargar Búsqueda</span> Simple
                                    </span>
                                </button>
                            </div>
                        )
                    }
                    
                    {/* Switch de selección */}
                    <div className="mt-2">
                        <FormControlLabel 
                            control={
                                <Switch 
                                    checked={optionSeleted} 
                                    onChange={handleSwitchChange}
                                    color="primary"
                                />
                            } 
                            label={
                                <span className="text-sm font-medium text-gray-700 sm:text-base">
                                    Seleccionar Números
                                </span>
                            }
                            className="select-none"
                        />
                    </div>
                </div>
                
                {(raffleNumbers && raffle) &&
                    <NumbersSeleted 
                    numbersSeleted={numbersSeleted} 
                    setNumbersSeleted={setNumbersSeleted}
                    totalNumbers={raffle.totalNumbers || 0}
                    />
                }
                
                <MobileErrorBoundary>
                    <section className="grid grid-cols-5 cursor-pointer gap-x-1 gap-y-3 md:grid-cols-10 md:grid-rows-10">
                    {isLoadingRaffleNumbers && (
                        <>
                        {Array.from({ length: rowsPerPage }).map((_, i) => (
                            <Skeleton 
                                key={i} 
                                variant="rectangular" 
                                width="90%" 
                                height={35} 
                                sx={{ borderRadius: 2 }} 
                            />
                        ))}
                        </>
                    )}

                    {!isLoadingRaffleNumbers && raffleNumbers && raffle && (raffle?.totalNumbers || 0) &&
                        raffleNumbers.raffleNumbers.length === 0 ? (
                        <p className='text-xl font-bold col-span-full text-azul'>No hay resultados...</p>
                        ) : (
                        raffleNumbers?.raffleNumbers.map(raffleNumber => {
                            const handleChipClick = optionSeleted ? 
                                () => {
                                    try {
                                        toggleSelectNumber(raffleNumber.id, raffleNumber.status, raffleNumber.number, raffleNumber.firstName || '', raffleNumber.lastName || '');
                                    } catch (error) {
                                        console.error('Error al seleccionar número:', error);
                                    }
                                }
                                : () => {
                                    try {
                                        handleNavigateViewRaffleNumber(raffleNumber.id);
                                    } catch (error) {
                                        console.error('Error al navegar:', error);
                                    }
                                };

                            return (
                                <Chip 
                                    sx={{
                                        ...getChipStyles(raffleNumber.status),
                                        // Mejores estilos para móviles
                                        touchAction: 'manipulation',
                                        userSelect: 'none',
                                        ...(isSmallDevice && {
                                            minHeight: '36px',
                                            '& .MuiChip-label': {
                                                fontSize: '0.9rem',
                                                fontWeight: 600
                                            }
                                        })
                                    }}
                                    key={raffleNumber.id} 
                                    label={formatWithLeadingZeros(raffleNumber.number, raffle?.totalNumbers || 0)} 
                                    variant="filled" 
                                    size={isSmallDevice ? 'medium' : 'small'}
                                    disabled={
                                        user.rol.name === 'vendedor' &&
                                        raffleNumber.payments.length > 0 &&
                                        isVisibleRaffleNumbes(raffleNumber.payments) &&
                                        !isOptionSelectedNumber(raffleNumber.status)
                                    }
                                    color={colorStatusRaffleNumber[raffleNumber.status]}
                                    onClick={handleChipClick}
                                />
                            );
                        })
                        )
                    }
                    </section>
                </MobileErrorBoundary>


                <MobileSafePagination
                    count={raffleNumbers?.totalPages}
                    page={page}
                    onChange={handlePageChange}
                    isSmallDevice={isSmallDevice}
                />
            </div>
        {raffle && <ViewUsersOfRaffleModal raffleId={raffle.id}/>}
        {raffle && <UpdateRaffleModal 
            raffle={raffle} 
            refechtRaffle={refechtRaffle}
        />}
        {raffle && raffleNumbers && awards && <PayNumbersModal
            refetch={refetch}
            awards={awards}
            totalNumbers={raffle.totalNumbers || 0}
            infoRaffle={{name: raffle.name, amountRaffle: raffle.price, playDate: raffle.playDate, description: raffle.description, responsable: raffle.nameResponsable}}
            numbersSeleted={numbersSeleted} 
            raffleId={raffle.id}
            rafflePrice={raffle.price}
            setNumbersSeleted={setNumbersSeleted}
            setPaymentsSellNumbersModal={setPaymentsSellNumbersModal}
            setPdfData={setPdfData}
            setUrlWasap={setUrlWasap}
        />}
        {raffle && raffleNumbers && pdfData && awards && <PaymentSellNumbersModal
            totalNumbers={raffle.totalNumbers || 0}
            raffle={raffle}
            awards={awards}
            setPaymentsSellNumbersModal={setPaymentsSellNumbersModal}
            setPdfData={setPdfData}
            paymentsSellNumbersModal={paymentsSellNumbersModal}
            pdfData={pdfData}
            urlWasap={urlWasap}
        />}
        {raffle && raffleNumbers && awards && <ViewRaffleNumberData
            totalNumbers={raffle.totalNumbers || 0}
            raffle={raffle}
            awards={awards}
            infoRaffle={{name: raffle.name, amountRaffle: raffle.price, playDate: raffle.playDate, description: raffle.description, responsable: raffle.nameResponsable}}
            setPaymentsSellNumbersModal={setPaymentsSellNumbersModal}
            setPdfData={setPdfData}
            refect={refetch}
            setUrlWasap={setUrlWasap}
            // refectRaffle={{ search, raffleId, filter, page, limit : rowsPerPage}}
        />}
        {/* {raffle && raffleNumbers && <ViewNumbersSoldModal/>} */}

        
        {raffle &&
            <>
            <ViewAdminExpensesModal
                expensesTotal={expenseTotal}
                isLoadingExpenseTotal={isLoadingExpenseTotal}
            />
            <ViewExpensesByUserModal
                refechtExpenseTotal={refechtExpenseTotal}
                refechtExpenseTotalByUser={refechtExpenseTotalByUser}
            />
            <ShareURLRaffleModal
            />
            </>
            
        }

        {/* Botón de debug para móviles */}
        {/* <MobileDebugButton /> */}

        </section>
    )
}

export default RaffleNumbersView