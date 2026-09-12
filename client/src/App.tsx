import { useEffect, useState } from 'react';
import { useStore } from './store/useStore';
import { CheckSquare, Trophy, Target, Sparkles, Lock, LogOut } from 'lucide-react';
import { HabitTracker } from './components/HabitTracker';
import { MilestonesView } from './components/MilestonesView';
import './index.css';

function App() {
  const { fetchHabits, fetchHabitLogs, fetchMilestones, password, setPassword, logout } = useStore();
  const [activeTab, setActiveTab] = useState<'habits' | 'milestones'>('habits');
  const [inputPassword, setInputPassword] = useState('');

  useEffect(() => {
    if (password) {
      fetchHabits();
      fetchHabitLogs();
      fetchMilestones();
    }
  }, [fetchHabits, fetchHabitLogs, fetchMilestones, password]);

  if (!password) {
    return (
      <div className="login-container">
        <div className="glass-panel login-panel">
          <Lock size={48} color="var(--accent-color)" style={{ marginBottom: '1rem' }} />
          <h2>Acceso Restringido</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>Por favor, ingresa tu contraseña maestra para continuar.</p>
          <form onSubmit={(e) => { e.preventDefault(); setPassword(inputPassword); }} style={{ width: '100%' }}>
            <input 
              type="password" 
              placeholder="Contraseña" 
              value={inputPassword}
              onChange={(e) => setInputPassword(e.target.value)}
              className="login-input"
              autoFocus
            />
            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }}>Desbloquear</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      {/* Sidebar */}
      <div className="sidebar">
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

        <div className="sidebar-footer" style={{ marginTop: 'auto', padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '10px', border: '1px solid var(--border-color)', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#f59e0b', fontWeight: 'bold', marginBottom: '0.2rem' }}>
            <Sparkles size={12} /> Regla del 20%
          </div>
          Cumplir el mínimo base salva tu identidad en días difíciles.
        </div>
      </div>

      {/* Main Content Area */}
      <div className="main-content">
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h1 style={{ margin: 0, fontSize: '1.75rem' }}>
            {activeTab === 'habits' && 'Rastreador de Hábitos & Momentum'}
            {activeTab === 'milestones' && 'Bitácora de Victorias'}
          </h1>
          <button 
            className="btn btn-outline" 
            onClick={logout} 
            title="Cerrar sesión"
            style={{ padding: '0.4rem 0.6rem' }}
          >
            <LogOut size={18} />
          </button>
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

