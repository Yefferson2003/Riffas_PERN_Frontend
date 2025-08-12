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
    width: 400,
    maxWidth: '100vw',
    bgcolor: '#f1f5f9',
    border: '2px solid #000',
    boxShadow: 24,
    p: 4,
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
            <div className="flex justify-between w-full">
                <IconButton
                    href=''
                    onClick={() => handleDownloadPDF({awards, pdfData, raffle})}
                >
                    <Tooltip title='Descargar PDF'>
                        <PictureAsPdfIcon color="error"/>
                    </Tooltip>
                </IconButton>
                <a
                    href={urlWasap}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ display: 'flex', alignItems: 'center', marginLeft: 8, marginRight: 8 }}
                >
                    <Tooltip title="Enviar por WhatsApp">
                        <img
                            src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg"
                            alt="WhatsApp"
                            width={28}
                            height={28}
                            style={{ display: 'block' }}
                        />
                    </Tooltip>
                </a>
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
                
                <Box sx={{ mb: 2, border: "3px solid #1446A0", p: 2, borderRadius: 2}}>
                    <div className='flex gap-3'>
                    <p>Rifa #:</p>
                    <p className='font-bold text-azul'>{raffle.id+ '-' +raffle.nitResponsable}</p>
                    </div>
                    <div className='flex gap-3'>
                    <p>Info: <span className='font-bold text-azul'>{raffle.description}</span></p>
                    </div>
                    <div className='flex gap-3'>
                    <p>Juega:</p>
                    <p className='font-bold text-azul'>{formatDateTimeLarge(raffle.playDate)}</p>
                    </div>
                </Box>
                    
                {pdfData.map((raffle) => (
                    <Box key={raffle.id} sx={{ mb: 2, border: "3px solid #1446A0", p: 2, borderRadius: 2}}>
                        <div className='flex gap-3'>
                        <p>Número:</p>
                        <p className='font-bold text-azul'>{formatWithLeadingZeros(raffle.number, totalNumbers)}</p>
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