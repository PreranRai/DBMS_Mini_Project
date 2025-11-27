const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

// ⚠️ UPDATE PASSWORD HERE ⚠️
const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',      
    password: '', // <--- CHECK THIS IS CORRECT
    database: 'campus_project'
});

// --- DATA ENTRY APIs ---
app.post('/add-faculty', async (req, res) => {
    try { await pool.query('INSERT INTO faculty (name, dept_id) VALUES (?, 1)', [req.body.name]); res.json({msg: 'OK'}); } catch(e){ res.status(500).json(e); }
});
app.post('/add-subject', async (req, res) => {
    try { await pool.query('INSERT INTO subjects (name, is_lab, hours_per_week, dept_id) VALUES (?, ?, ?, 1)', [req.body.name, req.body.isLab, req.body.hours]); res.json({msg: 'OK'}); } catch(e){ res.status(500).json(e); }
});
app.post('/add-room', async (req, res) => {
    try { await pool.query('INSERT INTO rooms (room_name, type) VALUES (?, ?)', [req.body.name, req.body.type]); res.json({msg: 'OK'}); } catch(e){ res.status(500).json(e); }
});
app.post('/add-batch', async (req, res) => { 
    try { await pool.query('INSERT INTO batches (name, dept_id) VALUES (?, 1)', [req.body.name]); res.json({msg: 'OK'}); } catch(e){ res.status(500).json(e); }
});
app.get('/meta-data', async (req, res) => { 
    const [batches] = await pool.query('SELECT * FROM batches');
    res.json({ batches });
});
app.post('/reset', async (req, res) => {
    await pool.query('DELETE FROM timetable');
    await pool.query('DELETE FROM subjects'); await pool.query('DELETE FROM faculty');
    await pool.query('DELETE FROM rooms'); await pool.query('DELETE FROM batches');
    res.json({ message: 'Reset Complete' });
});

// --- 🧠 SMART ALGORITHM ---
app.post('/generate', async (req, res) => {
    const conn = await pool.getConnection();
    try {
        await conn.beginTransaction();
        await conn.query('DELETE FROM timetable'); // Clear old

        const [batches] = await conn.query('SELECT * FROM batches');
        const [subjects] = await conn.query('SELECT * FROM subjects');
        const [facultyList] = await conn.query('SELECT * FROM faculty');
        const [rooms] = await conn.query('SELECT * FROM rooms');
        const [slots] = await conn.query('SELECT * FROM timeslots');

        for (const batch of batches) {
            let batchSubjects = subjects.map((sub, index) => ({
                ...sub,
                faculty_id: facultyList[index % facultyList.length]?.faculty_id || 1
            }));

            for (const sub of batchSubjects) {
                let hoursScheduled = 0;
                for (const slot of slots) {
                    if (hoursScheduled >= sub.hours_per_week) break;

                    // CHECK CLASHES
                    const [facBusy] = await conn.query('SELECT * FROM timetable WHERE slot_id=? AND faculty_id=?', [slot.slot_id, sub.faculty_id]);
                    if (facBusy.length > 0) continue;

                    const [batchBusy] = await conn.query('SELECT * FROM timetable WHERE slot_id=? AND batch_id=?', [slot.slot_id, batch.batch_id]);
                    if (batchBusy.length > 0) continue;

                    const suitableRooms = rooms.filter(r => (sub.is_lab ? r.type === 'lab' : r.type === 'lecture'));
                    let assignedRoom = null;
                    for (const room of suitableRooms) {
                        const [roomBusy] = await conn.query('SELECT * FROM timetable WHERE slot_id=? AND room_id=?', [slot.slot_id, room.room_id]);
                        if (roomBusy.length === 0) { assignedRoom = room; break; }
                    }

                    if (assignedRoom) {
                        await conn.query('INSERT INTO timetable (batch_id, subject_id, faculty_id, room_id, slot_id) VALUES (?, ?, ?, ?, ?)',
                        [batch.batch_id, sub.subject_id, sub.faculty_id, assignedRoom.room_id, slot.slot_id]);
                        hoursScheduled++;
                    }
                }
            }
        }
        await conn.commit();
        res.json({ message: "Success" });
    } catch (e) { await conn.rollback(); console.error(e); res.status(500).json({ error: e.message }); } 
    finally { conn.release(); }
});

// --- ✅ FIXED QUERY HERE ---
app.get('/timetable/:batchId', async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT ts.day, ts.start_time, s.name as subject, f.name as faculty, r.room_name 
            FROM timetable t
            JOIN timeslots ts ON t.slot_id = ts.slot_id   -- <--- THIS LINE WAS MISSING BEFORE
            JOIN subjects s ON t.subject_id = s.subject_id
            JOIN faculty f ON t.faculty_id = f.faculty_id
            JOIN rooms r ON t.room_id = r.room_id
            WHERE t.batch_id = ? 
            ORDER BY ts.day, ts.start_time`, 
            [req.params.batchId]
        );
        res.json(rows);
    } catch (e) {
        console.error("Error fetching timetable:", e);
        res.status(500).json({ error: e.message });
    }
});

app.listen(5000, () => console.log("Backend Smart-Scheduler running on 5000"));