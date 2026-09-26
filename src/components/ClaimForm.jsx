import React, { useState } from 'react';

const ClaimForm = ({ onClaim }) => {
  const [formData, setFormData] = useState({
    name: '',
    mobile: '',
    email: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.name && formData.mobile) {
      // Logic to submit form data can go here
      // Example: POST to /api/claims (Vercel/Neon)
      onClaim();
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="claim-section">
      <h2>Claim Your Reward</h2>
      <p className="subtitle">Almost there! 🍦</p>
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
          />
          <label htmlFor="mobile" className="form-label">Mobile Number</label>
        </div>

        <div className="form-group">
          <input
            type="email"
            id="email"
            name="email"
            className="form-input"
            placeholder=" "
            value={formData.email}
            onChange={handleChange}
          />
          <label htmlFor="email" className="form-label">Email (Optional)</label>
        </div>

        <button type="submit" className="submit-btn">CLAIM MY TREAT!</button>
      </form>
    </div>
  );
};

export default ClaimForm;
