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
