import dayjs from 'dayjs';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { formatCurrencyCOP, formatDateTimeLargeIsNull, formatWithLeadingZeros, translateRaffleStatus } from '.';
import { getRaffleNumersExel, getRaffleNumersExelFilter } from '../api/raffleNumbersApi';


export const fetchRaffleNumbers = async (raffleId: number) => {
    const params = { limit: 1000 };
    try {
        const data = await getRaffleNumersExel({ params, raffleId });
        if (data) {
            return data.raffleNumbers
        }

    } catch (error) {
        console.log(error);
        throw new Error("Error al obtener los números de la rifa");
    }
};


export const exelRaffleNumbersFilter = async (raffleId: string, params: object) => {

    try {
        const data = await getRaffleNumersExelFilter({ params, raffleId });
        if (!data) {
            console.error("No se obtuvieron datos de la rifa");
            return;
        }

        const { raffleNumbers, rafflePrice, userLastName, userName } = data;

        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet("Resumen Rifa");

        // Cabecera personalizada
        worksheet.mergeCells('A1:C1');
        worksheet.getCell('A1').value = `Responsable: ${userLastName || '---'}, ${userName || '---'}`;
        worksheet.getCell('A1').font = { bold: true, size: 14 };

        worksheet.mergeCells('A2:C2');
        worksheet.getCell('A2').value = `Precio de la Boleta: ${formatCurrencyCOP(+rafflePrice) || '---'}`;
        worksheet.getCell('A2').font = { bold: true, size: 12 };

        // Encabezados de columnas
        worksheet.addRow([]);
        worksheet.addRow(['Número', 'Abonado', 'Deuda', ' Nombre',  'Apellido','Teléfono', 'Estado']);
        worksheet.getRow(6).font = { bold: true, size: 14 };


        // Agregar los números de la rifa y su estado con color de fondo según el estado
        raffleNumbers.forEach((raffle) => {
            const row = worksheet.addRow([
                formatWithLeadingZeros(raffle.number),
                formatCurrencyCOP(+raffle.paymentAmount) || 0,
                formatCurrencyCOP(+raffle.paymentDue) || 0,
                raffle.firstName || '---',
                raffle.lastName || '---',
                raffle.phone || '---',
                translateRaffleStatus(raffle.status),
            ]);

            let fillColor;
            switch (raffle.status) {
            case "sold":
                fillColor = "FF00FF00"; // Verde
                break;
            case "pending":
                fillColor = "FFFFFF00"; // Amarillo
                break;
            case "available":
                fillColor = "FFFFFFFF"; // Blanco
                break;
            default:
                fillColor = "FFFFFFFF"; // Por defecto Blanco
            }

            row.eachCell((cell) => {
            cell.fill = {
                type: "pattern",
                pattern: "solid",
                fgColor: { argb: fillColor },
            };
            });
        });

        // Ajustar ancho de columnas
        worksheet.columns = [
            { width: 15 },
            { width: 20 },
        ];

        // Guardar el archivo
        const todayDate = dayjs().format('DDMMYYYY');
        const filename = `Resumen_Rifa_${userLastName || 'responsable'}_${userName || ''}_${todayDate}.xlsx`;
        const buffer = await workbook.xlsx.writeBuffer();
        saveAs(new Blob([buffer]), filename);

    } catch (error) {
        console.error("Error al exportar los números de la rifa:", error);
    }
}

