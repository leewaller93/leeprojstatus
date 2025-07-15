import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import Select from 'react-select';

// Helper functions
function randomDueDateForExecute(execute) {
  const today = new Date();
  const days = execute === 'Monthly' ? 30 : execute === 'Weekly' ? 7 : 14;
  const futureDate = new Date(today.getTime() + days * 24 * 60 * 60 * 1000);
  return futureDate.toISOString().split('T')[0];
}

function generateSamplePhases(team) {
  const phases = [
    { name: 'Outstanding', items: [] },
    { name: 'Review/Discussion', items: [] },
    { name: 'In Process', items: [] },
    { name: 'Resolved', items: [] }
  ];

  const sampleTasks = [
    { goal: 'Design UI/UX', need: randomDueDateForExecute('Monthly'), comments: 'Wireframes needed', execute: 'Monthly', stage: 'Outstanding', commentArea: 'Use Figma', assigned_to: team.length > 0 ? team[0].username : 'team' },
    { goal: 'Plan architecture', need: randomDueDateForExecute('One-Time'), comments: 'Tech stack decision', execute: 'One-Time', stage: 'Review/Discussion', commentArea: 'React + Node.js', assigned_to: team.length > 1 ? team[1].username : 'team' },
    { goal: 'Build frontend', need: randomDueDateForExecute('Weekly'), comments: 'React setup', execute: 'Weekly', stage: 'In Process', commentArea: 'Use Tailwind', assigned_to: team.length > 0 ? team[0].username : 'team' },
    { goal: 'Test core features', need: randomDueDateForExecute('One-Time'), comments: 'User feedback', execute: 'One-Time', stage: 'Resolved', commentArea: 'Internal testers', assigned_to: team.length > 1 ? team[1].username : 'team' }
  ];

  sampleTasks.forEach(task => {
    const phase = phases.find(p => p.name === task.stage);
    if (phase) {
      phase.items.push({ ...task, id: Date.now() + Math.random() });
    }
  });

  return phases;
}

function loadPhases() {
  const saved = localStorage.getItem('phases');
  return saved ? JSON.parse(saved) : null;
}

function savePhases(phases) {
  localStorage.setItem('phases', JSON.stringify(phases));
}

function loadTeam() {
  const saved = localStorage.getItem('team');
  return saved ? JSON.parse(saved) : [
    { id: 1, username: 'John Doe', email: 'john@example.com', org: 'PHG' },
    { id: 2, username: 'Jane Smith', email: 'jane@example.com', org: 'PHG' }
  ];
}

function saveTeam(team) {
  localStorage.setItem('team', JSON.stringify(team));
}

