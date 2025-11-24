import LocalActivityIcon from '@mui/icons-material/LocalActivity';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CasinoIcon from '@mui/icons-material/Casino';
import { Chip, FormControl, FormControlLabel, MenuItem, Select, SelectChangeEvent, Skeleton, Switch, TextField } from "@mui/material";
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import  { Dayjs } from 'dayjs';
import { useQueries } from '@tanstack/react-query';
import debounce from 'lodash.debounce';
import { useCallback, useEffect, useState } from "react";
import { useMediaQuery } from 'react-responsive';
import { Navigate, useNavigate, useOutletContext, useParams } from "react-router-dom";
import { toast } from 'react-toastify';
import { getAwards } from '../../api/awardsApi';
import { getExpensesTotal, getExpensesTotalByUser } from '../../api/expensesApi';
import { getActiveRafflePayMethods } from '../../api/payMethodeApi';
import { getRaffleById, getUsersByRaffle } from '../../api/raffleApi';
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
import RafflePayMethodsModal from '../../components/indexView/modal/RafflePayMethodsModal';
import Awards from '../../components/indexView/raffle/Awards';
import RaffleSideBar from '../../components/indexView/raffle/RaffleSideBar';
import RaffleOffersModal from '../../components/indexView/modal/RaffleOffersModal';
import RaffleProgressBar from '../../components/indexView/RaffleProgressBar';
import MobileErrorBoundary from '../../components/shared/MobileErrorBoundary';
import MobileSafePagination from '../../components/shared/MobileSafePagination';
import socket from '../../socket';
import { RaffleNumber, RaffleNumbersPayments, statusRaffleNumbersEnum, User } from "../../types";
import { capitalize, colorStatusRaffleNumber, formatCurrencyCOP, formatDateTimeLarge, formatWithLeadingZeros, getChipStyles, translateRaffleStatus } from "../../utils";
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
    display: 'grid',
    gap: 1,
    alignItems: 'center',
    gridTemplateColumns: {
        xs: '1fr',                    // Una columna en pantallas pequeñas
        sm: 'repeat(2, 1fr)',         // Dos columnas en pantallas medianas
        md: 'repeat(3, 1fr)',         // Cuatro columnas en pantallas grandes
    },
}

