# 🔥 Habit Tracker

A full-stack Habit Tracker application built using **React**, **Node.js**, **Express**, and **SQLite (better-sqlite3)**. The application allows users to create habits, record daily check-ins, track current streaks, and manage habit history through a simple and responsive interface.

---

## 📌 Features

- ➕ Add new habits
- ✅ Daily habit check-in
- 🔥 Automatic streak calculation
- 📅 View last 7 days of habit history
- ❌ Delete individual habits
- 🗄️ SQLite database for persistent storage
- 🌐 RESTful API using Express
- 🎨 Clean and responsive React UI
- 📮 Postman collection included for API testing

---

## 🛠️ Technologies Used

### Frontend
- React (Vite)
- CSS

### Backend
- Node.js
- Express.js
- better-sqlite3
- CORS

### Database
- SQLite (data.db)

### API Testing
- Postman

---

## 📂 Project Structure

```
project/
│
├── backend/
│   ├── index.js
│   ├── data.db
│   └── package.json
│
├── frontend/
│   └── src/
│       ├── App.jsx
│       ├── App.css
│       └── main.jsx
│
└── postman/
    ├── Habit-Tracker-API.postman_collection.json
    └── Habit-Tracker.postman_environment.json
```

---

## ⚙️ Installation

### Backend

Navigate to the backend folder.

```bash
cd backend
```

Start the server.

```bash
node index.js
```

Server runs on

```
http://localhost:5000
```

---

### Frontend

Navigate to the frontend folder.

```bash
cd frontend
```

Run the React application.

```bash
npm install
npm run dev
```

The frontend runs on

```
http://localhost:5173
```

---

## 🗄️ Database

The project automatically creates a SQLite database named

```
data.db
```

Two tables are created automatically:

### habits

| Column | Type |
|---------|------|
| id | INTEGER |
| name | TEXT |
| created_at | TEXT |

### checkins

| Column | Type |
|---------|------|
| id | INTEGER |
| habit_id | INTEGER |
| date | TEXT |
| checked_at | TEXT |

A unique constraint prevents multiple check-ins for the same habit on the same day.

---

## 🚀 REST API Endpoints

| Method | Endpoint | Description |
|---------|----------|-------------|
| POST | /habits | Create a new habit |
| GET | /habits | Get all habits with streaks |
| POST | /habits/:id/checkin | Check in for today or a specific date |
| GET | /habits/:id/checkins | Get habit check-in history |
| DELETE | /habits/:id/checkin/:date | Remove a check-in |
| DELETE | /habits/:id | Delete a habit and its history |

---

## 🔥 Streak Logic

The application automatically calculates the current streak based on daily check-ins.

- Starts counting from today.
- If today's check-in is missing but yesterday exists, the streak continues from yesterday.
- Missing both today and yesterday resets the streak to **0**.
- Consecutive check-ins increase the streak.

---

## 🎨 User Interface

The application provides:

- Simple and clean design
- Habit cards
- Current streak display
- Daily check-in button
- 7-day calendar history
- Delete habit option

---

## 📮 Postman

Import the following files into Postman:

- Habit-Tracker-API.postman_collection.json
- Habit-Tracker.postman_environment.json

These files contain all API requests required to test the application.

---

## 📷 Sample Workflow

1. Add a new habit.
2. View the habit in the list.
3. Check in daily.
4. Watch the streak increase.
5. View the last seven days of activity.
6. Delete habits when no longer needed.

---

## 👨‍💻 Author

Developed as a Full Stack Web Development project using React, Express, SQLite, and better-sqlite3.

---

## 📄 License

This project is created for educational and learning purposes.
