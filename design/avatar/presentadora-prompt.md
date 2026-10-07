# La presentadora de los anuncios (personaje de IA)

Elegida por Johnatan el 5 de octubre de 2026: la referencia 1 de `presentador.html` ("la amiga que ya pasó por eso"), porque genera más confianza. Se basa en ese tipo de persona; no se copia la cara ni se le pasa la foto de Pinterest a la IA.

## Qué se conserva de la referencia
- Mujer de 35 a 40 años.
- Pelo castaño, ondulado, suelto, a la altura de los hombros, sin peinar del todo.
- Piel natural, sin maquillaje, con textura y líneas de la risa.
- Sonrisa abierta, mirada directa a la cámara.
- Ropa sencilla y oscura. Luz de ventana. Encuadre de selfie en la casa.

## Qué se mejora
- Más energía: que se vea a mitad de una frase, no posando.
- Un detalle que la haga reconocible en todos los anuncios (una cadena delgada dorada).
- Un toque de ámbar en el fondo, que es el color de Racha.
- Que la casa se vea como una de aquí, no de catálogo.

## Paso 1: la imagen base (retrato de frente)

```
Foto vertical 9:16, tomada con la cámara frontal de un celular, de una mujer colombiana de 37 años en la sala de su casa.

Ella: pelo castaño oscuro, ondulado, suelto hasta los hombros, un poco despeinado. Ojos cafés. Cejas naturales. Piel real, sin maquillaje, con poros, algunas pecas y líneas de la risa marcadas junto a los ojos y la boca. Cara común, de persona normal, no de modelo. Lleva una camiseta negra sin mangas y una cadena dorada muy delgada.

Expresión: sonriendo con la boca abierta, como si acabara de empezar a contarle algo a una amiga. Cejas un poco levantadas. Mira directo a la cámara.

Encuadre: de los hombros hacia arriba, la cara centrada, un poco de espacio arriba de la cabeza. El celular lo sostiene ella con el brazo estirado.

Lugar: una sala sencilla de apartamento colombiano, fondo desenfocado: una ventana con luz de día a un lado, una pared clara, una mata y un cojín color ámbar en el sofá.

Luz: natural, de ventana, suave, de un lado. Sin flash, sin filtros.

Estilo: foto real de celular, sin retocar. Nada de piel lisa ni perfecta, nada de aspecto de estudio ni de publicidad.

Sin texto, sin letras, sin logos, sin marcas de agua.
```

**Resultado (5 oct 2026):** Johnatan generó tres en Gemini (`generadas/`) y eligió `base-2-ladeada.jpg` (sin gafas, a mitad de una frase). La de gafas ámbar salió con un ojo de otro color; la de frente, con la boca muy abierta.

## Paso 2: la misma mujer en otras tomas

Primero, la toma tranquila (para las herramientas que le dan voz a una foto, que suelen pedir la cara de frente y la boca cerrada):

```
La misma mujer de la imagen, exactamente la misma cara, las mismas pecas, el mismo pelo y la misma cadena dorada, en la misma sala. Foto vertical 9:16 tomada con la cámara frontal de un celular. Ahora mira de frente a la cámara, con la cabeza derecha, la boca cerrada y una sonrisa suave, tranquila. De los hombros hacia arriba, la cara centrada. Luz natural de ventana, foto real de celular sin retocar, piel con textura. Sin texto, sin letras, sin logos.
```


Se sube la imagen base que salió del paso 1 (la de la IA, no la de Pinterest) y se pide:

```
La misma mujer de la imagen, exactamente la misma cara, el mismo pelo y la misma cadena. Foto vertical 9:16 tomada con la cámara frontal de un celular. [AQUÍ VA LA ESCENA]. Luz natural, foto real de celular sin retocar, piel con textura. Sin texto, sin letras, sin logos.
```

Escenas para probar:
- Sentada en la cama de noche, con la luz de una lámpara, cara de cansada pero tranquila, hablando a la cámara.
- En la cocina por la mañana, con un pocillo de café en la mano, sonriendo.
- En un escritorio con el computador abierto y papeles, levantando una ceja, como diciendo "¿te suena?".
- Mostrando la pantalla de su celular hacia la cámara, con la otra mano señalándola (la pantalla en blanco: después se monta la captura real de la app).

## Reglas
- No dice vivencias como propias ("a mí me pasó"): habla de la app y de lo que le pasa a la gente.
- Pendiente: revisar en la fuente oficial qué pide Meta para anuncios con personas hechas con IA.
- Pendiente: escoger con qué herramienta se le da voz y movimiento.
