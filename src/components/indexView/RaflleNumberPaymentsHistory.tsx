import { Accordion, AccordionDetails, AccordionSummary, Box } from "@mui/material"
import { RaffleNumberPayments } from "../../types"
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { formatCurrencyCOP, formatDateTimeLarge, formatDateTimeLargeIsNull } from "../../utils";

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
            >
                Abonos
            </AccordionSummary>
            <AccordionDetails>
            {payments.map(payment => (
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
                    <div className='flex gap-3'>
                    <p>Metodo de Pago:</p>
                    <p className='font-bold capitalize text-azul'>{payment.paymentMethod || 'No especificado'}</p>
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
            </AccordionDetails>
        </Accordion>
        </div>
    )
}

export default RaflleNumberPaymentsHistory