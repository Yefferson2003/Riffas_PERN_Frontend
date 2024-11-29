import { Outlet } from "react-router-dom"
import { ToastContainer } from "react-toastify"
import 'react-toastify/dist/ReactToastify.css';

function AuthLayout() {
    return (
        <main className="min-h-screen bg-slate-300 py-28 md:py-32 lg:py-40 bg-azul">
            <div className="py-5 mx-auto md:w-[450px] bg-white md:rounded-lg shadow-lg px-5 w-full">
                
                <div className="mx-auto pb-5 text-center space-y-6">
                    <h1 className="text-azul text-8xl uppercase  font-bold underline">riffas</h1>

                    <p className="capitalize text-xl font-semibold">Iniciar sessión</p>
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