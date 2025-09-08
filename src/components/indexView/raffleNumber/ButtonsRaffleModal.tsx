import { IconButton, Tooltip } from "@mui/material"
import { useNavigate } from "react-router-dom"
import CloseIcon from '@mui/icons-material/Close';
import DeleteIcon from '@mui/icons-material/Delete';
import { QueryObserverResult, RefetchOptions, useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteNumberClient } from "../../../api/raffleNumbersApi";
import { toast } from "react-toastify";
import { AwardType, Raffle, RaffleNumber, RaffleNumbersPayments, RaffleNumbersResponseType } from "../../../types";
import ButtoToWasap from "./ButtoToWasap";
import { handleDownloadPDF, handleMessageToWhatsAppAviso, handleViewAndDownloadPDF } from "../../../utils";
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import AdfScannerIcon from '@mui/icons-material/AdfScanner';
import CampaignIcon from '@mui/icons-material/Campaign';


type ButtonsRaffleModalProps = {
    name: string
    telefono: string
    number: number
    raffleStatus: "available" | "sold" | "pending" | "apartado"
    totalNumbers: number
    pdfData: RaffleNumbersPayments
    raffle: Raffle
    awards: AwardType[]
    raffleId: number
    raffleNumberId: number
    refect: (options?: RefetchOptions) => Promise<QueryObserverResult<RaffleNumbersResponseType | undefined, Error>>
    raffleNumberStatus: RaffleNumber['status']
    handleToWasap: () => void
}

function ButtonsRaffleModal({ name, number, telefono, awards, totalNumbers ,pdfData, raffle, raffleStatus, raffleId, raffleNumberId, refect, handleToWasap, raffleNumberStatus} : ButtonsRaffleModalProps) {
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
            
            {raffleNumberStatus !== 'available' &&
                <IconButton
                    onClick={() => handleMessageToWhatsAppAviso({ telefono, number, totalNumbers, name })}
                >
                    <Tooltip title='Eliminar Cliente de la Rifa'>
                        <CampaignIcon color='warning'/>
                    </Tooltip>
                </IconButton>
            }

            { raffleNumberStatus !== 'available' && 
                <ButtoToWasap
                    handleToWasap={handleToWasap}
                />
            }

            {raffleStatus != 'available' &&
                <div>
                    <IconButton
                        onClick={(e) => {
                            e.preventDefault(); // evita navegación
                            handleDownloadPDF({ awards, pdfData, raffle, totalNumbers});
                        }}
                    >
                        <Tooltip title='Descargar PDF'>
                            <PictureAsPdfIcon color="error" />
                        </Tooltip>
                    </IconButton>

                </div>
            }
            
            {raffleStatus != 'available' &&
                <div>
                    <IconButton
                        onClick={(e) => {
                            e.preventDefault(); // evita navegación
                            handleViewAndDownloadPDF({ awards, pdfData, raffle, totalNumbers});
                        }}
                    >
                        <Tooltip title='Ver Ticket'>
                            <AdfScannerIcon color="primary"/>
                        </Tooltip>
                    </IconButton>

                </div>
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