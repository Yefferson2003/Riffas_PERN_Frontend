import React, { useState } from 'react';
import { Card, CardContent, Typography, IconButton, Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Slide, Fab } from '@mui/material';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import CloseIcon from '@mui/icons-material/Close';
import { useQuery } from '@tanstack/react-query';
import { getAllUserTasas } from '../api/tasasApi';

const FloatingTasasButton: React.FC = () => {
  const [open, setOpen] = useState(false);
  const { data: tasas, isLoading } = useQuery({
    queryKey: ['tasas'],
    queryFn: getAllUserTasas,
  });

  return (
    <>
      <Box
        sx={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          zIndex: 1300,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-end',
        }}
      >
        <Slide direction="up" in={open} mountOnEnter unmountOnExit>
          <Card sx={{ minWidth: 280, maxWidth: 340, mb: 2, boxShadow: 6 }}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
                <Typography variant="h6" color="primary" fontWeight={600}>
                  Tasas de Cambio
                </Typography>
                <IconButton size="small" onClick={() => setOpen(false)}>
                  <CloseIcon />
                </IconButton>
              </Box>
              <TableContainer component={Paper} sx={{ maxHeight: 220 }}>
                <Table size="small" stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell>Moneda</TableCell>
                      <TableCell align="center">Símbolo</TableCell>
                      <TableCell align="center">Valor (1 USD)</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {isLoading ? (
                      <TableRow>
                        <TableCell colSpan={3} align="center">Cargando...</TableCell>
                      </TableRow>
                    ) : tasas && tasas.tasas.length > 0 ? (
                      tasas.tasas.map((tasa) => (
                        <TableRow key={tasa.id}>
                          <TableCell>{tasa.moneda.name}</TableCell>
                          <TableCell align="center">{tasa.moneda.symbol}</TableCell>
                          <TableCell align="center">{tasa.value}</TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={3} align="center">No hay tasas registradas</TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Slide>
        <Fab
          color="primary"
          aria-label="tasas"
          onClick={() => setOpen((prev) => !prev)}
          sx={{
            boxShadow: 6,
            width: 56,
            height: 56,
            transition: 'background 0.2s',
            bgcolor: open ? 'secondary.main' : 'primary.main',
            '&:hover': { bgcolor: 'secondary.main' },
          }}
        >
          <MonetizationOnIcon fontSize="large" />
        </Fab>
      </Box>
    </>
  );
};

export default FloatingTasasButton;
