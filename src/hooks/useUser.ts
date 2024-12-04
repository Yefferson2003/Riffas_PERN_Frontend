import { useQuery } from "@tanstack/react-query";
import { getUsersBySelect } from "../api/userApi";

export const useUsersSelect = () => {
    return useQuery({queryKey: ['userBySelect'], queryFn: getUsersBySelect});
};