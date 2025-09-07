import { Outlet, useNavigate } from "react-router-dom"
import { ToastContainer } from "react-toastify"
import 'react-toastify/dist/ReactToastify.css';
import { useAuth } from "../hooks/useAuth";

function AuthLayout() {

    const { user } = useAuth()
    const navigate = useNavigate()
    const token = localStorage.getItem("AUTH_TOKEN");


    const handleNavigateIndex = () => {
        if (user && token) {
            navigate('/')
        }
    }

    return (
        <main className="min-h-screen bg-slate-300 py-28 md:py-32 lg:py-40 bg-azul">
            <div className="py-5 mx-auto md:w-[450px] bg-white md:rounded-lg shadow-lg px-5 w-full">
                
                <div className="pb-5 mx-auto space-y-6 text-center"
                    onClick={handleNavigateIndex}
                >
                    <h1 className="font-bold underline uppercase text-azul text-8xl">riffas</h1>

                    <p className="text-xl font-semibold capitalize">Iniciar sessión</p>
                </div>
                    <Outlet/>
            </div>
            <ToastContainer
                position="top-right"
                autoClose={5000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover={false}
                theme="colored"
            />
        </main>
    )
}

export default AuthLayout