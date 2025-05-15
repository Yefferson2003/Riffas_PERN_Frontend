import { Box, Modal, TablePagination } from "@mui/material";
import { useQueries } from "@tanstack/react-query";
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getExpenses } from "../../../../api/expensesApi";
import { formatCurrencyCOP } from "../../../../utils";
import ButtonCloseModal from "../../../ButtonCloseModal";
import TableExpenses from "./TableExpenses";

const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 550,
    maxWidth: '100vw',
    bgcolor: '#f1f5f9',
    border: '2px solid #000',
    boxShadow: 24,
    p: 4,
    maxHeight: '95vh', 
    overflowY: 'auto',
};

type ViewAdminExpensesModalProps = {
    expensesTotal: {
        total: number;
    } | undefined,
    isLoadingExpenseTotal: boolean
}

function ViewAdminExpensesModal( { expensesTotal, isLoadingExpenseTotal } : ViewAdminExpensesModalProps) {
    const navigate = useNavigate();
    const { raffleId } = useParams<{ raffleId: string }>();

    const queryParams = new URLSearchParams(location.search);
    const modalviewExpenses = queryParams.get('viewExpensesByRaffle');
    const show = modalviewExpenses === 'true';

    const [page, setPage] = useState<number>(0);
    const [limit, setLimit] = useState<number>(4);

    // Ejecutar ambos queries en paralelo
    const [expensesQuery] = useQueries({
        queries: [
            {
                queryKey: ['expensesByRaffler', raffleId, page, limit],
                queryFn: () => getExpenses({ raffleId: raffleId!, params: { page: page + 1, limit } }),
                enabled: show,
            }
        ],
    });

    const { data: expensesData, isLoading: isLoadingExpenses } = expensesQuery;
    // const { data: expensesTotal, isLoading: isLoadingTotal } = expensesTotalQuery;

    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
        setLimit(parseInt(event.target.value, 10));
        setPage(0); 
    };
    
    const handlePageChange = (_event: unknown, newPage: number) => {
        setPage(newPage);
    };

    return (
        <Modal
            open={show}
            onClose={() => {
                navigate(location.pathname, { replace: true });
            }}
            aria-labelledby="modal-modal-title"
            aria-describedby="modal-modal-description"
        >
            <Box sx={style}>
                <ButtonCloseModal />

                <h2 className="text-2xl font-bold text-center">Gastos acumulados de la rifa</h2>

                {expensesTotal && 
                    <div className="flex justify-between mt-5 text-xl ">
                        <h3>Gasto totales: </h3>
                        <p className="font-bold text-rojo">{formatCurrencyCOP(expensesTotal.total)}</p>
                    </div>
                }

                <div className="w-full h-1 my-3 bg-baclk"></div>

                {(isLoadingExpenses || isLoadingExpenseTotal) && (
                    <div className="flex items-center justify-center w-full h-full">
                        <p className="text-2xl font-bold text-center">Cargando...</p>
                    </div>
                )}

                {!isLoadingExpenses && expensesData?.expenses.length === 0 && (
                    <div className="flex items-center justify-center w-full h-full">
                        <p className="text-xl font-bold text-center">No hay gastos registrados</p>
                    </div>
                )}
                
                {!isLoadingExpenses && expensesData && expensesData.expenses.length > 0 && (
                    <>
                        <TableExpenses
                            expenses={expensesData.expenses}
                            isAdmin={true}
                        />
                        <TablePagination
                            rowsPerPageOptions={[4, 8, 12]}
                            component="div"
                            count={expensesData.total}
                            rowsPerPage={limit}
                            page={page}
                            onPageChange={handlePageChange}
                            onRowsPerPageChange={handleChangeRowsPerPage}
                        ></TablePagination>
                    </>
                )}
            </Box>
        </Modal>
    );
}

export default ViewAdminExpensesModal;
