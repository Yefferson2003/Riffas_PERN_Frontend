import dayjs from "dayjs";
import jsPDF from 'jspdf';
import { PaymentSellNumbersModalProps } from "../components/indexView/PaymentSellNumbersModal";
import { InfoRaffleType } from "../components/indexView/ViewRaffleNumberData";
import { AwardType } from "../types";
export const azul = '#1446A0'


export function translateRaffleStatus(status: "available" | "sold" | "pending" | "apartado"): string {
    const translations: Record<typeof status, string> = {
        available: "Disponible",
        sold: "Pagados",
        pending: "Pendiente",
        apartado: "Apartado"
    };
    return translations[status] || status;
}

export const rifflesNumbersStatusEnum = ['available', 'sold', 'pending', 'apartado'] as const;

export const colorStatusRaffleNumber : {[key: string] : "warning" | "default" | "success" | undefined } = {
    available: 'default',
    sold: 'success',
    pending: 'warning',
    reserved: undefined, 
}

export const getChipStyles = (status: string) => {
    const baseStyles = {
        height: 35, 
        fontWeight: 'bold'
    };

    if (status === 'apartado') {
        return {
            ...baseStyles,
            backgroundColor: '#FFC107', 

            color: '#fff',
            '&:hover': {
                backgroundColor: '#FFB300',
            }
        };
    }

    return baseStyles;
};

export function formatCurrencyCOP(amount: number) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2, // Mostrar siempre dos decimales
        maximumFractionDigits: 2  // Redondear a dos decimales si hay más
    }).format(amount);
}

export const formatDateTimeLarge = (dateString?: string | null): string => {
    if (!dateString) return "Fecha no disponible";

    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "Fecha inválida";

    const formatterDate = new Intl.DateTimeFormat("es-ES", {
        year: "numeric",
        month: "short",
        day: "numeric",
    });

    const formatterTime = new Intl.DateTimeFormat("es-ES", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
    });

    const formattedDate = formatterDate.format(date);
    const formattedTime = formatterTime.format(date);

    return `${formattedDate}, ${formattedTime}`;
};

export const formatDateTimeLargeIsNull = (dateString: string | null): string => {

    if (!dateString) {
        return '---'
    }
    const date = new Date(dateString);

    const formatterDate = new Intl.DateTimeFormat('es-ES', {
        year: 'numeric',
        month: 'short', // Mes abreviado
        day: 'numeric',
    });

    const formatterTime = new Intl.DateTimeFormat('es-ES', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
    });

    const formattedDate = formatterDate.format(date); // Formatea solo la fecha
    const formattedTime = formatterTime.format(date); // Formatea solo la hora

    return `${formattedDate}, ${formattedTime}`;
};

export function formatWithLeadingZeros(num: number, totalNumbers: number): string {
  const totalDigits = Math.floor(Math.log10(totalNumbers -1)) + 1; // Calculate digits needed
return num.toString().padStart(totalDigits, '0');
}

type redirectToWhatsAppType = {
    totalNumbers: number,
    abonosPendientes?: number,
    numbers: {
        numberId: number;
        number: number;
    }[]
    phone: string,
    name: string,
    amount: number,
    infoRaffle: InfoRaffleType
    payments?: {
        amount: string;
        isValid: boolean
    }[]
    awards: AwardType[]
    reservedDate: string | null
    statusRaffleNumber?: "sold" | "pending" | "apartado"
}

export const handleMessageToWhatsAppAviso = ({
    totalNumbers, 
    number, 
    telefono, 
    name,
    raffleName
}: {
    totalNumbers: number;
    number: number;
    telefono: string;
    name: string;
    raffleName: string;
}) => {
    const formattedNumber = formatWithLeadingZeros(number, totalNumbers);
    
    const message = `📢 ¡Hola *${name}*! 👋

🎯 Tenemos noticias emocionantes para ti ✨

Estamos a punto de lanzar nuestra nueva *rifa* 🎉  
Y queremos darte prioridad como cliente VIP 🌟

❓ ¿Te gustaría conservar tu número anterior *${formattedNumber}* 🎲 o prefieres cambiarlo?

📞 _Esperamos tu respuesta pronto..._

🙏 *Gracias por ser parte de la familia* 💚

Atentamente,  
El equipo de *${raffleName}* 🎟️
`;

    const encodedMessage = encodeURIComponent(message);
    
    const whatsappUrl = `https://wa.me/${telefono}?text=${encodedMessage}`;
    
    window.open(whatsappUrl, '_blank');
};



