// backend/index.js

const express = require('express');
const cors = require('cors');
const Database = require('better-sqlite3');

const app = express();
app.use(cors());
app.use(express.json());

const db = new Database('data.db');

// Creates the habits table to record plant botanical profiles.
db.prepare(`
  CREATE TABLE IF NOT EXISTS habits (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    created_at TEXT NOT NULL
  )
`).run();

// Creates the checkins table to document targeted moisture care events with a compound uniqueness check.
db.prepare(`
  CREATE TABLE IF NOT EXISTS checkins (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    habit_id INTEGER NOT NULL,
    date TEXT NOT NULL,
    checked_at TEXT NOT NULL,
    UNIQUE(habit_id, date)
  )
`).run();

/*
  The calculateStreak function processes consecutive calendar logs for an isolated specimen profile.
  It queries historical data sorted backwards. If neither today nor yesterday records a check-in event, 
  the care streak drops cleanly back to 0. If yesterday has an active entry but today hasn't been
  logged yet, the loop counts backwards from yesterday to preserve the user's progress for the rest of the day.
*/
function calculateStreak(habitId) {
  const rows = db.prepare('SELECT date FROM checkins WHERE habit_id = ? ORDER BY date DESC').all(habitId);
  const checkinDates = new Set(rows.map(r => r.date));

  const now = new Date();
  const offset = now.getTimezoneOffset();
  const todayStr = new Date(now.getTime() - (offset * 60 * 1000)).toISOString().split('T')[0];

  const yesterday = new Date(now.getTime() - (offset * 60 * 1000));
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];

  if (!checkinDates.has(todayStr) && !checkinDates.has(yesterdayStr)) {
    return 0;
  }

  let currentStreak = 0;
  let currentDate = checkinDates.has(todayStr) ? now : yesterday;

  while (true) {
    const dateStr = new Date(currentDate.getTime() - (offset * 60 * 1000)).toISOString().split('T')[0];
    if (checkinDates.has(dateStr)) {
      currentStreak++;
      currentDate.setDate(currentDate.getDate() - 1);
    } else {
      break;
    }
  }

  return currentStreak;
}

// ROUTE A — POST /habits : Onboards a newly acquired rare plant type into the botanical registry.
app.post('/habits', (req, res) => {
  const { name } = req.body;
  if (!name || name.trim() === '') {
    return res.status(400).json({ error: "name is required" });
  }

  const createdAt = new Date().toISOString();
  const info = db.prepare('INSERT INTO habits (name, created_at) VALUES (?, ?)').run(name.trim(), createdAt);
  
  res.status(201).json({
    id: info.lastInsertRowid,
    name: name.trim(),
    created_at: createdAt,
    streak: 0
  });
});

// ROUTE B — GET /habits : Lists all cataloged flora specimens alongside their current hydration streaks.
app.get('/habits', (req, res) => {
  const habits = db.prepare('SELECT * FROM habits ORDER BY created_at ASC').all();
  const extendedHabits = habits.map(habit => {
    habit.streak = calculateStreak(habit.id);
    return habit;
  });
  res.status(200).json(extendedHabits);
});

// ROUTE C — POST /habits/:id/checkin : Logs a watering or health care event timestamp for a specified specimen.
app.post('/habits/:id/checkin', (req, res) => {
  const habitId = parseInt(req.params.id, 10);
  let { date } = req.body;

  if (!date) {
    const now = new Date();
    const offset = now.getTimezoneOffset();
    date = new Date(now.getTime() - (offset * 60 * 1000)).toISOString().split('T')[0];
  }

  const habitExists = db.prepare('SELECT 1 FROM habits WHERE id = ?').get(habitId);
  if (!habitExists) {
    return res.status(404).json({ error: "Habit not found" });
  }

  try {
    const checkedAt = new Date().toISOString();
    const info = db.prepare('INSERT INTO checkins (habit_id, date, checked_at) VALUES (?, ?, ?)')
      .run(habitId, date, checkedAt);

    const updatedStreak = calculateStreak(habitId);

    res.status(201).json({
      id: info.lastInsertRowid,
      habit_id: habitId,
      date: date,
      checked_at: checkedAt,
      streak: updatedStreak
    });
  } catch (error) {
    if (error.code === 'SQLITE_CONSTRAINT_UNIQUE' || error.message.includes('UNIQUE constraint failed')) {
      return res.status(409).json({ error: "Already checked in for this date" });
    }
    res.status(500).json({ error: "Internal server error" });
  }
});

// ROUTE D — GET /habits/:id/checkins : Yields a raw list of historical maintenance calendar date strings for a specific profile.
app.get('/habits/:id/checkins', (req, res) => {
  const habitId = parseInt(req.params.id, 10);
  const habitExists = db.prepare('SELECT 1 FROM habits WHERE id = ?').get(habitId);
  if (!habitExists) {
    return res.status(404).json({ error: "Habit not found" });
  }

  const rows = db.prepare('SELECT date FROM checkins WHERE habit_id = ? ORDER BY date DESC').all(habitId);
  res.status(200).json(rows.map(r => r.date));
});

// ROUTE E — DELETE /habits/:id/checkin/:date : Extinguishes a mistakenly logged watering check-in row from history records.
app.delete('/habits/:id/checkin/:date', (req, res) => {
  const habitId = parseInt(req.params.id, 10);
  const { date } = req.params;

  db.prepare('DELETE FROM checkins WHERE habit_id = ? AND date = ?').run(habitId, date);
  res.status(200).json({ message: "Checkin removed" });
});

// ROUTE F — DELETE /habits/:id : Fully deletes a specimen data node and clears its historical log tables.
app.delete('/habits/:id', (req, res) => {
  const habit
  Id = parseInt(req.params.id, 10);

  db.prepare('DELETE FROM checkins WHERE habit_id = ?').run(habitId);
  db.prepare('DELETE FROM habits WHERE id = ?').run(habitId);

  res.status(200).json({ message: `Habit ${habitId} and its checkins deleted` });
});

app.listen(5000, () => {
  console.log("Server running on http://localhost:5000");
});