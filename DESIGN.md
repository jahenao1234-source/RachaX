---
name: Racha
description: El sistema para no abandonar lo que empiezas. Oscuro, sobrio y con logros que acompañan sin gritar.
colors:
  bg: "#0F1113"
  surface: "#181B1F"
  surface-raised: "#22262C"
  line: "#2A2F36"
  line-strong: "#3A4048"
  text: "#F1F3F5"
  text-muted: "#98A0AA"
  ink: "#0F1113"
  ambar: "#FFB547"
  ambar-tint: "#2B2419"
  lila: "#8E9BFF"
  lila-tint: "#1F2233"
  lila-ink: "#262B55"
  comodin-bg: "#1B1F2E"
  comodin-text: "#C9CFFF"
  coral: "#FF7A59"
  coral-tint: "#2A211F"
  track: "#23272D"
  track-empty: "#33383F"
  danger: "#F87171"
  danger-light: "#C62828"
  bg-light: "#F6F7F8"
  surface-light: "#FFFFFF"
  surface-raised-light: "#EEF0F2"
  line-light: "#E1E4E8"
  text-light: "#15181B"
  text-muted-light: "#5D6570"
  lila-strong-light: "#4F5BD5"
  coral-strong-light: "#D9492A"
  ambar-strong-light: "#A56200"
  ambar-tint-light: "#FFF1DB"
  lila-tint-light: "#ECEEFF"
  coral-tint-light: "#FFE9E2"
  track-light: "#E3E6EA"
  track-empty-light: "#D5D9DE"
  comodin-bg-light: "#EEF0FF"
  comodin-text-light: "#3F4BC0"
typography:
  display:
    fontFamily: "Barlow Condensed, Arial Narrow, sans-serif"
    fontSize: "44px"
    fontWeight: 700
    lineHeight: 1
    letterSpacing: "0.005em"
  celebration:
    fontFamily: "Barlow Condensed, Arial Narrow, sans-serif"
    fontSize: "28px"
    fontWeight: 700
    lineHeight: 1.05
  sheet-title:
    fontFamily: "Barlow Condensed, Arial Narrow, sans-serif"
    fontSize: "24px"
    fontWeight: 700
    lineHeight: 1.05
  headline:
    fontFamily: "Barlow Condensed, Arial Narrow, sans-serif"
    fontSize: "22px"
    fontWeight: 700
    lineHeight: 1.05
  title:
    fontFamily: "Barlow Condensed, Arial Narrow, sans-serif"
    fontSize: "20px"
    fontWeight: 700
    lineHeight: 1.1
  number:
    fontFamily: "Barlow Condensed, Arial Narrow, sans-serif"
    fontSize: "17px"
    fontWeight: 700
    lineHeight: 1
    fontFeature: "tnum"
  body:
    fontFamily: "Barlow, system-ui, sans-serif"
    fontSize: "15px"
    fontWeight: 500
    lineHeight: 1.35
  body-strong:
    fontFamily: "Barlow, system-ui, sans-serif"
    fontSize: "15px"
    fontWeight: 600
    lineHeight: 1.35
  score:
    fontFamily: "Barlow Condensed, Arial Narrow, sans-serif"
    fontSize: "18px"
    fontWeight: 700
    lineHeight: 1
    fontFeature: "tnum"
  button:
    fontFamily: "Barlow, system-ui, sans-serif"
    fontSize: "14px"
    fontWeight: 700
    lineHeight: 1.2
  label:
    fontFamily: "Barlow, system-ui, sans-serif"
    fontSize: "13px"
    fontWeight: 500
    lineHeight: 1.3
  caption:
    fontFamily: "Barlow, system-ui, sans-serif"
    fontSize: "12px"
    fontWeight: 600
    lineHeight: 1.2
  micro:
    fontFamily: "Barlow, system-ui, sans-serif"
    fontSize: "11px"
    fontWeight: 600
    lineHeight: 1.2
rounded:
  xs: "6px"
  sm: "10px"
  tile: "11px"
  md: "12px"
  row: "14px"
  lg: "18px"
  full: "999px"
spacing:
  xxs: "4px"
  xs: "8px"
  sm: "12px"
  md: "16px"
  gutter: "20px"
components:
  button-primary:
    backgroundColor: "{colors.ambar}"
    textColor: "{colors.ink}"
    typography: "{typography.body-strong}"
    rounded: "{rounded.md}"
    height: "44px"
    padding: "0 16px"
  button-on-accent:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.text}"
    typography: "{typography.body-strong}"
    rounded: "{rounded.md}"
    height: "44px"
    padding: "0 16px"
  button-secondary:
    backgroundColor: "{colors.surface-raised}"
    textColor: "{colors.text}"
    typography: "{typography.body-strong}"
    rounded: "{rounded.sm}"
    height: "32px"
    padding: "0 12px"
  button-create:
    backgroundColor: "{colors.ambar}"
    textColor: "{colors.ink}"
    rounded: "{rounded.full}"
    size: "54px"
  check-toggle:
    backgroundColor: "transparent"
    rounded: "{rounded.full}"
    size: "32px"
  check-toggle-done:
    backgroundColor: "{colors.ambar}"
    textColor: "{colors.ink}"
    rounded: "{rounded.full}"
    size: "32px"
  habit-row:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text}"
    rounded: "{rounded.row}"
    padding: "10px 12px"
  icon-tile:
    backgroundColor: "{colors.surface-raised}"
    rounded: "{rounded.tile}"
    size: "38px"
  today-card:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text}"
    rounded: "{rounded.lg}"
    padding: "14px"
  next-row:
    backgroundColor: "{colors.lila-tint}"
    textColor: "{colors.text}"
    rounded: "{rounded.row}"
    padding: "10px 12px"
  group-icon:
    backgroundColor: "{colors.surface-raised}"
    rounded: "{rounded.sm}"
    size: "26px"
  day-tile-done:
    backgroundColor: "{colors.ambar}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    height: "52px"
  day-tile-missed:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text-muted}"
    rounded: "{rounded.md}"
    height: "52px"
  day-tile-comodin:
    backgroundColor: "{colors.comodin-bg}"
    textColor: "{colors.comodin-text}"
    rounded: "{rounded.md}"
    height: "52px"
  level-pill:
    backgroundColor: "{colors.lila}"
    textColor: "{colors.ink}"
    typography: "{typography.title}"
    rounded: "{rounded.xs}"
    padding: "2px 8px"
  chip:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text}"
    typography: "{typography.label}"
    rounded: "{rounded.full}"
    padding: "6px 11px"
---

# Design System: Racha

