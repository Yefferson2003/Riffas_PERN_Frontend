import { Button } from "@mui/material";
import { Link } from "react-router-dom";

export default function Error404View() {
    return (
        <>

            <main className="grid min-h-full px-6 py-24 place-items-center sm:py-32 lg:px-8">
            <div className="text-center">
                <p className="text-9xl font-semibold text-azul">404</p>
                <h1 className="mt-4 text-5xl font-semibold tracking-tight text-gray-900 text-balance sm:text-7xl">
                Pagina no encontrada
                </h1>
                <p className="mt-6 text-lg font-medium text-pretty sm:text-xl/8">
                Lo sentimos, nosotros no podemos encontrar la página que quieres buscar.
                </p>
                <div className="flex items-center justify-center mt-10 gap-x-6">
                    <Link to={'/'}>
                        <Button color='info' variant="contained">
                            Volver al Inicio
                        </Button>
                    </Link>
                    
                </div>
            </div>
            </main>
        </>
    )
}