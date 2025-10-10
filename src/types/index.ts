import dayjs from "dayjs";
import {  z } from "zod";
// AUTH & USERS & PAGINATION

const rolNameEnum = ['admin', 'vendedor', 'responsable'] as const
const statusRaffleNumbersEnum = ['available', 'sold', 'pending', 'apartado'] as const
// const identificationTypeEnum = ['CC', 'TI', 'CE'] as const

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
    isActive: z.boolean()
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
    isActive: true
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
    banerMovileImgUrl: z.string(),
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
    banerMovileImgUrl: true
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
    editDate: true,
    banerMovileImgUrl: true,
})

export const responseGetRafflesSchema = ResponsePaginationSchema.pick({
    currentPage: true,
    total: true,
    totalPages: true,
}).extend({
    raffles: z.array(raffleSchema)
})

export const responseRaffleSharedSchema = z.object({
    raffle: raffleSchema
})

export const URLSchema = z.object({
    url: z.string()
})


export type Raffle = z.infer<typeof raffleSchema>
export type CreateRaffleForm = z.infer<typeof createRaffleSchema>
export type UpdateRaffleForm = z.infer<typeof updateRaffleSchema>

// PAYMENTS
export const paymentMethodEnum = z.enum([
    'Efectivo', 
    'Pago móvil',
    'Transferencia VES', 
    'Nequi',
    'Bancolombia', 
    'Bancolombia internacional', 
    'Zelle',
    'Transferencia EEUU',
    'Panamá', 
    'Pesos chilenos (Rut)',
    'PayPal',
    'Binance', 
    'Western', 
    'Otros',
    'Apartado',
]);

export const payNumbersSchema = z.object({
    raffleNumbersIds: z.array(z.number()),
    // identificationType: z.enum(['CC', 'TI', 'CE']),
    // identificationNumber: z.string(),
    firstName: z.string(),
    lastName: z.string(),
    phone: z.string(),
    address: z.string(),
    paymentMethod: paymentMethodEnum
})

export const payNumberSchema = payNumbersSchema.pick({
    // identificationType: true,
    // identificationNumber: true,
    firstName: true,
    lastName: true,
    phone: true,
    address: true,
    paymentMethod: true
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
    isValid: z.boolean(),
    user: userVendedor,
    paymentMethod: paymentMethodEnum.nullish()
});

export const RaffleNumberSchema = z.object({
    id: z.number(),
    number: z.number(),
    reservedDate: z.string().nullable(), 
    status: z.enum(statusRaffleNumbersEnum),
    // identificationType: z.enum(identificationTypeEnum).nullable(),
    // identificationNumber: z.string().nullable(),
    firstName:  z.string().nullable(),
    lastName:  z.string().nullable(),
    phone: z.string().nullable(),
    address: z.string().nullable(),
    paymentAmount: z.string(),
    paymentDue: z.string(),    
    raffleId: z.number(),
    createdAt: z.string(), 
    updatedAt: z.string(), 
    payments: z.array(PaymentSchema),
});

export const raffleNumberSharedSchema = RaffleNumberSchema.pick({
    id: true,
    number: true,
    reservedDate: true, 
    status: true,
    // identificationType: z.enum(identificationTypeEnum).nullable(),
    // identificationNumber: z.string().nullable(),
    firstName: true,
    lastName:  true,
    phone: true,
    address: true,
    paymentAmount: true,
    paymentDue: true,  
    raffleId: true,
    createdAt: true, 
    updatedAt: true,
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
    // identificationType: z.enum(identificationTypeEnum).nullable(),
    // identificationNumber: z.string().nullable(),
    firstName:  z.string().nullable(),
    lastName:  z.string().nullable(),
    phone: z.string().nullable(),
    address: z.string().nullable(),
    paymentAmount: z.string(),
    paymentDue: z.string(),
    // createdAt: z.string(), 
    // updatedAt: z.string(), 
    // raffleId: z.number(),
}).extend({
    payments: z.array(PaymentSchema.pick({
            id: true,
            amount: true, 
            paidAt: true, 
            riffleNumberId: true,
            userId: true,
            createdAt: true, 
            updatedAt: true,
            isValid: true,
            user: true,
    })),
})

export const updateRaffleNumberCustomer = payNumbersSchema.pick({
    address: true,
    phone: true
})

export const responseGetNumbersByUser = ResponsePaginationSchema.extend({
    numbersPayments: z.array(RaffleNumberSchema)
})


export const raffleNumbersSchema = z.object({
    id: z.number(),
    number: z.number(),
    status: z.enum(statusRaffleNumbersEnum),
    payments: z.array(PaymentSchema.pick({
        userId: true
    }))
})
export const responseRaffleNumbersSchema = ResponsePaginationSchema.pick({
    currentPage: true,
    total: true,
    totalPages: true,
}).extend({
    raffleNumbers: z.array(raffleNumbersSchema)
})

