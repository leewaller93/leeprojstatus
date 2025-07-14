import React, { useState, useEffect } from "react";

function App() {
  const [phases, setPhases] = useState([]);
  const [team, setTeam] = useState([]);
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [newTask, setNewTask] = useState({
    phase: "Design",
    goal: "",
    need: "",
    comments: "",
    execute: "N",
    stage: "review",
    commentArea: "",
    assigned_to: "team"
  });

  // Debounced update function
  const debouncedUpdate = React.useRef(null);
  const debouncedUpdatePhaseItem = (id, phase, updatedItem) => {
    if (debouncedUpdate.current) {
      clearTimeout(debouncedUpdate.current);
    }
    debouncedUpdate.current = setTimeout(() => {
      updatePhaseItem(id, phase, updatedItem);
    }, 500);
  };

  // Fetch initial data
  useEffect(() => {
    fetchPhases();
    fetchTeam();
    // No whiteboard state fetching
    // eslint-disable-next-line
  }, []);

  const fetchPhases = async () => {
    const response = await fetch("https://whiteboard-backend-1cdi.onrender.com/api/phases");
    const data = await response.json();
    setPhases([
      { name: "Design", items: data.filter((item) => item.phase === "Design") },
      { name: "Development", items: data.filter((item) => item.phase === "Development") },
      { name: "Alpha Usage", items: data.filter((item) => item.phase === "Alpha Usage") },
      { name: "Beta Release (Web)", items: data.filter((item) => item.phase === "Beta Release (Web)") },
    ]);
  };

  const fetchTeam = async () => {
    const response = await fetch("https://whiteboard-backend-1cdi.onrender.com/api/team");
    const data = await response.json();
    setTeam(data);
  };

  const addTeamMember = async () => {
    if (!username || !email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      alert("Please enter a valid username and email");
      return;
    }
    const response = await fetch("https://whiteboard-backend-1cdi.onrender.com/api/invite", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, email }),
    });
    if (response.ok) {
      fetchTeam();
      setUsername("");
      setEmail("");
    } else {
      alert("Failed to add user");
    }
  };

  const updatePhaseItem = async (id, phase, updatedItem) => {
    try {
      const response = await fetch(`https://whiteboard-backend-1cdi.onrender.com/api/phases/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...updatedItem, phase }),
      });
      if (response.ok) {
        setPhases(prevPhases =>
          prevPhases.map(p => ({
            ...p,
            items: p.items.map(item =>
              item.id === id ? { ...item, ...updatedItem } : item
            )
          }))
        );
      }
    } catch (error) {
      console.error('Error updating item:', error);
    }
  };

  const handleNewTaskChange = (e) => {
    const { name, value } = e.target;
    setNewTask((prev) => ({ ...prev, [name]: value }));
  };

  const addNewTask = async () => {
    if (!newTask.goal) {
      alert("Please enter a goal");
      return;
    }
    const response = await fetch("https://whiteboard-backend-1cdi.onrender.com/api/phases", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...newTask, assigned_to: newTask.assigned_to || "team" }),
    });
    if (response.ok) {
      fetchPhases();
      setNewTask({
        phase: "Design",
        goal: "",
        need: "",
        comments: "",
        execute: "N",
        stage: "review",
        commentArea: "",
        assigned_to: "team"
      });
    } else {
      alert("Failed to add task");
    }
  };

  const deletePhaseItem = async (id) => {
    const url = `https://whiteboard-backend-1cdi.onrender.com/api/phases/${id}`;
    if (window.confirm("Are you sure you want to delete this task?")) {
      try {
        const response = await fetch(url, {
          method: "DELETE",
        });
        setPhases(prevPhases =>
          prevPhases.map(p => ({
            ...p,
            items: p.items.filter(item => item.id !== id)
          }))
        );
        if (!response.ok) {
          console.error('Failed to delete from backend:', response.status);
        }
      } catch (error) {
        console.error('Error deleting item:', error);
        alert("Failed to delete task. Please try again.");
      }
    }
  };

  return (
    <div style={{ padding: 16, maxWidth: 1200, margin: "0 auto", position: "relative" }}>
      {/* Partners Logo Top Right */}
      <img
        src={process.env.PUBLIC_URL + "/partners-logo.png"}
        alt="Partners Healthcare Group Logo"
        style={{
          position: "absolute",
          top: 16,
          right: 16,
          width: 180,
          height: "auto",
          zIndex: 2000
        }}
      />
      {/* Add Task Form */}
      <h2 style={{ fontSize: 20, fontWeight: "bold", marginBottom: 8 }}>ABC Hospital Status Report</h2>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        <select name="phase" value={newTask.phase} onChange={handleNewTaskChange} style={{ padding: 8, borderRadius: 4, border: "1px solid #ccc" }}>
          <option value="Design">Design</option>
          <option value="Development">Development</option>
          <option value="Alpha Usage">Alpha Usage</option>
          <option value="Beta Release (Web)">Beta Release (Web)</option>
        </select>
        <input name="goal" value={newTask.goal} onChange={handleNewTaskChange} placeholder="Goal" style={{ padding: 8, borderRadius: 4, border: "1px solid #ccc", flex: 1 }} />
        <input
          name="need"
          type="date"
          value={newTask.need}
          onChange={handleNewTaskChange}
          placeholder="ETC Date"
          style={{ padding: 8, borderRadius: 4, border: "1px solid #ccc" }}
        />
        <input name="comments" value={newTask.comments} onChange={handleNewTaskChange} placeholder="Comments" style={{ padding: 8, borderRadius: 4, border: "1px solid #ccc", flex: 1 }} />
        <select name="execute" value={newTask.execute} onChange={handleNewTaskChange} style={{ padding: 8, borderRadius: 4, border: "1px solid #ccc" }}>
          <option value="Y">Y</option>
          <option value="N">N</option>
        </select>
        <select name="stage" value={newTask.stage} onChange={handleNewTaskChange} style={{ padding: 8, borderRadius: 4, border: "1px solid #ccc" }}>
          <option value="review">Review</option>
          <option value="In Dev">In Dev</option>
          <option value="Feedback">Feedback</option>
          <option value="Testing">Testing</option>
          <option value="Complete">Complete</option>
          <option value="Released">Released</option>
        </select>
        <select name="assigned_to" value={newTask.assigned_to} onChange={handleNewTaskChange} style={{ padding: 8, borderRadius: 4, border: "1px solid #ccc", flex: 1 }}>
          <option value="team">team</option>
          {team.map((member) => (
            <option key={member.id} value={member.username}>{member.username}</option>
          ))}
        </select>
        <input name="commentArea" value={newTask.commentArea} onChange={handleNewTaskChange} placeholder="Feedback" style={{ padding: 8, borderRadius: 4, border: "1px solid #ccc", flex: 1 }} />
        <button onClick={addNewTask} style={{ background: "#22c55e", color: "white", padding: "8px 16px", borderRadius: 4, border: "none", cursor: "pointer" }}>Add</button>
      </div>

      {/* Task Table */}
      {phases.map((phase) => (
        <div key={phase.name} style={{ marginBottom: 32 }}>
          <h2 style={{ fontSize: 20, fontWeight: "bold", marginBottom: 8 }}>{phase.name}</h2>
          <table style={{ width: "100%", borderCollapse: "collapse", border: "1px solid #ccc" }}>
            <thead>
              <tr style={{ background: "#f3f4f6" }}>
                <th style={{ border: "1px solid #ccc", padding: 8 }}>Goal</th>
                <th style={{ border: "1px solid #ccc", padding: 8 }}>ETC Date</th>
                <th style={{ border: "1px solid #ccc", padding: 8 }}>Comments</th>
                <th style={{ border: "1px solid #ccc", padding: 8 }}>Execute</th>
                <th style={{ border: "1px solid #ccc", padding: 8 }}>Status</th>
                <th style={{ border: "1px solid #ccc", padding: 8 }}>Feedback</th>
                <th style={{ border: "1px solid #ccc", padding: 8 }}>Assigned To</th>
                <th style={{ border: "1px solid #ccc", padding: 8 }}>Delete</th>
              </tr>
            </thead>
            <tbody>
              {phase.items.map((item) => (
                <tr key={item.id}>
                  <td style={{ border: "1px solid #ccc", padding: 8 }}>
                    <input
                      type="text"
                      value={item.goal}
                      onChange={(e) => {
                        const newValue = e.target.value;
                        setPhases(prevPhases =>
                          prevPhases.map(p => ({
                            ...p,
                            items: p.items.map(i =>
                              i.id === item.id ? { ...i, goal: newValue } : i
                            )
                          }))
                        );
                        debouncedUpdatePhaseItem(item.id, phase.name, { ...item, goal: newValue });
                      }}
                      style={{ width: "100%", padding: 4 }}
                    />
                  </td>
                  <td style={{ border: "1px solid #ccc", padding: 8 }}>
                    <input
                      type="date"
                      value={item.need || ""}
                      onChange={(e) => {
                        const newValue = e.target.value;
                        setPhases(prevPhases =>
                          prevPhases.map(p => ({
                            ...p,
                            items: p.items.map(i =>
                              i.id === item.id ? { ...i, need: newValue } : i
                            )
                          }))
                        );
                        debouncedUpdatePhaseItem(item.id, phase.name, { ...item, need: newValue });
                      }}
                      style={{ width: "100%", padding: 4 }}
                    />
                  </td>
                  <td style={{ border: "1px solid #ccc", padding: 8 }}>
                    <input
                      type="text"
                      value={item.comments}
                      onChange={(e) => {
                        const newValue = e.target.value;
                        setPhases(prevPhases =>
                          prevPhases.map(p => ({
                            ...p,
                            items: p.items.map(i =>
                              i.id === item.id ? { ...i, comments: newValue } : i
                            )
                          }))
                        );
                        debouncedUpdatePhaseItem(item.id, phase.name, { ...item, comments: newValue });
                      }}
                      style={{ width: "100%", padding: 4 }}
                    />
                  </td>
                  <td style={{ border: "1px solid #ccc", padding: 8 }}>
                    <select
                      value={item.execute}
                      onChange={(e) => {
                        const newValue = e.target.value;
                        setPhases(prevPhases =>
                          prevPhases.map(p => ({
                            ...p,
                            items: p.items.map(i =>
                              i.id === item.id ? { ...i, execute: newValue } : i
                            )
                          }))
                        );
                        debouncedUpdatePhaseItem(item.id, phase.name, { ...item, execute: newValue });
                      }}
                      style={{ width: "100%", padding: 4 }}
                    >
                      <option value="Y">Y</option>
                      <option value="N">N</option>
                    </select>
                  </td>
                  <td style={{ border: "1px solid #ccc", padding: 8 }}>
                    <select
                      value={item.stage}
                      onChange={(e) => {
                        const newValue = e.target.value;
                        setPhases(prevPhases =>
                          prevPhases.map(p => ({
                            ...p,
                            items: p.items.map(i =>
                              i.id === item.id ? { ...i, stage: newValue, phase: newValue } : i
                            )
                          }))
                        );
                        debouncedUpdatePhaseItem(item.id, newValue, { ...item, stage: newValue, phase: newValue });
                      }}
                      style={{ width: "100%", padding: 4 }}
                    >
                      <option value="Design">Design</option>
                      <option value="Development">Development</option>
                      <option value="Alpha Usage">Alpha Usage</option>
                      <option value="Beta Release (Web)">Beta Release (Web)</option>
                    </select>
                  </td>
                  <td style={{ border: "1px solid #ccc", padding: 8 }}>
                    <input
                      type="text"
                      value={item.commentArea}
                      onChange={(e) => {
                        const newValue = e.target.value;
                        setPhases(prevPhases =>
                          prevPhases.map(p => ({
                            ...p,
                            items: p.items.map(i =>
                              i.id === item.id ? { ...i, commentArea: newValue } : i
                            )
                          }))
                        );
                        debouncedUpdatePhaseItem(item.id, phase.name, { ...item, commentArea: newValue });
                      }}
                      style={{ width: "100%", padding: 4 }}
                    />
                  </td>
                  <td style={{ border: "1px solid #ccc", padding: 8 }}>
                    <select
                      value={item.assigned_to}
                      onChange={(e) => {
                        const newValue = e.target.value;
                        setPhases(prevPhases =>
                          prevPhases.map(p => ({
                            ...p,
                            items: p.items.map(i =>
                              i.id === item.id ? { ...i, assigned_to: newValue } : i
                            )
                          }))
                        );
                        debouncedUpdatePhaseItem(item.id, phase.name, { ...item, assigned_to: newValue });
                      }}
                      style={{ width: "100%", padding: 4 }}
                    >
                      <option value="team">team</option>
                      {team.map((member) => (
                        <option key={member.id} value={member.username}>{member.username}</option>
                      ))}
                    </select>
                  </td>
                  <td style={{ border: "1px solid #ccc", padding: 8 }}>
                    <button
                      onClick={() => deletePhaseItem(item.id)}
                      style={{ background: "#ef4444", color: "white", border: "none", borderRadius: 4, padding: 4, cursor: "pointer" }}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}

      {/* Add Team Member */}
      <h2 style={{ fontSize: 20, fontWeight: "bold", marginBottom: 8 }}>Add Team Member</h2>
      <div style={{ display: "flex", gap: 8, marginBottom: 32 }}>
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
        <button
          onClick={addTeamMember}
          style={{ background: "#3b82f6", color: "white", padding: "8px 16px", borderRadius: 4, border: "none", cursor: "pointer" }}
        >
          Add
        </button>
      </div>
    </div>
  );
}

export default App;