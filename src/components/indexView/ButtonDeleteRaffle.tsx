import { IconButton, Tooltip } from "@mui/material"
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import { useMutation } from "@tanstack/react-query";
import { deleteRaffle } from "../../api/raffleApi";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

type ButtonDeleteRaffleProps = {
    raffleId: number
}

function ButtonDeleteRaffle({raffleId} : ButtonDeleteRaffleProps) {
    const navigate = useNavigate()
    const {mutate, isPending} = useMutation({
        mutationFn: deleteRaffle,
        onError(error) {
            toast.error(error.message)
        },
        onSuccess(data) {
            toast.success(data)
            navigate('/')
        },
    })

    const handleDeleteRaffle = () =>{
        const isConfirmed = window.confirm("¿Está seguro de que desea eliminar esta rifa?");
        if (isConfirmed) {
            mutate(raffleId);
        }
    }

    return (
        <IconButton
            onClick={handleDeleteRaffle}
            disabled={isPending}
        >
        <Tooltip title={'Eliminar Rifa'} placement="bottom-start">
            <DeleteForeverIcon color="error"/>
        </Tooltip>
    </IconButton>
    )
}

export default ButtonDeleteRaffle