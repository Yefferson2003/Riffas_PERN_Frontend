import { useQueries } from "@tanstack/react-query";
import { getRaffleShared } from "../../api/raffleApi";
import { getAwardsShared } from "../../api/awardsApi";
import { Navigate, useParams } from "react-router-dom";
import LoaderView from "../LoaderView";
import { capitalize, formatDateTimeLarge } from "../../utils";
import { useMediaQuery } from "react-responsive";
import { Box } from "@mui/material";
import AwardsShared from "../../components/shared/AwardsShared";
import RaffleNumbersShared from "../../components/shared/RaffleNumbersShared";

function RaffleSharedView() {
    const { token } = useParams<{ token: string }>();
    const isSmallDevice = useMediaQuery({ maxWidth: 768 });

    const results = useQueries({
        queries: [
        {
            queryKey: ["raffleShare", token],
            queryFn: () => getRaffleShared({ token: token || "" }),
            enabled: !!token,
        },
        {
            queryKey: ["awardsShared", token],
            queryFn: () => getAwardsShared({ token: token || "" }),
            enabled: !!token,
        },
        ],
    });

    const [raffleQuery, awardsQuery] = results;

    const isLoading = raffleQuery.isLoading || awardsQuery.isLoading;
    const isError = raffleQuery.isError || awardsQuery.isError;

    if (isLoading) return <LoaderView />;
    if (isError) return <Navigate to="/404" />;

    const raffle = raffleQuery.data;
    const awards = awardsQuery.data;

    if (raffle)
        return (
        <Box 
            component="main" 
            sx={{ 
                width: "100%",
                minHeight: "100vh",
                bgcolor: "#f8fafc",
                px: { xs: 2, sm: 3, md: 4 },
                py: { xs: 3, sm: 4 }
            }}
        >
            <div className="max-w-6xl mx-auto">
                <section className="flex flex-col w-full space-y-6 text-center lg:space-y-8">
                    {/* CONTENEDOR PRINCIPAL */}
                    <div className="overflow-hidden bg-white shadow-xl rounded-3xl">
                        {/* BANNER */}
                        <div className="relative">
                            <img
                                className="object-contain w-full h-48 sm:h-56 md:h-64 lg:h-72"
                                src={
                                    isSmallDevice
                                        ? raffle?.banerMovileImgUrl || "/banner_default.jpg"
                                        : raffle?.banerImgUrl || "/banner_default.jpg"
                                }
                                alt="banner rifa"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                        </div>
                        
                        {/* TÍTULO PRINCIPAL */}
                        <div className="px-4 py-6 sm:px-6 md:px-8">
                            <div className="flex flex-col items-center space-y-2">
                                <h1 className="text-2xl font-bold leading-tight sm:text-3xl md:text-4xl lg:text-5xl text-azul">
                                    {capitalize(raffle.name)}
                                </h1>
                                <div className="w-20 h-1 rounded-full bg-gradient-to-r from-azul to-blue-400"></div>
                            </div>
                        </div>

                        {/* DESCRIPCIÓN */}
                        <div className="px-4 pb-6 sm:px-6 md:px-8">
                            <div className="p-4 shadow-sm bg-gray-50 rounded-xl sm:p-6">
                                <h2 className="flex items-center justify-center gap-2 mb-3 text-lg font-bold sm:text-xl text-azul">
                                    <span className="w-2 h-2 rounded-full bg-azul"></span>
                                    Descripción
                                    <span className="w-2 h-2 rounded-full bg-azul"></span>
                                </h2>
                                <p className="max-w-4xl mx-auto text-sm leading-relaxed text-justify text-gray-700 sm:text-base">
                                    {raffle.description}
                                </p>
                            </div>
                        </div>

                        {/* PREMIOS */}
                        {token && awards && (
                            <div className="px-4 pb-6 sm:px-6 md:px-8">
                                <AwardsShared awards={awards} />
                            </div>
                        )}

                        {/* FECHAS */}
                        <div className="px-4 pb-8 sm:px-6 md:px-8">
                            <div className="max-w-md mx-auto">
                                <div className="p-6 text-white shadow-xl bg-gradient-to-br from-azul to-blue-600 rounded-2xl">
                                    <div className="flex items-center justify-center mb-3">
                                        <div className="w-3 h-3 mr-2 bg-white rounded-full animate-pulse"></div>
                                        <h3 className="text-lg font-bold sm:text-xl">Fecha del Sorteo</h3>
                                        <div className="w-3 h-3 ml-2 bg-white rounded-full animate-pulse"></div>
                                    </div>
                                    <p className="text-base font-semibold sm:text-lg">
                                        {formatDateTimeLarge(raffle.playDate)}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* NÚMEROS DE LA RIFA */}
                    {token && awards && raffle && (
                        <div className="overflow-hidden bg-white shadow-xl rounded-3xl">
                            <div className="p-4 sm:p-6 md:p-8">
                                <RaffleNumbersShared
                                    awards={awards}
                                    raffle={raffle}
                                    token={token}
                                    price={raffle.price}
                                />
                            </div>
                        </div>
                    )}
                </section>

                {/* FOOTER CON ENLACES */}
                <footer className="py-8 mt-12">
                    <div className="flex flex-col items-center justify-center gap-4 text-sm sm:flex-row sm:gap-8">
                        <a
                            href="/terms-and-conditions"
                            target="_blank"
                            className="flex items-center gap-2 px-4 py-2 text-gray-700 transition-all duration-300 transform bg-white rounded-lg shadow-md hover:text-azul hover:shadow-lg hover:scale-105"
                        >
                            <span className="w-2 h-2 rounded-full bg-azul"></span>
                            Términos y Condiciones
                        </a>
                        <a
                            href="/privacy-policy"
                            target="_blank"
                            className="flex items-center gap-2 px-4 py-2 text-gray-700 transition-all duration-300 transform bg-white rounded-lg shadow-md hover:text-azul hover:shadow-lg hover:scale-105"
                        >
                            <span className="w-2 h-2 rounded-full bg-azul"></span>
                            Política de Privacidad
                        </a>
                    </div>
                    
                    {/* Separador decorativo */}
                    <div className="flex justify-center mt-6">
                        <div className="flex items-center space-x-2">
                            <div className="w-8 h-0.5 bg-gradient-to-r from-transparent to-azul"></div>
                            <div className="w-3 h-3 rounded-full bg-azul"></div>
                            <div className="w-8 h-0.5 bg-gradient-to-l from-transparent to-azul"></div>
                        </div>
                    </div>
                </footer>
            </div>
        </Box>
    );
}

export default RaffleSharedView;
