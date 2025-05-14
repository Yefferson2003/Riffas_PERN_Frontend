import { QueryObserverResult, RefetchOptions } from "@tanstack/react-query";
import { AwardsResponseType, AwardType, User } from "../../../types";
import { formatDateTimeLargeIsNull } from "../../../utils";
import AddAwadModal from "../modal/Awards/AddAwardModal";
import { useNavigate, useOutletContext, useParams } from "react-router-dom";
import { IconButton, Tooltip } from "@mui/material";
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useMutation } from "@tanstack/react-query";
import { deleteAward } from "../../../api/awardsApi";
import { toast } from "react-toastify";
import UpdateAwadModal from "../modal/Awards/UpdateAwardModal";

type AwardsProps = {
    awards?: AwardType[]
    refecht: (options?: RefetchOptions) => Promise<QueryObserverResult<AwardsResponseType | undefined, Error>>
    raffleDate: string | undefined
}

// Añadir estilos y renderizar premios
function Awards({ awards, refecht, raffleDate }: AwardsProps) {

    const navigate = useNavigate()
    const { raffleId } = useParams<{ raffleId: string }>();
    const user : User = useOutletContext();

    const { mutate: deleteAwardMutate, isPending } = useMutation({
        mutationFn: deleteAward,
        onSuccess: (data) => {
            toast.success(data)
            refecht();
        },
        onError: (error) => {
            toast.error(error.message)
        },
    });

    const handleDeleteAward = (awardId: number) => {
        if (window.confirm("¿Estás seguro de que deseas eliminar este premio?")) {
            deleteAwardMutate({awardId: awardId.toString(), raffleId: raffleId!});
        }
    };

    const handleNewAwardModal = () => {
        navigate('?newAward=true')
    }
    
    const handleEditAwardModal = (awardId: number) => {
        navigate(`?updateAward=${awardId}`)
    }

    return (
        <div className="awards-container">
            <h3 className="mb-4 text-xl font-bold">Premios</h3>

            {user.rol.name === 'admin' && <button
                onClick={handleNewAwardModal}
                className="px-4 py-2 mb-4 text-white rounded bg-azul hover:bg-blue-700"
            >
                Nuevo Premio
            </button>}

            {!awards || awards.length === 0 && <p className="text-center ">No hay premios secundarios disponibles.</p>}
            <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {awards?.map((award, index) => (
                    <li key={index} className="p-4 bg-white border rounded-lg shadow-md award-item">
                        <h4 className="text-lg font-semibold text-azul">{award.name}</h4>
                        <p className="font-bold text-azul text-md">Juega: <span className="text-baclk ">{formatDateTimeLargeIsNull(award.playDate)}</span></p>

                        {user.rol.name === 'admin' && (
                            <>
                            <IconButton 
                                color="primary" 
                                onClick={() =>handleEditAwardModal(award.id)}
                            >
                                <Tooltip title={"Editar Premio"} placement="bottom-start">
                                    <EditIcon />
                                </Tooltip>
                            </IconButton>
                            <IconButton
                                color="error"
                                onClick={() => handleDeleteAward(award.id)}
                                disabled={isPending}
                            >
                                <Tooltip title={"Eliminar Gasto"} placement="bottom-start">
                                    <DeleteIcon />
                                </Tooltip>
                            </IconButton>
                            </>
                        )}
                        
                    </li>
                ))}
            </ul>

            <UpdateAwadModal
                refecht={refecht}
                raffleDate={raffleDate}
            />

            <AddAwadModal 
                refecht={refecht}
                raffleDate={raffleDate}
            />
        </div>
    );
}

export default Awards;
