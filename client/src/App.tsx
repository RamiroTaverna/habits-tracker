import { useEffect, useState } from 'react';
import { useStore } from './store/useStore';
import { CheckSquare, Trophy, Target, Sparkles } from 'lucide-react';
import { HabitTracker } from './components/HabitTracker';
import { MilestonesView } from './components/MilestonesView';
import './index.css';

function App() {
  const { fetchHabits, fetchHabitLogs, fetchMilestones } = useStore();
  const [activeTab, setActiveTab] = useState<'habits' | 'milestones'>('habits');

  useEffect(() => {
    fetchHabits();
    fetchHabitLogs();
    fetchMilestones();
  }, [fetchHabits, fetchHabitLogs, fetchMilestones]);

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw', overflow: 'hidden' }}>

      {/* Sidebar */}
      <div style={{
        width: '260px',
        backgroundColor: 'var(--panel-bg)',
        borderRight: '1px solid var(--border-color)',
        padding: '2rem 1.25rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem',
        flexShrink: 0
      }}>
        <div style={{ padding: '0 0.5rem', marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.3rem', display: 'flex', alignItems: 'center', gap: '0.6rem', color: '#f8fafc', margin: 0 }}>
            <Target size={26} color="var(--accent-color)" />
            RAMA-TRACKER
          </h2>
        </div>

        <button
          className={`btn ${activeTab === 'habits' ? 'btn-primary' : 'btn-outline'}`}
          style={{ justifyContent: 'flex-start', border: 'none', gap: '0.6rem', fontSize: '0.9rem' }}
          onClick={() => setActiveTab('habits')}
        >
          <CheckSquare size={18} /> Dashboard de Hábitos
        </button>

        <button
          className={`btn ${activeTab === 'milestones' ? 'btn-primary' : 'btn-outline'}`}
          style={{
            justifyContent: 'flex-start',
            border: 'none',
            gap: '0.6rem',
            fontSize: '0.9rem',
            backgroundColor: activeTab === 'milestones' ? 'rgba(168, 85, 247, 0.2)' : undefined,
            color: activeTab === 'milestones' ? '#c084fc' : undefined,
            borderColor: activeTab === 'milestones' ? '#a855f7' : undefined
          }}
          onClick={() => setActiveTab('milestones')}
        >
          <Trophy size={18} color={activeTab === 'milestones' ? '#c084fc' : 'currentColor'} /> Bitácora de Victorias
        </button>

        <div style={{ marginTop: 'auto', padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '10px', border: '1px solid var(--border-color)', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#f59e0b', fontWeight: 'bold', marginBottom: '0.2rem' }}>
            <Sparkles size={12} /> Regla del 20%
          </div>
          Cumplir el mínimo base salva tu identidad en días difíciles.
        </div>
      </div>

      {/* Main Content Area */}
      <div style={{ flex: 1, padding: '2rem', overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h1 style={{ margin: 0, fontSize: '1.75rem' }}>
            {activeTab === 'habits' && 'Rastreador de Hábitos & Momentum'}
            {activeTab === 'milestones' && 'Bitácora de Victorias'}
          </h1>
        </header>

        <main style={{ flex: 1 }}>
          {activeTab === 'habits' && <HabitTracker />}
          {activeTab === 'milestones' && <MilestonesView />}
        </main>
      </div>
    </div>
  );
}

export default App;

