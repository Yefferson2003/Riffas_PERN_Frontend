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
        <div className="flex flex-wrap justify-around gap-3 text-xl font-bold text-center">
            <div>
            <p>Recaudado</p>
            <p className=" text-azul">{formatCurrencyCOP(data.totalRecaudado)}</p>
            </div>
            <div>
            <p>Vendido</p>
            <p className=" text-azul">{formatCurrencyCOP(data.totalVendido)}</p>
            </div>
            <div>
            <p>Por Cobrar</p>
            <p className=" text-azul">{formatCurrencyCOP(data.TotalCobrar)}</p>
            </div>
            <div>
            <p>Total Cancelado</p>
            <p className=" text-azul">{formatCurrencyCOP(data.TotalCancelPays)}</p>
            </div>
        </div>
    );
}

export default Recaudo