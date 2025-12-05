

import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';

function PdfView() {
    const { pdfUrl } = useParams();
    const [decodedUrl, setDecodedUrl] = useState("");

    useEffect(() => {
        if (pdfUrl) {
            setDecodedUrl(decodeURIComponent(pdfUrl));
        }
    }, [pdfUrl]);

    const handleDownload = () => {
        if (!decodedUrl) return;
        const link = document.createElement("a");
        link.href = decodedUrl;
        link.download = "recibo.pdf";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <Box sx={{
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #1446A0 0%, #1E90FF 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            py: 4
        }}>
            <Container maxWidth="md">
                <Paper elevation={6} sx={{
                    borderRadius: 4,
                    p: { xs: 2, sm: 4 },
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    boxShadow: '0 4px 24px rgba(20,70,160,0.12)'
                }}>
                    <Typography variant="h4" fontWeight={700} color="#1446A0" align="center" mb={2}>
                        ¡Gracias por tu compra!
                    </Typography>
                    <Typography variant="h6" color="#1E90FF" align="center" mb={2}>
                        Tu recibo está listo para descargar
                    </Typography>
                    <Typography color="#1446A0" align="center" fontWeight={500} fontSize="1.1rem" mb={3}>
                        Te deseamos mucha suerte en la rifa 🍀<br />
                        Si tienes dudas, contáctanos.<br />
                        <span style={{fontWeight:700}}>¡Guarda tu recibo para cualquier reclamo!</span>
                    </Typography>
                    {decodedUrl ? (
                        <Button
                            variant="contained"
                            size="large"
                            sx={{
                                background: 'linear-gradient(90deg, #1446A0 60%, #1E90FF 100%)',
                                color: '#fff',
                                fontWeight: 600,
                                fontSize: '1.1rem',
                                borderRadius: 2,
                                boxShadow: '0 2px 8px rgba(20,70,160,0.10)',
                                px: 4,
                                py: 1.5,
                                mb: 2,
                                '&:hover': {
                                    background: '#1E90FF',
                                }
                            }}
                            onClick={handleDownload}
                        >
                            Descargar Recibo PDF
                        </Button>
                    ) : (
                        <Typography color="#1446A0" align="center" fontWeight={500} fontSize="1.1rem">
                            No se encontró el PDF o la URL es inválida.
                        </Typography>
                    )}
                </Paper>
            </Container>
        </Box>
    );
}

export default PdfView
