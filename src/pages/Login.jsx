import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { LogIn, ArrowLeft } from 'lucide-react';
import LogoLight from '../assets/Kreative vit sin fondo letra negra.png';
import LogoDark from '../assets/Kreative vit sin fondo letra blanca.png';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [statsData, setStatsData] = useState(null);
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();

  const [failedAttempts, setFailedAttempts] = useState(() => {
    return parseInt(localStorage.getItem('kreative_failed_attempts') || '0', 10);
  });
  const [lockoutUntil, setLockoutUntil] = useState(() => {
    return parseInt(localStorage.getItem('kreative_lockout_until') || '0', 10);
  });
  const [lockoutMsg, setLockoutMsg] = useState('');

  React.useEffect(() => {
    if (lockoutUntil > Date.now()) {
      const interval = setInterval(() => {
        const now = Date.now();
        if (now >= lockoutUntil) {
          setLockoutMsg('');
          clearInterval(interval);
        } else {
          const remainingSeconds = Math.ceil((lockoutUntil - now) / 1000);
          const mins = Math.floor(remainingSeconds / 60);
          const secs = remainingSeconds % 60;
          setLockoutMsg(`Acceso bloqueado por seguridad. Intenta en ${mins}:${secs.toString().padStart(2, '0')}`);
        }
      }, 1000);
      
      const now = Date.now();
      if (now < lockoutUntil) {
        const remainingSeconds = Math.ceil((lockoutUntil - now) / 1000);
        const mins = Math.floor(remainingSeconds / 60);
        const secs = remainingSeconds % 60;
        setLockoutMsg(`Acceso bloqueado por seguridad. Intenta en ${mins}:${secs.toString().padStart(2, '0')}`);
      }
      return () => clearInterval(interval);
    } else {
      setLockoutMsg('');
    }
  }, [lockoutUntil]);

  React.useEffect(() => {
    fetch('https://kreative-vit.alphadocere.cl/api/stats.php')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setStatsData(data);
        }
      })
      .catch(err => console.error("Error fetching stats:", err));
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (lockoutUntil > Date.now()) return;
    if (!email.trim() || !password.trim()) return;
    setLoading(true);
    setErrorMsg('');

    try {
      const response = await fetch('https://systemauth.alphadocere.cl/login.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password })
      });

      const data = await response.json();

      if (data.success) {
        setFailedAttempts(0);
        localStorage.removeItem('kreative_failed_attempts');
        localStorage.removeItem('kreative_lockout_until');

        localStorage.setItem('practicante_token', data.token);
        localStorage.setItem('practicante_user', data.user.nombre);
        localStorage.setItem('practicante_email', data.user.email);

        let localRole = data.user.rol || 'usuario';

        // EXTRAER ROL ESPECÍFICO PARA KREATIVE VIT
        let roleParaVit = null;

        // Regla absoluta para los superadministradores (Ignora system_auth)
        if (data.user.email === 'rjoseeliecer@gmail.com' || data.user.email === 'mauro.rojas@alphadocere.cl') {
          roleParaVit = data.user.email === 'mauro.rojas@alphadocere.cl' ? 'lider' : 'admin';
        } else if (data.roles && Array.isArray(data.roles)) {
          const vitRole = data.roles.find(r => 
             (r.nombre_proyecto && r.nombre_proyecto.toLowerCase().includes('vit')) || 
             r.proyecto_id === 4
          );
          
          if (vitRole) {
              const rName = (vitRole.nombre_rol || '').toLowerCase();
              if (rName.includes('admin') || vitRole.rol_id === 12) roleParaVit = 'admin';
              else if (rName.includes('lider')) roleParaVit = 'lider';
              else roleParaVit = 'usuario';
          }
        }
        
        const rolAEnviar = roleParaVit || data.user.rol || (data.user.es_admin == true || data.user.es_admin === "1" || data.user.es_admin === "true" ? 'admin' : 'usuario');

        // Sincronizar usuario con la BD local de Kreative Vit y registrar sesión
        try {
          const syncRes = await fetch('https://kreative-vit.alphadocere.cl/api/syncUser.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              client_id: data.user.id || data.user.client_id || 0,
              nombre: data.user.nombre,
              email: data.user.email,
              rol: rolAEnviar
            })
          });
          const syncData = await syncRes.json();
          if (syncData.success && syncData.rol) {
            localRole = syncData.rol;
          } else {
            localRole = rolAEnviar; // Fallback si falla la sincronización pero devolvió 200
          }
        } catch (syncErr) {
          console.error("Error al sincronizar usuario en BD local:", syncErr);
          localRole = rolAEnviar; // Fallback en caso de error de red
        }

        // Fetch data from MySQL Backend to sync with LocalStorage
        try {
          const logsResponse = await fetch('https://kreative-vit.alphadocere.cl/api/fetchLogs.php');
          const logsData = await logsResponse.json();
          if (logsData.success) {
            localStorage.setItem('practicantes_bitacoras', JSON.stringify(logsData.bitacoras));
            localStorage.setItem('practicantes_fellows', JSON.stringify(logsData.fellows));
          }
        } catch (fetchErr) {
          console.error("Error syncing MySQL data:", fetchErr);
        }

        // Define if user is admin based on local database role
        const isAdmin = (localRole === 'admin' || localRole === 'lider' || localRole === 'administrador') ? 'true' : 'false';
        localStorage.setItem('practicante_is_admin', isAdmin);

        if (isAdmin === 'true') {
          navigate('/dashboard/admin');
        } else {
          navigate('/dashboard/bitacora');
        }
      } else {
        const newAttempts = failedAttempts + 1;
        setFailedAttempts(newAttempts);
        localStorage.setItem('kreative_failed_attempts', newAttempts);

        if (newAttempts % 3 === 0) {
          const penaltyTiers = [1, 5, 15, 30, 60]; // Minutos de penalización progresiva
          const tierIndex = Math.min((newAttempts / 3) - 1, penaltyTiers.length - 1);
          const penaltyMinutes = penaltyTiers[tierIndex];
          const lockUntilTime = Date.now() + (penaltyMinutes * 60 * 1000);
          
          setLockoutUntil(lockUntilTime);
          localStorage.setItem('kreative_lockout_until', lockUntilTime);
          setErrorMsg(''); 
        } else {
          setErrorMsg(data.error || data.message || 'Credenciales incorrectas');
        }
      }
    } catch (err) {
      console.error(err);
      setErrorMsg('Error de conexión con el servidor. Verifica que XAMPP esté activo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-wrapper">
      {/* LEFT PANEL — Branding */}
      <div className="login-brand animate-fade-left">
        <div className="brand-blob" />
        <div className="brand-content">
          <div className="brand-logo-wrap">
            <img
              src={isDarkMode ? LogoDark : LogoLight}
              alt="Kreative"
              className="brand-logo"
            />
          </div>
          <h2 className="brand-headline">
            Bienvenido/a a<br />
            <span className="text-gradient">Kreative Vit</span>
          </h2>
          <p className="brand-sub">
            El sistema de bitácora interna de usuarios de Alpha Docere.
          </p>
          <div className="brand-stats">
            <div className="stat">
              <span className="stat-num">{statsData ? statsData.generation : '...'}</span>
              <span className="stat-label">Generación actual</span>
            </div>
            <div className="stat-divider" />
            <div className="stat">
              <span className="stat-num">{statsData ? `${statsData.active_users}+` : '...'}</span>
              <span className="stat-label">Practicantes registrados</span>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT PANEL — Form */}
      <div className="login-form-panel animate-fade-right">
        <div className="login-form-inner glass-panel">
          <button onClick={() => navigate('/')} className="login-back">
            <ArrowLeft size={16} /> Volver
          </button>

          <div className="login-form-header">
            <h3>Inicia sesión</h3>
          </div>

          {lockoutMsg && (
            <div className="login-error-msg animate-fade-up" style={{ borderColor: '#ef4444', backgroundColor: 'rgba(239, 68, 68, 0.15)' }}>
              {lockoutMsg}
            </div>
          )}

          {!lockoutMsg && errorMsg && (
            <div className="login-error-msg animate-fade-up">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleLogin} className="login-form">
            <div className="input-group">
              <label htmlFor="email">Correo Electrónico / Usuario</label>
              <input
                type="text"
                id="email"
                placeholder="tu.correo@alpha2r.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="off"
                disabled={!!lockoutMsg}
              />
            </div>
            <div className="input-group">
              <label htmlFor="password">Contraseña</label>
              <input
                type="password"
                id="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={!!lockoutMsg}
              />
            </div>

            <button type="submit" className="btn-primary login-btn" disabled={loading || !!lockoutMsg}>
              {loading ? (
                <span className="spinner" />
              ) : (
                <><LogIn size={18} /> Ingresar al Panel</>
              )}
            </button>
          </form>

          <p className="login-footer-note">
            De joseph para Alpha Docere
          </p>
        </div>
      </div>

      <style>{`
        .login-wrapper {
          position: relative; z-index: 1;
          width: 100vw; min-height: 100vh;
          display: flex; overflow: hidden;
        }

        /* LEFT */
        .login-brand {
          flex: 1; position: relative;
          background: linear-gradient(145deg, var(--primary) 0%, #1a6b32 100%);
          display: flex; align-items: center; justify-content: center;
          padding: 60px 50px; overflow: hidden;
        }
        .brand-blob {
          position: absolute; width: 600px; height: 600px;
          background: rgba(255,255,255,0.08); border-radius: 50%;
          top: -100px; left: -200px;
        }
        .brand-content { position: relative; z-index: 1; color: #fff; }
        .brand-logo-wrap { margin-bottom: 32px; }
        .brand-logo { height: 55px; object-fit: contain; filter: brightness(0) invert(1); }
        .brand-headline {
          font-family: var(--font-display);
          font-size: 2.8rem; font-weight: 800;
          line-height: 1.15; margin-bottom: 16px; color: #fff;
        }
        .brand-headline .text-gradient {
          background: linear-gradient(135deg, #c8f5d4, #7fcf8e);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
        }
        .brand-sub { font-size: 1rem; opacity: 0.85; line-height: 1.65; margin-bottom: 40px; max-width: 360px; }
        .brand-stats { display: flex; align-items: center; gap: 24px; }
        .stat { display: flex; flex-direction: column; gap: 4px; }
        .stat-num { font-size: 2rem; font-weight: 800; color: #fff; }
        .stat-label { font-size: 0.82rem; opacity: 0.7; }
        .stat-divider { width: 1px; height: 40px; background: rgba(255,255,255,0.3); }

        /* RIGHT */
        .login-form-panel {
          width: 480px; flex-shrink: 0;
          display: flex; align-items: center; justify-content: center;
          padding: 40px 36px;
          perspective: 1200px;
        }
        .login-form-inner {
          width: 100%; padding: 40px 36px; border-radius: var(--radius-lg);
          position: relative;
          background: var(--bg-card);
          box-shadow: 
            0 20px 40px rgba(0,0,0,0.1),
            -10px 10px 20px rgba(0,0,0,0.05),
            0 0 10px rgba(57, 255, 20, 0.1);
          border: 1px solid rgba(57, 255, 20, 0.2);
          transform: rotateX(4deg) rotateY(-6deg);
          transform-style: preserve-3d;
          transition: transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275), box-shadow 0.4s ease, border-color 0.4s ease;
        }
        .login-form-inner:hover {
          transform: rotateX(0deg) rotateY(0deg) translateY(-5px);
          border-color: #39ff14;
          box-shadow: 
            0 30px 60px rgba(0,0,0,0.2),
            0 15px 25px rgba(0,0,0,0.1),
            0 0 20px rgba(57, 255, 20, 0.6),
            0 0 40px rgba(57, 255, 20, 0.3),
            inset 0 0 10px rgba(57, 255, 20, 0.2);
        }
        .login-back {
          display: inline-flex; align-items: center; gap: 6px;
          background: none; border: none; cursor: pointer;
          color: var(--text-muted); font-size: 0.85rem; font-weight: 500;
          padding: 0; margin-bottom: 28px; transition: color var(--transition);
        }
        .login-back:hover { color: var(--primary); }
        .login-form-header { margin-bottom: 28px; }
        .login-form-header h3 { font-size: 1.7rem; font-weight: 700; color: var(--text-main); margin-bottom: 6px; }
        .login-form-header p  { font-size: 0.9rem; color: var(--text-muted); }

        .login-error-msg {
          background: rgba(239, 68, 68, 0.1);
          color: var(--danger);
          padding: 12px 16px;
          border-left: 4px solid var(--danger);
          border-radius: 4px;
          font-size: 0.88rem;
          font-weight: 600;
          margin-bottom: 24px;
        }

        .login-btn { margin-top: 8px; min-height: 48px; }
        .spinner {
          width: 20px; height: 20px; border-radius: 50%;
          border: 2.5px solid rgba(255,255,255,0.3);
          border-top-color: white;
          animation: spin 0.7s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        .login-footer-note {
          text-align: center; font-size: 0.78rem;
          color: var(--text-subtle); margin-top: 20px;
        }

        @media (max-width: 768px) {
          .login-wrapper { flex-direction: column; }
          .login-brand { padding: 40px 24px; flex: none; }
          .brand-headline { font-size: 2rem; }
          .brand-stats { display: none; }
          .login-form-panel { width: 100%; padding: 24px 16px; }
        }
      `}</style>
    </div>
  );
};

export default Login;
