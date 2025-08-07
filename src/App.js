import React, { useState, useEffect, useCallback } from 'react';
import Select from 'react-select';
import { CLIENTS } from './clientConfig';

// Browser history management
const useBrowserHistory = () => {
  useEffect(() => {
    const handlePopState = (event) => {
      // Prevent the app from exiting when back button is pressed
      event.preventDefault();
      
      // If we're on the main app and back is pressed, stay on the app
      if (window.location.pathname === '/leeprojstatus/' || window.location.pathname === '/') {
        window.history.pushState(null, '', window.location.pathname);
      }
    };

    // Push initial state to prevent immediate back navigation
    window.history.pushState(null, '', window.location.pathname);
    
    window.addEventListener('popstate', handlePopState);
    
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);
};

// PHG Standard Template
const PHG_STANDARD_TEMPLATE = [
  {
    goal: "General Ledger Review",
    need: "",
    comments: "Audit the hospital's existing general ledger to verify account balances, identify errors, and ensure GAAP compliance.",
    execute: "One-Time",
    stage: "Outstanding",
    commentArea: "",
    assigned_to: "PHGHAS"
  },
  {
    goal: "Accrual Process Assessment",
    need: "",
    comments: "Evaluate current accrual methods for revenue (e.g., unbilled patient services) and expenses (e.g., utilities, salaries) for accuracy and consistency.",
    execute: "One-Time",
    stage: "Outstanding",
    commentArea: "",
    assigned_to: "PHGHAS"
  },
  {
    goal: "Chart of Accounts Validation",
    need: "",
    comments: "Review and align the hospital's chart of accounts to ensure proper categorization for journal entries and financial reporting.",
    execute: "One-Time",
    stage: "Outstanding",
    commentArea: "",
    assigned_to: "PHGHAS"
  },
  {
    goal: "Prior Period Entry Analysis",
    need: "",
    comments: "Examine historical journal entries to identify recurring issues or misclassifications, preparing correcting entries as needed.",
    execute: "One-Time",
    stage: "Outstanding",
    commentArea: "",
    assigned_to: "PHGHAS"
  },
  {
    goal: "Financial Statement Baseline Review",
    need: "",
    comments: "Assess prior financial statements (balance sheet, income statement, cash flow statement) to establish a baseline for ongoing preparation and ensure compliance with GAAP and HIPAA.",
    execute: "One-Time",
    stage: "Outstanding",
    commentArea: "",
    assigned_to: "PHGHAS"
  },
  {
    goal: "Revenue Accrual Entries",
    need: "",
    comments: "Post journal entries for accrued revenue from unbilled patient services, using patient encounter data and estimated insurance reimbursements.",
    execute: "Weekly",
    stage: "Outstanding",
    commentArea: "",
    assigned_to: "PHGHAS"
  },
  {
    goal: "Expense Accrual Entries",
    need: "",
    comments: "Record accrued expenses for incurred but unpaid costs (e.g., utilities, vendor services) based on historical data or pending invoices.",
    execute: "Weekly",
    stage: "Outstanding",
    commentArea: "",
    assigned_to: "PHGHAS"
  },
  {
    goal: "Cash Receipt Journal Entries",
    need: "",
    comments: "Log journal entries for cash receipts from patients or insurers, debiting cash and crediting revenue or accounts receivable.",
    execute: "Weekly",
    stage: "Outstanding",
    commentArea: "",
    assigned_to: "PHGHAS"
  },
  {
    goal: "Preliminary Journal Review",
    need: "",
    comments: "Review weekly journal entries for correct account coding, completeness, and supporting documentation (e.g., payment records).",
    execute: "Weekly",
    stage: "Outstanding",
    commentArea: "",
    assigned_to: "PHGHAS"
  },
  {
    goal: "Adjusting Entry Corrections",
    need: "",
    comments: "Prepare and post adjusting entries to correct errors or discrepancies identified during weekly general ledger reviews.",
    execute: "Weekly",
    stage: "Outstanding",
    commentArea: "",
    assigned_to: "PHGHAS"
  },
  {
    goal: "Month-End Accrual Finalization",
    need: "",
    comments: "Finalize and post accrual entries for revenue (e.g., unbilled procedures, pending claims) and expenses (e.g., salaries, leases) to align with GAAP.",
    execute: "Monthly",
    stage: "Outstanding",
    commentArea: "",
    assigned_to: "PHGHAS"
  },
  {
    goal: "Depreciation Journal Entries",
    need: "",
    comments: "Record monthly depreciation entries for hospital assets (e.g., medical equipment, facilities) using established schedules.",
    execute: "Monthly",
    stage: "Outstanding",
    commentArea: "",
    assigned_to: "PHGHAS"
  },
  {
    goal: "Prepaid Expense Amortization",
    need: "",
    comments: "Post journal entries to amortize prepaid expenses (e.g., insurance, software licenses) over their applicable periods.",
    execute: "Monthly",
    stage: "Outstanding",
    commentArea: "",
    assigned_to: "PHGHAS"
  },
  {
    goal: "Financial Statement Preparation",
    need: "",
    comments: "Prepare monthly financial statements (balance sheet, income statement, cash flow statement) using journal entry data, ensuring accuracy and GAAP compliance.",
    execute: "Monthly",
    stage: "Outstanding",
    commentArea: "",
    assigned_to: "PHGHAS"
  },
  {
    goal: "Comprehensive Ledger and Financial Review",
    need: "",
    comments: "Conduct a detailed review of all monthly journal entries and financial statements, verifying accuracy, accrual integrity, and compliance with GAAP and HIPAA.",
    execute: "Monthly",
    stage: "Outstanding",
    commentArea: "",
    assigned_to: "PHGHAS"
  },
  {
    goal: "Accrual Reversal Entries",
    need: "",
    comments: "Post reversing entries for prior month's accruals (e.g., paid invoices, settled claims) to prevent double-counting in the ledger.",
    execute: "Monthly",
    stage: "Outstanding",
    commentArea: "",
    assigned_to: "PHGHAS"
  }
];

// Test Users Configuration
const TEST_USERS = {
  'lee': {
    password: '1234',
    name: 'Lee',
    role: 'client',
    clientId: 'abc-hospital',
    org: 'ABC Hospital'
  },
  'admin': {
    password: '12345',
    name: 'Administrator',
    role: 'admin',
    org: 'PHG'
  }
};

// Set API base URL
const API_BASE_URL = 'https://has-status-backend.onrender.com';

// Helper functions
function getClientId() {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get('client') || 'demo';
}

// Login Component
function LoginPage({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    // Check if it's a standard user first
    const user = TEST_USERS[username.toLowerCase()];
    if (user && user.password === password) {
      onLogin(user);
      return;
    }

    // Check if it's a team member login
    try {
      const response = await fetch(`${API_BASE_URL}/api/internal-team/${username.toLowerCase()}`);
      if (response.ok) {
        const teamMember = await response.json();
        // For now, we'll use a simple password check
        // In production, this should be proper authentication
        if (password === '1234') { // Default password for team members
          onLogin({
            ...teamMember,
            type: 'team_member',
            assignedClients: teamMember.assignedClients
          });
          return;
        }
      }
    } catch (error) {
      console.error('Error checking team member:', error);
    }

    setError('Invalid username or password');
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '20px',
        padding: '40px',
        boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
        maxWidth: '400px',
        width: '100%',
        textAlign: 'center'
      }}>
        <h1 style={{ margin: '0 0 30px 0', color: '#1f2937' }}>HAS Status Report</h1>
        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: '20px' }}>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Username"
              style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '2px solid #e5e7eb' }}
              required
            />
          </div>
          <div style={{ marginBottom: '20px' }}>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '2px solid #e5e7eb' }}
              required
            />
          </div>
          {error && (
            <div style={{ color: 'red', marginBottom: '20px' }}>{error}</div>
          )}
          <button
            type="submit"
            style={{
              width: '100%',
              background: '#667eea',
              color: 'white',
              padding: '14px',
              borderRadius: '8px',
              border: 'none',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
          >
            Sign In
          </button>
        </form>
        <div style={{ marginTop: '30px', fontSize: '14px', color: '#6b7280' }}>
          <div><strong>Client:</strong> lee / 1234</div>
          <div><strong>Admin:</strong> admin / 12345</div>
        </div>
      </div>
    </div>
  );
}

