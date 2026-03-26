import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar'; // 👇 Import the new Navbar
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import Transfer from './components/Transfer';
import Register from './components/Register';
import AddFunds from './components/AddFunds';
import AdminDashboard from './components/AdminDashboard';
import ResetPassword from './components/ResetPassword';
import EditProfile from './components/EditProfile';

function App() {
  return (
    <Router>
      <div style={{ minHeight: '100vh', backgroundColor: '#f4f6f8' }}>
        {/* The Navbar will sit at the top of every page automatically */}
        <Navbar /> 
        
        {/* This container pushes the page content down slightly and centers it */}
        <div style={{ padding: '40px 20px' }}>
          <Routes>
            <Route path="/" element={<Navigate to="/login" />} />
            <Route path="/login" element={<Login />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/transfer" element={<Transfer />} />
            
            {/* We will build these next! */}
            <Route path="/add-funds" element={<AddFunds />} />
            <Route path="/register" element={<Register />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/edit-profile" element={<EditProfile />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;