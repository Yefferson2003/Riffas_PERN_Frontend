import { BrowserRouter, Route, Routes } from "react-router-dom"
import IndexLayout from "./layouts/IndexLayout"
import IndexView from "./views/indexView/IndexView"
import AuthLayout from "./layouts/AuthLayout"
import Error404View from "./views/Error404View"
import LoginView from "./views/authView/LoginView"


function Router() {
    return (
        <>
        <BrowserRouter>
            <Routes>

                <Route path="*" element={<Error404View/>}/>

                <Route element={<IndexLayout/>}>
                    <Route path="/" element={<IndexView/>} index/>
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