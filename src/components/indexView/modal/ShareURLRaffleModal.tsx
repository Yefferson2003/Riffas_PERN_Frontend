import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import { Box, Button, IconButton, Modal, TextField, Tooltip, Select, MenuItem, InputLabel, FormControl, Alert } from "@mui/material";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { createURLRaffle, deleteURLRaffle, getURLsRaffle } from "../../../api/raffleApi";
import ButtonCloseModal from "../../ButtonCloseModal";

const style = {
    position: "absolute" as const,
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: 550,
    maxWidth: "100vw",
    bgcolor: "#f1f5f9",
    border: "2px solid #000",
    boxShadow: 24,
    p: 4,
    maxHeight: "95vh",
    overflowY: "auto",
    borderRadius: "12px",
};

type ShareURLRaffleModalProps = {
    raffleColor: string;
};

function ShareURLRaffleModal({ raffleColor }: ShareURLRaffleModalProps) {
    const navigate = useNavigate();
    const { raffleId } = useParams<{ raffleId: string }>()

    const [URL, setURL] = useState<string>("");
    // Opciones de expiración en días
    const expirationOptions = [
        { label: '1 mes', value: 30 },
        { label: '3 meses', value: 90 },
        { label: '4 meses', value: 120 },
        { label: '6 meses', value: 180 },
        { label: '9 meses', value: 270 },
        { label: '1 año', value: 365 },
    ];
    const [expirationDays, setExpirationDays] = useState<number>(120); // 4 meses por defecto
    
    // Para copiar URLs individuales
    const handleCopyURL = (url: string) => {
        if (url) {
            navigator.clipboard.writeText(url);
            toast.info("URL copiada al portapapeles");
        }
    };

    const queryParams = new URLSearchParams(location.search);
    const modalShareURLRaffle = queryParams.get("viewShareURLRaffle");
    const show = modalShareURLRaffle === "true";

    const {data, isLoading, isError, refetch} = useQuery({
        queryKey: ['URLsRaffle', raffleId],
        queryFn: () => getURLsRaffle({ raffleId: raffleId || '0' }),
        enabled: show && Boolean(raffleId),
    });

    // Redirigir a 404 si hay error
    useEffect(() => {
        if (isError) {
            navigate('/404', { replace: true });
        }
    }, [isError, navigate]);

    const { isPending, mutate } = useMutation({
        mutationFn: createURLRaffle,
        onError(error) {
            toast.error(error.message);
        },
        onSuccess(data) {
            toast.success("URL creada");
            refetch();
            setURL(data?.url || "");
        },
    });
    
    const { isPending: isDeleting, mutate: deleteMutate } = useMutation({
        mutationFn: deleteURLRaffle,
        onError(error) {
            toast.error(error.message);
        },
        onSuccess() {
            toast.success("URL eliminada");
            refetch();
        },
    });

    const handleCreateRaffleURL = () => {
        mutate({raffleId: raffleId || '0', expirationDays});
    }

    const handleDeleteRaffleURL = (urlId: number) => {
        if (window.confirm('¿Estás seguro de que deseas eliminar este enlace?')) {
            deleteMutate({ raffleId: raffleId || '0', urlId });
        }
    }


    return (
        <Modal
            open={show}
            onClose={() => {
                navigate(location.pathname, { replace: true });
            }}
            aria-labelledby="modal-modal-title"
            aria-describedby="modal-modal-description"
        >
            <Box sx={style}>
                <ButtonCloseModal />

                <div className="flex flex-col items-center">
                    <h2 
                        style={{ 
                            marginBottom: "20px", 
                            fontSize: "20px", 
                            fontWeight: "bold",
                            color: raffleColor
                        }}
                    >
                        Compartir enlace de rifa
                    </h2>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3, width: '100%', flexWrap: 'wrap', justifyContent: 'center' }}>
                        <FormControl size="small" sx={{ minWidth: 120 }}>
                            <InputLabel id="expiration-select-label" sx={{ color: raffleColor }}>
                                Expiración
                            </InputLabel>
                            <Select
                                labelId="expiration-select-label"
                                id="expiration-select"
                                value={expirationDays}
                                label="Expiración"
                                onChange={e => setExpirationDays(Number(e.target.value))}
                                sx={{
                                    color: raffleColor,
                                    '& .MuiOutlinedInput-notchedOutline': {
                                        borderColor: raffleColor,
                                    },
                                    '&:hover .MuiOutlinedInput-notchedOutline': {
                                        borderColor: raffleColor,
                                    },
                                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                        borderColor: raffleColor,
                                    },
                                }}
                                MenuProps={{
                                    PaperProps: {
                                        sx: {
                                            color: raffleColor,
                                        },
                                    },
                                }}
                            >
                                {expirationOptions.map(opt => (
                                    <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        <Button
                            variant="contained"
                            onClick={handleCreateRaffleURL}
                            disabled={isPending}
                            sx={{ 
                                backgroundColor: raffleColor,
                                '&:hover': {
                                    backgroundColor: raffleColor,
                                    opacity: 0.9,
                                },
                            }}
                        >
                            {isPending ? "Generando..." : "Generar URL"}
                        </Button>
                    </Box>

                    {/* Aviso sobre expiración de enlaces */}
                    <Alert severity="info" sx={{ mb: 2, width: '100%', backgroundColor: '#e0f2fe', color: '#0369a1', borderColor: '#bae6fd' }}>
                        <strong>Importante:</strong> Después de la fecha de expiración, los enlaces generados quedarán automáticamente deshabilitados y no podrán ser utilizados para acceder a la rifa.
                    </Alert>

                    {/* Mostrar la URL recién generada */}
                    {URL && (
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1, width: '100%', mb: 2 }}>
                            <TextField
                                value={URL}
                                fullWidth
                                size="small"
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        '&:hover fieldset': {
                                            borderColor: raffleColor,
                                        },
                                        '&.Mui-focused fieldset': {
                                            borderColor: raffleColor,
                                        },
                                    },
                                }}
                            />
                            <Tooltip title="Copiar">
                                <IconButton 
                                    onClick={() => handleCopyURL(URL)}
                                    sx={{ 
                                        color: raffleColor,
                                        '&:hover': {
                                            backgroundColor: `${raffleColor}14`,
                                        },
                                    }}
                                >
                                    <ContentCopyIcon />
                                </IconButton>
                            </Tooltip>
                        </Box>
                    )}

                    {/* Skeleton de carga */}
                    {isLoading && (
                        <div style={{ width: '100%', marginTop: 8 }}>
                            <h3 style={{ fontWeight: 'bold', marginBottom: 8, color: raffleColor, fontSize: 16 }}>Enlaces generados previamente</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                                {[1, 2].map((i) => (
                                    <Box key={i} sx={{ display: 'grid', gridTemplateColumns: '1fr', gap: 0.5, width: '100%', p: { xs: 1, sm: 2 }, borderRadius: 2, backgroundColor: { xs: '#f8fafc', sm: '#f8fafc' } }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                                            <Box sx={{ width: '100%', height: 40, bgcolor: '#e2e8f0', borderRadius: 1, animation: 'pulse 1.5s infinite' }} />
                                            <Box sx={{ width: 32, height: 32, bgcolor: '#e2e8f0', borderRadius: '50%', ml: 1, animation: 'pulse 1.5s infinite' }} />
                                        </Box>
                                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 1 }}>
                                            <Box sx={{ width: 120, height: 18, bgcolor: '#e2e8f0', borderRadius: 1, animation: 'pulse 1.5s infinite' }} />
                                            <Box sx={{ width: 60, height: 28, bgcolor: '#e2e8f0', borderRadius: 1, ml: 2, animation: 'pulse 1.5s infinite' }} />
                                        </Box>
                                    </Box>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Mostrar URLs existentes si hay */}
                    {!isLoading && data?.urls && Array.isArray(data.urls) && data.urls.length > 0 && (
                        <div style={{ width: '100%', marginTop: 8 }}>
                            <h3 style={{ fontWeight: 'bold', marginBottom: 8, color: raffleColor, fontSize: 16 }}>Enlaces generados previamente</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                                {data.urls.map((item) => (
                                    item.url && (
                                        <Box
                                            key={item.id}
                                            sx={{
                                                display: 'grid',
                                                gridTemplateColumns: '1fr',
                                                gap: 0.5,
                                                width: '100%',
                                                p: { xs: 1, sm: 2 },
                                                borderRadius: 2,
                                                backgroundColor: { xs: '#f8fafc', sm: '#f8fafc' },
                                            }}
                                        >
                                            {/* Fila 1: URL + copiar */}
                                            <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                                                <TextField
                                                    value={item.url}
                                                    fullWidth
                                                    size="small"
                                                    sx={{
                                                        '& .MuiOutlinedInput-root': {
                                                            '&:hover fieldset': {
                                                                borderColor: raffleColor,
                                                            },
                                                            '&.Mui-focused fieldset': {
                                                                borderColor: raffleColor,
                                                            },
                                                        },
                                                    }}
                                                    InputProps={{
                                                        endAdornment: (
                                                            <Tooltip title="Copiar">
                                                                <IconButton
                                                                    onClick={() => handleCopyURL(item.url || "")}
                                                                    sx={{
                                                                        color: raffleColor,
                                                                        '&:hover': {
                                                                            backgroundColor: `${raffleColor}14`,
                                                                        },
                                                                    }}
                                                                >
                                                                    <ContentCopyIcon />
                                                                </IconButton>
                                                            </Tooltip>
                                                        ),
                                                    }}
                                                />
                                            </Box>
                                            {/* Fila 2: Expira + Eliminar */}
                                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 1 }}>
                                                <span
                                                    style={{
                                                        fontSize: 13,
                                                        color: '#64748b',
                                                        whiteSpace: 'nowrap',
                                                    }}
                                                >
                                                    Expira: {item.expiresAt ? new Date(item.expiresAt).toLocaleString() : 'N/A'}
                                                </span>
                                                <Button
                                                    variant="outlined"
                                                    color="error"
                                                    size="small"
                                                    disabled={isDeleting}
                                                    sx={{ minWidth: 32, px: 1, fontSize: 12, ml: 2 }}
                                                    onClick={() => handleDeleteRaffleURL(item.id)}
                                                >
                                                    Eliminar
                                                </Button>
                                            </Box>
                                        </Box>
                                    )
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </Box>
        </Modal>
    );
}

export default ShareURLRaffleModal;
