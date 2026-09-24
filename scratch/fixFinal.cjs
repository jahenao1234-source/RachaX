const fs = require('fs');

function replaceInFile(filepath, replaces) {
  let content = fs.readFileSync(filepath, 'utf8');
  replaces.forEach(r => {
    content = content.replace(r.from, r.to);
  });
  fs.writeFileSync(filepath, content, 'utf8');
}

// HabitContext.tsx
replaceInFile('src/store/HabitContext.tsx', [
  {
    from: "const agregarPremio = (motivo: string, puntos: number, clave?: string, extras?: { comodines?: number; cajas?: \nnumber }) => {",
    to: "const agregarPremio = (motivo: string, puntos: number, clave?: string, extras?: { comodines?: number; cajas?: number; tipo?: 'reto_semanal' | 'reto_habito' | 'insignia' | 'caja'; meta?: number }) => {"
  },
  {
    from: "const agregarPremio = (motivo: string, puntos: number, clave?: string, extras?: { comodines?: number; cajas?: number }) => {",
    to: "const agregarPremio = (motivo: string, puntos: number, clave?: string, extras?: { comodines?: number; cajas?: number; tipo?: 'reto_semanal' | 'reto_habito' | 'insignia' | 'caja'; meta?: number }) => {"
  },
  {
    from: "setPremios(prev => [...prev, { fecha: getTodayString(), motivo, puntos, clave }]);",
    to: "setPremios(prev => [...prev, { fecha: getTodayString(), motivo, puntos, clave, tipo: extras?.tipo, meta: extras?.meta }]);"
  }
]);

// ProfileScreen.tsx
replaceInFile('src/components/screens/ProfileScreen.tsx', [
  {
    from: "      etapaLlama,\n      premios,\n      diasCongelados\n    } = useHabitStore();",
    to: "      etapaLlama,\n      premios,\n      diasCongelados,\n      insignias\n    } = useHabitStore();"
  }
]);

// TodayScreen.tsx
replaceInFile('src/components/screens/TodayScreen.tsx', [
  {
    from: "      diasCongelados,\n      toggleCompletado,",
    to: "      diasCongelados,\n      insignias,\n      toggleCompletado,"
  }
]);

console.log('Final fixes applied.');
