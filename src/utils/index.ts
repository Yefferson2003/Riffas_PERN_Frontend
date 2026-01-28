import dayjs from "dayjs";
import html2canvas from "html2canvas";
import jsPDF from 'jspdf';
import { uploadImageToImgbb } from "../api/imgbbApi";
import { PaymentSellNumbersModalProps } from "../components/indexView/PaymentSellNumbersModal";
import { InfoRaffleType } from "../components/indexView/ViewRaffleNumberData";
import { AwardType, StatusRaffleNumbersType } from "../types";
// interface PDFDataEntry {
//     number: number;
//     firstName?: string;
//     lastName?: string;
//     phone?: string;
//     address?: string;
//     paymentAmount: number;
//     paymentDue: number;
//     reservedDate?: string;
//     payments: {
//         amount: string;
//         isValid: boolean;
//         user?: {
//             firstName?: string;
//         };
//     }[];
// }

// interface MultiplePDFData {
//     data: PDFDataEntry[];
//     customerName: string;
// }

// interface RaffleData {
//     name: string;
//     description: string;
//     nameResponsable: string;
//     nitResponsable: string;
//     playDate: string;
//     price: string;
// }
export const azul = '#1446A0'

/**
 * Convierte una cadena de texto a formato capitalizado (primera letra mayúscula, resto minúsculas)
 * @param text - El texto a capitalizar
 * @returns El texto capitalizado
 */
export function capitalize(text: string): string {
    if (!text || typeof text !== 'string') return '';
    return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
}

/**
 * Capitaliza cada palabra en una cadena de texto
 * @param text - El texto a capitalizar
 * @returns El texto con cada palabra capitalizada
 */
