import { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { getLocalDateString } from '../utils/dateUtils';
import { Trophy, Plus, Calendar, Tag, Trash2, Sparkles, Filter } from 'lucide-react';

export const MilestonesView = () => {
  const { milestones, fetchMilestones, addMilestone, deleteMilestone, habits, fetchHabits } = useStore();
  const [showNew, setShowNew] = useState(false);
  const [selectedHabitFilter, setSelectedHabitFilter] = useState<string>('all');
  
  // New milestone form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [habitId, setHabitId] = useState<string>('');
  const [date, setDate] = useState(getLocalDateString());

  useEffect(() => {
    fetchMilestones();
    fetchHabits();
  }, [fetchMilestones, fetchHabits]);

  const handleAddMilestone = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    await addMilestone({
      title: title.trim(),
      description: description.trim(),
      habit_id: habitId || null,
      date,
    });

    setTitle('');
    setDescription('');
    setHabitId('');
    setShowNew(false);
  };

  const filteredMilestones = selectedHabitFilter === 'all'
    ? milestones
    : milestones.filter(m => m.habit_id === selectedHabitFilter);

  // Group milestones by month/year
  const getHabitById = (id: string | null) => habits.find(h => h.id === id);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', maxWidth: '1000px', margin: '0 auto' }}>
      
      {/* Banner / Header */}
      <div className="glass-panel" style={{ 
        padding: '1.75rem', 
        borderRadius: '16px', 
        background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.15) 0%, rgba(99, 102, 241, 0.1) 100%)',
        border: '1px solid rgba(168, 85, 247, 0.25)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.4rem' }}>
            <div style={{ padding: '0.5rem', borderRadius: '10px', backgroundColor: 'rgba(168, 85, 247, 0.2)', display: 'flex' }}>
              <Trophy size={26} color="#c084fc" />
            </div>
            <h1 style={{ fontSize: '1.75rem', margin: 0 }}>Bitácora de Victorias</h1>
          </div>
          <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '0.95rem' }}>
            Registra evidencia y momentos tangibles que demuestran que ya no eres la misma persona de hace un mes.
          </p>
        </div>

        <button 
          className="btn btn-primary"
          style={{ backgroundColor: '#a855f7', borderColor: '#a855f7', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          onClick={() => setShowNew(true)}
        >
          <Plus size={18} /> Nueva Victoria
        </button>
      </div>

      {/* New Milestone Modal / Form */}
      {showNew && (
        <form onSubmit={handleAddMilestone} className="glass-panel" style={{
          padding: '1.5rem',
          borderRadius: '14px',
          border: '1px solid rgba(168, 85, 247, 0.4)',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
          backgroundColor: 'rgba(20, 24, 38, 0.95)',
          boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
        }}>
          <h3 style={{ margin: 0, fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Sparkles size={18} color="#c084fc" /> Anotar Nuevo Hito o Victoria
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.25rem', display: 'block' }}>Título del Hito *</label>
              <input 
                type="text"
                placeholder="Ej: Entendí un video técnico en inglés sin subtítulos"
                value={title}
                onChange={e => setTitle(e.target.value)}
                style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', color: '#fff' }}
                required
                autoFocus
              />
            </div>

            <div>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.25rem', display: 'block' }}>Hábito Asociado (Opcional)</label>
              <select 
                value={habitId}
                onChange={e => setHabitId(e.target.value)}
                style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', background: '#161922', border: '1px solid var(--border-color)', color: '#f8fafc' }}
              >
                <option value="" style={{ background: '#161922', color: '#f8fafc' }}>General (Sin hábito específico)</option>
                {habits.map(h => (
                  <option key={h.id} value={h.id} style={{ background: '#161922', color: '#f8fafc' }}>{h.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.25rem', display: 'block' }}>Fecha *</label>
              <input 
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
                style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', color: '#fff' }}
                required
              />
            </div>
          </div>

          <div>
            <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.25rem', display: 'block' }}>Detalle o Contexto de la Victoria (Opcional)</label>
            <textarea 
              placeholder="Ej: Hace dos meses no podía seguir el hilo de este autor. Hoy escuché 20 minutos completos y tomé notas fluidas..."
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={3}
              style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', color: '#fff', resize: 'vertical' }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
            <button type="button" className="btn btn-outline" onClick={() => setShowNew(false)}>Cancelar</button>
            <button type="submit" className="btn btn-primary" style={{ backgroundColor: '#a855f7', borderColor: '#a855f7' }}>Guardar Victoria</button>
          </div>
        </form>
      )}

      {/* Filter and Stats Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Filter size={16} color="var(--text-secondary)" />
          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Filtrar por hábito:</span>
          <select 
            value={selectedHabitFilter}
            onChange={e => setSelectedHabitFilter(e.target.value)}
            style={{ padding: '0.4rem 0.8rem', borderRadius: '6px', background: '#161922', border: '1px solid var(--border-color)', color: '#f8fafc', fontSize: '0.85rem' }}
          >
            <option value="all" style={{ background: '#161922', color: '#f8fafc' }}>Todos los hábitos ({milestones.length})</option>
            {habits.map(h => (
              <option key={h.id} value={h.id} style={{ background: '#161922', color: '#f8fafc' }}>
                {h.name} ({milestones.filter(m => m.habit_id === h.id).length})
              </option>
            ))}
          </select>
        </div>

        <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
          Total de hitos registrados: <strong style={{ color: '#c084fc' }}>{filteredMilestones.length}</strong>
        </div>
      </div>

      {/* Timeline Feed */}
      {filteredMilestones.length === 0 ? (
        <div className="glass-panel" style={{ padding: '3.5rem 2rem', textAlign: 'center', borderRadius: '16px' }}>
          <Trophy size={48} color="rgba(168, 85, 247, 0.3)" style={{ margin: '0 auto 1rem auto' }} />
          <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>Aún no hay victorias registradas</h3>
          <p style={{ color: 'var(--text-secondary)', maxWidth: '480px', margin: '0 auto 1.5rem auto', fontSize: '0.9rem' }}>
            Cada pequeño hito cuenta. Anota los momentos en los que notas que tus hábitos están dando frutos concretos.
          </p>
          <button 
            className="btn btn-primary"
            style={{ backgroundColor: '#a855f7', borderColor: '#a855f7' }}
            onClick={() => setShowNew(true)}
          >
            <Plus size={16} /> Registrar mi primer hito
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', position: 'relative' }}>
          {filteredMilestones.map((m) => {
            const linkedHabit = getHabitById(m.habit_id);

            return (
              <div 
                key={m.id}
                className="glass-panel"
                style={{
                  padding: '1.25rem 1.5rem',
                  borderRadius: '12px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  gap: '1rem',
                  borderLeft: `4px solid ${linkedHabit?.color || '#a855f7'}`,
                  transition: 'transform 0.2s ease, border-color 0.2s ease'
                }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                    <span style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '0.3rem', 
                      fontSize: '0.75rem', 
                      color: 'var(--text-secondary)',
                      backgroundColor: 'rgba(255,255,255,0.05)',
                      padding: '0.2rem 0.5rem',
                      borderRadius: '4px'
                    }}>
                      <Calendar size={13} /> {m.date}
                    </span>

                    {linkedHabit ? (
                      <span style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '0.3rem', 
                        fontSize: '0.75rem', 
                        color: linkedHabit.color || '#fff',
                        backgroundColor: `${linkedHabit.color || '#6366f1'}22`,
                        padding: '0.2rem 0.6rem',
                        borderRadius: '12px',
                        fontWeight: '500'
                      }}>
                        <Tag size={12} /> {linkedHabit.name}
                      </span>
                    ) : (
                      <span style={{ 
                        fontSize: '0.75rem', 
                        color: '#94a3b8',
                        backgroundColor: 'rgba(255,255,255,0.05)',
                        padding: '0.2rem 0.6rem',
                        borderRadius: '12px'
                      }}>
                        General
                      </span>
                    )}
                  </div>

                  <h3 style={{ margin: '0.25rem 0 0 0', fontSize: '1.1rem', color: '#f8fafc' }}>
                    {m.title}
                  </h3>

                  {m.description && (
                    <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                      {m.description}
                    </p>
                  )}
                </div>

                <button 
                  onClick={() => deleteMilestone(m.id)}
                  style={{ background: 'none', border: 'none', color: '#ef4444', opacity: 0.4, cursor: 'pointer', padding: '0.4rem' }}
                  title="Eliminar victoria"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
