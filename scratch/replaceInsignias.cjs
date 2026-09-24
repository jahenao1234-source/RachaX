const fs = require('fs');

function replaceInFile(filepath, replaces) {
  let content = fs.readFileSync(filepath, 'utf8');
  replaces.forEach(r => {
    content = content.replace(r.from, r.to);
  });
  fs.writeFileSync(filepath, content, 'utf8');
}

// TodayScreen.tsx
replaceInFile('src/components/screens/TodayScreen.tsx', [
  {
    from: "import { calcularInsignias } from '../../utils/badgeUtils';",
    to: ""
  },
  {
    from: "      diasCongelados,",
    to: "      diasCongelados,\n      insignias,"
  },
  {
    from: "  const badgeCalculations = calcularInsignias(habitosActivos, registros, premios, diasCongelados);\n  const proximasInsignias = badgeCalculations.filter(b => !b.desbloqueada);",
    to: "  const proximasInsignias = insignias.filter(b => !b.desbloqueada);"
  }
]);

// HabitDetailScreen.tsx
replaceInFile('src/components/screens/HabitDetailScreen.tsx', [
  {
    from: "import { calcularInsignias } from '../../utils/badgeUtils';",
    to: ""
  },
  {
    from: "    premios\n  } = useHabitStore();",
    to: "    premios,\n    insignias\n  } = useHabitStore();"
  },
  {
    from: "    premios,\n  } = useHabitStore();",
    to: "    premios,\n    insignias\n  } = useHabitStore();"
  },
  {
    from: "  const badgeCalculations = calcularInsignias([habito], registros, premios, diasCongelados);\n  const proximasInsignias = badgeCalculations.filter(b => !b.desbloqueada);",
    to: "  const proximasInsignias = insignias.filter(b => !b.desbloqueada && (b.familia === 'Fuerza' || b.familia === 'Retos de un hábito'));"
  },
  {
    from: "  const badgeCalculations = calcularInsignias(habitosActivos, registros, premios, diasCongelados);\n  const proximasInsignias = badgeCalculations.filter(b => !b.desbloqueada);",
    to: "  const proximasInsignias = insignias.filter(b => !b.desbloqueada && (b.familia === 'Fuerza' || b.familia === 'Retos de un hábito'));"
  }
]);

// ProfileScreen.tsx
replaceInFile('src/components/screens/ProfileScreen.tsx', [
  {
    from: "import { calcularInsignias, InsigniaDef } from '../../utils/badgeUtils';",
    to: "import { InsigniaDef } from '../../utils/badgeUtils';"
  },
  {
    from: "    etapaLlama\n  } = useHabitStore();",
    to: "    etapaLlama,\n    insignias\n  } = useHabitStore();"
  },
  {
    from: "  const insignias = calcularInsignias(habitos, registros, premios, diasCongelados);",
    to: ""
  }
]);

// BadgeUnlockToast.tsx
replaceInFile('src/components/badges/BadgeUnlockToast.tsx', [
  {
    from: "import { calcularInsignias, InsigniaDef } from '../../utils/badgeUtils';",
    to: "import { InsigniaDef } from '../../utils/badgeUtils';"
  },
  {
    from: "  const { habitos, registros, premios, diasCongelados } = useHabitStore();",
    to: "  const { insignias, insigniasGanadas } = useHabitStore();"
  },
  {
    from: "        const badgesInit = calcularInsignias(habitos, registros, premios, diasCongelados);\n        localStorage.setItem(STORAGE_UNLOCKED_BADGES_KEY, JSON.stringify(badgesInit.filter((b) => b.desbloqueada).map((b) => b.id)));",
    to: ""
  },
  {
    from: "      const currentBadges = calcularInsignias(habitos, registros, premios, diasCongelados);\n      const unlockedIds = currentBadges.filter((b) => b.desbloqueada).map((b) => b.id);",
    to: "      const unlockedIds = insignias.filter((b) => b.desbloqueada).map((b) => b.id);"
  }
]);

console.log('Replacements completed.');
