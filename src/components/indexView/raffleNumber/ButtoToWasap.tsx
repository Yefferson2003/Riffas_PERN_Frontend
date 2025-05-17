import { IconButton, Tooltip } from "@mui/material"

import WhatsAppIcon from '@mui/icons-material/WhatsApp';

type ButtoToWasapProps = {
    handleToWasap: () => void
}

function ButtoToWasap( { handleToWasap} : ButtoToWasapProps) {
    return (
        <IconButton
            onClick={handleToWasap}
        >
            <Tooltip title='Mensaje al Usuario'>
                <WhatsAppIcon color='success'/>
            </Tooltip>
        </IconButton>
    )
}

export default ButtoToWasap
