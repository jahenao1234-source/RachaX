// Fuente del arte de las llamas (vector v2, aprobado 2026-09-23).
// Referencia para portar a un componente React: etapa(n 1..10, size), hazana(HAZ[i], size), mes(MESES_LL[i], size).
// flame(pal, {s, dx, dy, sides, id}) arma la llama por capas; medal() el medallón. Las raras son PNG de IA (public/llamas/raras/).

// ===== Llamas v2 (vector) =====
const OUTER = 'M50 8C58 24 76 34 78 58C80 78 66 92 50 92C34 92 20 80 22 60C23 48 30 40 36 34C36 44 40 50 45 52C42 38 44 22 50 8Z';
const MID = 'M50 30C56 42 68 50 68 64C68 78 60 86 50 86C40 86 32 78 33 66C34 58 38 53 42 50C43 58 46 62 49 63C47 52 47 42 50 30Z';
const CORE = 'M50 52C54 60 60 65 60 72C60 80 56 84 50 84C44 84 40 80 40 73C40 67 45 62 50 52Z';
const SIDE_L = 'M30 88C18 82 14 70 18 58C20 66 24 70 28 71C25 62 27 54 32 48C33 60 38 68 42 74Z';
const SIDE_R = 'M70 88C82 82 86 70 82 58C80 66 76 70 72 71C75 62 73 54 68 48C67 60 62 68 58 74Z';

let NL = 0;
// pal: [outer0, outer1, mid0, mid1, core0, core1]
function flame(pal, { s = 1, dx = 0, dy = 0, sides = false, id }) {
  const g = (k, a, b) => `<linearGradient id="${id}${k}" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient>`;
  const defs = g('o', pal[0], pal[1]) + g('m', pal[2], pal[3]) + g('c', pal[4], pal[5]);
  const t = `translate(${50 - 50 * s + dx} ${100 - 100 * s + dy - 4}) scale(${s})`;
  return { defs, body: `<g transform="${t}">${sides ? `<path d="${SIDE_L}" fill="url(#${id}o)" opacity=".9"/><path d="${SIDE_R}" fill="url(#${id}o)" opacity=".9"/>` : ''}<path d="${OUTER}" fill="url(#${id}o)"/><path d="${MID}" fill="url(#${id}m)"/><path d="${CORE}" fill="url(#${id}c)"/><ellipse cx="41" cy="58" rx="3" ry="8" fill="#fff" opacity=".28" transform="rotate(18 41 58)"/></g>` };
}

const WARM = ['#E8471C', '#FFB547', '#FF8A1F', '#FFD37F', '#FFE9B0', '#FFFFFF'];
const logL = (x1, y1, x2, y2, id) => `<path d="M${x1} ${y1}L${x2} ${y2}" stroke="url(#${id}w)" stroke-width="7" stroke-linecap="round"/>`;
const woodDef = (id) => `<linearGradient id="${id}w" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#6B3F22"/><stop offset="1" stop-color="#A0673E"/></linearGradient>`;
const spark = (x, y, r, c) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${c}"/>`;
const star4 = (x, y, r, c) => `<path d="M${x} ${y - r}Q${x + r * .18} ${y - r * .18} ${x + r} ${y}Q${x + r * .18} ${y + r * .18} ${x} ${y + r}Q${x - r * .18} ${y + r * .18} ${x - r} ${y}Q${x - r * .18} ${y - r * .18} ${x} ${y - r}Z" fill="${c}"/>`;

function medal(inner, defs, { ring = 0, bg = 'var(--hearth)', bg2 = 'var(--hearth2)' } = {}) {
  const id = 'm' + (++NL);
  const rings = ring >= 1 ? `<circle cx="50" cy="50" r="47" fill="none" stroke="var(--ring)" stroke-width="1.5"/>` : '';
  const dots = ring >= 2 ? Array.from({ length: 12 }, (_, i) => { const a = i * Math.PI / 6; return `<circle cx="${(50 + 47 * Math.sin(a)).toFixed(1)}" cy="${(50 - 47 * Math.cos(a)).toFixed(1)}" r="1.8" fill="var(--ring)"/>`; }).join('') : '';
  return `<defs><radialGradient id="${id}bg" cx=".5" cy=".62" r=".6"><stop offset="0" stop-color="${bg2}"/><stop offset="1" stop-color="${bg}"/></radialGradient>${defs}</defs><clipPath id="${id}cl"><circle cx="50" cy="50" r="46"/></clipPath><circle cx="50" cy="50" r="46" fill="url(#${id}bg)"/><g clip-path="url(#${id}cl)">${inner}</g>${rings}${dots}`;
}
const svgL = (content, size) => `<svg width="${size}" height="${size}" viewBox="0 0 100 100" aria-hidden="true">${content}</svg>`;

