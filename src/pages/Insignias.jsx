import React, { useState, useEffect } from 'react';
import { Filter } from 'lucide-react';
import { INSIGNIAS_DATA, getDynamicBadges, sortBadgesByRarity, Card3D, BadgeModalViewer } from '../components/BadgeViewer';

const Insignias = () => {
  const [selectedBadge, setSelectedBadge] = useState(null);
  const [activeFilter, setActiveFilter] = useState('all');
  
  // Combine static and dynamic badges for the catalogue
  const userGen = localStorage.getItem('practicante_generation') || '17';
  const allBadges = getDynamicBadges([], userGen);
  
  const [unlockedIds, setUnlockedIds] = useState(allBadges.map(b => b.id));

  // Sync unlocked badges on mount
  useEffect(() => {
    // Force all badges to be unlocked so the user can fully inspect them
    setUnlockedIds(allBadges.map(b => b.id));
  }, []);

  const handleSelectBadge = (badge) => {
    setSelectedBadge(badge);
  };

  const getMatchingGenBadgeId = (genStr) => {
    const gen = parseInt(genStr);
    if (gen === 17) return 28;
    if (gen >= 18 && gen <= 29) return 29 + (gen - 18);
    if (gen >= 30) return 100 + gen;
    return null;
  };
  
  const matchingGenBadgeId = getMatchingGenBadgeId(userGen);

  const filteredBadges = sortBadgesByRarity(
    (activeFilter === 'all' 
      ? allBadges 
      : allBadges.filter(b => b.block === activeFilter)
    ).filter(b => {
      const id = parseInt(b.id);
      // Ocultar generaciones que no son la tuya
      if ((id >= 28 && id <= 40) || id >= 100) {
        if (id === 200) return true; // Gen Forever always visible as a concept? Or maybe hide it?
        return id === matchingGenBadgeId;
      }
      return true;
    })
  );

  const filterTabs = [
    { id: 'all', label: 'Todas' },
    { id: 'special', label: 'Especiales 👑' },
    { id: 'block1', label: 'Constancia Inicial 🌱' },
    { id: 'block2', label: 'Hábito Maduro 🧠' },
    { id: 'block3', label: 'Maestría y Zen 🧘' },
    { id: 'block4', label: 'Escritura ✍️' },
    { id: 'block5', label: 'Rituales 🌙' },
    { id: 'block6', label: 'Resiliencia 🌱' }
  ];

  return (
    <div className="ins-container animate-fade-up">
      <div className="ins-main-header">
        <h2>Catálogo de Insignias 🏆</h2>
        <p>
          Explora los {allBadges.length} logros diseñados para tu bienestar físico, emocional y técnico. Presiona cualquier insignia para verla en pantalla gigante en 3D y descubrir sus detalles de obtención.
        </p>
      </div>

      {/* FILTER BUTTONS BAR */}
      <div className="ins-filter-bar glass-panel">
        <Filter size={16} className="filter-icon" />
        <div className="filter-tabs-wrapper">
          {filterTabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveFilter(tab.id)}
              className={`filter-tab-btn ${activeFilter === tab.id ? 'active' : ''}`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Showcase Grid of All Badges - 4 per row */}
      <div className="insignias-grid-showcase">
        {filteredBadges.map((badge) => (
          <Card3D 
            key={badge.id}
            badge={badge}
            isUnlocked={unlockedIds.includes(badge.id)}
            onSelect={handleSelectBadge}
          />
        ))}
      </div>

      {selectedBadge && (
        <BadgeModalViewer 
          selectedBadge={selectedBadge}
          unlockedIds={unlockedIds}
          onClose={() => setSelectedBadge(null)}
          hideSecretHints={false} // En catálogo siempre muestran las pistas
        />
      )}

      <style>{`
        .ins-container {
          max-width: 1200px; margin: 0 auto; padding: 20px 10px 80px;
        }

        .ins-main-header {
          text-align: center; margin-bottom: 30px;
        }
        .ins-main-header h2 {
          font-family: var(--font-display); font-size: 3rem; font-weight: 800;
          color: var(--text-main); margin-bottom: 12px;
        }
        .ins-main-header p {
          font-size: 1.1rem; color: var(--text-muted); max-width: 680px; margin: 0 auto; line-height: 1.6;
        }

        /* Filter bar */
        .ins-filter-bar {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 12px 20px;
          margin-bottom: 32px;
        }
        .filter-icon {
          color: var(--text-subtle);
          flex-shrink: 0;
        }
        .filter-tabs-wrapper {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
        }
        .filter-tab-btn {
          background: transparent;
          border: 1px solid var(--border);
          border-radius: 20px;
          padding: 6px 14px;
          color: var(--text-muted);
          font-size: 0.82rem;
          font-weight: 700;
          cursor: pointer;
          transition: all var(--transition);
        }
        .filter-tab-btn:hover,
        .filter-tab-btn.active {
          border-color: var(--primary);
          color: var(--primary);
          background: var(--primary-light);
        }

        /* 4 per row layout */
        .insignias-grid-showcase {
          display: grid; 
          grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
          gap: 24px;
        }

        /* 3D BADGE SKEUOMORPHIC CARD */
        .badge-3d-card {
          position: relative;
          background: var(--bg-card);
          border-radius: var(--radius-lg);
          padding: 24px 16px 16px;
          display: flex; flex-direction: column;
          border: 1px solid var(--border);
          border-bottom: 6px solid color-mix(in srgb, var(--badge-color) 40%, #000 30%);
          box-shadow: 
            0 10px 25px rgba(0,0,0,0.06), 
            0 3px 10px rgba(0,0,0,0.04);
          transform-style: preserve-3d;
          transition: transform 0.15s ease-out, box-shadow 0.3s ease, border-color 0.3s ease;
          overflow: hidden;
          cursor: pointer;
        }

        .badge-3d-card.unlocked {
          border-color: color-mix(in srgb, var(--badge-color) 15%, var(--border));
          border-bottom-color: color-mix(in srgb, var(--badge-color) 60%, #000 20%);
        }

        /* Locked Card styling */
        .badge-3d-card.locked {
          filter: grayscale(0.8) opacity(0.65);
          border-bottom: 6px solid #475569;
          transition: filter 0.3s ease, opacity 0.3s ease;
        }
        .badge-3d-card.locked:hover {
          filter: grayscale(0.5) opacity(0.85);
          transform: translateY(-2px);
          box-shadow: 0 10px 25px rgba(0,0,0,0.2);
        }
        .locked-badge-overlay {
          position: absolute;
          top: 12px;
          left: 12px;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: rgba(15, 23, 42, 0.7);
          border: 1px solid rgba(255,255,255,0.15);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 5;
          color: #94a3b8;
        }

        /* Special Aura Glow for elite badges */
        .special-aura-glow {
          border-color: var(--badge-color) !important;
          animation: auraPulse 3s infinite ease-in-out !important;
        }
        @keyframes auraPulse {
          0%, 100% {
            box-shadow: 
              0 10px 25px rgba(0,0,0,0.15), 
              0 0 15px color-mix(in srgb, var(--badge-color) 40%, transparent),
              inset 0 0 10px color-mix(in srgb, var(--badge-color) 30%, transparent);
          }
          50% {
            box-shadow: 
              0 15px 35px rgba(0,0,0,0.2), 
              0 0 35px color-mix(in srgb, var(--badge-color) 85%, transparent),
              inset 0 0 15px color-mix(in srgb, var(--badge-color) 50%, transparent);
          }
        }

        .badge-3d-card.unlocked:hover {
          z-index: 10;
          border-color: var(--badge-color);
          box-shadow: 
            0 25px 45px rgba(0,0,0,0.12),
            0 0 25px color-mix(in srgb, var(--badge-color) 30%, transparent);
        }

        /* Holographic sheen light layer */
        .sheen-overlay {
          position: absolute; inset: 0;
          pointer-events: none;
          z-index: 6;
          mix-blend-mode: overlay;
          display: none;
        }

        /* Creator Ribbon with outline contrast */
        .creator-ribbon {
          position: absolute; top: 12px; right: 12px;
          color: white; font-size: 0.65rem; font-weight: 800;
          padding: 3px 8px; border-radius: 99px; text-transform: uppercase;
          letter-spacing: 0.5px;
          box-shadow: 0 3px 8px rgba(0,0,0,0.15);
          text-shadow: -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000;
          z-index: 5;
        }

        /* Badge visual display (Smaller for 4-in-a-row) */
        .badge-3d-asset-container {
          display: flex; justify-content: center; margin: 10px 0 15px;
          transform-style: preserve-3d;
        }
        .asset-ring {
          width: 95px; height: 95px; border-radius: 50%;
          background: linear-gradient(135deg, color-mix(in srgb, var(--badge-color) 12%, var(--bg-card)), var(--bg-main));
          border: 3.5px solid var(--badge-color);
          box-shadow: 
            0 8px 20px rgba(0,0,0,0.12),
            inset 0 0 18px color-mix(in srgb, var(--badge-color) 35%, transparent);
          display: flex; align-items: center; justify-content: center;
          position: relative; overflow: hidden;
          transform-style: preserve-3d;
          transition: transform 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
        }
        .badge-3d-card.unlocked:hover .asset-ring {
          transform: translateZ(40px) scale(1.08);
        }

        .badge-3d-image {
          width: 80%; height: 80%; object-fit: contain; z-index: 2;
          filter: drop-shadow(0 4px 8px rgba(0,0,0,0.22));
        }

        .inner-glow-anim {
          position: absolute; top: -50%; left: -50%; width: 200%; height: 200%;
          background: linear-gradient(
            to right, transparent, rgba(255,255,255,0.05), rgba(255,255,255,0.25), rgba(255,255,255,0.05), transparent
          );
          transform: rotate(25deg);
          animation: fastShine 5s infinite linear;
        }
        @keyframes fastShine {
          0% { transform: rotate(25deg) translateX(-100%); }
          100% { transform: rotate(25deg) translateX(100%); }
        }

        /* Text Details & Outlines for high contrast readability */
        .badge-card-info {
          flex: 1; display: flex; flex-direction: column; gap: 4px; margin-bottom: 12px;
          text-align: center;
        }
        .badge-card-info h3 {
          font-size: 1.15rem; font-weight: 800; color: var(--text-main); margin: 0;
        }
        .badge-brief-desc {
          font-size: 0.82rem; color: var(--text-muted); line-height: 1.4; margin: 0;
          display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
        }

        .click-to-enlarge-tip {
          display: flex; justify-content: center;
          font-size: 0.75rem; font-weight: 700; color: var(--primary);
          border-top: 1px solid var(--border); padding-top: 10px;
          opacity: 0.75; transition: all 0.2s ease;
        }
        .badge-3d-card:hover .click-to-enlarge-tip {
          opacity: 1;
          color: var(--accent);
        }

        /* IMMERSIVE 3D MODAL SYSTEM */
        .ins-modal-overlay {
          position: fixed; inset: 0; z-index: 1000;
          background: rgba(0, 0, 0, 0.85);
          backdrop-filter: blur(12px);
          display: flex; align-items: center; justify-content: center;
          padding: 20px;
          animation: fadeIn 0.3s ease-out;
        }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

        .ins-modal-card {
          position: relative;
          background: var(--bg-card);
          border: 1px solid color-mix(in srgb, var(--badge-color) 40%, var(--border));
          border-bottom: 8px solid color-mix(in srgb, var(--badge-color) 60%, #000 10%);
          border-radius: var(--radius-xl);
          width: 100%; max-width: 480px;
          padding: 40px 30px;
          display: flex; flex-direction: column; align-items: center;
          box-shadow: 
            0 30px 80px rgba(0,0,0,0.5),
            0 0 50px color-mix(in srgb, var(--badge-color) 30%, transparent);
          animation: scaleUp 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
          overflow: hidden;
        }
        @keyframes scaleUp { from { transform: scale(0.85); opacity: 0; } to { transform: scale(1); opacity: 1; } }

        .ins-modal-close-btn {
          position: absolute; top: 16px; right: 20px;
          background: none; border: none; font-size: 2.2rem;
          color: var(--text-muted); cursor: pointer; z-index: 10;
          transition: color 0.2s ease;
        }
        .ins-modal-close-btn:hover { color: var(--danger); }

        .ins-modal-zoom-btn {
          position: absolute; top: 26px; right: 58px;
          background: none; border: none;
          color: var(--text-muted); cursor: pointer; z-index: 10;
          transition: all 0.25s cubic-bezier(0.25, 0.8, 0.25, 1);
          display: flex; align-items: center; justify-content: center;
        }
        .ins-modal-zoom-btn:hover {
          color: var(--primary);
          transform: scale(1.2);
        }
        .ins-modal-zoom-btn.active {
          color: var(--accent);
          transform: scale(1.2) rotate(45deg);
        }

        /* 3D COIN FLIP ANIMATION (TRIPLE FLIP & EASE TO REST) */
        .modal-asset-section {
          perspective: 1000px;
          margin: 20px 0 30px;
        }
        .coin-3d-wrapper {
          width: 180px; height: 180px;
          transform-style: preserve-3d;
          transition: all 0.45s cubic-bezier(0.25, 0.8, 0.25, 1);
        }
        .coin-3d-wrapper.zoomed-in-active {
          transform: scale(1.65) translateZ(40px);
          filter: drop-shadow(0 20px 35px rgba(0,0,0,0.5));
          z-index: 50;
        }

        .fullscreen-coin-viewer {
          position: relative;
          width: 100%; max-width: 600px;
          height: 100%; max-height: 600px;
          display: flex; flex-direction: column; align-items: center; justify-content: center;
          gap: 40px;
          animation: scaleUp 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        .fullscreen-coin-container {
          position: relative;
          width: 340px; height: 340px;
          display: flex; align-items: center; justify-content: center;
          perspective: 1200px;
        }
        .large-coin-wrapper {
          width: 340px !important; height: 340px !important;
        }
        .large-coin-wrapper .coin-side {
          border-width: 7px !important;
          box-shadow: 
            0 30px 70px color-mix(in srgb, var(--badge-color) 45%, rgba(0,0,0,0.6)),
            inset 0 0 50px color-mix(in srgb, var(--badge-color) 60%, transparent) !important;
        }
        .large-coin-wrapper .modal-badge-img {
          width: 80% !important; height: 80% !important;
        }
        .fullscreen-coin-tip {
          text-align: center;
          color: var(--text-main);
          z-index: 10;
          animation: fadeInUp 0.4s ease-out;
          padding: 0 20px;
        }
        .fullscreen-coin-tip h3 {
          font-size: 1.8rem; font-weight: 800; color: var(--text-main); margin: 0 0 10px 0;
          text-shadow: 0 2px 10px rgba(0,0,0,0.6);
        }
        .fullscreen-coin-tip p {
          font-size: 0.95rem; color: var(--text-muted); margin: 0;
          text-shadow: 0 1px 5px rgba(0,0,0,0.5);
          line-height: 1.5;
        }
        @keyframes fadeInUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
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
        .coin-front {
          z-index: 2;
          transform: rotateY(0deg);
        }
        .coin-back {
          transform: rotateY(180deg);
        }
        .coin-side.modal-locked-coin {
          filter: grayscale(0.8) brightness(0.6);
        }

        .modal-badge-img {
          width: 80%; height: 80%; object-fit: contain; z-index: 2;
          filter: drop-shadow(0 10px 20px rgba(0,0,0,0.35));
        }
        .modal-badge-img.back-image {
          transform: scaleX(-1);
        }

        .modal-glow-wave {
          position: absolute; top: -50%; left: -50%; width: 200%; height: 200%;
          background: linear-gradient(
            to right, transparent, rgba(255,255,255,0.08), rgba(255,255,255,0.35), rgba(255,255,255,0.08), transparent
          );
          transform: rotate(25deg);
          animation: fastShine 3s infinite linear;
        }

        .modal-info-section {
          width: 100%; text-align: center;
        }
        .modal-info-section h2 {
          font-family: var(--font-display); font-size: 2rem; font-weight: 800;
          color: var(--text-main); margin-bottom: 12px;
          display: flex; align-items: center; justify-content: center; gap: 8px;
        }
        .modal-locked-tag {
          font-size: 0.8rem;
          background: #475569;
          color: #fff;
          padding: 3px 8px;
          border-radius: 6px;
          font-weight: 700;
        }
        .modal-badge-desc {
          font-size: 0.95rem; color: var(--text-muted); line-height: 1.6;
          margin-bottom: 30px;
        }

        /* Instruction Box */
        .modal-instruction-box {
          display: flex; gap: 14px; background: var(--bg-main);
          border: 1px solid var(--border); border-radius: var(--radius-lg);
          padding: 16px 20px; text-align: left;
        }
        .modal-box-icon { font-size: 1.4rem; flex-shrink: 0; margin-top: 2px; }
        .modal-box-content { display: flex; flex-direction: column; gap: 2px; }
        
        .modal-box-content strong { 
          font-size: 0.85rem; font-weight: 800; color: var(--badge-color); 
          text-transform: uppercase; letter-spacing: 0.5px;
          text-shadow: -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000;
        }
        
        .modal-box-content p { font-size: 0.9rem; color: var(--text-main); margin: 0; line-height: 1.5; }

        .modal-creator-ribbon {
          position: absolute; top: 22px; left: 24px;
          color: white; font-size: 0.75rem; font-weight: 800;
          padding: 4px 12px; border-radius: 99px; text-transform: uppercase;
          letter-spacing: 0.5px;
          box-shadow: 0 4px 10px rgba(0,0,0,0.15);
          text-shadow: -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000;
        }

        /* Flame System for Elite Insignias - Stronger, larger, and highly intense */
        .flame-container {
          position: absolute;
          inset: 0;
          pointer-events: none;
          z-index: 1;
          overflow: visible;
        }
        .flame-particle {
          position: absolute;
          bottom: 12px;
          width: 16px;
          height: 16px;
          background: var(--badge-color);
          border-radius: 50% 50% 20% 80%;
          transform: rotate(-45deg);
          /* Dual-layer glow: Core white center + intense outer neon glow */
          filter: blur(1px) drop-shadow(0 0 3px #fff) drop-shadow(0 0 10px var(--badge-color));
          opacity: 0;
          animation: riseAndBurn 1.6s infinite ease-out;
        }
        .flame-container .flame-particle:nth-child(1) { left: 12%; animation-delay: 0s; width: 14px; height: 14px; }
        .flame-container .flame-particle:nth-child(2) { left: 32%; animation-delay: 0.25s; width: 22px; height: 22px; }
        .flame-container .flame-particle:nth-child(3) { left: 52%; animation-delay: 0.5s; width: 18px; height: 18px; }
        .flame-container .flame-particle:nth-child(4) { left: 72%; animation-delay: 0.75s; width: 12px; height: 12px; }
        .flame-container .flame-particle:nth-child(5) { left: 45%; animation-delay: 1.0s; width: 26px; height: 26px; }

        @keyframes riseAndBurn {
          0% {
            transform: translateY(0) scale(0.3) rotate(-45deg);
            opacity: 0;
          }
          25% {
            opacity: 0.95;
          }
          70% {
            opacity: 0.6;
          }
          100% {
            transform: translateY(-65px) scale(0.1) rotate(-45deg);
            opacity: 0;
          }
        }

        /* Modal Flame System - Massive, blazing fire surrounding the 3D coin */
        .modal-flame-container {
          position: absolute;
          inset: -25px;
          pointer-events: none;
          z-index: 0;
          overflow: visible;
        }
        .modal-flame-container .flame-particle {
          position: absolute;
          bottom: 20px;
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
          0% {
            transform: translateY(0) scale(0.3) rotate(-45deg);
            opacity: 0;
          }
          15% {
            opacity: 0.98;
          }
          65% {
            opacity: 0.75;
          }
          100% {
            transform: translateY(-110px) scale(0.1) rotate(-45deg);
            opacity: 0;
          }
        }

        @media (max-width: 768px) {
          .ins-container { padding: 10px 5px 60px; }
          .ins-main-header h2 { font-size: 2.2rem; }
          .insignias-grid-showcase { grid-template-columns: 1fr; }
          .ins-modal-card { padding: 30px 20px; }
        }
      `}</style>
    </div>
  );
};

// Helper for modal ribbon
const badgeRibbon = (badge) => {
  if (badge.type === 'special') {
    return (
      <div 
        className="modal-creator-ribbon"
        style={{
          background: badge.title === 'El Creador'
            ? 'linear-gradient(135deg, #10b981, #059669)'
            : badge.title === 'Líder Alpha Docere'
              ? 'linear-gradient(135deg, #f59e0b, #d97706)'
              : badge.title === 'Miembro de la Comunidad'
                ? 'linear-gradient(135deg, #8b5cf6, #6d28d9)'
                : badge.title.includes('Generación')
                  ? 'linear-gradient(135deg, #00d2ff, #0086b3)'
                  : 'linear-gradient(135deg, #f05032, #ff7600)'
        }}
      >
        {badge.title === 'El Creador' ? '👑 Creador' : badge.title === 'Líder Alpha Docere' ? '🎓 Líder Alpha' : badge.title === 'Miembro de la Comunidad' ? '👥 Comunidad' : badge.title.includes('Generación') ? `✨ Gen ${badge.title.split(' ')[1]}` : '🔥 Especial'}
      </div>
    );
  }
  return null;
};

export default Insignias;
