import { Button, Chip } from "@mui/material";
import { formatWithLeadingZeros } from "../../utils";
import { useNavigate } from "react-router-dom";
import { NumbersSelectedType } from "../../views/indexView/RaffleNumbersView";

type NumbersSeletedProps = {
    totalNumbers: number
    numbersSeleted: NumbersSelectedType[]
    setNumbersSeleted: React.Dispatch<React.SetStateAction<NumbersSelectedType[]>>
    raffleColor?: string
}

function NumbersSeleted({totalNumbers, numbersSeleted, setNumbersSeleted, raffleColor = '#1976d2'} : NumbersSeletedProps) {
    const navigate = useNavigate()

    const handleDelete = (raffleNumberId: number) => {
        setNumbersSeleted((prevSelect) => {
            return prevSelect.filter(item => item.numberId !== raffleNumberId)
        })
    }

    const handleNavigatePayNumbers = () => {
        navigate('?sellNumbers=true')
    }
    
    return (
        <div 
            className="grid grid-cols-5 p-4 mb-2 gap-x-2 gap-y-3 md:grid-cols-10 col-span-full"
            style={{
                borderBottom: 'none',
                boxShadow: `0 2px 8px ${raffleColor}40`,
                borderRadius: '8px',
                marginBottom: '1rem',
            }}
        >
            {numbersSeleted.map((item) => (
                <Chip key={item.numberId} 
                    sx={{
                        height: 40,
                        fontWeight: 'bold',
                        backgroundColor: raffleColor,
                        color: 'white',
                        '& .MuiChip-deleteIcon': {
                            color: 'white',
                            '&:hover': {
                                color: 'rgba(255, 255, 255, 0.8)',
                            },
                        },
                    }}
                    label={formatWithLeadingZeros(item.number, totalNumbers)} 
                    variant="filled" 
                    size="medium"
                    onDelete={() => handleDelete(item.numberId)}
                />
            ))}
            
        {numbersSeleted.length > 0 &&
            <div className="col-span-full">
                <Button
                    variant="contained"
                    onClick={handleNavigatePayNumbers}
                    sx={{
                        backgroundColor: raffleColor,
                        boxShadow: `0 4px 12px ${raffleColor}60`,
                        '&:hover': {
                            backgroundColor: raffleColor,
                            opacity: 0.9,
                            boxShadow: `0 6px 16px ${raffleColor}80`,
                        },
                    }}
                >
                    Comprar Boletas
                </Button>
            </div>
        }
        </div>
    )
}

export default NumbersSeleted