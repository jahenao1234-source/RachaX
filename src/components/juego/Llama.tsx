import React, { useId } from 'react';

// Constantes SVG Base
const OUTER = 'M50 8C58 24 76 34 78 58C80 78 66 92 50 92C34 92 20 80 22 60C23 48 30 40 36 34C36 44 40 50 45 52C42 38 44 22 50 8Z';
const MID = 'M50 30C56 42 68 50 68 64C68 78 60 86 50 86C40 86 32 78 33 66C34 58 38 53 42 50C43 58 46 62 49 63C47 52 47 42 50 30Z';
const CORE = 'M50 52C54 60 60 65 60 72C60 80 56 84 50 84C44 84 40 80 40 73C40 67 45 62 50 52Z';
const SIDE_L = 'M30 88C18 82 14 70 18 58C20 66 24 70 28 71C25 62 27 54 32 48C33 60 38 68 42 74Z';
const SIDE_R = 'M70 88C82 82 86 70 82 58C80 66 76 70 72 71C75 62 73 54 68 48C67 60 62 68 58 74Z';

const WARM = ['#E8471C', '#FFB547', '#FF8A1F', '#FFD37F', '#FFE9B0', '#FFFFFF'];

export const ETAPAS: [string, number][] = [
  ['Chispa', 1], ['Brasa', 3], ['Llama', 5], ['Fogata', 8], ['Fuego', 12],
  ['Hoguera', 16], ['Antorcha', 20], ['Volcán', 25], ['Sol', 30], ['Estrella', 40]
];

export function etapaDeNivel(nivel: number): number {
  let stage = 1;
  for (let i = 0; i < ETAPAS.length; i++) {
    if (nivel >= ETAPAS[i][1]) {
      stage = i + 1;
    }
  }
  return stage;
}

const Star4 = ({ x, y, r, c, op = 1 }: {x:number, y:number, r:number, c:string, op?:number}) => (
  <path d={`M${x} ${y - r}Q${x + r * .18} ${y - r * .18} ${x + r} ${y}Q${x + r * .18} ${y + r * .18} ${x} ${y + r}Q${x - r * .18} ${y + r * .18} ${x - r} ${y}Q${x - r * .18} ${y - r * .18} ${x} ${y - r}Z`} fill={c} opacity={op} />
);

const Heart = ({x, y, r, c, op = 1}: any) => (
  <path d={`M${x} ${y + r * .9}C${x - r * 1.6} ${y - r * .1} ${x - r * .9} ${y - r * 1.3} ${x} ${y - r * .45}C${x + r * .9} ${y - r * 1.3} ${x + r * 1.6} ${y - r * .1} ${x} ${y + r * .9}Z`} fill={c} opacity={op}/>
);

function renderFlameBase(id: string, pal: string[], s: number, dx = 0, dy = 0, sides = false) {
  const t = `translate(${50 - 50 * s + dx} ${100 - 100 * s + dy - 4}) scale(${s})`;
  return (
    <>
      <defs>
        <linearGradient id={`${id}o`} x1="0" y1="1" x2="0" y2="0">
          <stop offset="0" stopColor={pal[0]} />
          <stop offset="1" stopColor={pal[1]} />
        </linearGradient>
        <linearGradient id={`${id}m`} x1="0" y1="1" x2="0" y2="0">
          <stop offset="0" stopColor={pal[2]} />
          <stop offset="1" stopColor={pal[3]} />
        </linearGradient>
        <linearGradient id={`${id}c`} x1="0" y1="1" x2="0" y2="0">
          <stop offset="0" stopColor={pal[4]} />
          <stop offset="1" stopColor={pal[5]} />
        </linearGradient>
      </defs>
      <g transform={t}>
        {sides && (
          <>
            <path d={SIDE_L} fill={`url(#${id}o)`} opacity=".9" />
            <path d={SIDE_R} fill={`url(#${id}o)`} opacity=".9" />
          </>
        )}
        <path d={OUTER} fill={`url(#${id}o)`} />
        <path d={MID} fill={`url(#${id}m)`} />
        <path d={CORE} fill={`url(#${id}c)`} />
        <ellipse cx="41" cy="58" rx="3" ry="8" fill="#fff" opacity=".28" transform="rotate(18 41 58)" />
      </g>
    </>
  );
}

