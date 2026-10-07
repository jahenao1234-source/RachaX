---
workflow: general-video
flow: automation
storyboard: no
message: "Empezar con todo es empezar a abandonar; Racha te hace empezar con uno solo"
destination: instagram-reels
aspect: 1080x1920
language: es
audience: "Adultos de 22 a 40 años en Colombia que empiezan muchos hábitos y los sueltan; no conocen Racha"
length: 29s
---

## Intent

Anuncio vertical para Meta que lleva a WhatsApp. Lina, una presentadora hecha con IA, le habla a la cámara desde su cocina, cercana y sin regañar. No es un testimonio: no cuenta vivencias propias ni promete resultados. Es la edición de material ya grabado (cuatro clips), no una pieza nueva.

## Assets

- assets/1-gancho.mp4 — Lina, el gancho: "¿El lunes empiezas con todo y el jueves ya lo soltaste?"
- assets/2-mito.mp4 — Lina cuenta con los dedos: "Gimnasio, leer, madrugar, comer bien: todo de una. No es pereza: empezar con todo es empezar a abandonar."
- assets/3-solucion.mp4 — Lina con el café: "Racha te hace empezar con uno solo, amarrado a algo que ya haces. Después del desayuno, una página."
- assets/4-cierre.mp4 — Lina señala hacia abajo: "Y cuando quieras más, vas de a tres, no de a diez. Es una app y se paga una sola vez. Escríbenos aquí abajo."
- assets/app-despues.png y assets/app-minimo-y-hoy.png — capturas reales de la app (pantalla "Nuevo hábito"), ya compuestas a 1080 x 1920.
- assets/cierre.png — cierre con el precio: Racha, $37.900, un solo pago, 7 días para probarla.
- assets/whoosh.wav, assets/ding.wav — sonidos de prueba fabricados; se pueden cambiar.

## Customizations

- Quitar los silencios: solo quedan los tramos con voz, según los tiempos por palabra de AssemblyAI.
- Subtítulos palabra por palabra, frases de hasta tres palabras, la palabra dicha en ámbar (#f5a524).
- La app entra a pantalla completa mientras su voz sigue.

## Notes

- Nada va encima de la presentadora.
- Subtítulos dentro de la zona segura de Reels: ni sobre la cara ni en el 35 % de abajo.
- No decir ni escribir resultados, plazos, reseñas ni urgencia.
- El proyecto se genera con `design/herramientas/hf-lina.mjs`; para cambios grandes se edita ese script y se vuelve a correr.