export const redirectToWhatsApp = ({
    totalNumbers,
    amount,
    abonosPendientes,
    infoRaffle,
    name,
    phone,
    numbers,
    payments,
    statusRaffleNumber,
    awards,
    reservedDate,
}: redirectToWhatsAppType): string => {
    if (!phone) return "";

    const rafflePrice = +infoRaffle.amountRaffle;
    let deuda = 0;

    if (statusRaffleNumber === "pending" && payments) {
        // console.log('----entro 1');
        
        const abonosValidos = payments
            .filter(p => p.isValid)
            .reduce((acc, p) => acc + Number(p.amount), 0);
        deuda = Math.max((rafflePrice * numbers.length) - abonosValidos, 0);
    } else if (payments && payments.length > 0) {
        // console.log('----entro 2');
        const abonosValidos = payments
            .filter(p => p.isValid)
            .reduce((acc, p) => acc + Number(p.amount), 0);
        const totalAbonado = abonosValidos + amount;
        deuda = Math.max((rafflePrice * numbers.length) - totalAbonado, 0);
    } else {
        // console.log('----entro 3');
        deuda = amount === rafflePrice ? 0 : ( Math.max((rafflePrice * numbers.length) - (amount + (abonosPendientes || 0) ), 0));
    }

    let paymentTypeMessage = "";
    if (payments && statusRaffleNumber === "pending" && payments?.length > 0) {
        const abonosValidos = payments
            .filter(p => p.isValid)
            .reduce((acc, p) => acc + Number(p.amount), 0);
        paymentTypeMessage = `Has realizado abonos por un total de *${formatCurrencyCOP(abonosValidos)}* para la rifa *“${infoRaffle.name}”* 💸`;
    } else if (amount === 0) {
        paymentTypeMessage = `Has apartado el/los número(s) en la rifa *“${infoRaffle.name.trim()}”* 🎟`;
    } else if (amount < rafflePrice) {
        paymentTypeMessage = `Has realizado un abono de *${formatCurrencyCOP(amount)}* para la rifa *“${infoRaffle.name}”* 💵`;
    } else if (amount === rafflePrice) {
        paymentTypeMessage = `Has realizado el pago completo de *${formatCurrencyCOP(amount)}* para la rifa *“${infoRaffle.name}”* ✅`;
    } else {
        paymentTypeMessage = `Has realizado un pago de *${formatCurrencyCOP(amount)}* para la rifa *“${infoRaffle.name}”* 💰`;
    }

    const numbersList = numbers
        .map(n => formatWithLeadingZeros(n.number, totalNumbers))
        .join(", ");
    
    const premios = awards?.length
        ? awards.map(a => `• ${a.name} (${formatDateTimeLarge(a.playDate)})`).join("\n")
        : "Sin premios registrados";


    const message = `
✨ Hola *${name.trim()}*

${paymentTypeMessage}

📌 Detalles:
🔢 Números: *${numbersList}*
💬 Descripción: *${infoRaffle.description.trim()}*
💵 Valor por número: *${formatCurrencyCOP(rafflePrice)}*
📉 Deuda actual: *${formatCurrencyCOP(deuda)}*
🗓 Sorteo: *${formatDateTimeLarge(infoRaffle.playDate)}*

🎯 *Detalles de la Rifa*
📅 Fecha Juego: *${formatDateTimeLarge(infoRaffle.playDate)}*
💵 Valor por número: *${formatCurrencyCOP(+infoRaffle.amountRaffle)}*
🎁 Premios:
${premios}

🕒 Reservado: *${formatDateTimeLarge(reservedDate ?? "")}*

Si tienes alguna pregunta, estamos aquí para ayudarte 🤝

Saludos,  
*${infoRaffle.responsable.trim()}*
`.trim();

    const encodedMessage = encodeURIComponent(message);
    return `https://wa.me/${phone}?text=${encodedMessage}`;
};

