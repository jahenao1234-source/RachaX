// El contenido de la Biblioteca (DESIGN.md › "### Biblioteca"). Cada pack, tarea y plan lo aprueba Johnatan antes de entrar.
// Las reglas: máximo 3 hábitos por pack o plan; cada hábito con anclaje (sin "Después de") y su mínimo;
// los planes dicen lo que la persona HACE, nunca prometen un resultado (ley 1480).
// Los `id` y las `clave` no se cambian después de publicar: con ellos la app sabe qué está "Agregado".
import { ItemBiblioteca, PackBiblioteca, PlanBiblioteca, TareaBiblioteca } from '../utils/bibliotecaUtils';

export const PACKS_BIBLIOTECA: PackBiblioteca[] = [
  {
    tipo: 'pack', id: 'pack-manana-productiva', nombre: 'Mañana productiva', descripcion: '3 hábitos para empezar el día', icono: 'Sunrise',
    habitos: [
      { clave: 'agua', nombre: 'Tomar un vaso de agua', icono: 'Droplet', momento: 'manana', anclaje: 'despertarme', minimo: 'un sorbo' },
      { clave: 'cama', nombre: 'Tender la cama', icono: 'Bed', momento: 'manana', anclaje: 'bañarme', minimo: 'estirar la cobija' },
      { clave: 'tres-cosas', nombre: 'Escribir las 3 cosas importantes del día', icono: 'PenLine', momento: 'manana', anclaje: 'tomar café', minimo: 'escribir una sola' },
    ],
  },
  {
    tipo: 'pack', id: 'pack-estudiante', nombre: 'Estudiante', descripcion: '3 hábitos para estudiar un poco cada día', icono: 'GraduationCap',
    habitos: [
      { clave: 'estudiar', nombre: 'Estudiar 25 minutos', icono: 'GraduationCap', momento: 'tarde', anclaje: 'almorzar', minimo: 'abrir el cuaderno y leer un párrafo' },
      { clave: 'repasar', nombre: 'Repasar lo de hoy', icono: 'BookOpen', momento: 'noche', anclaje: 'cenar', minimo: 'leer mis apuntes 2 minutos' },
      { clave: 'manana-listo', nombre: 'Dejar listo lo de mañana', icono: 'Target', momento: 'noche', anclaje: 'lavarme los dientes', minimo: 'mirar qué tengo mañana' },
    ],
  },
  {
    tipo: 'pack', id: 'pack-celular-de-noche', nombre: 'Dejar el celular de noche', descripcion: '2 hábitos para soltar la pantalla antes de dormir', icono: 'Smartphone',
    habitos: [
      { clave: 'cargar-lejos', nombre: 'Dejar el celular cargando lejos de la cama', icono: 'Smartphone', momento: 'noche', anclaje: 'lavarme los dientes', minimo: 'ponerlo boca abajo' },
      { clave: 'sin-pantalla', nombre: 'Hacer algo sin pantalla antes de dormir', icono: 'Bed', momento: 'noche', anclaje: 'poner a cargar el celular', minimo: '2 minutos sin pantalla' },
    ],
  },
  {
    tipo: 'pack', id: 'pack-cuerpo-activo', nombre: 'Cuerpo activo', descripcion: '3 hábitos para moverte todos los días', icono: 'Footprints',
    habitos: [
      { clave: 'estirar', nombre: 'Estirarme', icono: 'Zap', momento: 'manana', anclaje: 'despertarme', minimo: 'estirar los brazos una vez' },
      { clave: 'caminar', nombre: 'Caminar 15 minutos', icono: 'Footprints', momento: 'tarde', anclaje: 'almorzar', minimo: 'caminar 2 minutos' },
      { clave: 'sentadillas', nombre: 'Hacer 10 sentadillas', icono: 'Dumbbell', momento: 'tarde', anclaje: 'llegar a casa', minimo: 'una sentadilla' },
    ],
  },
  {
    tipo: 'pack', id: 'pack-leer-mas', nombre: 'Leer más', descripcion: '2 hábitos para leer un poco cada noche', icono: 'BookOpen',
    habitos: [
      { clave: 'leer', nombre: 'Leer 10 páginas', icono: 'BookOpen', momento: 'noche', anclaje: 'cenar', minimo: 'una página' },
      { clave: 'idea', nombre: 'Anotar una idea de lo que leí', icono: 'PenLine', momento: 'noche', anclaje: 'leer', minimo: 'una frase' },
    ],
  },
  {
    tipo: 'pack', id: 'pack-tu-plata-al-dia', nombre: 'Tu plata al día', descripcion: '3 hábitos para saber en qué se te va la plata', icono: 'Wallet',
    habitos: [
      { clave: 'anotar-gasto', nombre: 'Anotar cada gasto', icono: 'PenLine', momento: 'flexible', anclaje: 'pagar algo', minimo: 'anotar solo el más grande' },
      { clave: 'saldo', nombre: 'Mirar mi saldo', icono: 'Wallet', momento: 'noche', anclaje: 'cenar', minimo: 'abrir la app del banco' },
      { clave: 'vuelto', nombre: 'Guardar el vuelto', icono: 'Star', momento: 'flexible', anclaje: 'llegar a casa', minimo: 'guardar una moneda' },
    ],
  },
];

