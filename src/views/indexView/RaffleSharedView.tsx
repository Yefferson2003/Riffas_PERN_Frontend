import { useQueries } from "@tanstack/react-query";
import { getRaffleShared } from "../../api/raffleApi";
import { getAwardsShared } from "../../api/awardsApi";
import { Navigate, useParams } from "react-router-dom";
import LoaderView from "../LoaderView";
import { capitalize, formatDateTimeLarge, formatCurrencyCOP } from "../../utils";
import { useMediaQuery } from "react-responsive";
import { Box, Fab, Tooltip } from "@mui/material";
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import AwardsShared from "../../components/shared/AwardsShared";
import RaffleNumbersShared from "../../components/shared/RaffleNumbersShared";
import RaffleProgressBar from "../../components/indexView/RaffleProgressBar";
import RaffleOffersPublic from "../../components/shared/RaffleOffersPublic";
import { ToastContainer } from "react-toastify";
import TasasSupportSharedButton from '../../components/indexView/TasasSupportSharedButton';

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
            {/* Botón de tasas de apoyo flotante, ajustado para no interferir con WhatsApp */}
            <TasasSupportSharedButton
                raffleId={raffle.id}
                raffleColor={raffle.color || '#1976d2'}
                bottom={20}
                right={24}
            />
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
                            {/* Precio de la rifa */}
                            <div className="mt-4 mb-2 text-center">
                                <span className="text-lg font-semibold sm:text-xl" style={{ color: raffle?.color || '#1976d2' }}>
                                    Precio por boleta: {raffle?.price ? formatCurrencyCOP(+raffle.price) : '--'}
                                </span>
                            </div>
                            {/* Ofertas públicas */}
                            <RaffleOffersPublic raffleId={raffle?.id ?? ''} raffleColor={raffle?.color ?? ''} />
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
                                <p
                                    className="max-w-4xl mx-auto text-base italic font-medium leading-relaxed text-center text-gray-800 sm:text-lg"
                                    style={{
                                        background: `linear-gradient(90deg, ${raffle?.color || '#1976d2'}22, #fff 60%, ${raffle?.color || '#1976d2'}22)`,
                                        borderRadius: '1rem',
                                        padding: '1rem',
                                        boxShadow: `0 2px 8px ${raffle?.color || '#1976d2'}15`,
                                        letterSpacing: '0.5px',
                                        fontFamily: 'serif',
                                        fontWeight: 500,
                                        border: `1px solid ${raffle?.color || '#1976d2'}33`,
                                    }}
                                >
                                    <span style={{ fontSize: '1.15em', color: raffle?.color || '#1976d2', fontWeight: 600 }}>
                                        “{raffle.description}”
                                    </span>
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
                        <div className="px-4 pt-2 pb-2 sm:px-6 md:px-8">
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

            {/* Botón flotante de WhatsApp */}
            {raffle.contactRifero && (
                <Tooltip 
                    title="Contáctanos por WhatsApp para más información"
                    placement="left"
                    arrow
                >
                    <Fab
                        onClick={() => {
                            const phoneNumber = raffle.contactRifero?.replace(/[^0-9+]/g, '');
                            const message = encodeURIComponent(
                                `¡Hola! 👋\n\nEstoy interesado/a en la rifa "${raffle.name}".\n\n¿Podrías darme más información? Me gustaría conocer:\n\n📋 Detalles adicionales\n🎯 Disponibilidad de números\n💰 Formas de pago\n📅 Proceso de sorteo\n\n¡Gracias!`
                            );
                            const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`;
                            window.open(whatsappUrl, '_blank');
                        }}
                        sx={{
                            position: 'fixed',
                            bottom: { xs: 20, md: 30 },
                            right: { xs: 20, md: 30 },
                            width: { xs: 56, md: 64 },
                            height: { xs: 56, md: 64 },
                            backgroundColor: '#25D366',
                            color: 'white',
                            boxShadow: '0 8px 20px rgba(37, 211, 102, 0.4), 0 4px 12px rgba(37, 211, 102, 0.3)',
                            zIndex: 1000,
                            '&:hover': {
                                backgroundColor: '#128C7E',
                                transform: 'scale(1.1)',
                                boxShadow: '0 12px 28px rgba(37, 211, 102, 0.5), 0 6px 16px rgba(37, 211, 102, 0.4)',
                            },
                            '&:active': {
                                transform: 'scale(0.95)',
                            },
                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                            animation: 'whatsapp-pulse 2s infinite',
                            '@keyframes whatsapp-pulse': {
                                '0%': {
                                    boxShadow: '0 8px 20px rgba(37, 211, 102, 0.4), 0 4px 12px rgba(37, 211, 102, 0.3)',
                                },
                                '50%': {
                                    boxShadow: '0 12px 30px rgba(37, 211, 102, 0.6), 0 6px 18px rgba(37, 211, 102, 0.4)',
                                },
                                '100%': {
                                    boxShadow: '0 8px 20px rgba(37, 211, 102, 0.4), 0 4px 12px rgba(37, 211, 102, 0.3)',
                                }
                            }
                        }}
                    >
                        <WhatsAppIcon sx={{ fontSize: { xs: 28, md: 32 } }} />
                    </Fab>
                </Tooltip>
            )}
            <ToastContainer position="top-right" autoClose={4000} />
        </Box>
    );
}

export default RaffleSharedView;
