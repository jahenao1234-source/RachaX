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
  bg-light: "#F6F7F8"
  surface-light: "#FFFFFF"
  surface-raised-light: "#EEF0F2"
  line-light: "#E1E4E8"
  text-light: "#15181B"
  text-muted-light: "#5D6570"
  lila-strong-light: "#4F5BD5"
  coral-strong-light: "#D9492A"
  ambar-strong-light: "#B26A00"
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

<!-- Diseño aprobado el 2026-09-21. Maquetas aprobadas (referencia visual exacta): design/maqueta-hoy.html (Hoy v2: grupos por momento y tarjeta Tu día), design/maqueta-gestionar.html (Gestionar hábitos, oscuro y claro) y design/maqueta-crear.html (Crear / editar hábito v5 con reto, 2026-09-22). El código todavía usa el diseño anterior: al migrar una pantalla, esta es la fuente de verdad. Cuando todo esté migrado, re-ejecutar /impeccable document para capturar los tokens reales y generar .impeccable/design.json. -->

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
| Mañana | ambar | ambar-tint |
| Todo el día | text | surface-raised |
| Tarde | coral | coral-tint |
| Noche | lila | lila-tint |

### Modo claro
La app sigue el modo del sistema del teléfono. En claro se usan los tokens `-light`: fondo bg-light, superficies surface-light / surface-raised-light, texto text-light / text-muted-light. Los rellenos ámbar, lila y coral se mantienen (texto ink encima); cuando el acento se usa como **texto o ícono sobre fondo claro** se usa su variante `-strong-light` para cumplir contraste. Los valores claros son propuesta inicial: validarlos en pantalla al implementar.

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
- **Headline** (700, 22px, 1.05): títulos de bloque de Hoy ("Tu día", "Misiones").
- **Title** (700, 20px, 1.1): títulos de sección ("Misiones"), pastilla de nivel.
- **Number** (700, 17px, cifras tabulares): números de días, puntos, contadores.
- **Body** (500, 15px, 1.35) y **Body strong** (600): nombres de hábitos y botones.
- **Score** (700, 18px, Barlow Condensed, cifras tabulares): puntos destacados ("+10 pts hoy").
- **Button** (700, 14px): texto de botones compactos ("2 min", "+1").
- **Label** (500, 13px): metadatos ("Tarde · 1 de 3 esta semana"), ayudas.
- **Caption** (600, 12px): letras de los días, la palabra "ahora" y textos cortos auxiliares.
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
- **Arranque "2 min"**: botón de contorno de 32px de alto con borde y texto en el color del momento y un ícono de play relleno; solo aparece en la fila siguiente.
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
- **Barra inferior (móvil):** fondo bg con línea superior en line, 82px. Cuatro destinos (Hoy, Progreso, Calendario, Perfil) con ícono lucide de 22px y etiqueta micro; activo en text, inactivos en text-muted. Botón Crear al centro.
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
- **Orden:** ideas rápidas (solo al crear y solo mientras el nombre está vacío) → Nombre (cuadrito de ícono de 52px con el tinte del momento y un distintivo de lápiz; al tocarlo abre la hoja "Elige un ícono") → Quiero (Hacerlo / Evitarlo) → Momento del día (4 tarjetas de 64px; el ícono de cada momento siempre en su color; la elegida con fondo tinte, borde de 1.5px en el color del momento y texto en negrita) → anclaje → Frecuencia (Diario / Lun a vie / Elegir días / Por semana) → Meta (plegada detrás de "+ Añadir meta"; se oculta con Evitarlo) → Reto → "Más opciones" (solo categoría, chips neutros).
- **Color concentrado:** el color solo vive en el cuadrito del ícono, las 4 tarjetas de momento y la vista previa. Todo lo demás elegido (segmentos, días, chips) es neutro: fondo surface-raised, texto text en negrita y borde de 1px en text al 60%. No hay selector de color: el color del hábito es el de su momento.
- **Anclaje:** con Hacerlo, "¿Después de qué?" con el prefijo "Después de" y 3 sugerencias según el momento (Mañana: despertarme, tomar café, bañarme · Tarde: almorzar, salir del trabajo, llegar a casa · Noche: cenar, lavarme los dientes, acostarme · Todo el día: despertarme, almorzar, cenar). Con Evitarlo, "¿Cuándo te cuesta más?" con el prefijo "Cuando" (Mañana: me despierte, tome el celular, salga de casa · Tarde: me siente a trabajar, me aburra, termine de almorzar · Noche: me acueste, esté en el sofá, termine de cenar · Todo el día: me aburra, esté cansado, me estrese).
- **Vista previa "Así se verá en Hoy"** en el pie fijo, encima del botón: encabezado mínimo del grupo (ícono del momento en su color + nombre) y la fila compacta de Hoy (cuadrito de 32px, nombre, segunda línea con el anclaje, "+10" y el check), con la barra del reto si hay. Con el teclado abierto se pliega a una línea.
- **Botón del pie:** al crear, apagado con el texto "Escribe un nombre para crear" hasta que haya nombre; después "+ Crear hábito" en ámbar. Al editar sigue la Explicit Save Rule con el aviso que nombra todo lo que cambió ("Cambiaste el momento y el anclaje. Se aplicará al guardar."). Cerrar con datos escritos o cambios abre "¿Descartar los cambios?". "Archivar hábito" es un enlace en text-muted al final del formulario al editar.
- **Todo lo tocable mide al menos 44px** (segmentos, días, chips, botones − y +, cerrar).
- **Cierre al crear:** hoja sobre Hoy con check ámbar de 44px, "Listo, ya está en tu día", una frase que dice dónde lo verá ("Lo verás en Noche, después de cenar."), la fila tal como quedó, un solo botón primario "Ver en Hoy" y el enlace "Crear otro hábito".
- **Hoja "Elige un ícono":** 24 íconos en 4 grupos de 6 (General, Salud y cuerpo, Mente y relaciones, Casa y vida), en el color del momento; el elegido con fondo tinte y borde de 1.5px. Sin sol, luna, amanecer, reloj ni check (se confunden con los momentos y el check). Al tocar uno se elige y la hoja se cierra.

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