// ---------- 10 etapas ----------
function etapa(n, size = 96) {
  const id = 'e' + (++NL);
  let inner = '', defs = '';
  const F = (o) => { const f = flame(WARM, { id, ...o }); defs += f.defs; return f.body; };
  switch (n) {
    case 1: inner = F({ s: .42, dy: -8 }) + spark(34, 40, 2.2, '#FFD37F') + spark(66, 34, 1.8, '#FFB547') + spark(62, 52, 1.4, '#FFE9B0'); break;
    case 2: defs += `<radialGradient id="${id}k" cx=".5" cy=".3" r=".7"><stop offset="0" stop-color="#FF7A2F"/><stop offset="1" stop-color="#5A1E0E"/></radialGradient>`;
      inner = F({ s: .52, dy: -14 }) + `<ellipse cx="38" cy="80" rx="10" ry="6" fill="url(#${id}k)"/><ellipse cx="60" cy="81" rx="12" ry="6.5" fill="url(#${id}k)"/><ellipse cx="49" cy="84" rx="9" ry="5" fill="url(#${id}k)"/>`; break;
    case 3: inner = F({ s: .72 }); break;
    case 4: defs += woodDef(id); inner = F({ s: .62, dy: -12 }) + logL(28, 86, 72, 76, id) + logL(28, 76, 72, 86, id); break;
    case 5: inner = F({ s: .8, sides: true }); break;
    case 6: defs += woodDef(id); inner = F({ s: .74, sides: true, dy: -12 }) + logL(24, 88, 76, 76, id) + logL(24, 76, 76, 88, id) + logL(34, 90, 66, 90, id) + spark(22, 34, 1.8, '#FFD37F') + spark(78, 28, 2, '#FFB547'); break;
    case 7: defs += `<linearGradient id="${id}t" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#5B4636"/><stop offset="1" stop-color="#8C6B52"/></linearGradient><linearGradient id="${id}cup" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#B98B2F"/><stop offset="1" stop-color="#F2C45A"/></linearGradient>`;
      inner = `<path d="M46 64L54 64L52 94L48 94Z" fill="url(#${id}t)"/><path d="M36 58L64 58L58 68L42 68Z" fill="url(#${id}cup)"/>` + F({ s: .56, dy: -40 }); break;
    case 8: defs += `<linearGradient id="${id}v" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#4A3A33"/><stop offset="1" stop-color="#241B18"/></linearGradient>`;
      inner = F({ s: .6, dy: -30, sides: true }) + `<path d="M12 90L38 56L44 60L50 54L56 60L62 56L88 90Z" fill="url(#${id}v)"/><path d="M50 58L47 72L52 78L49 90" stroke="#FF8A1F" stroke-width="2.5" fill="none" stroke-linecap="round"/>`; break;
    case 9: inner = Array.from({ length: 12 }, (_, i) => { const a = i * Math.PI / 6; const r1 = 30, r2 = i % 2 ? 38 : 42; return `<path d="M${(50 + r1 * Math.sin(a)).toFixed(1)} ${(54 - r1 * Math.cos(a)).toFixed(1)}L${(50 + r2 * Math.sin(a)).toFixed(1)} ${(54 - r2 * Math.cos(a)).toFixed(1)}" stroke="#FFB547" stroke-width="3.5" stroke-linecap="round"/>`; }).join('') + `<circle cx="50" cy="54" r="27" fill="#FFB547" opacity=".22"/>` + F({ s: .6, dy: -6 }); break;
    case 10: inner = star4(50, 50, 44, '#FFD37F').replace('fill="#FFD37F"', 'fill="#FFD37F" opacity=".35"') + star4(50, 50, 30, '#FFE9B0').replace('fill="#FFE9B0"', 'fill="#FFE9B0" opacity=".35"') + F({ s: .7, sides: true }) + star4(76, 22, 6, '#FFFFFF') + star4(24, 30, 4, '#FFE9B0'); break;
  }
  return svgL(medal(inner, defs, { ring: n >= 9 ? 2 : n >= 5 ? 1 : 0 }), size);
}
const ETAPAS10 = [['Chispa', 1], ['Brasa', 3], ['Llama', 5], ['Fogata', 8], ['Fuego', 12], ['Hoguera', 16], ['Antorcha', 20], ['Volcán', 25], ['Sol', 30], ['Estrella', 40]];