export const sendPaymentReminderWhatsApp = ({
    totalNumbers,
    numbers,
    phone,
    name,
    infoRaffle,
    reservedDate,
    statusRaffleNumber,
    payments,
    amount,
}: redirectToWhatsAppType): string => {
    if (!phone) return "";

    const rafflePrice = +infoRaffle.amountRaffle;
    let deuda = 0;

    if (statusRaffleNumber === "pending" && payments) {
        const abonosValidos = payments
            .filter(p => p.isValid)
            .reduce((acc, p) => acc + Number(p.amount), 0);
        deuda = Math.max((rafflePrice * numbers.length) - abonosValidos, 0);
    } else if (payments && payments.length > 0) {
        const abonosValidos = payments
            .filter(p => p.isValid)
            .reduce((acc, p) => acc + Number(p.amount), 0);
        const totalAbonado = abonosValidos + amount;
        deuda = Math.max((rafflePrice * numbers.length) - totalAbonado, 0);
    } else {
        deuda = Math.max((rafflePrice * numbers.length) - amount, 0);
    }

    const numbersList = numbers
        .map(n => formatWithLeadingZeros(n.number, totalNumbers))
        .join(", ");

    const message = `
✨ Hola *${name.trim()}*,

Recuerda que apartaste el número(s) *${numbersList}* en la rifa *“${infoRaffle.name.trim()}”* 🎟

📌 Detalles:
💵 Valor pendiente: *${formatCurrencyCOP(deuda)}*
🗓 Fecha de la reservación: *${formatDateTimeLarge(reservedDate)}*
🗓 Fecha del sorteo: *${formatDateTimeLarge(infoRaffle.playDate)}*

Por favor realiza tu abono o pago para asegurar tu participación ✅
⏳ Los números no abonados no participan.

🍀 ¡Mucha suerte!
*${infoRaffle.name.trim()}*
`.trim();

    const encodedMessage = encodeURIComponent(message);
    return `https://wa.me/${phone}?text=${encodedMessage}`;
};


const downloadPDF = (blob: Blob, filename: string) => {
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;

    // Para móviles: simula clic y limpia
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Limpieza de memoria
    URL.revokeObjectURL(link.href);
};

const addMultilineText = (
    doc: jsPDF,
    text: string,
    x: number,
    y: number,
    maxWidth: number,
    lineHeight: number,
    alignCenter: 'center' | undefined
) => {


    const lines = doc.splitTextToSize(text, maxWidth);
    lines.forEach((line: string) => {
        doc.text(line, x, y, alignCenter ? 
            { align: 'center'}
            : { align: undefined}
        );
        y += lineHeight;
    });
    return y;
};


