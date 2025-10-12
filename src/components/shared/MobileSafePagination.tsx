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

                // sx={{
                //     // Contenedor principal responsivo
                //     minWidth: 'fit-content',
                //     display: 'flex',
                //     justifyContent: 'center',
                    
                //     '& .MuiPaginationItem-root': {
                //         touchAction: 'manipulation',
                //         userSelect: 'none',
                //         flexShrink: 0,
                        
                //         // Tamaños base
                //         fontSize: '0.875rem',
                //         minWidth: '32px',
                //         height: '32px',
                //         margin: '0 1px',
                        
                //         // Mejoras para móviles
                //         ...(isSmallDevice && {
                //             fontSize: '0.8rem',
                //             minWidth: '36px',
                //             height: '36px',
                //             padding: '4px 6px',
                //         }),
                        
                //         // Media queries para diferentes tamaños
                //         '@media (max-width: 480px)': {
                //             fontSize: '0.75rem',
                //             minWidth: '30px',
                //             height: '30px',
                //             margin: '0 0.5px',
                //         },
                        
                //         '@media (max-width: 360px)': {
                //             fontSize: '0.7rem',
                //             minWidth: '28px',
                //             height: '28px',
                //             margin: '0',
                //             padding: '2px 4px',
                //         },
                        
                //         // Prevenir hover en móviles
                //         '@media (hover: none)': {
                //             '&:hover': {
                //                 backgroundColor: 'transparent'
                //             }
                //         }
                //     },
                    
                //     '& .MuiPaginationItem-ellipsis': {
                //         fontSize: '1rem',
                //         minWidth: '20px',
                //         margin: '0 1px',
                //         flexShrink: 0,
                        
                //         '@media (max-width: 480px)': {
                //             fontSize: '0.9rem',
                //             minWidth: '18px',
                //         },
                //     },
                    
                //     // Lista de paginación
                //     '& .MuiPagination-ul': {
                //         flexWrap: 'nowrap',
                //         justifyContent: 'center',
                //         alignItems: 'center',
                //         gap: '1px',
                        
                //         ...(isSmallDevice && {
                //             overflowX: 'auto',
                //             scrollbarWidth: 'none',
                //             '&::-webkit-scrollbar': {
                //                 display: 'none'
                //             }
                //         })
                //     }
                // }}

            /> 
        </div>
    );
});

MobileSafePagination.displayName = 'MobileSafePagination';

export default MobileSafePagination; 