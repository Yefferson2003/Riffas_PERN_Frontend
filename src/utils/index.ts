
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
    
    window.open(whatsappUrl, '_blank');
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
        // Mostrar la suma de paymentAmount y paymentDue como el valor real de la rifa
        const valorRifa = +entry.paymentAmount + +entry.paymentDue;
        doc.text(`${formatCurrencyCOP(valorRifa)}`, 30, y);
        y += SECTION_SPACING;

        // 🏆 Premios
        if (awards.length > 0) {
            doc.setFont("courier", "bold");
            doc.text("Premio", 40, y, { align: "center" });
            y += LINE_SPACING - 1;
            doc.line(5, y, 75, y);
            y += LINE_SPACING;

            // Solo mostrar el primer premio
            const award = awards[0];
            doc.setFont("courier", "normal");
            y = addMultilineText(doc, `• ${award.name}`, 5, y, 70, LINE_SPACING, undefined);

            doc.setFont("courier", "italic");
            y = addMultilineText(doc, `${formatDateTimeLarge(award.playDate)}`, 10, y, 65, LINE_SPACING, undefined);
            y += SECTION_SPACING;
        } else {
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

        // Valor
        doc.setFont("courier", "bold");
        doc.setFontSize(11);
        doc.text("Valor:", 5, y);
        doc.text(`${formatCurrencyCOP(+entry.paymentAmount)}`, 30, y);
        doc.setFont("courier", "normal");
        doc.setFontSize(9);
        y += LINE_SPACING;

        // Abonado
        const abonado = entry.payments
            .filter((p) => p.isValid)
            .reduce((sum, p) => sum + parseFloat(p.amount), 0);
        doc.text("Abonado:", 5, y);
        doc.text(`${formatCurrencyCOP(abonado)}`, 30, y);
        y += LINE_SPACING;

        // Deuda
        doc.text("Deuda:", 5, y);
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
                // Mostrar solo los últimos 3 pagos válidos
                const pagosValidos = entry.payments.filter((p) => p.isValid);
                const ultimosPagos = pagosValidos.slice(-3); // últimos 3
                ultimosPagos.forEach((p) => {
                    let pagoInfo = `${formatCurrencyCOP(+p.amount)} - ${p.user?.firstName ?? ''}`;
                    if (p.reference) pagoInfo += ` | Ref: ${p.reference}`;
                    if (p.rafflePayMethode && p.rafflePayMethode.payMethode?.name) {
                        pagoInfo += ` | ${capitalize(p.rafflePayMethode.payMethode.name)}`;
                    }
                    doc.text(pagoInfo, 5, y);
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

    // ✅ Retornar solo el blob, sin descargar
    return doc.output('blob');
};


/**
 * Genera una imagen JPG (preview) del ticket de la rifa usando solo la primera página del PDF.
 *
 * @returns Promise<Blob> — imagen lista para subir a imgbb o Supabase
 */
export const generateTicketPreviewImage = async ({
    raffle,
    pdfData,
    totalNumbers
}: Pick<PaymentSellNumbersModalProps, "raffle" | "awards" | "pdfData" | 'totalNumbers'>): Promise<HTMLImageElement> => {

    // Crear un contenedor temporal para el preview
    const containerId = "ticket-preview-image-temp";
    let container = document.getElementById(containerId);
    if (!container) {
        container = document.createElement("div");
        container.id = containerId;
        container.style.width = "560px";
        container.style.height = "300px";
        container.style.display = "flex";
        container.style.flexDirection = "column";
        container.style.justifyContent = "flex-start";
        container.style.background = "#ffffff";
        container.style.borderRadius = "18px";
        container.style.boxShadow = "0 4px 24px rgba(0,0,0,0.15)";
        container.style.padding = "22px 28px";
        container.style.border = "1.5px solid #e2e8f0";
        document.body.appendChild(container);
    }


    // Adaptar para varios números
    const isMultiple = pdfData.length > 1;
    // Sumar abonados y deudas
    const abonado = pdfData.reduce((sum, entry) => sum + entry.payments.filter(p => p.isValid).reduce((s, p) => s + parseFloat(p.amount), 0), 0);
    const deuda = pdfData.reduce((sum, entry) => sum + parseFloat(entry.paymentDue), 0);
    const total = abonado + deuda;

    // Obtener los números del pdfData
    const allNumbers = pdfData.map(e => formatWithLeadingZeros(e.number, totalNumbers));
    let numerosPreview = "";
    if (allNumbers.length > 3) {
        numerosPreview = `${allNumbers.slice(0, 3).join(", ")} ...`;
    } else {
        numerosPreview = allNumbers.join(", ");
    }

    // Mostrar nombre y teléfono del primer comprador (asumimos mismo comprador para todos)
    const entry = pdfData[0];

    container.innerHTML = `
        <div style="display:flex;flex-direction:column;gap:6px;">

            <div style="
                display:flex;
                justify-content:space-between;
                align-items:center;
                margin-bottom:10px;
            ">
                <div style="
                    font-size:22px;
                    font-weight:800;
                    color:#1446A0;
                    letter-spacing:1px;
                    text-transform:uppercase;
                ">
                    RIFFAS
                </div>

                <h2 style="
                    margin:0;
                    font-size:24px;
                    font-weight:800;
                    color:#1446A0;
                ">
                    ${isMultiple ? 'Números' : 'Boleto'}: ${numerosPreview}
                </h2>
            </div>

            <!-- Datos del comprador -->
            <div style="font-size:15px;color:#334155;">
                <div><span style="font-weight:700;">Comprador:</span> ${entry.firstName ?? ""} ${entry.lastName ?? ""}</div>
                <div><span style="font-weight:700;">Teléfono:</span> ${entry.phone ?? ""}</div>
            </div>

            <hr style="border-top:1px solid #e2e8f0;margin:6px 0 4px 0;" />

            <!-- Nombre de la rifa y fecha -->
            <div style="display:flex;justify-content:space-between;align-items:center;">
                <div style="font-size:16px;font-weight:700;color:#1446A0;">
                    ${raffle.name}
                </div>

                <div style="text-align:right;">
                    <div style="font-size:14px;font-weight:600;color:#475569;">
                        ${formatDateTimeLarge(raffle.playDate)}
                    </div>
                </div>
            </div>

            <!-- Valores económicos -->
            <div style="margin-top:6px;font-size:15px;color:#334155;display:flex;flex-direction:column;gap:3px;">
                <div>
                    <span style="font-weight:700;">Valor total${isMultiple ? ' de los boletos' : ''}:</span>
                    <span style="font-weight:800;color:#0a7a25;">${formatCurrencyCOP(total)}</span>
                </div>
                <div>
                    <span style="font-weight:700;">Abonad${isMultiple ? 'os' : 'o'}:</span>
                    <span style="font-weight:700;color:#2563eb;">${formatCurrencyCOP(abonado)}</span>
                </div>
                <div>
                    <span style="font-weight:700;">Deud${isMultiple ? 'as' : 'a'}:</span>
                    <span style="font-weight:700;color:#b91c1c;">${formatCurrencyCOP(deuda)}</span>
                </div>
            </div>

            <hr style="border-top:1px solid #e2e8f0;margin:6px 0 0 0;" />

        </div>
        `;

    // Generar PNG con html2canvas
    const canvas = await html2canvas(container, {
        scale: 2,
        backgroundColor: "#ffffff"
    });
    // Convertir canvas a imagen
    const img = document.createElement('img');
    img.src = canvas.toDataURL('image/png');
    img.alt = 'Preview Ticket';
    img.style.maxWidth = '100%';
    // Limpiar el contenedor temporal
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
            doc.text("Pagos (Ultimos 3)", 40, y, { align: "center" });
            y += LINE_SPACING - 1;
            doc.line(5, y, 75, y);
            y += LINE_SPACING;

            doc.setFont("courier", "normal");
            entry.payments
                .filter((p) => p.isValid)
                .forEach((p) => {
                    doc.text(`${formatCurrencyCOP(+p.amount)} - ${p.user?.firstName ?? ''}`, 5, y);
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
            totalNumbers 
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
        window.open(whatsappUrl, '_blank');

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