/** Los temas de Tareas, en el orden en que salen. */
export const GRUPOS_TAREAS_BIBLIOTECA = ['Trámites', 'Casa', 'Estudio', 'Trabajo', 'Plata', 'Salud'];

export const TAREAS_BIBLIOTECA: TareaBiblioteca[] = [
  {
    tipo: 'tarea', id: 'tarea-declarar-renta', grupo: 'Trámites', nombre: 'Declarar renta', icono: 'ListChecks',
    pasos: [
      { texto: 'Reunir los papeles', pasos: [
        { texto: 'Pedir el certificado de ingresos y retenciones' },
        { texto: 'Descargar los extractos bancarios de fin de año' },
        { texto: 'Pedir los certificados de deudas y créditos' },
      ] },
      { texto: 'Revisar si me toca declarar', pasos: [
        { texto: 'Mirar los topes de este año en la página de la DIAN' },
        { texto: 'Comparar mis ingresos y mi patrimonio con esos topes' },
      ] },
      { texto: 'Llenar y presentar', pasos: [
        { texto: 'Entrar al portal de la DIAN con mi usuario' },
        { texto: 'Llenar el formulario con los papeles a la mano' },
        { texto: 'Firmar y presentar la declaración' },
        { texto: 'Pagar o guardar el recibo' },
      ] },
    ],
  },
  {
    tipo: 'tarea', id: 'tarea-pasaporte', grupo: 'Trámites', nombre: 'Sacar o renovar el pasaporte', icono: 'ListChecks',
    pasos: [
      { texto: 'Revisar qué necesito', pasos: [
        { texto: 'Mirar los requisitos y el costo en la página de la Cancillería' },
        { texto: 'Buscar mi cédula original' },
      ] },
      { texto: 'Pedir la cita', pasos: [
        { texto: 'Elegir la oficina más cercana' },
        { texto: 'Agendar la cita o mirar el horario de atención' },
      ] },
      { texto: 'Ir a la cita', pasos: [
        { texto: 'Llevar la cédula y el pasaporte anterior, si tengo' },
        { texto: 'Pagar el pasaporte' },
        { texto: 'Reclamarlo o esperar a que llegue' },
      ] },
    ],
  },
  {
    tipo: 'tarea', id: 'tarea-licencia-conduccion', grupo: 'Trámites', nombre: 'Renovar la licencia de conducción', icono: 'ListChecks',
    pasos: [
      { texto: 'Revisar que no tenga pendientes', pasos: [
        { texto: 'Consultar en el SIMIT si tengo multas' },
        { texto: 'Revisar que esté inscrito en el RUNT' },
      ] },
      { texto: 'Hacer el examen médico', pasos: [
        { texto: 'Buscar un centro de reconocimiento de conductores cerca' },
        { texto: 'Ir al examen con la cédula' },
      ] },
      { texto: 'Hacer el trámite', pasos: [
        { texto: 'Mirar cuánto cuesta en mi oficina de tránsito' },
        { texto: 'Ir a tránsito o hacerlo en línea, y pagar' },
        { texto: 'Reclamar la licencia nueva' },
      ] },
    ],
  },
  {
    tipo: 'tarea', id: 'tarea-organizar-cuarto', grupo: 'Casa', nombre: 'Organizar el cuarto', icono: 'Home',
    pasos: [
      { texto: 'Sacar lo que sobra', pasos: [
        { texto: 'Recoger la ropa del piso y de la silla' },
        { texto: 'Sacar platos, vasos y basura' },
        { texto: 'Llenar una bolsa con lo que ya no uso' },
      ] },
      { texto: 'Ordenar por zonas', pasos: [
        { texto: 'La cama y la mesa de noche' },
        { texto: 'El escritorio o la mesa' },
        { texto: 'El piso y debajo de la cama' },
      ] },
      { texto: 'Dejarlo fácil de mantener', pasos: [
        { texto: 'Darle un lugar fijo a lo que más uso' },
        { texto: 'Barrer o aspirar' },
      ] },
    ],
  },
  {
    tipo: 'tarea', id: 'tarea-limpiar-closet', grupo: 'Casa', nombre: 'Limpiar el clóset y sacar lo que no uso', icono: 'Home',
    pasos: [
      { texto: 'Sacar todo', pasos: [
        { texto: 'Sacar la ropa de un solo cajón o tramo' },
        { texto: 'Hacer tres montones: se queda, se va, no sé' },
      ] },
      { texto: 'Decidir', pasos: [
        { texto: 'Probarme lo del montón "no sé"' },
        { texto: 'Meter en una bolsa lo que se va' },
      ] },
      { texto: 'Guardar', pasos: [
        { texto: 'Doblar y guardar lo que se queda' },
        { texto: 'Repetir con el siguiente cajón o tramo' },
        { texto: 'Llevar la bolsa a donar o regalar' },
      ] },
    ],
  },
  {
    tipo: 'tarea', id: 'tarea-papeles-casa', grupo: 'Casa', nombre: 'Ordenar los papeles de la casa', icono: 'Home',
    pasos: [
      { texto: 'Juntar', pasos: [
        { texto: 'Reunir todos los papeles sueltos en un solo lugar' },
        { texto: 'Botar lo que ya no sirve' },
      ] },
      { texto: 'Separar', pasos: [
        { texto: 'Hacer montones: recibos, salud, banco, contratos y garantías' },
        { texto: 'Guardar cada montón en una carpeta marcada' },
      ] },
      { texto: 'Dejar a la mano', pasos: [
        { texto: 'Poner aparte lo que vence pronto' },
        { texto: 'Tomarles foto a los documentos importantes' },
      ] },
    ],
  },
  {
    tipo: 'tarea', id: 'tarea-preparar-examen', grupo: 'Estudio', nombre: 'Preparar un examen', icono: 'GraduationCap',
    pasos: [
      { texto: 'Saber qué entra', pasos: [
        { texto: 'Anotar los temas del examen' },
        { texto: 'Juntar apuntes, guías y talleres' },
        { texto: 'Contar cuántos días faltan' },
      ] },
      { texto: 'Repasar por temas', pasos: [
        { texto: 'Repartir los temas en los días que quedan' },
        { texto: 'Estudiar el primer tema 25 minutos' },
        { texto: 'Hacer un resumen de una hoja por tema' },
      ] },
      { texto: 'Practicar', pasos: [
        { texto: 'Hacer ejercicios o preguntas de exámenes anteriores' },
        { texto: 'Repasar solo lo que fallé' },
      ] },
      { texto: 'El día antes', pasos: [
        { texto: 'Dejar listo lo que debo llevar' },
      ] },
    ],
  },
  {
    tipo: 'tarea', id: 'tarea-trabajo-escrito', grupo: 'Estudio', nombre: 'Hacer un trabajo escrito', icono: 'GraduationCap',
    pasos: [
      { texto: 'Entender qué piden', pasos: [
        { texto: 'Leer la guía y anotar la fecha de entrega' },
        { texto: 'Escribir en una frase de qué va a tratar' },
      ] },
      { texto: 'Buscar', pasos: [
        { texto: 'Encontrar 3 fuentes' },
        { texto: 'Anotar las ideas que sirven de cada una' },
      ] },
      { texto: 'Escribir', pasos: [
        { texto: 'Hacer el esquema con los títulos' },
        { texto: 'Escribir el desarrollo sin corregir' },
        { texto: 'Escribir la introducción y la conclusión' },
      ] },
      { texto: 'Entregar', pasos: [
        { texto: 'Revisar ortografía y citas, y entregar' },
      ] },
    ],
  },
  {
    tipo: 'tarea', id: 'tarea-exposicion', grupo: 'Estudio', nombre: 'Preparar una exposición', icono: 'GraduationCap',
    pasos: [
      { texto: 'Armar el contenido', pasos: [
        { texto: 'Escribir la idea principal en una frase' },
        { texto: 'Elegir 3 puntos para explicarla' },
        { texto: 'Buscar un ejemplo para cada punto' },
      ] },
      { texto: 'Hacer el apoyo', pasos: [
        { texto: 'Hacer las diapositivas con poco texto' },
        { texto: 'Escribir en una tarjeta lo que voy a decir' },
      ] },
      { texto: 'Ensayar', pasos: [
        { texto: 'Ensayar en voz alta con cronómetro' },
        { texto: 'Ensayar una vez frente a alguien' },
      ] },
    ],
  },
  {
    tipo: 'tarea', id: 'tarea-hoja-de-vida', grupo: 'Trabajo', nombre: 'Hacer la hoja de vida', icono: 'Briefcase',
    pasos: [
      { texto: 'Juntar la información', pasos: [
        { texto: 'Anotar mis estudios con fechas' },
        { texto: 'Anotar mis trabajos, con fechas y lo que hice en cada uno' },
        { texto: 'Buscar diplomas y certificados' },
      ] },
      { texto: 'Escribirla', pasos: [
        { texto: 'Elegir una plantilla sencilla de una página' },
        { texto: 'Escribir mis datos y un perfil de 3 renglones' },
        { texto: 'Pasar los estudios y la experiencia' },
      ] },
      { texto: 'Dejarla lista', pasos: [
        { texto: 'Pedirle a alguien que la lea' },
        { texto: 'Guardarla en PDF con mi nombre' },
      ] },
    ],
  },
  {
    tipo: 'tarea', id: 'tarea-entrevista', grupo: 'Trabajo', nombre: 'Prepararme para una entrevista', icono: 'Briefcase',
    pasos: [
      { texto: 'Conocer el lugar', pasos: [
        { texto: 'Leer sobre la empresa y el cargo' },
        { texto: 'Anotar 3 razones por las que quiero ese trabajo' },
      ] },
      { texto: 'Practicar', pasos: [
        { texto: 'Preparar cómo me presento en un minuto' },
        { texto: 'Practicar 5 preguntas comunes en voz alta' },
        { texto: 'Preparar 2 preguntas para hacerles' },
      ] },
      { texto: 'El día antes', pasos: [
        { texto: 'Dejar lista la ropa y los papeles' },
        { texto: 'Revisar la dirección o el enlace, y la hora' },
      ] },
    ],
  },
  {
    tipo: 'tarea', id: 'tarea-linkedin', grupo: 'Trabajo', nombre: 'Armar mi perfil de LinkedIn', icono: 'Briefcase',
    pasos: [
      { texto: 'Lo básico', pasos: [
        { texto: 'Poner una foto clara' },
        { texto: 'Escribir el titular con lo que hago' },
      ] },
      { texto: 'La experiencia', pasos: [
        { texto: 'Escribir el "Acerca de" en 3 o 4 renglones' },
        { texto: 'Agregar mis trabajos y estudios' },
      ] },
      { texto: 'Darle vida', pasos: [
        { texto: 'Agregar mis habilidades' },
        { texto: 'Conectar con 10 personas que conozco' },
      ] },
    ],
  },
  {
    tipo: 'tarea', id: 'tarea-finanzas-mes', grupo: 'Plata', nombre: 'Hacer las finanzas del mes', icono: 'Target',
    pasos: [
      { texto: 'Lo que entra', pasos: [
        { texto: 'Sumar todo lo que me entra este mes' },
      ] },
      { texto: 'Lo que sale', pasos: [
        { texto: 'Anotar los gastos fijos (arriendo, servicios, deudas)' },
        { texto: 'Calcular cuánto gasto en comida y transporte' },
        { texto: 'Anotar los gastos que vienen este mes' },
      ] },
      { texto: 'Cuadrar', pasos: [
        { texto: 'Restar los gastos de lo que entra' },
        { texto: 'Decidir cuánto puedo guardar' },
        { texto: 'Poner las fechas de pago en mis compromisos' },
      ] },
    ],
  },
  {
    tipo: 'tarea', id: 'tarea-plan-deuda', grupo: 'Plata', nombre: 'Armar el plan para salir de una deuda', icono: 'Target',
    pasos: [
      { texto: 'Ver el tamaño', pasos: [
        { texto: 'Anotar cada deuda, con cuánto debo y a quién' },
        { texto: 'Anotar la cuota y el interés de cada una' },
        { texto: 'Sumar cuánto pago en cuotas al mes' },
      ] },
      { texto: 'Decidir', pasos: [
        { texto: 'Elegir cuál pago primero' },
        { texto: 'Decidir cuánto extra le puedo poner cada mes' },
      ] },
      { texto: 'Ponerlo a andar', pasos: [
        { texto: 'Preguntar si me pueden bajar la cuota o el interés' },
        { texto: 'Poner las fechas de pago en mis compromisos' },
      ] },
    ],
  },
  {
    tipo: 'tarea', id: 'tarea-empezar-ahorrar', grupo: 'Plata', nombre: 'Empezar a ahorrar', icono: 'Target',
    pasos: [
      { texto: 'Decidir', pasos: [
        { texto: 'Elegir para qué voy a ahorrar' },
        { texto: 'Decidir un monto pequeño que sí pueda cumplir' },
      ] },
      { texto: 'Preparar', pasos: [
        { texto: 'Elegir dónde lo voy a guardar (un bolsillo, otra cuenta, una alcancía)' },
        { texto: 'Poner la fecha en que voy a guardar cada mes' },
      ] },
      { texto: 'Empezar', pasos: [
        { texto: 'Hacer el primer ahorro hoy' },
        { texto: 'Anotar cuánto llevo' },
      ] },
    ],
  },
  {
    tipo: 'tarea', id: 'tarea-cita-medica', grupo: 'Salud', nombre: 'Pedir la cita médica que vengo aplazando', icono: 'ListChecks',
    pasos: [
      { texto: 'Antes de llamar', pasos: [
        { texto: 'Buscar el número o la app de mi EPS o del consultorio' },
        { texto: 'Tener a la mano mi cédula' },
      ] },
      { texto: 'Pedirla', pasos: [
        { texto: 'Llamar o entrar a la app y pedir la cita' },
        { texto: 'Anotar la cita en mis compromisos' },
      ] },
      { texto: 'Para ese día', pasos: [
        { texto: 'Escribir lo que le quiero preguntar al médico' },
      ] },
    ],
  },
  {
    tipo: 'tarea', id: 'tarea-examen-pendiente', grupo: 'Salud', nombre: 'Hacerme el examen pendiente', icono: 'ListChecks',
    pasos: [
      { texto: 'Saber qué necesito', pasos: [
        { texto: 'Buscar la orden del examen' },
        { texto: 'Mirar si la orden sigue vigente' },
        { texto: 'Preguntar si necesita preparación, como ayuno' },
      ] },
      { texto: 'Hacerlo', pasos: [
        { texto: 'Pedir la cita o averiguar el horario' },
        { texto: 'Anotar la cita en mis compromisos' },
      ] },
      { texto: 'Después', pasos: [
        { texto: 'Reclamar el resultado y guardarlo' },
      ] },
    ],
  },
  {
    tipo: 'tarea', id: 'tarea-cita-odontologia', grupo: 'Salud', nombre: 'Pedir la cita de odontología', icono: 'ListChecks',
    pasos: [
      { texto: 'Pedirla', pasos: [
        { texto: 'Buscar el número o la app de mi EPS u odontólogo' },
        { texto: 'Pedir la cita' },
        { texto: 'Anotarla en mis compromisos' },
      ] },
      { texto: 'Para ese día', pasos: [
        { texto: 'Anotar qué me molesta o qué quiero revisar' },
        { texto: 'Llevar la cédula' },
      ] },
    ],
  },
];

