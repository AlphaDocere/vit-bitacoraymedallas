import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, AlertCircle, Award, Calendar, PenSquare, ArrowRight, TrendingUp, Sparkles } from 'lucide-react';
import { calculateUserBadges } from '../utils/badgeHelper';

const INSIGNIAS_MAP = {
  18: { title: 'El Creador', image: '/insignias/insignia creador.png', color: '#39ff14' },
  28: { title: 'Generación 17', image: '/insignias/Gen 17.png', color: '#00f0ff' },
  29: { title: 'Generación 18', image: '/insignias/Gen 18.png', color: '#00f0ff' },
  30: { title: 'Generación 19', image: '/insignias/Gen 19.png', color: '#a855f7' },
  31: { title: 'Generación 20', image: '/insignias/Gen 20.png', color: '#facc15' },
  32: { title: 'Generación 21', image: '/insignias/Gen 21.png', color: '#ec4899' },
  33: { title: 'Generación 22', image: '/insignias/Gen 22.png', color: '#ef4444' },
  34: { title: 'Generación 23', image: '/insignias/Gen 23.png', color: '#10b981' },
  35: { title: 'Generación 24', image: '/insignias/Gen 24.png', color: '#f97316' },
  36: { title: 'Generación 25', image: '/insignias/Gen 25.png', color: '#3b82f6' },
  37: { title: 'Generación 26', image: '/insignias/Gen 26.png', color: '#ec4899' },
  38: { title: 'Generación 27', image: '/insignias/Gen 27.png', color: '#14b8a6' },
  39: { title: 'Generación 28', image: '/insignias/Gen 28.png', color: '#6366f1' },
  40: { title: 'Generación 29', image: '/insignias/Gen 29.png', color: '#39ff14' },
  
  41: { title: 'Git Master', image: '/insignias/Git.png', color: '#f05032' },
  42: { title: 'cPanel Explorer', image: '/insignias/Cpanel.png', color: '#ff7600' },
  43: { title: 'Wiki Contribuidor', image: '/insignias/Primer aporte a la wiki.png', color: '#3b82f6' },
  44: { title: 'Voz Activa', image: '/insignias/podcast.png', color: '#ec4899' },
  45: { title: 'Matriz de Eisenhower', image: '/insignias/Matriz de eisenhower.png', color: '#328f49' },
  46: { title: 'Bug Hunter', image: '/insignias/Fix y bugs.png', color: '#ef4444' },
  47: { title: 'Líder Alpha Docere', image: '/insignias/Mauro rojas.png', color: '#facc15' },
  48: { title: 'Miembro de la Comunidad', image: '/insignias/Usuarios.png', color: '#a855f7' },

  1: { title: 'Mente Abierta', image: '/insignias/Mente abierta.png', color: '#facc15' },
  2: { title: 'Primer Impulso', image: '/insignias/primer impulso.png', color: '#f97316' },
  3: { title: 'Mente Ligera', image: '/insignias/Mente ligera.png', color: '#fbbf24' },
  4: { title: 'Semana Imparable', image: '/insignias/Semana imparable.png', color: '#ef4444' },
  5: { title: 'Cable a Tierra', image: '/insignias/Cable a tierra.png', color: '#3b82f6' },
  6: { title: 'Ritmo Constante', image: '/insignias/Ritmo Constante.png', color: '#6366f1' },
  7: { title: 'Zis-Zas Mental', image: '/insignias/Zis-Zas mental.png', color: '#ec4899' },
  8: { title: 'Hábitat de Calma', image: '/insignias/Habitad de calma.png', color: '#10b981' },
  9: { title: 'Mes Inquebrantable', image: '/insignias/Mes Inquebrantable.png', color: '#06b6d4' },
  10: { title: 'Paso a Paso', image: '/insignias/Paso a paso.png', color: '#8b5cf6' },
  11: { title: 'Flujo de Paz', image: '/insignias/Flujo de paz.png', color: '#14b8a6' },
  12: { title: 'Escudo de Papel', image: '/insignias/Escudo de papel.png', color: '#64748b' },
  13: { title: 'Mente de Acero', image: '/insignias/Mente de acero corazon de seda.png', color: '#94a3b8' },
  14: { title: 'Foco Claro', image: '/insignias/Fcoco Claro.png', color: '#d946ef' },
  15: { title: 'Faro en la Tormenta', image: '/insignias/Faro en la tormenta.png', color: '#f59e0b' },
  16: { title: 'Maestría Interior', image: '/insignias/Maestria interior.png', color: '#eab308' },
  17: { title: 'Zen Absoluto', image: '/insignias/Zen absoluto  olimpo vip.png', color: '#fbbf24' },
  19: { title: 'Bitácora Viva', image: '/insignias/vitacora viva.png', color: '#34d399' },
  20: { title: 'Mente en Movimiento', image: '/insignias/Mente en movimiento.png', color: '#3b82f6' },
  21: { title: 'Archivo Interior', image: '/insignias/Archivo Interior.png', color: '#a855f7' },
  22: { title: 'Noctámbulo Sereno', image: '/insignias/Noctambulo sereno.png', color: '#1e1b4b' },
  23: { title: 'Último Esfuerzo', image: '/insignias/Ultimo Esfuerzo.png', color: '#ef4444' },
  24: { title: 'Inicio Ligero', image: '/insignias/Inicio Lijero.png', color: '#facc15' },
  25: { title: 'Volver a Empezar', image: '/insignias/Volver a empezar.png', color: '#10b981' },
  26: { title: 'Sigue Adelante', image: '/insignias/Sigue adelante.png', color: '#3b82f6' },
};

