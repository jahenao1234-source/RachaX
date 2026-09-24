const fs = require('fs');

const p = 'src/components/screens/ProfileScreen.tsx';
let txt = fs.readFileSync(p, 'utf8');

// Remove renderBadgeIcon implementation and imports
txt = txt.replace(/const renderBadgeIcon = [\s\S]*?default: return <Award size=\{size\} \/>;\s*\}\s*};\s*/, '');
txt = txt.replace(/renderBadgeIcon\(badge\.icono\)/g, '<BadgeIcon iconName={badge.icono} size={20} />');
txt = txt.replace(/renderBadgeIcon\(nextBadge\.icono\)/g, '<BadgeIcon iconName={nextBadge.icono} size={20} />');
txt = txt.replace(/renderBadgeIcon\(iconName\)/g, '<BadgeIcon iconName={iconName} size={20} />');

// Insert BadgeIcon import
txt = txt.replace("import { InsigniaDef }", "import { BadgeIcon } from '../badges/BadgeIcon';\nimport { InsigniaDef }");

// Fix Sparkles for Flame 12px
txt = txt.replace(/<Sparkles size=\{14\} strokeWidth=\{2\.4\} \/>/g, '<Flame size={12} strokeWidth={2.4} />');

// Fix recent badges list logic
const findStr = "const totalDesbloqueadas = insignias.filter((b) => b.desbloqueada).length;";
const newLogic = `const totalDesbloqueadas = insignias.filter((b) => b.desbloqueada).length;
  
  const ganadas = [...insignias].filter(b => b.desbloqueada).sort((a, b) => {
    const timeA = a.fechaDesbloqueo ? new Date(a.fechaDesbloqueo).getTime() : 0;
    const timeB = b.fechaDesbloqueo ? new Date(b.fechaDesbloqueo).getTime() : 0;
    if (timeA !== timeB) return timeB - timeA;
    return b.meta - a.meta;
  });

  const recentUniqueBadges = [];
  for (const b of ganadas) {
    if (!recentUniqueBadges.some(r => r.familia === b.familia)) {
      recentUniqueBadges.push(b);
    }
    if (recentUniqueBadges.length >= 3) break;
  }
  const top3Badges = recentUniqueBadges;`;
txt = txt.replace(findStr, newLogic);
txt = txt.replace(/insignias\.slice\(0, 3\)/g, 'top3Badges');

fs.writeFileSync(p, txt, 'utf8');

const modalP = 'src/components/badges/BadgeDetailModal.tsx';
let modalTxt = fs.readFileSync(modalP, 'utf8');
modalTxt = modalTxt.replace(/import \{ X \} from 'lucide-react';/, "import { X, Flame } from 'lucide-react';\nimport { BadgeIcon } from './BadgeIcon';");
modalTxt = modalTxt.replace(/\{renderBadgeIcon\(\)\}/g, '<BadgeIcon iconName={badge.icono} size={48} strokeWidth={1.5} />');
modalTxt = modalTxt.replace(/const renderBadgeIcon = [\s\S]*?return null;\s*\};\s*/, '');
modalTxt = modalTxt.replace(/<Sparkles size=\{16\} \/>/g, '<Flame size={12} strokeWidth={2.4} />');
fs.writeFileSync(modalP, modalTxt, 'utf8');

const t = 'src/components/screens/TodayScreen.tsx';
let txt2 = fs.readFileSync(t, 'utf8');
txt2 = txt2.replace("import { InsigniaDef", "import { BadgeIcon } from '../badges/BadgeIcon';\nimport { InsigniaDef");
txt2 = txt2.replace(/<Trophy size=\{22\} className="text-ambar-text" strokeWidth=\{2\} \/>/g, '<BadgeIcon iconName={proximaInsignia.icono} size={22} className="text-ambar-text" strokeWidth={2} />');
fs.writeFileSync(t, txt2, 'utf8');

console.log('Fixed imports and rendering');
