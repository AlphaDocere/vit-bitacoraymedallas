import React, { useState, useEffect, useMemo } from 'react';
import { Users, Activity, AlertTriangle, ShieldAlert, HeartPulse, Search, Calendar, ChevronRight, FileText } from 'lucide-react';

const AdminPanel = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalBitacoras: 0,
    moodScore: 0,
  });
  const [alerts, setAlerts] = useState([]);
  
  // New States for User Management
  const [usersData, setUsersData] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all'); // 'all', 'active', 'inactive', 'alerts'
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    const rawBitacoras = localStorage.getItem('practicantes_bitacoras');
    const rawFellows = localStorage.getItem('practicantes_fellows');
    
    if (!rawBitacoras || !rawFellows) return;
    
    try {
      const bitacoras = JSON.parse(rawBitacoras);
      let fellows = JSON.parse(rawFellows);
      
      // Cleanup map for Joseph
      const mapName = (name) => name === 'Jose Eliecer Rivera Perez' ? 'Joseph Joestar' : name;

      // Group bitacoras by user
      const bitacorasByUser = {};
      bitacoras.forEach(b => {
        const uName = mapName(b.user);
        if (!bitacorasByUser[uName]) bitacorasByUser[uName] = [];
        bitacorasByUser[uName].push(b);
      });

      // Filter fake users if any missed
      const fakeUsers = ['María Alejandra', 'Nicolas González', 'Camila Soto', 'Sebastian Reyes'];
      fellows = fellows.filter(f => !fakeUsers.includes(f.username));

      // Build User Data Array
      const processedUsers = fellows.map(f => {
        const mappedName = mapName(f.username);
        const userBits = bitacorasByUser[mappedName] || [];
        userBits.sort((a, b) => new Date(b.fecha) - new Date(a.fecha)); // Descending

        const hasAlerts = userBits.some(b => b.ayuda || ['frustrado', 'cansado'].includes(b.mood));
        
        let gen = f.generation;
        if (f.username === 'Javier Murillo') gen = 18;
        
        return {
          ...f,
          generation: gen,
          mappedName,
          bitacoras: userBits,
          bitacorasCount: userBits.length,
          lastBitacora: userBits.length > 0 ? userBits[0].fecha : null,
          hasAlerts,
          isActive: userBits.length > 0
        };
      });

      // Sort by active, then alerts, then name
      processedUsers.sort((a, b) => {
        if (a.hasAlerts !== b.hasAlerts) return b.hasAlerts ? 1 : -1;
        if (a.bitacorasCount !== b.bitacorasCount) return b.bitacorasCount - a.bitacorasCount;
        return a.mappedName.localeCompare(b.mappedName);
      });

      setUsersData(processedUsers);

      // Global Stats
      const activeUsers = processedUsers.filter(u => u.isActive).length;
      const totalBitacoras = bitacoras.length;
      const positiveMoods = bitacoras.filter(b => ['excelente', 'bien'].includes(b.mood)).length;
      const moodScore = totalBitacoras > 0 ? Math.round((positiveMoods / totalBitacoras) * 100) : 0;
      
      setStats({ totalUsers: activeUsers, totalBitacoras, moodScore });

      // Generate Critical Alerts for quick access
      const generatedAlerts = bitacoras.filter(b => b.ayuda || ['frustrado', 'cansado'].includes(b.mood)).map(b => {
        return {
          id: b.id,
          user: mapName(b.user),
          date: b.fecha,
          needsHelp: b.ayuda,
          helpDesc: b.ayudaDesc,
          mood: b.mood,
          reason: b.ayuda ? 'Solicitó ayuda prioritaria' : `Estado de ánimo crítico: ${b.mood}`,
          original: b
        };
      });
      setAlerts(generatedAlerts);

    } catch (err) {
      console.error('Error parsing data for admin', err);
    }
  }, []);

  const filteredUsers = useMemo(() => {
    return usersData.filter(u => {
      const matchesSearch = u.mappedName.toLowerCase().includes(searchQuery.toLowerCase());
      if (!matchesSearch) return false;
      
      if (filterType === 'active') return u.isActive;
      if (filterType === 'inactive') return !u.isActive;
      if (filterType === 'alerts') return u.hasAlerts;
      return true;
    });
  }, [usersData, searchQuery, filterType]);

  const handleSelectUser = (user) => {
    setSelectedUser(user);
    // Scroll mobile to details if needed
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getMoodEmoji = (mood) => {
    switch (mood) {
      case 'excelente': return '🤩';
      case 'bien': return '😊';
      case 'regular': return '😐';
      case 'cansado': return '😫';
      case 'frustrado': return '😤';
      default: return '🙂';
    }
  };

  return (
    <div className="admin-wrapper animate-fade-up">
      <div className="admin-header">
        <h1 className="admin-title">Panel de Administración</h1>
        <p className="admin-subtitle">Centro de control y monitoreo de la comunidad Alpha Docere.</p>
      </div>

      {/* ── METRICS OVERVIEW ── */}
      <div className="admin-metrics">
        <div className="metric-card">
          <div className="metric-icon bg-blue"><Users size={24} /></div>
          <div className="metric-info">
            <span className="metric-value">{stats.totalUsers}</span>
            <span className="metric-label">Practicantes Activos</span>
          </div>
        </div>
        
        <div className="metric-card">
          <div className="metric-icon bg-green"><Activity size={24} /></div>
          <div className="metric-info">
            <span className="metric-value">{stats.totalBitacoras}</span>
            <span className="metric-label">Bitácoras Registradas</span>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon bg-purple"><HeartPulse size={24} /></div>
          <div className="metric-info">
            <span className="metric-value">{stats.moodScore}%</span>
            <span className="metric-label">Salud Emocional (Positiva)</span>
          </div>
        </div>
      </div>

      <div className="admin-workspace">
        {/* LEFT PANEL: User List */}
        <div className="admin-sidebar">
          <div className="sidebar-header">
            <h3>Directorio de Practicantes</h3>
            <div className="search-box">
              <Search size={16} />
              <input 
                type="text" 
                placeholder="Buscar usuario..." 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="filter-chips">
              <button className={`chip ${filterType === 'all' ? 'active' : ''}`} onClick={() => setFilterType('all')}>Todos</button>
              <button className={`chip ${filterType === 'active' ? 'active' : ''}`} onClick={() => setFilterType('active')}>Activos</button>
              <button className={`chip ${filterType === 'inactive' ? 'active' : ''}`} onClick={() => setFilterType('inactive')}>Inactivos</button>
              <button className={`chip ${filterType === 'alerts' ? 'active' : ''}`} onClick={() => setFilterType('alerts')}>Alertas</button>
            </div>
          </div>
          
          <div className="user-list">
            {filteredUsers.length === 0 ? (
              <div className="empty-users">No se encontraron usuarios.</div>
            ) : (
              filteredUsers.map(user => (
                <div 
                  key={user.username} 
                  className={`user-list-item ${selectedUser?.username === user.username ? 'selected' : ''}`}
                  onClick={() => handleSelectUser(user)}
                >
                  <div className="user-list-avatar">
                    {user.avatar ? (
                      <img src={user.avatar} alt="Avatar" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                    ) : (
                      user.mappedName.charAt(0).toUpperCase()
                    )}
                    {user.hasAlerts && <div className="alert-dot"></div>}
                  </div>
                  <div className="user-list-info">
                    <div className="user-name">{user.mappedName}</div>
                    <div className="user-meta">
                      {user.generation === 'Jefe' ? 'Jefe' : `Gen: ${user.generation}`} • {user.bitacorasCount} bitácoras
                    </div>
                  </div>
                  <ChevronRight size={16} className="text-muted" />
                </div>
              ))
            )}
          </div>
        </div>

        {/* RIGHT PANEL: User Details & Feed */}
        <div className="admin-main">
          {!selectedUser ? (
            <div className="empty-state-main">
              <Users size={48} className="text-muted" style={{opacity: 0.5, marginBottom: '20px'}}/>
              <h2>Selecciona un practicante</h2>
              <p>Haz clic en un usuario del directorio para ver todo su historial de bitácoras y estado actual.</p>
            </div>
          ) : (
            <div className="user-details-view animate-fade-up">
              <div className="user-details-header">
                <div className="user-details-title">
                  <div className="user-list-avatar lg">
                    {selectedUser.avatar ? (
                      <img src={selectedUser.avatar} alt="Avatar" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                    ) : (
                      selectedUser.mappedName.charAt(0).toUpperCase()
                    )}
                  </div>
                  <div>
                    <h2>{selectedUser.mappedName}</h2>
                    <p>{selectedUser.status}</p>
                    <div className="user-badges-mini">
                      <span className="badge-pill bg-primary-light">{selectedUser.generation === 'Jefe' ? 'Jefe' : `Gen ${selectedUser.generation}`}</span>
                      <span className="badge-pill bg-gray">{selectedUser.bitacorasCount} Bitácoras</span>
                      {!selectedUser.isActive && <span className="badge-pill bg-danger-light">Inactivo</span>}
                      {selectedUser.hasAlerts && <span className="badge-pill bg-warning-light"><AlertTriangle size={12}/> Alertas Críticas</span>}
                    </div>
                  </div>
                </div>
              </div>

              <div className="bitacora-feed">
                <h3>Historial de Bitácoras</h3>
                {selectedUser.bitacoras.length === 0 ? (
                  <div className="empty-feed">
                    <FileText size={32} />
                    <p>Este usuario no ha registrado ninguna bitácora aún.</p>
                  </div>
                ) : (
                  selectedUser.bitacoras.map(b => (
                    <div key={b.id} className={`feed-card ${b.ayuda || ['frustrado', 'cansado'].includes(b.mood) ? 'alert-border' : ''}`}>
                      <div className="feed-header">
                        <div className="feed-date"><Calendar size={14}/> {b.fecha}</div>
                        <div className="feed-mood">{getMoodEmoji(b.mood)} {b.mood}</div>
                      </div>
                      
                      {b.ayuda && (
                        <div className="feed-alert">
                          <AlertTriangle size={14} /> Solicitud de Ayuda: {b.ayudaDesc}
                        </div>
                      )}

                      <div className="feed-body">
                        <div className="feed-section">
                          <strong>Progreso de hoy:</strong>
                          <p>{b.hechoHoy || 'Sin texto'}</p>
                        </div>
                        <div className="feed-section">
                          <strong>Plan para mañana:</strong>
                          <p>{b.hacerManana || 'Sin texto'}</p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        .admin-wrapper {
          width: 100%;
          max-width: 1200px;
          margin: 0 auto;
        }

        .admin-header { margin-bottom: 30px; }
        .admin-title { font-family: var(--font-display); font-size: 2rem; font-weight: 800; color: var(--text-main); }
        .admin-subtitle { color: var(--text-muted); margin-top: 5px; }

        /* Metrics */
        .admin-metrics {
          display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 20px; margin-bottom: 30px;
        }
        .metric-card {
          background: var(--bg-card); border: 1px solid var(--border);
          padding: 24px; border-radius: var(--radius-lg);
          display: flex; align-items: center; gap: 20px;
          box-shadow: var(--shadow-sm); transition: transform var(--transition);
        }
        .metric-card:hover { transform: translateY(-4px); box-shadow: var(--shadow-md); }
        .metric-icon {
          width: 56px; height: 56px; border-radius: 14px;
          display: flex; align-items: center; justify-content: center;
          color: white; flex-shrink: 0;
        }
        .bg-blue { background: #3b82f6; }
        .bg-green { background: var(--primary); }
        .bg-purple { background: #8b5cf6; }
        
        .metric-info { display: flex; flex-direction: column; }
        .metric-value { font-size: 1.8rem; font-weight: 800; color: var(--text-main); line-height: 1.1; }
        .metric-label { font-size: 0.85rem; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px; margin-top: 4px; font-weight: 600; }

        /* Workspace Grid */
        .admin-workspace {
          display: grid;
          grid-template-columns: 320px 1fr;
          gap: 24px;
          align-items: start;
        }

        /* Sidebar */
        .admin-sidebar {
          background: var(--bg-card); border: 1px solid var(--border);
          border-radius: var(--radius-lg);
          display: flex; flex-direction: column;
          height: calc(100vh - 120px);
          position: sticky; top: 90px;
          box-shadow: var(--shadow-sm);
        }
        .sidebar-header {
          padding: 20px; border-bottom: 1px solid var(--border);
        }
        .sidebar-header h3 { font-size: 1.1rem; margin-bottom: 16px; color: var(--text-main); }
        
        .search-box {
          position: relative; display: flex; align-items: center; margin-bottom: 16px;
        }
        .search-box svg { position: absolute; left: 12px; color: var(--text-muted); }
        .search-box input {
          width: 100%; padding: 10px 10px 10px 36px;
          background: var(--bg-body); border: 1px solid var(--border);
          border-radius: 8px; color: var(--text-main); font-size: 0.9rem;
        }

        .filter-chips { display: flex; gap: 8px; flex-wrap: wrap; }
        .chip {
          background: var(--bg-body); border: 1px solid var(--border);
          padding: 4px 10px; border-radius: 99px; font-size: 0.8rem;
          color: var(--text-muted); cursor: pointer; transition: all 0.2s;
        }
        .chip.active { background: var(--primary); color: white; border-color: var(--primary); }

        .user-list {
          flex: 1; overflow-y: auto; padding: 10px;
        }
        .empty-users { padding: 20px; text-align: center; color: var(--text-muted); font-size: 0.9rem; }
        
        .user-list-item {
          display: flex; align-items: center; gap: 12px; padding: 12px;
          border-radius: 8px; cursor: pointer; transition: all 0.2s;
        }
        .user-list-item:hover { background: rgba(0,0,0,0.03); }
        .user-list-item.selected { background: var(--primary-light); border: 1px solid color-mix(in srgb, var(--primary) 30%, transparent); }
        
        .user-list-avatar {
          width: 40px; height: 40px; border-radius: 50%;
          background: color-mix(in srgb, var(--primary) 20%, transparent); color: var(--primary);
          display: flex; align-items: center; justify-content: center;
          font-weight: 700; font-size: 1.1rem; position: relative; flex-shrink: 0;
        }
        .user-list-avatar.lg { width: 64px; height: 64px; font-size: 2rem; }
        
        .alert-dot {
          position: absolute; top: -2px; right: -2px; width: 12px; height: 12px;
          background: var(--danger); border: 2px solid var(--bg-card); border-radius: 50%;
        }

        .user-list-info { flex: 1; overflow: hidden; }
        .user-name { font-weight: 600; color: var(--text-main); font-size: 0.95rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .user-meta { font-size: 0.8rem; color: var(--text-muted); margin-top: 2px; }

        /* Main Panel */
        .admin-main {
          background: var(--bg-card); border: 1px solid var(--border);
          border-radius: var(--radius-lg); min-height: 500px;
          box-shadow: var(--shadow-sm);
        }
        
        .empty-state-main {
          display: flex; flex-direction: column; align-items: center; justify-content: center;
          height: 100%; min-height: 500px; text-align: center; color: var(--text-muted); padding: 40px;
        }
        .empty-state-main h2 { color: var(--text-main); margin-bottom: 10px; font-size: 1.5rem; }

        .user-details-header {
          padding: 30px; border-bottom: 1px solid var(--border);
        }
        .user-details-title { display: flex; align-items: center; gap: 20px; }
        .user-details-title h2 { font-size: 1.8rem; margin: 0 0 5px 0; color: var(--text-main); }
        .user-details-title p { color: var(--text-muted); font-size: 0.95rem; font-style: italic; margin: 0 0 12px 0; }
        
        .user-badges-mini { display: flex; gap: 10px; flex-wrap: wrap; }
        .badge-pill { padding: 4px 10px; border-radius: 6px; font-size: 0.75rem; font-weight: 700; display: flex; align-items: center; gap: 4px; text-transform: uppercase; }
        .bg-primary-light { background: color-mix(in srgb, var(--primary) 15%, transparent); color: var(--primary); }
        .bg-gray { background: color-mix(in srgb, var(--text-muted) 15%, transparent); color: var(--text-main); }
        .bg-danger-light { background: rgba(239,68,68,0.1); color: var(--danger); }
        .bg-warning-light { background: rgba(245,158,11,0.1); color: #f59e0b; }

        .bitacora-feed { padding: 30px; }
        .bitacora-feed h3 { font-size: 1.2rem; margin-bottom: 20px; color: var(--text-main); }
        
        .empty-feed { text-align: center; padding: 40px; color: var(--text-muted); }
        .empty-feed svg { margin-bottom: 10px; opacity: 0.5; }

        .feed-card {
          background: var(--bg-body); border: 1px solid var(--border);
          border-radius: var(--radius); padding: 20px; margin-bottom: 20px;
        }
        .feed-card.alert-border { border-left: 4px solid var(--danger); }
        
        .feed-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; border-bottom: 1px solid var(--border); padding-bottom: 12px; }
        .feed-date { display: flex; align-items: center; gap: 6px; font-size: 0.9rem; font-weight: 600; color: var(--text-main); }
        .feed-mood { text-transform: capitalize; font-size: 0.9rem; font-weight: 600; }
        
        .feed-alert {
          background: rgba(239,68,68,0.05); color: var(--danger); padding: 12px; border-radius: 6px;
          display: flex; align-items: center; gap: 8px; font-size: 0.9rem; font-weight: 600; margin-bottom: 16px;
        }
        
        .feed-body { display: flex; flex-direction: column; gap: 16px; }
        .feed-section strong { display: block; font-size: 0.85rem; color: var(--text-muted); text-transform: uppercase; margin-bottom: 4px; }
        .feed-section p { font-size: 0.95rem; color: var(--text-main); line-height: 1.6; white-space: pre-wrap; margin: 0; }

        @media (max-width: 960px) {
          .admin-workspace { grid-template-columns: 1fr; }
          .admin-sidebar { height: 400px; position: static; margin-bottom: 20px; }
        }
      `}</style>
    </div>
  );
};

export default AdminPanel;
