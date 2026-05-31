import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import {
    Alert,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    IconButton,
    Tooltip
} from "@mui/material";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { deleteRaffle } from "../../api/raffleApi";
import { isRaffleVisible } from "../../utils/raffleVisibility";

type ButtonDeleteRaffleProps = {
    raffleId: number
    adminToggleMode?: boolean
    isVisible?: boolean
}

function ButtonDeleteRaffle({raffleId, adminToggleMode = false, isVisible = true} : ButtonDeleteRaffleProps) {
    const navigate = useNavigate()
    const queryClient = useQueryClient()
    const [openConfirm, setOpenConfirm] = useState(false)
    const {mutate, isPending} = useMutation({
        mutationFn: deleteRaffle,
        onError(error) {
            toast.error(error.message)
        },
        async onSuccess(data) {
            toast.success(data)
            setOpenConfirm(false)

            await queryClient.invalidateQueries({ queryKey: ['raffles'] })
            await queryClient.invalidateQueries({ queryKey: ['raffles', raffleId] })
            await queryClient.invalidateQueries({ queryKey: ['raffles', raffleId.toString()] })
            await queryClient.refetchQueries({ queryKey: ['raffles', raffleId], type: 'active' })
            await queryClient.refetchQueries({ queryKey: ['raffles', raffleId.toString()], type: 'active' })

            if (adminToggleMode) {
                return
            }

            if (!adminToggleMode) {
                navigate('/')
            }
        },
    })

    const handleDeleteRaffle = () => {
        mutate(raffleId)
    }

    const raffleVisible = isRaffleVisible(isVisible)

    const dialogTitle = adminToggleMode
        ? (raffleVisible ? 'Ocultar rifa' : 'Mostrar rifa')
        : 'Eliminación';

    const dialogDescription = adminToggleMode
        ? (raffleVisible
            ? 'Esta acción ocultará la rifa para usuarios no admin. Podrás volver a mostrarla después.'
            : 'Esta acción volverá a mostrar la rifa para todos los usuarios con acceso.')
        : 'Esta acción va a eliminar la rifa y no será reversible.';

    const alertSeverity = adminToggleMode ? 'info' as const : 'warning' as const;

    const confirmLabel = adminToggleMode
        ? (raffleVisible ? 'Ocultar' : 'Mostrar')
        : 'Eliminar';

    return (
        <>
            <IconButton
                onClick={() => setOpenConfirm(true)}
                disabled={isPending}
            >
                <Tooltip title={adminToggleMode ? (raffleVisible ? 'Ocultar rifa' : 'Mostrar rifa') : 'Eliminar Rifa'} placement="bottom-start">
                    {adminToggleMode
                        ? (raffleVisible ? <VisibilityIcon color="primary"/> : <VisibilityOffIcon color="warning"/>)
                        : <DeleteForeverIcon color="error"/>}
                </Tooltip>
            </IconButton>

            <Dialog open={openConfirm} onClose={() => !isPending && setOpenConfirm(false)} maxWidth="xs" fullWidth>
                <DialogTitle>{dialogTitle}</DialogTitle>
                <DialogContent>
                    <Alert severity={alertSeverity} sx={{ mt: 1 }}>
                        {dialogDescription}
                    </Alert>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenConfirm(false)} disabled={isPending}>
                        Cancelar
                    </Button>
                    <Button
                        onClick={handleDeleteRaffle}
                        color={adminToggleMode ? 'primary' : 'error'}
                        variant="contained"
                        disabled={isPending}
                    >
                        {confirmLabel}
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    )
}

export default ButtonDeleteRaffle