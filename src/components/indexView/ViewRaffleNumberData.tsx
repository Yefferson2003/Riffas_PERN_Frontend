import { QueryObserverResult, RefetchOptions, useQuery } from "@tanstack/react-query"
import { Navigate, useParams } from "react-router-dom"
import { getRaffleNumberById } from "../../api/raffleNumbersApi"
import { AwardType, ClientSelectType, Raffle, RaffleNumbersPayments, RaffleNumbersResponseType } from "../../types"
import { TasaResponseType } from "../../types/tasas"
import ViewRaffleNumberModal from "./ViewRaffleNumberModal"

export type InfoRaffleType = {
    name: string;
    amountRaffle: string;
    playDate: string;
    description: string;
    responsable: string
    contactRifero?: string
}

type ViewRaffleNumberDataProps = {
    clientSelectInput?: ClientSelectType
    clientPage: number
    clientSearch: string
    setClientPage: React.Dispatch<React.SetStateAction<number>>
    setClientSearch: React.Dispatch<React.SetStateAction<string>>
    isLoadingClients: boolean
    raffle: Raffle
    awards: AwardType[]
    totalNumbers: number
    infoRaffle: InfoRaffleType
    setPaymentsSellNumbersModal: React.Dispatch<React.SetStateAction<boolean>>
    setPdfData: React.Dispatch<React.SetStateAction<RaffleNumbersPayments | undefined>>
    refetch: (options?: RefetchOptions) => Promise<QueryObserverResult<RaffleNumbersResponseType | undefined, Error>>
    setUrlWasap: React.Dispatch<React.SetStateAction<string>>
    tasas: TasaResponseType[]
    // refectRaffle: {
    //     search: string;
    //     raffleId: string | undefined;
    //     filter: object;
    //     page: number;
    //     limit: number;
    // }
}

function ViewRaffleNumberData({clientSelectInput, clientPage, clientSearch, setClientPage, setClientSearch, isLoadingClients, awards, raffle, totalNumbers, infoRaffle, setPaymentsSellNumbersModal, setPdfData, refetch, setUrlWasap, tasas} : ViewRaffleNumberDataProps) {
    const queryParams = new URLSearchParams(location.search)
    const modalviewRaffleNumber = queryParams.get('viewRaffleNumber')
    const raffleNumberId = Number(modalviewRaffleNumber)
    const params = useParams()
    const raffleId = params.raffleId ? +params.raffleId : 0

    const {data, isError} = useQuery({
        queryKey: ['raffleNumber', raffleId, raffleNumberId],
        queryFn: () => getRaffleNumberById({raffleId: raffleId ? +raffleId : 0, raffleNumberId}),
        enabled: !!raffleNumberId && !!raffleId
    })

    if (isError) return <Navigate to={'/404'}/> 
    if (data) return <ViewRaffleNumberModal 
        clientSelectInput={clientSelectInput}
        clientPage={clientPage}
        clientSearch={clientSearch}
        setClientPage={setClientPage}
        setClientSearch={setClientSearch}
        isLoadingClients={isLoadingClients}
        awards={awards}
        pdfData={[data]}
        raffle={raffle}
        totalNumbers={totalNumbers}
        infoRaffle={infoRaffle}
        raffleNumber={data}
        setPaymentsSellNumbersModal={setPaymentsSellNumbersModal}
        setPdfData={setPdfData}
        refetch={refetch}
        setUrlWasap={setUrlWasap}
        tasas={tasas}
    />
}

export default ViewRaffleNumberData