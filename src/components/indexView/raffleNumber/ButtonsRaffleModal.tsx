import { IconButton, Tooltip } from "@mui/material"
import { useNavigate } from "react-router-dom"
import CloseIcon from '@mui/icons-material/Close';
import DeleteIcon from '@mui/icons-material/Delete';
import { QueryObserverResult, RefetchOptions, useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteNumberClient } from "../../../api/raffleNumbersApi";
import { toast } from "react-toastify";
import { RaffleNumber, RaffleNumbersResponseType } from "../../../types";
import ButtoToWasap from "./ButtoToWasap";

type ButtonsRaffleModalProps = {
    raffleId: number
    raffleNumberId: number
    refect: (options?: RefetchOptions) => Promise<QueryObserverResult<RaffleNumbersResponseType | undefined, Error>>
    raffleNumberStatus: RaffleNumber['status']
    handleToWasap: () => void
}

function ButtonsRaffleModal({raffleId, raffleNumberId, refect, handleToWasap, raffleNumberStatus} : ButtonsRaffleModalProps) {
    const navigate = useNavigate()

    const queryClient = useQueryClient()
    const {mutate, isPending} = useMutation({
        mutationFn: deleteNumberClient,
        onError(error) {
            toast.error(error.message)
        },
        onSuccess(data) {
            queryClient.invalidateQueries({queryKey: ['raffleNumber', raffleId, raffleNumberId]})
            toast.success(data)
            navigate(location.pathname, {replace: true})
            refect()
        },
    })

    const handleDeleteNumberClient = () => {
        mutate({raffleId, raffleNumberId})
    }
    
    return (
        <div className="flex justify-between w-full">
            <IconButton
                onClick={handleDeleteNumberClient}
                disabled={isPending}
            >
                <Tooltip title='Eliminar Cliente de la Rifa'>
                    <DeleteIcon color={isPending ? 'disabled' : 'error'}/>
                </Tooltip>
            </IconButton>

            { raffleNumberStatus !== 'available' && 
                <ButtoToWasap
                    handleToWasap={handleToWasap}
                />
            }

            
            <IconButton
                onClick={() => navigate(location.pathname, {replace: true})}
            >
                <Tooltip title='Cerrar Ventana'>
                    <CloseIcon/>
                </Tooltip>
            </IconButton>

        </div>
    )
}

export default ButtonsRaffleModal