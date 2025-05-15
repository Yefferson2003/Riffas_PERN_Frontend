import { Box, Button, IconButton, Modal, Tooltip } from "@mui/material"
import ExpenseForm from "./ExpenseForm";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import CloseIcon from '@mui/icons-material/Close';
import { QueryObserverResult, RefetchOptions, useMutation, useQuery } from "@tanstack/react-query";
import { ExpenseFormType, ExpenseResponseType, ExpensesTotal } from "../../../../types";
import { getExpensesById, updateExpense } from "../../../../api/expensesApi";
import { useForm } from "react-hook-form";
import { useEffect } from "react";
import { toast } from "react-toastify";

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

type AddExpenseModalProps = {
    refecht: (options?: RefetchOptions) => Promise<QueryObserverResult<ExpenseResponseType | undefined, Error>>
    refechtExpenseTotal: (options?: RefetchOptions) => Promise<QueryObserverResult<ExpensesTotal | undefined, Error>>
    refechtExpenseTotalByUser: (options?: RefetchOptions) => Promise<QueryObserverResult<ExpensesTotal | undefined, Error>>
}

function UpdateExpenseModal( { refecht, refechtExpenseTotal, refechtExpenseTotalByUser } : AddExpenseModalProps) {

    const navigate = useNavigate()
    const { raffleId } = useParams<{ raffleId: string }>();
    
    const queryParams = new URLSearchParams(location.search)
    const modalUpdateExpenses = queryParams.get('updateExpense')
    const show = modalUpdateExpenses ? true : false
    const expenseId = +modalUpdateExpenses!

    const {data, isError} = useQuery({
        queryKey: ['expense', expenseId],
        queryFn: () => getExpensesById({raffleId: raffleId!, expenseId: expenseId.toString()}),
        enabled: show       
    })

    //Form
    
    const initialValues : ExpenseFormType = {
        amount: data?.amount || '',
        name: data?.name || '',
    }

    const { handleSubmit, register, reset, formState: {errors}} = useForm({
        defaultValues: initialValues
    })

    const { mutate, isPending} = useMutation({
        mutationFn: updateExpense,
        onError(error) {
            toast.error(error.message)
        },
        onSuccess(data) {
            toast.success(data)
            reset()
            refecht()
            refechtExpenseTotal()
            refechtExpenseTotalByUser()
            handleCloseModal()
        },
    })

    const handleUpdateExpense = (formData: ExpenseFormType) => {
        const data = {
            raffleId: raffleId!,
            expenseId: expenseId.toString(),
            expenseData: formData
        }
        mutate(data)
    }

    const handleCloseModal = () => {
        const currentParams = new URLSearchParams(location.search);
        currentParams.delete('updateExpense'); // Elimina solo el parámetro 'addExpense'
        navigate(`${location.pathname}?${currentParams.toString()}`);
    };

    useEffect(() => {
        if (data) {
            reset({
                amount: data.amount,
                name: data.name,
            });
        }
    }, [data, reset]);
    

    if (isError) return <Navigate to={'/404'}/> 

    if ( data) return (
        <Modal
            open={show}
            onClose={handleCloseModal}
            aria-labelledby="modal-modal-title"
            aria-describedby="modal-modal-description"
        >
            <Box sx={style}>
            <div className="w-full text-end">
                <IconButton
                    onClick={handleCloseModal}
                >
                    <Tooltip title='Cerrar Ventana'>
                        <CloseIcon/>
                    </Tooltip>
                </IconButton>
            </div>

            <h2 className='mb-5 text-xl font-semibold text-center'>Editar Gasto</h2>

            <form 
                className='flex flex-col gap-4'
                onSubmit={handleSubmit(handleUpdateExpense)}
            >
                <ExpenseForm
                    register={register}
                    errors={errors}
                />

                <Button
                    type="submit"
                    variant="contained"
                    fullWidth
                    disabled={isPending}
                >
                    Editar Gasto
                </Button>
            </form>
            
            </Box>
        </Modal>
    )
}

export default UpdateExpenseModal
