const fs = require('fs');

let content = fs.readFileSync('src/store/HabitContext.tsx', 'utf8');

// 1. Add InsigniaDef and calcularInsignias to imports
content = content.replace(
  "import { evaluarRetoSemanal, generarOpcionesReto, getLunesActual } from '../utils/retoSemanal';",
  "import { evaluarRetoSemanal, generarOpcionesReto, getLunesActual } from '../utils/retoSemanal';\nimport { InsigniaDef, calcularInsignias } from '../utils/badgeUtils';"
);

// 2. Add properties to HabitContextType
content = content.replace(
  "  retoSemanal: RetoSemanal | null;",
  "  retoSemanal: RetoSemanal | null;\n  insigniasGanadas: Record<string, string>;\n  insignias: InsigniaDef[]"
);

// 3. Update agregarPremio signature in type
content = content.replace(
  "agregarPremio: (motivo: string, puntos: number, clave?: string, extras?: { comodines?: number; cajas?: number }) => void;",
  "agregarPremio: (motivo: string, puntos: number, clave?: string, extras?: { comodines?: number; cajas?: number; tipo?: 'reto_semanal' | 'reto_habito' | 'insignia' | 'caja'; meta?: number }) => void;"
);

// 4. Update importarDatos signature in type
content = content.replace(
  "    cajasPorAbrir?: number;\n    retoSemanal?: RetoSemanal | null;",
  "    cajasPorAbrir?: number;\n    retoSemanal?: RetoSemanal | null;\n    insigniasGanadas?: Record<string, string>;"
);

// 5. Add insigniasGanadas state inside provider
content = content.replace(
  "  const [retoSemanal, setRetoSemanalState] = useState<RetoSemanal | null>(() => {",
  `  const [insigniasGanadas, setInsigniasGanadas] = useState<Record<string, string>>(() => {
    try {
      const stored = localStorage.getItem('racha_insignias');
      if (stored) return JSON.parse(stored);
    } catch {}
    return {};
  });

  const [retoSemanal, setRetoSemanalState] = useState<RetoSemanal | null>(() => {`
);

// 6. Update exportarDatos to include insigniasGanadas
content = content.replace(
  "        retoSemanal,",
  "        retoSemanal,\n        insigniasGanadas,"
);

// 7. Update importarDatos in Provider
content = content.replace(
  "    cajasPorAbrir?: number;\n    retoSemanal?: RetoSemanal | null;\n    nombre?: string;",
  "    cajasPorAbrir?: number;\n    retoSemanal?: RetoSemanal | null;\n    insigniasGanadas?: Record<string, string>;\n    nombre?: string;"
);
content = content.replace(
  "      if (typeof datos.cajasPorAbrir === 'number') setCajasPorAbrir(datos.cajasPorAbrir);\n      if (datos.retoSemanal !== undefined) setRetoSemanalState(datos.retoSemanal);",
  "      if (typeof datos.cajasPorAbrir === 'number') setCajasPorAbrir(datos.cajasPorAbrir);\n      if (datos.retoSemanal !== undefined) setRetoSemanalState(datos.retoSemanal);\n      if (datos.insigniasGanadas) setInsigniasGanadas(datos.insigniasGanadas);"
);

// 8. Update reiniciarTodo
content = content.replace(
  "    localStorage.removeItem(STORAGE_RETO_SEMANAL_KEY);",
  "    localStorage.removeItem(STORAGE_RETO_SEMANAL_KEY);\n    localStorage.removeItem('racha_insignias');"
);

// 9. Update agregarPremio implementation
content = content.replace(
  "  const agregarPremio = (motivo: string, puntos: number, clave?: string, extras?: { comodines?: number; cajas?: number }) => {\n    if (clave) {\n      if (premiosEntregados.current.has(clave)) return;\n      premiosEntregados.current.add(clave);\n    }\n    setPremios(prev => [...prev, { fecha: getTodayString(), motivo, puntos, clave }]);",
  "  const agregarPremio = (motivo: string, puntos: number, clave?: string, extras?: { comodines?: number; cajas?: number; tipo?: 'reto_semanal' | 'reto_habito' | 'insignia' | 'caja'; meta?: number }) => {\n    if (clave) {\n      if (premiosEntregados.current.has(clave)) return;\n      premiosEntregados.current.add(clave);\n    }\n    setPremios(prev => [...prev, { fecha: getTodayString(), motivo, puntos, clave, tipo: extras?.tipo, meta: extras?.meta }]);"
);

// 10. Compute insignias with useMemo and add side-effect inside Provider
content = content.replace(
  "  const reordenarSecciones = (nuevoOrden: MomentoDia[]) => setOrdenMomentos(nuevoOrden);",
  `  // Computed: Insignias
  const insignias = useMemo(() => {
    return calcularInsignias(habitos, registros, premios, diasCongelados, insigniasGanadas);
  }, [habitos, registros, premios, diasCongelados, insigniasGanadas]);

  useEffect(() => {
    try { localStorage.setItem('racha_insignias', JSON.stringify(insigniasGanadas)); } catch {}
  }, [insigniasGanadas]);

  useEffect(() => {
    let hasNew = false;
    const newGanadas = { ...insigniasGanadas };
    const today = getTodayString();
    
    insignias.forEach(ins => {
      if (ins.desbloqueada && !insigniasGanadas[ins.id]) {
        hasNew = true;
        newGanadas[ins.id] = today;
        agregarPremio(\`Insignia \${ins.nombre}\`, 0, \`insignia:\${ins.id}\`, { cajas: 1, tipo: 'insignia' });
      }
    });

    if (hasNew) {
      setInsigniasGanadas(newGanadas);
    }
  }, [insignias, insigniasGanadas]);

  const reordenarSecciones = (nuevoOrden: MomentoDia[]) => setOrdenMomentos(nuevoOrden);`
);

// 11. Add insignias and insigniasGanadas to context value
content = content.replace(
  "        retoSemanal,\n        puntosTotales,",
  "        retoSemanal,\n        insigniasGanadas,\n        insignias,\n        puntosTotales,"
);

fs.writeFileSync('src/store/HabitContext.tsx', content, 'utf8');
console.log('HabitContext updated successfully.');
