import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { getRecaudoByVendedor } from "../../api/raffleApi";
import socket from "../../socket";
import { formatCurrencyCOP } from "../../utils";


type RecaudoPros = {
    raffleId: number
}

function RecaudoByVendedor({raffleId}:RecaudoPros) {

    const {data, refetch} = useQuery({
        queryKey: ['recaudoByVendedor', raffleId],
        queryFn: () =>  getRecaudoByVendedor(raffleId)
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
            <p>Números vendidos</p>
            <p className=" text-azul">{(data.totalRaffleNumber[0])}</p>
            </div>
            <div>
            <p>Números Pendientes</p>
            <p className=" text-azul">{(data.totalRaffleNumber[1])}</p>
            </div>
            <div>
            <p>Recaudado</p>
            <p className=" text-azul">{formatCurrencyCOP(data.totalRecaudado)}</p>
            </div>
            <div>
            <p>Por Cobrar</p>
            <p className=" text-azul">{formatCurrencyCOP(data.totalCobrar)}</p>
            </div>
            <div>
            <p>Total Cancelado</p>
            <p className=" text-azul">{formatCurrencyCOP(data.totalCancelado)}</p>
            </div>
        </div>
    );
}

export default RecaudoByVendedor