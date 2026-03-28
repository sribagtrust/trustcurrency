import { useState, useEffect } from 'react';
import apiClient from '../utils/apiClient';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle, Users, Clock, Eye, AlertCircle, LayoutDashboard, List, UserPlus } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5005';

function AdminDashboard() {
  const [requests, setRequests] = useState([]);
  const [stats, setStats] = useState(null);
  const [allUsers, setAllUsers] = useState([]); 
  const [message, setMessage] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  
  const [activeTab, setActiveTab] = useState('overview'); 
  
  const [addUserName, setAddUserName] = useState('');
  const [addUserPhone, setAddUserPhone] = useState('');
  const [addUserEmail, setAddUserEmail] = useState('');
  const [addUserPassword, setAddUserPassword] = useState('');
  const [addUserMessage, setAddUserMessage] = useState('');
  const [addUserError, setAddUserError] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchAdminData = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      try {
        const [requestsRes, statsRes, usersRes] = await Promise.all([
          apiClient.get('/api/admin/pending-requests'),
          apiClient.get('/api/admin/dashboard-stats'),
          apiClient.get('/api/admin/users')
        ]);
        
        setRequests(requestsRes.data);
        setStats(statsRes.data);
        setAllUsers(usersRes.data);
      } catch {
        setMessage("Failed to load Admin Data. Ensure you are logged in as Admin.");
      }
    };

    fetchAdminData();
  }, [navigate]);

  const handleResolve = async (id, action) => {
    try {
      const response = await apiClient.post(`/api/admin/resolve-request/${id}`, 
        { action: action }
      );
      
      setMessage(response.data.message);
      setRequests(requests.filter(req => req._id !== id));
      if (action === 'Approve') {
        setStats(prev => ({ ...prev, pendingCount: prev.pendingCount - 1 }));
        const usersRes = await apiClient.get('/api/admin/users');
        setAllUsers(usersRes.data);
      } else {
        setStats(prev => ({ ...prev, pendingCount: prev.pendingCount - 1 }));
      }
    } catch (err) {
      alert("Error resolving request: " + (err.response?.data?.message || err.message));
    }
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    setAddUserMessage('');
    setAddUserError(false);

    try {
      const response = await apiClient.post('/api/admin/add-user', {
        name: addUserName,
        phone: addUserPhone,
        email: addUserEmail,
        password: addUserPassword
      });

      setAddUserError(false);
      setAddUserMessage(response.data.message);
      
      setAddUserName(''); setAddUserPhone(''); setAddUserEmail(''); setAddUserPassword('');
      
      const usersRes = await apiClient.get('/api/admin/users');
      setAllUsers(usersRes.data);
      setStats(prev => ({ ...prev, totalUsers: prev.totalUsers + 1 }));

    } catch (err) {
      setAddUserError(true);
      setAddUserMessage(err.response?.data?.message || 'Failed to create user. Try again.');
    }
  };

  if (!stats) return <h2 style={{ textAlign: 'center', marginTop: '50px' }}>Loading Command Center...</h2>;

  const tabStyle = (tabName) => ({
    padding: '12px 24px',
    backgroundColor: activeTab === tabName ? '#007bff' : 'white',
    color: activeTab === tabName ? 'white' : '#6c757d',
    border: activeTab === tabName ? '1px solid #007bff' : '1px solid #dee2e6',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: 'bold',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    transition: 'all 0.2s ease'
  });

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1 style={{ color: '#333', margin: 0 }}>Admin Command Center</h1>
      </div>

      {message && <div style={{ padding: '15px', backgroundColor: '#d4edda', color: '#155724', borderRadius: '8px', marginBottom: '20px', fontWeight: 'bold' }}>{message}</div>}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '30px' }}>
        <div style={{ backgroundColor: 'white', padding: '25px', borderRadius: '15px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ backgroundColor: '#e9f2ff', padding: '15px', borderRadius: '50%' }}><Users size={32} color="#007bff" /></div>
          <div>
            <h3 style={{ margin: 0, color: '#6c757d', fontSize: '14px', textTransform: 'uppercase' }}>Total Users</h3>
            <p style={{ margin: 0, fontSize: '28px', fontWeight: 'bold', color: '#333' }}>{stats.totalUsers}</p>
          </div>
        </div>
        <div style={{ backgroundColor: 'white', padding: '25px', borderRadius: '15px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ backgroundColor: '#fff3cd', padding: '15px', borderRadius: '50%' }}><Clock size={32} color="#ffc107" /></div>
          <div>
            <h3 style={{ margin: 0, color: '#6c757d', fontSize: '14px', textTransform: 'uppercase' }}>Pending Approvals</h3>
            <p style={{ margin: 0, fontSize: '28px', fontWeight: 'bold', color: '#333' }}>{stats.pendingCount}</p>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '15px', marginBottom: '30px', flexWrap: 'wrap' }}>
        <button style={tabStyle('overview')} onClick={() => setActiveTab('overview')}>
          <LayoutDashboard size={20} /> Operations Overview
        </button>
        <button style={tabStyle('directory')} onClick={() => setActiveTab('directory')}>
          <List size={20} /> Master User Directory
        </button>
        <button style={tabStyle('adduser')} onClick={() => setActiveTab('adduser')}>
          <UserPlus size={20} /> Create New User
        </button>
      </div>

      {activeTab === 'overview' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', alignItems: 'start' }}>
          <div style={{ backgroundColor: 'white', padding: '25px', borderRadius: '15px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
            <h2 style={{ margin: '0 0 20px 0', borderBottom: '2px solid #f8f9fa', paddingBottom: '10px' }}>Review Queue</h2>
            {requests.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 0', color: '#6c757d' }}>
                <CheckCircle size={48} color="#28a745" style={{ marginBottom: '10px' }} />
                <h3>All caught up!</h3>
                <p>No pending recharge requests right now.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {requests.map(req => (
                  <div key={req._id} style={{ border: '1px solid #dee2e6', borderRadius: '10px', padding: '15px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f8f9fa', paddingBottom: '10px' }}>
                      <div>
                        <p style={{ margin: 0, fontWeight: 'bold', color: '#333', fontSize: '18px' }}>{req.user?.name || 'Unknown User'}</p>
                        <p style={{ margin: '5px 0 0 0', color: '#6c757d', fontSize: '14px' }}>📞 {req.user?.phone}</p>
                        <p style={{ margin: '5px 0 0 0', color: '#007bff', fontSize: '14px', fontWeight: 'bold' }}>ID: {req.user?.uniqueId}</p>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <p style={{ margin: 0, color: '#6c757d', fontSize: '12px', textTransform: 'uppercase' }}>Requested</p>
                        <p style={{ margin: 0, color: '#28a745', fontSize: '24px', fontWeight: 'bold' }}>{req.amountRequested} Currency</p>
                        <p style={{ margin: '5px 0 0 0', color: '#dc3545', fontSize: '12px', fontWeight: 'bold', backgroundColor: '#fff1f0', padding: '2px 6px', borderRadius: '4px', display: 'inline-block' }}>
                          UTR: {req.utrNumber || 'N/A'}
                        </p>
                      </div>
                    </div>
                    <div 
                      style={{ backgroundColor: '#f8f9fa', height: '150px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', border: '1px solid #ced4da', position: 'relative' }}
                      onClick={() => setSelectedImage(`${API_BASE_URL}${req.screenshotPath}`)}
                    >
                      <img src={`${API_BASE_URL}${req.screenshotPath}`} alt="Proof" style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.8 }} />
                      <div style={{ position: 'absolute', backgroundColor: 'rgba(0,0,0,0.6)', color: 'white', padding: '5px 15px', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '5px' }}><Eye size={16} /> Enlarge</div>
                    </div>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button onClick={() => handleResolve(req._id, 'Approve')} style={{ flex: 1, padding: '12px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>Approve</button>
                      <button onClick={() => handleResolve(req._id, 'Reject')} style={{ flex: 1, padding: '12px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>Reject</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div style={{ backgroundColor: 'white', padding: '25px', borderRadius: '15px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
            <h2 style={{ margin: '0 0 20px 0', borderBottom: '2px solid #f8f9fa', paddingBottom: '10px' }}>Currency Distribution History</h2>
            <div style={{ height: '400px', width: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.graphData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e0e0e0" />
                  <XAxis dataKey="day" axisLine={false} tickLine={false} />
                  <YAxis axisLine={false} tickLine={false} />
                  <Tooltip cursor={{ fill: '#f8f9fa' }} contentStyle={{ borderRadius: '8px', border: 'none' }} />
                  <Bar dataKey="coinsDistributed" fill="#007bff" radius={[4, 4, 0, 0]} name="Currency Distributed" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'directory' && (
        <div style={{ backgroundColor: 'white', padding: '25px', borderRadius: '15px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
          <h2 style={{ margin: '0 0 20px 0', borderBottom: '2px solid #f8f9fa', paddingBottom: '10px' }}>Master User Directory</h2>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ backgroundColor: '#f8f9fa', color: '#495057', fontSize: '14px', textTransform: 'uppercase' }}>
                  <th style={{ padding: '15px', borderBottom: '2px solid #dee2e6' }}>User Details</th>
                  <th style={{ padding: '15px', borderBottom: '2px solid #dee2e6' }}>Contact Info</th>
                  <th style={{ padding: '15px', borderBottom: '2px solid #dee2e6' }}>Agent (Referred By)</th>
                  <th style={{ padding: '15px', borderBottom: '2px solid #dee2e6' }}>Role</th>
                  <th style={{ padding: '15px', borderBottom: '2px solid #dee2e6' }}>Current Balance</th>
                </tr>
              </thead>
              <tbody>
                {allUsers.map((user, index) => (
                  <tr key={index} style={{ borderBottom: '1px solid #e9ecef', transition: 'background-color 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8f9fa'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}>
                    <td style={{ padding: '15px' }}>
                      <p style={{ margin: 0, fontWeight: 'bold', color: '#333', fontSize: '16px' }}>{user.name}</p>
                      <p style={{ margin: '5px 0 0 0', color: '#007bff', fontSize: '13px', fontWeight: 'bold' }}>ID: {user.uniqueId}</p>
                    </td>
                    <td style={{ padding: '15px', color: '#495057' }}>
                      <p style={{ margin: 0 }}>📞 {user.phone}</p>
                      {user.email && <p style={{ margin: '5px 0 0 0', fontSize: '13px' }}>✉️ {user.email}</p>}
                    </td>
                    <td style={{ padding: '15px' }}>
                      {user.referredBy ? (
                        <span style={{ color: '#007bff', fontWeight: 'bold', backgroundColor: '#e9f2ff', padding: '5px 10px', borderRadius: '5px' }}>
                          🔗 {user.referredBy}
                        </span>
                      ) : (
                        <span style={{ color: '#6c757d', fontStyle: 'italic' }}>None (Direct)</span>
                      )}
                    </td>
                    <td style={{ padding: '15px' }}>
                      <span style={{ 
                        backgroundColor: user.role === 'admin' ? '#ffeeba' : '#e9ecef', 
                        color: user.role === 'admin' ? '#856404' : '#495057', 
                        padding: '5px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase' 
                      }}>
                        {user.role || 'User'}
                      </span>
                    </td>
                    <td style={{ padding: '15px', fontWeight: 'bold', fontSize: '18px', color: '#28a745' }}>
                      {user.walletBalance} Currency
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'adduser' && (
        <div style={{ backgroundColor: 'white', padding: '25px', borderRadius: '15px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', maxWidth: '600px', margin: '0 auto' }}>
          <h2 style={{ margin: '0 0 20px 0', borderBottom: '2px solid #f8f9fa', paddingBottom: '10px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <UserPlus size={24} color="#007bff" /> Register New Account
          </h2>
          
          {addUserMessage && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '15px', marginBottom: '20px', backgroundColor: addUserError ? '#f8d7da' : '#d4edda', color: addUserError ? '#721c24' : '#155724', borderRadius: '8px', fontSize: '14px', fontWeight: 'bold' }}>
              {addUserError ? <AlertCircle size={20} /> : <CheckCircle size={20} />}
              {addUserMessage}
            </div>
          )}

          <form onSubmit={handleAddUser} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#495057', fontSize: '14px' }}>Full Name</label>
              <input type="text" value={addUserName} onChange={(e) => setAddUserName(e.target.value)} required style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ced4da', boxSizing: 'border-box' }} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#495057', fontSize: '14px' }}>Phone Number</label>
              <input type="tel" value={addUserPhone} onChange={(e) => setAddUserPhone(e.target.value)} required style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ced4da', boxSizing: 'border-box' }} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#495057', fontSize: '14px' }}>Email Address (Optional)</label>
              <input type="email" value={addUserEmail} onChange={(e) => setAddUserEmail(e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ced4da', boxSizing: 'border-box' }} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#495057', fontSize: '14px' }}>Initial Password</label>
              <input type="password" value={addUserPassword} onChange={(e) => setAddUserPassword(e.target.value)} required minLength="6" style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ced4da', boxSizing: 'border-box' }} />
            </div>
            <button type="submit" style={{ width: '100%', padding: '15px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', fontSize: '16px', cursor: 'pointer', marginTop: '10px' }}>
              Create User Instantly
            </button>
          </form>
        </div>
      )}

      {selectedImage && (
        <div onClick={() => setSelectedImage(null)} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.9)', zIndex: 1000, display: 'flex', justifyContent: 'center', alignItems: 'center', cursor: 'zoom-out' }}>
          <img src={selectedImage} alt="Enlarged Proof" style={{ maxWidth: '90%', maxHeight: '90%', borderRadius: '10px' }} />
        </div>
      )}

    </div>
  );
}

export default AdminDashboard;