export const exportRaffleNumbers = async (raffleId: string | undefined, nitResponsable: string | undefined) => {
    if (!raffleId) {
        console.error(" error de datos");
        return;
    }
    if (!nitResponsable) {
        console.error(" error de datos");
        return;
    }

    try {
        const raffleNumbers = await fetchRaffleNumbers(+raffleId);

        if (!raffleNumbers) {
            console.error("Error en los numeros obtenidos");
            return;
        }

        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet("Numeros de Rifa");

        worksheet.columns = [
            { header: "Número", key: "number", width: 10 },
            // { header: "Estado", key: "status", width: 15 },
            { header: "Fecha Reservado", key: "reservedDate", width: 20 },
            { header: "Tipo de Identificación", key: "identificationType", width: 20 },
            { header: "Número de Identificación", key: "identificationNumber", width: 25 },
            { header: "Nombre", key: "firstName", width: 15 },
            { header: "Apellido", key: "lastName", width: 15 },
            { header: "Teléfono", key: "phone", width: 15 },
            { header: "Dirección", key: "address", width: 25 },
            { header: "Vendedor", key: "vendedor", width: 30},
            { 
                header: "Valor abonado", 
                key: "paymentAmount", 
                width: 20, 
                style: { numFmt: '#,##0.00' } // Formato numérico para moneda o números con decimales
            },
            { 
                header: "Valor a deber", 
                key: "paymentDue", 
                width: 20, 
                style: { numFmt: '#,##0.00' } // Formato numérico para moneda o números con decimales
            },
            { 
                header: "Abonos Cancelados", 
                key: "payments", 
                width: 20, 
                style: { numFmt: '#,##0.00' } // Formato numérico para moneda o números con decimales
            },
        ];

        // Agregar filas y estilos
        raffleNumbers.forEach((raffle) => {
            const row = worksheet.addRow({
                number: formatWithLeadingZeros(raffle.number),
                // status: statusRaffleTraslations[raffle.status],
                reservedDate: formatDateTimeLargeIsNull(raffle.reservedDate),
                identificationType: raffle.identificationType || '---',
                identificationNumber: raffle.identificationNumber || '---',
                firstName: raffle.firstName || '---',
                lastName: raffle.lastName || '---',
                phone: raffle.phone || '---',
                address: raffle.address || '---',
                vendedor: `${raffle.payments.find(payment => payment.user && payment.isValid === true)?.user.firstName || '---'} ${raffle.payments.find(payment => payment.user && payment.isValid === true)?.user.lastName || '---'}`,
                paymentAmount: +raffle.paymentAmount || 0,
                paymentDue: +raffle.paymentDue || 0,
                payments: raffle.payments.reduce((sum, payment) => sum + +payment.amount, 0) - +raffle.paymentAmount
            });

            let fillColor;
            switch (raffle.status) {
                case "sold":
                    fillColor = "FF00FF00"; // Verde
                    break;
                case "pending":
                    fillColor = "FFFFFF00"; // Amarillo
                    break;
                case "available":
                    fillColor = "FFFFFFFF"; // Blanco
                    break;
                default:
                    fillColor = "FFFFFFFF"; // Por defecto Blanco
            }

            row.eachCell((cell) => {
                cell.fill = {
                    type: "pattern",
                    pattern: "solid",
                    fgColor: { argb: fillColor },
                };
            });
        });
        // Agregar una fila para la suma al final
        const lastRowNumber = worksheet.lastRow?.number || 0; // Obtiene el índice de la última fila
        const totalRow = worksheet.addRow({
            number: "TOTAL", // Indica que es la fila de total
            paymentAmount: "", // Esto se llenará con la fórmula
            paymentDue: "", // Esto se llenará con la fórmula
            payments: ""
        });

        // Asignar la fórmula para la columna de "Valor abonado" y "Valor a deber"
        totalRow.getCell("paymentAmount").value = {
            formula: `SUM(I2:I${lastRowNumber})`, // Asumiendo que la columna E tiene los valores
        };
        totalRow.getCell("paymentDue").value = {
            formula: `SUM(J2:J${lastRowNumber})`, // Asumiendo que la columna F tiene los valores
        };
        totalRow.getCell("payments").value = {
            formula: `SUM(K2:K${lastRowNumber})`, // Asumiendo que la columna F tiene los valores
        };

        // Aplicar estilos a la fila de total
        totalRow.eachCell((cell) => {
            cell.font = { bold: true }; // Poner en negrita
            cell.fill = {
                type: "pattern",
                pattern: "solid",
                fgColor: { argb: "FFD9D9D9" }, // Color de fondo gris claro
            };
        });


        const todayDate = dayjs().format('DDMMYYYY');


        const filename = `Números_Rifa_${nitResponsable}_${todayDate}.xlsx`;

        // Escribir y guardar el archivo
        const buffer = await workbook.xlsx.writeBuffer();
        saveAs(new Blob([buffer]), filename);
    } catch (error) {
        console.error("Error al exportar los números de la rifa:", error);
    }
};

