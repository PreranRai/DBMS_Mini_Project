-- 1. CLEAN SLATE: Start fresh every time
DROP DATABASE IF EXISTS campus_project;
CREATE DATABASE campus_project;
USE campus_project;

-- ==========================================
-- 2. MASTER TABLES
-- ==========================================

CREATE TABLE departments (
    dept_id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(50) NOT NULL
);

CREATE TABLE rooms (
    room_id INT PRIMARY KEY AUTO_INCREMENT,
    room_name VARCHAR(20) NOT NULL,
    type ENUM('lecture', 'lab') DEFAULT 'lecture'
);

CREATE TABLE faculty (
    faculty_id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    dept_id INT,
    FOREIGN KEY (dept_id) REFERENCES departments(dept_id) ON DELETE CASCADE
);

CREATE TABLE subjects (
    subject_id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    is_lab BOOLEAN DEFAULT FALSE,
    hours_per_week INT DEFAULT 3,
    dept_id INT,
    FOREIGN KEY (dept_id) REFERENCES departments(dept_id) ON DELETE CASCADE
);

CREATE TABLE batches (
    batch_id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(50) NOT NULL, 
    dept_id INT,
    FOREIGN KEY (dept_id) REFERENCES departments(dept_id) ON DELETE CASCADE
);

CREATE TABLE timeslots (
    slot_id INT PRIMARY KEY AUTO_INCREMENT,
    day VARCHAR(10), 
    start_time TIME,
    end_time TIME
);

-- ==========================================
-- 3. TRANSACTION TABLE (THE TIMETABLE)
-- ==========================================

CREATE TABLE timetable (
    id INT PRIMARY KEY AUTO_INCREMENT,
    batch_id INT,
    subject_id INT,
    faculty_id INT,
    room_id INT,
    slot_id INT,
    
    FOREIGN KEY (batch_id) REFERENCES batches(batch_id) ON DELETE CASCADE,
    FOREIGN KEY (subject_id) REFERENCES subjects(subject_id) ON DELETE CASCADE,
    FOREIGN KEY (faculty_id) REFERENCES faculty(faculty_id) ON DELETE CASCADE,
    FOREIGN KEY (room_id) REFERENCES rooms(room_id) ON DELETE CASCADE,
    FOREIGN KEY (slot_id) REFERENCES timeslots(slot_id) ON DELETE CASCADE,

    -- 🛡️ SQL CONSTRAINT 1: Batch cannot be in two places at once
    CONSTRAINT unique_batch_slot UNIQUE (batch_id, slot_id),

    -- 🛡️ SQL CONSTRAINT 2: Faculty cannot teach two classes at once
    CONSTRAINT unique_faculty_slot UNIQUE (faculty_id, slot_id),

    -- 🛡️ SQL CONSTRAINT 3: Room cannot be used by two classes at once
    CONSTRAINT unique_room_slot UNIQUE (room_id, slot_id)
);

-- ==========================================
-- 4. SMART TRIGGER (LOGIC ENFORCER)
-- ==========================================
-- This acts like a 'Police Officer' inside the database.
-- It checks every INSERT. If rules are broken, it rejects the data.

DELIMITER $$

CREATE TRIGGER check_lab_rules_before_insert
BEFORE INSERT ON timetable
FOR EACH ROW
BEGIN
    DECLARE s_is_lab BOOLEAN;
    DECLARE r_type VARCHAR(20);
    DECLARE s_hours_needed INT;
    DECLARE s_hours_booked INT;

    -- Get Subject Info
    SELECT is_lab, hours_per_week INTO s_is_lab, s_hours_needed 
    FROM subjects WHERE subject_id = NEW.subject_id;

    -- Get Room Info
    SELECT type INTO r_type FROM rooms WHERE room_id = NEW.room_id;

    -- ❌ RULE A: Lab Subject must go to Lab Room
    IF (s_is_lab = 1 AND r_type != 'lab') THEN
        SIGNAL SQLSTATE '45000' 
        SET MESSAGE_TEXT = 'Error: Lab subjects must be scheduled in Lab Rooms only!';
    END IF;

    -- ❌ RULE B: Theory Subject must NOT go to Lab Room
    IF (s_is_lab = 0 AND r_type = 'lab') THEN
        SIGNAL SQLSTATE '45000' 
        SET MESSAGE_TEXT = 'Error: Theory subjects cannot be held in Lab Rooms!';
    END IF;

    -- ❌ RULE C: Cannot exceed weekly hours
    SELECT COUNT(*) INTO s_hours_booked 
    FROM timetable 
    WHERE batch_id = NEW.batch_id AND subject_id = NEW.subject_id;

    IF (s_hours_booked >= s_hours_needed) THEN
        SIGNAL SQLSTATE '45000' 
        SET MESSAGE_TEXT = 'Error: Maximum weekly hours reached for this subject!';
    END IF;

END$$

-- ==========================================
-- 5. STORED PROCEDURE (RESET)
-- ==========================================
CREATE PROCEDURE ClearBatchSchedule(IN b_id INT)
BEGIN
    DELETE FROM timetable WHERE batch_id = b_id;
END$$

DELIMITER ;

-- ==========================================
-- 6. DUMMY DATA INJECTION
-- ==========================================
INSERT INTO departments (name) VALUES ('CSE');

-- Rooms
INSERT INTO rooms (room_name, type) VALUES ('101', 'lecture'), ('102', 'lecture'), ('LAB-A', 'lab');

-- Faculty
INSERT INTO faculty (name, dept_id) VALUES ('Dr. Smith', 1), ('Prof. Doe', 1);

-- Subjects (Note: Python is a LAB, Java is THEORY)
INSERT INTO subjects (name, is_lab, hours_per_week, dept_id) VALUES 
('Java Programming', 0, 2, 1), 
('Python Lab', 1, 2, 1);

-- Batches
INSERT INTO batches (name, dept_id) VALUES ('3rd Year CSE', 1), ('2nd Year CSE', 1);

-- Slots (Mon 9-12, Tue 9-11)
INSERT INTO timeslots (day, start_time, end_time) VALUES 
('Mon', '09:00', '10:00'), ('Mon', '10:00', '11:00'), ('Mon', '11:00', '12:00'),
('Tue', '09:00', '10:00'), ('Tue', '10:00', '11:00');