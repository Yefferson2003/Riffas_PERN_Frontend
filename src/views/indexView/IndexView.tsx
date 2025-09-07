import { Button, CircularProgress, Pagination, TextField } from "@mui/material"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { ChangeEvent, useEffect, useState } from "react"
import { getRaffles } from "../../api/raffleApi"
import { formatCurrencyCOP, formatDateTimeLarge } from "../../utils"
import { useNavigate, useOutletContext } from "react-router-dom"
import AddRaffleModal from "../../components/indexView/AddRaffleModal"
import { useMediaQuery } from 'react-responsive';
import { User } from "../../types"
import socket from "../../socket"
import { toast } from "react-toastify"
import { exelRafflesDetailsNumber } from "../../utils/exel"

function IndexView() {
    const navigate = useNavigate()
    const [search, setSearch] = useState('');
    const [page, setPage] = useState<number>(1);
    const [rowsPerPage] = useState<number>(4);
    const user : User = useOutletContext();

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
    
    return (
        <section className="w-full pb-10 text-center">
            <div className="flex flex-col items-center justify-between mb-10 lg:flex-row gap-y-5 ">
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
                            exelRafflesDetailsNumber()
                        }}
                        sx={{width: '100%', maxWidth: 300}}
                    >
                        Descargar Exel 
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

            {isLoading && <CircularProgress/>}

            {data &&
                !data.raffles.length &&
                <p className="text-3xl text-azul">Sin resultados...</p>
            }

            {data && 
            <section className="grid justify-center gap-8 lg:grid-cols-2">
                {data.raffles.map(raffle => (
                    <div key={raffle.id} 
                        className="pb-3 space-y-3 overflow-hidden text-lg transition transform bg-white cursor-pointer rounded-2xl hover:scale-105 hover:opacity-90 text-azul"
                        onClick={() => handleNavigateRaffleNumbers(raffle.id)}
                    >
                        <img 
                            className="w-full lg:object-cover lg:h-40 "
                            src={isSmallDevice ? raffle.banerMovileImgUrl || '/banner_default.jpg' : raffle.banerImgUrl  || '/banner_default.jpg'}
                            alt="banner riffa" 
                        />

                        <div className="space-y-3 text-center md:px-3 ">
                        <div className="items-start md:justify-between md:flex">
                            <p className="text-2xl font-bold">{raffle.name}</p>
                        </div>

                        <div className="items-start md:justify-between md:flex">
                            <p className="text-xl font-bold">{raffle.nameResponsable}</p>
                            <p className="text-xl font-bold">{raffle.nitResponsable}</p>
                        </div>

                        <p className="px-2 text-justify md:px-0">{raffle.description}</p>

                        <div className="space-y-3 md:justify-between md:flex md:space-y-0">
                            <div>
                                <p className="text-xl font-bold">Inicio</p>
                                <p>{formatDateTimeLarge(raffle.startDate)}</p>   
                            </div>

                            <div>
                                <p className="text-xl font-bold">Limite Compra</p>
                                <p>{formatDateTimeLarge(raffle.editDate)}</p>
                            </div>
                            <div>
                                <p className="text-xl font-bold">Juega</p>
                                <p>{formatDateTimeLarge(raffle.playDate)}</p>
                            </div>
                        </div>

                        <p className="text-2xl font-bold text-center">{formatCurrencyCOP(+raffle.price)}</p>
                        </div>
                        
                    </div>
                ))}

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

        
        </section>
    )
}

export default IndexView