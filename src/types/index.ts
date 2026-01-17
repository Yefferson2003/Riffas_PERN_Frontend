import dayjs from "dayjs";
import {  z } from "zod";
// AUTH & USERS & PAGINATION

const rolNameEnum = ['admin', 'vendedor', 'responsable'] as const
export const statusRaffleNumbersEnum = ['available', 'sold', 'pending', 'apartado'] as const
// const identificationTypeEnum = ['CC', 'TI', 'CE'] as const

export const statusRaffleNumbers = z.enum(statusRaffleNumbersEnum)
export type StatusRaffleNumbersType = z.infer<typeof statusRaffleNumbers>

const ResponsePaginationSchema = z.object({
    total: z.number(),
    totalPages: z.number(),
    currentPage: z.number(),
})

export const ClientSchema = z.object({
    id: z.number(),
    firstName:  z.string().nullable(),
    lastName:  z.string().nullable(),
    phone: z.string().nullable(),
    address: z.string().nullable(),
})

export const responseClientSchema = ClientSchema.pick({
    id: true,
    firstName: true,
    lastName: true,
    phone: true,
    address: true,
})


export type ClientType = z.infer<typeof ClientSchema>
export type ClientFormType = Pick<ClientType, 'firstName' | 'lastName' | 'phone' | 'address'>

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
    imgIconoUrl: z.string().nullable().optional(),
    color: z.string().nullable().optional(),
    contactRifero: z.string().nullable().optional(),
})

export const raffleSchemaShared = raffleSchema.extend({
    totalNumbers: z.number().min(0).optional(),
    numbersByStatus: z.object({
        available: z.number(),
        sold: z.number(),
        pending: z.number(),
        apartado: z.number()
    }).optional()
})

export const raffleByIdSchema = raffleSchema.extend({
    userRiffle: z.array(z.object({
        userId: z.number()
    })).nullable(),
    totalNumbers: z.number().min(0).optional(),
    numbersByStatus: z.object({
        available: z.number(),
        sold: z.number(),
        pending: z.number(),
        apartado: z.number()
    }).optional(),
    // color: z.string().nullable()
})

export const createRaffleSchema = raffleSchema.pick({
    name: true,
    description: true,
    price: true,
    banerImgUrl: true,
    nitResponsable: true,
    nameResponsable: true,
    banerMovileImgUrl: true,
    imgIconoUrl: true,
    color: true,
    contactRifero: true
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
    // color: z.string().optional().default('#1976d2'),
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
    color: true,
    contactRifero: true,
    imgIconoUrl: true
})

export const responseGetRafflesSchema = ResponsePaginationSchema.pick({
    currentPage: true,
    total: true,
    totalPages: true,
}).extend({
    raffles: z.array(raffleSchema.extend({
        totalNumbers: z.number().min(0).optional(),
    }))
})

export const responseRaffleSharedSchema = z.object({
    raffle: raffleSchema
})



export const URLSchema = z.object({
    id: z.number(),
    uuid: z.string(),
    token: z.string(),
    expiresAt: z.string(),
    url: z.string().nullable(),
    raffleId: z.number().nullable(),
})

export const responseURLsSchema= z.object({
    urls: z.array(URLSchema)
})

export const responseURLSchema = URLSchema.pick({
    url: true
})

export type Raffle = z.infer<typeof raffleSchema>
export type RaffleSharedType = z.infer<typeof raffleSchemaShared>
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

export type PaymentMethodType = z.infer<typeof paymentMethodEnum>


// PAYMENT METHODS
export const payMethodeSchema = z.object({
    id: z.number(),
    name: z.string(),
    icon: z.string().nullable(),
    isActive: z.boolean(),
    // createdAt: z.string(),
    // updatedAt: z.string()
})

export const payMethodesSchema = z.array(payMethodeSchema)

export const createPayMethodSchema = z.object({
    name: z.string(),
    // isActive: z.boolean().optional().default(true)
})

export const updatePayMethodSchema = z.object({
    name: z.string().min(1, 'El nombre es obligatorio').optional(),
})

export const rafflePayMethodeSchema = z.object({
    id: z.number(),
    raffleId: z.number(),
    payMethodeId: z.number(),
    accountNumber: z.string().nullable(),
    accountHolder: z.string().nullable(),
    // type: z.enum(['bank_transfer', 'digital_wallet', 'cash', 'card', 'crypto']).nullable(),
    bankName: z.string().nullable(),
    // instructions: z.string().nullable(),
    // fee: z.number().nullable(),
    // order: z.number(),
    isActive: z.boolean(),
    // createdAt: z.string(),
    // updatedAt: z.string(),
    payMethode: payMethodeSchema.pick({
        id: true,
        name: true,
        isActive: true,
        icon: true
    })
})


// Definición del esquema para los pagos
const userVendedor = z.object({
    firstName: z.string(),
    lastName: z.string(),
    identificationNumber: z.string()
}).nullable().optional()

