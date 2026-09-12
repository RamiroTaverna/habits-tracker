import { useState } from 'react';
import { useStore } from '../store/useStore';
import type { Habit } from '../store/useStore';
import { HabitTrendChart } from './HabitTrendChart';
import { getLocalDateString } from '../utils/dateUtils';
import { X, Trophy, Plus, TrendingUp, ShieldCheck, Sparkles, Trash2, Edit3, Save } from 'lucide-react';

interface HabitDetailModalProps {
  habit: Habit;
  onClose: () => void;
}

export const HabitDetailModal: React.FC<HabitDetailModalProps> = ({ habit, onClose }) => {
  const { habitLogs, milestones, addMilestone, deleteMilestone, updateHabit, deleteHabit } = useStore();
  const [timeRange, setTimeRange] = useState<number | 'all'>(30);
  
  // State for new milestone on this habit
  const [showAddMilestone, setShowAddMilestone] = useState(false);
  const [milestoneTitle, setMilestoneTitle] = useState('');
  const [milestoneDesc, setMilestoneDesc] = useState('');
  const [milestoneDate, setMilestoneDate] = useState(getLocalDateString());

  // State for editing habit
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(habit.name);
  const [editUnit, setEditUnit] = useState(habit.unit);
  const [editTargetMin, setEditTargetMin] = useState(habit.target_min.toString());
  const [editTargetIdeal, setEditTargetIdeal] = useState(habit.target_ideal.toString());
  const [editColor, setEditColor] = useState(habit.color);

  // Filter logs for this habit
  const habitLogsList = habitLogs.filter(l => l.habit_id === habit.id);
  const habitMilestones = milestones.filter(m => m.habit_id === habit.id);

  // Calculate Aggregations
  const totalVolume = habitLogsList.reduce((sum, l) => sum + (l.value || 0), 0);
  const idealDays = habitLogsList.filter(l => l.value >= habit.target_ideal).length;
  const baseDays = habitLogsList.filter(l => l.value >= habit.target_min && l.value < habit.target_ideal).length;
  const partialDays = habitLogsList.filter(l => l.value > 0 && l.value < habit.target_min).length;
  const totalSavedDays = baseDays + partialDays;

  // Compute effective days count for 'all' (Histórico)
  const effectiveDaysCount = (() => {
    if (timeRange !== 'all') return timeRange;
    if (habitLogsList.length === 0) return 30;
    const sortedDates = habitLogsList.map(l => l.date).sort();
    const earliest = sortedDates[0];
    const today = new Date();
    const [ey, em, ed] = earliest.split('-').map(Number);
    const earliestDate = new Date(ey, em - 1, ed);
    const diffDays = Math.ceil((today.getTime() - earliestDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    return Math.max(diffDays, 14);
  })();

  const handleSaveMilestone = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!milestoneTitle.trim()) return;
    await addMilestone({
      habit_id: habit.id,
      title: milestoneTitle.trim(),
      description: milestoneDesc.trim(),
      date: milestoneDate
    });
    setMilestoneTitle('');
    setMilestoneDesc('');
    setShowAddMilestone(false);
  };

  const handleUpdateHabit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editName.trim()) return;
    await updateHabit(habit.id, {
      name: editName.trim(),
      unit: editUnit.trim(),
      target_min: Number(editTargetMin) || 1,
      target_ideal: Number(editTargetIdeal) || 1,
      color: editColor
    });
    setIsEditing(false);
  };

  const handleDelete = async () => {
    if (window.confirm(`¿Estás seguro de eliminar el hábito "${habit.name}" y todos sus registros?`)) {
      try {
        await deleteHabit(habit.id);
        onClose();
      } catch (err) {
        console.error('Error al eliminar hábito:', err);
      }
    }
  };

  return (
    <div 
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '1.5rem'
      }}
    >
      <div 
        onClick={e => e.stopPropagation()}
        className="glass-panel" 
        style={{
        width: '100%',
        maxWidth: '850px',
        maxHeight: '90vh',
        overflowY: 'auto',
        borderRadius: '16px',
        padding: '2rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.75rem',
        border: `1px solid ${habit.color}44`,
        boxShadow: `0 20px 50px rgba(0,0,0,0.6)`
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ width: 14, height: 14, borderRadius: '50%', backgroundColor: habit.color, boxShadow: `0 0 10px ${habit.color}` }} />
              <h2 style={{ fontSize: '1.6rem', margin: 0 }}>{habit.name}</h2>
              <button 
                className="btn btn-outline" 
                style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem', border: 'none' }}
                onClick={() => setIsEditing(!isEditing)}
                title="Editar configuración del hábito"
              >
                <Edit3 size={14} />
              </button>
            </div>
            <p style={{ color: 'var(--text-secondary)', margin: '0.4rem 0 0 0', fontSize: '0.9rem' }}>
              Base (20% identidad): <strong>{habit.target_min} {habit.unit}</strong> • Ideal (100%): <strong>{habit.target_ideal} {habit.unit}</strong>
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button 
              onClick={handleDelete}
              className="btn btn-outline" 
              style={{ color: '#ef4444', borderColor: 'rgba(239,68,68,0.3)', padding: '0.5rem' }}
              title="Eliminar hábito"
            >
              <Trash2 size={18} />
            </button>
            <button 
              onClick={onClose}
              className="btn btn-outline" 
              style={{ padding: '0.5rem' }}
              title="Cerrar ventana"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Edit Form (Collapsible) */}
        {isEditing && (
          <form onSubmit={handleUpdateHabit} style={{
            backgroundColor: 'rgba(255,255,255,0.03)',
            border: '1px solid var(--border-color)',
            borderRadius: '10px',
            padding: '1.25rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem'
          }}>
            <h4 style={{ margin: 0, fontSize: '0.95rem' }}>Editar Configuración del Hábito</h4>
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr auto', gap: '0.75rem', alignItems: 'flex-end' }}>
              <div>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Nombre</label>
                <input 
                  type="text" 
                  value={editName} 
                  onChange={e => setEditName(e.target.value)}
                  style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-color)', color: '#fff' }}
                  required
                />
              </div>
              <div>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Unidad (opcional)</label>
                <input 
                  type="text" 
                  value={editUnit} 
                  onChange={e => setEditUnit(e.target.value)}
                  placeholder="ej: min, págs"
                  style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-color)', color: '#fff' }}
                />
              </div>
              <div>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Base (20%)</label>
                <input 
                  type="number" 
                  step="any"
                  value={editTargetMin} 
                  onChange={e => setEditTargetMin(e.target.value)}
                  style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-color)', color: '#fff' }}
                  required
                />
              </div>
              <div>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Ideal (100%)</label>
                <input 
                  type="number" 
                  step="any"
                  value={editTargetIdeal} 
                  onChange={e => setEditTargetIdeal(e.target.value)}
                  style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-color)', color: '#fff' }}
                  required
                />
              </div>
              <div>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Color</label>
                <input 
                  type="color" 
                  value={editColor} 
                  onChange={e => setEditColor(e.target.value)}
                  style={{ width: '40px', height: '35px', padding: 0, border: 'none', background: 'none', cursor: 'pointer' }}
                />
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
              <button type="button" className="btn btn-outline" onClick={() => setIsEditing(false)}>Cancelar</button>
              <button type="submit" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Save size={14} /> Guardar Cambios
              </button>
            </div>
          </form>
        )}

        {/* KPI Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
          <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.8rem', marginBottom: '0.35rem' }}>
              <TrendingUp size={16} color={habit.color} /> Volumen Acumulado
            </div>
            <div style={{ fontSize: '1.4rem', fontWeight: 'bold' }}>
              {totalVolume.toLocaleString()} <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{habit.unit}</span>
            </div>
          </div>

          <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#10b981', fontSize: '0.8rem', marginBottom: '0.35rem' }}>
              <Sparkles size={16} /> Días Ideales (100%)
            </div>
            <div style={{ fontSize: '1.4rem', fontWeight: 'bold', color: '#10b981' }}>
              {idealDays} <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>días</span>
            </div>
          </div>

          <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#f59e0b', fontSize: '0.8rem', marginBottom: '0.35rem' }}>
              <ShieldCheck size={16} /> Victorias Base / Salvadas
            </div>
            <div style={{ fontSize: '1.4rem', fontWeight: 'bold', color: '#f59e0b' }}>
              {totalSavedDays} <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>salvadas</span>
            </div>
            {partialDays > 0 && (
              <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                ({baseDays} base + {partialDays} progresivas)
              </div>
            )}
          </div>

          <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#a855f7', fontSize: '0.8rem', marginBottom: '0.35rem' }}>
              <Trophy size={16} /> Hitos / Victorias
            </div>
            <div style={{ fontSize: '1.4rem', fontWeight: 'bold', color: '#a855f7' }}>
              {habitMilestones.length} <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>logros</span>
            </div>
          </div>
        </div>

        {/* Trendline & Cumulative Growth Chart Section */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '1.1rem', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <TrendingUp size={18} color={habit.color} /> Curva de Progreso Acumulado
            </h3>
            <div style={{ display: 'flex', gap: '0.35rem', backgroundColor: 'rgba(255,255,255,0.05)', padding: '3px', borderRadius: '8px' }}>
              {([14, 30, 60, 'all'] as const).map(option => (
                <button
                  key={option}
                  onClick={() => setTimeRange(option)}
                  style={{
                    border: 'none',
                    background: timeRange === option ? 'var(--accent-color)' : 'transparent',
                    color: timeRange === option ? '#fff' : 'var(--text-secondary)',
                    borderRadius: '6px',
                    padding: '0.25rem 0.6rem',
                    fontSize: '0.75rem',
                    cursor: 'pointer',
                    fontWeight: timeRange === option ? 'bold' : 'normal',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {option === 'all' ? 'Histórico' : `${option}d`}
                </button>
              ))}
            </div>
          </div>

          <HabitTrendChart habit={habit} logs={habitLogsList} daysCount={effectiveDaysCount} />
          
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontStyle: 'italic', background: 'rgba(99, 102, 241, 0.05)', padding: '0.6rem 1rem', borderRadius: '8px', borderLeft: `3px solid ${habit.color}` }}>
            💡 Cada minuto, página o repetición suma a tu total acumulado infinito. Los días en nivel base suman y mantienen tu identidad; los días con superávit (ej. 60 min) disparan la curva hacia arriba; y los días inactivos crean mesetas horizontales.
          </div>
        </div>

        {/* Milestones / Victories for this Habit */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '1.1rem', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Trophy size={18} color="#a855f7" /> Bitácora de Hitos de "{habit.name}"
            </h3>
            <button 
              className="btn btn-primary" 
              style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
              onClick={() => setShowAddMilestone(!showAddMilestone)}
            >
              <Plus size={14} /> Registrar Victoria
            </button>
          </div>

          {showAddMilestone && (
            <form onSubmit={handleSaveMilestone} style={{
              backgroundColor: 'rgba(168, 85, 247, 0.08)',
              border: '1px solid rgba(168, 85, 247, 0.3)',
              borderRadius: '10px',
              padding: '1rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem'
            }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 140px', gap: '0.75rem' }}>
                <input 
                  type="text"
                  placeholder="Título del hito (ej: Entendí un video técnico completo)"
                  value={milestoneTitle}
                  onChange={e => setMilestoneTitle(e.target.value)}
                  style={{ padding: '0.5rem', borderRadius: '6px', background: 'rgba(0,0,0,0.4)', border: '1px solid var(--border-color)', color: '#fff' }}
                  required
                  autoFocus
                />
                <input 
                  type="date"
                  value={milestoneDate}
                  onChange={e => setMilestoneDate(e.target.value)}
                  style={{ padding: '0.5rem', borderRadius: '6px', background: 'rgba(0,0,0,0.4)', border: '1px solid var(--border-color)', color: '#fff' }}
                  required
                />
              </div>
              <textarea 
                placeholder="Detalle o reflexión de avance tangible (opcional)..."
                value={milestoneDesc}
                onChange={e => setMilestoneDesc(e.target.value)}
                rows={2}
                style={{ padding: '0.5rem', borderRadius: '6px', background: 'rgba(0,0,0,0.4)', border: '1px solid var(--border-color)', color: '#fff', resize: 'vertical' }}
              />
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                <button type="button" className="btn btn-outline" onClick={() => setShowAddMilestone(false)}>Cancelar</button>
                <button type="submit" className="btn btn-primary" style={{ backgroundColor: '#a855f7', borderColor: '#a855f7' }}>Guardar Victoria</button>
              </div>
            </form>
          )}

          {habitMilestones.length === 0 ? (
            <div style={{ padding: '1.25rem', textAlign: 'center', color: 'var(--text-secondary)', background: 'rgba(255,255,255,0.02)', borderRadius: '8px' }}>
              Aún no hay victorias registradas para este hábito. ¡Anota cada avance que demuestre tu evolución!
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {habitMilestones.map(m => (
                <div key={m.id} style={{
                  padding: '0.9rem 1.1rem',
                  backgroundColor: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '10px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  gap: '1rem'
                }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
                      <span style={{ fontSize: '0.75rem', color: '#a855f7', fontWeight: 'bold' }}>{m.date}</span>
                      <strong style={{ fontSize: '0.95rem' }}>{m.title}</strong>
                    </div>
                    {m.description && (
                      <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                        {m.description}
                      </p>
                    )}
                  </div>
                  <button 
                    onClick={() => deleteMilestone(m.id)}
                    style={{ background: 'none', border: 'none', color: '#ef4444', opacity: 0.5, cursor: 'pointer', padding: 0 }}
                    title="Eliminar hito"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
