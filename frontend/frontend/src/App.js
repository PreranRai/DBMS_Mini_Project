import React, { useState, useEffect } from "react";
import axios from "axios";
import "./App.css";

const App = () => {
  const [batches, setBatches] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState("");
  const [timetable, setTimetable] = useState([]);
  const [message, setMessage] = useState("");
  
  // Forms State
  const [facultyName, setFacultyName] = useState("");
  const [subName, setSubName] = useState("");
  const [subHours, setSubHours] = useState(3);
  const [isLab, setIsLab] = useState(false);
  const [fixedRoomId, setFixedRoomId] = useState("");
  const [roomName, setRoomName] = useState("");
  const [roomType, setRoomType] = useState("lecture");
  const [batchName, setBatchName] = useState("");

  useEffect(() => { fetchBatches(); }, []);
  useEffect(() => { if(selectedBatch) fetchTimetable(selectedBatch); }, [selectedBatch]);

  const fetchBatches = async () => {
    try {
      const res = await axios.get("http://localhost:5000/meta-data");
      setBatches(res.data.batches);
      if(res.data.batches.length > 0) setSelectedBatch(res.data.batches[0].batch_id);
    } catch(e) { console.error(e); }
  };

  const fetchTimetable = async (batchId) => { 
    const res = await axios.get(`http://localhost:5000/timetable/${batchId}`); 
    setTimetable(res.data); 
  };

  const addData = async (endpoint, payload) => { 
    try { 
        await axios.post(`http://localhost:5000/${endpoint}`, payload); 
        setMessage(`✅ Added successfully!`); 
        if(endpoint === 'add-batch') fetchBatches(); 
    } catch(e) { setMessage("❌ Error adding data"); } 
  };

  const handleGenerate = async () => { 
    setMessage("⏳ Generating..."); 
    try { 
        await axios.post("http://localhost:5000/generate"); 
        setMessage("✨ Generated!"); 
        if(selectedBatch) fetchTimetable(selectedBatch); 
    } catch(e) { setMessage("❌ Failed"); } 
  };

  const resetAll = async () => { 
    if(!window.confirm("Delete Everything?")) return; 
    await axios.post("http://localhost:5000/reset"); 
    setBatches([]); setTimetable([]); setMessage("♻️ Reset"); 
  };

  // --- SAHYADRI TIME SLOTS ---
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const periods = [
    "08:30:00", // Slot 0
    "09:30:00", // Slot 1
    "10:45:00", // Slot 2 (Post Tea)
    "11:45:00", // Slot 3
    "13:30:00", // Slot 4 (Post Lunch)
    "14:30:00", // Slot 5
    "15:30:00"  // Slot 6
  ];

  // --- 🛠️ THE FIXED FUNCTION ---
  const getCell = (day, timeStart) => {
    // FIX: Match the first 5 characters (e.g. "08:30") to ignore seconds mismatch
    const entry = timetable.find(t => 
      t.day === day && 
      t.start_time.substring(0, 5) === timeStart.substring(0, 5)
    );
    
    if (!entry) return <td className="empty-slot">--</td>;
    
    return (
      <td className="class-slot">
        <div className="sub-tag">{entry.subject}</div>
        <div className="details">{entry.faculty}</div>
        <div className={entry.room_name.toLowerCase().includes('lab') ? 'room-tag lab-room' : 'room-tag'}>
           {entry.room_name}
        </div>
      </td>
    );
  };

  return (
    <div className="app-container">
      <header>
        <h1>📅 Campus Scheduler</h1>
        <button onClick={resetAll} className="btn-reset">Reset System</button>
      </header>

      {/* INPUT CARDS */}
      <div className="forms-grid">
        <div className="card">
            <h3>Batch</h3> <input value={batchName} onChange={e=>setBatchName(e.target.value)} placeholder="e.g. 5A" />
            <button onClick={() => addData('add-batch', {name: batchName})}>Add Batch</button>
        </div>
        <div className="card">
            <h3>Faculty</h3> <input value={facultyName} onChange={e=>setFacultyName(e.target.value)} placeholder="Dr. Name" />
            <button onClick={() => addData('add-faculty', {name: facultyName})}>Add Faculty</button>
        </div>
        <div className="card">
    <h3>Subject</h3>

    {/* Subject Name */}
    <input
        value={subName}
        onChange={(e) => setSubName(e.target.value)}
        placeholder="Subject"
    />

    {/* Hours + Lab Checkbox */}
    <div className="form-row-split">
        <div className="input-group">
            <label>Hrs</label>
            <input
                type="number"
                value={subHours}
                onChange={(e) => setSubHours(e.target.value)}
                min="1"
            />
        </div>

        <div className="checkbox-group">
            <input
                type="checkbox"
                checked={isLab}
                onChange={(e) => setIsLab(e.target.checked)}
            />
            <label>Lab</label>
        </div>
    </div>

    {/* Fixed Room ID */}
    <input
        placeholder="Fixed Room ID (Optional)"
        value={fixedRoomId}
        onChange={(e) => setFixedRoomId(e.target.value)}
    />

    <button
        onClick={() =>
            addData("add-subject", {
                name: subName,
                hours: Number(subHours),
                isLab: isLab,
                fixedRoomId:
                    fixedRoomId.trim() === "" ? null : Number(fixedRoomId)
            })
        }
    >
        Add Subject
    </button>
</div>

        <div className="card">
            <h3>Room</h3> <input value={roomName} onChange={e=>setRoomName(e.target.value)} placeholder="Room No" />
            <select value={roomType} onChange={e=>setRoomType(e.target.value)}><option value="lecture">Classroom</option><option value="lab">Lab</option></select>
            <button onClick={() => addData('add-room', {name: roomName, type: roomType})}>Add Room</button>
        </div>
      </div>

      <div className="action-area">
        <button className="btn-gen" onClick={handleGenerate}>⚡ GENERATE TIMETABLE</button>
        <p className="status-msg">{message}</p>
      </div>

      <div className="view-section">
        <label>View Batch: </label>
        <select value={selectedBatch} onChange={e => setSelectedBatch(e.target.value)}>
            {batches.map(b => <option key={b.batch_id} value={b.batch_id}>{b.name}</option>)}
        </select>
      </div>

      {/* --- SAHYADRI TABLE STRUCTURE --- */}
      <div className="timetable-container">
        <table className="modern-college-table">
            <thead>
            <tr>
                <th className="corner-header">DAY / TIME</th>
                <th>08:30 - 09:30</th>
                <th>09:30 - 10:30</th>
                <th className="break-header">TEA</th>
                <th>10:45 - 11:45</th>
                <th>11:45 - 12:45</th>
                <th className="break-header">LUNCH</th>
                <th>01:30 - 02:30</th>
                <th>02:30 - 03:30</th>
                <th>03:30 - 04:30</th>
            </tr>
            </thead>
            <tbody>
            {days.map(day => (
                <tr key={day}>
                <td className="day-col">{day.toUpperCase()}</td>
                
                {getCell(day, periods[0])}
                {getCell(day, periods[1])}

                {/* Vertical Tea Break */}
                {day === "Mon" && <td rowSpan="6" className="vertical-break tea"><span>TEA BREAK</span></td>}

                {getCell(day, periods[2])}
                {getCell(day, periods[3])}

                {/* Vertical Lunch Break */}
                {day === "Mon" && <td rowSpan="6" className="vertical-break lunch"><span>LUNCH BREAK</span></td>}

                {getCell(day, periods[4])}
                {getCell(day, periods[5])}
                {getCell(day, periods[6])}
                </tr>
            ))}
            </tbody>
        </table>
      </div>
    </div>
  );
};
export default App;