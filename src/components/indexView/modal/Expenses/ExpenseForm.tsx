import { TextField, Box } from "@mui/material";
import { FieldErrors, UseFormRegister } from "react-hook-form";
import { ExpenseFormType } from "../../../../types";

type ExpenseFormProps = {
    register: UseFormRegister<ExpenseFormType>;
    errors: FieldErrors<ExpenseFormType>;
};

function ExpenseForm({ register, errors }: ExpenseFormProps) {
    return (
        <Box display="flex" flexDirection="column" gap={2}>

            <TextField
                label="Nombre del Gasto"
                variant="outlined"
                fullWidth
                {...register("name", { required: "El nombre del gasto es obligatorio" })}
                error={!!errors.name}
                helperText={errors.name?.message}
            />

            <TextField
                label="Valor del Gasto"
                variant="outlined"
                type="number"
                fullWidth
                {...register("amount", {
                    required: "El valor del gasto es obligatorio",
                    valueAsNumber: true,
                    min: { value: 0, message: "El valor debe ser mayor o igual a 0" },
                })}
                error={!!errors.amount}
                helperText={errors.amount?.message}
            />
        </Box>
    );
}

export default ExpenseForm;
