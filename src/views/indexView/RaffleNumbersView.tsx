import DescriptionIcon from '@mui/icons-material/Description';
import EditIcon from '@mui/icons-material/Edit';
import GroupIcon from '@mui/icons-material/Group';
import KeyboardReturnIcon from '@mui/icons-material/KeyboardReturn';
import LocalActivityIcon from '@mui/icons-material/LocalActivity';
import { Chip, CircularProgress, FormControl, FormControlLabel, IconButton, MenuItem, Pagination, Select, SelectChangeEvent, Switch, TextField, Tooltip } from "@mui/material";
import { useEffect, useState } from "react";
import { Navigate, useNavigate, useOutletContext, useParams } from "react-router-dom";
import { toast } from 'react-toastify';
import NumbersSeleted from '../../components/indexView/NumbersSeleted';
import PayNumbersModal from '../../components/indexView/PayNumbersModal';
import PaymentSellNumbersModal from '../../components/indexView/PaymentSellNumbersModal';
import UpdateRaffleModal from '../../components/indexView/UpdateRaffleModal';
import ViewRaffleNumberData from '../../components/indexView/ViewRaffleNumberData';
import ViewUsersOfRaffleModal from '../../components/indexView/ViewUsersOfRaffleModal';
import { useRaffleById, useRaffleNumbers } from "../../hooks/useRaffle";
import socket from '../../socket';
import { RaffleNumbersPayments, User } from "../../types";
import { colorStatusRaffleNumber, formatCurrencyCOP, formatDateTimeLarge, formatWithLeadingZeros } from "../../utils";
import exportRaffleNumbers from '../../utils/exel';
import LoaderView from "../LoaderView";
import ButtonDeleteRaffle from '../../components/indexView/ButtonDeleteRaffle';
import Recaudo from '../../components/indexView/Recaudo';

const styleForm = {
    width: '100%',
    maxWidth: 600,
    display: 'flex',
    gap: 1,
    justifyContent: 'center',
    flexDirection: {
        xs: 'column', // Para pantallas pequeñas
        sm: 'row',    // Para pantallas más grandes
    },
}