function SvgMedal({ id, size, children, ringLevel = 0, sola = false }: { id: string, size: number, children: React.ReactNode, ringLevel?: number, sola?: boolean }) {
  if (sola) {
    return (
      <svg width={size} height={size} viewBox="14 20 72 72" aria-hidden="true">
        {/* Sin el fondo del medallón, pero con su recorte: los fondos propios de cada llama (colina, olas…) no se salen */}
        <clipPath id={`${id}cl`}>
          <circle cx="50" cy="50" r="46" />
        </clipPath>
        <g clipPath={`url(#${id}cl)`}>{children}</g>
      </svg>
    );
  }

  return (
    <svg width={size} height={size} viewBox="0 0 100 100" aria-hidden="true">
      <defs>
        <radialGradient id={`${id}bg`} cx=".5" cy=".62" r=".6">
          <stop offset="0" stopColor="var(--hearth2)" />
          <stop offset="1" stopColor="var(--hearth)" />
        </radialGradient>
      </defs>
      <clipPath id={`${id}cl`}>
        <circle cx="50" cy="50" r="46" />
      </clipPath>
      <circle cx="50" cy="50" r="46" fill={`url(#${id}bg)`} />
      <g clipPath={`url(#${id}cl)`}>{children}</g>
      {ringLevel >= 1 && (
        <circle cx="50" cy="50" r="47" fill="none" stroke="var(--ring)" strokeWidth="1.5" />
      )}
      {ringLevel >= 2 && Array.from({ length: 12 }, (_, i) => {
        const a = (i * Math.PI) / 6;
        return (
          <circle key={i} cx={(50 + 47 * Math.sin(a)).toFixed(1)} cy={(50 - 47 * Math.cos(a)).toFixed(1)} r="1.8" fill="var(--ring)" />
        );
      })}
    </svg>
  );
}

// ---------------- ETAPA ----------------
interface LlamaProps {
  etapa: number;
  size?: number;
  sola?: boolean;
}

