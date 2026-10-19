# Referencias del 13 de octubre: el estilo nuevo del creador (el elevador y el espejo)

Johnatan dejó dos videos nuevos del mismo creador de `oct10` (`ref6.mp4`, el elevador; `ref7.mp4`, el espejo) y pidió: "es importante que revises al influencer y su estilo; quiero que intentes replicar lo que más puedas… a veces pone también videos… tomas con un tipo de filtro raro como de papel, y se mueve diferente, como si fuera un clip".

Cómo arma el guion está en `../guia-creador-para-ia.md`. Aquí va **cómo se ve y cómo se mueve**. Hojas de fotos en `hojas/` y `hojas/det/`.

**Lo que Claude no pudo juzgar:** no oye (música, efectos, voz) y no ve el video corrido; el movimiento se midió comparando cuadros seguidos.

## Lo que cambió frente a los cuatro videos de `oct10`

Ya no son dos personajes actuando todo el video. Ahora hay tres "mundos" que se turnan cada 2 a 5 segundos:

1. **La escena de apertura** (10 a 25 s): actuada, casi sin palabras, con luz fría (un elevador, un espejo).
2. **Él a cámara:** muy cerca, lente ancho, fondo oscuro y cálido (lámparas desenfocadas, o un resplandor naranja detrás), camiseta negra, **un micrófono pequeño de solapa sostenido en la mano**. Subtítulos blancos pequeños a la altura del pecho, con un brillo suave, de dos o tres palabras.
3. **Lo ilustrado**, que es donde está el estilo. Tiene dos versiones:
   - **Papel** (ref6): fondo de papel crema arrugado, con dobleces y sombras.
   - **Negro con luz** (ref7): fondo negro con siluetas que brillan en naranja o en blanco.

## El "filtro de papel", pieza por pieza

- **El fondo es una hoja de papel crema arrugada** (se ven los dobleces). Cambia un poco de tono entre tomas (más gris, más sepia).
- **Encima van recortes:** personas sacadas de un video de verdad y recortadas del fondo (dos personas sentadas conversando, parejas de pie frente a frente), retratos de grabado antiguo, un cerebro, una figura de espaldas. Son pequeños y dejan mucho papel vacío alrededor.
- **Trama de puntos de periódico** sobre las fotos y los videos (se ve al ampliar: puntos en diagonal, como impresión vieja). Va en blanco y negro o en sepia.
- **Un solo color de acento, naranja:** una tira de papel naranja que tapa los ojos, una mancha naranja detrás de una cara, palabras escritas a mano en naranja, signos de pregunta garabateados.
- **Dos letras:** una de palo seco, negra, **muy gruesa y apretada** para la palabra fuerte ("pares de", "algo que no", "nada más el"), con una línea pequeña y delgada encima; y **una letra a mano, en mayúsculas torcidas, naranja**, para la palabra clave ("COINCIDE", "DESCONOCIDOS", "DOS EXTRAÑOS" en arco). Las palabras entran una por una.
- **Videos de verdad con el mismo tratamiento:** caras en primer plano en blanco y negro con trama; parejas sobre fondo blanco (video de banco) metidas en un recuadro pequeño sobre el papel o a pantalla completa; un ojo en primerísimo plano. Material de archivo de famosos (partidos de tenis, entrevistas): eso no lo podemos usar.

## Cómo se mueve (medido)

- El video va a 24 cuadros por segundo, pero **lo ilustrado cambia a saltos**: en los tramos de papel el patrón es "dos cuadros que cambian, dos quietos" (unas 6 imágenes nuevas por segundo, con un cuadro de paso entre una y otra); en los de siluetas es "uno sí, uno no" (12 por segundo). Por eso se siente como animación hecha cuadro por cuadro y no como video normal. En cambio, él a cámara y el material de archivo van fluidos.
- En cada salto **el papel y la trama se corren un poco**, y las letras a mano tiemblan.
- Cada imagen dura lo que dura la frase que ilustra y muestra exactamente lo que se nombra.

## Qué se puede replicar y con qué

| Pieza | ¿Se puede? | Cómo |
|---|---|---|
| Papel arrugado de fondo | Sí | Dibujado por programa (`prueba-papel.py`) o una foto de papel generada en Flow |
| Trama de puntos, sepia o blanco y negro | Sí | Por programa, cuadro por cuadro |
| Movimiento a saltos | Sí | Se toma el video a 8 imágenes por segundo y cada una se sostiene tres cuadros |
| Personas recortadas de un video | Sí | `hyperframes remove-background` (tarda unos minutos por clip) |
| Letra gruesa + letra a mano naranja que tiembla | Sí, parecido | Con letras que ya están en el computador; no son las mismas del creador |
| Siluetas que brillan sobre negro | Sí | El recorte relleno de un color con resplandor |
| Videos en vez de fotos | Sí | Clips sin voz hechos en Flow a partir de las imágenes ya generadas (unos 12 créditos cada uno) o videos de banco con permiso de uso comercial |
| Él a cámara con micrófono pequeño | Ya lo tenemos | Jhonny (con micrófono de estudio; es parecido, no igual) |
| Material de archivo de famosos | No | Derechos de imagen; en un anuncio no va |

Prueba hecha con material nuestro: `campana/pruebas/efecto-papel-v1.mp4` (`python design/herramientas/prueba-papel.py`).