// --- DYNAMIC GENERATION BADGE INJECTOR ---
const injectDynamicBadges = () => {
  const stored = localStorage.getItem('practicantes_fellows');
  if (stored) {
    try {
      const fellows = JSON.parse(stored);
      fellows.forEach(f => {
        const genNum = parseInt(f.generation);
        if (genNum >= 30 && genNum <= 58 && !INSIGNIAS_MAP[100 + genNum]) {
          INSIGNIAS_MAP[100 + genNum] = {
            title: `Generación ${genNum}`,
            image: `/insignias/Gen ${genNum}.png`,
            color: ['#00f0ff', '#a855f7', '#facc15', '#ec4899', '#ef4444', '#10b981', '#f97316', '#3b82f6', '#14b8a6', '#6366f1', '#39ff14'][genNum % 11],
            desc: `Insignia especial en honor a los integrantes de la Generación ${genNum}.`
          };
        } else if (genNum > 58 && !INSIGNIAS_MAP[200]) {
          INSIGNIAS_MAP[200] = {
            title: `Gen Forever`,
            image: `/insignias/Gen Forever.png`,
            color: '#00f0ff',
            desc: `Insignia perpetua en honor a las nuevas generaciones de Alpha Docere.`
          };
        }
      });
    } catch (e) {}
  }
  const myGen = localStorage.getItem('practicante_generation');
  if (myGen && parseInt(myGen) >= 30) {
    const genNum = parseInt(myGen);
    if (genNum <= 58 && !INSIGNIAS_MAP[100 + genNum]) {
      INSIGNIAS_MAP[100 + genNum] = {
        title: `Generación ${genNum}`,
        image: `/insignias/Gen ${genNum}.png`,
        color: ['#00f0ff', '#a855f7', '#facc15', '#ec4899', '#ef4444', '#10b981', '#f97316', '#3b82f6', '#14b8a6', '#6366f1', '#39ff14'][genNum % 11],
        desc: `Insignia especial en honor a los integrantes de la Generación ${genNum}.`
      };
    } else if (genNum > 58 && !INSIGNIAS_MAP[200]) {
      INSIGNIAS_MAP[200] = {
        title: `Gen Forever`,
        image: `/insignias/Gen Forever.png`,
        color: '#00f0ff',
        desc: `Insignia perpetua en honor a las nuevas generaciones de Alpha Docere.`
      };
    }
  }
};
injectDynamicBadges();
// ---------------------------------------

