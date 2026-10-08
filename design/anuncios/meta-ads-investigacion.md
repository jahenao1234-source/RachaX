# Anuncios en Meta para vender por WhatsApp: investigación (2 de octubre de 2026)

Pedido de Johnatan: entender a fondo los anuncios, Meta Ads y sus políticas, porque quiere invertir fuerte en pauta y que lleguen compradores, no "preguntones".
Tres rondas: (1) estructura, creativos, aprendizaje, costos y cómo filtrar; (2) políticas oficiales, leídas en su navegador; (3) cómo avisarle a Meta quién compró.

## Qué tan firme es cada cosa
- **Leído en la fuente oficial:** la política de atributos personales de Meta (transparency.meta.com), la Política de mensajes de WhatsApp Business (actualizada el 23 de septiembre de 2026), la Política de comercio de Meta y la ayuda de ManyChat sobre la Conversions API.
- **De terceros (agencias y herramientas), pero repetido en muchas fuentes:** estructura de campañas, cantidad de creativos, fase de aprendizaje, formatos, cifras de costos. Las cifras son de ellos y no están verificadas.
- **Sin confirmar:** que ManyChat pueda mandar el evento de compra desde el canal de WhatsApp (su ayuda lo documenta para Instagram y Messenger), los límites de gasto de una cuenta nueva, y los costos reales en Colombia para este producto. Eso solo se sabe conectando y probando.
- No existe un "95 %" medible. Lo que falta por saber no está en internet: sale de correr anuncios y leer los números.

## 1. Políticas

### Atributos personales (oficial)
Los anuncios no pueden afirmar ni insinuar atributos personales: raza, religión, edad, orientación sexual, identidad de género, discapacidad, **enfermedades físicas o mentales**, **situación financiera vulnerable**, condición de votante, sindicato, antecedentes penales, nombre.
Permitido, textual: **"Usar 'tú/tu' sin un atributo personal"** y "contenido que describe o muestra el producto o servicio".
Ejemplos oficiales: sí "Ayuda en caso de depresión"; no "¿La depresión te está desanimando?"; no "¿Estás en la ruina?".
**Para Racha:** dejar hábitos, aplazar o empezar de cero NO es un atributo protegido, así que se puede hablar de "tú" con toda confianza ("¿Empiezas con ganas y a las semanas lo dejas?"). Claude había sido más cauteloso de lo necesario. Lo que sí se evita: TDAH, ansiedad, depresión, "tu mente dispersa" como condición, y cualquier alusión a no tener plata.
Terceros dicen que desde 2026 la revisión detecta también el sentido implícito, no solo las palabras.

### Promesas y engaño (terceros, consistente con las Normas de publicidad)
No resultados exagerados ni plazos garantizados ("en 30 días"), no urgencia falsa, no antes y después. Describir el producto y cómo funciona. Coincide con la ley 1480 y con lo decidido para los PDF.

### WhatsApp Business (oficial)
- **Vender un producto digital por chat no está en la lista de prohibidos.** La prohibición de "contenido digital descargable, suscripciones digitales o cuentas digitales" está en la Política de comercio, que aplica a Marketplace, tiendas y **el catálogo de WhatsApp Business**. Conclusión: **no poner Racha en el catálogo de WhatsApp ni usar los pagos de WhatsApp.** Vender conversando y cobrar por Bre-B por fuera no cae en esa regla. Es la lectura de Claude del texto, no un concepto legal.
- **"No compartas ni pidas a las personas que compartan números completos de tarjetas de pago, números de cuentas bancarias, números de documentos de identificación personal."** Afecta el mensaje de devolución: hay que pedir una llave Bre-B que sea celular, correo o alias, nunca cédula ni número de cuenta.
- Se puede automatizar dentro de las 24 horas, pero con una salida clara a una persona, teléfono o correo. Ya la hay (mensaje 20).
- Para escribirle a alguien después hace falta su **permiso expreso** para recibir más mensajes. Falta una frase que lo pida antes de los mensajes de los días 3 y 7.
- El perfil de WhatsApp Business debe tener datos de contacto reales (correo o sitio).
- No engañar sobre quién es el negocio. Si WhatsApp recibe muchos bloqueos o reportes, limita la cuenta: los seguimientos deben ser pocos y útiles.

## 2. Cómo funciona Meta ahora
- **El anuncio es la segmentación.** Con público amplio, el sistema lee el creativo y busca a quién mostrárselo. Por eso el anuncio mismo decide quién llega.
- **Variedad de verdad:** conceptos distintos (otro gancho, otro formato, otra persona), no el mismo anuncio con cambios pequeños. Recomendaciones citadas: una campaña, uno o dos grupos de anuncios, y de 10 a 20 creativos; refrescar 2 a 4 veces al mes. Mezclar video e imagen; algunos aconsejan separarlos en grupos distintos.
- **Marco oficial "Performance 5":** simplificar la cuenta, automatizar, diversificar creativos, buena calidad de datos (Conversions API) y validar resultados.
- **Formato:** vertical 9:16 primero, 4:5 después. Subtítulos siempre (la mayoría ve sin sonido). El gancho en los primeros 3 segundos.
- **Lo que parece contenido normal rinde más que lo que parece anuncio** para gente que no conoce la marca. El video de Johnatan hablando y las grabaciones de pantalla pesan más que una pieza muy pulida.
- **Medidas del video:** tasa de gancho (vistas de 3 segundos sobre impresiones): 30 % o más es bueno, menos de 15 % es flojo.
- **Fase de aprendizaje:** cada grupo de anuncios necesita unos 50 resultados por semana para estabilizarse. No tocarlo mientras aprende. Subir el presupuesto de a 20 % cada 2 a 4 días.
- **Una cuenta nueva no puede gastar mucho de una:** Meta le pone un tope diario que sube con el historial y con la verificación del negocio. "Gastar lo más que se pueda" es un proceso de semanas.

