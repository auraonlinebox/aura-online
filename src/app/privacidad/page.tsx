'use client';

import Link from 'next/link';

export default function PrivacidadPage() {
  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-gray-100 bg-white/90 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <img src="/logo.svg" alt="AURA" className="h-12 sm:h-14" />
          </Link>
        </div>
      </header>

      <main className="max-4xl mx-auto px-4 py-12 sm:py-16">
        <h1 className="text-3xl sm:text-4xl font-black text-gray-900 mb-8" style={{ fontFamily: 'Playfair Display, serif' }}>Política de Privacidad</h1>

        <div className="prose prose-gray max-w-none space-y-6 text-sm leading-relaxed text-gray-600">

          <p><strong>Última actualización:</strong> Julio 2026</p>

          <h2 className="text-lg font-bold text-gray-900 mt-8">1. Responsable del tratamiento</h2>
          <p>El responsable del tratamiento de los datos personales recogidos a través de esta web es <strong>AURA (Reputación Digital para Restaurantes)</strong>, con correo de contacto: <strong>auraonlinebox@gmail.com</strong>.</p>
          <p>AURA es una herramienta de gestión de reputación online para restaurantes. Los datos recogidos se utilizan exclusivamente para contactar con restaurantes interesados en nuestros servicios.</p>

          <h2 className="text-lg font-bold text-gray-900 mt-8">2. Finalidad del tratamiento</h2>
          <p>Los datos personales que nos proporciones a través del formulario de contacto se utilizarán únicamente para:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Gestionar tu solicitud de información sobre AURA.</li>
            <li>Contactarte para ofrecerte una demo o información comercial sobre nuestros servicios.</li>
            <li>Enviarte comunicaciones relacionadas con tu solicitud.</li>
          </ul>
          <p>En ningún caso utilizaremos tus datos para fines distintos sin obtener tu consentimiento previo.</p>

          <h2 className="text-lg font-bold text-gray-900 mt-8">3. Base legal del tratamiento</h2>
          <p>La base legal para el tratamiento de tus datos es tu <strong>consentimiento explícito</strong>, manifestado al marcar la casilla de aceptación de esta política de privacidad al enviar el formulario.</p>

          <h2 className="text-lg font-bold text-gray-900 mt-8">4. Datos recogidos</h2>
          <p>Los datos que recogemos son exclusivamente los que nos proporcionas voluntariamente:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Nombre</li>
            <li>Dirección de correo electrónico</li>
            <li>Nombre del restaurante</li>
            <li>Teléfono (si se proporciona)</li>
          </ul>

          <h2 className="text-lg font-bold text-gray-900 mt-8">5. Conservación de los datos</h2>
          <p>Tus datos se conservarán mientras exista un interés mutuo por nuestros servicios o hasta que solicites su eliminación. Una vez finalizada la relación, tus datos se eliminarán en un plazo máximo de 12 meses.</p>

          <h2 className="text-lg font-bold text-gray-900 mt-8">6. Destinatarios de los datos</h2>
          <p>Tus datos se almacenan en <strong>Google Sheets</strong> (infraestructura de Google Cloud, con servidores en la Unión Europea) y no se ceden a terceros salvo obligación legal.</p>

          <h2 className="text-lg font-bold text-gray-900 mt-8">7. Tus derechos</h2>
          <p>Puedes ejercer en cualquier momento tus derechos de:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li><strong>Acceso:</strong> Saber qué datos tenemos tuyos.</li>
            <li><strong>Rectificación:</strong> Corregir datos inexactos.</li>
            <li><strong>Supresión:</strong> Solicitar que eliminemos tus datos.</li>
            <li><strong>Limitación:</strong> Restringir el tratamiento de tus datos.</li>
            <li><strong>Portabilidad:</strong> Recibir tus datos en un formato estructurado.</li>
            <li><strong>Oposición:</strong> Oponerte al tratamiento de tus datos.</li>
          </ul>
          <p>Para ejercer cualquiera de estos derechos, escríbenos a: <strong>auraonlinebox@gmail.com</strong>. También tienes derecho a presentar una reclamación ante la <strong>Agencia Española de Protección de Datos (AEPD)</strong>.</p>

          <h2 className="text-lg font-bold text-gray-900 mt-8">8. Medidas de seguridad</h2>
          <p>Adoptamos las medidas técnicas y organizativas necesarias para garantizar la seguridad de tus datos personales y evitar su alteración, pérdida, tratamiento o acceso no autorizado. La hoja de cálculo donde se almacenan los datos está protegida con las credenciales de acceso de Google y solo es accesible por el responsable del tratamiento.</p>

          <h2 className="text-lg font-bold text-gray-900 mt-8">9. Contacto</h2>
          <p>Si tienes cualquier duda sobre esta política de privacidad, puedes contactarnos en: <strong>auraonlinebox@gmail.com</strong>.</p>
        </div>
      </main>

      <footer className="bg-white py-8 border-t border-gray-100">
        <div className="max-w-4xl mx-auto px-4 text-center text-xs text-gray-400">
          <a href="/" className="inline-block mb-3">
            <img src="/logo.svg" alt="AURA" className="h-10 mx-auto" />
          </a>
          <Link href="/" className="hover:text-gray-600">Volver a AURA</Link>
        </div>
      </footer>
    </div>
  );
}
