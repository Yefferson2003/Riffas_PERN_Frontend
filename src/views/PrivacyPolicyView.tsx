function PrivacyPolicyView() {
  return (
    <section className="w-full h-full max-w-4xl p-6 mx-auto leading-relaxed text-gray-800">
      <h1 className="mb-4 text-2xl font-bold">Políticas de Privacidad: Riffas.info</h1>
      <p className="mb-6">
        En <strong>Riffas.info</strong> nos tomamos muy en serio tu privacidad. Este documento explica cómo recopilamos, usamos y protegemos tu información personal.
      </p>

      <h2 className="mt-4 mb-2 text-xl font-semibold">1. Información que recopilamos</h2>
      <ul className="pl-6 mb-4 list-disc">
        <li>Datos de registro: nombre, correo electrónico, número de teléfono y contraseña.</li>
        <li>Información de uso: rifas creadas, números vendidos, pagos registrados.</li>
        <li>Datos de contacto: para envío de notificaciones (WhatsApp, email).</li>
      </ul>

      <h2 className="mt-4 mb-2 text-xl font-semibold">2. Uso de la información</h2>
      <p>Utilizamos tus datos para:</p>
      <ul className="pl-6 mb-4 list-disc">
        <li>Permitir la creación, administración y control de rifas.</li>
        <li>Facilitar comunicación entre organizadores y participantes.</li>
        <li>Enviar notificaciones automáticas relacionadas con tus rifas.</li>
        <li>Cumplir obligaciones legales o fiscales aplicables.</li>
      </ul>

      <h2 className="mt-4 mb-2 text-xl font-semibold">3. Protección de datos</h2>
      <ul className="pl-6 mb-4 list-disc">
        <li>Almacenamos la información en servidores seguros.</li>
        <li>Aplicamos medidas técnicas y administrativas para proteger tus datos.</li>
        <li>Nunca compartimos tu información con terceros no autorizados.</li>
      </ul>

      <h2 className="mt-4 mb-2 text-xl font-semibold">4. Cookies</h2>
      <p className="mb-4">
        Riffas.info puede usar cookies para mejorar tu experiencia de navegación y personalizar contenido publicitario.
      </p>

      <h2 className="mt-4 mb-2 text-xl font-semibold">5. Derechos del usuario</h2>
      <p>Puedes solicitar en cualquier momento:</p>
      <ul className="pl-6 mb-4 list-disc">
        <li>Acceder, corregir o eliminar tus datos personales.</li>
        <li>Retirar el consentimiento para recibir notificaciones.</li>
      </ul>

      <p className="mt-6">
        📩 Para ejercer estos derechos, contáctanos en:{" "}
        <a href="mailto:sectsandia@gmail.com" className="text-blue-600 underline">
          sectsandia@gmail.com
        </a>
      </p>
    </section>
  );
}

export default PrivacyPolicyView;