## 3. Cómo evitar a los preguntones
La causa: **si la campaña se optimiza para "conversaciones", Meta busca gente a la que le gusta chatear, no gente que compra.**
De más fuerte a menos:
1. **Avisarle a Meta quién compró.** Mandar el evento de compra (con valor $37.900 COP) por la Conversions API para mensajes. Con suficientes compras registradas, Meta deja optimizar la campaña por "compras por mensaje". ManyChat tiene la acción "Send event to Meta Conversions API" (documentada para Instagram y Messenger; en WhatsApp hay que confirmarlo al conectar). Si ManyChat no lo permite en WhatsApp, la función registrar-compra podría mandarlo.
2. **Filtrar en el anuncio.** Decir el precio, que es una app y que es un solo pago. Llegan menos chats, pero mejores. Lo que Johnatan había oído es correcto.
3. **Filtrar en el chat.** La primera pregunta ya lo hace.
4. **Medir por costo por compra,** no por costo por conversación.

## 4. La cuenta que manda (aritmética, no consejo financiero)
Máximo que se puede pagar por conversación = precio × porcentaje de chats que compran.
Con $37.900: si compra 1 de cada 10, cada conversación puede costar hasta $3.790; si compra 1 de cada 20, hasta $1.895. Por encima de eso se pierde plata en cada venta.
Con un precio tan bajo, el margen para pauta es estrecho. Subir lo que deja cada cliente (el order bump que quedó pendiente) es lo que más espacio abre para invertir.

## 5. Qué cambia en lo nuestro
- Reescribir los anuncios hablando de "tú" directo, con ganchos más fuertes.
- Poner en los anuncios el precio, "app" y "un solo pago".
- Subir de 8 a unas 12 o 15 piezas con conceptos distintos, todas verticales, con versiones que parezcan contenido normal.
- En WhatsApp: pedir permiso para escribir después; cambiar el mensaje de devolución (llave que no sea cédula ni cuenta); perfil con correo y sitio.
- Al conectar ManyChat: mandar el evento de compra a Meta.
- No usar el catálogo ni los pagos de WhatsApp.

## Fuentes
Oficiales:
- https://transparency.meta.com/es-la/policies/ad-standards/objectionable-content/privacy-violations-personal-attributes/
- https://whatsappbusiness.com/es-la/policy/
- https://www.facebook.com/policies_center/commerce/
- https://help.manychat.com/hc/en-us/articles/14580897414300-Conversions-API-CAPI-integration
De terceros:
- https://www.stackmatix.com/blog/meta-ads-personal-attributes-policy
- https://www.1clickreport.com/blog/meta-andromeda-update-2025-guide
- https://benly.ai/learn/meta-ads/meta-ads-performance-5-framework
- https://adlibrary.com/posts/meta-ads-learning-phase-50-events-guide
- https://www.customerlabs.com/blog/why-meta-algorithm-chases-chatters-not-buyers-for-ctwa-ads/
- https://asisteclick.com/en/blog/click-to-whatsapp-ads-ctwa-conversion-2026/
- https://www.socialmediatoday.com/news/meta-shares-click-to-messaging-ad-tips/745595/
- https://adriselab.com/blog/what-is-a-good-hook-rate-meta-ads-2026
- https://www.aureliusmedia.co/blog/meta-ads-bad-quality-leads
- https://www.adamigo.ai/blog/meta-ad-spending-limits-what-you-need-to-know
- https://www.consolidaciondigital.com/blog/performance-marketing/cuanto-cuesta-meta-ads-colombia
- https://wappi.chat/blog/cambios-precios-meta-whatsapp-octubre-2026/

## Personas hechas con IA en los anuncios (revisado el 8 de octubre de 2026)

Leído en páginas de Meta (noticias y centro de transparencia), a través del buscador; no se abrió el artículo del Centro de ayuda para empresas.

- **No está prohibido** usar personas hechas con IA en un anuncio.
- **Meta les pone una etiqueta.** Para contenido hecho con herramientas de terceros (como Flow), Meta lo detecta por señales estándar del archivo y pone "AI info" (Información de IA) dentro de "Acerca de este anuncio", en el menú de tres puntos. Según su página de políticas, esa detección automática en anuncios empieza el 1 de junio de 2026 y **el anunciante no tiene que hacer nada**.
- Con las herramientas de IA de la propia Meta, si sale una persona realista hecha con IA, la etiqueta va al lado de "Publicidad".
- **Declararlo a mano solo es obligatorio en anuncios políticos, electorales o de temas sociales.** Racha no entra ahí.
- Lo que sigue aplicando de nuestro lado: el avatar no cuenta vivencias propias ni pasa por testimonio de un cliente.

Fuentes:
- https://about.fb.com/news/2025/02/gen-ai-transparency-metas-ads-products/
- https://transparency.meta.com/governance/tracking-impact/labeling-ai-content
- https://about.fb.com/news/2024/04/metas-approach-to-labeling-ai-generated-content-and-manipulated-media/
- https://transparency.meta.com/policies/ad-standards/SIEP-advertising/SIEP/
