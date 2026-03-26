import { useState, useEffect } from 'react';
import apiClient from '../utils/apiClient';
import { useNavigate } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { User, Phone, Mail, Hash, ArrowUpRight, ArrowDownLeft, Clock } from 'lucide-react';

// Move CustomTooltip outside the Dashboard component to avoid recreation during render
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div style={{ backgroundColor: 'white', padding: '15px', border: '1px solid #e9ecef', borderRadius: '8px', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }}>
        <p style={{ margin: '0 0 10px 0', color: '#6c757d', fontSize: '13px', fontWeight: 'bold' }}>{label}</p>
        <p style={{ margin: '0 0 5px 0', color: '#333', fontSize: '16px', fontWeight: 'bold' }}>
          Balance: <span style={{ color: '#007bff' }}>{data.Balance}</span>
        </p>
        <p style={{ margin: 0, fontSize: '14px', fontWeight: 'bold', color: data.Change > 0 ? '#28a745' : '#dc3545' }}>
          {data.Change > 0 ? `Transaction: +${data.Change} Currency` : `Transaction: -₹${Math.abs(data.Change)}`}
        </p>
      </div>
    );
  }
  return null;
};

function Dashboard() {
  const [dashboardData, setDashboardData] = useState(null);
  const [error, setError] = useState('');
  const [timeFilter, setTimeFilter] = useState('all'); 
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDashboardData = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }
      try {
        const response = await apiClient.get('/api/wallet/dashboard-data');
        setDashboardData(response.data);
      } catch (err) {
        setError('Session expired or invalid. Please log in again.');
        localStorage.removeItem('token');
        navigate('/login');
      }
    };
    fetchDashboardData();
  }, [navigate]);

  const getRupeeCost = (currencyAmount) => {
    const plan = [
      { rupees: 39, currency: 250 }, { rupees: 50.50, currency: 500 }, { rupees: 76.50, currency: 1000 },
      { rupees: 126.50, currency: 2000 }, { rupees: 276.50, currency: 5000 }, { rupees: 533.00, currency: 10000 },
      { rupees: 1303.00, currency: 20000 }
    ].find(p => p.currency === currencyAmount);
    return plan ? plan.rupees : currencyAmount; 
  };

  // 👇 THE TIME MACHINE ALGORITHM 👇
  const getFilteredGraphData = () => {
    if (!dashboardData || !dashboardData.transactions) return [];
    
    // 1. Start with their current balance
    let runningBalance = dashboardData.walletBalance;
    
    // 2. Walk backwards through the transactions
    const allPoints = [...dashboardData.transactions].map(tx => {
      const isSent = tx.sender?.phone === dashboardData.phone;
      const changeAmount = isSent ? -getRupeeCost(tx.amount) : tx.amount;
      
      const point = {
        time: new Date(tx.date).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
        Balance: runningBalance, // This prevents the graph from ever going negative!
        Change: changeAmount,    // We save this for the tooltip popup
        rawDate: new Date(tx.date)
      };
      
      // 3. Step backward in time for the next older transaction
      runningBalance = runningBalance - changeAmount;
      return point;
    });

    // 4. Apply the time filters
    let filteredPoints = allPoints;
    if (timeFilter !== 'all') {
      const now = new Date();
      let cutoff = new Date();
      if (timeFilter === '6h') cutoff.setHours(now.getHours() - 6);
      else if (timeFilter === '12h') cutoff.setHours(now.getHours() - 12);
      else if (timeFilter === 'day') cutoff.setDate(now.getDate() - 1);
      else if (timeFilter === 'week') cutoff.setDate(now.getDate() - 7);
      else if (timeFilter === 'month') cutoff.setMonth(now.getMonth() - 1);
      
      filteredPoints = allPoints.filter(p => p.rawDate >= cutoff);
    }
    
    // 5. Reverse the array so the graph draws from Oldest (Left) to Newest (Right)
    return filteredPoints.reverse();
  };

  const graphData = getFilteredGraphData();

  if (!dashboardData && !error) return <h2 style={{ textAlign: 'center', marginTop: '50px' }}>Loading your secure dashboard...</h2>;

  const filterBtnStyle = (filterValue) => ({
    padding: '8px 15px', border: '1px solid #007bff',
    backgroundColor: timeFilter === filterValue ? '#007bff' : 'white',
    color: timeFilter === filterValue ? 'white' : '#007bff',
    cursor: 'pointer', fontWeight: 'bold', fontSize: '14px', transition: 'all 0.2s'
  });

  return (
    <div style={{ padding: '20px', maxWidth: '1100px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      {error && <p style={{ color: 'red', textAlign: 'center', fontWeight: 'bold' }}>{error}</p>}

      {dashboardData && (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 style={{ fontSize: '28px', color: '#333', margin: 0 }}>Dashboard Overview</h2>
            <button 
              onClick={() => navigate('/add-funds')}
              style={{ padding: '12px 24px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '16px', fontWeight: 'bold', boxShadow: '0 4px 6px rgba(40,167,69,0.2)' }}
            >
              + Request Recharge
            </button>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginBottom: '30px' }}>
            <div style={{ padding: '25px', backgroundColor: 'white', border: '1px solid #e9ecef', borderRadius: '15px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 style={{ margin: 0, color: '#6c757d', fontSize: '14px', textTransform: 'uppercase' }}>User Profile</h3>
                <button 
                  onClick={() => navigate('/edit-profile')} 
                  style={{ padding: '5px 12px', fontSize: '12px', backgroundColor: '#e9ecef', color: '#495057', border: '1px solid #ced4da', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}
                >
                  Edit Profile
                </button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><User size={20} color="#007bff" /> <span style={{ fontWeight: 'bold', fontSize: '18px' }}>{dashboardData.name}</span></div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#495057' }}><Hash size={18} color="#6c757d" /> <strong>ID:</strong> {dashboardData.uniqueId}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#495057' }}><Phone size={18} color="#6c757d" /> <strong>Phone:</strong> +91 {dashboardData.phone}</div>
                {dashboardData.email && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#495057' }}><Mail size={18} color="#6c757d" /> <strong>Email:</strong> {dashboardData.email}</div>
                )}
              </div>
            </div>

            <div style={{ padding: '40px', backgroundColor: 'white', border: '1px solid #e9ecef', borderRadius: '15px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', textAlign: 'center', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <h3 style={{ margin: '0', color: '#6c757d', fontSize: '16px', textTransform: 'uppercase' }}>Available Balance</h3>
              <p style={{ fontSize: '64px', margin: '10px 0', color: '#28a745', fontWeight: 'bold' }}>{dashboardData.walletBalance}</p>
              <p style={{ margin: '0', color: '#6c757d', fontWeight: 'bold' }}>TRUST CURRENCY / ₹</p>
              <p style={{ margin: '10px 0 0 0', fontSize: '12px', color: '#dc3545', fontWeight: 'bold' }}>MAXIMUM LIMIT: 20,000</p>
            </div>
          </div>

          <div style={{ padding: '25px', backgroundColor: 'white', border: '1px solid #e9ecef', borderRadius: '15px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', marginBottom: '30px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px', marginBottom: '20px' }}>
              <h3 style={{ margin: 0, color: '#333', fontSize: '18px' }}>Account Balance History</h3>
              
              <div style={{ display: 'flex', overflow: 'hidden', borderRadius: '8px', border: '1px solid #007bff' }}>
                <button style={filterBtnStyle('all')} onClick={() => setTimeFilter('all')}>ALL</button>
                <button style={filterBtnStyle('6h')} onClick={() => setTimeFilter('6h')}>6H</button>
                <button style={filterBtnStyle('12h')} onClick={() => setTimeFilter('12h')}>12H</button>
                <button style={filterBtnStyle('day')} onClick={() => setTimeFilter('day')}>1D</button>
                <button style={filterBtnStyle('week')} onClick={() => setTimeFilter('week')}>1W</button>
                <button style={filterBtnStyle('month')} onClick={() => setTimeFilter('month')}>1M</button>
              </div>
            </div>
            
            <div style={{ height: '300px', width: '100%' }}>
              {graphData.length === 0 ? (
                <div style={{ height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#6c757d' }}><p>No transactions found.</p></div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={graphData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e0e0e0" />
                    <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fill: '#6c757d', fontSize: 12 }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6c757d' }} />
                    {/* 👇 Using our Custom Tooltip 👇 */}
                    <Tooltip content={<CustomTooltip />} />
                    
                    {/* The Line is now a solid beautiful blue representing the running balance! */}
                    <Line type="monotone" dataKey="Balance" stroke="#007bff" strokeWidth={3} dot={{ r: 4, fill: '#007bff', strokeWidth: 2, stroke: 'white' }} activeDot={{ r: 8 }} />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          <div style={{ padding: '25px', backgroundColor: 'white', border: '1px solid #e9ecef', borderRadius: '15px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
            <h3 style={{ margin: '0 0 20px 0', color: '#333', fontSize: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Clock size={20} color="#007bff" /> Complete Ledger History
            </h3>
            
            {dashboardData.transactions && dashboardData.transactions.length > 0 ? (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#f8f9fa', color: '#495057', fontSize: '14px', textTransform: 'uppercase' }}>
                      <th style={{ padding: '15px', borderBottom: '2px solid #dee2e6' }}>Date</th>
                      <th style={{ padding: '15px', borderBottom: '2px solid #dee2e6' }}>Transaction Details</th>
                      <th style={{ padding: '15px', borderBottom: '2px solid #dee2e6' }}>Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dashboardData.transactions.map((tx, index) => {
                      const isSent = tx.sender?.phone === dashboardData.phone;
                      return (
                        <tr key={index} style={{ borderBottom: '1px solid #e9ecef', transition: 'background-color 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8f9fa'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}>
                          <td style={{ padding: '15px', color: '#6c757d', fontSize: '14px' }}>
                            {new Date(tx.date).toLocaleDateString()} <br/>
                            <span style={{ fontSize: '12px' }}>{new Date(tx.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                          </td>
                          <td style={{ padding: '15px' }}>
                            {isSent ? (
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <div style={{ backgroundColor: '#fff1f0', padding: '8px', borderRadius: '50%' }}><ArrowUpRight size={16} color="#dc3545" /></div>
                                <div>
                                  <p style={{ margin: 0, fontWeight: 'bold', color: '#333' }}>Sent to {tx.recipient?.name || 'Unknown'}</p>
                                  <p style={{ margin: 0, fontSize: '12px', color: '#6c757d' }}>{tx.recipient?.phone}</p>
                                </div>
                              </div>
                            ) : (
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <div style={{ backgroundColor: '#d4edda', padding: '8px', borderRadius: '50%' }}><ArrowDownLeft size={16} color="#28a745" /></div>
                                <div>
                                  <p style={{ margin: 0, fontWeight: 'bold', color: '#333' }}>Received from {tx.sender?.name || 'Unknown'}</p>
                                  <p style={{ margin: 0, fontSize: '12px', color: '#6c757d' }}>{tx.sender?.phone || 'System'}</p>
                                </div>
                              </div>
                            )}
                          </td>
                          <td style={{ padding: '15px', fontWeight: 'bold', fontSize: '18px', color: isSent ? '#dc3545' : '#28a745' }}>
                            {isSent ? `-₹${getRupeeCost(tx.amount)}` : `+${tx.amount} Currency`}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <p style={{ color: '#6c757d', textAlign: 'center', padding: '20px 0' }}>No transactions found in your ledger yet.</p>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default Dashboard;