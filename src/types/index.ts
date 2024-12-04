import dayjs from "dayjs";
import {z} from "zod";
// AUTH & USERS & PAGINATION

const rolNameEnum = ['admin', 'vendedor', 'responsable'] as const
const statusRaffleNumbersEnum = ['available', 'sold', 'pending'] as const
const identificationTypeEnum = ['CC', 'TI', 'CE'] as const

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
    password: z.string(),
    confirmPassword: z.string(),
    identificationType: z.string(),
    identificationNumber: z.string(),
    phone: z.string(),
    address: z.string(),
    rolName: z.enum(rolNameEnum),
    createdAt: z.string(),
    updatedAt: z.string(),
}).extend({
    rol: Rol.pick({
        name: true
    })
})

export const userSchema = AuthSchema.pick({
    id:true,
    firstName:true,
    lastName:true,
    identificationType:true,
    identificationNumber:true,
    phone:true,
    address:true,
    email:true,
    createdAt:true,
    updatedAt:true,
    rol:true,
})

export const userItemForAdmin = AuthSchema.pick({
    id:true,
    firstName:true,
    lastName:true,
    identificationType:true,
    identificationNumber:true,
    phone:true,
    address:true,
    email:true,
    rol:true,
    createdAt:true,
})

export const responseGetUsersForAdminSchema = ResponsePaginationSchema.pick({
    currentPage: true,
    total: true,
    totalPages: true,
}).extend({
    users: z.array(userItemForAdmin)
})

export const userByRaffle = z.object({
    id: z.number(),
    role: z.enum(['responsable', 'vendedor']),
    assignedAt: z.string(),
    user: userSchema.pick({
        id: true,
        firstName: true,
        lastName: true,
        identificationNumber: true,
        identificationType: true,
        phone: true
    })
})

const userSelect = userSchema.pick({
    id: true,
    firstName: true,
    lastName: true
}).extend({
    rol: z.object({
        name: z.enum(['vendedor', 'responsable'])
    })
})

export const responseGetUsersByRaffle = z.array(userByRaffle)
export const usersSelect = z.array(userSelect)

type Auth = z.infer<typeof AuthSchema>
export type User = z.infer<typeof userSchema>
export type UserItem = z.infer<typeof userItemForAdmin>
export type UserItemByRaffle = z.infer<typeof userByRaffle>
export type UserLoginForm = Pick<Auth, 'identificationNumber' | 'password'>
export type UserForm = Pick<Auth, 'firstName' | 'lastName'|'identificationType'| 'identificationNumber' | 'phone' | 'address' | 'confirmPassword' | 'rolName' | 'email' | 'password'>
export type UserEditForm = Pick<Auth, 'firstName' | 'lastName'|'identificationType'| 'identificationNumber' | 'phone' | 'address' | 'email' >
export type PasswordEditForm = Pick<Auth, 'password' | 'confirmPassword' >

// RAFFLE NUMBERS

export const raffleNumbersSchema = z.object({
    id: z.number(),
    number: z.number(),
    status: z.enum(statusRaffleNumbersEnum)
})

export const responseRaffleNumbersSchema = ResponsePaginationSchema.pick({
    currentPage: true,
    total: true,
    totalPages: true,
}).extend({
    raffleNumbers: z.array(raffleNumbersSchema)
})



// RAFFLES

export const raffleSchema = z.object({
    id: z.number(),
    name: z.string(),
    nitResponsable: z.string(),
    nameResponsable: z.string(),
    description: z.string(),
    startDate: z.string(),
    playDate: z.string(),
    editDate: z.string(),
    price: z.string(),
    banerImgUrl: z.string(),
})



export const raffleByIdSchema = raffleSchema.extend({
    userRiffle: z.array(z.object({
        userId: z.number()
    })).nullable()
})


export const createRaffleSchema = raffleSchema.pick({
    name: true,
    description: true,
    price: true,
    banerImgUrl: true,
    nitResponsable: true,
    nameResponsable: true,
})
.extend({
    quantity: z.number(),
    startDate: z
        .string()
        .nullable()
        .transform((date) => (date ? dayjs(date) : null)),
    playDate: z
        .string()
        .nullable()
        .transform((date) => (date ? dayjs(date) : null)),
    editDate: z
        .string()
        .nullable()
        .transform((date) => (date ? dayjs(date) : null)),
});

