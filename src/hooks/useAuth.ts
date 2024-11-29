import { useQuery } from "@tanstack/react-query"
import { getUser } from "../api/authApi"


export const useAuth = () => {

    const {data: user, isError, isLoading} = useQuery({
        queryKey: ['user'],
        queryFn: getUser,
        retry: false,
        refetchOnWindowFocus: false 
    })

    return {
        user,
        isError,
        isLoading,
    }
}