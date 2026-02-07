import { z } from "zod";

export const MonedaSchema = z.object({
    id: z.number(),
    name: z.string().min(1, 'El nombre de la moneda es requerido'),
    symbol: z.string().min(1, 'El símbolo de la moneda es requerido'),
})

export const TasaSchema = z.object({
    id: z.number(),
    value: z.number().positive('El valor de la tasa debe ser un número positivo'),
    monedaId: z.number(),
    userResponsableId: z.number(),
    moneda: MonedaSchema,
})

export const responseMonedaSchema = z.object({
    monedas: z.array(MonedaSchema)
})

export const responseTasaSchema = z.object({
    tasas: z.array(TasaSchema.pick({
        id: true,
        moneda: true,
    }).extend({
        value: z.string()
    }))
})




export type MonedaType = z.infer<typeof MonedaSchema>;
export type TasaType = z.infer<typeof TasaSchema>;
export type TasaResponseType = z.infer<typeof responseTasaSchema>['tasas'][number];
