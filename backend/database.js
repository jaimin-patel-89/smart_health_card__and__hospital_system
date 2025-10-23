import Database from "better-sqlite3";

const db = new Database("database.db");

// Existing tables
db.prepare(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    email TEXT UNIQUE,
    password TEXT,
    weight REAL,
    gender TEXT,
    height REAL,
    amount REAL,
    age INTEGER,
    date TEXT,
    method TEXT,
    history_json TEXT,
    purpose TEXT
  )
`).run();



// --- Insert a default patient if not exists ---
const id = 1;

const exi = db.prepare("SELECT * FROM users WHERE id = ?").get(id);

if (!exi) {
  db.prepare(`
    INSERT INTO users (id, password ,method , name, age, gender, email, height, weight, amount, date )
    VALUES (?, ? , ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(id,"12", "UPI" , "Jay patel ", 20, "Male", "john@example.com", 175, 70 ,350, "2025-10-22");
}

export default db;
