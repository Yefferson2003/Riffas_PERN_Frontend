import { BrowserRouter, Route, Routes } from "react-router-dom"
import IndexLayout from "./layouts/IndexLayout"
import IndexView from "./views/indexView/IndexView"
import AuthLayout from "./layouts/AuthLayout"
import Error404View from "./views/Error404View"
import LoginView from "./views/authView/LoginView"
import UsersView from "./views/indexView/UsersView"
import RaffleNumbersView from "./views/indexView/RaffleNumbersView"
import RaffleSharedView from "./views/indexView/RaffleSharedView"
import TermsAndConditionsView from "./views/TermsAndConditionsView"
import PrivacyPolicyView from "./views/PrivacyPolicyView"
import PayMethodeView from "./views/indexView/PayMethodeView"
import ClientView from "./views/indexView/ClientView"
import WhatsAppView from "./views/indexView/WhatsAppView"
import PdfView from "./views/PdfView"
import ClientWebView from "./views/indexView/ClientWebView"


function Router() {
    return (
        <>
        <BrowserRouter>
            <Routes>
                <Route path="/raffle/shared/:token" element={<RaffleSharedView />} />
                <Route path="/terms-and-conditions" element={<TermsAndConditionsView/>} />
                <Route path="/privacy-policy" element={<PrivacyPolicyView/>} />

                <Route path="/pdf-view/:pdfUrl" element={<PdfView/>} />
                <Route path="*" element={<Error404View/>}/>

                <Route element={<IndexLayout/>}>
                    <Route path="/" element={<IndexView/>} index/>
                    <Route path="/users" element={<UsersView/>} index/>
                    <Route path="/raffle/:raffleId" element={<RaffleNumbersView/>} index/>
                    <Route path="/pay-methods" element={<PayMethodeView/>} index/>
                    <Route path="/clients" element={<ClientView/>} index/>
                    <Route path="/clients-web" element={<ClientWebView/>} index/>
                    <Route path="/whatsapp" element={<WhatsAppView/>} />
                </Route>


                <Route element={<AuthLayout/>}>
                    <Route path="/auth-login" element={<LoginView/>}/>
                </Route>
            </Routes>
        </BrowserRouter>
        </>
    )
}

export default Router