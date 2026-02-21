import dayjs from 'dayjs';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { capitalize, formatCurrencyCOP, formatDateTimeLargeIsNull, formatWithLeadingZeros, translateRaffleStatus } from '.';
import { getRafflesDetailsNumbers } from '../api/raffleApi';
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

// type paymentMethodFilterType = PaymentMethodType | '' 


export const exelRaffleNumbersFilterDetails = async (
    raffleId: string, 
    params: object, 
    totalNumbers: number,
    // paymentMethodFilter: string
) => {

    try {
        const data = await getRaffleNumersExelFilter({ params, raffleId });
        if (!data) {
            console.error("No se obtuvieron datos de la rifa");
            return;
        }

        const { raffleNumbers, rafflePrice, userLastName, userName, count } = data;

        console.log('exelRaffleNumbersFilterDetails', data);
        
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet("Resumen Rifa");
        
        worksheet.mergeCells('A3:C3');
        worksheet.getCell('A3').value = `Números: ${count ?? raffleNumbers.length}`;
        worksheet.getCell('A3').font = { bold: true, size: 12 };
        // Cabecera personalizada
        worksheet.mergeCells('A1:C1');
        worksheet.getCell('A1').value = `Responsable: ${userLastName || '---'}, ${userName || '---'}`;
        worksheet.getCell('A1').font = { bold: true, size: 14 };

        worksheet.mergeCells('A2:C2');
        worksheet.getCell('A2').value = `Precio de la Boleta: ${formatCurrencyCOP(+rafflePrice) || '---'}`;
        worksheet.getCell('A2').font = { bold: true, size: 12 };



        // Encabezados de columnas (orden profesional)
        worksheet.addRow([]);
        const headers = ['Número', 'Nombre Completo', 'Teléfono', 'Valor Abonado', 'Saldo Pendiente', 'Métodos de Pago', 'Referencias', 'Estado' ];
        worksheet.addRow(headers);
        const headerRowNumber = 6;
        const headerRow = worksheet.getRow(headerRowNumber);
        headerRow.font = { bold: true, size: 12, color: { argb: 'FFFFFFFF' } };
        
        // Aplicar color de fondo a los headers
        headerRow.eachCell((cell) => {
            cell.fill = {
                type: "pattern",
                pattern: "solid",
                fgColor: { argb: 'FF4472C4' }, // Azul profesional
            };
            cell.alignment = { horizontal: 'center', vertical: 'middle' };
            cell.border = {
                top: { style: 'thin' },
                left: { style: 'thin' },
                bottom: { style: 'thin' },
                right: { style: 'thin' }
            };
        });


        // Agregar los números de la rifa divididos por método de pago
        raffleNumbers.forEach((raffle) => {
            const raffleData = raffle;
            
            // Nombre completo formateado
            const nombreCompleto = [raffleData.firstName, raffleData.lastName]
                .filter(name => name && name !== '---')
                .map(name => capitalize(name || ''))
                .join(' ') || '---';

            // Agrupar pagos por método
            const pagosPorMetodo = new Map<string, { pagos: typeof raffleData.payments, totalMonto: number, referencias: string[] }>();

            if (raffleData.payments && raffleData.payments.length > 0) {
                raffleData.payments.forEach(payment => {
                    const metodeName = payment.rafflePayMethode?.payMethode?.name || 'No especificado';
                    const paymentWithRef = payment as typeof payment & { reference?: string };
                    
                    if (!pagosPorMetodo.has(metodeName)) {
                        pagosPorMetodo.set(metodeName, { pagos: [], totalMonto: 0, referencias: [] });
                    }
                    
                    const metodo = pagosPorMetodo.get(metodeName)!;
                    metodo.pagos.push(payment);
                    metodo.totalMonto += (+payment.amount || 0);
                    
                    if (paymentWithRef.reference) {
                        metodo.referencias.push(paymentWithRef.reference);
                    }
                });
            } else {
                // Si no hay pagos específicos, mostrar como método no especificado
                pagosPorMetodo.set('No especificado', {
                    pagos: [],
                    totalMonto: +raffleData.paymentAmount || 0,
                    referencias: []
                });
            }

            // Crear una fila por cada método de pago
            let isFirstRow = true;
            const metodosOrdenados = Array.from(pagosPorMetodo.keys()).sort();
            
            metodosOrdenados.forEach(metodoName => {
                const metodoData = pagosPorMetodo.get(metodoName)!;
                
                // Ordenar referencias
                const referenciasOrdenadas = metodoData.referencias.sort((a, b) => {
                    const numA = parseInt(a);
                    const numB = parseInt(b);
                    if (!isNaN(numA) && !isNaN(numB)) {
                        return numA - numB;
                    }
                    return a.localeCompare(b);
                });

                const referenciasTexto = referenciasOrdenadas.length > 0
                    ? referenciasOrdenadas.join(' • ')
                    : '---';

                // Calcular saldo pendiente proporcional si hay múltiples métodos
                const totalAbonado = Array.from(pagosPorMetodo.values()).reduce((sum, m) => sum + m.totalMonto, 0);
                const saldoPendienteTotal = +raffleData.paymentDue || 0;
                const saldoProporcional = metodosOrdenados.length > 1 && totalAbonado > 0
                    ? (metodoData.totalMonto / totalAbonado) * saldoPendienteTotal
                    : (isFirstRow ? saldoPendienteTotal : 0);

                const rowData = [
                    isFirstRow ? formatWithLeadingZeros(raffleData.number, totalNumbers) : '', // Solo mostrar número en primera fila
                    isFirstRow ? nombreCompleto : '', // Solo mostrar nombre en primera fila
                    isFirstRow ? (raffleData.phone || '---') : '', // Solo mostrar teléfono en primera fila
                    formatCurrencyCOP(metodoData.totalMonto) || 0, // Valor abonado por este método
                    metodosOrdenados.length > 1 ? formatCurrencyCOP(saldoProporcional) : formatCurrencyCOP(saldoPendienteTotal), // Saldo pendiente
                    capitalize(metodoName), // Método de pago individual
                    referenciasTexto, // Referencias de este método
                    isFirstRow ? translateRaffleStatus(raffleData.status) : '', // Solo mostrar estado en primera fila
                ];
                
                const row = worksheet.addRow(rowData);

                // Colores según el estado del número (consistente para todas las filas del mismo número)
                let fillColor;
                switch (raffleData.status) {
                case "sold":
                    fillColor = "FFE2EFDA"; // Verde suave
                    break;
                case "pending":
                    fillColor = "FFFFF2CC"; // Amarillo suave
                    break;
                case "available":
                    fillColor = "FFFFFFFF"; // Blanco
                    break;
                case "apartado":
                    fillColor = "FFE1D5E7"; // Púrpura suave
                    break;
                default:
                    fillColor = "FFFFFFFF";
                }

                row.eachCell((cell, colNumber) => {
                    cell.fill = {
                        type: "pattern",
                        pattern: "solid",
                        fgColor: { argb: fillColor },
                    };
                    
                    // Alineación por tipo de contenido
                    if (colNumber === 1) { // Número
                        cell.alignment = { horizontal: 'center' };
                    } else if (colNumber === 4 || colNumber === 5) { // Montos
                        cell.alignment = { horizontal: 'right' };
                        cell.numFmt = '#,##0.00';
                    } else if (colNumber === 8) { // Estado
                        cell.alignment = { horizontal: 'center' };
                        cell.font = { bold: true };
                    } else {
                        cell.alignment = { horizontal: 'left' };
                    }
                    
                    // Bordes para todas las celdas
                    cell.border = {
                        top: { style: 'thin', color: { argb: 'FFE8E8E8' } },
                        left: { style: 'thin', color: { argb: 'FFE8E8E8' } },
                        bottom: { style: 'thin', color: { argb: 'FFE8E8E8' } },
                        right: { style: 'thin', color: { argb: 'FFE8E8E8' } }
                    };

                    // Si no es la primera fila, hacer el texto más suave para campos vacíos
                    if (!isFirstRow && (colNumber === 1 || colNumber === 2 || colNumber === 3 || colNumber === 8)) {
                        cell.font = { color: { argb: 'FFA0A0A0' } };
                    }
                });

                isFirstRow = false;
            });

            // Agregar una línea separadora sutil entre diferentes números si hay múltiples métodos
            if (metodosOrdenados.length > 1) {
                const separatorRow = worksheet.addRow(['', '', '', '', '', '', '', '']);
                separatorRow.height = 5;
                separatorRow.eachCell((cell) => {
                    cell.fill = {
                        type: "pattern",
                        pattern: "solid",
                        fgColor: { argb: "FFF8F8F8" },
                    };
                });
            }
        });

        // Ajustar ancho de columnas optimizado
        worksheet.columns = [
            { width: 12 }, // Número
            { width: 25 }, // Nombre Completo
            { width: 15 }, // Teléfono
            { width: 18 }, // Valor Abonado
            { width: 18 }, // Saldo Pendiente
            { width: 28 }, // Métodos de Pago
            { width: 35 }, // Referencias
            { width: 15 }, // Estado
        ];

        // Congelar primera fila de headers
        worksheet.views = [
            { state: 'frozen', ySplit: headerRowNumber }
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

export const exelRaffleNumbersFilter = async (raffleId: string, params: object, totalNumbers: number) => {

    try {
        const data = await getRaffleNumersExelFilter({ params, raffleId });
        if (!data) {
            console.error("No se obtuvieron datos de la rifa");
            return;
        }

        const { raffleNumbers, rafflePrice, userLastName, userName, count } = data;

        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet("Resumen Rifa");

        // Cabecera personalizada
        worksheet.mergeCells('A1:C1');
        worksheet.getCell('A1').value = `Responsable: ${userLastName || '---'}, ${userName || '---'}`;
        worksheet.getCell('A1').font = { bold: true, size: 14 };

        worksheet.mergeCells('A2:C2');
        worksheet.getCell('A2').value = `Precio de la Boleta: ${formatCurrencyCOP(+rafflePrice) || '---'}`;
        worksheet.getCell('A2').font = { bold: true, size: 12 };

        worksheet.mergeCells('A3:C3');
        worksheet.getCell('A3').value = `Números: ${count ?? raffleNumbers.length}`;
        worksheet.getCell('A3').font = { bold: true, size: 12 };

        // Agrupar números por centenas
        const grupos: Record<string, string[]> = {};
        raffleNumbers.forEach((raffle) => {
            const num = Number(raffle.number);
            const centena = Math.floor(num / 100) * 100;
            const key = `${formatWithLeadingZeros(centena, totalNumbers)}-${formatWithLeadingZeros((centena + 99), totalNumbers)}`;
            if (!grupos[key]) grupos[key] = [];
            grupos[key].push(formatWithLeadingZeros(num, totalNumbers));
        });

        // Determinar el máximo de números en un grupo para las filas
        const maxFilas = Math.max(...Object.values(grupos).map(arr => arr.length));
        const columnas = Object.keys(grupos).sort((a, b) => {
            const aNum = parseInt(a.split('-')[0]);
            const bNum = parseInt(b.split('-')[0]);
            return aNum - bNum;
        });

        // Encabezado de columnas por rango
        worksheet.addRow([]);
        worksheet.addRow(columnas);
        if (worksheet.lastRow) {
            worksheet.getRow(worksheet.lastRow.number).font = { bold: true, size: 14 };
        }

        // Agregar filas de números agrupados
        for (let i = 0; i < maxFilas; i++) {
            const fila = columnas.map(col => grupos[col][i] || '');
            worksheet.addRow(fila);
        }

        // Ajustar ancho de columnas
        worksheet.columns = columnas.map(() => ({ width: 12 }));

        // Guardar el archivo
        const todayDate = dayjs().format('DDMMYYYY');
        const filename = `Resumen_Rifa_NumerosAgrupados_${userLastName || 'responsable'}_${userName || ''}_${todayDate}.xlsx`;
        const buffer = await workbook.xlsx.writeBuffer();
        saveAs(new Blob([buffer]), filename);

    } catch (error) {
        console.error("Error al exportar los números de la rifa:", error);
    }
}
// agrega el totalNumeros
export const exelRafflesDetailsNumber = async () => {
    try {
        const data = await getRafflesDetailsNumbers();

        if (!data) {
            console.error("No se obtuvieron datos de la rifa");
            return;
        }

        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet("Detalle Rifas");

        worksheet.mergeCells("A1:H1");
        worksheet.getCell("A1").value = `Resumen de Rifas`;
        worksheet.getCell("A1").font = { bold: true, size: 14 };

        worksheet.addRow([]);

        // =========================
        // Agrupar y sumar montos
        // =========================
        const montoPorNumero: Record<string, number> = {};

        data.forEach((raffle) => {
            raffle.raffleNumbers.forEach((num) => {
                const numero = formatWithLeadingZeros(num.number, 3);
                const monto = parseFloat(num.paymentAmount) || 0;

                if (!montoPorNumero[numero]) montoPorNumero[numero] = 0;
                montoPorNumero[numero] += monto;
            });
        });

        // =========================
        // Armar grupos por centenas
        // =========================
        const grupos: Record<string, { numero: string; monto: number }[]> = {};
        Object.entries(montoPorNumero).forEach(([numero, monto]) => {
            const n = parseInt(numero, 10);
            const inicio = Math.floor(n / 100) * 100;
            const fin = inicio + 99;
            const key = `${formatWithLeadingZeros(inicio, 3)}-${formatWithLeadingZeros(
                fin,
                3
            )}`;
            if (!grupos[key]) grupos[key] = [];
            grupos[key].push({ numero, monto });
        });

        // =========================
        // Ordenar grupos y contenido
        // =========================
        const rangos = Object.keys(grupos).sort(
            (a, b) => parseInt(a.split("-")[0]) - parseInt(b.split("-")[0])
        );

        rangos.forEach((rango) => {
            grupos[rango].sort((a, b) => parseInt(a.numero) - parseInt(b.numero));
        });

        // =========================
        // Construir cabeceras
        // =========================
        const header: string[] = [];
        rangos.forEach((r) => {
            header.push(r, "MONTO TOTAL");
        });

        worksheet.addRow(header);
        worksheet.getRow(worksheet.lastRow!.number).font = { bold: true, size: 12 };

        // =========================
        // Determinar max filas
        // =========================
        const maxFilas = Math.max(...Object.values(grupos).map((arr) => arr.length));

        // =========================
        // Llenar datos fila por fila
        // =========================
        for (let i = 0; i < maxFilas; i++) {
            const fila: (string | number)[] = [];

            rangos.forEach((rango) => {
                const item = grupos[rango][i];
                if (item) {
                fila.push(item.numero, formatCurrencyCOP(item.monto));
                } else {
                fila.push("", "");
                }
            });

            worksheet.addRow(fila);
        }

        // =========================
        // Totales por rango
        // =========================
        const filaTotales: (string | number)[] = [];
        rangos.forEach((rango) => {
            filaTotales.push(
                "TOTAL",
                formatCurrencyCOP(
                grupos[rango].reduce((acc, it) => acc + it.monto, 0)
                )
            );
        });

        worksheet.addRow([]);
        worksheet.addRow(filaTotales);
        worksheet.getRow(worksheet.lastRow!.number).font = {
            bold: true,
            size: 12,
        };

        // =========================
        // Ajustar ancho
        // =========================
        worksheet.columns = header.map(() => ({ width: 15 }));

        // =========================
        // Descargar archivo
        // =========================
        const todayDate = dayjs().format("DDMMYYYY");
        const filename = `Detalle_Rifas_Agrupado_${todayDate}.xlsx`;
        const buffer = await workbook.xlsx.writeBuffer();
        saveAs(new Blob([buffer]), filename);
    } catch (error) {
        console.error("Error al exportar los números de la rifa:", error);
    }
};



export const exportRaffleNumbers = async (raffleId: string | undefined, nitResponsable: string | undefined, totalNumbers: number) => {
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
            // { header: "Tipo de Identificación", key: "identificationType", width: 20 },
            // { header: "Número de Identificación", key: "identificationNumber", width: 25 },
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
                number: formatWithLeadingZeros(raffle.number, totalNumbers),
                // status: statusRaffleTraslations[raffle.status],
                reservedDate: formatDateTimeLargeIsNull(raffle.reservedDate),
                // identificationType: raffle.identificationType || '---',
                // identificationNumber: raffle.identificationNumber || '---',
                firstName: raffle.firstName || '---',
                lastName: raffle.lastName || '---',
                phone: raffle.phone || '---',
                address: raffle.address || '---',
                vendedor: (() => {
                    const validPayment = raffle.payments.find(payment => payment.user && payment.isValid === true);
                    const firstName = validPayment?.user?.firstName ?? '---';
                    const lastName = validPayment?.user?.lastName ?? '---';
                    return `${firstName} ${lastName}`;
                })(),
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
        } as ExcelJS.CellFormulaValue;
        totalRow.getCell("paymentDue").value = {
            formula: `SUM(J2:J${lastRowNumber})`, // Asumiendo que la columna F tiene los valores
        } as ExcelJS.CellFormulaValue;
        totalRow.getCell("payments").value = {
            formula: `SUM(K2:K${lastRowNumber})`, // Asumiendo que la columna F tiene los valores
        } as ExcelJS.CellFormulaValue;

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

