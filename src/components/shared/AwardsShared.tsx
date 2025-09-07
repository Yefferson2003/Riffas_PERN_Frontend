import { AwardType } from "../../types"
import { formatDateTimeLargeIsNull } from "../../utils"


type AwardsSharedProps = {
    awards: AwardType[]
}

function AwardsShared( {awards } : AwardsSharedProps) {

    
    if (awards) return (
        <div className="awards-container">
            <h3 className="mb-4 text-xl font-bold">Premios</h3>
            
            {!awards || awards.length === 0 && <p className="text-center ">No hay premios secundarios disponibles.</p>}
            <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {awards?.map((award, index) => (
                    <li key={index} className="p-4 bg-white border rounded-lg shadow-md award-item">
                        <h4 className="text-lg font-semibold text-azul">{award.name}</h4>
                        <p className="font-bold text-azul text-md">Juega: <span className="text-baclk ">{formatDateTimeLargeIsNull(award.playDate)}</span></p>
                        
                        
                    </li>
                ))}
            </ul>

        </div>
    )
}

export default AwardsShared