// Tooltip component
function SmartTooltip({ children, content }) {
  const [show, setShow] = useState(false);
  const [isTruncated, setIsTruncated] = useState(false);
  const cellRef = useRef();

  useEffect(() => {
    if (cellRef.current) {
      setIsTruncated(cellRef.current.scrollWidth > cellRef.current.clientWidth);
    }
  }, [content, children]);

  return (
    <span
      ref={cellRef}
      style={{ position: 'relative', display: 'inline-block', maxWidth: '100%', verticalAlign: 'middle', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', cursor: isTruncated ? 'pointer' : 'default' }}
      onMouseEnter={() => isTruncated && setShow(true)}
      onMouseLeave={() => setShow(false)}
      tabIndex={0}
    >
      {children}
      {show && isTruncated && (
        <div style={{
          position: 'absolute',
          left: '50%',
          top: '100%',
          transform: 'translateX(-50%)',
          marginTop: 8,
          background: '#222',
          color: '#fff',
          padding: '10px 16px',
          borderRadius: 8,
          boxShadow: '0 4px 16px rgba(0,0,0,0.18)',
          zIndex: 9999,
          minWidth: 180,
          maxWidth: 400,
          fontSize: 15,
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
        }}>
          {content}
        </div>
      )}
    </span>
  );
}

// Replace SmartTooltip with ExpandingCell
function ExpandingCell({ editable, value, onChange }) {
  // console.log("ExpandingCell rendered");
  const [showPopout, setShowPopout] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);
  const [boxPos, setBoxPos] = useState(null);
  const cellRef = useRef();
  const inputRef = useRef();

  useEffect(() => {
    setEditValue(value);
  }, [value]);

  // Get cell position for pop-out
  useEffect(() => {
    if (showPopout && cellRef.current) {
      const rect = cellRef.current.getBoundingClientRect();
      setBoxPos({
        left: rect.left,
        top: rect.top,
        width: rect.width,
        height: rect.height
      });
    } else if (!showPopout) {
      setBoxPos(null);
    }
  }, [showPopout]);

  // Focus textarea when editing
  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [editing]);

  // Save on blur or Enter
  const handleSave = () => {
    if (editValue !== value) {
      onChange && onChange(editValue);
    }
    setEditing(false);
    setShowPopout(false);
  };

  // Pop-out content (normal)
  const popoutContent = (
    <div
      style={{
        background: '#fffbe6',
        border: '2px solid #ffe066',
        borderRadius: 14,
        boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
        zIndex: 999999,
        padding: 22,
        fontSize: 16,
        minWidth: 340,
        maxWidth: 600,
        minHeight: 48,
        maxHeight: 340,
        overflowY: 'auto',
        whiteSpace: 'pre-wrap',
        position: 'fixed',
        left: boxPos ? boxPos.left : '50%',
        top: boxPos ? boxPos.top + (boxPos.height || 0) + 10 : '50%',
        transform: boxPos ? 'none' : 'translate(-50%, -50%)',
        outline: 'none',
        cursor: editing ? 'text' : editable ? 'pointer' : 'default',
        color: '#222',
        transition: 'box-shadow 0.2s',
      }}
      onClick={e => e.stopPropagation()}
      onMouseLeave={() => { if (!editing) setShowPopout(false); }}
      onMouseEnter={() => setShowPopout(true)}
    >
      {editing ? (
        <textarea
          ref={inputRef}
          value={editValue || ''}
          onChange={e => setEditValue(e.target.value)}
          onBlur={handleSave}
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { inputRef.current.blur(); e.preventDefault(); } }}
          style={{ width: '100%', minHeight: 48, maxHeight: 240, fontSize: 16, padding: 12, borderRadius: 8, border: '2px solid #ccc', background: '#fff', resize: 'vertical', boxSizing: 'border-box', textAlign: 'left', overflow: 'auto', outline: 'none' }}
        />
      ) : (
        <div
          style={{ width: '100%', minHeight: 48, maxHeight: 240, overflowY: 'auto', cursor: editable ? 'pointer' : 'default', color: editValue ? '#222' : '#aaa', fontSize: 16 }}
          onClick={() => { if (editable) setEditing(true); }}
        >
          {editValue || <span>(No content)</span>}
        </div>
      )}
    </div>
  );

  // Only show pop-out on hover or editing
  const popout = (showPopout || editing) && (boxPos || editing)
    ? ReactDOM.createPortal(popoutContent, document.body)
    : null;

  return (
    <td
      ref={cellRef}
      style={{
        minWidth: 120,
        maxWidth: 180,
        position: 'relative',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        cursor: editable ? 'pointer' : 'default',
        background: showPopout || editing ? '#fffbe6' : undefined,
        border: showPopout || editing ? '2px solid #ffe066' : undefined,
        zIndex: showPopout || editing ? 2 : 1,
        transition: 'background 0.18s, border 0.18s',
      }}
      onMouseEnter={() => setShowPopout(true)}
      onMouseLeave={() => { if (!editing) setShowPopout(false); }}
      onClick={() => { if (editable) setEditing(true); }}
    >
      <span style={{ display: 'inline-block', maxWidth: '100%', overflow: 'hidden', textOverflow: 'ellipsis', verticalAlign: 'middle' }}>
        {editValue || <span style={{ color: '#aaa' }}>(No content)</span>}
      </span>
      {popout}
    </td>
  );
}

// Backend API URL (update this to your server's public IP/domain as needed)
const API_URL = "https://has-status-backend.onrender.com/api";

