const fs = require('fs');

function replaceInFile(filepath, replaces) {
  let content = fs.readFileSync(filepath, 'utf8');
  replaces.forEach(r => {
    content = content.replace(r.from, r.to);
  });
  fs.writeFileSync(filepath, content, 'utf8');
}

// 1. badgeUtils.ts
replaceInFile('src/utils/badgeUtils.ts', [
  {
    from: "const serie = fuerzaSerieHabito(h.id, registros, h.creadoEn, diasCongelados, todayStr);",
    to: "const serie = fuerzaSerieHabito(h, registros, diasCongelados, todayStr);"
  },
  {
    from: "const p = Math.round(v.fuerza * 100);",
    to: "const p = Math.round(v.valor * 100);"
  },
  {
    from: "if (tasa >= 0.8) meses80++;",
    to: "if (tasa.pct >= 80) meses80++;"
  }
]);

// 2. ProfileScreen.tsx
replaceInFile('src/components/screens/ProfileScreen.tsx', [
  {
    from: "Object.entries(groupedBadges).map(([familia, familyBadges]) => {",
    to: "Object.entries(groupedBadges).map(([familia, familyBadges]: [string, any]) => {"
  },
  {
    from: "const groupedBadges = insignias.reduce((acc, b) => {",
    to: "const groupedBadges = insignias.reduce((acc: Record<string, InsigniaDef[]>, b) => {"
  },
  {
    from: "  const maxTiers = Object.values(groupedBadges).reduce((max, arr) => Math.max(max, arr.length), 0);",
    to: "  const maxTiers = Object.values(groupedBadges).reduce((max, arr: any) => Math.max(max, arr.length), 0);"
  }
]);

console.log('Fixes applied.');
