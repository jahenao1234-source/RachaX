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
  coral-strong-light: "#B8381C"
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

<!-- Diseño aprobado el 2026-09-21. Maquetas aprobadas (referencia visual exacta): design/maqueta-hoy.html (Hoy v2: grupos por momento y tarjeta Tu día), design/maqueta-onboarding.html (onboarding, 2026-09-25), design/maqueta-cuenta.html (tu cuenta, 2026-09-25), design/maqueta-gestionar.html (Gestionar hábitos, oscuro y claro) y design/maqueta-crear.html (Crear / editar hábito v5 con reto, 2026-09-22) y design/maqueta-detalle.html (Detalle del hábito v2, 2026-09-22) y design/maqueta-calendario.html (Calendario v2, 2026-09-22) y design/maqueta-progreso.html (Progreso v1 y Tu mes del Calendario con %, 2026-09-22) y design/maqueta-perfil.html (Perfil v2, 2026-09-23) y design/maqueta-hoy-completo.html (Hoy completo: rutinas dentro de su momento, Tareas de hoy y Hoy en escritorio, 2026-09-27) y design/maqueta-tareas.html (pestaña Tareas, celular y escritorio, 2026-09-27). El código todavía usa el diseño anterior: al migrar una pantalla, esta es la fuente de verdad. Cuando todo esté migrado, re-ejecutar /impeccable document para capturar los tokens reales y generar .impeccable/design.json. -->

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
- **Colores premium que se ganan por nivel** (aprobado el 24 sep, design/maqueta-colores.html): los 4 de arriba siguen libres; estos 7 llegan al subir de nivel y nunca se compran. Ningún nivel coincide con un cambio de etapa de la llama. Descartados por confundirse: Aurora (con Cielo), Plata y platino (con el gris de sin cumplir y el texto), Galaxia (con el lila), naranja (con el coral), verdes (con Jade) y marrones (con Bronce).
  | Color | Nivel | Acabado | Relleno (paradas del degradado, 135°) | Texto oscuro | Tinte oscuro | Texto claro | Tinte claro |
  |---|---|---|---|---|---|---|---|
  | Cielo | 6 | joya | #5CC8FF | #5CC8FF | #132430 | #0A6FA3 | #E0F3FD |
  | Fucsia | 10 | joya | #E879F9 | #E879F9 | #2A1A2D | #A1239F | #FBE8FD |
  | Bronce | 14 | metálico | #C07D52 0%, #F6C39B 38%, #D98E5F 62%, #B8744A 100% | #E3A277 | #2A2019 | #8A4B23 | #FBEADF |
  | Atardecer | 18 | degradado | #FFC06A, #FF9A8B 55%, #F57AB0 | #FF8FB8 | #2C1E22 | #B23A5E | #FFE8EA |
  | Ciruela | 23 | joya con brillo | #C8629F 0%, #E58CCB 38%, #D46AB0 62%, #C8629F 100% | #E07EC0 | #2B1B27 | #9C2F7E | #FAE6F3 |
  | Rubí | 28 | joya con brillo | #E8386D 0%, #FF7FA3 38%, #F2336E 62%, #E8386D 100% | #FF5C8A | #2E1A21 | #B3124A | #FDE4EC |
  | Oro | 35 | metálico | #D4A437 0%, #FFE7A0 38%, #F2C14E 62%, #B8892A 100% | #F2C94E | #2A2512 | #7A5A00 | #FFF4D4 |
  El token --ambar es el tono sólido (la parada del medio) y --logro el degradado. Con contención: el degradado va solo en el botón principal, el "+", el check, las muestras y la celebración; los días completos y las barras usan el tono sólido. En modo claro, las barras y los días completos usan el texto claro (para todos los colores, también Lima). En Perfil se ve solo el siguiente color por ganar, atenuado, con "Nivel N" y "El siguiente: nivel N (te faltan M)"; "Ver los colores por nivel" abre la escalera (los tuyos con "Usar" o "En uso", la línea "Estás en el nivel N" y los que faltan a color completo). Al subir al nivel de un color, la celebración trae "Desbloqueaste el color X · Para tus logros, en Perfil › Apariencia" con "Usarlo" (y luego "Deshacer").

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

Orden de la pantalla Hoy (de arriba a abajo, idéntico a design/maqueta-hoy.html): nivel y barra de puntos → fecha con el chip de comodines a la derecha y "Misiones de hoy: X de Y" → últimos 7 días con constancia del mes → tarjeta "Tu día" → título "Misiones" → grupos por momento del día en el orden guardado por el usuario (por defecto Mañana, Tarde, Noche, Todo el día), cada uno con sus rutinas (primero) y sus hábitos sueltos, pendientes y cumplidos → recuadro "Tareas de hoy" → progreso de la próxima insignia. Mientras no exista la pestaña Tareas, la lista completa de tareas sigue al final de Hoy (debajo de la insignia) y la antigua sección "Rutinas" desaparece. Entre grupos 16px; entre filas de un grupo 8px. El logo vive solo en la barra superior global de la app, nunca repetido dentro de la pantalla.

Escritorio (≥1024px, design/maqueta-hoy-completo.html marcos 5 a 7): menú lateral a la izquierda y el contenido centrado con ancho máximo de 1120px, en dos columnas: Misiones (flexible) y una columna derecha de 340px (280px si la pantalla mide menos de 1280px). Ver "Hoy en escritorio". No estirar la columna móvil.

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
- **Grupo por momento**: encabezado con cuadrito de 26px (group-icon, fondo tinte del momento, ícono del momento en su color: amanecer para Mañana, sol para Tarde, luna para Noche, reloj para Todo el día), nombre en Barlow Condensed 17px, la etiqueta "ahora" (12px, 700, fondo surface-raised, texto text, esquinas 6px) junto al nombre del grupo del momento actual, contador "X/Y" en label, mini barra de 44×5px (relleno en el color del momento) y chevron para plegar. Plegar es por grupo y se recuerda. Un grupo sin hábitos hoy no se muestra.
- **Fila siguiente** (next-row): el primer hábito pendiente del momento actual (si no hay, del siguiente momento; al final los de Todo el día) se resalta dentro de su grupo: fondo tinte del momento, contorno de 1.5px en el color del momento, cuadrito de ícono relleno con el color del momento e ícono en ink, etiqueta "Sigue" (11px, 700, fondo del color del momento, texto ink, esquinas 6px) en la misma línea del nombre, y el check con borde del color del momento (en claro, su variante -strong-light). El anclaje va completo en la segunda línea. En el celular, si el hábito tiene reto, el botón "Empezar" va en una línea de abajo, a la derecha, junto a la barra del reto; si no tiene reto, va en la misma fila, antes del check (la fila queda de 64px; un nombre largo se corta con "…"). En modo claro el contorno de la fila es de 1px. Si la fila siguiente está dentro de una rutina, no lleva contorno ni "Empezar" propios (ver Rutinas en Hoy). Solo hay una fila siguiente en toda la pantalla.

### Inputs / Fields
- **Style:** surface con borde line, esquinas 12px, texto body, placeholder text-muted.
- **Focus:** borde lila de 1.5px, sin resplandor.
- **Error:** mensaje en label debajo del campo que nombra el problema y cómo arreglarlo; borde danger solo en formularios, nunca en hábitos.

### Navigation
- **Barra inferior (móvil):** fondo bg con línea superior en line, 82px. Cuatro destinos: **Hoy · Tareas · + · Progreso · Perfil** (la pestaña se llama "Progreso", nunca "Estadísticas"; Tareas con el ícono list-checks) con ícono lucide de 22px y etiqueta micro; activo en text, inactivos en text-muted. Botón Crear al centro. El Calendario sale de la barra: vive en la pestaña "Calendario" de Progreso (aprobado el 29 sep; reemplaza el botón temporal "Ver calendario").
- **Menú lateral (escritorio):** 240px, fondo surface con línea derecha en line. Arriba el logo y "Racha"; el botón ámbar "Crear" (46px, ícono +); los destinos en filas de 44px (ícono de 20px + nombre de 15px, 600; activo con fondo surface-raised, texto text e ícono en ambar-text; inactivos en text-muted); abajo, separado por una línea, el bloque de Perfil (avatar de 36px con la inicial, el nombre y "Nivel N · Perfil"), que abre Perfil. De 1024 a 1279px el menú mide 76px y muestra solo íconos (con title y aria-label). Destinos definitivos (29 sep, design/maqueta-progreso-informe.html): **Hoy · Tareas · Tu semana · Progreso**. Calendario ya no va en el menú: es la pestaña "Calendario" de Progreso, y Progreso queda marcado también cuando se ve esa pestaña.

### Check de hábito
- **Sin marcar** (check-toggle): círculo de 32px, borde 2px text-muted (line-strong no llega a 3:1), fondo transparente, zona táctil de 44px. Lo mismo para el "+1" (borde 1px text-muted).
- **Marcado** (check-toggle-done): círculo ámbar con ✓ en ink. Al marcar: relleno con escala 0.9→1 en 180ms, sin rebote. Suma los puntos con un "+10" breve junto al nivel.

### Últimos 7 días
Siete casillas de 52px: cumplido = ámbar con texto ink; no cumplido = surface con text-muted (The Grey Day Rule); comodín usado = comodin-bg con borde lila de 1.5px y escudo; hoy = transparente con borde discontinuo en text. Debajo: una frase sin culpa a la izquierda ("Un día sin cumplir no borra los demás.") y "21/30 del mes" a la derecha.

### Nivel y puntos
Pastilla "Nivel N" (level-pill) + barra de 8px (track con relleno lila) + "680 / 1000" en label con cifras tabulares.

### Hábito cumplido
Un hábito completado NO desaparece ni cambia de posición: se queda en su lugar dentro de Misiones para que el usuario vea lo que ya logró. Estado cumplido: check ámbar relleno con ✓ en ink, nombre tachado en text-muted (tachado de 1.5px en text-muted), metadato reemplazado por "+10 ganados" en ámbar, y el cuadrito de ícono conserva su color de momento. Al marcar, el check se rellena con escala 0.9→1 en 180ms (sin rebote). Tocar el check otra vez lo desmarca.


### Rutinas en Hoy
**RETIRADO el 27 sep 2026 por decisión del dueño: las rutinas se rediseñan desde cero.** Hoy ya no agrupa hábitos en rutinas (cada hábito va en su propio momento) y el menú Crear no ofrece "Nueva rutina". Las rutinas guardadas no se borran. Lo que sigue queda solo como referencia de lo que se probó; la maqueta design/maqueta-hoy-completo.html todavía muestra la rutina, ignorar esa parte.

Una rutina es un grupo de hábitos que se hacen seguidos.
- **Dónde va:** dentro de su momento del día (Mañana, Tarde, Noche o Todo el día), antes de los hábitos sueltos de ese momento. La rutina tiene su propio momento, que se elige en el editor de rutinas. Las rutinas guardadas antes, sin momento, toman el momento que más se repite entre sus hábitos (en empate, el más temprano).
- **Contenedor:** surface con borde line de 1px, esquinas 16px. Encabezado: cuadrito de 34px (surface-raised, ícono de la rutina en text), nombre de la rutina en Barlow Condensed 18px (h4) y debajo "Rutina · X de Y" en label text-muted; completa: **"Rutina completa"** en ambar-text, 700. A la derecha, el botón **"Empezar rutina"** (ícono de play), que abre el modo Foco con los hábitos de la rutina.
- **Dos pesos del botón:** fuerte (44px, transparente, borde de 1.5px y texto en el color del momento) cuando la rutina es del momento "ahora" o cuando la fila siguiente está dentro de ella; discreto (44px, sin borde, texto text-muted) en los demás casos, para no competir con lo que "Sigue". Sin botón cuando la rutina está completa.
- **Hábitos adentro:** filas planas (sin esquinas ni fondo propio) separadas por una línea de 1px en line; se marcan ahí mismo, igual que cualquier fila de Hoy (check, "+1", "+10 ganados", tachado al cumplir).
- **Si lo que sigue está adentro:** el contenedor lleva borde de 1.5px en el color del momento; la fila siguiente lleva fondo tinte del momento, sin contorno propio y sin su propio "Empezar" (el de la rutina lo reemplaza).
- **Reglas:** un hábito que está en una rutina aparece SOLO dentro de ella, nunca también suelto. Un hábito no puede estar en dos rutinas (el editor lo avisa: "Ya está en {rutina}"). Solo se muestran los hábitos de la rutina que tocan hoy; una rutina sin hábitos para hoy no se muestra. El conteo del grupo del momento y la tarjeta Tu día cuentan cada hábito una sola vez.

### Tareas de hoy
Aprobado el 27 sep (design/maqueta-hoy-completo.html). Recuadro en Hoy (en el celular después de Misiones; en escritorio arriba de la columna derecha).
- **Tarjeta:** surface con borde line, esquinas 18px. Encabezado: **"Tareas de hoy"** (headline 22px) y a la derecha el enlace **"Ver tareas ›"** (ambar-text, 600, 44px de alto). Debajo, **"X de Y pasos"** (label, text-muted, 600); al hacer todos: **"Hiciste los N pasos de hoy"** (ambar-text, 700). Esa línea es aria-live="polite".
- **Qué pasos muestra:** los pasos (subtareas) asignados a hoy, todos, incluidos los atrasados sin hacer, que dicen al lado de la tarea **"· de ayer"** o **"· del {día}"** (martes, miércoles…), en text-muted, sin rojo. Si hoy no hay ninguno asignado, en vez del conteo sale la nota **"Hoy no tienes pasos asignados. Estos son los que siguen."** (label, text-muted) y el siguiente paso pendiente de cada tarea abierta (el primer paso sin hacer del árbol, en el orden de las tareas), máximo 3. Si no hay tareas abiertas, el recuadro no se muestra.
- **Fila de paso:** check cuadrado de 26px con esquinas 8px y borde 2px text-muted (hecho: relleno ámbar con ✓ en ink), zona táctil de 44px, aria-label "Marcar {paso}, de {tarea}". Al lado, el paso (15px, 600) y debajo el nombre de la tarea (13px, text-muted). Filas de 52px separadas por una línea en line. Un paso hecho se queda en su sitio, tachado en text-muted. Marcar un paso no da puntos.
- **Estable bajo el dedo:** un paso marcado hoy sigue en la lista hasta mañana (no salta otro a su lugar).