const PaymentSchema = z.object({
    id: z.number(),
    amount: z.string(), 
    paidAt: z.string().nullable(), 
    riffleNumberId: z.number(),
    userId: z.number().nullable().optional(),
    createdAt: z.string(), 
    updatedAt: z.string(),
    isValid: z.boolean(),
    user: userVendedor,
    paymentMethodId: z.number().nullable().optional(),
    reference: z.string().nullable().optional(),
    rafflePayMethode: rafflePayMethodeSchema.pick({
            id: true,
            accountHolder: true,
            accountNumber: true,
            bankName: true,
        }).extend({
            payMethode: payMethodeSchema.pick({
                id: true,
                name: true,
                isActive: true
            })
        }).nullable().optional()
    // paymentMethod: paymentMethodEnum.nullish()
});

export const payNumbersSchema = z.object({
    raffleNumbersIds: z.array(z.number()),
    // identificationType: z.enum(['CC', 'TI', 'CE']),
    // identificationNumber: z.string(),
    firstName: z.string(),
    lastName: z.string(),
    phone: z.string(),
    address: z.string(),
    // paymentMethod: paymentMethodEnum
    paymentMethod: z.number()
}).merge(PaymentSchema.pick({
    reference: true
}))

export const payNumberSchema = payNumbersSchema.pick({
    // identificationType: true,
    // identificationNumber: true,
    firstName: true,
    lastName: true,
    phone: true,
    address: true,
    paymentMethod: true,
    reference: true
}).extend({
    amount: z.number()
})

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
    clienteId: z.number().nullable(),
    createdAt: z.string(), 
    updatedAt: z.string(), 
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
        reference: true
    }).extend({
        rafflePayMethode: rafflePayMethodeSchema.pick({
            id: true,
            accountHolder: true,
            accountNumber: true,
            bankName: true,
        }).extend({
            payMethode: payMethodeSchema.pick({
                id: true,
                name: true,
                isActive: true
            })
        }).nullable().optional()
    })),
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
    
export const RafflePayResponseSchema = z.array(RaffleNumberSchema) // PDF Data
    
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


export const raffleNumbersSchema = RaffleNumberSchema.pick({
    id: true,
    number: true,
    firstName: true,
    lastName: true,
    status: true,
}).extend({
    payments: z.array(PaymentSchema.pick({
        userId: true,
        isValid: true
    }))
})
export const responseRaffleNumbersSchema = ResponsePaginationSchema.pick({
    currentPage: true,
    total: true,
    totalPages: true,
}).extend({
    raffleNumbers: z.array(raffleNumbersSchema)
})

export const raffleNumberPendingSchema = RaffleNumberSchema.pick({
    id: true,
    number: true,
    paymentDue: true,
    paymentAmount: true,
    phone: true,
    address: true,
    firstName: true,
    lastName: true,
    status: true,
})

export const responseRaffleNumbersPendingSchema = z.array(raffleNumberPendingSchema)

//nuevo
export const raffleNumberSharedResponseSchema = RaffleNumberSchema.pick({
    id: true,
    number: true,
    status: true,
}).extend({
    payments: z.array(PaymentSchema.pick({
        userId: true
    }))
})

export const responseRaffleNumbersSchemaShared = ResponsePaginationSchema.pick({
    currentPage: true,
    total: true,
    totalPages: true,
}).extend({
    raffleNumbers: z.array(raffleNumberSharedResponseSchema)
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
        }).optional().nullable()
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
        payments: z.array(PaymentSchema.pick({
            id: true,
            amount: true,
            reference: true,
        }).extend({
            rafflePayMethode: rafflePayMethodeSchema.pick({
            id: true,
            accountHolder: true,
            accountNumber: true,
            bankName: true,
            }).extend({
                payMethode: payMethodeSchema.pick({
                    id: true,
                    name: true,
                    isActive: true
                })
            }).nullable().optional()
        }))
    })),
    
})



export type RaffleNumberPayments = z.infer<typeof PaymentSchema>
export type RaffleNumberUpdateForm = z.infer<typeof updateRaffleNumberCustomer>
export type RaffleNumber = z.infer<typeof RaffleNumberSchema> //
export type RaffleNumbersPayments = z.infer<typeof RafflePayResponseSchema> //PDF data
export type PayNumbersForm = z.infer<typeof payNumbersSchema> & { amount?: number}
export type PayNumberForm = z.infer<typeof payNumberSchema>

export const payNumbersSharedSchema = payNumberSchema.extend({
    raffleNumbersIds: z.array(z.number())
})

export type PayNumbersSharedFormType = z.infer<typeof payNumbersSharedSchema>

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



export const rafflePayMethodeSchemaArray = z.array(rafflePayMethodeSchema)

