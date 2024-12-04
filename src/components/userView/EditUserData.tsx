import { useQuery } from "@tanstack/react-query"
import EditUserModal from "./EditUserModal"
import { Navigate } from "react-router-dom"
import { getUserById } from "../../api/userApi"


type EditUserDataProps = {
    filter: object,
    page: number,
    rowsPerPag: number
}

function EditUserData({filter, page, rowsPerPag} : EditUserDataProps) {
    const queryParams = new URLSearchParams(location.search)
    const modalProduct = queryParams.get('editUser')
    const userId = Number(modalProduct)

    const {data, isError} = useQuery({
        queryKey: ['user', userId],
        queryFn: () => getUserById(userId),
        enabled: !!userId
    })

    if (isError)  return <Navigate to={'/404'}/>
    if (data) return <EditUserModal 
            filter={filter} 
            page={page} 
            rowsPerPag={rowsPerPag} 
            userId={userId}
            user={data}
        /> 
}

export default EditUserData