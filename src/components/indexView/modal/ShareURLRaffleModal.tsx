import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import { Box, Button, IconButton, Modal, TextField, Tooltip } from "@mui/material";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { createURLRaffle } from "../../../api/raffleApi";
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

function ShareURLRaffleModal() {
    const navigate = useNavigate();
    const { raffleId } = useParams<{ raffleId: string }>()

    const [URL, setURL] = useState<string>("");

    const queryParams = new URLSearchParams(location.search);
    const modalShareURLRaffle = queryParams.get("viewShareURLRaffle");
    const show = modalShareURLRaffle === "true";

    const { isPending, mutate } = useMutation({
        mutationFn: createURLRaffle,
        onError(error) {
            toast.error(error.message);
        },
        onSuccess(data) {
            toast.success("URL creada");
            setURL(data?.url || "");
        },
    });

    const handleCopy = () => {
        if (URL) {
            navigator.clipboard.writeText(URL);
            toast.info("URL copiada al portapapeles");
        }
    };

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
                    <h2 style={{ marginBottom: "20px", fontSize: "20px", fontWeight: "bold" }}>
                        Compartir enlace de rifa
                    </h2>

                    <Button
                        variant="contained"
                        color="primary"
                        onClick={() => mutate({raffleId: raffleId || '0'})}
                        disabled={isPending}
                        sx={{ mb: 3 }}
                    >
                        {isPending ? "Generando..." : "Generar URL"}
                    </Button>

                    {URL && (
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1, width: '100%'}}>
                            <TextField
                                value={URL}
                                fullWidth
                                size="small"
                            />
                            <Tooltip title="Copiar">
                                <IconButton onClick={handleCopy} color="primary">
                                    <ContentCopyIcon />
                                </IconButton>
                            </Tooltip>
                        </Box>
                    )}
                </div>

                
            </Box>
        </Modal>
    );
}

export default ShareURLRaffleModal;
