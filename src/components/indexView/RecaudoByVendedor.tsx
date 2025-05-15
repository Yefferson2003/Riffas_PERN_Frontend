import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { getRecaudoByVendedor } from "../../api/raffleApi";
import socket from "../../socket";
import { formatCurrencyCOP } from "../../utils";
import { ExpensesTotal, User } from "../../types";
import { useOutletContext } from "react-router-dom";


type RecaudoPros = {
    raffleId: number
    expenseTotalByUser: ExpensesTotal
}

function RecaudoByVendedor({raffleId, expenseTotalByUser}:RecaudoPros) {

    const user : User = useOutletContext();

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
        <div className="grid grid-cols-2 gap-3 text-xl font-bold text-center md:grid-cols-3 lg:grid-cols-5">
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
            {user.rol.name === 'responsable' &&
            <>
            <p>Mi Gasto Total</p>
            <p className="text-azul">{formatCurrencyCOP(expenseTotalByUser.total)}</p>
            </>
            }
        </div>
    );
}

export default RecaudoByVendedor