export const Llama: React.FC<LlamaProps> = ({ etapa, size = 96, sola = false }) => {
  const baseId = useId().replace(/:/g, '');
  const id = `l_${baseId}`;

  const Spark = ({ x, y, r, c }: any) => <circle cx={x} cy={y} r={r} fill={c} />;
  const LogL = ({ x1, y1, x2, y2 }: any) => <path d={`M${x1} ${y1}L${x2} ${y2}`} stroke={`url(#${id}w)`} strokeWidth="7" strokeLinecap="round" />;

  let inner: React.ReactNode = null;
  let extraDefs: React.ReactNode = null;

  switch (etapa) {
    case 1:
      inner = (
        <>
          {renderFlameBase(id, WARM, 0.42, 0, -8)}
          <Spark x={34} y={40} r={2.2} c="#FFD37F" />
          <Spark x={66} y={34} r={1.8} c="#FFB547" />
          <Spark x={62} y={52} r={1.4} c="#FFE9B0" />
        </>
      );
      break;
    case 2:
      extraDefs = (
        <radialGradient id={`${id}k`} cx=".5" cy=".3" r=".7">
          <stop offset="0" stopColor="#FF7A2F" />
          <stop offset="1" stopColor="#5A1E0E" />
        </radialGradient>
      );
      inner = (
        <>
          {renderFlameBase(id, WARM, 0.52, 0, -14)}
          <ellipse cx="38" cy="80" rx="10" ry="6" fill={`url(#${id}k)`} />
          <ellipse cx="60" cy="81" rx="12" ry="6.5" fill={`url(#${id}k)`} />
          <ellipse cx="49" cy="84" rx="9" ry="5" fill={`url(#${id}k)`} />
        </>
      );
      break;
    case 3:
      inner = renderFlameBase(id, WARM, 0.72);
      break;
    case 4:
      extraDefs = (
        <linearGradient id={`${id}w`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#6B3F22" />
          <stop offset="1" stopColor="#A0673E" />
        </linearGradient>
      );
      inner = (
        <>
          {renderFlameBase(id, WARM, 0.62, 0, -12)}
          <LogL x1={28} y1={86} x2={72} y2={76} />
          <LogL x1={28} y1={76} x2={72} y2={86} />
        </>
      );
      break;
    case 5:
      inner = renderFlameBase(id, WARM, 0.8, 0, 0, true);
      break;
    case 6:
      extraDefs = (
        <linearGradient id={`${id}w`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#6B3F22" />
          <stop offset="1" stopColor="#A0673E" />
        </linearGradient>
      );
      inner = (
        <>
          {renderFlameBase(id, WARM, 0.74, 0, -12, true)}
          <LogL x1={24} y1={88} x2={76} y2={76} />
          <LogL x1={24} y1={76} x2={76} y2={88} />
          <LogL x1={34} y1={90} x2={66} y2={90} />
          <Spark x={22} y={34} r={1.8} c="#FFD37F" />
          <Spark x={78} y={28} r={2} c="#FFB547" />
        </>
      );
      break;
    case 7:
      extraDefs = (
        <>
          <linearGradient id={`${id}t`} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#5B4636" />
            <stop offset="1" stopColor="#8C6B52" />
          </linearGradient>
          <linearGradient id={`${id}cup`} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#B98B2F" />
            <stop offset="1" stopColor="#F2C45A" />
          </linearGradient>
        </>
      );
      inner = (
        <>
          <path d="M46 64L54 64L52 94L48 94Z" fill={`url(#${id}t)`} />
          <path d="M36 58L64 58L58 68L42 68Z" fill={`url(#${id}cup)`} />
          {renderFlameBase(id, WARM, 0.56, 0, -40)}
        </>
      );
      break;
    case 8:
      extraDefs = (
        <linearGradient id={`${id}v`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#4A3A33" />
          <stop offset="1" stopColor="#241B18" />
        </linearGradient>
      );
      inner = (
        <>
          {renderFlameBase(id, WARM, 0.6, 0, -30, true)}
          <path d="M12 90L38 56L44 60L50 54L56 60L62 56L88 90Z" fill={`url(#${id}v)`} />
          <path d="M50 58L47 72L52 78L49 90" stroke="#FF8A1F" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        </>
      );
      break;
    case 9:
      inner = (
        <>
          {Array.from({ length: 12 }, (_, i) => {
            const a = (i * Math.PI) / 6;
            const r1 = 30;
            const r2 = i % 2 ? 38 : 42;
            return (
              <path key={i} d={`M${(50 + r1 * Math.sin(a)).toFixed(1)} ${(54 - r1 * Math.cos(a)).toFixed(1)}L${(50 + r2 * Math.sin(a)).toFixed(1)} ${(54 - r2 * Math.cos(a)).toFixed(1)}`} stroke="#FFB547" strokeWidth="3.5" strokeLinecap="round" />
            );
          })}
          <circle cx="50" cy="54" r="27" fill="#FFB547" opacity=".22" />
          {renderFlameBase(id, WARM, 0.6, 0, -6)}
        </>
      );
      break;
    case 10:
      inner = (
        <>
          <Star4 x={50} y={50} r={44} c="#FFD37F" op={0.35} />
          <Star4 x={50} y={50} r={30} c="#FFE9B0" op={0.35} />
          {renderFlameBase(id, WARM, 0.7, 0, 0, true)}
          <Star4 x={76} y={22} r={6} c="#FFFFFF" />
          <Star4 x={24} y={30} r={4} c="#FFE9B0" />
        </>
      );
      break;
  }

  const ringLevel = etapa >= 9 ? 2 : etapa >= 5 ? 1 : 0;
  return (
    <SvgMedal id={id} size={size} ringLevel={ringLevel} sola={sola}>
      {extraDefs}
      {inner}
    </SvgMedal>
  );
};

// ---------------- HAZAÑA ----------------
export const HAZ = [
  ['Raíz', '66 días de reto', ['#1E8A4C', '#5ED38A', '#3FBF6E', '#B8F5A0', '#E9FFD8', '#FFFFFF'], 'raiz'],
  ['Fénix', '10 regresos', ['#C2261B', '#FF6B3D', '#FF5A2F', '#FFB36B', '#FFE0B8', '#FFFFFF'], 'fenix'],
  ['Hielo', '100 días completos', ['#1D5FD1', '#5CC8FF', '#4AA8F5', '#A8E8FF', '#E6FAFF', '#FFFFFF'], 'hielo'],
  ['Dorada', '1000 veces', ['#A8740A', '#F2C23A', '#E6A91E', '#FFE27A', '#FFF6CF', '#FFFFFF'], 'dorada'],
  ['Aurora', '3 meses en 80%', ['#0F9E8E', '#7C6CF0', '#2DD4BF', '#F0A6D8', '#E8FFFB', '#FFFFFF'], 'aurora'],
  ['Nocturna', '30 noches', ['#3B35B8', '#8E9BFF', '#6A6CF0', '#C9CFFF', '#EEF0FF', '#FFFFFF'], 'nocturna'],
  ['Alba', '30 mañanas', ['#E0567A', '#FFB08A', '#FF8F8F', '#FFD8BF', '#FFF2E8', '#FFFFFF'], 'alba'],
  ['Tormenta', '12 retos semanales', ['#3A4A6B', '#7FA8FF', '#56709E', '#BFD4FF', '#EAF1FF', '#FFFFFF'], 'tormenta'],
];

export const LlamaHazana = ({ id, size = 96, sola = false }: { id: string, size?: number, sola?: boolean }) => {
  const baseId = useId().replace(/:/g, '');
  const svgId = `h_${baseId}`;
  
  const hDef = HAZ.find(h => h[3] === id);
  if (!hDef) return null;
  const k = hDef[3] as string;
  const pal = hDef[2] as string[];
  
  let extra = null;
  if (k === 'raiz') extra = <path d="M50 88C50 92 44 94 38 96M50 88C51 93 56 95 62 96M50 88L50 96" stroke="#8A5A3C" strokeWidth="2.5" fill="none" strokeLinecap="round"/>;
  if (k === 'fenix') extra = (
    <>
      <path d="M40 60C28 58 16 50 12 38C22 42 28 42 34 46C26 40 22 34 22 26C30 34 38 40 44 50Z" fill="#FF6B3D" opacity=".85"/>
      <path d="M60 60C72 58 84 50 88 38C78 42 72 42 66 46C74 40 78 34 78 26C70 34 62 40 56 50Z" fill="#FF6B3D" opacity=".85"/>
    </>
  );
  if (k === 'hielo') extra = (
    <>
      {[[24, 30], [76, 26], [80, 60]].map(([x, y], i) => (
        <g key={i} stroke="#BFEFFF" strokeWidth="1.6" strokeLinecap="round">
          <path d={`M${x - 5} ${y}H${x + 5}M${x} ${y - 5}V${y + 5}M${x - 3.5} ${y - 3.5}L${x + 3.5} ${y + 3.5}M${x + 3.5} ${y - 3.5}L${x - 3.5} ${y + 3.5}`}/>
        </g>
      ))}
    </>
  );
  if (k === 'dorada') extra = (
    <>
      <Star4 x={76} y={24} r={6} c="#FFE27A" />
      <Star4 x={24} y={34} r={4.5} c="#FFF6CF" />
      <Star4 x={78} y={62} r={3.5} c="#FFE27A" />
    </>
  );
  if (k === 'aurora') extra = (
    <>
      <path d="M14 40C30 30 44 36 58 28C70 22 80 26 88 20" stroke="#7C6CF0" strokeWidth="2.5" fill="none" opacity=".6" strokeLinecap="round"/>
      <path d="M12 48C28 40 44 46 60 38C72 32 82 36 90 30" stroke="#2DD4BF" strokeWidth="2.5" fill="none" opacity=".6" strokeLinecap="round"/>
    </>
  );
  if (k === 'nocturna') extra = (
    <>
      <path d="M80 22A11 11 0 1 0 86 40A9 9 0 1 1 80 22Z" fill="#C9CFFF"/>
      <Star4 x={22} y={30} r={3.5} c="#EEF0FF" />
      <Star4 x={28} y={64} r={2.5} c="#C9CFFF" />
    </>
  );
  if (k === 'alba') extra = <path d="M16 86A34 34 0 0 1 84 86" fill="#FFB08A" opacity=".35"/>;
  if (k === 'tormenta') extra = (
    <>
      <path d="M22 30C22 24 30 22 34 26C36 20 46 20 48 28C54 26 58 32 54 36H24C22 36 20 33 22 30Z" fill="#56709E" opacity=".8"/>
      <path d="M53 58L45 72H51L47 84L59 68H52L57 58Z" fill="#FFE27A"/>
    </>
  );

  const isBehind = (k === 'alba' || k === 'aurora' || k === 'fenix');
  const body = renderFlameBase(svgId, pal, 0.7, 0, 0, k === 'fenix' || k === 'aurora');

  return (
    <SvgMedal id={svgId} size={size} ringLevel={1} sola={sola}>
      {isBehind ? extra : null}
      {body}
      {!isBehind ? extra : null}
    </SvgMedal>
  );
};

// ---------------- MESES ----------------
export const MESES_LL = [
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

export const LlamaMes = ({ mes, size = 96, sola = false }: { mes: number, size?: number, sola?: boolean }) => {
  const baseId = useId().replace(/:/g, '');
  const svgId = `m_${baseId}`;
  
  if (mes < 1 || mes > 12) return null;
  const mDef = MESES_LL[mes - 1];
  const k = mDef[3] as string;
  const pal = mDef[2] as string[];

  if (k === 'diciembre') {
    return (
      <SvgMedal id={svgId} size={size} sola={sola}>
        <defs>
          <linearGradient id={`${svgId}v`} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#E8E1D6"/>
            <stop offset="1" stopColor="#FFFFFF"/>
          </linearGradient>
        </defs>
        <rect x="40" y="56" width="20" height="36" rx="3" fill={`url(#${svgId}v)`}/>
        <path d="M50 56V50" stroke="#3A2A16" strokeWidth="1.6"/>
        <rect x="40" y="66" width="20" height="4" fill="#C0392B"/>
        <rect x="40" y="76" width="20" height="4" fill="#2E8B57"/>
        {renderFlameBase(svgId, pal, 0.42, 0, -38)}
        <Star4 x={24} y={26} r={5} c="#FFD27A" />
        <Star4 x={78} y={30} r={4} c="#FFFFFF" />
      </SvgMedal>
    );
  }

  let sim = null;
  if (k === 'enero') {
    sim = [[24, 28, '#FFE08A'], [78, 22, '#FFFFFF'], [80, 58, '#FFD24A']].map(([x, y, c]: any, i) => (
      <g key={i}>
        {Array.from({ length: 8 }, (_, j) => {
          const t = j * Math.PI / 4;
          return <path key={j} d={`M${(x + 3 * Math.cos(t)).toFixed(1)} ${(y + 3 * Math.sin(t)).toFixed(1)}L${(x + 8 * Math.cos(t)).toFixed(1)} ${(y + 8 * Math.sin(t)).toFixed(1)}`} stroke={c} strokeWidth="1.8" strokeLinecap="round"/>;
        })}
      </g>
    ));
  } else if (k === 'febrero') sim = <Heart x={50} y={50} r={34} c="#FF8FB8" op={0.28} />;
  else if (k === 'marzo') sim = (
    <g transform="translate(74 26) rotate(-18)">
      <ellipse cx="-6" cy="-3" rx="7" ry="5" fill="#9BE58A"/><ellipse cx="6" cy="-3" rx="7" ry="5" fill="#9BE58A"/>
      <ellipse cx="-4" cy="5" rx="4.5" ry="3.5" fill="#58C46E"/><ellipse cx="4" cy="5" rx="4.5" ry="3.5" fill="#58C46E"/>
      <rect x="-1" y="-7" width="2" height="15" rx="1" fill="#2E5A3A"/>
    </g>
  );
  else if (k === 'abril') sim = (
    <>
      <path d="M18 30C18 24 26 22 30 26C32 20 42 20 44 28C50 26 54 32 50 36H20C18 36 16 33 18 30Z" fill="#7EC4FF" opacity=".75"/>
      {[[24, 44], [34, 50], [44, 44], [76, 32], [82, 46]].map(([x, y], i) => (
        <path key={i} d={`M${x} ${y}c-2 3-2 5 0 6 2-1 2-3 0-6z`} fill="#9FD6FF"/>
      ))}
    </>
  );
  else if (k === 'mayo') sim = (
    <g transform="translate(76 26)">
      {[0, 72, 144, 216, 288].map(r => <ellipse key={r} cx="0" cy="-6" rx="4" ry="6.5" fill="#FFB0A6" transform={`rotate(${r})`}/>)}
      <circle r="3.5" fill="#FFD24A"/>
    </g>
  );
  else if (k === 'junio') sim = (
    <>
      <circle cx="50" cy="44" r="26" fill="#FFD24A" opacity=".3"/>
      {Array.from({ length: 12 }, (_, i) => { 
        const t = i * Math.PI / 6; 
        return <path key={i} d={`M${(50 + 30 * Math.sin(t)).toFixed(1)} ${(44 - 30 * Math.cos(t)).toFixed(1)}L${(50 + 36 * Math.sin(t)).toFixed(1)} ${(44 - 36 * Math.cos(t)).toFixed(1)}`} stroke="#FFD24A" strokeWidth="3" strokeLinecap="round" opacity=".7"/>; 
      })}
    </>
  );
  else if (k === 'julio') sim = (
    <>
      <path d="M4 84C14 78 22 78 30 84S46 90 54 84S70 78 78 84S94 90 100 84V100H4Z" fill="#23B5C0" opacity=".85"/>
      <path d="M4 92C14 86 22 86 30 92S46 98 54 92S70 86 78 92S94 98 100 92V100H4Z" fill="#0B7C8C"/>
    </>
  );
  else if (k === 'agosto') sim = (
    <g transform="translate(74 24) rotate(12)">
      <path d="M0 -12L9 0L0 14L-9 0Z" fill="#FFD24A"/>
      <path d="M0 -12L0 14M-9 0L9 0" stroke="#E06A00" strokeWidth="1.2"/>
      <path d="M0 14C-4 20 4 24 0 30C-3 34 2 38 -1 42" stroke="#9AD4FF" strokeWidth="1.6" fill="none" strokeLinecap="round"/>
    </g>
  );
  else if (k === 'septiembre') sim = <><Heart x={26} y={30} r={8} c="#FF8A8A"/><Heart x={76} y={26} r={10} c="#FFC7C0"/></>;
  else if (k === 'octubre') sim = (
    <>
      <path d="M82 18A10 10 0 1 0 88 34A8 8 0 1 1 82 18Z" fill="#FFD49A"/>
      <g transform="translate(24 76)">
        <ellipse cx="-5" cy="0" rx="6" ry="8" fill="#F07A1F"/><ellipse cx="5" cy="0" rx="6" ry="8" fill="#F07A1F"/><ellipse cx="0" cy="0" rx="5" ry="8.5" fill="#FFA33A"/><rect x="-1.2" y="-12" width="2.4" height="5" rx="1" fill="#3E6B2E"/>
      </g>
    </>
  );
  else if (k === 'noviembre') sim = [[22, 30, -30], [78, 24, 25], [80, 62, -10]].map(([x, y, r]: any, i) => (
    <g key={i} transform={`translate(${x} ${y}) rotate(${r})`}>
      <path d="M0 -8C6 -4 6 4 0 9C-6 4 -6 -4 0 -8Z" fill="#E8B24A"/>
      <path d="M0 -7V9" stroke="#8A5A1E" strokeWidth="1.2"/>
    </g>
  ));

  const detras = ['febrero', 'junio', 'abril', 'enero'].includes(k);
  const body = renderFlameBase(svgId, pal, 0.64, 0, 4);
  
  return (
    <SvgMedal id={svgId} size={size} sola={sola}>
      {detras ? sim : null}
      {body}
      {!detras ? sim : null}
    </SvgMedal>
  );
};

// ---------------- RARAS & UTIL ----------------
export const LlamaRara = ({ id, size = 96 }: { id: string, size?: number }) => {
  return (
    <div style={{ width: size, height: size, borderRadius: '50%', backgroundColor: '#0A0A0C', border: '1.5px solid #B7AEE8', overflow: 'hidden', flexShrink: 0 }}>
      <img src={`/llamas/raras/${id}.jpg`} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', transform: 'scale(1.1)' }} />
    </div>
  );
};

export const SiluetaLlama = ({ size = 96 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" aria-hidden="true" style={{ flexShrink: 0 }}>
    <circle cx="50" cy="50" r="46" fill="var(--surface-raised)" />
    <circle cx="50" cy="50" r="45" fill="none" stroke="var(--text-muted)" strokeWidth="1.5" strokeDasharray="4 4" />
    <g transform="translate(22 26) scale(.56)"><path d={OUTER} fill="var(--line)" /></g>
    <text x="50" y="66" textAnchor="middle" fontFamily="Barlow Condensed, sans-serif" fontWeight="700" fontSize="26" fill="var(--text)">?</text>
  </svg>
);

// "+N" por descubrir. rara = medallón oscuro de las raras (colores fijos, como el arte)
export const MasLlamas = ({ n, size = 96, rara = false }: { n: number, size?: number, rara?: boolean }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" aria-hidden="true" style={{ flexShrink: 0 }}>
    <circle cx="50" cy="50" r="46" fill={rara ? '#15121F' : 'var(--surface-raised)'} />
    <circle cx="50" cy="50" r="45" fill="none" stroke={rara ? '#6B5FA8' : 'var(--text-muted)'} strokeWidth="1.5" strokeDasharray="4 4" />
    <text x="50" y="60" textAnchor="middle" fontFamily="Barlow Condensed, sans-serif" fontWeight="700" fontSize="30" fill={rara ? '#D8D2FF' : 'var(--text)'}>+{n}</text>
  </svg>
);

export const RARAS_NOMBRE: Record<string, string> = {
  cristal: 'Cristal', galaxia: 'Galaxia', obsidiana: 'Obsidiana', arcoiris: 'Arcoíris', neon: 'Neón',
  magma: 'Magma', perla: 'Perla', rubi: 'Rubí', sakura: 'Sakura', espiritu: 'Espíritu',
};

// Cada hazaña es el premio de una insignia (ids de badgeUtils)
export const HAZ_INFO: Record<string, { insignia: string; insigniaNombre: string; unidad: string; corta: string; requisito: string; frase: string }> = {
  raiz: { insignia: 'rh_66', insigniaNombre: 'Retos 66', unidad: 'días de reto', corta: 'días', requisito: '66 días de reto cumplidos', frase: 'Un hábito echó raíz.' },
  fenix: { insignia: 'v_10', insigniaNombre: 'Volviste 10', unidad: 'regresos', corta: 'regresos', requisito: '10 regresos', frase: 'Volver te hizo más fuerte.' },
  hielo: { insignia: 'dc_100', insigniaNombre: 'Días completos 100', unidad: 'días completos', corta: 'días', requisito: '100 días completos', frase: 'Cien días completos, sin prisa.' },
  dorada: { insignia: 'c_1000', insigniaNombre: 'Constancia 1000', unidad: 'veces', corta: 'veces', requisito: '1000 veces cumplidas', frase: 'Mil veces cumpliste.' },
  aurora: { insignia: 'm_3', insigniaNombre: 'Meses 3', unidad: 'meses', corta: 'meses', requisito: '3 meses en 80%', frase: 'Tres meses encendidos.' },
  nocturna: { insignia: 'mo_30n', insigniaNombre: '30 noches', unidad: 'noches', corta: 'noches', requisito: '30 noches', frase: 'Tus noches ahora son tuyas.' },
  alba: { insignia: 'mo_30m', insigniaNombre: '30 mañanas', unidad: 'mañanas', corta: 'mañanas', requisito: '30 mañanas', frase: 'Madrugar se volvió tuyo.' },
  tormenta: { insignia: 'rs_12', insigniaNombre: 'Retos semanales 12', unidad: 'retos semanales', corta: 'retos', requisito: '12 retos semanales', frase: 'Doce semanas yendo por más.' },
};

export function nombreLlama(id: string): string {
  if (id.startsWith('etapa_')) return ETAPAS[parseInt(id.split('_')[1]) - 1][0];
  if (id.startsWith('hazana_')) {
    const k = id.split('_')[1];
    return (HAZ.find(h => h[3] === k)?.[0] as string) || 'Llama';
  }
  if (id.startsWith('mes_')) return MESES_LL[parseInt(id.split('_')[1]) - 1][0] as string;
  if (id.startsWith('rara_')) return RARAS_NOMBRE[id.split('_')[1]] || 'Rara';
  return 'Llama';
}

export const LlamaDe = ({ id, size = 96, sola = false }: { id: string, size?: number, sola?: boolean }) => {
  if (id.startsWith('etapa_')) return <Llama etapa={parseInt(id.split('_')[1])} size={size} sola={sola} />;
  if (id.startsWith('hazana_')) return <LlamaHazana id={id.split('_')[1]} size={size} sola={sola} />;
  if (id.startsWith('mes_')) return <LlamaMes mes={parseInt(id.split('_')[1])} size={size} sola={sola} />;
  if (id.startsWith('rara_')) return <LlamaRara id={id.split('_')[1]} size={size} />;
  return <Llama etapa={1} size={size} />;
};

export const CajaArte = ({ size, abierta }: { size: number; abierta?: boolean }) => {
  const gid = React.useId().replace(/:/g, '');
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" aria-hidden="true">
      <defs>
        <linearGradient id={`cjg_${gid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#FFC766"/>
          <stop offset="1" stopColor="#E8941F"/>
        </linearGradient>
      </defs>
      {abierta ? (
        <>
          <rect x="22" y="50" width="56" height="40" rx="6" fill={`url(#cjg_${gid})`} stroke="#E8941F" strokeWidth="1.5"/>
          <rect x="14" y="22" width="60" height="14" rx="4" fill="#FFB547" transform="rotate(-14 44 29)"/>
          <rect x="46" y="50" width="8" height="40" fill="#8E9BFF"/>
          <path d="M50 31Q51.26 36.74 57 38Q51.26 39.26 50 45Q48.74 39.26 43 38Q48.74 36.74 50 31Z" fill="#FFF3DC"/>
          <path d="M34 26Q34.72 29.28 38 30Q34.72 30.72 34 34Q33.28 30.72 30 30Q33.28 29.28 34 26Z" fill="#FFE08A"/>
          <path d="M68 21Q68.9 25.1 73 26Q68.9 26.9 68 31Q67.1 26.9 63 26Q67.1 25.1 68 21Z" fill="#FFFFFF"/>
        </>
      ) : (
        <>
          <rect x="22" y="44" width="56" height="46" rx="6" fill={`url(#cjg_${gid})`} stroke="#E8941F" strokeWidth="1.5"/>
          <rect x="18" y="34" width="64" height="14" rx="4" fill="#FFB547"/>
          <rect x="46" y="34" width="8" height="56" fill="#8E9BFF"/>
          <path d="M50 34C42 22 30 24 34 30C36 34 44 34 50 34ZM50 34C58 22 70 24 66 30C64 34 56 34 50 34Z" fill="#8E9BFF"/>
        </>
      )}
    </svg>
  );
};
