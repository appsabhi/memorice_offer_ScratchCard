import React, { useState } from 'react';

const ClaimForm = ({ offer, onClaim, onAlreadyClaimed }) => {
  const [formData, setFormData] = useState({
    name: '',
    mobile: '',
    bill: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.mobile || !formData.bill) return;
    
    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const response = await fetch('/api/claims', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: formData.name,
          mobileNumber: formData.mobile,
          billNumber: formData.bill,
          offer: offer,
          claimDateTime: new Date().toISOString()
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        onClaim();
      } else {
        if (data.error === 'ALREADY_CLAIMED' || response.status === 409) {
          onAlreadyClaimed();
        } else {
          setErrorMsg('Something went wrong. Please try again.');
          setIsSubmitting(false);
        }
      }
    } catch (error) {
      console.error("Claim submission error:", error);
      setErrorMsg('Something went wrong. Please try again.');
      setIsSubmitting(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="claim-section">
      <h2>Claim Your Reward</h2>
      <p className="subtitle">Almost there! 🍦</p>
      
      {errorMsg && (
        <div style={{ color: '#ef4444', background: '#fef2f2', padding: '10px', borderRadius: '8px', marginBottom: '15px', fontSize: '0.95rem', fontWeight: 'bold', border: '1px solid #fecaca' }}>
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <input
            type="text"
            id="name"
            name="name"
            className="form-input"
            placeholder=" "
            value={formData.name}
            onChange={handleChange}
            required
            disabled={isSubmitting}
          />
          <label htmlFor="name" className="form-label">Full Name</label>
        </div>

        <div className="form-group">
          <input
            type="tel"
            id="mobile"
            name="mobile"
            className="form-input"
            placeholder=" "
            value={formData.mobile}
            onChange={handleChange}
            required
            disabled={isSubmitting}
          />
          <label htmlFor="mobile" className="form-label">Mobile Number</label>
        </div>

        <div className="form-group">
          <input
            type="text"
            id="bill"
            name="bill"
            className="form-input"
            placeholder=" "
            value={formData.bill}
            onChange={handleChange}
            required
            disabled={isSubmitting}
          />
          <label htmlFor="bill" className="form-label">Bill No.</label>
        </div>

        <button type="submit" className="submit-btn" disabled={isSubmitting} style={{ opacity: isSubmitting ? 0.7 : 1, cursor: isSubmitting ? 'not-allowed' : 'pointer' }}>
          {isSubmitting ? 'CLAIMING...' : 'CLAIM YOUR OFFER!'}
        </button>
      </form>
    </div>
  );
};

export default ClaimForm;
