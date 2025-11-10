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
import RaffleProgressBar from "../../components/indexView/RaffleProgressBar";

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
                        {/* <div className="relative">
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
                        </div> */}
                        <img 
                            className="w-full lg:h-40 lg:object-cover"
                            src={isSmallDevice ? raffle?.banerMovileImgUrl || '/banner_default.jpg' : raffle?.banerImgUrl  || '/banner_default.jpg'}
                            alt="banner riffa" 
                        />
                        
                        {/* TÍTULO PRINCIPAL */}
                        <div className="px-4 py-6 sm:px-6 md:px-8">
                            <div className="flex flex-col items-center space-y-2">
                                <h1 
                                    className="text-2xl font-bold leading-tight sm:text-3xl md:text-4xl lg:text-5xl"
                                    style={{ color: raffle?.color || '#1976d2' }}
                                >
                                    {capitalize(raffle.name)}
                                </h1>
                                <div 
                                    className="w-20 h-1 rounded-full"
                                    style={{ 
                                        background: `linear-gradient(to right, ${raffle?.color || '#1976d2'}, ${raffle?.color ? `${raffle.color}80` : '#1976d280'})` 
                                    }}
                                ></div>
                            </div>
                        </div>

                        {/* DESCRIPCIÓN */}
                        <div className="px-4 pb-6 sm:px-6 md:px-8">
                            <div className="p-4 shadow-sm bg-gray-50 rounded-xl sm:p-6">
                                <h2 
                                    className="flex items-center justify-center gap-2 mb-3 text-lg font-bold sm:text-xl"
                                    style={{ color: raffle?.color || '#1976d2' }}
                                >
                                    <span 
                                        className="w-2 h-2 rounded-full"
                                        style={{ backgroundColor: raffle?.color || '#1976d2' }}
                                    ></span>
                                    Descripción
                                    <span 
                                        className="w-2 h-2 rounded-full"
                                        style={{ backgroundColor: raffle?.color || '#1976d2' }}
                                    ></span>
                                </h2>
                                <p className="max-w-4xl mx-auto text-sm leading-relaxed text-justify text-gray-700 sm:text-base">
                                    {raffle.description}
                                </p>
                            </div>
                        </div>

                        {/* PREMIOS */}
                        {token && awards && (
                            <div className="px-4 pb-6 sm:px-6 md:px-8">
                                <AwardsShared awards={awards} raffleColor={raffle.color || '#1976d2'} />
                            </div>
                        )}

                        {/* FECHAS */}
                        <div className="px-4 pb-8 sm:px-6 md:px-8">
                            <div className="max-w-md mx-auto">
                                <div 
                                    className="relative p-6 overflow-hidden text-white shadow-xl rounded-2xl"
                                    style={{ 
                                        background: `linear-gradient(135deg, ${raffle?.color || '#1976d2'}, ${raffle?.color ? `${raffle.color}dd` : '#1565c0'})`,
                                        boxShadow: `0 8px 32px ${raffle?.color || '#1976d2'}40, 0 4px 16px ${raffle?.color || '#1976d2'}25`
                                    }}
                                >
                                    {/* Efecto de brillo/shimmer */}
                                    <div 
                                        className="absolute inset-0 pointer-events-none"
                                        style={{
                                            background: 'linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.1) 50%, transparent 70%)',
                                            animation: 'shimmer 3s infinite'
                                        }}
                                    ></div>
                                    
                                    <div className="relative z-10 flex items-center justify-center mb-3">
                                        <div className="w-3 h-3 mr-2 bg-white rounded-full animate-pulse"></div>
                                        <h3 className="text-lg font-bold sm:text-xl">Fecha del Sorteo</h3>
                                        <div className="w-3 h-3 ml-2 bg-white rounded-full animate-pulse"></div>
                                    </div>
                                    <p className="relative z-10 text-base font-semibold sm:text-lg">
                                        {formatDateTimeLarge(raffle.playDate)}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Keyframes para la animación shimmer */}
                        <style>{`
                            @keyframes shimmer {
                                0% { transform: translateX(-100%); }
                                100% { transform: translateX(100%); }
                            }
                        `}</style>
                    </div>

                    {/* Barra de progreso para versión compartida */}
                    {raffle && raffle.numbersByStatus && raffle.totalNumbers && (
                        <div className="px-4 pb-6 sm:px-6 md:px-8">
                            <RaffleProgressBar 
                                numbersByStatus={raffle.numbersByStatus}
                                totalNumbers={raffle.totalNumbers}
                                variant="shared"
                                raffleColor={raffle.color || '#1976d2'}
                            />
                        </div>
                    )}

                    {/* NÚMEROS DE LA RIFA */}
                    {token && awards && raffle && (
                        <div className="overflow-hidden bg-white shadow-xl rounded-3xl">
                            <div className="p-4 sm:p-6 md:p-8">
                                <RaffleNumbersShared
                                    awards={awards}
                                    raffle={raffle}
                                    token={token}
                                    price={raffle.price}
                                    raffleColor={raffle.color || '#1976d2'}
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
                            className="flex items-center gap-2 px-4 py-2 text-gray-700 transition-all duration-300 transform bg-white rounded-lg shadow-md hover:shadow-lg hover:scale-105"
                            style={{
                                boxShadow: `0 2px 8px ${raffle?.color || '#1976d2'}15`
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.color = raffle?.color || '#1976d2';
                                e.currentTarget.style.boxShadow = `0 4px 12px ${raffle?.color || '#1976d2'}30`;
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.color = '#374151';
                                e.currentTarget.style.boxShadow = `0 2px 8px ${raffle?.color || '#1976d2'}15`;
                            }}
                        >
                            <span 
                                className="w-2 h-2 rounded-full"
                                style={{ backgroundColor: raffle?.color || '#1976d2' }}
                            ></span>
                            Términos y Condiciones
                        </a>
                        <a
                            href="/privacy-policy"
                            target="_blank"
                            className="flex items-center gap-2 px-4 py-2 text-gray-700 transition-all duration-300 transform bg-white rounded-lg shadow-md hover:shadow-lg hover:scale-105"
                            style={{
                                boxShadow: `0 2px 8px ${raffle?.color || '#1976d2'}15`
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.color = raffle?.color || '#1976d2';
                                e.currentTarget.style.boxShadow = `0 4px 12px ${raffle?.color || '#1976d2'}30`;
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.color = '#374151';
                                e.currentTarget.style.boxShadow = `0 2px 8px ${raffle?.color || '#1976d2'}15`;
                            }}
                        >
                            <span 
                                className="w-2 h-2 rounded-full"
                                style={{ backgroundColor: raffle?.color || '#1976d2' }}
                            ></span>
                            Política de Privacidad
                        </a>
                    </div>
                    
                    {/* Separador decorativo */}
                    <div className="flex justify-center mt-6">
                        <div className="flex items-center space-x-2">
                            <div 
                                className="w-8 h-0.5"
                                style={{ 
                                    background: `linear-gradient(to right, transparent, ${raffle?.color || '#1976d2'})` 
                                }}
                            ></div>
                            <div 
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: raffle?.color || '#1976d2' }}
                            ></div>
                            <div 
                                className="w-8 h-0.5"
                                style={{ 
                                    background: `linear-gradient(to left, transparent, ${raffle?.color || '#1976d2'})` 
                                }}
                            ></div>
                        </div>
                    </div>
                </footer>
            </div>
        </Box>
    );
}

export default RaffleSharedView;
