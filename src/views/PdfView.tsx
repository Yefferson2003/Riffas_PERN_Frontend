

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
                    <Typography variant="h4" fontWeight={700} color="#1446A0" align="center" mb={3}>
                        Visualizador de PDF
                    </Typography>
                    {decodedUrl ? (
                        <>
                            <Box sx={{
                                width: '100%',
                                maxWidth: 600,
                                height: { xs: '60vh', sm: '70vh' },
                                mb: 3,
                                borderRadius: 2,
                                overflow: 'hidden',
                                border: '2px solid #1446A0',
                                background: '#F4F8FF',
                                boxShadow: '0 2px 8px rgba(20,70,160,0.08)'
                            }}>
                                <iframe
                                    src={decodedUrl}
                                    title="PDF"
                                    style={{ width: '100%', height: '100%', border: 'none' }}
                                    allow="autoplay"
                                />
                            </Box>
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
                                    '&:hover': {
                                        background: '#1E90FF',
                                    }
                                }}
                                onClick={handleDownload}
                            >
                                Descargar PDF
                            </Button>
                        </>
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
