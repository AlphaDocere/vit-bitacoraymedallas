import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { ArrowRight, HeartPulse, Brain, Coffee, ShieldCheck } from 'lucide-react';
import Navbar from '../components/Navbar';

/* ── Custom Hook para contador animado ── */
const useCountUp = (end, duration = 2000) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (end === 0) return;
    let startTime = null;
    const animate = (currentTime) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);
      const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      setCount(Math.floor(easeProgress * end));
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [end, duration]);

  return count;
};

const Home = () => {
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();

  const isLoggedIn = !!localStorage.getItem('practicante_token');
  const isAdmin = localStorage.getItem('practicante_is_admin') === 'true';

  const handleHeroAction = () => {
    if (isLoggedIn) {
      if (isAdmin) {
        navigate('/dashboard/admin');
      } else {
        navigate('/dashboard/bitacora');
      }
    } else {
      navigate('/login');
    }
  };

  /* ── Spotlight State ── */
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });

  useEffect(() => {
    const handleGlobalMouseMove = (e) => {
      const x = (e.clientX / window.innerWidth) * 100;
      const y = (e.clientY / window.innerHeight) * 100;
      setMousePos({ x, y });
    };
    window.addEventListener('mousemove', handleGlobalMouseMove);
    return () => window.removeEventListener('mousemove', handleGlobalMouseMove);
  }, []);

  /* ── Stats ── */
  const [stats, setStats] = useState({ bitacoras: 0, usuarios: 0 });
  useEffect(() => {
    const stored = localStorage.getItem('practicantes_bitacoras');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        const uniqueUsers = new Set(parsed.map(b => b.practicante)).size;
        setStats({
          bitacoras: parsed.length,
          usuarios: uniqueUsers > 0 ? uniqueUsers : (localStorage.getItem('practicante_user') ? 1 : 0)
        });
      } catch { setStats({ bitacoras: 0, usuarios: 0 }); }
    } else {
      setStats({ bitacoras: 0, usuarios: localStorage.getItem('practicante_user') ? 1 : 0 });
    }
  }, []);

  const animUsuarios = useCountUp(stats.usuarios);

  return (
    <div className="home-page mental-health-notebook" style={{ '--x': `${mousePos.x}%`, '--y': `${mousePos.y}%` }}>

      {/* ── SIGNATURE ── */}
      <div className="signature-neon">Joseph Gen 17</div>

      {/* ── CUADERNO BACKGROUND ── */}
      <div className="notebook-grid"></div>
      <div className="notebook-margin"></div>
      <div className="spotlight-bg"></div>

      {/* ── SPIRAL BINDER HOLES ── */}
      <div className="binder-holes">
        {[...Array(15)].map((_, i) => (
          <div key={i} className="hole"></div>
        ))}
      </div>

      <Navbar />

      <main className="mh-container">

        {/* HERO SECTION */}
        <section className="mh-hero">

          {/* Left Text Content */}
          <div className="hero-text-content animate-fade-right">

            <div className="mh-badge">
              <HeartPulse size={16} className="text-danger" />
              Prioridad #1: Bienestar Dev
            </div>

            <h1 className="mh-title">
              Tu código importa. <br />
              <span className="text-primary">Tu mente importa más.</span>
            </h1>

            <p className="mh-desc">
              Kreative Vit es tu registro diario centralizado. Documenta las tareas que realizaste, planifica qué harás mañana, y pide ayuda técnica si estás bloqueado. Además, registra cómo te sientes para que tu líder pueda apoyarte si lo necesitas.
            </p>

            <div className="mh-actions">
              <button onClick={handleHeroAction} className="btn-mh-primary">
                {isLoggedIn ? 'Ir a mi Panel' : 'Comenzar mi bitácora'} <ArrowRight size={18} />
              </button>
            </div>

            <div className="mh-community">
              <p>Únete a <strong>{animUsuarios}</strong> usuarios que ya registran su día a día.</p>
            </div>

          </div>

          {/* Right Visual Content (3D VIT & Floating Faces) */}
          <div className="hero-visual-mh animate-fade-left">

            {/* The 3D VIT Text */}
            <div className="vit-3d-container">
              <div className="vit-3d-text">VIT</div>
            </div>

            {/* Floating Emotion Faces (Caras) */}
            <div className="face-card face-1">
              <div className="face-emoji">🤯</div>
              <div className="face-label">Saturado</div>
            </div>

            <div className="face-card face-2">
              <div className="face-emoji">🚀</div>
              <div className="face-label">Inspirado</div>
            </div>

            <div className="face-card face-3">
              <div className="face-emoji">🐛</div>
              <div className="face-label">Frustrado con un bug</div>
            </div>

            <div className="face-card face-4">
              <div className="face-emoji">🧘</div>
              <div className="face-label">Todo funciona</div>
            </div>

            {/* Floating Insignias (coins only, no text labels!) */}
            <div className="badge-float float-creador" style={{ '--aura-color': '#39ff14' }} title="El Creador">
              <img src="/insignias/insignia creador.png" alt="Creador" />
            </div>

            <div className="badge-float float-lider" style={{ '--aura-color': '#f59e0b' }} title="Líder Alpha Docere">
              <img src="/insignias/Mauro rojas.png" alt="Líder" />
            </div>

            <div className="badge-float float-gen17" style={{ '--aura-color': '#00f0ff' }} title="Generación 17">
              <img src="/insignias/Gen 17.png" alt="Gen 17" />
            </div>

            <div className="badge-float float-zigzag" style={{ '--aura-color': '#8b5cf6' }} title="ZigZag Mental">
              <img src="/insignias/Matriz de eisenhower.png" alt="Zig Zag" />
            </div>

            <div className="badge-float float-sigue" style={{ '--aura-color': '#10b981' }} title="Sigue Adelante">
              <img src="/insignias/Sigue adelante.png" alt="Sigue Adelante" />
            </div>

          </div>

        </section>

        {/* POST-IT FEATURES SECTION */}
        <section className="mh-features">
          <h2 className="section-title">¿Cómo te ayuda Kreative Vit?</h2>

          <div className="postit-grid">

            <div className="postit p-yellow animate-fade-up">
              <div className="tape"></div>
              <Brain size={28} className="p-icon" />
              <h3>Seguimiento Emocional</h3>
              <p>Al final de cada jornada, registras tu estado de ánimo. Si detectamos frustración constante, registramos una alerta de apoyo en el panel para intervenir antes del burnout.</p>
            </div>

            <div className="postit p-blue animate-fade-up" style={{ animationDelay: '100ms' }}>
              <div className="tape"></div>
              <Coffee size={28} className="p-icon" />
              <h3>Registro Diario</h3>
              <p>Anota de forma rápida y clara lo que hiciste hoy y qué harás mañana. Mantén un historial perfecto de tu progreso sin métricas agobiantes.</p>
            </div>

            <div className="postit p-pink animate-fade-up" style={{ animationDelay: '200ms' }}>
              <div className="tape"></div>
              <ShieldCheck size={28} className="p-icon" />
              <h3>Solicitud de Ayuda Técnica</h3>
              <p>¿Atrapado en un bloque de código o en un bug por horas? Documenta tu obstáculo y pide asistencia directamente para no frenar tu ritmo.</p>
            </div>

          </div>
        </section>

      </main>

      <style>{`
        .home-page.mental-health-notebook {
          min-height: 100vh;
          width: 100vw;
          overflow-x: hidden;
          position: relative;
        }

        /* ── NOTEBOOK BACKGROUND ── */
        .notebook-grid {
          position: absolute;
          inset: 0;
          background-image: 
            linear-gradient(to right, rgba(150, 150, 150, 0.08) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(150, 150, 150, 0.08) 1px, transparent 1px);
          background-size: 30px 30px;
          z-index: -2;
        }

        .notebook-margin {
          position: absolute;
          left: 100px;
          top: 0;
          bottom: 0;
          width: 2px;
          background-color: rgba(239, 68, 68, 0.2); /* Red notebook margin line */
          z-index: -1;
        }

        .binder-holes {
          position: absolute;
          left: 10px;
          top: 0;
          bottom: 0;
          width: 40px;
          display: flex;
          flex-direction: column;
          gap: 40px;
          padding-top: 80px;
          z-index: 10;
        }

        .hole {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: var(--bg-main);
          box-shadow: inset 3px 3px 6px rgba(0,0,0,0.4), inset -1px -1px 3px rgba(255,255,255,0.1);
          position: relative;
        }

        /* Spiral rings */
        .hole::after {
          content: '';
          position: absolute;
          left: -15px;
          top: 5px;
          width: 25px;
          height: 10px;
          background: linear-gradient(to bottom, #ccc, #fff, #999);
          border-radius: 5px;
          box-shadow: 0 4px 6px rgba(0,0,0,0.3);
          transform: rotate(-15deg);
        }

        .dark .hole::after {
          background: linear-gradient(to bottom, #444, #777, #222);
        }

        /* ── SIGNATURE (3D NEON) ── */
        .signature-neon {
          position: fixed;
          bottom: 30px; 
          right: 40px; 
          font-family: 'Brush Script MT', 'Lucida Handwriting', 'Segoe Script', cursive;
          font-size: 2.2rem; /* Necesita ser más grande para que el 3D no manche la letra cursiva */
          font-weight: 700;
          color: var(--bg-main);
          -webkit-text-stroke: 1px var(--text-main); 
          
          /* Efecto 3D Base Igual a VIT */
          transform: rotate(-10deg) skewX(-5deg) rotateY(10deg);
          transform-style: preserve-3d;
          text-shadow: 
            1px 1px 0 var(--primary),
            2px 2px 0 var(--primary),
            3px 3px 0 var(--primary),
            4px 4px 0 var(--primary),
            5px 5px 0 var(--primary),
            10px 10px 30px rgba(61, 170, 88, 0.5);
            
          transition: transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275), text-shadow 0.4s ease, color 0.4s ease;
          z-index: 100;
          cursor: pointer;
        }

        .signature-neon:hover {
          color: var(--bg-main);
          -webkit-text-stroke: 1px #39ff14; /* Borde frontal neón */
          transform: rotate(-5deg) skewX(-2deg) rotateY(30deg) scale(1.1);
          
          /* Extrusión 3D sólida verde neón igual a VIT */
          text-shadow: 
            1px 1px 0 #39ff14,
            2px 2px 0 #39ff14,
            3px 3px 0 #39ff14,
            4px 4px 0 #39ff14,
            5px 5px 0 #39ff14,
            6px 6px 0 #39ff14,
            7px 7px 0 #39ff14,
            8px 8px 0 #39ff14,
            9px 9px 0 #39ff14,
            10px 10px 0 #39ff14,
            15px 15px 40px rgba(57, 255, 20, 0.8),
            0 0 60px rgba(57, 255, 20, 0.6);
        }

        .mh-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: calc(var(--nav-height) + 60px) 40px 60px 140px; /* Left padding accounts for notebook margin */
        }

        /* ── HERO SECTION ── */
        .mh-hero {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 40px;
          align-items: center;
          margin-bottom: 120px;
        }

        .hero-text-content {
          max-width: 550px;
        }

        .mh-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 8px 16px;
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.2);
          border-radius: 99px;
          font-weight: 600;
          font-size: 0.9rem;
          color: var(--text-main);
          margin-bottom: 24px;
        }

        .text-danger { color: #ef4444; }
        .text-primary { color: var(--primary); }

        .mh-title {
          font-family: var(--font-display);
          font-size: clamp(2.8rem, 4.5vw, 4.5rem);
          line-height: 1.1;
          font-weight: 800;
          margin-bottom: 24px;
          letter-spacing: -0.02em;
        }

        .mh-desc {
          font-size: 1.2rem;
          color: var(--text-muted);
          line-height: 1.6;
          margin-bottom: 40px;
        }

        .btn-mh-primary {
          display: inline-flex;
          align-items: center;
          gap: 12px;
          padding: 18px 36px;
          background: var(--text-main);
          color: var(--bg-main);
          border: none;
          border-radius: 16px;
          font-size: 1.1rem;
          font-weight: 700;
          cursor: pointer;
          transition: transform 0.2s, box-shadow 0.2s;
        }

        .btn-mh-primary:hover {
          transform: translateY(-4px);
          box-shadow: 0 15px 30px rgba(61, 170, 88, 0.3);
          background: var(--primary);
          color: white;
        }

        .mh-community {
          display: flex;
          align-items: center;
          gap: 16px;
          margin-top: 40px;
          padding-top: 30px;
          border-top: 1px dashed var(--border);
        }

        .avatar-group {
          display: flex;
        }

        .fake-avatar {
          width: 40px; height: 40px;
          border-radius: 50%;
          background: var(--bg-card);
          border: 2px solid var(--border-strong);
          display: flex; align-items: center; justify-content: center;
          font-size: 1.2rem;
          margin-left: -12px;
        }
        .fake-avatar.a1 { margin-left: 0; z-index: 3; }
        .fake-avatar.a2 { z-index: 2; }
        .fake-avatar.a3 { z-index: 1; }

        .mh-community p {
          font-size: 0.95rem;
          color: var(--text-subtle);
        }

        .mh-community strong {
          color: var(--text-main);
        }

        /* ── RIGHT VISUAL: 3D VIT & FACES ── */
        .hero-visual-mh {
          position: relative;
          height: 600px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        /* 3D VIT Logo */
        .vit-3d-container {
          perspective: 1000px;
        }

        .vit-3d-text {
          font-family: var(--font-display);
          font-size: 13rem;
          font-weight: 900;
          color: var(--bg-main);
          -webkit-text-stroke: 2px var(--text-main);
          letter-spacing: -0.05em;
          transform: rotate(-10deg) skewX(-10deg) rotateY(10deg);
          transform-style: preserve-3d;
          text-shadow: 
            1px 1px 0 var(--primary),
            2px 2px 0 var(--primary),
            3px 3px 0 var(--primary),
            4px 4px 0 var(--primary),
            5px 5px 0 var(--primary),
            10px 10px 30px rgba(61, 170, 88, 0.5);
          transition: transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275), text-shadow 0.4s ease, color 0.4s ease;
        }

        .vit-3d-text:hover {
          /* Rotamos más en Y (30deg) para que se vea claramente "de lado" */
          transform: rotate(-5deg) skewX(-5deg) rotateY(30deg) scale(1.05);
          color: var(--bg-main);
          -webkit-text-stroke: 2px #39ff14; /* Borde frontal neón */
          
          /* Extrusión 3D sólida y extremadamente brillante (Verde Neón) */
          text-shadow: 
            1px 1px 0 #39ff14,
            2px 2px 0 #39ff14,
            3px 3px 0 #39ff14,
            4px 4px 0 #39ff14,
            5px 5px 0 #39ff14,
            6px 6px 0 #39ff14,
            7px 7px 0 #39ff14,
            8px 8px 0 #39ff14,
            9px 9px 0 #39ff14,
            10px 10px 0 #39ff14,
            11px 11px 0 #39ff14,
            12px 12px 0 #39ff14,
            13px 13px 0 #39ff14,
            14px 14px 0 #39ff14,
            15px 15px 0 #39ff14,
            16px 16px 0 #39ff14,
            17px 17px 0 #39ff14,
            18px 18px 0 #39ff14,
            19px 19px 0 #39ff14,
            20px 20px 0 #39ff14,
            25px 25px 60px rgba(57, 255, 20, 0.8),
            0 0 100px rgba(57, 255, 20, 0.6);
        }

        /* Floating Faces */
        .face-card {
          position: absolute;
          background: var(--bg-card);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          border: 1px solid var(--border-strong);
          border-radius: 99px;
          padding: 8px 16px 8px 8px;
          display: flex;
          align-items: center;
          gap: 12px;
          box-shadow: 0 10px 25px rgba(0,0,0,0.15);
        }

        .face-emoji {
          width: 40px; height: 40px;
          background: var(--bg-main);
          border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          font-size: 1.5rem;
          box-shadow: inset 0 2px 4px rgba(0,0,0,0.1);
        }

        .face-label {
          font-weight: 600;
          font-size: 0.9rem;
          color: var(--text-main);
        }

        /* Float Animations */
        @keyframes hover1 { 0%, 100% { transform: translateY(0) rotate(5deg); } 50% { transform: translateY(-15px) rotate(8deg); } }
        @keyframes hover2 { 0%, 100% { transform: translateY(0) rotate(-5deg); } 50% { transform: translateY(15px) rotate(-2deg); } }

        .face-1 { top: 15%; left: -10%; animation: hover1 6s ease-in-out infinite; z-index: 5; }
        .face-2 { top: 10%; right: 5%; animation: hover2 7s ease-in-out infinite; z-index: 5; }
        .face-3 { bottom: 20%; left: 0%; animation: hover2 5s ease-in-out infinite; z-index: 5; }
        .face-4 { bottom: 15%; right: -5%; animation: hover1 8s ease-in-out infinite; z-index: 5; }

        /* Custom Floating Insignias with beautiful glowing auras and balanced, non-overlapping orbits */
        .float-creador { top: 45%; left: 8%; animation: hover2 6.5s ease-in-out infinite; }
        .float-lider { top: -5%; left: 46%; animation: hover1 7.5s ease-in-out infinite; }
        .float-gen17 { top: 32%; right: 4%; animation: hover2 5.5s ease-in-out infinite; }
        .float-zigzag { bottom: -5%; left: 46%; animation: hover1 6.8s ease-in-out infinite; }
        .float-sigue { bottom: 32%; right: 4%; animation: hover2 7.2s ease-in-out infinite; }

        .badge-float {
          position: absolute;
          width: 54px; height: 54px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          border: 2px solid color-mix(in srgb, var(--aura-color) 40%, var(--border-strong));
          display: flex; align-items: center; justify-content: center;
          box-shadow: 
            0 10px 25px rgba(0,0,0,0.25),
            0 0 15px color-mix(in srgb, var(--aura-color) 45%, transparent);
          transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
          cursor: pointer;
          z-index: 6;
        }
        .badge-float img {
          width: 82%; height: 82%;
          object-fit: contain;
        }
        .badge-float:hover {
          transform: scale(1.22) translateY(-6px) !important;
          box-shadow: 
            0 15px 35px rgba(0,0,0,0.35),
            0 0 30px var(--aura-color);
          border-color: var(--aura-color);
          z-index: 10;
        }


        /* ── POST-IT FEATURES ── */
        .mh-features {
          padding-top: 40px;
        }

        .section-title {
          font-family: var(--font-display);
          font-size: 2.5rem;
          text-align: center;
          margin-bottom: 60px;
        }

        .postit-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 40px;
        }

        .postit {
          position: relative;
          padding: 40px 30px;
          border-radius: 2px 2px 20px 2px;
          box-shadow: 2px 10px 20px rgba(0,0,0,0.1);
          color: #1f2937; /* Dark text for post-its to look realistic */
          transition: transform 0.3s;
        }

        .postit:hover {
          transform: scale(1.05) rotate(0deg) !important;
          z-index: 10;
        }

        .dark .postit {
          color: #f3f4f6; /* Light text for dark mode */
          box-shadow: 5px 15px 30px rgba(0,0,0,0.4);
        }

        /* Post-it colors */
        .p-yellow { 
          background: #fef08a; 
          transform: rotate(-2deg);
        }
        .dark .p-yellow { background: rgba(234, 179, 8, 0.15); border: 1px solid rgba(234, 179, 8, 0.3); }

        .p-blue { 
          background: #bfdbfe; 
          transform: rotate(1deg);
        }
        .dark .p-blue { background: rgba(59, 130, 246, 0.15); border: 1px solid rgba(59, 130, 246, 0.3); }

        .p-pink { 
          background: #fbcfe8; 
          transform: rotate(-1.5deg);
        }
        .dark .p-pink { background: rgba(236, 72, 153, 0.15); border: 1px solid rgba(236, 72, 153, 0.3); }

        /* Scotch Tape */
        .tape {
          position: absolute;
          top: -15px; left: 50%;
          transform: translateX(-50%) rotate(-3deg);
          width: 80px; height: 30px;
          background: rgba(255,255,255,0.4);
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
          border-radius: 2px;
        }

        .dark .tape {
          background: rgba(255,255,255,0.1);
        }

        .p-icon {
          margin-bottom: 20px;
          opacity: 0.8;
        }

        .postit h3 {
          font-size: 1.4rem;
          font-weight: 800;
          margin-bottom: 12px;
        }

        .postit p {
          font-size: 1.05rem;
          line-height: 1.5;
          opacity: 0.9;
        }

        @media (max-width: 1024px) {
          .mh-container { padding-left: 24px; padding-top: calc(var(--nav-height) + 20px); }
          .notebook-margin, .binder-holes { display: none; } /* Hide binder on mobile */
          .mh-hero { grid-template-columns: 1fr; text-align: center; gap: 60px; }
          .hero-text-content { margin: 0 auto; }
          .mh-community { justify-content: center; }
          .mh-actions { justify-content: center; }
          .vit-3d-text { font-size: 8rem; }
          .face-card { transform: scale(0.8); }
          .badge-float { display: none !important; }
          .face-1 { top: 0; left: 0; }
          .face-2 { top: -10%; right: 0; }
          .face-3 { bottom: 0; left: 0; }
          .face-4 { bottom: -10%; right: 0; }
          .postit-grid { grid-template-columns: 1fr; max-width: 400px; margin: 0 auto; }
        }
      `}</style>
    </div>
  );
};

export default Home;
