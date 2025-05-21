import { InfoRaffleType } from "../components/indexView/ViewRaffleNumberData";

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

export const formatDateTimeLarge = (dateString: string): string => {
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

export function formatWithLeadingZeros(num: number): string {
    return num.toString().padStart(3, '0');
}

type redirectToWhatsAppType = {
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

export const redirectToWhatsApp = ({ amount, infoRaffle, name, phone, numbers, payments, statusRaffleNumber}: redirectToWhatsAppType) : string => {
    if (!phone) return '';
    let whatsappUrl =  ''

    let paymentTypeMessage = '';
    const rafflePrice = +infoRaffle.amountRaffle;

    // Calcular deuda SIEMPRE
    let deudaMessage = '';
    let deuda = 0;
    if (statusRaffleNumber && statusRaffleNumber === 'pending' && payments) {
        const abonosValidos = payments
            .filter(p => p.isValid)
            .reduce((acc, p) => acc + Number(p.amount), 0);
        deuda = Math.max((rafflePrice * numbers.length) - abonosValidos, 0);
    } else if (payments && payments.length > 0) {
        // Sumar los abonos válidos
        const abonosValidos = payments
            .filter(p => p.isValid)
            .reduce((acc, p) => acc + Number(p.amount), 0);
        // Sumar el abono actual
        const totalAbonado = abonosValidos + amount;
        deuda = Math.max((rafflePrice * numbers.length) - totalAbonado, 0);
    } else {
        deuda = Math.max((rafflePrice * numbers.length) - amount, 0);
    }
    deudaMessage = `\n- Deuda actual: ${formatCurrencyCOP(deuda)}`;
    
    if (statusRaffleNumber === 'pending' && payments && payments.length > 0) {
        // Sumar los abonos válidos
        const abonosValidos = payments
            .filter(p => p.isValid)
            .reduce((acc, p) => acc + Number(p.amount), 0);
        paymentTypeMessage = `Has realizado abonos por un total de ${formatCurrencyCOP(abonosValidos)} para la rifa "${infoRaffle.name}".`;
    } else if (amount === 0) {
        paymentTypeMessage = `Has realizado un apartado de número(s) en la rifa "${infoRaffle.name}".`;
    } else if (amount < rafflePrice) {
        paymentTypeMessage = `Has realizado un abono de ${formatCurrencyCOP(amount)} para la rifa "${infoRaffle.name}".`;
    } else if (amount === rafflePrice) {
        paymentTypeMessage = `Has realizado el pago completo de ${formatCurrencyCOP(amount)} para la rifa "${infoRaffle.name}".`;
    } else {
        paymentTypeMessage = `Has realizado un pago de ${formatCurrencyCOP(amount)} para la rifa "${infoRaffle.name}".`;
    }

    const numbersList = numbers
        .map(n => formatWithLeadingZeros(n.number))
        .join(', ');

    const message = `
    Hola ${name},

    ${paymentTypeMessage}

    Detalles de la rifa:
    - Números: ${numbersList}
    - Descripción: ${infoRaffle.description}
    - Valor: ${formatCurrencyCOP(rafflePrice)}${deudaMessage}
    - Fecha del sorteo: ${formatDateTimeLarge(infoRaffle.playDate)}

    Por favor, contáctanos si tienes alguna pregunta. ¡Buena suerte!

    Saludos,
    El equipo de Rifas
    `.trim();

    const encodedMessage = encodeURIComponent(message);
    whatsappUrl = `https://wa.me/${phone}?text=${encodedMessage}`;
    return(whatsappUrl)
};