// Admin Dashboard Component
function AdminDashboard({ currentUser, onLogout, setCurrentClientId, fetchPhases, fetchTeam }) {
  const [availableClients, setAvailableClients] = useState([]);
  const [showAddClient, setShowAddClient] = useState(false);
  const [showAdminControl, setShowAdminControl] = useState(false);
  const [showAdminControlLogin, setShowAdminControlLogin] = useState(false);
  const [newClient, setNewClient] = useState({ 
    id: '', 
    name: '', 
    color: '#2563eb',
    city: '',
    state: '',
    contactPerson: '',
    phoneNumber: ''
  });

  // Fetch available clients based on user type
  useEffect(() => {
    const fetchAvailableClients = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/clients`);
        if (response.ok) {
          const allClients = await response.json();
          
          // If user is a team member, filter by assigned clients
          if (currentUser.type === 'team_member' && currentUser.assignedClients) {
            const filteredClients = allClients.filter(client => 
              currentUser.assignedClients.includes(client.facCode)
            );
            setAvailableClients(filteredClients);
          } else {
            // Admin sees all clients
            setAvailableClients(allClients);
          }
        }
      } catch (error) {
        console.error('Error fetching clients:', error);
      }
    };

    fetchAvailableClients();
  }, [currentUser]);

  const handleAddClient = async () => {
    if (newClient.id && newClient.name) {
      try {
        const clientData = {
          clientId: newClient.id,
          name: newClient.name,
          color: newClient.color,
          city: newClient.city,
          state: newClient.state,
          contactPerson: newClient.contactPerson,
          phoneNumber: newClient.phoneNumber
        };
        
        const response = await fetch(`${API_BASE_URL}/api/clients`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(clientData)
        });
        
        if (response.ok) {
          alert(`New client "${newClient.name}" added successfully!`);
          setNewClient({ id: '', name: '', color: '#2563eb', city: '', state: '', contactPerson: '', phoneNumber: '' });
          setShowAddClient(false);
          window.location.reload();
        } else {
          alert('Error saving client. Please try again.');
        }
      } catch (error) {
        alert('Error saving client. Please try again.');
      }
    } else {
      alert('Please fill in all required fields.');
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
        color: 'white', 
        padding: '30px', 
        borderRadius: '15px', 
        marginBottom: '30px',
        textAlign: 'center'
      }}>
        <h1 style={{ margin: '0', fontSize: '2.5em' }}>🏥 HAS Status Report</h1>
        <h2 style={{ margin: '0', fontSize: '1.5em', opacity: 0.9 }}>
          {currentUser.type === 'team_member' ? 'Team Member Dashboard' : 'Client Management Dashboard'}
        </h2>
        <div style={{ marginTop: '20px' }}>
          <p style={{ margin: '0 0 5px 0', fontSize: '16px' }}>Welcome, {currentUser.name}</p>
          <button 
            onClick={onLogout}
            style={{
              background: 'rgba(255,255,255,0.2)',
              color: 'white',
              border: '1px solid rgba(255,255,255,0.3)',
              padding: '8px 16px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            Logout
          </button>
        </div>
      </div>

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
        gap: '20px',
        marginBottom: '30px'
      }}>
        {availableClients.map((client) => (
          <div key={client.facCode} style={{
            background: 'white',
            border: `3px solid ${client.color || '#2563eb'}`,
            borderRadius: '15px',
            padding: '25px',
            boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
            cursor: 'pointer'
          }}
          onClick={() => {
            setCurrentClientId(client.facCode);
            fetchPhases();
            fetchTeam();
          }}>
            <div style={{ fontSize: '3em', textAlign: 'center', marginBottom: '15px' }}>
              🏥
            </div>
            <h3 style={{ margin: '0 0 10px 0', color: client.color || '#2563eb', fontSize: '1.3em', textAlign: 'center' }}>
              {client.name}
            </h3>
            <div style={{ textAlign: 'center', marginBottom: '10px', fontSize: '12px', color: '#666' }}>
              <div>FAC: {client.facCode}</div>
              <div>{client.city}, {client.state}</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <button style={{
                background: client.color || '#2563eb',
                color: 'white',
                border: 'none',
                padding: '10px 20px',
                borderRadius: '8px',
                fontSize: '14px',
                cursor: 'pointer',
                fontWeight: 'bold'
              }}>
                View Status Report →
              </button>
            </div>
          </div>
        ))}
      </div>

      <div style={{ 
        background: '#f8f9fa', 
        padding: '20px', 
        borderRadius: '10px',
        border: '2px solid #e9ecef'
      }}>
        <h3 style={{ margin: '0 0 15px 0', color: '#495057' }}>🔧 Admin Actions</h3>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          {currentUser.type !== 'team_member' && (
            <button 
              onClick={() => setShowAdminControlLogin(true)}
              style={{
                background: '#dc2626',
                color: 'white',
                border: 'none',
                padding: '12px 20px',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 'bold'
              }}
            >
              ⚙️ Admin Control
            </button>
          )}
        </div>
      </div>

      {showAddClient && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'white',
            padding: '30px',
            borderRadius: '15px',
            maxWidth: '500px',
            width: '90%'
          }}>
            <h3 style={{ margin: '0 0 20px 0' }}>Add New Client</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Client ID:</label>
                <input
                  type="text"
                  value={newClient.id}
                  onChange={(e) => setNewClient({...newClient, id: e.target.value})}
                  placeholder="e.g., new-hospital"
                  style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Client Name:</label>
                <input
                  type="text"
                  value={newClient.name}
                  onChange={(e) => setNewClient({...newClient, name: e.target.value})}
                  placeholder="e.g., New Hospital Name"
                  style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                />
              </div>
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={handleAddClient}
                style={{
                  background: '#28a745',
                  color: 'white',
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: '6px',
                  cursor: 'pointer'
                }}
              >
                Add Client
              </button>
              <button
                onClick={() => setShowAddClient(false)}
                style={{
                  background: '#6c757d',
                  color: 'white',
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: '6px',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Admin Control Login Modal */}
      {showAdminControlLogin && (
        <AdminControlLogin
          onSuccess={() => {
            setShowAdminControlLogin(false);
            setShowAdminControl(true);
          }}
          onCancel={() => setShowAdminControlLogin(false)}
        />
      )}

      {/* Admin Control Panel */}
      {showAdminControl && (
        <AdminControlPanel
          onBack={() => setShowAdminControl(false)}
        />
      )}
    </div>
  );
}

// Admin Control Components
function AdminControlLogin({ onSuccess, onCancel }) {
  const [adminPassword, setAdminPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    // Admin password verification
    if (adminPassword === '12345') {
      onSuccess();
    } else {
      setError('Invalid admin password');
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{
        background: 'white',
        padding: '30px',
        borderRadius: '15px',
        maxWidth: '400px',
        width: '90%'
      }}>
        <h3 style={{ margin: '0 0 20px 0', textAlign: 'center' }}>🔐 Admin Control Access</h3>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              Admin Password:
            </label>
            <input
              type="password"
              value={adminPassword}
              onChange={(e) => setAdminPassword(e.target.value)}
              placeholder="Enter admin password"
              style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '2px solid #e5e7eb' }}
              required
            />
          </div>
          {error && (
            <div style={{ color: 'red', marginBottom: '20px', textAlign: 'center' }}>{error}</div>
          )}
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              type="submit"
              style={{
                flex: 1,
                background: '#667eea',
                color: 'white',
                border: 'none',
                padding: '12px',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: 'bold'
              }}
            >
              Access Admin Control
            </button>
            <button
              type="button"
              onClick={onCancel}
              style={{
                flex: 1,
                background: '#6c757d',
                color: 'white',
                border: 'none',
                padding: '12px',
                borderRadius: '8px',
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function AdminControlPanel({ onBack }) {
  const [activeTab, setActiveTab] = useState('clients');
  const [clients, setClients] = useState([]);
  const [internalTeam, setInternalTeam] = useState([]);
  const [showAddClient, setShowAddClient] = useState(false);
  const [showAddTeamMember, setShowAddTeamMember] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  const [newClient, setNewClient] = useState({
    clientCode: '',
    name: '',
    mainContact: '',
    phoneNumber: '',
    city: '',
    state: '',
    facCode: '',
    filePath: ''
  });
  const [newTeamMember, setNewTeamMember] = useState({
    name: '',
    email: '',
    teamName: 'PHG',
    assignedClients: []
  });

  // Fetch clients and team members on component mount
  useEffect(() => {
    fetchClients();
    fetchInternalTeam();
  }, []);

  const fetchClients = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/clients`);
      if (response.ok) {
        const data = await response.json();
        setClients(data);
      }
    } catch (error) {
      console.error('Error fetching clients:', error);
    }
  };

  const fetchInternalTeam = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/internal-team`);
      if (response.ok) {
        const data = await response.json();
        setInternalTeam(data);
      }
    } catch (error) {
      console.error('Error fetching internal team:', error);
    }
  };

  const handleAddClient = async () => {
    if (!newClient.facCode || !newClient.name) {
      alert('Please fill in Client Code and Client Name');
      return;
    }

    // Validate 3-character alphanumeric code
    if (!/^[A-Z0-9]{3}$/.test(newClient.facCode)) {
      alert('Client Code must be exactly 3 characters (letters and numbers only)');
      return;
    }

    try {
      const method = editingClient ? 'PUT' : 'POST';
      const url = editingClient 
        ? `${API_BASE_URL}/api/clients/${editingClient.facCode || editingClient.clientId || editingClient._id}`
        : `${API_BASE_URL}/api/clients`;

      const response = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newClient)
      });

      if (response.ok) {
        alert(editingClient ? 'Client updated successfully!' : 'Client added successfully!');
        setNewClient({
          name: '',
          mainContact: '',
          phoneNumber: '',
          city: '',
          state: '',
          facCode: '',
          filePath: ''
        });
        setEditingClient(null);
        setShowAddClient(false);
        fetchClients();
      } else {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.error || `HTTP ${response.status}: ${response.statusText}`;
        alert(editingClient ? `Error updating client: ${errorMessage}` : `Error adding client: ${errorMessage}`);
      }
    } catch (error) {
      alert(editingClient ? `Error updating client: ${error.message}` : `Error adding client: ${error.message}`);
    }
  };

  const handleEditClient = (client) => {
    setEditingClient(client);
    setNewClient({
      name: client.name,
      mainContact: client.mainContact || '',
      phoneNumber: client.phoneNumber || '',
      city: client.city || '',
      state: client.state || '',
      facCode: client.facCode,
      filePath: client.filePath || ''
    });
    setShowAddClient(true);
  };

  const handleCancelEdit = () => {
    setEditingClient(null);
    setNewClient({
      name: '',
      mainContact: '',
      phoneNumber: '',
      city: '',
      state: '',
      facCode: '',
      filePath: ''
    });
    setShowAddClient(false);
  };

  const handleAddTeamMember = async () => {
    if (!newTeamMember.name || !newTeamMember.email) {
      alert('Please fill in Name and Email');
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/internal-team`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTeamMember)
      });

      if (response.ok) {
        alert('Team member added successfully!');
        setNewTeamMember({
          name: '',
          email: '',
          teamName: 'PHG',
          assignedClients: []
        });
        setShowAddTeamMember(false);
        fetchInternalTeam();
      } else {
        alert('Error adding team member');
      }
    } catch (error) {
      alert('Error adding team member');
    }
  };

  const deleteClient = async (client) => {
    if (window.confirm('Are you sure you want to delete this client?')) {
      try {
        // Use facCode if available, otherwise use clientId, fallback to _id
        const clientIdentifier = client.facCode || client.clientId || client._id;
        const response = await fetch(`${API_BASE_URL}/api/clients/${clientIdentifier}`, {
          method: 'DELETE'
        });

        if (response.ok) {
          alert('Client deleted successfully!');
          fetchClients();
        } else {
          const errorData = await response.json().catch(() => ({}));
          const errorMessage = errorData.error || `HTTP ${response.status}: ${response.statusText}`;
          alert(`Error deleting client: ${errorMessage}`);
        }
      } catch (error) {
        alert(`Error deleting client: ${error.message}`);
      }
    }
  };

  const deleteTeamMember = async (memberId) => {
    if (window.confirm('Are you sure you want to delete this team member?')) {
      try {
        const response = await fetch(`${API_BASE_URL}/api/internal-team/${memberId}`, {
          method: 'DELETE'
        });

        if (response.ok) {
          alert('Team member deleted successfully!');
          fetchInternalTeam();
        } else {
          alert('Error deleting team member');
        }
      } catch (error) {
        alert('Error deleting team member');
      }
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '1400px', margin: '0 auto' }}>
      <div style={{ 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
        color: 'white', 
        padding: '30px', 
        borderRadius: '15px', 
        marginBottom: '30px',
        textAlign: 'center'
      }}>
        <h1 style={{ margin: '0', fontSize: '2.5em' }}>⚙️ Admin Control Panel</h1>
        <h2 style={{ margin: '0', fontSize: '1.5em', opacity: 0.9 }}>System Administration</h2>
        <div style={{ marginTop: '20px' }}>
          <button 
            onClick={onBack}
            style={{
              background: 'rgba(255,255,255,0.2)',
              color: 'white',
              border: '1px solid rgba(255,255,255,0.3)',
              padding: '8px 16px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            ← Back to Dashboard
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div style={{ 
        display: 'flex', 
        gap: '10px', 
        marginBottom: '30px',
        borderBottom: '2px solid #e5e7eb'
      }}>
        <button
          onClick={() => setActiveTab('clients')}
          style={{
            background: activeTab === 'clients' ? '#667eea' : '#f3f4f6',
            color: activeTab === 'clients' ? 'white' : '#374151',
            border: 'none',
            padding: '12px 24px',
            borderRadius: '8px 8px 0 0',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >
          🏢 Client Profiles
        </button>
        <button
          onClick={() => setActiveTab('team')}
          style={{
            background: activeTab === 'team' ? '#667eea' : '#f3f4f6',
            color: activeTab === 'team' ? 'white' : '#374151',
            border: 'none',
            padding: '12px 24px',
            borderRadius: '8px 8px 0 0',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >
          👥 Internal Team
        </button>
      </div>

      {/* Client Profiles Tab */}
      {activeTab === 'clients' && (
        <div>
          <div style={{ 
            background: '#f8f9fa', 
            padding: '20px', 
            borderRadius: '10px',
            border: '2px solid #e9ecef',
            marginBottom: '20px'
          }}>
            <h3 style={{ margin: '0 0 15px 0', color: '#495057' }}>🏢 Client Profile Management</h3>
            <button 
              onClick={() => setShowAddClient(true)}
              style={{
                background: '#28a745',
                color: 'white',
                border: 'none',
                padding: '12px 20px',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              ➕ Add New Client Profile
            </button>
          </div>

          {/* Client List */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', 
            gap: '20px' 
          }}>
            {clients.map(client => (
              <div key={client._id} style={{
                background: 'white',
                border: '2px solid #e5e7eb',
                borderRadius: '10px',
                padding: '20px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                  <h4 style={{ margin: 0, color: '#1f2937' }}>{client.name}</h4>
                  <div style={{ display: 'flex', gap: '5px' }}>
                    <button
                      onClick={() => handleEditClient(client)}
                      style={{
                        background: '#3b82f6',
                        color: 'white',
                        border: 'none',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '12px'
                      }}
                    >
                      ✏️ Edit
                    </button>
                    <button
                      onClick={() => deleteClient(client)}
                      style={{
                        background: '#ef4444',
                        color: 'white',
                        border: 'none',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '12px'
                      }}
                    >
                      🗑️ Delete
                    </button>
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '14px' }}>
                  <div><strong>Client Code:</strong> {client.clientCode}</div>
                  <div><strong>FAC Code:</strong> {client.facCode}</div>
                  <div><strong>Contact:</strong> {client.mainContact}</div>
                  <div><strong>Phone:</strong> {client.phoneNumber}</div>
                  <div><strong>Location:</strong> {client.city}, {client.state}</div>
                  <div><strong>File Path:</strong> {client.filePath}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Internal Team Tab */}
      {activeTab === 'team' && (
        <div>
          <div style={{ 
            background: '#f8f9fa', 
            padding: '20px', 
            borderRadius: '10px',
            border: '2px solid #e9ecef',
            marginBottom: '20px'
          }}>
            <h3 style={{ margin: '0 0 15px 0', color: '#495057' }}>👥 Internal Team Management</h3>
            <button 
              onClick={() => setShowAddTeamMember(true)}
              style={{
                background: '#28a745',
                color: 'white',
                border: 'none',
                padding: '12px 20px',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              ➕ Add New Team Member
            </button>
          </div>

          {/* Team Member List */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', 
            gap: '20px' 
          }}>
            {internalTeam.map(member => (
              <div key={member._id} style={{
                background: 'white',
                border: '2px solid #e5e7eb',
                borderRadius: '10px',
                padding: '20px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                  <h4 style={{ margin: 0, color: '#1f2937' }}>{member.name}</h4>
                  <button
                    onClick={() => deleteTeamMember(member._id)}
                    style={{
                      background: '#ef4444',
                      color: 'white',
                      border: 'none',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '12px'
                    }}
                  >
                    🗑️ Delete
                  </button>
                </div>
                <div style={{ fontSize: '14px', marginBottom: '10px' }}>
                  <div><strong>Email:</strong> {member.email}</div>
                  <div><strong>Team:</strong> {member.teamName}</div>
                  <div><strong>Assigned Clients:</strong> {member.assignedClients.join(', ') || 'None'}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add Client Modal */}
      {showAddClient && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'white',
            padding: '30px',
            borderRadius: '15px',
            maxWidth: '600px',
            width: '90%',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}>
            <h3 style={{ margin: '0 0 20px 0' }}>{editingClient ? 'Edit Client Profile' : 'Add New Client Profile'}</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Client Code *:</label>
                <input
                  type="text"
                  value={newClient.facCode}
                  onChange={(e) => setNewClient({...newClient, facCode: e.target.value.toUpperCase()})}
                  placeholder="e.g., ABC"
                  maxLength="3"
                  style={{ width: '60px', padding: '8px', borderRadius: '4px', border: '1px solid #ccc', textAlign: 'center' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Client Name *:</label>
                <input
                  type="text"
                  value={newClient.name}
                  onChange={(e) => setNewClient({...newClient, name: e.target.value})}
                  placeholder="e.g., ABC Hospital"
                  style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Main Contact:</label>
                <input
                  type="text"
                  value={newClient.mainContact}
                  onChange={(e) => setNewClient({...newClient, mainContact: e.target.value})}
                  placeholder="e.g., John Doe"
                  style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Phone Number:</label>
                <input
                  type="tel"
                  value={newClient.phoneNumber}
                  onChange={(e) => setNewClient({...newClient, phoneNumber: e.target.value})}
                  placeholder="e.g., (555) 123-4567"
                  style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>City:</label>
                <input
                  type="text"
                  value={newClient.city}
                  onChange={(e) => setNewClient({...newClient, city: e.target.value})}
                  placeholder="e.g., New York"
                  style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>State:</label>
                <input
                  type="text"
                  value={newClient.state}
                  onChange={(e) => setNewClient({...newClient, state: e.target.value})}
                  placeholder="e.g., NY"
                  style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>File Path:</label>
                <input
                  type="text"
                  value={newClient.filePath}
                  onChange={(e) => setNewClient({...newClient, filePath: e.target.value})}
                  placeholder="e.g., \\sharepoint\client-files\ABC"
                  style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                />
              </div>
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={handleAddClient}
                style={{
                  background: '#28a745',
                  color: 'white',
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: '6px',
                  cursor: 'pointer'
                }}
              >
                {editingClient ? 'Save Changes' : 'Save Client'}
              </button>
              <button
                onClick={handleCancelEdit}
                style={{
                  background: '#6c757d',
                  color: 'white',
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: '6px',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Team Member Modal */}
      {showAddTeamMember && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'white',
            padding: '30px',
            borderRadius: '15px',
            maxWidth: '500px',
            width: '90%'
          }}>
            <h3 style={{ margin: '0 0 20px 0' }}>Add New Team Member</h3>
            <div style={{ display: 'grid', gap: '15px', marginBottom: '15px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Name *:</label>
                <input
                  type="text"
                  value={newTeamMember.name}
                  onChange={(e) => setNewTeamMember({...newTeamMember, name: e.target.value})}
                  placeholder="e.g., John Doe"
                  style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Email *:</label>
                <input
                  type="email"
                  value={newTeamMember.email}
                  onChange={(e) => setNewTeamMember({...newTeamMember, email: e.target.value})}
                  placeholder="e.g., john.doe@phg.com"
                  style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Team Name:</label>
                <input
                  type="text"
                  value={newTeamMember.teamName}
                  onChange={(e) => setNewTeamMember({...newTeamMember, teamName: e.target.value})}
                  placeholder="PHG"
                  style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Assigned Clients:</label>
                <Select
                  isMulti
                  options={clients.map(client => ({ value: client.facCode, label: `${client.name} (${client.facCode})` }))}
                  value={newTeamMember.assignedClients.map(code => ({ value: code, label: code }))}
                  onChange={selected => setNewTeamMember({...newTeamMember, assignedClients: selected.map(opt => opt.value)})}
                  placeholder="Select clients..."
                  styles={{ menu: base => ({ ...base, zIndex: 9999 }) }}
                />
              </div>
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={handleAddTeamMember}
                style={{
                  background: '#28a745',
                  color: 'white',
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: '6px',
                  cursor: 'pointer'
                }}
              >
                Add Team Member
              </button>
              <button
                onClick={() => setShowAddTeamMember(false)}
                style={{
                  background: '#6c757d',
                  color: 'white',
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: '6px',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function App() {
  // Initialize browser history management
  useBrowserHistory();
  
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
    execute: "Monthly",
    stage: "Outstanding",
    commentArea: "",
    assigned_to: "team"
  });

  const [filterMember, setFilterMember] = useState([]);
  const [filterStatus, setFilterStatus] = useState([]);
  const [sortByStatus, setSortByStatus] = useState(false);
  
  // Login state
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  
  // Multi-tenant state
  const [currentClientId, setCurrentClientId] = useState(getClientId());
  
  // Mass update state
  const [selectedTasks, setSelectedTasks] = useState([]);
  
  // Unified mass update state
  const [isUnifiedMassUpdateMode, setIsUnifiedMassUpdateMode] = useState(false);
  const [unifiedMassUpdateData, setUnifiedMassUpdateData] = useState({
    stage: '',
    assigned_to: '',
    need: ''
  });
  
  // Bulk rule update state (removed - no longer used)
  
  // Edit team member state
  const [editingMember, setEditingMember] = useState(null);
  const [editMemberName, setEditMemberName] = useState('');
  const [editMemberEmail, setEditMemberEmail] = useState('');
  
  // Due date filter state
  const [filterDueDate, setFilterDueDate] = useState('');

  const fetchPhases = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/phases?clientId=${currentClientId}`);
      const data = await response.json();
      const phaseNames = ["Outstanding", "Review/Discussion", "In Process", "Resolved"];
      const grouped = phaseNames.map(name => ({
        name,
        items: data.filter(item => item.stage === name)
      }));
      setPhases(grouped);
    } catch (error) {
      console.error('Error fetching phases:', error);
      setPhases([]);
    }
  }, [currentClientId]);

  const fetchTeam = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/team?clientId=${currentClientId}`);
      const data = await response.json();
      setTeam(data);
    } catch (error) {
      console.error('Error fetching team:', error);
      setTeam([]);
    }
  }, [currentClientId]);

  useEffect(() => {
    fetchPhases();
    fetchTeam();
  }, [fetchPhases, fetchTeam]);

  const addTeamMember = async () => {
    if (!username || !email) {
      alert("Please enter a valid username and email");
      return;
    }
    
    const clientOrg = CLIENTS[currentClientId]?.name || 'PHG';
    const finalOrg = org === 'PHG' ? 'PHG' : clientOrg;
    
    const body = { username, email, org: finalOrg, clientId: currentClientId };
    try {
      const response = await fetch(`${API_BASE_URL}/api/invite`, {
        method: "POST", 
        headers: { "Content-Type": "application/json" }, 
        body: JSON.stringify(body)
      });
      
      if (response.ok) {
        fetchTeam();
        setUsername("");
        setEmail("");
        setOrg("PHG");
      } else {
        alert("Error adding team member");
      }
    } catch (error) {
      alert("Error adding team member");
    }
  };

  const deleteTeamMember = async (memberId) => {
    // Find the team member to delete
    const memberToDelete = team.find(m => m._id === memberId);
    if (!memberToDelete) {
      alert("Team member not found");
      return;
    }

    // Check if member has any assigned tasks
    const allTasks = phases.flatMap(phase => phase.items);
    const memberTasks = allTasks.filter(task => task.assigned_to === memberToDelete.username);
    
    if (memberTasks.length > 0) {
      alert(`Cannot delete team member. They have ${memberTasks.length} assigned task(s). Please reassign tasks first.`);
      return;
    }

    if (!window.confirm(`Are you sure you want to delete ${memberToDelete.username}?`)) {
      return;
    }
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/team/${memberId}?clientId=${currentClientId}&performedBy=${currentUser?.username || 'admin'}`, {
        method: "DELETE"
      });
      
      if (response.ok) {
        fetchTeam();
        alert("Team member deleted successfully.");
      } else {
        const errorData = await response.json();
        alert(`Error deleting team member: ${errorData.error || 'Unknown error'}`);
      }
    } catch (error) {
      alert("Error deleting team member");
    }
  };

  const markTeamMemberAsNotWorking = async (memberId) => {
    if (!window.confirm("Are you sure you want to mark this team member as 'Not Working'? This will reassign their tasks to 'PHG'.")) {
      return;
    }
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/team/${memberId}?clientId=${currentClientId}&reassign_to=PHG&performedBy=${currentUser?.username || 'admin'}`, {
        method: "PUT"
      });
      
      if (response.ok) {
        fetchTeam();
        fetchPhases(); // Refresh phases to show reassigned tasks
        alert("Team member marked as 'Not Working'. Their tasks have been reassigned to PHG.");
      } else {
        const errorData = await response.json();
        alert(`Error marking team member as not working: ${errorData.error || 'Unknown error'}`);
      }
    } catch (error) {
      alert("Error marking team member as not working");
    }
  };

  const editTeamMember = async (memberId) => {
    const member = team.find(m => m._id === memberId);
    if (!member) return;
    
    setEditingMember(member);
    setEditMemberName(member.username);
    setEditMemberEmail(member.email);
  };

  const saveTeamMemberEdit = async () => {
    if (!editMemberName || !editMemberEmail) {
      alert("Please enter both name and email");
      return;
    }
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/team/${editingMember._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: editMemberName,
          email: editMemberEmail,
          clientId: currentClientId
        })
      });
      
      if (response.ok) {
        fetchTeam();
        setEditingMember(null);
        setEditMemberName('');
        setEditMemberEmail('');
        alert("Team member updated successfully");
      } else {
        alert("Error updating team member");
      }
    } catch (error) {
      alert("Error updating team member");
    }
  };

  const cancelTeamMemberEdit = () => {
    setEditingMember(null);
    setEditMemberName('');
    setEditMemberEmail('');
  };



  const addNewTask = async (taskData = null) => {
    const task = taskData || newTask;
    if (!task.goal) {
      alert("Please enter a goal");
      return;
    }
    const taskWithClient = { ...task, clientId: currentClientId };
    try {
      const response = await fetch(`${API_BASE_URL}/api/phases`, {
        method: "POST", 
        headers: { "Content-Type": "application/json" }, 
        body: JSON.stringify(taskWithClient)
      });
      
      if (response.ok) {
        fetchPhases();
        setNewTask({
          phase: "Outstanding",
          goal: "",
          need: "",
          comments: "",
          execute: "Monthly",
          stage: "Outstanding",
          commentArea: "",
          assigned_to: "team"
        });
      } else {
        alert("Error adding task");
      }
    } catch (error) {
      alert("Error adding task");
    }
  };

  const updatePhaseItem = async (id, phase, updatedItem) => {
    const allItems = phases.flatMap(p => p.items);
    const original = allItems.find(i => i.id === id || i._id === id);
    if (!original) return;
    const merged = { ...original, ...updatedItem };
    try {
      await fetch(`${API_BASE_URL}/api/phases/${id}`, {
        method: "PUT", 
        headers: { "Content-Type": "application/json" }, 
        body: JSON.stringify({ ...merged, phase: merged.stage || phase })
      });
      fetchPhases();
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const deletePhaseItem = async (id) => {
    try {
      await fetch(`${API_BASE_URL}/api/phases/${id}?clientId=${currentClientId}&performedBy=${currentUser?.username || 'admin'}`, {
        method: "DELETE"
      });
      fetchPhases();
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  const handleLogin = (user) => {
    setCurrentUser(user);
    setIsLoggedIn(true);
    
    if (user.role === 'client') {
      setCurrentClientId(user.clientId);
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setIsLoggedIn(false);
    setCurrentClientId('demo');
    setTeam([]);
    setPhases([]);
  };

  // Template and mass update functions
  const applyPHGStandardTemplate = async () => {
    if (window.confirm('Apply PHG Standard Template to current client?')) {
      try {
        // Ensure PHGHAS team member exists
        const phghasMemberExists = team.some(member => member.username === 'PHGHAS');
        if (!phghasMemberExists) {
          // Create PHGHAS team member
          await fetch(`${API_BASE_URL}/api/invite`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              username: 'PHGHAS',
              email: 'phghas@phg.com',
              org: 'PHG',
              clientId: currentClientId
            })
          });
          fetchTeam(); // Refresh team list
        }
        
        for (const task of PHG_STANDARD_TEMPLATE) {
          const taskWithClient = { 
            ...task, 
            clientId: currentClientId,
            assigned_to: 'PHGHAS', // Always assign to PHGHAS team member
            stage: 'Outstanding' // Ensure status is Outstanding
          };
          await fetch(`${API_BASE_URL}/api/phases`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(taskWithClient)
          });
        }
        fetchPhases();
        alert('PHG Standard Template applied successfully!');
      } catch (error) {
        alert('Error applying template');
      }
    }
  };



  const clearAllTasksForClient = async () => {
    const password = prompt('Enter admin password to clear all tasks:');
    if (password === '12345') {
      if (window.confirm('Are you sure you want to clear ALL tasks for this client?')) {
        try {
          const response = await fetch(`${API_BASE_URL}/api/phases?clientId=${currentClientId}`, {
            method: 'DELETE'
          });
          if (response.ok) {
            fetchPhases();
            alert('All tasks cleared successfully!');
          } else {
            alert('Error clearing tasks');
          }
        } catch (error) {
          alert('Error clearing tasks');
        }
      }
    } else {
      alert('Invalid password');
    }
  };

  const checkForDuplicateTemplate = async (templateTasks) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/phases?clientId=${currentClientId}`);
      const existingTasks = await response.json();
      
      const duplicateCount = templateTasks.filter(templateTask => 
        existingTasks.some(existingTask => 
          existingTask.goal === templateTask.goal &&
          existingTask.comments === templateTask.comments
        )
      ).length;
      
      if (duplicateCount > 0) {
        return window.confirm(`Found ${duplicateCount} duplicate tasks. Do you want to add them anyway?`);
      }
      return true;
    } catch (error) {
      console.error('Error checking for duplicates:', error);
      return true;
    }
  };

  // Enhanced mass update with bulk rules


  // Unified mass update function
  const unifiedMassUpdate = async () => {
    if (selectedTasks.length === 0) {
      alert('Please select at least one task');
      return;
    }
    
    // Check if at least one field has a value
    const hasChanges = unifiedMassUpdateData.stage || unifiedMassUpdateData.assigned_to || unifiedMassUpdateData.need;
    if (!hasChanges) {
      alert('Please select at least one field to update');
      return;
    }
    
    try {
      const updateData = {
        clientId: currentClientId,
        taskIds: selectedTasks
      };
      
      // Only include fields that have values
      if (unifiedMassUpdateData.stage) updateData.stage = unifiedMassUpdateData.stage;
      if (unifiedMassUpdateData.assigned_to) updateData.assigned_to = unifiedMassUpdateData.assigned_to;
      if (unifiedMassUpdateData.need) updateData.need = unifiedMassUpdateData.need;
      
      const response = await fetch(`${API_BASE_URL}/api/phases/unified-mass-update`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData)
      });
      
      if (response.ok) {
        fetchPhases();
        setIsUnifiedMassUpdateMode(false);
        setSelectedTasks([]);
        setUnifiedMassUpdateData({ stage: '', assigned_to: '', need: '' });
        alert('Tasks updated successfully!');
      } else {
        alert('Error updating tasks');
      }
    } catch (error) {
      alert('Error updating tasks');
    }
  };



  const toggleTaskSelection = (taskId) => {
    setSelectedTasks(prev => 
      prev.includes(taskId) 
        ? prev.filter(id => id !== taskId)
        : [...prev, taskId]
    );
  };

  const selectAllTasks = () => {
    const allTaskIds = phases.flatMap(phase => phase.items).map(task => task._id);
    setSelectedTasks(allTaskIds);
  };

  const clearTaskSelection = () => {
    setSelectedTasks([]);
  };

  // Template upload functionality
  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const content = e.target.result;
        const lines = content.split('\n').filter(line => line.trim());
        
        const templateTasks = [];
        for (let i = 0; i < lines.length; i += 6) {
          if (i + 5 < lines.length) {
            templateTasks.push({
              goal: lines[i] || '',
              need: lines[i + 1] || '',
              comments: lines[i + 2] || '',
              execute: lines[i + 3] || 'One-Time',
              stage: 'Outstanding',
              commentArea: lines[i + 4] || '',
              assigned_to: 'PHGHAS'
            });
          }
        }

        if (templateTasks.length > 0) {
          const isDuplicate = await checkForDuplicateTemplate(templateTasks);
          if (isDuplicate) {
            const confirmAdd = window.confirm("You already added this template, do you want to add again?");
            if (!confirmAdd) return;
          }

          for (const task of templateTasks) {
            await addNewTask(task);
          }
          alert(`Successfully uploaded ${templateTasks.length} tasks from template!`);
        }
      } catch (error) {
        alert('Error processing template file. Please check the format.');
      }
    };
    reader.readAsText(file);
  };

  // Show login page if not logged in
  if (!isLoggedIn) {
    return <LoginPage onLogin={handleLogin} />;
  }

  // Show admin dashboard if admin user and no specific client selected
  if (currentUser.role === 'admin' && currentClientId === 'demo') {
    return <AdminDashboard 
      currentUser={currentUser} 
      onLogout={handleLogout} 
      setCurrentClientId={setCurrentClientId}
      fetchPhases={fetchPhases}
      fetchTeam={fetchTeam}
    />;
  }

  // Get current client info
  const currentClient = CLIENTS[currentClientId] || CLIENTS['demo'];

  return (
    <div style={{ background: '#f9fafb', minHeight: '100vh' }}>
      <div style={{ 
        background: `linear-gradient(135deg, ${currentClient.color} 0%, ${currentClient.color}dd 100%)`, 
        color: 'white', 
        padding: '20px 32px', 
        marginBottom: '20px',
        borderRadius: '0 0 16px 16px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', maxWidth: 900, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <span style={{ fontSize: '2em' }}>{currentClient.logo}</span>
            <div>
              <h1 style={{ margin: '0', fontSize: '28px', fontWeight: 'bold' }}>{currentClient.name}</h1>
              <p style={{ margin: '5px 0 0 0', opacity: 0.9 }}>HAS Status Report</p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <div style={{ textAlign: 'right', marginRight: '10px' }}>
              <p style={{ margin: '0', fontSize: '14px', opacity: 0.9 }}>Welcome, {currentUser.name}</p>
              <p style={{ margin: '0', fontSize: '12px', opacity: 0.8 }}>{currentUser.org}</p>
            </div>
            {currentUser.role === 'admin' && (
              <button 
                onClick={() => {
                  setCurrentClientId('demo');
                  setTeam([]);
                  setPhases([]);
                }}
                style={{
                  background: 'rgba(255,255,255,0.2)',
                  color: 'white',
                  border: '1px solid rgba(255,255,255,0.3)',
                  padding: '8px 16px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: 'bold'
                }}
              >
                📋 Back to Dashboard
              </button>
            )}
            <button 
              onClick={handleLogout}
              style={{
                background: 'rgba(255,255,255,0.2)',
                color: 'white',
                border: '1px solid rgba(255,255,255,0.3)',
                padding: '8px 16px',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 'bold'
              }}
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      <div style={{ padding: 32, maxWidth: 900, margin: '0 auto' }}>
        <h1 style={{ fontSize: 32, fontWeight: 'bold', marginBottom: 24, textAlign: 'center', color: '#1f2937' }}>HAS Status</h1>

        <div style={{ marginBottom: 32, background: "#fff", padding: 16, borderRadius: 8, boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
          <h3 style={{ fontWeight: "bold", marginBottom: 8 }}>Add Team Member</h3>
          <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
            <input
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              onKeyPress={e => e.key === 'Enter' && addTeamMember()}
              placeholder="Username"
              style={{ padding: 8, borderRadius: 4, border: "1px solid #ccc", flex: 1 }}
            />
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              onKeyPress={e => e.key === 'Enter' && addTeamMember()}
              placeholder="Email"
              style={{ padding: 8, borderRadius: 4, border: "1px solid #ccc", flex: 1 }}
            />
            <select
              value={org}
              onChange={e => setOrg(e.target.value)}
              style={{ padding: 8, borderRadius: 4, border: "1px solid #ccc" }}
            >
              <option value="PHG">PHG</option>
              <option value={CLIENTS[currentClientId]?.name || 'Client'}>
                {CLIENTS[currentClientId]?.name || 'Client'}
              </option>
            </select>
            <button
              onClick={addTeamMember}
              style={{ background: "#3b82f6", color: "white", padding: "8px 20px", borderRadius: 4, border: "none", cursor: "pointer", fontWeight: "bold" }}
            >
              Add
            </button>
          </div>
          
          {/* Team Members Display */}
          {team.length > 0 && (
            <div style={{ marginTop: 16 }}>
              <h4 style={{ fontWeight: "bold", marginBottom: 8, fontSize: 14 }}>Current Team Members:</h4>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {team.map((member) => (
                  <div
                    key={member._id}
                    style={{
                      background: member.not_working ? "#fee2e2" : "#f3f4f6",
                      padding: "6px 12px",
                      borderRadius: 16,
                      fontSize: 12,
                      fontWeight: "bold",
                      color: member.not_working ? "#dc2626" : "#374151",
                      border: `1px solid ${member.not_working ? "#fca5a5" : "#d1d5db"}`,
                      display: "flex",
                      alignItems: "center",
                      gap: 8
                    }}
                  >
                    <span>{member.username} ({member.org}){member.not_working ? " - Not Working" : ""}</span>
                    {!member.not_working && (
                      <>
                        <button
                          onClick={() => editTeamMember(member._id)}
                          style={{
                            background: "#3b82f6",
                            color: "white",
                            border: "none",
                            borderRadius: "50%",
                            width: "16px",
                            height: "16px",
                            fontSize: "10px",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            padding: 0
                          }}
                          title="Edit team member"
                        >
                          ✏
                        </button>
                        <button
                          onClick={() => markTeamMemberAsNotWorking(member._id)}
                          style={{
                            background: "#f59e0b",
                            color: "white",
                            border: "none",
                            borderRadius: "50%",
                            width: "16px",
                            height: "16px",
                            fontSize: "10px",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            padding: 0
                          }}
                          title="Mark as Not Working"
                        >
                          ⚠
                        </button>
                        <button
                          onClick={() => deleteTeamMember(member._id)}
                          style={{
                            background: "#ef4444",
                            color: "white",
                            border: "none",
                            borderRadius: "50%",
                            width: "16px",
                            height: "16px",
                            fontSize: "10px",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            padding: 0
                          }}
                          title="Delete team member"
                        >
                          ×
                        </button>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Edit Team Member Modal */}
          {editingMember && (
            <div style={{ 
              position: 'fixed', 
              top: 0, 
              left: 0, 
              right: 0, 
              bottom: 0, 
              background: 'rgba(0,0,0,0.5)', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              zIndex: 1000
            }}>
              <div style={{ 
                background: 'white', 
                padding: '24px', 
                borderRadius: '8px', 
                minWidth: '400px',
                boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
              }}>
                <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: 'bold' }}>
                  Edit Team Member
                </h3>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '4px' }}>Name:</label>
                  <input
                    type="text"
                    value={editMemberName}
                    onChange={e => setEditMemberName(e.target.value)}
                    style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                  />
                </div>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '4px' }}>Email:</label>
                  <input
                    type="email"
                    value={editMemberEmail}
                    onChange={e => setEditMemberEmail(e.target.value)}
                    style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                  />
                </div>
                <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                  <button
                    onClick={cancelTeamMemberEdit}
                    style={{ 
                      background: '#6b7280', 
                      color: 'white', 
                      padding: '8px 16px', 
                      borderRadius: '4px', 
                      border: 'none', 
                      cursor: 'pointer' 
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={saveTeamMemberEdit}
                    style={{ 
                      background: '#22c55e', 
                      color: 'white', 
                      padding: '8px 16px', 
                      borderRadius: '4px', 
                      border: 'none', 
                      cursor: 'pointer' 
                    }}
                  >
                    Save
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Template Management Section */}
        <div style={{ marginBottom: 32, background: "#fff", padding: 20, borderRadius: 8, boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
          <h3 style={{ fontSize: 18, fontWeight: "bold", marginBottom: 16 }}>Template Management</h3>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <button
              onClick={applyPHGStandardTemplate}
              style={{ background: "#3b82f6", color: "white", padding: "10px 16px", borderRadius: 6, border: "none", cursor: "pointer", fontWeight: "bold" }}
            >
              📋 Apply PHG Standard Template
            </button>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <input
                type="file"
                accept=".txt"
                onChange={handleFileUpload}
                style={{ display: "none" }}
                id="template-upload"
              />
              <label
                htmlFor="template-upload"
                style={{ 
                  background: "#10b981", 
                  color: "white", 
                  padding: "10px 16px", 
                  borderRadius: 6, 
                  border: "none", 
                  cursor: "pointer", 
                  fontWeight: "bold",
                  display: "inline-block"
                }}
              >
                📁 Upload Template
              </label>
            </div>
          </div>
        </div>

        <div style={{ marginBottom: 32, background: "#fff", padding: 20, borderRadius: 8, boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
          <h3 style={{ fontSize: 18, fontWeight: "bold", marginBottom: 16 }}>Add New Task</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div>
              <label style={{ display: "block", fontWeight: "bold", marginBottom: 4 }}>Goal:</label>
              <input 
                name="goal" 
                value={newTask.goal} 
                onChange={e => setNewTask(prev => ({ ...prev, goal: e.target.value }))} 
                onKeyPress={e => e.key === 'Enter' && addNewTask()}
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
                onChange={e => setNewTask(prev => ({ ...prev, stage: e.target.value, phase: e.target.value }))} 
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
          <div style={{ minWidth: 220 }}>
            <label style={{ fontWeight: 'bold', marginRight: 8, display: 'block' }}>Filter by Due Date:</label>
            <input
              type="date"
              value={filterDueDate}
              onChange={e => setFilterDueDate(e.target.value)}
              placeholder="Select end date..."
              style={{ 
                width: '100%', 
                padding: '8px', 
                borderRadius: '4px', 
                border: '1px solid #ccc',
                height: '40px'
              }}
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
              setFilterDueDate('');
            }} 
            style={{ padding: '6px 16px', borderRadius: 4, border: '1px solid #ccc', background: '#ef4444', color: 'white', fontWeight: 'bold', cursor: 'pointer', height: 40, alignSelf: 'end' }}
          >
            Clear Filters
          </button>
        </div>

        {/* Mass Update Section - Moved below filters */}
        <div style={{ marginBottom: 32, background: "#fff", padding: 20, borderRadius: 8, boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
          <h3 style={{ fontSize: 18, fontWeight: "bold", marginBottom: 16 }}>Mass Update</h3>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 16 }}>
            <button
              onClick={() => setIsUnifiedMassUpdateMode(!isUnifiedMassUpdateMode)}
              style={{ background: "#3b82f6", color: "white", padding: "10px 16px", borderRadius: 6, border: "none", cursor: "pointer", fontWeight: "bold" }}
            >
              🔄 Mass Updates
            </button>
          </div>
          
          {/* Unified Mass Update Interface */}
          {isUnifiedMassUpdateMode && (
            <div style={{ marginTop: 16, padding: 16, background: "#eff6ff", borderRadius: 6, border: "1px solid #3b82f6" }}>
              <h4 style={{ margin: "0 0 12px 0", fontSize: 16, fontWeight: "bold", color: "#1e40af" }}>
                🔄 Unified Mass Updates
              </h4>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
                <div>
                  <label style={{ display: "block", fontWeight: "bold", marginBottom: 4, color: "#1e40af" }}>
                    Status:
                  </label>
                  <select
                    value={unifiedMassUpdateData.stage}
                    onChange={(e) => setUnifiedMassUpdateData(prev => ({ ...prev, stage: e.target.value }))}
                    style={{ width: "100%", padding: "6px 12px", borderRadius: 4, border: "1px solid #3b82f6" }}
                  >
                    <option value="">No change</option>
                    <option value="Outstanding">Outstanding</option>
                    <option value="Review/Discussion">Review/Discussion</option>
                    <option value="In Process">In Process</option>
                    <option value="Resolved">Resolved</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: "block", fontWeight: "bold", marginBottom: 4, color: "#1e40af" }}>
                    Assigned To:
                  </label>
                  <select
                    value={unifiedMassUpdateData.assigned_to}
                    onChange={(e) => setUnifiedMassUpdateData(prev => ({ ...prev, assigned_to: e.target.value }))}
                    style={{ width: "100%", padding: "6px 12px", borderRadius: 4, border: "1px solid #3b82f6" }}
                  >
                    <option value="">No change</option>
                    <option value="PHG">PHG</option>
                    <option value="team">team</option>
                    {team.map((member) => (
                      <option key={member.id} value={member.username}>{member.username}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ display: "block", fontWeight: "bold", marginBottom: 4, color: "#1e40af" }}>
                    ETC Date:
                  </label>
                  <input
                    type="date"
                    value={unifiedMassUpdateData.need}
                    onChange={(e) => setUnifiedMassUpdateData(prev => ({ ...prev, need: e.target.value }))}
                    style={{ width: "100%", padding: "6px 12px", borderRadius: 4, border: "1px solid #3b82f6" }}
                  />
                </div>
              </div>
              <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
                <button
                  onClick={selectAllTasks}
                  style={{ background: "#3b82f6", color: "white", padding: "6px 12px", borderRadius: 4, border: "none", cursor: "pointer", fontSize: 12 }}
                >
                  Select All Tasks
                </button>
                <button
                  onClick={clearTaskSelection}
                  style={{ background: "#6b7280", color: "white", padding: "6px 12px", borderRadius: 4, border: "none", cursor: "pointer", fontSize: 12 }}
                >
                  Clear Selection
                </button>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button
                  onClick={unifiedMassUpdate}
                  disabled={selectedTasks.length === 0}
                  style={{ 
                    background: selectedTasks.length > 0 ? "#059669" : "#9ca3af", 
                    color: "white", 
                    padding: "8px 16px", 
                    borderRadius: 4, 
                    border: "none", 
                    cursor: selectedTasks.length > 0 ? "pointer" : "not-allowed",
                    fontWeight: "bold"
                  }}
                >
                  Apply Updates ({selectedTasks.length} tasks)
                </button>
                <button
                  onClick={() => {
                    setIsUnifiedMassUpdateMode(false);
                    setSelectedTasks([]);
                    setUnifiedMassUpdateData({ stage: '', assigned_to: '', need: '' });
                  }}
                  style={{ background: "#ef4444", color: "white", padding: "8px 16px", borderRadius: 4, border: "none", cursor: "pointer", fontWeight: "bold" }}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>

        {phases.map((phase, phaseIdx) => {
          let items = phase.items;
          if (filterMember.length > 0) items = items.filter(i => filterMember.includes(i.assigned_to));
          if (filterStatus.length > 0) items = items.filter(i => filterStatus.includes(i.stage));
          
          // Filter by due date (ETC date)
          if (filterDueDate) {
            const filterDate = new Date(filterDueDate);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            
            items = items.filter(i => {
              if (!i.need) return false;
              const taskDate = new Date(i.need);
              return taskDate >= today && taskDate <= filterDate;
            });
          }
          
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
                      {(isUnifiedMassUpdateMode) && (
                        <th style={{ border: "1px solid #e5e7eb", padding: 8, width: "40px" }}>Select</th>
                      )}
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
                    <tr key={item._id}>
                      {(isUnifiedMassUpdateMode) && (
                        <td style={{ border: "1px solid #e5e7eb", padding: 8, textAlign: "center" }}>
                          <input
                            type="checkbox"
                            checked={selectedTasks.includes(item._id)}
                            onChange={() => toggleTaskSelection(item._id)}
                            style={{ width: "16px", height: "16px" }}
                          />
                        </td>
                      )}
                      <td style={{ border: "1px solid #e5e7eb", padding: 8 }}>
                        <input 
                          value={item.goal || ''} 
                          onChange={e => updatePhaseItem(item._id, phase.name, { goal: e.target.value })}
                          style={{ width: '100%', padding: 4, border: '1px solid #ddd', borderRadius: 4 }}
                        />
                      </td>
                      <td>
                        <input 
                          type="date" 
                          value={item.need || ""} 
                          onChange={e => updatePhaseItem(item._id, phase.name, { need: e.target.value })} 
                          style={{ width: '100%', padding: 4, border: '1px solid #ddd', borderRadius: 4 }}
                        />
                      </td>
                      <td style={{ border: "1px solid #e5e7eb", padding: 8 }}>
                        <input 
                          value={item.comments || ''} 
                          onChange={e => updatePhaseItem(item._id, phase.name, { comments: e.target.value })}
                          style={{ width: '100%', padding: 4, border: '1px solid #ddd', borderRadius: 4 }}
                        />
                      </td>
                      <td>
                        <select 
                          value={item.execute} 
                          onChange={e => updatePhaseItem(item._id, phase.name, { execute: e.target.value })}
                          style={{ width: '100%', padding: 4, border: '1px solid #ddd', borderRadius: 4 }}
                        >
                          <option value="Monthly">Monthly</option>
                          <option value="Weekly">Weekly</option>
                          <option value="One-Time">One-Time</option>
                        </select>
                      </td>
                      <td>
                        <select 
                          value={item.stage} 
                          onChange={e => updatePhaseItem(item._id, phase.name, { stage: e.target.value })}
                          style={{ width: '100%', padding: 4, border: '1px solid #ddd', borderRadius: 4 }}
                        >
                          <option value="Outstanding">Outstanding</option>
                          <option value="Review/Discussion">Review/Discussion</option>
                          <option value="In Process">In Process</option>
                          <option value="Resolved">Resolved</option>
                        </select>
                      </td>
                      <td style={{ border: "1px solid #e5e7eb", padding: 8 }}>
                        <input 
                          value={item.commentArea || ''} 
                          onChange={e => updatePhaseItem(item._id, phase.name, { commentArea: e.target.value })}
                          style={{ width: '100%', padding: 4, border: '1px solid #ddd', borderRadius: 4 }}
                        />
                      </td>
                      <td>
                        <select 
                          value={item.assigned_to} 
                          onChange={e => updatePhaseItem(item._id, phase.name, { assigned_to: e.target.value })}
                          style={{ width: '100%', padding: 4, border: '1px solid #ddd', borderRadius: 4 }}
                        >
                          <option value="team">team</option>
                          {team.map(member => (
                            <option key={member.id} value={member.username}>{member.username}</option>
                          ))}
                        </select>
                      </td>
                      <td>
                        <button 
                          onClick={() => deletePhaseItem(item._id)} 
                          style={{ background: '#ef4444', color: 'white', border: 'none', borderRadius: 4, padding: '4px 12px', fontWeight: 'bold', cursor: 'pointer' }}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        })}

        {/* Clear All Tasks Section - Added at the bottom */}
        {phases.some(phase => phase.items.length > 0) && (
          <div style={{ marginTop: 32, background: "#fff", padding: 20, borderRadius: 8, boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
            <h3 style={{ fontSize: 18, fontWeight: "bold", marginBottom: 16 }}>Task Management</h3>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <button
                onClick={clearAllTasksForClient}
                style={{ background: "#ef4444", color: "white", padding: "10px 16px", borderRadius: 6, border: "none", cursor: "pointer", fontWeight: "bold" }}
              >
                🗑️ Clear All Tasks
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App; 