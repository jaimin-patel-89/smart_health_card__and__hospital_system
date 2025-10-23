
import express from "express";
import cors from "cors";
import multer from "multer";
import path from "path";
import fs from "fs";
import db from "./database.js";

const app = express();
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static("uploads"));

const uploadFolder = "uploads";
if (!fs.existsSync(uploadFolder)) fs.mkdirSync(uploadFolder);

// Multer config
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadFolder),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});
const upload = multer({ storage });

// ===== Upload endpoint =====
app.post("/upload", upload.single("file"), (req, res) => {
  if (!req.file) return res.status(400).json({ message: "No file uploaded" });
  res.json({
    success: true,
    filename: req.file.filename,
    filePath: `/uploads/${req.file.filename}`,
  });
});

// ===== Get patient by ID =====
// server.js - /api/patient/:id route

app.get("/api/patient/:id", (req, res) => {
    const { id } = req.params;
    try {
        // Fetch the user row, including the history_json column
        const userRow = db.prepare("SELECT * FROM users WHERE id = ?").get(id);

        if (!userRow) {
            return res.status(404).json({ success: false, message: "Patient not found" });
        }

        // 💡 FIX 1: Parse the history_json column. If null, use an empty array.
        const historyData = userRow.history_json ? JSON.parse(userRow.history_json) : [];

        // Construct the structured response
        const patientData = {
            details: {
                id: userRow.id,
                name: userRow.name,
                email: userRow.email,
                // ... include all other flat details ...
                weight: userRow.weight,
                gender: userRow.gender,
                height: userRow.height,
                age: userRow.age,
            },
            // 💡 FIX 2: Send the parsed history array to the frontend
            history: historyData, 
            mentalHealthScore: userRow.mentalHealthScore || 0, // Assuming you add this field or derive it
        };

        res.json({ success: true, data: patientData });
    } catch (err) {
        console.error("Error fetching patient:", err);
        res.status(500).json({ success: false, message: "Server error" });
    }
});
// ===== Get patient by ID (FIXED) =====
app.get("/api/patient/:id", (req, res) => {
  const { id } = req.params;
  try {
    const userRow = db.prepare("SELECT * FROM users WHERE id = ?").get(id);

    if (!userRow) {
      return res.status(404).json({ success: false, message: "Patient not found" });
    }

    // 💡 FIX: Manually structure the data for the frontend
    const patientData = {
      // 1. Details Object: Contains all the single-value user columns
      details: {
        id: userRow.id,
        name: userRow.name,
        email: userRow.email,
        weight: userRow.weight,
        gender: userRow.gender,
        height: userRow.height,
        age: userRow.age,
      },
      // 2. History Array: For now, create an empty array or populate with related entries
      //    (In a real app, this would come from a separate 'visits' or 'history' table)
      history: [
        // Example: You can include the last payment/visit if you wish
        { type: "payment", date: userRow.date, amount: userRow.amount, method: userRow.method },
        { type: "visit", date: userRow.date, purpose: userRow.purpose },
      ].filter(e => e.date), // Filter out entries where date is null
      
      // 3. Score (or other top-level properties)
      mentalHealthScore: 0, // Placeholder
      
      // Add more structure here (e.g., visits, lab results) if your frontend needs it
    };

    res.json({ success: true, data: patientData });
  } catch (err) {
    console.error("Error fetching patient:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});
// server.js - /visit route (FIXED)

app.post("/visit", (req, res) => {
    const { user_id, visit_date, purpose, mentalHealthScore, prescription } = req.body; // Assume you pass new score/prescription too

    try {
        // 1. Get the patient's current data
        const user = db.prepare("SELECT history_json FROM users WHERE id = ?").get(user_id);

        // 2. Parse existing history or start with an empty array
        const currentHistory = user && user.history_json ? JSON.parse(user.history_json) : [];

        // 3. Create the new visit record
        const newRecord = {
            type: 'visit',
            date: visit_date || new Date().toISOString(),
            purpose: purpose,
            mentalHealthScore: mentalHealthScore,
            prescription: prescription,
        };

        // 4. Append the new record to the history
        currentHistory.push(newRecord);

        // 5. Serialize the full array back to a JSON string
        const updatedHistoryJson = JSON.stringify(currentHistory);

        // 6. Update the user row with the new history string
        db.prepare("UPDATE users SET history_json = ? WHERE id = ?").run(updatedHistoryJson, user_id);

        res.json({ success: true, message: "Visit and history recorded successfully" });

    } catch (err) {
        console.error("Error recording visit:", err);
        res.status(500).json({ success: false, message: "Server error" });
    }
});

// ===== User routes =====
// server.js - Updated /register route to return the new Patient ID
app.post("/register", (req, res) => {
    // Assuming registration uses name, email (for uniqueness), and password
    const { name, email, password } = req.body;
    try {
        const info = db.prepare("INSERT INTO users (name, email, password) VALUES (?, ?, ?)").run(name, email, password);
        
        // Retrieve the auto-generated Patient ID (id)
        const newPatientId = info.lastInsertRowid; 

        res.json({ 
            success: true, 
            message: "Registration successful! Your Patient ID is: " + newPatientId,
            patientId: newPatientId // <-- Return the ID to the frontend
        });
    } catch (err) {
        // Log the error for debugging
        console.error("Registration error:", err); 
        // 19 is typically the SQLite code for a UNIQUE constraint violation (email already exists)
        if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
            return res.status(400).json({ success: false, message: "This email address is already registered." });
        }
        res.status(500).json({ success: false, message: "Server error during registration." });
    }
});

// ... (rest of server.js remains the same)

app.post("/login", (req, res) => {
  const { id , password } = req.body;
  const user = db.prepare("SELECT * FROM users WHERE id = ? AND password = ?").get(id, password);
  if (user) res.json({ success: true, message: "Login successful", user });
  else res.status(401).json({ success: false, message: "Invalid credentials" });
});

// ===== Payment route =====
app.post("/payment", (req, res) => {
  const { user_id, amount, method } = req.body;
  const date = new Date().toISOString();
  db.prepare("INSERT INTO users (id, amount, date, method) VALUES (?, ?, ?, ?)").run(id, amount, date, method);
  res.json({ success: true, message: "Payment recorded successfully" });
});
// Server.js - Add this new route

// Add the GET route to FETCH payments/user data
app.get("/payment", (req, res) => {
  try {
    // Since payment details (amount, date, method) are on the users table,
    // we must select all users to retrieve this information.
    // In a real application, you'd likely want to filter or fetch only certain users.
    const payments = db.prepare(
      "SELECT id, name, amount, date, method FROM users"
    ).all();
    
    // We send back the data, which includes the payment-related fields.
    res.json(payments);
  } catch (error) {
    console.error("Error fetching payment/user data:", error);
    res.status(500).json({ 
      success: false, 
      message: "Internal server error fetching user/payment data" 
    });
  }
});

// ===== Update patient by ID (POST/PUT) =====
app.post("/api/patient/:id", (req, res) => {
    const { id } = req.params;
    // The patientData sent from the frontend is in req.body.
    // We expect the whole structured patient object, but we only need the details for the 'users' table.
    const patientData = req.body;
    const details = patientData.details || {}; // Safely get the details object

    // Only update the fields that belong to the flat 'users' table.
    try {
        const updateStmt = db.prepare(`
            UPDATE users SET
                name = ?,
                email = ?,
                weight = ?,
                gender = ?,
                height = ?,
                age = ?
            WHERE id = ?
        `);

        const info = updateStmt.run(
            details.name,
            details.email,
            details.weight,
            details.gender,
            details.height,
            details.age,
            id
        );

        if (info.changes > 0) {
            res.json({ success: true, message: "Patient data updated successfully" });
        } else {
            // This happens if the ID exists but no fields were actually changed
            // or if the ID was somehow not found despite being currentPatientId.
            res.status(404).json({ success: false, message: "Patient not found or no changes made" });
        }

    } catch (err) {
        console.error("Error updating patient:", err);
        // Catch database errors (e.g., trying to set a non-unique email)
        res.status(500).json({ success: false, message: "Database update failed" });
    }
});

// server.js - Add this new route for fetching visit history

app.get("/visit/:id", (req, res) => {
  const { id } = req.params;
  try {
    // 1. Fetch the user's history_json column
    const userRow = db.prepare("SELECT history_json FROM users WHERE id = ?").get(id);

    if (!userRow) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // 2. Parse the history_json. If null, return an empty array.
    const history = userRow.history_json ? JSON.parse(userRow.history_json) : [];

    // 3. Filter history to return only 'visit' types (if needed) or all history
    // Since the frontend function is fetchVisitHistory, let's return all history items:
    res.json(history); 
    
  } catch (err) {
    console.error("Error fetching visit history:", err);
    res.status(500).json({ success: false, message: "Server error fetching history" });
  }
});

// NOTE: You'll also need to update your frontend to pass the user ID!
app.get("/visit/:id", (req, res) => {
  const { id } = req.params;
  try {
    const user = db.prepare("SELECT history_json FROM users WHERE id = ?").get(id);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    const visits = user.history_json ? JSON.parse(user.history_json) : [];
    res.json(visits);
  } catch (err) {
    console.error("Error fetching visits:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});


const PORT = 5000;
app.listen(PORT, () => console.log(`✅ Server running at http://localhost:${PORT}`));
