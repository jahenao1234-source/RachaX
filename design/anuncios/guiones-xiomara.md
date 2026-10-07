# Guiones de video con Xiomara (versión 1, sin aprobar)

Hechos el 5 de octubre de 2026 con la skill `estratega-avatarhype`. Xiomara es la presentadora hecha con IA (ver `design/avatar/`). Habla en "tú", nunca cuenta vivencias propias. Mercado: Colombia, gente que no conoce Racha. El anuncio lleva a WhatsApp.

## Estrategia

**Culpable:** volver a cero. Fallas un día, el contador se borra, sientes que perdiste todo y sueltas.
**Por qué Racha lo rompe:** la versión mínima cuenta como cumplido, un comodín congela un día, y el día que vuelves vale el doble.
**Entrada:** por el problema y el culpable; el precio y "es una app" al cierre.

### Los 12 ángulos
1. Problema · El día malo · "Fallaste un día. ¿Y ya botaste todo?"
2. Identidad · El que empieza cada lunes · "Si empiezas cada lunes, esto es para ti."
3. Mecanismo · El culpable es el cero · "El problema no eres tú: es volver a cero."
4. Beneficio · Lo aplazado, en pasos · "Eso que llevas meses aplazando, hoy lo empiezas."
5. Rompe-objeciones · Otra app más · "¿Otra app que vas a borrar en una semana?"
6. Emocional · Volver también cuenta · "Llevas días sin aparecer. Vuelve sin culpa."
7. Estatus · El que sí cumple · "Los constantes no tienen más ganas que tú."
8. Miedo o pérdida · Otra vez desde cero · "¿Cuántas veces has empezado este año?"
9. Comodidad · Haz solo lo mínimo · "¿Hoy no puedes con nada? Haz lo mínimo."
10. Precio y valor · Un solo pago · "Una app. Un pago. No es mensualidad."
11. Comparación · Las apps que castigan · "Otras apps te borran todo por un día."
12. Rompe-mitos · Empezar con todo · "Empezar con todo es empezar a abandonar."

Extras: La cabeza en mil cosas ("Siete cosas empezadas. Ninguna terminada.") y El examen encima ("Faltan cinco semanas y no has abierto el libro.").

Elegidos para la primera tanda (Johnatan dijo "elige los 3 mejores"): 3, 1 y 4.

## Comprobado en el código (5 oct 2026)
- La versión mínima cuenta como cumplido y da 5 puntos en vez de 10 (`dificilUtils.ts`).
- En Hoy sale "¿Día pesado? Haz solo lo mínimo ›" y la hoja se llama "Día difícil".
- Se guardan hasta 3 comodines y llega 1 cada mes (`HabitContext.tsx`).
- "Volviste. Hoy cada hábito vale el doble: +20." (`TodayScreen.tsx`), después de 3 o más días sin cumplir.
- En la Biblioteca existen las tareas "Sacar o renovar el pasaporte", "Declarar renta" y "Hacer la hoja de vida".
- OJO: la racha SÍ se rompe si un día queda sin cumplir y sin comodín. Ningún guion dice "nunca vuelves a cero".

## Guion 1 · El culpable es el cero (ángulo 3, mecanismo)

Gente que no conoce Racha · Emoción: alivio

- CLIP 0 · GANCHO. Rótulo: "No eres tú. Es el cero." Se ve: Xiomara en la sala, selfie, niega con la cabeza. Dice: "El problema no eres tú: es volver a cero."
- CLIP 1 · PROBLEMA. Se ve: un contador en pantalla que pasa de 23 a 0 (gráfico propio). Voz: "Llevas veintitrés días, fallas uno, y el contador te devuelve a cero."
- CLIP 2 · AGITAR. Se ve: Xiomara. Dice: "Y con el cero llega el 'ya qué'. Ahí es donde botas todo."
- CLIP 3 · SOLUCIÓN. Se ve: la app, pantalla Hoy; se toca "¿Día pesado? Haz solo lo mínimo ›" y sale la hoja "Día difícil". Voz: "Racha te guarda la partida. ¿Día pesado? Haces lo mínimo y cuenta."
- CLIP 4 · PRUEBA. Se ve: la app; "Congelar ayer" en Tus comodines, y luego el aviso "Volviste. Hoy cada hábito vale el doble". Voz: "¿No hiciste nada? Un comodín congela ese día. Y el día que vuelves vale el doble."
- CLIP FINAL · CIERRE. Rótulo: "Racha es una app. $37.900, un solo pago. 7 días para probarla." Se ve: Xiomara. Dice: "Es una app y se paga una sola vez. Escribe por WhatsApp aquí abajo."

## Guion 2 · El día malo (ángulo 1, problema)

Gente que no conoce Racha · Emoción: sentirse entendido