export const updateRaffleSchema = createRaffleSchema.pick({
    name: true,
    description: true,
    banerImgUrl: true,
    nitResponsable: true,
    nameResponsable: true,
    startDate: true,
    playDate:true,
    editDate: true
})

export const responseGetRafflesSchema = ResponsePaginationSchema.pick({
    currentPage: true,
    total: true,
    totalPages: true,
}).extend({
    raffles: z.array(raffleSchema)
})


export type Raffle = z.infer<typeof raffleSchema>
export type CreateRaffleForm = z.infer<typeof createRaffleSchema>
export type UpdateRaffleForm = z.infer<typeof updateRaffleSchema>

// PAYMENTS

export const payNumbersSchema = z.object({
    raffleNumbersIds: z.array(z.number()),
    identificationType: z.enum(['CC', 'TI', 'CE']),
    identificationNumber: z.string(),
    firstName: z.string(),
    lastName: z.string(),
    phone: z.string(),
    address: z.string(),
})

export const payNumberSchema = payNumbersSchema.pick({
    identificationType: true,
    identificationNumber: true,
    firstName: true,
    lastName: true,
    phone: true,
    address: true,
}).extend({
    amount: z.number()
})

// Definición del esquema para los pagos
const userVendedor = z.object({
    firstName: z.string(),
    lastName: z.string(),
    identificationNumber: z.string()
})
const PaymentSchema = z.object({
    id: z.number(),
    amount: z.string(), 
    paidAt: z.string().nullable(), 
    riffleNumberId: z.number(),
    userId: z.number(),
    createdAt: z.string(), 
    updatedAt: z.string(), 
    user: userVendedor
});
export const RaffleNumberSchema = z.object({
    id: z.number(),
    number: z.number(),
    reservedDate: z.string(), 
    status: z.string(), 
    identificationType: z.string(),
    identificationNumber: z.string(),
    firstName: z.string(),
    lastName: z.string(),
    phone: z.string(),
    address: z.string(),
    paymentAmount: z.string(), 
    paymentDue: z.string(), 
    raffleId: z.number(),
    createdAt: z.string(), 
    updatedAt: z.string(), 
    payments: z.array(PaymentSchema),
});
// export const RafflesPayResponseSchema = z.object({
//     message: z.string(),
//     raffleNumbers: z.array(RaffleNumberSchema),
// });
    
export const RafflePayResponseSchema = z.array(RaffleNumberSchema)
    
export const raffleNumberSchema  = z.object({
    id: z.number(),
    number: z.number(),
    reservedDate: z.string().nullable(),
    status: z.enum(statusRaffleNumbersEnum),
    identificationType: z.enum(identificationTypeEnum).nullable(),
    identificationNumber: z.string().nullable(),
    firstName:  z.string().nullable(),
    lastName:  z.string().nullable(),
    phone: z.string().nullable(),
    address: z.string().nullable(),
    paymentAmount: z.string(),
    paymentDue: z.string(),
}).extend({
    payments: z.array(PaymentSchema),
})

export const updateRaffleNumberCustomer = payNumbersSchema.pick({
    address: true,
    phone: true
})

export const responseGetNumbersByUser = ResponsePaginationSchema.extend({
    numbersPayments: z.array(RaffleNumberSchema)
})

export const raffleNumberExelSchema = raffleNumbersSchema.pick({
    id: true,
    number: true,
    status: true,
}).extend({
    reservedDate: z.string().nullable(),
    identificationType: z.enum(identificationTypeEnum).nullable(),
    identificationNumber: z.string().nullable(),
    firstName: z.string().nullable(),
    lastName: z.string().nullable(),
    phone: z.string().nullable(),
    address: z.string().nullable(),
})
export const responseRaffleNumbersExelSchema = ResponsePaginationSchema.pick({
    currentPage: true,
    total: true,
    totalPages: true,
}).extend({
    raffleNumbers: z.array(raffleNumberExelSchema)
})

export type RaffleNumberPayments = z.infer<typeof PaymentSchema>
export type RaffleNumberUpdateForm = z.infer<typeof updateRaffleNumberCustomer>
export type RaffleNumber = z.infer<typeof raffleNumberSchema> //
export type RaffleNumbersPayments = z.infer<typeof RafflePayResponseSchema>
export type PayNumbersForm = z.infer<typeof payNumbersSchema>
export type PayNumberForm = z.infer<typeof payNumberSchema>

