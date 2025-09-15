function TermsAndConditionsView() {
    return (
        <section className="w-full h-full max-w-4xl p-6 mx-auto leading-relaxed text-gray-800">
        <h1 className="mb-4 text-2xl font-bold">Términos y Condiciones: Riffas.info</h1>
        <p className="mb-6">
            Estos términos regulan el uso del sistema <strong>Riffas.info</strong>. Al registrarte y usar nuestros servicios, aceptas estas condiciones:
        </p>

        <h2 className="mt-4 mb-2 text-xl font-semibold">1. Objeto</h2>
        <p className="mb-4">
            Riffas.info es una plataforma que permite a organizadores crear y administrar rifas digitales de manera sencilla y segura.
        </p>

        <h2 className="mt-4 mb-2 text-xl font-semibold">2. Usuarios</h2>
        <ul className="pl-6 mb-4 list-disc">
            <li><strong>Organizadores:</strong> Personas que crean rifas en la plataforma.</li>
            <li><strong>Participantes:</strong> Personas que compran o apartan boletos en rifas creadas por organizadores.</li>
        </ul>

        <h2 className="mt-4 mb-2 text-xl font-semibold">3. Responsabilidades</h2>
        <ul className="pl-6 mb-4 list-disc">
            <li>Riffas.info provee solo la herramienta tecnológica para la gestión de rifas.</li>
            <li>La organización, transparencia y entrega de premios es responsabilidad exclusiva del organizador.</li>
            <li>Los pagos entre organizadores y participantes son gestionados directamente entre ellos.</li>
        </ul>

        <h2 className="mt-4 mb-2 text-xl font-semibold">4. Pagos y planes</h2>
        <ul className="pl-6 mb-4 list-disc">
            <li>El acceso al sistema requiere un pago único de activación y un pago mensual de mantenimiento.</li>
            <li>Servicios adicionales (como campañas de WhatsApp) se contratan de manera opcional.</li>
            <li>No hay devoluciones salvo casos de fallas técnicas comprobadas atribuibles a Riffas.info.</li>
        </ul>

        <h2 className="mt-4 mb-2 text-xl font-semibold">5. Uso permitido</h2>
        <ul className="pl-6 mb-4 list-disc">
            <li>No usar la plataforma para rifas ilegales, fraudulentas o que violen la legislación vigente.</li>
            <li>No suplantar identidades ni compartir datos falsos.</li>
            <li>Respetar los derechos de propiedad intelectual de Riffas.info.</li>
        </ul>

        <h2 className="mt-4 mb-2 text-xl font-semibold">6. Limitación de responsabilidad</h2>
        <ul className="pl-6 mb-4 list-disc">
            <li>Riffas.info no se hace responsable de incumplimientos por parte de organizadores en la entrega de premios.</li>
            <li>No responde por pérdidas económicas ocasionadas por mal uso de la plataforma.</li>
            <li>Pueden existir interrupciones temporales del servicio por mantenimiento o causas técnicas.</li>
        </ul>

        <h2 className="mt-4 mb-2 text-xl font-semibold">7. Modificaciones</h2>
        <p className="mb-4">
            Riffas.info puede actualizar estos términos y lo notificará a los usuarios en caso de cambios importantes.
        </p>

        <h2 className="mt-4 mb-2 text-xl font-semibold">8. Contacto</h2>
        <p>
            Para consultas o reclamos: <br />
            📩 
            <a href="mailto:sectsandia@gmail.com" className="text-blue-600 underline">
            sectsandia@gmail.com
            </a>
        </p>
        </section>
    );
    }

export default TermsAndConditionsView;
