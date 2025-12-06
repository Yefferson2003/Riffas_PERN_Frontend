import { getClientsForExport } from '../api/clientApi';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import dayjs from 'dayjs';
import { formatCurrencyCOP, translateRaffleStatus } from './index';
import { toast } from 'react-toastify';

export async function exportClientsToExcel() {
    toast.info('Iniciando proceso de descarga...', { position: 'top-right', autoClose: 2000 });
    try {
        const data = await getClientsForExport();
        if (!data || !data.clients || data.clients.length === 0) {
            toast.error('No hay datos de clientes para exportar', { position: 'top-right', autoClose: 3000 });
            console.error('No hay datos de clientes para exportar');
            throw new Error('No hay datos de clientes para exportar');
        }
        const clients = data.clients;
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Clientes');

        // Cabecera principal
        worksheet.mergeCells('A1:H1');
        worksheet.getCell('A1').value = `Exportación de Clientes - ${dayjs().format('DD/MM/YYYY')}`;
        worksheet.getCell('A1').font = { bold: true, size: 14 };
        worksheet.addRow([]);

        // Encabezados de columnas
        const headers = [
            'Nombre', 'Apellido', 'Teléfono', 'Dirección', 'Números (Rifa)', 'Fecha Apartado', 'Estado', 'Abonado', 'Deuda'
        ];
        worksheet.addRow(headers);
        worksheet.getRow(3).font = { bold: true, size: 12 };
        worksheet.getRow(3).alignment = { horizontal: 'center' };

        // Agregar datos de clientes
        clients.forEach(client => {
            // Para cada número de rifa asociado, crear una fila
            if (client.raffleNumbers && client.raffleNumbers.length > 0) {
                client.raffleNumbers.forEach(num => {
                    worksheet.addRow([
                        client.firstName,
                        client.lastName,
                        client.phone,
                        client.address,
                        num.raffle?.name || '',
                        num.reservedDate ? dayjs(num.reservedDate).format('DD/MM/YYYY') : '',
                        translateRaffleStatus(num.status),
                        formatCurrencyCOP(+num.paymentAmount),
                        formatCurrencyCOP(+num.paymentDue)
                    ]);
                });
            } else {
                worksheet.addRow([
                    client.firstName,
                    client.lastName,
                    client.phone,
                    client.address,
                    '', '', '', '', ''
                ]);
            }
        });

        // Ajustar ancho de columnas
        worksheet.columns = [
            { width: 15 }, { width: 15 }, { width: 15 }, { width: 25 }, { width: 20 }, { width: 15 }, { width: 12 }, { width: 15 }, { width: 15 }
        ];

        // Descargar archivo
        const todayDate = dayjs().format('DDMMYYYY');
        const filename = `Clientes_Exportados_${todayDate}.xlsx`;
        const buffer = await workbook.xlsx.writeBuffer();
        saveAs(new Blob([buffer]), filename);
        toast.success('Descarga completada', { position: 'top-right', autoClose: 2500 });
    } catch (error) {
        toast.error('Error al exportar los clientes', { position: 'top-right', autoClose: 3500 });
        console.error('Error en exportación de Excel de clientes:', error);
        if (error instanceof Error) {
            console.error('Mensaje:', error.message);
            if ((error).stack) console.error('Stack:', (error).stack);
        }
    }
}
