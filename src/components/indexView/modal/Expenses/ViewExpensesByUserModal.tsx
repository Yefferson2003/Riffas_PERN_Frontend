import { Box, Button, Modal, TablePagination } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useNavigate, useOutletContext, useParams } from "react-router-dom";
import ButtonCloseModal from "../../../ButtonCloseModal";
import { getExpensesByUser } from "../../../../api/expensesApi";
import TableExpenses from "./TableExpenses";
import AddExpenseModal from "./AddExpenseModal";
import UpdateExpenseModal from "./UpdateExpenseModal";
import { User } from "../../../../types";


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

function ViewExpensesByUserModal() {

    const navigate = useNavigate()
    const { raffleId } = useParams<{ raffleId: string }>();
    const user : User = useOutletContext();

    const queryParams = new URLSearchParams(location.search)
    const modalviewExpenses = queryParams.get('viewExpenses')
    const show = modalviewExpenses === 'true'

    const [page, setPage] = useState<number>(0);
    const [limit, setLimit] = useState<number>(4);

    const { data, isLoading, refetch} = useQuery({
        queryKey: ['expensesByUser', raffleId, page, limit, user.id],
        queryFn: () => getExpensesByUser({raffleId: raffleId!, params: {page : page + 1, limit}}),
        enabled: show,
    })

    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
        setLimit(parseInt(event.target.value, 10));
        setPage(0); 
    };
    
    const handlePageChange = (_event: unknown, newPage: number) => {
        setPage(newPage);
    };

    const handleNewExpense = () => {
        const currentParams = new URLSearchParams(location.search);
        currentParams.set('addExpense', 'true');
        navigate(`${location.pathname}?${currentParams.toString()}`);
    }
    
    return (
        <Modal
            open={show}
            onClose={() => {
                navigate(location.pathname, {replace: true})
            }}
            aria-labelledby="modal-modal-title"
            aria-describedby="modal-modal-description"
        >
            <Box sx={style}>
                <ButtonCloseModal/>
                
                <div className="flex flex-col items-center justify-between gap-4 mt-5 md:flex-row ">
                    <h2 className="text-3xl font-bold md:text-center ">Mis Gastos</h2>
                    
                    <Button
                        variant="contained"
                        onClick={handleNewExpense}
                    >Agregar Gasto</Button>
                </div>

                <div className="w-full h-1 my-3 bg-baclk"></div>

                {isLoading && (
                    <div className="flex items-center justify-center w-full h-full">
                        <p className="text-2xl font-bold text-center">Cargando...</p>
                    </div>
                )}

                {!isLoading && data?.expenses.length == 0 && (
                    <div className="flex items-center justify-center w-full h-full">
                        <p className="text-xl font-bold text-center">No hay gastos registrados</p>
                    </div>
                )}
                
                {!isLoading && data && data.expenses.length > 0  && (
                    <>
                    <TableExpenses
                        expenses={data.expenses}
                        isAdmin={false}
                        refecht={refetch}
                    />
                    <TablePagination
                        rowsPerPageOptions={[4, 8, 12]}
                        component="div"
                        count={data.total}
                        rowsPerPage={limit}
                        page={page}
                        onPageChange={handlePageChange}
                        onRowsPerPageChange={handleChangeRowsPerPage}
                    ></TablePagination>
                    </>
                )}

                <AddExpenseModal 
                    refecht={refetch}
                />
                <UpdateExpenseModal 
                    refecht={refetch}
                />
                
            </Box>
        </Modal>
    )
}

export default ViewExpensesByUserModal