export function capitalizeWords(text: string): string {
    if (!text || typeof text !== 'string') return '';
    return text
        .toLowerCase()
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

export function translateRaffleStatus(status: StatusRaffleNumbersType): string {
    const translations: Record<typeof status, string> = {
        available: "Disponible",
        sold: "Pagado",
        pending: "Apartado",
        apartado: "Pendiente"
    };
    return translations[status] || status;
}

export function translateRaffleStatusSelect(status: StatusRaffleNumbersType): string {
    const translations: Record<typeof status, string> = {
        available: "Disponibles",
        sold: "Pagados",
        pending: "Apartados - Abonados",
        apartado: "Por Confirmar"
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

// Función para abrir WhatsApp compatible con iOS y Android
export function openWhatsAppUrl(url: string) {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    if (isIOS) {
        window.location.href = url;
    } else {
        window.open(url, '_blank');
    }
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
    priceRaffleNumber?: number
    award?: AwardType | undefined
    resumen?: boolean
    paymentAmount?: number
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

    // Normalizar Unicode para compatibilidad con iOS
    const normalizedMessage = message.normalize('NFC');
    const encodedMessage = encodeURIComponent(normalizedMessage);
    
    const whatsappUrl = `https://wa.me/${telefono}?text=${encodedMessage}`;
    
    openWhatsAppUrl(whatsappUrl);
};

// 📋 Función para generar mensaje de compra de rifa
export const generateRafflePurchaseMessage = ({
    totalNumbers,
    amount,
    abonosPendientes,
    infoRaffle,
    name,
    numbers,
    payments,
    statusRaffleNumber,
    reservedDate,
    priceRaffleNumber,
    resumen,
    paymentAmount
}: Omit<redirectToWhatsAppType, 'phone'> & { resumen?: boolean }): string => {
    const rafflePrice = priceRaffleNumber ?? +infoRaffle.amountRaffle;
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
        // Calcular deuda considerando múltiples números
        const totalCost = rafflePrice * numbers.length;
        const totalPaid = amount + (abonosPendientes || 0);
        deuda = Math.max(totalCost - totalPaid, 0);
    }

    const numbersList = numbers
        .map(n => formatWithLeadingZeros(n.number, totalNumbers))
        .join(", ");

    if (resumen) {
        // Mensaje resumido: saludo con nombre y paymentTypeMessage, SIEMPRE incluir los números reservados
        let paymentTypeMessage = "";
        const numerosTexto = numbers && numbers.length > 0
            ? `Números reservado(s): *${numbers.map(n => formatWithLeadingZeros(n.number, totalNumbers)).join(", ")}*\n`
            : "";

        if (payments && statusRaffleNumber === "pending" && payments?.length > 0 && amount !== 0) {
            const abonosValidos = payments
                .filter(p => p.isValid)
                .reduce((acc, p) => acc + Number(p.amount), 0);
            paymentTypeMessage = `Has realizado abonos por un total de *${formatCurrencyCOP(abonosValidos)}* para la rifa *"${infoRaffle.name}"* 💸`;
        } else if (paymentAmount === 0 || amount === 0) {
            paymentTypeMessage = `Has apartado el/los número(s) en la rifa *"${infoRaffle.name.trim()}"* 🏷️`;
        } else if (amount < rafflePrice) {
            paymentTypeMessage = `Has realizado un abono de *${formatCurrencyCOP(amount)}* para la rifa *"${infoRaffle.name}"* 💵`;
        } else if (amount === rafflePrice * numbers.length) {
            paymentTypeMessage = `Has realizado el pago completo de *${formatCurrencyCOP(amount)}* para la rifa *"${infoRaffle.name}"* ✅`;
        } else {
            paymentTypeMessage = `Has realizado un pago de *${formatCurrencyCOP(amount)}* para la rifa *"${infoRaffle.name}"* 💰`;
        }

        return `\n${paymentTypeMessage}\n${numerosTexto}💵 Valor de la rifa: *${formatCurrencyCOP(rafflePrice)}*\n📉 Deuda actual: *${formatCurrencyCOP(deuda)}*\n🗓️ Fecha del sorteo: *${formatDateTimeLarge(infoRaffle.playDate)}*\n⏰ Reservado: *${formatDateTimeLarge(reservedDate ?? "")}*`;
    }

    // let paymentTypeMessage = "";
    // if (payments && statusRaffleNumber === "pending" && payments?.length > 0) {
    //     const abonosValidos = payments
    //         .filter(p => p.isValid)
    //         .reduce((acc, p) => acc + Number(p.amount), 0);
    //     paymentTypeMessage = `Has realizado abonos por un total de *${formatCurrencyCOP(abonosValidos)}* para la rifa *"${infoRaffle.name}"* 💸`;
    // } else if (amount === 0) {
    //     paymentTypeMessage = `Has apartado el/los número(s) en la rifa *"${infoRaffle.name.trim()}"* 🏷️`;
    // } else if (amount < rafflePrice) {
    //     paymentTypeMessage = `Has realizado un abono de *${formatCurrencyCOP(amount)}* para la rifa *"${infoRaffle.name}"* 💵`;
    // } else if (amount === rafflePrice * numbers.length) {
    //     // Pago completo solo si cubre TODOS los números
    //     paymentTypeMessage = `Has realizado el pago completo de *${formatCurrencyCOP(amount)}* para la rifa *"${infoRaffle.name}"* ✅`;
    // } else {
    //     paymentTypeMessage = `Has realizado un pago de *${formatCurrencyCOP(amount)}* para la rifa *"${infoRaffle.name}"* 💰`;
    // }

    // Mensaje completo (no resumen)
    const message = `
✨ Hola *${name.trim()}*

📌 *Detalles de la Rifa*
🔢 Números: *${numbersList}*
💬 Descripción: *${infoRaffle.description.trim()}*
💵 Valor por número: *${formatCurrencyCOP(rafflePrice)}*
📉 Deuda actual: *${formatCurrencyCOP(deuda)}*
🗓️ Fecha del sorteo: *${formatDateTimeLarge(infoRaffle.playDate)}*
⏰ Reservado: *${formatDateTimeLarge(reservedDate ?? "")}*
Saludos,
*${infoRaffle.responsable.trim()}*
`.trim();

    return message;
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
    priceRaffleNumber
}: redirectToWhatsAppType): string => {
    if (!phone) return "";

    const message = generateRafflePurchaseMessage({
        totalNumbers,
        amount,
        abonosPendientes,
        infoRaffle,
        name,
        numbers,
        payments,
        statusRaffleNumber,
        awards,
        reservedDate,
        priceRaffleNumber
    });

    // Normalizar Unicode para compatibilidad con iOS
    const normalizedMessage = message.normalize('NFC');
    const encodedMessage = encodeURIComponent(normalizedMessage);
    return `https://wa.me/${phone}?text=${encodedMessage}`;
};


export const sendPaymentReminderWhatsApp = ({
    totalNumbers,
    numbers,
    phone,
    name,
    infoRaffle,
    reservedDate,
    award,
    abonosPendientes,
}: redirectToWhatsAppType): string => {
    if (!phone) return "";

    // const rafflePrice = +infoRaffle.amountRaffle;
    const valorPendiente = abonosPendientes || 0;

    // if (typeof abonosPendientes === 'number') {
    //     valorPendiente = abonosPendientes;
    // } else if (statusRaffleNumber === "pending" && payments) {
    //     const abonosValidos = payments
    //         .filter(p => p.isValid)
    //         .reduce((acc, p) => acc + Number(p.amount), 0);
    //     valorPendiente = Math.max((rafflePrice * numbers.length) - abonosValidos, 0);
    // } else if (payments && payments.length > 0) {
    //     const abonosValidos = payments
    //         .filter(p => p.isValid)
    //         .reduce((acc, p) => acc + Number(p.amount), 0);
    //     const totalAbonado = abonosValidos + amount;
    //     valorPendiente = Math.max((rafflePrice * numbers.length) - totalAbonado, 0);
    // } else {
    //     valorPendiente = Math.max((rafflePrice * numbers.length) - amount, 0);
    // }

    const numbersList = numbers
        .map(n => formatWithLeadingZeros(n.number, totalNumbers))
        .join(", ");


    let premioInfo = "";
    if (award) {
        premioInfo = `, se viene nuestro proximo especial que se juega el *${formatDateTimeLarge(award.playDate).trim()}* y es *${award.name.trim()}*`;
    }

    const message = `
✨ Hola *${name.trim()}*, Recuerda que apartaste el número(s) *${numbersList}* en la rifa *“${infoRaffle.name.trim()}”*${premioInfo}

📌 Detalles
💵 Valor pendiente: *${formatCurrencyCOP(valorPendiente)}*
🗓 Fecha de la reservación: *${formatDateTimeLarge(reservedDate)}*
🗓 Fecha del sorteo: *${formatDateTimeLarge(infoRaffle.playDate)}*

Por favor realiza tu abono o pago para asegurar tu participación ✅
⏳ Los números no abonados no participan.

🍀 ¡Mucha suerte!
*${infoRaffle.name.trim()}*
`.trim();

    // Normalizar Unicode para compatibilidad con iOS
    const normalizedMessage = message.normalize('NFC');
    const encodedMessage = encodeURIComponent(normalizedMessage);
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

// Función separada para generar solo el blob del PDF sin descargarlo
export const generatePDFBlob = ({
    raffle,
    awards,
    pdfData,
    totalNumbers
}: Pick<PaymentSellNumbersModalProps, "raffle" | "awards" | "pdfData" | 'totalNumbers'>) => {
    const PAGE_WIDTH = 80;
    const PAGE_HEIGHT = 150;
    const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: [PAGE_WIDTH, PAGE_HEIGHT],
    });

    const LINE_SPACING = 4;
    const SECTION_SPACING = 6;
    const BOTTOM_MARGIN = 10;

    pdfData.forEach((entry, index) => {
        if (index > 0) doc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
        let y = 10;

        // 🧾 Encabezado (multilínea, salto de página si es necesario)
        doc.setFont("courier", "bold");
        doc.setFontSize(11);
        y = addMultilineText(doc, raffle.name, 40, y, 70, LINE_SPACING + 1, "center", doc, PAGE_HEIGHT, BOTTOM_MARGIN);

        // Responsable (como título)
        doc.setFont("courier", "normal");
        y = addMultilineText(doc, "Responsable", 40, y, 70, LINE_SPACING, "center", doc, PAGE_HEIGHT, BOTTOM_MARGIN);
        doc.line(5, y, 75, y); // línea separadora
        y += LINE_SPACING;

        // Nombre y NIT debajo
        doc.setFont("courier", "normal");
        doc.setFontSize(9);
        y = addMultilineText(doc, `${raffle.nameResponsable}`, 40, y, 70, LINE_SPACING, "center", doc, PAGE_HEIGHT, BOTTOM_MARGIN);
        y = addMultilineText(doc, `NIT: ${raffle.nitResponsable}`, 40, y, 70, LINE_SPACING, "center", doc, PAGE_HEIGHT, BOTTOM_MARGIN);
        y += SECTION_SPACING;

        const cleanDescription = raffle.description.trim();
        // Descripción multilínea (centrada, salto de página si es necesario, nunca desbordada)
        doc.setFont("courier", "italic");
        doc.setFontSize(9);
        // Usar un ancho menor para evitar desborde visual (por ejemplo, 60mm en vez de 70mm)
        y = addMultilineText(doc, `"${cleanDescription}"`, 40, y, 60, LINE_SPACING, "center", doc, PAGE_HEIGHT, BOTTOM_MARGIN);
        y += SECTION_SPACING;

        doc.setDrawColor(0);
        doc.setLineWidth(0.2);
        doc.line(5, y, 75, y);
        y += LINE_SPACING;

        // 👤 Detalles del comprador
        doc.setFont("courier", "bold");
        y = addMultilineText(doc, "Detalles del Comprador", 40, y, 70, LINE_SPACING, "center", doc, PAGE_HEIGHT, BOTTOM_MARGIN);
        doc.line(5, y, 75, y);
        y += LINE_SPACING;

        doc.setFont("courier", "normal");
        y = addMultilineText(doc, "Boleto #: ", 5, y, 25, LINE_SPACING, undefined, doc, PAGE_HEIGHT, BOTTOM_MARGIN);
        doc.setFont("courier", "bold");
        y = addMultilineText(doc, `${formatWithLeadingZeros(entry.number, totalNumbers)}`, 30, y - LINE_SPACING, 45, LINE_SPACING, undefined, doc, PAGE_HEIGHT, BOTTOM_MARGIN);

        doc.setFont("courier", "normal");
        y = addMultilineText(doc, "Nombre:", 5, y, 25, LINE_SPACING, undefined, doc, PAGE_HEIGHT, BOTTOM_MARGIN);
        doc.setFont("courier", "bold");
        y = addMultilineText(doc, `${entry.firstName ?? ""} ${entry.lastName ?? ""}`, 30, y - LINE_SPACING, 45, LINE_SPACING, undefined, doc, PAGE_HEIGHT, BOTTOM_MARGIN);

        doc.setFont("courier", "normal");
        y = addMultilineText(doc, "Teléfono:", 5, y, 25, LINE_SPACING, undefined, doc, PAGE_HEIGHT, BOTTOM_MARGIN);
        doc.setFont("courier", "bold");
        y = addMultilineText(doc, `${entry.phone ?? ""}`, 30, y - LINE_SPACING, 45, LINE_SPACING, undefined, doc, PAGE_HEIGHT, BOTTOM_MARGIN);

        doc.setFont("courier", "normal");
        y = addMultilineText(doc, "Dirección:", 5, y, 25, LINE_SPACING, undefined, doc, PAGE_HEIGHT, BOTTOM_MARGIN);
        doc.setFont("courier", "bold");
        y = addMultilineText(doc, `${entry.address || "No registrada"}`, 30, y - LINE_SPACING, 45, LINE_SPACING, undefined, doc, PAGE_HEIGHT, BOTTOM_MARGIN);
        y += SECTION_SPACING;

        // 🎯 Detalles de la rifa
        doc.setFont("courier", "bold");
        y = addMultilineText(doc, "Detalles de la Rifa", 40, y, 70, LINE_SPACING, "center", doc, PAGE_HEIGHT, BOTTOM_MARGIN);
        doc.line(5, y, 75, y);
        y += LINE_SPACING;

        doc.setFont("courier", "normal");
        y = addMultilineText(doc, "Fecha Juego:", 5, y, 25, LINE_SPACING, undefined, doc, PAGE_HEIGHT, BOTTOM_MARGIN);
        doc.setFont("courier", "bold");
        y = addMultilineText(doc, `${formatDateTimeLarge(raffle.playDate)}`, 30, y - LINE_SPACING, 45, LINE_SPACING, undefined, doc, PAGE_HEIGHT, BOTTOM_MARGIN);

        doc.setFont("courier", "normal");
        y = addMultilineText(doc, "Valor Rifa:", 5, y, 25, LINE_SPACING, undefined, doc, PAGE_HEIGHT, BOTTOM_MARGIN);
        doc.setFont("courier", "bold");
        // Mostrar la suma de paymentAmount y paymentDue como el valor real de la rifa
        const valorRifa = +entry.paymentAmount + +entry.paymentDue;
        y = addMultilineText(doc, `${formatCurrencyCOP(valorRifa)}`, 30, y - LINE_SPACING, 45, LINE_SPACING, undefined, doc, PAGE_HEIGHT, BOTTOM_MARGIN);
        y += SECTION_SPACING;

        // 🏆 Premios
        if (awards.length > 0) {
            doc.setFont("courier", "bold");
            y = addMultilineText(doc, "Premios", 40, y, 70, LINE_SPACING, "center", doc, PAGE_HEIGHT, BOTTOM_MARGIN);
            doc.line(5, y, 75, y);
            y += LINE_SPACING;

            awards.forEach((award) => {
                doc.setFont("courier", "normal");
                y = addMultilineText(doc, `• ${award.name}`, 5, y, 70, LINE_SPACING, undefined, doc, PAGE_HEIGHT, BOTTOM_MARGIN);
                doc.setFont("courier", "italic");
                y = addMultilineText(doc, `${formatDateTimeLarge(award.playDate)}`, 10, y, 65, LINE_SPACING, undefined, doc, PAGE_HEIGHT, BOTTOM_MARGIN);
                y += LINE_SPACING;
            });
            y += SECTION_SPACING;
        } else {
            doc.setFont("courier", "italic");
            y = addMultilineText(doc, "Sin premios registrados", 40, y, 70, LINE_SPACING, "center", doc, PAGE_HEIGHT, BOTTOM_MARGIN);
            y += SECTION_SPACING;
        }

        // 💰 Resumen de pago
        doc.setFont("courier", "bold");
        y = addMultilineText(doc, "Resumen de Pago", 40, y, 70, LINE_SPACING, "center", doc, PAGE_HEIGHT, BOTTOM_MARGIN);
        doc.line(5, y, 75, y);
        y += LINE_SPACING;

        // Valor
        doc.setFont("courier", "bold");
        doc.setFontSize(11);
        y = addMultilineText(doc, "Valor:", 5, y, 25, LINE_SPACING, undefined, doc, PAGE_HEIGHT, BOTTOM_MARGIN);
        y = addMultilineText(doc, `${formatCurrencyCOP(+entry.paymentAmount)}`, 30, y - LINE_SPACING, 45, LINE_SPACING, undefined, doc, PAGE_HEIGHT, BOTTOM_MARGIN);
        doc.setFont("courier", "normal");
        doc.setFontSize(9);
        y += LINE_SPACING;

        // Abonado
        const abonado = entry.payments
            .filter((p) => p.isValid)
            .reduce((sum, p) => sum + parseFloat(p.amount), 0);
        y = addMultilineText(doc, "Abonado:", 5, y, 25, LINE_SPACING, undefined, doc, PAGE_HEIGHT, BOTTOM_MARGIN);
        y = addMultilineText(doc, `${formatCurrencyCOP(abonado)}`, 30, y - LINE_SPACING, 45, LINE_SPACING, undefined, doc, PAGE_HEIGHT, BOTTOM_MARGIN);

        // Deuda
        y = addMultilineText(doc, "Deuda:", 5, y, 25, LINE_SPACING, undefined, doc, PAGE_HEIGHT, BOTTOM_MARGIN);
        y = addMultilineText(doc, `${formatCurrencyCOP(+entry.paymentDue)}`, 30, y - LINE_SPACING, 45, LINE_SPACING, undefined, doc, PAGE_HEIGHT, BOTTOM_MARGIN);
        y += SECTION_SPACING;

        // 📄 Pagos realizados
        if (entry.payments.length > 0) {
            doc.setFont("courier", "bold");
            y = addMultilineText(doc, "Pagos", 40, y, 70, LINE_SPACING, "center", doc, PAGE_HEIGHT, BOTTOM_MARGIN);
            doc.line(5, y, 75, y);
            y += LINE_SPACING;

            doc.setFont("courier", "normal");
            // Mostrar solo los últimos 3 pagos válidos
            const pagosValidos = entry.payments.filter((p) => p.isValid);
            const ultimosPagos = pagosValidos.slice(-3); // últimos 3
            ultimosPagos.forEach((p) => {
                let pagoInfo = `${formatCurrencyCOP(+p.amount)} - ${p.user?.firstName ?? ''}`;
                if (p.reference) pagoInfo += ` | Ref: ${p.reference}`;
                if (p.rafflePayMethode && p.rafflePayMethode.payMethode?.name) {
                    pagoInfo += ` | ${capitalize(p.rafflePayMethode.payMethode.name)}`;
                }
                y = addMultilineText(doc, pagoInfo, 5, y, 70, LINE_SPACING, undefined, doc, PAGE_HEIGHT, BOTTOM_MARGIN);
            });
        } else {
            doc.setFont("courier", "italic");
            y = addMultilineText(doc, "Sin pagos registrados", 40, y, 70, LINE_SPACING, "center", doc, PAGE_HEIGHT, BOTTOM_MARGIN);
        }

        // 🙏 Pie de página
        y += SECTION_SPACING;
        doc.setFont("courier", "italic");
        y = addMultilineText(doc, `Reservado: ${formatDateTimeLarge(entry.reservedDate ?? "")}`, 5, y, 70, LINE_SPACING, undefined, doc, PAGE_HEIGHT, BOTTOM_MARGIN);
        doc.setFont("courier", "bold");
        y = addMultilineText(doc, "¡Gracias por su compra!", 40, y, 70, LINE_SPACING, "center", doc, PAGE_HEIGHT, BOTTOM_MARGIN);

        // 📄 Número de página
        doc.setFontSize(8);
        doc.text(`Página ${index + 1}`, 75, 145, { align: "right" });
    });

    // ✅ Retornar solo el blob, sin descargar
    return doc.output('blob');
};


