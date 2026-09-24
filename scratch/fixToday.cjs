const fs = require('fs');
const p = 'src/components/screens/TodayScreen.tsx';
let txt = fs.readFileSync(p, 'utf8');
txt = txt.replace(/diasCongelados,\s*premios,/, 'diasCongelados,\n      premios,\n      insignias,');
fs.writeFileSync(p, txt, 'utf8');
