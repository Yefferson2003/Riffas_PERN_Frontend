    // Función para saber si la fecha del premio ya venció
    const isAwardExpired = (playDate: string) => {
        const now = new Date();
        const date = new Date(playDate);
        return date < now;
    };
import { Box, IconButton, ListItemText, Menu, MenuItem, Tooltip } from "@mui/material"
import { useNavigate } from "react-router-dom"
import CloseIcon from '@mui/icons-material/Close';
import DeleteIcon from '@mui/icons-material/Delete';
import { QueryObserverResult, RefetchOptions, useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteNumberClient } from "../../../api/raffleNumbersApi";
import { toast } from "react-toastify";
import { AwardType, Raffle, RaffleNumber, RaffleNumbersPayments, RaffleNumbersResponseType } from "../../../types";
import ButtoToWasap from "./ButtoToWasap";
import { formatDateTimeLarge, handleDownloadPDF, handleMessageToWhatsAppAviso, handleViewAndDownloadPDF } from "../../../utils";
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import AdfScannerIcon from '@mui/icons-material/AdfScanner';
import CampaignIcon from '@mui/icons-material/Campaign';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import { useState } from "react";


type ButtonsRaffleModalProps = {
    name: string
    telefono: string
    number: number
    totalNumbers: number
    pdfData: RaffleNumbersPayments
    raffle: Raffle
    awards: AwardType[]
    raffleId: number
    raffleNumberId: number
    refetch: (options?: RefetchOptions) => Promise<QueryObserverResult<RaffleNumbersResponseType | undefined, Error>>
    raffleNumberStatus: RaffleNumber['status']
    handleToWasap: () => void
    handleSendPaymentReminderWhatsApp: (award: {
        id: number;
        name: string;
        playDate: string;
    } | undefined) => void
}