### Tareas (pestaña)
Aprobado el 27 sep (design/maqueta-tareas.html, 13 marcos). Una tarea tiene nombre, ícono y un árbol de pasos (pasos dentro de pasos, sin límite). **Sin color por tarea**: el ícono va en gris sobrio (cuadrito surface-raised, ícono en text). El campo color guardado no se borra, solo no se usa.
- **Encabezado:** "Tareas" (Barlow Condensed 40px) y debajo el resumen "{N} abiertas · {N} para hoy · {N} de ayer" (14px, text-muted; cada parte se omite si es 0; si hay atrasados de antes de ayer, "{N} de días pasados"). A la derecha el botón secundario "Nueva tarea" (ícono +, 44px).
- **Tarea plegada** (tarjeta surface, borde line, 18px): el encabezado es un h2 con un botón (aria-expanded) que abre y cierra: cuadrito del ícono (38px), nombre (16px, 700) y la barra de avance (6px, relleno ámbar; en claro ambar-text) con "{hechos} de {total} pasos" (las cifras en Barlow Condensed tabular). Debajo, separado por una línea, el siguiente paso con su casilla para marcarlo ahí mismo, la etiqueta "Sigue" y su día.
- **Tarea abierta:** debajo del encabezado van "Empezar en Foco" (botón secundario, play) y "Editar tarea" (botón quieto con lápiz); luego todos los pasos y al final "Agregar un paso". El siguiente paso se resalta (fondo surface-raised y la etiqueta "Sigue": 11px, 700, fondo text, texto bg, esquinas 6px). Los pasos con pasos adentro no llevan casilla: muestran "{hechos} de {total} pasos" y sus hijos con sangría y una línea guía en line.
- **Casilla del paso:** cuadrada de 26px, esquinas 8px, borde 2px text-muted, zona táctil de 44px; hecha: relleno ámbar con ✓ en ink (en claro, además, borde interno de 1.5px en ambar-text). role="checkbox", aria-checked y el texto del paso como nombre. Un paso hecho se queda en su sitio, tachado (1.5px) en text-muted, y sin botón de día.
- **Día del paso:** chip de 32px (zona de 44px) con ícono de calendario: "hoy" (sin relleno, borde discontinuo de 1.5px en text, como el hoy de los 7 días), "mañana", "vie 2" (día abreviado y número, hasta 6 días adelante), "12 oct" (más adelante), "de ayer" y "del 22 sep" (atrasados, en gris, sin rojo). Sin día: botón de 44px con el ícono calendario-más en text-muted, aria-label "Ponerle día a {paso}". Solo los pasos sin pasos adentro llevan día. El ámbar nunca marca un día: es solo para lo logrado.
- **Hoja "¿Qué día lo haces?"** (debajo, el paso · la tarea): grupo de opciones (radiogroup) con "Hoy" (domingo 27) y "Mañana" (lunes 28) en filas de 56px con ✓ en ambar-text en la elegida; "Otro día" con los 6 días siguientes en casillas de 56px (día abreviado y número; aria-label con la fecha completa, "jueves 1 de octubre") y "Más", que abre el calendario del sistema. Abajo "Quitar el día" (solo si el paso tiene día). Guarda al tocar.
- **Terminar una tarea:** al marcar el último paso, la tarjeta se queda a la vista: cuadrito ámbar con ✓, barra llena, "Terminaste {tarea}" (Barlow Condensed 20px, ambar-text), "Paso a paso, llegaste. En unos segundos baja a Terminadas." y el botón "Deshacer" (desmarca ese último paso). A los 6 segundos baja a Terminadas.
- **Terminadas:** grupo plegado al final, "Terminadas {N}" (Barlow Condensed 20px). Cada fila: ícono, nombre, "✓ {total} de {total} · el {día de terminada}" (el ✓ y la cifra en ambar-text), "Reabrir" (botón quieto) y la papelera en text-muted. Borrar no pide confirmación pero muestra el aviso "Borraste {tarea}" con "Deshacer" (6 segundos, encima de la barra). Reabrir desmarca el último paso que se marcó y devuelve la tarea a la lista.
- **Editar tarea (celular):** la misma tarjeta pasa a modo edición: botón del ícono (44px, abre la elección de ícono), el nombre en un campo, la pista "Con + le agregas pasos más pequeños a un paso. Mantén presionado ⋮⋮ para arrastrarlo; hacia la derecha lo metes dentro del de arriba." y cada paso con: asa ⋮⋮ (mantener presionado ~350 ms y arrastrar), su texto en un campo que baja de renglón, "+" (agrega un paso más pequeño adentro) y la papelera. Al arrastrar, el paso se levanta con sombra y, si se va a meter dentro de otro, aparece "Suelta aquí para meterlo dentro de este paso" (borde discontinuo). Abajo "Agregar un paso", "Borrar tarea" (con el mismo aviso de Deshacer) y el botón primario "Listo". Los pasos SOLO se mueven en Editar. Reemplaza la ventana vieja de editar tarea.
- **Nueva tarea:** la misma tarjeta en edición arriba de la lista, con los textos "¿Qué quieres lograr?" y "Escribe el primer paso, por pequeño que sea", "Cancelar" y "Crear tarea" (apagado hasta tener nombre).
- **Sin tareas:** ícono list-checks de 40px en text-muted (sin cuadrito), "Todavía no tienes tareas", "Una tarea grande se vuelve fácil cuando la partes en pasos pequeños. Aquí marcas cada paso, uno a la vez." y el botón primario "Crear mi primera tarea".
- **Pasos grandes y agregar pasos (aprobado el 28 sep, design/maqueta-tareas-pasos.html; reemplaza lo anterior donde choque):**
  - **Casilla en el paso grande:** los pasos con pasos adentro también llevan casilla (misma casilla de 26px). Se marca sola cuando todos sus pasos pequeños están hechos. Tocarla marca todos sus pasos pequeños; si ya estaba marcada, los desmarca todos. Al marcarla, el texto se tacha igual que un paso normal.
  - **Plegar:** cada paso grande lleva a la derecha una flecha (botón de 44px, chevron de 18px en text-muted, aria-expanded, aria-label "Esconder los pasos de {paso}" / "Mostrar los pasos de {paso}") que esconde o muestra sus pasos pequeños. Plegado se ve solo su renglón con "{h} de {n} pasos". Un paso grande terminado arranca plegado. Lo plegado no se guarda en los datos: al volver a entrar, los terminados plegados y los demás abiertos.
  - **⋯ en cada paso:** en la tarea abierta, cada paso (grande o pequeño) lleva al final un botón ⋯ (40×44px, text-muted, aria-label "Opciones de {paso}"). Abre una hoja con el título del paso, el nombre de la tarea debajo, y cuatro filas de 60px con ícono: "Dividir en pasos más pequeños" (ayuda: "Para partirlo en partes"), "Cambiar el día" (ayuda: el día largo, o "Sin día"; no aparece en pasos grandes), "Cambiar el texto" y "Borrar el paso". Dividir abre dentro del paso un campo "Escribe un paso más pequeño" (Enter guarda y deja listo otro). Cambiar el texto vuelve el renglón un campo (Enter o salir guarda; Escape cancela).
  - **"Agregar dentro de":** al final de los pasos pequeños de cada paso grande (si está abierto) va un renglón "+ Agregar dentro de “{paso}”" (14px, 600, text-muted, 44px de alto) que abre el mismo campo.
  - **Editar tarea pasa a llamarse "Mover pasos"**: queda solo para arrastrar (y el nombre, el ícono y borrar la tarea). Agregar, dividir, cambiar texto, día y borrar se hacen desde la tarea abierta.
  - **Nueva tarea:** los pasos escritos se ven como lista (punto de 8px en line-strong en lugar de casilla), cada uno con su ⋯ (mismas opciones menos el día) y los renglones "Agregar dentro de"; así se pueden crear pasos dentro de pasos antes de guardar. Pista: "Toca ⋯ en un paso para dividirlo en pasos más pequeños."
  - **Escritorio:** igual: casilla en el paso grande, flecha para plegar, y el "+" del renglón se cambia por ⋯ (aparece con el mouse encima, como antes) que abre un menú flotante con las mismas opciones; también van los renglones "Agregar dentro de". El doble clic para editar el texto se mantiene.
- **Pegar una lista (aprobado el 28 sep, design/maqueta-tareas-pegar.html):** al pegar texto de varios renglones en "Agregar un paso" (tarea abierta, celular y escritorio) o en el primer paso de Nueva tarea, si el campo estaba vacío y el texto trae al menos 2 pasos (src/utils/pegarLista.ts › leerListaPegada), no se pega: se abre "Pegaste una lista" (hoja en el celular; ventana centrada de 520px en escritorio, sin borde, sombra 0 24px 60px). Si el campo ya tenía texto o sale un solo paso, se pega normal.
  - Encabezado: "Pegaste una lista" (Barlow Condensed 24px; 26px en escritorio) y debajo "{N} pasos, {M} con pasos adentro. Quita con ✕ lo que no sea un paso." (en escritorio, antes de "Quita…": "Se agregan al final de {tarea}."). Botón cerrar de 44px.
  - Solo en Nueva tarea sin nombre y si la lista trae título: "Nombre de la tarea" (13px, 600, text-muted), campo con el título, y "Lo tomamos de la lista. Puedes cambiarlo." (13px, text-muted). En los demás casos no hay campo y el título no se agrega.
  - Vista previa plana (sin tarjeta, sin puntos): renglones de 48px separados por línea en line, texto 15px (600 los de primer nivel, 500 los de adentro, 26px de sangría por nivel) y a la derecha una ✕ de 44px (aria-label "Quitar {paso}") que quita ese paso con lo que tenga adentro. Alto máximo 300px con desplazamiento; abajo se desvanece (máscara de 28px). Es una lista real (ul/li).
  - Si se dejaron renglones por fuera: "Dejamos por fuera 1 renglón que no parecía un paso: “…”" (13px, text-muted; en plural "{N} renglones que no parecían pasos" sin citarlos).
  - Pie: "Cancelar" (botón quieto) a la izquierda y "Agregar {N} pasos" (primario ámbar 44px) a la derecha; si se quitan todos, el botón se apaga. Cancelar, la X, el velo y Escape cierran sin agregar nada y el campo queda como estaba antes de pegar. El foco entra al campo del nombre (si hay) o al botón Agregar.
  - En Nueva tarea, Agregar pone los pasos en el formulario (y el nombre si estaba vacío); en una tarea que ya existe, los agrega al final (agregarPasosPegados) y muestra el aviso "Agregaste {N} pasos" con "Deshacer" (6 s; quitarPasosTarea).
  - En Nueva tarea, debajo del campo del primer paso (solo mientras no haya pasos): pista "¿Tienes la lista en otro lado, como un chat con una IA? Cópiala y pégala aquí, en los pasos." Si la lista se pega en el nombre de una tarea nueva, también se abre "Pegaste una lista".
- **Pedirle el plan a una IA (aprobado el 28 sep, design/maqueta-tareas-ia.html):**
  - Tareas sin ninguna tarea: debajo de la explicación, "¿Ya tienes un plan de ChatGPT o Gemini? Crea la tarea y pega la lista en los pasos." (14px, text-muted, máx. 290px).
  - Nueva tarea (mientras no haya pasos): debajo del campo del primer paso, la pista (13px, text-muted) y el botón secundario "Pedirle el plan a una IA" (44px, ícono de mensaje, borde line-strong, fondo surface-raised).
  - El botón abre la hoja "Pídele el plan a una IA" (sub: "ChatGPT, Gemini o la que uses."): 3 pasos numerados (círculo de 28px surface-raised con la cifra; texto 15px 600): "Copia esta instrucción." "Pégala en el chat de la IA." "Copia la respuesta y pégala aquí, en los pasos."; la instrucción en un bloque (fondo surface, 12px de esquinas, 14px): "Divide mi meta “{nombre}” en pasos pequeños y concretos. Numéralos así: 1, 1.1, 1.2, 2, 2.1… Máximo 6 pasos principales. Responde solo con la lista, sin introducción." (sin nombre: “[escribe aquí tu meta]”); y el botón primario "Copiar instrucción" (ícono copiar). Al copiar, el botón pasa a "✓ Instrucción copiada" (fondo surface-raised, texto text; aria-live) y debajo "Ahora ve a la IA y pégala." (13px, text-muted, centrado). Si el navegador no deja copiar, se selecciona el texto de la instrucción y el botón dice "Cópiala tú: ya está seleccionada".
- **Escritorio (≥1024px):** dos columnas dentro de 1120px: la lista (340px; 280px por debajo de 1280px) y la tarea abierta. Lista: "Tareas", el resumen, "Nueva tarea", cada tarea como fila de 14px de esquinas (borde line-strong; la elegida con fondo surface-raised y borde text) con ícono, nombre, "Sigue: {paso}" y la barra con "{h} de {n}"; y Terminadas debajo. Tarea abierta (tarjeta surface): ícono (botón, 48px), nombre (Barlow Condensed 34px), barra, "Empezar en Foco" y "···" (más opciones: editar nombre e ícono, borrar tarea). La pista "Arrastra un paso para cambiarlo de lugar, o hacia la derecha para meterlo dentro del de arriba." (se muestra hasta el primer arrastre). Cada paso: asa, casilla, texto, día y "+" (agregar un paso más pequeño adentro); el asa, el calendario vacío y el "+" aparecen solo con el mouse encima o con el foco. Al tocar "+" se abre adentro un campo "Escribe un paso más pequeño" con "Enter para guardar". El texto de un paso se edita con doble clic. Con teclado, sobre el asa: Alt+↑/↓ mueve, Alt+→ lo mete dentro del de arriba, Alt+← lo saca un nivel; cada cambio se anuncia (aria-live). Detalles de la versión construida (28 sep): el paso se borra desde la edición de su texto (al hacer doble clic aparece la papelera); con el mouse el arrastre empieza al mover el asa, sin mantener presionado; la pista se quita al soltar el primer arrastre; en pantallas táctiles grandes (sin mouse) el asa, el calendario vacío y el "+" se ven siempre; si solo hay tareas terminadas, a la derecha va "No tienes tareas abiertas." con "Nueva tarea"; "Nueva tarea" abre el formulario a la derecha y al crearla queda elegida.