<!-- Diseño aprobado el 2026-09-21. Maquetas aprobadas (referencia visual exacta): design/maqueta-hoy.html (Hoy v2: grupos por momento y tarjeta Tu día), design/maqueta-gestionar.html (Gestionar hábitos, oscuro y claro) y design/maqueta-crear.html (Crear / editar hábito v5 con reto, 2026-09-22) y design/maqueta-detalle.html (Detalle del hábito v2, 2026-09-22) y design/maqueta-calendario.html (Calendario v2, 2026-09-22) y design/maqueta-progreso.html (Progreso v1 y Tu mes del Calendario con %, 2026-09-22) y design/maqueta-perfil.html (Perfil v2, 2026-09-23). El código todavía usa el diseño anterior: al migrar una pantalla, esta es la fuente de verdad. Cuando todo esté migrado, re-ejecutar /impeccable document para capturar los tokens reales y generar .impeccable/design.json. -->

## Overview

**Creative North Star: "El marcador que no te castiga"**

Racha es un tablero de juego sobrio: grafito oscuro, números condensados como de marcador deportivo y un solo color cálido (ámbar) que marca lo que ya lograste. Se siente como llevar la cuenta de un partido que vas ganando, no como un juez que anota tus faltas. La app existe para que la gente **no abandone**, así que cada pantalla responde primero a "¿qué hago ahora?" y después celebra el progreso.

El juego (nivel, puntos, misiones, insignias) está presente pero en segundo plano: acompaña la tarea, nunca compite con ella. Los fallos se muestran en gris neutro, jamás en rojo, porque un día perdido no borra los días cumplidos. La densidad es media: pocos bloques por pantalla, cada uno con un propósito.

Referencias rechazadas: el look anterior (fondo casi negro con un único violeta neón y halos brillantes), la estética genérica de apps hechas con IA, y cualquier diseño que haga sentir culpa.

**Key Characteristics:**
- Grafito oscuro con superficies en capas tonales, sin sombras decorativas.
- Números y títulos en Barlow Condensed, estilo marcador.
- Ámbar = logrado. Lila = nivel, comodines y noche. Coral = tarde.
- Los hábitos se agrupan por momento del día; el siguiente pendiente se destaca dentro de su grupo, nunca duplicado fuera de la lista.
- Lo hecho se queda a la vista, tachado y en ámbar: ver lo cumplido es la recompensa.

## Colors

Grafito neutro con tres acentos que **significan algo**; ningún color es decorativo.