// ---------- 8 hazañas ----------
const HAZ = [
  ['Raíz', 'Reto de 66 días', ['#1E8A4C', '#5ED38A', '#3FBF6E', '#B8F5A0', '#E9FFD8', '#FFFFFF'], 'raiz'],
  ['Fénix', 'Volver 10 veces', ['#C2261B', '#FF6B3D', '#FF5A2F', '#FFB36B', '#FFE0B8', '#FFFFFF'], 'fenix'],
  ['Hielo', 'Racha de 30', ['#1D5FD1', '#5CC8FF', '#4AA8F5', '#A8E8FF', '#E6FAFF', '#FFFFFF'], 'hielo'],
  ['Dorada', '1000 veces cumplidas', ['#A8740A', '#F2C23A', '#E6A91E', '#FFE27A', '#FFF6CF', '#FFFFFF'], 'dorada'],
  ['Aurora', '3 meses en 80%', ['#0F9E8E', '#7C6CF0', '#2DD4BF', '#F0A6D8', '#E8FFFB', '#FFFFFF'], 'aurora'],
  ['Nocturna', '30 noches', ['#3B35B8', '#8E9BFF', '#6A6CF0', '#C9CFFF', '#EEF0FF', '#FFFFFF'], 'nocturna'],
  ['Alba', '30 mañanas', ['#E0567A', '#FFB08A', '#FF8F8F', '#FFD8BF', '#FFF2E8', '#FFFFFF'], 'alba'],
  ['Tormenta', '12 retos semanales', ['#3A4A6B', '#7FA8FF', '#56709E', '#BFD4FF', '#EAF1FF', '#FFFFFF'], 'tormenta'],
];
function hazana([, , pal, k], size = 96) {
  const id = 'h' + (++NL);
  const f = flame(pal, { id, s: .7, sides: k === 'fenix' || k === 'aurora' });
  let extra = '';
  if (k === 'raiz') extra = `<path d="M50 88C50 92 44 94 38 96M50 88C51 93 56 95 62 96M50 88L50 96" stroke="#8A5A3C" stroke-width="2.5" fill="none" stroke-linecap="round"/>`;
  if (k === 'fenix') extra = `<path d="M40 60C28 58 16 50 12 38C22 42 28 42 34 46C26 40 22 34 22 26C30 34 38 40 44 50Z" fill="#FF6B3D" opacity=".85"/><path d="M60 60C72 58 84 50 88 38C78 42 72 42 66 46C74 40 78 34 78 26C70 34 62 40 56 50Z" fill="#FF6B3D" opacity=".85"/>`;
  if (k === 'hielo') extra = [[24, 30], [76, 26], [80, 60]].map(([x, y]) => `<g stroke="#BFEFFF" stroke-width="1.6" stroke-linecap="round"><path d="M${x - 5} ${y}H${x + 5}M${x} ${y - 5}V${y + 5}M${x - 3.5} ${y - 3.5}L${x + 3.5} ${y + 3.5}M${x + 3.5} ${y - 3.5}L${x - 3.5} ${y + 3.5}"/></g>`).join('');
  if (k === 'dorada') extra = star4(76, 24, 6, '#FFE27A') + star4(24, 34, 4.5, '#FFF6CF') + star4(78, 62, 3.5, '#FFE27A');
  if (k === 'aurora') extra = `<path d="M14 40C30 30 44 36 58 28C70 22 80 26 88 20" stroke="#7C6CF0" stroke-width="2.5" fill="none" opacity=".6" stroke-linecap="round"/><path d="M12 48C28 40 44 46 60 38C72 32 82 36 90 30" stroke="#2DD4BF" stroke-width="2.5" fill="none" opacity=".6" stroke-linecap="round"/>`;
  if (k === 'nocturna') extra = `<path d="M80 22A11 11 0 1 0 86 40A9 9 0 1 1 80 22Z" fill="#C9CFFF"/>` + star4(22, 30, 3.5, '#EEF0FF') + star4(28, 64, 2.5, '#C9CFFF');
  if (k === 'alba') extra = `<path d="M16 86A34 34 0 0 1 84 86" fill="#FFB08A" opacity=".35"/>`;
  if (k === 'tormenta') extra = `<path d="M22 30C22 24 30 22 34 26C36 20 46 20 48 28C54 26 58 32 54 36H24C22 36 20 33 22 30Z" fill="#56709E" opacity=".8"/><path d="M53 58L45 72H51L47 84L59 68H52L57 58Z" fill="#FFE27A"/>`;
  const body = (k === 'alba' || k === 'aurora' || k === 'fenix') ? extra + f.body : f.body + extra;
  return svgL(medal(body, f.defs, { ring: 1 }), size);
}

