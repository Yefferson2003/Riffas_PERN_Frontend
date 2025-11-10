import React, { memo } from 'react';
import { Pagination } from '@mui/material';

interface MobileSafePaginationProps {
    count?: number;
    page: number;
    onChange: (event: React.ChangeEvent<unknown>, newPage: number) => void;
    isSmallDevice: boolean;
    raffleColor?: string;
}

const MobileSafePagination = memo(({ count, page, onChange, isSmallDevice, raffleColor = '#1976d2' }: MobileSafePaginationProps) => {
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
        <div className={`flex justify-center my-5 `}>
            <Pagination     
                count={count} 
                color="primary" 
                onChange={handleChange} 
                page={page}
                siblingCount={isSmallDevice ? 0 : 1} 
                boundaryCount={1}
                size={"medium"}
                showFirstButton={false}
                showLastButton={false}
                variant="outlined"
                sx={{
                    '& .MuiPaginationItem-root': {
                        color: raffleColor,
                        borderColor: 'transparent',
                        boxShadow: `0 2px 4px ${raffleColor}40`,
                        '&:hover': {
                            backgroundColor: `${raffleColor}10`,
                            boxShadow: `0 4px 8px ${raffleColor}60`,
                        },
                        '&.Mui-selected': {
                            backgroundColor: raffleColor,
                            color: 'white',
                            boxShadow: `0 4px 12px ${raffleColor}60`,
                            '&:hover': {
                                backgroundColor: raffleColor,
                                opacity: 0.9,
                            },
                        },
                    },
                }}
            />
        </div>
    );
});

MobileSafePagination.displayName = 'MobileSafePagination';

export default MobileSafePagination; 