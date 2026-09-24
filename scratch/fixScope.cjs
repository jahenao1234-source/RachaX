const fs = require('fs');

const p = 'src/components/screens/ProfileScreen.tsx';
let txt = fs.readFileSync(p, 'utf8');
txt = txt.replace(/diasCongelados\s*}\s*=\s*useHabitStore\(\);/, 'diasCongelados,\n      insignias\n    } = useHabitStore();');
fs.writeFileSync(p, txt, 'utf8');

const t = 'src/components/screens/TodayScreen.tsx';
let txt2 = fs.readFileSync(t, 'utf8');
txt2 = txt2.replace(/diasCongelados,\s*toggleCompletado,/, 'diasCongelados,\n    insignias,\n    toggleCompletado,');
fs.writeFileSync(t, txt2, 'utf8');
