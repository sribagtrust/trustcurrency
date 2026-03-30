import { useState } from 'react';
import apiClient from '../utils/apiClient';
import { useNavigate, Link } from 'react-router-dom';
import { CheckCircle, AlertCircle, UserPlus, Link as LinkIcon } from 'lucide-react';

function Register() {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const navigate = useNavigate();

  // Extract referral code from URL
  const queryParams = new URLSearchParams(window.location.search);
  const referralCode = queryParams.get('ref') || '';

  const handleRegister = async (e) => {
    e.preventDefault();
    setMessage('');
    setIsError(false);

    // 👇 STRICT 10-DIGIT CHECK APPLIED HERE 👇
    if (phone.length !== 10) {
      setIsError(true);
      setMessage('Phone number must be exactly 10 digits.');
      return;
    }

    try {
      await apiClient.post('/api/auth/register', {
        name,
        phone,
        email,
        password,
        referralCode
      });
      setIsError(false);
      setMessage('New account registered successfully! Redirecting to login...');
      setTimeout(() => navigate('/login'), 1500);
    } catch (err) {
      setIsError(true);
      setMessage(err.response?.data?.message || 'Registration failed.');
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f4f7f6', padding: '20px', fontFamily: 'sans-serif' }}>
      <div style={{ backgroundColor: 'white', padding: '40px', borderRadius: '15px', boxShadow: '0 10px 25px rgba(0,0,0,0.05)', width: '100%', maxWidth: '400px' }}>
        
        <div style={{ textAlign: 'center', marginBottom: '25px' }}>
          <div style={{ display: 'inline-block', backgroundColor: '#e9f2ff', padding: '15px', borderRadius: '50%', marginBottom: '15px' }}><UserPlus size={40} color="#007bff" /></div>
          <h2 style={{ margin: 0, color: '#333' }}>Create Account</h2>
        </div>

        {message && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '15px', marginBottom: '20px', backgroundColor: isError ? '#f8d7da' : '#d4edda', color: isError ? '#721c24' : '#155724', borderRadius: '8px', fontSize: '14px', fontWeight: 'bold' }}>
            {isError ? <AlertCircle size={20} /> : <CheckCircle size={20} />} {message}
          </div>
        )}

        <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          
          {/* If they have a referral link, show who invited them! */}
          {referralCode && (
            <div style={{ backgroundColor: '#fff3cd', padding: '10px 15px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px', color: '#856404', fontWeight: 'bold', fontSize: '14px', border: '1px solid #ffeeba' }}>
              <LinkIcon size={16} /> Invited by Agent ID: {referralCode}
            </div>
          )}

          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#495057', fontSize: '14px' }}>Full Name</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} required style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ced4da', boxSizing: 'border-box' }} />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#495057', fontSize: '14px' }}>Phone Number</label>
            {/* 👇 10-DIGIT KEYBOARD LOCK APPLIED HERE 👇 */}
            <input 
              type="tel" 
              value={phone} 
              onChange={(e) => {
                const onlyNums = e.target.value.replace(/[^0-9]/g, '');
                if (onlyNums.length <= 10) setPhone(onlyNums);
              }} 
              required 
              style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ced4da', boxSizing: 'border-box' }} 
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#495057', fontSize: '14px' }}>Email Address (Optional)</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ced4da', boxSizing: 'border-box' }} />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#495057', fontSize: '14px' }}>Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength="6" style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ced4da', boxSizing: 'border-box' }} />
          </div>

          <button type="submit" style={{ width: '100%', padding: '15px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', fontSize: '16px', cursor: 'pointer', marginTop: '10px' }}>
            Create Account
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <Link to="/login" style={{ color: '#6c757d', textDecoration: 'none', fontSize: '14px', fontWeight: 'bold' }}>Already have an account? <span style={{ color: '#007bff' }}>Login here</span></Link>
        </div>
      </div>
    </div>
  );
}
export default Register;