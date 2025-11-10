import { useQuery } from "@tanstack/react-query";
import { getRecaudoByRaffle } from "../../api/raffleApi";
import { formatCurrencyCOP } from "../../utils";
import { useEffect } from "react";
import socket from "../../socket";
import { ExpensesTotal, User } from "../../types";
import { useOutletContext } from "react-router-dom";


type RecaudoPros = {
    raffleId: number
    expenseTotal: ExpensesTotal
    expenseTotalByUser: ExpensesTotal
    raffleColor?: string
}

function Recaudo({raffleId, expenseTotal, expenseTotalByUser, raffleColor = '#1976d2'}:RecaudoPros) {

        const user : User = useOutletContext();

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
        <div className="grid items-center grid-cols-1 gap-3 text-xl font-bold text-center md:grid-cols-3 lg:grid-cols-5">
            <div>
            <p>Recaudado</p>
            <p style={{ color: raffleColor }}>{formatCurrencyCOP(data.totalRecaudado)}</p>
            </div>
            <div>
            <p>Pagados</p>
            <p style={{ color: raffleColor }}>{formatCurrencyCOP(data.totalVendido)}</p>
            </div>
            <div>
            <p>Por Cobrar</p>
            <p style={{ color: raffleColor }}>{formatCurrencyCOP(data.TotalCobrar)}</p>
            </div>
            <div>
            <p>Rechazados</p>
            <p style={{ color: raffleColor }}>{formatCurrencyCOP(data.TotalCancelPays)}</p>
            </div>
            <div>
            <p>Gasto Total</p>
            <p style={{ color: raffleColor }}>{formatCurrencyCOP(expenseTotal.total)}</p>
            </div>
            {user.rol.name === 'responsable' &&
            <div>
            <p>Mi Gasto Total</p>
            <p style={{ color: raffleColor }}>{formatCurrencyCOP(expenseTotalByUser.total)}</p>
            </div>
            }
        </div>
    );
}

export default Recaudo