export const handleDownloadPDF = async ({
    raffle,
    awards,
    pdfData,
    userName,
    userLastName,
    totalNumbers
}: Pick<PaymentSellNumbersModalProps, "raffle" | "awards" | "pdfData" | 'totalNumbers'> & {
    userName?: string;
    userLastName?: string;
}) => {
    const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: [80, 150],
    });

    const LINE_SPACING = 4;
    const SECTION_SPACING = 6;

    pdfData.forEach((entry, index) => {
        if (index > 0) doc.addPage([80, 150]);
        let y = 10;

    
        // 🧾 Encabezado
        doc.setFont("courier", "bold");
        doc.setFontSize(11);
        doc.text(raffle.name, 40, y, { align: "center" });
        y += LINE_SPACING + 1;

        // Responsable (como título)
        doc.setFont("courier", "normal");
        doc.text("Responsable", 40, y, { align: "center" });
        y += LINE_SPACING - 1;
        doc.line(5, y, 75, y); // línea separadora
        y += LINE_SPACING;

        // Nombre y NIT debajo
        doc.setFont("courier", "normal");
        doc.setFontSize(9);
        doc.text(`${raffle.nameResponsable}`, 40, y, { align: "center" });
        y += LINE_SPACING;
        doc.text(`NIT: ${raffle.nitResponsable}`, 40, y, { align: "center" });
        y += SECTION_SPACING;
        
        
        const cleanDescription = raffle.description.trim();
        // Descripción multilínea (centrada y ajustada)
        doc.setFont("courier", "italic");
        doc.setFontSize(9);
        y = addMultilineText(doc, `"${cleanDescription}"`, 40, y, 70, LINE_SPACING, "center");
        y += SECTION_SPACING;


        doc.setDrawColor(0);
        doc.setLineWidth(0.2);
        doc.line(5, y, 75, y);
        y += LINE_SPACING;

        // 👤 Detalles del comprador
        doc.setFont("courier", "bold");
        doc.text("Detalles del Comprador", 40, y, { align: "center" });
        y += LINE_SPACING - 1;
        doc.line(5, y, 75, y);
        y += LINE_SPACING;

        doc.setFont("courier", "normal");
        doc.text("Boleto #:", 5, y);
        doc.setFont("courier", "bold");
        doc.text(`${formatWithLeadingZeros(entry.number, totalNumbers)}`, 30, y);
        y += LINE_SPACING;

        doc.setFont("courier", "normal");
        doc.text("Nombre:", 5, y);
        doc.setFont("courier", "bold");
        doc.text(`${entry.firstName ?? ""} ${entry.lastName ?? ""}`, 30, y);
        y += LINE_SPACING;

        // doc.setFont("courier", "normal");
        // doc.text("ID:", 5, y);
        // doc.setFont("courier", "bold");
        // doc.text(`${entry.identificationType ?? ""} ${entry.identificationNumber ?? ""}`, 30, y);
        // y += LINE_SPACING;

        doc.setFont("courier", "normal");
        doc.text("Teléfono:", 5, y);
        doc.setFont("courier", "bold");
        doc.text(`${entry.phone ?? ""}`, 30, y);
        y += LINE_SPACING;

        doc.setFont("courier", "normal");
        doc.text("Dirección:", 5, y);
        doc.setFont("courier", "bold");
        doc.text(`${entry.address || "No registrada"}`, 30, y);
        y += SECTION_SPACING;

        // 🎯 Detalles de la rifa
        doc.setFont("courier", "bold");
        doc.text("Detalles de la Rifa", 40, y, { align: "center" });
        y += LINE_SPACING - 1;
        doc.line(5, y, 75, y);
        y += LINE_SPACING;

        doc.setFont("courier", "normal");
        doc.text("Fecha Juego:", 5, y);
        doc.setFont("courier", "bold");
        doc.text(`${formatDateTimeLarge(raffle.playDate)}`, 30, y);
        y += LINE_SPACING;

        doc.setFont("courier", "normal");
        doc.text("Valor Rifa:", 5, y);
        doc.setFont("courier", "bold");
        doc.text(`${formatCurrencyCOP(+raffle.price)}`, 30, y);
        y += SECTION_SPACING;

        // 🏆 Premios
        if (awards.length > 0) {
            doc.setFont("courier", "bold");
            doc.text("Premios", 40, y, { align: "center" });
            y += LINE_SPACING - 1;
            doc.line(5, y, 75, y);
            y += LINE_SPACING;

            awards.forEach((award) => {
                doc.setFont("courier", "normal");
                y = addMultilineText(doc, `• ${award.name}`, 5, y, 70, LINE_SPACING, undefined);

                doc.setFont("courier", "italic");
                y = addMultilineText(doc, `${formatDateTimeLarge(award.playDate)}`, 10, y, 65, LINE_SPACING, undefined);
                y += SECTION_SPACING;
            });
        }else {
            doc.setFont("courier", "italic");
            doc.text("Sin premios registrados", 40, y, { align: "center" });
            y += SECTION_SPACING;
        }

        // 💰 Resumen de pago
        doc.setFont("courier", "bold");
        doc.text("Resumen de Pago", 40, y, { align: "center" });
        y += LINE_SPACING - 1;
        doc.line(5, y, 75, y);
        y += LINE_SPACING;

        doc.setFont("courier", "normal");
        doc.text("Valor:", 5, y);
        doc.setFont("courier", "bold");
        doc.text(`${formatCurrencyCOP(+entry.paymentAmount)}`, 30, y);
        y += LINE_SPACING;

        const abonado = entry.payments
            .filter((p) => p.isValid)
            .reduce((sum, p) => sum + parseFloat(p.amount), 0);

        doc.setFont("courier", "normal");
        doc.text("Abonado:", 5, y);
        doc.setFont("courier", "bold");
        doc.text(`${formatCurrencyCOP(abonado)}`, 30, y);
        y += LINE_SPACING;

        doc.setFont("courier", "normal");
        doc.text("Deuda:", 5, y);
        doc.setFont("courier", "bold");
        doc.text(`${formatCurrencyCOP(+entry.paymentDue)}`, 30, y);
        y += SECTION_SPACING;

        // 📄 Pagos realizados
        if (entry.payments.length > 0) {
            doc.setFont("courier", "bold");
            doc.text("Pagos", 40, y, { align: "center" });
            y += LINE_SPACING - 1;
            doc.line(5, y, 75, y);
            y += LINE_SPACING;

            doc.setFont("courier", "normal");
            entry.payments
                .filter((p) => p.isValid)
                .forEach((p) => {
                    doc.text(`${formatCurrencyCOP(+p.amount)} - ${p.user.firstName}`, 5, y);
                    y += LINE_SPACING;
                });
        } else {
            doc.setFont("courier", "italic");
            doc.text("Sin pagos registrados", 40, y, { align: "center" });
            y += LINE_SPACING;
        }

        // 🙏 Pie de página
        y += SECTION_SPACING;
        doc.setFont("courier", "italic");
        doc.text(`Reservado: ${formatDateTimeLarge(entry.reservedDate ?? "")}`, 5, y);
        y += LINE_SPACING;
        doc.setFont("courier", "bold");
        doc.text("¡Gracias por su compra!", 40, y, { align: "center" });

        // 📄 Número de página
        doc.setFontSize(8);
        doc.text(`Página ${index + 1}`, 75, 145, { align: "right" });
    });

    // 📥 Descargar PDF directamente
    const todayDate = dayjs().format('DDMMYYYY');
    const filename = `Resumen_Rifa_${userLastName || 'responsable'}_${userName || ''}_${todayDate}.pdf`;

    // ✅ Generar blob y descargar
    const pdfBlob = doc.output('blob');

    // 🧠 Compatibilidad móvil: usar saveAs si está disponible
    downloadPDF(pdfBlob, filename);
    // try {
    //     saveAs(pdfBlob, filename);
    // } catch (error) {
    //     console.log(error);
        
    //     // Fallback para navegadores que no soportan saveAs (muy raro)
    //     const link = document.createElement('a');
    //     link.href = URL.createObjectURL(pdfBlob);
    //     link.download = filename;
    //     document.body.appendChild(link);
    //     link.click();
    //     document.body.removeChild(link);
    // }

};

