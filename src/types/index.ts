import {z} from "zod";
// AUTH & USERS & PAGINATION

const rolNameEnum = ['admin', 'vendedor', 'responsable'] as const

const ResponsePaginationSchema = z.object({
    total: z.number(),
    totalPages: z.number(),
    currentPage: z.number(),
})

const Rol = z.object({
    name: z.enum(rolNameEnum)
})

export const AuthSchema = z.object({
    id: z.number(),
    firstName: z.string(),
    lastName: z.string(),
    email: z.string().email(),
    identificationType: z.string(),
    identificationNumber: z.string(),
    phone: z.string(),
    address: z.string(),
    createdAt: z.string(),
    updatedAt: z.string(),
}).extend({
    rol: Rol.pick({
        name: true
    })
})


type Auth = z.infer<typeof AuthSchema>
export type UserLoginForm = Pick<Auth, 'email' | 'password'>




