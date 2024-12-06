import { useQuery } from "@tanstack/react-query";
import { getRecaudoByRaffle } from "../../api/raffleApi";
import { formatCurrencyCOP } from "../../utils";
import { useEffect } from "react";
import socket from "../../socket";


type RecaudoPros = {
    raffleId: number
}

function Recaudo({raffleId}:RecaudoPros) {

    const {data, refetch} = useQuery({
        queryKey: ['recaudo', raffleId],
        queryFn: () =>  getRecaudoByRaffle(raffleId)
    })

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


    if (data)return (
        <div className="text-xl font-bold text-center text-azul">
            <p>Recaudado: {formatCurrencyCOP(data.total)}</p>
        </div>
    );
}

export default Recaudo