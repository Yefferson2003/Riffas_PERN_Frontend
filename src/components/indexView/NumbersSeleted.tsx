import { Button, Chip } from "@mui/material";
import { formatWithLeadingZeros } from "../../utils";
import { useNavigate } from "react-router-dom";

type NumbersSeletedProps = {
    numbersSeleted: {
        numberId: number;
        number: number;
    }[]
    setNumbersSeleted: React.Dispatch<React.SetStateAction<{
        numberId: number;
        number: number;
    }[]>>
}

function NumbersSeleted({numbersSeleted, setNumbersSeleted} : NumbersSeletedProps) {
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
        <div className="grid grid-cols-5 pb-2 mb-2 border-b-2 gap-x-1 gap-y-3 md:grid-cols-10 col-span-full border-azul">
            {numbersSeleted.map((item) => (
                <Chip key={item.numberId} 
                    sx={{height: 35, fontWeight: 'bold' }}
                    label={formatWithLeadingZeros(item.number)} 
                    variant="filled" 
                    size="small"
                    color="primary"
                    onDelete={() => handleDelete(item.numberId)}
                />
            ))}
            
        {numbersSeleted.length > 0 &&
            <div className="col-span-full">
                <Button
                    variant="contained"
                    onClick={handleNavigatePayNumbers}
                >
                    Comprar Boletas
                </Button>
            </div>
        }
        </div>
    )
}

export default NumbersSeleted