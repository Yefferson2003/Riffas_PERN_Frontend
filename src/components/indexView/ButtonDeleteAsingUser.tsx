import PersonRemoveIcon from '@mui/icons-material/PersonRemove';
import { IconButton, Tooltip } from "@mui/material";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { deleteAssingUser } from "../../api/raffleApi";
import { User } from '../../types';
import { useOutletContext } from 'react-router-dom';

type ButtonDeleteAsingUserProps = {
    raffleId: number
    userId: number
}
function ButtonDeleteAsingUser({raffleId, userId} : ButtonDeleteAsingUserProps) {
    const user : User = useOutletContext();
    const queryClient = useQueryClient()
    const {mutate, isPending} = useMutation({
        mutationFn: deleteAssingUser,
        onError(error) {
            toast.error(error.message)
        },
        onSuccess(data) {
            queryClient.invalidateQueries({queryKey:  ['usersRaffle', raffleId]})
            toast.success(data)
        },
    })

    const handleDeleteAssing = () => {
        const data = {
            raffleId,
            userId: userId
        }
        mutate(data)
    }

    return (
        <IconButton
            color="error"
            disabled={isPending || user.rol.name === 'vendedor' || userId == user.id}
            onClick={handleDeleteAssing}
        >
            <Tooltip title='Eliminar Asignación'>
            <PersonRemoveIcon/>  
            </Tooltip>
        </IconButton>
    )
}

export default ButtonDeleteAsingUser