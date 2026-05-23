import React, { useEffect, useState } from 'react';
import { Shield, Award, Flame, BookOpen, Camera, Sparkles, CheckCircle2 } from 'lucide-react';
import { calculateUserBadges, calculateStreak } from '../utils/badgeHelper';

import { getDynamicBadges, sortBadgesByRarity, Card3D, BadgeModalViewer } from '../components/BadgeViewer';

const Profile = () => {
  const [username, setUsername] = useState('');
  const [generation, setGeneration] = useState('17');
  const [statusMsg, setStatusMsg] = useState('');
  const [avatar, setAvatar] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  
  const [streak, setStreak] = useState(0);
  const [totalLogs, setTotalLogs] = useState(0);
  const [myBadges, setMyBadges] = useState([]);
  const [myLogs, setMyLogs] = useState([]);
  
  // UI States
  const [activeTab, setActiveTab] = useState('calendario'); // 'calendario' | 'insignias'
  const [selectedBadgeData, setSelectedBadgeData] = useState(null); // { badge, unlockedIds }

  const allBadges = getDynamicBadges([], generation);

  useEffect(() => {
    const loadProfileData = () => {
      const user = localStorage.getItem('practicante_user');
      if (user) {
        setUsername(user);
        const storedGen = localStorage.getItem('practicante_generation') || '17';
        const storedStatus = localStorage.getItem('practicante_status') || '¡Registrando bitácoras en Kreative Vit! 💻';
        const storedAvatar = localStorage.getItem('practicante_avatar') || '';
        
        setGeneration(storedGen);
        setStatusMsg(storedStatus);
        setAvatar(storedAvatar);

        const bitacorasStored = localStorage.getItem('practicantes_bitacoras') || '[]';
        const bitacoras = JSON.parse(bitacorasStored);
        
        const realStreak = calculateStreak(user, bitacoras);
        const realTotal = bitacoras.filter(b => b.practicante === user || b.user === user).length;

        // Merge DB badges from background sync with calculated ones
        const storedFellows = localStorage.getItem('practicantes_fellows') || '[]';
        const fellowsList = JSON.parse(storedFellows);
        const myFellow = fellowsList.find(f => f.username === user);
        const dbBadges = myFellow && myFellow.badges ? myFellow.badges : [];
        const earnedBadges = [...new Set([...dbBadges, ...calculateUserBadges(user, storedGen, bitacoras)])];

        setStreak(realStreak);
        setTotalLogs(realTotal);
        setMyBadges(earnedBadges);
        
        // Cargar bitacoras para el calendario
        const userLogs = bitacoras.filter(b => b.practicante === user || b.user === user).sort((a,b) => new Date(b.timestamp || b.fecha) - new Date(a.timestamp || a.fecha));
        setMyLogs(userLogs);
      }
    };

    loadProfileData();

    // Listen to background sync updates
    window.addEventListener('storage', loadProfileData);
    return () => {
      window.removeEventListener('storage', loadProfileData);
    };
  }, []);

  const handleSaveProfile = () => {
    localStorage.setItem('practicante_generation', generation);
    localStorage.setItem('practicante_status', statusMsg);
    localStorage.setItem('practicante_avatar', avatar);

    // Sync in fellows list
    const storedFellows = localStorage.getItem('practicantes_fellows');
    let fellows = storedFellows ? JSON.parse(storedFellows) : [];

    const bitacorasStored = localStorage.getItem('practicantes_bitacoras') || '[]';
    const bitacoras = JSON.parse(bitacorasStored);

    const existingIdx = fellows.findIndex(f => f.username === username);
    const dbBadges = existingIdx !== -1 && fellows[existingIdx].badges ? fellows[existingIdx].badges : [];
    const earnedBadges = [...new Set([...dbBadges, ...calculateUserBadges(username, generation, bitacoras)])];

    const updatedFellow = {
      username,
      generation: parseInt(generation),
      status: statusMsg || '¡Registrando bitácoras en Kreative Vit! 💻',
      avatar: avatar,
      badges: earnedBadges,
      isSelf: true
    };

    if (existingIdx !== -1) {
      fellows[existingIdx] = updatedFellow;
    } else {
      fellows.push(updatedFellow);
    }

    localStorage.setItem('practicantes_fellows', JSON.stringify(fellows));
    
    // Refresh stats
    const realStreak = calculateStreak(username, bitacoras);
    const realTotal = bitacoras.filter(b => b.practicante === username || b.user === username).length;
    
    setStreak(realStreak);
    setTotalLogs(realTotal);
    setMyBadges(earnedBadges);
    
    setIsEditing(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  // Custom visual name mapping
  const mappedDisplayName = username === 'Jose Eliecer Rivera Perez' ? 'Joseph Joestar' : username;
  const initials = mappedDisplayName ? mappedDisplayName.charAt(0).toUpperCase() : '?';
  const isCustomUploaded = avatar && (avatar.startsWith('data:image/') || avatar.startsWith('blob:') || !avatar.includes('/insignias/'));
  
  // Exclude generation badges (28-40) and honorary badges (47, 48) from collection count
  const countableUnlockedCount = myBadges.filter(id => {
    const bId = parseInt(id);
    if (bId >= 28 && bId <= 40) return false;
    if (bId === 47 || bId === 48) return false;
    return true;
  }).length;

  return (
    <div className="profile-wrapper animate-fade-up">
      <div className="glass-panel profile-container">
        
        {/* PROFILE HEADER */}
        <div className="profile-header-block">
          <div className="profile-avatar-container">
            {avatar ? (
              <img 
                src={avatar} 
                alt="Avatar" 
                className="profile-insignia-avatar" 
                style={{ objectFit: isCustomUploaded ? 'cover' : 'contain' }}
              />
            ) : (
              <div className="profile-initials-avatar">{initials}</div>
            )}
            
            {isEditing && (
              <div className="avatar-camera-tag">
                <Camera size={14} />
                <span>Editar</span>
              </div>
            )}
          </div>
          
          <div className="profile-title-block">
            <h2>{mappedDisplayName}</h2>
            <p className="profile-subtitle-label">
              <Sparkles size={14} style={{ color: 'var(--primary)' }} /> Generación {generation}
            </p>
          </div>
        </div>

        {/* EDIT MODAL/FORM (IF EDITING) */}
        {isEditing ? (
          <div className="edit-form-block animate-fade-up">
            <h3 className="section-title">Editar Mi Perfil ⚙️</h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px' }}>
              <div className="input-group" style={{ marginBottom: 0 }}>
                <label>Frase de Estado Actual</label>
                <input 
                  type="text" 
                  value={statusMsg}
                  onChange={(e) => setStatusMsg(e.target.value)}
                  maxLength={60}
                  placeholder="¿Qué estás pensando?"
                  className="profile-input"
                />
              </div>
            </div>

            {/* CUSTOM IMAGE UPLOADER */}
            <div className="custom-avatar-upload-section" style={{ marginTop: '24px', marginBottom: '8px' }}>
              <label className="picker-label" style={{ display: 'block', fontSize: '0.88rem', fontWeight: '700', color: 'var(--text-muted)', marginBottom: '8px' }}>
                O Sube Tu Propia Foto de Perfil 📁
              </label>
              <div className="custom-upload-box glass-panel" style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
                <input 
                  type="file" 
                  id="custom-avatar-file" 
                  accept="image/*" 
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        const img = new Image();
                        img.src = reader.result;
                        img.onload = () => {
                          const canvas = document.createElement('canvas');
                          const MAX_SIZE = 400;
                          let width = img.width;
                          let height = img.height;

                          if (width > height) {
                            if (width > MAX_SIZE) {
                              height *= MAX_SIZE / width;
                              width = MAX_SIZE;
                            }
                          } else {
                            if (height > MAX_SIZE) {
                              width *= MAX_SIZE / height;
                              height = MAX_SIZE;
                            }
                          }
                          
                          canvas.width = width;
                          canvas.height = height;
                          const ctx = canvas.getContext('2d');
                          ctx.drawImage(img, 0, 0, width, height);
                          
                          const compressedBase64 = canvas.toDataURL('image/jpeg', 0.85);
                          setAvatar(compressedBase64);
                        };
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                  style={{ display: 'none' }}
                />
                <button 
                  type="button" 
                  className="btn-secondary"
                  onClick={() => document.getElementById('custom-avatar-file').click()}
                  style={{ width: 'auto', display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', fontSize: '0.85rem' }}
                >
                  <Camera size={14} /> Seleccionar Imagen Local
                </button>
                {isCustomUploaded && (
                  <div className="upload-preview-wrap" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <img src={avatar} alt="Preview" className="upload-preview-img" style={{ width: '38px', height: '38px', borderRadius: '50%', objectFit: 'cover', border: '1px solid var(--border)' }} />
                    <span className="upload-preview-label" style={{ fontSize: '0.78rem', color: 'var(--primary)', fontWeight: '600' }}>✓ Imagen cargada</span>
                  </div>
                )}
              </div>
            </div>

            {/* AVATAR PICKER ROW */}
            <div className="avatar-picker-section" style={{ marginTop: '20px' }}>
              <label className="picker-label">Elige una de tus Insignias como Foto de Perfil (Avatar) 🏅</label>
              <div className="avatar-grid-picker">
                <button 
                  type="button" 
                  onClick={() => setAvatar('')}
                  className={`avatar-option-btn ${avatar === '' ? 'active-avatar-opt' : ''}`}
                >
                  <div className="no-avatar-circle">{initials}</div>
                  <span>Ninguno</span>
                </button>
                
                {sortBadgesByRarity(myBadges).map((badgeId) => {
                  const badge = allBadges.find(b => b.id === badgeId);
                  if (!badge) return null;
                  return (
                    <button 
                      key={badgeId}
                      type="button" 
                      onClick={() => setAvatar(badge.image)}
                      className={`avatar-option-btn ${avatar === badge.image ? 'active-avatar-opt' : ''}`}
                    >
                      <img src={badge.image} alt={badge.title} className="avatar-picker-img" />
                      <span>{badge.title}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
              <button className="btn-primary" onClick={handleSaveProfile} style={{ width: 'auto', padding: '11px 24px' }}>
                Guardar Cambios
              </button>
              <button className="btn-secondary" onClick={() => setIsEditing(false)} style={{ width: 'auto', padding: '11px 24px' }}>
                Cancelar
              </button>
            </div>
          </div>
        ) : (
          /* READ MODE WITH PREMIUM KPIs */
          <div className="profile-view-block animate-fade-up">
            <div className="profile-kpi-grid">
              <div className="kpi-card">
                <div className="kpi-icon-wrap" style={{ background: 'rgba(239, 68, 68, 0.12)', color: '#ef4444' }}>
                  <Flame size={20} />
                </div>
                <div>
                  <span className="kpi-label">Racha de Bitácoras</span>
                  <p className="kpi-val">{streak} Días 🔥</p>
                </div>
              </div>
              <div className="kpi-card">
                <div className="kpi-icon-wrap" style={{ background: 'rgba(61, 170, 88, 0.12)', color: 'var(--primary)' }}>
                  <BookOpen size={20} />
                </div>
                <div>
                  <span className="kpi-label">Total Registradas</span>
                  <p className="kpi-val">{totalLogs} Bitácoras ✍️</p>
                </div>
              </div>
              <div className="kpi-card">
                <div className="kpi-icon-wrap" style={{ background: 'rgba(245, 158, 11, 0.12)', color: '#f59e0b' }}>
                  <Award size={20} />
                </div>
                <div>
                  <span className="kpi-label">Logros Desbloqueados</span>
                  <p className="kpi-val">{countableUnlockedCount} / 33 Insignias 🏆</p>
                </div>
              </div>
            </div>

            {/* STATUS MESSAGE */}
            <div className="profile-status-message">
              <h4>Estado Personal</h4>
              <p>"{statusMsg}"</p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '8px' }}>
              <button className="btn-secondary" onClick={() => setIsEditing(true)} style={{ width: 'auto', padding: '8px 20px' }}>
                Editar Perfil y Avatar
              </button>
              {saveSuccess && (
                <span className="save-success-tag">
                  <CheckCircle2 size={14} /> ¡Perfil guardado con éxito!
                </span>
              )}
            </div>
          </div>
        )}

        {/* TABS COMPONENT */}
        <div className="profile-tabs-container">
          <button 
            className={`profile-tab ${activeTab === 'calendario' ? 'active' : ''}`}
            onClick={() => setActiveTab('calendario')}
          >
            <BookOpen size={18} /> Calendario de Bitácoras
          </button>
          <button 
            className={`profile-tab ${activeTab === 'insignias' ? 'active' : ''}`}
            onClick={() => setActiveTab('insignias')}
          >
            <Award size={18} /> Mis Insignias
          </button>
        </div>

        {/* CALENDARIO TAB */}
        {activeTab === 'calendario' && (
          <div className="profile-calendar-section animate-fade-up">
            <h3 className="section-title">Calendario de Actividad 📅</h3>
            <p className="showroom-intro">
              Aquí puedes ver los días en que registraste una bitácora. La información interna permanece completamente privada.
            </p>
            
            <div className="calendar-grid">
              {myLogs.length > 0 ? (
                myLogs.map((log, index) => {
                  const logDate = new Date(log.timestamp || log.fecha + 'T12:00:00Z');
                  const formattedDate = logDate.toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
                  return (
                    <div key={index} className="calendar-day-card glass-panel">
                      <div className="calendar-icon-wrap">
                        <CheckCircle2 size={24} style={{ color: 'var(--primary)' }} />
                      </div>
                      <div className="calendar-date-info">
                        <strong>{formattedDate}</strong>
                        <span>Bitácora Registrada</span>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="no-logs-msg glass-panel">
                  <p>Aún no has registrado ninguna bitácora.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* INSIGNIAS TAB */}
        {activeTab === 'insignias' && (
          <div className="profile-showroom-section animate-fade-up">
            <h3 className="section-title">Catálogo e Historial de Insignias 🏆</h3>
            <p className="showroom-intro">
              Explora las insignias desbloqueadas por consistencia, bienestar y metas técnicas. Las insignias bloqueadas aparecen con candado.
            </p>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '20px', marginTop: '16px' }}>
              {sortBadgesByRarity(allBadges.filter(b => {
                const id = parseInt(b.id);
                // Generation badges are between 28 and 40
                if (id >= 28 && id <= 40) {
                  const getMatchingGenBadgeId = (genStr) => {
                    const gen = parseInt(genStr);
                    if (gen === 17) return 28;
                    if (gen >= 18 && gen <= 29) return 29 + (gen - 18);
                    return null;
                  };
                  return id === getMatchingGenBadgeId(generation);
                }
                // Dynamic Generation Badges (id >= 100)
                if (id >= 100 && id < 200) {
                  return id === (100 + parseInt(generation));
                }
                // Gen Forever
                if (id === 200) {
                  return parseInt(generation) > 58;
                }
                // Hide 47 and 48 completely if locked
                if ((id === 47 || id === 48) && !myBadges.includes(id)) {
                  return false;
                }
                return true;
              })).map((badge) => {
                const isUnlocked = myBadges.includes(badge.id);
                return (
                  <Card3D 
                    key={badge.id}
                    badge={badge}
                    isUnlocked={isUnlocked}
                    onSelect={() => setSelectedBadgeData({ badge, unlockedIds: myBadges })}
                  />
                );
              })}
            </div>
          </div>
        )}
        
      </div>

      {/* ── BADGE DETAILS MODAL (PREMIUM & ZOOM) ── */}
      {selectedBadgeData && (
        <BadgeModalViewer 
          selectedBadge={selectedBadgeData.badge}
          unlockedIds={selectedBadgeData.unlockedIds}
          onClose={() => setSelectedBadgeData(null)}
          hideSecretHints={true} // Ocultar pistas de secretas a otros usuarios en tu perfil
        />
      )}

      <style>{`
        .profile-modal-overlay {
          position: fixed; top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(0, 0, 0, 0.85);
          backdrop-filter: blur(12px);
          display: flex; align-items: center; justify-content: center;
        }
        
        .celebration-style-modal {
          background: rgba(15, 23, 42, 0.95);
          border: 1px solid rgba(255, 255, 255, 0.1);
          box-shadow: 0 0 40px rgba(0,0,0,0.5), 0 0 50px var(--celeb-color);
          border-radius: 24px;
          max-width: 380px; width: 90%;
          text-align: center; padding: 40px 32px 32px 32px;
          position: relative; overflow: hidden;
        }

        .modal-close-btn {
          position: absolute; top: 16px; right: 20px;
          background: transparent; border: none;
          font-size: 1.8rem; color: rgba(255,255,255,0.5); cursor: pointer;
          transition: all 0.3s ease;
        }
        .modal-close-btn:hover { color: #ffffff; transform: scale(1.1); }

        .modal-large-badge-container {
          width: 150px; height: 150px;
          margin: 0 auto 24px auto;
          border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          background: rgba(15, 23, 42, 0.8);
          border: 2px solid rgba(255,255,255,0.1);
          transition: all 0.3s ease;
          cursor: zoom-in;
        }
        .modal-large-badge-container:hover {
          transform: scale(1.05);
        }
        .modal-large-badge-container.unlocked-show {
          border-color: var(--badge-glow);
          box-shadow: 0 0 40px var(--badge-glow), inset 0 0 20px var(--badge-glow);
        }
        .modal-large-badge-wrap {
          position: relative; width: 120px; height: 120px;
          display: flex; align-items: center; justify-content: center;
        }
        .modal-large-badge-img {
          width: 100%; height: 100%; object-fit: contain;
          filter: drop-shadow(0 4px 10px rgba(0,0,0,0.5));
        }

        .modal-premium-title {
          font-size: 1.6rem; margin-bottom: 8px; 
          color: #ffffff; font-weight: 700;
          text-shadow: 0 2px 10px rgba(0,0,0,0.5);
        }
        .modal-premium-desc {
          font-size: 0.95rem; color: #cbd5e1; 
          margin-bottom: 24px; line-height: 1.6;
        }

        /* ZOOMED VIEW */
        .zoomed-badge-view {
          display: flex; flex-direction: column; align-items: center; justify-content: center;
          width: 100vw; height: 100vh;
          cursor: zoom-out;
        }
        .zoomed-badge-img {
          max-width: 90vw; max-height: 80vh; object-fit: contain;
          filter: drop-shadow(0 0 60px rgba(255,255,255,0.15));
        }
        .close-zoom-hint {
          color: rgba(255,255,255,0.5); margin-top: 24px; font-size: 1rem;
          animation: pulse-soft 2s infinite;
        }
        
        @keyframes pulse-soft {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 1; }
        }
        .modal-large-lock {
          position: absolute; bottom: -8px; right: -8px;
          background: rgba(15, 23, 42, 0.95); color: #fff;
          font-size: 1.2rem; width: 32px; height: 32px;
          border-radius: 50%; display: flex; align-items: center; justify-content: center;
          border: 1.5px solid rgba(255,255,255,0.2);
        }

        .secret-badge-mask {
          width: 100%; height: 100%;
          background: var(--bg-card);
          border-radius: 50%;
          border: 1.5px dashed var(--border);
          display: flex; align-items: center; justify-content: center;
          color: var(--text-muted); font-size: 1.5rem; font-weight: 800;
          font-family: var(--font-display);
        }
        .secret-badge-mask.large-mask {
          font-size: 3.5rem; border-width: 2px;
        }

        .profile-wrapper {
          padding: 20px 24px;
          max-width: 900px;
          margin: 0 auto;
        }

        .profile-container {
          padding: 36px;
          display: flex;
          flex-direction: column;
          gap: 32px;
        }

        /* PROFILE HEADER */
        .profile-header-block {
          display: flex;
          align-items: center;
          gap: 24px;
          border-bottom: 1.5px solid var(--border);
          padding-bottom: 28px;
        }

        .profile-avatar-container {
          position: relative;
          width: 84px;
          height: 84px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          background: linear-gradient(135deg, var(--primary), var(--accent));
          box-shadow: var(--shadow-green);
          overflow: visible;
        }

        .profile-insignia-avatar {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          object-fit: contain;
          background: var(--bg-secondary);
          border: 2px solid var(--primary);
        }

        .profile-initials-avatar {
          font-family: var(--font-display);
          font-size: 2.2rem;
          font-weight: 800;
          color: #fff;
        }

        .avatar-camera-tag {
          position: absolute;
          bottom: -4px;
          right: -4px;
          background: var(--primary);
          color: #fff;
          border-radius: 20px;
          padding: 3px 8px;
          font-size: 0.7rem;
          font-weight: 700;
          display: flex;
          align-items: center;
          gap: 4px;
          box-shadow: var(--shadow-sm);
        }

        .profile-title-block h2 {
          font-family: var(--font-display);
          font-size: 1.8rem;
          font-weight: 800;
          color: var(--text-main);
          margin: 0 0 6px 0;
        }

        .profile-subtitle-label {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 0.95rem;
          font-weight: 700;
          color: var(--text-muted);
        }

        /* EDIT FORM BLOCK */
        .edit-form-block {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .section-title {
          font-family: var(--font-display);
          font-size: 1.25rem;
          font-weight: 800;
          color: var(--text-main);
          margin: 0;
        }

        .profile-select, .profile-input {
          width: 100%;
          padding: 12px 14px;
          background: var(--bg-input);
          border: 1.5px solid var(--border);
          border-radius: var(--radius-sm);
          color: var(--text-main);
          font-family: var(--font-main);
          outline: none;
          font-size: 0.95rem;
        }

        .profile-select:focus, .profile-input:focus {
          border-color: var(--primary);
          box-shadow: 0 0 0 3px var(--primary-glow);
        }

        /* AVATAR PICKER */
        .avatar-picker-section {
          background: var(--bg-secondary);
          border: 1.5px solid var(--border);
          border-radius: var(--radius);
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .picker-label {
          font-size: 0.85rem;
          font-weight: 700;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .avatar-grid-picker {
          display: flex;
          gap: 14px;
          overflow-x: auto;
          padding: 8px 4px;
          scrollbar-width: thin;
        }

        .avatar-option-btn {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          background: var(--bg-card);
          border: 1.5px solid var(--border);
          border-radius: var(--radius-sm);
          padding: 12px;
          cursor: pointer;
          transition: all var(--transition);
          flex-shrink: 0;
          width: 96px;
        }

        .avatar-option-btn:hover {
          border-color: var(--primary);
          transform: translateY(-2px);
        }

        .active-avatar-opt {
          border-color: var(--primary);
          background: var(--primary-light);
          box-shadow: var(--shadow-green);
        }

        .no-avatar-circle {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          background: linear-gradient(135deg, var(--primary), var(--accent));
          color: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: var(--font-display);
          font-size: 1.3rem;
          font-weight: 800;
        }

        .avatar-picker-img {
          width: 48px;
          height: 48px;
          object-fit: contain;
        }

        .avatar-option-btn span {
          font-size: 0.75rem;
          font-weight: 700;
          color: var(--text-main);
          text-align: center;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          width: 100%;
        }

        /* KPI GRID */
        .profile-kpi-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 16px;
        }

        .kpi-card {
          background: var(--bg-card);
          border: 1.5px solid var(--border);
          border-radius: var(--radius-sm);
          padding: 18px;
          display: flex;
          align-items: center;
          gap: 14px;
          transition: all var(--transition);
        }

        .kpi-card:hover {
          border-color: var(--primary);
          box-shadow: var(--shadow-md);
          transform: translateY(-2px);
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

        .profile-status-message {
          background: var(--bg-secondary);
          border-left: 4px solid var(--primary);
          padding: 16px 20px;
          border-radius: 4px var(--radius-sm) var(--radius-sm) 4px;
          margin-top: 12px;
        }

        .profile-status-message h4 {
          font-size: 0.8rem;
          font-weight: 800;
          color: var(--text-subtle);
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin: 0 0 6px 0;
        }

        .profile-status-message p {
          font-size: 0.95rem;
          color: var(--text-muted);
          font-style: italic;
          margin: 0;
        }

        .save-success-tag {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          color: var(--success);
          font-size: 0.85rem;
          font-weight: 700;
        }

        /* TABS UI */
        .profile-tabs-container {
          display: flex;
          gap: 8px;
          border-bottom: 1.5px solid var(--border);
          margin-top: 24px;
        }

        .profile-tab {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 24px;
          background: transparent;
          border: none;
          color: var(--text-muted);
          font-family: var(--font-display);
          font-size: 0.95rem;
          font-weight: 700;
          cursor: pointer;
          border-bottom: 3px solid transparent;
          transition: all var(--transition);
        }

        .profile-tab:hover {
          color: var(--text-main);
          background: rgba(255, 255, 255, 0.05);
        }

        .profile-tab.active {
          color: var(--primary);
          border-bottom-color: var(--primary);
        }

        /* CALENDAR GRID */
        .profile-calendar-section {
          padding-top: 32px;
        }

        .calendar-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
          gap: 16px;
          margin-top: 20px;
        }

        .calendar-day-card {
          padding: 16px;
          display: flex;
          align-items: center;
          gap: 12px;
          border: 1px solid var(--border);
          border-radius: var(--radius-sm);
        }

        .calendar-icon-wrap {
          background: rgba(61, 170, 88, 0.15);
          width: 40px;
          height: 40px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .calendar-date-info strong {
          display: block;
          font-size: 0.9rem;
          color: var(--text-main);
          margin-bottom: 2px;
        }

        .calendar-date-info span {
          font-size: 0.75rem;
          color: var(--text-muted);
        }

        .no-logs-msg {
          padding: 32px;
          text-align: center;
          color: var(--text-muted);
          grid-column: 1 / -1;
          font-style: italic;
        }

        /* SHOWROOM */
        .profile-showroom-section {
          padding-top: 32px;
        }

        .showroom-intro {
          font-size: 0.92rem;
          color: var(--text-muted);
          margin: 6px 0 20px 0;
        }
      `}</style>
    </div>
  );
};

export default Profile;
