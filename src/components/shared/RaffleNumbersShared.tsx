import LocalActivityIcon from '@mui/icons-material/LocalActivity';
import { Chip, Pagination, Skeleton } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useNavigate } from 'react-router-dom';
import { getRaffleNumersShared } from "../../api/raffleNumbersApi";
import { colorStatusRaffleNumber, formatCurrencyCOP, formatWithLeadingZeros } from "../../utils";
import ViewRaffleNumberSharedModal from './ViewRaffleNumberSharedModal';
import { AwardType, Raffle } from '../../types';

type RaffleNumbersSharedProps = {
    awards: AwardType[]
    raffle: Raffle
    token: string
    price: string
}

function RaffleNumbersShared({ token, raffle, price, awards}: RaffleNumbersSharedProps) {

    const navigate = useNavigate()

    const [page, setPage] = useState<number>(1);
    const [rowsPerPage] = useState<number>(100);

    const { data: raffleNumbers, isLoading, refetch } = useQuery({
        queryKey: ['raffleNumbersShared', token, page, rowsPerPage],
        queryFn: () => getRaffleNumersShared({ page, limit: rowsPerPage, token }),
        enabled: !!token,
    });

    const handlePageChange = (_event: React.ChangeEvent<unknown>, newPage: number)=> {
        setPage(newPage);
    }

    const handleNavigateViewRaffleNumber = (raffleNumberId: number) => {
        navigate(`?viewRaffleNumber=${raffleNumberId}`)
    }

    return (
        <div>
            <div className="flex flex-col items-center justify-center gap-2 mb-5 text-2xl font-bold text-azul">
                <div className='flex items-center gap-2'>
                <LocalActivityIcon/>
                <h2>Apartar Boletas</h2>
                </div>
                <h3 className='text-xl font-bold'>{formatCurrencyCOP(+price)}</h3>
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
                ) : raffleNumbers && token && raffleNumbers.total && raffleNumbers.raffleNumbers.length === 0 ? (
                    <p className='text-xl font-bold col-span-full text-azul'>No hay resultados...</p>
                ) : (
                    raffleNumbers && raffleNumbers.raffleNumbers.map(raffleNumber => (
                        <Chip
                            sx={{ height: 35, fontWeight: 'bold' }}
                            key={raffleNumber.id} 
                            label={formatWithLeadingZeros(raffleNumber.number, raffleNumbers.total)} 
                            variant="filled" 
                            size="small"
                            disabled={raffleNumber.status !== 'available'}
                            color={colorStatusRaffleNumber[raffleNumber.status]}
                            onClick={() => handleNavigateViewRaffleNumber(raffleNumber.id)}
                        />
                    ))
                )}
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


            {raffleNumbers && token && <ViewRaffleNumberSharedModal
                totalNumbers={raffleNumbers.total}
                awards={awards}
                raffle={raffle}
                token={token}
                raffleRefetch={refetch}
            />}
        </div>
    );
}

export default RaffleNumbersShared;
