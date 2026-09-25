import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ShieldCheck, Gift, Medal, Sunrise, Sun, Moon, Clock } from 'lucide-react';
import { useHabitStore } from '../../store/HabitContext';
import { useTheme } from '../../store/ThemeContext';
import { HabitIcon } from '../common/HabitIcon';
import { Llama } from '../juego/Llama';
import { getTodayString } from '../../utils/habitUtils';
import { MomentoDia } from '../../types';

// Maqueta aprobada: design/maqueta-onboarding.html (DESIGN.md, "Onboarding")
const HABITOS = [
  { nombre: 'Beber un vaso de agua', icono: 'GlassWater' },
  { nombre: 'Leer 10 minutos', icono: 'BookOpen' },
  { nombre: 'Moverte 15 minutos', icono: 'Dumbbell' },
  { nombre: 'Acostarte antes de las 11', icono: 'Bed' },
  { nombre: 'Respirar 5 minutos', icono: 'Wind' },
  { nombre: 'Soltar el celular antes de dormir', icono: 'Smartphone' },
  { nombre: 'Estudiar 25 minutos', icono: 'GraduationCap' },
  { nombre: 'Ordenar 10 minutos', icono: 'Home' },
];
const PROPIO = -1;

const SUGERENCIAS = ['despertarme', 'tomarme el café', 'almorzar', 'llegar a la casa', 'cenar', 'lavarme los dientes'];

const MOMENTOS: { id: MomentoDia; label: string; Icon: React.FC<{ size?: number }>; color: string }[] = [
  { id: 'manana', label: 'Mañana', Icon: Sunrise, color: 'var(--manana-text)' },
  { id: 'tarde', label: 'Tarde', Icon: Sun, color: 'var(--coral-text)' },
  { id: 'noche', label: 'Noche', Icon: Moon, color: 'var(--lila-text)' },
  { id: 'flexible', label: 'Todo el día', Icon: Clock, color: 'var(--text)' },
];

const TOTAL = 5;

