import { PaymentSellNumbersModalProps } from "../components/indexView/PaymentSellNumbersModal";
import { InfoRaffleType } from "../components/indexView/ViewRaffleNumberData";
import jsPDF from 'jspdf';
export const azul = '#1446A0'

export function translateRaffleStatus(status: "available" | "sold" | "pending"): string {
    const translations: Record<typeof status, string> = {
        available: "Disponible",
        sold: "Vendido",
        pending: "Pendiente"
    };
    return translations[status] || status;
}

export const rifflesNumbersStatusEnum = ['available', 'sold', 'pending'] as const;

export const colorStatusRaffleNumber : {[key: string] : "warning" | "default" | "success"  } = {
    available: 'default',
    sold: 'success',
    pending: 'warning',
}

export function formatCurrencyCOP(amount: number) {
    return new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        minimumFractionDigits: 0, // No decimales
        maximumFractionDigits: 0  // No decimales
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
    statusRaffleNumber?: "sold" | "pending"
}

export const redirectToWhatsApp = ({
    totalNumbers,
    amount,
    infoRaffle,
    name,
    phone,
    numbers,
    payments,
    statusRaffleNumber,
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

    let paymentTypeMessage = "";
    if (payments && statusRaffleNumber === "pending" && payments?.length > 0) {
        const abonosValidos = payments
        .filter(p => p.isValid)
        .reduce((acc, p) => acc + Number(p.amount), 0);
        paymentTypeMessage = `Has realizado abonos por un total de ${formatCurrencyCOP(abonosValidos)} “${infoRaffle.name}” 💸`;
    } else if (amount === 0) {
        paymentTypeMessage = `Has apartado el/los número(s) en la rifa “${infoRaffle.name}” 🎟`;
    } else if (amount < rafflePrice) {
        paymentTypeMessage = `Has realizado un abono de ${formatCurrencyCOP(amount)} para la rifa “${infoRaffle.name}” 💵`;
    } else if (amount === rafflePrice) {
        paymentTypeMessage = `Has realizado el pago completo de ${formatCurrencyCOP(amount)} para la rifa “${infoRaffle.name}” ✅`;
    } else {
        paymentTypeMessage = `Has realizado un pago de ${formatCurrencyCOP(amount)} para la rifa “${infoRaffle.name}” 💰`;
    }

    const numbersList = numbers
        .map(n => formatWithLeadingZeros(n.number, totalNumbers))
        .join(", ");

    const message = `
    ✨ Hola ${name},

    ${paymentTypeMessage}

    📌 Detalles:
    🔢 Números: ${numbersList}
    💬 Descripción: ${infoRaffle.description}
    💵 Valor por número: ${formatCurrencyCOP(rafflePrice)}
    📉 Deuda actual: ${formatCurrencyCOP(deuda)}
    🗓 Sorteo: ${formatDateTimeLarge(infoRaffle.playDate)}

    Si tienes alguna pregunta, estamos aquí para ayudarte 🤝

    Saludos,  
    ${infoRaffle.responsable}
    `.trim();

    const encodedMessage = encodeURIComponent(message);
    return `https://wa.me/${phone}?text=${encodedMessage}`;
};

export const handleDownloadPDF = ({
    raffle,
    awards,
    pdfData,
    }: Pick<PaymentSellNumbersModalProps, "raffle" | "awards" | "pdfData">) => {
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

        doc.setFontSize(9);
        doc.text(`Responsable: ${raffle.nameResponsable}`, 40, y, { align: "center" });
        y += LINE_SPACING;
        doc.text(`NIT: ${raffle.nitResponsable}`, 40, y, { align: "center" });
        y += LINE_SPACING;
        doc.setFont("courier", "normal");
        doc.text(`"${raffle.description}"`, 40, y, { align: "center" });
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
        doc.text(`${entry.number}`, 30, y);
        y += LINE_SPACING;

        doc.setFont("courier", "normal");
        doc.text("Nombre:", 5, y);
        doc.setFont("courier", "bold");
        doc.text(`${entry.firstName ?? ""} ${entry.lastName ?? ""}`, 30, y);
        y += LINE_SPACING;

        doc.setFont("courier", "normal");
        doc.text("ID:", 5, y);
        doc.setFont("courier", "bold");
        doc.text(`${entry.identificationType ?? ""} ${entry.identificationNumber ?? ""}`, 30, y);
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
            doc.text(`• ${award.name}`, 5, y);
            doc.setFont("courier", "italic");
            doc.text(`${formatDateTimeLarge(award.playDate)}`, 10, y + 3);
            y += SECTION_SPACING;
        });
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

        // 📄 Número de página (opcional)
        doc.setFontSize(8);
        doc.text(`Página ${index + 1}`, 75, 145, { align: "right" });
    });

    doc.save(`tickets_rifa_${raffle.id}.pdf`);
    };