import CloseIcon from '@mui/icons-material/Close';
import { Box, Button, IconButton, Modal, Tooltip } from "@mui/material";
import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from "react-router-dom";
import { ExpenseFormType, ExpenseResponseType, ExpensesTotal } from '../../../../types';
import ExpenseForm from './ExpenseForm';
import { QueryObserverResult, RefetchOptions, useMutation, useQuery } from '@tanstack/react-query';
import { addExpense } from '../../../../api/expensesApi';
import { getRaffleById } from '../../../../api/raffleApi';
import { toast } from 'react-toastify';

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

function AddExpenseModal( { refecht, refechtExpenseTotal, refechtExpenseTotalByUser } : AddExpenseModalProps) {

    const { raffleId } = useParams<{ raffleId: string }>();
    
    const navigate = useNavigate()

    const queryParams = new URLSearchParams(location.search)
    const modalAddExpenses = queryParams.get('addExpense')
    const show = modalAddExpenses === 'true'

    // Obtener datos de la rifa para el color
    const { data: raffle } = useQuery({
        queryKey: ['raffles', raffleId],
        queryFn: () => getRaffleById(raffleId!),
        enabled: show && !!raffleId,
    });

    //Form

    const initialValues : ExpenseFormType = {
        amount: '',
        name: '',
    }

    const { handleSubmit, register, reset, formState: {errors}} = useForm({
        defaultValues: initialValues
    })

    const { mutate, isPending } = useMutation({
        mutationFn: addExpense,
        onError: (error) => {
            toast.error(error.message)
        },
        onSuccess: (data) => {
            toast.success(data)
            reset()
            refecht()
            refechtExpenseTotal()
            refechtExpenseTotalByUser()
            handleCloseModal()
        }
    })

    const handleAddExpense = (formData: ExpenseFormType) => {
        const data = {
            raffleId: raffleId!,
            expenseData: formData
        }
        mutate(data)
    }

    const handleCloseModal = () => {
        const currentParams = new URLSearchParams(location.search);
        currentParams.delete('addExpense'); // Elimina solo el parámetro 'addExpense'
        navigate(`${location.pathname}?${currentParams.toString()}`);
    };

    return (
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

            <h2 
                className='mb-5 text-xl font-semibold text-center'
                style={{ color: raffle?.color || '#1976d2' }}
            >
                Agrega un gasto nuevo
            </h2>

            <form 
                className='flex flex-col gap-4'
                onSubmit={handleSubmit(handleAddExpense)}
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
                    sx={{
                        backgroundColor: raffle?.color || '#1976d2',
                        '&:hover': {
                            backgroundColor: raffle?.color || '#1976d2',
                            opacity: 0.9,
                        },
                    }}
                >
                    Crear Gasto
                </Button>
            </form>
            
            </Box>
        </Modal>
    )
}

export default AddExpenseModal
