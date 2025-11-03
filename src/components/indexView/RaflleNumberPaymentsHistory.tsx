import { Accordion, AccordionDetails, AccordionSummary, Box } from "@mui/material"
import { RaffleNumberPayments } from "../../types"
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { capitalize, formatCurrencyCOP, formatDateTimeLarge, formatDateTimeLargeIsNull } from "../../utils";

type RaflleNumberPaymentsHistoryProps = {
    payments: RaffleNumberPayments[]
}

function RaflleNumberPaymentsHistory({payments} : RaflleNumberPaymentsHistoryProps) {
    return (
        <div className="mt-3">
        <Accordion>
            <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls="panel1-content"
                id="panel1-header"
                sx={{
                    backgroundColor: "#f8f9fa",
                    borderRadius: "8px 8px 0 0",
                    minHeight: "48px",
                    "& .MuiAccordionSummary-content": {
                        margin: "12px 0",
                    }
                }}
            >
                <div className="flex items-center gap-2">
                    <span className="font-semibold text-gray-700">Historial de Pagos</span>
                    <span className="px-2 py-1 text-xs font-medium text-white rounded-full bg-azul">
                        {payments.length}
                    </span>
                </div>
            </AccordionSummary>
            <AccordionDetails sx={{ padding: "16px", backgroundColor: "#fafafa" }}>
            {payments.length === 0 ? (
                <div className="py-8 text-center text-gray-500">
                    <p>No hay pagos registrados</p>
                </div>
            ) : (
                payments.map((payment, index) => (
                    <Box
                        key={payment.id}
                        sx={{
                            mb: 1,
                            p: 2,
                            border: payment.isValid ? "1px solid #e5e7eb" : "1px solid #fca5a5",
                            borderRadius: 1.5,
                            backgroundColor: payment.isValid ? "#ffffff" : "#fef2f2",
                            opacity: payment.isValid ? 1 : 0.75,
                            "&:hover": {
                                backgroundColor: payment.isValid ? "#f9fafb" : "#fee2e2"
                            },
                            "&:last-child": {
                                mb: 0
                            }
                        }}
                    >
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                                <span className="text-xs font-medium text-gray-700">#{index + 1}</span>
                                <span className={`font-semibold ${payment.isValid ? 'text-green-600' : 'text-red-600 line-through'}`}>
                                    {formatCurrencyCOP(+payment.amount)}
                                </span>
                                <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${
                                    payment.paidAt ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                                }`}>
                                    {payment.paidAt ? 'Pagado' : 'Abono'}
                                </span>
                                <span className={`px-1.5 py-0.5 rounded-full text-xs font-medium ${
                                    payment.isValid 
                                        ? 'bg-blue-100 text-blue-700' 
                                        : 'bg-red-100 text-red-700'
                                }`}>
                                    {payment.isValid ? 'Válido' : 'Anulado'}
                                </span>
                            </div>
                            <span className="text-xs text-gray-400">ID: {payment.id}</span>
                        </div>
                        
                        <div className='space-y-1'>
                            <div className='flex items-center justify-between text-xs'>
                                <span className='text-gray-500'>Fecha:</span>
                                <span className='text-gray-700'>
                                    {!payment.paidAt 
                                        ? formatDateTimeLarge(payment.createdAt)
                                        : formatDateTimeLargeIsNull(payment.paidAt)
                                    }
                                </span>
                            </div>

                            <div className='flex items-center justify-between text-xs'>
                                <span className='text-gray-500'>Método de pago:</span>
                                <span className='font-medium text-gray-700'>
                                    {capitalize(payment.rafflePayMethode?.payMethode?.name || 'No especificado')}
                                </span>
                            </div>

                            <div className='flex items-center justify-between text-xs'>
                                <span className='text-gray-500'>Referencia:</span>
                                {payment.reference ? (
                                    <span className='px-1.5 py-0.5 text-xs font-medium text-purple-600 rounded bg-purple-50'>
                                        {payment.reference}
                                    </span>
                                ) : (
                                    <span className='italic text-gray-400'>Sin referencia</span>
                                )}
                            </div>

                            {payment.rafflePayMethode?.accountNumber && (
                                <div className='flex items-center justify-between text-xs'>
                                    <span className='text-gray-500'>Cuenta:</span>
                                    <span className='font-mono text-xs text-gray-700'>
                                        {payment.rafflePayMethode.accountNumber}
                                    </span>
                                </div>
                            )}

                            {payment.rafflePayMethode?.accountHolder && (
                                <div className='flex items-center justify-between text-xs'>
                                    <span className='text-gray-500'>Titular:</span>
                                    <span className='text-gray-700 capitalize'>
                                        {payment.rafflePayMethode.accountHolder}
                                    </span>
                                </div>
                            )}

                            {payment.rafflePayMethode?.bankName && (
                                <div className='flex items-center justify-between text-xs'>
                                    <span className='text-gray-500'>Banco:</span>
                                    <span className='text-gray-700'>
                                        {payment.rafflePayMethode.bankName}
                                    </span>
                                </div>
                            )}

                            <div className='flex items-center justify-between text-xs'>
                                <span className='text-gray-500'>Vendedor:</span>
                                <span className='text-gray-700 capitalize'>
                                    {payment.user ? 
                                        payment.user?.firstName + ' ' + payment?.user.lastName
                                        :
                                        'Sin vendedor'
                                    }
                                </span>
                            </div>
                        </div>
                    
                </Box>
                ))
            )}
            </AccordionDetails>
        </Accordion>
        </div>
    )
}

export default RaflleNumberPaymentsHistory