import { Box, Collapse, IconButton, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Tooltip } from "@mui/material"
import { ExpenseResponseType, ExpensesType, ExpensesWithUserType } from "../../../../types"
import React from "react";
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import { formatCurrencyCOP, formatDateTimeLarge } from "../../../../utils";
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useNavigate, useParams } from "react-router-dom";
import { QueryObserverResult, RefetchOptions, useMutation } from "@tanstack/react-query";
import { deleteExpense } from "../../../../api/expensesApi";
import { toast } from "react-toastify";

type TableExpensesProps = {
    expenses: (ExpensesWithUserType | ExpensesType)[];
    isAdmin: boolean;
    refecht?: (options?: RefetchOptions) => Promise<QueryObserverResult<ExpenseResponseType | undefined, Error>>;
};

type RowDataType = ExpensesType | ExpensesWithUserType;

function Row(props: { 
    row: RowDataType, 
    isAdmin?: boolean,
    handleDeleteExpense: (expenseId: number) => void,
    isPending: boolean
}) {
    const { row, isAdmin, handleDeleteExpense, isPending } = props;
    const [open, setOpen] = React.useState(false);

    const navigate = useNavigate();

    const handleUpdateExpenseModal = (expenseId: number) => {
        const currentParams = new URLSearchParams(location.search);
        currentParams.set('updateExpense', expenseId.toString());
        navigate(`${location.pathname}?${currentParams.toString()}`);
    };

    // Type guard para verificar si el tipo es ExpensesWithUserType
    const isWithUserType = (row: RowDataType): row is ExpensesWithUserType => {
        return (row as ExpensesWithUserType).user !== undefined;
    };

    return (
        <React.Fragment>
            <TableRow sx={{ '& > *': { borderBottom: 'unset' } }}>
                <TableCell>
                    <IconButton
                        aria-label="expand row"
                        size="small"
                        onClick={() => setOpen(!open)}
                    >
                        {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                    </IconButton>
                </TableCell>
                <TableCell component="th" scope="row">
                    <p className="capitalize">{row.name}</p>
                </TableCell>
                <TableCell>{formatCurrencyCOP(+row.amount)}</TableCell>
            </TableRow>
            <TableRow>
                <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
                    <Collapse in={open} timeout="auto" unmountOnExit>
                        <Box sx={{ margin: 1, display: 'flex', justifyContent: 'center' }}>
                            {isAdmin ? (
                                <div className="flex flex-col">
                                <p><strong>Fecha:</strong> {formatDateTimeLarge(row.createdAt)}</p>
                                {isWithUserType(row) && (
                                    <>
                                        <p><strong>Usuario:</strong> {row.user.firstName + row.user.lastName}</p>
                                        <p><strong>Identificación:</strong> {row.user.identificationNumber}</p>
                                    </>
                                )}
                                    
                                </div>
                            ) : (
                                <>
                                    <IconButton color="primary" onClick={() => handleUpdateExpenseModal(row.id)}>
                                        <Tooltip title={"Editar Gasto"} placement="bottom-start">
                                            <EditIcon />
                                        </Tooltip>
                                    </IconButton>
                                    <IconButton
                                        color="error"
                                        onClick={() => handleDeleteExpense(row.id)}
                                        disabled={isPending && row.id === row.id}
                                    >
                                        <Tooltip title={"Eliminar Gasto"} placement="bottom-start">
                                            <DeleteIcon />
                                        </Tooltip>
                                    </IconButton>
                                </>
                            )}
                        </Box>
                    </Collapse>
                </TableCell>
            </TableRow>
        </React.Fragment>
    );
}

function TableExpenses( { expenses, isAdmin, refecht }: TableExpensesProps) {

    const { raffleId } = useParams<{ raffleId: string }>();

    const {mutate, isPending} = useMutation({
        mutationFn: deleteExpense,
        onError(error) {
            toast.error(error.message)
        },
        onSuccess(data) {
            toast.success(data)
            refecht?.()
        },
    })

    const handleDeleteExpense = (expenseId: number) => {
        const data = {
            raffleId: raffleId!,
            expenseId: expenseId.toString()
        }
        mutate(data)
    }

    return (
        <TableContainer component={Paper} sx={{ maxHeight: 440 }} >
            <Table aria-label="collapsible table" size="small" stickyHeader>
            <TableHead>
                <TableRow>
                <TableCell>{isAdmin ? 'Detalles' : 'Opciones'}</TableCell>
                <TableCell>Gasto</TableCell>
                <TableCell>Valor</TableCell>
                </TableRow>
            </TableHead>
            <TableBody>
                {expenses.map((expense) => (
                    <Row 
                        key={expense.id} 
                        row={expense} 
                        isAdmin={isAdmin}
                        handleDeleteExpense={handleDeleteExpense}
                        isPending={isPending}
                    />
                ))}
            </TableBody>
            </Table>
        </TableContainer>
    )
}

export default TableExpenses
