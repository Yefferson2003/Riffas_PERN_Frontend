import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getRaffles } from "../../../api/raffleApi";
import { Box, MenuItem, Select, Typography, Pagination, LinearProgress } from "@mui/material";
import { RaffleOptionType } from "./BuyNumbersForClientModal";

// Props para integración con react-hook-form
interface RaffleSelectProps {
    value: number | '';
    error?: boolean;
    onChange: (value: number, raffleObj?: RaffleOptionType | undefined) => void
    helperText?: string;
    show: boolean;
}

const PAGE_SIZE = 10;

export default function RaffleSelect({ value, onChange, error, helperText, show }: RaffleSelectProps) {
    const [page, setPage] = useState(1);
    const [raffles, setRaffles] = useState<RaffleOptionType[]>([]);
    const [totalPages, setTotalPages] = useState(1);

    const { data, isFetching } = useQuery({
        queryKey: ["raffles", page],
        queryFn: () => getRaffles({ page, limit: PAGE_SIZE }),
        enabled: show,
    });

    useEffect(() => {
        if (data) {
            setRaffles(
                data.raffles.map((r) => ({
                    id: r.id,
                    name: r.name,
                    identification: r.nitResponsable,
                    totalNumbers: r.totalNumbers || 0,
                }))
            );
            

            if (data.total) {
                setTotalPages(Math.ceil(data.total / PAGE_SIZE));
            } else {
                setTotalPages(data.raffles.length === PAGE_SIZE ? page + 1 : page);
            }
        }
    }, [data, page]);

    const handleChangePage = (_: React.ChangeEvent<unknown>, value: number) => {
        if (!isFetching) {
            setPage(value);
        }
    };

    if (!isFetching && raffles.length === 0) {
        return (
            <Box sx={{ my: 4, textAlign: 'center', p: 3, borderRadius: 3, bgcolor: 'background.default', boxShadow: 2 }}>
                <Typography variant="h6" color="primary" sx={{ fontWeight: 700, mb: 1 }}>
                    No hay rifas disponibles
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    Actualmente no existen rifas para seleccionar.
                </Typography>
                <Typography variant="caption" color="text.disabled">
                    Por favor, contacta al administrador o crea una nueva rifa para continuar.
                </Typography>
            </Box>
        );
    }

    return (
        <Box>
            <Typography variant="subtitle1" sx={{ mb: 1 }}>
                Rifa
            </Typography>
            <Select
                value={value}
                onChange={(e) => {
                    const val = Number(e.target.value);
                    const obj = raffles.find(r => r && r.id === val);
                    onChange(val, obj);
                }}
                fullWidth
                error={error}
                displayEmpty
                defaultValue={0}
                MenuProps={{ PaperProps: { style: { maxHeight: 350 } } }}
            >
                <MenuItem value="0">
                    <em>Selecciona una rifa...</em>
                </MenuItem>
                {raffles
                    .filter((raffle) => raffle !== null)
                    .map((raffle) => (
                        <MenuItem key={raffle!.id} value={raffle!.id}>
                            <Box>
                                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                                    {raffle!.name} (ID: {raffle!.identification})
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                    Números: {raffle!.totalNumbers}
                                </Typography>
                            </Box>
                        </MenuItem>
                    ))}
            </Select>
            {helperText && (
                <Typography variant="caption" color="error" sx={{ ml: 1 }}>
                    {helperText}
                </Typography>
            )}
            {/* Loader mejorado */}
            {isFetching && (
                <Box sx={{ mt: 2 }}>
                    <LinearProgress color="primary" />
                </Box>
            )}
            {/* Paginación MUI debajo del select, solo en el modal */}
            {show && totalPages > 1 && (
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mt: 2 }}>
                    <Pagination
                        count={totalPages}
                        page={page}
                        onChange={handleChangePage}
                        color="primary"
                        shape="rounded"
                        size="medium"
                    />
                </Box>
            )}
        </Box>
    );
}
