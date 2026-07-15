import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, AlertCircle } from 'lucide-react';
import { calculateUserBadges } from '../utils/badgeHelper';

const MOODS = [
  { val: 'excelente', emoji: '🚀', label: 'Excelente' },
  { val: 'bien',      emoji: '😊', label: 'Bien'      },
  { val: 'regular',   emoji: '😐', label: 'Regular'   },
  { val: 'cansado',   emoji: '🥱', label: 'Cansado'   },
  { val: 'frustrado', emoji: '😫', label: 'Frustrado' },
];

const Bitacora = () => {
  const navigate = useNavigate();
  const [fecha, setFecha]             = useState('');
  const [hechoHoy, setHechoHoy]       = useState('');
  const [hacerManana, setHacerManana] = useState('');
  const [mood, setMood]               = useState('bien');
  const [needsHelp, setNeedsHelp]     = useState(false);
  const [helpDesc, setHelpDesc]       = useState('');
  const [labelManana, setLabelManana] = useState('¿Qué haré mañana?');
  const [toast, setToast]             = useState(null); // { type, msg }

  useEffect(() => { setupDateInput(); }, []);

  const formatDate = (date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  const setupDateInput = () => {
    const today = new Date();
    const dow = today.getDay();
    if (dow === 0) today.setDate(today.getDate() + 1);
    if (dow === 6) today.setDate(today.getDate() + 2);
    setFecha(formatDate(today));
    checkFriday(today);
  };

  const checkFriday = (d) => {
    setLabelManana(d.getDay() === 5 ? '¿Qué haré el lunes? (próximo día hábil)' : '¿Qué haré mañana?');
  };

  const handleDateChange = (e) => {
    const val = e.target.value;
    setFecha(val);
    if (!val) return;
    const [y, m, d] = val.split('-');
    const dateObj = new Date(y, m - 1, d);
    const dow = dateObj.getDay();
    if (dow === 0 || dow === 6) {
      showToast('error', 'Las prácticas son de Lunes a Viernes.');
      setupDateInput();
      return;
    }
    checkFriday(dateObj);
  };

  const showToast = (type, msg) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3500);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const [y, m, d] = fecha.split('-');
    const dow = new Date(y, m - 1, d).getDay();
    if (dow === 0 || dow === 6) { showToast('error', 'No puedes guardar un registro de fin de semana.'); return; }

    const userName = localStorage.getItem('practicante_user') || 'Desconocido';
    const userEmail = localStorage.getItem('practicante_email') || '';

    // Write both user and practicante keys to ensure absolute database schema compatibility
    const newEntry = {
      id: Date.now().toString(),
      user: userName,
      practicante: userName,
      fecha, hechoHoy, hacerManana, mood,
      ayuda: needsHelp,
      ayudaDesc: needsHelp ? helpDesc : '',
      timestamp: new Date().toISOString(),
    };

    const stored = JSON.parse(localStorage.getItem('practicantes_bitacoras') || '[]');
    stored.unshift(newEntry);
    localStorage.setItem('practicantes_bitacoras', JSON.stringify(stored));

    // Send data to real MySQL Backend
    fetch('https://kreative-vit.alphadocere.cl/api/saveLog.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: userEmail,
        user: userName,
        fecha: fecha,
        hechoHoy: hechoHoy,
        hacerManana: hacerManana,
        mood: mood,
        ayuda: needsHelp,
        ayudaDesc: needsHelp ? helpDesc : '',
        palabrasCount: (hechoHoy + " " + hacerManana).trim().split(/\s+/).length
      })
    }).then(res => res.json())
    .then(data => {
      if (!data.success) {
        alert("ERROR DEL SERVIDOR AL GUARDAR: " + data.error);
      }
    })
    .catch(err => alert("Error de conexión con MySQL: " + err));

    // Recalculate user's badges dynamically and sync fellows list immediately
    const myGen = localStorage.getItem('practicante_generation') || '17';
    const myStatus = localStorage.getItem('practicante_status') || '¡Registrando bitácoras en Kreative Vit! 💻';
    const earnedBadges = calculateUserBadges(userName, myGen, stored);

    const storedFellows = localStorage.getItem('practicantes_fellows');
    let fellows = storedFellows ? JSON.parse(storedFellows) : [];
    const existingIdx = fellows.findIndex(f => f.username === userName);
    const updatedFellow = {
      username: userName,
      generation: parseInt(myGen),
      status: myStatus,
      badges: earnedBadges
    };

    if (existingIdx !== -1) {
      fellows[existingIdx] = updatedFellow;
    } else {
      fellows.push(updatedFellow);
    }
    localStorage.setItem('practicantes_fellows', JSON.stringify(fellows));

    // Si el estado de ánimo es negativo o necesita ayuda, enviar alerta silenciosa al backend
    const isCritical = mood === 'frustrado' || mood === 'cansado' || needsHelp;
    
    if (isCritical) {
      fetch('https://kreative-vit.alphadocere.cl/api/send_alert.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user: userName,
          email: userEmail,
          mood: mood,
          needsHelp: needsHelp,
          helpDesc: needsHelp ? helpDesc : '',
          fecha: fecha,
          hechoHoy: hechoHoy,
          hacerManana: hacerManana
        })
      }).then(res => res.json())
      .then(data => {
        if (data.sent) {
          showToast('success', '✅ Alerta enviada a los administradores. Pronto se pondrán en contacto contigo.');
        }
      })
      .catch(err => console.error("Error al enviar alerta emocional:", err));
    }

    // Mensaje estándar para mantener la privacidad
    let successMessage = '¡Bitácora guardada exitosamente!';
    showToast('success', successMessage);
    
    setHechoHoy(''); setHacerManana(''); setMood('bien');
    setNeedsHelp(false); setHelpDesc('');
    setupDateInput();

    // Redirect user to home to celebrate any unlocked badges immediately!
    setTimeout(() => {
      navigate('/dashboard');
    }, 2500);
  };

  return (
    <div className="bita-wrapper">
      {/* Header card */}
      <div className="bita-header-card animate-fade-up">
        <div>
          <h2 className="bita-title">Registro Diario</h2>
          <p className="bita-subtitle">Anota tus avances y planifica tu próximo día de prácticas.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Date */}
        <div className="bita-card animate-fade-up delay-100">
          <div className="bita-card-label">📅 Fecha del Registro</div>
          <div className="input-group" style={{ marginBottom: 0 }}>
            <input type="date" value={fecha} onChange={handleDateChange} required />
            <small className="helper-text">Solo Lunes a Viernes.</small>
          </div>
        </div>

        {/* What I did */}
        <div className="bita-card animate-fade-up delay-200">
          <div className="bita-card-label">✅ ¿Qué hice hoy?</div>
          <div className="input-group" style={{ marginBottom: 0 }}>
            <textarea rows="4" placeholder="Describe brevemente tus tareas y logros del día..." value={hechoHoy} onChange={(e) => setHechoHoy(e.target.value)} required />
          </div>
        </div>

        {/* What I'll do */}
        <div className="bita-card animate-fade-up delay-300">
          <div className="bita-card-label">🗓️ {labelManana}</div>
          <div className="input-group" style={{ marginBottom: 0 }}>
            <textarea rows="3" placeholder="Planifica tus próximas tareas..." value={hacerManana} onChange={(e) => setHacerManana(e.target.value)} required />
          </div>
        </div>

        {/* Emotion mood button set */}
        <div className="bita-card animate-fade-up delay-75">
          <div className="bita-card-label">🎭 Estado de Ánimo</div>
          <div className="mood-grid">
            {MOODS.map(m => (
              <button 
                type="button" 
                key={m.val} 
                onClick={() => setMood(m.val)}
                className={`mood-btn ${mood === m.val ? 'selected' : ''}`}
              >
                <span className="mood-emoji">{m.emoji}</span>
                <span className="mood-label">{m.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Technical Help toggle */}
        <div className="bita-card animate-fade-up delay-150">
          <div className="help-toggle-row">
            <button 
              type="button" 
              onClick={() => setNeedsHelp(!needsHelp)}
              className={`help-toggle ${needsHelp ? 'active' : ''}`}
            >
              <div className="help-toggle-dot"></div>
            </button>
            <span className="help-status-text" style={{ color: needsHelp ? 'var(--danger)' : 'var(--text-muted)' }}>
              {needsHelp ? '⚠️ Necesito ayuda técnica hoy' : 'No necesito ayuda técnica'}
            </span>
          </div>

          {needsHelp && (
            <div className="help-expand">
              <div className="input-group" style={{ marginBottom: 0 }}>
                <label style={{ fontSize: '0.8rem' }}>¿En qué necesitas apoyo? (Describe el bug o bloqueo)</label>
                <textarea rows="2" placeholder="Detalla tu problema..." value={helpDesc} onChange={(e) => setHelpDesc(e.target.value)} required={needsHelp} />
              </div>
            </div>
          )}
        </div>

        <button type="submit" className="btn-primary bita-submit animate-fade-up delay-200">
          Guardar Bitácora
        </button>
      </form>

      {/* Toast */}
      {toast && (
        <div className={`bita-toast ${toast.type}`}>
          {toast.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          {toast.msg}
        </div>
      )}

      <style>{`
        .bita-wrapper { padding: 20px 24px; max-width: 760px; margin: 0 auto; }

        .bita-header-card {
          display: flex; align-items: center; justify-content: space-between;
          margin-bottom: 20px;
        }
        .bita-title    { font-family: var(--font-display); font-size: 1.5rem; font-weight: 700; color: var(--text-main); }
        .bita-subtitle { font-size: 0.88rem; color: var(--text-muted); margin-top: 4px; }

        .bita-card {
          background: var(--bg-card); border: 1px solid var(--border);
          border-radius: var(--radius); padding: 20px 22px;
          margin-bottom: 14px; box-shadow: var(--shadow-sm);
          transition: border-color var(--transition), box-shadow var(--transition);
        }
        .bita-card:hover { border-color: rgba(61,170,88,0.3); box-shadow: var(--shadow-md); }

        .bita-card-label {
          font-size: 0.82rem; font-weight: 700; color: var(--text-muted);
          text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 12px;
        }

        /* Mood */
        .mood-grid { display: flex; gap: 10px; }
        .mood-btn {
          flex: 1; display: flex; flex-direction: column; align-items: center;
          gap: 6px; padding: 14px 8px; border-radius: var(--radius-sm);
          background: var(--bg-input); border: 1.5px solid var(--border);
          cursor: pointer; transition: all var(--transition);
        }
        .mood-btn:hover { border-color: var(--primary); transform: translateY(-3px); }
        .mood-btn.selected {
          border-color: var(--primary); background: var(--primary-light);
          transform: translateY(-5px); box-shadow: var(--shadow-green);
        }
        .mood-emoji { font-size: 1.7rem; }
        .mood-label { font-size: 0.75rem; font-weight: 600; color: var(--text-muted); }
        .mood-btn.selected .mood-label { color: var(--primary); }

        /* Help toggle */
        .help-toggle-row { display: flex; align-items: center; gap: 14px; margin-bottom: 0; }
        .help-toggle {
          width: 46px; height: 26px; border-radius: 99px; border: none;
          background: var(--border); cursor: pointer; position: relative;
          transition: background var(--transition);
        }
        .help-toggle.active { background: var(--danger); }
        .help-toggle-dot {
          position: absolute; top: 3px; left: 3px;
          width: 20px; height: 20px; border-radius: 50%; background: #fff;
          transition: left var(--transition); box-shadow: 0 1px 4px rgba(0,0,0,0.2);
        }
        .help-toggle.active .help-toggle-dot { left: 23px; }
        .help-status-text { font-size: 0.9rem; font-weight: 500; transition: color var(--transition); }

        .help-expand {
          margin-top: 14px; animation: slideDown 0.3s ease both;
          border-top: 1px solid var(--border); padding-top: 14px;
        }

        .bita-submit { margin-top: 8px; border-radius: var(--radius-sm); min-height: 50px; font-size: 1rem; }

        /* Toast */
        .bita-toast {
          position: fixed; bottom: 28px; right: 28px; z-index: 9999;
          display: flex; align-items: center; gap: 10px;
          padding: 14px 22px; border-radius: var(--radius);
          font-size: 0.92rem; font-weight: 600; box-shadow: var(--shadow-lg);
          animation: fadeInUp 0.3s ease both;
          max-width: 340px;
        }
        .bita-toast.success { background: var(--primary); color: #fff; }
        .bita-toast.error   { background: var(--danger);  color: #fff; }
      `}</style>
    </div>
  );
};

export default Bitacora;
