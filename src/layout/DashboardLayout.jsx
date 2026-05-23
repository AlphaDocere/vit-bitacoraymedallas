import React, { useEffect, useState } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { PenSquare, BookOpen, User, Moon, Sun, Menu, X, Crown, Award, Users, Home as HomeIcon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import LogoLight from '../assets/Kreative vit sin fondo letra negra.png';
import LogoDark from '../assets/Kreative vit sin fondo letra blanca.png';
import OnThisDay from '../components/OnThisDay';
import { calculateUserBadges } from '../utils/badgeHelper';

const INSIGNIAS_MAP = {
  18: { title: 'El Creador', image: '/insignias/insignia creador.png', color: '#39ff14', desc: 'Insignia de honor legendaria otorgada al desarrollador principal del sistema.' },
  28: { title: 'Generación 17', image: '/insignias/Gen 17.png', color: '#00f0ff', desc: 'Insignia especial en honor a la Generación Fundadora Gen 17.' },
  29: { title: 'Generación 18', image: '/insignias/Gen 18.png', color: '#00f0ff', desc: 'Insignia especial en honor a los integrantes de la Generación 18.' },
  30: { title: 'Generación 19', image: '/insignias/Gen 19.png', color: '#a855f7', desc: 'Insignia especial en honor a los integrantes de la Generación 19.' },
  31: { title: 'Generación 20', image: '/insignias/Gen 20.png', color: '#facc15', desc: 'Insignia especial en honor a los integrantes de la Generación 20.' },
  32: { title: 'Generación 21', image: '/insignias/Gen 21.png', color: '#ec4899', desc: 'Insignia especial en honor a los integrantes de la Generación 21.' },
  33: { title: 'Generación 22', image: '/insignias/Gen 22.png', color: '#ef4444', desc: 'Insignia especial en honor a los integrantes de la Generación 22.' },
  34: { title: 'Generación 23', image: '/insignias/Gen 23.png', color: '#10b981', desc: 'Insignia especial en honor a los integrantes de la Generación 23.' },
  35: { title: 'Generación 24', image: '/insignias/Gen 24.png', color: '#f97316', desc: 'Insignia especial en honor a los integrantes de la Generación 24.' },
  36: { title: 'Generación 25', image: '/insignias/Gen 25.png', color: '#3b82f6', desc: 'Insignia especial en honor a los integrantes de la Generación 25.' },
  37: { title: 'Generación 26', image: '/insignias/Gen 26.png', color: '#ec4899', desc: 'Insignia especial en honor a los integrantes de la Generación 26.' },
  38: { title: 'Generación 27', image: '/insignias/Gen 27.png', color: '#14b8a6', desc: 'Insignia especial en honor a los integrantes de la Generación 27.' },
  39: { title: 'Generación 28', image: '/insignias/Gen 28.png', color: '#6366f1', desc: 'Insignia especial en honor a los integrantes de la Generación 28.' },
  40: { title: 'Generación 29', image: '/insignias/Gen 29.png', color: '#39ff14', desc: 'Insignia especial en honor a los integrantes de la Generación 29.' },
  
  41: { title: 'Git Master', image: '/insignias/Git.png', color: '#f05032', desc: '¡Publicaste tu primera rama en Git y dominas el control de versiones!' },
  42: { title: 'cPanel Explorer', image: '/insignias/Cpanel.png', color: '#ff7600', desc: '¡Aprendiste a administrar servidores y configurar cPanel con éxito!' },
  43: { title: 'Wiki Contribuidor', image: '/insignias/Primer aporte a la wiki.png', color: '#3b82f6', desc: '¡Aportaste tu primer artículo de documentación en la Wiki de Kreative!' },
  44: { title: 'Voz Activa', image: '/insignias/podcast.png', color: '#ec4899', desc: '¡Participaste como invitado o panelista en un episodio del Podcast de Kreative!' },
  45: { title: 'Matriz de Eisenhower', image: '/insignias/Matriz de eisenhower.png', color: '#328f49', desc: '¡Dominas la priorización y organizas tus tareas diarias con precisión estratégica!' },
  46: { title: 'Bug Hunter', image: '/insignias/Fix y bugs.png', color: '#ef4444', desc: '¡Corregiste errores críticos, eliminaste bugs y dejaste el código impecable en producción!' },
  47: { title: 'Líder Alpha Docere', image: '/insignias/Mauro rojas.png', color: '#facc15', desc: 'Insignia de honor exclusiva otorgada a Mauro Rojas, Jefe y Líder Supremo de Alpha Docere.' },
  48: { title: 'Miembro de la Comunidad', image: '/insignias/Usuarios.png', color: '#a855f7', desc: 'Insignia de honor otorgada a los integrantes y colaboradores generales de la comunidad Kreative Vit.' },

  1: { title: 'Mente Abierta', image: '/insignias/Mente abierta.png', color: '#facc15', desc: 'Comenzaste tu viaje registrando tu primera bitácora.' },
  2: { title: 'Primer Impulso', image: '/insignias/primer impulso.png', color: '#f97316', desc: 'Racha activa de 3 días consecutivos.' },
  3: { title: 'Mente Ligera', image: '/insignias/Mente ligera.png', color: '#fbbf24', desc: 'Escribiste 7 bitácoras completas.' },
  4: { title: 'Semana Imparable', image: '/insignias/Semana imparable.png', color: '#ef4444', desc: 'Racha activa de 7 días consecutivos.' },
  5: { title: 'Cable a Tierra', image: '/insignias/Cable a tierra.png', color: '#3b82f6', desc: 'Escribiste 15 bitácoras completas.' },
  6: { title: 'Ritmo Constante', image: '/insignias/Ritmo Constante.png', color: '#6366f1', desc: 'Racha activa de 14 días consecutivos.' },
  7: { title: 'Zis-Zas Mental', image: '/insignias/Zis-Zas mental.png', color: '#ec4899', desc: 'Escribiste 21 bitácoras completas.' },
  8: { title: 'Hábitat de Calma', image: '/insignias/Habitad de calma.png', color: '#10b981', desc: 'Escribiste 30 bitácoras completas.' },
  9: { title: 'Mes Inquebrantable', image: '/insignias/Mes Inquebrantable.png', color: '#06b6d4', desc: 'Racha activa de 30 días consecutivos.' },
  10: { title: 'Paso a Paso', image: '/insignias/Paso a paso.png', color: '#8b5cf6', desc: 'Escribiste 45 bitácoras completas.' },
  11: { title: 'Flujo de Paz', image: '/insignias/Flujo de paz.png', color: '#14b8a6', desc: 'Racha activa de 45 días consecutivos.' },
  12: { title: 'Escudo de Papel', image: '/insignias/Escudo de papel.png', color: '#64748b', desc: 'Escribiste 60 bitácoras completas.' },
  13: { title: 'Mente de Acero', image: '/insignias/Mente de acero corazon de seda.png', color: '#94a3b8', desc: 'Racha activa de 60 días consecutivos.' },
  14: { title: 'Foco Claro', image: '/insignias/Fcoco Claro.png', color: '#d946ef', desc: 'Escribiste 75 bitácoras completas.' },
  15: { title: 'Faro en la Tormenta', image: '/insignias/Faro en la tormenta.png', color: '#f59e0b', desc: 'Racha activa de 75 días consecutivos.' },
  16: { title: 'Maestría Interior', image: '/insignias/Maestria interior.png', color: '#eab308', desc: 'Escribiste 90 bitácoras completas.' },
  17: { title: 'Zen Absoluto', image: '/insignias/Zen absoluto  olimpo vip.png', color: '#fbbf24', desc: 'Racha activa de 90 días consecutivos.' },
  19: { title: 'Bitácora Viva', image: '/insignias/vitacora viva.png', color: '#34d399', desc: 'Escribiste más de 5,000 palabras acumuladas.' },
  20: { title: 'Mente en Movimiento', image: '/insignias/Mente en movimiento.png', color: '#3b82f6', desc: 'Escribiste más de 10,000 palabras acumuladas.' },
  21: { title: 'Archivo Interior', image: '/insignias/Archivo Interior.png', color: '#a855f7', desc: 'Escribiste más de 25,000 palabras acumuladas.' },
  22: { title: 'Noctámbulo Sereno', image: '/insignias/Noctambulo sereno.png', color: '#1e1b4b', desc: 'Registraste bitácoras durante la noche.' },
  23: { title: 'Último Esfuerzo', image: '/insignias/Ultimo Esfuerzo.png', color: '#ef4444', desc: 'Registraste bitácoras durante la madrugada.' },
  24: { title: 'Inicio Ligero', image: '/insignias/Inicio Lijero.png', color: '#facc15', desc: 'Registraste bitácoras temprano por la mañana.' },
  25: { title: 'Volver a Empezar', image: '/insignias/Volver a empezar.png', color: '#10b981', desc: 'Retomaste tu registro tras una pausa de más de 3 días.' },
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

const getNavItems = (user) => {
  return [
    { to: '/dashboard',            label: 'Inicio',         icon: HomeIcon,  end: true },
    { to: '/dashboard/bitacora',   label: 'Nueva Bitácora', icon: PenSquare },
    { to: '/dashboard/historial',  label: 'Historial',      icon: BookOpen  },
    { to: '/dashboard/insignias',  label: 'Insignias',      icon: Award     },
    { to: '/dashboard/companeros', label: 'Compañeros',     icon: Users     },
    { to: '/dashboard/perfil',     label: 'Mi Perfil',      icon: User      },
  ];
};

const ConfettiEffect = () => {
  const pieces = Array.from({ length: 45 });
  return (
    <div className="confetti-wrapper">
      {pieces.map((_, i) => {
        const left = Math.random() * 100 + '%';
        const delay = Math.random() * 2 + 's';
        const duration = Math.random() * 2 + 2 + 's';
        return (
          <div 
            key={i} 
            className="confetti-piece" 
            style={{ 
              left, 
              animationDelay: delay, 
              animationDuration: duration,
              background: ['#facc15', '#3b82f6', '#ef4444', '#10b981', '#a855f7', '#00f0ff'][i % 6]
            }}
          />
        );
      })}
    </div>
  );
};

const DashboardLayout = () => {
  const navigate    = useNavigate();
  const location    = useLocation();
  const [currentUser, setCurrentUser] = useState(() => localStorage.getItem('practicante_user'));
  const [isAdmin, setIsAdmin] = useState(() => localStorage.getItem('practicante_is_admin') === 'true');
  const [menuOpen, setMenuOpen]       = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { isDarkMode, toggleTheme }   = useTheme();

  // Generation Prompt States - Initialize synchronously to block asynchronous rendering lag
  const [showGenModal, setShowGenModal] = useState(() => {
    const user = localStorage.getItem('practicante_user');
    const userGen = localStorage.getItem('practicante_generation');
    return !!user && !userGen;
  });
  const [isGenMember, setIsGenMember] = useState(false);
  const [genInputNumber, setGenInputNumber] = useState('');
  const [customStatus, setCustomStatus] = useState('');

  // Celebration States
  const [activeCelebrationBadge, setActiveCelebrationBadge] = useState(null);
  const [spinKey, setSpinKey] = useState(0);

  useEffect(() => {
    const user = localStorage.getItem('practicante_user');
    if (!user) {
      navigate('/login');
      return;
    }

    let storedFellows = localStorage.getItem('practicantes_fellows');
    if (storedFellows) {
      try {
        let parsed = JSON.parse(storedFellows);
        // Clean existing fake data if present
        const fakeUsers = ['María Alejandra', 'Nicolas González', 'Camila Soto', 'Sebastian Reyes'];
        let filtered = parsed.filter(f => !fakeUsers.includes(f.username));
        // Strip normal badges from Mauro if he had them
        filtered = filtered.map(f => {
          if (f.username === 'Mauro Rojas') {
            f.badges = f.badges.filter(b => b === 47 || b === 48);
          }
          return f;
        });
        localStorage.setItem('practicantes_fellows', JSON.stringify(filtered));
      } catch (e) {}
    }

    // ── ALWAYS sync from real MySQL backend on every mount ──
    const token = localStorage.getItem('practicante_token');
    if (token) {
      fetch('https://test-systemauth.alphadocere.cl/api/fetchLogs.php')
        .then(res => res.json())
        .then(logsData => {
          if (logsData.success && logsData.bitacoras && logsData.fellows) {
            localStorage.setItem('practicantes_bitacoras', JSON.stringify(logsData.bitacoras));
            localStorage.setItem('practicantes_fellows', JSON.stringify(logsData.fellows));
            // Force all open components to re-read localStorage
            window.dispatchEvent(new Event('storage'));
          }
        })
        .catch(err => console.warn('MySQL sync skipped (offline?):', err));
    }
  }, [navigate, currentUser]);

  // Synchronous celebration checking loop
  useEffect(() => {
    if (!currentUser || showGenModal) return;

    const myGen = localStorage.getItem('practicante_generation');
    if (!myGen) return;

    // Calculate user's badges
    const bitacorasStored = localStorage.getItem('practicantes_bitacoras') || '[]';
    const bitacoras = JSON.parse(bitacorasStored);

    // Dynamic calculation using utility helper
    const earnedBadges = calculateUserBadges(currentUser, myGen, bitacoras);

    // Load already acknowledged ones
    const ackStored = localStorage.getItem('practicantes_badges_acknowledged') || '[]';
    const ackBadges = JSON.parse(ackStored);

    // Check if there is any earned badge that has not been celebrated yet
    const uncelebrated = earnedBadges.find(badgeId => !ackBadges.map(Number).includes(Number(badgeId)));
    if (uncelebrated) {
      const badgeObj = INSIGNIAS_MAP[uncelebrated];
      if (badgeObj) {
        setActiveCelebrationBadge({ id: Number(uncelebrated), ...badgeObj });
        setSpinKey(prev => prev + 1);
      }
    }
  }, [currentUser, location.pathname, showGenModal]);

  const handleCloseCelebration = () => {
    if (!activeCelebrationBadge) return;

    const ackStored = localStorage.getItem('practicantes_badges_acknowledged') || '[]';
    const ackBadges = JSON.parse(ackStored);

    if (!ackBadges.includes(activeCelebrationBadge.id)) {
      ackBadges.push(activeCelebrationBadge.id);
      localStorage.setItem('practicantes_badges_acknowledged', JSON.stringify(ackBadges));
    }

    // Set to null first to trigger smooth exit animation
    setActiveCelebrationBadge(null);

    // Immediately calculate and trigger the next uncelebrated badge in the queue!
    const myGen = localStorage.getItem('practicante_generation');
    if (!myGen || !currentUser) return;

    const bitacorasStored = localStorage.getItem('practicantes_bitacoras') || '[]';
    const bitacoras = JSON.parse(bitacorasStored);
    const earnedBadges = calculateUserBadges(currentUser, myGen, bitacoras);

    // Find the next one that has not been celebrated yet (taking into account the new ack list)
    const nextUncelebrated = earnedBadges.find(badgeId => !ackBadges.map(Number).includes(Number(badgeId)));
    if (nextUncelebrated) {
      const badgeObj = INSIGNIAS_MAP[nextUncelebrated];
      if (badgeObj) {
        // Smooth 300ms transition delay to play next pop-up seamlessly
        setTimeout(() => {
          setActiveCelebrationBadge({ id: Number(nextUncelebrated), ...badgeObj });
          setSpinKey(prev => prev + 1);
        }, 300);
      }
    }
  };

  const handleSaveGeneration = () => {
    const finalGen = isGenMember && genInputNumber.trim() !== '' ? genInputNumber.trim() : 'Usuarios';

    localStorage.setItem('practicante_generation', finalGen);
    const finalStatus = customStatus || '¡Registrando bitácoras en Kreative Vit! 💻';
    localStorage.setItem('practicante_status', finalStatus);

    // Sync in fellows list
    const storedFellows = localStorage.getItem('practicantes_fellows');
    let fellows = storedFellows ? JSON.parse(storedFellows) : [];

    // Calculate user's badges
    const bitacorasStored = localStorage.getItem('practicantes_bitacoras') || '[]';
    const bitacoras = JSON.parse(bitacorasStored);
    
    const earnedBadges = calculateUserBadges(currentUser, finalGen, bitacoras);

    const existingIdx = fellows.findIndex(f => f.username === currentUser);
    const newFellow = {
      username: currentUser,
      generation: finalGen === 'Usuarios' ? 'Usuarios' : parseInt(finalGen),
      status: finalStatus,
      badges: earnedBadges
    };

    if (existingIdx !== -1) {
      fellows[existingIdx] = newFellow;
    } else {
      fellows.push(newFellow);
    }

    localStorage.setItem('practicantes_fellows', JSON.stringify(fellows));
    setShowGenModal(false);
  };

  const handleLogout = () => {
    setUserMenuOpen(false);
    localStorage.removeItem('practicante_user');
    localStorage.removeItem('practicante_token');
    localStorage.removeItem('practicante_email');
    localStorage.removeItem('practicante_is_admin');
    navigate('/login');
  };

  if (!currentUser) return null;

  // Custom name mapping: Jose Eliecer Rivera Perez -> Joseph Joestar
  const mappedDisplayName = currentUser === 'Jose Eliecer Rivera Perez' ? 'Joseph Joestar' : currentUser;

  return (
    <div className="layout-shell">

      {/* ═══════════ TOP NAVBAR ═══════════ */}
      <header className="topnav">
        <div className="topnav-inner">
          {/* Logo */}
          <NavLink to="/" className="topnav-logo">
            <img
              src={isDarkMode ? LogoDark : LogoLight}
              alt="Kreative"
              className="topnav-logo-img"
            />
          </NavLink>

          {/* Desktop Nav Links */}
          <nav className="topnav-links">
            {getNavItems(currentUser).map(({ to, label, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) => `topnav-link ${isActive ? 'active' : ''}`}
              >
                {label}
              </NavLink>
            ))}
          </nav>

          {/* Right controls */}
          <div className="topnav-right">
            {/* User name CTA */}
            <div className="nav-user-menu">
              <button className="nav-cta-btn" onClick={() => setUserMenuOpen(!userMenuOpen)}>
                <div className="nav-avatar-mini">
                  {isAdmin ? <Crown size={14} color="#fcd34d" /> : <User size={14} />}
                </div>
                {mappedDisplayName}
              </button>
              
              {userMenuOpen && (
                <div className="nav-user-dropdown" style={{ display: 'flex' }}>
                  <span className="nav-user-name">{mappedDisplayName}</span>
                  <div className="nav-drop-divider"></div>
                  <button className="nav-drop-btn logout" onClick={handleLogout}>
                    Cerrar Sesión
                  </button>
                </div>
              )}
            </div>

            {/* Dark mode switch */}
            <button className="theme-btn" onClick={toggleTheme} title={isDarkMode ? 'Modo claro' : 'Modo oscuro'}>
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            {/* Mobile menu toggle */}
            <button className="mobile-menu-btn" onClick={() => setMenuOpen(v => !v)}>
              {menuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div className="mobile-nav">
          {getNavItems(currentUser).map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) => `mobile-nav-link ${isActive ? 'active' : ''}`}
              onClick={() => setMenuOpen(false)}
            >
              <Icon size={16} /> {label}
            </NavLink>
          ))}
        </div>
      )}

      {/* ═══════════ PAGE BODY ═══════════ */}
      <div className="page-body">
        {/* Main content */}
        <main className="page-main">
          <Outlet />
        </main>

        {/* RIGHT SIDEBAR — "On This Day" widget */}
        <aside className="page-aside">
          <OnThisDay />
        </aside>
      </div>

      {/* ═══════════ FIRST-TIME LOGIN GENERATION MODAL ═══════════ */}
      {showGenModal && (
        <div className="gen-setup-overlay">
          <div className="gen-setup-card animate-fade-up">
            <h2>¡Te damos la bienvenida a Kreative Vit! 🚀</h2>
            <p className="gen-subtitle">
              El sistema de bitácora interna de Alpha Docere. Para comenzar a registrar tus bitácoras e insignias, indícanos de qué generación eres:
            </p>
            
            <div className="input-group">
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>¿Perteneces a alguna Generación (Alpha)?</label>
              <div className="gen-toggle-container" style={{ display: 'flex', gap: '16px', marginBottom: '12px' }}>
                <label className="gen-radio-label" style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input 
                    type="radio" 
                    name="isGen" 
                    checked={!isGenMember} 
                    onChange={() => setIsGenMember(false)} 
                  />
                  No, soy usuario general
                </label>
                <label className="gen-radio-label" style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input 
                    type="radio" 
                    name="isGen" 
                    checked={isGenMember} 
                    onChange={() => setIsGenMember(true)} 
                  />
                  Sí, soy de una generación
                </label>
              </div>

              {isGenMember && (
                <div className="animate-fade-up" style={{ marginTop: '12px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                    Ingresa el número de tu generación (Ej: 17, 30):
                  </label>
                  <input 
                    type="number" 
                    min="1"
                    placeholder="Ej: 30" 
                    value={genInputNumber}
                    onChange={(e) => setGenInputNumber(e.target.value)}
                    className="gen-select-input"
                  />
                </div>
              )}
            </div>

            <div className="input-group">
              <label>Tu Frase de Estado (Ej: ¡Tomando café y programando! ☕)</label>
              <input 
                type="text" 
                placeholder="¿Qué tienes en mente hoy?" 
                value={customStatus}
                onChange={(e) => setCustomStatus(e.target.value)}
                maxLength={60}
                className="gen-status-input"
              />
            </div>

            <button className="btn-primary" onClick={handleSaveGeneration} style={{ marginTop: '16px', py: '14px' }}>
              Guardar y Comenzar
            </button>
          </div>
        </div>
      )}

      {/* ═══════════ INSIGNIA UNLOCKED CELEBRATION OVERLAY ═══════════ */}
      {activeCelebrationBadge && (
        <div className="celebration-overlay">
          <ConfettiEffect />
          <div className="celebration-card animate-scale-up" style={{ '--badge-color': activeCelebrationBadge.color }}>
            
            <div className="celebration-header">
              <span className="celebration-subtitle">🏆 ¡Logro Desbloqueado! 🏆</span>
              <h2>¡FELICIDADES! 🎉</h2>
              <p>Has conseguido una nueva insignia de honor en Kreative Vit</p>
            </div>

            <div className="celebration-asset-section">
              {/* Massive Blazing Flames around the celebrated coin */}
              <div className="modal-flame-container">
                <div className="flame-particle"></div>
                <div className="flame-particle"></div>
                <div className="flame-particle"></div>
                <div className="flame-particle"></div>
                <div className="flame-particle"></div>
                <div className="flame-particle"></div>
                <div className="flame-particle"></div>
                <div className="flame-particle"></div>
              </div>

              <div className="coin-3d-wrapper" title="¡Haz clic en la moneda para hacerla girar!">
                <div 
                  key={spinKey}
                  className="coin-3d-spinning spin-trigger-anim"
                  onClick={() => setSpinKey(prev => prev + 1)}
                >
                  {/* Front Side */}
                  <div className="coin-side coin-front">
                    <img src={activeCelebrationBadge.image} alt={activeCelebrationBadge.title} className="modal-badge-img" />
                    <div className="modal-glow-wave"></div>
                  </div>
                  {/* Back Side */}
                  <div className="coin-side coin-back">
                    <img src={activeCelebrationBadge.image} alt={`${activeCelebrationBadge.title} back`} className="modal-badge-img back-image" />
                    <div className="modal-glow-wave"></div>
                  </div>
                </div>
              </div>
            </div>

            <div className="celebration-info-section">
              <h3>{activeCelebrationBadge.title}</h3>
              <p className="celebration-desc">"{activeCelebrationBadge.desc}"</p>
              
              <button className="celebration-btn" onClick={handleCloseCelebration}>
                ¡Excelente! 🚀
              </button>
            </div>

          </div>
        </div>
      )}

      <style>{`
        /* ── Shell ── */
        .layout-shell {
          display: flex; flex-direction: column;
          width: 100%; min-height: 100vh;
          position: relative; z-index: 1;
        }

        /* ── Top Navbar — estilo Alpha Docere ── */
        .topnav {
          width: 100%;
          background: var(--nav-solid-bg);
          position: sticky; top: 0; z-index: 100;
          box-shadow: 0 2px 10px rgba(0,0,0,0.05);
          display: flex; justify-content: center;
        }

        .topnav-inner {
          display: flex; align-items: center;
          width: 100%; max-width: 1280px;
          padding: 0 24px; height: 72px;
        }

        .topnav-logo { display: flex; align-items: center; text-decoration: none; flex-shrink: 0; margin-right: 48px; }
        .topnav-logo-img { height: 42px; object-fit: contain; }

        .topnav-links {
          display: flex; align-items: center; gap: 24px;
        }

        .topnav-link {
          text-decoration: none;
          color: var(--text-muted);
          font-family: var(--font-main);
          font-size: 0.95rem;
          font-weight: 600;
          padding: 8px 12px;
          border-radius: var(--radius-sm);
          transition: all var(--transition);
        }

        .topnav-link:hover,
        .topnav-link.active {
          color: var(--primary);
          background: var(--primary-light);
        }

        .topnav-right {
          margin-left: auto;
          display: flex; align-items: center; gap: 16px;
        }

        /* ── User dropdown ── */
        .nav-user-menu {
          position: relative;
        }
        .nav-cta-btn {
          display: flex; align-items: center; gap: 8px;
          background: var(--primary); color: #fff;
          border: none; border-radius: 20px;
          padding: 8px 18px; font-family: var(--font-main);
          font-size: 0.88rem; font-weight: 700;
          cursor: pointer; transition: all var(--transition);
          box-shadow: 0 4px 12px var(--primary-glow);
        }
        .nav-cta-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 6px 16px var(--primary-glow);
          filter: brightness(1.05);
        }

        .nav-avatar-mini {
          width: 20px; height: 20px; border-radius: 50%;
          background: rgba(255,255,255,0.2);
          display: flex; align-items: center; justify-content: center;
        }

        .nav-user-dropdown {
          position: absolute; top: 110%; right: 0;
          background: var(--nav-solid-bg); border: 1.5px solid var(--border);
          border-radius: var(--radius-sm); width: 180px;
          box-shadow: 0 10px 25px rgba(0,0,0,0.15);
          flex-direction: column; padding: 8px 0; z-index: 150;
        }

        .nav-user-name {
          padding: 6px 16px; font-size: 0.8rem; font-weight: 700;
          color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px;
        }

        .nav-drop-divider {
          height: 1px; background: var(--border); margin: 6px 0;
        }

        .nav-drop-btn {
          background: transparent; border: none; width: 100%;
          text-align: left; padding: 8px 16px;
          font-family: var(--font-main); font-size: 0.9rem;
          color: var(--text-main); cursor: pointer; transition: background 0.2s;
        }
        .nav-drop-btn:hover { background: var(--bg-secondary); }
        .nav-drop-btn.logout { color: var(--danger); }

        .theme-btn {
          background: var(--bg-secondary); border: 1.5px solid var(--border);
          width: 40px; height: 40px; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          color: var(--text-muted); cursor: pointer; transition: all var(--transition);
        }
        .theme-btn:hover { border-color: var(--primary); color: var(--primary); }

        .mobile-menu-btn {
          display: none; background: transparent; border: none;
          color: var(--text-main); cursor: pointer;
        }

        /* ── Mobile menu ── */
        .mobile-nav {
          display: flex; flex-direction: column;
          margin: 0; padding: 10px 16px;
          background: var(--nav-solid-bg); border-bottom: 1px solid var(--border);
          gap: 4px;
        }
        .mobile-nav-link {
          display: flex; align-items: center; gap: 10px;
          padding: 12px 16px; border-radius: 4px;
          text-decoration: none; color: var(--text-muted);
          font-size: 0.95rem; font-weight: 500; transition: all var(--transition);
        }
        .mobile-nav-link.active,
        .mobile-nav-link:hover { color: var(--primary); background: var(--primary-light); }

        /* ── Page body ── */
        .page-body {
          display: flex; flex: 1; width: 100%; max-width: 1280px; margin: 0 auto;
          padding: 30px 24px; gap: 30px;
        }
        .page-main { flex: 1; min-width: 0; }
        .page-aside { width: 300px; flex-shrink: 0; }

        /* ── FIRST-TIME GENERATION SETUP MODAL ── */
        .gen-setup-overlay {
          position: fixed; inset: 0; z-index: 9999;
          background: rgba(2, 6, 23, 0.92);
          backdrop-filter: blur(16px);
          display: flex; align-items: center; justify-content: center;
          padding: 20px;
        }

        .gen-setup-card {
          background: var(--bg-card);
          border: 1.5px solid var(--primary);
          border-radius: var(--radius-lg);
          padding: 40px; max-width: 500px; width: 100%;
          box-shadow: 
            0 20px 50px rgba(0,0,0,0.5),
            0 0 40px var(--primary-glow);
          display: flex; flex-direction: column; gap: 20px;
        }

        .gen-setup-card h2 {
          font-family: var(--font-display); font-size: 1.8rem; font-weight: 800;
          color: var(--text-main); margin: 0; text-align: center;
          line-height: 1.3;
        }

        .gen-subtitle {
          font-size: 0.92rem; color: var(--text-muted); line-height: 1.6;
          text-align: center; margin: 0 0 10px;
        }

        .gen-select-input {
          width: 100%; padding: 12px 14px;
          background: var(--bg-input); border: 1.5px solid var(--border);
          border-radius: var(--radius-sm); color: var(--text-main);
          font-family: var(--font-main); outline: none; font-size: 0.95rem;
          transition: border-color var(--transition);
        }
        .gen-select-input:focus { border-color: var(--primary); }

        .gen-status-input {
          width: 100%; padding: 12px 14px;
          background: var(--bg-input); border: 1.5px solid var(--border);
          border-radius: var(--radius-sm); color: var(--text-main);
          font-family: var(--font-main); outline: none; font-size: 0.95rem;
        }

        /* ═══════════ INSIGNIA CELEBRATION MODAL OVERLAY ═══════════ */
        .celebration-overlay {
          position: fixed; inset: 0; z-index: 10000;
          background: rgba(2, 6, 23, 0.95);
          backdrop-filter: blur(20px);
          display: flex; align-items: center; justify-content: center;
          padding: 20px;
        }

        .celebration-card {
          position: relative;
          background: var(--bg-card);
          border: 2px solid var(--badge-color);
          border-radius: 24px;
          padding: 40px 30px;
          max-width: 480px; width: 100%;
          box-shadow: 
            0 25px 60px rgba(0,0,0,0.6),
            0 0 50px color-mix(in srgb, var(--badge-color) 30%, transparent);
          display: flex; flex-direction: column;
          align-items: center; text-align: center;
          gap: 20px;
          overflow: visible;
        }

        .celebration-header {
          display: flex; flex-direction: column; gap: 6px;
        }
        .celebration-subtitle {
          font-size: 0.85rem; font-weight: 800; color: var(--badge-color);
          text-transform: uppercase; letter-spacing: 1px;
          text-shadow: -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000;
        }
        .celebration-header h2 {
          font-family: var(--font-display); font-size: 2.2rem; font-weight: 900;
          color: var(--text-main); margin: 0;
          letter-spacing: 0.5px;
        }
        .celebration-header p {
          font-size: 0.92rem; color: var(--text-muted); margin: 0;
        }

        /* 3D Coin Section */
        .celebration-asset-section {
          perspective: 1000px;
          margin: 20px 0;
          position: relative;
          width: 180px; height: 180px;
          display: flex; align-items: center; justify-content: center;
        }

        .coin-3d-wrapper {
          width: 180px; height: 180px;
          transform-style: preserve-3d;
        }
        .coin-3d-spinning.spin-trigger-anim {
          width: 100%; height: 100%;
          position: relative;
          transform-style: preserve-3d;
          animation: spinCoinFast 1.8s cubic-bezier(0.15, 0.85, 0.2, 1) forwards;
          cursor: pointer;
        }
        @keyframes spinCoinFast {
          0% { transform: rotateY(0deg); }
          100% { transform: rotateY(1080deg); }
        }

        .coin-side {
          position: absolute; inset: 0;
          border-radius: 50%;
          background: linear-gradient(135deg, color-mix(in srgb, var(--badge-color) 20%, var(--bg-card)), var(--bg-main));
          border: 5px solid var(--badge-color);
          box-shadow: 
            0 15px 40px color-mix(in srgb, var(--badge-color) 40%, rgba(0,0,0,0.4)),
            inset 0 0 30px color-mix(in srgb, var(--badge-color) 50%, transparent);
          display: flex; align-items: center; justify-content: center;
          backface-visibility: hidden;
          overflow: hidden;
        }
        .coin-front { z-index: 2; transform: rotateY(0deg); }
        .coin-back { transform: rotateY(180deg); }

        .modal-badge-img {
          width: 80%; height: 80%; object-fit: contain; z-index: 2;
          filter: drop-shadow(0 10px 20px rgba(0,0,0,0.35));
        }
        .modal-badge-img.back-image { transform: scaleX(-1); }

        .modal-glow-wave {
          position: absolute; top: -50%; left: -50%; width: 200%; height: 200%;
          background: linear-gradient(
            to right, transparent, rgba(255,255,255,0.08), rgba(255,255,255,0.35), rgba(255,255,255,0.08), transparent
          );
          transform: rotate(25deg);
          animation: fastShine 3s infinite linear;
        }
        @keyframes fastShine {
          0% { transform: translate(-30%, -30%) rotate(25deg); }
          100% { transform: translate(30%, 30%) rotate(25deg); }
        }

        /* Confetti Effect */
        .confetti-wrapper {
          position: absolute; inset: 0; pointer-events: none;
          overflow: hidden; z-index: 2;
        }
        .confetti-piece {
          position: absolute; width: 10px; height: 10px;
          top: -15px; border-radius: 2px; opacity: 0.85;
          animation: confettiFall 3s infinite linear;
        }
        @keyframes confettiFall {
          0% { transform: translateY(-15px) rotate(0deg); opacity: 1; }
          100% { transform: translateY(105vh) rotate(720deg); opacity: 0; }
        }

        /* Rising Fire Flames around the Coin */
        .modal-flame-container {
          position: absolute; inset: -25px; pointer-events: none;
          z-index: 0; overflow: visible;
        }
        .modal-flame-container .flame-particle {
          position: absolute; bottom: 20px;
          filter: blur(1.5px) drop-shadow(0 0 5px #fff) drop-shadow(0 0 18px var(--badge-color)) drop-shadow(0 0 35px var(--badge-color));
          background: var(--badge-color);
          border-radius: 50% 50% 20% 80%;
          transform: rotate(-45deg);
          animation: modalRiseAndBurn 2.0s infinite ease-out;
        }
        .modal-flame-container .flame-particle:nth-child(1) { left: 6%; animation-delay: 0s; width: 26px; height: 26px; }
        .modal-flame-container .flame-particle:nth-child(2) { left: 22%; animation-delay: 0.2s; width: 34px; height: 34px; }
        .modal-flame-container .flame-particle:nth-child(3) { left: 38%; animation-delay: 0.4s; width: 28px; height: 28px; }
        .modal-flame-container .flame-particle:nth-child(4) { left: 54%; animation-delay: 0.6s; width: 40px; height: 40px; }
        .modal-flame-container .flame-particle:nth-child(5) { left: 70%; animation-delay: 0.8s; width: 22px; height: 22px; }
        .modal-flame-container .flame-particle:nth-child(6) { left: 86%; animation-delay: 1.0s; width: 32px; height: 32px; }
        .modal-flame-container .flame-particle:nth-child(7) { left: 30%; animation-delay: 1.2s; width: 36px; height: 36px; }
        .modal-flame-container .flame-particle:nth-child(8) { left: 66%; animation-delay: 1.4s; width: 28px; height: 28px; }

        @keyframes modalRiseAndBurn {
          0% { transform: translateY(0) scale(0.3) rotate(-45deg); opacity: 0; }
          15% { opacity: 0.98; }
          65% { opacity: 0.75; }
          100% { transform: translateY(-110px) scale(0.1) rotate(-45deg); opacity: 0; }
        }

        .celebration-info-section {
          width: 100%; display: flex; flex-direction: column; align-items: center; gap: 10px;
        }
        .celebration-info-section h3 {
          font-family: var(--font-display); font-size: 1.6rem; font-weight: 800;
          color: var(--text-main); margin: 0;
        }
        .celebration-desc {
          font-size: 0.95rem; color: var(--text-muted); line-height: 1.5;
          margin: 0 0 10px; font-style: italic; max-width: 360px;
        }
        .celebration-btn {
          background: var(--badge-color);
          color: #000;
          border: none; border-radius: var(--radius-sm);
          padding: 12px 36px; font-family: var(--font-main);
          font-size: 0.95rem; font-weight: 800; cursor: pointer;
          transition: all var(--transition);
          box-shadow: 0 4px 15px color-mix(in srgb, var(--badge-color) 40%, transparent);
          text-transform: uppercase; letter-spacing: 0.5px;
        }
        .celebration-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 22px color-mix(in srgb, var(--badge-color) 60%, transparent);
          filter: brightness(1.1);
        }

        /* ── Scale animations ── */
        .animate-scale-up {
          animation: scaleUp 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
        @keyframes scaleUp {
          0% { transform: scale(0.7); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }

        @media (max-width: 960px) {
          .page-aside { display: none; }
          .topnav-links { display: none; }
          .mobile-menu-btn { display: flex; }
          .topnav-inner { justify-content: space-between; }
          .topnav-right { margin-left: 0; }
          .page-body { padding: 20px 16px; }
        }
      `}</style>
    </div>
  );
};

export default DashboardLayout;