#### Tareas 2 (aprobado el 30 sep, design/maqueta-tareas-2.html; reemplaza lo anterior donde choque)
Correcciones de Johnatan del 29 sep. CSS en src/index.css › "Tareas 2". Datos en src/utils/tareasUtils.ts (grupoTarea, lineaTarea, agruparTareas, moverTareaEnGrupo, colocarTareaEnGrupo) y src/components/tareas/arrastrePasos.ts (movimientosPaso), con 36 pruebas. Mantener presionado: src/components/tareas/mantenerPresionado.ts.
- **Grupos por cuándo (celular y escritorio):** las tareas abiertas se separan en "Para hoy", "Esta semana", "Más adelante" y "Sin día". Título del grupo en Barlow Condensed 20px (text) con el número al lado (16px, text-muted), como "Terminadas". Un grupo sin tareas no sale; si solo hay un grupo, no salen títulos.
  - **Regla (grupoTarea):** manda el paso pendiente con el día más cercano (empate: el primero del árbol). Hoy o atrasado → Para hoy; de mañana hasta el domingo de esta semana → Esta semana; después → Más adelante; ningún paso pendiente con día → Sin día.
  - **Orden:** uno solo, el de la persona (el orden del arreglo de tareas). Los grupos solo separan; dentro de cada grupo van en ese orden. Mover una tarea solo la cambia de lugar dentro de su grupo. "Tareas de hoy" (Hoy) y "Pasos sin día" (Tu semana) siguen ese mismo orden.
  - **No salta bajo el dedo:** una tarea que abriste o en la que marcaste un paso se queda en el grupo que tenía hasta que sales de Tareas (agruparTareas con `fijos`, que vive en el estado de la pantalla); al volver a entrar, cada una va a su grupo.
- **Fila compacta (celular):** tarjeta de 14px de esquinas, borde line-strong, fondo surface, mínimo 68px. A la izquierda el botón que abre la tarea (aria-expanded): cuadrito del ícono (38px), el nombre (15px, 700, hasta 2 renglones), la línea y la barra con "{h} de {n}". A la derecha la casilla (26px, zona de 44px, aria-label "Marcar {paso}") que marca el paso de la línea sin abrir la tarea.
  - **La línea (lineaTarea):** si ese paso tiene día, "**{Hoy | Mañana | Sáb 3 | 9 oct | De ayer | Del 22 sep}** · {paso}" (el día en 700 text, el resto 13px text-muted); si no tiene día, "Sigue: {paso}".
  - Tocar la fila abre la tarea **en su lugar**, dentro de su grupo, como tarjeta abierta (la de siempre).
  - La primera vez, debajo de "Planea tu semana", la pista "Mantén presionada una tarea para editarla, moverla o borrarla." (tarjeta surface con borde line, 13px text-muted) con una ✕ de 44px (aria-label "Entendido, no mostrar más"); no vuelve a salir (localStorage `racha_pista_mantener`).
- **Escritorio:** las filas de la lista (las de siempre) usan la misma línea nueva y van separadas por los mismos grupos.
- **Mantener presionada una tarea (celular):** 500 ms quieto (si el dedo se mueve más de 8px o la lista se desplaza, se cancela), vibra un poco y abre la hoja con el nombre de la tarea y "{h} de {n} pasos": "Editar tarea" (ayuda "El nombre, el ícono y los pasos"), "Cambiar de lugar" (ayuda "Súbela o bájala en la lista"; no sale si la tarea está sola en su grupo) y "Borrar tarea" (con el aviso "Borraste {tarea}" y Deshacer de siempre). Mientras, la fila queda marcada (fondo surface-raised, borde text). Clic derecho, la tecla de menú y Shift+F10 abren el mismo menú. Al abrir, el foco va a "Editar tarea".
- **Cambiar de lugar (celular):** se esconde la barra de abajo. Título "Cambiar de lugar" (Barlow Condensed 32px) y "Toca una tarea y muévela con las flechas, o arrástrala desde ⋮⋮. Se mueve dentro de su grupo." (14px, text-muted). Los grupos con sus títulos; cada fila con ícono, nombre (hasta 2 renglones) y el asa ⋮⋮ de 44px (no sale en un grupo de una sola tarea). La elegida (al entrar, la que se mantuvo presionada) va con borde de 2px en text y fondo surface-raised, y lleva flechas de 44px "Subir {tarea}" / "Bajar {tarea}" (aria-disabled y apagadas al 45% en la primera / última del grupo). Tocar otra fila la elige. Abajo, fijo, el botón primario "Listo" a todo el ancho. Al salir con Listo, si cambió algo: aviso "Cambiaste el orden" con Deshacer (6 s). Se guarda con reordenarTareas (moverTareaEnGrupo / colocarTareaEnGrupo).
- **Escritorio, cambiar de lugar:** se arrastra la fila de la lista con el mouse (el ⋮⋮ aparece a la izquierda con el mouse encima), dentro de su grupo; la que se arrastra va con borde discontinuo en text-muted, inclinada 1.5°, y una línea de 2px en text marca dónde cae. Con teclado, sobre la fila: Alt+↑/↓, con aviso aria-live "{tarea}, {i} de {n} en {grupo}".
- **Tarea abierta limpia:** ya no van los renglones "Agregar dentro de “…”" (ni en celular ni en escritorio). Se agrega adentro con ⋯ › "Dividir en pasos más pequeños" (el campo "Escribe un paso más pequeño" sale solo mientras se escribe) o en Editar tarea (+). En un paso que ya tiene pasos adentro, esa opción del ⋯ dice "Agregar un paso adentro". El botón "Mover pasos" vuelve a llamarse **"Editar tarea"** (lápiz). Nueva tarea se queda como está.
- **Editar tarea, mover pasos (celular):** se esconde la barra de abajo. Pista: "Toca ⋮⋮ para mover un paso con los botones, o mantenlo y arrástralo. Con + le agregas un paso más pequeño adentro." El ⋮⋮ es un botón de 44px (aria-label "Mover {paso}", aria-pressed). Tocarlo marca el paso con todo lo que tiene adentro (fondo surface-raised, borde interno de 2px en text) y abre abajo la barra flotante (role="toolbar", aria-label "Mover {paso}"; surface-raised, esquinas 18px, sombra): "Mover **{paso}**" (14px), debajo "Está dentro de “{paso de arriba}”" (12px, text-muted; solo si está dentro de otro), una ✕ de 44px "Dejar de mover", y cuatro botones de 56px con ícono y texto: "Subir" (flecha arriba), "Bajar" (flecha abajo), "Meter dentro" (flecha derecha: lo mete dentro del paso de arriba) y "Sacar" (flecha izquierda: lo saca un nivel). Los que no se pueden usar van con aria-disabled y al 45% (movimientosPaso). Cada botón mueve con destinoConTeclado + moverPasoTarea, anuncia el cambio (aria-live), deja el foco en el mismo botón y desplaza la lista para que el paso quede a la vista. Mientras la barra está abierta, la tarjeta deja 230px libres abajo. Arrastrar desde ⋮⋮ sigue funcionando y ahora empieza apenas se mueve el dedo (antes había que esperar 350 ms quieto y, si el dedo se movía antes, no pasaba nada: eso era lo torpe); el toque que sigue a un arrastre no abre la barra.
- **Hoja "¿Qué día lo haces?":** "Hoy" y "Mañana" pasan a ser dos botones lado a lado (radio; 64px; esquinas 14px; borde 1px text-muted; fondo surface; "Hoy" 16px 700 y debajo "martes 29" 13px text-muted). Lo elegido se marca igual en Hoy, Mañana y los días de "Otro día": borde de 2px en text, fondo surface-raised; en Hoy/Mañana, además, ✓ en text arriba a la derecha (ya no en ámbar). "Quitar el día" solo si el paso tiene día.
  - **En escritorio** es una ventana centrada de 480px (esquinas 20px, sin borde, sombra 0 24px 60px, sin manija), completa, sin recortarse.

### Hoy en escritorio
- **Cabecera compacta (aprobada el 28 sep, design/maqueta-hoy-cabecera.html; reemplaza la cabecera alta):** una sola franja de unos 90px con línea inferior en line: la llama (64px; 56px por debajo de 1280), el saludo (14px, 600, text-muted) y la fecha (Barlow Condensed 40px; 36px por debajo de 1280) con "+N pts hoy" (18px, ambar-text); en el centro, dos barras cortas de 8px una encima de la otra (máx. 340px): "Tu día" con un segmento por hábito y "{h} de {n}", y "Nivel N" (lila, lleva a tu llama) con "act / meta"; a la derecha los comodines y Modo Foco. El aviso "Volviste…" va debajo de la franja. Misiones empieza 18px más abajo.
Aprobado el 27 sep (design/maqueta-hoy-completo.html, marcos 5 a 7).
- **Encabezado:** arriba, la tira de nivel igual que en el celular ("Nivel N", barra lila y "act / meta", máximo 520px; lleva a tu llama en el Perfil). Debajo, tu llama a 72px (56px en pantallas de menos de 1280px), "Buenas tardes, {nombre}" (16px, 600), la fecha en Barlow Condensed 48px ("Jueves 24") con "+N pts hoy" en ambar-text a su lado, y debajo los segmentos del día con "X de Y · te quedan Z". A la derecha: el chip de comodines y el botón "Modo Foco" (44px, surface-raised con borde line-strong).
- **Misiones:** igual que en el celular (grupos por momento con encabezado "Mañana · 1 de 3", rutinas y filas), en filas de 64px. Cada fila muestra además **la semana de ese hábito en 7 barritas** (L a D), iguales a los segmentos de Tu día: 10px de alto, esquinas 4px, 3px de separación, 136px en total (112px por debajo de 1280px). Cumplido = ámbar (en claro ambar-text), comodín = lila-text, todo lo demás (sin cumplir, hoy pendiente, días que no han llegado o que no tocaban) = track-empty. Aprobado por el dueño el 27 sep en lugar de los puntos. El ol lleva aria-label "{hábito}: esta semana" y cada punto su día y estado.
- **Columna derecha (de arriba a abajo):** Tareas de hoy → "Esta semana" (enlace "Calendario", los 7 días con su número, leyenda Todo cumplido · A medias · Comodín y "Cumpliste X de Y veces lo que te tocaba. Un día a medias no borra los demás.") → la fila del reto de la semana → "Lo próximo" (la próxima insignia con su barra y las cajas sorpresa por abrir). Los días que no han llegado llevan borde discontinuo de 1px en line-strong, sin opacidad.
- Las hojas en escritorio siguen la regla aprobada: panel a la derecha para consultar (detalle del hábito, día del calendario, Gestionar) y ventana centrada para decidir o llenar (Crear/Editar, confirmaciones).

### Tu semana
Aprobada para probar el 28 sep (design/maqueta-tu-semana.html). Cálculos en src/utils/semanaUtils.ts. En escritorio es un destino del menú lateral (Hoy · Tareas · Tu semana · Progreso · Calendario); en el celular se abre desde Progreso. Título "Tu semana" (Barlow Condensed 40px) y "Mira cómo vas y deja lista la semana." (14px, text-muted).
- **Cómo vas** (tarjeta): "Cómo vas" y a la derecha el rango ("21 al 27 de septiembre"). 7 días (Lun…Dom; en el celular L…D) con el número (Barlow Condensed 18px) y una barra vertical de 12×44px (pista track-empty; relleno ámbar —en claro ambar-text— al hechos/tocan, mínimo 10px si hay al menos uno; comodín: fondo comodin-bg con contorno lila-text; hoy: contorno de 1.5px en text; futuros sin relleno y número en text-muted). Debajo: "Cumpliste {cumplidas} de {tocaban} veces lo que te tocaba. Quedan {N} días." (sin la segunda frase el domingo). Cada día se lee "{día} {n}: {estado}, {h} de {t} hábitos".
- **Rescate** (tarjeta al lado; solo si rescateSemana devuelve un hábito; si no, Cómo vas ocupa todo el ancho): "Rescate: {hábito}" (16px, 700) y "Vas {h} de {t} veces esta semana. Ajustarlo funciona mejor que forzarlo." (13px, text-muted). Dos botones de 56px (surface-raised, borde line-strong): "Hacerlo más fácil" (sub: "Por ejemplo, {meta más corta}" o "Una versión más corta") y "Cambiarle los días" (sub: "Hoy: {frecuencia legible}"); ambos abren el editor del hábito. Debajo, "Dejarlo así" (botón quieto): oculta el Rescate de ese hábito esta semana y muestra el aviso "Listo. No te lo volvemos a mostrar esta semana.".
- **Planea:** "Planea" (Barlow Condensed 26px) y pestañas (role=tablist) "Esta semana {rango}" / "La próxima {rango}" (por defecto Esta semana; el domingo, La próxima). Tablero de 7 columnas (tarjeta surface por día, 180px de alto mínimo; días pasados sin fondo y sin recibir pasos; hoy con borde text y la etiqueta "Hoy"): "{Jue} {24}" (14px 700, cifra 17px), "{N} hábitos" (12px, text-muted) y los pasos del día (pasosDelDia: atrasados primero con "de ayer", luego pendientes, luego hechos tachados), cada uno en un recuadro surface-raised con casilla de 20px (área táctil de 44px), el texto (13px, 600, máx. 2 renglones) y la tarea (12px, text-muted). Marcar la casilla marca el paso.
- **Pasos sin día** (panel de 230px a la derecha; por debajo de 1280px, arriba del tablero como fila de botones): "Pasos sin día {N}", "Arrástralos a un día." y los pasos agrupados por tarea (ícono y nombre 12px 700 text-muted), cada uno un botón de 40px con asa. Se arrastran con el mouse a un día que no haya pasado (la columna muestra borde discontinuo y "Suelta aquí para hacerlo este día"); con teclado o toque, el botón abre la hoja "¿Qué día lo haces?" que ya existe. Un paso del tablero también se puede arrastrar a otro día o de vuelta al panel (quita el día).
- **Celular:** Cómo vas, Rescate, "Planea" con las pestañas a todo el ancho, y una lista de días (desde hoy en Esta semana): tarjeta por día con "{Jue} {24}" (+ "Hoy"), "{N} hábitos", sus pasos y "+ Ponerle un paso a este día", que abre la hoja "¿Qué haces el {sábado 26}?" con los pasos sin día agrupados por tarea; tocar uno le pone ese día.

