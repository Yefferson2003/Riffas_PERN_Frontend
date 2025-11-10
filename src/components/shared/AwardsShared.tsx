import { AwardType } from "../../types"
import { formatDateTimeLargeIsNull } from "../../utils"


type AwardsSharedProps = {
    awards: AwardType[]
    raffleColor?: string
}

function AwardsShared( {awards, raffleColor } : AwardsSharedProps) {

    const primaryColor = raffleColor || '#1976d2';
    
    if (awards) return (
        <div className="awards-container">
            <h3 
                className="text-xl font-bold"
                style={{ color: primaryColor }}
            >
                Premios
            </h3>
            
            {!awards || awards.length === 0 && <p className="text-center ">No hay premios secundarios disponibles.</p>}
            <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {awards?.map((award, index) => (
                    <li 
                        key={index} 
                        className="p-4 bg-white rounded-lg shadow-md award-item"
                        style={{
                            border: `2px solid ${primaryColor}`,
                            boxShadow: `0 4px 12px ${primaryColor}30, 0 2px 6px ${primaryColor}20`
                        }}
                    >
                        <h4 
                            className="text-lg font-semibold"
                            style={{ color: primaryColor }}
                        >
                            {award.name}
                        </h4>
                        <p 
                            className="font-bold text-md"
                            style={{ color: primaryColor }}
                        >
                            Juega: <span className="text-black">{formatDateTimeLargeIsNull(award.playDate)}</span>
                        </p>
                        
                        
                    </li>
                ))}
            </ul>

        </div>
    )
}

export default AwardsShared
