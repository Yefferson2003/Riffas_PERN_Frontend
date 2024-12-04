import { IconButton, Tooltip } from "@mui/material"
import DeleteIcon from '@mui/icons-material/Delete';
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteUser } from "../../api/userApi";
import { toast } from "react-toastify";


type ButtonDeleteUserProps = {
    userId: number
    filter: object,
    page: number,
    rowsPerPag: number
}

function ButtonDeleteUser({userId, filter, page, rowsPerPag} : ButtonDeleteUserProps) {

    const queryClient = useQueryClient()
    const {mutate, isPending} = useMutation({
        mutationFn: deleteUser,
        onError(error) {
            toast.error(error.message)
        },
        onSuccess(data) {
            queryClient.invalidateQueries({queryKey: ['userList',filter, page, rowsPerPag]})
            toast.success(data)
        },
    })

    const handleDeleteUser = () => {
        mutate(userId)
    }

    return (
        <IconButton
            disabled={isPending}
            onClick={handleDeleteUser}
        >
            <Tooltip title={'Eliminar usuario'}>
                <DeleteIcon color="error"/>
            </Tooltip>
        </IconButton>
    )
}

export default ButtonDeleteUser