function ButtonsRaffleModal({ name, number, telefono, awards, totalNumbers ,pdfData, raffle, raffleId, raffleNumberId, refetch, handleToWasap, raffleNumberStatus, handleSendPaymentReminderWhatsApp} : ButtonsRaffleModalProps) {
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
            refetch()
        },
    })

    const handleDeleteNumberClient = () => {
        mutate({raffleId, raffleNumberId})
    }
    
    // Para el menú desplegable de premios
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);
    const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };
    const handleMenuClose = () => {
        setAnchorEl(null);
    };


    return (
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            <IconButton
                onClick={handleDeleteNumberClient}
                disabled={isPending}
                sx={{ 
                    bgcolor: '#fee2e2',
                    '&:hover': { bgcolor: '#fecaca' },
                    borderRadius: 2,
                    '&:disabled': { bgcolor: '#f3f4f6' }
                }}
            >
                <Tooltip title='Eliminar Cliente de la Rifa'>
                    <DeleteIcon sx={{ color: isPending ? '#9ca3af' : '#dc2626' }}/>
                </Tooltip>
            </IconButton>

            {raffleNumberStatus !== 'available' && (
                <IconButton
                    onClick={() => handleMessageToWhatsAppAviso({ telefono, number, totalNumbers, name, raffleName: raffle.name })}
                    sx={{ 
                        bgcolor: '#fef3c7',
                        '&:hover': { bgcolor: '#fde68a' },
                        borderRadius: 2
                    }}
                >
                    <Tooltip title='Enviar Aviso por WhatsApp'>
                        <CampaignIcon sx={{ color: '#d97706' }}/>
                    </Tooltip>
                </IconButton>
            )}

            {raffleNumberStatus !== 'available' && (
                <>
                    <ButtoToWasap handleToWasap={handleToWasap} />

                    <IconButton
                        onClick={(e) => {
                            e.preventDefault();
                            handleDownloadPDF({ awards, pdfData, raffle, totalNumbers});
                        }}
                        sx={{ 
                            bgcolor: '#fee2e2',
                            '&:hover': { bgcolor: '#fecaca' },
                            borderRadius: 2
                        }}
                    >
                        <Tooltip title='Descargar PDF'>
                            <PictureAsPdfIcon sx={{ color: '#dc2626' }} />
                        </Tooltip>
                    </IconButton>

                    <IconButton
                        onClick={(e) => {
                            e.preventDefault();
                            handleViewAndDownloadPDF({ awards, pdfData, raffle, totalNumbers});
                        }}
                        sx={{ 
                            bgcolor: '#dbeafe',
                            '&:hover': { bgcolor: '#bfdbfe' },
                            borderRadius: 2
                        }}
                    >
                        <Tooltip title='Ver Ticket'>
                            <AdfScannerIcon sx={{ color: '#2563eb' }}/>
                        </Tooltip>
                    </IconButton>
                </>
            )}

            {(raffleNumberStatus == 'apartado' || raffleNumberStatus == 'pending') && (
                <>
                    <IconButton
                        onClick={handleMenuClick}
                        sx={{ 
                            bgcolor: '#dcfce7',
                            '&:hover': { bgcolor: '#bbf7d0' },
                            borderRadius: 2
                        }}
                    >
                        <Tooltip title='Recordar Pago'>
                            <AttachMoneyIcon sx={{ color: '#059669' }}/>
                        </Tooltip>
                    </IconButton>

                    {/* Menú desplegable de premios */}
                    <Menu
                        anchorEl={anchorEl}
                        open={open}
                        onClose={handleMenuClose}
                        PaperProps={{
                            sx: {
                                width: 400,
                                maxWidth: '90vw',
                                boxSizing: 'border-box',
                                borderRadius: 3,
                                boxShadow: 4,
                                p: 1,
                            }
                        }}
                        transformOrigin={{ horizontal: 'center', vertical: 'top' }}
                        anchorOrigin={{ horizontal: 'center', vertical: 'bottom' }}
                    >
                        {awards.length === 0 ? (
                            <MenuItem
                                onClick={() => {
                                    handleSendPaymentReminderWhatsApp(undefined);
                                    handleMenuClose();
                                }}
                                sx={{ width: '100%', borderRadius: 2, mb: 0.5 }}
                            >
                                <ListItemText
                                    primary={<span style={{fontWeight: 500, color: '#1e293b'}}>Recordar pago (sin premio)</span>}
                                    secondary={<span style={{fontSize: '0.95rem', color: '#64748b'}}>No hay premios disponibles</span>}
                                />
                            </MenuItem>
                        ) : (
                            awards.map((award) => {
                                const expired = isAwardExpired(award.playDate);
                                return (
                                    <MenuItem
                                        key={award.id}
                                        onClick={() => {
                                            if (!expired) {
                                                handleSendPaymentReminderWhatsApp(award);
                                                handleMenuClose();
                                            }
                                        }}
                                        disabled={expired}
                                        sx={{
                                            width: '100%',
                                            borderRadius: 2,
                                            mb: 0.5,
                                            opacity: expired ? 0.5 : 1,
                                            cursor: expired ? 'not-allowed' : 'pointer',
                                            backgroundColor: expired ? '#f3f4f6' : undefined,
                                        }}
                                    >
                                        <ListItemText
                                            primary={
                                                <span style={{
                                                    maxWidth: 320,
                                                    display: 'inline-block',
                                                    whiteSpace: 'nowrap',
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis',
                                                    verticalAlign: 'middle',
                                                    fontSize: '1rem',
                                                    fontWeight: 500,
                                                    color: expired ? '#9ca3af' : '#1e293b'
                                                }}>{award.name}</span>
                                            }
                                            secondary={<span style={{fontSize: '0.95rem', color: expired ? '#9ca3af' : '#64748b'}}>{formatDateTimeLarge(award.playDate)}</span>}
                                        />
                                    </MenuItem>
                                );
                            })
                        )}
                    </Menu>
                </>
            )}

            <IconButton
                onClick={() => navigate(location.pathname, {replace: true})}
                sx={{ 
                    bgcolor: '#f1f5f9',
                    '&:hover': { bgcolor: '#e2e8f0' },
                    borderRadius: 2
                }}
            >
                <Tooltip title='Cerrar Ventana'>
                    <CloseIcon sx={{ color: '#64748b' }}/>
                </Tooltip>
            </IconButton>
        </Box>
    )
}

export default ButtonsRaffleModal