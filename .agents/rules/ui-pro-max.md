# UI PRO MAX

Esta regla define el estándar para generar y estructurar *nuevas pantallas o vistas* desde cero.

Cuando se te pida crear una nueva pantalla (ej. un panel de CRM, una vista de detalle de vehículo, una landing de captación), aplica los siguientes principios arquitectónicos y visuales para obtener una UI de nivel profesional (Pro Max):

## 1. Arquitectura de Pantalla (Layout)
- **Grid y Bento Box:** Utiliza CSS Grid para layouts complejos. Los layouts tipo "Bento Box" (múltiples paneles de diferentes tamaños que encajan perfectamente) dan un aspecto ultra-moderno.
- **Jerarquía Visual Clara:** El tamaño de fuente y el peso deben guiar el ojo. Un H1 gigante, subtítulos sutiles y texto de apoyo.
- **Espacio Negativo (Whitespace):** Respira. Usa generosos `gap`, `padding` y `margin` (e.g. `p-8`, `gap-6`, `mb-12`). El amontonamiento es el enemigo del diseño premium.

## 2. Componentes Premium
- **Glassmorphism & Blurs:** Usa fondos semitransparentes con desenfoque (`backdrop-blur-md`, `bg-white/5` en modo oscuro) para tarjetas que floten sobre fondos sutiles.
- **Bordes y Sombras:** Las tarjetas deben tener bordes muy sutiles (`border border-white/10` o `border-gray-200`) y sombras difusas (`shadow-xl` con colores teñidos, no negro puro).
- **Esquinas Redondeadas:** Mantén un radio de borde consistente, generalmente `rounded-2xl` o `rounded-3xl` para componentes contenedores grandes, y `rounded-lg` para botones.

## 3. Estados Cero y Carga
- Nunca asumas que siempre hay datos. Diseña "Empty States" hermosos (con ilustraciones SVG o iconos grandes, y un CTA claro).
- Diseña estados de carga asíncronos mediante Skeletons que imiten la estructura real, no simples spinners centrados.

## 4. Diseño Orientado a Componentes
- Al generar una pantalla, divídela en componentes de React lógicos y modulares inmediatamente, en lugar de un archivo monolítico de 500 líneas.
- Construye "Mobile First". Verifica que en `flex-col` se vea tan bien como en `md:flex-row`.
