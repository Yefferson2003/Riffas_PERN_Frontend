import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import { Box, IconButton, Modal, Tooltip, Typography } from "@mui/material";
import { AwardType, Raffle, RaffleNumbersPayments } from "../../types";

import CloseIcon from '@mui/icons-material/Close';

import { formatCurrencyCOP, formatDateTimeLarge, formatDateTimeLargeIsNull, formatWithLeadingZeros, handleDownloadPDF } from '../../utils';


const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: { xs: '95vw', sm: 600, md: 800, lg: 1000 },
    maxWidth: '95vw',
    bgcolor: '#ffffff',
    border: 'none',
    borderRadius: 3,
    boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.25)',
    p: { xs: 2, sm: 3, md: 4 },
    maxHeight: '95vh', 
    overflowY: 'auto',
};

export type PaymentSellNumbersModalProps = {
    totalNumbers: number,
    raffle: Raffle
    awards: AwardType[]
    setPaymentsSellNumbersModal: React.Dispatch<React.SetStateAction<boolean>>
    setPdfData: React.Dispatch<React.SetStateAction<RaffleNumbersPayments | undefined>>
    paymentsSellNumbersModal: boolean
    pdfData: RaffleNumbersPayments
    urlWasap: string
}

function PaymentSellNumbersModal({ totalNumbers, raffle, awards, paymentsSellNumbersModal,pdfData,setPaymentsSellNumbersModal,setPdfData, urlWasap} : PaymentSellNumbersModalProps) {

    // const handleDownloadPDF = ( raffle, totalNumbers, awards, setPdfData ) => {
    // const doc = new jsPDF({
    //     orientation: "portrait",
    //     unit: "mm",
    //     format: [80, 150],
    // });

    // pdfData.forEach((entry, index) => {
    //     const yStart = index === 0 ? 10 : doc.internal.pageSize.height * index + 10;
    //     let y = yStart;

    //     if (index > 0) doc.addPage([80, 150]);

    //     // 🧾 Encabezado
    //     doc.setFont("courier", "bold");
    //     doc.setFontSize(11);
    //     doc.text(raffle.name, 40, y, { align: "center" });
    //     y += 5;
    //     doc.setFontSize(9);
    //     doc.text(`Responsable: ${raffle.nameResponsable}`, 40, y, { align: "center" });
    //     y += 4;
    //     doc.text(`NIT: ${raffle.nitResponsable}`, 40, y, { align: "center" });
    //     y += 4;
    //     doc.setFont("courier", "normal");
    //     doc.text(`"${raffle.description}"`, 40, y, { align: "center" });
    //     y += 6;
    //     doc.setDrawColor(0);
    //     doc.setLineWidth(0.2);
    //     doc.line(5, y, 75, y);
    //     y += 4;

    //     // 👤 Detalles del comprador
    //     doc.setFont("courier", "bold");
    //     doc.text("Detalles del Comprador", 40, y, { align: "center" });
    //     y += 3;
    //     doc.line(5, y, 75, y);
    //     y += 4;

    //     doc.setFont("courier", "normal");
    //     doc.text(`Boleto #:`, 5, y);
    //     doc.setFont("courier", "bold");
    //     doc.text(`${entry.number}`, 30, y);
    //     y += 4;

    //     doc.setFont("courier", "normal");
    //     doc.text(`Nombre:`, 5, y);
    //     doc.setFont("courier", "bold");
    //     doc.text(`${entry.firstName} ${entry.lastName}`, 30, y);
    //     y += 4;

    //     doc.setFont("courier", "normal");
    //     doc.text(`ID:`, 5, y);
    //     doc.setFont("courier", "bold");
    //     doc.text(`${entry.identificationType} ${entry.identificationNumber}`, 30, y);
    //     y += 4;

    //     doc.setFont("courier", "normal");
    //     doc.text(`Teléfono:`, 5, y);
    //     doc.setFont("courier", "bold");
    //     doc.text(`${entry.phone}`, 30, y);
    //     y += 4;

    //     doc.setFont("courier", "normal");
    //     doc.text(`Dirección:`, 5, y);
    //     doc.setFont("courier", "bold");
    //     doc.text(`${entry.address || "No registrada"}`, 30, y);
    //     y += 6;

    //     // 🎯 Detalles de la rifa
    //     doc.setFont("courier", "bold");
    //     doc.text("Detalles de la Rifa", 40, y, { align: "center" });
    //     y += 3;
    //     doc.line(5, y, 75, y);
    //     y += 4;

    //     doc.setFont("courier", "normal");
    //     doc.text(`Fecha Juego:`, 5, y);
    //     doc.setFont("courier", "bold");
    //     doc.text(`${formatDateTimeLarge(raffle.playDate)}`, 30, y);
    //     y += 4;

    //     doc.setFont("courier", "normal");
    //     doc.text(`Valor Rifa:`, 5, y);
    //     doc.setFont("courier", "bold");
    //     doc.text(`${formatCurrencyCOP(+raffle.price)}`, 30, y);
    //     y += 6;

    //     if (awards.length > 0) {
    //     doc.setFont("courier", "bold");
    //     doc.text("Premios", 40, y, { align: "center" });
    //     y += 3;
    //     doc.line(5, y, 75, y);
    //     y += 4;
    //     awards.forEach((award) => {
    //         doc.setFont("courier", "normal");
    //         doc.text(`• ${award.name}`, 5, y);
    //         doc.setFont("courier", "italic");
    //         doc.text(`${formatDateTimeLarge(award.playDate)}`, 10, y + 3);
    //         y += 6;
    //     });
    //     } else {
    //     doc.setFont("courier", "italic");
    //     doc.text("Sin premios registrados", 40, y, { align: "center" });
    //     y += 6;
    //     }

    //     // 💰 Resumen de pago
    //     doc.setFont("courier", "bold");
    //     doc.text("Resumen de Pago", 40, y, { align: "center" });
    //     y += 3;
    //     doc.line(5, y, 75, y);
    //     y += 4;

    //     doc.setFont("courier", "normal");
    //     doc.text(`Valor:`, 5, y);
    //     doc.setFont("courier", "bold");
    //     doc.text(`${formatCurrencyCOP(+entry.paymentAmount)}`, 30, y);
    //     y += 4;

    //     const abonado = entry.payments
    //     .filter(p => p.isValid)
    //     .reduce((sum, p) => sum + parseFloat(p.amount), 0);
    //     doc.setFont("courier", "normal");
    //     doc.text(`Abonado:`, 5, y);
    //     doc.setFont("courier", "bold");
    //     doc.text(`${formatCurrencyCOP(abonado)}`, 30, y);
    //     y += 4;

    //     doc.setFont("courier", "normal");
    //     doc.text(`Deuda:`, 5, y);
    //     doc.setFont("courier", "bold");
    //     doc.text(`${formatCurrencyCOP(+entry.paymentDue)}`, 30, y);
    //     y += 6;

    //     // 📄 Pagos realizados
    //     if (entry.payments.length > 0) {
    //     doc.setFont("courier", "bold");
    //     doc.text("Pagos", 40, y, { align: "center" });
    //     y += 3;
    //     doc.line(5, y, 75, y);
    //     y += 4;
    //     doc.setFont("courier", "normal");
    //     entry.payments
    //         .filter(p => p.isValid)
    //         .forEach((p) => {
    //         doc.text(`${formatCurrencyCOP(+p.amount)} - ${p.user.firstName}`, 5, y);
    //         y += 4;
    //         });
    //     } else {
    //     doc.setFont("courier", "italic");
    //     doc.text("Sin pagos registrados", 40, y, { align: "center" });
    //     y += 4;
    //     }

    //     // 🙏 Pie de página
    //     y += 6;
    //     doc.setFont("courier", "italic");
    //     doc.text(`Reservado: ${formatDateTimeLarge(entry.reservedDate)}`, 5, y);
    //     y += 4;
    //     doc.setFont("courier", "bold");
    //     doc.text("¡Gracias por su compra!", 40, y, { align: "center" });
    // });

    // doc.save(`tickets_rifa_${raffle.id}.pdf`);
    // };


    const handleCloseModal = () => {
        setPaymentsSellNumbersModal(false)
        setPdfData(undefined)
    }
    return (
        <Modal
            open={paymentsSellNumbersModal}
            aria-labelledby="modal-modal-title"
            aria-describedby="modal-modal-description"
        >
            <Box sx={style}>
                {/* Header con acciones */}
                <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    mb: 3,
                    pb: 2,
                    borderBottom: '2px solid #e2e8f0'
                }}>
                    <Typography variant="h4" sx={{ 
                        fontWeight: 'bold', 
                        color: raffle?.color || '#1976d2',
                        fontSize: { xs: '1.5rem', md: '2rem' }
                    }}>
                        Resumen de Compra
                    </Typography>
                    
                    <Box sx={{ display: 'flex', gap: 1 }}>
                        <IconButton
                            component="button"
                            onClick={(e) => {
                                e.preventDefault();
                                handleDownloadPDF({ awards, pdfData, raffle, totalNumbers });
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
                            component="a"
                            href={urlWasap}
                            target="_blank"
                            rel="noopener noreferrer"
                            sx={{ 
                                bgcolor: '#dcfce7',
                                '&:hover': { bgcolor: '#bbf7d0' },
                                borderRadius: 2
                            }}
                        >
                            <Tooltip title="Enviar por WhatsApp">
                                <img
                                    src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg"
                                    alt="WhatsApp"
                                    width={24}
                                    height={24}
                                    style={{ display: 'block' }}
                                />
                            </Tooltip>
                        </IconButton>
                        
                        <IconButton
                            onClick={handleCloseModal}
                            sx={{ 
                                bgcolor: '#f1f5f9',
                                '&:hover': { bgcolor: '#e2e8f0' },
                                borderRadius: 2
                            }}
                        >
                            <Tooltip title='Cerrar Ventana'>
                                <CloseIcon sx={{ color: '#64748b' }} />
                            </Tooltip>
                        </IconButton>
                    </Box>
                </Box>
                {/* Información de la rifa */}
                <Box sx={{ 
                    mb: 3, 
                    p: 3, 
                    bgcolor: '#f8fafc',
                    border: `2px solid ${raffle?.color || '#1976d2'}`, 
                    borderRadius: 2,
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                }}>
                    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr' }, gap: 2 }}>
                        <Box>
                            <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 500 }}>
                                Rifa #:
                            </Typography>
                            <Typography variant="body1" sx={{ fontWeight: 'bold', color: raffle?.color || '#1976d2' }}>
                                {raffle.id + '-' + raffle.nitResponsable}
                            </Typography>
                        </Box>
                        <Box>
                            <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 500 }}>
                                Descripción:
                            </Typography>
                            <Typography variant="body1" sx={{ fontWeight: 'bold', color: raffle?.color || '#1976d2' }}>
                                {raffle.description}
                            </Typography>
                        </Box>
                        <Box>
                            <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 500 }}>
                                Fecha de Juego:
                            </Typography>
                            <Typography variant="body1" sx={{ fontWeight: 'bold', color: raffle?.color || '#1976d2' }}>
                                {formatDateTimeLarge(raffle.playDate)}
                            </Typography>
                        </Box>
                    </Box>
                </Box>
                {/* Lista de números comprados */}
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                    {pdfData.map((raffleNumber) => (
                        <Box 
                            key={raffleNumber.id} 
                            sx={{ 
                                p: 3, 
                                bgcolor: '#ffffff',
                                border: `2px solid ${raffle?.color || '#1976d2'}`, 
                                borderRadius: 2,
                                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                            }}
                        >
                            {/* Información principal del número */}
                            <Box sx={{ 
                                display: 'grid', 
                                gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr' }, 
                                gap: 2, 
                                mb: 3 
                            }}>
                                <Box>
                                    <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 500 }}>
                                        Número:
                                    </Typography>
                                    <Typography variant="h6" sx={{ fontWeight: 'bold', color: raffle?.color || '#1976d2' }}>
                                        {formatWithLeadingZeros(raffleNumber.number, totalNumbers)}
                                    </Typography>
                                </Box>
                                <Box>
                                    <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 500 }}>
                                        Nombre:
                                    </Typography>
                                    <Typography variant="body1" sx={{ fontWeight: 'bold', color: raffle?.color || '#1976d2', textTransform: 'capitalize' }}>
                                        {raffleNumber.firstName} {raffleNumber.lastName}
                                    </Typography>
                                </Box>
                                <Box>
                                    <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 500 }}>
                                        Teléfono:
                                    </Typography>
                                    <Typography variant="body1" sx={{ fontWeight: 'bold', color: raffle?.color || '#1976d2' }}>
                                        {raffleNumber.phone}
                                    </Typography>
                                </Box>
                                <Box>
                                    <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 500 }}>
                                        Dirección:
                                    </Typography>
                                    <Typography variant="body1" sx={{ fontWeight: 'bold', color: raffle?.color || '#1976d2', textTransform: 'capitalize' }}>
                                        {raffleNumber.address}
                                    </Typography>
                                </Box>
                                <Box>
                                    <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 500 }}>
                                        Monto Pagado:
                                    </Typography>
                                    <Typography variant="body1" sx={{ fontWeight: 'bold', color: '#059669' }}>
                                        {formatCurrencyCOP(+raffleNumber.paymentAmount)}
                                    </Typography>
                                </Box>
                                <Box>
                                    <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 500 }}>
                                        Saldo Pendiente:
                                    </Typography>
                                    <Typography variant="body1" sx={{ fontWeight: 'bold', color: +raffleNumber.paymentDue > 0 ? '#dc2626' : '#059669' }}>
                                        {formatCurrencyCOP(+raffleNumber.paymentDue)}
                                    </Typography>
                                </Box>
                            </Box>

                            {/* Fecha de reserva */}
                            <Box sx={{ mb: 3 }}>
                                <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 500 }}>
                                    Fecha de Reserva:
                                </Typography>
                                <Typography variant="body1" sx={{ fontWeight: 'bold', color: raffle?.color || '#1976d2' }}>
                                    {formatDateTimeLarge(raffleNumber.reservedDate)}
                                </Typography>
                            </Box>

                            {/* Historial de pagos */}
                            <Box
                                sx={{
                                    p: 3,
                                    backgroundColor: "#f8fafc",
                                    border: `2px dashed ${raffle?.color || '#1976d2'}`,
                                    borderRadius: 2,
                                }}
                            >
                                <Typography variant="h6" sx={{ fontWeight: "bold", mb: 2, color: raffle?.color || '#1976d2' }}>
                                    Historial de Pagos
                                </Typography>
                                {raffleNumber.payments.length > 0 ? (
                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                        {raffleNumber.payments.map((payment) => (
                                            <Box
                                                key={payment.id}
                                                sx={{
                                                    p: 2,
                                                    border: "1px solid #e2e8f0",
                                                    borderRadius: 2,
                                                    backgroundColor: "#ffffff",
                                                    boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)'
                                                }}
                                            >
                                                <Box sx={{ 
                                                    display: 'grid', 
                                                    gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr 1fr' }, 
                                                    gap: 2 
                                                }}>
                                                    <Box>
                                                        <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 500 }}>
                                                            Monto:
                                                        </Typography>
                                                        <Typography variant="body1" sx={{ fontWeight: 'bold', color: '#059669' }}>
                                                            {formatCurrencyCOP(+payment.amount)}
                                                        </Typography>
                                                    </Box>
                                                    <Box>
                                                        <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 500 }}>
                                                            Método:
                                                        </Typography>
                                                        <Typography variant="body1" sx={{ fontWeight: 'bold', color: raffle?.color || '#1976d2', textTransform: 'capitalize' }}>
                                                            {payment.rafflePayMethode?.payMethode.name || 'No especificado'}
                                                        </Typography>
                                                    </Box>
                                                    <Box>
                                                        <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 500 }}>
                                                            Fecha:
                                                        </Typography>
                                                        <Typography variant="body1" sx={{ fontWeight: 'bold', color: raffle?.color || '#1976d2' }}>
                                                            {!payment.paidAt ? 
                                                                formatDateTimeLarge(payment.createdAt) : 
                                                                formatDateTimeLargeIsNull(payment.paidAt)
                                                            }
                                                        </Typography>
                                                    </Box>
                                                    <Box>
                                                        <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 500 }}>
                                                            Vendedor:
                                                        </Typography>
                                                        <Typography variant="body1" sx={{ fontWeight: 'bold', color: raffle?.color || '#1976d2', textTransform: 'capitalize' }}>
                                                            {payment.user ? `${payment.user.firstName} ${payment.user.lastName}` : 'No registrado'}
                                                        </Typography>
                                                    </Box>
                                                </Box>
                                                {payment.user?.identificationNumber && (
                                                    <Box sx={{ mt: 1 }}>
                                                        <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 500 }}>
                                                            Identificación:
                                                        </Typography>
                                                        <Typography variant="body1" sx={{ fontWeight: 'bold', color: raffle?.color || '#1976d2' }}>
                                                            {payment.user.identificationNumber}
                                                        </Typography>
                                                    </Box>
                                                )}
                                            </Box>
                                        ))}
                                    </Box>
                                ) : (
                                    <Typography variant="body1" sx={{ color: '#64748b', fontStyle: 'italic', textAlign: 'center' }}>
                                        No hay pagos registrados
                                    </Typography>
                                )}
                            </Box>
                        </Box>
                    ))}
                </Box>
            </Box>
        </Modal>
    )
}

export default PaymentSellNumbersModal