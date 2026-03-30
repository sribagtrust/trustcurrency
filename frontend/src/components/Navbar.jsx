import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, Send, LogOut, Shield, Menu, X } from 'lucide-react'; // 👈 Added Menu and X icons

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role') || 'user'; 

  // 👇 State to track screen size and menu status 👇
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Automatically detect screen resizing
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
      // Close the menu automatically if they rotate their iPad or stretch the window
      if (window.innerWidth > 768) setIsMenuOpen(false); 
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // If the user isn't logged in, don't show the navbar
  if (!token || location.pathname === '/login' || location.pathname === '/register') return null;

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role'); 
    setIsMenuOpen(false); // Close menu on logout
    navigate('/login');
  };

  const handleNavClick = (path) => {
    navigate(path);
    setIsMenuOpen(false); // Close menu when a link is clicked
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
    transition: 'all 0.2s ease',
    width: isMobile ? '100%' : 'auto', // Make links full width inside the mobile dropdown
    boxSizing: 'border-box'
  });

  // 👇 A reusable block of links so we don't write them twice 👇
  const renderNavLinks = () => (
    <>
      {role === 'admin' ? (
        /* ADMIN ONLY SEES THIS */
        <div style={navItemStyle('/admin')} onClick={() => handleNavClick('/admin')}>
          <LayoutDashboard size={20} /> Dashboard
        </div>
      ) : (
        /* REGULAR USERS SEE THESE 3 LINKS */
        <>
          <div style={navItemStyle('/dashboard')} onClick={() => handleNavClick('/dashboard')}>
            <LayoutDashboard size={20} /> Dashboard
          </div>
          <div style={navItemStyle('/transfer')} onClick={() => handleNavClick('/transfer')}>
            <Send size={20} /> Transfer
          </div>
          <div style={navItemStyle('/add-funds')} onClick={() => handleNavClick('/add-funds')}>
            <Shield size={20} /> Add Funds
          </div>
        </>
      )}
    </>
  );

  return (
    <nav style={{ 
      display: 'flex', 
      justifyContent: 'space-between', 
      alignItems: 'center', 
      padding: isMobile ? '15px 20px' : '15px 40px', // Shrink edge padding on mobile
      backgroundColor: 'white', 
      boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
      fontFamily: 'sans-serif',
      position: 'sticky', // Keeps navbar at top of screen
      top: 0,
      zIndex: 1000
    }}>
      
      {/* Brand / Company Name */}
      <div 
        style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }} 
        onClick={() => handleNavClick(role === 'admin' ? '/admin' : '/dashboard')}
      >
        <img 
          src="/sbgalogo.png" 
          alt="Trust Currency Logo" 
          style={{ width: '40px', height: '36px', objectFit: 'cover' }} 
        />
        {/* Hide the brand text on very small screens if needed, but keep for now */}
        <h1 style={{ margin: 0, fontSize: isMobile ? '20px' : '24px', color: '#1a1a1a', letterSpacing: '-0.5px' }}>
          Trust Currency
        </h1>
      </div>

      {/* DESKTOP VIEW (Hidden on Mobile) */}
      {!isMobile && (
        <>
          <div style={{ display: 'flex', gap: '10px' }}>
            {renderNavLinks()}
          </div>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <button 
              onClick={handleLogout}
              style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '8px 16px', backgroundColor: '#fff1f0', color: '#dc3545', border: '1px solid #ffccc7', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}
            >
              <LogOut size={18} /> Logout
            </button>
          </div>
        </>
      )}

      {/* MOBILE HAMBURGER BUTTON (Hidden on Desktop) */}
      {isMobile && (
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#333', padding: '5px', display: 'flex', alignItems: 'center' }}
        >
          {isMenuOpen ? <X size={30} /> : <Menu size={30} />}
        </button>
      )}

      {/* MOBILE DROPDOWN MENU */}
      {isMobile && isMenuOpen && (
        <div style={{ 
          position: 'absolute', 
          top: '100%', 
          left: 0, 
          right: 0, 
          backgroundColor: 'white', 
          borderTop: '1px solid #e9ecef',
          boxShadow: '0 10px 25px rgba(0,0,0,0.1)', 
          padding: '15px 20px', 
          display: 'flex', 
          flexDirection: 'column', 
          gap: '10px',
          animation: 'fadeIn 0.2s ease'
        }}>
          {renderNavLinks()}
          
          <div style={{ width: '100%', height: '1px', backgroundColor: '#e9ecef', margin: '5px 0' }}></div>
          
          <button 
            onClick={handleLogout}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px', padding: '12px 16px', backgroundColor: '#fff1f0', color: '#dc3545', border: '1px solid #ffccc7', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', width: '100%' }}
          >
            <LogOut size={18} /> Logout
          </button>
        </div>
      )}
    </nav>
  );
}

export default Navbar;