#### Tu semana 2: momentos y compromisos (aprobada el 28 sep, design/maqueta-tu-semana-2.html; reemplaza el tablero y el panel de arriba)
Cálculos: src/utils/semanaUtils.ts (diaPorMomentos, textoCargaDia) y src/utils/compromisosUtils.ts. Datos: Compromiso y Subtarea.momento en src/types.
- **Pasos sin día**: franja a todo el ancho arriba del tablero (tarjeta surface): "Pasos sin día {N}" y "Arrástralos a un día y un momento, o tócalos y luego toca dónde."; cada paso es un botón de 44px con asa, el texto (13px 700) y la tarea (12px text-muted), en varias líneas.
- **Tablero**: 7 columnas de mínimo 148px (con desplazamiento horizontal si no caben). Cada día: "{Jue} {24}" (+ "Hoy"), la carga "{N} pasos · {N} compromisos" o "Libre" (12px text-muted) y, si tiene 4 o más, la etiqueta "Día lleno" (11px 700, surface-raised). Luego las franjas: "Cualquier momento" (solo si tiene algo), Mañana, Tarde y Noche, cada una con su ícono y color de momento, "{N} hábitos" a la derecha (solo si hay) y sus cosas. Una franja vacía es un solo renglón bajito.
- **Paso**: recuadro surface-raised con el texto completo (13px 600, sin cortar palabras) y debajo la casilla de 18px (área táctil de 44px) con la tarea (12px text-muted, completa) y "· de ayer" si toca. En días pasados, sin recuadro.
- **Compromiso**: recuadro con borde line-strong: la hora con reloj (Barlow Condensed 14px 700; "Sin hora" si no tiene) y el título (13px 600); "cada semana" con ícono si se repite. Los que ya pasaron, al 60%, sin marcar como incumplidos. Tocarlo abre su formulario (editar, borrar).
- **Mover**: arrastrar con el mouse o tocar y colocar sobre una franja de hoy o un día que venga (la franja se marca con borde discontinuo y "Suéltalo aquí"); sobre la franja "Pasos sin día" le quita el día. Cada cambio: aviso con "Deshacer". Al mover o borrar un compromiso que se repite: hoja "¿Solo este día o todos los {jueves}?" con "Solo este día" (por defecto) y "Todos".
- **"+ Compromiso"** (botón secundario junto a las pestañas) abre "Nuevo compromiso" (hoja en el celular; ventana de 480px en escritorio): "¿Qué es?" (sub del título: "Una reunión, una cita, una clase…"), "¿Qué día?" (7 días como radios + "Más"), "¿A qué hora?" (input type=time) con el aviso vivo "Con esta hora queda en la {mañana|tarde|noche}.", luego "¿Sin hora exacta? Elige el momento" (Mañana · Tarde · Noche, control segmentado), "Repetir cada semana" (switch, sub "Todos los {jueves} a esta hora") y el pie Cancelar / Guardar (apagado sin título). Si ya hay algo a esa hora: "Ya tienes algo a las {3:00 p. m.}." (aviso suave, no bloquea). Editar usa el mismo formulario con "Borrar compromiso".
- **Celular (aprobado el 28 sep, design/maqueta-tu-semana-3.html; reemplaza la versión anterior):**
  - "Cómo vas" en un renglón: "Cómo vas" y "Cumpliste {h} de {t} · quedan {N} días", con una sola barra de 6px (cumplidas/tocaban). No repite los 7 días.
  - "Planea" (Barlow Condensed 26px) y a su derecha "+ Compromiso" (44px). Debajo, las pestañas a todo el ancho (Esta semana / La próxima) y la tira de 7 días (56px, letra, número y puntos por cantidad de cosas; el elegido con borde text).
  - La agenda del día elegido en una sola tarjeta: "{Jueves 24} · hoy" y "{textoCargaDia} · {N} hábitos" (12px). Cada momento es una fila de 44px (ícono y nombre 14px 700) con un botón + redondo a la derecha (44px de área, círculo surface-raised de 32px, aria-label "Agregar a la {tarde}"); si está vacío, "Libre" en la misma fila y nada más. "Cualquier momento" solo si tiene algo (sin +). Cada paso lleva a la derecha un botón de calendario (44px, aria-label "Cambiar el día o el momento de {paso}"); tocar el paso (fuera de la casilla) o ese botón abre "¿Cuándo lo haces?". Al final, "Toca un paso para cambiarlo de día o de momento." (12px text-muted, solo si hay pasos).
  - Debajo, la tarjeta "Pasos sin día {N}" con "Toca uno para ponerlo en el día que estás mirando." y los pasos agrupados por tarea (ícono y nombre) y por rama (camino del paso grande como subtítulo, sangría y línea guía), cada uno una fila de 48px con ícono de calendario. Tocar uno abre "¿Cuándo lo haces?" con el día que se está mirando ya elegido y el momento en Cualquiera. Si no hay pasos sin día, la tarjeta no sale.
  - "¿Cuándo lo haces?" (hoja): título, "{paso} · {tarea}" (con el camino si es un paso pequeño); "Día": 7 días desde hoy ("hoy" en el primero) como radios + "Más" (calendario, cualquier día desde hoy); el elegido con borde de 2px y fondo surface-raised. "Momento": Cualquiera · Mañana · Tarde · Noche (radiogroup). Pie: "Dejar sin día" (botón con borde) y "Listo" (48px, apagado mientras no cambie nada). Al guardar: aviso "{paso} pasó al {sábado 26} en la {mañana}" (sin "en la …" si es Cualquiera) con Deshacer; "Dejar sin día": "Le quitaste el día a {paso}" con Deshacer.
  - El + de un momento abre la hoja "{Jue 24} en la {tarde}" (ya existe: "Un compromiso" y los pasos sin día por ramas).
  - Se entra desde Tareas ("Planea tu semana ›").
- **En Hoy** (cambiado el 28 sep a pedido de Johnatan): los compromisos NO van dentro de los momentos de los hábitos. Van en su propia tarjeta, justo debajo de "Tareas de hoy". Desde el 28 sep es "Tus compromisos" (ver abajo), que reemplaza a "Compromisos de hoy".

#### Tu semana 4 (aprobada el 30 sep, design/maqueta-tu-semana-4.html; reemplaza lo anterior donde choque)
Correcciones de Johnatan del 29 sep: la pantalla se alargaba sin fin con "Pasos sin día" abajo, en la hoja del + todo se veía "plano y gris" y no se entendía qué paso era de qué tarea, y solo había 2 semanas. CSS en src/index.css › "Tu semana 4". Datos en src/utils/semanaUtils.ts (diasDeSemana con número de semana, nombreSemana, semanaMasAntigua, mismoDiaEnSemana, sePuedePlanear, textoHabitos, textoPasosSinDia y `habitosDe` en diaPorMomentos; 30 pruebas).
- **Semanas con flechas (celular y escritorio):** las pestañas "Esta semana | La próxima" se cambian por una barra: flecha ‹ (44px, aria-label "Semana anterior, {rango}"), en el centro el nombre ("Esta semana", "La próxima semana", "La semana pasada", "En {n} semanas", "Hace {n} semanas"; 15px 700) y el rango debajo ("28 sep al 4 oct"; 13px text-muted), y flecha › ("Semana siguiente, {rango}"). En otra semana aparece, antes de la flecha ›, el botón **"Hoy"** (44px, surface-raised, borde line-strong), que vuelve a esta semana y a hoy; la barra no cambia de alto. El centro es aria-live; al tocar "Hoy" el foco pasa al centro. En escritorio va en la fila de "Planea", al lado de "+ Compromiso", con el nombre y el rango en un renglón.
  - Hacia adelante no hay tope. Hacia atrás, la flecha ‹ se apaga (aria-disabled, 45%) en la semana en que empezaste (semanaMasAntigua).
  - Al cambiar de semana queda elegido el **mismo día de la semana** (mismoDiaEnSemana). El domingo se entra en la próxima semana, como antes.
  - **Semanas pasadas: solo para mirar** (sePuedePlanear = fecha ≥ hoy): sin + en los momentos, sin casillas (los pasos hechos van tachados con una ✓ gris de 20px), sin cambiar pasos ni editar compromisos, y debajo del título del día "Esta semana ya pasó. Aquí ves lo que hiciste." Los días pasados de esta semana siguen como antes.
  - "Cómo vas" y "Rescate" son siempre de esta semana.
- **La tira de 7 días** no se desborda a 320px (7 columnas iguales).
- **La agenda del día (celular):**
  - "Cualquier momento" se llama **"Todo el día"** (como en Hoy) y sale si tiene hábitos, pasos o compromisos. Va primero, sin +.
  - Cada momento lleva su cuadrito de color de 26px (el de Hoy: mañana, tarde, noche; Todo el día en surface-raised con reloj).
  - Debajo del nombre del momento, sus hábitos de ese día: "Hábitos: {Tomar agua, Ayuno}" (ícono de repetir 13px, 12px text-muted, "Hábitos:" en 700; hasta 3 nombres y "y {n} más"; máximo 2 renglones). Los de "N veces por semana" no salen (no tienen día).
  - Si el momento no tiene pasos ni compromisos, "Libre" en la fila del nombre (aunque tenga hábitos).
  - Cada paso muestra el ícono de su tarea (13px) antes del nombre de la tarea; el texto del paso sube a 14px.
  - Debajo del título del día, en hoy y los días que vienen, si hay pasos sin día: el recuadro (surface-raised, 13px) con calendario "**{11 pasos sin día}**. Ponle uno con el + de un momento." Si no hay, no sale.
  - Al final, "Toca un paso para cambiarlo de día o de momento." solo si ese día tiene pasos.
  - **Ya no está la tarjeta "Pasos sin día" abajo** (tampoco su error, que escribía el nombre del ícono como texto): los pasos se ponen desde el + de cada momento.
- **La hoja del + ("{Mié 30} en la {mañana}")**: debajo del título, "Toca un paso para hacerlo el {miércoles} en la {mañana}." Luego "Un compromiso" y "O ponle un paso de tus tareas".
  - Cada tarea es un grupo **plegable** (lo pidió Johnatan): una fila de 56px (botón, aria-expanded) con el cuadrito del ícono de la tarea (30px, surface-raised), el nombre (15px 700) y a la derecha "{n} pasos sin día" (12px text-muted) y una flecha que gira al abrir. Entre tareas, una línea.
  - **Al abrir la hoja todas empiezan plegadas; si solo hay una tarea, empieza abierta.** Cada una se abre y se cierra sola (se pueden tener varias abiertas).
  - Abierta: la rama es un subtítulo gris ("Revisar opciones", 12px 600 text-muted, con la línea guía de siempre) y cada paso una fila de 48px con calendario (15px 500), con aria-label "{paso}, dentro de {rama}". Grupos planos: sin tarjetas dentro de la hoja.
- **Escritorio:** las flechas en vez de las pestañas; en "Pasos sin día" la tarea manda (14px text, cuadrito de 24px) y a la derecha "{n} pasos"; la rama es gris (600 text-muted). En el tablero, "Cualquier momento" pasa a "Todo el día". Todo lo demás del tablero queda igual.

#### Compromisos: "Tus compromisos", la hora y el calendario (aprobado el 28 sep, design/maqueta-compromisos.html)
Cálculos en src/utils/compromisosUtils.ts: proximosCompromisos, proximaFecha, yaPaso, tituloDiaCompromiso, textoCuando, textoRepetir (probados).
- **"Tus compromisos" (Hoy, celular y escritorio):** tarjeta surface (18px de esquinas) debajo de "Tareas de hoy"; en escritorio, en la columna derecha. Solo si hay al menos un compromiso que venga (proximosCompromisos no vacío); si no, no aparece.
  - Cabecera de 44px: "Tus compromisos" (Barlow Condensed 22px) y a la derecha el enlace "+ Agregar" (ambar-text, 15px 600, aria-label "Agregar un compromiso"), que abre "Nuevo compromiso" con hoy elegido.
  - Cada compromiso sale UNA sola vez, en su próxima fecha (los que se repiten no se multiplican). Agrupados por día con el título de tituloDiaCompromiso (13px 700 text-muted): "Hoy", "Mañana, martes 29", "Miércoles 30", "Sábado 3 de octubre".
  - Renglón de 52px (un solo botón): la hora (Barlow Condensed 16px, columna de 74px) o textoCuando ("En la tarde", 13px 600 text-muted), el título (15px 600, interlineado 1.3, completo), "cada semana" con ícono si se repite, y un chevrón. Tocarlo abre "Editar compromiso" de ESE día.
  - Los de hoy que ya pasaron (yaPaso): hora y título en text-muted (sin opacidad) y "ya pasó" (12px 600) debajo de la hora. No cuentan en los 5.
  - Se ven los 5 que vienen (más los de hoy que ya pasaron). Si hay más, botón con borde a todo el ancho (44px) "Ver todos ({N})" (N = todos); abierto: "Ver menos". aria-expanded y aria-controls.