export const handleDownloadReservationPDF = async ({
    raffle,
    awards,
    totalNumbers,
    reservation, 
}: Pick<PaymentSellNumbersModalProps, "raffle" | "awards" | "totalNumbers"> & {
    reservation: {
        number: number;
        firstName?: string ;
        lastName?: string ;
        phone?: string ;
        address?: string ;
        reservedDate?: string;
    };
}) => {
    const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: [80, 150],
    });

    const LINE_SPACING = 4;
    const SECTION_SPACING = 6;

    let y = 10;

    // 🧾 Encabezado
    doc.setFont("courier", "bold");
    doc.setFontSize(11);
    doc.text(raffle.name, 40, y, { align: "center" });
    y += LINE_SPACING + 1;

    // Responsable (como título)
    doc.setFont("courier", "normal");
    doc.text("Responsable", 40, y, { align: "center" });
    y += LINE_SPACING - 1;
    doc.line(5, y, 75, y); // línea separadora
    y += LINE_SPACING;

    // Nombre y NIT debajo
    doc.setFont("courier", "normal");
    doc.setFontSize(9);
    doc.text(`${raffle.nameResponsable}`, 40, y, { align: "center" });
    y += LINE_SPACING;
    doc.text(`NIT: ${raffle.nitResponsable}`, 40, y, { align: "center" });
    y += SECTION_SPACING;

    const cleanDescription = raffle.description.trim();
    // Descripción multilínea (centrada y ajustada)
    doc.setFont("courier", "italic");
    doc.setFontSize(9);
    y = addMultilineText(doc, `"${cleanDescription}"`, 40, y, 70, LINE_SPACING, 'center');
    y += SECTION_SPACING;


    doc.setDrawColor(0);
    doc.setLineWidth(0.2);
    doc.line(5, y, 75, y);
    y += LINE_SPACING;

    // 👤 Detalles del comprador
    doc.setFont("courier", "bold");
    doc.text("Detalles del Comprador", 40, y, { align: "center" });
    y += LINE_SPACING - 1;
    doc.line(5, y, 75, y);
    y += LINE_SPACING;

    doc.setFont("courier", "normal");
    doc.text("Boleto #:", 5, y);
    doc.setFont("courier", "bold");
    doc.text(`${formatWithLeadingZeros(reservation.number, totalNumbers)}`, 30, y);
    y += LINE_SPACING;

    doc.setFont("courier", "normal");
    doc.text("Nombre:", 5, y);
    doc.setFont("courier", "bold");
    doc.text(`${reservation.firstName ?? ""} ${reservation.lastName ?? ""}`, 30, y);
    y += LINE_SPACING;

    doc.setFont("courier", "normal");
    doc.text("Teléfono:", 5, y);
    doc.setFont("courier", "bold");
    doc.text(`${reservation.phone ?? ""}`, 30, y);
    y += LINE_SPACING;

    doc.setFont("courier", "normal");
    doc.text("Dirección:", 5, y);
    doc.setFont("courier", "bold");
    doc.text(`${reservation.address || "No registrada"}`, 30, y);
    y += SECTION_SPACING;

    // 🎯 Detalles de la rifa
    doc.setFont("courier", "bold");
    doc.text("Detalles de la Rifa", 40, y, { align: "center" });
    y += LINE_SPACING - 1;
    doc.line(5, y, 75, y);
    y += LINE_SPACING;

    doc.setFont("courier", "normal");
    doc.text("Fecha Juego:", 5, y);
    doc.setFont("courier", "bold");
    doc.text(`${formatDateTimeLarge(raffle.playDate)}`, 30, y);
    y += LINE_SPACING;

    doc.setFont("courier", "normal");
    doc.text("Valor Rifa:", 5, y);
    doc.setFont("courier", "bold");
    doc.text(`${formatCurrencyCOP(+raffle.price)}`, 30, y);
    y += SECTION_SPACING;

    //Premios
    if (awards.length > 0) {
        doc.setFont("courier", "bold");
        doc.text("Premios", 40, y, { align: "center" });
        y += LINE_SPACING - 1;
        doc.line(5, y, 75, y);
        y += LINE_SPACING;

        awards.forEach((award) => {
            doc.setFont("courier", "normal");
            y = addMultilineText(doc, `• ${award.name}`, 5, y, 70, LINE_SPACING, undefined);

            doc.setFont("courier", "italic");
            y = addMultilineText(doc, `${formatDateTimeLarge(award.playDate)}`, 10, y, 65, LINE_SPACING, undefined);
            y += SECTION_SPACING;
        });
    }else {
        doc.setFont("courier", "italic");
        doc.text("Sin premios registrados", 40, y, { align: "center" });
        y += SECTION_SPACING;
    }

    // 💰 Resumen de pago (solo valor y deuda)
    doc.setFont("courier", "bold");
    doc.text("Resumen de Pago", 40, y, { align: "center" });
    y += LINE_SPACING - 1;
    doc.line(5, y, 75, y);
    y += LINE_SPACING;

    doc.setFont("courier", "normal");
    doc.text("Valor:", 5, y);
    doc.setFont("courier", "bold");
    doc.text(`${formatCurrencyCOP(+raffle.price)}`, 30, y);
    y += LINE_SPACING;

    doc.setFont("courier", "normal");
    doc.text("Deuda:", 5, y);
    doc.setFont("courier", "bold");
    doc.text(`${formatCurrencyCOP(+raffle.price)}`, 30, y);
    y += SECTION_SPACING;

    // 🙏 Pie de página
    y += SECTION_SPACING;
    doc.setFont("courier", "italic");
    doc.text(`Reservado: ${formatDateTimeLarge(reservation.reservedDate ?? "")}`, 5, y);
    y += LINE_SPACING;
    doc.setFont("courier", "bold");
    doc.text("¡Número apartado con éxito!", 40, y, { align: "center" });

    // 📄 Número de página
    doc.setFontSize(8);
    doc.text(`Página 1`, 75, 145, { align: "right" });

    // 📥 Descargar PDF
    const todayDate = dayjs().format("DDMMYYYY");
    const boletoNumber = formatWithLeadingZeros(reservation.number, totalNumbers);
    const filename = `Apartado_Boleto_${boletoNumber}_${todayDate}.pdf`;

    const pdfBlob = doc.output("blob");
    downloadPDF(pdfBlob, filename);
};

