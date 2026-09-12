import { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import type { Habit } from '../store/useStore';
import { HabitDetailModal } from './HabitDetailModal';
import { getLocalDateString, getPastDaysArray } from '../utils/dateUtils';
import { 
  Plus, 
  ShieldCheck, 
  Sparkles, 
  TrendingUp, 
  Activity, 
  Zap,
  X, 
  ChevronRight
} from 'lucide-react';

export const HabitTracker = () => {
  const { 
    habits, 
    fetchHabits, 
    habitLogs, 
    fetchHabitLogs, 
    setHabitLog, 
    addHabit, 
    milestones,
    fetchMilestones
  } = useStore();

  const [showNewHabit, setShowNewHabit] = useState(false);
  const [selectedHabitForDetail, setSelectedHabitForDetail] = useState<Habit | null>(null);

  // Quick log popover state
  const [loggingCell, setLoggingCell] = useState<{
    habit: Habit;
    date: string;
    currentValue: number;
    customValue: string;
  } | null>(null);

  // New habit form state
  const [newHabitName, setNewHabitName] = useState('');
  const [newHabitUnit, setNewHabitUnit] = useState('');
  const [newHabitTargetMin, setNewHabitTargetMin] = useState('1');
  const [newHabitTargetIdeal, setNewHabitTargetIdeal] = useState('1');
  const [newHabitColor, setNewHabitColor] = useState('#6366f1');

  useEffect(() => {
    fetchHabits();
    fetchHabitLogs();
    fetchMilestones();
  }, [fetchHabits, fetchHabitLogs, fetchMilestones]);

  // Generate last 7 days strictly in local calendar time
  const last7Days = getPastDaysArray(7);

  // Create Habit Handler
  const handleCreateHabit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHabitName.trim()) return;

    await addHabit({
      name: newHabitName.trim(),
      unit: newHabitUnit.trim(),
      target_min: Number(newHabitTargetMin) || 1,
      target_ideal: Number(newHabitTargetIdeal) || 1,
      color: newHabitColor
    });

    setNewHabitName('');
    setNewHabitUnit('');
    setNewHabitTargetMin('1');
    setNewHabitTargetIdeal('1');
    setShowNewHabit(false);
  };

  // Cell quick click handler
  const handleCellClick = (habit: Habit, date: string, currentValue: number) => {
    setLoggingCell({
      habit,
      date,
      currentValue,
      customValue: currentValue > 0 ? currentValue.toString() : ''
    });
  };

  const applyQuickValue = async (value: number) => {
    if (!loggingCell) return;
    await setHabitLog(loggingCell.habit.id, loggingCell.date, value);
    setLoggingCell(null);
  };

  // Helper to get log for habit and date
  const getLog = (habitId: string, date: string) => {
    return habitLogs.find(l => l.habit_id === habitId && l.date === date);
  };

  // Global KPIs for the week
  const thisWeekLogs = habitLogs.filter(l => last7Days.includes(l.date) && l.value > 0);
  const weekIdealCount = thisWeekLogs.filter(l => {
    const habit = habits.find(h => h.id === l.habit_id);
    if (!habit) return false;
    return l.value >= habit.target_ideal;
  }).length;
  const weekBaseCount = thisWeekLogs.filter(l => {
    const habit = habits.find(h => h.id === l.habit_id);
    if (!habit) return false;
    return l.value < habit.target_ideal;
  }).length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Philosophy Banner */}
      <div className="glass-panel" style={{
        padding: '1.5rem 2rem',
        borderRadius: '16px',
        background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.12) 0%, rgba(16, 185, 129, 0.08) 100%)',
        border: '1px solid rgba(99, 102, 241, 0.25)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1.5rem'
      }}>
        <div style={{ flex: '1 1 400px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#f59e0b', fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '0.35rem' }}>
            <ShieldCheck size={18} /> PRINCIPIO DE IDENTIDAD Y VOLUMEN
          </div>
          <blockquote style={{ margin: 0, fontSize: '1.1rem', fontWeight: '500', color: '#f8fafc', fontStyle: 'italic', lineHeight: 1.4 }}>
            "Hacer un 20% para mantener tu identidad es mejor que hacer el 100% durante 15 días y luego dejarlo."
          </blockquote>
          <p style={{ margin: '0.4rem 0 0 0', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            Haz clic en cualquier hábito para ver su <strong>gráfica de tendencia decreciente</strong> si se interrumpe el ritmo.
          </p>
        </div>

        <div className="stats-container">
          <div style={{ textAlign: 'center', background: 'rgba(0,0,0,0.25)', padding: '0.6rem 1rem', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
            <div style={{ fontSize: '0.75rem', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem' }}>
              <Sparkles size={13} /> Días Ideales (7d)
            </div>
            <div style={{ fontSize: '1.3rem', fontWeight: 'bold', color: '#10b981' }}>{weekIdealCount}</div>
          </div>

          <div style={{ textAlign: 'center', background: 'rgba(0,0,0,0.25)', padding: '0.6rem 1rem', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
            <div style={{ fontSize: '0.75rem', color: '#f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem' }}>
              <ShieldCheck size={13} /> Base / 20% (7d)
            </div>
            <div style={{ fontSize: '1.3rem', fontWeight: 'bold', color: '#f59e0b' }}>{weekBaseCount}</div>
          </div>

          <div style={{ textAlign: 'center', background: 'rgba(0,0,0,0.25)', padding: '0.6rem 1rem', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
            <div style={{ fontSize: '0.75rem', color: '#a855f7' }}>Victorias Totales</div>
            <div style={{ fontSize: '1.3rem', fontWeight: 'bold', color: '#a855f7' }}>{milestones.length}</div>
          </div>
        </div>
      </div>

      {/* Action Header */}
      <div className="header-actions" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '1.35rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Activity size={22} color="var(--accent-color)" /> Dashboard de Hábitos
          </h2>
          <p style={{ margin: '0.2rem 0 0 0', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
            Índice general de actividad diaria. Haz clic en un día para registrar o en el hábito para ver su gráfica de inercia.
          </p>
        </div>

        <button 
          className="btn btn-primary"
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          onClick={() => setShowNewHabit(true)}
        >
          <Plus size={16} /> Crear Hábito
        </button>
      </div>

      {/* New Habit Form Modal */}
      {showNewHabit && (
        <form onSubmit={handleCreateHabit} className="glass-panel" style={{
          padding: '1.5rem',
          borderRadius: '14px',
          border: '1px solid var(--accent-color)',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.25rem',
          backgroundColor: 'rgba(20, 24, 38, 0.95)',
          boxShadow: '0 10px 30px rgba(0,0,0,0.6)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Nuevo Hábito Flexible</h3>
            <button type="button" onClick={() => setShowNewHabit(false)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
              <X size={18} />
            </button>
          </div>

          <div className="habit-form-grid">
            <div>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.25rem' }}>Nombre de la Actividad *</label>
              <input 
                type="text" 
                placeholder="Ej: Lectura, Pesas, Inglés, Tender cama..."
                value={newHabitName} 
                onChange={e => setNewHabitName(e.target.value)}
                style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', color: '#fff' }}
                required
                autoFocus
              />
            </div>

            <div>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.25rem' }}>Unidad (Opcional)</label>
              <input 
                type="text" 
                placeholder="ej: min, pág, kg"
                value={newHabitUnit} 
                onChange={e => setNewHabitUnit(e.target.value)}
                style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', color: '#fff' }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.75rem', color: '#f59e0b', display: 'block', marginBottom: '0.25rem' }}>Base 20% (Días duros) *</label>
              <input 
                type="number" 
                step="any"
                value={newHabitTargetMin} 
                onChange={e => setNewHabitTargetMin(e.target.value)}
                placeholder="1"
                style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', background: 'rgba(255,255,255,0.05)', border: '1px solid #f59e0b44', color: '#fff' }}
                required
              />
            </div>

            <div>
              <label style={{ fontSize: '0.75rem', color: '#10b981', display: 'block', marginBottom: '0.25rem' }}>Ideal 100% (Meta) *</label>
              <input 
                type="number" 
                step="any"
                value={newHabitTargetIdeal} 
                onChange={e => setNewHabitTargetIdeal(e.target.value)}
                placeholder="1"
                style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', background: 'rgba(255,255,255,0.05)', border: '1px solid #10b98144', color: '#fff' }}
                required
              />
            </div>

            <div>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.25rem' }}>Color</label>
              <input 
                type="color" 
                value={newHabitColor} 
                onChange={e => setNewHabitColor(e.target.value)}
                style={{ width: '42px', height: '38px', padding: 0, border: 'none', background: 'none', cursor: 'pointer' }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
            <button type="button" className="btn btn-outline" onClick={() => setShowNewHabit(false)}>Cancelar</button>
            <button type="submit" className="btn btn-primary">Crear Hábito</button>
          </div>
        </form>
      )}

      {/* Main Matrix Dashboard Table */}
      <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: '16px', overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ textAlign: 'left', padding: '1rem', borderBottom: '1px solid var(--border-color)', minWidth: '220px' }}>
                Hábito y Metas
              </th>
              {last7Days.map(date => {
                const [, month, day] = date.split('-');
                const isToday = date === getLocalDateString();
                return (
                  <th key={date} style={{ 
                    padding: '0.75rem 0.5rem', 
                    borderBottom: '1px solid var(--border-color)', 
                    textAlign: 'center', 
                    fontSize: '0.8rem',
                    color: isToday ? 'var(--accent-color)' : 'var(--text-secondary)',
                    fontWeight: isToday ? 'bold' : 'normal'
                  }}>
                    <div>{`${day}/${month}`}</div>
                    {isToday && <div style={{ fontSize: '0.65rem', textTransform: 'uppercase' }}>Hoy</div>}
                  </th>
                );
              })}
              <th style={{ textAlign: 'center', padding: '1rem', borderBottom: '1px solid var(--border-color)', minWidth: '100px' }}>
                Volumen (7d)
              </th>
              <th style={{ textAlign: 'center', padding: '1rem', borderBottom: '1px solid var(--border-color)', minWidth: '80px' }}>
                Detalle
              </th>
            </tr>
          </thead>
          <tbody>
            {habits.length === 0 ? (
              <tr>
                <td colSpan={10} style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-secondary)' }}>
                  Aún no has creado ningún hábito. Haz clic en <strong>"Crear Hábito"</strong> para empezar.
                </td>
              </tr>
            ) : (
              habits.map(habit => {
                // Calculate week volume for this habit
                const weekLogs = habitLogs.filter(l => l.habit_id === habit.id && last7Days.includes(l.date));
                const weekVol = weekLogs.reduce((acc, l) => acc + (l.value || 0), 0);

                return (
                  <tr key={habit.id} style={{ transition: 'background 0.2s ease' }} className="habit-row">
                    {/* Habit Title Column (clickable to open detail) */}
                    <td style={{ padding: '1rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <div 
                        onClick={() => setSelectedHabitForDetail(habit)}
                        style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: '0.2rem' }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: habit.color || '#6366f1', display: 'inline-block' }} />
                          <strong style={{ fontSize: '1rem', color: '#f8fafc' }}>{habit.name}</strong>
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginLeft: '1.25rem' }}>
                          <span style={{ color: '#f59e0b' }}>Base: {habit.target_min}</span> • <span style={{ color: '#10b981' }}>Ideal: {habit.target_ideal}</span> {habit.unit}
                        </div>
                      </div>
                    </td>

                    {/* Day Cells (Last 7 Days) */}
                    {last7Days.map(date => {
                      const log = getLog(habit.id, date);
                      const value = log ? (log.value || 0) : 0;
                      const isIdeal = value >= habit.target_ideal && habit.target_ideal > 0;
                      const isBase = value >= habit.target_min && !isIdeal && habit.target_min > 0;
                      const isPartial = value > 0 && !isIdeal && !isBase;

                      return (
                        <td key={date} style={{ padding: '0.6rem 0.4rem', borderBottom: '1px solid rgba(255,255,255,0.05)', textAlign: 'center' }}>
                          <button 
                            onClick={() => handleCellClick(habit, date, value)}
                            style={{
                              width: '44px',
                              height: '44px',
                              borderRadius: '10px',
                              border: isIdeal 
                                ? '1px solid rgba(16, 185, 129, 0.8)' 
                                : isBase 
                                ? '1px solid rgba(245, 158, 11, 0.8)' 
                                : isPartial
                                ? '1px solid rgba(129, 140, 248, 0.8)'
                                : '1px dashed rgba(255,255,255,0.12)',
                              background: isIdeal 
                                ? 'rgba(16, 185, 129, 0.18)' 
                                : isBase 
                                ? 'rgba(245, 158, 11, 0.18)' 
                                : isPartial
                                ? 'rgba(99, 102, 241, 0.18)'
                                : 'rgba(255,255,255,0.02)',
                              cursor: 'pointer',
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: isIdeal ? '#10b981' : isBase ? '#f59e0b' : isPartial ? '#818cf8' : 'var(--text-secondary)',
                              margin: '0 auto',
                              transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                              boxShadow: isIdeal 
                                ? '0 0 12px rgba(16, 185, 129, 0.25)' 
                                : isBase 
                                ? '0 0 10px rgba(245, 158, 11, 0.2)' 
                                : isPartial
                                ? '0 0 10px rgba(99, 102, 241, 0.25)'
                                : 'none'
                            }}
                            title={`${habit.name} (${date}): ${value > 0 ? `${value} ${habit.unit}` : 'Sin registrar'}`}
                          >
                            {isIdeal ? (
                              <>
                                <Sparkles size={14} />
                                <span style={{ fontSize: '0.65rem', fontWeight: 'bold', marginTop: '1px' }}>{value}</span>
                              </>
                            ) : isBase ? (
                              <>
                                <ShieldCheck size={14} />
                                <span style={{ fontSize: '0.65rem', fontWeight: 'bold', marginTop: '1px' }}>{value}</span>
                              </>
                            ) : isPartial ? (
                              <>
                                <Zap size={14} />
                                <span style={{ fontSize: '0.65rem', fontWeight: 'bold', marginTop: '1px' }}>{value}</span>
                              </>
                            ) : (
                              <span style={{ fontSize: '0.75rem', opacity: 0.3 }}>-</span>
                            )}
                          </button>
                        </td>
                      );
                    })}

                    {/* Week Volume */}
                    <td style={{ padding: '1rem', borderBottom: '1px solid rgba(255,255,255,0.05)', textAlign: 'center', fontWeight: 'bold' }}>
                      <span style={{ color: weekVol > 0 ? habit.color : 'var(--text-secondary)' }}>
                        {weekVol} <span style={{ fontSize: '0.75rem', fontWeight: 'normal', color: 'var(--text-secondary)' }}>{habit.unit}</span>
                      </span>
                    </td>

                    {/* Open Detail Button */}
                    <td style={{ padding: '1rem', borderBottom: '1px solid rgba(255,255,255,0.05)', textAlign: 'center' }}>
                      <button 
                        onClick={() => setSelectedHabitForDetail(habit)}
                        className="btn btn-outline"
                        style={{ padding: '0.4rem 0.6rem', border: 'none', display: 'flex', alignItems: 'center', gap: '0.2rem', margin: '0 auto' }}
                        title="Ver gráfico de tendencia y momentum"
                      >
                        <TrendingUp size={16} color={habit.color} />
                        <ChevronRight size={14} />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Quick Logging Popover / Modal */}
      {loggingCell && (
        <div 
          onClick={() => setLoggingCell(null)}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.6)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 999
          }}
        >
          <div 
            onClick={e => e.stopPropagation()}
            className="glass-panel" 
            style={{
              width: '100%',
              maxWidth: '380px',
              padding: '1.5rem',
              borderRadius: '14px',
              display: 'flex',
              flexDirection: 'column',
              gap: '1.25rem',
              boxShadow: '0 15px 40px rgba(0,0,0,0.7)',
              border: '1px solid var(--border-color)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h4 style={{ margin: 0, fontSize: '1.1rem' }}>{loggingCell.habit.name}</h4>
                <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  Fecha: <strong>{loggingCell.date}</strong>
                </p>
              </div>
              <button 
                onClick={() => setLoggingCell(null)}
                style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Quick Actions Buttons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              <button 
                className="btn"
                onClick={() => applyQuickValue(loggingCell.habit.target_ideal)}
                style={{
                  background: 'rgba(16, 185, 129, 0.15)',
                  border: '1px solid rgba(16, 185, 129, 0.4)',
                  color: '#10b981',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Sparkles size={16} /> Marcar Nivel Ideal (100%)
                </span>
                <strong>{loggingCell.habit.target_ideal} {loggingCell.habit.unit}</strong>
              </button>

              <button 
                className="btn"
                onClick={() => applyQuickValue(loggingCell.habit.target_min)}
                style={{
                  background: 'rgba(245, 158, 11, 0.15)',
                  border: '1px solid rgba(245, 158, 11, 0.4)',
                  color: '#f59e0b',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <ShieldCheck size={16} /> Marcar Nivel Base (20%)
                </span>
                <strong>{loggingCell.habit.target_min} {loggingCell.habit.unit}</strong>
              </button>
            </div>

            {/* Custom Value Input */}
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                applyQuickValue(Number(loggingCell.customValue) || 0);
              }}
              style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}
            >
              <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.4rem' }}>
                O escribe un valor específico ({loggingCell.habit.unit || 'cantidad'}):
              </label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input 
                  type="number"
                  step="any"
                  placeholder="Ej: 15"
                  value={loggingCell.customValue}
                  onChange={e => setLoggingCell({ ...loggingCell, customValue: e.target.value })}
                  style={{ flex: 1, padding: '0.5rem', borderRadius: '6px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-color)', color: '#fff' }}
                  autoFocus
                />
                <button 
                  type="submit"
                  className="btn btn-primary"
                  disabled={!loggingCell.customValue}
                >
                  Guardar
                </button>
              </div>
            </form>

            {/* Clear Button */}
            {loggingCell.currentValue > 0 && (
              <button 
                type="button"
                className="btn btn-outline"
                onClick={() => applyQuickValue(0)}
                style={{ borderColor: 'rgba(239,68,68,0.3)', color: '#ef4444', fontSize: '0.8rem' }}
              >
                Desmarcar / Limpiar este día
              </button>
            )}
          </div>
        </div>
      )}

      {/* Habit Detail Modal (when habit title or trending icon is clicked) */}
      {selectedHabitForDetail && (
        <HabitDetailModal 
          habit={habits.find(h => h.id === selectedHabitForDetail.id) || selectedHabitForDetail}
          onClose={() => setSelectedHabitForDetail(null)}
        />
      )}
    </div>
  );
};