- **Hoja "Nuevo compromiso" / "Editar compromiso"** (hoja en celular, ventana de 480px en escritorio). Orden: título y "Una reunión, una cita, una clase…"; "¿Qué es?"; "¿Qué día?" (6 días desde hoy como radios, el primero "hoy", + "Más"); "¿A qué hora?"; "¿Sin hora exacta? Elige el momento" (Mañana · Tarde · Noche); "Repetir cada semana" con textoRepetir debajo; al editar, "Borrar compromiso" (coral-text); pie Cancelar / Guardar (apagado sin título). El cuerpo se desplaza y el pie queda siempre a la vista (en el flujo, nunca fixed). Cierra con Escape y tocando fuera.
  - **Campo de hora:** botón de 48px (máx. 220px, borde line-strong) con reloj, la hora ("7:20 a. m.") o "Elegir la hora" en text-muted, y una flecha. Abierto: borde de 2px en text. Debajo, si hay hora, "Con esta hora queda en la {mañana|tarde|noche}." (12px text-muted).
  - **Selector de hora** (se abre dentro de la hoja, debajo del campo; reemplaza al input time del sistema): tres columnas: "Hora" (1 a 12), "Minutos" (00 a 55 de 5 en 5; si el compromiso tenía otro minuto, como 10 o 13, ese valor también está y queda elegido: nunca se redondea) y a. m. / p. m. (dos botones de 52px). Cada lista muestra 5 filas de 44px y se desliza (scroll-snap); la del centro va en una franja surface-raised con contorno de 1.5px en text y cifra de 26px; las demás en text-muted. Abajo: "Quitar la hora" (botón quieto) y "Listo" (secundario, cierra el selector). La hora se guarda al instante como 'HH:MM' de 24 h; elegir un momento en "¿Sin hora exacta?" quita la hora. Si se abre sin hora, propone la próxima hora en punto (a las 2:35 p. m., "3:00 p. m.") y la deja puesta.
  - **Choque:** si ese día ya hay otro compromiso a esa hora: "Ya tienes “{título}” a las {3:00 p. m.}" (aviso suave surface-raised, no bloquea).
  - **Editar uno que se repite:** la hoja trabaja sobre el día que se tocó (no sobre el primer día de la serie). Al guardar un cambio o borrar: "¿Solo este día o todos?" con "Solo este día" y "Todos".
- **Calendario propio** (al tocar "Más"; mismo componente en "Nuevo compromiso", "¿Cuándo lo haces?" y "¿Qué día lo haces?"): se abre dentro de la hoja, debajo de la fila de días, entre dos líneas. Cabecera con flechas de 44px (la de atrás apagada en el mes actual) y el mes en Barlow Condensed 20px ("Octubre 2026"); letras L M X J V S D; días de 44px. Días que ya pasaron: solo el número en text-muted, no se pueden tocar; hoy: borde discontinuo de 1.5px en text; el elegido: borde de 2px en text y fondo surface-raised. Al tocar un día se elige y el calendario se cierra solo. En el mes actual, debajo: "Al tocar un día, el calendario se cierra solo." El botón "Más" pasa a mostrar el día elegido en tres líneas ("mié", "14", "oct") con borde de 2px. Mientras el calendario está abierto, "Más" lleva borde de 2px en text.

#### Compromisos 2 (aprobado el 30 sep, design/maqueta-compromisos-2.html; reemplaza lo anterior donde choque)
Correcciones de Johnatan del 29 sep: no había dónde verlos todos, no se podían marcar como hechos y "solo dice 'ya pasó' y listo". CSS en src/index.css › "Compromisos 2" (contenedores `.tcomp` y `.compro`). Datos en src/utils/compromisosUtils.ts (estaHecho, marcarHecho, compromisosDeHoy, proximosAgrupados, seriesSemanales, textoCadaSemana, yaPasaron, hayCompromisos; 30 pruebas) y `Compromiso.hechos` (días marcados). En HabitContext: marcarCompromiso(id, fecha, hecho), verCompromisos, abrirCompromisos, cerrarCompromisos. Los avisos antes de la hora van con los recordatorios push (no aquí).
- **Marcar como hecho:** cada compromiso de HOY lleva a la izquierda una casilla redonda (44px de zona, círculo de 26px con borde de 2px en text-muted; marcada: fondo ámbar con logro y ✓ en ink), igual que los hábitos. aria-label "{título}, {hora o momento}", role="checkbox". La fila pasa de un solo botón a dos: la casilla y el resto (hora, título, chevrón) que abre "Editar compromiso" de ese día.
  - Marcado: hora y título tachados en text-muted; aviso "Marcaste **{título}**." con "Deshacer" (Deshacer vuelve a llamar marcarCompromiso con el contrario). Se queda tachado todo el día; **al día siguiente ya no sale** (pasa solo, porque ya no es un compromiso que venga).
  - En uno que se repite, se marca solo ese día.
  - Los de hoy que ya pasaron sin marcar siguen como antes (gris, "ya pasó"), con su casilla hasta que acabe el día. Sin regaños.
  - Marcar un compromiso **no da puntos ni cuenta para "Día completo"** (como las tareas).
- **En Hoy ("Tus compromisos"):** la tarjeta sale mientras haya compromisos hoy o después (hayCompromisos). Los de hoy marcados no cuentan en los 5 que se ven. El botón de abajo dice siempre **"Ver todos"** (sin número, 44px, con borde) y abre la pantalla "Tus compromisos" (ya no despliega la lista en la tarjeta).
- **En Tu semana:** antes de "+ Compromiso" (celular y escritorio), el enlace **"Tus compromisos ›"** (ambar-text, 14px 700, 44px, sin caja; como "Ver tareas ›" en Hoy) abre la misma pantalla. Cambiado el 30 sep: un botón "Ver todos" al lado de "+ Compromiso" se veía raro y no decía qué mostraba. En la agenda y el tablero, los compromisos marcados salen tachados en text-muted (sin casilla) y no cuentan en "{N} compromisos" ni en "Día lleno".
- **Pantalla "Tus compromisos"** (celular: pantalla completa, sin barra de abajo; escritorio: panel a la derecha de 460px sobre un velo, Hoy sigue detrás):
  - Barra fija arriba: en el celular "‹" (44px, aria-label "Volver"); el título "Tus compromisos" (Barlow Condensed 26px, tabIndex -1: el foco va ahí al abrir) y "+ Agregar" (ambar-text, 15px 700) que abre "Nuevo compromiso"; en escritorio, en vez de "‹", una X a la derecha (aria-label "Cerrar"). Escape, "‹", la X y tocar el velo cierran; el foco vuelve a "Ver todos". Si la hoja de editar está abierta, Escape cierra solo la hoja.
  - **"Hoy, {miércoles 30}"** (Barlow Condensed 20px): los de hoy (compromisosDeHoy) con casilla, como en la tarjeta. Si no hay: "Hoy no tienes compromisos." (13px text-muted).
  - **"Próximos"**: desde mañana, cada compromiso una vez en su próxima fecha, también los que se repiten con "cada semana" (proximosAgrupados), por día con el título de tituloDiaCompromiso (13px 700 text-muted). Sin casilla: si arriba hay compromisos de hoy, las filas dejan el hueco de la casilla (36px) para que la hora y el título queden en la misma columna; si no hay ninguno de hoy, sin hueco (lo mismo en la tarjeta de Hoy). Si no hay, la sección no sale.
  - **"Cada semana {N}"** (seriesSemanales) con la ayuda "Tócalo para cambiar todas las veces." (13px text-muted): cada serie con un cuadrito de 32px (surface-raised, ícono de repetir), el título y debajo textoCadaSemana ("Los miércoles · en la noche", "Los viernes · 7:00 p. m."). Tocarla abre "Editar compromiso" **sobre toda la serie** (sin preguntar "¿Solo este día o todos?"). Si no hay, la sección no sale.
  - **"Ya pasaron {N}"** plegado (encabezado con botón aria-expanded y flecha): los de UNA vez de los últimos 30 días (yaPasaron), del más reciente, con la ayuda "Los de los últimos 30 días. Si se te olvidó marcar uno, márcalo aquí." y la casilla para marcarlo tarde. Las veces pasadas de los que se repiten no salen. Si no hay, no sale.
  - Sin ningún compromiso: "Aún no tienes compromisos" (Barlow Condensed 20px), "Agrega una cita, una reunión o una clase y aquí la ves." y el botón primario "+ Agregar un compromiso".
  - El aviso de Deshacer sale dentro de la pantalla, abajo (sin barra de navegación).
  - A 320px la columna de la hora baja a 60px y la casilla se alinea con la primera línea del título.

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
- **Fuerza de tus hábitos (tarjeta):** cifra display "84" con "de 100" en 20px text-muted y a la derecha el chip "+11 en 30 días" (flecha arriba, ambar-text sobre ambar-tint; en modo claro, fondo transparente con contorno de 1px en ambar-text para pasar AA). Si bajó: "−4 en 30 días" en text-muted sobre surface-raised, sin flecha. Si quedó igual: "Igual que hace 30 días", con el mismo estilo gris y sin flecha. Debajo, la curva: SVG con líneas guía en 50 y 100 (line), base en line-strong, área en ambar-tint, línea de 2.5px en ambar-text, punto final ambar-text con borde surface, meses abreviados en el eje (11px text-muted). Texto: "Sube cada día que cumples y un día gris solo la baja un poco. Cuanto más alta, más firme el hábito."; si bajó, "Bajó un poco, y así funciona: baja despacio. Con unos días seguidos vuelve a subir."; desde 90, "Tus hábitos ya están firmes. Ahora toca mantenerlos: cada vez que cumples sigue sumando en tus récords."
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

#### Progreso 2: pestañas, "Qué hacer ahora" y escritorio (aprobado el 29 sep, design/maqueta-progreso-informe.html)
Cálculos en src/utils/consejosUtils.ts (calcularConsejos, elegirConsejos, tuAnio, textoTuAnio; 82 pruebas). Lo de arriba (Fuerza, Este mes, Tus hábitos, Dónde puedes mejorar, Tus récords) no cambia.
- **Pestañas:** debajo de la cabecera va un control segmentado "Resumen | Calendario", con el mismo estilo que Apariencia en Perfil:
  - pista surface con borde line y 3px de relleno;
  - cada pestaña mide 44px, en 15px/700;
  - la elegida va en surface-raised con contorno de 1.5px en text; la otra, en text-muted.

  Usa role=tablist/tab/tabpanel, y las flechas izquierda y derecha cambian de pestaña. Reemplaza el botón "Ver calendario".

  La pestaña Calendario muestra el Calendario de siempre (DESIGN.md › Calendario) debajo de la cabecera de Progreso. El mes va en 28px (32px en escritorio) en vez de 44px, y su título baja a h2. La ruta 'calendario' abre Progreso en esa pestaña.
- **Qué hacer ahora:** es la primera sección del Resumen, con título de 22px condensado. Cada consejo va en una tarjeta surface con borde line y esquinas de 16px, con:
  - ícono de 36px: surface-raised con el ícono en text; el positivo, en ambar-tint con el ícono en ambar-text;
  - título h3 de 15px/700 y texto de 14px en text-muted;
  - abajo, el botón secundario (btn2 de 44px con borde line-strong) y "Ahora no" (44px, text-muted, aria-label "Ahora no: {título}").
  - **Celular:** se ve 1 consejo completo. Debajo, el botón "Ver 2 consejos más" / "Ver 1 consejo más" (44px, a todo el ancho, borde line-strong, chevrón) muestra los demás y cambia a "Ver menos" (aria-expanded).
  - **Escritorio:** los 3 lado a lado; las columnas se acomodan si son 1 o 2.
  - **Máximo 3.** Salen en el orden de la lista de abajo. Si hay un consejo positivo, va de último (el tercer lugar si hay 3), para que nunca sean solo cosas por arreglar. El de regreso sale solo.
  - **"Ahora no"** esconde ese consejo 7 días:
    - la clave lleva su sujeto (p. ej. "cae:{hábito}"), se guarda en consejosOcultos y viaja en la copia a la nube;
    - abajo sale el aviso "Listo. No te lo muestro esta semana." con "Deshacer";
    - el foco pasa al siguiente consejo, o al título de la sección si no hay más.
  - **Acciones que cambian datos** (Bajar la meta, Ir por N días): se hacen al tocar y dejan un aviso con "Deshacer": "Bajaste la meta de {hábito} a {N}." / "Empezaste el reto de {N} días de {hábito}."
  - **Sin consejos:** tarjeta con ✓ (ambar-tint / ambar-text), "Nada que ajustar por ahora" y "Vas parejo. Cuando algo necesite un cambio, te lo digo aquí."
  - **Empezaste hace poco** (menos de 14 días): solo pueden salir regreso, olvido, tarea y semana. Si no hay ninguno, sale la tarjeta de "Nada que ajustar".
  - **Sin hábitos:** la sección no aparece.
  - **Los 11 consejos.** Textos exactos; lo que va entre {…} sale de los datos.
    1. **Regreso.** Sale solo.
       - Cuándo: 3 o más días seguidos con hábitos y nada cumplido, sin comodín, y hoy todavía nada.
       - Título: "Hoy tu regreso vale el doble".
       - Texto: "Cumple uno hoy, el que sea, y suma el doble de puntos."
       - Botón: **Ir a Hoy**. Es positivo.
    2. **Olvido.**
       - Cuándo: ayer nada, sin comodín, y en los 14 días anteriores cumplía 70% o más.
       - Título: "¿Se te olvidó marcar ayer?"
       - Texto: "Ayer no marcaste nada, y casi siempre cumples. Si lo hiciste, márcalo. Si no pudiste, congélalo con un comodín."
       - Botón: **Revisar ayer** (abre la pestaña Calendario con la hoja de ayer abierta).
    3. **Se cae.**
       - Cuándo: un hábito de hacer, con 7 días o más, lleva 3 o más días programados seguidos sin marcar. Sale el de más días.
       - Título: "{hábito} lleva {N} días sin marcarse".
       - Texto: "Hazlo más pequeño por unos días. Con 5 minutos también cuenta."
       - Botón: **Editar el hábito**.
    4. **Demasiados.**
       - Cuándo: 6 o más hábitos y el mes por debajo de 50%, contado hasta ayer y desde el día 7.
       - Título: "Con {N} hábitos, este mes vas en {X}%".
       - Texto: "Con menos hábitos cumples más. Archiva uno o dos y vuelve a sumarlos cuando los demás estén firmes."
       - Botón: **Elegir cuáles archivar** (abre Gestionar hábitos).
    5. **Choque.**
       - Cuándo: hay un compromiso semanal con hora o momento. En sus últimos 4 días, el hábito de ese momento salió 1 vez o ninguna, y los otros días va en 60% o más.
       - Título: "Los {martes} en la {noche} tienes {compromiso}".
       - Texto: "Ese día {hábito} casi nunca sale ({1} de {4}). Pásalo a otro momento del día."
       - Botón: **Cambiar el momento** (abre Editar el hábito).
    6. **Día flojo.**
       - Cuándo: en los últimos 30 días, el día más bajo va en 60% o menos y 20 puntos o más por debajo del mejor.
       - Título: "Los {sábados} te cuestan más ({X}%)".
       - Texto si es sábado o domingo: "Entre semana vas en {Y}%. Decide desde el {viernes} a qué hora lo harás el {sábado}."
       - Texto si es de lunes a viernes: "Los otros días vas en {Y}%. Decide desde el {domingo} a qué hora lo harás el {lunes}."
       - Botón: **Planear el {sábado}** (abre Tu semana).
    7. **Momento flojo.**
       - Cuándo: la misma regla del día flojo, pero por momento.
       - Título: "La {noche} es tu momento más difícil ({X}%)".
       - Texto: "Amarra esos hábitos a algo que ya haces siempre, como {después de cenar}." En la mañana: "después de cepillarte"; en la tarde: "después de almorzar".
       - Botón: **Ver tus momentos** (lleva a "Por momento del día").
    8. **Meta muy alta.**
       - Cuándo: un hábito con meta de 2 o más que, en sus últimos 14 días programados, avanzó 7 o más veces y la cumplió 3 o menos, y lo típico queda por debajo de la meta.
       - Título: "{hábito}: casi siempre llegas a {5} de {8}".
       - Texto: "Una meta que sí alcanzas anima más. Cuando la cumplas seguido, la vuelves a subir."
       - Botón: **Bajar la meta a {6}** (lo típico + 1).
    9. **Tarea quieta.**
       - Cuándo: 10 días o más sin marcar pasos y sin pasos pendientes con día de hoy en adelante.
       - Título: "{tarea} lleva {N} días quieta".
       - Texto: "Ponle día al siguiente paso: {paso}."
       - Botón: **Ponerle día** (abre la hoja "¿Qué día lo haces?" de ese paso).
    10. **Planear la semana.** Con "Ahora no" se esconde hasta la otra semana.
        - Cuándo: 5 o más pasos sin día.
        - Título: "Tienes {N} pasos sin día".
        - Texto: "Con 5 minutos los repartes en la semana y sabes qué toca cada día."
        - Botón: **Abrir Tu semana**.
    11. **Firme.**
        - Cuándo: el hábito más fuerte, con fuerza de 85 o más y sin reto en curso. Propone 30 días, y 66 si ya cumplió el de 30.
        - Título: "{hábito} ya está firme".
        - Texto: "Su fuerza va en {89} de 100. ¿Vas por el reto de {30} días?"
        - Botón: **Ir por {30} días**. Es positivo.
