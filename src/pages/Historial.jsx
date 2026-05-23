import React, { useState, useEffect } from 'react';
import { CalendarDays, AlertCircle, Search, HelpCircle, Flame, Sparkles, Clipboard, Check, Calendar, BarChart2 } from 'lucide-react';

const MOOD_MAP = {
  excelente: { emoji: '🚀', label: 'Excelente', color: '#39ff14', glow: 'rgba(57,255,20,0.3)' },
  bien:      { emoji: '😊', label: 'Bien',      color: '#00f0ff', glow: 'rgba(0,240,255,0.3)' },
  regular:   { emoji: '😐', label: 'Regular',   color: '#facc15', glow: 'rgba(250,204,21,0.3)' },
  cansado:   { emoji: '🥱', label: 'Cansado',   color: '#fb923c', glow: 'rgba(251,146,60,0.3)' },
  frustrado: { emoji: '😫', label: 'Frustrado', color: '#ef4444', glow: 'rgba(239,68,68,0.3)' },
};

const Historial = () => {
  const [logs, setLogs] = useState([]);
  const [filteredLogs, setFilteredLogs] = useState([]);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMoodFilter, setSelectedMoodFilter] = useState('todos');
  const [onlyHelpNeeded, setOnlyHelpNeeded] = useState(false);
  const [copiedLogId, setCopiedLogId] = useState(null);

  // Selected single log detail from Calendar
  const [selectedCalendarLog, setSelectedCalendarLog] = useState(null);

  useEffect(() => {
    const loadHistoryData = () => {
      const user = localStorage.getItem('practicante_user');
      const all = JSON.parse(localStorage.getItem('practicantes_bitacoras') || '[]');
      const userLogs = all.filter((b) => b.practicante === user || b.user === user);
      
      userLogs.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
      
      setLogs(userLogs);
      setFilteredLogs(userLogs);
    };

    loadHistoryData();

    // Listen to background sync updates
    window.addEventListener('storage', loadHistoryData);
    return () => {
      window.removeEventListener('storage', loadHistoryData);
    };
  }, []);

  // Filter Logic
  useEffect(() => {
    let result = [...logs];

    // 1. Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (l) => 
          (l.hechoHoy && l.hechoHoy.toLowerCase().includes(q)) || 
          (l.hacerManana && l.hacerManana.toLowerCase().includes(q)) ||
          (l.ayudaDesc && l.ayudaDesc.toLowerCase().includes(q))
      );
    }

    // 2. Mood Filter
    if (selectedMoodFilter !== 'todos') {
      result = result.filter((l) => l.mood === selectedMoodFilter);
    }

    // 3. Help needed Filter
    if (onlyHelpNeeded) {
      result = result.filter((l) => l.ayuda === true);
    }

    setFilteredLogs(result);
  }, [searchQuery, selectedMoodFilter, onlyHelpNeeded, logs]);

  const formatDateStr = (fechaStr) => {
    if (!fechaStr) return '';
    const [y, m, d] = fechaStr.split('-');
    return new Date(y, m - 1, d).toLocaleDateString('es-ES', {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
    });
  };

  // Streak calculation
  const getStreakCount = () => {
    if (logs.length === 0) return 0;
    const dates = [...new Set(logs.map(l => l.fecha))].sort((a,b) => new Date(b) - new Date(a));
    
    let streak = 0;
    let today = new Date();
    today.setHours(0,0,0,0);
    
    let yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0,0,0,0);
    
    const mostRecentDate = new Date(dates[0]);
    mostRecentDate.setHours(0,0,0,0);
    
    if (mostRecentDate < yesterday && mostRecentDate.getTime() !== today.getTime()) {
      return 0;
    }
    
    let current = mostRecentDate;
    for (let i = 0; i < dates.length; i++) {
      const logDate = new Date(dates[i]);
      logDate.setHours(0,0,0,0);
      
      const diffTime = Math.abs(current - logDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === 0 || diffDays === 1) {
        streak++;
        current = logDate;
      } else {
        break;
      }
    }
    return streak;
  };

  // Calendar logic
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const startDay = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;

  const calendarDays = [];
  for (let i = 0; i < startDay; i++) {
    calendarDays.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    calendarDays.push(i);
  }

  const isDayLogged = (day) => {
    if (!day) return null;
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return logs.find(log => log.fecha === dateStr);
  };

  const nextMonth = () => setCurrentMonth(new Date(year, month + 1, 1));
  const prevMonth = () => setCurrentMonth(new Date(year, month - 1, 1));

  const monthName = currentMonth.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });

  // Calculate words helper
  const getWordCount = (text) => {
    if (!text) return 0;
    return text.trim().split(/\s+/).filter(Boolean).length;
  };

  // Copy helper
  const copyToClipboard = (log) => {
    const textToCopy = `Bitácora - ${log.fecha}\n\nLo que hice hoy:\n${log.hechoHoy}\n\nLo que haré mañana:\n${log.hacerManana}${log.ayuda ? `\n\nAyuda solicitada:\n${log.ayudaDesc}` : ''}`;
    navigator.clipboard.writeText(textToCopy);
    setCopiedLogId(log.id);
    setTimeout(() => setCopiedLogId(null), 2000);
  };

  // Calculate Mood Statistics for Donut/Insights
  const getMoodStats = () => {
    const counts = { excelente: 0, bien: 0, regular: 0, cansado: 0, frustrado: 0 };
    logs.forEach(l => {
      if (counts[l.mood] !== undefined) counts[l.mood]++;
    });
    return counts;
  };

  const moodStats = getMoodStats();
  const streakCount = getStreakCount();

  return (
    <div className="hist-wrapper">
      
      {/* ═══════════ HEADER & STATUS PANELS ═══════════ */}
      <div className="hist-header animate-fade-up">
        <div>
          <h2 className="hist-title">Historial del Interno</h2>
          <p className="hist-subtitle">Monitorea tu evolución, constancia y bitácoras de trabajo.</p>
        </div>
        <span className="hist-count">{logs.length} bitácoras</span>
      </div>

      {/* Stats Row Grid */}
      <div className="stats-row animate-fade-up delay-100">
        <div className="stat-card glass-panel">
          <div className="stat-card-header">
            <span className="stat-icon-wrap primary-glow"><Flame size={20} className="flame-neon" /></span>
            <div className="stat-info">
              <h3>Racha Activa</h3>
              <p className="stat-num">{streakCount} {streakCount === 1 ? 'Día' : 'Días'}</p>
            </div>
          </div>
          <div className="stat-card-footer">
            <span>{streakCount > 0 ? '🔥 ¡Mantén encendido el ritmo!' : 'Escribe hoy para iniciar racha'}</span>
          </div>
        </div>

        <div className="stat-card glass-panel">
          <div className="stat-card-header">
            <span className="stat-icon-wrap info-glow"><CalendarDays size={20} /></span>
            <div className="stat-info">
              <h3>Tasa de Actividad</h3>
              <p className="stat-num">
                {logs.length > 0 ? `${Math.min(100, Math.round((logs.length / 30) * 100))}%` : '0%'}
              </p>
            </div>
          </div>
          <div className="stat-card-footer">
            <span>Objetivo mensual: 30 bitácoras</span>
          </div>
        </div>

        <div className="stat-card glass-panel">
          <div className="stat-card-header">
            <span className="stat-icon-wrap warning-glow"><Sparkles size={20} /></span>
            <div className="stat-info">
              <h3>Palabras Totales</h3>
              <p className="stat-num">
                {logs.reduce((acc, log) => acc + getWordCount(log.hechoHoy) + getWordCount(log.hacerManana), 0).toLocaleString()}
              </p>
            </div>
          </div>
          <div className="stat-card-footer">
            <span>Acumulado de análisis crítico</span>
          </div>
        </div>
      </div>

      {/* ═══════════ ANALYTICS & INTERACTIVE CALENDAR ═══════════ */}
      <div className="hist-dashboard animate-fade-up delay-200">
        
        {/* CALENDAR CARD */}
        <div className="dash-card glass-panel">
          <div className="dash-card-header">
            <div className="dash-card-title-wrap">
              <Calendar size={18} className="icon-neon" />
              <h3>Calendario de Actividad</h3>
            </div>
            <div className="cal-controls">
              <button className="cal-nav-btn" onClick={prevMonth}>&lt;</button>
              <span className="cal-month-name">{monthName.charAt(0).toUpperCase() + monthName.slice(1)}</span>
              <button className="cal-nav-btn" onClick={nextMonth}>&gt;</button>
            </div>
          </div>
          <div className="cal-grid">
            {['Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab', 'Dom'].map(d => <div key={'header'+d} className="cal-day-name">{d}</div>)}
            {calendarDays.map((day, i) => {
              const matchingLog = isDayLogged(day);
              const moodInfo = matchingLog ? MOOD_MAP[matchingLog.mood] : null;
              return (
                <div 
                  key={i} 
                  className={`cal-day ${day ? 'cal-day-active' : 'cal-day-empty'} ${matchingLog ? 'logged' : ''}`}
                  style={moodInfo ? { 
                    '--day-color': moodInfo.color, 
                    '--day-glow': moodInfo.glow,
                    cursor: 'pointer'
                  } : {}}
                  onClick={() => matchingLog && setSelectedCalendarLog(matchingLog)}
                >
                  <span className="cal-day-number">{day || ''}</span>
                  {moodInfo && <span className="cal-day-indicator" style={{ background: moodInfo.color }} />}
                </div>
              );
            })}
          </div>
          <div className="cal-legend">
            <span className="legend-title">Estado emocional:</span>
            <div className="legend-items">
              {Object.entries(MOOD_MAP).map(([key, val]) => (
                <span key={key} className="legend-item">
                  <span className="legend-dot" style={{ background: val.color }} />
                  {val.emoji}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* MOOD INSIGHTS CARD */}
        <div className="dash-card glass-panel">
          <div className="dash-card-header">
            <div className="dash-card-title-wrap">
              <BarChart2 size={18} className="icon-neon" />
              <h3>Mood Insights</h3>
            </div>
          </div>
          
          {logs.length === 0 ? (
            <div className="insights-empty">
              <HelpCircle size={32} />
              <p>Completa bitácoras para ver tendencias de estado de ánimo.</p>
            </div>
          ) : (
            <div className="insights-content">
              {/* Donut Chart SVG */}
              <div className="insights-chart-section">
                <svg viewBox="0 0 36 36" className="donut-chart-svg">
                  <circle cx="18" cy="18" r="15.915" fill="transparent" stroke="var(--bg-input)" strokeWidth="3" />
                  {(() => {
                    let accumulatedPercent = 0;
                    return Object.entries(moodStats).map(([key, count], idx) => {
                      if (count === 0) return null;
                      const percent = (count / logs.length) * 100;
                      const strokeDasharray = `${percent} ${100 - percent}`;
                      const strokeDashoffset = 100 - accumulatedPercent + 25; // 25 to start at 12 o'clock
                      accumulatedPercent += percent;
                      return (
                        <circle
                          key={key}
                          cx="18"
                          cy="18"
                          r="15.915"
                          fill="transparent"
                          stroke={MOOD_MAP[key].color}
                          strokeWidth="3.2"
                          strokeDasharray={strokeDasharray}
                          strokeDashoffset={strokeDashoffset}
                          className="donut-segment"
                        />
                      );
                    });
                  })()}
                </svg>
                <div className="donut-center-info">
                  <span className="donut-total">{logs.length}</span>
                  <span className="donut-sub">Registros</span>
                </div>
              </div>

              {/* Progress Bars List */}
              <div className="insights-list">
                {Object.entries(MOOD_MAP).map(([key, val]) => {
                  const count = moodStats[key] || 0;
                  const pct = logs.length > 0 ? Math.round((count / logs.length) * 100) : 0;
                  return (
                    <div key={key} className="insight-row">
                      <div className="insight-row-top">
                        <span className="insight-label">{val.emoji} {val.label}</span>
                        <span className="insight-val">{count} ({pct}%)</span>
                      </div>
                      <div className="insight-progress-bar-bg">
                        <div 
                          className="insight-progress-bar-fill"
                          style={{ 
                            width: `${pct}%`, 
                            background: val.color,
                            boxShadow: `0 0 10px ${val.glow}`
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

      </div>

      {/* ═══════════ DETAILED CALENDAR LOG DIALOG (MODAL) ═══════════ */}
      {selectedCalendarLog && (
        <div className="calendar-log-modal-overlay" onClick={() => setSelectedCalendarLog(null)}>
          <div className="calendar-log-modal glass-panel animate-scale-up" onClick={e => e.stopPropagation()}>
            <div className="modal-header-top">
              <span className="modal-date-tag">🗓️ {formatDateStr(selectedCalendarLog.fecha)}</span>
              <button className="modal-close-btn" onClick={() => setSelectedCalendarLog(null)}>&times;</button>
            </div>
            
            <div className="modal-body-content">
              <div className="modal-badge-row">
                <span className="badge badge-mood" style={{ background: MOOD_MAP[selectedCalendarLog.mood]?.color + '20', border: `1.5px solid ${MOOD_MAP[selectedCalendarLog.mood]?.color}` }}>
                  {MOOD_MAP[selectedCalendarLog.mood]?.emoji} {MOOD_MAP[selectedCalendarLog.mood]?.label}
                </span>
                {selectedCalendarLog.ayuda && (
                  <span className="badge badge-help animate-pulse-border">
                    ⚠️ Solicitó Soporte
                  </span>
                )}
              </div>

              <div className="modal-log-section">
                <h4>🚀 ¿Qué se logró completar hoy?</h4>
                <p>{selectedCalendarLog.hechoHoy}</p>
              </div>

              <div className="modal-log-section">
                <h4>🎯 ¿Cuál es el enfoque para mañana?</h4>
                <p>{selectedCalendarLog.hacerManana}</p>
              </div>

              {selectedCalendarLog.ayuda && selectedCalendarLog.ayudaDesc && (
                <div className="modal-help-desc-block">
                  <span className="help-block-title">Problema / Bloqueo reportado:</span>
                  <p>{selectedCalendarLog.ayudaDesc}</p>
                </div>
              )}
            </div>

            <div className="modal-footer-row">
              <button className="btn-secondary" style={{ flex: 1 }} onClick={() => copyToClipboard(selectedCalendarLog)}>
                {copiedLogId === selectedCalendarLog.id ? <><Check size={16} /> Copiado</> : <><Clipboard size={16} /> Copiar Bitácora</>}
              </button>
              <button className="btn-primary" style={{ flex: 1 }} onClick={() => setSelectedCalendarLog(null)}>
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════ TIMELINE FILTERS & SEARCH ═══════════ */}
      <div className="timeline-controls-bar animate-fade-up delay-300">
        <div className="search-box-wrap">
          <Search size={16} className="search-icon" />
          <input 
            type="text" 
            placeholder="Buscar en bitácoras..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="filters-right-group">
          {/* Mood Filter Select */}
          <select 
            value={selectedMoodFilter} 
            onChange={(e) => setSelectedMoodFilter(e.target.value)}
            className="filter-dropdown"
          >
            <option value="todos">Todos los Ánimos</option>
            {Object.entries(MOOD_MAP).map(([key, val]) => (
              <option key={key} value={key}>{val.emoji} {val.label}</option>
            ))}
          </select>

          {/* Help needed Filter Switch */}
          <button 
            className={`filter-help-toggle-btn ${onlyHelpNeeded ? 'active' : ''}`}
            onClick={() => setOnlyHelpNeeded(v => !v)}
          >
            ⚠️ Pidió Ayuda {onlyHelpNeeded ? 'ON' : 'OFF'}
          </button>
        </div>
      </div>

      {/* ═══════════ TIMELINE VIEW ═══════════ */}
      {filteredLogs.length === 0 ? (
        <div className="hist-empty animate-fade-up delay-300">
          <CalendarDays size={52} className="icon-neon" style={{ margin: '0 auto 16px' }} />
          <p>No se encontraron bitácoras para los filtros seleccionados.</p>
          <small>Prueba ajustando el texto o quitando los filtros de estado emocional.</small>
        </div>
      ) : (
        <div className="timeline">
          {filteredLogs.map((log, i) => {
            const mood = MOOD_MAP[log.mood] || { emoji: '📝', label: log.mood, color: 'var(--primary)' };
            const dateStr = formatDateStr(log.fecha);
            const wordCount = getWordCount(log.hechoHoy) + getWordCount(log.hacerManana);
            return (
              <div key={log.id} className="tl-item animate-fade-up">
                
                {/* Visual Connector Dot & Line */}
                <div className="tl-dot-col">
                  <div className="tl-dot" style={{ background: mood.color, boxShadow: `0 0 10px ${mood.glow}` }} />
                  {i < filteredLogs.length - 1 && <div className="tl-line" />}
                </div>

                {/* Main Card */}
                <div className="tl-card glass-panel" style={{ '--card-neon-color': mood.color }}>
                  
                  {/* Card Top Title Row */}
                  <div className="tl-card-top">
                    <div className="tl-date-wrap">
                      <CalendarDays size={14} style={{ color: mood.color }} />
                      <span className="tl-date">{dateStr.charAt(0).toUpperCase() + dateStr.slice(1)}</span>
                    </div>

                    <div className="tl-badges-group">
                      <span className="badge badge-word-count">
                        ✍️ {wordCount} palabras
                      </span>
                      <span className="badge badge-mood" style={{ background: mood.color + '15', border: `1px solid ${mood.color}`, color: '#fff' }}>
                        {mood.emoji} {mood.label}
                      </span>
                      {log.ayuda && (
                        <span className="badge badge-help blinking-red">
                          ⚠️ Pidió Ayuda
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Card Content Sections */}
                  <div className="tl-body">
                    <div className="tl-section">
                      <h4>🛠️ Hecho Hoy</h4>
                      <p>{log.hechoHoy}</p>
                    </div>
                    <div className="tl-section">
                      <h4>🎯 Enfoque Mañana</h4>
                      <p>{log.hacerManana}</p>
                    </div>

                    {log.ayuda && log.ayudaDesc && (
                      <div className="tl-help-block animate-pulse-border">
                        <AlertCircle size={16} />
                        <div>
                          <span className="tl-help-title">Detalle del Bloqueo Reportado:</span>
                          <p className="tl-help-text">{log.ayudaDesc}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Card Actions Bottom Row */}
                  <div className="tl-card-actions">
                    <button className="card-action-btn" onClick={() => copyToClipboard(log)}>
                      {copiedLogId === log.id ? (
                        <><Check size={13} color="#39ff14" /> Copiado con éxito</>
                      ) : (
                        <><Clipboard size={13} /> Copiar al portapapeles</>
                      )}
                    </button>
                  </div>

                </div>
              </div>
            );
          })}
        </div>
      )}

      <style>{`
        .hist-wrapper { padding: 10px 10px 60px; max-width: 900px; margin: 0 auto; }

        .hist-header {
          display: flex; align-items: flex-start; justify-content: space-between;
          margin-bottom: 30px; gap: 20px;
        }
        .hist-title { font-family: var(--font-display); font-size: 2.2rem; font-weight: 900; color: var(--text-main); margin: 0 0 6px; }
        .hist-subtitle { font-size: 0.95rem; color: var(--text-muted); margin: 0; }
        .hist-count {
          font-size: 0.85rem; font-weight: 800; color: var(--primary);
          background: var(--primary-light); padding: 6px 16px;
          border-radius: 99px; border: 1.5px solid rgba(61,170,88,0.35);
          text-transform: uppercase; letter-spacing: 0.5px; flex-shrink: 0;
          box-shadow: 0 4px 10px rgba(0,0,0,0.1);
        }

        /* ── STATS ROW PANELS ── */
        .stats-row {
          display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px;
          margin-bottom: 40px;
        }
        @media (max-width: 768px) {
          .stats-row { grid-template-columns: 1fr; }
        }

        .stat-card {
          padding: 24px; border-radius: var(--radius-lg);
          display: flex; flex-direction: column; justify-content: space-between;
          gap: 15px; border: 1.5px solid var(--border);
          transition: transform var(--transition), box-shadow var(--transition);
        }
        .stat-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 12px 30px rgba(0,0,0,0.15);
        }

        .stat-card-header { display: flex; align-items: center; gap: 16px; }
        .stat-icon-wrap {
          width: 46px; height: 46px; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          color: var(--text-main); flex-shrink: 0;
        }
        .stat-icon-wrap.primary-glow { background: var(--primary-light); color: var(--primary); border: 1.5px solid var(--primary); }
        .stat-icon-wrap.info-glow { background: rgba(59,130,246,0.15); color: #3b82f6; border: 1.5px solid #3b82f6; }
        .stat-icon-wrap.warning-glow { background: rgba(250,204,21,0.15); color: #facc15; border: 1.5px solid #facc15; }

        .flame-neon { filter: drop-shadow(0 0 5px var(--primary)); }

        .stat-info h3 { font-size: 0.78rem; font-weight: 800; text-transform: uppercase; color: var(--text-subtle); margin: 0 0 4px; letter-spacing: 0.5px; }
        .stat-num { font-family: var(--font-display); font-size: 1.8rem; font-weight: 900; color: var(--text-main); margin: 0; }

        .stat-card-footer {
          border-top: 1px solid var(--border); padding-top: 12px;
          font-size: 0.78rem; color: var(--text-muted); font-weight: 500;
        }

        /* ── DASHBOARD SECTION ── */
        .hist-dashboard {
          display: grid; grid-template-columns: 1.1fr 0.9fr; gap: 24px;
          margin-bottom: 45px;
        }
        @media (max-width: 900px) {
          .hist-dashboard { grid-template-columns: 1fr; }
        }

        .dash-card {
          padding: 26px; border-radius: var(--radius-lg);
          border: 1.5px solid var(--border); box-shadow: var(--shadow-sm);
        }
        .dash-card-header {
          display: flex; align-items: center; justify-content: space-between;
          margin-bottom: 24px; flex-wrap: wrap; gap: 12px;
        }
        .dash-card-title-wrap { display: flex; align-items: center; gap: 10px; color: var(--primary); }
        .dash-card-title-wrap h3 { font-family: var(--font-display); font-size: 1.15rem; font-weight: 800; color: var(--text-main); margin: 0; }

        .icon-neon { filter: drop-shadow(0 0 4px var(--primary)); }

        /* CALENDAR */
        .cal-controls {
          display: flex; align-items: center; gap: 10px;
        }
        .cal-nav-btn {
          background: var(--bg-input); border: 1.5px solid var(--border);
          color: var(--text-main); border-radius: 8px; width: 28px; height: 28px;
          display: flex; align-items: center; justify-content: center; font-weight: 700;
          cursor: pointer; transition: all var(--transition);
        }
        .cal-nav-btn:hover { border-color: var(--primary); color: var(--primary); }
        
        .cal-month-name { font-size: 0.88rem; font-weight: 700; color: var(--text-main); }

        .cal-grid {
          display: grid; grid-template-columns: repeat(7, 1fr); gap: 8px;
          text-align: center; margin-bottom: 20px;
        }
        .cal-day-name {
          font-size: 0.78rem; font-weight: 800; color: var(--text-muted);
          margin-bottom: 6px; text-transform: uppercase; letter-spacing: 0.5px;
        }
        .cal-day {
          height: 38px; display: flex; flex-direction: column; align-items: center; justify-content: center;
          font-size: 0.88rem; border-radius: 8px; font-weight: 600; position: relative;
          transition: all 0.2s;
        }
        .cal-day-active { background: var(--bg-input); color: var(--text-main); border: 1px solid var(--border); }
        .cal-day-active:hover { border-color: var(--text-muted); }
        .cal-day-empty { background: transparent; }
        
        .cal-day.logged {
          background: var(--bg-card);
          border: 1.5px solid var(--day-color);
          box-shadow: 
            0 4px 10px rgba(0,0,0,0.1),
            inset 0 0 10px var(--day-glow);
          font-weight: 800;
        }
        .cal-day.logged:hover {
          transform: scale(1.08);
          box-shadow: 
            0 6px 15px var(--day-glow),
            inset 0 0 12px var(--day-glow);
        }

        .cal-day-indicator {
          position: absolute; bottom: 4px; width: 4px; height: 4px; border-radius: 50%;
        }

        .cal-legend {
          border-top: 1.5px solid var(--border); padding-top: 16px;
          display: flex; align-items: center; justify-content: space-between;
          flex-wrap: wrap; gap: 10px;
        }
        .legend-title { font-size: 0.78rem; font-weight: 700; color: var(--text-muted); }
        .legend-items { display: flex; gap: 10px; }
        .legend-item { display: flex; align-items: center; gap: 4px; font-size: 0.75rem; font-weight: 600; }
        .legend-dot { width: 8px; height: 8px; border-radius: 50%; }

        /* MOOD INSIGHTS GRAPH */
        .insights-empty {
          display: flex; flex-direction: column; align-items: center; justify-content: center;
          height: 180px; text-align: center; color: var(--text-muted); gap: 10px;
        }
        .insights-empty p { font-size: 0.88rem; margin: 0; }

        .insights-content {
          display: flex; flex-direction: column; gap: 24px;
        }
        .insights-chart-section {
          display: flex; align-items: center; justify-content: center;
          position: relative; width: 140px; height: 140px; margin: 0 auto;
        }
        .donut-chart-svg {
          transform: rotate(-90deg); width: 100%; height: 100%;
        }
        .donut-segment {
          transition: stroke-dashoffset 0.4s ease;
        }
        .donut-center-info {
          position: absolute; display: flex; flex-direction: column; align-items: center; justify-content: center;
        }
        .donut-total { font-family: var(--font-display); font-size: 1.8rem; font-weight: 900; color: var(--text-main); line-height: 1; }
        .donut-sub { font-size: 0.75rem; color: var(--text-muted); font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; }

        .insights-list { display: flex; flex-direction: column; gap: 12px; }
        .insight-row { display: flex; flex-direction: column; gap: 5px; }
        .insight-row-top { display: flex; justify-content: space-between; font-size: 0.82rem; font-weight: 700; color: var(--text-main); }
        .insight-label { display: flex; align-items: center; gap: 5px; }
        .insight-val { color: var(--text-muted); }
        .insight-progress-bar-bg { height: 6px; background: var(--bg-input); border-radius: 99px; overflow: hidden; }
        .insight-progress-bar-fill { height: 100%; border-radius: 99px; transition: width 0.4s ease; }

        /* ── INTERACTIVE LOG DETAILED MODAL ── */
        .calendar-log-modal-overlay {
          position: fixed; inset: 0; z-index: 10000;
          background: rgba(2, 6, 23, 0.8);
          backdrop-filter: blur(12px);
          display: flex; align-items: center; justify-content: center;
          padding: 20px;
        }
        .calendar-log-modal {
          background: var(--bg-card);
          border: 1.5px solid var(--border);
          border-radius: 20px;
          padding: 30px; max-width: 500px; width: 100%;
          box-shadow: 0 25px 60px rgba(0,0,0,0.5);
          display: flex; flex-direction: column; gap: 20px;
        }
        .modal-header-top { display: flex; justify-content: space-between; align-items: center; }
        .modal-date-tag { font-size: 0.95rem; font-weight: 800; color: var(--primary); text-transform: capitalize; }
        .modal-close-btn {
          background: transparent; border: none; font-size: 1.6rem; color: var(--text-muted);
          cursor: pointer; line-height: 1;
        }
        .modal-close-btn:hover { color: var(--danger); }

        .modal-body-content { display: flex; flex-direction: column; gap: 16px; }
        .modal-badge-row { display: flex; gap: 10px; }
        
        .modal-log-section h4 { font-size: 0.8rem; font-weight: 800; text-transform: uppercase; color: var(--text-subtle); margin: 0 0 6px; }
        .modal-log-section p { font-size: 0.95rem; color: var(--text-main); line-height: 1.5; margin: 0; }

        .modal-help-desc-block {
          background: var(--danger-light); border: 1.5px solid rgba(239,68,68,0.25);
          padding: 12px 14px; border-radius: var(--radius-sm); color: var(--danger);
        }
        .help-block-title { font-size: 0.78rem; font-weight: 800; text-transform: uppercase; display: block; margin-bottom: 4px; }
        .modal-help-desc-block p { font-size: 0.92rem; color: var(--text-main); margin: 0; line-height: 1.5; }

        .modal-footer-row { display: flex; gap: 12px; margin-top: 10px; }

        /* ── TIMELINE CONTROLS BAR ── */
        .timeline-controls-bar {
          display: flex; align-items: center; justify-content: space-between;
          background: var(--bg-card); border: 1.5px solid var(--border);
          border-radius: var(--radius-lg); padding: 14px 20px;
          margin-bottom: 35px; gap: 20px; flex-wrap: wrap;
          box-shadow: var(--shadow-sm);
        }
        .search-box-wrap {
          display: flex; align-items: center; gap: 10px;
          background: var(--bg-input); border: 1.5px solid var(--border);
          border-radius: var(--radius-sm); padding: 8px 14px;
          flex: 1; min-width: 200px;
        }
        .search-icon { color: var(--text-muted); }
        .search-input {
          background: transparent; border: none; outline: none;
          color: var(--text-main); font-family: var(--font-main);
          font-size: 0.92rem; width: 100%;
        }

        .filters-right-group {
          display: flex; align-items: center; gap: 12px; flex-wrap: wrap;
        }
        .filter-dropdown {
          background: var(--bg-input); border: 1.5px solid var(--border);
          border-radius: var(--radius-sm); color: var(--text-main);
          padding: 9px 14px; outline: none; font-size: 0.88rem; font-weight: 600;
          cursor: pointer;
        }
        .filter-dropdown:focus { border-color: var(--primary); }

        .filter-help-toggle-btn {
          background: var(--bg-input); border: 1.5px solid var(--border);
          border-radius: var(--radius-sm); color: var(--text-muted);
          padding: 9px 14px; font-size: 0.88rem; font-weight: 700;
          cursor: pointer; transition: all var(--transition);
        }
        .filter-help-toggle-btn.active {
          background: var(--danger-light); border-color: var(--danger);
          color: var(--danger);
        }

        /* ── TIMELINE ── */
        .timeline { display: flex; flex-direction: column; }
        .tl-item { display: flex; gap: 20px; }

        .tl-dot-col {
          display: flex; flex-direction: column; align-items: center;
          padding-top: 24px; flex-shrink: 0;
        }
        .tl-dot {
          width: 16px; height: 16px; border-radius: 50%;
          border: 3px solid var(--bg-main);
          flex-shrink: 0;
        }
        .tl-line { flex: 1; width: 2px; background: var(--border); margin-top: 8px; }

        .tl-card {
          flex: 1; border-radius: 20px; margin-bottom: 24px;
          overflow: hidden; border: 1.5px solid var(--border);
          transition: all var(--transition);
        }
        .tl-card:hover {
          transform: translateY(-2px);
          border-color: var(--card-neon-color);
          box-shadow: 
            0 12px 30px rgba(0,0,0,0.15),
            0 0 20px color-mix(in srgb, var(--card-neon-color) 12%, transparent);
        }

        .tl-card-top {
          display: flex; justify-content: space-between; align-items: center;
          padding: 16px 20px; border-bottom: 1.5px solid var(--border);
          flex-wrap: wrap; gap: 12px;
          background: var(--bg-input);
        }
        .tl-date-wrap { display: flex; align-items: center; gap: 8px; color: var(--text-main); }
        .tl-date { font-size: 0.9rem; font-weight: 800; text-transform: capitalize; }
        
        .tl-badges-group { display: flex; gap: 8px; flex-wrap: wrap; }
        .badge {
          font-size: 0.78rem; padding: 5px 12px; border-radius: 99px;
          display: inline-flex; align-items: center; gap: 5px; font-weight: 700;
          box-shadow: 0 2px 6px rgba(0,0,0,0.05);
        }
        .badge-mood { color: #fff; font-weight: 800; }
        .badge-word-count { background: var(--bg-main); border: 1.5px solid var(--border); color: var(--text-muted); }
        .badge-help { background: var(--danger-light); color: var(--danger); border: 1px solid rgba(239,68,68,0.2); }

        .blinking-red {
          animation: blinkBorderRed 1.8s infinite;
        }
        @keyframes blinkBorderRed {
          0%, 100% { border-color: rgba(239,68,68,0.2); background: rgba(239,68,68,0.1); }
          50% { border-color: rgba(239,68,68,0.8); background: rgba(239,68,68,0.25); }
        }

        .animate-pulse-border {
          animation: pulseBorderRed 2s infinite;
        }
        @keyframes pulseBorderRed {
          0%, 100% { box-shadow: 0 0 0 0 rgba(239,68,68,0.4); }
          50% { box-shadow: 0 0 0 8px rgba(239,68,68,0); }
        }

        .tl-body { padding: 22px 24px; display: flex; flex-direction: column; gap: 18px; }
        .tl-section h4 { font-size: 0.8rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; color: var(--text-subtle); margin: 0 0 6px; }
        .tl-section p  { font-size: 0.95rem; color: var(--text-main); line-height: 1.6; margin: 0; }

        .tl-help-block {
          display: flex; gap: 12px; align-items: flex-start;
          padding: 14px 16px; border-radius: var(--radius-sm);
          background: var(--danger-light); border: 1.5px solid rgba(239,68,68,0.25);
          color: var(--danger);
        }
        .tl-help-title { font-size: 0.8rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.4px; display: block; margin-bottom: 4px; }
        .tl-help-text  { font-size: 0.92rem; color: var(--text-main); line-height: 1.5; margin: 0; }

        .tl-card-actions {
          border-top: 1px solid var(--border); padding: 12px 20px;
          display: flex; justify-content: flex-end;
          background: var(--bg-input);
        }
        .card-action-btn {
          background: transparent; border: none; color: var(--text-muted);
          font-family: var(--font-main); font-size: 0.8rem; font-weight: 700;
          cursor: pointer; display: flex; align-items: center; gap: 6px;
          padding: 6px 12px; border-radius: 6px; transition: all var(--transition);
        }
        .card-action-btn:hover { background: var(--bg-main); color: var(--primary); }

        .animate-scale-up {
          animation: scaleUp 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
        @keyframes scaleUp {
          0% { transform: scale(0.9); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default Historial;
