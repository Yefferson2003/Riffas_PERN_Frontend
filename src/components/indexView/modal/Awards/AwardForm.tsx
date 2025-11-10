import { FieldErrors, UseFormRegister, UseFormSetValue, UseFormWatch } from "react-hook-form"
import { AwardFormType } from "../../../../types"
import { LocalizationProvider, MobileDateTimePicker } from "@mui/x-date-pickers"
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs"
import { DemoContainer } from "@mui/x-date-pickers/internals/demo"
import { TextField } from "@mui/material"

type AwardFormProps = {
    register: UseFormRegister<AwardFormType>
    errors: FieldErrors<AwardFormType>
    watch: UseFormWatch<AwardFormType>
    setValue: UseFormSetValue<AwardFormType>
    raffleColor?: string
}

function AwardForm( {errors, register, watch, setValue, raffleColor = '#1976d2'} : AwardFormProps) {

    const playDate = watch('playDate')

    return (
        <>

            <TextField
                label="Nombre del Premio"
                variant="outlined"
                fullWidth
                {...register("name", { required: "El nombre del premio es obligatorio" })}
                error={!!errors.name}
                helperText={errors.name?.message}
                sx={{
                    '& .MuiOutlinedInput-root': {
                        '&.Mui-focused fieldset': {
                            borderColor: raffleColor,
                        },
                    },
                    '& .MuiInputLabel-root.Mui-focused': {
                        color: raffleColor,
                    },
                }}
            />

            <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DemoContainer components={['MobileDateTimePicker']}>
                        <MobileDateTimePicker label="Fecha de Juego" 
                            value={playDate}
                            onChange={(date) => setValue('playDate', date, { shouldValidate: true })}
                            format="DD/MM/YYYY HH:mm"
                        />
                </DemoContainer>
            </LocalizationProvider>
        </>
    )
}

export default AwardForm
