# 🏥 Smart Health Card System

A secure and efficient medical data management system that simplifies patient and doctor interactions through a unified digital platform.  
Built with a **Node.js + Express** backend and a clean **HTML/CSS/JavaScript** frontend, it enables quick login, registration, and seamless patient data access.

---

## 📂 Project Overview

The **Smart Health Card System** aims to provide a centralized way for healthcare providers to manage patient data using unique IDs.  
It ensures easy access, secure handling, and a user-friendly interface for both patients and doctors.

---

## 🗂️ Project Structure

```
Smart-Health-Card-System/
│
├── frontend/
│   ├── jav.html
│   ├── login.html
│   ├── login.js
│   ├── login.css
│   ├── patient.html
│   ├── regi.html
│   └── try.html
│
├── backend/
│   ├── database.js
│   ├── database.db
│   ├── package.json
│   └── server.js
│
└── README.md
```

---

## ⚙️ How to Run the Project

1. **Navigate to the backend folder:**
   ```bash
   cd backend
   ```

2. **Install the required dependencies:**
   ```bash
   npm install  express  cors  multer  path  fs
   ```

3. **Start the server:**
   ```bash
   node server.js
   ```

4. **Run the frontend:**
   - Open `frontend/login.html` in your web browser.  
   - Once the server is running, the frontend will be ready to interact with the backend.

✅ **That’s it!** Your medical portal is now live.

---

## 🧠 Key Features

- 👨‍⚕️ **Doctor & Patient Login System**
  - Separate authentication flows for doctors and patients.
- 🧾 **Registration System**
  - Secure sign-up and data storage using SQLite.
- 🧩 **Lightweight & Efficient**
  - Pure HTML, CSS, and JS frontend without unnecessary frameworks.
- 🔐 **Local Database Integration**
  - Uses SQLite via Node.js backend (`database.db`).
- ⚡ **Quick Setup**
  - Run with a single `node server.js` command.

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-------------|
| Frontend | HTML, CSS, JavaScript |
| Backend | Node.js, Express.js |
| Database | SQLite |
| Version Control | Git & GitHub |

---

## 💡 Future Enhancements

- 🔒 Add encryption for sensitive health data  
- 🤖 AI-based health report suggestions  
- 📱 Integration with mobile devices and NFC login  
- 🧬 Smart patient ID with time-limited QR access  
- ☁️ Cloud backup for medical data  

---

## 👨‍💻 Author

**Jaimin Patel**  
*Ideathon Top 10 Finalist (GEC Gandhinagar & Silver Oak University)*  
*IBM SkillsBuild Certified | Backend Developer | AI Enthusiast*

📧 **Email:** — (optional, you can add)  
🔗 **GitHub:** [github.com/jaiminpatel](https://github.com/jaiminpatel)

---

## 🏁 How It Works (Brief)

1. The backend (`server.js`) starts an Express server that handles login and registration requests.  
2. The frontend (HTML/JS) interacts with the backend APIs for authentication and data storage.  
3. Data is stored locally in `database.db` using SQLite.  
4. Once the server is running, users can log in or register directly from the `login.html` interface.

---

## 🧾 License

This project is open-source and available under the [MIT License](LICENSE).

---

⭐ **If you like this project, consider giving it a star on GitHub!**
