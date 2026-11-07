import { useState, useEffect } from 'react';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';

export default function CustomerProfilePage() {
  const { user, setUser } = useAuth();
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || user.first_name || '',
        lastName: user.lastName || user.last_name || '',
        email: user.email || '',
        phone: user.phone || user.contactNumber || user.contact_number || '',
        address: user.address || '',
        city: user.city || '',
      });
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');

    try {
      const res = await api.request('/users/profile', { method: 'PUT', body: formData });
      if (res.user && setUser) {
        setUser(res.user);
      }
      setMessage('Profile updated successfully!');
    } catch (err) {
      setError(err.message || 'Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ maxWidth: '600px', margin: '40px auto', padding: '20px' }}>
      <h1 style={{ color: '#fff', fontSize: '2rem', marginBottom: '8px' }}>Customer Profile</h1>
      <p style={{ color: '#aaa', marginBottom: '24px' }}>View and update your personal information and contact details.</p>

      {message && (
        <div style={{ background: 'rgba(76,175,80,0.15)', border: '1px solid #4caf50', color: '#4caf50', padding: '12px', borderRadius: '6px', marginBottom: '20px' }}>
          {message}
        </div>
      )}

      {error && (
        <div style={{ background: 'rgba(255,82,82,0.15)', border: '1px solid #ff5252', color: '#ff5252', padding: '12px', borderRadius: '6px', marginBottom: '20px' }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="card" style={{ padding: '30px', background: 'rgba(15,42,60,0.95)', border: '1px solid var(--gold)', borderRadius: '10px', display: 'grid', gap: '16px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', color: 'var(--gold)', fontSize: '13px', marginBottom: '6px' }}>First Name</label>
            <input 
              type="text" 
              name="firstName" 
              value={formData.firstName} 
              onChange={handleChange} 
              className="input" 
              style={{ width: '100%', padding: '10px', background: '#0a1922', border: '1px solid #333', color: '#fff', borderRadius: '6px' }}
              required 
            />
          </div>
          <div>
            <label style={{ display: 'block', color: 'var(--gold)', fontSize: '13px', marginBottom: '6px' }}>Last Name</label>
            <input 
              type="text" 
              name="lastName" 
              value={formData.lastName} 
              onChange={handleChange} 
              className="input" 
              style={{ width: '100%', padding: '10px', background: '#0a1922', border: '1px solid #333', color: '#fff', borderRadius: '6px' }}
              required 
            />
          </div>
        </div>

        <div>
          <label style={{ display: 'block', color: 'var(--gold)', fontSize: '13px', marginBottom: '6px' }}>Email Address (Read-only)</label>
          <input 
            type="email" 
            name="email" 
            value={formData.email} 
            disabled 
            className="input" 
            style={{ width: '100%', padding: '10px', background: 'rgba(10,25,34,0.5)', border: '1px solid #222', color: '#777', borderRadius: '6px', cursor: 'not-allowed' }} 
          />
        </div>

        <div>
          <label style={{ display: 'block', color: 'var(--gold)', fontSize: '13px', marginBottom: '6px' }}>Contact Number / Phone</label>
          <input 
            type="text" 
            name="phone" 
            value={formData.phone} 
            onChange={handleChange} 
            className="input" 
            style={{ width: '100%', padding: '10px', background: '#0a1922', border: '1px solid #333', color: '#fff', borderRadius: '6px' }} 
          />
        </div>

        <div>
          <label style={{ display: 'block', color: 'var(--gold)', fontSize: '13px', marginBottom: '6px' }}>Street Address</label>
          <input 
            type="text" 
            name="address" 
            value={formData.address} 
            onChange={handleChange} 
            className="input" 
            style={{ width: '100%', padding: '10px', background: '#0a1922', border: '1px solid #333', color: '#fff', borderRadius: '6px' }} 
          />
        </div>

        <div>
          <label style={{ display: 'block', color: 'var(--gold)', fontSize: '13px', marginBottom: '6px' }}>City</label>
          <input 
            type="text" 
            name="city" 
            value={formData.city} 
            onChange={handleChange} 
            className="input" 
            style={{ width: '100%', padding: '10px', background: '#0a1922', border: '1px solid #333', color: '#fff', borderRadius: '6px' }} 
          />
        </div>

        <div style={{ marginTop: '10px' }}>
          <button type="submit" className="btn btn-gold" style={{ width: '100%', padding: '12px', fontWeight: 'bold' }} disabled={loading}>
            {loading ? 'Saving Changes...' : 'Save Profile Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}