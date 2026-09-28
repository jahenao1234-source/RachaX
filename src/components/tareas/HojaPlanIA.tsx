import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Copy, Check, X } from 'lucide-react';
import { useEsEscritorio } from '../screens/TodayScreen';

interface HojaPlanIAProps {
  nombre: string;
  onCerrar: () => void;
}

export const HojaPlanIA: React.FC<HojaPlanIAProps> = ({ nombre, onCerrar }) => {
  const desk = useEsEscritorio();
  const [copiado, setCopiado] = useState(false);
  const [fallo, setFallo] = useState(false);
  const instrRef = useRef<HTMLParagraphElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (btnRef.current) btnRef.current.focus();
    const esc = (e: KeyboardEvent) => { if (e.key === 'Escape') onCerrar(); };
    document.addEventListener('keydown', esc);
    return () => document.removeEventListener('keydown', esc);
  }, [onCerrar]);

  const meta = nombre.trim() || '[escribe aquí tu meta]';
  const instruccion = `Divide mi meta “${meta}” en pasos pequeños y concretos. Numéralos así: 1, 1.1, 1.2, 2, 2.1… Máximo 6 pasos principales. Responde solo con la lista, sin introducción.`;

  const copiar = async () => {
    try {
      await navigator.clipboard.writeText(instruccion);
      setCopiado(true);
      setFallo(false);
    } catch (err) {
      setFallo(true);
      if (instrRef.current) {
        window.getSelection()?.selectAllChildren(instrRef.current);
      }
    }
  };

  const contenido = (
    <>
      <div className="tsheet-h">
        <div style={{ flex: 1 }}>
          <h2 className="font-heading font-bold m-0" style={{ fontSize: 24, lineHeight: 1.05 }}>Pídele el plan a una IA</h2>
          <p className="sub" style={{ marginTop: 2 }}>ChatGPT, Gemini o la que uses.</p>
        </div>
        <button type="button" className="closeb" aria-label="Cerrar" onClick={onCerrar}>
          <X size={20} strokeWidth={2.4} />
        </button>
      </div>

      <ol className="t5pasos">
        <li>
          <span className="t5n num" aria-hidden="true">1</span>
          <span>Copia esta instrucción.</span>
        </li>
        <li>
          <span className="t5n num" aria-hidden="true">2</span>
          <span>Pégala en el chat de la IA.</span>
        </li>
        <li>
          <span className="t5n num" aria-hidden="true">3</span>
          <span>Copia la respuesta y pégala aquí, en los pasos.</span>
        </li>
      </ol>

      <p className="t5instr" ref={instrRef}>{instruccion}</p>

      {copiado ? (
        <>
          <button className="btnp full t5ok" aria-live="polite">
            <Check size={18} strokeWidth={2.6} />Instrucción copiada
          </button>
          <p className="t5nota">Ahora ve a la IA y pégala.</p>
        </>
      ) : (
        <button ref={btnRef} className="btnp full" onClick={copiar}>
          {fallo ? 'Cópiala tú: ya está seleccionada' : <><Copy size={18} />Copiar instrucción</>}
        </button>
      )}
    </>
  );

  return createPortal(
    <div className="tareas">
      <div className="tscrim" onClick={onCerrar} />
      {desk ? (
        <section className="t4dlg" role="dialog" aria-modal="true" aria-label="Pídele el plan a una IA">
          {contenido}
        </section>
      ) : (
        <section className="tsheet" role="dialog" aria-modal="true" aria-label="Pídele el plan a una IA">
          <div className="tgrab" />
          {contenido}
        </section>
      )}
    </div>,
    document.body
  );
};
