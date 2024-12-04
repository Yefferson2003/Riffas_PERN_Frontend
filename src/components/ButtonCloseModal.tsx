import { IconButton, Tooltip } from "@mui/material"
import { useNavigate } from "react-router-dom"
import CloseIcon from '@mui/icons-material/Close';

function ButtonCloseModal() {
    const navigate = useNavigate()
    return (
        <div className="w-full text-end">
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

export default ButtonCloseModal