const DashboardHome = () => {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState('');
  const [userSubmittedToday, setUserSubmittedToday] = useState(false);
  const [fellows, setFellows] = useState([]);
  const [recentUnlocks, setRecentUnlocks] = useState([]);
  const [stats, setStats] = useState({ totalLogs: 0, unlockedBadges: 0 });
  const [userGen, setUserGen] = useState('17');
  const [teamStatus, setTeamStatus] = useState([]);

  useEffect(() => {
    const loadHomeData = () => {
      const user = localStorage.getItem('practicante_user');
      if (!user) {
        navigate('/login');
        return;
      }
      setCurrentUser(user);

      const myGen = localStorage.getItem('practicante_generation') || '17';
      setUserGen(myGen);

      // Check if user submitted a log today
      const bitacorasStored = localStorage.getItem('practicantes_bitacoras');
      const bitacoras = bitacorasStored ? JSON.parse(bitacorasStored) : [];
      
      const dateObj = new Date();
      const y = dateObj.getFullYear();
      const m = String(dateObj.getMonth() + 1).padStart(2, '0');
      const d = String(dateObj.getDate()).padStart(2, '0');
      const todayStr = `${y}-${m}-${d}`;
      
      const submitted = bitacoras.some(b => (b.practicante === user || b.user === user) && b.fecha === todayStr);
      setUserSubmittedToday(submitted);

      // Load fellows
      const storedFellows = localStorage.getItem('practicantes_fellows');
      let fellowsList = storedFellows ? JSON.parse(storedFellows) : [];
      setFellows(fellowsList);

      // Calculate current user's badges dynamically
      const myBadges = calculateUserBadges(user, myGen, bitacoras);

      // Calculate community stats (100% real-time and real data only!)
      const totalCommunityLogs = bitacoras.length;
      let badgeCount = myBadges.length;
      fellowsList.forEach(f => {
        if (f.username !== user && f.badges) {
          badgeCount += f.badges.length;
        }
      });

      setStats({
        totalLogs: totalCommunityLogs,
        unlockedBadges: badgeCount
      });

      // No faking recent unlocks anymore.
      setRecentUnlocks([]);

      // Filter fellows list to only show members belonging to the current user's generation cohort
      const otherFellowsOfGen = fellowsList.filter(f => f.username !== user && f.generation === parseInt(myGen));
      const activeTeamStatus = otherFellowsOfGen.map(f => {
        const completedToday = bitacoras.some(b => (b.practicante === f.username || b.user === f.username) && b.fecha === todayStr);
        const latestLog = bitacoras.find(b => b.practicante === f.username || b.user === f.username);
        
        const quote = completedToday
          ? (latestLog ? `Completó su bitácora: "${latestLog.hechoHoy.slice(0, 60)}..."` : '¡Completó su bitácora de hoy! 🚀')
          : `Pendiente: "${f.status}"`;

        return {
          username: f.username,
          completed: completedToday,
          quote: quote
        };
      });

      setTeamStatus(activeTeamStatus);
    };

    loadHomeData();

    // Listen to background sync updates
    window.addEventListener('storage', loadHomeData);
    return () => {
      window.removeEventListener('storage', loadHomeData);
    };
  }, [navigate]);

  // Map username visually
  const mappedDisplayName = currentUser === 'Jose Eliecer Rivera Perez' ? 'Joseph Joestar' : currentUser;

  return (
    <div className="dashboard-home animate-fade-up">
      {/* ── HEADER ── */}
      <div className="dh-welcome-header">
        <div>
          <h1>Hola, <span className="text-gradient">{mappedDisplayName}</span> 👋</h1>
          <p className="dh-subtitle">¡Bienvenido a tu panel de control de Kreative Vit! Aquí está el estado actual del equipo hoy.</p>
        </div>
        <div className="dh-date-badge">
          <Calendar size={16} />
          {new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
        </div>
      </div>

      {/* ── QUICK ACTION WIDGET (Tú) ── */}
      <div className={`dh-quick-banner glass-panel ${userSubmittedToday ? 'submitted-glow' : 'pending-glow'}`}>
        <div className="banner-content">
          <div className="banner-emoji">{userSubmittedToday ? '🎉' : '✍️'}</div>
          <div>
            <h3>{userSubmittedToday ? '¡Bitácora de hoy completada!' : '¡Aún no has registrado tu bitácora de hoy!'}</h3>
            <p>
              {userSubmittedToday 
                ? 'Excelente trabajo cuidando tu salud mental y tus compromisos hoy. ¡Tu racha sigue activa!' 
                : 'Tómate un par de minutos para vaciar tu mente, registrar tus tareas y cómo te sientes.'}
            </p>
          </div>
        </div>
        <button 
          onClick={() => navigate(userSubmittedToday ? '/dashboard/historial' : '/dashboard/bitacora')} 
          className={`banner-btn ${userSubmittedToday ? 'btn-submitted' : 'btn-primary'}`}
        >
          {userSubmittedToday ? 'Ver mi Historial' : 'Escribir Bitácora'}
          <ArrowRight size={18} />
        </button>
      </div>

      {/* ── STATS ROW ── */}
      <div className="dh-stats-grid">
        <div className="dh-stat-card glass-panel">
          <div className="stat-icon-wrap" style={{ background: 'rgba(61, 170, 88, 0.15)', color: 'var(--primary)' }}>
            <TrendingUp size={22} />
          </div>
          <div>
            <span className="stat-label">Bitácoras en la Comunidad</span>
            <h2 className="stat-val">{stats.totalLogs}</h2>
          </div>
        </div>
        <div className="dh-stat-card glass-panel">
          <div className="stat-icon-wrap" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b' }}>
            <Award size={22} />
          </div>
          <div>
            <span className="stat-label">Insignias Desbloqueadas</span>
            <h2 className="stat-val">{stats.unlockedBadges}</h2>
          </div>
        </div>
        <div className="dh-stat-card glass-panel">
          <div className="stat-icon-wrap" style={{ background: 'rgba(168, 85, 247, 0.15)', color: '#a855f7' }}>
            <Sparkles size={22} />
          </div>
          <div>
            <span className="stat-label">Mi Generación</span>
            <h2 className="stat-val">Gen {userGen} ✨</h2>
          </div>
        </div>
      </div>

      {/* ── TWO COLUMN LAYOUT ── */}
      <div className="dh-main-grid">
        
        {/* LEFT COLUMN: WHO HAS DONE THEIR LOG TODAY */}
        <div className="dh-column-card glass-panel">
          <div className="column-card-header">
            <h3>Estado del Equipo de Hoy 👥</h3>
            <span className="live-dot-tag">En Vivo</span>
          </div>
          
          <div className="team-status-list">
            {/* Current User Status */}
            <div className="team-member-item self-item">
              <div className="member-avatar self-avatar">{mappedDisplayName.charAt(0).toUpperCase()}</div>
              <div className="member-body">
                <div className="member-name-row">
                  <h4>{mappedDisplayName} (Tú)</h4>
                  {userSubmittedToday ? (
                    <span className="status-tag done">
                      <CheckCircle2 size={12} /> Completada
                    </span>
                  ) : (
                    <span className="status-tag pending">
                      <AlertCircle size={12} /> Pendiente
                    </span>
                  )}
                </div>
                <p className="member-quote">
                  {userSubmittedToday 
                    ? '¡Tu bitácora ya está registrada para el día de hoy! 🚀' 
                    : 'Aún no registras tu día. ¡No rompas tu hábito! ✍️'}
                </p>
              </div>
            </div>

            {/* Real Cohort Fellows Statuses */}
            {teamStatus.map(f => (
              <div key={f.username} className="team-member-item">
                <div className="member-avatar">{f.username.charAt(0).toUpperCase()}</div>
                <div className="member-body">
                  <div className="member-name-row">
                    <h4>{f.username}</h4>
                    {f.completed ? (
                      <span className="status-tag done">
                        <CheckCircle2 size={12} /> Completada
                      </span>
                    ) : (
                      <span className="status-tag pending">
                        <AlertCircle size={12} /> Pendiente
                      </span>
                    )}
                  </div>
                  <p className="member-quote">"{f.quote}"</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT COLUMN: RECENT ACHIEVEMENT TIMELINE */}
        <div className="dh-column-card glass-panel">
          <div className="column-card-header">
            <h3>Muro de Logros Recientes 🏆</h3>
          </div>

          <div className="achievements-timeline">
            {recentUnlocks.map((u, idx) => {
              const badge = INSIGNIAS_MAP[u.badgeId];
              return (
                <div key={idx} className="timeline-item">
                  <div className="timeline-badge-img-wrap" style={{ '--badge-color': badge ? badge.color : '#3DAA58' }}>
                    {badge ? (
                      <img src={badge.image} alt={badge.title} className="timeline-badge-img" />
                    ) : (
                      <Award size={18} />
                    )}
                  </div>
                  <div className="timeline-body">
                    <div className="timeline-meta">
                      <strong>{u.user}</strong>
                      <span className="timeline-time">{u.date}</span>
                    </div>
                    <p className="timeline-comment">{u.comment}</p>
                    {badge && (
                      <span className="timeline-badge-name" style={{ color: badge.color }}>
                        Insignia: {badge.title}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      <style>{`
        .dashboard-home {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .dh-welcome-header {
          display: flex;
          flex-direction: column;
          gap: 12px;
          justify-content: space-between;
          border-bottom: 1.5px solid var(--border);
          padding-bottom: 16px;
        }

        @media (min-width: 768px) {
          .dh-welcome-header {
            flex-direction: row;
            align-items: center;
          }
        }

        .dh-welcome-header h1 {
          font-family: var(--font-display);
          font-size: 1.8rem;
          font-weight: 800;
          color: var(--text-main);
          margin: 0 0 6px 0;
        }

        .dh-subtitle {
          font-size: 0.95rem;
          color: var(--text-muted);
          margin: 0;
        }

        .dh-date-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: var(--bg-secondary);
          border: 1.5px solid var(--border);
          border-radius: 20px;
          padding: 8px 16px;
          font-size: 0.85rem;
          font-weight: 700;
          color: var(--text-muted);
          align-self: flex-start;
          text-transform: capitalize;
        }

        /* ── QUICK ACTION BANNER ── */
        .dh-quick-banner {
          display: flex;
          flex-direction: column;
          gap: 20px;
          padding: 24px;
          border-radius: var(--radius-lg);
          transition: all var(--transition);
        }

        @media (min-width: 768px) {
          .dh-quick-banner {
            flex-direction: row;
            align-items: center;
            justify-content: space-between;
            gap: 32px;
          }
        }

        .banner-content {
          display: flex;
          align-items: flex-start;
          gap: 16px;
          flex: 1;
          text-align: left;
        }

        .banner-emoji {
          font-size: 2.2rem;
          flex-shrink: 0;
          line-height: 1.1;
        }

        .banner-content h3 {
          font-size: 1.15rem;
          font-weight: 700;
          color: var(--text-main);
          margin: 0 0 6px 0;
        }

        .banner-content p {
          font-size: 0.9rem;
          color: var(--text-muted);
          margin: 0;
          line-height: 1.5;
        }

        .banner-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 12px 24px;
          font-family: var(--font-main);
          font-size: 0.95rem;
          font-weight: 700;
          border-radius: var(--radius-sm);
          cursor: pointer;
          transition: all var(--transition);
          outline: none;
          flex-shrink: 0;
          width: auto; /* OVERRIDE GLOBAL BTN-PRIMARY 100% WIDTH ON DESKTOP */
        }

        @media (max-width: 767px) {
          .dh-quick-banner {
            align-items: stretch;
          }
          .banner-btn {
            width: 100%;
          }
        }

        .submitted-glow {
          border: 1.5px solid var(--primary);
          box-shadow: var(--shadow-green);
        }

        .pending-glow {
          border: 1.5px solid var(--border);
          box-shadow: var(--shadow-sm);
        }

        .btn-submitted {
          background: var(--bg-secondary);
          border: 1.5px solid var(--border);
          color: var(--text-main);
        }

        .btn-submitted:hover {
          background: var(--border);
        }

        /* ── STATS ROW ── */
        .dh-stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 20px;
        }

        .dh-stat-card {
          padding: 20px;
          display: flex;
          align-items: center;
          gap: 16px;
          border-radius: var(--radius-md);
        }

        .stat-icon-wrap {
          width: 44px;
          height: 44px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .stat-label {
          display: block;
          font-size: 0.78rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: var(--text-subtle);
          margin-bottom: 2px;
        }

        .stat-val {
          font-size: 1.5rem;
          font-weight: 800;
          color: var(--text-main);
          margin: 0;
        }

        /* ── MAIN COLUMNS ── */
        .dh-main-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 24px;
        }

        @media (min-width: 960px) {
          .dh-main-grid {
            grid-template-columns: 1.1fr 0.9fr;
          }
        }

        .dh-column-card {
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .column-card-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 1.5px solid var(--border);
          padding-bottom: 12px;
        }

        .column-card-header h3 {
          font-size: 1.15rem;
          font-weight: 800;
          color: var(--text-main);
          margin: 0;
        }

        .live-dot-tag {
          font-size: 0.72rem;
          font-weight: 800;
          color: var(--success);
          text-transform: uppercase;
          letter-spacing: 0.5px;
          display: flex;
          align-items: center;
          gap: 5px;
        }

        .live-dot-tag::before {
          content: '';
          width: 6px;
          height: 6px;
          background: var(--success);
          border-radius: 50%;
          animation: dotPulse 1.8s infinite ease-in-out;
        }

        @keyframes dotPulse {
          0%, 100% { opacity: 0.4; transform: scale(0.9); }
          50% { opacity: 1; transform: scale(1.2); }
        }

        /* ── TEAM STATUS LIST ── */
        .team-status-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .team-member-item {
          display: flex;
          gap: 14px;
          padding-bottom: 14px;
          border-bottom: 1px solid var(--border);
        }

        .team-member-item:last-child {
          border-bottom: none;
          padding-bottom: 0;
        }

        .self-item {
          background: var(--bg-secondary);
          border: 1px solid var(--border);
          border-radius: var(--radius-sm);
          padding: 12px 14px;
        }

        .member-avatar {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: linear-gradient(135deg, var(--primary), #a855f7);
          color: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.95rem;
          font-weight: 700;
          flex-shrink: 0;
        }

        .self-avatar {
          background: linear-gradient(135deg, #3DAA58, #2ecc71);
        }

        .member-body {
          flex: 1;
          min-width: 0;
        }

        .member-name-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 4px;
          gap: 10px;
        }

        .member-name-row h4 {
          font-size: 0.92rem;
          font-weight: 700;
          color: var(--text-main);
          margin: 0;
        }

        .status-tag {
          font-size: 0.7rem;
          font-weight: 700;
          padding: 2px 8px;
          border-radius: 20px;
          display: inline-flex;
          align-items: center;
          gap: 4px;
        }

        .status-tag.done {
          background: rgba(61, 170, 88, 0.12);
          color: var(--primary);
        }

        .status-tag.pending {
          background: rgba(148, 163, 184, 0.12);
          color: var(--text-muted);
        }

        .member-quote {
          font-size: 0.82rem;
          color: var(--text-muted);
          margin: 0;
          line-height: 1.4;
          overflow-wrap: anywhere;
        }

        /* ── TIMELINE ── */
        .achievements-timeline {
          display: flex;
          flex-direction: column;
          gap: 20px;
          position: relative;
        }

        .achievements-timeline::before {
          content: '';
          position: absolute;
          left: 18px;
          top: 10px;
          bottom: 10px;
          width: 2px;
          background: var(--border);
          z-index: 0;
        }

        .timeline-item {
          display: flex;
          gap: 16px;
          position: relative;
          z-index: 1;
        }

        .timeline-badge-img-wrap {
          width: 38px;
          height: 38px;
          border-radius: 50%;
          background: var(--bg-card);
          border: 2px solid var(--badge-color);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          box-shadow: 0 4px 10px rgba(0,0,0,0.1);
        }

        .timeline-badge-img {
          width: 75%;
          height: 75%;
          object-fit: contain;
        }

        .timeline-body {
          flex: 1;
          min-width: 0;
          display: flex;
          flex-direction: column;
          gap: 3px;
        }

        .timeline-meta {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
        }

        .timeline-meta strong {
          font-size: 0.9rem;
          font-weight: 700;
          color: var(--text-main);
        }

        .timeline-time {
          font-size: 0.72rem;
          color: var(--text-subtle);
        }

        .timeline-comment {
          font-size: 0.85rem;
          color: var(--text-muted);
          margin: 0;
          line-height: 1.4;
        }

        .timeline-badge-name {
          font-size: 0.75rem;
          font-weight: 700;
          letter-spacing: 0.2px;
          margin-top: 2px;
        }
      `}</style>
    </div>
  );
};

export default DashboardHome;
