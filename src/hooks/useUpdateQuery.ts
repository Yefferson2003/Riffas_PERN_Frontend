import { useNavigate, useLocation } from "react-router-dom";

/**
 * Hook para actualizar parámetros en la query string sin perder los existentes
 */
export function useUpdateQuery() {
    const navigate = useNavigate();
    const location = useLocation();

    /**
     * Actualiza o elimina un parámetro en la query
     * @param key Nombre del parámetro
     * @param value Valor del parámetro (si es null o undefined, se elimina)
     * @param options.replace Si true, reemplaza el historial en lugar de hacer push
     */
    const updateQueryParam = (key: string, value?: string | number | null, options?: { replace?: boolean }) => {
        const searchParams = new URLSearchParams(location.search);

        if (value === null || value === undefined || value === "") {
        searchParams.delete(key); // Elimina si no hay valor
        } else {
        searchParams.set(key, value.toString()); // Agrega o actualiza
        }

        navigate(
        {
            pathname: location.pathname,
            search: searchParams.toString(),
        },
        { replace: options?.replace ?? false }
        );
    };

    return updateQueryParam;
}
