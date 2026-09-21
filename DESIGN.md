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
typography:
  display:
    fontFamily: "Barlow Condensed, Arial Narrow, sans-serif"
    fontSize: "44px"
    fontWeight: 700
    lineHeight: 1
    letterSpacing: "0.005em"
  headline:
    fontFamily: "Barlow Condensed, Arial Narrow, sans-serif"
    fontSize: "24px"
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
  label:
    fontFamily: "Barlow, system-ui, sans-serif"
    fontSize: "13px"
    fontWeight: 500
    lineHeight: 1.3
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
  next-card:
    backgroundColor: "{colors.lila}"
    textColor: "{colors.ink}"
    rounded: "{rounded.lg}"
    padding: "14px"
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

<!-- Diseño aprobado el 2026-09-21 a partir de la maqueta "C + A · con semana", guardada en design/maqueta-hoy.html (referencia visual exacta de la pantalla Hoy). El código todavía usa el diseño anterior: al migrar una pantalla, esta es la fuente de verdad. Cuando todo esté migrado, re-ejecutar /impeccable document para capturar los tokens reales y generar .impeccable/design.json. -->

## Overview

**Creative North Star: "El marcador que no te castiga"**

Racha es un tablero de juego sobrio: grafito oscuro, números condensados como de marcador deportivo y un solo color cálido (ámbar) que marca lo que ya lograste. Se siente como llevar la cuenta de un partido que vas ganando, no como un juez que anota tus faltas. La app existe para que la gente **no abandone**, así que cada pantalla responde primero a "¿qué hago ahora?" y después celebra el progreso.

El juego (nivel, puntos, misiones, insignias) está presente pero en segundo plano: acompaña la tarea, nunca compite con ella. Los fallos se muestran en gris neutro, jamás en rojo, porque un día perdido no borra los días cumplidos. La densidad es media: pocos bloques por pantalla, cada uno con un propósito.

Referencias rechazadas: el look anterior (fondo casi negro con un único violeta neón y halos brillantes), la estética genérica de apps hechas con IA, y cualquier diseño que haga sentir culpa.

**Key Characteristics:**
- Grafito oscuro con superficies en capas tonales, sin sombras decorativas.
- Números y títulos en Barlow Condensed, estilo marcador.
- Ámbar = logrado. Lila = nivel, comodines y noche. Coral = tarde.
- Una sola tarjeta "Sigue ahora" por pantalla, en el color del momento del día.
- Lo hecho se colapsa; lo pendiente se ve.

## Colors

Grafito neutro con tres acentos que **significan algo**; ningún color es decorativo.

### Primary
- **Ámbar Logro** (ambar): días cumplidos, hábitos completados, botón Crear, barra de insignias, acción principal. Es el color de "ya lo hiciste". Texto sobre ámbar siempre en ink.

### Secondary
- **Lila Nivel** (lila): pastilla de nivel, barra de puntos, comodines, hábitos de la noche y la tarjeta "Sigue ahora" cuando el hábito es de noche. Texto secundario sobre lila en lila-ink.

### Tertiary
- **Coral Tarde** (coral): identifica los hábitos de la tarde (íconos y tarjeta "Sigue ahora" de la tarde). No se usa para errores.

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

### Named Rules
**The Grey Day Rule.** Un día o hábito no cumplido se pinta en surface con texto text-muted. Nunca rojo, nunca tachado, nunca un ícono de error. El rojo existe solo para borrar cosas.

**The Meaning Rule.** Cada acento tiene un significado fijo (ámbar logrado, lila nivel/noche, coral tarde). Si un color no comunica estado o momento, no va.

## Typography

**Display Font:** Barlow Condensed (con Arial Narrow, sans-serif)
**Body Font:** Barlow (con system-ui, sans-serif)

**Character:** Barlow Condensed aporta el aire de marcador deportivo en fechas, números y títulos; Barlow, su hermana regular, mantiene el texto de uso diario limpio y legible. Una sola familia en dos anchos, cero disonancia.

