import { useState, useCallback } from 'react';

interface UseMobileSafePaginationProps {
  initialPage?: number;
  isSmallDevice: boolean;
  onPageChange?: (page: number) => void;
}

export const useMobileSafePagination = ({
  initialPage = 1,
  isSmallDevice,
  onPageChange
}: UseMobileSafePaginationProps) => {
  const [page, setPage] = useState(initialPage);
  const [isChanging, setIsChanging] = useState(false);

  const handlePageChange = useCallback(
    (_event: React.ChangeEvent<unknown>, newPage: number) => {
      try {
        // Prevenir múltiples cambios rápidos
        if (isChanging) return;

        // Validaciones básicas
        if (!newPage || newPage < 1) {
          console.warn('Página inválida:', newPage);
          return;
        }

        setIsChanging(true);

        // En móviles, agregar delay para evitar problemas de DOM
        const updatePage = () => {
          try {
            setPage(newPage);
            onPageChange?.(newPage);
          } catch (error) {
            console.error('Error actualizando página:', error);
          } finally {
            setIsChanging(false);
          }
        };

        if (isSmallDevice) {
          // Delay más largo en móviles para asegurar estabilidad
          setTimeout(updatePage, 100);
        } else {
          setTimeout(updatePage, 50);
        }
        
      } catch (error) {
        console.error('Error en handlePageChange:', error);
        setIsChanging(false);
      }
    },
    [isChanging, isSmallDevice, onPageChange]
  );

  const resetPage = useCallback(() => {
    setPage(1);
  }, []);

  return {
    page,
    handlePageChange,
    resetPage,
    isChanging
  };
};