export const PLANES_BIBLIOTECA: PlanBiblioteca[] = [
  {
    tipo: 'plan', id: 'plan-ordenar-tu-plata', nombre: 'Ordenar tu plata', icono: 'Wallet', iconoTarea: 'Target',
    descripcion: 'Un mes para mirar tu plata de frente: cuánto entra, cuánto sale y a dónde se va.',
    habitos: [
      { clave: 'anotar-gasto', nombre: 'Anotar lo que gasté hoy', icono: 'PenLine', momento: 'noche', anclaje: 'cenar', minimo: 'anotar solo el gasto más grande' },
      { clave: 'revisar-cuentas', nombre: 'Revisar mis cuentas', icono: 'Wallet', momento: 'manana', anclaje: 'desayunar', minimo: 'mirar solo el saldo', frecuencia: 'personalizado', diasPersonalizados: [0] },
    ],
    semanas: [
      { titulo: 'Saber dónde estoy', porque: 'Antes de cambiar algo hay que ver el cuadro completo. Esta semana solo se mira, no se recorta nada.',
        pasos: ['Sumar lo que gano al mes', 'Hacer la lista de todas mis deudas, con cuánto debo en cada una', 'Anotar mis gastos fijos del mes'] },
      { titulo: 'Encontrar las fugas', porque: 'Ya sabes cuánto entra. Ahora toca ver por dónde se sale sin que te des cuenta.',
        pasos: ['Revisar los gastos que anoté en la semana 1', 'Marcar 3 gastos que puedo bajar'] },
      { titulo: 'Armar el plan', porque: 'Con el cuadro claro, decides tú a dónde va cada peso.',
        pasos: ['Decidir cuánto va a cada cosa', 'Escoger qué deuda pago primero', 'Escribir el plan en una sola hoja'] },
      { titulo: 'Dejarlo andando', porque: 'Lo que funciona solo no depende de las ganas.',
        pasos: ['Programar los pagos fijos', 'Separar un monto pequeño para ahorrar', 'Poner la fecha de la próxima revisión'] },
    ],
  },
  {
    tipo: 'plan', id: 'plan-volver-a-estudiar', nombre: 'Volver a estudiar', icono: 'GraduationCap', iconoTarea: 'GraduationCap',
    descripcion: 'Un mes para retomar el estudio de a poco: un rato fijo cada día y un tema a la vez.',
    habitos: [
      { clave: 'sentarme-a-estudiar', nombre: 'Sentarme a estudiar 25 minutos', icono: 'GraduationCap', momento: 'noche', anclaje: 'cenar', minimo: 'abrir el material y leer 5 minutos' },
      { clave: 'planear-semana', nombre: 'Planear el estudio de la semana', icono: 'Target', momento: 'tarde', anclaje: 'almorzar', minimo: 'escoger el tema de la semana', frecuencia: 'personalizado', diasPersonalizados: [0] },
    ],
    semanas: [
      { titulo: 'Armar el lugar y el plan', porque: 'Volver cuesta menos cuando ya está decidido qué, dónde y a qué hora.',
        pasos: ['Escribir qué quiero estudiar y para qué', 'Conseguir el material (libro, curso, guías)', 'Escoger un lugar fijo y dejarlo listo'] },
      { titulo: 'Empezar por lo fácil', porque: 'La primera semana de estudio es para agarrar el ritmo, no para rendir.',
        pasos: ['Dividir el material en temas', 'Estudiar el primer tema', 'Hacer un resumen corto de lo que entendí'] },
      { titulo: 'Agarrar ritmo', porque: 'Ya hay costumbre. Ahora se avanza un tema por vez.',
        pasos: ['Estudiar el segundo tema', 'Hacer ejercicios o preguntas del tema', 'Anotar lo que no entendí y buscarlo'] },
      { titulo: 'Medir y seguir', porque: 'Mirar lo que avanzaste te dice qué sigue.',
        pasos: ['Repasar los resúmenes del mes', 'Probarme con preguntas o un examen de práctica', 'Decidir qué temas siguen el próximo mes'] },
    ],
  },
  {
    tipo: 'plan', id: 'plan-casa-en-orden', nombre: 'Poner la casa en orden', icono: 'Home', iconoTarea: 'Home',
    descripcion: 'Un mes para ordenar la casa por zonas, una a la vez, sin dedicarle un día entero.',
    habitos: [
      { clave: 'recoger', nombre: 'Recoger 10 minutos', icono: 'Home', momento: 'noche', anclaje: 'cenar', minimo: 'guardar 5 cosas' },
    ],
    semanas: [
      { titulo: 'La entrada y la sala', porque: 'Se empieza por lo que ves al llegar: el cambio se nota desde el primer día.',
        pasos: ['Sacar lo que no es de ahí', 'Ordenar la mesa y los muebles', 'Darles un lugar a las llaves, los bolsos y los zapatos'] },
      { titulo: 'La cocina', porque: 'Es donde más cosas se acumulan sin que uno las use.',
        pasos: ['Sacar lo vencido de la nevera y la alacena', 'Ordenar un cajón o un gabinete', 'Dejar despejado el mesón', 'Sacar los trastes que ya no uso'] },
      { titulo: 'El cuarto y el clóset', porque: 'Con el resto de la casa andando, el cuarto se ordena más fácil.',
        pasos: ['Sacar la ropa que ya no uso', 'Ordenar la mesa de noche y debajo de la cama', 'Doblar y guardar por tipo de ropa', 'Llevar a donar lo que sale'] },
      { titulo: 'El baño y lo que quedó', porque: 'La última semana es para cerrar y dejarlo fácil de mantener.',
        pasos: ['Sacar los productos vencidos o vacíos del baño', 'Ordenar los papeles sueltos de la casa', 'Escoger un día fijo para el aseo de la semana'] },
    ],
  },
  {
    tipo: 'plan', id: 'plan-moverte-mas', nombre: 'Moverte más', icono: 'Footprints', iconoTarea: 'Target',
    descripcion: 'Un mes para meter movimiento en tu día, empezando por muy poco.',
    habitos: [
      { clave: 'estirarme', nombre: 'Estirarme 5 minutos', icono: 'Zap', momento: 'manana', anclaje: 'despertarme', minimo: 'estirar los brazos una vez' },
      { clave: 'caminar', nombre: 'Caminar 10 minutos', icono: 'Footprints', momento: 'tarde', anclaje: 'almorzar', minimo: 'caminar 2 minutos' },
      { clave: 'salir', nombre: 'Salir a moverme', icono: 'Dumbbell', momento: 'manana', anclaje: 'desayunar', minimo: 'caminar una cuadra', frecuencia: 'personalizado', diasPersonalizados: [6] },
    ],
    semanas: [
      { titulo: 'Empezar con lo que hay', porque: 'No hace falta gimnasio ni ropa nueva para arrancar.',
        pasos: ['Escoger algo que me guste o no me moleste (caminar, bailar, bici)', 'Dejar a la mano los tenis y la ropa'] },
      { titulo: 'Ponerle hora', porque: 'Lo que tiene hora fija no depende de las ganas.',
        pasos: ['Escoger los días y la hora de la semana', 'Anotarlos en mis compromisos'] },
      { titulo: 'Subir un poquito', porque: 'Se sube de a poco para que no dé pereza volver.',
        pasos: ['Sumarle 5 minutos a la caminata', 'Probar una actividad distinta una vez'] },
      { titulo: 'Dejarlo andando', porque: 'Lo que se hace acompañado se sostiene más.',
        pasos: ['Invitar a alguien a moverse conmigo una vez', 'Decidir qué sigo haciendo el próximo mes'] },
    ],
  },
  {
    tipo: 'plan', id: 'plan-dormir-mejor', nombre: 'Dormir mejor', icono: 'Moon', iconoTarea: 'ListChecks',
    descripcion: 'Un mes para armar tu rutina de noche: una hora fija y menos pantalla antes de acostarte.',
    habitos: [
      { clave: 'apagar-pantallas', nombre: 'Apagar las pantallas', icono: 'Smartphone', momento: 'noche', anclaje: 'lavarme los dientes', minimo: 'dejar el celular boca abajo' },
      { clave: 'acostarme', nombre: 'Acostarme a mi hora', icono: 'Bed', momento: 'noche', anclaje: 'apagar las pantallas', minimo: 'estar en la cama, aunque no tenga sueño' },
      { clave: 'cortina', nombre: 'Abrir la cortina', icono: 'Sparkles', momento: 'manana', anclaje: 'despertarme', minimo: 'prender la luz' },
    ],
    semanas: [
      { titulo: 'Mirar cómo estoy durmiendo', porque: 'Antes de cambiar algo, mira a qué hora te acuestas de verdad.',
        pasos: ['Anotar 3 noches a qué hora me acuesto y me levanto', 'Escoger la hora a la que quiero acostarme'] },
      { titulo: 'Preparar el cuarto', porque: 'Un cuarto listo hace más fácil acostarse.',
        pasos: ['Dejar el cargador del celular lejos de la cama', 'Tapar o apagar las luces que molestan', 'Escoger dónde dejo lista la ropa de mañana'] },
      { titulo: 'Armar la rutina de noche', porque: 'Hacer lo mismo cada noche hace que acostarse no sea una decisión.',
        pasos: ['Escoger 2 cosas para hacer antes de dormir (leer, bañarme, música suave)', 'Poner una alarma para empezar la rutina'] },
      { titulo: 'Ajustar', porque: 'Con un mes encima, ya sabes qué te sirve.',
        pasos: ['Mirar qué noches me costó más y por qué', 'Decidir qué dejo fijo el próximo mes'] },
    ],
  },
];

export const CATALOGO_BIBLIOTECA: ItemBiblioteca[] = [...PACKS_BIBLIOTECA, ...TAREAS_BIBLIOTECA, ...PLANES_BIBLIOTECA];
