

export default function WhatsAppView() {
	return (
		<div style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 0' }}>
			<div
				style={{
					width: '100%',
					maxWidth: 420,
					padding: 32,
					textAlign: 'center',
					borderRadius: 24,
					background: 'linear-gradient(135deg, #e0e7ef 0%, #b2f0c7 100%)',
					boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
					color: '#222',
					animation: 'fade-in 1s',
				}}
			>
				<div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
					<svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" fill="#25d366" viewBox="0 0 24 24" style={{ filter: 'drop-shadow(0 2px 6px #25d36688)' }}>
						<path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.198.297-.767.967-.94 1.166-.173.198-.347.223-.644.075-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.151-.174.2-.298.3-.497.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.5-.669-.51-.173-.008-.372-.01-.571-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.099 3.2 5.077 4.363.71.306 1.263.489 1.694.626.712.227 1.36.195 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.288.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.617h-.001a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.999-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.455 4.437-9.89 9.893-9.89 2.64 0 5.122 1.029 6.988 2.896a9.825 9.825 0 0 1 2.896 6.994c-.003 5.455-4.438 9.89-9.893 9.89m8.413-18.304A11.815 11.815 0 0 0 12.05 0C5.495 0 .06 5.435.057 12.086c0 2.13.557 4.213 1.615 6.044L.057 24l6.084-1.627a11.888 11.888 0 0 0 5.909 1.507h.005c6.554 0 11.89-5.435 11.893-12.086a11.82 11.82 0 0 0-3.483-8.382" />
					</svg>
				</div>
				<h1 style={{ fontSize: 26, fontWeight: 700, marginBottom: 10, color: '#1a3a2b' }}>¡Grandes Actualizaciones en Camino!</h1>
				<p style={{ marginBottom: 18, color: '#222', fontSize: 17 }}>
					Estamos trabajando en nuevas funcionalidades y mejoras para brindarte una experiencia más completa y eficiente.
				</p>
				<ul style={{ maxWidth: 320, margin: '0 auto 18px auto', textAlign: 'left', color: '#1a3a2b', fontSize: 16, lineHeight: 1.6, paddingLeft: 24 }}>
					<li>Mejoras de rendimiento</li>
					<li>Nuevas herramientas para gestión de rifas</li>
					<li>Y mucho más...</li>
				</ul>
				<div style={{ marginTop: 20 }}>
					<span style={{ display: 'inline-block', background: '#e6ffe6', color: '#218838', fontWeight: 600, borderRadius: 999, padding: '8px 22px', fontSize: 15, boxShadow: '0 2px 8px #b2f0c7aa', animation: 'pulse 1.5s infinite alternate' }}>
						¡Disponible en la próxima actualización!
					</span>
				</div>
			</div>
		</div>
	);
}
