# Video de producto 2, estilo rimu: "Pasa el tiempo y sigo igual"

Tema aprobado por Johnatan el 20 oct 2026 (dolor 2 de `campana/dolores.md`). Formato: el del video de rimu (unos 30 s, voz de Fernando, íconos y la app en movimiento). Escrito con la skill `copywriting`. **Texto v1 APROBADO (20 oct, en el cuadro). Gancho A "el año gris" escogido. Textos en pantalla aprobados.**

## Texto de la voz (79 palabras, cerca de 25 s con la voz de Fernando)

1. Cada enero dices: este año sí leo, entreno y ahorro. Y en diciembre sigues igual.
2. Racha es una app para cumplir tus hábitos, día por día.
3. Cada día que lees o entrenas, lo marcas, y se pinta un cuadrito.
4. Si un día no puedes, haces una versión pequeña, como leer una página, y ese día también cuenta.
5. Mes a mes se llena tu año, y el próximo diciembre ves todo lo que sí hiciste.
6. Escribe Racha y te la muestro.

## Lo que se comprobó
- Marcar un hábito pinta el día en Tu mes y en Tu año (Tu año sale en el computador).
- La versión pequeña cuenta como cumplido (día difícil, "+5 ganados · versión mínima").
- No se promete un resultado: se dice lo que la persona ve en la app.

## Íconos y movimiento por frase (las reglas de `racha-medir-contra-la-referencia`)
Un golpe visual cada 1 a 1,5 s, cámara siempre en movimiento, todo grande, en pantalla solo las palabras clave, y cada escena sale de un objeto de la anterior. Íconos Lucide, los mismos de la app.

| Frase | Lo que se ve |
|---|---|
| 1 "Cada enero… ahorro" | "ENERO" gigante; caen tres íconos grandes (libro, pesa, alcancía), cada uno con su casilla vacía, en "leo", "entreno", "ahorro" |
| 1 "Y en diciembre sigues igual" | Las hojas del calendario pasan de golpe de enero a DICIEMBRE; las tres casillas siguen vacías y los íconos se ponen grises |
| 2 "Racha es una app…" | Los tres íconos grises se meten en el ícono de Racha (como la cuadrícula de rimu); "Racha" aparece |
| 3 "lees o entrenas… cuadrito" | El ícono de Racha se abre en el celular con Hoy real; se marca "Leer 10 páginas" y el chulo salta del celular y se vuelve un cuadrito ámbar |
| 4 "versión pequeña… cuenta" | El libro grande se encoge a uno pequeño con "1 página"; chulo ámbar grande y "TAMBIÉN CUENTA" |
| 5 "Mes a mes se llena tu año" | El cuadrito se multiplica: la cámara se aleja y Tu año (la app de verdad, desde enero) se llena mes a mes |
| 5 "el próximo diciembre…" | La cámara llega a diciembre lleno de ámbar |
| 6 "Escribe Racha…" | "escribe RACHA y te la muestro" con la pastilla del precio |

## Textos en pantalla que no son de la voz (APROBADOS el 20 oct)
"ENERO", "DICIEMBRE", "TAMBIÉN CUENTA", "1 página".

## Gancho visual (escogió la A)
- **A, recomendada: el año gris.** Primer cuadro: "ENERO" gigante en blanco sobre negro. La cámara se aleja y "ENERO" resulta ser el primero de 365 cuadritos grises; pasan los meses y todos siguen grises hasta "DICIEMBRE". Al final del video ese mismo año se llena de ámbar (el último cuadro contesta al primero).
- **B: las tres casillas.** Caen de golpe un libro, una pesa y una alcancía, cada uno con su casilla vacía ("este año sí"); las hojas del calendario pasan encima y las casillas siguen vacías.
- **C: la hoja que se arranca.** Una mano arranca hojas de un calendario de pared, una por golpe, de enero a diciembre, con las tres promesas escritas en la primera hoja.

## Cómo se arma (lo aprendido de rimu y de promptsmotion.com)
Una sola toma: cada escena sale de un objeto de la anterior, sin fundidos ni círculos; nada quieto más de 1 s; algo pasa en cada golpe de la música; una pastilla ámbar que cambia de forma ("Leíste" → "+5" → "13 días"). Antes de producir: mapa de golpes y 4 fotos para su sí. Antes de entregar: `medir-video.py` contra rimu.

