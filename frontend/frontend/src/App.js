import React, { useState, useEffect } from "react";
import axios from "axios";
import "./App.css";

const App = () => {
  // Data State
  const [batches, setBatches] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState("");
  const [timetable, setTimetable] = useState([]);
  const [message, setMessage] = useState("");
  
  // Input Forms State
  const [facultyName, setFacultyName] = useState("");
  const [subName, setSubName] = useState("");
  const [subHours, setSubHours] = useState(3);
  const [isLab, setIsLab] = useState(false);
  const [roomName, setRoomName] = useState("");
  const [roomType, setRoomType] = useState("lecture");
  const [batchName, setBatchName] = useState(""); // New input

  // Initial Load
  useEffect(() => { fetchBatches(); }, []);

  // Fetch Dropdown Data
  const fetchBatches = async () => {
    try {
      const res = await axios.get("http://localhost:5000/meta-data");
      setBatches(res.data.batches);
      if(res.data.batches.length > 0) setSelectedBatch(res.data.batches[0].batch_id);
    } catch(e) { console.error(e); }
  };

  // Fetch Timetable when dropdown changes
  useEffect(() => {
    if(selectedBatch) fetchTimetable(selectedBatch);
  }, [selectedBatch]);

  const fetchTimetable = async (batchId) => {
    const res = await axios.get(`http://localhost:5000/timetable/${batchId}`);
    setTimetable(res.data);
  };

  // --- ACTIONS ---
  const addData = async (endpoint, payload) => {
    try {
        await axios.post(`http://localhost:5000/${endpoint}`, payload);
        setMessage(`✅ Added successfully!`);
        if(endpoint === 'add-batch') fetchBatches(); // Refresh list
    } catch(e) { setMessage("❌ Error adding data"); }
  };

  const handleGenerate = async () => {
    setMessage("⏳ Generating Schedule for ALL Batches...");
    try {
        await axios.post("http://localhost:5000/generate");
        setMessage("✨ Schedule Generated! Select a batch to view.");
        if(selectedBatch) fetchTimetable(selectedBatch);
    } catch(e) { setMessage("❌ Generation Failed"); }
  };

  const resetAll = async () => {
      if(!window.confirm("Delete Everything?")) return;
      await axios.post("http://localhost:5000/reset");
      setBatches([]); setTimetable([]); setMessage("♻️ System Reset");
  };

  return (
    <div className="app-container">
      <header>
        <h1>🎓 Campus Master Scheduler</h1>
        <button onClick={resetAll} className="btn-reset">Reset System</button>
      </header>

      {/* INPUT FORMS */}
      <div className="forms-grid">
        <div className="card">
            <h3>Add Batch</h3>
            <input placeholder="e.g. 3rd Year CSE" value={batchName} onChange={e=>setBatchName(e.target.value)} />
            <button onClick={() => addData('add-batch', {name: batchName})}>Add Batch</button>
        </div>
        <div className="card">
            <h3>Add Faculty</h3>
            <input placeholder="Name" value={facultyName} onChange={e=>setFacultyName(e.target.value)} />
            <button onClick={() => addData('add-faculty', {name: facultyName})}>Add Faculty</button>
        </div>
        <div className="card">
          <h3>📚 Add Subject</h3>
          
          {/* Subject Name Input */}
          <input 
            placeholder="Subject Name" 
            value={subName} 
            onChange={e => setSubName(e.target.value)} 
          />

          {/* New Split Row for Hours & Lab */}
          <div className="form-row-split">
            
            {/* Hours Slot */}
            <div className="input-group">
              <label>Weekly Hours</label>
              <input 
                type="number" 
                value={subHours} 
                onChange={e => setSubHours(e.target.value)} 
                min="1" max="10"
              />
            </div>

            {/* Lab Checkbox */}
            <div className="checkbox-group">
              <input 
                type="checkbox" 
                id="labCheck"
                checked={isLab} 
                onChange={e => setIsLab(e.target.checked)} 
              />
              <label htmlFor="labCheck">Lab Subject?</label>
            </div>
            
          </div>
          <button onClick={() => addData('add-subject', {name: subName, hours: subHours, isLab})}>
            Add Subject
          </button>
        </div>
        <div className="card">
            <h3>Add Room</h3>
            <input placeholder="Room No" value={roomName} onChange={e=>setRoomName(e.target.value)} />
            <select value={roomType} onChange={e=>setRoomType(e.target.value)}>
                <option value="lecture">Classroom</option>
                <option value="lab">Lab</option>
            </select>
            <button onClick={() => addData('add-room', {name: roomName, type: roomType})}>Add Room</button>
        </div>
      </div>

      {/* CONTROLS */}
      <div className="action-area">
        <button className="btn-gen" onClick={handleGenerate}>⚡ GENERATE TIMETABLE (ALL BATCHES)</button>
        <p className="status-msg">{message}</p>
      </div>

      {/* VIEW SECTION */}
      <div className="view-section">
        <label>Select Batch to View: </label>
        <select value={selectedBatch} onChange={e => setSelectedBatch(e.target.value)}>
            {batches.map(b => <option key={b.batch_id} value={b.batch_id}>{b.name}</option>)}
        </select>
      </div>

      {/* TABLE */}
      <table>
        <thead>
          <tr>
            <th>Day</th>
            <th>Time</th>
            <th>Subject</th>
            <th>Faculty</th>
            <th>Room</th>
          </tr>
        </thead>
        <tbody>
          {timetable.map((row, i) => (
            <tr key={i} style={{animationDelay: `${i * 0.1}s`}}> {/* Staggered Animation */}
              <td style={{color: '#8d99ae', fontWeight: 'bold'}}>{row.day}</td>
              <td style={{fontWeight: 'bold'}}>{row.start_time.slice(0,5)}</td>
              <td>{row.subject}</td>
              <td>{row.faculty}</td>
              <td>
                <span className={row.room_name.includes("LAB") || row.room_name.includes("Lab") ? "tag lab" : "tag lec"}>
                  {row.room_name}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
export default App;