export const assignPayMethodToRaffleSchema = z.object({
    payMethodeId: z.number(),
    accountNumber: z.string().optional(),
    accountHolder: z.string().optional(),
    // type: z.enum(['bank_transfer', 'digital_wallet', 'cash', 'card', 'crypto']).optional(),
    bankName: z.string().optional(),
    // instructions: z.string().optional(),
    // fee: z.number().min(0).max(100).optional().default(0),
    // order: z.number().min(0).optional().default(0)
})

// export const updateRafflePayMethodSchema = z.object({
//     accountNumber: z.string().optional(),
//     accountHolder: z.string().optional(),
//     type: z.enum(['bank_transfer', 'digital_wallet', 'cash', 'card', 'crypto']).optional(),
//     bankName: z.string().optional(),
//     instructions: z.string().optional(),
//     fee: z.number().min(0).max(100).optional(),
//     order: z.number().min(0).optional(),
//     isActive: z.boolean().optional()
// })

// TYPES
export type PayMethodeType = z.infer<typeof payMethodeSchema>
export type PayMethodFormType = z.infer<typeof createPayMethodSchema>
export type UpdatePayMethodFormType = z.infer<typeof updatePayMethodSchema>
export type RafflePayMethodeType = z.infer<typeof rafflePayMethodeSchema>
export type AssignPayMethodToRaffleFormType = z.infer<typeof assignPayMethodToRaffleSchema>
// export type UpdateRafflePayMethodFormType = z.infer<typeof updateRafflePayMethodSchema>

export const ramdomNumberSchema = z.object({
    id: z.number(),
    number: z.number(),
    status: z.enum(statusRaffleNumbersEnum)
})

export const RaffleOffersSchema = z.object({
    id: z.number(),
    minQuantity: z.number(),
    discountedPrice: z.string(),
    isActive: z.boolean()
})

export const responseRaffleOffersSchema = z.array(RaffleOffersSchema)

export type RaffleOfferType = z.infer<typeof RaffleOffersSchema>
export type RaffleOfferFormType = Pick<RaffleOfferType, 'minQuantity'> & { discountedPrice: number }

export const ResponseClientSchema = ClientSchema.pick({
        id: true,
        firstName: true,
        lastName: true,
        phone: true,
        address: true,
    }).extend({
        raffleNumbers: z.array(
            RaffleNumberSchema.pick({
                id: true,
                number: true,
                reservedDate: true,
                paymentAmount: true,
                paymentDue: true,
                status: true,
                clienteId: true,
                raffleId: true,
            }).extend({
                raffle: raffleSchema.pick({
                    id: true,
                    name: true,
                    playDate: true,
                    price: true,
                    color: true,
                }).extend({
                    totalNumbers: z.number().optional()
                }).optional(),
                payments: z.array(PaymentSchema.pick({
                    id: true,
                    amount: true,
                    createdAt: true,
                    paymentMethodId: true,
                }))
            })
        ).optional()
    })

export const responseClientsSchema = ResponsePaginationSchema.extend({
    clients: z.array(ResponseClientSchema)
})

export const ClientsListForExportSchema = z.object({
    clients: z.array(ResponseClientSchema)
})

export const ClientSelectSchema = ResponsePaginationSchema.extend({
    clients: z.array(ClientSchema.pick({
        id: true,
        firstName: true,
        lastName: true,
        phone: true,
        address: true,
    }))
})


const SharedRaffleNumberSchema = RaffleNumberSchema.pick({
    id: true,
    number: true,
    reservedDate: true,
    paymentAmount: true,
    paymentDue: true,
    status: true,
}).extend({
    raffle: raffleSchema.pick({
        id: true,
        name: true,
        playDate: true,
        price: true,
        color: true,
    }).extend({
        totalNumbers: z.number().optional()
    }),
    lastValidPayment: PaymentSchema.pick({
        id: true,
        amount: true,
        paidAt: true,
        createdAt: true,
        reference: true,
    }).extend({
        rafflePayMethode: rafflePayMethodeSchema.pick({
            id: true,
            accountHolder: true,
            accountNumber: true,
            bankName: true,
            isActive: true
        }).extend({
            payMethode: payMethodeSchema.pick({
                id: true,
                name: true,
                isActive: true
            })
        }).nullable().optional()
    }).nullable().optional()
});

export const ClientSharedLinkSchema = ClientSchema.pick({
    id: true,
    firstName: true,
    lastName: true,
    phone: true,
    address: true,
}).extend({
    raffleNumbers: z.array(SharedRaffleNumberSchema)
});

export const responseClientsSharedLinkSchema = ResponsePaginationSchema.extend({
    clients: z.array(ClientSharedLinkSchema)
});

export type ClientSelectType = z.infer<typeof ClientSelectSchema>;
export type ClientSharedLinkType = z.infer<typeof ClientSharedLinkSchema>;
export type SharedRaffleNumberType = z.infer<typeof SharedRaffleNumberSchema>;
export type ResponseClientType = z.infer<typeof ResponseClientSchema>;