/**
 * Genera una imagen PNG (preview) del ticket de la rifa usando HTML + html2canvas
 */

export const generateTicketPreviewImage = async ({
    raffle,
    pdfData,
    totalNumbers,
    imgIconURL
}: Pick<
    PaymentSellNumbersModalProps,
    "raffle" | "awards" | "pdfData" | "totalNumbers" | "imgIconURL"
>): Promise<HTMLImageElement> => {
    const DEFAULT_RAFFLE_ICON =
        "https://res.cloudinary.com/dfbwjrpdu/image/upload/v1765900779/receipt_657234_p517ss.png";
    const currentImgIconURL = imgIconURL || DEFAULT_RAFFLE_ICON;

    // Crear contenedor temporal
    const containerId = "ticket-preview-image-temp";
    let container = document.getElementById(containerId);
    if (!container) {
        container = document.createElement("div");
        container.id = containerId;
        container.style.width = "540px";
        container.style.minHeight = "1px";
        container.style.background = "#fff";
        container.style.borderRadius = "8px";
        container.style.boxShadow = "0 2px 8px rgba(0,0,0,0.10)";
        container.style.padding = "18px 12px 12px 12px";
        container.style.border = "1.5px dashed #222";
        container.style.position = "relative";
        container.style.fontFamily = "monospace, 'Courier New', Courier";
        document.body.appendChild(container);
    }

    // Lógica de datos
    const isMultiple = pdfData.length > 1;
    const abonado = pdfData.reduce(
        (sum, entry) =>
            sum +
            entry.payments
                .filter(p => p.isValid)
                .reduce((s, p) => s + parseFloat(p.amount), 0),
        0
    );
    const deuda = pdfData.reduce(
        (sum, entry) => sum + parseFloat(entry.paymentDue),
        0
    );

    const total = abonado + deuda;
    const allNumbers = pdfData.map(e =>
        formatWithLeadingZeros(e.number, totalNumbers)
    );
    const numerosPreview = allNumbers.join(", ");
    const entry = pdfData[0];

    // Buscar la fecha del último abono válido (payments[].createdAt más reciente)
    let lastPaymentDate = null;
    const allPayments = pdfData.flatMap(e => e.payments).filter(p => p.isValid);
    if (allPayments.length > 0) {
        lastPaymentDate = allPayments.reduce((latest, p) => {
            if (!latest) return p.createdAt;
            return new Date(p.createdAt) > new Date(latest) ? p.createdAt : latest;
        }, null as string | null);
    }

    // HTML del ticket estilo recibo/tiquete
    container.innerHTML = `
        <div style="display:flex;flex-direction:row;align-items:center;gap:18px;">
            <img
                src="${currentImgIconURL}"
                crossorigin="anonymous"
                style="width:70px;height:70px;object-fit:contain;margin-bottom:2px;filter: grayscale(100%);border-radius:8px;box-shadow:0 2px 8px rgba(0,0,0,0.10);border:1.5px dashed #222;"
            />
            <div style="display:flex;flex-direction:column;align-items:flex-start;gap:4px;">
                <div style="font-size:1.1rem;font-weight:900;color:#111;letter-spacing:1px;">${raffle.name}</div>
                <div style="font-size:0.95rem;font-weight:700;color:#222;">${raffle.nameResponsable}</div>
                <div style="font-size:0.85rem;font-weight:600;color:#222;">${formatDateTimeLarge(raffle.playDate)}</div>
            </div>
        </div>
        <div style="border-top:1.5px dashed #222;margin:10px 0 8px 0;width:100%;"></div>
        <div style="display:flex;flex-direction:column;gap:2px;">
            <div style="font-size:0.95rem;font-weight:700;color:#111;">${isMultiple ? "Números" : "Boleto"}: <span style='font-weight:900;'>${numerosPreview}</span></div>
            <div style="font-size:0.9rem;font-weight:700;color:#111;">Comprador: <span style='font-weight:900;'>${entry.firstName ?? ""} ${entry.lastName ?? ""}</span></div>
            <div style="font-size:0.9rem;font-weight:700;color:#111;">Teléfono: <span style='font-weight:900;'>${entry.phone ?? ""}</span></div>
            <div style="font-size:0.85rem;font-weight:700;color:#222;">Reservado: <span style='font-weight:900;'>${formatDateTimeLarge(entry.reservedDate ?? "")}</span></div>
        </div>
        <div style="border-top:1.5px dashed #222;margin:10px 0 8px 0;width:100%;"></div>
        <div style="display:flex;flex-direction:column;gap:1px;">
            <div style="font-size:0.9rem;font-weight:700;color:#111;">Valor total: <span style='font-weight:900;'>${formatCurrencyCOP(total)}</span></div>
            <div style="font-size:0.9rem;font-weight:700;color:#111;">Abonado: <span style='font-weight:900;'>${formatCurrencyCOP(abonado)}</span></div>
            <div style="font-size:0.9rem;font-weight:700;color:#111;">Deuda: <span style='font-weight:900;'>${formatCurrencyCOP(deuda)}</span></div>
            ${lastPaymentDate ? `<div style="font-size:0.9rem;font-weight:700;color:#111;">Fecha: <span style='font-weight:900;'>${formatDateTimeLarge(lastPaymentDate)}</span></div>` : ''}
        </div>
        <div style="border-top:1.5px dashed #222;margin:10px 0 8px 0;width:100%;"></div>
        <div style="font-size:0.85rem;color:#222;font-weight:700;text-align:center;">¡Gracias por su compra!</div>
    `;

    // Renderizar imagen
    const canvas = await html2canvas(container, {
        scale: 2,
        backgroundColor: "#fff",
        useCORS: true
    });
    const img = document.createElement("img");
    img.src = canvas.toDataURL("image/png");
    img.alt = "Preview Ticket";
    img.style.maxWidth = "100%";
    container.remove();
    return img;
};


