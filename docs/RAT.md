# RAT — Registro de Actividades de Tratamiento

## AURA (Reputación Digital para Restaurantes)

**Responsable:** Jose (auraonlinebox@gmail.com)
**Fecha:** Julio 2026

---

### 1. Tratamiento: CAPTACIÓN DE CLIENTES (ACTUAL)

| Campo | Valor |
|---|---|
| **Finalidad** | Contactar con restaurantes interesados en AURA, ofrecer demo e información comercial |
| **Base legal** | Consentimiento explícito (art. 6.1.a RGPD) |
| **Categorías de interesados** | Propietarios/gerentes de restaurantes |
| **Datos tratados** | Nombre, email, teléfono, nombre del restaurante, fecha, consentimiento |
| **Categorías de datos** | Identificativos, de contacto |
| **Origen de datos** | Formulario web voluntario |
| **Destinatarios** | No se ceden datos a terceros |
| **Transferencias internacionales** | No (Google Cloud UE) |
| **Plazo conservación** | 12 meses desde última interacción o hasta solicitud de supresión |
| **Medidas seguridad** | Acceso restringido con credenciales Google, autenticación en 2 factores |
| **Soporte** | Google Sheets (Google Cloud, servidores UE) |

---

### 2. Tratamiento: GESTIÓN DE RESEÑAS (FUTURO)

| Campo | Valor |
|---|---|
| **Finalidad** | Generar respuestas automáticas a reseñas de Google de restaurantes clientes |
| **Base legal** | Interés legítimo (art. 6.1.f RGPD) + consentimiento del restaurante |
| **Categorías de interesados** | Clientes de los restaurantes (autores de reseñas) |
| **Datos tratados** | Nombre público del reseñador, texto de la reseña, puntuación |
| **Categorías de datos** | Identificativos (solo nombre público) |
| **Origen de datos** | Google Business Profile (vía API con autorización del restaurante) |
| **Destinatarios** | Google (Gemini AI para generar respuestas) |
| **Transferencias internacionales** | Posible tratamiento en servidores Google fuera UE (Gemini AI) — Cláusulas Contractuales Tipo |
| **Plazo conservación** | Mientras dure la relación contractual con el restaurante |
| **Medidas seguridad** | API con OAuth 2.0, acceso mínimo necesario, cifrado en tránsito |
| **Soporte** | Base de datos temporal + Google Gemini API |

---

### 3. Medidas técnicas y organizativas

- Acceso a datos limitado al responsable del tratamiento
- Cuenta Google con autenticación en 2 factores
- La hoja de cálculo no es accesible públicamente
- El formulario web se sirve sobre HTTPS
- Política de privacidad visible y consentimiento documentado
- Procedimiento de ejercicio de derechos (acceso, rectificación, supresión, etc.)

---

### 4. Derechos ARSULIPO

Para ejercer tus derechos: **auraonlinebox@gmail.com**

| Derecho | Descripción | Plazo |
|---|---|---|
| Acceso | Saber qué datos tenemos | 1 mes |
| Rectificación | Corregir datos erróneos | 1 mes |
| Supresión | Borrar tus datos | 1 mes |
| Limitación | Restringir el tratamiento | 1 mes |
| Portabilidad | Recibir datos en formato legible | 1 mes |
| Oposición | Oponerte al tratamiento | 1 mes |

---

### 5. Análisis de riesgos

| Riesgo | Probabilidad | Impacto | Medida |
|---|---|---|---|
| Acceso no autorizado a Sheet | Baja | Medio | 2FA + contraseña fuerte |
| Pérdida de datos | Baja | Bajo | Google Cloud backup |
| Brecha de datos por phishing | Media | Medio | Formación al responsable |
| Tratamiento sin consentimiento | Baja | Alto | Checkbox obligatorio validado |
