// frontend/src/App.jsx

import { useState, useEffect } from 'react';
import './App.css';

const API_URL = 'http://localhost:5000';

function App() {
  const [habits, setHabits] = useState([]);
  const [checkinsByHabit, setCheckinsByHabit] = useState({});
  const [loading, setLoading] = useState(true);
  const [newHabitName, setNewHabitName] = useState('');

  const refreshAll = async () => {
    try {
      const habitsRes = await fetch(`${API_URL}/habits`);
      const habitsData = await habitsRes.json();
      
      const checkinsMap = {};
      for (const item of habitsData) {
        const checkinsRes = await fetch(`${API_URL}/habits/${item.id}/checkins`);
        const checkinsData = await checkinsRes.json();
        checkinsMap[item.id] = checkinsData;
      }
      
      setHabits(habitsData);
      setCheckinsByHabit(checkinsMap);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshAll();
  }, []);

  const handleAddHabit = async (e) => {
    e.preventDefault();
    if (!newHabitName.trim()) return;

    try {
      const res = await fetch(`${API_URL}/habits`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newHabitName.trim() })
      });
      if (res.ok) {
        setNewHabitName('');
        await refreshAll();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCheckIn = async (habitId) => {
    try {
      const res = await fetch(`${API_URL}/habits/${habitId}/checkin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      });
      if (res.ok) {
        await refreshAll();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteHabit = async (habitId) => {
    try {
      const res = await fetch(`${API_URL}/habits/${habitId}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        await refreshAll();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const getPastSevenDays = () => {
    const days = [];
    const now = new Date();
    const offset = now.getTimezoneOffset();
    
    for (let i = 0; i < 7; i++) {
      const d = new Date(now.getTime() - (offset * 60 * 1000));
      d.setDate(d.getDate() - i);
      
      days.push({
        dateStr: d.toISOString().split('T')[0],
        dayNum: d.getDate()
      });
    }
    return days;
  };

  const pastSevenDays = getPastSevenDays();
  const now = new Date();
  const offset = now.getTimezoneOffset();
  const todayStr = new Date(now.getTime() - (offset * 60 * 1000)).toISOString().split('T')[0];

  return (
    <div className="app-container">
      <h1>🔥 Habit Tracker</h1>

      <div className="new-habit-card">
        <form onSubmit={handleAddHabit} className="new-habit-form">
          <input
            type="text"
            placeholder="e.g. Drink 2L water"
            value={newHabitName}
            onChange={(e) => setNewHabitName(e.target.value)}
          />
          <button type="submit">Add Habit</button>
        </form>
      </div>

      {loading ? (
        <p className="status-msg">Loading your habits...</p>
      ) : habits.length === 0 ? (
        <p className="status-msg">No habits yet. Add one above to get started!</p>
      ) : (
        <div className="habit-list">
          {habits.map((habit) => {
            const history = checkinsByHabit[habit.id] || [];
            const isCheckedInToday = history.includes(todayStr);

            return (
              <div key={habit.id} className="habit-card">
                <h3>{habit.name}</h3>
                
                <p className="streak-text">
                  {habit.streak > 0 
                    ? `🔥 ${habit.streak} day streak` 
                    : "No streak yet — check in today!"
                  }
                </p>

                {isCheckedInToday ? (
                  <button className="checkin-btn disabled" disabled>
                    ✅ Checked in today
                  </button>
                ) : (
                  <button className="checkin-btn" onClick={() => handleCheckIn(habit.id)}>
                    Check In
                  </button>
                )}

                <div className="history-row">
                  {pastSevenDays.map((day) => {
                    const isDone = history.includes(day.dateStr);
                    return (
                      <div 
                        key={day.dateStr} 
                        className={`history-box ${isDone ? 'done' : 'not-done'}`}
                      >
                        {day.dayNum}
                      </div>
                    );
                  })}
                </div>

                <button className="delete-btn" onClick={() => handleDeleteHabit(habit.id)}>
                  Delete Habit
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default App;