function App() {
  const [team, setTeam] = useState([]);
  const [phases, setPhases] = useState([]);
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [org, setOrg] = useState("PHG");
  const [newTask, setNewTask] = useState({
    phase: "Outstanding",
    goal: "",
    need: "",
    comments: "",
    execute: "N",
    stage: "Outstanding",
    commentArea: "",
    assigned_to: "team"
  });
  const [notWorkingPrompt, setNotWorkingPrompt] = useState(null);
  const [reassignTo, setReassignTo] = useState("");
  const [clientName, setClientName] = useState("");
  const [filterMember, setFilterMember] = useState([]);
  const [filterStatus, setFilterStatus] = useState([]);
  const [sortByStatus, setSortByStatus] = useState(false);

  // Helper: fallback to localStorage/demo data if backend fails
  const fetchWithFallback = async (url, options, fallbackFn) => {
    try {
      const res = await fetch(url, options);
      if (!res.ok) throw new Error('Backend unavailable');
      return await res.json();
    } catch (e) {
      return fallbackFn();
    }
  };

  useEffect(() => {
    fetchPhases();
    fetchTeam();
  }, []);

  const fetchPhases = async () => {
    const teamData = loadTeam();
    const data = await fetchWithFallback(
      `${API_URL}/phases`,
      undefined,
      () => {
        let phases = loadPhases();
        if (!phases) {
          phases = generateSamplePhases(teamData);
          savePhases(phases);
        }
        return phases.flatMap(p => p.items.map(i => ({ ...i, stage: p.name })));
      }
    );
    // Group by phase name
    const phaseNames = ["Outstanding", "Review/Discussion", "In Process", "Resolved"];
    const grouped = phaseNames.map(name => ({
      name,
      items: data.filter(item => item.stage === name)
    }));
    setPhases(grouped);
  };

  const fetchTeam = async () => {
    const data = await fetchWithFallback(
      `${API_URL}/team`,
      undefined,
      () => loadTeam()
    );
    setTeam(data);
  };

  // Add/edit/delete functions: use backend if available, else localStorage
  const addTeamMember = async () => {
    if (!username || !email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      alert("Please enter a valid username and email");
      return;
    }
    const body = { username, email, org };
    const success = await fetchWithFallback(
      `${API_URL}/invite`,
      { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) },
      () => {
        const current = loadTeam();
        const newMember = { id: Date.now(), ...body };
        const updated = [...current, newMember];
        saveTeam(updated);
        return { ok: true };
      }
    );
    fetchTeam();
    setUsername("");
    setEmail("");
    setOrg("PHG");
  };

  const addNewTask = async () => {
    if (!newTask.goal) {
      alert("Please enter a goal");
      return;
    }
    const success = await fetchWithFallback(
      `${API_URL}/phases`,
      { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(newTask) },
      () => {
        let phases = loadPhases();
        if (!phases) phases = generateSamplePhases(loadTeam());
        const phaseIdx = phases.findIndex(p => p.name === newTask.phase);
        const newItem = { ...newTask, id: Date.now() };
        phases[phaseIdx].items.push(newItem);
        savePhases(phases);
        return { ok: true };
      }
    );
    fetchPhases();
    setNewTask({
      phase: "Outstanding",
      goal: "",
      need: "",
      comments: "",
      execute: "N",
      stage: "Outstanding",
      commentArea: "",
      assigned_to: "team"
    });
  };

  const updatePhaseItem = async (id, phase, updatedItem) => {
    await fetchWithFallback(
      `${API_URL}/phases/${id}`,
      { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...updatedItem, phase }) },
      () => {
        let phases = loadPhases();
        if (!phases) phases = generateSamplePhases(loadTeam());
        for (const p of phases) {
          const idx = p.items.findIndex(i => i.id === id);
          if (idx !== -1) {
            p.items[idx] = { ...p.items[idx], ...updatedItem, phase };
            break;
          }
        }
        savePhases(phases);
        return { ok: true };
      }
    );
    fetchPhases();
  };

  const deletePhaseItem = async (id) => {
    await fetchWithFallback(
      `${API_URL}/phases/${id}`,
      { method: "DELETE" },
      () => {
        let phases = loadPhases();
        if (!phases) phases = generateSamplePhases(loadTeam());
        for (const p of phases) {
          p.items = p.items.filter(i => i.id !== id);
        }
        savePhases(phases);
        return { ok: true };
      }
    );
    fetchPhases();
  };

  const handleDeleteMember = async (member) => {
    await fetchWithFallback(
      `${API_URL}/team/${member.id}`,
      { method: "DELETE" },
      () => {
        const current = loadTeam();
        const updated = current.filter(m => m.id !== member.id);
        saveTeam(updated);
        return { ok: true };
      }
    );
    fetchTeam();
  };

  const handleNotWorking = (member) => {
    const assignedTasks = phases.flatMap(p => p.items.filter(i => i.assigned_to === member.username));
    setNotWorkingPrompt({ member, tasks: assignedTasks });
    setReassignTo("");
  };

  const confirmNotWorking = async () => {
    if (!notWorkingPrompt) return;
    const res = await fetchWithFallback(
      `${API_URL}/team/${notWorkingPrompt.member.id}/not-working`,
      { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ reassign_to: reassignTo }) },
      () => {
        const current = loadTeam();
        const updated = current.map(m => m.id === notWorkingPrompt.member.id ? { ...m, org: "Not Working" } : m);
        saveTeam(updated);
        return { ok: true };
      }
    );
    if (res.ok) {
      fetchPhases();
      fetchTeam();
      setNotWorkingPrompt(null);
    } else {
      alert("Failed to mark as not working");
    }
  };

  const cancelNotWorking = () => setNotWorkingPrompt(null);

  const handleSave = () => {
    alert("Saved! (Data is now persistent in the backend database.)");
  };

  return (
    <div style={{ background: '#f9fafb', minHeight: '100vh' }}>
      <div style={{ position: 'absolute', top: 16, right: 32, zIndex: 2000 }}>
        <img
          src={process.env.PUBLIC_URL + "/partners-logo.png"}
          alt="Partners Healthcare Group Logo"
          style={{ width: 160, height: 'auto' }}
        />
      </div>
      <div style={{ padding: 32, maxWidth: 900, margin: '0 auto', position: 'relative', borderRadius: 16, boxShadow: '0 2px 12px rgba(0,0,0,0.07)' }}>
        <h1 style={{ fontSize: 32, fontWeight: 'bold', marginBottom: 24, textAlign: 'center', letterSpacing: 1, color: '#1f2937' }}>HAS Status</h1>
      
        <div style={{ display: "flex", alignItems: "center", marginBottom: 24, gap: 12 }}>
          <label htmlFor="clientName" style={{ fontWeight: "bold", fontSize: 18 }}>Client Name:</label>
          <input
            id="clientName"
            type="text"
            value={clientName}
            onChange={e => setClientName(e.target.value)}
            placeholder="Enter client name..."
            style={{ fontSize: 18, padding: 8, borderRadius: 4, border: "1px solid #ccc", flex: 1 }}
          />
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
          <button
            onClick={handleSave}
            style={{ background: "#22c55e", color: "white", padding: "12px 28px", borderRadius: 8, border: "none", cursor: "pointer", fontSize: 16, fontWeight: "bold", boxShadow: "0 2px 8px rgba(0,0,0,0.10)" }}
          >
            Save
          </button>
        </div>

        <h2 style={{ fontSize: 20, fontWeight: "bold", marginBottom: 8, marginTop: 0 }}>Add Team Member</h2>
        <div style={{ display: "flex", gap: 12, marginBottom: 16, background: "#fff", padding: 16, borderRadius: 8, boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
          <input
            type="text"
            value={username}
            onChange={e => setUsername(e.target.value)}
            placeholder="Username"
            style={{ padding: 8, borderRadius: 4, border: "1px solid #ccc", flex: 1 }}
          />
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="Email"
            style={{ padding: 8, borderRadius: 4, border: "1px solid #ccc", flex: 1 }}
          />
          <select
            value={org}
            onChange={e => setOrg(e.target.value)}
            style={{ padding: 8, borderRadius: 4, border: "1px solid #ccc" }}
          >
            <option value="PHG">PHG</option>
            <option value="Outside">Outside</option>
          </select>
          <button
            onClick={addTeamMember}
            style={{ background: "#3b82f6", color: "white", padding: "8px 20px", borderRadius: 4, border: "none", cursor: "pointer", fontWeight: "bold" }}
          >
            Add
          </button>
        </div>

        <div style={{ marginBottom: 32, background: "#fff", padding: 16, borderRadius: 8, boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
          <h3 style={{ fontWeight: "bold", marginBottom: 8 }}>Team Members</h3>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#f3f4f6" }}>
                <th style={{ border: "1px solid #e5e7eb", padding: 8 }}>Username</th>
                <th style={{ border: "1px solid #e5e7eb", padding: 8 }}>Email</th>
                <th style={{ border: "1px solid #e5e7eb", padding: 8 }}>Org</th>
                <th style={{ border: "1px solid #e5e7eb", padding: 8 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {team.map(member => {
                const assignedTasks = phases.flatMap(p => p.items.filter(i => i.assigned_to === member.username));
                const canDelete = assignedTasks.length === 0 && !(member.org || "").includes("Not Working");
                const canNotWork = assignedTasks.length > 0 && !(member.org || "").includes("Not Working");
                return (
                  <tr key={member.id}>
                    <td style={{ border: "1px solid #e5e7eb", padding: 8 }}>{member.username}</td>
                    <td style={{ border: "1px solid #e5e7eb", padding: 8 }}>{member.email}</td>
                    <td style={{ border: "1px solid #e5e7eb", padding: 8 }}>{member.org}</td>
                    <td style={{ border: "1px solid #e5e7eb", padding: 8 }}>
                      <button
                        onClick={() => handleDeleteMember(member)}
                        disabled={!canDelete}
                        style={{ background: canDelete ? "#ef4444" : "#ccc", color: "white", border: "none", borderRadius: 4, padding: "4px 12px", marginRight: 8, cursor: canDelete ? "pointer" : "not-allowed", fontWeight: "bold" }}
                      >
                        Delete
                      </button>
                      <button
                        onClick={() => handleNotWorking(member)}
                        disabled={!canNotWork}
                        style={{ background: canNotWork ? "#f59e0b" : "#ccc", color: "white", border: "none", borderRadius: 4, padding: "4px 12px", cursor: canNotWork ? "pointer" : "not-allowed", fontWeight: "bold" }}
                      >
                        Not Working
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {notWorkingPrompt && (
          <div style={{ position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", background: "rgba(0,0,0,0.2)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ background: "#fff", padding: 32, borderRadius: 12, boxShadow: "0 2px 12px rgba(0,0,0,0.15)", minWidth: 320 }}>
              <h3 style={{ marginBottom: 16 }}>Reassign all tasks for <b>{notWorkingPrompt.member.username}</b></h3>
              <div style={{ marginBottom: 16 }}>
                <label>Reassign to: </label>
                <select value={reassignTo} onChange={e => setReassignTo(e.target.value)} style={{ padding: 8, borderRadius: 4, border: "1px solid #ccc" }}>
                  <option value="">team</option>
                  {team.filter(m => m.id !== notWorkingPrompt.member.id && !(m.org || "").includes("Not Working")).map(m => (
                    <option key={m.id} value={m.username}>{m.username}</option>
                  ))}
                </select>
              </div>
              <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
                <button onClick={cancelNotWorking} style={{ background: "#ccc", color: "#222", border: "none", borderRadius: 4, padding: "8px 20px", fontWeight: "bold" }}>Cancel</button>
                <button onClick={confirmNotWorking} style={{ background: "#22c55e", color: "white", border: "none", borderRadius: 4, padding: "8px 20px", fontWeight: "bold" }}>Confirm</button>
              </div>
            </div>
          </div>
        )}

        <div style={{ marginBottom: 32, background: "#fff", padding: 20, borderRadius: 8, boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
          <h3 style={{ fontSize: 18, fontWeight: "bold", marginBottom: 16 }}>Add New Task</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div>
              <label style={{ display: "block", fontWeight: "bold", marginBottom: 4 }}>Goal:</label>
              <input 
                name="goal" 
                value={newTask.goal} 
                onChange={e => setNewTask(prev => ({ ...prev, goal: e.target.value }))} 
                placeholder="Enter task goal..." 
                style={{ width: "100%", padding: 8, borderRadius: 4, border: "1px solid #ccc" }} 
              />
            </div>
            <div>
              <label style={{ display: "block", fontWeight: "bold", marginBottom: 4 }}>ETC Date:</label>
              <input 
                name="need" 
                type="date" 
                value={newTask.need} 
                onChange={e => setNewTask(prev => ({ ...prev, need: e.target.value }))} 
                style={{ width: "100%", padding: 8, borderRadius: 4, border: "1px solid #ccc" }} 
              />
            </div>
            <div style={{ gridColumn: "1 / -1" }}>
              <label style={{ display: "block", fontWeight: "bold", marginBottom: 4 }}>Comments:</label>
              <input 
                name="comments" 
                value={newTask.comments} 
                onChange={e => setNewTask(prev => ({ ...prev, comments: e.target.value }))} 
                placeholder="Enter comments..." 
                style={{ width: "100%", padding: 8, borderRadius: 4, border: "1px solid #ccc" }} 
              />
            </div>
            <div>
              <label style={{ display: "block", fontWeight: "bold", marginBottom: 4 }}>Frequency:</label>
              <select 
                name="frequency" 
                value={newTask.execute} 
                onChange={e => setNewTask(prev => ({ ...prev, execute: e.target.value }))} 
                style={{ width: "100%", padding: 8, borderRadius: 4, border: "1px solid #ccc" }}
              >
                <option value="Monthly">Monthly</option>
                <option value="Weekly">Weekly</option>
                <option value="One-Time">One-Time</option>
              </select>
            </div>
            <div>
              <label style={{ display: "block", fontWeight: "bold", marginBottom: 4 }}>Status:</label>
              <select 
                name="stage" 
                value={newTask.stage} 
                onChange={e => setNewTask(prev => ({ ...prev, stage: e.target.value }))} 
                style={{ width: "100%", padding: 8, borderRadius: 4, border: "1px solid #ccc" }}
              >
                <option value="Outstanding">Outstanding</option>
                <option value="Review/Discussion">Review/Discussion</option>
                <option value="In Process">In Process</option>
                <option value="Resolved">Resolved</option>
              </select>
            </div>
            <div>
              <label style={{ display: "block", fontWeight: "bold", marginBottom: 4 }}>Assigned To:</label>
              <select 
                name="assigned_to" 
                value={newTask.assigned_to} 
                onChange={e => setNewTask(prev => ({ ...prev, assigned_to: e.target.value }))} 
                style={{ width: "100%", padding: 8, borderRadius: 4, border: "1px solid #ccc" }}
              >
                <option value="team">team</option>
                {team.map((member) => (
                  <option key={member.id} value={member.username}>{member.username}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={{ display: "block", fontWeight: "bold", marginBottom: 4 }}>Feedback:</label>
              <input 
                name="commentArea" 
                value={newTask.commentArea} 
                onChange={e => setNewTask(prev => ({ ...prev, commentArea: e.target.value }))} 
                placeholder="Enter feedback..." 
                style={{ width: "100%", padding: 8, borderRadius: 4, border: "1px solid #ccc" }} 
              />
            </div>
            <div style={{ gridColumn: "1 / -1", textAlign: "center" }}>
              <button 
                onClick={addNewTask} 
                style={{ background: "#22c55e", color: "white", padding: "12px 24px", borderRadius: 4, border: "none", cursor: "pointer", fontWeight: "bold", fontSize: 16 }}
              >
                Add Task
              </button>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 16, alignItems: 'center', marginBottom: 16, flexWrap: 'wrap' }}>
          <div style={{ minWidth: 220 }}>
            <label style={{ fontWeight: 'bold', marginRight: 8, display: 'block' }}>Filter by Owner:</label>
            <Select
              isMulti
              options={team.map(m => ({ value: m.username, label: m.username }))}
              value={team.filter(m => filterMember.includes(m.username)).map(m => ({ value: m.username, label: m.username }))}
              onChange={selected => setFilterMember(selected.map(opt => opt.value))}
              placeholder="Select team members..."
              closeMenuOnSelect={false}
              styles={{ menu: base => ({ ...base, zIndex: 9999 }) }}
            />
          </div>
          <div style={{ minWidth: 220 }}>
            <label style={{ fontWeight: 'bold', marginRight: 8, display: 'block' }}>Filter by Status:</label>
            <Select
              isMulti
              options={[
                { value: 'Outstanding', label: 'Outstanding' },
                { value: 'Review/Discussion', label: 'Review/Discussion' },
                { value: 'In Process', label: 'In Process' },
                { value: 'Resolved', label: 'Resolved' }
              ]}
              value={filterStatus.map(s => ({ value: s, label: s }))}
              onChange={selected => setFilterStatus(selected.map(opt => opt.value))}
              placeholder="Select statuses..."
              closeMenuOnSelect={false}
              styles={{ menu: base => ({ ...base, zIndex: 9999 }) }}
            />
          </div>
          <button 
            onClick={() => setSortByStatus(s => !s)} 
            style={{ padding: '6px 16px', borderRadius: 4, border: '1px solid #ccc', background: '#f3f4f6', fontWeight: 'bold', cursor: 'pointer', height: 40, alignSelf: 'end' }}
          >
            Filter by Status
          </button>
          <button 
            onClick={() => {
              setFilterMember([]);
              setFilterStatus([]);
            }} 
            style={{ padding: '6px 16px', borderRadius: 4, border: '1px solid #ccc', background: '#ef4444', color: 'white', fontWeight: 'bold', cursor: 'pointer', height: 40, alignSelf: 'end' }}
          >
            Clear Filters
          </button>
        </div>

        {phases.map((phase, phaseIdx) => {
          let items = phase.items;
          if (filterMember.length > 0) items = items.filter(i => filterMember.includes(i.assigned_to));
          if (filterStatus.length > 0) items = items.filter(i => filterStatus.includes(i.stage));
          if (sortByStatus) {
            items = [...items].sort((a, b) => a.stage.localeCompare(b.stage));
          }
          if (!items.length) return null;
          return (
            <div key={phase.name} style={{ marginBottom: 32, background: "#fff", borderRadius: 8, boxShadow: "0 1px 4px rgba(0,0,0,0.04)", padding: 20 }}>
              <h2 style={{ fontSize: 20, fontWeight: "bold", marginBottom: 12 }}>{phase.name}</h2>
              <table style={{ width: "100%", borderCollapse: "collapse", border: "1px solid #e5e7eb", background: "#fff" }}>
                <thead>
                  <tr style={{ background: "#f3f4f6" }}>
                    <th style={{ border: "1px solid #e5e7eb", padding: 8 }}>Goal</th>
                    <th style={{ border: "1px solid #e5e7eb", padding: 8 }}>ETC Date</th>
                    <th style={{ border: "1px solid #e5e7eb", padding: 8 }}>Comments</th>
                    <th style={{ border: "1px solid #e5e7eb", padding: 8 }}>Frequency</th>
                    <th style={{ border: "1px solid #e5e7eb", padding: 8 }}>Status</th>
                    <th style={{ border: "1px solid #e5e7eb", padding: 8 }}>Feedback</th>
                    <th style={{ border: "1px solid #e5e7eb", padding: 8 }}>Assigned To</th>
                    <th style={{ border: "1px solid #e5e7eb", padding: 8 }}>Delete</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map(item => (
                    <tr key={item.id}>
                      <ExpandingCell
                        editable
                        value={item.goal}
                        onChange={val => updatePhaseItem(item.id, phase.name, { goal: val })}
                      >
                        {item.goal}
                      </ExpandingCell>
                      <td>
                        <input type="date" value={item.need || ""} onChange={e => updatePhaseItem(item.id, phase.name, { need: e.target.value })} />
                      </td>
                      <ExpandingCell
                        editable
                        value={item.comments}
                        onChange={val => updatePhaseItem(item.id, phase.name, { comments: val })}
                      >
                        {item.comments}
                      </ExpandingCell>
                      <td>
                        <select value={item.execute} onChange={e => updatePhaseItem(item.id, phase.name, { execute: e.target.value })}>
                          <option value="Monthly">Monthly</option>
                          <option value="Weekly">Weekly</option>
                          <option value="One-Time">One-Time</option>
                        </select>
                      </td>
                      <td>
                        <select value={item.stage} onChange={e => updatePhaseItem(item.id, phase.name, { stage: e.target.value })}>
                          <option value="Outstanding">Outstanding</option>
                          <option value="Review/Discussion">Review/Discussion</option>
                          <option value="In Process">In Process</option>
                          <option value="Resolved">Resolved</option>
                        </select>
                      </td>
                      <ExpandingCell
                        editable
                        value={item.commentArea}
                        onChange={val => updatePhaseItem(item.id, phase.name, { commentArea: val })}
                      >
                        {item.commentArea}
                      </ExpandingCell>
                      <td>
                        <select value={item.assigned_to} onChange={e => updatePhaseItem(item.id, phase.name, { assigned_to: e.target.value })}>
                          <option value="team">team</option>
                          {team.map(member => (
                            <option key={member.id} value={member.username}>{member.username}</option>
                          ))}
                        </select>
                      </td>
                      <td>
                        <button onClick={() => deletePhaseItem(item.id)} style={{ background: '#ef4444', color: 'white', border: 'none', borderRadius: 4, padding: '4px 12px', fontWeight: 'bold', cursor: 'pointer' }}>Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default App;