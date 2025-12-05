import { useParams } from 'react-router-dom';
import { Box, Typography, Button } from '@mui/material';
function PdfView() {
    const { pdfUrl } = useParams();

    // La URL vendrá codificada, así que la decodificamos
    const decodedPdfUrl = pdfUrl ? decodeURIComponent(pdfUrl) : null;

    return (
        <>
                
            <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', bgcolor: '#f5f5f5', p: 3 }}>
                <Typography variant="h4" sx={{ mb: 2, fontWeight: 700, color: 'primary.main' }}>
                    Visualizador de PDF
                </Typography>

                {decodedPdfUrl ? (
                    <Box sx={{ width: '100%', maxWidth: 600, boxShadow: 3, bgcolor: 'white', borderRadius: 2, p: 2, mb: 2 }}>
                        <iframe
                            src={decodedPdfUrl}
                            title="PDF"
                            width="100%"
                            height="500px"
                            style={{ border: 'none', borderRadius: '8px' }}
                        />
                        <Button
                            variant="contained"
                            color="success"
                            href={decodedPdfUrl}
                            target="_blank"
                            sx={{ mt: 2, fontWeight: 600 }}
                        >
                            Descargar PDF
                        </Button>
                    </Box>
                ) : (
                    <Typography color="error" sx={{ mt: 4 }}>
                        No se proporcionó un enlace de PDF válido.
                    </Typography>
                )}
            </Box>
            </>
    );
}

export default PdfView;
