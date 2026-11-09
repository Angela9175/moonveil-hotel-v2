import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';

export default function HotelInfoPage() {
  const navigate = useNavigate();
  const [info, setInfo] = useState({});
  const [settings, setSettings] = useState({});

  // Form state for Contact Us
  const [contactForm, setContactForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const images = {
    overview: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80',
    resto: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80',
    location: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80'
  };

  useEffect(() => {
    api.hotelInfo().then(setInfo).catch(() => {});
    api.hotelSettings().then(setSettings).catch(() => {});
  }, []);

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      await api.submitInquiry(contactForm);
      setSubmitted(true);
    } catch (err) {
      console.error('Failed to submit inquiry:', err);
      setErrorMsg('Failed to send message. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="the-hotel-page">
      
      <h1 className="the-hotel-title">The Moonveil Hotel</h1>
      
      <button 
        onClick={() => navigate('/rooms')}
        className="btn btn-gold btn-lg"
        style={{ marginBottom: '36px' }}
      >
        Browse Rooms
      </button>

      <div className="the-hotel-cards">

        {/* Card 1: Moonveil Hotel Overview */}
        <div className="turquoise-card two-col">
          <div>
            <h2>{info.name || 'Moonveil Hotel'}</h2>
            <p>
              A serene escape in the heart of the city. Our wish is to offer you a unique and more personal hotel experience. We want you to feel at home when you’re staying at our hotel – that means we go the extra mile to ensure your needs and wants are fulfilled. If you need anything, we stand ready to assist.
            </p>
          </div>
          <img src={images.overview} alt="Moonveil Hotel Overview" />
        </div>

        {/* Card 2: Moonveil Resto */}
        <div className="turquoise-card">
          <div>
            <h2>Moonveil Resto</h2>
            <p>
              Regarded by critics as one of the best Asian dining spots, Moonveil Resto serves both continental breakfast for our guests and delicious modern Asian cuisine. Wake up to freshly brewed coffee and freshly baked bread; in the evening – enjoy authentic Dim Sum and signature dishes.
            </p>
          </div>
          <div className="hours-column">
            <h3>Opening Hours</h3>
            <p>Monday–Friday 08:00 – 24:00</p>
            <p>Saturday–Sunday 07:00 – 12:00</p>
          </div>
          <img src={images.resto} alt="Moonveil Resto" />
        </div>

        {/* Card 3: Location */}
        <div className="turquoise-card two-col">
          <div>
            <h2>Where’s Moonveil Hotel Located?</h2>
            <div className="location-pin">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                width="18" 
                height="18" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2.5" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                style={{ color: '#132F4C', flexShrink: 0 }}
              >
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                <circle cx="12" cy="10" r="3"></circle>
              </svg>
              <span>at {info.address || '123 Serenity Ave, Manila.'}</span>
            </div>
            <p>
              Positioned as "a serene escape in the heart of the city," Moonveil Hotel offers a peaceful sanctuary amidst the bustling energy of Manila. It is designed to give guests a relaxing retreat with easy access to city attractions, dining, and business districts, making it an ideal destination for both leisure travelers and staycationers looking for comfort and tranquility.
            </p>
          </div>
          <img src={images.location} alt="Moonveil Pool" />
        </div>

        {/* Card 4: Hotel Information & Policies */}
        <div className="turquoise-card full-col">
          <h2>Hotel Information & Policies</h2>
          <div className="policies-inner-grid" style={{ width: '100%', marginTop: '10px' }}>
            <div>
              <p><strong>Phone:</strong> {info.phone || '-'}</p>
              <p><strong>Email:</strong> {info.email || '-'}</p>
              <p><strong>Check-in:</strong> {info.check_in_time || '-'}</p>
              <p><strong>Check-out:</strong> {info.check_out_time || '-'}</p>
            </div>
            <div>
              <p><strong>Currency:</strong> {settings.currency || 'PHP'}</p>
              <p><strong>Tax Rate:</strong> {settings.tax_rate || '0'}%</p>
              <p><strong>Late Checkout Fee:</strong> ₱{settings.late_checkout_fee || '0'}</p>
              <p><strong>Extra Guest Fee:</strong> ₱{settings.extra_guest_fee || '0'}</p>
            </div>
          </div>
        </div>

        {/* Card 5: Contact Us Section */}
        <div className="turquoise-card full-col" style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <h2 style={{ fontSize: '2rem', marginBottom: '8px' }}>Do you have any questions?</h2>
          <p style={{ fontSize: '1.1rem', marginBottom: '24px', fontWeight: '600' }}>Contact us 😊</p>

          {submitted ? (
            <div style={{ padding: '20px', background: 'rgba(19, 47, 76, 0.1)', borderRadius: '10px', width: '100%' }}>
              <p style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>Thank you! Your message has been sent successfully. We will get back to you shortly.</p>
            </div>
          ) : (
            <form onSubmit={handleContactSubmit} style={{ width: '100%', maxWidth: '700px', textAlign: 'left' }}>
              {errorMsg && (
                <div style={{ padding: '10px', marginBottom: '16px', background: '#fadbd8', color: '#c0392b', borderRadius: '6px', fontWeight: '500' }}>
                  {errorMsg}
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <label style={{ color: '#132F4C', fontWeight: 'bold', fontSize: '0.88rem' }}>Name <span style={{ color: '#c0392b' }}>(Required)</span></label>
                  <input 
                    type="text" 
                    placeholder="First name" 
                    required
                    value={contactForm.firstName}
                    onChange={(e) => setContactForm({...contactForm, firstName: e.target.value})}
                    className="input" 
                    style={{ background: '#ffffff', color: '#132F4C', border: '1px solid #132F4C' }}
                  />
                </div>
                <div>
                  <label style={{ color: 'transparent', fontWeight: 'bold', fontSize: '0.88rem' }}>Last name</label>
                  <input 
                    type="text" 
                    placeholder="Last name" 
                    value={contactForm.lastName}
                    onChange={(e) => setContactForm({...contactForm, lastName: e.target.value})}
                    className="input" 
                    style={{ background: '#ffffff', color: '#132F4C', border: '1px solid #132F4C' }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ color: '#132F4C', fontWeight: 'bold', fontSize: '0.88rem' }}>E-mail <span style={{ color: '#c0392b' }}>(Required)</span></label>
                <input 
                  type="email" 
                  placeholder="Your email address" 
                  required
                  value={contactForm.email}
                  onChange={(e) => setContactForm({...contactForm, email: e.target.value})}
                  className="input" 
                  style={{ background: '#ffffff', color: '#132F4C', border: '1px solid #132F4C' }}
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ color: '#132F4C', fontWeight: 'bold', fontSize: '0.88rem' }}>Ask us anything <span style={{ color: '#c0392b' }}>(Required)</span></label>
                <textarea 
                  rows="4" 
                  placeholder="Type your message here..." 
                  required
                  maxLength="600"
                  value={contactForm.message}
                  onChange={(e) => setContactForm({...contactForm, message: e.target.value})}
                  className="input" 
                  style={{ background: '#ffffff', color: '#132F4C', border: '1px solid #132F4C' }}
                ></textarea>
                <div style={{ fontSize: '0.78rem', color: '#132F4C', textAlign: 'right', marginTop: '4px' }}>
                  {contactForm.message.length} of 600 max characters
                </div>
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="btn btn-gold btn-lg" 
                style={{ width: '100%', backgroundColor: '#132F4C', color: '#ffffff', opacity: loading ? 0.7 : 1 }}
              >
                {loading ? 'Sending...' : 'Send Message'}
              </button>
            </form>
          )}
        </div>

      </div>
    </div>
  );
}