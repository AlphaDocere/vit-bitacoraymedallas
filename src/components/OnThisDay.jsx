import React, { useEffect, useState } from 'react';
import { CalendarDays, RefreshCw, ExternalLink, Sparkles } from 'lucide-react';

/* ── Palabras clave para INCLUIR (tech/ciencia/innovación) ── */
const TECH_KEYWORDS = [
  'internet', 'computador', 'software', 'hardware', 'programa', 'código', 'tecnología',
  'informática', 'digital', 'red', 'sistema', 'linux', 'windows', 'apple', 'microsoft',
  'google', 'ibm', 'intel', 'web', 'html', 'robot', 'inteligencia', 'satélite', 'cohete',
  'nasa', 'ordenador', 'microchip', 'transistor', 'algoritmo', 'datos', 'móvil',
  'telecomunicaciones', 'electrónica', 'electricidad', 'científico', 'invento', 'patente',
  'universidad', 'ciencia', 'matemáticas', 'física', 'astronauta', 'espacio', 'lanzamiento',
  'descubrimiento', 'laboratorio', 'investigación', 'innovación', 'fundó', 'creó', 'inauguró',
  'primera vez', 'primer', 'primera', 'mundo', 'récord', 'proyecto', 'empresa', 'compañía',
];

/* ── Palabras para EXCLUIR (violencia, tragedias, crímenes) ── */
const NEGATIVE_KEYWORDS = [
  'asesinato', 'asesinó', 'asesino', 'mató', 'muerte', 'muertos', 'murió', 'masacre',
  'guerra', 'bomba', 'ataque', 'atentado', 'explosión', 'incendio', 'accidente',
  'víctimas', 'víctima', 'terrorismo', 'terrorista', 'ejecución', 'ejecutado',
  'golpe de estado', 'golpe', 'invasión', 'crimen', 'criminal', 'violencia',
  'secuestro', 'desaparecido', 'hundimiento', 'naufragio', 'catástrofe', 'tragedia',
  'heridos', 'derrumbe', 'tsunami', 'terremoto', 'inundación', 'huracán',
  'genocidio', 'holocausto', 'tortura', 'prisionero', 'campo de concentración',
  'derrota', 'rendición', 'rehenes', 'suicidio', 'linchamiento',
];

