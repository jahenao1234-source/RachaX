import React, { useId } from 'react';

// Constantes SVG
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

interface LlamaProps {
  etapa: number;
  size?: number;
}

export const Llama: React.FC<LlamaProps> = ({ etapa, size = 96 }) => {
  const baseId = useId().replace(/:/g, ''); // Para IDs limpios en SVG
  const id = `l_${baseId}`;

  // Helper local functions returning JSX
  const Spark = ({ x, y, r, c }: any) => <circle cx={x} cy={y} r={r} fill={c} />;
  const LogL = ({ x1, y1, x2, y2 }: any) => <path d={`M${x1} ${y1}L${x2} ${y2}`} stroke={`url(#${id}w)`} strokeWidth="7" strokeLinecap="round" />;
  const Star4 = ({ x, y, r, c, op = 1 }: any) => (
    <path d={`M${x} ${y - r}Q${x + r * .18} ${y - r * .18} ${x + r} ${y}Q${x + r * .18} ${y + r * .18} ${x} ${y + r}Q${x - r * .18} ${y + r * .18} ${x - r} ${y}Q${x - r * .18} ${y - r * .18} ${x} ${y - r}Z`} fill={c} opacity={op} />
  );

  let inner: React.ReactNode = null;
  let extraDefs: React.ReactNode = null;

  // flame implementation returns elements
  const renderFlame = (s: number, dx = 0, dy = 0, sides = false) => {
    const t = `translate(${50 - 50 * s + dx} ${100 - 100 * s + dy - 4}) scale(${s})`;
    return (
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
    );
  };

  const getCommonDefs = () => (
    <>
      <linearGradient id={`${id}o`} x1="0" y1="1" x2="0" y2="0">
        <stop offset="0" stopColor={WARM[0]} />
        <stop offset="1" stopColor={WARM[1]} />
      </linearGradient>
      <linearGradient id={`${id}m`} x1="0" y1="1" x2="0" y2="0">
        <stop offset="0" stopColor={WARM[2]} />
        <stop offset="1" stopColor={WARM[3]} />
      </linearGradient>
      <linearGradient id={`${id}c`} x1="0" y1="1" x2="0" y2="0">
        <stop offset="0" stopColor={WARM[4]} />
        <stop offset="1" stopColor={WARM[5]} />
      </linearGradient>
    </>
  );

  switch (etapa) {
    case 1:
      inner = (
        <>
          {renderFlame(0.42, 0, -8)}
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
          {renderFlame(0.52, 0, -14)}
          <ellipse cx="38" cy="80" rx="10" ry="6" fill={`url(#${id}k)`} />
          <ellipse cx="60" cy="81" rx="12" ry="6.5" fill={`url(#${id}k)`} />
          <ellipse cx="49" cy="84" rx="9" ry="5" fill={`url(#${id}k)`} />
        </>
      );
      break;
    case 3:
      inner = renderFlame(0.72);
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
          {renderFlame(0.62, 0, -12)}
          <LogL x1={28} y1={86} x2={72} y2={76} />
          <LogL x1={28} y1={76} x2={72} y2={86} />
        </>
      );
      break;
    case 5:
      inner = renderFlame(0.8, 0, 0, true);
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
          {renderFlame(0.74, 0, -12, true)}
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
          {renderFlame(0.56, 0, -40)}
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
          {renderFlame(0.6, 0, -30, true)}
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
              <path
                key={i}
                d={`M${(50 + r1 * Math.sin(a)).toFixed(1)} ${(54 - r1 * Math.cos(a)).toFixed(1)}L${(50 + r2 * Math.sin(a)).toFixed(1)} ${(54 - r2 * Math.cos(a)).toFixed(1)}`}
                stroke="#FFB547"
                strokeWidth="3.5"
                strokeLinecap="round"
              />
            );
          })}
          <circle cx="50" cy="54" r="27" fill="#FFB547" opacity=".22" />
          {renderFlame(0.6, 0, -6)}
        </>
      );
      break;
    case 10:
      inner = (
        <>
          <Star4 x={50} y={50} r={44} c="#FFD37F" op={0.35} />
          <Star4 x={50} y={50} r={30} c="#FFE9B0" op={0.35} />
          {renderFlame(0.7, 0, 0, true)}
          <Star4 x={76} y={22} r={6} c="#FFFFFF" />
          <Star4 x={24} y={30} r={4} c="#FFE9B0" />
        </>
      );
      break;
  }

  const ringLevel = etapa >= 9 ? 2 : etapa >= 5 ? 1 : 0;

  return (
    <svg width={size} height={size} viewBox="0 0 100 100" aria-hidden="true">
      <defs>
        <radialGradient id={`${id}bg`} cx=".5" cy=".62" r=".6">
          <stop offset="0" stopColor="var(--hearth2)" />
          <stop offset="1" stopColor="var(--hearth)" />
        </radialGradient>
        {getCommonDefs()}
        {extraDefs}
      </defs>
      <clipPath id={`${id}cl`}>
        <circle cx="50" cy="50" r="46" />
      </clipPath>
      <circle cx="50" cy="50" r="46" fill={`url(#${id}bg)`} />
      <g clipPath={`url(#${id}cl)`}>{inner}</g>
      {ringLevel >= 1 && (
        <circle cx="50" cy="50" r="47" fill="none" stroke="var(--ring)" strokeWidth="1.5" />
      )}
      {ringLevel >= 2 && Array.from({ length: 12 }, (_, i) => {
        const a = (i * Math.PI) / 6;
        return (
          <circle
            key={i}
            cx={(50 + 47 * Math.sin(a)).toFixed(1)}
            cy={(50 - 47 * Math.cos(a)).toFixed(1)}
            r="1.8"
            fill="var(--ring)"
          />
        );
      })}
    </svg>
  );
};
