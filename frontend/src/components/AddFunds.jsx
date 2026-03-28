import { useState, useEffect } from 'react';
import apiClient from '../utils/apiClient';
import { useNavigate } from 'react-router-dom';
import { Shield, Upload, CheckCircle, AlertCircle, Banknote, Smartphone, HelpCircle } from 'lucide-react';

function AddFunds() {
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('online');
  const [screenshot, setScreenshot] = useState(null);
  const [utrNumber, setUtrNumber] = useState(''); 
  const [casherName, setCasherName] = useState(''); 
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const navigate = useNavigate();
  
  const [isReferredUser, setIsReferredUser] = useState(false);
  const [referrerId, setReferrerId] = useState('');

  const plans = [
    { tier: 1, rupees: 39, currency: 250 },
    { tier: 2, rupees: 50.50, currency: 500 },
    { tier: 3, rupees: 76.50, currency: 1000 },
    { tier: 4, rupees: 126.50, currency: 2000 },
    { tier: 5, rupees: 276.50, currency: 5000 },
    { tier: 6, rupees: 533.00, currency: 10000 },
    { tier: 7, rupees: 1303.00, currency: 20000 }
  ];

  useEffect(() => {
    const checkUserStatus = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;
      try {
        const response = await apiClient.get('/api/wallet/dashboard-data');
        if (response.data.referredBy) {
          setIsReferredUser(true);
          setReferrerId(response.data.referredBy);
        }
      } catch {
        console.log("Error checking user status");
      }
    };
    checkUserStatus();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setIsError(false);

    if (!selectedPlan) {
      setIsError(true);
      setMessage('Please select a package first.');
      return;
    }

    if (paymentMethod === 'online') {
      if (!utrNumber || utrNumber.length < 10) {
        setIsError(true);
        setMessage('Please enter a valid UTR / Reference number.');
        return;
      }
      if (!screenshot) {
        setIsError(true);
        setMessage('Please upload your payment screenshot.');
        return;
      }
    }

    if (paymentMethod === 'cash') {
      if (!casherName.trim()) {
        setIsError(true);
        setMessage('Please enter the name of the person collecting the cash.');
        return;
      }
    }

    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    const formData = new FormData();
    formData.append('amount', selectedPlan.currency);

    if (paymentMethod === 'online') {
      formData.append('utrNumber', utrNumber);
      formData.append('screenshot', screenshot);
    } else {
      const formattedName = casherName.trim().toUpperCase().replace(/\s+/g, '-');
      formData.append('utrNumber', `CASH-${formattedName}-${Date.now()}`);
      const dummyFile = new File(['cash-transaction'], 'cash-payment.jpg', { type: 'image/jpeg' });
      formData.append('screenshot', dummyFile);
    }

    try {
      const response = await apiClient.post('/api/wallet/recharge-request', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setIsError(false);
      setMessage(response.data.message);
      
      setSelectedPlan(null);
      setScreenshot(null);
      setUtrNumber(''); 
      setCasherName(''); 
      
    } catch (err) {
      setIsError(true);
      setMessage(err.response?.data?.message || 'Failed to submit request. Please try again.');
    }
  };

  const methodBtnStyle = (method) => ({
    flex: 1, padding: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
    border: paymentMethod === method ? '3px solid #007bff' : '1px solid #ced4da',
    backgroundColor: paymentMethod === method ? '#e9f2ff' : 'white',
    color: paymentMethod === method ? '#007bff' : '#6c757d',
    borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold', fontSize: '16px', transition: 'all 0.2s ease'
  });

  return (
    <div style={{ padding: '40px', maxWidth: '750px', margin: '0 auto', fontFamily: 'sans-serif', backgroundColor: 'white', borderRadius: '15px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
      
      <button onClick={() => navigate('/dashboard')} style={{ marginBottom: '20px', padding: '10px 15px', cursor: 'pointer', backgroundColor: '#f8f9fa', color: '#495057', border: '1px solid #ced4da', borderRadius: '8px', fontWeight: 'bold' }}>
        ← Back to Dashboard
      </button>

      <div style={{ textAlign: 'center', marginBottom: '30px' }}>
        <div style={{ display: 'inline-block', backgroundColor: '#e9f2ff', padding: '15px', borderRadius: '50%', marginBottom: '10px' }}><Shield size={40} color="#007bff" /></div>
        <h2 style={{ margin: 0, color: '#333' }}>Add Trust Currency</h2>
        <p style={{ color: '#6c757d', marginTop: '10px' }}>Select a package, choose your payment method, and submit.</p>
      </div>

      {/* DYNAMIC ROUTING BANNER WITH ADMIN CONTACT HELP */}
      {isReferredUser ? (
        <div style={{ marginBottom: '25px', animation: 'fadeIn 0.3s ease' }}>
          <div style={{ padding: '20px', backgroundColor: '#e9f2ff', border: '1px solid #b8daff', borderRadius: '10px', color: '#004085', display: 'flex', alignItems: 'center', gap: '15px' }}>
            <AlertCircle size={30} style={{ flexShrink: 0 }} />
            <p style={{ margin: 0, fontSize: '15px', lineHeight: '1.5' }}>
              Request from the User ID: <strong>{referrerId}</strong>
            </p>
          </div>
          {/* 👇 NEW: Contact Admin Prompt 👇 */}
          <div style={{ marginTop: '10px', padding: '12px', backgroundColor: '#f8f9fa', borderRadius: '8px', border: '1px dashed #ced4da', display: 'flex', alignItems: 'center', gap: '10px', color: '#495057', fontSize: '13px' }}>
            <HelpCircle size={18} color="#6c757d" style={{ flexShrink: 0 }} />
            <p style={{ margin: 0 }}>
              Need your boss's payment details? Contact Admin: <strong style={{ color: '#333' }}>admin@trustcurrency.com</strong> or call <strong style={{ color: '#333' }}>+91 9999999999</strong>
            </p>
          </div>
        </div>
      ) : (
        <div style={{ padding: '20px', backgroundColor: '#fff3cd', border: '1px solid #ffeeba', borderRadius: '10px', color: '#856404', marginBottom: '25px', display: 'flex', alignItems: 'center', gap: '15px' }}>
          <AlertCircle size={30} style={{ flexShrink: 0 }} />
          <p style={{ margin: 0, fontSize: '15px', lineHeight: '1.5' }}>
            Request from the Admin
          </p>
        </div>
      )}

      {message && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '15px', marginBottom: '25px', backgroundColor: isError ? '#f8d7da' : '#d4edda', color: isError ? '#721c24' : '#155724', borderRadius: '8px', fontWeight: 'bold' }}>
          {isError ? <AlertCircle size={24} /> : <CheckCircle size={24} />} {message}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
        
        <div>
          <label style={{ display: 'block', marginBottom: '15px', fontWeight: 'bold', color: '#495057', fontSize: '18px' }}>1. Select a Currency Package</label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '15px' }}>
            {plans.map((plan) => (
              <div key={plan.tier} onClick={() => setSelectedPlan(plan)} style={{ border: selectedPlan?.tier === plan.tier ? '3px solid #007bff' : '1px solid #ddd', borderRadius: '10px', padding: '15px', cursor: 'pointer', backgroundColor: selectedPlan?.tier === plan.tier ? '#e9f2ff' : 'white', textAlign: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', transition: 'all 0.2s ease' }}>
                <p style={{ margin: '0 0 8px 0', color: '#dc3545', fontWeight: 'bold', fontSize: '16px' }}>Pay ₹{plan.rupees}</p>
                <div style={{ backgroundColor: '#28a745', color: 'white', padding: '5px', borderRadius: '5px', fontWeight: 'bold', fontSize: '14px' }}>Get {plan.currency} Currency</div>
              </div>
            ))}
          </div>
        </div>

        {selectedPlan && (
          <div>
            <label style={{ display: 'block', marginBottom: '15px', fontWeight: 'bold', color: '#495057', fontSize: '18px' }}>2. Select Payment Method</label>
            <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
              <div style={methodBtnStyle('online')} onClick={() => setPaymentMethod('online')}><Smartphone size={24} /> Online / UPI</div>
              <div style={methodBtnStyle('cash')} onClick={() => setPaymentMethod('cash')}><Banknote size={24} /> Cash in Hand</div>
            </div>
          </div>
        )}
        
        {selectedPlan && paymentMethod === 'online' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '25px', animation: 'fadeIn 0.3s ease' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#495057', fontSize: '18px' }}>3. Enter 12-Digit UTR / Ref Number</label>
              <input type="text" placeholder="e.g. 312345678901" value={utrNumber} onChange={(e) => setUtrNumber(e.target.value)} required style={{ width: '100%', padding: '15px', fontSize: '16px', borderRadius: '8px', border: '1px solid #ced4da', boxSizing: 'border-box' }} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#495057', fontSize: '18px' }}>4. Upload Payment Screenshot</label>
              <div style={{ border: '2px dashed #ced4da', borderRadius: '8px', padding: '20px', textAlign: 'center', backgroundColor: '#f8f9fa' }}>
                <Upload size={30} color="#6c757d" style={{ marginBottom: '10px' }} />
                <input type="file" accept="image/*" onChange={(e) => setScreenshot(e.target.files[0])} required style={{ display: 'block', margin: '0 auto', color: '#495057' }} />
              </div>
            </div>
          </div>
        )}

        {selectedPlan && paymentMethod === 'cash' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '25px', animation: 'fadeIn 0.3s ease' }}>
            <div style={{ padding: '25px', backgroundColor: '#fff3cd', border: '1px solid #ffeeba', borderRadius: '10px', color: '#856404' }}>
              <h3 style={{ margin: '0 0 10px 0', display: 'flex', alignItems: 'center', gap: '8px' }}><Banknote size={24} /> Cash Payment Selected</h3>
              <p style={{ margin: 0, fontSize: '16px', lineHeight: '1.5' }}>You have selected to pay exactly <strong>₹{selectedPlan.rupees}</strong> in cash. <br/><br/>Please fill in the Casher Name below, click "Submit Request", and hand the physical cash over. Your Currency will be credited once the {isReferredUser ? "Agent" : "Admin"} confirms receipt.</p>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#495057', fontSize: '18px' }}>3. Enter Casher Name</label>
              <input type="text" placeholder="e.g. John Doe (Who is collecting the cash?)" value={casherName} onChange={(e) => setCasherName(e.target.value)} required={paymentMethod === 'cash'} style={{ width: '100%', padding: '15px', fontSize: '16px', borderRadius: '8px', border: '1px solid #ced4da', boxSizing: 'border-box' }} />
              <p style={{ margin: '5px 0 0 0', fontSize: '12px', color: '#6c757d' }}>This helps verify exactly who collected the physical cash.</p>
            </div>
          </div>
        )}

        {selectedPlan && (
          <button type="submit" style={{ width: '100%', padding: '18px', fontSize: '18px', fontWeight: 'bold', cursor: 'pointer', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '8px', marginTop: '10px', boxShadow: '0 4px 6px rgba(0,123,255,0.2)' }}>
            Submit Request for Verification
          </button>
        )}
      </form>
    </div>
  );
}

export default AddFunds;