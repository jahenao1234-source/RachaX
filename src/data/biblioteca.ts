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
];

export const CATALOGO_BIBLIOTECA: ItemBiblioteca[] = [...PACKS_BIBLIOTECA, ...TAREAS_BIBLIOTECA, ...PLANES_BIBLIOTECA];
