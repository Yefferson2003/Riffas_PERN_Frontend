import { useQueries } from "@tanstack/react-query";
import { getRaffleShared } from "../../api/raffleApi";
import { getAwardsShared } from "../../api/awardsApi";
import { Navigate, useParams } from "react-router-dom";
import LoaderView from "../LoaderView";
import { formatDateTimeLarge } from "../../utils";
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
        <Box component="main" sx={{ p: 3, width: "100%" }}>
            <section className="flex flex-col w-full pb-10 text-center lg:flex-col *:bg-white *:p-4 gap-5 *:rounded-xl">
            {/* INFO PRINCIPAL */}
            <div className="space-y-4">
                <div className="flex flex-col items-center lg:justify-between lg:flex-row">
                <div className="flex flex-col items-center lg:items-start">
                    <p className="mt-1 text-sm italic text-gray-600">
                    Información general de la rifa
                    </p>
                    <h2 className="text-2xl font-bold lg:text-3xl text-azul">
                    {raffle.name}
                    </h2>
                </div>

                <div className="text-lg text-center text-gray-700 lg:text-right">
                    <p className="font-semibold text-azul">Responsable</p>
                    <p>{raffle.nameResponsable}</p>
                </div>
                </div>

                {/* DESCRIPCIÓN */}
                <div>
                <p className="mb-2 text-xl font-bold text-azul">Descripción</p>
                <p className="text-justify text-gray-700">{raffle.description}</p>
                </div>

                {/* PREMIOS */}
                {token && awards && <AwardsShared awards={awards} />}

                {/* FECHAS */}
                <div className="grid gap-4 text-center md:grid-cols-3">
                <div className="p-3 rounded-lg bg-slate-100">
                    <p className="text-lg font-bold text-azul">Inicio</p>
                    <p className="text-gray-700">
                    {formatDateTimeLarge(raffle.startDate)}
                    </p>
                </div>
                <div className="p-3 rounded-lg bg-slate-100">
                    <p className="text-lg font-bold text-azul">Límite de Compra</p>
                    <p className="text-gray-700">
                    {formatDateTimeLarge(raffle.editDate)}
                    </p>
                </div>
                <div className="p-3 rounded-lg bg-slate-100">
                    <p className="text-lg font-bold text-azul">Fecha del Sorteo</p>
                    <p className="text-gray-700">
                    {formatDateTimeLarge(raffle.playDate)}
                    </p>
                </div>
                </div>

                {/* BANNER */}
                <div>
                <p className="mb-2 text-lg font-bold text-azul">Banner</p>
                <img
                    className="object-cover w-full rounded-lg lg:h-48"
                    src={
                    isSmallDevice
                        ? raffle?.banerMovileImgUrl || "/banner_default.jpg"
                        : raffle?.banerImgUrl || "/banner_default.jpg"
                    }
                    alt="banner rifa"
                />
                </div>
            </div>

            {token && awards && (
                <RaffleNumbersShared
                awards={awards}
                raffle={raffle}
                token={token}
                price={raffle.price}
                />
            )}
            </section>
        </Box>
    );
}

export default RaffleSharedView;
