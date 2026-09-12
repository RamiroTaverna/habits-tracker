import { create } from 'zustand';

export interface Habit {
  id: string;
  name: string;
  unit: string;
  target_min: number;
  target_ideal: number;
  color: string;
  streak: number;
}

export interface HabitLog {
  id?: number;
  habit_id: string;
  date: string;
  value: number;
  completed: boolean;
  notes?: string;
}

export interface Milestone {
  id: string;
  habit_id: string | null;
  title: string;
  description: string;
  date: string;
  created_at?: string;
}

interface AppState {
  habits: Habit[];
  habitLogs: HabitLog[];
  milestones: Milestone[];
  
  // Habits actions
  fetchHabits: () => Promise<void>;
  addHabit: (habit: Omit<Habit, 'id' | 'streak'>) => Promise<void>;
  updateHabit: (id: string, updates: Partial<Habit>) => Promise<void>;
  deleteHabit: (id: string) => Promise<void>;
  
  // Habit Logs actions
  fetchHabitLogs: () => Promise<void>;
  setHabitLog: (habit_id: string, date: string, value: number, notes?: string) => Promise<void>;
  
  // Milestones actions
  fetchMilestones: () => Promise<void>;
  addMilestone: (milestone: Omit<Milestone, 'id'>) => Promise<void>;
  deleteMilestone: (id: string) => Promise<void>;
}

const API_URL = import.meta.env.PROD ? '/api' : 'http://localhost:3001/api';

export const useStore = create<AppState>((set, get) => ({
  habits: [],
  habitLogs: [],
  milestones: [],

  // --- HABITS ---
  fetchHabits: async () => {
    try {
      const res = await fetch(`${API_URL}/habits`);
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      const data = await res.json();
      set({ habits: Array.isArray(data) ? data : [] });
    } catch (error) {
      console.error('Error fetching habits', error);
    }
  },

  addHabit: async (habit) => {
    try {
      const id = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36) + Math.random().toString(36).substring(2);
      const newHabit: Habit = {
        id,
        name: habit.name,
        unit: habit.unit || '',
        target_min: Number(habit.target_min) || 1,
        target_ideal: Number(habit.target_ideal) || 1,
        color: habit.color || '#6366f1',
        streak: 0
      };
      const res = await fetch(`${API_URL}/habits`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newHabit),
      });
      if (!res.ok) throw new Error(`Failed to create habit: ${res.statusText}`);
      set({ habits: [...get().habits, newHabit] });
    } catch (error) {
      console.error('Error adding habit', error);
      alert('No se pudo guardar el hábito en el servidor. Verifica la conexión.');
    }
  },

  updateHabit: async (id, updates) => {
    try {
      const habit = get().habits.find(h => h.id === id);
      if (!habit) return;
      const updatedHabit = { ...habit, ...updates };
      const res = await fetch(`${API_URL}/habits/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedHabit),
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${res.status}: ${res.statusText}`);
      }
      set({ habits: get().habits.map(h => (h.id === id ? updatedHabit : h)) });
    } catch (error) {
      console.error('Error updating habit', error);
      alert('No se pudo actualizar el hábito en el servidor. Por favor intenta de nuevo.');
      throw error;
    }
  },

  deleteHabit: async (id) => {
    try {
      const res = await fetch(`${API_URL}/habits/${id}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      set({
        habits: get().habits.filter((h) => h.id !== id),
        habitLogs: get().habitLogs.filter((l) => l.habit_id !== id),
        milestones: get().milestones.filter((m) => m.habit_id !== id),
      });
    } catch (error) {
      console.error('Error deleting habit', error);
      alert('No se pudo eliminar el hábito del servidor.');
    }
  },

  // --- HABIT LOGS ---
  fetchHabitLogs: async () => {
    try {
      const res = await fetch(`${API_URL}/habits/logs`);
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      const data = await res.json();
      set({ habitLogs: Array.isArray(data) ? data : [] });
    } catch (error) {
      console.error('Error fetching habit logs', error);
    }
  },

  setHabitLog: async (habit_id, date, value, notes = '') => {
    try {
      const numValue = Number(value) || 0;
      const res = await fetch(`${API_URL}/habits/logs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          habit_id,
          date,
          value: numValue,
          completed: numValue > 0,
          notes,
        }),
      });
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      
      // Update local state smoothly
      const currentLogs = get().habitLogs.filter(l => !(l.habit_id === habit_id && l.date === date));
      if (numValue > 0) {
        set({
          habitLogs: [...currentLogs, { habit_id, date, value: numValue, completed: true, notes }]
        });
      } else {
        set({ habitLogs: currentLogs });
      }
    } catch (error) {
      console.error('Error setting habit log', error);
      alert('No se pudo registrar el hábito en el servidor.');
    }
  },

  // --- MILESTONES ---
  fetchMilestones: async () => {
    try {
      const res = await fetch(`${API_URL}/milestones`);
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      const data = await res.json();
      set({ milestones: Array.isArray(data) ? data : [] });
    } catch (error) {
      console.error('Error fetching milestones', error);
    }
  },

  addMilestone: async (milestone) => {
    try {
      const id = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36) + Math.random().toString(36).substring(2);
      const newMilestone: Milestone = {
        id,
        habit_id: milestone.habit_id || null,
        title: milestone.title,
        description: milestone.description || '',
        date: milestone.date,
        created_at: new Date().toISOString()
      };
      const res = await fetch(`${API_URL}/milestones`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newMilestone),
      });
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      set({ milestones: [newMilestone, ...get().milestones] });
    } catch (error) {
      console.error('Error adding milestone', error);
      alert('No se pudo guardar la victoria en el servidor.');
    }
  },

  deleteMilestone: async (id) => {
    try {
      const res = await fetch(`${API_URL}/milestones/${id}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      set({
        milestones: get().milestones.filter((m) => m.id !== id),
      });
    } catch (error) {
      console.error('Error deleting milestone', error);
      alert('No se pudo eliminar la victoria del servidor.');
    }
  },
}));