function RaffleNumbersView() {
    const navigate = useNavigate()
    
    const { raffleId } = useParams<{ raffleId: string }>();
    const parsedRaffleId = raffleId ? parseInt(raffleId, 10) : undefined;
    const user : User = useOutletContext();
    const [page, setPage] = useState<number>(1);
    const [rowsPerPage] = useState<number>(100);


    const [paymentsSellNumbersModal, setPaymentsSellNumbersModal] = useState(false);
    const [pdfData, setPdfData] = useState<RaffleNumbersPayments | undefined>();


    const [optionSeleted, setOptionSeleted] = useState(false)
    const [numbersSeleted, setNumbersSeleted] = useState<{numberId: number, number: number}[]>([])

    const [filter, setFilter] = useState({});
    const [search, setSearch] = useState('');

    const handleChangeSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearch(e.target.value)
    }

    const handleFilterChange = (e : SelectChangeEvent<object | string>) => {
        const value = e.target.value;

        if (value === 'all') {
            setFilter({});
        } else if (value === 'sold') {
            setFilter({ sold: true });
        } else if (value === 'available') {
            setFilter({ available: true });
        } else if (value === 'pending') {
            setFilter({ pending: true });
        }
    };

    const handlePageChange = (_event: React.ChangeEvent<unknown>, newPage: number)=> {
        setPage(newPage);
    }

    const handleSwitchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setOptionSeleted(e.target.checked)
    }

    const { data: raffleNumbers, isLoading : isLoadingRaffleNumbers, isError : isErrorRaffleNumbers, refetch} = useRaffleNumbers(parsedRaffleId!, {filter, page, limit: rowsPerPage, search});

    const { data: raffle, isLoading :isLoadingRaffle , isError: isErrorRaffle } = useRaffleById(parsedRaffleId!);
    
    const handleNavigateHome = () => {
        navigate('/')
    }
    const handleNavigateUpdateRaffle = () => {
        navigate('?updateRaffle=true')
    }
    const handleNavigateViewUsers = () => {
        navigate('?viewUsers=true')
    }
    const handleNavigateViewRaffleNumber = (raffleNumberId: number) => {
        navigate(`?viewRaffleNumber=${raffleNumberId}`)
    }
    // const handleNavigateNumbersSold = () => {
    //     navigate(`?numbersSold=true`)
    // }


    const MAX_SELECTED_NUMBERS = 10; 
    const toggleSelectNumber = (raffleNumberId: number, raffleNumberStatus: string, raffleNumber: number) => {
        if (raffleNumberStatus === 'available') {
            setNumbersSeleted((prevSelected) => {

                if (prevSelected.length >= MAX_SELECTED_NUMBERS) {
                    return prevSelected
                }
                
                if (!prevSelected) return [{ numberId: raffleNumberId, number: raffleNumber }];
    
                const isSelected = prevSelected.some((item) => item.numberId === raffleNumberId);
    
                if (isSelected) {
                    return prevSelected.filter((item) => item.numberId !== raffleNumberId);
                } else {
                    return [...prevSelected, { numberId: raffleNumberId, number: raffleNumber }];
                }
            });
        }
    };

    useEffect(() => {

        const handleUpdateQuery = (data: {raffleId: number}) => {
            if (raffleId) {
                if (data.raffleId === +raffleId) {
                    refetch()
                }
            }
        };
        

        socket.on('sellNumbers', handleUpdateQuery);
        socket.on('sellNumber', handleUpdateQuery);
    
        return () => {
            socket.off('sellNumbers', handleUpdateQuery);
            socket.off('sellNumber', handleUpdateQuery);
        };
    }, [raffleId, refetch]);

    if (isLoadingRaffle || isLoadingRaffleNumbers && !raffle && !raffleNumbers) return <LoaderView/>;
    if (isErrorRaffle || isErrorRaffleNumbers) return <Navigate to={'/404'}/>;
    if (raffle && user.rol.name !== 'admin' && raffle.userRiffle  && !raffle.userRiffle.some(user => user.userId === user.userId) ) return <Navigate to={'/404'}/>;
    
    return (
        <section className="flex flex-col-reverse w-full pb-10 text-center lg:flex-col *:bg-white *:p-2 gap-5 *:rounded-xl">
            <div className='flex justify-between order-1 lg:order-none'>
                <div className=''>
                <IconButton>
                    <Tooltip title='Regresar'
                        onClick={handleNavigateHome}
                    >
                    <KeyboardReturnIcon/>
                    </Tooltip>
                </IconButton>
                </div>
                
                
                <div className=''>
                { user.rol.name !== 'vendedor' && 
                    <IconButton
                        onClick={handleNavigateViewUsers}
                    >
                        <Tooltip title={'Colaboradores'} >
                            <GroupIcon/>
                        </Tooltip>
                    </IconButton>
                }
                { user.rol.name === 'admin' && 
                    <IconButton
                        onClick={handleNavigateUpdateRaffle}
                        >
                        <Tooltip title={'Editar Categoria'} placement="bottom-start">
                            <EditIcon/>
                        </Tooltip>
                    </IconButton>
                }
                {user.rol.name !== 'vendedor' && 
                    <IconButton
                        onClick={() => {
                            exportRaffleNumbers(raffleId, raffle?.nitResponsable)
                            toast.info('Descargando archivo...')
                        }}
                    >
                        <Tooltip title={'Boletas Vendidas'} placement="bottom-start">
                        <DescriptionIcon color='success'/>
                        </Tooltip>
                    </IconButton>
                }
                {user.rol.name === 'admin' && raffle &&
                    <ButtonDeleteRaffle raffleId={raffle.id}/>
                }
                    
                </div>
                
            </div>
            
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
                
                { raffle && raffleId && user.rol.name !== 'vendedor' && <Recaudo raffleId={+raffleId}/>}

                <img 
                    className="object-cover w-full h-40"
                    src={raffle?.banerImgUrl || '/banner_default.jpg'} 
                    alt="banner riffa" 
                />
            </div>

            <div>
                <div className="flex items-center justify-center gap-2 mb-5 text-2xl font-bold text-azul">
                    <LocalActivityIcon/>
                    <h2>Comprar Boletas</h2>
                </div>
                
                <div className='flex flex-col items-center justify-center gap-2 mb-5'>
                    {raffle && <h3 className='text-xl font-bold '>{formatCurrencyCOP(+raffle.price)}</h3>}
                    <FormControl size="small"
                        variant='filled'
                        sx={styleForm}
                    >
                        <Select
                            labelId="demo-simple-select-label"
                            id="demo-simple-select"
                            
                            value={Object.keys(filter)[0] || 'all'}
                            onChange={handleFilterChange}
                        >
                            <MenuItem value={'all'}>Todos</MenuItem>
                            <MenuItem value={'available'}>Disponibles</MenuItem>
                            <MenuItem value={'pending'}>Pendientes</MenuItem>
                            <MenuItem value={'sold'}>Vendidos</MenuItem>
                        </Select>
                        <TextField id='search' label="Buscar..." size='small'
                            variant='filled'
                            value={search}
                            onChange={handleChangeSearch}
                        />
                    </FormControl>
                    <FormControlLabel control={<Switch value={optionSeleted} onChange={handleSwitchChange} />} label="Seleccionar Números" />
                </div>
                
                <NumbersSeleted numbersSeleted={numbersSeleted} setNumbersSeleted={setNumbersSeleted}/>
                <section className="grid grid-cols-5 cursor-pointer gap-x-1 gap-y-3 md:grid-cols-10 md:grid-rows-10">
                    
                    
                    {isLoadingRaffleNumbers && <div className='col-span-full'><CircularProgress/></div>}
                    { raffleNumbers &&
                        raffleNumbers.raffleNumbers.length === 0 ? (
                            <p className='text-xl font-bold col-span-full text-azul'>No hay resultados...</p>
                        ) : (
                            raffleNumbers && raffleNumbers.raffleNumbers.map(raffleNumber => (
                                <Chip 
                                    sx={{height: 35, fontWeight: 'bold' }}
                                    key={raffleNumber.id} 
                                    label={formatWithLeadingZeros(raffleNumber.number)} 
                                    variant="filled" 
                                    size="small"
                                    color={colorStatusRaffleNumber[raffleNumber.status]}
                                    onClick={optionSeleted ? 
                                        () => toggleSelectNumber(raffleNumber.id, raffleNumber.status, raffleNumber.number) : () => handleNavigateViewRaffleNumber(raffleNumber.id)
                                    }
                                />
                            ))
                        )
                    }
                </section>

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
            </div>
        {raffle && <ViewUsersOfRaffleModal raffleId={raffle.id}/>}
        {raffle && <UpdateRaffleModal raffle={raffle} />}
        {raffle && raffleNumbers && <PayNumbersModal 
            numbersSeleted={numbersSeleted} 
            raffleId={raffle.id}
            setNumbersSeleted={setNumbersSeleted}
            setPaymentsSellNumbersModal={setPaymentsSellNumbersModal}
            setPdfData={setPdfData}
        />}
        {raffle && raffleNumbers && pdfData && <PaymentSellNumbersModal
            raffle={raffle}
            setPaymentsSellNumbersModal={setPaymentsSellNumbersModal}
            setPdfData={setPdfData}
            paymentsSellNumbersModal={paymentsSellNumbersModal}
            pdfData={pdfData}
        />}
        {raffle && raffleNumbers && <ViewRaffleNumberData
            setPaymentsSellNumbersModal={setPaymentsSellNumbersModal}
            setPdfData={setPdfData}
        />}
        {/* {raffle && raffleNumbers && <ViewNumbersSoldModal/>} */}
        </section>
    )
}

export default RaffleNumbersView