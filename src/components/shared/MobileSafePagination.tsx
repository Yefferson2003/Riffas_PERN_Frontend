import React, { memo } from 'react';
import { Pagination } from '@mui/material';

interface MobileSafePaginationProps {
  count?: number;
  page: number;
  onChange: (event: React.ChangeEvent<unknown>, newPage: number) => void;
  isSmallDevice: boolean;
}

const MobileSafePagination = memo(({ count, page, onChange, isSmallDevice }: MobileSafePaginationProps) => {
  // Función wrapper para el onChange que incluye manejo de errores
  const handleChange = (event: React.ChangeEvent<unknown>, newPage: number) => {
    try {
      // Prevenir multiple clicks rápidos en móviles
      if (isSmallDevice) {
        const target = event.target as HTMLElement;
        target.style.pointerEvents = 'none';
        setTimeout(() => {
          target.style.pointerEvents = 'auto';
        }, 300);
      }
      
      onChange(event, newPage);
    } catch (error) {
      console.error('Error en paginación:', error);
    }
  };

  if (!count || count <= 1) {
    return null;
  }

  return (
    <div className='flex justify-center my-5'>
      <Pagination     
        count={count} 
        color="primary" 
        onChange={handleChange} 
        page={page}
        siblingCount={isSmallDevice ? 0 : 1} 
        boundaryCount={1}
        size={isSmallDevice ? 'medium' : 'small'}
        showFirstButton={!isSmallDevice}
        showLastButton={!isSmallDevice}
        variant="outlined"
        sx={{
          '& .MuiPaginationItem-root': {
            fontSize: isSmallDevice ? '1rem' : '0.875rem',
            minWidth: isSmallDevice ? '44px' : '32px',
            height: isSmallDevice ? '44px' : '32px',
            margin: isSmallDevice ? '0 4px' : '0 2px',
            // Mejorar el touch target en móviles
            touchAction: 'manipulation',
            userSelect: 'none',
            // Prevenir problemas de hover en móviles
            '@media (hover: none)': {
              '&:hover': {
                backgroundColor: 'transparent'
              }
            }
          },
          '& .MuiPaginationItem-ellipsis': {
            fontSize: isSmallDevice ? '1.2rem' : '1rem'
          },
          // Agregar algo de padding en móviles para mejor touch experience
          ...(isSmallDevice && {
            padding: '8px 0'
          })
        }}
      /> 
    </div>
  );
});

MobileSafePagination.displayName = 'MobileSafePagination';

export default MobileSafePagination;