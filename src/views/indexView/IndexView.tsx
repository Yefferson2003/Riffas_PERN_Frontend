import {
    Button,
    Card,
    CardActionArea,
    CardContent,
    CardMedia,
    Chip,
    CircularProgress,
    Pagination,
    TextField,
    Typography,
} from "@mui/material"
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth"
import LockOpenIcon from "@mui/icons-material/LockOpen"
import VisibilityIcon from "@mui/icons-material/Visibility"
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { ChangeEvent, useEffect, useState } from "react"
import { useMediaQuery } from 'react-responsive'
import { useNavigate, useOutletContext } from "react-router-dom"
import { toast } from "react-toastify"
import { getRaffles } from "../../api/raffleApi"
import AddRaffleModal from "../../components/indexView/AddRaffleModal"
import TasasModal from "../../components/indexView/TasasModal"
import socket from "../../socket"
import { User } from "../../types"
import { capitalizeWords, formatCurrencyCOP, formatDateTimeLarge } from "../../utils"
import { exelRafflesDetailsNumber } from "../../utils/exel"
import { isRaffleVisible } from "../../utils/raffleVisibility"

function IndexView() {
    const navigate = useNavigate()
    const [search, setSearch] = useState('');
    const [page, setPage] = useState<number>(1);
    const [rowsPerPage] = useState<number>(4);
    const user : User = useOutletContext();

    // Estado para el modal de tasas
    const [openTasasModal, setOpenTasasModal] = useState(false);

    const isSmallDevice = useMediaQuery({ maxWidth: 768 });

    const handleSeacrhChange = ( e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setSearch(e.target.value)
    };

    const queryClient = useQueryClient()
    const {data, isLoading} = useQuery({
        queryKey: ['raffles', search, page, rowsPerPage],
        queryFn: () => getRaffles({search, page, limit: rowsPerPage})
    })

    const handlePageChange = (_event: React.ChangeEvent<unknown>, newPage: number)=> {
        setPage(newPage);
    }
    
    const handleNavigateNewRaffle = ()=> {
        navigate('?newRaffle=true')
    }
    const handleNavigateRaffleNumbers = (raffleId: number)=> {
        navigate(`/raffle/${raffleId}`)
    }

    useEffect(() => {
        const handleUpdateQuery = (data: {userId: number}) => {
            if (data.userId === user.id) {
                queryClient.invalidateQueries({ queryKey: ['raffles', search, page, rowsPerPage] });
            }
        };
        const handleUpdateQueryDeleteRaffle = () => {
            queryClient.invalidateQueries({ queryKey: ['raffles', search, page, rowsPerPage] });
            
        };

    
        socket.on('assigUser', handleUpdateQuery);
        socket.on('deleteAssigUser', handleUpdateQuery);
        socket.on('deleteRaffle', handleUpdateQueryDeleteRaffle);
    
        return () => {
            socket.off('assigUser', handleUpdateQuery);
            socket.off('deleteAssigUser', handleUpdateQuery);
            socket.off('deleteAssigUser', handleUpdateQueryDeleteRaffle);
        };
    }, [queryClient, user.id, page, rowsPerPage, search]);
    
    if (user) return (
        <section className="w-full pb-10 text-center">
            <div className="flex flex-col items-center justify-between mb-10 lg:flex-row gap-y-5 ">
                {/* ...botones antiguos... */}
                {/* <h2 className="text-3xl font-bold text-center underline lg:text-4xl lg:text-start text-azul w-full max-w-[400px]">INICIO</h2> */}
                <TextField id="search" label="Buscar..." variant="outlined"  size="small"
                    value={search}
                    onChange={handleSeacrhChange}
                    sx={{width: '100%', maxWidth: 300}}
                />
                {user.rol.name !== 'vendedor' &&
                    <Button variant="contained" color="success"
                        onClick={() => {
                            toast.info('Descargando archivo...', { autoClose: 2000 });
                            exelRafflesDetailsNumber(   )
                        }}
                        sx={{width: '100%', maxWidth: 300}}
                    >
                        Descargar Excel 
                    </Button>
                }
                {user.rol.name === 'admin' &&
                    <Button variant="contained"
                        onClick={handleNavigateNewRaffle}
                        sx={{width: '100%', maxWidth: 300}}
                    >
                        Crear Rifa
                    </Button>
                }
                {user.rol.name === 'responsable' &&
                    <Button variant="contained"
                        onClick={handleNavigateNewRaffle}
                        sx={{width: '100%', maxWidth: 300}}
                    >
                        Crear Rifa
                    </Button>
                }

                

            </div>

            {/* Sección de botones de iconos debajo de los botones antiguos */}
            {user.rol.name !== 'vendedor' &&
                <div className="flex flex-row items-center justify-start w-full gap-4 mb-6">
                    <Button
                        variant="outlined"
                        color="primary"
                        size={isSmallDevice ? 'small' : 'medium'}
                        onClick={() => setOpenTasasModal(true)}
                        sx={{ minWidth: 120 }}
                    >
                        Tasas de moneda y cambio
                    </Button>
                    {/* Aquí puedes agregar más botones en el futuro */}
                </div>
            }

            {isLoading && <CircularProgress/>}

            {data &&
                !data.raffles.length &&
                <p className="text-3xl text-azul">Sin resultados...</p>
            }

            {data && 
            <section className="grid justify-center gap-6 lg:grid-cols-2">
                {data.raffles.map(raffle => {
                    const raffleVisible = isRaffleVisible(raffle.visible)

                    return (
                    <Card
                        key={raffle.id}
                        elevation={3}
                        sx={{
                            borderRadius: 3,
                            overflow: 'hidden',
                            transition: 'transform 0.2s, box-shadow 0.2s',
                            '&:hover': { transform: 'translateY(-4px)', boxShadow: 8 },
                            position: 'relative',
                        }}
                    >
                        {/* Badge de visibilidad — solo admin */}
                        {user.rol.name === 'admin' && (
                            <Chip
                                icon={raffleVisible ? <VisibilityIcon fontSize="small" /> : <VisibilityOffIcon fontSize="small" />}
                                label={raffleVisible ? 'Visible' : 'No visible'}
                                color={raffleVisible ? 'success' : 'error'}
                                size="small"
                                sx={{
                                    position: 'absolute',
                                    top: 10,
                                    right: 10,
                                    zIndex: 1,
                                    fontWeight: 700,
                                }}
                            />
                        )}

                        <CardActionArea onClick={() => handleNavigateRaffleNumbers(raffle.id)}>
                            <CardMedia
                                component="img"
                                image={isSmallDevice ? raffle.banerMovileImgUrl || '/banner_default.jpg' : raffle.banerImgUrl || '/banner_default.jpg'}
                                alt={`Banner ${raffle.name}`}
                                sx={{ height: { xs: 160, md: 200 }, objectFit: 'cover' }}
                            />

                            <CardContent sx={{ p: 3 }}>
                                {/* Nombre */}
                                <Typography variant="h6" fontWeight={700} color="primary" gutterBottom>
                                    {capitalizeWords(raffle.name)}
                                </Typography>

                                {/* Responsable */}
                                <div className="flex items-center justify-between mb-2">
                                    <Typography variant="body2" color="text.secondary" fontWeight={600}>
                                        {capitalizeWords(raffle.nameResponsable)}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        NIT: {raffle.nitResponsable}
                                    </Typography>
                                </div>

                                {/* Descripción */}
                                <Typography
                                    variant="body2"
                                    color="text.secondary"
                                    sx={{
                                        display: '-webkit-box',
                                        WebkitLineClamp: 2,
                                        WebkitBoxOrient: 'vertical',
                                        overflow: 'hidden',
                                        mb: 2,
                                        textAlign: 'left',
                                    }}
                                >
                                    {raffle.description}
                                </Typography>

                                {/* Fechas como chips */}
                                <div className="flex flex-wrap gap-2 mb-3">
                                    <Chip
                                        icon={<CalendarMonthIcon fontSize="small" />}
                                        label={`Inicio: ${formatDateTimeLarge(raffle.startDate)}`}
                                        size="small"
                                        variant="outlined"
                                        color="primary"
                                    />
                                    <Chip
                                        icon={<LockOpenIcon fontSize="small" />}
                                        label={`Límite: ${formatDateTimeLarge(raffle.editDate)}`}
                                        size="small"
                                        variant="outlined"
                                        color="warning"
                                    />
                                    <Chip
                                        icon={<CalendarMonthIcon fontSize="small" />}
                                        label={`Juega: ${formatDateTimeLarge(raffle.playDate)}`}
                                        size="small"
                                        variant="outlined"
                                        color="success"
                                    />
                                </div>

                                {/* Precio */}
                                <div className="flex justify-end">
                                    <Chip
                                        label={formatCurrencyCOP(+raffle.price)}
                                        color="primary"
                                        sx={{ fontWeight: 700, fontSize: '1rem', px: 1 }}
                                    />
                                </div>
                            </CardContent>
                        </CardActionArea>
                    </Card>
                    )
                })}

                {data.raffles.length !== 0 &&
                    <div className="mx-auto lg:col-span-2">
                        <Pagination count={data.totalPages} showFirstButton showLastButton 
                            color="primary"
                            onChange={handlePageChange}
                            page={page}
                        /> 
                    </div>
                }
            </section>
            }

        <AddRaffleModal 
            search={search} 
            page={page} 
            rowsPerPage={rowsPerPage}
        />

        {/* Modal de Tasas */}
        <TasasModal 
            open={openTasasModal} 
            onClose={() => setOpenTasasModal(false)}
            rol={user.rol.name}
        />
        
        </section>
    )
}

export default IndexView