export const OnboardingModal: React.FC = () => {
  const { isOnboardingOpen, completeOnboarding, crearHabito, habitos, setActiveTab } = useHabitStore();
  const { setNombre } = useTheme();

  const [soloRepaso, setSoloRepaso] = useState(false);
  const [paso, setPaso] = useState(0);
  const [nombre, setNombreInput] = useState('');
  const [elegido, setElegido] = useState<number | null>(null);
  const [propio, setPropio] = useState('');
  const [ancla, setAncla] = useState('');
  const [momento, setMomento] = useState<MomentoDia>('flexible');
  const [aceptaReto, setAceptaReto] = useState(false);
  const [aviso, setAviso] = useState(false);
  const terminando = useRef(false);
  const h1Ref = useRef<HTMLHeadingElement>(null);

  // Cada vez que se abre, empieza desde la bienvenida. Quien ya tiene hábitos solo repasa (pantallas 1 y 6).
  useEffect(() => {
    if (isOnboardingOpen) {
      setSoloRepaso(habitos.length > 0);
      setPaso(0);
      setAviso(false);
      terminando.current = false;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOnboardingOpen]);

  // Al cambiar de paso, el foco va al título
  useEffect(() => {
    if (isOnboardingOpen) h1Ref.current?.focus();
  }, [paso, isOnboardingOpen]);

  if (!isOnboardingOpen) return null;

  const pasos = soloRepaso ? [0, 5] : [0, 1, 2, 3, 4, 5];
  const actual = pasos[paso] ?? 0;
  const total = soloRepaso ? 1 : TOTAL;
  const avance = soloRepaso ? 1 : paso;

  const habito = elegido === PROPIO ? { nombre: propio.trim(), icono: 'Sparkles' } : elegido !== null ? HABITOS[elegido] : null;
  const habitoListo = !!habito && habito.nombre.length > 0;

  const seguir = () => { setAviso(false); setPaso(p => Math.min(p + 1, pasos.length - 1)); };
  const atras = () => setPaso(p => Math.max(p - 1, 0));

  const terminar = () => {
    if (terminando.current) return;
    terminando.current = true;
    if (!soloRepaso) {
      if (nombre.trim()) setNombre(nombre.trim());
      if (habito && habitoListo) {
        crearHabito({
          nombre: habito.nombre,
          icono: habito.icono,
          color: '#FFB547', // crearHabito lo cambia por el color del momento
          momento,
          frecuencia: 'diario',
          tipo: 'positivo',
          anclaje: ancla.trim() || undefined,
          reto: aceptaReto ? { meta: 30, inicio: getTodayString() } : undefined,
        });
      }
    }
    completeOnboarding();
    setActiveTab('hoy');
  };

  const titulo = (texto: string, clase = 'cond obh') => (
    <h1 className={clase} ref={h1Ref} tabIndex={-1} style={{ outline: 'none' }}>{texto}</h1>
  );

  let cuerpo: React.ReactNode = null;
  let pie: React.ReactNode = null;

  if (actual === 0) {
    cuerpo = (
      <div className="obwelcome">
        <div className="obhero" aria-hidden="true"><Llama etapa={1} size={210} sola /></div>
        {titulo('Que no se apague lo que empiezas', 'cond obtitle')}
        <p className="oblead">Un hábito, amarrado a algo que ya haces. Si fallas un día, no pierdes nada: lo que cuenta es volver.</p>
        <p className="sub obcap">Esta es Chispa, tu llama. Crece cada vez que cumples.</p>
      </div>
    );
    pie = <button className="btnp full" style={{ margin: 0 }} onClick={seguir}>Empezar</button>;
  }

  if (actual === 1) {
    cuerpo = (
      <form id="ob-nombre" className="obbody" onSubmit={(e) => { e.preventDefault(); seguir(); }}>
        {titulo('¿Cómo te llamas?')}
        <p className="sub obsub">Para saludarte cada día en Hoy.</p>
        <label className="lbl" htmlFor="ob-nm" style={{ display: 'block', marginTop: '22px' }}>Tu nombre</label>
        <input
          id="ob-nm"
          className="input"
          type="text"
          value={nombre}
          onChange={(e) => setNombreInput(e.target.value)}
          autoComplete="given-name"
          autoCapitalize="words"
          enterKeyHint="next"
          maxLength={24}
        />
      </form>
    );
    pie = (
      <>
        <button type="submit" form="ob-nombre" className="btnp full" style={{ margin: 0 }}>Seguir</button>
        <button className="link quiet center" onClick={() => { setNombreInput(''); seguir(); }}>Prefiero no decirlo</button>
      </>
    );
  }

  if (actual === 2) {
    cuerpo = (
      <div className="obbody">
        {titulo('¿Con qué hábito empiezas?')}
        <p className="sub obsub">Uno solo. Cuando lo tengas, sumas más.</p>
        <fieldset className="hopts">
          <legend className="sr-only">Tu primer hábito</legend>
          {HABITOS.map((h, i) => (
            <label key={h.nombre} className={`hopt${elegido === i ? ' on' : ''}`}>
              <input type="radio" name="ob-habito" className="sr-only" checked={elegido === i} onChange={() => setElegido(i)} />
              <span className="hopti" aria-hidden="true"><HabitIcon name={h.icono} size={19} /></span>
              <span className="hoptn">{h.nombre}</span>
              <span className="rdot" aria-hidden="true" />
            </label>
          ))}
          <label className={`hopt mine${elegido === PROPIO ? ' on' : ''}`}>
            <input type="radio" name="ob-habito" className="sr-only" checked={elegido === PROPIO} onChange={() => setElegido(PROPIO)} />
            <span className="hopti" aria-hidden="true"><HabitIcon name="PenLine" size={18} /></span>
            <span className="hoptn">Escribir el mío</span>
            <span className="rdot" aria-hidden="true" />
          </label>
        </fieldset>
        {elegido === PROPIO && (
          <>
            <label className="lbl" htmlFor="ob-propio" style={{ display: 'block', margin: '14px 0 8px' }}>Tu hábito</label>
            <input id="ob-propio" className="input" type="text" value={propio} onChange={(e) => setPropio(e.target.value)} maxLength={40} autoFocus />
            <p className="sub" style={{ marginTop: '8px' }}>Mejor si es pequeño: algo que puedas hacer hasta en un mal día.</p>
          </>
        )}
      </div>
    );
    pie = (
      <>
        {aviso && !habitoListo && <p className="sub" role="status" style={{ margin: '0 0 6px', textAlign: 'center' }}>Elige uno para seguir.</p>}
        <button
          className={`btnp full${habitoListo ? '' : ' off'}`}
          style={{ margin: 0 }}
          aria-disabled={!habitoListo}
          onClick={() => (habitoListo ? seguir() : setAviso(true))}
        >
          Seguir
        </button>
      </>
    );
  }

  if (actual === 3 && habito) {
    cuerpo = (
      <div className="obbody">
        {titulo('Amárralo a algo que ya haces')}
        <p className="sub obsub">Así tu propio día te lo recuerda.</p>
        <div className="obhab"><span className="hopti" aria-hidden="true"><HabitIcon name={habito.icono} size={18} /></span>{habito.nombre}</div>
        <div className="field">
          <p className="lbl" id="ob-lbl-ancla">¿Después de qué? <span className="opt">opcional</span></p>
          <div className="input anchor">
            <span className="pre" aria-hidden="true">Después de</span>
            <input type="text" aria-labelledby="ob-lbl-ancla" value={ancla} onChange={(e) => setAncla(e.target.value)} placeholder="algo que ya haces" maxLength={40} />
          </div>
          <div className="sugs">
            {SUGERENCIAS.map(s => (
              <button key={s} type="button" className={`chip sm${ancla === s ? ' on' : ''}`} aria-pressed={ancla === s} onClick={() => setAncla(s)}>{s}</button>
            ))}
          </div>
        </div>
        <fieldset style={{ border: 'none', margin: '18px 0 0', padding: 0 }}>
          <legend className="lbl" style={{ padding: 0 }}>Momento del día</legend>
          <div className="moms">
            {MOMENTOS.map(({ id, label, Icon, color }) => (
              <label key={id} className={`mom${momento === id ? ' on' : ''}`}>
                <input type="radio" name="ob-momento" className="sr-only" checked={momento === id} onChange={() => setMomento(id)} />
                <span style={{ color, display: 'flex' }} aria-hidden="true"><Icon size={18} /></span>
                <span>{label}</span>
              </label>
            ))}
          </div>
        </fieldset>
      </div>
    );
    pie = <button className="btnp full" style={{ margin: 0 }} onClick={seguir}>Seguir</button>;
  }

  if (actual === 4 && habito) {
    cuerpo = (
      <div className="obbody">
        {titulo('¿Vas por 30 días cumplidos?')}
        <p className="sub obsub">Marca {habito.nombre} 30 veces, sin fecha límite. No tienen que ser seguidas: si fallas un día, no pierdes lo que llevas.</p>
        <div className="card obprize">
          <p className="lbl" style={{ margin: '0 0 10px' }}>Al cumplirlo ganas</p>
          <ul className="obplist">
            <li><span className="cond obpn">+300</span> puntos</li>
            <li><span className="obpi" aria-hidden="true"><ShieldCheck size={16} /></span>1 comodín</li>
            <li><span className="obpi" aria-hidden="true"><Medal size={16} /></span>la insignia Retos 30</li>
            <li><span className="obpi" aria-hidden="true"><Gift size={16} /></span>1 caja sorpresa</li>
          </ul>
        </div>
      </div>
    );
    pie = (
      <>
        <button className="btnp full" style={{ margin: 0 }} onClick={() => { setAceptaReto(true); seguir(); }}>Voy por 30 días</button>
        <button className="link quiet center" onClick={() => { setAceptaReto(false); seguir(); }}>Ahora no</button>
      </>
    );
  }

  if (actual === 5) {
    cuerpo = (
      <div className="obbody">
        {titulo('Así funciona Racha')}
        <ul className="obidea">
          <li>
            <span className="obic" aria-hidden="true"><Llama etapa={1} size={34} sola /></span>
            <span><b>Cumples y tu llama crece</b><span className="sub">Cada hábito suma 10 puntos. Al subir de nivel, Chispa cambia.</span></span>
          </li>
          <li>
            <span className="obic shield" aria-hidden="true"><ShieldCheck size={20} /></span>
            <span><b>Si fallas un día, no pierdes nada</b><span className="sub">Tienes comodines para congelar un día que no pudiste. Y el día que vuelves, todo vale el doble.</span></span>
          </li>
          <li>
            <span className="obic gift" aria-hidden="true"><Gift size={20} /></span>
            <span><b>Los retos traen premios</b><span className="sub">Cajas sorpresa, insignias y llamas nuevas para tu colección.</span></span>
          </li>
        </ul>
      </div>
    );
    pie = <button className="btnp full" style={{ margin: 0 }} onClick={terminar}>Ir a mi día</button>;
  }

  return (
    <div className="onb fixed inset-0 z-[70] bg-bg flex flex-col h-dvh" role="dialog" aria-modal="true" aria-label="Bienvenida a Racha">
      {actual > 0 && (
        <div className="obtop">
          <button className="obback" onClick={atras} aria-label="Atrás"><ChevronLeft size={22} strokeWidth={2.2} /></button>
          <div className="obprog" role="progressbar" aria-label="Avance" aria-valuemin={1} aria-valuemax={total} aria-valuenow={avance} aria-valuetext={`Paso ${avance} de ${total}`}>
            {Array.from({ length: total }, (_, i) => <i key={i} className={i < avance ? 'on' : ''} />)}
          </div>
        </div>
      )}
      <div className="flex-1 overflow-y-auto">{cuerpo}</div>
      <div className="obfoot">{pie}</div>
    </div>
  );
};