function RaffleNumbersView() {
        
    const navigate = useNavigate()

    const isSmallDevice = useMediaQuery({ maxWidth: 768 });
    
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
    const [paymentMethodFilter, setPaymentMethodFilter] = useState<string>('');
    const [userFilter, setUserFilter] = useState<string>('');
    const [inputValues, setInputValues] = useState({ 
        search: '', 
        searchAmount: '' 
    });
    const [searchParams, setSearchParams] = useState({ 
        search: '', 
        searchAmount: '' 
    }); 
    const [startDate, setStartDate] = useState<Dayjs | null>(null);
    const [endDate, setEndDate] = useState<Dayjs | null>(null);

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

    const handleUserFilterChange = (e: SelectChangeEvent<string>) => {
        const value = e.target.value;
        setUserFilter(value);
        setPage(1);
    }

    const handlePaymentMethodFilterChange = (e: SelectChangeEvent<string>) => {
        const value = e.target.value;
        if (value === '') {
            setPaymentMethodFilter('');
            // Resetear fechas cuando se deselecciona el método de pago
            setStartDate(null);
            setEndDate(null);
        } else {
            setPaymentMethodFilter(value);
        }
        setPage(1); // Reset page when filter changes
    }

    const handleStartDateChange = (newDate: Dayjs | null) => {
        setStartDate(newDate);
        setPage(1); // Reset page when date changes
    };

    const handleEndDateChange = (newDate: Dayjs | null) => {
        setEndDate(newDate);
        setPage(1); // Reset page when date changes
    };

    const handleResetFilters = () => {
        // Resetear todos los filtros
        setFilter({});
        setPaymentMethodFilter('');
        setInputValues({ search: '', searchAmount: '' });
        setSearchParams({ search: '', searchAmount: '' });
        setStartDate(null);
        setEndDate(null);
        updateSearchParams.cancel();
        setPage(1);
        setUserFilter('');
        toast.success('Filtros reiniciados', { autoClose: 1500 });
    };

    // const { data: raffleNumbers, isLoading : isLoadingRaffleNumbers, isError : isErrorRaffleNumbers, refetch} = useRaffleNumbers(parsedRaffleId!, {filter, page, limit: rowsPerPage, search});

    // const { data: raffle, isLoading :isLoadingRaffle , isError: isErrorRaffle } = useRaffleById(parsedRaffleId!);

    const [raffleNumbersData, raffleData, awardsData, expensesTotalData, expensesTotalByUserData, usersRaffleData, payMethodsData] = useQueries({
        queries: [
            {
                queryKey: ['raffleNumbers', searchParams.search, raffleId, filter, page, rowsPerPage, searchParams.searchAmount, paymentMethodFilter, startDate?.format('YYYY-MM-DD'), endDate?.format('YYYY-MM-DD'), userFilter],
                queryFn: () => getRaffleNumers({ 
                    raffleId: raffleId!, 
                    params: { 
                        page, 
                        limit: rowsPerPage, 
                        search: searchParams.search, 
                        amount: searchParams.searchAmount, 
                        ...(paymentMethodFilter && { paymentMethod: paymentMethodFilter }),
                        ...(startDate && endDate && {
                            startDate: startDate.format('YYYY-MM-DD'),
                            endDate: endDate.format('YYYY-MM-DD')
                        }),
                        userId: userFilter,
                        ...filter
                    } 
                }),
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
            {
                queryKey: ['usersRaffle', raffleId],
                queryFn: () => getUsersByRaffle(+raffleId!),
                enabled: !!raffleId,
                retry: false
            },
            {
                queryKey: ['rafflePayMethods', raffleId],
                queryFn: () => getActiveRafflePayMethods(raffleId!),
                enabled: !!raffleId,
            }
        ]
    });

    const { data: raffleNumbers, isLoading : isLoadingRaffleNumbers, isError : isErrorRaffleNumbers, refetch } = raffleNumbersData
    const { data: raffle, isLoading :isLoadingRaffle , isError: isErrorRaffle, refetch: refechtRaffle} = raffleData
    const { data: awards, refetch: refechtAwards} = awardsData
    const { data: expenseTotal, refetch: refechtExpenseTotal, isLoading: isLoadingExpenseTotal} = expensesTotalData
    const { data: expenseTotalByUser, refetch: refechtExpenseTotalByUser,} = expensesTotalByUserData
    const { data: usersRaffle,} = usersRaffleData
    const { data: payMethods, isLoading: isLoadingPayMethods} = payMethodsData
    
    const handleNavigateViewRaffleNumber = (raffleNumberId: number) => {
        const params = new URLSearchParams(window.location.search);
        params.set('viewRaffleNumber', String(raffleNumberId));
        navigate({ search: params.toString() });
    }

    // Ejemplo de uso en onSuccess de compra (debes llamarla en el lugar correcto):
    // redirectOwnerToWhatsApp({
    //     raffle,
    //     selectedNumbers: numbersSeleted,
    //     buyerName: `${formData.firstName} ${formData.lastName}`,
    // });


    const MAX_SELECTED_NUMBERS = 20; 
    const toggleSelectNumber = (raffleNumberId: number, raffleNumberStatus: RaffleNumber['status'], raffleNumber: number, firstName: string, lastName: string) => {
        if (raffleNumberStatus !== 'available' && raffleNumberStatus !== 'pending' && raffleNumberStatus !== 'apartado') return;

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

    const isVisibleRaffleNumbes = (rafflePayments: { userId?: number | null | undefined; isValid: boolean }[]) =>
        user.rol.name === 'vendedor' && rafflePayments.some(payment => (payment.userId ?? undefined) !== user.id && payment.isValid === true);

    const isOptionSelectedNumber= (raffleNumberStatus: RaffleNumber['status']) => {
        return optionSeleted && (raffleNumberStatus === 'available' || raffleNumberStatus === 'pending' || raffleNumberStatus === 'apartado');
    }

    //handle refecth
    const handleRefetch = () => {
        refetch()
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
                        <h2 
                            className="text-2xl font-bold lg:text-start lg:text-3xl"
                            style={{ color: raffle?.color || '#1976d2' }}
                        >
                            {raffle?.name}
                        </h2>
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
                    raffleColor={raffle?.color || '#1976d2'}
                />

                {/* Línea divisoria estilizada */}
                <div 
                    className="w-full h-px mx-auto my-6"
                    style={{ 
                        background: `linear-gradient(to right, transparent, ${raffle?.color || '#1976d2'}, transparent)` 
                    }}
                />
                
                {/* Fechas importantes */}
                {raffle && 
                <div className="grid grid-cols-1 gap-8 md:grid-cols-3 md:gap-10">
                    <div className="p-6 text-center transition-all duration-300 transform border-0 shadow-lg hover:scale-105 bg-gradient-to-br from-green-50 via-green-100 to-green-200 rounded-2xl hover:shadow-xl">
                        <div className="inline-block p-3 mb-3 bg-white rounded-full shadow-md bg-opacity-70">
                            <PlayArrowIcon sx={{ fontSize: 24, color: '#047857', fontWeight: 'bold' }} />
                        </div>
                        <p className="mb-3 text-xl font-bold text-green-700 drop-shadow-sm">Inicio</p>
                        <p className="text-lg font-semibold text-gray-800">{formatDateTimeLarge(raffle.startDate)}</p>   
                    </div>

                    <div className="p-6 text-center transition-all duration-300 transform border-0 shadow-lg hover:scale-105 bg-gradient-to-br from-orange-50 via-orange-100 to-orange-200 rounded-2xl hover:shadow-xl">
                        <div className="inline-block p-3 mb-3 bg-white rounded-full shadow-md bg-opacity-70">
                            <AccessTimeIcon sx={{ fontSize: 24, color: '#c2410c', fontWeight: 'bold' }} />
                        </div>
                        <p className="mb-3 text-xl font-bold text-orange-700 drop-shadow-sm">Límite de Compra</p>
                        <p className="text-lg font-semibold text-gray-800">{formatDateTimeLarge(raffle.editDate)}</p>
                    </div>
                    
                    <div className="p-6 text-center transition-all duration-300 transform border-0 shadow-lg hover:scale-105 bg-gradient-to-br from-purple-50 via-purple-100 to-purple-200 rounded-2xl hover:shadow-xl">
                        <div className="inline-block p-3 mb-3 bg-white rounded-full shadow-md bg-opacity-70">
                            <CasinoIcon sx={{ fontSize: 24, color: '#7c3aed', fontWeight: 'bold' }} />
                        </div>
                        <p className="mb-3 text-xl font-bold text-purple-700 drop-shadow-sm">Juega</p>
                        <p className="text-lg font-semibold text-gray-800">{formatDateTimeLarge(raffle.playDate)}</p>
                    </div>
                </div>}
                
                { raffle && raffleId && user.rol.name !== 'vendedor' && 
                    <div className="p-4 shadow-md rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50">
                        <Recaudo 
                            raffleId={+raffleId}
                            expenseTotal={expenseTotal!}
                            expenseTotalByUser={expenseTotalByUser! || 0}
                            raffleColor={raffle?.color || '#1976d2'}
                        />
                    </div>
                }
                { raffle && raffleId && user.rol.name == 'vendedor' && 
                    <div className="p-4 shadow-md rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50">
                        <RecaudoByVendedor 
                            raffleId={+raffleId}
                            expenseTotalByUser={expenseTotalByUser!}
                            raffleColor={raffle?.color || '#1976d2'}
                        />
                    </div>
                }

                <img 
                    className="w-full lg:h-40 lg:object-cover rounded-xl"
                    src={isSmallDevice ? raffle?.banerMovileImgUrl || '/banner_default.jpg' : raffle?.banerImgUrl  || '/banner_default.jpg'}
                    alt="banner riffa" 
                />
            </div>

                            {/* Componente de progreso de la rifa */}
            {raffle && raffle.totalNumbers && (
                <RaffleProgressBar 
                    numbersByStatus={raffle.numbersByStatus}
                    totalNumbers={raffle.totalNumbers}
                    raffleColor={raffle.color || '#1976d2'}
                />
            )}

            <div>
                <div 
                    className="flex items-center justify-center gap-2 text-2xl font-bold"
                    style={{ color: raffle?.color || '#1976d2' }}
                >
                    <LocalActivityIcon style={{ color: raffle?.color || '#1976d2' }} />
                    <h2>Comprar Boletas</h2>
                </div>
                
                <div className='flex flex-col items-center justify-center gap-3 mb-5 bg-transparent'>
                    {/* Precio de la rifa */}
                    {raffle && (
                        <div className="text-center">
                            <h3 
                                className='text-2xl font-bold sm:text-3xl'
                                style={{ color: raffle?.color || '#1976d2' }}
                            >
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
                            sx={{
                                ...styleForm,
                                '& .MuiFilledInput-root': {
                                    '&:hover:not(.Mui-disabled):before': {
                                        borderBottomColor: raffle?.color || '#1976d2',
                                    },
                                    '&.Mui-focused:after': {
                                        borderBottomColor: raffle?.color || '#1976d2',
                                    },
                                },
                                '& .MuiInputLabel-root.Mui-focused': {
                                    color: raffle?.color || '#1976d2',
                                },
                            }}
                        >
                            <Select
                                labelId="demo-simple-select-label"
                                id="demo-simple-select"
                                value={Object.keys(filter)[0] || 'all'}
                                onChange={handleFilterChange}
                                fullWidth
                            >
                                <MenuItem value={'all'}>Todos</MenuItem>
                                {statusRaffleNumbersEnum.map(status => (
                                    <MenuItem key={status} value={status}>
                                        {translateRaffleStatus(status)}
                                    </MenuItem>
                                ))}
                                    
                                    
                                {/* <MenuItem value={'available'}>Disponibles</MenuItem>
                                <MenuItem value={'pending'}>Pendientes</MenuItem>
                                <MenuItem value={'sold'}>Vendidos</MenuItem>
                                <MenuItem value={'apartado'}>Apartados</MenuItem> */}
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
                                    const selectedMethod = payMethods?.find(method => method.id === Number(selected));
                                    return selectedMethod ? capitalize(selectedMethod.payMethode.name) : selected;
                                }}
                            >
                                <MenuItem value={''}>
                                    <em>Todos los métodos</em>
                                </MenuItem>
                                {payMethods?.map(method => (
                                    <MenuItem key={method.id} value={method.id}>
                                        {capitalize(method.payMethode.name)}
                                    </MenuItem>
                                )) || (
                                    <MenuItem disabled>
                                        <em>{isLoadingPayMethods ? 'Cargando métodos...' : 'No hay métodos disponibles'}</em>
                                    </MenuItem>
                                )}
                            </Select>
                            <Select
                                labelId="demo-simple-select-label-user"
                                id="demo-simple-select-user"
                                fullWidth
                                value={userFilter}
                                onChange={handleUserFilterChange}
                                displayEmpty
                                renderValue={(selectedValue) => {
                                    if (!selectedValue) {
                                        return <p>Elegir un usuario</p>;
                                    }
                                    const selectedUser = usersRaffle?.find(userRaffle => userRaffle.user.id === +selectedValue);
                                    if (user.rol.name === 'vendedor') {
                                        return `${user.firstName} ${user.lastName}`;
                                    }
                                    return selectedUser ? `${selectedUser.user.firstName} ${selectedUser.user.lastName}` : selectedValue;
                                }}
                            >
                                <MenuItem value={''}>
                                    <em>Todos</em>
                                </MenuItem>
                                {usersRaffle ? usersRaffle.map(userRaffle => (
                                    <MenuItem key={userRaffle.user.id} value={userRaffle.user.id}>
                                        {userRaffle.user.firstName} {userRaffle.user.lastName}
                                    </MenuItem>
                                )) : null}
                                {user.rol.name === 'vendedor' && 
                                    <MenuItem key={user.id} value={user.id}>
                                        {user.firstName} {user.lastName}
                                    </MenuItem>
                                }
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
                                sx={{
                                    '& .MuiFilledInput-root': {
                                        '&:hover:not(.Mui-disabled):before': {
                                            borderBottomColor: raffle?.color || '#1976d2',
                                        },
                                        '&.Mui-focused:after': {
                                            borderBottomColor: raffle?.color || '#1976d2',
                                        },
                                    },
                                    '& .MuiInputLabel-root.Mui-focused': {
                                        color: raffle?.color || '#1976d2',
                                    },
                                }}
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
                                    sx={{
                                        '& .MuiFilledInput-root': {
                                            '&:hover:not(.Mui-disabled):before': {
                                                borderBottomColor: raffle?.color || '#1976d2',
                                            },
                                            '&.Mui-focused:after': {
                                                borderBottomColor: raffle?.color || '#1976d2',
                                            },
                                        },
                                        '& .MuiInputLabel-root.Mui-focused': {
                                            color: raffle?.color || '#1976d2',
                                        },
                                    }}
                                />
                            )}

                            {/* Filtros de fecha - Solo visible cuando hay método de pago seleccionado */}
                            {paymentMethodFilter && (
                                <div className="flex flex-col w-full gap-2 md:col-span-3 sm:flex-row sm:gap-4">
                                <LocalizationProvider dateAdapter={AdapterDayjs}>
                                        <DatePicker
                                            label="Fecha Inicial"
                                            value={startDate}
                                            onChange={handleStartDateChange}
                                            slotProps={{
                                                textField: {
                                                    size: 'small',
                                                    variant: 'filled',
                                                    fullWidth: true,
                                                    className: "min-w-0",
                                                    sx: {
                                                        '& .MuiFilledInput-root': {
                                                            '&:hover:not(.Mui-disabled):before': {
                                                                borderBottomColor: raffle?.color || '#1976d2',
                                                            },
                                                            '&.Mui-focused:after': {
                                                                borderBottomColor: raffle?.color || '#1976d2',
                                                            },
                                                        },
                                                        '& .MuiInputLabel-root.Mui-focused': {
                                                            color: raffle?.color || '#1976d2',
                                                        },
                                                    }
                                                }
                                            }}
                                        />
                                        <DatePicker
                                            label="Fecha Final"
                                            value={endDate}
                                            onChange={handleEndDateChange}
                                            minDate={startDate || undefined}
                                            disabled={!startDate}
                                            slotProps={{
                                                textField: {
                                                    size: 'small',
                                                    variant: 'filled',
                                                    fullWidth: true,
                                                    className: "min-w-0",
                                                    sx: {
                                                        '& .MuiFilledInput-root': {
                                                            '&:hover:not(.Mui-disabled):before': {
                                                                borderBottomColor: raffle?.color || '#1976d2',
                                                            },
                                                            '&.Mui-focused:after': {
                                                                borderBottomColor: raffle?.color || '#1976d2',
                                                            },
                                                        },
                                                        '& .MuiInputLabel-root.Mui-focused': {
                                                            color: raffle?.color || '#1976d2',
                                                        },
                                                    }
                                                }
                                            }}
                                        />
                                </LocalizationProvider>
                                </div>
                            )}

                            {/* Botón de reiniciar filtros */}
                            <div className="flex justify-center md:col-span-3">
                                <button
                                    type="button"
                                    onClick={handleResetFilters}
                                    className="px-4 py-2 text-sm font-medium text-white transition-all duration-200 rounded-lg hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                    style={{
                                        backgroundColor: raffle?.color || '#1976d2',
                                        boxShadow: `0 4px 8px ${raffle?.color || '#1976d2'}40`,
                                    }}
                                    disabled={
                                        Object.keys(filter).length === 0 && 
                                        !paymentMethodFilter && 
                                        !inputValues.search && 
                                        !inputValues.searchAmount && 
                                        !startDate && 
                                        !endDate &&
                                        !userFilter
                                    }
                                >
                                    Reiniciar Filtros
                                </button>
                            </div>
                        </FormControl>
                    </div>
                    
                    {/* Botones de descarga */}
                    {(user.rol.name !== 'vendedor') &&
                        (searchParams.search || searchParams.searchAmount || Object.keys(filter).length > 0 || paymentMethodFilter || userFilter) &&
                        raffleNumbers && (
                            <div className="flex flex-col w-full max-w-4xl gap-3 mt-4 sm:flex-row sm:justify-center sm:gap-4">
                                <button
                                    className="flex-1 px-4 py-3 text-sm font-semibold text-white transition-all duration-200 rounded-lg sm:flex-none sm:px-6 hover:scale-105 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2"
                                    style={{ 
                                        backgroundColor: raffle?.color || '#1976d2'
                                    }}
                                    onClick={() => {
                                        toast.info('Descargando archivo...', { autoClose: 2000 });
                                        // const selectedMethod = payMethods?.find(method => method.payMethode.id.toString() === paymentMethodFilter);
                                        // const methodName = selectedMethod ? capitalize(selectedMethod.payMethode.name) : '';
                                        exelRaffleNumbersFilterDetails(
                                            raffleId!,
                                            {
                                                search: searchParams.search,
                                                amount: searchParams.searchAmount,
                                                ...filter,
                                                paymentMethod: paymentMethodFilter,
                                                startDate: startDate ? startDate.format('YYYY-MM-DD') : undefined,
                                                endDate: endDate ? endDate.format('YYYY-MM-DD') : undefined,
                                                userId: userFilter
                                            },
                                            raffle?.totalNumbers || 0,
                                            // methodName,
                                        );
                                    }}
                                >
                                    <span className="flex items-center justify-center gap-2">
                                        📄 <span className="hidden sm:inline">Descargar Búsqueda</span> Detallada
                                    </span>
                                </button>
                                <button
                                    className="flex-1 px-4 py-3 text-sm font-semibold text-white transition-all duration-200 rounded-lg sm:flex-none sm:px-6 hover:scale-105 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2"
                                    style={{ 
                                        backgroundColor: raffle?.color || '#1976d2',
                                    }}
                                    onClick={() => {
                                        toast.info('Descargando archivo...', { autoClose: 2000 });
                                        exelRaffleNumbersFilter(
                                            raffleId!,
                                            {
                                                search: searchParams.search,
                                                amount: searchParams.searchAmount,
                                                ...filter,
                                                paymentMethod: paymentMethodFilter,
                                                startDate: startDate ? startDate.format('YYYY-MM-DD') : undefined,
                                                endDate: endDate ? endDate.format('YYYY-MM-DD') : undefined,
                                                userId: userFilter
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
                    
                    {(user.rol.name == 'vendedor' && userFilter) &&
                        <div className="flex flex-col w-full max-w-4xl gap-3 mt-4 sm:flex-row sm:justify-center sm:gap-4">
                            <button
                                className="flex-1 px-4 py-3 text-sm font-semibold text-white transition-all duration-200 rounded-lg sm:flex-none sm:px-6 hover:scale-105 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2"
                                style={{ 
                                    backgroundColor: raffle?.color || '#1976d2',
                                }}
                                onClick={() => {
                                    toast.info('Descargando archivo...', { autoClose: 2000 });
                                    // const selectedMethod = payMethods?.find(method => method.payMethode.id.toString() === paymentMethodFilter);
                                    // const methodName = selectedMethod ? capitalize(selectedMethod.payMethode.name) : '';
                                    exelRaffleNumbersFilterDetails(
                                        raffleId!,
                                        {
                                            search: searchParams.search,
                                            amount: searchParams.searchAmount,
                                            ...filter,
                                            paymentMethod: paymentMethodFilter,
                                            startDate: startDate ? startDate.format('YYYY-MM-DD') : undefined,
                                            endDate: endDate ? endDate.format('YYYY-MM-DD') : undefined,
                                            userId: userFilter
                                        },
                                        raffle?.totalNumbers || 0,
                                        // methodName,
                                    );
                                }}
                            >
                                <span className="flex items-center justify-center gap-2">
                                    📄 <span className="hidden sm:inline">Descargar Búsqueda</span> Detallada
                                </span>
                            </button>
                            <button
                                className="flex-1 px-4 py-3 text-sm font-semibold text-white transition-all duration-200 rounded-lg sm:flex-none sm:px-6 hover:scale-105 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2"
                                style={{ 
                                    backgroundColor: raffle?.color || '#1976d2'
                                }}
                                onClick={() => {
                                    toast.info('Descargando archivo...', { autoClose: 2000 });
                                    exelRaffleNumbersFilter(
                                        raffleId!,
                                        {
                                            search: searchParams.search,
                                            amount: searchParams.searchAmount,
                                            ...filter,
                                            paymentMethod: paymentMethodFilter,
                                            startDate: startDate ? startDate.format('YYYY-MM-DD') : undefined,
                                            endDate: endDate ? endDate.format('YYYY-MM-DD') : undefined,
                                            userId: userFilter
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
                    }
                    {/* Switch de selección */}
                    <div className="mt-2">
                        <FormControlLabel 
                            control={
                                <Switch 
                                    checked={optionSeleted} 
                                    onChange={handleSwitchChange}
                                    sx={{
                                        '& .MuiSwitch-switchBase.Mui-checked': {
                                            color: raffle?.color || '#1976d2',
                                            '&:hover': {
                                                backgroundColor: `${raffle?.color || '#1976d2'}14`,
                                            },
                                        },
                                        '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                                            backgroundColor: raffle?.color || '#1976d2',
                                        },
                                    }}
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
                        raffleColor={raffle?.color || '#1976d2'}
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
                        <p 
                            className='text-xl font-bold col-span-full'
                            style={{ color: raffle?.color || '#1976d2' }}
                        >
                            No hay resultados...
                        </p>
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
                    raffleColor={raffle?.color || '#1976d2'}
                />
            </div>
            {raffle && <ViewUsersOfRaffleModal raffleColor={raffle.color || '#1976d2'} raffleId={raffle.id} />}
            {raffle && <UpdateRaffleModal 
                raffle={raffle} 
                refechtRaffle={refechtRaffle}
            />}
            {raffle && raffleNumbers && awards && <PayNumbersModal
                refetch={handleRefetch}
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
                refetch={refetch}
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
                <RafflePayMethodsModal
                    raffleId={raffleId!}
                />
                <RaffleOffersModal
                    raffleId={raffleId!}
                    rafflePrice={+raffle.price}
                />
                </>
            }
        {/* Botón de debug para móviles */}
        {/* <MobileDebugButton /> */}

        </section>
    )
}

export default RaffleNumbersView;