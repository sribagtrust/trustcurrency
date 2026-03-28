import { useState, useEffect } from 'react';
import apiClient from '../utils/apiClient';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, Lock, Phone, ArrowLeft, Settings, User, Mail, Save, CheckCircle, AlertCircle } from 'lucide-react';

function EditProfile() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);

  // --- EDIT PROFILE STATE ---
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [updateMessage, setUpdateMessage] = useState('');
  const [isUpdateError, setIsUpdateError] = useState(false);

  // --- DELETE ACCOUNT STATE ---
  const [deletePhone, setDeletePhone] = useState('');
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteMessage, setDeleteMessage] = useState('');
  const [isDeleteError, setIsDeleteError] = useState(false);

  // Load current user data when the page opens
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await apiClient.get('/api/wallet/dashboard-data');
        setName(response.data.name || '');
        setEmail(response.data.email || '');
        setIsLoading(false);
      } catch {
        console.log("Failed to load user data");
        setIsLoading(false);
      }
    };
    fetchUserData();
  }, []);

  // 👇 Handle standard profile updates
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setUpdateMessage(''); setIsUpdateError(false);

    try {
      const response = await apiClient.put('/api/wallet/update-profile', { name, email });
      setIsUpdateError(false);
      setUpdateMessage(response.data.message || 'Profile updated successfully!');
    } catch (err) {
      setIsUpdateError(true);
      setUpdateMessage(err.response?.data?.message || 'Failed to update profile.');
    }
  };

  // 👇 Handle the secure account deletion
  const handleDeleteAccount = async (e) => {
    e.preventDefault();
    setDeleteMessage(''); setIsDeleteError(false);

    const confirmExit = window.confirm(
      "WARNING: Are you absolutely sure you want to close your account? \n\nThis will permanently delete your profile, erase your balance, and transfer your sub-users directly to the Admin. This cannot be undone."
    );

    if (!confirmExit) return;

    try {
      await apiClient.delete('/api/wallet/exit-account', {
        data: { phone: deletePhone, password: deletePassword }
      });
      
      localStorage.removeItem('token');
      localStorage.removeItem('role');
      alert('Account securely closed. You have exited the network.');
      navigate('/login');
    } catch (err) {
      setIsDeleteError(true);
      setDeleteMessage(err.response?.data?.message || 'Failed to close account.');
    }
  };

  if (isLoading) return <h2 style={{ textAlign: 'center', marginTop: '50px' }}>Loading Settings...</h2>;

  return (
    <div style={{ padding: '40px', maxWidth: '600px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      
      <button 
        onClick={() => navigate('/dashboard')}
        style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '30px', padding: '10px 15px', cursor: 'pointer', backgroundColor: '#f8f9fa', color: '#495057', border: '1px solid #ced4da', borderRadius: '8px', fontWeight: 'bold' }}
      >
        <ArrowLeft size={18} /> Back to Dashboard
      </button>

      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <div style={{ display: 'inline-block', backgroundColor: '#e9ecef', padding: '15px', borderRadius: '50%', marginBottom: '10px' }}>
          <Settings size={40} color="#495057" />
        </div>
        <h2 style={{ margin: 0, color: '#333' }}>Account Settings</h2>
      </div>

      {/* SECTION 1: EDIT PROFILE */}
      <div style={{ backgroundColor: 'white', border: '1px solid #e9ecef', borderRadius: '15px', padding: '30px', marginBottom: '30px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
        <h3 style={{ margin: '0 0 20px 0', color: '#333', fontSize: '20px', borderBottom: '2px solid #f8f9fa', paddingBottom: '10px' }}>
          Update Profile Details
        </h3>

        {updateMessage && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '15px', marginBottom: '20px', backgroundColor: isUpdateError ? '#f8d7da' : '#d4edda', color: isUpdateError ? '#721c24' : '#155724', borderRadius: '8px', fontWeight: 'bold' }}>
            {isUpdateError ? <AlertCircle size={20} /> : <CheckCircle size={20} />} {updateMessage}
          </div>
        )}

        <form onSubmit={handleUpdateProfile} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#495057' }}>Full Name</label>
            <div style={{ display: 'flex', alignItems: 'center', backgroundColor: '#f8f9fa', border: '1px solid #ced4da', borderRadius: '8px', padding: '0 15px' }}>
              <User size={20} color="#6c757d" />
              <input 
                type="text" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                style={{ width: '100%', padding: '15px', border: 'none', outline: 'none', backgroundColor: 'transparent', fontSize: '16px', color: '#333' }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#495057' }}>Email Address</label>
            <div style={{ display: 'flex', alignItems: 'center', backgroundColor: '#f8f9fa', border: '1px solid #ced4da', borderRadius: '8px', padding: '0 15px' }}>
              <Mail size={20} color="#6c757d" />
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ width: '100%', padding: '15px', border: 'none', outline: 'none', backgroundColor: 'transparent', fontSize: '16px', color: '#333' }}
              />
            </div>
          </div>

          <button 
            type="submit" 
            style={{ width: '100%', padding: '15px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', fontSize: '16px', cursor: 'pointer', marginTop: '10px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}
          >
            <Save size={20} /> Save Changes
          </button>
        </form>
      </div>

      {/* SECTION 2: DANGER ZONE (Delete Account) */}
      <div style={{ backgroundColor: '#fff1f0', border: '2px solid #ffccc7', borderRadius: '15px', padding: '30px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px', color: '#dc3545' }}>
          <AlertTriangle size={28} />
          <h3 style={{ margin: 0, fontSize: '20px' }}>Danger Zone: Exit Network</h3>
        </div>
        
        <p style={{ color: '#842029', fontSize: '15px', lineHeight: '1.5', marginBottom: '25px' }}>
          Closing your account is permanent. It will erase your remaining balance and transfer your referral network to the Admin. <strong>Verify your identity to proceed.</strong>
        </p>

        {deleteMessage && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '15px', marginBottom: '20px', backgroundColor: isDeleteError ? '#f8d7da' : '#d4edda', color: isDeleteError ? '#721c24' : '#155724', borderRadius: '8px', fontWeight: 'bold' }}>
            {isDeleteError ? <AlertCircle size={20} /> : <CheckCircle size={20} />} {deleteMessage}
          </div>
        )}

        <form onSubmit={handleDeleteAccount} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#842029' }}>Verify Phone Number</label>
            <div style={{ display: 'flex', alignItems: 'center', backgroundColor: 'white', border: '1px solid #ffccc7', borderRadius: '8px', padding: '0 15px' }}>
              <Phone size={20} color="#dc3545" />
              <input 
                type="tel" 
                placeholder="Enter your registered phone" 
                value={deletePhone}
                onChange={(e) => setDeletePhone(e.target.value)}
                required
                style={{ width: '100%', padding: '15px', border: 'none', outline: 'none', backgroundColor: 'transparent', fontSize: '16px' }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#842029' }}>Verify Password</label>
            <div style={{ display: 'flex', alignItems: 'center', backgroundColor: 'white', border: '1px solid #ffccc7', borderRadius: '8px', padding: '0 15px' }}>
              <Lock size={20} color="#dc3545" />
              <input 
                type="password" 
                placeholder="Enter your password" 
                value={deletePassword}
                onChange={(e) => setDeletePassword(e.target.value)}
                required
                style={{ width: '100%', padding: '15px', border: 'none', outline: 'none', backgroundColor: 'transparent', fontSize: '16px' }}
              />
            </div>
          </div>

          <button 
            type="submit" 
            style={{ width: '100%', padding: '15px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', fontSize: '16px', cursor: 'pointer', marginTop: '10px' }}
          >
            Permanently Close Account
          </button>
        </form>
      </div>

    </div>
  );
}

export default EditProfile;