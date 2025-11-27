# 🎓 Campus Resource & Timetable Management System

> A full-stack automated scheduling application designed to generate conflict-free university timetables. This project utilizes a **Greedy Algorithm** for scheduling and enforces strict data integrity using **MySQL Triggers and Constraints**.

---

## 📖 Table of Contents
- [Project Overview](#-project-overview)
- [Tech Stack](#-tech-stack)
- [Database Architecture](#-database-architecture)
- [Key Features](#-key-features)
- [Project Structure](#-project-structure)
- [Installation & Setup](#-installation--setup)
- [How to Use](#-how-to-use)
- [Testing DBMS Constraints](#-testing-dbms-constraints)

---

## 📝 Project Overview
Manual timetable generation is prone to errors like double-booking professors or assigning lab subjects to theory classrooms. This system automates the process by:
1.  Taking inputs (Faculty, Subjects, Rooms, Batches).
2.  Running a smart allocation algorithm on the server.
3.  Validating every entry against strict SQL rules.
4.  Displaying the final schedule in a modern React Dashboard.

---

## 🛠 Tech Stack

| Component | Technology | Role |
| :--- | :--- | :--- |
| **Frontend** | React.js | Dynamic Dashboard, Forms, Axios for API handling. |
| **Backend** | Node.js + Express | REST API, Scheduling Algorithm. |
| **Database** | MySQL | Relational Data Storage, Constraints, Triggers. |
| **Styling** | CSS3 | Modern UI with Floating Cards and Animations. |

---

## 🗄 Database Architecture
The project meets strict DBMS requirements including normalization and server-side logic.

### 📊 Tables (7 Total)
1.  **`departments`**: Master list of departments.
2.  **`faculty`**: Professors linked to departments.
3.  **`subjects`**: Course details (includes `is_lab`, `hours_per_week`, `fixed_room_id`).
4.  **`batches`**: Student groups (e.g., "3rd Year CSE").
5.  **`rooms`**: Physical resources (includes `type`: 'Lecture' or 'Lab').
6.  **`timeslots`**: Fixed slots (e.g., Mon 09:00 - 10:00).
7.  **`timetable`**: The core transaction table linking all entities.

### 🛡️ Triggers & Procedures
* **Trigger (`check_lab_rules_before_insert`)**:
    * Prevents **Lab Subjects** from being scheduled in **Lecture Halls**.
    * Prevents **Theory Subjects** from being scheduled in **Labs**.
    * Enforces **Weekly Hour Limits** per subject.
* **Stored Procedure (`ClearBatchSchedule`)**:
    * Efficiently resets the timetable for a specific batch before regeneration.
* **Constraints**:
    * `UNIQUE(faculty_id, slot_id)`: Prevents faculty double-booking.
    * `UNIQUE(room_id, slot_id)`: Prevents room double-booking.
    * `UNIQUE(batch_id, slot_id)`: Prevents batch double-booking.

---

## ✨ Key Features
* **Auto-Scheduling Algorithm**: Automatically finds the earliest available slot for every subject.
* **Conflict Detection**: Real-time validation of availability.
* **Smart Room Allocation**: Prioritizes "Fixed Rooms" (e.g., Chemistry Lab) if specified, otherwise dynamically assigns an appropriate room.
* **Data Persistence**: All inputs and schedules are saved in MySQL.
* **Batch Switching**: View timetables for different classes via a dropdown.

---

## 📂 Project Structure

```text
Campus_Project/
│
├── db_setup.sql            # 📜 Run this script in MySQL Workbench first!
│
├── backend/                # ⚙️ Node.js Server
│   ├── index.js            # Main Logic (API + Algorithm)
│   ├── package.json        # Dependencies
│   └── node_modules/
│
└── frontend/               # 💻 React User Interface
    ├── public/
    ├── src/
    │   ├── App.js          # UI Components & State Logic
    │   ├── App.css         # Modern Dashboard Styling
    │   └── index.js
    ├── package.json
    └── node_modules/

## 🚀 Installation & Setup Guide

Follow these steps exactly to set up the project on your local machine.

### 📋 Prerequisites
Ensure you have the following installed:
* **Node.js** (v14 or higher) - [Download Here](https://nodejs.org/)
* **MySQL Server** (via XAMPP, WAMP, or standalone) - [Download Here](https://dev.mysql.com/downloads/installer/)
* **VS Code** (Recommended Code Editor)

---

### Step 1: 🗄️ Database Setup
*We need to create the database, tables, triggers, and stored procedures first.*

1.  Open your **MySQL Workbench** or **Command Prompt**.
2.  Navigate to the project folder where `db_setup.sql` is located.
3.  Run the following command to import the schema:

    ```bash
    mysql -u root -p < db_setup.sql
    ```
    *(Enter your MySQL password when prompted. If successful, it will return to the command line without errors.)*

---

### Step 2: ⚙️ Backend (Server) Setup
*Now we set up the Node.js server that connects to the database.*

1.  Open a terminal and navigate to the `backend` folder:
    ```bash
    cd backend
    ```

2.  Install the required libraries (Express, MySQL2, CORS):
    ```bash
    npm install
    ```

3.  **⚠️ CRITICAL STEP:** Configure your Database Password.
    * Open `backend/index.js` in your code editor.
    * Find the database connection block (approx line 12).
    * Update the `password` field:
    
    ```javascript
    const pool = mysql.createPool({
        host: 'localhost',
        user: 'root',
        password: 'YOUR_REAL_PASSWORD_HERE', // <--- REPLACE THIS
        database: 'campus_project'
    });
    ```

4.  Start the Server:
    ```bash
    node index.js
    ```
    > **Success Message:** `Backend Smart-Scheduler running on 5000`

---

### Step 3: 💻 Frontend (UI) Setup
*Finally, we start the React Dashboard.*

1.  Open a **new** terminal window (keep the backend running!).
2.  Navigate to the `frontend` folder:
    ```bash
    cd frontend
    ```

3.  Install React dependencies:
    ```bash
    npm install
    ```

4.  Start the Application:
    ```bash
    npm start
    ```
    > Your browser should automatically open **http://localhost:3000**.

---

### ❓ Troubleshooting

| Error | Solution |
| :--- | :--- |
| `Access denied for user 'root'` | Your password in `backend/index.js` is wrong. Update it and restart the backend. |
| `Unknown database 'campus_project'` | You forgot Step 1. Run the `db_setup.sql` script. |
| `Client network socket disconnected` | Ensure MySQL Server is running (Start via XAMPP/Services). |
| `npm start` fails | Ensure you are inside the inner `frontend` folder (check if `package.json` exists there). |