## Voz (20 oct)
`rimu2/voz/tiempo-fernando-v1-limpia.mp3` (23,6 s, las 80 palabras exactas; `.palabras.json` al lado). La toma cortaba "hiciste": el final ("Mes a mes…" hasta "te la muestro") se generó aparte con una palabra de relleno al terminar ("Gracias por ver", que se quitó) y se empalmó en 17,42 s.

## Mapa de golpes (v1)
Gancho sin música, con un golpe de efecto en cada palabra clave. "Quick Cuts Groove" (un golpe cada 0,545 s) entra en "Racha" (5,96 s), que cae justo en un golpe. Nada queda quieto más de 1 s; cada escena sale de un objeto de la anterior.

| Segundo | Voz | Lo que pasa |
|---|---|---|
| 0,0 | "Cada enero" | "ENERO" gigante en blanco sobre negro, acercándose despacio |
| 0,66 | "dices" | "ENERO" se encoge hasta ser un cuadrito; la cámara se aleja y aparece la columna de enero, gris |
| 2,02 | "leo" | Cae un libro grande con su casilla vacía (golpe) |
| 2,52 | "entreno" | Cae la pesa con su casilla (golpe) |
| 3,33 | "ahorro" | Cae la alcancía con su casilla (golpe) |
| 3,95 | "Y en diciembre" | Los meses pasan de golpe, una columna gris por cada sílaba, hasta que todo el año está gris |
| 4,11 | "diciembre" | "DICIEMBRE" grande arriba (golpe) |
| 4,84 | "sigues" | Las tres casillas siguen vacías y los íconos se apagan a gris |
| 5,33 | "igual" | El año gris tiembla una vez |
| 5,96 | "Racha" | ENTRA LA MÚSICA. Los tres íconos grises se meten en el ícono de Racha, que salta con rebote |
| 6,54 | "app" | "Racha" sube desde una línea, debajo del ícono |
| 7,50 | "hábitos" | Del ícono salen otra vez los tres íconos, ahora en ámbar, y lo rodean |
| 7,97 / 8,21 / 8,37 | "día por día" | Tres cuadritos ámbar saltan uno por golpe |
| 8,77 | "Cada día" | El ícono de Racha crece y se vuelve el celular con Hoy (el borde nace del ícono) |
| 9,50 | "lees" | La cámara se acerca a "Leer 10 páginas" |
| 9,83 | "entrenas" | Pasa a "Entrenar 30 minutos" |
| 10,62 | "marcas" | El dedo toca y se marca (la app de verdad) |
| 11,34 | "pinta" | El chulo salta del celular y se vuelve un cuadrito ámbar |
| 11,74 | "cuadrito" | El cuadrito cae grande al centro con rebote |
| 12,47 | "Si un día no puedes" | El cuadrito se apaga a gris y de él sale el libro grande, "10 páginas" |
| 13,53 | "haces" | El celular vuelve con la hoja "Día difícil" |
| 14,24 | "pequeña" | El libro se encoge a uno pequeño (golpe) |
| 15,52 | "página" | Pastilla "1 página" |
| 16,26 | "ese día" | Se marca "Leer 10 páginas · +5 ganados · versión mínima" |
| 16,65 | "también cuenta" | Chulo ámbar grande que se dibuja + "TAMBIÉN CUENTA" |
| 17,61 | "Mes a mes" | El chulo se vuelve un cuadrito y se multiplica: la cámara se aleja y aparece Tu año (la app), el mismo año gris del comienzo |
| 17,6 a 19,7 | "se llena tu año" | Se llenan dos meses por golpe, de enero a diciembre |
| 19,70 | "diciembre" | Se llena diciembre; "DICIEMBRE" ahora en ámbar (contesta al gancho) |
| 20,18 a 21,08 | "ves todo lo que sí hiciste" | La cámara se aleja hasta ver el año entero lleno; pulso en "sí" |
| 21,80 | "Escribe Racha" | El año se encoge en la pastilla ámbar: "escribe RACHA" |
| 22,78 | "muestro" | "y te la muestro" y la pastilla del precio |

Para producir hace falta grabar de la muestra: Hoy con "Leer 10 páginas" marcado completo (+10) y Tu año de enero a diciembre lleno (la muestra creyendo que es 31 de diciembre).