export const handleViewAndDownloadPDF = async ({
    raffle,
    awards,
    pdfData,
    totalNumbers
}: Pick<PaymentSellNumbersModalProps, "raffle" | "awards" | "pdfData" | 'totalNumbers'> & {
    userName?: string;
    userLastName?: string;
}) => {
    const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: [80, 150],
    });

    const LINE_SPACING = 4;
    const SECTION_SPACING = 6;

    pdfData.forEach((entry, index) => {
        if (index > 0) doc.addPage([80, 150]);
        let y = 10;

        // 🧾 Encabezado
        doc.setFont("courier", "bold");
        doc.setFontSize(11);
        doc.text(raffle.name, 40, y, { align: "center" });
        y += LINE_SPACING + 1;

        // Responsable (como título)
        doc.setFont("courier", "normal");
        doc.text("Responsable", 40, y, { align: "center" });
        y += LINE_SPACING - 1;
        doc.line(5, y, 75, y); // línea separadora
        y += LINE_SPACING;

        // Nombre y NIT debajo
        doc.setFont("courier", "normal");
        doc.setFontSize(9);
        doc.text(`${raffle.nameResponsable}`, 40, y, { align: "center" });
        y += LINE_SPACING;
        doc.text(`NIT: ${raffle.nitResponsable}`, 40, y, { align: "center" });
        y += SECTION_SPACING;

        const cleanDescription = raffle.description.trim();
        // Descripción multilínea (centrada y ajustada)
        doc.setFont("courier", "italic");
        doc.setFontSize(9);
        y = addMultilineText(doc, `"${cleanDescription}"`, 40, y, 70, LINE_SPACING, 'center');
        y += SECTION_SPACING;

        doc.setDrawColor(0);
        doc.setLineWidth(0.2);
        doc.line(5, y, 75, y);
        y += LINE_SPACING;

        // 👤 Detalles del comprador
        doc.setFont("courier", "bold");
        doc.text("Detalles del Comprador", 40, y, { align: "center" });
        y += LINE_SPACING - 1;
        doc.line(5, y, 75, y);
        y += LINE_SPACING;

        doc.setFont("courier", "normal");
        doc.text("Boleto #:", 5, y);
        doc.setFont("courier", "bold");
        doc.text(`${formatWithLeadingZeros(entry.number, totalNumbers)}`, 30, y);
        y += LINE_SPACING;

        doc.setFont("courier", "normal");
        doc.text("Nombre:", 5, y);
        doc.setFont("courier", "bold");
        doc.text(`${entry.firstName ?? ""} ${entry.lastName ?? ""}`, 30, y);
        y += LINE_SPACING;

        // doc.setFont("courier", "normal");
        // doc.text("ID:", 5, y);
        // doc.setFont("courier", "bold");
        // doc.text(`${entry.identificationType ?? ""} ${entry.identificationNumber ?? ""}`, 30, y);
        // y += LINE_SPACING;

        doc.setFont("courier", "normal");
        doc.text("Teléfono:", 5, y);
        doc.setFont("courier", "bold");
        doc.text(`${entry.phone ?? ""}`, 30, y);
        y += LINE_SPACING;

        doc.setFont("courier", "normal");
        doc.text("Dirección:", 5, y);
        doc.setFont("courier", "bold");
        doc.text(`${entry.address || "No registrada"}`, 30, y);
        y += SECTION_SPACING;

        // 🎯 Detalles de la rifa
        doc.setFont("courier", "bold");
        doc.text("Detalles de la Rifa", 40, y, { align: "center" });
        y += LINE_SPACING - 1;
        doc.line(5, y, 75, y);
        y += LINE_SPACING;

        doc.setFont("courier", "normal");
        doc.text("Fecha Juego:", 5, y);
        doc.setFont("courier", "bold");
        doc.text(`${formatDateTimeLarge(raffle.playDate)}`, 30, y);
        y += LINE_SPACING;

        doc.setFont("courier", "normal");
        doc.text("Valor Rifa:", 5, y);
        doc.setFont("courier", "bold");
        doc.text(`${formatCurrencyCOP(+raffle.price)}`, 30, y);
        y += SECTION_SPACING;

        // 🏆 Premios
        if (awards.length > 0) {
            doc.setFont("courier", "bold");
            doc.text("Premios", 40, y, { align: "center" });
            y += LINE_SPACING - 1;
            doc.line(5, y, 75, y);
            y += LINE_SPACING;

            awards.forEach((award) => {
                doc.setFont("courier", "normal");
                y = addMultilineText(doc, `• ${award.name}`, 5, y, 70, LINE_SPACING, undefined);

                doc.setFont("courier", "italic");
                y = addMultilineText(doc, `${formatDateTimeLarge(award.playDate)}`, 10, y, 65, LINE_SPACING, undefined);
                y += SECTION_SPACING;
            });
        }else {
            doc.setFont("courier", "italic");
            doc.text("Sin premios registrados", 40, y, { align: "center" });
            y += SECTION_SPACING;
        }

        // 💰 Resumen de pago
        doc.setFont("courier", "bold");
        doc.text("Resumen de Pago", 40, y, { align: "center" });
        y += LINE_SPACING - 1;
        doc.line(5, y, 75, y);
        y += LINE_SPACING;

        doc.setFont("courier", "normal");
        doc.text("Valor:", 5, y);
        doc.setFont("courier", "bold");
        doc.text(`${formatCurrencyCOP(+entry.paymentAmount)}`, 30, y);
        y += LINE_SPACING;

        const abonado = entry.payments
            .filter((p) => p.isValid)
            .reduce((sum, p) => sum + parseFloat(p.amount), 0);

        doc.setFont("courier", "normal");
        doc.text("Abonado:", 5, y);
        doc.setFont("courier", "bold");
        doc.text(`${formatCurrencyCOP(abonado)}`, 30, y);
        y += LINE_SPACING;

        doc.setFont("courier", "normal");
        doc.text("Deuda:", 5, y);
        doc.setFont("courier", "bold");
        doc.text(`${formatCurrencyCOP(+entry.paymentDue)}`, 30, y);
        y += SECTION_SPACING;

        // 📄 Pagos realizados
        if (entry.payments.length > 0) {
            doc.setFont("courier", "bold");
            doc.text("Pagos", 40, y, { align: "center" });
            y += LINE_SPACING - 1;
            doc.line(5, y, 75, y);
            y += LINE_SPACING;

            doc.setFont("courier", "normal");
            entry.payments
                .filter((p) => p.isValid)
                .forEach((p) => {
                    doc.text(`${formatCurrencyCOP(+p.amount)} - ${p.user.firstName}`, 5, y);
                    y += LINE_SPACING;
                });
        } else {
            doc.setFont("courier", "italic");
            doc.text("Sin pagos registrados", 40, y, { align: "center" });
            y += LINE_SPACING;
        }

        // 🙏 Pie de página
        y += SECTION_SPACING;
        doc.setFont("courier", "italic");
        doc.text(`Reservado: ${formatDateTimeLarge(entry.reservedDate ?? "")}`, 5, y);
        y += LINE_SPACING;
        doc.setFont("courier", "bold");
        doc.text("¡Gracias por su compra!", 40, y, { align: "center" });

        // 📄 Número de página
        doc.setFontSize(8);
        doc.text(`Página ${index + 1}`, 75, 145, { align: "right" });
    });

    // 📥 Descargar PDF directamente
    // const todayDate = dayjs().format('DDMMYYYY');
    // const filename = `Resumen_Rifa_${userLastName || 'responsable'}_${userName || ''}_${todayDate}.pdf`;

    // ✅ Generar blob y descargar
    const pdfBlob = doc.output('blob');

    const url = URL.createObjectURL(pdfBlob);

    const newWindow = window.open(url);

    if (newWindow) {
        newWindow.onload = () => {
            newWindow.print();
        };
        } else {
        console.error("No se pudo abrir la ventana. Posiblemente el navegador bloqueó el popup.");
    }


};