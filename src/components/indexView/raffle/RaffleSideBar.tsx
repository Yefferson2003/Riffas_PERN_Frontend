import DescriptionIcon from '@mui/icons-material/Description';
import EditIcon from '@mui/icons-material/Edit';
import GroupIcon from '@mui/icons-material/Group';
import RequestQuoteIcon from '@mui/icons-material/RequestQuote';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import KeyboardReturnIcon from '@mui/icons-material/KeyboardReturn';
import AddLinkIcon from '@mui/icons-material/AddLink';
import PaymentIcon from '@mui/icons-material/Payment';
import { IconButton, Tooltip } from '@mui/material';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { Raffle, User } from '../../../types';
import ButtonDeleteRaffle from '../ButtonDeleteRaffle';
import { toast } from 'react-toastify';
import { exportRaffleNumbers } from '../../../utils/exel';

type RaffleSideBarProps = {
    raffleId: string;
    raffle: Raffle;
    totalNumbers: number;
};

function RaffleSideBar({ raffleId, raffle, totalNumbers }: RaffleSideBarProps) {
    const user: User = useOutletContext();
    const navigate = useNavigate();

    const handleNavigateHome = () => navigate('/');
    const handleNavigateUpdateRaffle = () => navigate('?updateRaffle=true');
    const handleNavigateViewUsers = () => navigate('?viewUsers=true');
    const handleNavigateExpensesByUser = () => navigate('?viewExpenses=true');
    const handleNavigateExpensesByRaffle = () => navigate('?viewExpensesByRaffle=true');
    const handleNavigateShareURLRaffle = () => navigate('?viewShareURLRaffle=true');
    const handleNavigatePayMethodesRaffle = () => navigate('?viewPayMethodesRaffle=true');

    const canManage = user.rol.name === 'responsable' || user.rol.name === 'admin';
    const canCollaborate = user.rol.name === 'responsable' || user.rol.name === 'admin';

    return (
        <div className="flex justify-between order-1 lg:order-none">
        {/* Botón regresar */}
        <div>
            <IconButton onClick={handleNavigateHome}>
            <Tooltip title="Regresar">
                <KeyboardReturnIcon />
            </Tooltip>
            </IconButton>
        </div>

        {/* Opciones */}
        <div>
            {/* Gastos personales siempre visibles */}
            <IconButton 
                color='primary'
                onClick={handleNavigateShareURLRaffle}
            >
            <Tooltip title="Compartir rifa" placement="bottom-start">
                <AddLinkIcon />
            </Tooltip>
            </IconButton>
            
            <IconButton onClick={handleNavigateExpensesByUser}>
            <Tooltip title="Gastos personales" placement="bottom-start">
                <AttachMoneyIcon />
            </Tooltip>
            </IconButton>

            {/* Gastos de la rifa solo para responsables y admins */}
            {canManage && (
            <IconButton onClick={handleNavigateExpensesByRaffle}>
                <Tooltip title="Gastos de la rifa" placement="bottom-start">
                <RequestQuoteIcon />
                </Tooltip>
            </IconButton>
            )}

            {/* Opciones extra para responsables y admins */}
            {canCollaborate && (
            <>
                <IconButton onClick={handleNavigateViewUsers}>
                <Tooltip title="Colaboradores">
                    <GroupIcon />
                </Tooltip>
                </IconButton>

                <IconButton onClick={handleNavigatePayMethodesRaffle}>
                <Tooltip title="Métodos de pago" placement="bottom-start">
                    <PaymentIcon />
                </Tooltip>
                </IconButton>

                <IconButton onClick={handleNavigateUpdateRaffle}>
                <Tooltip title="Editar Rifa" placement="bottom-start">
                    <EditIcon />
                </Tooltip>
                </IconButton>

                <IconButton
                onClick={() => {
                    exportRaffleNumbers(raffleId, raffle?.nitResponsable, totalNumbers);
                    toast.info('Descargando archivo...');
                }}
                >
                <Tooltip title="Descargar informe" placement="bottom-start">
                    <DescriptionIcon color="success" />
                </Tooltip>
                </IconButton>

                <ButtonDeleteRaffle raffleId={raffle.id} />
            </>
            )}
        </div>
        </div>
    );
}

export default RaffleSideBar;