- CLIP 0 · GANCHO. Rótulo: "Jueves, 9:30 p. m." Se ve: Xiomara sentada en la cama, luz de lámpara, camiseta gris. Dice: "Hoy no hiciste nada de lo que dijiste."
- CLIP 1 · PROBLEMA. Se ve: Xiomara. Dice: "Y ya sabes lo que sigue: 'mañana empiezo de nuevo'. Y mañana tampoco."
- CLIP 2 · GIRO. Se ve: Xiomara. Dice: "Nadie abandona un domingo descansado. Se abandona en un día así."
- CLIP 3 · SOLUCIÓN. Se ve: la app, pantalla Hoy; se toca "¿Día pesado? Haz solo lo mínimo ›". Voz: "Racha es una app hecha para ese día. Tocas 'haz solo lo mínimo'."
- CLIP 4 · PRUEBA. Se ve: el hábito "Leer 20 minutos" con "Mínimo: leer una página"; se marca y la racha sigue. Voz: "Una página en vez de veinte minutos. Cuenta, y mañana sigues donde ibas."
- CLIP FINAL · CIERRE. Rótulo: "Racha es una app. $37.900, un solo pago. 7 días para probarla." Se ve: Xiomara en la cama, media sonrisa. Dice: "Se paga una sola vez. Escribe por WhatsApp aquí abajo."

## Guion 3 · Lo aplazado, en pasos (ángulo 4, beneficio)

Gente que no conoce Racha · Emoción: ganas de arrancar

- CLIP 0 · GANCHO. Rótulo: "¿Qué llevas meses aplazando?" Se ve: Xiomara en el escritorio con papeles, levanta una ceja. Dice: "¿Qué llevas meses aplazando?"
- CLIP 1 · PROBLEMA. Se ve: Xiomara; van saliendo tres rótulos: "El pasaporte", "La renta", "La hoja de vida". Dice: "¿El pasaporte? ¿La declaración de renta? ¿La hoja de vida?"
- CLIP 2 · EL PORQUÉ. Se ve: Xiomara. Dice: "No es pereza. Es que así de grande no hay por dónde cogerlo."
- CLIP 3 · SOLUCIÓN. Se ve: la app, Biblioteca › Tareas › "Sacar o renovar el pasaporte"; se agrega y aparece la lista de pasos. Voz: "En Racha esa tarea ya viene partida en pasos. La agregas y listo."
- CLIP 4 · PRUEBA. Se ve: se toca el play del primer paso y arranca el reloj en 25:00. Voz: "Tocas el primero, veinticinco minutos de reloj, y ya empezaste."
- CLIP FINAL · CIERRE. Rótulo: "Racha es una app. $37.900, un solo pago. 7 días para probarla." Se ve: Xiomara. Dice: "Es una app y se paga una sola vez. Escribe por WhatsApp aquí abajo."

## Ensayo del guion 1 (5 oct 2026): versión "la cubeta de huevos"

Johnatan pidió que Xiomara camine, haga cosas, que la cámara se mueva, que sea innovador y que el gancho sea visual. Eligió el gancho de la cubeta de huevos. Xiomara dice todo el guion a cámara en 4 clips de 10 segundos (así la voz es la misma y después se tapa con las pantallas de la app). Están en el proyecto de Flow "oct 05 - 17:21", 15 créditos cada uno.

| Clip | Nombre en Flow | Lo que hace | Lo que dice |
|---|---|---|---|
| A | Woman dropping eggs in kitchen | En la cocina con la cubeta; un huevo se quiebra; se encoge de hombros; la cámara se acerca | "Se te quiebra un huevo... ¿y botas la cubeta entera? Eso es volver a cero por fallar un día." |
| B | Woman walking and speaking spanish | Camina de la cocina a la sala en selfie y se sienta en el sofá | "Llevas veintitrés días, fallas uno, y el contador te devuelve a cero. Y con el cero llega el 'ya qué'. Ahí es donde botas todo." |
| C | Woman cooking egg in kitchen | Saca un solo huevo y lo frita | "Racha te guarda la partida. ¿Día pesado? Haces lo mínimo y cuenta. ¿No hiciste nada? Un comodín congela ese día." |
| D | Woman speaking about app | En la mesa con el huevo frito; señala hacia abajo | "Y el día que vuelves vale el doble. Racha es una app y se paga una sola vez. Escríbenos aquí abajo." |

