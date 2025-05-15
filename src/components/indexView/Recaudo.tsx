import { useQuery } from "@tanstack/react-query";
import { getRecaudoByRaffle } from "../../api/raffleApi";
import { formatCurrencyCOP } from "../../utils";
import { useEffect } from "react";
import socket from "../../socket";
import { ExpensesTotal } from "../../types";


type RecaudoPros = {
    raffleId: number
    expenseTotal: ExpensesTotal
    expenseTotalByUser: ExpensesTotal
}

function Recaudo({raffleId, expenseTotal, expenseTotalByUser}:RecaudoPros) {

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
        <div className="grid grid-cols-2 gap-3 text-xl font-bold text-center md:grid-cols-3 lg:grid-cols-5">
            <div>
            <p>Recaudado</p>
            <p className="text-azul">{formatCurrencyCOP(data.totalRecaudado)}</p>
            </div>
            <div>
            <p>Vendido</p>
            <p className="text-azul">{formatCurrencyCOP(data.totalVendido)}</p>
            </div>
            <div>
            <p>Por Cobrar</p>
            <p className="text-azul">{formatCurrencyCOP(data.TotalCobrar)}</p>
            </div>
            <div>
            <p>Total Cancelado</p>
            <p className="text-azul">{formatCurrencyCOP(data.TotalCancelPays)}</p>
            </div>
            <div>
            <p>Gasto Total</p>
            <p className="text-azul">{formatCurrencyCOP(expenseTotal.total)}</p>
            </div>
            <div>
            <p>Mi Gasto Total</p>
            <p className="text-azul">{formatCurrencyCOP(expenseTotalByUser.total)}</p>
            </div>
        </div>
    );
}

export default Recaudo