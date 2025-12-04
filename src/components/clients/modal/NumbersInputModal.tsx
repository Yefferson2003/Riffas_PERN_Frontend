import { useState } from "react";
import { Box, TextField, Button, Chip, Typography, Alert } from "@mui/material";

import { formatWithLeadingZeros } from '../../../utils';

interface NumbersInputModalProps {
    value: string[];
    onChange: (numbers: string[]) => void;
    error?: boolean;
    helperText?: string;
    totalNumbersRaffle?: number;
}

export default function NumbersInputModal({ value, onChange, error, helperText, totalNumbersRaffle }: NumbersInputModalProps) {
    const [input, setInput] = useState("");

    const handleAdd = () => {
        let numStr = input.trim();
        // Permite solo números
        if (!numStr || !/^\d+$/.test(numStr)) return;
        // Filtra ceros a la izquierda, pero si es todo ceros, guarda solo '0'
        if (/^0+$/.test(numStr)) {
            numStr = '0';
        } else {
            numStr = String(Number(numStr));
        }
        if (value.includes(numStr)) return;
        // Validar que el número esté dentro del rango permitido
        if (typeof totalNumbersRaffle === 'number') {
            const numValue = Number(numStr);
            if (isNaN(numValue) || numValue < 0 || numValue >= totalNumbersRaffle) {
                setInput("");
                return;
            }
        }
        onChange([...value, numStr]);
        setInput("");
    };

    const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            e.preventDefault();
            handleAdd();
        }
    };

    const handleDelete = (num: string) => {
        onChange(value.filter((n) => n !== num));
    };

    return (
        <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle1" sx={{ mb: 1 }}>
                Números
            </Typography>
            <Alert severity="info" sx={{ mb: 2 }}>
                Ingresa solo el número sin ceros a la izquierda. Ejemplo: para el número <b>070</b> solo escribe <b>70</b>. El sistema mostrará el formato correcto automáticamente. Si escribes <b>00</b> o <b>000</b> se guardará como <b>0</b>.
            </Alert>
            <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
                <TextField
                    label="Agregar número"
                    value={input}
                    onChange={(e) => setInput(e.target.value.replace(/[^0-9]/g, ""))}
                    onKeyDown={handleInputKeyDown}
                    error={error}
                    helperText={helperText}
                    sx={{ flex: 1 }}
                    disabled={!totalNumbersRaffle}
                />
                <Button
                    variant="contained"
                    color="primary"
                    onClick={handleAdd}
                    disabled={!totalNumbersRaffle || !input.trim() || !/^\d+$/.test(input.trim()) || value.includes(input.trim())}
                    sx={{ fontWeight: 700, borderRadius: 2, boxShadow: 2 }}
                >
                    Agregar
                </Button>
            </Box>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, minHeight: 40 }}>
                {value.length === 0 ? (
                    <Typography variant="body2" color="text.secondary" sx={{ fontStyle: "italic" }}>
                        No hay números agregados
                    </Typography>
                ) : (
                    value.map((num) => (
                        <Chip
                            key={num}
                            label={
                                totalNumbersRaffle && !isNaN(Number(num))
                                    ? formatWithLeadingZeros(Number(num), totalNumbersRaffle)
                                    : num
                            }
                            color="primary"
                            onDelete={() => handleDelete(num)}
                            sx={{ fontWeight: 700 }}
                        />
                    ))
                )}
            </Box>
        </Box>
    );
}