const DIAS_ES   = ['domingo','lunes','martes','miércoles','jueves','viernes','sábado'];
const MESES_ES  = ['','enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];

/* ── Frases de respaldo si la API falla ── */
const FRASES_FALLBACK = [
  { content: "El mejor código es el que resuelve problemas reales.", author: "Comunidad Dev" },
  { content: "Aprender a programar es aprender a pensar de forma creativa.", author: "Steve Jobs" },
  { content: "No necesitas ser experto para empezar, necesitas empezar para ser experto.", author: "Proverbio Dev" },
  { content: "La tecnología es mejor cuando une a las personas.", author: "Matt Mullenweg" },
  { content: "Cada bug que corriges es una lección que llevas contigo para siempre.", author: "Comunidad Dev" },
];

const isPositiveEvent = (text = '') => {
  const lower = text.toLowerCase();
  return !NEGATIVE_KEYWORDS.some(kw => lower.includes(kw));
};

const isTechEvent = (text = '') => {
  const lower = text.toLowerCase();
  return TECH_KEYWORDS.some(kw => lower.includes(kw));
};

const OnThisDay = () => {
  const [events, setEvents]   = useState([]);
  const [quote, setQuote]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(false);

  const today = new Date();
  const month = today.getMonth() + 1;
  const day   = today.getDate();
  const diaNombre = DIAS_ES[today.getDay()];

  /* ── Traducir texto EN → ES con MyMemory API (gratis, sin clave) ── */
  const translateToSpanish = async (text) => {
    try {
      const res = await fetch(
        `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|es`
      );
      if (!res.ok) throw new Error();
      const data = await res.json();
      return data.responseData?.translatedText || text;
    } catch {
      return text; // Si falla, mostrar en inglés
    }
  };

  /* ── Fetch quote from Quotable API + traducir al español ── */
  const fetchQuote = async () => {
    try {
      const res = await fetch(
        'https://api.quotable.io/quotes/random?tags=technology|inspirational|success|motivational&limit=1'
      );
      if (!res.ok) throw new Error();
      const data = await res.json();
      const q = data[0];
      const textoES = await translateToSpanish(q.content);
      setQuote({ content: textoES, author: q.author });
    } catch {
      /* Fallback aleatorio si la API falla */
      const idx = Math.floor(Math.random() * FRASES_FALLBACK.length);
      setQuote(FRASES_FALLBACK[idx]);
    }
  };

  /* ── Fetch events from Wikipedia ES ── */
  const fetchEvents = async () => {
    setLoading(true);
    setError(false);
    try {
      const res = await fetch(
        `https://es.wikipedia.org/api/rest_v1/feed/onthisday/events/${month}/${day}`,
        { headers: { Accept: 'application/json' } }
      );
      if (!res.ok) throw new Error();
      const data = await res.json();
      const all = (data.events || []);

      /* 1. Filtrar negativos */
      const positives = all.filter(e => isPositiveEvent(e.text));

      /* 2. Priorizar tech; completar con positivos generales */
      const tech    = positives.filter(e => isTechEvent(e.text));
      const general = positives.filter(e => !isTechEvent(e.text));
      const merged  = [...tech, ...general].slice(0, 5);

      setEvents(merged);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    fetchQuote();
    fetchEvents();
  };

  useEffect(() => {
    fetchQuote();
    fetchEvents();
  }, []);

  return (
    <div className="otd-widget glass-panel">
      {/* ─── Header ─── */}
      <div className="otd-header">
        <div className="otd-title-wrap">
          <CalendarDays size={17} style={{ color: 'var(--primary)', flexShrink: 0 }} />
          <div>
            <h3 className="otd-title">En este día</h3>
            <p className="otd-date" style={{ textTransform: 'capitalize' }}>
              {diaNombre}, {day} de {MESES_ES[month]}
            </p>
          </div>
        </div>
        <button className="otd-refresh" onClick={handleRefresh} disabled={loading} title="Refrescar">
          <RefreshCw size={14} className={loading ? 'spin' : ''} />
        </button>
      </div>

      {/* ─── Frase del día (API Quotable) ─── */}
      {quote && (
        <div className="otd-quote">
          <Sparkles size={14} className="otd-quote-icon" />
          <div>
            <p className="otd-quote-text">"{quote.content}"</p>
            <span className="otd-quote-autor">— {quote.author}</span>
          </div>
        </div>
      )}

      {/* ─── Label sección eventos ─── */}
      <div className="otd-section-label">📡 Sucesos positivos e históricos</div>

      {/* ─── Eventos ─── */}
      <div className="otd-body">
        {loading && (
          <>
            <div className="otd-skeleton" />
            <div className="otd-skeleton" />
            <div className="otd-skeleton short" />
          </>
        )}

        {error && !loading && (
          <div className="otd-error">
            <p>No se pudo cargar la información.</p>
            <button className="btn-secondary" style={{ marginTop: 10, fontSize: '0.82rem' }} onClick={fetchEvents}>
              Reintentar
            </button>
          </div>
        )}

        {!loading && !error && events.length === 0 && (
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', textAlign: 'center', padding: '20px 0' }}>
            No se encontraron eventos positivos para hoy.
          </p>
        )}

        {!loading && !error && events.map((ev, i) => (
          <div key={i} className="otd-event">
            <span className="otd-year">
              {diaNombre.charAt(0).toUpperCase() + diaNombre.slice(1)}, {day} de {MESES_ES[month]} de {ev.year}
            </span>
            <p className="otd-text">{ev.text}</p>
            {ev.pages?.[0]?.content_urls?.desktop?.page && (
              <a
                href={ev.pages[0].content_urls.desktop.page}
                target="_blank"
                rel="noopener noreferrer"
                className="otd-link"
              >
                Saber más <ExternalLink size={11} />
              </a>
            )}
          </div>
        ))}
      </div>

      {/* ─── Footer ─── */}
      {!loading && !error && (
        <div className="otd-footer">Datos vía Wikipedia en Español · Frases via Quotable</div>
      )}

      <style>{`
        .otd-widget {
          position: sticky; top: 90px;
          display: flex; flex-direction: column;
          border-radius: var(--radius); overflow: hidden;
          max-height: calc(100vh - 100px);
        }
        .otd-header {
          display: flex; align-items: center; justify-content: space-between;
          padding: 14px 16px; border-bottom: 1px solid var(--border); flex-shrink: 0;
        }
        .otd-title-wrap { display: flex; align-items: center; gap: 9px; }
        .otd-title { font-size: 0.9rem; font-weight: 700; color: var(--text-main); }
        .otd-date  { font-size: 0.72rem; color: var(--text-subtle); margin-top: 1px; }
        .otd-refresh {
          background: none; border: 1px solid var(--border); border-radius: 7px;
          color: var(--text-muted); cursor: pointer; padding: 5px;
          display: flex; align-items: center; transition: all var(--transition);
        }
        .otd-refresh:hover:not(:disabled) { border-color: var(--primary); color: var(--primary); }
        .otd-refresh:disabled { opacity: 0.4; cursor: default; }
        .spin { animation: spinAnim 0.8s linear infinite; }
        @keyframes spinAnim { to { transform: rotate(360deg); } }

        .otd-quote {
          display: flex; gap: 10px; align-items: flex-start;
          padding: 12px 16px; background: var(--primary-light);
          border-bottom: 1px solid var(--border); flex-shrink: 0;
        }
        .otd-quote-icon { color: var(--primary); flex-shrink: 0; margin-top: 3px; }
        .otd-quote-text { font-size: 0.8rem; color: var(--text-main); line-height: 1.5; font-style: italic; }
        .otd-quote-autor { font-size: 0.72rem; color: var(--primary); font-weight: 600; margin-top: 4px; display: block; }

        .otd-section-label {
          padding: 8px 16px; font-size: 0.7rem; font-weight: 700;
          text-transform: uppercase; letter-spacing: 0.5px;
          color: var(--text-subtle); border-bottom: 1px solid var(--border); flex-shrink: 0;
        }

        .otd-body {
          flex: 1; overflow-y: auto; padding: 10px 14px;
          display: flex; flex-direction: column; gap: 10px;
        }

        .otd-event {
          padding: 10px 12px; border-radius: var(--radius-sm);
          background: var(--bg-card); border: 1px solid var(--border);
          display: flex; flex-direction: column; gap: 4px;
          transition: border-color var(--transition);
        }
        .otd-event:hover { border-color: var(--primary); }

        .otd-year {
          font-size: 0.68rem; font-weight: 700; letter-spacing: 0.3px;
          color: var(--primary); text-transform: capitalize;
        }
        .otd-text {
          font-size: 0.8rem; color: var(--text-main); line-height: 1.5;
          display: -webkit-box; -webkit-line-clamp: 3;
          -webkit-box-orient: vertical; overflow: hidden;
        }
        .otd-link {
          display: inline-flex; align-items: center; gap: 4px;
          font-size: 0.72rem; color: var(--primary); text-decoration: none;
          font-weight: 600; transition: opacity var(--transition);
        }
        .otd-link:hover { opacity: 0.75; }

        .otd-skeleton {
          height: 68px; border-radius: var(--radius-sm);
          background: linear-gradient(90deg, var(--border) 25%, var(--bg-card) 50%, var(--border) 75%);
          background-size: 200% 100%; animation: shimmer 1.4s infinite;
        }
        .otd-skeleton.short { height: 48px; }
        @keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }

        .otd-error { text-align: center; padding: 20px; color: var(--text-muted); font-size: 0.85rem; }
        .otd-footer {
          padding: 8px 16px; border-top: 1px solid var(--border);
          font-size: 0.68rem; color: var(--text-subtle); text-align: center; flex-shrink: 0;
        }
      `}</style>
    </div>
  );
};

export default OnThisDay;