### Hierarchy
- **Display** (700, 44px, 1): la fecha del día ("Lunes 21"). Una por pantalla.
- **Headline** (700, 24px, 1.05): título de la tarjeta "Sigue ahora".
- **Title** (700, 20px, 1.1): títulos de sección ("Misiones"), pastilla de nivel.
- **Number** (700, 17px, cifras tabulares): números de días, puntos, contadores.
- **Body** (500, 15px, 1.35) y **Body strong** (600): nombres de hábitos y botones.
- **Label** (500, 13px): metadatos ("Tarde · 1 de 3 esta semana"), ayudas.
- **Micro** (600, 11px): etiquetas de la barra de navegación. No usar para nada más.

### Named Rules
**The Scoreboard Rule.** Toda cifra que el usuario deba leer de un vistazo (días, puntos, 21/30) va en Barlow Condensed con cifras tabulares.

**The No Eyebrow Rule.** Nada de etiquetas pequeñas en mayúsculas encima de un título. El título habla solo.

## Layout

Diseño móvil primero, ancho de referencia 390px, margen lateral de 20px (gutter). Entre bloques de la pantalla 14–16px; dentro de listas 8px entre filas. La barra de navegación inferior mide 82px y queda fija; el contenido nunca queda tapado por ella.

Orden de la pantalla Hoy (de arriba a abajo): encabezado (logo + chip de comodines) → nivel y barra de puntos → fecha y "Misiones de hoy: X de Y" → últimos 7 días con constancia del mes → tarjeta "Sigue ahora" → Misiones pendientes → línea de hechos → progreso de la próxima insignia.

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
- **Sobre acento** (button-on-accent): ink con texto tiza; se usa dentro de la tarjeta "Sigue ahora" ("Marcar hecho").
- **Contorno sobre acento**: transparente con borde ink al 45% ("Solo 2 min").
- **Secondary** (button-secondary): surface-raised con borde line, 32px; contadores como "+1".
- **Crear** (button-create): círculo ámbar de 54px con un "+" ink, centrado en la barra inferior.
- **Hover / Focus / Active:** hover aclara el fondo un paso; foco visible con anillo de 2px en lila separado 2px; al presionar escala 0.97. Transiciones de 150–200ms con ease-out.

### Chips
- **Comodines** (chip): surface con borde line, ícono escudo en lila, texto "2 comodines".
- **Insignia en progreso**: surface-raised con ícono de medalla en ámbar.

### Cards / Containers
- **Fila de hábito** (habit-row): surface, esquinas 14px, padding 10px 12px. Contiene a la izquierda un **cuadrito de ícono** (icon-tile, 38px, fondo tinte del momento, ícono lucide en el color del momento), al centro nombre (body strong) y metadato (label, text-muted), y a la derecha puntos "+10" en text-muted y el check.
- **Tarjeta "Sigue ahora"** (next-card): fondo = color del momento del hábito siguiente (lila noche, coral tarde, ámbar mañana), texto ink, esquinas 18px, padding 14px. Cuadrito de ícono en ink con el ícono en el color de la tarjeta, título en headline, subtítulo "Sigue ahora · momento · anclaje", puntos a la derecha, y dos botones: "Marcar hecho" (on-accent) y "Solo 2 min" (contorno).

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

### Hechos colapsados
Los hábitos completados salen de la lista y se resumen en una línea: cuadrito de 22px con destello ámbar + "Hecho: Meditar 10 min · +10 ganados" en label text-muted.

### Barra de agua y metas numéricas
Hábitos con meta diaria (ej. 8 vasos) muestran segmentos de 16×6px (llenos en text, vacíos en track-empty) y un botón secundario "+1".

## Do's and Don'ts

### Do:
- **Do** mostrar primero la constancia ("21/30 del mes") y después la racha ("3 seguidos").
- **Do** mostrar una única tarjeta "Sigue ahora" en Hoy, con el color del momento del hábito.
- **Do** colapsar lo hecho en una línea y dejar visibles solo los pendientes.
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
