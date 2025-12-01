import React, { useState } from 'react';
import { Fab, Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, Box } from '@mui/material';
import BugReportIcon from '@mui/icons-material/BugReport';

interface DebugInfo {
  userAgent: string;
  viewport: { width: number; height: number };
  screen: { width: number; height: number };
  timestamp: string;
  memory?: {
    usedJSHeapSize: number;
    jsHeapSizeLimit: number;
    totalJSHeapSize: number;
  };
}

const MobileDebugButton: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [debugInfo, setDebugInfo] = useState<DebugInfo | null>(null);

  const collectDebugInfo = (): DebugInfo => {
    const info: DebugInfo = {
      userAgent: navigator.userAgent,
      viewport: { 
        width: window.innerWidth, 
        height: window.innerHeight 
      },
      screen: { 
        width: screen.width, 
        height: screen.height 
      },
      timestamp: new Date().toISOString()
    };

    // Intentar obtener información de memoria si está disponible
    if ('memory' in performance) {
      try {
        const memInfo = (performance as unknown as { memory: { usedJSHeapSize: number; jsHeapSizeLimit: number; totalJSHeapSize: number } }).memory;
        info.memory = {
          usedJSHeapSize: memInfo.usedJSHeapSize,
          jsHeapSizeLimit: memInfo.jsHeapSizeLimit,
          totalJSHeapSize: memInfo.totalJSHeapSize
        };
      } catch (error) {
        console.warn('No se pudo obtener información de memoria:', error);
      }
    }

    return info;
  };

  const handleOpen = () => {
    setDebugInfo(collectDebugInfo());
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const copyToClipboard = () => {
    if (debugInfo) {
      navigator.clipboard.writeText(JSON.stringify(debugInfo, null, 2))
        .then(() => alert('Información copiada al portapapeles'))
        .catch(() => alert('Error al copiar'));
    }
  };

  // Solo mostrar en móviles o en desarrollo
  const shouldShow = /mobile|android|iphone|ipad/i.test(navigator.userAgent)

  if (!shouldShow) return null;

  return (
    <>
      <Fab
        color="secondary"
        size="small"
        onClick={handleOpen}
        sx={{
          position: 'fixed',
          bottom: 16,
          right: 16,
          zIndex: 1000,
          backgroundColor: '#ff6b35',
          '&:hover': {
            backgroundColor: '#e55a2b'
          }
        }}
      >
        <BugReportIcon />
      </Fab>

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>Información de Debug</DialogTitle>
        <DialogContent>
          {debugInfo && (
            <Box sx={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>
              <Typography variant="subtitle2" gutterBottom>
                User Agent:
              </Typography>
              <Typography variant="body2" sx={{ wordBreak: 'break-all', mb: 2 }}>
                {debugInfo.userAgent}
              </Typography>

              <Typography variant="subtitle2" gutterBottom>
                Viewport:
              </Typography>
              <Typography variant="body2" sx={{ mb: 2 }}>
                {debugInfo.viewport.width} x {debugInfo.viewport.height}
              </Typography>

              <Typography variant="subtitle2" gutterBottom>
                Pantalla:
              </Typography>
              <Typography variant="body2" sx={{ mb: 2 }}>
                {debugInfo.screen.width} x {debugInfo.screen.height}
              </Typography>

              {debugInfo.memory && (
                <>
                  <Typography variant="subtitle2" gutterBottom>
                    Memoria JS:
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 2 }}>
                    Usado: {Math.round(debugInfo.memory.usedJSHeapSize / 1024 / 1024)} MB<br/>
                    Límite: {Math.round(debugInfo.memory.jsHeapSizeLimit / 1024 / 1024)} MB<br/>
                    Total: {Math.round(debugInfo.memory.totalJSHeapSize / 1024 / 1024)} MB
                  </Typography>
                </>
              )}

              <Typography variant="subtitle2" gutterBottom>
                Timestamp:
              </Typography>
              <Typography variant="body2">
                {debugInfo.timestamp}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={copyToClipboard}>Copiar Info</Button>
          <Button onClick={handleClose} variant="contained">Cerrar</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default MobileDebugButton;