export type RaffleNumbersResponseType = z.infer<typeof responseRaffleNumbersSchema>

export const raffleNumberExelSchema = raffleNumbersSchema.pick({
    id: true,
    number: true,
    status: true,
}).extend({
    reservedDate: z.string().nullable(),
    // identificationType: z.enum(identificationTypeEnum).nullable(),
    // identificationNumber: z.string().nullable(),
    firstName: z.string().nullable(),
    lastName: z.string().nullable(),
    phone: z.string().nullable(),
    address: z.string().nullable(),
    paymentAmount: z.string(),
    paymentDue: z.string(),
    payments: z.array(z.object({
        amount: z.string(),
        isValid: z.boolean(),
        user: z.object({
            firstName: z.string(),
            lastName: z.string(),
            identificationNumber: z.string()
        })
    }))
})
export const responseRaffleNumbersExelSchema = ResponsePaginationSchema.pick({
    currentPage: true,
    total: true,
    totalPages: true,
}).extend({
    raffleNumbers: z.array(raffleNumberExelSchema)
})

export const raffleNumbersExelFilterSchema = z.object({
    userName: z.string(),
    userLastName: z.string(),
    rafflePrice: z.string(),
    count: z.number(),
    raffleNumbers: z.array(raffleNumbersSchema.pick({
        id: true,
        number: true,
        status: true,
    }).extend({
        paymentAmount: z.string(),
        paymentDue: z.string(),
        firstName: z.string().nullable(),
        lastName: z.string().nullable(),
        phone: z.string().nullable(),
    })),
})



export type RaffleNumberPayments = z.infer<typeof PaymentSchema>
export type RaffleNumberUpdateForm = z.infer<typeof updateRaffleNumberCustomer>
export type RaffleNumber = z.infer<typeof RaffleNumberSchema> //
export type RaffleNumbersPayments = z.infer<typeof RafflePayResponseSchema>
export type PayNumbersForm = z.infer<typeof payNumbersSchema> & { amount?: number}
export type PayNumberForm = z.infer<typeof payNumberSchema>

export const totalSchema = z.object({
    totalRecaudado: z.number(),
    totalVendido: z.number(),
    TotalCobrar: z.number(),
    TotalCancelPays: z.number(),
})
export const totalByVendedorSchema = z.object({
    totalRecaudado: z.number(),
    totalCancelado: z.number(),
    totalRaffleNumber: z.array(z.number()),
    totalCobrar: z.number(),
})

export const expensesSchema = z.object({
    id: z.number(),
    name: z.string(),
    amount: z.string(),
    createdAt: z.string(),
})

export const expensesWithUserSchema = expensesSchema.extend({
    user: z.object({
        id: z.number(),
        firstName: z.string(),
        lastName: z.string(),
        identificationNumber: z.string()
    })
})



export const expenseFormSchema = expensesSchema.pick({
    name: true,
    amount: true
})

export const responseExpensesSchema = ResponsePaginationSchema.pick({
    currentPage: true,
    total: true,
    totalPages: true,
}).extend({
    expenses: z.array(expensesSchema)
})

export const responseExpensesWithUserSchema = ResponsePaginationSchema.pick({
    currentPage: true,
    total: true,
    totalPages: true,
}).extend({
    expenses: z.array(expensesWithUserSchema)
})



export const responseExpensesTotal = z.object({
    total: z.number()
})


export type ExpenseFormType = z.infer<typeof expenseFormSchema>
export type ExpensesType = z.infer<typeof expensesSchema>
export type ExpensesWithUserType = z.infer<typeof expensesWithUserSchema>
export type ExpenseResponseType = z.infer<typeof responseExpensesSchema>
export type ExpensesTotal = {
    total: number
}

export const awardsShema = z.object({
    id: z.number(),
    name: z.string(),
    playDate: z.string()
})

export const responseAwards = z.array(awardsShema)

export const AwardFormSchema = awardsShema.pick({
    name: true,
}).extend({
    playDate: z
        .string()
        .nullable()
        .transform((date) => (date ? dayjs(date) : null)),
})
export type AwardFormType = z.infer<typeof AwardFormSchema>
export type AwardsResponseType = z.infer<typeof responseAwards>
export type AwardType = z.infer<typeof awardsShema>

export const responseRafflesDetailsNumbers = z.array(raffleSchema.pick({
    id: true,
    name: true,
}).extend({
    raffleNumbers: z.array(raffleNumberSchema.pick({
        id: true,
        number: true, 
        paymentAmount: true
    }))
}))

