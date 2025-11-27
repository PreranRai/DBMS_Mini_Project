# 🎓 Campus Resource & Timetable Management System

![Status](https://img.shields.io/badge/Status-Completed-success)
![Stack](https://img.shields.io/badge/Tech-React%20%7C%20Node.js%20%7C%20MySQL-blue)
![UI](https://img.shields.io/badge/UI-Modern%20Dashboard-purple)
![License](https://img.shields.io/badge/License-MIT-green)

> A full-stack automated scheduling application designed to generate conflict-free university timetables. This project utilizes a **Greedy Algorithm** for scheduling and enforces strict data integrity using **MySQL Triggers and Constraints**.

---

## 📖 Table of Contents
- [Project Overview](#-project-overview)
- [Key Features](#-key-features)
- [Tech Stack](#-tech-stack)
- [Database Architecture](#-database-architecture)
- [Installation & Setup](#-installation--setup)
- [How to Use](#-how-to-use)
- [Testing DBMS Constraints](#-testing-dbms-constraints)

---

## 📝 Project Overview
Manual timetable generation is prone to errors like double-booking professors or assigning lab subjects to theory classrooms. This system automates the process by:
1.  **Input Management**: Collecting Batches, Faculty, Subjects, and Rooms via a modern UI.
2.  **Smart Allocation**: Running a server-side algorithm to assign slots based on availability.
3.  **Constraint Enforcement**: Using SQL Triggers to strictly block invalid entries (e.g., Lab subject in a Lecture Hall).
4.  **Fixed Allocations**: allowing admins to force specific subjects into specific rooms.

---

## ✨ Key Features

### 🧠 Smart Scheduling Algorithm
* **Conflict-Free**: Automatically checks for Faculty, Batch, and Room clashes before booking.
* **Greedy Approach**: Fills the earliest available slot to maximize resource utilization.

### 🛡️ DBMS Constraints (SQL Triggers)
* **Lab Logic**: Prevents **Lab Subjects** from being scheduled in **Lecture Halls**.
* **Theory Logic**: Prevents **Theory Subjects** from being scheduled in **Labs**.
* **Weekly Limits**: Blocks scheduling if a subject exceeds its weekly hour quota.

### 📍 Fixed Room Allocation
* Supports **"Fixed Rooms"**: If an admin specifies a "Fixed Room ID" for a subject (e.g., Chemistry -> Chemistry Lab), the system guarantees that class happens *only* in that room.

### 🎨 Modern Dashboard UI
* **Responsive Design**: Floating input cards with hover effects.
* **Visual Feedback**: Success/Error messages and status pills (Lab/Lecture tags).
* **Animations**: Table rows cascade in with a smooth fade effect.

---

## 🛠 Tech Stack

| Component | Technology | Role |
| :--- | :--- | :--- |
| **Frontend** | React.js | UI Components, State Management, Axios. |
| **Backend** | Node.js + Express | REST API, Scheduling Logic. |
| **Database** | MySQL | Relational Data, Triggers, Stored Procedures. |
| **Styling** | CSS3 | Custom Dashboard Theme, Google Fonts (Poppins). |

---

## 🗄 Database Architecture

### 📊 Tables (7 Total)
1.  **`departments`**: Master list of departments.
2.  **`faculty`**: Professors linked to departments.
3.  **`subjects`**: Course details (includes `is_lab`, `fixed_room_id` for preference).
4.  **`batches`**: Student groups (e.g., "3rd Year CSE").
5.  **`rooms`**: Physical resources (includes `type`: 'Lecture' or 'Lab').
6.  **`timeslots`**: Fixed slots (e.g., Mon 09:00 - 10:00).
7.  **`timetable`**: The core transaction table linking all entities.

### ⚙️ Triggers
* **`check_lab_rules_before_insert`**: The "Bouncer" that rejects invalid room/subject combinations.

---

## 🚀 Installation & Setup

### Prerequisites
* Node.js installed.
* MySQL Server installed and running.

### Step 1: Database Setup
1.  Open your terminal or MySQL Workbench.
2.  Run the provided SQL script to create the database schema:
    ```bash
    mysql -u root -p < db_setup.sql
    ```

### Step 2: Backend Setup
1.  Navigate to the backend folder:
    ```bash
    cd backend
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  **Configuration**: Open `index.js` and update the database password:
    ```javascript
    const pool = mysql.createPool({
        // ...
        password: 'YOUR_MYSQL_PASSWORD', // <--- Update this!
        // ...
    });
    ```
4.  Start the server:
    ```bash
    node index.js
    ```

### Step 3: Frontend Setup
1.  Open a new terminal and navigate to the frontend folder:
    ```bash
    cd frontend
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Start the React app:
    ```bash
    npm start
    ```
    > *Browser will open at `http://localhost:3000`*

---

## 🖱️ How to Use
1.  **Reset System**: Click the white "Reset" button to clear old data.
2.  **Add Resources**:
    * Add a **Batch** (e.g., "3rd Year CSE").
    * Add a **Faculty** (e.g., "Dr. Smith").
    * Add a **Room** (e.g., "Room 101", Type: Lecture).
    * Add a **Subject** (e.g., "DBMS", Hours: 3).
        * *Optional*: Enter a **Fixed Room ID** to force a specific room.
3.  **Generate**: Click the big **"⚡ Generate Timetable"** button.
4.  **View**: Select your batch from the dropdown to view the schedule.

---

## 🧪 Testing DBMS Constraints
You can verify the SQL Triggers are working by attempting to break the rules:

1.  Add a **Lab Subject** (e.g., "Physics Lab").
2.  Add only **Lecture Rooms** (e.g., "Room 101").
3.  Click **Generate**.
4.  **Result**: The system will **fail** to schedule that class because the SQL Trigger (`check_lab_rules_before_insert`) blocked the insertion of a Lab subject into a Lecture room.

---

**DBMS Mini Project**