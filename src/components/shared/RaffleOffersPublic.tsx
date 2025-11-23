import { getRaffleOffers } from '../../api/raffleOfferApi';
import { useQuery } from '@tanstack/react-query';
import { formatCurrencyCOP } from '../../utils';
import { Box, Typography, Chip, Stack } from '@mui/material';

export default function RaffleOffersPublic({ raffleId, raffleColor }: { raffleId: string | number, raffleColor?: string }) {
    const { data: offers, isLoading, isError } = useQuery({
        queryKey: ['raffleOffersPublic', raffleId],
        queryFn: () => getRaffleOffers(raffleId),
        enabled: !!raffleId
    });

    if (isLoading) return <Typography color="text.secondary">Cargando ofertas...</Typography>;
    if (isError || !offers || offers.length === 0) return null;

    return (
        <Box sx={{ mt: 1, mb: 1, px: { xs: 0.5, sm: 1.5 } }}>
            <Typography
                variant="subtitle2"
                sx={{
                    fontWeight: 700,
                    color: raffleColor || 'primary.main',
                    mb: 0.5,
                    textAlign: 'center',
                    fontSize: { xs: '0.95rem', sm: '1.05rem' },
                    lineHeight: 1.2,
                }}
            >
                ¡Aprovecha ofertas por cantidad!
            </Typography>
            <Stack direction="column" spacing={0.5} alignItems="center">
                {offers.map((offer) => (
                    <Chip
                        key={offer.id}
                        label={
                            <span style={{ fontSize: 'clamp(0.85rem, 2vw, 1rem)', fontWeight: 500 }}>
                                Por <b>{offer.minQuantity}</b> boletas en adelante, cada una a <b>{formatCurrencyCOP(+offer.discountedPrice)}</b>
                            </span>
                        }
                        sx={{
                            bgcolor: raffleColor || 'primary.light',
                            color: 'white',
                            fontWeight: 600,
                            px: 1.5,
                            py: 0.5,
                            boxShadow: `0 2px 8px ${raffleColor || '#1976d2'}22`,
                        }}
                    />
                ))}
            </Stack>
        </Box>
    );
}
