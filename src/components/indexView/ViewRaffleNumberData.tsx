import { QueryObserverResult, RefetchOptions, useQuery } from "@tanstack/react-query"
import { Navigate, useParams } from "react-router-dom"
import { getRaffleNumberById } from "../../api/raffleNumbersApi"
import { AwardType, Raffle, RaffleNumbersPayments, RaffleNumbersResponseType } from "../../types"
import ViewRaffleNumberModal from "./ViewRaffleNumberModal"

export type InfoRaffleType = {
    name: string;
    amountRaffle: string;
    playDate: string;
    description: string;
    responsable: string
}

type ViewRaffleNumberDataProps = {
    raffle: Raffle
    awards: AwardType[]
    totalNumbers: number
    infoRaffle: InfoRaffleType
    setPaymentsSellNumbersModal: React.Dispatch<React.SetStateAction<boolean>>
    setPdfData: React.Dispatch<React.SetStateAction<RaffleNumbersPayments | undefined>>
    refect: (options?: RefetchOptions) => Promise<QueryObserverResult<RaffleNumbersResponseType | undefined, Error>>
    setUrlWasap: React.Dispatch<React.SetStateAction<string>>
    // refectRaffle: {
    //     search: string;
    //     raffleId: string | undefined;
    //     filter: object;
    //     page: number;
    //     limit: number;
    // }
}

function ViewRaffleNumberData({ awards, raffle, totalNumbers, infoRaffle, setPaymentsSellNumbersModal, setPdfData, refect, setUrlWasap} : ViewRaffleNumberDataProps) {
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
        awards={awards}
        pdfData={[data]}
        raffle={raffle}
        totalNumbers={totalNumbers}
        infoRaffle={infoRaffle}
        raffleNumber={data}
        setPaymentsSellNumbersModal={setPaymentsSellNumbersModal}
        setPdfData={setPdfData}
        refect={refect}
        setUrlWasap={setUrlWasap}
    />
}

export default ViewRaffleNumberData