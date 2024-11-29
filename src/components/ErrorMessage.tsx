export default function ErrorMessage({children, id}: {children: React.ReactNode, id?: string}) {
    return (
        <div 
            className="p-3 my-4 text-sm font-bold text-center text-white uppercase bg-rojo"
            id={id}
        >
            {children}
        </div>
    )
}