// ---------- 12 llamas del mes: cada una con el símbolo de su mes ----------
const MESES_LL = [
  ['Enero', 'Año nuevo', ['#B8860B', '#FFE08A', '#F2C23A', '#FFF1B8', '#FFFBEA', '#FFFFFF'], 'enero'],
  ['Febrero', 'Amor', ['#C2185B', '#FF8FB8', '#F0508A', '#FFC4DA', '#FFEEF5', '#FFFFFF'], 'febrero'],
  ['Marzo', 'Mariposas', ['#2E8B57', '#9BE58A', '#58C46E', '#D2F7C4', '#F2FFEC', '#FFFFFF'], 'marzo'],
  ['Abril', 'Lluvias', ['#1F5FB8', '#7EC4FF', '#4A97E8', '#C4E6FF', '#EEF8FF', '#FFFFFF'], 'abril'],
  ['Mayo', 'Flores', ['#D2476B', '#FFB0A6', '#F07A86', '#FFD9CF', '#FFF3EE', '#FFFFFF'], 'mayo'],
  ['Junio', 'Sol', ['#E06A00', '#FFD24A', '#FF9F1C', '#FFEBA0', '#FFFAE0', '#FFFFFF'], 'junio'],
  ['Julio', 'Mar', ['#0B7C8C', '#62E0E0', '#23B5C0', '#B8F3F0', '#EBFFFD', '#FFFFFF'], 'julio'],
  ['Agosto', 'Cometas', ['#2A6FDB', '#9AD4FF', '#5AA2F0', '#D0EBFF', '#F0F9FF', '#FFFFFF'], 'agosto'],
  ['Septiembre', 'Amor y amistad', ['#B0233F', '#FF8A8A', '#E84D5B', '#FFC7C0', '#FFF0EC', '#FFFFFF'], 'septiembre'],
  ['Octubre', 'Noche de brujas', ['#B84A0E', '#FFA33A', '#F07A1F', '#FFD49A', '#FFF3E2', '#FFFFFF'], 'octubre'],
  ['Noviembre', 'Hojas', ['#8A5A1E', '#E8B24A', '#C98A2E', '#F5DDA0', '#FFF8E6', '#FFFFFF'], 'noviembre'],
  ['Diciembre', 'Velitas', ['#C0392B', '#FFD27A', '#F39C12', '#FFE9B0', '#FFF9E8', '#FFFFFF'], 'diciembre'],
];
const heart = (x, y, r, c, op = 1) => `<path d="M${x} ${y + r * .9}C${x - r * 1.6} ${y - r * .1} ${x - r * .9} ${y - r * 1.3} ${x} ${y - r * .45}C${x + r * .9} ${y - r * 1.3} ${x + r * 1.6} ${y - r * .1} ${x} ${y + r * .9}Z" fill="${c}" opacity="${op}"/>`;
function simboloMes(k) {
  switch (k) {
    case 'enero': return [[24, 28, '#FFE08A'], [78, 22, '#FFFFFF'], [80, 58, '#FFD24A']].map(([x, y, c]) => Array.from({ length: 8 }, (_, i) => { const t = i * Math.PI / 4; return `<path d="M${(x + 3 * Math.cos(t)).toFixed(1)} ${(y + 3 * Math.sin(t)).toFixed(1)}L${(x + 8 * Math.cos(t)).toFixed(1)} ${(y + 8 * Math.sin(t)).toFixed(1)}" stroke="${c}" stroke-width="1.8" stroke-linecap="round"/>`; }).join('')).join('');
    case 'febrero': return heart(50, 50, 34, '#FF8FB8', .28);
    case 'marzo': return `<g transform="translate(74 26) rotate(-18)"><ellipse cx="-6" cy="-3" rx="7" ry="5" fill="#9BE58A"/><ellipse cx="6" cy="-3" rx="7" ry="5" fill="#9BE58A"/><ellipse cx="-4" cy="5" rx="4.5" ry="3.5" fill="#58C46E"/><ellipse cx="4" cy="5" rx="4.5" ry="3.5" fill="#58C46E"/><rect x="-1" y="-7" width="2" height="15" rx="1" fill="#2E5A3A"/></g>`;
    case 'abril': return `<path d="M18 30C18 24 26 22 30 26C32 20 42 20 44 28C50 26 54 32 50 36H20C18 36 16 33 18 30Z" fill="#7EC4FF" opacity=".75"/>` + [[24, 44], [34, 50], [44, 44], [76, 32], [82, 46]].map(([x, y]) => `<path d="M${x} ${y}c-2 3-2 5 0 6 2-1 2-3 0-6z" fill="#9FD6FF"/>`).join('');
    case 'mayo': return `<g transform="translate(76 26)">${[0, 72, 144, 216, 288].map(r => `<ellipse cx="0" cy="-6" rx="4" ry="6.5" fill="#FFB0A6" transform="rotate(${r})"/>`).join('')}<circle r="3.5" fill="#FFD24A"/></g>`;
    case 'junio': return `<circle cx="50" cy="44" r="26" fill="#FFD24A" opacity=".3"/>` + Array.from({ length: 12 }, (_, i) => { const t = i * Math.PI / 6; return `<path d="M${(50 + 30 * Math.sin(t)).toFixed(1)} ${(44 - 30 * Math.cos(t)).toFixed(1)}L${(50 + 36 * Math.sin(t)).toFixed(1)} ${(44 - 36 * Math.cos(t)).toFixed(1)}" stroke="#FFD24A" stroke-width="3" stroke-linecap="round" opacity=".7"/>`; }).join('');
    case 'julio': return `<path d="M4 84C14 78 22 78 30 84S46 90 54 84S70 78 78 84S94 90 100 84V100H4Z" fill="#23B5C0" opacity=".85"/><path d="M4 92C14 86 22 86 30 92S46 98 54 92S70 86 78 92S94 98 100 92V100H4Z" fill="#0B7C8C"/>`;
    case 'agosto': return `<g transform="translate(74 24) rotate(12)"><path d="M0 -12L9 0L0 14L-9 0Z" fill="#FFD24A"/><path d="M0 -12L0 14M-9 0L9 0" stroke="#E06A00" stroke-width="1.2"/><path d="M0 14C-4 20 4 24 0 30C-3 34 2 38 -1 42" stroke="#9AD4FF" stroke-width="1.6" fill="none" stroke-linecap="round"/></g>`;
    case 'septiembre': return heart(26, 30, 8, '#FF8A8A') + heart(76, 26, 10, '#FFC7C0');
    case 'octubre': return `<path d="M82 18A10 10 0 1 0 88 34A8 8 0 1 1 82 18Z" fill="#FFD49A"/><g transform="translate(24 76)"><ellipse cx="-5" cy="0" rx="6" ry="8" fill="#F07A1F"/><ellipse cx="5" cy="0" rx="6" ry="8" fill="#F07A1F"/><ellipse cx="0" cy="0" rx="5" ry="8.5" fill="#FFA33A"/><rect x="-1.2" y="-12" width="2.4" height="5" rx="1" fill="#3E6B2E"/></g>`;
    case 'noviembre': return [[22, 30, -30], [78, 24, 25], [80, 62, -10]].map(([x, y, r]) => `<g transform="translate(${x} ${y}) rotate(${r})"><path d="M0 -8C6 -4 6 4 0 9C-6 4 -6 -4 0 -8Z" fill="#E8B24A"/><path d="M0 -7V9" stroke="#8A5A1E" stroke-width="1.2"/></g>`).join('');
    default: return '';
  }
}
function mes([, , pal, k], size = 72) {
  const id = 'x' + (++NL);
  if (k === 'diciembre') {
    const f = flame(pal, { id, s: .42, dy: -38 });
    const vela = `<defs><linearGradient id="${id}v" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#E8E1D6"/><stop offset="1" stop-color="#FFFFFF"/></linearGradient></defs><rect x="40" y="56" width="20" height="36" rx="3" fill="url(#${id}v)"/><path d="M50 56V50" stroke="#3A2A16" stroke-width="1.6"/><rect x="40" y="66" width="20" height="4" fill="#C0392B"/><rect x="40" y="76" width="20" height="4" fill="#2E8B57"/>`;
    return svgL(medal(vela + f.body + star4(24, 26, 5, '#FFD27A') + star4(78, 30, 4, '#FFFFFF'), f.defs), size);
  }
  const f = flame(pal, { id, s: .64, dy: 4 });
  const sim = simboloMes(k);
  const detras = ['febrero', 'junio', 'abril', 'enero'].includes(k);
  return svgL(medal(detras ? sim + f.body : f.body + sim, f.defs), size);
}

