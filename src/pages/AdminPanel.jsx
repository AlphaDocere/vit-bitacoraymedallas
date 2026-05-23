import React, { useState, useEffect } from 'react';
import { Users, Activity, AlertTriangle, ShieldAlert, HeartPulse } from 'lucide-react';

const AdminPanel = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalBitacoras: 0,
    moodScore: 0, // % of positive moods
  });
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    const rawData = localStorage.getItem('practicantes_bitacoras');
    if (!rawData) return;
    
    try {
      const bitacoras = JSON.parse(rawData);
      
      // Map names to unify active user calculations
      const mappedUsernames = bitacoras.map(b => b.user === 'Jose Eliecer Rivera Perez' ? 'Joseph Joestar' : b.user);
      
      // Calculate Stats
      const uniqueUsers = new Set(mappedUsernames).size;
      const totalBitacoras = bitacoras.length;
      
      const positiveMoods = bitacoras.filter(b => ['excelente', 'bien'].includes(b.mood)).length;
      const moodScore = totalBitacoras > 0 ? Math.round((positiveMoods / totalBitacoras) * 100) : 0;
      
      setStats({ totalUsers: uniqueUsers, totalBitacoras, moodScore });

      // Generate Alerts (Radar de Bloqueos)
      // We look for any bitacora where ayuda == true OR mood is bad
      const generatedAlerts = bitacoras.filter(b => b.ayuda || ['frustrado', 'cansado'].includes(b.mood)).map(b => {
        const mappedName = b.user === 'Jose Eliecer Rivera Perez' ? 'Joseph Joestar' : b.user;
        return {
          id: b.id,
          user: mappedName,
          date: b.fecha,
          needsHelp: b.ayuda,
          helpDesc: b.ayudaDesc,
          mood: b.mood,
          reason: b.ayuda ? 'Solicitó ayuda prioritaria' : `Estado de ánimo crítico: ${b.mood}`
        };
      });
      
      setAlerts(generatedAlerts);

    } catch (err) {
      console.error('Error parsing bitacoras for admin', err);
    }
  }, []);

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

      {/* ── RADAR DE BLOQUEOS ── */}
      <div className="admin-section">
        <div className="section-header">
          <div className="section-title-wrap">
            <ShieldAlert className="text-danger" size={22} />
            <h2 className="section-title">Radar de Bloqueos (Alertas)</h2>
          </div>
          <p className="section-desc">Atención requerida para los siguientes practicantes basados en su último reporte.</p>
        </div>

        {alerts.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">✅</div>
            <h3>Todo bajo control</h3>
            <p>No hay alertas críticas en el radar de bloqueos en este momento.</p>
          </div>
        ) : (
          <div className="alerts-grid">
            {alerts.map(alert => (
              <div key={alert.id} className={`alert-card ${alert.needsHelp ? 'critical' : 'warning'}`}>
                <div className="alert-header">
                  <div className="alert-user">
                    <div className="alert-avatar">{alert.user.charAt(0).toUpperCase()}</div>
                    <div>
                      <strong>{alert.user}</strong>
                      <span className="alert-date">{alert.date}</span>
                    </div>
                  </div>
                  <div className="alert-badge">
                    {alert.needsHelp ? <><AlertTriangle size={14}/> Crítico</> : 'Atención'}
                  </div>
                </div>
                
                <div className="alert-body">
                  <p className="alert-reason">{alert.reason}</p>
                  {alert.helpDesc && (
                    <div className="alert-quote">"{alert.helpDesc}"</div>
                  )}
                </div>
                
                <div className="alert-actions">
                  <button className="btn-outline-sm">Ver bitácora completa</button>
                  <button className="btn-primary-sm">Marcar como atendido</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <style>{`
        .admin-wrapper {
          width: 100%;
          max-width: 1000px;
          margin: 0 auto;
        }

        .admin-header { margin-bottom: 30px; }
        .admin-title { font-family: var(--font-display); font-size: 2rem; font-weight: 800; color: var(--text-main); }
        .admin-subtitle { color: var(--text-muted); margin-top: 5px; }

        /* Metrics */
        .admin-metrics {
          display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 20px; margin-bottom: 40px;
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

        /* Section */
        .admin-section {
          background: var(--bg-card); border: 1px solid var(--border);
          border-radius: var(--radius-lg); padding: 30px;
          box-shadow: var(--shadow-sm);
        }
        .section-header { margin-bottom: 24px; padding-bottom: 20px; border-bottom: 1px solid var(--border); }
        .section-title-wrap { display: flex; align-items: center; gap: 10px; margin-bottom: 6px; }
        .text-danger { color: var(--danger); }
        .section-title { font-size: 1.3rem; font-weight: 700; color: var(--text-main); }
        .section-desc { font-size: 0.9rem; color: var(--text-muted); }

        /* Empty State */
        .empty-state { text-align: center; padding: 40px 20px; }
        .empty-icon { font-size: 3rem; margin-bottom: 16px; opacity: 0.8; }
        .empty-state h3 { font-size: 1.1rem; color: var(--text-main); margin-bottom: 8px; }
        .empty-state p { font-size: 0.9rem; color: var(--text-muted); }

        /* Alerts Grid */
        .alerts-grid { display: flex; flex-direction: column; gap: 16px; }
        .alert-card {
          border: 1px solid var(--border); border-radius: var(--radius);
          padding: 20px; background: var(--bg-body);
          border-left: 4px solid var(--border);
        }
        .alert-card.critical { border-left-color: var(--danger); background: rgba(239,68,68,0.03); }
        .alert-card.warning  { border-left-color: #f59e0b; background: rgba(245,158,11,0.03); }
        
        .alert-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
        .alert-user { display: flex; align-items: center; gap: 12px; }
        .alert-avatar {
          width: 36px; height: 36px; border-radius: 50%;
          background: var(--primary-light); color: var(--primary);
          display: flex; align-items: center; justify-content: center;
          font-weight: 700; font-size: 1rem;
        }
        .alert-user strong { font-size: 0.95rem; color: var(--text-main); display: block; }
        .alert-date { font-size: 0.8rem; color: var(--text-subtle); }
        
        .alert-badge {
          font-size: 0.75rem; font-weight: 700; padding: 4px 10px; border-radius: 99px;
          display: flex; align-items: center; gap: 4px; text-transform: uppercase;
        }
        .critical .alert-badge { background: rgba(239,68,68,0.1); color: var(--danger); }
        .warning .alert-badge  { background: rgba(245,158,11,0.1); color: #f59e0b; }

        .alert-body { margin-bottom: 16px; }
        .alert-reason { font-size: 0.95rem; font-weight: 600; color: var(--text-main); margin-bottom: 8px; }
        .alert-quote {
          font-size: 0.9rem; font-style: italic; color: var(--text-muted);
          padding: 10px 14px; background: var(--bg-card); border-left: 2px solid var(--border);
          border-radius: 4px;
        }

        .alert-actions { display: flex; gap: 10px; }
        .btn-outline-sm {
          background: transparent; border: 1px solid var(--border); color: var(--text-main);
          padding: 6px 12px; border-radius: 6px; font-size: 0.85rem; font-weight: 600;
          cursor: pointer; transition: all var(--transition);
        }
        .btn-outline-sm:hover { border-color: var(--primary); color: var(--primary); }
        
        .btn-primary-sm {
          background: var(--primary); border: none; color: white;
          padding: 6px 14px; border-radius: 6px; font-size: 0.85rem; font-weight: 600;
          cursor: pointer; transition: background var(--transition);
        }
        .btn-primary-sm:hover { background: #328f49; }
      `}</style>
    </div>
  );
};

export default AdminPanel;
