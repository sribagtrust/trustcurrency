import { useState, useEffect } from 'react';
import apiClient from '../utils/apiClient';
import { useNavigate } from 'react-router-dom';
import { User, CheckCircle, AlertCircle, Lock } from 'lucide-react';

function EditProfile() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState(''); // Read-only
  const [uniqueId, setUniqueId] = useState(''); // Read-only
  
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const navigate = useNavigate();

  // Load their current data when the page opens
  useEffect(() => {
    const fetchUserData = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }
      try {
        const response = await apiClient.get('/api/wallet/dashboard-data');
        setName(response.data.name || '');
        setEmail(response.data.email || '');
        setPhone(response.data.phone || '');
        setUniqueId(response.data.uniqueId || '');
      } catch (err) {
        console.error("Failed to load profile data:", err);  // Fixed: Now using 'err' by logging it
      }
    };
    fetchUserData();
  }, [navigate]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setMessage('');
    setIsError(false);

    const token = localStorage.getItem('token');
    try {
      const response = await apiClient.put('/api/auth/profile', 
        { name, email }
      );
      
      setIsError(false);
      setMessage(response.data.message);
      
      // Send them back to dashboard after 2 seconds to see the changes!
      setTimeout(() => navigate('/dashboard'), 2000);
      
    } catch (err) {
      setIsError(true);
      setMessage(err.response?.data?.message || 'Failed to update profile.');
    }
  };

  return (
    <div style={{ padding: '40px', maxWidth: '600px', margin: '0 auto', fontFamily: 'sans-serif', backgroundColor: 'white', borderRadius: '15px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
      
      <button 
        onClick={() => navigate('/dashboard')}
        style={{ marginBottom: '20px', padding: '10px 15px', cursor: 'pointer', backgroundColor: '#f8f9fa', color: '#495057', border: '1px solid #ced4da', borderRadius: '8px', fontWeight: 'bold' }}
      >
        ← Back to Dashboard
      </button>

      <div style={{ textAlign: 'center', marginBottom: '30px' }}>
        <div style={{ display: 'inline-block', backgroundColor: '#e9f2ff', padding: '15px', borderRadius: '50%', marginBottom: '10px' }}>
          <User size={40} color="#007bff" />
        </div>
        <h2 style={{ margin: 0, color: '#333' }}>Edit Profile</h2>
        <p style={{ color: '#6c757d', marginTop: '10px' }}>Update your personal details below.</p>
      </div>

      {message && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '15px', marginBottom: '25px', backgroundColor: isError ? '#f8d7da' : '#d4edda', color: isError ? '#721c24' : '#155724', borderRadius: '8px', fontWeight: 'bold' }}>
          {isError ? <AlertCircle size={24} /> : <CheckCircle size={24} />}
          {message}
        </div>
      )}

      <form onSubmit={handleUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        
        {/* Editable Fields */}
        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#495057' }}>Full Name</label>
          <input 
            type="text" 
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            style={{ width: '100%', padding: '15px', fontSize: '16px', borderRadius: '8px', border: '1px solid #ced4da', boxSizing: 'border-box' }}
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#495057' }}>Email Address (Optional)</label>
          <input 
            type="email" 
            placeholder="name@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{ width: '100%', padding: '15px', fontSize: '16px', borderRadius: '8px', border: '1px solid #ced4da', boxSizing: 'border-box' }}
          />
        </div>

        <hr style={{ border: 'none', borderTop: '1px solid #e9ecef', margin: '10px 0' }} />

        {/* Locked Fields */}
        <div>
          <label style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '8px', fontWeight: 'bold', color: '#6c757d' }}>
            <Lock size={14} /> Registered Phone Number
          </label>
          <input 
            type="text" 
            value={phone}
            disabled
            style={{ width: '100%', padding: '15px', fontSize: '16px', borderRadius: '8px', border: '1px solid #ced4da', backgroundColor: '#e9ecef', color: '#6c757d', boxSizing: 'border-box', cursor: 'not-allowed' }}
          />
        </div>

        <div>
          <label style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '8px', fontWeight: 'bold', color: '#6c757d' }}>
            <Lock size={14} /> Unique Account ID
          </label>
          <input 
            type="text" 
            value={uniqueId}
            disabled
            style={{ width: '100%', padding: '15px', fontSize: '16px', borderRadius: '8px', border: '1px solid #ced4da', backgroundColor: '#e9ecef', color: '#6c757d', boxSizing: 'border-box', cursor: 'not-allowed' }}
          />
        </div>

        <button 
          type="submit" 
          style={{ width: '100%', padding: '18px', fontSize: '18px', fontWeight: 'bold', cursor: 'pointer', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '8px', marginTop: '10px', boxShadow: '0 4px 6px rgba(0,123,255,0.2)' }}
        >
          Save Changes
        </button>
      </form>
    </div>
  );
}

export default EditProfile;