- **Escritorio:** el contenido va centrado, con un máximo de 1120px. De arriba abajo:
  1. la cabecera, con "Progreso" y la fecha a la izquierda y las pestañas (320px) a la derecha;
  2. Qué hacer ahora, en 3 columnas;
  3. dos columnas (1.6fr y 1fr): a la izquierda la Fuerza, con la gráfica más alta; a la derecha Este mes y Tus récords, cada uno en su tarjeta;
  4. **Tu año**, a todo el ancho;
  5. dos columnas: Tus hábitos y Dónde puedes mejorar, cada una en su tarjeta.

  En la pestaña Calendario van el mes grande (días de 72px, con el número arriba a la izquierda) y a su derecha, en 360px, la tarjeta "Tu mes".
- **Tu año** (solo escritorio): una tarjeta a todo el ancho.
  - **Cabecera:** el título "Tu año" (22px) con "últimos 12 meses" debajo. A la derecha, un select nativo de 44px, con la etiqueta oculta "Ver", que ofrece "Todos tus hábitos" y cada hábito activo.
  - **Cuadrícula:** 53 semanas por 7 días, con el lunes arriba.
    - Las columnas son fluidas (1fr), con cuadritos cuadrados, 3px de separación y esquinas de 3px. Caben desde 1024px sin desplazarse.
    - A la izquierda van L, X y V.
    - Arriba va la abreviatura del mes en la columna donde empieza, con el año en la primera y en enero ("oct 2025", "ene 2026").
  - **Estados con todos los hábitos:**
    - **todo:** relleno ámbar (en claro, ambar-text);
    - **una parte:** solo la mitad de abajo en ámbar, sobre track-empty; se distingue por la forma, no solo por el color;
    - **nada:** track-empty;
    - **comodín:** comodin-bg con contorno de 1.5px en lila-text;
    - **día libre** y **antes de empezar:** solo un borde de 1px en line;
    - **hoy:** contorno de 1.5px en text;
    - **futuro:** vacío.

    Los semanales no cuentan en "Todos", igual que en Tu mes.
  - **Estados con un solo hábito:** cumplido, sin cumplir, comodín o libre. Los semanales solo tienen cumplido o libre.
  - **Frase de abajo** (nunca con un 0):
    - con todos: "Desde el 1 de julio: 28 días completos, 61 con una parte y 3 sin nada." (o "En los últimos 12 meses: …");
    - con un hábito: "{hábito}: 54 de 89 días cumplidos desde el 1 de julio.";
    - sin datos: "Aquí se irán llenando tus días."

    A la derecha de la frase va la leyenda.
  - **Accesibilidad e interacción:**
    - la cuadrícula es role=img, con la frase como nombre;
    - al pasar el mouse, cada día dice su fecha y su estado;
    - al hacer clic en un día pasado se abre la hoja del día del Calendario.

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
- **Tu llama y tu nombre en Hoy** (aprobado el 24 sep, design/maqueta-hoy-llama.html): la tira de arriba lleva solo "Nivel N", la barra lila y "act / meta". Debajo, una fila con el saludo ("Buenos días" de 5:00 a 11:59, "Buenas tardes" de 12:00 a 18:59, "Buenas noches" de 19:00 a 4:59; solo el primer nombre; sin nombre, solo el saludo; se recalcula al volver a la app) y el chip de comodines. Luego tu llama compañera a 60px, SOLA (sin el medallón oscuro, recortada para que el fuego llene su espacio), junto a la fecha y "Misiones de hoy". Tocar la llama o la tira lleva a tu llama en el Perfil. Fila de un hábito que "Sigue" con meta de conteo: se ven el conteo (casillas con borde, máximo 130px) y debajo la barra del reto.
- **Día completo (aprobado el 28 sep, design/maqueta-dia-completo.html):** sale cuando quedan hechos todos los hábitos que tocaban hoy (las tareas no cuentan). Nunca si hoy no tocaba ningún hábito.
  - **Cuándo:** una sola vez por día (se guarda el día en que se mostró; desmarcar y volver a marcar no la repite). Sale cuando pasan 2,5 s sin marcar nada (como las demás celebraciones), nunca encima de Foco ni de otra hoja. "Hoy" es la fecha local del dispositivo. En la fila de celebraciones: si hay Reto cumplido o Tu llama creció, esas salen y el día va en su línea "También: completaste el día"; si no, sale Día completo primero y lo demás (nivel, insignia) pasa a su "También: …" (p. ej. "También: subiste al nivel 13."). Al cerrarla se marca lo demás como celebrado, como en las otras.
  - **Hoja** (celular; en escritorio, ventana centrada de 460px como "Pegaste una lista"): botón cerrar de 44px arriba a la derecha; la llama de la persona a 120px, sola, que se aviva una vez (crece un poco y brilla, 400 ms) y queda quieta (sin animación con prefers-reduced-motion); título "Día completo" (Celebration 28px); subtítulo en ámbar (Barlow Condensed 17px, ambar-text) y un mensaje (15px, text) según la historia, con este orden de prioridad:
    1. Nunca había tenido un día completo: "Tu primer día completo" / "Cumpliste todos tus hábitos de hoy. Así se empieza."
    2. Desde su último día completo hubo 2 o más días con hábitos sin completar: "Volviste y completaste el día" / "No importa cuántos días pasaron. Hoy cumpliste todo."
    3. Es domingo: "Cerraste la semana con el día completo" / "Esta semana tuviste {N} días completos de 7."
    4. Ayer también fue completo: "{N} días completos seguidos" / "Vas construyendo algo que se nota."
    5. Si no: "Otro día completo" / "Cumpliste todos tus hábitos de hoy."
  - **Resumen** (lista dl, 3 columnas separadas por line, entre líneas arriba y abajo): "Ganaste" +{puntos de hoy} (Barlow Condensed 24px, ambar-text) "puntos"; "Hábitos" {h} de {h}; "Pasos" {n} "de tareas" (solo si hoy marcó pasos; si no, 2 columnas). Etiquetas 13px 600 text-muted sin partirse.
  - **El mes:** "{Mes}" a la izquierda y "{N} de {días que van del mes} días completos" a la derecha (13px; la cifra en text), y debajo una barra de 8px (relleno ámbar; en claro ambar-text).
  - Botón primario "Seguir" a todo el ancho (48px), que recibe el foco al abrir. Escape, la X y el velo cierran igual. Sin compartir.
- **Celebraciones:** una sola a la vez (orden: reto → llama que crece → insignia → nivel; el resto en una línea "También: …"); nunca encima del modo Foco ni mientras marcas hábitos. Sin halos, confeti ni rebotes: la llama o el ícono, grandes y solos. La llama del mes llega el día 1 del mes siguiente. "Tu mes en Racha" se ofrece solo si el mes fue de 50% o más y nunca muestra nombres de hábitos.

### Reto
Un reto opcional por hábito: **cuenta días cumplidos, no días de calendario**, y su barra **nunca baja**. Opciones: Sin reto, 7, 30 o 66 días (con "Por semana": 4, 8 o 12 semanas cumplidas). El 66 se explica como "en promedio, un hábito tarda unos 66 días en volverse automático, aunque varía mucho entre personas" (Lally et al., UCL). No usar el mito de los 21 días.
- **Cómo se escribe** (distinto de la constancia "C/P días"): "Reto de 30 días" antes del primer día cumplido y "Reto · 12 de 30" después.
- **Barra:** 6px, pista track-empty, relleno ámbar (en claro, ambar-strong-light para contraste), texto caption text-muted con cifras tabulares a la derecha. En Hoy va debajo de la fila del hábito; es la única adición a la fila de Hoy.
- **Ayudas en pantalla:** si la frecuencia no es diaria, la duración real ("Con 3 días por semana, son unas 10 semanas."); al editar con avance, "Si cambias o quitas el reto, no pierdes lo cumplido."
- **Reto cumplido:** hoja en Hoy (una sola vez) con estrella en círculo ámbar, "Reto cumplido: 30 días" en Barlow Condensed 28px, "30 días cumplidos en N semanas" en Barlow Condensed 17px ámbar, la frase sin culpa "No fue perfecto y no hacía falta: volviste cada vez.", la fila en estado cumplido, botón primario "Ir por N días" (el siguiente reto, sin reiniciar lo cumplido) y el enlace "Seguir sin reto". El hábito nunca desaparece al terminar un reto.

### Modo Foco (aprobado el 29 sep, design/maqueta-foco.html)
Mejora el Foco que ya existía: sigue mostrando **un paso a la vez** con **Hecho · Pausar · Saltar**, y ahora lleva reloj.
- En un **hábito** el reloj es un **cronómetro** que sube.
- En una **tarea** es un **pomodoro**.
- Existe el **pomodoro solo**, sin hábito ni tarea.

Los cálculos están en src/utils/focoUtils.ts (48 pruebas); el sonido, la vibración y la pantalla encendida, en src/utils/focoAviso.ts. Las sesiones se guardan en `sesionesFoco` (HabitContext) y viajan en la copia a la nube. La meta por tiempo queda para después del lanzamiento.
- **Pantalla completa** (fondo bg, sin barra de navegación). Tiene tres partes:
  - **Barra de arriba:** la X de 44px (surface-raised, aria-label "Salir de Foco"); el contexto en 15px/700 ("Tu día", el nombre de la rutina o de la tarea, "Pomodoro"); y debajo, 13px text-muted ("Hábito 3 de 5", "Paso 4 de 8 · Pomodoro 1", "Foco libre" o lo que escribió).
  - **Segmentos de avance:** 5px, hechos en ámbar (en claro, ambar-text); el actual va con contorno de 1.5px en text.
  - **Pie en el flujo:** "Hecho" (primario ámbar de 52px con ✓), debajo "Pausar" / "Seguir" y "Saltar" (secundarios de 48px, surface-raised, borde line-strong; en claro el borde es text-muted), y el enlace "Terminar por ahora" (44px, text-muted) cuando hay reloj de pomodoro.
- **Hábito (cronómetro):**
  - arriba, el cuadrito del momento (52px) al lado del nombre (Barlow Condensed 30px), con el anclaje debajo ("Después de cenar", 14px text-muted);
  - el reloj que sube ("12:34", Barlow Condensed 92px, cifras tabulares; en pausa, text-muted con "En pausa" debajo);
  - la nota "Tu tiempo se guarda al marcar Hecho o al salir.";
  - si el hábito ya está hecho hoy, no hay reloj: "Ya lo hiciste hoy" y el botón "Siguiente".
- **Tarea (pomodoro):**
  - Antes de empezar:
    - la tarjeta del paso: "Ahora" (12px/700 text-muted), el paso (17px/600) y, separado por una línea, "Después: {siguiente paso}" (13px text-muted);
    - "¿Cuánto tiempo?" con el control segmentado **15 min · 25 min · 50 min** (radiogroup; 25 elegido de entrada, y se recuerda el último que eligió);
    - la nota "Después descansas 5 minutos (con 50, descansas 10). Suena solo con Racha abierta.";
    - el botón "Empezar pomodoro" y el enlace "Seguir sin reloj" (el Foco de siempre, sin reloj).
  - Corriendo:
    - anillo de 236px (300px en escritorio): pista track-empty de 10px y arco ámbar (en claro, ambar-text) que avanza;
    - adentro, lo que queda ("18:42", 64px) y "quedan";
    - debajo, la tarjeta del paso y el pie de siempre.
  - "Hecho" marca el paso, pasa al siguiente y el reloj sigue; sale el aviso "Marcaste {paso}." con "Deshacer". Si era el último paso, la tarea queda terminada y el reloj sigue hasta que termine el pomodoro.
  - Tarea sin pasos: el reloj con el nombre de la tarea, sin tarjeta.
