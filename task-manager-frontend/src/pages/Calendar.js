// client/src/pages/Calendar.js
import React, { useEffect, useMemo, useState } from 'react';
import { useTasks } from '../contexts/TasksContext';
import Header from '../components/Header';

function fmtDateKey(d) {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}
function clampToMidnight(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}
function startOfMonth(y, m) { return new Date(y, m, 1); }
function endOfMonth(y, m) { return new Date(y, m + 1, 0); }

export default function Calendar() {
  const { allTasks = [] } = useTasks();
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [selectedDayKey, setSelectedDayKey] = useState(null);

  const savedMode = typeof window !== 'undefined' ? localStorage.getItem('tm_calendar_mode') : null;
  const [mode, setMode] = useState(savedMode || 'span');

  useEffect(() => {
    localStorage.setItem('tm_calendar_mode', mode);
  }, [mode]);

  const tasksByDay = useMemo(() => {
    const map = {};
    const add = (dateObj, task) => {
      if (!dateObj || isNaN(dateObj.getTime())) return;
      const key = fmtDateKey(dateObj);
      if (!map[key]) map[key] = [];
      map[key].push(task);
    };

    allTasks.forEach((t) => {
      const rawStart = t.startDate ? new Date(t.startDate) : null;
      const rawEnd = t.expectedCompletion ? new Date(t.expectedCompletion) : null;
      const created = t.createdAt ? new Date(t.createdAt) : null;

      if (mode === 'start') {
        const pick = rawStart || rawEnd || created;
        if (pick && !isNaN(pick.getTime())) add(clampToMidnight(pick), t);
      } else {
        const start = rawStart || rawEnd || created;
        const end = rawEnd || rawStart || created;
        if (!start || isNaN(start.getTime())) return;
        const s = clampToMidnight(start);
        const e = clampToMidnight(end || start);
        if (e < s) add(s, t);
        else {
          for (let d = new Date(s); d <= e; d.setDate(d.getDate() + 1)) {
            add(new Date(d), t);
          }
        }
      }
    });

    Object.keys(map).forEach((k) => {
      map[k].sort((a, b) => {
        const aa = a.startDate ? new Date(a.startDate).getTime() : 0;
        const bb = b.startDate ? new Date(b.startDate).getTime() : 0;
        return aa - bb;
      });
    });

    return map;
  }, [allTasks, mode]);

  const weeks = useMemo(() => {
    const first = startOfMonth(viewYear, viewMonth);
    const last = endOfMonth(viewYear, viewMonth);
    const startWeekday = first.getDay();
    const daysInMonth = last.getDate();
    const cells = [];
    for (let i = 0; i < startWeekday; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(viewYear, viewMonth, d));
    while (cells.length % 7 !== 0) cells.push(null);
    const rows = [];
    for (let i = 0; i < cells.length; i += 7) rows.push(cells.slice(i, i + 7));
    return rows;
  }, [viewYear, viewMonth]);

  useEffect(() => {
    const kToday = fmtDateKey(today);
    const inMonth = today.getFullYear() === viewYear && today.getMonth() === viewMonth;
    if (inMonth && !selectedDayKey) setSelectedDayKey(kToday);
  }, [viewYear, viewMonth]); // eslint-disable-line

  const goPrevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); } else setViewMonth(m => m - 1);
    setSelectedDayKey(null);
  };
  const goNextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); } else setViewMonth(m => m + 1);
    setSelectedDayKey(null);
  };

  const monthLabel = new Date(viewYear, viewMonth, 1).toLocaleString(undefined, { month: 'long', year: 'numeric' });

  const openDay = (dateObj) => { if (!dateObj) return; setSelectedDayKey(fmtDateKey(dateObj)); };
  const closeModal = () => setSelectedDayKey(null);
  const dayTasks = selectedDayKey ? (tasksByDay[selectedDayKey] || []) : [];

  const shortTime = (iso) => {
    if (!iso) return '';
    try { return new Date(iso).toLocaleString(); } catch { return String(iso); }
  };

  return (
    <div style={{ padding: 18 }}>
      <Header title="Calendar" />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, marginTop: 12 }}>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <button className="mini-btn" onClick={goPrevMonth}>◀</button>
          <div style={{ fontWeight: 700, fontSize: 16 }}>{monthLabel}</div>
          <button className="mini-btn" onClick={goNextMonth}>▶</button>
        </div>

        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <div style={{ color: 'var(--muted)', fontSize: 14 }}>
            Mode:
          </div>
          <select
            value={mode}
            onChange={(e) => setMode(e.target.value)}
            style={{ padding: '6px 8px', borderRadius: 8, border: '1px solid var(--card-border)', background: 'transparent' }}
          >
            <option value="span">Span (start → expected)</option>
            <option value="start">Start only</option>
          </select>
        </div>
      </div>

      <div style={{ marginTop: 12, borderRadius: 10, overflow: 'hidden', border: '1px solid var(--card-border)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', padding: '10px 12px', background: 'var(--panel)' }}>
          {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d => (
            <div key={d} style={{ fontSize: 12, color: 'var(--muted)', textAlign: 'center', fontWeight: 700 }}>{d}</div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 8, padding: 12, background: 'var(--bg)' }}>
          {weeks.flat().map((cell, idx) => {
            if (!cell) return <div key={idx} className="task-card" style={{ minHeight: 90, opacity: 0.4, background: 'transparent' }} />;
            const key = fmtDateKey(cell);
            const tasksForDay = tasksByDay[key] || [];
            const isToday = fmtDateKey(cell) === fmtDateKey(new Date());
            return (
              <div
                key={idx}
                className="task-card"
                onClick={() => openDay(cell)}
                style={{ minHeight: 90, cursor: 'pointer', position: 'relative', borderRadius: 8, padding: 10, boxSizing: 'border-box' }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontWeight: 700 }}>{cell.getDate()}</div>
                  {isToday && <div style={{ fontSize: 12, color: 'var(--muted)' }}>Today</div>}
                </div>

                <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {tasksForDay.slice(0, 3).map((t) => (
                    <div key={t._id || t.id} style={{ fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      • {t.title}
                      <div style={{ fontSize: 11, color: 'var(--muted)' }}>{t.startDate ? shortTime(t.startDate) : (t.expectedCompletion ? `Due: ${shortTime(t.expectedCompletion)}` : '')}</div>
                    </div>
                  ))}
                  {tasksForDay.length > 3 && <div style={{ fontSize: 12, color: 'var(--muted)' }}>+{tasksForDay.length - 3} more</div>}
                </div>

                {tasksForDay.length > 0 && (
                  <div style={{ position: 'absolute', right: 8, top: 8 }}>
                    <span className="badge">{tasksForDay.length}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {selectedDayKey && (
        <div className="popup-overlay" onMouseDown={closeModal}>
          <div className="popup-card" onMouseDown={(e) => e.stopPropagation()}>
            <header className="popup-header">
              <h3>Tasks on {selectedDayKey}</h3>
              <button className="popup-close" onClick={closeModal}>&times;</button>
            </header>

            <div style={{ padding: 14 }}>
              {dayTasks.length === 0 ? (
                <div className="empty">No tasks for this day.</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {dayTasks.map(t => (
                    <div key={t._id || t.id} className="task-card" style={{ padding: 10 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ fontWeight: 700 }}>{t.title}</div>
                        <div style={{ fontSize: 12, color: 'var(--muted)' }}>{t.bucket || ''}</div>
                      </div>
                      <div style={{ color: 'var(--muted)', marginTop: 6, fontSize: 13 }}>{t.description}</div>
                      <div style={{ marginTop: 8, display: 'flex', gap: 8, alignItems: 'center' }}>
                        {t.startDate && <div className="date-badge">Start: <span className="date-text">{shortTime(t.startDate)}</span></div>}
                        {t.expectedCompletion && <div className="date-badge">Due: <span className="date-text">{shortTime(t.expectedCompletion)}</span></div>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div style={{ padding: 14, display: 'flex', justifyContent: 'flex-end' }}>
              <button className="btn-cancel" onClick={closeModal}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
