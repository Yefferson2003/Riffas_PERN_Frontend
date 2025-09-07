import { useQuery } from "@tanstack/react-query"
import { getUser } from "../api/authApi"


export const useAuth = () => {

    const token = localStorage.getItem('AUTH_TOKEN');

    const { data: user, isError, isLoading} = useQuery({
    queryKey: ['user'],
    queryFn: getUser,
    enabled: !!token,   
    retry: false,      
    });

    return {
        user,
        isError,
        isLoading,
    }
}