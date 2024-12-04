import { useQuery } from '@tanstack/react-query';
import { getRaffleById, getUsersByRaffle } from '../api/raffleApi';
import { getRaffleNumers } from '../api/raffleNumbersApi';


export const useRaffleById = (raffleId: number) => {
    return useQuery({queryKey: ['raffles', raffleId], queryFn: () => getRaffleById(raffleId)});
};

export const useRaffleNumbers = (raffleId: number, {filter, page, limit, search} : {filter : object, page : number, limit : number, search: string}) => {

    const params = {
        ...filter,
        page,
        limit,
        search
    }
    return useQuery({
        queryKey: ['raffleNumbers', search, raffleId, filter, page, limit ],
        queryFn: () => getRaffleNumers({ raffleId, params }),
        enabled: !!raffleId,
    });
};

export const useUsersRaffle = (raffleId: number, show: boolean) => {
    return useQuery({
        queryKey: ['usersRaffle', raffleId],
        queryFn: () => getUsersByRaffle(raffleId),
        enabled: show,
        retry: false
    })
}


