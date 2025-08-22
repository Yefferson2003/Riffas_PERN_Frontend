import DescriptionIcon from '@mui/icons-material/Description';
import EditIcon from '@mui/icons-material/Edit';
import GroupIcon from '@mui/icons-material/Group';
import RequestQuoteIcon from '@mui/icons-material/RequestQuote';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import KeyboardReturnIcon from '@mui/icons-material/KeyboardReturn';
import { IconButton, Tooltip } from '@mui/material';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { Raffle, User } from '../../../types';
import ButtonDeleteRaffle from '../ButtonDeleteRaffle';
import { toast } from 'react-toastify';
import { exportRaffleNumbers } from '../../../utils/exel';

type RaffleSideBarProps = {
    raffleId: string;
    raffle: Raffle
    totalNumbers: number
}

function RaffleSideBar( { raffleId, raffle, totalNumbers}: RaffleSideBarProps) {

    const user : User = useOutletContext();
    const navigate = useNavigate()

    const handleNavigateHome = () => {
        navigate('/')
    }

    const handleNavigateUpdateRaffle = () => {
        navigate('?updateRaffle=true')
    }
    
    const handleNavigateViewUsers = () => {
        navigate('?viewUsers=true')
    }
    
    const handleNavigateExpensesByUser = () => {
        navigate('?viewExpenses=true')
    }

    const handleNavigateExpensesByRaffle = () => {
        navigate('?viewExpensesByRaffle=true')
    }

    
    return (
        <div className="flex justify-between order-1 lg:order-none">
            <div>
                <IconButton>
                <Tooltip title="Regresar" onClick={handleNavigateHome}>
                    <KeyboardReturnIcon />
                </Tooltip>
                </IconButton>
                
                
            </div>

            <div>
                
                <IconButton onClick={handleNavigateExpensesByUser}>
                    <Tooltip title={"Gastos personales"} placement="bottom-start">
                    <AttachMoneyIcon />
                    </Tooltip>
                </IconButton>

                {(user.rol.name === "responsable" || user.rol.name === "admin") && (
                    <IconButton onClick={handleNavigateExpensesByRaffle}>
                        <Tooltip title={"Gastos de la rifa"} placement="bottom-start">
                        <RequestQuoteIcon />
                        </Tooltip>
                    </IconButton>
                )}

                { user.rol.name === 'responsable' && (
                    <>
                        
                        <IconButton onClick={handleNavigateViewUsers}>
                            <Tooltip title={"Colaboradores"}>
                            <GroupIcon />
                            </Tooltip>
                        </IconButton>
                        
                        <IconButton onClick={handleNavigateUpdateRaffle}>
                            <Tooltip title={"Editar Rifa"} placement="bottom-start">
                            <EditIcon />
                            </Tooltip>
                        </IconButton>
                        
                        <IconButton
                            onClick={() => {
                            exportRaffleNumbers(raffleId, raffle?.nitResponsable, totalNumbers);
                                toast.info("Descargando archivo...");
                            }}
                        >
                            <Tooltip title={"Descargar informe"} placement="bottom-start">
                            <DescriptionIcon color="success" />
                            </Tooltip>
                        </IconButton>
                        
                        <ButtonDeleteRaffle raffleId={raffle.id} />
                    </>
                )}
                
                {user.rol.name === "admin" && (
                    <>
                        
                        <IconButton onClick={handleNavigateViewUsers}>
                            <Tooltip title={"Colaboradores"}>
                            <GroupIcon />
                            </Tooltip>
                        </IconButton>
                        
                        <IconButton onClick={handleNavigateUpdateRaffle}>
                            <Tooltip title={"Editar Rifa"} placement="bottom-start">
                            <EditIcon />
                            </Tooltip>
                        </IconButton>
                        
                        <IconButton
                            onClick={() => {
                            exportRaffleNumbers(raffleId, raffle?.nitResponsable, totalNumbers);
                                toast.info("Descargando archivo...");
                            }}
                        >
                            <Tooltip title={"Descargar informe"} placement="bottom-start">
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
