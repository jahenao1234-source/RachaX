# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

**Usuario principal: "el que empieza con todo y abandona".** Adulto hispanohablante de 22 a 40 años (Colombia primero, luego Latinoamérica), que trabaja o estudia y usa mucho el celular. Ha intentado muchas veces cambiar hábitos (propósitos de enero, "empiezo el lunes", apps en inglés, agendas) y abandona a las pocas semanas. Se describe como "no soy constante", "tengo la cabeza en mil cosas", "empiezo todo y no termino nada". Siente culpa y desconfianza en sí mismo. Lo que quiere de verdad es sentir que cumple lo que se propone.

**Sub-nicho con potencial: "cabezas que se dispersan".** Personas que se identifican con rasgos de déficit de atención (con o sin diagnóstico), a quienes les cuesta arrancar tareas grandes. Para ellas son clave las tareas divididas en pasos y ver un solo paso a la vez.

Su trabajo con la app: saber qué hacer ahora, cumplir sus pocos hábitos del día, dividir tareas que aplazan y volver después de un mal día sin sentir que perdió todo.

Nota: el avatar sale de investigación de mercado (septiembre 2026); falta validarlo con clientes reales.

## Product Purpose

Racha es un sistema para **no abandonar lo que empiezas**. No se vende como "otro tracker de hábitos" sino como una solución contra el abandono: método + herramienta + acompañamiento. El éxito es que el usuario siga usando la app después del primer mes y retome tras fallar, en lugar de soltarlo todo.

Base de evidencia que respalda el producto:
- Fallar un día no afecta de forma importante la formación de un hábito; lo que la impide es fallar dos o más días por semana de forma sostenida (Lally et al., UCL, 2010).
- El "efecto ¡a la porra!" (abstinence violation effect): un desliz produce culpa y la persona abandona el objetivo completo.
- Las intenciones de implementación ("Después de ___, haré ___") tienen un efecto medio-grande en el logro de metas (Gollwitzer y Sheeran, 2006, d = 0,65).
- Seguir demasiados hábitos a la vez aumenta el abandono.

## Positioning

Frente a apps que "organizan toda tu vida" (por ejemplo Huella) o que solo cuentan rachas (Streaks, HabitNow, Habitica), Racha es **el especialista en no abandonar**: la racha no se rompe por un mal día (comodines), los hábitos se anclan a cosas que ya haces, las tareas grandes se dividen en pasos infinitos y el modo Foco muestra un solo paso a la vez. Mide la **constancia** ("21 de 30 días") por encima de la racha perfecta. Nativa en español.

Frase de posicionamiento: "Huella te ayuda a organizar tu vida. Racha te ayuda a no abandonar lo que empiezas."

## Operating Context

- Se usa sobre todo en el celular, varias veces al día y en momentos cortos (mañana, tarde, noche), a veces con prisa o sin energía.
- En el celular es una PWA instalable desde el navegador; en PC se usa como plataforma web en el navegador, sin instalar.
- Se venderá como producto digital (pago único) acompañado de un PDF con el método ("Método Anti-Abandono") y bonos: rutinas listas para importar, una biblioteca de tareas ya divididas en pasos y un "Protocolo de Rescate" para el día después de fallar.
- Canal previsto: anuncios en Instagram hacia una página de ventas; plataforma de cobro por decidir (Hotmart u otra).

## Capabilities and Constraints

**Existe hoy (React 19 + TypeScript + Vite + Tailwind 4, PWA):**
- Hábitos a hacer y a evitar, categorías, momentos del día (mañana, tarde, noche, todo el día), frecuencia diaria / entre semana / personalizada / N veces por semana, metas numéricas (ej. 8 vasos), anclajes, archivar y reordenar.
- Plantillas de hábitos, rutinas, tareas con subtareas anidadas sin límite, modo Foco (día, rutina o tarea).
- Comodines para congelar un día sin romper la racha (límite mensual).
- Estadísticas, calendario de calor, tasa de éxito, 8 insignias, onboarding.
- Exportar e importar datos (JSON). Layout de escritorio con barra lateral.