Lo que se aprendió:
- **Flow no generó el clip D mientras el texto decía "WhatsApp"** (dos intentos: un error y un aviso de políticas, sin cobro). Sin esa palabra salió a la primera. WhatsApp va en el rótulo y en el botón del anuncio, no en la boca de Xiomara.
- En el clip A el huevo se quiebra dentro de la cubeta, no en el piso, y en las fotos revisadas no se ve la caneca.
- En el clip B, al final queda sentada con las dos manos en las rodillas y la cámara sigue al frente (ya no es selfie).
- En el clip C la estufa quedó en la sala, con el sofá detrás.
- Revisado solo por fotos: falta que Johnatan los oiga y diga si dice el texto exacto.
- Falta unirlos y montar encima las pantallas de la app (hace falta ffmpeg, que no está instalado, o hacerlo en otro editor).

## Pendiente de producción
- Cada clip de Xiomara dura máximo 10 segundos en Flow.
- Los clips de la app son grabaciones reales de pantalla, no generadas.
- Falta ver cómo sacar la voz de Xiomara sobre los clips de la app (que sea la misma voz).
- Falta que Johnatan oiga el video de prueba y apruebe la voz.
- Falta revisar la regla de Meta para personas hechas con IA.

## Guion 4 · Todo en un solo viaje (ángulo 12, rompe-mitos) · versión 1, sin aprobar

Escrito el 6 de octubre de 2026 para la avatar nueva (mujer de unos 34 años, cocina con repisa de especias; prompt 6C entregado, Johnatan la genera). Gente que no conoce Racha · Emoción: sentirse pillado, con humor.

- CLIP 0 · GANCHO. Rótulo: "¿Todo en un solo viaje?" Se ve: entra a la cocina cargando seis bolsas de mercado a la vez; una se le suelta y ruedan naranjas por el piso. Dice: "¿Tú también lo quieres cargar todo en un solo viaje?"
- CLIP 1 · PROBLEMA. Se ve: suelta las bolsas en el mesón, respira y mira a la cámara. Dice: "Así empiezas cada lunes: gimnasio, leer, madrugar y comer bien. Todo de una."
- CLIP 2 · EL MITO. Se ve: se agacha y recoge una naranja del piso. Dice: "Y el jueves ya soltaste todo. No es pereza: empezar con todo es empezar a abandonar."
- CLIP 3 · SOLUCIÓN. Se ve: pone una sola naranja en el mesón; corte a la app, el arranque que crea un solo hábito con "Después de ___". Dice: "Racha te hace empezar con uno solo, amarrado a algo que ya haces."
- CLIP 4 · PRUEBA. Se ve: la app, Biblioteca › Hábitos ("Grupos de hasta 3 hábitos…") y un pack con sus "Después de…". Dice: "Después del desayuno, una página. Y cuando quieras más, vas de a tres, no de a diez."
- CLIP FINAL · CIERRE. Rótulo: "Racha es una app. $37.900, un solo pago. 7 días para probarla." Se ve: ella pelando la naranja, tranquila; señala hacia abajo. Dice: "Es una app y se paga una sola vez. Escríbenos aquí abajo."

Comprobado en el código (6 oct): el arranque crea un solo hábito y pregunta "¿Después de qué?" (OnboardingModal); la Biblioteca dice "Grupos de hasta 3 hábitos. Cada uno va después de algo que ya haces y trae su versión mínima para los días pesados."; pasar de 3 muestra un aviso pero NO bloquea, así que el guion no dice que la app lo impida.

### Guion 4, versión 2 (6 oct): gancho sencillo y prompts de producción

Johnatan pidió un gancho más sencillo (sin bolsas ni naranjas) y usar al producir las piezas de la biblioteca del curso: movimiento de cámara, micro-acción, guion, voz y acento. Cuatro clips de hasta 10 segundos, ella habla a cámara en la cocina; la app se monta a pantalla completa al editar. Falta la avatar (la está generando él).

Línea de voz y de acento, iguales en los cuatro clips:
- Voice: a female voice in her mid-30s, medium pitch, a bit fuller and more settled than a twenty-something, calm and confident, warm but grounded.
- Spanish with a clear, neutral Colombian (Bogotá) accent.

| Clip | Cámara | Micro-acción | Lo que dice |
|---|---|---|---|
| 1 · Gancho | Acercamiento rápido a la cara al empezar a hablar | Ladea la cabeza con curiosidad (antes de hablar) | "¿El lunes empiezas con todo y el jueves ya lo soltaste?" |
| 2 · El mito | Cámara quieta con gestos | Cuenta con los dedos mientras habla | "Gimnasio, leer, madrugar, comer bien: todo de una. No es pereza: empezar con todo es empezar a abandonar." |
| 3 · Solución | Cámara en mano sutil | Da un sorbo de café y deja el pocillo (antes de hablar) | "Racha te hace empezar con uno solo, amarrado a algo que ya haces. Después del desayuno, una página." |
| 4 · Cierre | Acercamiento lento a la cara | Señala hacia abajo al final | "Y cuando quieras más, vas de a tres, no de a diez. Es una app y se paga una sola vez. Escríbenos aquí abajo." |
