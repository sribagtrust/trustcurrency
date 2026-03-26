import { useState } from 'react';
import apiClient from '../utils/apiClient';
import { useNavigate, Link } from 'react-router-dom';
import { ShieldAlert, CheckCircle, AlertCircle } from 'lucide-react';

function ResetPassword() {
  const [phone, setPhone] = useState('');
  const [uniqueId, setUniqueId] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const navigate = useNavigate();

  const handleReset = async (e) => {
    e.preventDefault();
    setMessage('');
    setIsError(false);

    try {
      const response = await apiClient.post('/api/auth/reset-password', {
        phone,
        uniqueId,
        newPassword
      });

      setIsError(false);
      setMessage(response.data.message);
      
      // Auto-redirect to login after 3 seconds so they can log in!
      setTimeout(() => navigate('/login'), 3000);

    } catch (err) {
      setIsError(true);
      setMessage(err.response?.data?.message || 'Failed to reset password. Try again.');
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f4f7f6', fontFamily: 'sans-serif', padding: '20px' }}>
      <div style={{ backgroundColor: 'white', padding: '40px', borderRadius: '15px', boxShadow: '0 10px 25px rgba(0,0,0,0.05)', width: '100%', maxWidth: '400px' }}>
        
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <div style={{ display: 'inline-block', backgroundColor: '#fff3cd', padding: '15px', borderRadius: '50%', marginBottom: '15px' }}>
            <ShieldAlert size={40} color="#ffc107" />
          </div>
          <h2 style={{ margin: 0, color: '#333' }}>Account Recovery</h2>
          <p style={{ color: '#6c757d', marginTop: '10px', fontSize: '14px' }}>Verify your identity to reset your password.</p>
        </div>

        {message && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '15px', marginBottom: '20px', backgroundColor: isError ? '#f8d7da' : '#d4edda', color: isError ? '#721c24' : '#155724', borderRadius: '8px', fontSize: '14px', fontWeight: 'bold' }}>
            {isError ? <AlertCircle size={20} /> : <CheckCircle size={20} />}
            {message}
          </div>
        )}

        <form onSubmit={handleReset} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#495057', fontSize: '14px' }}>Registered Phone Number</label>
            <input 
              type="tel" 
              placeholder="e.g. 9876543210" 
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
              style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ced4da', boxSizing: 'border-box' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#495057', fontSize: '14px' }}>Unique Account ID</label>
            <input 
              type="text" 
              placeholder="e.g. SBGA-123456" 
              value={uniqueId}
              onChange={(e) => setUniqueId(e.target.value)}
              required
              style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ced4da', boxSizing: 'border-box', textTransform: 'uppercase' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#495057', fontSize: '14px' }}>Create New Password</label>
            <input 
              type="password" 
              placeholder="Minimum 6 characters" 
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              minLength="6"
              style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ced4da', boxSizing: 'border-box' }}
            />
          </div>

          <button 
            type="submit" 
            style={{ width: '100%', padding: '15px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', fontSize: '16px', cursor: 'pointer', marginTop: '10px' }}
          >
            Secure Reset
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <Link to="/login" style={{ color: '#6c757d', textDecoration: 'none', fontSize: '14px', fontWeight: 'bold' }}>
            ← Back to Login
          </Link>
        </div>

      </div>
    </div>
  );
}

export default ResetPassword;