**Limitaciones actuales:**
- Los datos viven solo en el navegador (localStorage): sin cuentas, sin sincronización entre celular y PC.
- No hay control de acceso: cualquiera con el enlace puede usarla.
- El campo "recordatorio" existe pero no envía notificaciones reales.
- La app no usa Gemini ni ninguna IA todavía (la dependencia @google/genai es un resto de la plantilla de AI Studio).

**Hoja de ruta:**
- Fase 0 (requisito para vender): cuentas y datos en la nube con sincronización, acceso solo para compradores conectado al pago, recordatorios push.
- Fase 1 (lanzamiento): modo rescate y métrica de constancia, versión mínima de cada hábito, diagnóstico inicial con rueda de la vida (máximo 3 hábitos), arranque de 60 segundos y cierre del día, arranque de 2 minutos en modo Foco, centro de tutoriales, Academia del método, modo claro.
- Fase 2: IA con créditos ("Divídelo por mí", coach de rescate, resumen semanal), revisión semanal, programas y retos de 30 días, "¿para qué lo hago?", tareas con día asignado.

**Por decidir:** proveedor de base de datos y autenticación, plataforma de cobro, precio final (hipótesis: USD 19–24 pago único de lanzamiento), dominio y hosting.

**Terminología:** hábito, rutina, tarea, subtarea/paso, comodín, racha, constancia, momento del día, anclaje, modo Foco, misiones, nivel, puntos, insignias.

## Brand Commitments

- Nombre: **Racha**. Se reencuadra como "tu racha no se rompe por un mal día".
- Idioma: español, cercano y neutro-latino (tuteo). Nada de voseo.
- Voz **sin culpa**: nunca regañar ni asustar ("retoma hoy", "un día gris no borra los demás"). Nada de "para no romper tus rachas".
- El componente de juego (nivel, puntos, misiones, insignias) se mantiene porque al dueño le gusta, pero siempre subordinado a la tarea del momento.
- Nunca afirmar que la app trata, cura o diagnostica el TDAH ni ninguna condición médica.
- Sin urgencia falsa ni escasez inventada (contadores que se reinician, "quedan 3 cupos" permanentes, avisos falsos de compras). Publicidad veraz según la Ley 1480 de 2011 (Estatuto del Consumidor, Colombia).
- No mostrar un "precio anterior" que nunca existió.

## Evidence on Hand

- Investigación de mercado y de avatar (septiembre 2026), con fuentes académicas citadas arriba.
- Análisis de un competidor directo en español (Huella Pro, USD 14,99, pago único).
- **No hay todavía:** testimonios, clientes, métricas de uso, casos de éxito ni capturas de usuarios reales. No inventarlos; usar marcadores como [TESTIMONIO REAL] hasta tenerlos.

## Product Principles

1. **Constancia antes que perfección.** Mostrar "cumpliste 21 de 30" antes que la racha; un fallo nunca devuelve a cero en la experiencia del usuario.
2. **Una sola cosa ahora.** Cada pantalla responde primero a "¿qué hago ahora?"; lo demás espera.
3. **Pocos hábitos, bien anclados.** Empujar hacia máximo 3 hábitos al inicio y anclarlos a rutinas existentes.
4. **Especialista, no navaja suiza.** Cada función nueva debe ayudar a no abandonar o a retomar tras fallar; si solo sirve para "organizar más cosas", no entra.
5. **Solo prometer lo que la app mide.** Toda cifra de marketing debe poder mostrarse dentro de la app.

## Accessibility & Inclusion

- Pensada para usuarios que se abruman o se dispersan: baja carga cognitiva, textos cortos, un paso a la vez.
- Contraste de texto mínimo 4.5:1, objetivos táctiles de al menos 44px, respetar `prefers-reduced-motion`.
- Modo claro y oscuro según la configuración del sistema del teléfono.