- **Terminó el pomodoro** (sonido suave y vibración):
  - círculo ámbar-tint con ✓ y el título "Terminó tu pomodoro" (30px);
  - "25 min en {tarea}. Marcaste 2 pasos." (sin la parte de los pasos si no marcó ninguno);
  - "Descansar 5 min" (primario), "Otro pomodoro" (secundario) y "Terminar por ahora".
  - Si pasó con la app cerrada o de fondo, al volver el título es "Terminó tu pomodoro mientras no estabas" y no suena.
- **Descanso:** "Descanso" arriba y el anillo en text-muted con lo que queda; debajo, "Párate, toma agua y mira lejos un momento." Botones: "Saltar el descanso" y "Terminar por ahora".
  - Al terminar suena y dice "Terminó el descanso" / "Cuando quieras, sigue con {paso}.", con "Empezar pomodoro 2" y "Terminar por ahora". **Nunca arranca solo.**
- **Salir a mitad** (la X con el reloj andando): hoja "¿Terminar por ahora?" / "Llevas 12 min en {tarea}. Se guardan.", con "Seguir" (primario) y "Terminar por ahora". Esc también la abre.
- **Fin** (reemplaza "¡Sesión completada!" y el trofeo):
  - ✓ en círculo ámbar-tint y el título "Terminaste por ahora" ("Terminaste {tarea}" si la tarea quedó terminada);
  - "Tu avance quedó guardado. Sigue cuando quieras.";
  - un resumen de 3 columnas: Tiempo {N} min · Pomodoros {N} · Pasos {N} (solo las que aplican);
  - el botón "Volver".
- **Pomodoro solo:**
  - Se entra desde el + ("Empezar un pomodoro" / "Un rato de foco con reloj, para lo que quieras", separado de lo que se crea por una línea).
  - La pantalla lleva el título "Pomodoro" y "Enfócate en una sola cosa. Cuando suene, descansa.", el campo opcional "¿En qué vas a trabajar? (opcional)" (placeholder "Por ejemplo, estudiar para el parcial"), la duración y "Empezar pomodoro".
- **Escritorio:** a la izquierda, el reloj grande con la tarjeta del paso y el pie. A la derecha (380px), la tarjeta de la tarea: nombre, "{h} de {n} pasos · {tiempo} en Foco hoy" y todos los pasos (hechos con casilla ámbar, el actual resaltado con "Sigue").
  - Teclas: Espacio pausa o sigue, H marca Hecho y Esc sale. Ninguna tecla actúa si el foco está en un botón o campo. Debajo del pie va "Teclas: Espacio pausa o sigue · H marca Hecho · Esc sale".
  - Con la pestaña de fondo, el título de la pestaña muestra el tiempo ("18:42 · Mudanza").
- **Reglas del tiempo:**
  - Se guarda cada bloque de **1 minuto o más** (al marcar Hecho, Saltar, al salir o al terminar un pomodoro); los descansos no cuentan.
  - Un cronómetro olvidado se corta a las **3 horas**.
  - El reloj se mide con la hora, así que no se pierde al bloquear la pantalla ni al cambiar de app.
  - Si la app se cierra con el reloj andando, al abrirla se retoma; si era de otro día, se guarda lo que llevaba (con el tope) y no se retoma.
  - Mientras el reloj corre, la pantalla se mantiene encendida. El sonido y la vibración solo funcionan con Racha abierta (en iPhone no hay vibración).
- **Dónde se ve el tiempo:**
  - **Detalle del hábito**, después de Tu constancia: la tarjeta "Tiempo en Foco" con "4 h 10 min" (40px condensado) y "este mes", y debajo "Unos 18 min por día cuando lo haces en Foco." Solo aparece si ese mes hay tiempo.
  - **Tu semana**, dentro de Cómo vas, separado por una línea: "En Foco esta semana: **2 h 40 min**" y debajo "Mudanza: 1 h 10 min · Leer 20 min: 55 min · Pomodoros solos: 35 min" (los 3 primeros y "y N más"). Solo aparece si hay tiempo esa semana.
  - **Progreso › Tus hábitos:** al lado del % se agrega "· 4 h 10 min en Foco" (el mes), solo si hay tiempo.
  - Formato: "25 min", "1 h 10 min", "2 h".
- **Accesibilidad:**
  - el reloj es role="timer" con un nombre fijo ("Tiempo que queda" / "Tiempo"), que no se anuncia cada segundo;
  - una región role="status" anuncia "Empezó", "En pausa", "Terminó tu pomodoro" y "Terminó el descanso";
  - en las pantallas de fin, el foco va al título;
  - después de marcar un paso, el foco va al botón Hecho del siguiente.

#### Foco 2 (aprobado el 30 sep, design/maqueta-foco-2.html; reemplaza lo anterior donde choque)
Correcciones de Johnatan del 29 sep. CSS nuevo en design/maqueta-foco-2.html (va a src/index.css, dentro de `.foco`, `#screen-today` y `.hoyd`). Datos en src/utils/focoUtils.ts (relojEnEspera, empezar, sinEmpezar, puedeReiniciar, reiniciar, siguientePendienteCircular, indiceInicialFoco, opcionesPasoFoco; 41 pruebas) y src/utils/focoAviso.ts (sonarInicio). `FocusTarget` de tarea lleva `pasoId?`.
- **▶ en Hoy (celular y escritorio):** el botón "Empezar" (que solo salía en el hábito "Sigue") se reemplaza por un ▶ en **todos los hábitos que faltan hoy**, también los de meta (+1). Círculo de 36px (zona de 44px), fondo surface-raised, ícono play relleno 14px en text, justo antes de la casilla de marcar (en escritorio, después de los 7 puntos). aria-label "Empezar {hábito} en Foco". No sale en los ya hechos. Abre Foco con **solo ese hábito** (como hoy); para recorrer el día sigue "Modo Foco".
  - En el celular el nombre del hábito puede ir en **2 renglones** en vez de cortarse (solo el nombre, no el anclaje). Por debajo de 360px de ancho se esconde el "+10" de las filas con ▶.
  - **"Tareas de hoy":** cada paso pendiente lleva el mismo ▶ a la derecha (aria-label "Hacer un pomodoro con {paso}, de {tarea}"), que abre Foco de esa tarea empezando en ese paso (`pasoId`; si es un paso grande, su primer paso pequeño pendiente). Tocar el texto del paso abre la tarea en Tareas.
- **Hábito en Foco: el reloj espera.** Al entrar, "0:00" en text-muted y debajo "El reloj empieza cuando toques Empezar." Pie: "Empezar" (primario, ícono play) y "Hecho" (secundario, a todo el ancho): se puede marcar sin cronometrar. Al tocar Empezar: suena un toque suave y queda el pie de siempre.
  - **Un solo hábito** (entró por el ▶): sin "Saltar"; el pie es "Hecho" y "Pausar" (a todo el ancho). En "Modo Foco" (Tu día) sí va "Saltar" (va al siguiente hábito, cuyo reloj también espera).
  - Un reloj sin empezar no se guarda para retomar, y la X sale directo (sin "¿Terminar por ahora?"). Espacio también empieza (escritorio).
- **"Empezar de nuevo"** (ícono de flecha circular, 14px/600, text-muted, 44px), debajo del texto del reloj en el hábito y debajo del anillo en el pomodoro. Sale a partir de los 10 segundos, corriendo o en pausa.
  - Al tocarlo **se pregunta** (lo decidió Johnatan): hoja "¿Empezar de nuevo?" / "Llevas {N} min en {hábito o tarea}. ¿Los guardas o los borras?", con "Guardar y empezar de nuevo" (primario, ✓), "Borrar y empezar de nuevo" (secundario) y "Seguir como iba" (enlace; también Esc y tocar el velo). Con menos de 1 min no pregunta (no hay nada que guardar).
  - Después: el reloj vuelve a 0:00 (o a 25:00) y sigue corriendo, suena el toque de inicio, y sale el aviso "Empezaste de nuevo. Los {N} min quedaron guardados." o "Empezaste de nuevo. Borraste {N} min." (con menos de 1 min: "Empezaste de nuevo."), con "Deshacer". Deshacer quita lo guardado (si se guardó) y devuelve el reloj de antes (con el tiempo que pasó desde entonces). Los pasos marcados no cambian.
- **Tarea: elegir el paso del pomodoro.**
  - La tarjeta "Ahora" lleva a la derecha el botón "Cambiar" (pastilla de 30px, surface-raised, borde line-strong; zona de 44px; aria-label "Cambiar el paso (ahora: {paso})", aria-haspopup="dialog"). No sale si solo falta un paso. Sirve antes de empezar y con el reloj andando.
  - Abre la hoja **"¿En qué paso trabajas?"** (debajo, el nombre de la tarea; cabecera fija con la X): los pasos que faltan, en orden, como filas de 60px: el paso (16px/600) y debajo "Dentro de {paso grande} · **{Hoy | Mañana | Sáb 3 | De ayer}**" o "Sin día" (13px text-muted, el día en 700 text; máximo 2 renglones). El actual en 700 con ✓ (aria-current). Tocar uno lo elige y cierra la hoja; Esc y la X la cierran y el foco vuelve a "Cambiar".
  - Con el reloj andando, al cambiar sale el aviso "Ahora trabajas en {paso}." y el reloj sigue.
  - "Hecho" y "Saltar" siguen con el siguiente pendiente **dando la vuelta** (si elegiste el 3 de 4: el 4, luego el 1 y el 2); "Después:" también.
- **Escritorio:** en la tarjeta de la derecha, debajo de "{h} de {n} pasos", "Toca un paso para hacerlo ahora." (13px text-muted). Los pasos que faltan llevan un círculo (radio, no casilla) y se pueden tocar; el elegido va con el círculo lleno, fondo surface-raised y la etiqueta "Ahora". Los hechos siguen con la ✓ ámbar. Es un radiogroup con flechas.
- **Sonido:** un toque suave al tocar Empezar, Empezar pomodoro y Empezar de nuevo (no al seguir tras una pausa), además del aviso del final. Sin interruptor por ahora; en iPhone lo calla el modo silencio.

### Onboarding
Aprobado el 25 sep (design/maqueta-onboarding.html, 13 teléfonos). Enseña haciendo: la persona crea UN solo hábito, lo amarra a algo que ya hace y llega a Hoy lista para su primera victoria. Sin barra de navegación; arriba el botón Atrás (44px) y el avance en 5 segmentos (role="progressbar", aria-valuetext "Paso N de 5"); abajo un pie fijo con el botón principal (btnp full) y, si aplica, un link quiet. Cada pantalla tiene un solo h1 (32px condensada) y un sub de 15px.
- **1 Bienvenida** (sin avance): Chispa sola a 210px, h1 40px "Que no se apague lo que empiezas", "Un hábito, amarrado a algo que ya haces. Si fallas un día, no pierdes nada: lo que cuenta es volver." (17px) y "Esta es Chispa, tu llama. Crece cada vez que cumples." Botón "Empezar".
- **2 Tu nombre** (paso 1): "¿Cómo te llamas?", "Para saludarte cada día en Hoy.", label "Tu nombre" y campo. Botón "Seguir"; link "Prefiero no decirlo" (sigue sin nombre).
- **3 Tu primer hábito** (paso 2): "¿Con qué hábito empiezas?", "Uno solo. Cuando lo tengas, sumas más." Radios de 52px: Beber un vaso de agua, Leer 10 minutos, Moverte 15 minutos, Acostarte antes de las 11, Respirar 5 minutos, Soltar el celular antes de dormir, Estudiar 25 minutos, Ordenar 10 minutos y "Escribir el mío" (borde punteado). Al elegir "Escribir el mío" aparece el campo "Tu hábito" con "Mejor si es pequeño: algo que puedas hacer hasta en un mal día." Sin elegir, el botón queda atenuado (aria-disabled, sigue enfocable) con "Elige uno para seguir." encima.
- **4 Amárralo** (paso 3): "Amárralo a algo que ya haces", "Así tu propio día te lo recuerda.", el hábito elegido en una pastilla, "¿Después de qué? (opcional)" con el prefijo "Después de" y sugerencias: despertarme, tomarme el café, almorzar, llegar a la casa, cenar, lavarme los dientes. "Momento del día" con los 4 momentos (como en Crear).
- **5 Reto** (paso 4): "¿Vas por 30 días cumplidos?", "Marca {hábito} 30 veces, sin fecha límite. No tienen que ser seguidas: si fallas un día, no pierdes lo que llevas." Tarjeta "Al cumplirlo ganas": +300 puntos, 1 comodín, la insignia Retos 30 y 1 caja sorpresa. Botón "Voy por 30 días"; link "Ahora no".
- **6 Así funciona Racha** (paso 5): tres ideas con ícono de 48px: "Cumples y tu llama crece" (Cada hábito suma 10 puntos. Al subir de nivel, Chispa cambia.), "Si fallas un día, no pierdes nada" (Tienes comodines para congelar un día que no pudiste. Y el día que vuelves, todo vale el doble.) y "Los retos traen premios" (Cajas sorpresa, insignias y llamas nuevas para tu colección.). Botón "Ir a mi día".
- **7 Llegas a Hoy**: nivel 1, el saludo, Chispa y el hábito con su anclaje (y "Reto · 0 de 30" si lo aceptó). Arriba de las misiones, el aviso (ambar-tint) "Tu primer día. Si ya lo hiciste hoy, márcalo y suma tus primeros 10 puntos." que desaparece al marcar el primer hábito.
- Solo lo ve quien no tiene hábitos. Nunca crea hábitos duplicados. Lo demás de la app (insignias, colección, Foco, rutinas, tareas) se descubre con el uso y con las celebraciones, no en el onboarding.

