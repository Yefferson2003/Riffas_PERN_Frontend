import PersonRemoveIcon from '@mui/icons-material/PersonRemove';
import { IconButton, Tooltip } from "@mui/material";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { deleteAssingUser } from "../../api/raffleApi";

type ButtonDeleteAsingUserProps = {
    raffleId: number
    userId: number
}
function ButtonDeleteAsingUser({raffleId, userId} : ButtonDeleteAsingUserProps) {

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
            disabled={isPending}
            onClick={handleDeleteAssing}
        >
            <Tooltip title='Eliminar Asignación'>
            <PersonRemoveIcon/>  
            </Tooltip>
        </IconButton>
    )
}

export default ButtonDeleteAsingUser