const addMultilineText = (
    doc: jsPDF,
    text: string,
    x: number,
    y: number,
    maxWidth: number,
    lineHeight: number,
    alignCenter: 'center' | undefined,
    docInstance?: jsPDF,
    pageHeight?: number,
    bottomMargin?: number
) => {
    // Permitir textos muy largos, sin límite de líneas y saltar de página si es necesario
    const lines = doc.splitTextToSize(text, maxWidth);
    const effectivePageHeight = pageHeight || 150;
    const margin = bottomMargin || 10;
    lines.forEach((line: string) => {
        if (docInstance && y + lineHeight > effectivePageHeight - margin) {
            docInstance.addPage([docInstance.internal.pageSize.getWidth(), effectivePageHeight]);
            y = 10; // reiniciar y en nueva página
        }
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
    //Generar blob usando la función separada
    const pdfBlob = generatePDFBlob({
        raffle,
        awards,
        pdfData,
        totalNumbers
    });

    //Crear nombre del archivo y descargar
    const todayDate = dayjs().format('DDMMYYYY');
    const filename = `Resumen_Rifa_${userLastName || 'responsable'}_${userName || ''}_${todayDate}.pdf`;

    //Descargar PDF
    downloadPDF(pdfBlob, filename);
};

export const handleDownloadReservationPDF = async ({
    raffle,
    awards,
    totalNumbers,
    pdfData
}: Pick<PaymentSellNumbersModalProps, "raffle" | "awards" | "totalNumbers" | "pdfData"> ) => {
    
     //Generar blob usando la función separada
    const pdfBlob = generatePDFBlob({
        raffle,
        awards,
        pdfData,
        totalNumbers
    });

    // 📥 Descargar PDF
    const todayDate = dayjs().format("DDMMYYYY");
    let numbersText = '';
    if (pdfData.length > 1) {
        numbersText = `${pdfData.length}_Boletos`;
    } else if (pdfData.length === 1) {
        numbersText = `Boleto_${formatWithLeadingZeros(pdfData[0].number, totalNumbers)}`;
    } else {
        numbersText = 'SinBoletos';
    }
    const filename = `Apartado_${numbersText}_${todayDate}.pdf`;
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


    //Generar blob usando la función separada
    const pdfBlob = generatePDFBlob({
        raffle,
        awards,
        pdfData,
        totalNumbers
    });

    //Crear nombre del archivo y descargar
    // const todayDate = dayjs().format('DDMMYYYY');
    // const filename = `Resumen_Rifa_${userLastName || 'responsable'}_${userName || ''}_${todayDate}.pdf`;

    

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

// 📤 Función para subir PDF a tmpfiles.org (6 horas de disponibilidad)
const uploadPDFToTmpFiles = async (pdfBlob: Blob, filename: string): Promise<string> => {
    try {
        const formData = new FormData();
        formData.append('file', pdfBlob, filename);
        
        const response = await fetch('https://tmpfiles.org/api/v1/upload', {
            method: 'POST',
            body: formData
        });
        
        if (!response.ok) {
            throw new Error(`Error ${response.status}: ${response.statusText}`);
        }
        
        const result = await response.json();
        
        // tmpfiles.org devuelve { status: "success", data: { url: "https://tmpfiles.org/12345" } }
        if (result.status === 'success' && result.data?.url) {
            // Convertir URL de visualización a URL de descarga directa
            const downloadUrl = result.data.url.replace('tmpfiles.org/', 'tmpfiles.org/dl/');
            return downloadUrl;
        }
        
        throw new Error('Respuesta inválida del servidor');
    } catch (error) {
        console.error('❌ Error al subir PDF a tmpfiles.org:', error);
        throw error;
    }
};

// 💌 Función para enviar mensaje de WhatsApp con imagen generada desde PDF
export const handleSendMessageToWhatsApp = async ({
    raffle,
    awards,
    pdfData,
    totalNumbers,
    phoneNumber,
    customMessage,
    // uploadToCloudinary = true
}: Pick<PaymentSellNumbersModalProps, "raffle" | "awards" | "pdfData" | 'totalNumbers'> & {
    phoneNumber: string;
    customMessage?: string;
    uploadToCloudinary?: boolean;
}) => {

    // let pdfUrl: string | undefined;
    let imageUrl: string | undefined;
    let pdfError = false;
    let imageError = false;
    let pdfBlob: Blob | undefined;

    try {
        pdfBlob = generatePDFBlob({ 
            raffle, 
            awards, 
            pdfData, 
            totalNumbers 
        });

        // if (uploadToCloudinary) {
        //     try {
        //         const uploadResponse = await uploadToFileIo(pdfBlob);
        //         pdfUrl = uploadResponse;
        //     } catch (err) {
        //         pdfError = true;
        //         pdfUrl = undefined;
        //         console.warn("⚠️ Error subiendo PDF:", err);
        //     }
        // }

    } catch (err) {
        pdfError = true;
        // pdfUrl = undefined;
        pdfBlob = undefined;
        console.warn("⚠️ Error generando o subiendo PDF:", err);
    }

    

    try {
        const imgPrev = await generateTicketPreviewImage({ 
            raffle, 
            awards, 
            pdfData, 
            totalNumbers,
            imgIconURL: raffle.imgIconoUrl ?? undefined
        });

        imageUrl = await uploadImageToImgbb(imgPrev);
    } catch (err) {
        imageError = true;
        imageUrl = undefined;
        console.warn("⚠️ Error generando o subiendo imagen:", err);
    }

    // 📌 Mensaje general
    let defaultMessage = '';
    if (pdfData.length > 0) {
        const firstEntry = pdfData[0];
        const priceRaffleNumber = +firstEntry.paymentAmount + +firstEntry.paymentDue;
        const totalAmount = pdfData.reduce((sum, entry) => sum + Number(entry.paymentAmount), 0);
        const payments = pdfData.flatMap(entry => entry.payments);
        const allPaid = pdfData.every(entry => Number(entry.paymentDue) === 0);
        const statusRaffleNumber = allPaid ? 'sold' : 'pending';
        defaultMessage = generateRafflePurchaseMessage({
            totalNumbers,
            amount: totalAmount,
            paymentAmount: +firstEntry.paymentAmount,
            infoRaffle: {
                name: raffle.name,
                description: raffle.description,
                amountRaffle: raffle.price,
                playDate: raffle.playDate,
                responsable: raffle.nameResponsable,
            },
            name: `${firstEntry.firstName ?? ''} ${firstEntry.lastName ?? ''}`.trim() || 'Cliente',
            numbers: pdfData.map(entry => ({
                numberId: entry.number,
                number: entry.number
            })),
            payments,
            statusRaffleNumber,
            awards,
            reservedDate: firstEntry.reservedDate ?? null,
            priceRaffleNumber,
            resumen: true
        });
    }


    // Agregar primero la imagen (preview), ocultar el PDF
    if (imageUrl) {
        defaultMessage += `\n\n🖼️ Vista previa del recibo:\n${imageUrl}`;
    } else if (imageError) {
        defaultMessage += `\n\n🖼️ Vista previa del recibo no disponible.`;
    }
    // PDF oculto para el usuario:
    // if (pdfUrl) {
    //     defaultMessage += `\n📄 Recibo PDF para descargar:\n${pdfUrl}`;
    // } else if (pdfError) {
    //     defaultMessage += `\n📄 Recibo PDF no disponible.`;
    // }

    const message = customMessage || defaultMessage;
    const whatsappUrl = `https://wa.me/${phoneNumber.replace(/[^0-9+]/g, '')}?text=${encodeURIComponent(
        message.normalize('NFC')
    )}`;
    window.open(whatsappUrl, '_blank');
    return { success: true, pdfBlob, imageUrl, whatsappUrl, message, pdfError, imageError };
};



export const handleSendReservationToOwnerWhatsApp = async ({
    raffle,
    awards,
    pdfData,
    totalNumbers,
    buyerName,
}:  Pick<PaymentSellNumbersModalProps, "raffle" | "awards" | "pdfData" | 'totalNumbers'>  & {
    raffle: InfoRaffleType,
    buyerName: string,
}) => {
    try {
        // Generar PDF blob
        const pdfBlob = generatePDFBlob({
            raffle,
            awards,
            pdfData,
            totalNumbers
        });

        // Subir PDF a tmpfiles.org
        const timestamp = Date.now();
        const numbersText = pdfData.map(entry => formatWithLeadingZeros(entry.number, totalNumbers)).join('_');
        const filename = `apartado_${raffle.name.replace(/\s+/g, '_')}_${numbersText}_${timestamp}.pdf`;
        let pdfUrl = '';
        try {
            pdfUrl = await uploadPDFToTmpFiles(pdfBlob, filename);
        } catch (err) {
            console.warn('No se pudo subir el PDF:', err);
        }

        // Si no hay número de contacto, solo descargar el PDF
        if (!raffle.contactRifero) {
            downloadPDF(pdfBlob, filename);
            return {
                success: true,
                pdfBlob,
                pdfUrl,
                whatsappUrl: undefined,
                message: 'PDF descargado localmente (sin WhatsApp)',
            };
        }

        // Formatear números reservados
        const numbersList = pdfData.map(entry => formatWithLeadingZeros(entry.number, totalNumbers)).join(", ");
        // Valor por unidad
        const valorUnidad = formatCurrencyCOP(Number(raffle.amountRaffle));
        // Mensaje para el propietario
        let message = `
Hola,

He apartado los siguientes números en la rifa *${raffle.name}*:
🔢 Números: *${numbersList}*
💵 Valor por unidad: *${valorUnidad}*
👤 Mi nombre: *${buyerName}*

Por favor confirma la reservación y contáctame si es necesario.
`;
        if (pdfUrl) {
            message += `\n📄 Recibo PDF: ${pdfUrl}\n⏰ Disponible por 6 horas`;
        }
        message += `\nSaludos,\nSistema de Rifas`;

        const encodedMessage = encodeURIComponent(message.trim());
        const whatsappUrl = `https://wa.me/${raffle.contactRifero}?text=${encodedMessage}`;
        openWhatsAppUrl(whatsappUrl);

        return {
            success: true,
            pdfBlob,
            pdfUrl,
            whatsappUrl,
            message,
        };
    } catch (error) {
        console.error('Error al enviar aviso al propietario:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Error desconocido'
        };
    }
};

export const timeZonesList = [
    { show: "UTC-12", value: "International Date Line West" },
    { show: "UTC-11", value: "Coordinated Universal Time-11" },
    { show: "UTC-10", value: "Aleutian Islands" },
    { show: "UTC-10", value: "Hawaii" },
    { show: "UTC-09", value: "Alaska" },
    { show: "UTC-09", value: "Coordinated Universal Time-09" },
    { show: "UTC-08", value: "Baja California" },
    { show: "UTC-08", value: "Coordinated Universal Time-08" },
    { show: "UTC-08", value: "Pacific Time [US & Canada]" },
    { show: "UTC-07", value: "Arizona" },
    { show: "UTC-07", value: "Chihuahua, La Paz, Mazatlan" },
    { show: "UTC-07", value: "Mountain Time [US & Canada]" },
    { show: "UTC-07", value: "Yukon" },
    { show: "UTC-06", value: "Central America" },
    { show: "UTC-06", value: "Central Time [US & Canada]" },
    { show: "UTC-06", value: "Easter Island" },
    { show: "UTC-06", value: "Guadalajara, Mexico City, Monterrey" },
    { show: "UTC-06", value: "Saskatchewan" },
    { show: "UTC-05", value: "Bogota, Lima, Quito, Rio Branco" },
    { show: "UTC-05", value: "Chetumal" },
    { show: "UTC-05", value: "Eastern Time [US & Canada]" },
    { show: "UTC-05", value: "Haiti" },
    { show: "UTC-05", value: "Havana" },
    { show: "UTC-05", value: "Indiana [East]" },
    { show: "UTC-05", value: "Turks and Caicos" },
    { show: "UTC-04", value: "Asuncion" },
    { show: "UTC-04", value: "Atlantic Time [Canada]" },
    { show: "UTC-04", value: "Caracas" },
    { show: "UTC-04", value: "Cuiaba" },
    { show: "UTC-04", value: "Georgetown, La Paz, Manaus, San Juan" },
    { show: "UTC-04", value: "Santiago" },
    { show: "UTC-03", value: "Araguaina" },
    { show: "UTC-03", value: "Brasilia" },
    { show: "UTC-03", value: "Cayenne, Fortaleza" },
    { show: "UTC-03", value: "City of Buenos Aires" },
    { show: "UTC-03", value: "Greenland" },
    { show: "UTC-03", value: "Montevideo" },
    { show: "UTC-03", value: "Punta Arenas" },
    { show: "UTC-03", value: "Saint Pierre and Miquelon" },
    { show: "UTC-03", value: "Salvador" },
    { show: "UTC-02", value: "Coordinated Universal Time-02" },
    { show: "UTC-01", value: "Azores" },
    { show: "UTC-01", value: "Cabo Verde Is." },
    { show: "UTC+00", value: "Dublin, Edinburgh, Lisbon, London" },
    { show: "UTC+00", value: "Monrovia, Reykjavik" },
    { show: "UTC+00", value: "Sao Tome" },
    { show: "UTC+01", value: "Casablanca" },
    { show: "UTC+01", value: "Amsterdam, Berlin, Bern, Rome, Stockholm, Vienna" },
    { show: "UTC+01", value: "Belgrade, Bratislava, Budapest, Ljubljana, Prague" },
    { show: "UTC+01", value: "Brussels, Copenhagen, Madrid, Paris" },
    { show: "UTC+01", value: "Sarajevo, Skopje, Warsaw, Zagreb" },
    { show: "UTC+01", value: "Western Central Africa" },
    { show: "UTC+02", value: "Amman" },
    { show: "UTC+02", value: "Athens, Bucharest" },
    { show: "UTC+02", value: "Beirut" },
    { show: "UTC+02", value: "Cairo" },
    { show: "UTC+02", value: "Chisinau" },
    { show: "UTC+02", value: "Damascus" },
    { show: "UTC+02", value: "Gaza, Hebron" },
    { show: "UTC+02", value: "Harare, Pretoria" },
    { show: "UTC+02", value: "Helsinki, Kyiv, Riga, Sofia, Tallinn, Vilnius" },
    { show: "UTC+02", value: "Jerusalem" },
    { show: "UTC+02", value: "Kaliningrad" },
    { show: "UTC+02", value: "Khartoum" },
    { show: "UTC+02", value: "Tripoli" },
    { show: "UTC+02", value: "Windhoek" },
    { show: "UTC+03", value: "Baghdad" },
    { show: "UTC+03", value: "Istanbul" },
    { show: "UTC+03", value: "Kuwait, Riyadh" },
    { show: "UTC+03", value: "Minsk" },
    { show: "UTC+03", value: "Moscow, St. Petersburg" },
    { show: "UTC+03", value: "Nairobi" },
    { show: "UTC+04", value: "Abu Dhabi, Muscat" },
    { show: "UTC+04", value: "Astrakhan, Ulyanovsk" },
    { show: "UTC+04", value: "Baku" },
    { show: "UTC+04", value: "Izhevsk, Samara" },
    { show: "UTC+04", value: "Port Louis" },
    { show: "UTC+04", value: "Saratov" },
    { show: "UTC+04", value: "Tbilisi" },
    { show: "UTC+04", value: "Volgograd" },
    { show: "UTC+04", value: "Yerevan" },
    { show: "UTC+05", value: "Ashgabat, Tashkent" },
    { show: "UTC+05", value: "Ekaterinburg" },
    { show: "UTC+05", value: "Islamabad, Karachi" },
    { show: "UTC+05", value: "Qyzylorda" },
    { show: "UTC+06", value: "Astana" },
    { show: "UTC+06", value: "Dhaka" },
    { show: "UTC+06", value: "Omsk" },
    { show: "UTC+07", value: "Bangkok, Hanoi, Jakarta" },
    { show: "UTC+07", value: "Barnaul, Gorno-Altaysk" },
    { show: "UTC+07", value: "Hovd" },
    { show: "UTC+07", value: "Krasnoyarsk" },
    { show: "UTC+07", value: "Novosibirsk" },
    { show: "UTC+07", value: "Tomsk" },
    { show: "UTC+08", value: "Beijing, Chongqing, Hong Kong, Urumqi" },
    { show: "UTC+08", value: "Irkutsk" },
    { show: "UTC+08", value: "Kuala Lumpur, Singapore" },
    { show: "UTC+08", value: "Perth" },
    { show: "UTC+08", value: "Taipei" },
    { show: "UTC+08", value: "Ulaanbaatar" },
    { show: "UTC+09", value: "Chita" },
    { show: "UTC+09", value: "Osaka, Sapporo, Tokyo" },
    { show: "UTC+09", value: "Pyongyang" },
    { show: "UTC+09", value: "Seoul" },
    { show: "UTC+09", value: "Yakutsk" },
    { show: "UTC+10", value: "Brisbane" },
    { show: "UTC+10", value: "Canberra, Melbourne, Sydney" },
    { show: "UTC+10", value: "Guam, Port Moresby" },
    { show: "UTC+10", value: "Hobart" },
    { show: "UTC+10", value: "Vladivostok" },
    { show: "UTC+11", value: "Bougainville Island" },
    { show: "UTC+11", value: "Chokurdakh" },
    { show: "UTC+11", value: "Magadan" },
    { show: "UTC+11", value: "Norfolk Island" },
    { show: "UTC+11", value: "Sakhalin" },
    { show: "UTC+11", value: "Solomon Is., New Caledonia" },
    { show: "UTC+12", value: "Anadyr, Petropavlovsk-Kamchatsky" },
    { show: "UTC+12", value: "Auckland, Wellington" },
    { show: "UTC+12", value: "Coordinated Universal Time+12" },
    { show: "UTC+12", value: "Fiji" },
];