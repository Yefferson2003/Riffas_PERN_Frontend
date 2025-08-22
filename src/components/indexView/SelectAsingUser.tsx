import { Button, CircularProgress, MenuItem, Select, SelectChangeEvent } from "@mui/material"
import { useUsersSelect } from "../../hooks/useUser"
import { useState } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { assingUser } from "../../api/raffleApi"
import { toast } from "react-toastify"

type SelectAsingUserProps = {
    raffleId: number
    userRol: "admin" | "responsable" | "vendedor"
    
}

function SelectAsingUser({raffleId, userRol} : SelectAsingUserProps) {
    const [userId, setUserId] = useState('')
    
    const {data, isLoading} = useUsersSelect()
    
    const handleChange = (e : SelectChangeEvent) => {
        setUserId(e.target.value as string);
    }

    const queryClient = useQueryClient()
    const {mutate, isPending} = useMutation({
        mutationFn: assingUser,
        onError(error) {
            toast.error(error.message)
        },
        onSuccess(data) {
            queryClient.invalidateQueries({queryKey: ['usersRaffle', raffleId]})
            toast.success(data)
        },
        
    })

    const handleAssingUser = () => {
        if (!userId) {
            toast.warning('Seleccione un usuario')
        }

        const data = {
            raffleId,
            userId: +userId
        }
        mutate(data)
    }
    
    return (
        <div className="flex flex-col justify-center w-full gap-3 mb-5 md:flex-row">

            {isLoading && !data && <CircularProgress/>}
            
            {data && 
                <>
                    <Select sx={{width: {sx: 'auto',md: '100%',}}}
                        value={userId}
                        onChange={handleChange}
                        disabled={userRol === 'vendedor'}
                    >
                        {data.map(user => (
                            <MenuItem 
                                key={user.id} 
                                value={user.id.toString()}
                            >
                                <p className="capitalize">{user.firstName + ' ' + user.lastName+ ' - ' + user.rol.name}</p>
                            </MenuItem>
                        ))}
                    </Select>
                    <Button sx={{width: {sx: 'auto',md: '100%',}}} 
                        variant="contained"
                        disabled={!userId || isPending}
                        onClick={handleAssingUser}
                    >
                        Asignar
                    </Button>
                </>
            }
        </div>
    )
}

export default SelectAsingUser