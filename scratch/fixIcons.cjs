const fs = require('fs');
let content = fs.readFileSync('src/utils/badgeUtils.ts', 'utf8');

// Constancia: Sparkles -> CircleCheck
content = content.replace(/'10 veces cumplidas', 'Sparkles'\)/g, "'10 veces cumplidas', 'CircleCheck')");
content = content.replace(/'50 veces cumplidas', 'Sparkles'\)/g, "'50 veces cumplidas', 'CircleCheck')");
content = content.replace(/'100 veces cumplidas', 'Sparkles'\)/g, "'100 veces cumplidas', 'CircleCheck')");
content = content.replace(/'250 veces cumplidas', 'Sparkles'\)/g, "'250 veces cumplidas', 'CircleCheck')");
content = content.replace(/'500 veces cumplidas', 'Sparkles'\)/g, "'500 veces cumplidas', 'CircleCheck')");
content = content.replace(/'1000 veces cumplidas', 'Sparkles', 'Dorada'\)/g, "'1000 veces cumplidas', 'CircleCheck', 'Dorada')");

// Días completos: Flame -> Calendar
// Also remove 'Hielo' from dc_100
content = content.replace(/'7 días completos', 'Flame'\)/g, "'7 días completos', 'Calendar')");
content = content.replace(/'30 días completos', 'Flame'\)/g, "'30 días completos', 'Calendar')");
content = content.replace(/'66 días completos', 'Flame'\)/g, "'66 días completos', 'Calendar')");
content = content.replace(/'100 días completos', 'Flame', 'Hielo'\)/g, "'100 días completos', 'Calendar')");

// Volviste: Zap -> Undo2
content = content.replace(/'1 regreso', 'Zap'\)/g, "'1 regreso', 'Undo2')");
content = content.replace(/'3 regresos', 'Zap'\)/g, "'3 regresos', 'Undo2')");
content = content.replace(/'10 regresos', 'Zap', 'Fénix'\)/g, "'10 regresos', 'Undo2', 'Fénix')");

// Retos semanales: Award -> Medal
content = content.replace(/'1 reto semanal', 'Award'\)/g, "'1 reto semanal', 'Medal')");
content = content.replace(/'4 retos semanales', 'Award'\)/g, "'4 retos semanales', 'Medal')");
content = content.replace(/'12 retos semanales', 'Award', 'Tormenta'\)/g, "'12 retos semanales', 'Medal', 'Tormenta')");

// Momentos: Sunrise
content = content.replace(/'30 mañanas', 'Sun', 'Alba'\)/g, "'30 mañanas', 'Sunrise', 'Alba')");
content = content.replace(/'30 noches', 'Moon', 'Nocturna'\)/g, "'30 noches', 'Sunrise', 'Nocturna')");

// Fuerza: Shield -> TrendingUp
content = content.replace(/'50 de fuerza en un hábito', 'Shield'\)/g, "'50 de fuerza en un hábito', 'TrendingUp')");
content = content.replace(/'80 de fuerza en un hábito', 'Shield'\)/g, "'80 de fuerza en un hábito', 'TrendingUp')");
content = content.replace(/'95 de fuerza en un hábito', 'Shield'\)/g, "'95 de fuerza en un hábito', 'TrendingUp')");

// Meses: Crown -> Flame
content = content.replace(/'3 meses en 80%', 'Crown', 'Aurora'\)/g, "'3 meses en 80%', 'Flame', 'Aurora')");
content = content.replace(/'6 meses en 80%', 'Crown'\)/g, "'6 meses en 80%', 'Flame')");
content = content.replace(/'12 meses en 80%', 'Crown'\)/g, "'12 meses en 80%', 'Flame')");

fs.writeFileSync('src/utils/badgeUtils.ts', content, 'utf8');
console.log('badgeUtils updated');
