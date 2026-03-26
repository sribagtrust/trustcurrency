import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Send, CheckCircle, AlertCircle } from 'lucide-react';

function Transfer() {
  const [recipientPhone, setRecipientPhone] = useState('');
  const [selectedPlan, setSelectedPlan] = useState(null); 
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const navigate = useNavigate();

  const plans = [
    { tier: 1, rupees: 39, currency: 250 },
    { tier: 2, rupees: 50.50, currency: 500 },
    { tier: 3, rupees: 76.50, currency: 1000 },
    { tier: 4, rupees: 126.50, currency: 2000 },
    { tier: 5, rupees: 276.50, currency: 5000 },
    { tier: 6, rupees: 533.00, currency: 10000 },
    { tier: 7, rupees: 1303.00, currency: 20000 }
  ];

  const handleTransfer = async (e) => {
    e.preventDefault();
    setMessage('');
    setIsError(false);

    if (!selectedPlan) {
      setIsError(true);
      setMessage('Please select a transfer package first.');
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    try {
      // NOTE: We still send 'coins' to the backend so the math engine doesn't break!
      const response = await axios.post('http://localhost:5005/api/transactions/transfer', 
        { 
          recipientPhone: recipientPhone, 
          rupees: selectedPlan.rupees,
          coins: selectedPlan.currency 
        }, 
        { headers: { 'x-auth-token': token } }
      );

      setIsError(false);
      setMessage(response.data.message);
      setRecipientPhone('');
      setSelectedPlan(null); 
      
    } catch (err) {
      setIsError(true);
      setMessage(err.response?.data?.message || 'Transfer failed. Please try again.');
    }
  };

  return (
    <div style={{ padding: '40px', maxWidth: '750px', margin: '0 auto', fontFamily: 'sans-serif', backgroundColor: 'white', borderRadius: '15px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
      
      <button 
        onClick={() => navigate('/dashboard')}
        style={{ marginBottom: '20px', padding: '10px 15px', cursor: 'pointer', backgroundColor: '#f8f9fa', color: '#495057', border: '1px solid #ced4da', borderRadius: '8px', fontWeight: 'bold' }}
      >
        ← Back to Dashboard
      </button>

      <div style={{ textAlign: 'center', marginBottom: '30px' }}>
        <div style={{ display: 'inline-block', backgroundColor: '#e9f2ff', padding: '15px', borderRadius: '50%', marginBottom: '10px' }}>
          <Send size={40} color="#007bff" />
        </div>
        <h2 style={{ margin: 0, color: '#333' }}>Send Trust Currency</h2>
        <p style={{ color: '#6c757d', marginTop: '10px' }}>
          Pay from your balance to send a currency package to a friend.
        </p>
      </div>

      {message && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '15px', marginBottom: '25px', backgroundColor: isError ? '#f8d7da' : '#d4edda', color: isError ? '#721c24' : '#155724', borderRadius: '8px', fontWeight: 'bold' }}>
          {isError ? <AlertCircle size={24} /> : <CheckCircle size={24} />}
          {message}
        </div>
      )}

      <form onSubmit={handleTransfer} style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
        
        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#495057', fontSize: '18px' }}>1. Enter Recipient's Phone Number</label>
          <input 
            type="tel" 
            placeholder="e.g. 9876543210" 
            value={recipientPhone}
            onChange={(e) => setRecipientPhone(e.target.value)}
            required
            style={{ width: '100%', padding: '15px', fontSize: '16px', borderRadius: '8px', border: '1px solid #ced4da', boxSizing: 'border-box' }}
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '15px', fontWeight: 'bold', color: '#495057', fontSize: '18px' }}>2. Select a Package to Send:</label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '15px' }}>
            {plans.map((plan) => (
              <div 
                key={plan.tier}
                onClick={() => setSelectedPlan(plan)}
                style={{ 
                  border: selectedPlan?.tier === plan.tier ? '3px solid #007bff' : '1px solid #ddd', 
                  borderRadius: '10px', 
                  padding: '15px', 
                  cursor: 'pointer',
                  backgroundColor: selectedPlan?.tier === plan.tier ? '#e9f2ff' : 'white',
                  textAlign: 'center',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                  transition: 'all 0.2s ease'
                }}
              >
                <p style={{ margin: '0 0 8px 0', color: '#dc3545', fontWeight: 'bold', fontSize: '16px' }}>Pay ₹{plan.rupees}</p>
                <div style={{ backgroundColor: '#28a745', color: 'white', padding: '5px', borderRadius: '5px', fontWeight: 'bold', fontSize: '14px' }}>
                  Send {plan.currency} Currency
                </div>
              </div>
            ))}
          </div>
        </div>

        <button 
          type="submit" 
          style={{ width: '100%', padding: '18px', fontSize: '18px', fontWeight: 'bold', cursor: 'pointer', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '8px', marginTop: '10px', boxShadow: '0 4px 6px rgba(0,123,255,0.2)' }}
        >
          Confirm Transfer
        </button>
      </form>

    </div>
  );
}

export default Transfer;