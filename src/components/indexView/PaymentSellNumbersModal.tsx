import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import { Box, IconButton, Modal, Tooltip, Typography } from "@mui/material";
import autoTable from "jspdf-autotable";
import { RaffleNumbersPayments } from "../../types";

import CloseIcon from '@mui/icons-material/Close';
import dayjs from 'dayjs';
import jsPDF from 'jspdf';
import { formatCurrencyCOP, formatDateTimeLarge, formatDateTimeLargeIsNull, formatWithLeadingZeros } from '../../utils';


const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 400,
    maxWidth: '100vw',
    bgcolor: '#f1f5f9',
    border: '2px solid #000',
    boxShadow: 24,
    p: 4,
    maxHeight: '95vh', 
    overflowY: 'auto',
};

type PaymentSellNumbersModalProps = {
    setPaymentsSellNumbersModal: React.Dispatch<React.SetStateAction<boolean>>
    setPdfData: React.Dispatch<React.SetStateAction<RaffleNumbersPayments | undefined>>
    paymentsSellNumbersModal: boolean
    pdfData: RaffleNumbersPayments
}

function PaymentSellNumbersModal({paymentsSellNumbersModal,pdfData,setPaymentsSellNumbersModal,setPdfData} : PaymentSellNumbersModalProps) {
    const handleDownloadPDF = () => {
        const doc = new jsPDF();
    
        // Título principal
        doc.setFontSize(18);
        doc.setTextColor("#1446A0");
        doc.text("Resumen de Compra", 105, 15, { align: "center" });
    
        pdfData.forEach((raffle, index) => {
            const yStart = 30 + index * 90; // Espaciado entre secciones
    
            // Contenedor principal (borde para la sección)
            doc.setDrawColor(20, 70, 160);
            doc.setLineWidth(0.5);
            doc.roundedRect(10, yStart - 5, 190, 80, 3, 3);
    
            // Número de rifa
            doc.setFontSize(12);
            doc.setTextColor("#000");
            doc.text(`Número:`, 12, yStart);
            doc.setFont("bold");
            doc.setTextColor("#1446A0");
            doc.text(formatWithLeadingZeros(raffle.number), 40, yStart);
    
            // Nombre
            doc.setFont("normal");
            doc.setTextColor("#000");
            doc.text(`Nombre:`, 12, yStart + 6);
            doc.setFont("bold");
            doc.setTextColor("#1446A0");
            doc.text(`${raffle.firstName} ${raffle.lastName}`, 40, yStart + 6);
    
            // Teléfono
            doc.setFont("normal");
            doc.setTextColor("#000");
            doc.text(`Teléfono:`, 12, yStart + 12);
            doc.setFont("bold");
            doc.setTextColor("#1446A0");
            doc.text(raffle.phone, 40, yStart + 12);
    
            // Dirección
            doc.setFont("normal");
            doc.setTextColor("#000");
            doc.text(`Dirección:`, 12, yStart + 18);
            doc.setFont("bold");
            doc.setTextColor("#1446A0");
            doc.text(raffle.address, 40, yStart + 18);
    
            // Monto Pagado
            doc.setFont("normal");
            doc.setTextColor("#000");
            doc.text(`Monto Pagado:`, 12, yStart + 24);
            doc.setFont("bold");
            doc.setTextColor("#1446A0");
            doc.text(formatCurrencyCOP(+raffle.paymentAmount), 60, yStart + 24);
    
            // Monto A Deber
            doc.setFont("normal");
            doc.setTextColor("#000");
            doc.text(`Monto A Deber:`, 12, yStart + 30);
            doc.setFont("bold");
            doc.setTextColor("#1446A0");
            doc.text(formatCurrencyCOP(+raffle.paymentDue), 60, yStart + 30);
    
            // Fecha Reservado
            doc.setFont("normal");
            doc.setTextColor("#000");
            doc.text(`Fecha Reservado:`, 12, yStart + 36);
            doc.setFont("bold");
            doc.setTextColor("#1446A0");
            doc.text(formatDateTimeLarge(raffle.reservedDate), 60, yStart + 36);
    
            // Pagos realizados
            doc.setFont("normal");
            doc.setTextColor("#000");
            doc.text(`Pagos realizados:`, 12, yStart + 45);
    
            // Tabla de pagos
            const payments = raffle.payments.map((payment) => [
                formatCurrencyCOP(+payment.amount),
                payment.paidAt ? formatDateTimeLargeIsNull(payment.paidAt) : formatDateTimeLarge(payment.createdAt),
                `${payment.user.firstName} ${payment.user.lastName}`,
                payment.user.identificationNumber,
            ]);
    
            autoTable(doc, {
                startY: yStart + 50,
                head: [["Monto", "Fecha", "Vendedor", "Identificación"]],
                body: payments,
                theme: "grid",
                styles: { fontSize: 10, textColor: "#000", halign: "center" },
                columnStyles: {
                    0: { cellWidth: 40 },
                    1: { cellWidth: 40 },
                    2: { cellWidth: 60 },
                    3: { cellWidth: 50 },
                },
                margin: { left: 12 },
            });
        });
    
        // Guardar el PDF
        doc.save(`resumen_compra_${dayjs().format("YYYYMMDD_HHmm")}.pdf`);
    };
    

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
            <div className="flex justify-between w-full">
                <IconButton
                    onClick={handleDownloadPDF}
                >
                    <Tooltip title='Descargar PDF'>
                        <PictureAsPdfIcon color="error"/>
                    </Tooltip>
                </IconButton>
                <IconButton
                    onClick={handleCloseModal}
                >
                    <Tooltip title='Cerrar Ventana'>
                        <CloseIcon/>
                    </Tooltip>
                </IconButton>
            </div>

            <div>
                <p className="mb-4 text-2xl font-bold text-center">
                    Resumen de Compra
                </p>
                <Box>
                    
                {pdfData.map((raffle) => (
                    <Box key={raffle.id} sx={{ mb: 2, border: "3px solid #1446A0", p: 2, borderRadius: 2}}>
                        <div className='flex gap-3'>
                        <p>Número:</p>
                        <p className='font-bold text-azul'>{formatWithLeadingZeros(raffle.number)}</p>
                        </div>
                        
                        <div className='flex gap-3'>
                        <p>Nombre:</p>
                        <p className='font-bold capitalize text-azul'>{raffle.firstName} {raffle.lastName}</p>
                        </div>
                        
                        <div className='flex gap-3'>
                        <p>Teléfono: </p>
                        <p className='font-bold capitalize text-azul'>{raffle.phone}</p>
                        </div>
                        
                        <div className='flex gap-3'>
                        <p>Dirección:</p>
                        <p className='font-bold capitalize text-azul'>{raffle.address}</p>
                        </div>
                        
                        <div className='flex gap-3'>
                        <p>Monto Pagado:</p>
                        <p className='font-bold capitalize text-azul'>{formatCurrencyCOP(+raffle.paymentAmount)}</p>
                        </div>
                        
                        <div className='flex gap-3'>
                        <p>Monto A Deber:</p>
                        <p className='font-bold capitalize text-azul'>{formatCurrencyCOP(+raffle.paymentDue)}</p>
                        </div>
                        
                        <div className='flex gap-3'>
                        <p>Fecha Reservado:</p>
                        <p className='font-bold capitalize text-azul'>{formatDateTimeLarge(raffle.reservedDate)}</p>
                        </div>
                        <Box
                            sx={{
                                mt: 2,
                                p: 2,
                                backgroundColor: "#F4F6FA",
                                border: "2px dashed #1446A0",
                                borderRadius: 2,
                            }}
                        >
                            <Typography variant="subtitle2" sx={{ fontWeight: "bold", mb: 1 }}>
                                Pagos realizados:
                            </Typography>
                            {raffle.payments.map((payment) => (
                                <Box
                                    key={payment.id}
                                    sx={{
                                        mb: 1,
                                        p: 1,
                                        border: "1px solid #D6D6D6",
                                        borderRadius: 1,
                                        backgroundColor: "#FFFFFF",
                                    }}
                                >
                                    <div className='flex gap-3'>
                                    <p>Monto:</p>
                                    <p className='font-bold capitalize text-azul'>{formatCurrencyCOP(+payment.amount)}</p>
                                    </div>
                                    {!payment.paidAt ? (
                                        <div className='flex gap-3'>
                                        <p>Fecha:</p>
                                        <p className='font-bold capitalize text-azul'>{formatDateTimeLarge(payment.createdAt)}</p>
                                        </div>
                                    ) : (
                                        <div className='flex gap-3'>
                                        <p>Fecha:</p>
                                        <p className='font-bold capitalize text-azul'>{formatDateTimeLargeIsNull(payment.paidAt)}</p>
                                        </div>
                                    )}
                                    <div className='flex gap-3'>
                                    <p>Vendedor:</p>
                                    <p className='font-bold capitalize text-azul'>{payment.user.firstName + ' ' + payment.user.lastName}</p>
                                    </div>
                                    <div className='flex gap-3'>
                                    <p>Identificación:</p>
                                    <p className='font-bold capitalize text-azul'>{payment.user.identificationNumber}</p>
                                    </div>
                                </Box>
                            ))}
                        </Box>
                    </Box>
                ))}
                </Box>
            </div>
            
            </Box>
        </Modal>
    )
}

export default PaymentSellNumbersModal