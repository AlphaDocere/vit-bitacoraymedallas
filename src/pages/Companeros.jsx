import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import { Users, Shield, Award, Calendar, Search, X, Flame, BookOpen, Sparkles } from 'lucide-react';
import { calculateUserBadges, calculateStreak } from '../utils/badgeHelper';

import { getDynamicBadges, sortBadgesByRarity, Card3D, BadgeModalViewer } from '../components/BadgeViewer';

const Companeros = () => {
  const [fellows, setFellows] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentUser, setCurrentUser] = useState('');
  const [selectedFellow, setSelectedFellow] = useState(null);
  const [selectedBadgeData, setSelectedBadgeData] = useState(null); // { badge, unlockedIds }

  const myGen = localStorage.getItem('practicante_generation') || '17';
  const allBadges = getDynamicBadges(fellows, myGen);

  useEffect(() => {
    const loadFellowsData = () => {
      const user = localStorage.getItem('practicante_user') || 'Usuario';
      setCurrentUser(user);

      // Get fellows from local database
      const storedFellows = localStorage.getItem('practicantes_fellows');
      let fellowsList = storedFellows ? JSON.parse(storedFellows) : [];

      // Ensure current user is in the list with up-to-date values
      const myGen = localStorage.getItem('practicante_generation');
      if (myGen) {
        const myStatus = localStorage.getItem('practicante_status') || '¡Hola! Estoy registrando bitácoras en Kreative Vit. 💻';
        
        // Calculate user badges dynamically using unified helper
        const bitacorasStored = localStorage.getItem('practicantes_bitacoras') || '[]';
        const bitacoras = JSON.parse(bitacorasStored);
        const earnedBadges = calculateUserBadges(user, myGen, bitacoras);

        const existingIdx = fellowsList.findIndex(f => f.username === user);
        const dbBadges = existingIdx !== -1 && fellowsList[existingIdx].badges ? fellowsList[existingIdx].badges : [];
        const mergedBadges = [...new Set([...dbBadges, ...earnedBadges])];

        const userObj = {
          username: user,
          generation: parseInt(myGen),
          status: myStatus,
          avatar: localStorage.getItem('practicante_avatar') || '',
          badges: mergedBadges,
          isSelf: true
        };

        if (existingIdx !== -1) {
          // preserve pre-calculated streak/logs if any
          userObj.streak = fellowsList[existingIdx].streak;
          userObj.totalLogs = fellowsList[existingIdx].totalLogs;
          fellowsList[existingIdx] = userObj;
        } else {
          fellowsList.push(userObj);
        }
        
        // Save updated back
        localStorage.setItem('practicantes_fellows', JSON.stringify(fellowsList));
      }

      setFellows(fellowsList);
    };

    loadFellowsData();

    // Listen to background sync updates
    window.addEventListener('storage', loadFellowsData);
    return () => {
      window.removeEventListener('storage', loadFellowsData);
    };
  }, []);

  // Filtered fellows supporting Joseph Joestar mapping & smart generation searching
  const filteredFellows = fellows.filter(f => {
    const mappedName = f.username === 'Jose Eliecer Rivera Perez' ? 'Joseph Joestar' : f.username;
    
    const query = searchQuery.trim().toLowerCase();
    if (!query) return true;

    // Check if query is searching for a generation: "gen 17", "generacion 17", "g17", or just "17"
    const genMatch = query.match(/(?:gen(?:eraci[oó]n)?|g)?\s*(\d+)/i);
    if (genMatch) {
      const genNum = parseInt(genMatch[1]);
      if (f.generation === genNum) {
        return true;
      }
    }

    // Fallback to name or status match
    return mappedName.toLowerCase().includes(query) || 
           f.status.toLowerCase().includes(query);
  });

  return (
    <div className="companeros-container animate-fade-up">
      {/* ── HEADER ── */}
      <div className="companeros-header">
        <div className="header-text">
          <h1>Directorio de Compañeros 👥</h1>
          <p>
            Descubre los logros, estados e insignias de tus compañeros en Kreative Vit. Las bitácoras personales permanecen privadas 🔒.
          </p>
        </div>
      </div>

      {/* ── SEARCH BAR ── */}
      <div className="search-filter-bar glass-panel">
        <div className="search-box">
          <Search size={18} className="search-icon" />
          <input 
            type="text" 
            placeholder="Buscar por nombre, frase de estado o generación (ej: Gen 17, 18)..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* ── COMPAÑEROS GRID ── */}
      <div className="companeros-grid">
        {filteredFellows.length > 0 ? (
          filteredFellows.map((fellow) => {
            const mappedName = fellow.username === 'Jose Eliecer Rivera Perez' ? 'Joseph Joestar' : fellow.username;
            const initials = mappedName.charAt(0).toUpperCase();
            return (
              <div 
                key={fellow.username} 
                className={`fellow-card glass-panel ${fellow.isSelf ? 'self-card' : ''}`}
                onClick={() => setSelectedFellow(fellow)}
                style={{ cursor: 'pointer' }}
              >
                {fellow.isSelf && <div className="self-tag">Tú</div>}
                
                {/* Fellow Header (Avatar + Info) */}
                <div className="fellow-card-header">
                  <div 
                    className="fellow-avatar" 
                    style={{
                      background: fellow.isSelf 
                        ? 'linear-gradient(135deg, #3DAA58, #2ecc71)' 
                        : `linear-gradient(135deg, var(--primary), #a855f7)`
                    }}
                  >
                    {fellow.avatar ? (
                      <img 
                        src={fellow.avatar} 
                        alt="Avatar" 
                        className="fellow-insignia-avatar-img" 
                        style={{ objectFit: (fellow.avatar.startsWith('data:image/') || fellow.avatar.startsWith('blob:') || !fellow.avatar.includes('/insignias/')) ? 'cover' : 'contain' }}
                      />
                    ) : (
                      initials
                    )}
                  </div>
                  <div className="fellow-info">
                    <h3>{mappedName}</h3>
                    <span className="gen-badge">{fellow.generation === 'Jefe' ? 'Jefe' : `Gen ${fellow.generation}`}</span>
                  </div>
                </div>

                {/* Status Message */}
                <div className="fellow-status">
                  <p>"{fellow.status}"</p>
                </div>

                {/* Badges / Medals Unlocked */}
                <div className="fellow-badges-section">
                  <h4 className="badges-title">
                    <Award size={14} style={{ color: 'var(--primary)' }} />
                    Logros ({fellow.badges ? fellow.badges.length : 0})
                  </h4>
                  
                  <div className="fellow-mini-badges">
                    {fellow.badges && fellow.badges.length > 0 ? (
                      fellow.badges.slice(0, 8).map((badgeId) => {
                        const badge = allBadges.find(b => b.id === badgeId);
                        if (!badge) return null;
                        
                        const isSpecial = badge.type === 'special' || badgeId === 18 || badgeId >= 28;
                        return (
                          <div 
                            key={badgeId} 
                            className={`mini-badge-wrapper ${isSpecial ? 'mini-badge-special-glow' : ''}`}
                            title={`${badge.title} - ${badge.desc}`}
                            style={{ '--badge-glow': badge.color }}
                          >
                            <img 
                              src={badge.image} 
                              alt={badge.title} 
                              className="mini-badge-img" 
                            />
                            <div className="badge-tooltip">
                              <h5>{badge.title}</h5>
                              <p>{badge.desc}</p>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <p className="no-badges">Ningún logro aún</p>
                    )}
                    {fellow.badges && fellow.badges.length > 8 && (
                      <span className="more-badges-pill">+{fellow.badges.length - 8}</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="no-results glass-panel">
            <Users size={48} className="no-results-icon" />
            <h3>No se encontraron compañeros</h3>
            <p>Prueba ajustando los filtros o escribiendo otra búsqueda.</p>
          </div>
        )}
      </div>

      {selectedFellow && (() => {
        const mappedName = selectedFellow.username === 'Jose Eliecer Rivera Perez' ? 'Joseph Joestar' : selectedFellow.username;
        const initials = mappedName.charAt(0).toUpperCase();
        const streakVal = selectedFellow.isSelf
          ? calculateStreak(selectedFellow.username, JSON.parse(localStorage.getItem('practicantes_bitacoras') || '[]'))
          : (selectedFellow.streak || 0);
        const totalLogsVal = selectedFellow.isSelf
          ? JSON.parse(localStorage.getItem('practicantes_bitacoras') || '[]').filter(b => b.practicante === selectedFellow.username || b.user === selectedFellow.username).length
          : (selectedFellow.totalLogs || 0);
        const fellowBadges = selectedFellow.badges || [];
        const countableUnlockedCount = fellowBadges.filter(id => {
          const bId = parseInt(id);
          if (bId >= 28 && bId <= 40) return false;
          if (bId === 47 || bId === 48) return false;
          return true;
        }).length;

        const modalContent = (
          <div
            onClick={() => setSelectedFellow(null)}
            style={{
              position: 'fixed', inset: 0, zIndex: 99999,
              background: 'rgba(0,0,0,0.75)',
              backdropFilter: 'blur(10px)',
              WebkitBackdropFilter: 'blur(10px)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              padding: '24px'
            }}
          >
            <div
              onClick={e => e.stopPropagation()}
              style={{
                position: 'relative',
                background: 'var(--bg-card)',
                border: '1px solid var(--border-strong)',
                borderRadius: '20px',
                width: '100%', maxWidth: '800px',
                maxHeight: '90vh', overflowY: 'auto',
                padding: '36px',
                boxShadow: '0 25px 50px rgba(0,0,0,0.4)'
              }}
            >
              {/* X Close button */}
              <button
                onClick={() => setSelectedFellow(null)}
                style={{
                  position: 'absolute', top: '16px', right: '16px',
                  background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.4)',
                  color: '#ef4444', borderRadius: '50%',
                  width: '40px', height: '40px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', fontSize: '20px', fontWeight: 'bold', lineHeight: 1
                }}
              >
                ×
              </button>

              {/* Header */}
              <div className="modal-profile-header">
                <div className="modal-avatar-container">
                  {selectedFellow.avatar ? (
                    <img src={selectedFellow.avatar} alt="Avatar" className="modal-insignia-avatar"
                      style={{ objectFit: (selectedFellow.avatar.startsWith('data:image/') || selectedFellow.avatar.startsWith('blob:') || !selectedFellow.avatar.includes('/insignias/')) ? 'cover' : 'contain' }}
                    />
                  ) : (
                    <div className="modal-initials-avatar">{initials}</div>
                  )}
                </div>
                <div className="modal-title-block">
                  <h2>{mappedName} {selectedFellow.isSelf && <span className="self-badge-pill">Tú</span>}</h2>
                  <p className="modal-subtitle-label">
                    <Sparkles size={14} style={{ color: 'var(--primary)' }} /> Generación {selectedFellow.generation}
                  </p>
                </div>
              </div>

              {/* KPIs */}
              <div className="modal-kpi-grid">
                <div className="modal-kpi-card">
                  <div className="kpi-icon-wrap" style={{ background: 'rgba(239,68,68,0.12)', color: '#ef4444' }}><Flame size={20} /></div>
                  <div><span className="kpi-label">Racha Activa</span><p className="kpi-val">{streakVal} Días 🔥</p></div>
                </div>
                <div className="modal-kpi-card">
                  <div className="kpi-icon-wrap" style={{ background: 'rgba(61,170,88,0.12)', color: 'var(--primary)' }}><BookOpen size={20} /></div>
                  <div><span className="kpi-label">Total Bitácoras</span><p className="kpi-val">{totalLogsVal} Registros ✍️</p></div>
                </div>
                <div className="modal-kpi-card">
                  <div className="kpi-icon-wrap" style={{ background: 'rgba(245,158,11,0.12)', color: '#f59e0b' }}><Award size={20} /></div>
                  <div><span className="kpi-label">Logros Obtenidos</span><p className="kpi-val">{countableUnlockedCount} / 33 Insignias 🏆</p></div>
                </div>
              </div>

              {/* Status */}
              <div className="modal-status-quote">
                <h4>Frase de Estado</h4>
                <p>"{selectedFellow.status}"</p>
              </div>

              {/* Badges Showroom */}
              <div className="modal-showroom-section">
                <h3 className="modal-showroom-title">Catálogo e Historial de Insignias 🏆</h3>
                <p className="modal-showroom-desc">Aquí puedes ver las insignias que {mappedName} ha desbloqueado. Las bloqueadas aparecen con candado.</p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '20px', marginTop: '16px' }}>
                  {sortBadgesByRarity(allBadges.filter(b => {
                    const id = parseInt(b.id);
                    if (id >= 28 && id <= 40) {
                      const getMatchingGenBadgeId = (genStr) => {
                        const gen = parseInt(genStr);
                        if (gen === 17) return 28;
                        if (gen >= 18 && gen <= 29) return 29 + (gen - 18);
                        if (gen >= 30) return 100 + gen;
                        return null;
                      };
                      return id === getMatchingGenBadgeId(selectedFellow.generation);
                    }
                    if (id >= 100) {
                      if (id === 200) return true;
                      const gen = id - 100;
                      return gen === selectedFellow.generation;
                    }
                    const isFellowUnlocked = selectedFellow.badges && selectedFellow.badges.includes(id);
                    if ((id === 47 || id === 48) && !isFellowUnlocked) return false;
                    return true;
                  })).map((badge) => {
                    const isUnlocked = selectedFellow.badges && selectedFellow.badges.includes(badge.id);
                    return (
                      <Card3D 
                        key={badge.id}
                        badge={badge}
                        isUnlocked={isUnlocked}
                        onSelect={() => setSelectedBadgeData({ badge, unlockedIds: selectedFellow.badges || [] })}
                      />
                    );
                  })}
                </div>
              </div>

              {/* Big Red Close at bottom */}
              <div style={{ marginTop: '28px', display: 'flex', justifyContent: 'center', paddingBottom: '8px' }}>
                <button
                  onClick={() => setSelectedFellow(null)}
                  style={{
                    background: '#ef4444', color: '#fff', border: 'none',
                    padding: '14px 44px', borderRadius: '12px',
                    fontSize: '1rem', fontWeight: '700', cursor: 'pointer',
                    boxShadow: '0 4px 14px rgba(239,68,68,0.4)',
                    letterSpacing: '0.5px'
                  }}
                >
                  Cerrar ventana ✕
                </button>
              </div>

            </div>
          </div>
        );

        return ReactDOM.createPortal(modalContent, document.body);
      })()}

      {/* ── BADGE ZOOM LIGHTBOX (Portal) ── */}
      {selectedBadgeData && (
        <BadgeModalViewer 
          selectedBadge={selectedBadgeData.badge}
          unlockedIds={selectedBadgeData.unlockedIds}
          onClose={() => setSelectedBadgeData(null)}
          hideSecretHints={true} // Ocultar pistas de secretas a otros usuarios
        />
      )}

      <style>{`
        @keyframes comp-aura-pulse {
          0%, 100% { opacity: 0.7; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.06); }
        }
      `}</style>

      <style>{`
        .companeros-container {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .companeros-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 1.5px solid var(--border);
          padding-bottom: 16px;
        }

        .header-text h1 {
          font-family: var(--font-display);
          font-size: 1.8rem;
          font-weight: 800;
          color: var(--text-main);
          margin: 0 0 6px 0;
        }

        .header-text p {
          color: var(--text-muted);
          font-size: 0.95rem;
          margin: 0;
        }

        /* ── SEARCH BAR ── */
        .search-filter-bar {
          padding: 16px 20px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .search-box {
          position: relative;
          width: 100%;
        }

        .search-icon {
          position: absolute;
          left: 12px;
          top: 50%;
          transform: translateY(-50%);
          color: var(--text-subtle);
        }

        .search-box input {
          width: 100%;
          padding: 12px 14px 12px 42px;
          background: var(--bg-input);
          border: 1.5px solid var(--border);
          border-radius: var(--radius-sm);
          color: var(--text-main);
          font-family: var(--font-main);
          font-size: 0.95rem;
          outline: none;
          transition: border-color var(--transition);
        }

        .search-box input:focus {
          border-color: var(--primary);
          box-shadow: 0 0 0 3px var(--primary-glow);
        }

        /* ── COMPAÑEROS GRID ── */
        .companeros-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 20px;
        }

        .fellow-card {
          padding: 24px;
          position: relative;
          display: flex;
          flex-direction: column;
          gap: 16px;
          transition: transform var(--transition), border-color var(--transition), box-shadow var(--transition);
        }

        .fellow-card:hover {
          transform: translateY(-4px);
          border-color: var(--primary);
          box-shadow: var(--shadow-md);
        }

        .self-card {
          border-color: var(--primary);
          background: rgba(61, 170, 88, 0.03);
        }

        .self-tag {
          position: absolute;
          top: 12px;
          right: 12px;
          background: var(--primary);
          color: #fff;
          font-size: 0.72rem;
          font-weight: 700;
          padding: 2px 8px;
          border-radius: 20px;
        }

        .fellow-card-header {
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .fellow-avatar {
          width: 52px;
          height: 52px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: var(--font-display);
          font-size: 1.25rem;
          font-weight: 700;
          color: #fff;
          flex-shrink: 0;
          box-shadow: var(--shadow-sm);
        }

        .fellow-insignia-avatar-img {
          width: 100%;
          height: 100%;
          border-radius: 50%;
          object-fit: contain;
          background: var(--bg-secondary);
        }

        .fellow-info h3 {
          font-size: 1rem;
          font-weight: 700;
          color: var(--text-main);
          margin: 0 0 4px 0;
        }

        .gen-badge {
          display: inline-block;
          font-size: 0.75rem;
          font-weight: 600;
          color: var(--primary);
          background: var(--primary-light);
          padding: 2px 8px;
          border-radius: 12px;
        }

        .fellow-status {
          font-size: 0.88rem;
          color: var(--text-muted);
          font-style: italic;
          line-height: 1.4;
          margin: 0;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          min-height: 38px;
        }

        .fellow-badges-section {
          border-top: 1px solid var(--border);
          padding-top: 14px;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .badges-title {
          font-size: 0.8rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: var(--text-subtle);
          display: flex;
          align-items: center;
          gap: 6px;
          margin: 0;
        }

        .fellow-mini-badges {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          align-items: center;
        }

        .mini-badge-wrapper {
          position: relative;
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background: var(--bg-secondary);
          border: 1px solid var(--border);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: help;
          transition: transform 0.2s ease;
        }

        .mini-badge-wrapper:hover {
          transform: scale(1.15) translateY(-2px);
          z-index: 10;
        }

        .mini-badge-special-glow:hover {
          box-shadow: 0 0 12px var(--badge-glow);
          border-color: var(--badge-glow);
        }

        .mini-badge-img {
          width: 22px;
          height: 22px;
          object-fit: contain;
        }

        .more-badges-pill {
          font-size: 0.72rem;
          font-weight: 700;
          color: var(--text-muted);
          background: var(--bg-secondary);
          border: 1px solid var(--border);
          padding: 2px 6px;
          border-radius: 20px;
        }

        /* TOOLTIP */
        .badge-tooltip {
          position: absolute;
          bottom: 125%;
          left: 50%;
          transform: translateX(-50%) translateY(4px);
          width: 180px;
          background: rgba(15, 23, 42, 0.95);
          backdrop-filter: blur(4px);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 8px;
          padding: 8px 10px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
          opacity: 0;
          pointer-events: none;
          z-index: 100;
          transition: all 0.2s ease;
          text-align: center;
        }

        .mini-badge-wrapper:hover .badge-tooltip {
          opacity: 1;
          transform: translateX(-50%) translateY(0);
        }

        .badge-tooltip h5 {
          font-family: var(--font-display);
          font-size: 0.8rem;
          font-weight: 700;
          color: #fff;
          margin: 0 0 2px 0;
        }

        .badge-tooltip p {
          font-size: 0.7rem;
          color: #94a3b8;
          margin: 0;
          line-height: 1.3;
        }

        .no-badges {
          font-size: 0.8rem;
          color: var(--text-subtle);
          font-style: italic;
          margin: 0;
        }

        .no-results {
          grid-column: 1 / -1;
          padding: 60px 40px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          gap: 12px;
        }

        .no-results-icon {
          color: var(--text-subtle);
        }

        .no-results h3 {
          font-size: 1.25rem;
          color: var(--text-main);
          margin: 0;
        }

        .no-results p {
          color: var(--text-muted);
          font-size: 0.92rem;
          margin: 0;
        }

        /* ── MODAL OVERLAY ── */
        .comp-modal-overlay {
          position: fixed;
          inset: 0;
          z-index: 9999;
          background: rgba(0, 0, 0, 0.7);
          backdrop-filter: blur(8px);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px;
        }

        .comp-modal-content {
          position: relative;
          background: var(--bg-card);
          border: 1px solid var(--border-strong);
          width: 100%;
          max-width: 800px;
          max-height: 90vh;
          overflow-y: auto;
          border-radius: var(--radius);
          padding: 36px;
          box-shadow: var(--shadow-lg);
          display: flex;
          flex-direction: column;
          gap: 28px;
        }

        .comp-close-modal-btn {
          position: absolute;
          top: 20px;
          right: 20px;
          background: rgba(239, 68, 68, 0.1);
          border: none;
          color: #ef4444;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 36px;
          height: 36px;
          border-radius: 50%;
        }

        .comp-close-modal-btn:hover {
          color: #fff;
          background: #ef4444;
          transform: scale(1.1);
        }

        /* MODAL HEADER */
        .modal-profile-header {
          display: flex;
          align-items: center;
          gap: 20px;
          border-bottom: 1.5px solid var(--border);
          padding-bottom: 24px;
        }

        .modal-avatar-container {
          width: 76px;
          height: 76px;
          border-radius: 50%;
          background: linear-gradient(135deg, var(--primary), var(--accent));
          box-shadow: var(--shadow-green);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .modal-insignia-avatar {
          width: 72px;
          height: 72px;
          border-radius: 50%;
          object-fit: contain;
          background: var(--bg-secondary);
          border: 2px solid var(--primary);
        }

        .modal-initials-avatar {
          font-family: var(--font-display);
          font-size: 2rem;
          font-weight: 800;
          color: #fff;
        }

        .modal-title-block h2 {
          font-family: var(--font-display);
          font-size: 1.5rem;
          font-weight: 800;
          color: var(--text-main);
          margin: 0 0 4px 0;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .self-badge-pill {
          font-size: 0.75rem;
          background: var(--primary-light);
          color: var(--primary);
          padding: 2px 8px;
          border-radius: 12px;
          font-weight: 700;
        }

        .modal-subtitle-label {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          font-size: 0.9rem;
          font-weight: 700;
          color: var(--text-muted);
        }

        /* MODAL KPIs */
        .modal-kpi-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 16px;
        }

        .modal-kpi-card {
          background: var(--bg-secondary);
          border: 1.5px solid var(--border);
          border-radius: var(--radius-sm);
          padding: 16px;
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .kpi-icon-wrap {
          width: 44px;
          height: 44px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .kpi-label {
          display: block;
          font-size: 0.73rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: var(--text-subtle);
          margin-bottom: 4px;
        }

        .kpi-val {
          font-size: 1.05rem;
          font-weight: 800;
          color: var(--text-main);
          margin: 0;
        }

        /* MODAL STATUS */
        .modal-status-quote {
          background: var(--bg-card);
          border-left: 4px solid var(--primary);
          padding: 14px 18px;
          border-radius: 4px var(--radius-sm) var(--radius-sm) 4px;
          border: 1px solid var(--border);
          border-left: 4px solid var(--primary);
          margin-top: 8px;
        }

        .modal-status-quote h4 {
          font-size: 0.75rem;
          font-weight: 800;
          color: var(--text-subtle);
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin: 0 0 4px 0;
        }

        .modal-status-quote p {
          font-size: 0.9rem;
          color: var(--text-muted);
          font-style: italic;
          margin: 0;
        }

        /* SHOWROOM INSIDE MODAL */
        .modal-showroom-section {
          border-top: 1.5px solid var(--border);
          padding-top: 24px;
        }

        .modal-showroom-title {
          font-family: var(--font-display);
          font-size: 1.1rem;
          font-weight: 800;
          color: var(--text-main);
          margin: 0;
        }

        .modal-showroom-desc {
          font-size: 0.85rem;
          color: var(--text-muted);
          margin: 4px 0 16px 0;
        }

        .modal-showroom-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(60px, 1fr));
          gap: 12px;
        }

        .modal-showroom-item {
          position: relative;
          aspect-ratio: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--bg-secondary);
          border: 1.5px solid var(--border);
          border-radius: var(--radius-sm);
          cursor: pointer;
          transition: all var(--transition);
        }

        .modal-showroom-item.unlocked-show:hover {
          transform: translateY(-4px) scale(1.05);
          border-color: var(--badge-glow);
          box-shadow: 0 6px 16px var(--badge-glow);
          background: var(--bg-card);
        }

        .locked-show {
          opacity: 0.65;
        }

        .locked-show .showroom-badge-img {
          filter: grayscale(1) opacity(0.3);
        }

        .showroom-lock-overlay {
          position: absolute;
          bottom: -4px;
          right: -4px;
          background: rgba(15, 23, 42, 0.85);
          color: #fff;
          font-size: 0.65rem;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid rgba(255,255,255,0.2);
        }

        .showroom-badge-wrap {
          position: relative;
          width: 48px;
          height: 48px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .showroom-badge-img {
          width: 100%;
          height: 100%;
          object-fit: contain;
          transition: all var(--transition);
        }

        .secret-badge-mask {
          width: 100%; height: 100%;
          background: var(--bg-card);
          border-radius: 50%;
          border: 1.5px dashed var(--border);
          display: flex; align-items: center; justify-content: center;
          color: var(--text-muted); font-size: 1.2rem; font-weight: 800;
          font-family: var(--font-display);
        }

        /* PREMIUM TOOLTIP */
        .showroom-badge-tooltip {
          position: absolute;
          bottom: 120%;
          left: 50%;
          transform: translateX(-50%) translateY(8px);
          width: 220px;
          background: rgba(15, 23, 42, 0.95);
          backdrop-filter: blur(8px);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 12px;
          padding: 12px 14px;
          box-shadow: 0 10px 25px -5px rgba(0,0,0,0.5);
          opacity: 0;
          pointer-events: none;
          z-index: 100;
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
          text-align: left;
        }

        .modal-showroom-item:hover .showroom-badge-tooltip {
          opacity: 1;
          pointer-events: auto;
          transform: translateX(-50%) translateY(0);
        }

        .modal-showroom-item h5 {
          font-family: var(--font-display);
          font-size: 0.9rem;
          font-weight: 700;
          color: #fff;
          margin: 0 0 4px 0;
        }

        .modal-showroom-item p {
          font-size: 0.78rem;
          color: #94a3b8;
          margin: 0 0 8px 0;
          line-height: 1.4;
        }

        .badge-status-tag {
          display: inline-block;
          font-size: 0.7rem;
          font-weight: 700;
          padding: 2px 6px;
          border-radius: 4px;
        }

        .badge-status-tag.unlocked {
          background: rgba(61, 170, 88, 0.2);
          color: #2ecc71;
        }

        .badge-status-tag.locked {
          background: rgba(239, 68, 68, 0.15);
          color: #ef4444;
        }
      `}</style>
    </div>
  );
};

export default Companeros;
