# IMPECABLE

Esta regla entra en acción cuando se pide "pulir", "dar últimos retoques", o hacer que algo quede "impecable". Se centra en los micro-detalles que separan un buen diseño de uno excepcional.

## 1. Pixel-Perfect y Alineación Estricta
- Verifica que todos los elementos estén alineados ópticamente. Centrado absoluto (`items-center`, `justify-center`) donde corresponda.
- El espaciado de iconos con respecto al texto debe ser exacto (ej. `gap-2` y `items-center`).
- Evita saltos de línea huérfanos o viudas en tipografía mediante `text-balance` o `whitespace-nowrap` en lugares críticos.

## 2. Micro-interacciones y Estados de Hover
- **Todo elemento interactivo** (botones, tarjetas de vehículos, enlaces) DEBE tener una transición suave (`transition-all duration-300`).
- Agrega sutiles efectos de escala en hover (`hover:-translate-y-1 hover:shadow-2xl`) a las tarjetas principales.
- Los botones deben tener estados `:active` (`active:scale-95`) y `:disabled` (opacidad reducida, cursor de no-permitido).

## 3. Accesibilidad Oculta (A11y)
- Un diseño impecable funciona para todos. Añade anillos de foco hermosos (`focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none`) en todos los elementos de formulario y botones.
- Mejora el contraste donde sea débil (texto secundario muy claro, etc.).

## 4. Pulido de Contenido
- Asegúrate de que los textos largos tengan `leading-relaxed` (line-height) para legibilidad.
- Ajusta el kerning/tracking (`tracking-tight` para encabezados grandes, `tracking-wide` para overlines en mayúsculas).
- Revisa desbordamientos visuales: asegura que textos largos se trunquen con puntos suspensivos (`truncate` o `line-clamp-2`) en vez de romper la tarjeta.