### Tu cuenta (entrar con código)
Aprobado el 25 sep (design/maqueta-cuenta.html, 14 teléfonos). Supabase. Solo quien compró usa Racha: la cuenta se pide al abrir la app, ANTES del onboarding. Se entra con un código de 6 dígitos al correo (no enlace: en iPhone el enlace abre Safari y no la app instalada). Mismo marco que el onboarding (sin barra de navegación, Atrás de 44px donde se puede volver, pie con btnp full y link quiet). El ícono va pequeño (22px) junto al título, nunca en un cuadro encima.
- **Entra a tu Racha:** logo pequeño, sin la llama grande. "Te enviamos un código a tu correo para entrar. Sin contraseñas." Label "Correo de tu compra" y la ayuda "Es el que usaste al pagar." Botón "Enviarme el código" ("Enviando…" mientras tanto); link "¿Todavía no la tienes? Mira cómo conseguirla". Errores en coral (claro: #BF3F20): "A este correo le falta algo. Revisa la @ y el punto." y, con dominios mal escritos, "¿Quisiste decir {correo}?". Sin internet: "Para entrar la primera vez necesitas internet."
- **Revisa tu correo:** "Te enviamos un código de 6 dígitos a {correo}. Puede tardar un minuto.", link "¿No es tu correo? Cámbialo", "Tu código" en 6 cajas (un solo input numérico, one-time-code), "Si no lo ves, mira en Spam o Promociones.". Botón "Entrar" (entra solo al completar los 6; "Revisando…"). "Reenviar el código en 0:42" y luego el link "Reenviar el código". Errores: "Ese código no coincide. Revisa el último correo que te llegó." (borra los dígitos), "Ese código ya venció. Pide uno nuevo.", "Hiciste muchos intentos seguidos. Espera 5 minutos y vuelve a probar."
- **No encontramos tu compra:** "Escribiste {correo}, pero no aparece ninguna compra de Racha con ese correo." y dos puntos: "Revisa que sea el mismo correo que usaste al pagar. Búscalo en el correo de confirmación de tu pago." / "Si acabas de pagar, espera un par de minutos y vuelve a intentar." Botón "Probar con otro correo"; link "Escribir a soporte".
- **Encontramos tu Racha en este celular** (primera vez con cuenta, si hay datos locales y la cuenta está vacía): "¿La guardamos en tu cuenta? Así no la pierdes si cambias de celular y la ves también en el computador." Resumen: llama, hábitos, veces cumplidas, nivel y llama, insignias y llamas. Botón "Guardarla en mi cuenta"; link "Empezar de cero", que confirma en una hoja: "¿Empezar de cero?" / "Se borran tus 4 hábitos y todo lo que llevas en este celular. No se puede deshacer." / botón coral "Sí, empezar de cero" / "Mejor la guardo".
- **Tu cuenta ya tiene una Racha** (cuenta y celular con datos distintos): "Y en este celular hay otra distinta. ¿Con cuál sigues?" Dos radios con los mismos datos (Nivel · hábitos · veces cumplidas · usada {cuándo}); por defecto la de la cuenta. "La que no elijas se borra. Antes, te descargamos una copia de respaldo. Si tienes dudas, sigue con la de tu cuenta." El botón dice "Seguir con la de tu cuenta" o "Seguir con la de este celular"; elegir la del celular confirma en una hoja ("¿Seguir con la de este celular?" / "La de tu cuenta (Nivel 12, 6 hábitos) se borra. Antes te descargamos una copia de respaldo." / "Sí, seguir con esta" / "Volver").
- **Perfil › Tu cuenta:** tarjeta con "Correo", el estado ("Guardada en tu cuenta" · "Hace un momento"; sin conexión: "Sin conexión" · "N cambios esperan para subirse") y "Salir de tu cuenta". Debajo: "Si no hay internet, lo que hagas se guarda en el celular y se sube solo al volver la conexión." Salir con cambios sin subir confirma: "Tienes 3 cambios sin subir" / "Conéctate a internet antes de salir o se pierden." / "Salir de todas formas" / "Quedarme". Al salir se borran los datos de Racha del celular (no el tema ni el color).
- **Cuenta en pausa** (bloqueada desde el panel de pagos; aprobado el 29 sep, design/maqueta-panel-pagos.html, celulares 10 y 11):
  - Título "No pudimos confirmar tu pago", con el ícono de pausa en surface-raised.
  - Texto: "No encontramos el pago de tu cuenta {correo}, así que está en pausa."
  - Dos puntos: "Si ya pagaste, escríbenos por WhatsApp con la foto del comprobante y lo arreglamos." / "Tus hábitos y tu progreso siguen guardados. Cuando se confirme, entras como siempre."
  - Botón "Escribir por WhatsApp" (SOPORTE_URL) y link "Probar con otro correo".
  - La app lo sabe porque lee `estado_pago = 'bloqueado'` de la propia fila de compradores. Sus datos en la nube no se tocan.

### Panel de pagos (aprobado el 29 sep, design/maqueta-panel-pagos.html)
Solo para el dueño, **solo en computador**, en `tengoracha.com/panel`.
- **Base de datos:** `supabase/schema-6-panel.sql`. Todo pasa por funciones que revisan `es_admin()`. Un comprador solo puede leer email, activo y estado_pago de su propia fila.
- **Datos y textos:** `src/panel/panelDatos.ts` (34 pruebas).
- **Estados de una compra** (lo que ve el dueño):
  - `revisar` = "Algo no cuadra" (contorno de 1.5px en text con ícono de alerta);
  - `por_verificar` = "Se ve bien" (contorno de 1px en line-strong, texto text-muted);
  - `verificado` = "Pagó" (ambar-tint con ambar-text; en claro, contorno de 1.5px en ambar-text);
  - `bloqueado` = "Bloqueado" (contorno y texto en danger).

  **En todos los casos la persona entra a Racha de una**; el dueño confirma o bloquea después.
- **Barra de arriba** (64px, surface):
  - a la izquierda, el logo y "Panel de pagos" (Barlow Condensed 22px);
  - a la derecha, el botón "Agregar comprador", el correo del dueño y "Salir".
- **Cuadra tu caja** (tarjeta superior):
  - "Desde tu último cuadre: {sábado 26 de septiembre, 8:40 p. m.}" (o "Todavía no has cuadrado.").
  - Dos cifras: "Compras que se ven bien" y "Deberían haber llegado" (Barlow Condensed 28px). Cuentan solo las transferencias en "Se ve bien" o "Pagó" que llegaron desde el último cuadre, con el valor que leyó la IA.
  - Si hay de "Algo no cuadra" en ese tiempo, aparece "Las {N} de “Algo no cuadra” no entran hasta que las decidas.".
  - A la derecha, la pregunta "¿Cuánto te llegó por Racha desde el {sáb 26 sep, 8:40 p. m.}?", el campo (placeholder "$0"), la ayuda "Súmalo en tu app del banco. Cuenta solo las transferencias de Racha." y el botón "Cuadrar".
  - **Si cuadra:** fondo ambar-tint con ✓, "**Cuadra.** Te llegaron {$151.600} de {4} compras." y el botón "Guardar y marcar las {4} como pagadas".
  - **Si falta plata:** fondo surface-raised con una barra de 3px en text a la izquierda y ⓘ, "Te llegaron **{$37.900} menos** de lo que dicen los comprobantes (justo {1} compra). Abre tu banco y compara nombre, hora y referencia con la lista.", el botón "Guardar con la diferencia" y debajo "Se anota que faltaron {$37.900}. Ninguna compra queda como pagada.". Si la diferencia no es un múltiplo del precio, se quita "(justo N compra)".
  - **Si sobra plata:** "Te llegaron **{$X} más** de lo esperado. Puede ser un pago que no mandó comprobante, o una venta a mano." con "Guardar con la diferencia".
  - Debajo: "Tu último cuadre cuadró ({$492.700}, {13} compras)." (o "…no cuadró: faltaron {$X}.") y el link "Ver cuadres anteriores", que abre la lista de los últimos 20.
  - El cuadre se guarda con la función `guardar_cierre`, todo de una vez. Si llegó una compra mientras cuadrabas, sale "Llegó una compra nueva mientras cuadrabas. Revisa los números otra vez." y se recargan.
- **Lista** (izquierda, tarjeta):
  - Botones de filtro con su número (aria-pressed): "Algo no cuadra · Se ven bien · Pagaron · Bloqueados · Todas". Se abre en "Algo no cuadra" si hay alguna; si no, en "Se ven bien".
  - El buscador: "Buscar por correo, nombre, teléfono o referencia".
  - La tabla (con caption oculto) tiene las columnas "Correo y nombre" (el correo en negrita, que es un botón que cubre toda la fila, y debajo el nombre o "Sin nombre", más " · {el primer problema}" si no cuadra), "Valor" (Barlow Condensed 18px; si no cuadra lleva ⓘ y el texto oculto "(no cuadra)"), "Fecha del pago" y "Estado".
  - La fila elegida va en surface-raised con una barra de 3px en text a la izquierda.
  - De a 50, con "Ver más". Las de "Mandó otro comprobante" van primero.
  - **Vacíos:**
    - pestaña sin compras: "Nada por revisar. Las compras que no cuadren aparecen aquí." (en las demás, "No hay compras aquí.");
    - búsqueda sin resultados: "No hay compras con “{texto}”. Revisa cómo está escrito, o busca por teléfono o referencia.";
    - sin ninguna compra: el ícono de balanza, "Aún no hay compras" y "Cuando alguien pague por WhatsApp, aparece aquí con la foto de su comprobante.".
- **Detalle** (derecha, 440px, **fijo al desplazar**):
  - El correo, "{nombre} · mandó el comprobante {hoy, 10:20 a. m.}" y el chip del estado.
  - **Botones justo debajo:**
    - "Sí pagó" (ámbar) y "Bloquear" (contorno danger), con la ayuda "{Nombre} ya puede usar Racha. Si la plata te llegó, toca “Sí pagó”. Si no, “Bloquear” le quita la entrada; su progreso se guarda y lo puedes deshacer.";
    - si ya pagó, solo "Bloquear";
    - si está bloqueado, "Desbloquear" (ámbar), con "Vuelve a entrar con sus datos de siempre y queda como pagado.".
  - **Si mandó otro comprobante estando bloqueado:** una barra de 3px en text con "**Mandó otro comprobante** después del bloqueo. Míralo y, si la plata te llegó, toca “Desbloquear”.".
  - **Lo que no cuadra** (barra de 3px en text): la lista de `problemas()`, por ejemplo "Pagó $30.000, no $37.900", "El comprobante es del lun 21 sep (hace 8 días)", "La plata le llegó a «X», no a ti", "La foto no parece un comprobante", "La IA no pudo leer la foto", "No mandó foto" o "Esta referencia ya está en {correo}".
  - **La foto** (230px, fondo bg), con "Ver grande" (ventana a pantalla completa; si es PDF, se abre en otra pestaña). El enlace vence a los 2 minutos y se pide de nuevo. Sin foto: "La IA no pudo leer esta foto. Ábrela y míralo tú." o "No mandó foto".
  - **Lo que leyó la IA:** Valor, Fecha del pago, Referencia, Le llegó a, Pagó y Banco ("No se leyó" si falta). Lo que no cuadra lleva ⓘ y "(no cuadra)" oculto.
  - El teléfono y el link "Escribirle por WhatsApp" (wa.me con los dígitos).
  - "Nota (solo la ves tú)": un campo que se guarda solo al salir de él, con "Guardada" pequeño al lado.
- **Después de "Sí pagó", "Bloquear" o "Desbloquear":**
  - la compra sale de la pestaña y queda elegida la siguiente;
  - aviso abajo al centro: "Marcaste a {nombre} como pagado." / "Bloqueaste a {correo}." / "Desbloqueaste a {correo}.", con "Deshacer" (vuelve al estado que tenía);
  - el foco pasa a la fila siguiente.
- **Bloquear pregunta antes** (ventana centrada, alertdialog):
  - título "¿Bloquear a {correo}?";
  - texto "Ya no podrá entrar a Racha y verá “No pudimos confirmar tu pago”. Sus datos no se borran y lo puedes deshacer con “Desbloquear”.";
  - botones "Cancelar" (con el foco inicial) y "Bloquear" (lleno en danger).
- **Agregar comprador** (ventana centrada de 460px, con X):
  - "Queda con acceso y como pagado. Dile que entre a tengoracha.com con este correo.";
  - campo "Correo" (con el "¿Quisiste decir…?" de Tu cuenta);
  - "¿Cómo pagó?": Transferencia · Efectivo · Regalo (radiogroup), con "Efectivo y regalo no entran al cuadre de la caja.";
  - "Valor" (37.900 de entrada; con Regalo queda en $0 y se apaga);
  - "Nota (opcional)", con el placeholder "Por ejemplo, amiga del trabajo";
  - botones "Cancelar" y "Agregar". Si el correo ya existe: "Ese correo ya está en el panel ({estado}).".
- **Quien no es el dueño** abre /panel: el candado, "Esta página es solo para el dueño de Racha", "Entraste como {correo}." y "Volver a Racha".
  - **Sin sesión:** la misma entrada con código de Tu cuenta, pero sin revisar compra (el dueño puede no ser comprador).
- **Teclado:**
  - flechas arriba/abajo cambian de compra;
  - S = "Sí pagó", B = "Bloquear" (abre la pregunta);
  - ninguna actúa si el foco está en un campo.

  Las ventanas usan `<dialog>` (Escape, fondo inerte), y el foco vuelve al botón que las abrió. Los avisos van en una región `role="status"` que siempre existe.
- **Colores:**
  - danger (oscuro #F87171, claro #C62828) solo en Bloquear y el chip Bloqueado;
  - lo que no cuadra se marca con ícono y texto, no con color;
  - ámbar solo en lo que ya pagó y en los botones principales.
- **Fechas y plata:** fechas siempre en hora de Colombia ("hoy, 10:14 a. m.", "ayer, 9:55 p. m.", "lun 21 sep, 6:02 p. m."); pesos como "$37.900".

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
