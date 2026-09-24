const fs = require('fs');

function replaceInFile(filepath, replaces) {
  let content = fs.readFileSync(filepath, 'utf8');
  replaces.forEach(r => {
    content = content.replace(r.from, r.to);
  });
  fs.writeFileSync(filepath, content, 'utf8');
}

// 1. ProfileScreen.tsx
replaceInFile('src/components/screens/ProfileScreen.tsx', [
  {
    from: "      diasCongelados",
    to: "      diasCongelados,\n      insignias"
  },
  {
    from: "Array.from(new Set(insignias.map(b => b.familia))).map(familia => {",
    to: "Array.from(new Set(insignias.map(b => b.familia))).map((familia) => {"
  },
  {
    from: "className=\"fam\" aria-labelledby={`fm-${familia.replace(/\\s+/g, '')}`}",
    to: "className=\"fam\" aria-labelledby={`fm-${String(familia).replace(/\\s+/g, '')}`}"
  },
  {
    from: "id={`fm-${familia.replace(/\\s+/g, '')}`}",
    to: "id={`fm-${String(familia).replace(/\\s+/g, '')}`}"
  }
]);

console.log('Fixes applied.');
