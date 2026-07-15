import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Lock, ZoomIn } from 'lucide-react';

export const INSIGNIAS_DATA = [
  // Especiales
  { id: 18, block: 'special', type: 'special', title: 'El Creador', desc: 'Insignia exclusiva de Joseph Joestar, desarrollador principal y creador de Kreative Vit.', image: '/insignias/insignia creador.png', color: '#39ff14', hint: 'No se puede conseguir. Se otorga únicamente a Joseph Joestar por la creación y desarrollo de Kreative Vit.' },
  { id: 28, block: 'special', type: 'special', title: 'Generación 17', desc: 'Insignia de honor exclusiva otorgada a los integrantes de la Generación 17 (Fundadora).', image: '/insignias/Gen 17.png', color: '#00f0ff', hint: 'Se otorga automáticamente a todos los practicantes que pertenezcan a la Generación 17.' },
  { id: 29, block: 'special', type: 'special', title: 'Generación 18', desc: 'Insignia de honor exclusiva otorgada a los integrantes de la Generación 18.', image: '/insignias/Gen 18.png', color: '#00f0ff', hint: 'Se otorga automáticamente a todos los practicantes que pertenezcan a la Generación 18.' },
  { id: 30, block: 'special', type: 'special', title: 'Generación 19', desc: 'Insignia de honor exclusiva otorgada a los integrantes de la Generación 19.', image: '/insignias/Gen 19.png', color: '#a855f7', hint: 'Se otorga automáticamente a todos los practicantes que pertenezcan a la Generación 19.' },
  { id: 31, block: 'special', type: 'special', title: 'Generación 20', desc: 'Insignia de honor exclusiva otorgada a los integrantes de la Generación 20.', image: '/insignias/Gen 20.png', color: '#facc15', hint: 'Se otorga automáticamente a todos los practicantes que pertenezcan a la Generación 20.' },
  { id: 32, block: 'special', type: 'special', title: 'Generación 21', desc: 'Insignia de honor exclusiva otorgada a los integrantes de la Generación 21.', image: '/insignias/Gen 21.png', color: '#ec4899', hint: 'Se otorga automáticamente a todos los practicantes que pertenezcan a la Generación 21.' },
  { id: 33, block: 'special', type: 'special', title: 'Generación 22', desc: 'Insignia de honor exclusiva otorgada a los integrantes de la Generación 22.', image: '/insignias/Gen 22.png', color: '#ef4444', hint: 'Se otorga automáticamente a todos los practicantes que pertenezcan a la Generación 22.' },
  { id: 34, block: 'special', type: 'special', title: 'Generación 23', desc: 'Insignia de honor exclusiva otorgada a los integrantes de la Generación 23.', image: '/insignias/Gen 23.png', color: '#10b981', hint: 'Se otorga automáticamente a todos los practicantes que pertenezcan a la Generación 23.' },
  { id: 35, block: 'special', type: 'special', title: 'Generación 24', desc: 'Insignia de honor exclusiva otorgada a los integrantes de la Generación 24.', image: '/insignias/Gen 24.png', color: '#f97316', hint: 'Se otorga automáticamente a todos los practicantes que pertenezcan a la Generación 24.' },
  { id: 36, block: 'special', type: 'special', title: 'Generación 25', desc: 'Insignia de honor exclusiva otorgada a los integrantes de la Generación 25.', image: '/insignias/Gen 25.png', color: '#3b82f6', hint: 'Se otorga automáticamente a todos los practicantes que pertenezcan a la Generación 25.' },
  { id: 37, block: 'special', type: 'special', title: 'Generación 26', desc: 'Insignia de honor exclusiva otorgada a los integrantes de la Generación 26.', image: '/insignias/Gen 26.png', color: '#ec4899', hint: 'Se otorga automáticamente a todos los practicantes que pertenezcan a la Generación 26.' },
  { id: 38, block: 'special', type: 'special', title: 'Generación 27', desc: 'Insignia de honor exclusiva otorgada a los integrantes de la Generación 27.', image: '/insignias/Gen 27.png', color: '#14b8a6', hint: 'Se otorga automáticamente a todos los practicantes que pertenezcan a la Generación 27.' },
  { id: 39, block: 'special', type: 'special', title: 'Generación 28', desc: 'Insignia de honor exclusiva otorgada a los integrantes de la Generación 28.', image: '/insignias/Gen 28.png', color: '#6366f1', hint: 'Se otorga automáticamente a todos los practicantes que pertenezcan a la Generación 28.' },
  { id: 40, block: 'special', type: 'special', title: 'Generación 29', desc: 'Insignia de honor exclusiva otorgada a los integrantes de la Generación 29.', image: '/insignias/Gen 29.png', color: '#39ff14', hint: 'Se otorga automáticamente a todos los practicantes que pertenezcan a la Generación 29.' },

  // Nuevas Especiales de Texto
  { id: 41, block: 'special', type: 'special', title: 'Git Master', desc: '¡Publicaste tu primera rama en Git y dominas el control de versiones!', image: '/insignias/Git.png', color: '#f05032', hint: 'Escribe en tu bitácora que publicaste tu primera rama en Git.' },
  { id: 42, block: 'special', type: 'special', title: 'cPanel Explorer', desc: '¡Aprendiste a administrar servidores y configurar cPanel con éxito!', image: '/insignias/Cpanel.png', color: '#ff7600', hint: 'Menciona en tu bitácora que aprendiste a utilizar cPanel.' },
  { id: 43, block: 'special', type: 'special', title: 'Wiki Contribuidor', desc: '¡Aportaste tu primer artículo de documentación en la Wiki de Kreative!', image: '/insignias/Primer aporte a la wiki.png', color: '#3b82f6', hint: 'Escribe en tu bitácora que publicaste o realizaste un aporte en la Wiki.' },
  { id: 44, block: 'special', type: 'special', title: 'Voz Activa', desc: '¡Participaste como invitado o panelista en un episodio del Podcast de Kreative!', image: '/insignias/podcast.png', color: '#ec4899', hint: 'Menciona en tu bitácora que participaste en un Podcast.' },
  { id: 45, block: 'special', type: 'special', title: 'Matriz de Eisenhower', desc: '¡Dominas la priorización y organizas tus tareas diarias con precisión estratégica!', image: '/insignias/Matriz de eisenhower.png', color: '#328f49', hint: 'Menciona en tu bitácora que organizaste o priorizaste tu día usando la Matriz de Eisenhower.' },
  { id: 46, block: 'special', type: 'special', title: 'Bug Hunter', desc: '¡Corregiste errores críticos, eliminaste bugs y dejaste el código impecable en producción!', image: '/insignias/Fix y bugs.png', color: '#ef4444', hint: 'Escribe en tu bitácora que corregiste errores, solucionaste bugs o realizaste un fix.' },
  { id: 47, block: 'special', type: 'special', title: 'Líder Alpha Docere', desc: 'Insignia de honor exclusiva otorgada a Mauro Rojas, Jefe y Líder Supremo de Alpha Docere.', image: '/insignias/Mauro rojas.png', color: '#facc15', hint: 'Insignia legendaria exclusiva de Mauro Rojas. No se puede conseguir.' },
  { id: 48, block: 'special', type: 'special', title: 'Miembro de la Comunidad', desc: 'Insignia de honor otorgada a los integrantes y colaboradores generales de la comunidad Kreative Vit.', image: '/insignias/Usuarios.png', color: '#a855f7', hint: 'Insignia otorgada automáticamente a usuarios registrados fuera de las generaciones de prácticas 18-58.' },

  // Bloque 1
  { id: 1, block: 'block1', type: 'hito', req: 1, title: 'Mente Abierta', desc: 'El primer paso. Te atreviste a vaciar tu mente por primera vez.', image: '/insignias/Mente abierta.png', color: '#facc15', hint: 'Escribe 1 bitácora.' },
  { id: 2, block: 'block1', type: 'racha', req: 3, title: 'Primer Impulso', desc: 'Tres días sin parar. El inicio de un compromiso personal.', image: '/insignias/primer impulso.png', color: '#f97316', hint: 'Consigue una racha de 3 días seguidos.' },
  { id: 3, block: 'block1', type: 'hito', req: 7, title: 'Mente Ligera', desc: 'Una semana entera acumulada dejando ir las cargas del día.', image: '/insignias/Mente ligera.png', color: '#fbbf24', hint: 'Escribe 7 bitácoras.' },
  { id: 4, block: 'block1', type: 'racha', req: 7, title: 'Semana Imparable', desc: 'Una semana perfecta sin romper la cadena de bienestar.', image: '/insignias/Semana imparable.png', color: '#ef4444', hint: 'Consigue una racha de 7 días seguidos.' },
  { id: 5, block: 'block1', type: 'hito', req: 15, title: 'Cable a Tierra', desc: 'Quince bitácoras escritas. La plataforma ya es un punto de apoyo.', image: '/insignias/Cable a tierra.png', color: '#3b82f6', hint: 'Escribe 15 bitácoras.' },
  { id: 6, block: 'block1', type: 'racha', req: 14, title: 'Ritmo Constante', desc: 'Dos semanas seguidas escribiendo; el hábito empieza a costar menos.', image: '/insignias/Ritmo Constante.png', color: '#6366f1', hint: 'Consigue una racha de 14 días seguidos.' },
  { id: 7, block: 'block1', type: 'hito', req: 21, title: 'Zis-Zas Mental', desc: 'El tiempo estimado por la psicología para fijar un hábito.', image: '/insignias/Zis-Zas mental.png', color: '#ec4899', hint: 'Escribe 21 bitácoras.' },
  { id: 8, block: 'block1', type: 'hito', req: 30, title: 'Hábitat de Calma', desc: 'Un mes completo cuidando la salud mental. Un refugio consolidado.', image: '/insignias/Habitad de calma.png', color: '#10b981', hint: 'Escribe 30 bitácoras.' },
  { id: 9, block: 'block1', type: 'racha', req: 30, title: 'Mes Inquebrantable', desc: 'Un mes entero sin fallar un solo día. Disciplina pura.', image: '/insignias/Mes Inquebrantable.png', color: '#06b6d4', hint: 'Consigue una racha de 30 días seguidos.' },

  // Bloque 2
  { id: 10, block: 'block2', type: 'hito', req: 45, title: 'Paso a Paso', desc: 'Capacidad de seguir adelante pese a la frustración.', image: '/insignias/Paso a paso.png', color: '#8b5cf6', hint: 'Escribe 45 bitácoras.' },
  { id: 11, block: 'block2', type: 'racha', req: 45, title: 'Flujo de Paz', desc: 'Mes y medio drenando el estrés diariamente de forma automática.', image: '/insignias/Flujo de paz.png', color: '#14b8a6', hint: 'Consigue una racha de 45 días seguidos.' },
  { id: 12, block: 'block2', type: 'hito', req: 60, title: 'Escudo de Papel', desc: 'Escribir se ha convertido en la mejor defensa contra el burnout.', image: '/insignias/Escudo de papel.png', color: '#64748b', hint: 'Escribe 60 bitácoras.' },
  { id: 13, block: 'block2', type: 'racha', req: 60, title: 'Mente de Acero', desc: 'Dos meses seguidos sin interrupciones. Constancia admirable.', image: '/insignias/Mente de acero corazon de seda.png', color: '#94a3b8', hint: 'Consigue una racha de 60 días seguidos.' },

  // Bloque 3
  { id: 14, block: 'block3', type: 'hito', req: 75, title: 'Foco Claro', desc: 'Claridad y calma en medio de cualquier tormenta diaria.', image: '/insignias/Fcoco Claro.png', color: '#d946ef', hint: 'Escribe 75 bitácoras.' },
  { id: 15, block: 'block3', type: 'racha', req: 75, title: 'Faro en la Tormenta', desc: 'Casi tres meses seguidos siendo el propio guía de tu bienestar.', image: '/insignias/Faro en la tormenta.png', color: '#f59e0b', hint: 'Consigue una racha de 75 días seguidos.' },
  { id: 16, block: 'block3', type: 'hito', req: 90, title: 'Maestría Interior', desc: 'El gran logro. 90 días priorizándose y manteniendo la frustración a raya.', image: '/insignias/Maestria interior.png', color: '#eab308', hint: 'Escribe 90 bitácoras.' },
  { id: 17, block: 'block3', type: 'racha', req: 90, title: 'Zen Absoluto', desc: 'Tres meses seguidos sin romper la cadena ni un solo día. Olimpo VIP.', image: '/insignias/Zen absoluto  olimpo vip.png', color: '#fbbf24', hint: 'Consigue una racha de 90 días seguidos.' },

  // Bloque 4: La Escritura Interior
  { id: 19, block: 'block4', type: 'words', title: 'Bitácora Viva', desc: 'Las palabras ya comenzaron a construir una historia personal dentro de la plataforma.', image: '/insignias/vitacora viva.png', color: '#34d399', hint: 'Escribe más de 5,000 palabras acumuladas en tus bitácoras.' },
  { id: 20, block: 'block4', type: 'words', title: 'Mente en Movimiento', desc: 'La escritura dejó de ser algo ocasional y se convirtió en reflexión constante.', image: '/insignias/Mente en movimiento.png', color: '#3b82f6', hint: 'Escribe más de 10,000 palabras acumuladas en tus bitácoras.' },
  { id: 21, block: 'block4', type: 'words', title: 'Archivo Interior', desc: 'Una enorme colección de pensamientos, emociones y crecimiento acumulado.', image: '/insignias/Archivo Interior.png', color: '#a855f7', hint: 'Escribe más de 25,000 palabras acumuladas en tus bitácoras.' },

  // Bloque 5: Rituales del Día
  { id: 22, block: 'block5', type: 'time', title: 'Noctámbulo Sereno', desc: 'Encontrar calma y desahogo cuando el día finalmente se detiene.', image: '/insignias/Noctambulo sereno.png', color: '#1e1b4b', hint: 'Registra una bitácora por la noche (de 22:00 a 00:00).' },
  { id: 23, block: 'block5', type: 'time', title: 'Último Esfuerzo', desc: 'Incluso con cansancio, decides liberar tu mente antes de terminar el día.', image: '/insignias/Ultimo Esfuerzo.png', color: '#ef4444', hint: 'Registra una bitácora tarde en la noche o madrugada (de 00:00 a 04:00).' },
  { id: 24, block: 'block5', type: 'time', title: 'Inicio Ligero', desc: 'Comenzar el día dejando atrás la carga mental antes de enfrentar nuevas responsabilidades.', image: '/insignias/Inicio Lijero.png', color: '#facc15', hint: 'Registra una bitácora temprano en la mañana (de 06:00 a 09:00).' },

  // Bloque 6: Resiliencia Emocional
  { id: 25, block: 'block6', type: 'resilience', title: 'Volver a Empezar', desc: 'La verdadera constancia no es no caer, sino volver después de detenerse.', image: '/insignias/Volver a empezar.png', color: '#10b981', hint: 'Registra una bitácora tras una pausa de más de 3 días sin escribir.' },
  { id: 26, block: 'block6', type: 'resilience', title: 'Sigue Adelante', desc: 'Pequeños pasos sostenidos también construyen progreso emocional.', image: '/insignias/Sigue adelante.png', color: '#3b82f6', hint: 'Continúa registrando de manera constante tras haber retomado después de una pausa.' },
  { id: 27, block: 'block6', type: 'resilience', title: 'Constancia Real', desc: 'El bienestar no exige perfección, solo la decisión de seguir regresando.', image: '/insignias/Constancia Real.png', color: '#6366f1', hint: 'Acumula 60 días de bitácoras totales (no consecutivos).' }
];

