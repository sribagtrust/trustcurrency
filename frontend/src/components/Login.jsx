import { useState } from 'react';
import apiClient from '../utils/apiClient';
import { useNavigate, Link } from 'react-router-dom';

function Login() {
  const [phone, setPhone] = useState(''); // 👈 Changed from email to phone
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await apiClient.post('/api/auth/login', {
        phone: phone,
        password: password
      });

      // 1. Save both the Token AND the User's Role to the browser
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('role', response.data.role || 'user'); 

      // 2. The Fork in the Road: Send Admins to the Admin Panel, Users to Dashboard
      if (response.data.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
      
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Try again.');
    }
  };

  return (
    <div style={{ padding: '50px', maxWidth: '400px', margin: '0 auto', textAlign: 'center', fontFamily: 'sans-serif' }}>
      <h2 style={{ color: '#333' }}>TrustCurrency Login</h2>
      
      {error && <p style={{ color: '#721c24', backgroundColor: '#f8d7da', padding: '10px', borderRadius: '5px' }}>{error}</p>}

      <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '20px' }}>
        <input 
          type="tel" 
          placeholder="Enter your phone number" 
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          required
          style={{ padding: '12px', fontSize: '16px', borderRadius: '8px', border: '1px solid #ccc' }}
        />
        <input 
          type="password" 
          placeholder="Enter your password" 
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={{ padding: '12px', fontSize: '16px', borderRadius: '8px', border: '1px solid #ccc' }}
        />
        <button type="submit" style={{ padding: '14px', fontSize: '16px', cursor: 'pointer', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold' }}>
          Secure Login
        </button>
      </form>

<div style={{ textAlign: 'center', marginBottom: '15px' }}>
  <Link to="/reset-password" style={{ color: '#dc3545', textDecoration: 'none', fontWeight: 'bold', fontSize: '14px' }}>
    Forgot Password?
  </Link>
</div>
      <div style={{ marginTop: '20px', fontSize: '14px', color: '#6c757d' }}>
        Don't have an account? <Link to="/register" style={{ color: '#007bff', textDecoration: 'none', fontWeight: 'bold' }}>Register here</Link>
      </div>
    </div>
  );
}

export default Login;