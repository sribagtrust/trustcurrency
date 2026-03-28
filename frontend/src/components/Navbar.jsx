import { useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, Send, LogOut, Shield } from 'lucide-react'; 

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role') || 'user'; 

  // If the user isn't logged in, don't show the navbar
  if (!token || location.pathname === '/login' || location.pathname === '/register') return null;

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role'); 
    navigate('/login');
  };

  const navItemStyle = (path) => ({
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 15px',
    cursor: 'pointer',
    borderRadius: '8px',
    backgroundColor: location.pathname === path ? '#e9ecef' : 'transparent',
    color: location.pathname === path ? '#007bff' : '#495057',
    fontWeight: location.pathname === path ? 'bold' : 'normal',
    transition: 'all 0.2s ease'
  });

  return (
    <nav style={{ 
      display: 'flex', 
      justifyContent: 'space-between', 
      alignItems: 'center', 
      padding: '15px 40px', 
      backgroundColor: 'white', 
      boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
      fontFamily: 'sans-serif'
    }}>
      
      {/* Brand / Company Name */}
      <div 
        style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }} 
        onClick={() => navigate(role === 'admin' ? '/admin' : '/dashboard')}
      >
        {/* 👇 Your Company Logo 👇 */}
        <img 
          src="public/images/sbgalogo.png" 
          alt="Trust Currency Logo" 
          style={{ width: '40px', height: '36px', objectFit: 'cover' }} 
        />
        <h1 style={{ margin: 0, fontSize: '24px', color: '#1a1a1a', letterSpacing: '-0.5px' }}>
          Trust Currency
        </h1>
      </div>

      {/* Main Navigation Links */}
      <div style={{ display: 'flex', gap: '10px' }}>
        
        {/* THE FORK IN THE ROAD */}
        {role === 'admin' ? (
          /* ADMIN ONLY SEES THIS */
          <div style={navItemStyle('/admin')} onClick={() => navigate('/admin')}>
            <LayoutDashboard size={20} /> Dashboard
          </div>
        ) : (
          /* REGULAR USERS SEE THESE 3 LINKS */
          <>
            <div style={navItemStyle('/dashboard')} onClick={() => navigate('/dashboard')}>
              <LayoutDashboard size={20} /> Dashboard
            </div>
            <div style={navItemStyle('/transfer')} onClick={() => navigate('/transfer')}>
              <Send size={20} /> Transfer
            </div>
            <div style={navItemStyle('/add-funds')} onClick={() => navigate('/add-funds')}>
              <Shield size={20} /> Add Funds
            </div>
          </>
        )}
        
      </div>

      {/* Logout Section (User Profile text removed) */}
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <button 
          onClick={handleLogout}
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '5px',
            padding: '8px 16px', 
            backgroundColor: '#fff1f0', 
            color: '#dc3545', 
            border: '1px solid #ffccc7', 
            borderRadius: '8px', 
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >
          <LogOut size={18} /> Logout
        </button>
      </div>
    </nav>
  );
}

export default Navbar;