export const getDynamicBadges = (fellows = [], myGen = null) => {
  let dynamicBadges = [];
  
  const injectGen = (genNum) => {
    if (genNum >= 30 && genNum <= 58 && !INSIGNIAS_DATA.find(b => b.id === 100 + genNum) && !dynamicBadges.find(b => b.id === 100 + genNum)) {
      dynamicBadges.push({
        id: 100 + genNum,
        block: 'special', type: 'special',
        title: `Generación ${genNum}`,
        desc: `Insignia especial en honor a los integrantes de la Generación ${genNum}.`,
        image: `/insignias/Gen ${genNum}.png`,
        color: ['#00f0ff', '#a855f7', '#facc15', '#ec4899', '#ef4444', '#10b981', '#f97316', '#3b82f6', '#14b8a6', '#6366f1', '#39ff14'][genNum % 11],
        hint: `Se otorga automáticamente a todos los practicantes que pertenezcan a la Generación ${genNum}.`
      });
    } else if (genNum > 58 && !INSIGNIAS_DATA.find(b => b.id === 200) && !dynamicBadges.find(b => b.id === 200)) {
      dynamicBadges.push({
        id: 200,
        block: 'special', type: 'special',
        title: `Gen Forever`,
        desc: `Insignia perpetua en honor a las nuevas generaciones de Alpha Docere.`,
        image: `/insignias/Gen Forever.png`,
        color: '#00f0ff',
        hint: `Se otorga automáticamente a las generaciones modernas.`
      });
    }
  };

  fellows.forEach(f => injectGen(parseInt(f.generation)));
  if (myGen) injectGen(parseInt(myGen));

  return [...INSIGNIAS_DATA, ...dynamicBadges];
};

