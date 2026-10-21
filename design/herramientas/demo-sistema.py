import re, io
src = open(r'C:\Users\jahen\RachaX\RachaX\public\zz-demo.html', encoding='utf-8').read()
a = src.index('    var H = [')
b = src.index('];', a) + 2
src = src[:a] + """    var H = [
      { id: 'demo-cama', nombre: 'Tender la cama', icono: 'Bed', momento: 'manana', anclaje: 'bañarme', minimo: 'estirar la cobija', desde: 120, firme: 0.93 },
      { id: 'demo-estudiar', nombre: 'Estudiar 25 minutos', icono: 'GraduationCap', momento: 'tarde', anclaje: 'almorzar', minimo: 'abrir el cuaderno y leer un párrafo', desde: 112, firme: 0.8 },
      { id: 'demo-gasto', nombre: 'Anotar cada gasto', icono: 'PenLine', momento: 'flexible', anclaje: 'pagar algo', minimo: 'anotar solo el más grande', desde: 95, firme: 0.62 },
    ];""" + src[b:]
src = src.replace("comoVaHoy === 'casi' ? ['demo-agua', 'demo-tres', 'demo-entrenar', 'demo-gasto'] : ['demo-agua', 'demo-tres']", "comoVaHoy === 'casi' ? ['demo-cama', 'demo-gasto'] : ['demo-cama']")
a = src.index("      { id: 'demo-t2', nombre: 'Hacer la hoja de vida'")
b = src.index("      { id: 'demo-t3'", a)
src = src[:a] + """      { id: 'demo-t2', nombre: 'Preparar un examen', icono: 'GraduationCap', color: '', completada: false, creadoEn: iso(-6, 20), subtareas: [
        grupo('Saber qué entra', [hecho('Anotar los temas del examen', 3), hecho('Juntar apuntes, guías y talleres', 2), paso('Contar cuántos días faltan', { fecha: f(0), momento: 'manana' })]),
        grupo('Repasar por temas', [paso('Repartir los temas en los días que quedan', { fecha: f(0), momento: 'tarde' }), paso('Estudiar el primer tema 25 minutos', { fecha: f(1), momento: 'tarde' }), paso('Hacer un resumen de una hoja por tema', { fecha: f(2), momento: 'noche' })]),
        grupo('Practicar', [paso('Hacer ejercicios o preguntas de exámenes anteriores', { fecha: f(3), momento: 'tarde' }), paso('Repasar solo lo que fallé', { fecha: f(4), momento: 'tarde' })]),
        grupo('El día antes', [paso('Dejar listo lo que debo llevar', { fecha: f(5), momento: 'noche' })]),
      ] },
""" + src[b:]
src = src.replace("habitoId: 'demo-leer', etiqueta: 'Leer 10 páginas'", "habitoId: 'demo-estudiar', etiqueta: 'Estudiar 25 minutos'")
src = src.replace("habitoId: 'demo-entrenar', etiqueta: 'Entrenar 30 minutos'", "habitoId: 'demo-estudiar', etiqueta: 'Estudiar 25 minutos'")
src = src.replace("etiqueta: 'Hacer la hoja de vida'", "etiqueta: 'Preparar un examen'")
src = src.replace('<title>Racha de muestra</title>', '<title>Racha de muestra (sistema)</title>')
assert 'demo-leer' not in src and 'Entrenar' not in src and 'hoja de vida' not in src, [m for m in ['demo-leer','Entrenar','hoja de vida'] if m in src]
open(r'C:\Users\jahen\RachaX\RachaX\public\zz-demo-sistema.html', 'w', encoding='utf-8').write(src)
print('ok')