### Primary
- **Ámbar Logro** (ambar): días cumplidos, hábitos completados, botón Crear, barra de insignias, acción principal. Es el color de "ya lo hiciste". Texto sobre ámbar siempre en ink.
- **Color de tus logros (elegible):** el usuario puede cambiar el color de logro en Perfil. Las opciones son Ámbar (por defecto), Jade, Rosa y Lima; todas pasan AA y no chocan con el lila (comodín/noche), el coral (tarde) ni el rojo (borrar). Cambian SOLO los tokens de logro (ambar, ambar-text, ambar-tint): lo cumplido, los botones principales y el "+". NO cambian el logo (brand, siempre #FFB547) ni el color de la Mañana (tokens manana propios, siempre ámbar).
  | Opción | Relleno (ambar) | Texto oscuro (ambar-text) | Tinte oscuro | Texto claro (ambar-text) | Tinte claro |
  |---|---|---|---|---|---|
  | Ámbar | #FFB547 | #FFB547 | #2B2419 | #A56200 | #FFF1DB |
  | Jade | #43D9A3 | #43D9A3 | #14261F | #0B7A52 | #DDF5EA |
  | Rosa | #F59AC4 | #F59AC4 | #2A1C24 | #A8356E | #FCE6F0 |
  | Lima | #C5E25A | #C5E25A | #22271A | #5A6E0F | #EEF6D2 |

### Secondary
- **Lila Nivel** (lila): pastilla de nivel, barra de puntos, comodines, hábitos de la noche, el enlace "Siguiente" de la tarjeta Tu día y el resaltado de la fila siguiente. Texto secundario sobre lila en lila-ink.

### Tertiary
- **Coral Tarde** (coral): identifica los hábitos de la tarde (íconos, encabezado del grupo Tarde y resaltado de la fila siguiente cuando es de la tarde). No se usa para errores.

### Neutral
- **Grafito Noche** (bg): fondo de toda la app.
- **Grafito Superficie** (surface): filas de hábitos, días no cumplidos, chips.
- **Grafito Elevado** (surface-raised): cuadritos de ícono, botones secundarios.
- **Línea** (line) y **Línea fuerte** (line-strong): bordes finos y el aro de los checks sin marcar.
- **Tiza** (text) y **Tiza apagada** (text-muted): texto principal y secundario. Nunca un gris más claro que text-muted para texto (contraste mínimo 4.5:1).
- **Pistas** (track, track-empty): fondo de barras de progreso y vasos vacíos.
- **Peligro** (danger): SOLO para acciones destructivas (eliminar, reiniciar datos). Nunca para fallos de hábitos.

### Momento del día
| Momento | Color del ícono | Fondo del cuadrito |
|---|---|---|
| Mañana | manana (#FFB547; texto claro #A56200) | manana-tint (#2B2419; claro #FFF1DB). Fijo: no cambia con el color de logros |
| Todo el día | text | surface-raised |
| Tarde | coral | coral-tint |
| Noche | lila | lila-tint |

### Modo claro
Por defecto la app sigue el modo del sistema del teléfono ("Automático"); en Perfil › Apariencia se puede fijar Claro u Oscuro. En claro se usan los tokens `-light`: fondo bg-light, superficies surface-light / surface-raised-light, texto text-light / text-muted-light. Los rellenos ámbar, lila y coral se mantienen (texto ink encima); cuando el acento se usa como **texto o ícono sobre fondo claro** se usa su variante `-strong-light` para cumplir contraste. Los valores claros son propuesta inicial: validarlos en pantalla al implementar.

**Todo token tiene su pareja clara.** En modo claro, cada tinte y pista cambia a su versión `-light`: ambar-tint → ambar-tint-light, lila-tint → lila-tint-light, coral-tint → coral-tint-light, track → track-light, track-empty → track-empty-light, comodin-bg → comodin-bg-light, comodin-text → comodin-text-light, y surface-raised → surface-raised-light. Ningún fondo oscuro del modo oscuro puede quedar visible en modo claro. Sobre un tinte claro, el texto va en text-light y los íconos en la variante `-strong-light` de su acento.

### Named Rules
**The Grey Day Rule.** Un día o hábito no cumplido se pinta en surface con texto text-muted. Nunca rojo, nunca tachado, nunca un ícono de error. El rojo existe solo para borrar cosas.

**The Meaning Rule.** Cada acento tiene un significado fijo (ámbar logrado, lila nivel/noche, coral tarde). Si un color no comunica estado o momento, no va.

## Typography

**Display Font:** Barlow Condensed (con Arial Narrow, sans-serif)
**Body Font:** Barlow (con system-ui, sans-serif)

**Character:** Barlow Condensed aporta el aire de marcador deportivo en fechas, números y títulos; Barlow, su hermana regular, mantiene el texto de uso diario limpio y legible. Una sola familia en dos anchos, cero disonancia.

### Hierarchy
- **Display** (700, 44px, 1): la fecha del día ("Lunes 21"). Una por pantalla.
- **Celebration** (700, 28px, 1.05): el título de un logro cumplido ("Reto cumplido: 30 días"). Solo en hojas de celebración.
- **Headline** (700, 22px, 1.05): títulos de bloque de Hoy ("Tu día", "Misiones").
- **Title** (700, 20px, 1.1): títulos de sección ("Misiones"), pastilla de nivel.
- **Number** (700, 17px, cifras tabulares): números de días, puntos, contadores.
- **Body** (500, 15px, 1.35) y **Body strong** (600): nombres de hábitos y botones.
- **Score** (700, 18px, Barlow Condensed, cifras tabulares): puntos destacados ("+10 pts hoy").
- **Button** (700, 14px): texto de botones compactos ("2 min", "+1").
- **Label** (500, 13px): metadatos ("Tarde · 1 de 3 esta semana"), ayudas.
- **Caption** (600, 12px): letras de los días, la palabra "ahora" y textos cortos auxiliares.
- **Input** (500, 16px): texto dentro de campos de formulario (evita el zoom automático de iOS).
- **Micro** (600, 11px): etiquetas de la barra de navegación y la etiqueta "Sigue". Nada más pequeño que 11px.

### Named Rules
**The Scoreboard Rule.** Toda cifra que el usuario deba leer de un vistazo (días, puntos, 21/30) va en Barlow Condensed con cifras tabulares.

**The No Eyebrow Rule.** Nada de etiquetas pequeñas en mayúsculas encima de un título. El título habla solo.

## Layout

Diseño móvil primero, ancho de referencia 390px, margen lateral de 20px (gutter). Entre bloques de la pantalla 14–16px; dentro de listas 8px entre filas. La barra de navegación inferior mide 82px y queda fija; el contenido nunca queda tapado por ella.

Orden de la pantalla Hoy (de arriba a abajo, idéntico a design/maqueta-hoy.html): nivel y barra de puntos → fecha con el chip de comodines a la derecha y "Misiones de hoy: X de Y" → últimos 7 días con constancia del mes → tarjeta "Tu día" → título "Misiones" → grupos por momento del día en el orden guardado por el usuario (por defecto Mañana, Tarde, Noche, Todo el día), cada uno con sus hábitos pendientes y cumplidos → progreso de la próxima insignia → Rutinas y Tareas. Entre grupos 16px; entre filas de un grupo 8px. El logo vive solo en la barra superior global de la app, nunca repetido dentro de la pantalla.

Escritorio (≥1024px, pendiente de diseñar): tres columnas; menú lateral a la izquierda, Hoy al centro y un panel fijo a la derecha con el calendario de constancia del mes, la tarea en curso y la próxima insignia. No estirar la columna móvil.

## Elevation & Depth

Sistema plano con capas tonales: la profundidad se expresa pasando de bg a surface a surface-raised, no con sombras. No hay sombras en reposo, ni halos de color, ni resplandores. La única excepción permitida es una sombra suave y desplazada (`0 8px 24px rgba(0,0,0,0.35)`) en hojas modales que se superponen a la pantalla.

### Named Rules
**The No Glow Rule.** Ningún elemento brilla. Nada de sombras de color sin desplazamiento ni blur de fondo decorativo.

## Shapes

Esquinas suavemente redondeadas y consistentes por tamaño: pastillas de nivel 6px, botones y cuadritos 10–12px, filas 14px, tarjetas 18px, chips y botones circulares totalmente redondos. Bordes de 1px en line solo cuando una superficie necesita separarse de otra igual; el día de hoy usa borde discontinuo de 1.5px en text.

## Components

### Buttons
- **Primary** (button-primary): ámbar con texto ink, 44px de alto. Para la acción principal fuera de tarjetas de color.
- **Sobre acento** (button-on-accent): ink con texto tiza, para acciones dentro de superficies de acento.
- **Arranque "Empezar"**: botón secundario de 44px con ícono de play relleno que abre el modo Foco. Dice **"Empezar"**, nunca un tiempo: la app no sabe cuánto tarda cada hábito y prometer "2 min" era inventarlo. En la fila siguiente de Hoy lleva borde y texto en el color del momento; en Detalle del hábito es un botón secundario normal (surface-raised).
- **Contorno sobre acento**: transparente con borde ink al 45% ("Solo 2 min").
- **Secondary** (button-secondary): surface-raised con borde line, 32px; contadores como "+1".
- **Crear** (button-create): círculo ámbar de 54px con un "+" ink, centrado en la barra inferior.
- **Hover / Focus / Active:** hover aclara el fondo un paso; foco visible con anillo de 2px en lila separado 2px; al presionar escala 0.97. Transiciones de 150–200ms con ease-out.

### Chips
- **Comodines** (chip): surface con borde line, ícono escudo en lila, texto "2 comodines".
- **Insignia en progreso**: surface-raised con ícono de medalla en ámbar.

### Cards / Containers
- **Fila de hábito** (habit-row): surface, esquinas 14px, padding 10px 12px. Contiene a la izquierda un **cuadrito de ícono** (icon-tile, 38px, fondo tinte del momento, ícono lucide en el color del momento), al centro nombre (body strong) y metadato (label, text-muted), y a la derecha puntos "+10" en text-muted y el check. El metadato muestra el anclaje si existe ("después de cenar"; en hábitos a evitar "evitar · cuando me siente a trabajar"). Si el hábito tiene reto, debajo va la barra del reto (ver Reto).
- **Tarjeta "Tu día"** (today-card): surface con borde line, esquinas 18px, padding 14px, 10px entre líneas. Línea 1: "Tu día" en headline a la izquierda y "+N pts hoy" en Barlow Condensed ámbar a la derecha. Línea 2: una barra de segmentos, uno por cada hábito programado hoy (flex, 12px de alto, 4px de separación, esquinas 4px), en el mismo orden que la lista; cumplido = ámbar, pendiente = track. Línea 3: "X de Y · te quedan Z" en label text-muted a la izquierda y el enlace "Siguiente: [hábito] ↓" en lila (label, 700) a la derecha, que desplaza suavemente la pantalla hasta la fila siguiente y la resalta un instante. Con todo cumplido, la línea 3 muestra un mensaje breve de día completo y la barra queda toda en ámbar.
- **Grupo por momento**: encabezado con cuadrito de 26px (group-icon, fondo tinte del momento, ícono del momento en su color: amanecer para Mañana, sol para Tarde, luna para Noche, reloj para Todo el día), nombre en Barlow Condensed 17px, la palabra "ahora" en lila 12px junto al grupo del momento actual del día, contador "X/Y" en label, mini barra de 44×5px (relleno en el color del momento) y chevron para plegar. Plegar es por grupo y se recuerda. Un grupo sin hábitos hoy no se muestra.
- **Fila siguiente** (next-row): el primer hábito pendiente del momento actual (si no hay, del siguiente momento; al final los de Todo el día) se resalta dentro de su grupo: fondo tinte del momento, contorno de 1.5px en el color del momento, cuadrito de ícono relleno con el color del momento e ícono en ink, etiqueta "Sigue" (11px, 700, fondo del color del momento, texto ink, esquinas 6px) junto al nombre, botón "2 min" y el check con borde del color del momento. Solo hay una fila siguiente en toda la pantalla.

### Inputs / Fields
- **Style:** surface con borde line, esquinas 12px, texto body, placeholder text-muted.
- **Focus:** borde lila de 1.5px, sin resplandor.
- **Error:** mensaje en label debajo del campo que nombra el problema y cómo arreglarlo; borde danger solo en formularios, nunca en hábitos.

### Navigation
- **Barra inferior (móvil):** fondo bg con línea superior en line, 82px. Cuatro destinos (Hoy, Progreso, Calendario, Perfil; la pestaña se llama "Progreso", nunca "Estadísticas") con ícono lucide de 22px y etiqueta micro; activo en text, inactivos en text-muted. Botón Crear al centro.
- **Menú lateral (escritorio):** pendiente de diseñar, mismos destinos y estados.

### Check de hábito
- **Sin marcar** (check-toggle): círculo de 32px, borde 2px line-strong, fondo transparente.
- **Marcado** (check-toggle-done): círculo ámbar con ✓ en ink. Al marcar: relleno con escala 0.9→1 en 180ms, sin rebote. Suma los puntos con un "+10" breve junto al nivel.

### Últimos 7 días
Siete casillas de 52px: cumplido = ámbar con texto ink; no cumplido = surface con text-muted (The Grey Day Rule); comodín usado = comodin-bg con borde lila de 1.5px y escudo; hoy = transparente con borde discontinuo en text. Debajo: una frase sin culpa a la izquierda ("Un día sin cumplir no borra los demás.") y "21/30 del mes" a la derecha.

### Nivel y puntos
Pastilla "Nivel N" (level-pill) + barra de 8px (track con relleno lila) + "680 / 1000" en label con cifras tabulares.

### Hábito cumplido
Un hábito completado NO desaparece ni cambia de posición: se queda en su lugar dentro de Misiones para que el usuario vea lo que ya logró. Estado cumplido: check ámbar relleno con ✓ en ink, nombre tachado en text-muted (tachado de 1.5px en text-muted), metadato reemplazado por "+10 ganados" en ámbar, y el cuadrito de ícono conserva su color de momento. Al marcar, el check se rellena con escala 0.9→1 en 180ms (sin rebote). Tocar el check otra vez lo desmarca.

### Barra de agua y metas numéricas
Hábitos con meta diaria (ej. 8 vasos) muestran segmentos de 16×6px (llenos en text, vacíos en track-empty) y un botón secundario "+1".

### Hojas (bottom sheets)
Las pantallas secundarias que se abren sobre otra (Gestionar hábitos y similares) son hojas que suben desde abajo: fondo bg, esquinas superiores de 22px, borde superior en line, sombra de hoja (`0 -8px 24px rgba(0,0,0,0.35)`), una manija de 40×5px en line-strong arriba, y detrás un velo (negro al 60% en oscuro, ink al 35% en claro). Encabezado: título en Barlow Condensed 24px, una línea de ayuda en label text-muted y el botón cerrar circular de 44px (surface-raised, ícono X de 16px en text-muted; 44px es el tamaño táctil mínimo). Si hay acción principal, va fija abajo en un pie con línea superior en line: botón primario ámbar de 48px a todo el ancho.

**The Explicit Save Rule.** En hojas donde se editan cosas (como el orden en Gestionar hábitos), los cambios no se aplican hasta tocar "Guardar cambios". El botón está apagado (fondo surface-raised, texto text-muted) mientras no haya cambios, y se enciende en ámbar con la línea de aviso "Cambiaste el orden. Se aplicará al guardar." (label, text-muted, centrada) encima. Cerrar con la X, tocar el velo o salir a otra pantalla con cambios pendientes abre la hoja de confirmación "¿Descartar los cambios?" (título en headline, explicación en body text-muted, botones de 48px: "Seguir editando" secundario y "Descartar" con borde y texto danger). Sin cambios pendientes, cerrar es directo. Las acciones con botón propio (Restaurar, Eliminar) siguen siendo inmediatas.

**The Flat Sheet Rule.** Dentro de una hoja no hay tarjetas: las filas son planas y se separan con una línea de 1px en line (la última fila de cada grupo sin línea). Tarjetas dentro de tarjetas quedan prohibidas.

### Fila de gestión (Gestionar hábitos)
Fila plana de 10px de alto de relleno vertical: asa ⋮⋮ en text-muted (22×32px, zona de arrastre), cuadrito de ícono de 38px con el ícono del hábito en el color de su momento, nombre (body-strong) y debajo una línea label con: frecuencia legible · meta si existe · constancia en ámbar (ambar-text). Chevron a la derecha: toda la fila abre el detalle del hábito. Los hábitos a evitar llevan la etiqueta "Evitar" (11px, 700, fondo surface-raised, texto text-muted, esquinas 6px) antes de la frecuencia.
- **Frecuencia legible:** "Diario", "Lun a vie" (entre semana), días abreviados para personalizados ("Lun, Mié, Vie"), "N por semana" (semanal). Meta: "Meta: N" (la app no guarda unidad; no inventarla).
- **Constancia por hábito:** "C/P días", donde P = días programados para ese hábito en los últimos 30 días (sin contar días anteriores a su creación, y sin contar hoy si todavía no se ha completado) y C = días de P completados o congelados con comodín. Para semanales se muestra "N de M esta semana". Nunca la racha con llama en esta pantalla.
- **Arrastrando:** la fila que se mueve se resalta con una franja plana a todo el ancho de la hoja (fondo surface-raised, sin sombra ni esquinas).
- **Sin botón Crear en esta hoja:** para crear está el "+" de la barra inferior. Solo el estado vacío (sin ningún hábito) muestra "Crear mi primer hábito".
- **Encabezado de grupo:** asa ⋮⋮ para arrastrar el grupo completo, cuadrito del momento (26px), nombre en Barlow Condensed 17px y "N hábitos" a la derecha. El orden de los grupos y de los hábitos es el mismo que usa Hoy.
- **Archivados:** grupo plegable al final con ícono de archivo en text-muted; cada fila con ícono y nombre en text-muted, "Guarda su historial", botón secundario "Restaurar" y botón cuadrado de 32px con papelera en danger. Eliminar siempre pide confirmación.
- El nombre del momento flexible es siempre **"Todo el día"** en toda la app (nunca "En cualquier momento").

### Crear / editar hábito
Pantalla completa (no hoja), porque el formulario es largo: capa fija que tapa la barra superior y la inferior. Encabezado con el título ("Nuevo hábito" / "Editar hábito", Barlow Condensed 24px) a la izquierda y el botón cerrar de 44px a la derecha, con línea inferior en line. Referencia exacta: design/maqueta-crear.html.
- **Orden:** ideas rápidas (solo al crear y solo mientras el nombre está vacío) → Nombre (cuadrito de ícono de 52px con el tinte del momento y un distintivo de lápiz; al tocarlo abre la hoja "Elige un ícono") → Quiero (Hacerlo / Evitarlo) → Momento del día (4 tarjetas de 64px; el ícono de cada momento siempre en su color; la elegida con fondo tinte, borde de 1.5px en el color del momento y texto en negrita) → anclaje → Frecuencia (Diario / Lun a vie / Elegir días / Por semana) → Meta (plegada detrás de "+ Añadir meta"; se oculta con Evitarlo) → Reto. Sin categorías: se quitaron de toda la app (no llevaban a ninguna decisión), así que ya no hay "Más opciones".
- **Color concentrado:** el color solo vive en el cuadrito del ícono, las 4 tarjetas de momento y la vista previa. Todo lo demás elegido (segmentos, días, chips) es neutro: fondo surface-raised, texto text en negrita y borde de 1px en text al 60%. No hay selector de color: el color del hábito es el de su momento.
- **Anclaje:** con Hacerlo, "¿Después de qué?" con el prefijo "Después de" y 3 sugerencias según el momento (Mañana: despertarme, tomar café, bañarme · Tarde: almorzar, salir del trabajo, llegar a casa · Noche: cenar, lavarme los dientes, acostarme · Todo el día: despertarme, almorzar, cenar). Con Evitarlo, "¿Cuándo te cuesta más?" con el prefijo "Cuando" (Mañana: me despierte, tome el celular, salga de casa · Tarde: me siente a trabajar, me aburra, termine de almorzar · Noche: me acueste, esté en el sofá, termine de cenar · Todo el día: me aburra, esté cansado, me estrese).
- **Vista previa "Así se verá en Hoy"** en el pie fijo, encima del botón: encabezado mínimo del grupo (ícono del momento en su color + nombre) y la fila compacta de Hoy (cuadrito de 32px, nombre, segunda línea con el anclaje, "+10" y el check), con la barra del reto si hay. Con el teclado abierto se pliega a una línea.
- **Botón del pie:** al crear, apagado con el texto "Escribe un nombre para crear" hasta que haya nombre; después "+ Crear hábito" en ámbar. Al editar sigue la Explicit Save Rule con el aviso que nombra todo lo que cambió ("Cambiaste el momento y el anclaje. Se aplicará al guardar."). Cerrar con datos escritos o cambios abre "¿Descartar los cambios?". "Archivar hábito" es un enlace en text-muted al final del formulario al editar.
- **Todo lo tocable mide al menos 44px** (segmentos, días, chips, botones − y +, cerrar).
- **Cierre al crear:** hoja sobre Hoy con check ámbar de 44px, "Listo, ya está en tu día", una frase que dice dónde lo verá ("Lo verás en Noche, después de cenar."), la fila tal como quedó, un solo botón primario "Ver en Hoy" y el enlace "Crear otro hábito".
- **Hoja "Elige un ícono":** 24 íconos en 4 grupos de 6 (General, Salud y cuerpo, Mente y relaciones, Casa y vida), en el color del momento; el elegido con fondo tinte y borde de 1.5px. Sin sol, luna, amanecer, reloj ni check (se confunden con los momentos y el check). Al tocar uno se elige y la hoja se cierra.

### Detalle del hábito
Pantalla completa a la que se llega tocando un hábito. Referencia exacta: design/maqueta-detalle.html. Orden: identidad → estado de hoy → Tu constancia → Reto → racha → calendario de 30 días → progreso de la insignia → enlaces de archivar y eliminar. Botón fijo abajo: "Editar hábito" en ámbar.
- **Encabezado:** botón volver de 44px. Al desplazar más allá de la identidad, el encabezado muestra el cuadrito del momento (26px) y el nombre del hábito en Barlow Condensed 20px, con línea inferior en line. Nunca se pierde de vista de qué hábito se trata.
- **Identidad:** cuadrito de 52px con el tinte del momento, nombre en Barlow Condensed 24px (sheet-title) y debajo una línea label con momento · frecuencia · anclaje. Los hábitos a evitar llevan la etiqueta "Evitar" en su propia línea, antes del metadato.
- **Estado de hoy:** fila de surface con el check de 44px (aro de 2px en el color del momento, ámbar relleno cuando está cumplido), el texto "Pendiente hoy" con la ayuda "Toca el círculo para marcarlo" o "Cumplido hoy" con "+10 ganados" en ámbar, y el botón "Empezar". Con meta numérica muestra "5 de 8 hoy", los segmentos y el botón "+1", igual que en Hoy.
- **Tu constancia:** tarjeta con la cifra en display 44px ("17") y "de 21" en 20px text-muted, más la explicación "días programados que cumpliste, con N congelados con comodín. Un día gris no borra los demás." La cifra y el calendario salen del mismo cálculo: P = días programados de los últimos 30 sin contar hoy, C = cumplidos más congelados con comodín. **Primero la constancia, después la racha.**
- **Racha:** fila fina con la llama en ámbar, "N días seguidos" (en los de evitar, "sin recaer") y "Mejor: N" a la derecha. No se muestra hasta que haya al menos 2 días.
- **Calendario de 30 días:** 7 columnas alineadas por día de la semana, con encabezado L M X J V S D, para que se vea el patrón (los días libres de un "Lun a vie" quedan en columna). Va directo sobre el fondo, nunca dentro de una tarjeta, para que los estados se distingan. Celdas de 44px: cumplido = ámbar con el número en ink y borde del mismo ámbar; sin cumplir = surface con el número en text-muted (Grey Day Rule); comodín = comodin-bg con borde de 1.5px en lila, escudo pequeño arriba a la derecha y el número visible; día libre = transparente con borde discontinuo en text-muted (el borde en line no llega a 3:1) y número en text-muted; hoy = transparente con borde discontinuo de 1.5px en text. Cada celda lleva aria-label con el día y su estado. Debajo, una leyenda de los cuatro estados.
- **Tocar un día sin cumplir** abre una hoja con el nombre del día y dos salidas: "Sí lo cumplí" (botón ámbar) y "Congelar con un comodín · te quedan N" (secundario), más "Dejarlo como está". Es el rescate del día después de fallar.
- **Hábito recién creado:** nunca se muestra "0 de 0" ni la racha en cero. La constancia dice "Empieza hoy" con la explicación "Tu primer día cuenta desde hoy", y en vez del calendario de 30 días se muestra solo la semana en curso con "Aquí se irán llenando tus días cumplidos".
- **Final de la pantalla:** el progreso de la próxima insignia (ícono de medalla en ámbar, barra y "faltan N") antes de los enlaces. "Archivar hábito" en text-muted y "Eliminar hábito" en danger. La pantalla nunca termina en una acción destructiva sin nada después.
- **Eliminar:** hoja que nombra la pérdida en la moneda del usuario ("Se borrarán sus 83 días cumplidos y su reto") y empuja a la salida suave: "Mejor archivarlo" como botón principal, "Eliminar los N días" como enlace en danger y "Cancelar" debajo.

### Calendario
Pestaña principal con un solo trabajo: ver el mes completo de todos los hábitos juntos y corregir días pasados. Referencia exacta: design/maqueta-calendario.html. No hay filtro por hábito (eso vive en Detalle del hábito).
- **Cabecera:** nombre del mes en display 44px y el año debajo en label text-muted; a la derecha, flechas de 44px (la de mes siguiente deshabilitada en el mes actual). En un mes pasado aparece el botón secundario "Ir a hoy" (44px) antes de las flechas. Debajo, "Toca un día para cambiarlo" y, solo en el mes actual, el chip de comodines que quedan.
- **Cuadrícula:** idéntica a la del Detalle: 7 columnas L M X J V S D, celdas de 44px, esquinas 10px, número de 14px con cifras tabulares. Estados de cada día (todos los hábitos de ese día juntos):
  - todo cumplido = ámbar con número ink y borde ambar-text;
  - una parte = surface, número en text y una barrita de 4px abajo (pista track-empty, relleno ambar-text) proporcional a lo cumplido;
  - nada cumplido = surface con número en text-muted, sin barrita (Grey Day Rule);
  - congelado con comodín = comodin-bg, borde 1.5px lila-text, escudo arriba a la derecha;
  - día libre (ningún hábito ese día) = transparente, borde discontinuo en text-muted;
  - hoy = borde discontinuo de 1.5px en text (con barrita si ya hay algo);
  - días futuros y días anteriores al primer hábito = solo el número en text-muted, sin caja, no se pueden tocar. El primer día con hábitos lleva un borde interior de 1.5px en ambar-text y debajo la línea "Empezaste el N de mes. Los días de antes no cuentan." (13px, text-muted), solo si el primer hábito se creó dentro del mes que se ve y no el día 1.
  - Leyenda debajo: Todo cumplido · Una parte · Comodín · Día libre · Hoy.
- **Tu mes:** tarjeta con "Tu mes" y "sin contar hoy" a la derecha; la cifra display es el **% del mes** ("88%", en text) y debajo "79 de 93 veces cumpliste tus hábitos programados. Las 3 congeladas con comodín no cuentan en contra. Un día gris no borra los demás." (la frase de congeladas solo si hay). % = cumplidos ÷ (programados − pendientes congelados), la misma cuenta que "Este mes" en Progreso. Debajo, solo los contadores que aplican: "N días completos" (si N ≥ 1) y "N seguidos, tu mejor racha" (mejor racha de días completos del mes, si N ≥ 2; misma regla que la racha global: un día congelado no la corta pero tampoco suma). Cuenta: se suman los hábitos programados de cada día del mes hasta ayer; los pendientes de un día congelado se cuentan aparte como congelados, nunca como cumplidos. Congelar un día no cambia ninguna de las dos cifras (cumplidos ni programados); solo suma congeladas. Los hábitos semanales no entran en esta cuenta.
  - **Mes difícil:** si hubo 3 o más días seguidos sin nada cumplido y después un día con algo, arriba de la cifra va la línea "Volviste el N. Eso es lo que cuenta." (fondo ambar-tint, ✓ en ambar-text).
  - **Sin nada cumplido en el mes:** en vez de la cifra, "Retoma hoy" en display y "Cada día que marques se suma aquí." Nunca un 0 como dato principal.
- **Hoja del día** (al tocar un día pasado o hoy): título con el día ("Martes 15 de septiembre") y "N de M cumplidos · se guarda al tocar". La hoja se abre por encima de la barra inferior. Lista plana de los hábitos que tocaban ese día, en el mismo orden que en Hoy (momentos y luego su orden): tocar la fila entera marca o desmarca (aro de 44px con borde en text-muted; marcado en ámbar con ✓ en ink, nombre tachado y "+10 ganados" en ámbar); los de meta llevan −/+ de 44px (el − se apaga en 0); una flecha de 44px a la derecha abre el Detalle del hábito. Los cambios se guardan al instante.
- **Hábitos semanales ("N por semana"):** no tocan un día fijo, así que no pintan el color ni la barrita de ningún día ni cuentan en Tu mes. En la hoja del día aparecen aparte, al final, bajo "Esta semana, cuando quieras" (13px, 600, text-muted), con "N de M esta semana" debajo del nombre, y se marcan igual que los demás. Solo si el hábito ya existía ese día.
- **Comodín en la hoja:** solo en días pasados con algo pendiente. Botón secundario "Congelar los N que faltan · te quedan M" (con 1: "Congelar el que falta · te quedan M") (congela el día; lo ya cumplido sigue cumplido) y la ayuda "Si ese día no pudiste, congélalos: no cuentan como fallados." Día congelado: recuadro lila "Congelaste lo que faltaba, así que no cuenta como fallado. Si al final sí lo cumpliste, márcalo igual." y el enlace "Quitar el comodín · vuelve a tu saldo". Sin comodines: botón deshabilitado "No te quedan comodines este mes" y "Se recargan el 1 de {mes siguiente}. Puedes marcar lo que sí cumpliste."

### Progreso
Pestaña que responde "¿voy mejorando?" y "¿qué me cuesta?". Referencia exacta: design/maqueta-progreso.html. Todo se cuenta hasta ayer ("sin contar hoy"). Sin categorías, sin selector de periodo y sin gráficos de barras por día (si cumples siempre, se ven todas iguales).
- **Cabecera:** "Progreso" en display 44px y debajo "Desde el {fecha del primer hábito} · sin contar hoy".
- **Fuerza de tus hábitos (tarjeta):** cifra display "84" con "de 100" en 20px text-muted y a la derecha el chip "+11 en 30 días" (flecha arriba, ambar-text sobre ambar-tint; en modo claro, fondo transparente con contorno de 1px en ambar-text para pasar AA). Si bajó: "−4 en 30 días" en text-muted sobre surface-raised, sin flecha. Debajo, la curva: SVG con líneas guía en 50 y 100 (line), base en line-strong, área en ambar-tint, línea de 2.5px en ambar-text, punto final ambar-text con borde surface, meses abreviados en el eje (11px text-muted). Texto: "Sube cada día que cumples y un día gris solo la baja un poco. Cuanto más alta, más firme el hábito."; si bajó, "Bajó un poco, y así funciona: baja despacio. Con unos días seguidos vuelve a subir."; desde 90, "Tus hábitos ya están firmes. Ahora toca mantenerlos: cada vez que cumples sigue sumando en tus récords."
  - **Cálculo (idea de Loop Habit Tracker):** por hábito, media móvil exponencial sobre sus días programados desde que se creó: fuerza = fuerza × m + (1 si cumplido, 0 si no) × (1 − m), con m = 0.5^(1/13). Los días libres no cuentan y un día congelado sin cumplir no cambia nada. Semanales: se actualiza una vez por semana cerrada con min(1, hechas ÷ meta) y m = 0.5^(1/4). La fuerza total es el promedio de los hábitos activos que ya existían ese día (× 100, redondeado).
- **Este mes:** dos filas, el mes actual (nombre en 15px/600, barra de 8px con relleno ambar-text, % en 20px condensado) y el anterior en text-muted con relleno text-muted. Frase: "Subiste de 83% a 88%." / "Igual que en agosto." / con 1 o 2 puntos menos, "Casi igual que en agosto." / con 3 o más menos, "Vas en 54%; en agosto ibas en 67%. Un mes flojo no borra lo que ya construiste." Nunca "puntos" (esa palabra es de la gamificación). Se oculta si el mes anterior no tuvo nada programado.
- **Tus hábitos:** "de menor a mayor fuerza". Filas planas: cuadrito del momento, nombre, "N% este mes" (semanales: "N de M esta semana"), la fuerza en 24px condensado con "fuerza" debajo y un chevrón decorativo. Toda la fila es un solo botón que abre el Detalle.
- **Dónde puedes mejorar** ("últimos 30 días"): 
  - "Por día de la semana": 7 columnas L…D con pista track-empty de 84px, relleno text-muted y el % arriba; el día más bajo con relleno y números en text, contorno de 1.5px en text. Frase: "Los sábados te cuestan más (67%). Entre semana vas en 93%. Ayuda decidir desde el día antes a qué hora lo harás." Si la diferencia entre el mejor y el peor día es menor de 10: sin resaltado y "Tus días van parejos. Sigue así." Para lectores de pantalla, cada día se lee "los sábados: 67%, el más bajo".
  - "Por momento del día": una fila por momento con hábitos (cuadrito de 32px con su color, nombre, barra gris, %), el más bajo en negrita. Frase: "La noche es tu momento más difícil (74%). Prueba anclar esos hábitos a algo que ya haces siempre, como "después de cenar"." Misma regla de "parejos".
- **Tus récords (tarjeta, al final):** lista de pares: "Mejor racha de días completos" (N días), "Racha actual" (la racha global de siempre) y "Veces que cumpliste" (todas, incluidos los hábitos archivados). La mejor racha usa la misma regla que la racha global: congelado no corta ni suma.
- **Empezaste hace poco** (menos de 14 días desde el primer hábito): cabecera "Llevas N días y M veces cumplidas · sin contar hoy"; la fuerza con el chip "creciendo" y el texto "Todo hábito empieza en 0 y sube con cada día que cumples. En unas semanas verás la curva tomar forma."; en Dónde puedes mejorar, el aviso "Con 2 semanas de datos verás aquí qué días y qué momentos te cuestan más. Te faltan N días."; luego Tus hábitos. Sin Este mes ni récords.
- **Sin hábitos:** ícono de tendencia en text-muted, "Tu progreso empieza con un hábito" (26px), "Cuando cumplas unos días, aquí verás la fuerza de tus hábitos, tus récords y qué días te cuestan más." y el botón primario "Crear mi primer hábito".
- **Ámbar solo para lo logrado:** la curva, el chip que sube y el mes actual. Las barras de comparación van en gris.

### Perfil
Referencia exacta: design/maqueta-perfil.html. Orden: "Perfil" (display 44px) → tarjeta de identidad → Insignias → Tus hábitos → Apariencia → Tus datos → Ayuda. La pantalla nunca termina en la acción roja.
- **Identidad (tarjeta):** avatar de 56px neutro (surface-raised con la inicial en text, 28px condensada; sin nombre, ícono de persona), nombre en 28px condensado (sin nombre: "Sin nombre" en text-muted), "Desde el {fecha del primer hábito}" y a la derecha el botón lápiz de 44px ("Cambiar tu nombre" / "Añadir tu nombre"). Debajo, separado por una línea: pastilla "Nivel N" (lila) y "340 / 1000 puntos", la barra lila de 8px y "Cada hábito cumplido suma 10 puntos." El nivel es EXACTAMENTE el mismo de Hoy (calcularPuntosTotales / calcularNivel / calcularProgresoNivel).
- **Nombre:** opcional y solo local. Hoja "¿Cómo te llamamos?" con el campo "Tu nombre" (máx. 24, borde lila al enfocar), la ayuda "Solo se guarda en este celular. Puedes dejarlo vacío." y "Guardar".
- **Insignias:** "N de 8"; hasta 3 insignias conseguidas en tarjetas (círculo de 40px con tinte de logro); la **próxima** siempre es una que no puede bajar (acumulativas: veces cumplidas o hábitos creados, nunca de racha), con "faltan N", el requisito "· esta barra nunca baja" y su barra en color de logro; enlace "Ver todas las insignias".
- **Tus hábitos:** fila "Gestionar hábitos" con "N activos · M archivados".
- **Apariencia:** control segmentado Automático / Claro / Oscuro (seleccionado: surface-raised con contorno de 1.5px en text) y "Automático sigue el modo de tu celular."; debajo "Color de tus logros": 4 opciones de 76px (círculo de 32px con el color, ✓ ink en la elegida, contorno de 1.5px en text; en claro cada círculo lleva un aro de 1.5px en su texto claro) y "Pinta lo que ya cumpliste: días completos, hábitos marcados y el botón Crear."
- **Tus datos:** aviso "Tus datos viven solo en este celular. Guarda una copia de vez en cuando…"; filas sin flecha "Guardar una copia" ("Se descarga un archivo · la última, hace N días" / "aún no guardas ninguna"), "Recuperar una copia" y "Borrar todos los datos" en danger.
- **Borrar todo:** hoja de alerta "¿Borrar todos tus datos?" con lo que se pierde en números, botón primario "Guardar una copia primero", botón con borde danger "Borrar todo" y "Cancelar".
- **Recuperar una copia:** hoja de alerta "¿Reemplazar tus datos?" que compara la copia con lo actual y dice cuánto se perdería; primario "Guardar lo de ahora primero", borde danger "Reemplazar" y "Cancelar".
- **Ayuda:** fila "Cómo funciona Racha" (abre la guía del inicio).

### Sistema de juego
Aprobado el 23 sep 2026. Maquetas: design/maqueta-juego1.html (la llama y el reto semanal), design/maqueta-juego2.html (colección e insignias) y design/maqueta-juego3.html (celebraciones) y design/maqueta-cajas.html (cajas guardadas). Arte: design/llamas-vector.html y su fuente design/llamas-fuente.js. Reglas completas y números en Notion ("Sistema de juego (gamificación)"). Principio: premiar la constancia y el volver, nunca castigar; el juego acompaña, no tapa los hábitos.
- **La llama:** 10 etapas por nivel (Chispa 1, Brasa 3, Llama 5, Fogata 8, Fuego 12, Hoguera 16, Antorcha 20, Volcán 25, Sol 30, Estrella 40). Usa colores de marca fijos (no cambia con el color de logros) y nunca se apaga. La racha deja de usar el ícono de llama.
- **Niveles sin tope:** puntos totales para llegar al nivel n = 100·(n−1) + 25·(n−1)·(n−2). 10 puntos por hábito cumplido; el doble el día que vuelves tras 3 o más días grises (bono de regreso). La barra de nivel sigue en lila.
- **Reto semanal:** fila compacta en Hoy debajo de Tu día (nunca una tarjeta grande); al tocarla, hoja con 3 opciones salidas de tus datos (día, momento y hábito que más te cuestan), con una meta un paso por encima de lo que ya haces. Premio: +50 puntos, un comodín (tope 3) y una caja sorpresa. "Esta semana no" sin culpa; si no sale: "El reto pasado no salió. Te tengo uno nuevo."
- **Retos de un hábito:** 7 días = +100 y caja; 30 = +300, comodín, insignia y caja; 66 = +1000, llama Raíz, certificado y caja. En Crear/editar, el premio va en una línea discreta debajo de la razón de los 66 días.
- **Colección (40 llamas):** 10 etapas, 8 hazañas (premio de una insignia), 12 del mes (símbolo de cada mes; 80% ese mes) y 10 raras (IA, medallón oscuro: imágenes en public/llamas/raras/*.jpg con su fondo negro, recortadas en círculo con object-fit: cover y escala 1.1, sobre fondo #0A0A0C y aro de 1.5px; 1 de cada 20 cajas, una segura cada 15, nunca se repiten). Sin mar de candados: lo que tienes, lo siguiente y "+N por descubrir". Tu llama puede ser tu avatar.
- **Insignias:** 27 en 8 familias, ninguna se pierde (se guardan con su fecha aunque el dato baje); "30 mañanas" y "30 noches" cuentan los días en que cumpliste todos los hábitos de ese momento, no seguidos; Volviste cuenta máximo un regreso al mes; la llama Hielo es el premio de 100 días completos; los niveles ganados en relleno ámbar con texto ink, el siguiente con contorno en text, los demás discontinuos. Cada una trae una caja sorpresa.
- **Caja sorpresa:** siempre hay premio fijo; la caja es un extra y nunca se compra; toda caja trae algo (decisión del 24 sep): 1 de cada 20 una llama rara y las demás entre +10 y +50 puntos; nunca se abre sola (queda guardada hasta que la abras).
- **Cajas guardadas** (aprobado el 24 sep, design/maqueta-cajas.html): se abren desde una fila arriba de Tu colección que solo aparece si hay cajas ("2 cajas sorpresa · Ábrelas cuando quieras · Abrir las 2"); el enlace "Ver tu colección de llamas" del Perfil lleva debajo "N cajas sorpresa por abrir" en gris, sin punto rojo. Nunca en Hoy. Se abren todas de una vez con un solo resultado ("Tus 2 cajas trajeron +60 puntos"), nunca una tras otra; si sale una rara, tiene su propia celebración. Regla de la rara en "Qué trae la caja sorpresa": "Si en 15 cajas no te sale ninguna, la 15 la trae. Nunca se repiten."
- **Celebraciones:** una sola a la vez (orden: reto → llama que crece → insignia → nivel; el resto en una línea "También: …"); nunca encima del modo Foco ni mientras marcas hábitos. Sin halos, confeti ni rebotes: la llama o el ícono, grandes y solos. La llama del mes llega el día 1 del mes siguiente. "Tu mes en Racha" se ofrece solo si el mes fue de 50% o más y nunca muestra nombres de hábitos.

### Reto
Un reto opcional por hábito: **cuenta días cumplidos, no días de calendario**, y su barra **nunca baja**. Opciones: Sin reto, 7, 30 o 66 días (con "Por semana": 4, 8 o 12 semanas cumplidas). El 66 se explica como "en promedio, un hábito tarda unos 66 días en volverse automático, aunque varía mucho entre personas" (Lally et al., UCL). No usar el mito de los 21 días.
- **Cómo se escribe** (distinto de la constancia "C/P días"): "Reto de 30 días" antes del primer día cumplido y "Reto · 12 de 30" después.
- **Barra:** 6px, pista track-empty, relleno ámbar (en claro, ambar-strong-light para contraste), texto caption text-muted con cifras tabulares a la derecha. En Hoy va debajo de la fila del hábito; es la única adición a la fila de Hoy.
- **Ayudas en pantalla:** si la frecuencia no es diaria, la duración real ("Con 3 días por semana, son unas 10 semanas."); al editar con avance, "Si cambias o quitas el reto, no pierdes lo cumplido."
- **Reto cumplido:** hoja en Hoy (una sola vez) con estrella en círculo ámbar, "Reto cumplido: 30 días" en Barlow Condensed 28px, "30 días cumplidos en N semanas" en Barlow Condensed 17px ámbar, la frase sin culpa "No fue perfecto y no hacía falta: volviste cada vez.", la fila en estado cumplido, botón primario "Ir por N días" (el siguiente reto, sin reiniciar lo cumplido) y el enlace "Seguir sin reto". El hábito nunca desaparece al terminar un reto.

## Do's and Don'ts

### Do:
- **Do** mostrar primero la constancia ("21/30 del mes") y después la racha ("3 seguidos").
- **Do** agrupar los hábitos por momento del día y destacar un único hábito siguiente dentro de su grupo, sin duplicarlo fuera de la lista.
- **Do** dejar visibles los hábitos cumplidos, tachados y con "+10 ganados", en su misma posición.
- **Do** usar siempre los tokens de este archivo (variables CSS / tema de Tailwind), nunca colores hex escritos a mano en los componentes.
- **Do** usar íconos lucide de trazo 2px dentro de cuadritos de 38px.
- **Do** escribir mensajes sin culpa: "retoma hoy", "un día gris no borra los demás".
- **Do** respetar `prefers-reduced-motion` y mantener transiciones entre 150 y 250ms con ease-out.

### Don't:
- **Don't** usar rojo, tachados o íconos de error para hábitos o días no cumplidos.
- **Don't** mostrar "0 días" como dato principal en ningún lugar.
- **Don't** usar Inter, Space Grotesk, Roboto ni Geist.
- **Don't** usar animaciones de rebote o elásticas (animate-bounce).
- **Don't** usar halos de color, resplandores, texto con degradado ni fondos con blur decorativo.
- **Don't** poner etiquetas pequeñas en mayúsculas encima de los títulos.
- **Don't** usar emojis como íconos.
- **Don't** dejar que puntos, niveles o insignias ocupen más protagonismo que la tarea del momento.