export const sortBadgesByRarity = (badgesList) => {
  return [...badgesList].sort((a, b) => {
    const getRarityTier = (id) => {
      if (id === 18) return 1; // Creador
      if (id === 47) return 2; // Líder Alpha
      if (id >= 28 && id <= 40) return 3; // Generaciones base
      if (id >= 100 && id <= 200) return 3; // Generaciones extra
      if (id >= 41 && id <= 46) return 4; // Especiales (Git, cPanel...)
      if (id === 48) return 5; // Miembro comunidad
      return 6; // Resto
    };
    
    const tierA = getRarityTier(a.id);
    const tierB = getRarityTier(b.id);
    
    if (tierA !== tierB) return tierA - tierB;
    return a.id - b.id;
  });
};

export const Card3D = ({ badge, isUnlocked, onSelect }) => {
  const cardRef = useRef(null);
  const [tiltStyle, setTiltStyle] = useState({});
  const [sheenStyle, setSheenStyle] = useState({});
  const [active, setActive] = useState(false);

  const handleMouseMove = (e) => {
    const card = cardRef.current;
    const box = card.getBoundingClientRect();
    const x = e.clientX - box.left - box.width / 2;
    const y = e.clientY - box.top - box.height / 2;

    const rotateX = -(y / (box.height / 2)) * 18;
    const rotateY = (x / (box.width / 2)) * 18;

    const sheenX = ((e.clientX - box.left) / box.width) * 100;
    const sheenY = ((e.clientY - box.top) / box.height) * 100;

    setTiltStyle({
      transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.05, 1.05, 1.05)`
    });

    setSheenStyle({
      background: `radial-gradient(circle at ${sheenX}% ${sheenY}%, rgba(255, 255, 255, 0.45) 0%, transparent 60%)`,
      display: 'block'
    });
  };

  const handleMouseEnter = () => setActive(true);

  const handleMouseLeave = () => {
    setActive(false);
    setTiltStyle({});
    setSheenStyle({ display: 'none' });
  };

  const isSpecial = badge.type === 'special' || badge.id === 18 || badge.id >= 28;

  const cardClassName = `badge-3d-card ${isUnlocked ? 'unlocked' : 'locked'} ${active ? 'active' : ''} ${isSpecial && isUnlocked ? 'special-aura-glow' : ''}`;

  return (
    <div 
      ref={cardRef}
      className={cardClassName}
      style={{ ...tiltStyle, '--badge-color': badge.color }}
      onMouseMove={isUnlocked ? handleMouseMove : undefined}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={() => onSelect(badge)}
    >
      {!isUnlocked && (
        <div className="locked-badge-overlay">
          <Lock size={20} className="lock-icon-gfx" />
        </div>
      )}

      <div className="sheen-overlay" style={sheenStyle} />

      {isSpecial && (
        <div 
          className="creator-ribbon"
          style={{
            background: badge.id === 18
              ? 'linear-gradient(135deg, #10b981, #059669)'
              : badge.id === 47
                ? 'linear-gradient(135deg, #f59e0b, #d97706)'
                : badge.id === 48
                  ? 'linear-gradient(135deg, #8b5cf6, #6d28d9)'
                  : badge.title.includes('Generación') || badge.title.includes('Gen')
                    ? 'linear-gradient(135deg, #00d2ff, #0086b3)'
                    : 'linear-gradient(135deg, #f05032, #ff7600)'
          }}
        >
          {badge.id === 18 ? '👑 Creador' : badge.id === 47 ? '🎓 Líder Alpha' : badge.id === 48 ? '👥 Comunidad' : badge.title.includes('Gen') ? `✨ ${badge.title.replace('Generación ', 'Gen ')}` : '🔥 Especial'}
        </div>
      )}

      <div className="badge-3d-asset-container">
        {isSpecial && isUnlocked && (
          <div className="flame-container">
            <div className="flame-particle"></div>
            <div className="flame-particle"></div>
            <div className="flame-particle"></div>
            <div className="flame-particle"></div>
            <div className="flame-particle"></div>
          </div>
        )}
        <div className="asset-ring" style={{ boxShadow: isSpecial && isUnlocked ? `0 0 20px ${badge.color}` : '' }}>
          <img src={badge.image} alt={badge.title} className="badge-3d-image" />
          {isUnlocked && <div className="inner-glow-anim"></div>}
        </div>
      </div>

      <div className="badge-card-info">
        <h3>{badge.title}</h3>
        <p className="badge-brief-desc">{badge.desc}</p>
      </div>

      <div className="click-to-enlarge-tip">
        <span>🔍 Ver detalles</span>
      </div>
    </div>
  );
};

export const BadgeModalViewer = ({ selectedBadge, unlockedIds, onClose, hideSecretHints }) => {
  const [spinKey, setSpinKey] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const modalSheenRef = useRef(null);

  const isUnlocked = unlockedIds?.includes(selectedBadge.id) || false;
  const isSpecial = selectedBadge.type === 'special' || selectedBadge.id === 18 || selectedBadge.id >= 28;
  const isSecret = [18, 41, 42, 43, 44, 45, 46, 47].includes(selectedBadge.id);

  let displayHint = selectedBadge.hint;
  if (!isUnlocked && hideSecretHints && isSecret) {
    displayHint = "??? Requisito Oculto. No se revela el secreto de las insignias especiales.";
  }

  const handleModalMouseMove = (e) => {
    if (!modalSheenRef.current) return;
    const card = e.currentTarget;
    const box = card.getBoundingClientRect();
    const sheenX = ((e.clientX - box.left) / box.width) * 100;
    const sheenY = ((e.clientY - box.top) / box.height) * 100;
    modalSheenRef.current.style.background = `radial-gradient(circle at ${sheenX}% ${sheenY}%, rgba(255, 255, 255, 0.45) 0%, transparent 60%)`;
  };

  return createPortal(
    <div className="ins-modal-overlay badge-viewer-overlay" onClick={onClose}>
      {isZoomed ? (
        <div 
          className="fullscreen-coin-viewer"
          onClick={(e) => e.stopPropagation()}
          style={{ '--badge-color': selectedBadge.color }}
        >
          <button className="ins-modal-close-btn" onClick={onClose} title="Cerrar ventana ×">×</button>
          <button 
            className="ins-modal-zoom-btn active"
            onClick={() => setIsZoomed(false)}
            title="Volver a los detalles 🔍"
          >
            <ZoomIn size={22} />
          </button>

          <div className="fullscreen-coin-container">
            {isSpecial && isUnlocked && (
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
            )}
            
            <div className="coin-3d-wrapper large-coin-wrapper" title="¡Haz clic para girar la moneda en 3D!">
              <div 
                key={spinKey}
                className="coin-3d-spinning spin-trigger-anim"
                onClick={() => setSpinKey(prev => prev + 1)}
              >
                <div className={`coin-side coin-front ${isUnlocked ? '' : 'modal-locked-coin'}`}>
                  <img src={selectedBadge.image} alt={selectedBadge.title} className="modal-badge-img" />
                  <div className="modal-glow-wave"></div>
                </div>
                <div className={`coin-side coin-back ${isUnlocked ? '' : 'modal-locked-coin'}`}>
                  <img src={selectedBadge.image} alt={`${selectedBadge.title} back`} className="modal-badge-img back-image" />
                  <div className="modal-glow-wave"></div>
                </div>
              </div>
            </div>
          </div>

          <div className="fullscreen-coin-tip">
            <h3>{selectedBadge.title}</h3>
            <p>Haz clic en la insignia para girarla en 3D. Presiona la lupa para ver detalles.</p>
          </div>
        </div>
      ) : (
        <div 
          className={`ins-modal-card ${isSpecial && isUnlocked ? 'special-aura-glow' : ''}`}
          onClick={(e) => e.stopPropagation()} 
          onMouseMove={handleModalMouseMove}
          style={{ '--badge-color': selectedBadge.color }}
        >
          <div ref={modalSheenRef} className="sheen-overlay" style={{ display: 'block' }} />

          <button className="ins-modal-close-btn" onClick={onClose}>×</button>
          <button 
            className="ins-modal-zoom-btn"
            onClick={() => setIsZoomed(true)}
            title="Ampliar Insignia 🔍"
          >
            <ZoomIn size={22} />
          </button>

          {isSpecial && (
            <div 
              className="creator-ribbon"
              style={{
                background: selectedBadge.id === 18
                  ? 'linear-gradient(135deg, #10b981, #059669)'
                  : selectedBadge.id === 47
                    ? 'linear-gradient(135deg, #f59e0b, #d97706)'
                    : selectedBadge.id === 48
                      ? 'linear-gradient(135deg, #8b5cf6, #6d28d9)'
                      : selectedBadge.title.includes('Gen')
                        ? 'linear-gradient(135deg, #00d2ff, #0086b3)'
                        : 'linear-gradient(135deg, #f05032, #ff7600)',
                boxShadow: '0 3px 8px rgba(0,0,0,0.15)',
                textShadow: '-1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000',
                position: 'absolute', top: '24px', left: '30px'
              }}
            >
              {selectedBadge.id === 18 ? '👑 Creador' : selectedBadge.id === 47 ? '🎓 Líder Alpha' : selectedBadge.id === 48 ? '👥 Comunidad' : selectedBadge.title.includes('Gen') ? `✨ ${selectedBadge.title.replace('Generación ', 'Gen ')}` : '🔥 Especial'}
            </div>
          )}

          <div className="modal-asset-section">
            {isSpecial && isUnlocked && (
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
            )}
            <div className="coin-3d-wrapper" title="¡Haz clic en la moneda para hacerla girar!">
              <div 
                key={spinKey}
                className="coin-3d-spinning spin-trigger-anim"
                onClick={() => setSpinKey(prev => prev + 1)}
              >
                <div className={`coin-side coin-front ${isUnlocked ? '' : 'modal-locked-coin'}`}>
                  <img src={selectedBadge.image} alt={selectedBadge.title} className="modal-badge-img" />
                  <div className="modal-glow-wave"></div>
                </div>
                <div className={`coin-side coin-back ${isUnlocked ? '' : 'modal-locked-coin'}`}>
                  <img src={selectedBadge.image} alt={`${selectedBadge.title} back`} className="modal-badge-img back-image" />
                  <div className="modal-glow-wave"></div>
                </div>
              </div>
            </div>
          </div>

          <div className="modal-info-section">
            <h2>
              {selectedBadge.title}
              {!isUnlocked && <span className="modal-locked-tag">🔒 Bloqueada</span>}
            </h2>
            <p className="modal-badge-desc">{selectedBadge.desc}</p>
            
            <div className="modal-instruction-box">
              <span className="modal-box-icon">🏆</span>
              <div className="modal-box-content">
                <strong>Requisito de Desbloqueo</strong>
                <p>{displayHint.includes("No se puede") || displayHint.startsWith("???") ? displayHint : `Esta insignia se consigue: ${displayHint}`}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>,
    document.body
  );
};
