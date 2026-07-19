export default function AvisoLegalPage() {
  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-gray-100 bg-white/90 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <a href="/" className="flex items-center gap-2">
            <img src="/logo.svg?v=2" alt="AURA" className="h-12 sm:h-14" />
          </a>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-12 sm:py-16">
        <h1 className="text-3xl sm:text-4xl font-black text-gray-900 mb-8" style={{ fontFamily: 'Playfair Display, serif' }}>Aviso Legal</h1>

        <div className="prose prose-gray max-w-none space-y-6 text-sm leading-relaxed text-gray-600">

          <p><strong>Última actualización:</strong> Julio 2026</p>

          <h2 className="text-lg font-bold text-gray-900 mt-8">1. Titularidad</h2>
          <p>El presente Aviso Legal regula el uso del sitio web <strong>https://aura-online.es</strong> (en adelante, AURA), del que es titular:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li><strong>Titular:</strong> Ana Arroyo (en adelante, la prestadora)</li>
            <li><strong>Correo electrónico de contacto:</strong> auraonlinebox@gmail.com</li>
            <li><strong>NIF/CIF:</strong> Pendiente de alta como autónoma</li>
          </ul>
          <p>La prestadora se encuentra en proceso de alta como trabajadora autónoma. Mientras tanto, esta web opera como proyecto en fase de lanzamiento.</p>

          <h2 className="text-lg font-bold text-gray-900 mt-8">2. Objeto</h2>
          <p>AURA es una herramienta de gestión de reputación online que ofrece respuestas automatizadas a reseñas de Google para negocios. A través de esta web se facilita información sobre los servicios, así como un formulario de contacto para solicitar información.</p>

          <h2 className="text-lg font-bold text-gray-900 mt-8">3. Propiedad intelectual</h2>
          <p>Todos los contenidos de esta web (textos, logotipos, diseño, imágenes, código fuente) son propiedad de la prestadora, salvo que se indique lo contrario. Queda prohibida la reproducción, distribución o modificación sin autorización expresa.</p>

          <h2 className="text-lg font-bold text-gray-900 mt-8">4. Exención de responsabilidad</h2>
          <p>La prestadora no se hace responsable de los daños o perjuicios que pudieran derivarse del uso incorrecto de esta web o de los servicios ofrecidos. Tampoco se responsabiliza de los contenidos enlazados a través de redes sociales u otros servicios externos.</p>

          <h2 className="text-lg font-bold text-gray-900 mt-8">5. Legislación aplicable</h2>
          <p>Este Aviso Legal se rige por la legislación española, en particular por la <strong>Ley 34/2002, de 11 de julio, de Servicios de la Sociedad de la Información y de Comercio Electrónico (LSSI-CE)</strong> y el <strong>Reglamento General de Protección de Datos (RGPD)</strong>.</p>

          <h2 className="text-lg font-bold text-gray-900 mt-8">6. Contacto</h2>
          <p>Para cualquier consulta, puedes escribirnos a: <strong>auraonlinebox@gmail.com</strong>.</p>
        </div>
      </main>

      <footer className="bg-white py-8 border-t border-gray-100">
        <div className="max-w-4xl mx-auto px-4 text-center text-xs text-gray-400">
          <a href="/" className="inline-block mb-3">
            <img src="/logo.svg?v=2" alt="AURA" className="h-10 mx-auto" />
          </a>
          <a href="/" className="hover:text-gray-600">Volver a AURA</a>
        </div>
      </footer>
    </div>
  );
}
