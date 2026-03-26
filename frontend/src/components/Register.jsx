import { useState } from 'react';
import apiClient from '../utils/apiClient';
import { useNavigate, Link } from 'react-router-dom';
import { CheckCircle, AlertCircle, UserPlus } from 'lucide-react';

function Register() {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState(''); // 👈 Added email state
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setMessage('');
    setIsError(false);

    try {
      await apiClient.post('/api/auth/register', {
        name,
        phone,
        email, // 👈 Sending email to backend
        password
      });

      setIsError(false);
      setMessage('New account has been registered successfully! Redirecting to login...');

      setName('');
      setPhone('');
      setEmail(''); // 👈 Clearing email box
      setPassword('');

      setTimeout(() => {
        navigate('/login');
      }, 1000);

    } catch (err) {
      setIsError(true);
      setMessage(err.response?.data?.message || 'Registration failed. Please try again.');
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f4f7f6', fontFamily: 'sans-serif', padding: '20px' }}>
      <div style={{ backgroundColor: 'white', padding: '40px', borderRadius: '15px', boxShadow: '0 10px 25px rgba(0,0,0,0.05)', width: '100%', maxWidth: '400px' }}>
        
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <div style={{ display: 'inline-block', backgroundColor: '#e9f2ff', padding: '15px', borderRadius: '50%', marginBottom: '15px' }}>
            <UserPlus size={40} color="#007bff" />
          </div>
          <h2 style={{ margin: 0, color: '#333' }}>Create Account</h2>
          <p style={{ color: '#6c757d', marginTop: '10px', fontSize: '14px' }}>Join the TrustCurrency network today.</p>
        </div>

        {message && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '15px', marginBottom: '20px', backgroundColor: isError ? '#f8d7da' : '#d4edda', color: isError ? '#721c24' : '#155724', borderRadius: '8px', fontSize: '14px', fontWeight: 'bold' }}>
            {isError ? <AlertCircle size={20} /> : <CheckCircle size={20} />}
            {message}
          </div>
        )}

        <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#495057', fontSize: '14px' }}>Full Name</label>
            <input 
              type="text" 
              placeholder="e.g. John Doe" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ced4da', boxSizing: 'border-box' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#495057', fontSize: '14px' }}>Phone Number</label>
            <input 
              type="tel" 
              placeholder="e.g. 9876543210" 
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
              style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ced4da', boxSizing: 'border-box' }}
            />
          </div>

          {/* 👇 Added the Optional Email Box 👇 */}
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#495057', fontSize: '14px' }}>Email Address (Optional)</label>
            <input 
              type="email" 
              placeholder="name@example.com" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ced4da', boxSizing: 'border-box' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#495057', fontSize: '14px' }}>Password</label>
            <input 
              type="password" 
              placeholder="Minimum 6 characters" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength="6"
              style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ced4da', boxSizing: 'border-box' }}
            />
          </div>

          <button 
            type="submit" 
            style={{ width: '100%', padding: '15px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', fontSize: '16px', cursor: 'pointer', marginTop: '10px' }}
          >
            Create Account
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <Link to="/login" style={{ color: '#6c757d', textDecoration: 'none', fontSize: '14px', fontWeight: 'bold' }}>
            Already have an account? <span style={{ color: '#007bff' }}>Login here</span>
          </Link>
        </div>

      </div>
    </div>
  );
}

export default Register;