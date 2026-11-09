import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';

export default function MyBookingsPage() {
  const { user } = useAuth();
  const nav = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  
  // Active Tab state: 'active' or 'history'
  const [activeTab, setActiveTab] = useState('active');

  // Modal Detail State
  const [selectedBooking, setSelectedBooking] = useState(null);

  // Review form states
  const [reviewingId, setReviewingId] = useState(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');

  const loadBookings = async () => {
    try {
      setLoading(true);
      const data = await api.myBookings();
      setBookings(data || []);
    } catch (e) {
      setErr('Failed to load bookings.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBookings();
  }, [user?.id]);

  const handleReviewSubmit = async (booking, e) => {
    e.preventDefault();
    if (!comment.trim()) {
      alert('Please enter a comment or feedback before submitting.');
      return;
    }

    try {
      const guestName = user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() : (booking.guestName || 'Guest');
      await api.submitBookingReview({
        bookingId: booking.id,
        roomId: booking.roomId || booking.room_id || null,
        roomName: booking.roomName || 'Room',
        guestName,
        rating: Number(rating),
        comment: comment.trim(),
      });
      setSuccessMsg('Thank you! Your feedback has been successfully submitted and is now visible in the admin dashboard.');
      setReviewingId(null);
      setComment('');
      setRating(5);
      loadBookings();
    } catch (e) {
      setErr(e.message || 'Failed to submit review.');
    }
  };

  const handlePrintReceipt = (booking) => {
    const roomNum = booking.roomNumber || booking.room_number || '301';
    const rawFloor = booking.floor || 'Floor 3';
    const floorNum = rawFloor.toString().toLowerCase().includes('floor') ? rawFloor : `Floor ${rawFloor}`;
    const totalPrice = Number(booking.totalPrice || 0);
    const paidOnline = Number(booking.downpaymentAmount || totalPrice * 0.5);
    const balance = Number(booking.remainingBalance || 0);
    const isFullPayment = balance === 0;

    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Receipt - ${booking.bookingReference || booking.id}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 30px; color: #333; }
            .header { text-align: center; border-bottom: 2px solid #d4af37; padding-bottom: 15px; margin-bottom: 20px; }
            .header h1 { color: #0f2a3c; margin: 0; }
            .details { margin-bottom: 20px; line-height: 1.6; }
            .financials { background: #f9f9f9; padding: 15px; border-radius: 6px; margin-bottom: 20px; }
            .financials p { margin: 6px 0; display: flex; justify-content: space-between; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Moonveil Hotel</h1>
            <p>Official Online Payment & Booking Receipt</p>
          </div>
          <div class="details">
            <p><strong>Reference Code:</strong> ${booking.bookingReference || `BK-${booking.id}`}</p>
            <p><strong>Guest Name:</strong> ${booking.guestName}</p>
            <p><strong>Room:</strong> ${booking.roomName} (${floorNum} — Room ${roomNum})</p>
            <p><strong>Check-In:</strong> ${booking.checkIn}</p>
            <p><strong>Check-Out:</strong> ${booking.checkOut}</p>
            <p><strong>Payment Status:</strong> ${booking.paymentStatus}</p>
          </div>
          <div class="financials">
            <p><span>Total Room Cost:</span> <strong>₱${totalPrice.toFixed(2)}</strong></p>
            <p><span>Amount Paid Online (${isFullPayment ? 'Full Payment' : '50% Downpayment'}):</span> <strong style="color: #2e7d32;">₱${paidOnline.toFixed(2)}</strong></p>
            <p><span>Remaining Balance Due at Hotel:</span> <strong style="color: #e65100;">₱${balance.toFixed(2)}</strong></p>
          </div>
          <script>window.onload = function() { window.print(); }</script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const getRoomImageUrl = (b) => {
    if (b.roomImage && typeof b.roomImage === 'string') {
      if (b.roomImage.startsWith('http')) return b.roomImage;
      if (b.roomImage.startsWith('[')) {
        try {
          const parsed = JSON.parse(b.roomImage);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed[0];
        } catch (e) {}
      }
    }
    return b.roomImage || 'https://images.unsplash.com/photo-1611892440504-42a792e24d32';
  };

  if (loading) return <div className="loading">Loading your bookings…</div>;

  const now = new Date();
  now.setHours(0, 0, 0, 0);

  const activeBookings = bookings.filter(b => {
    if (b.status === 'Cancelled') return false;
    const checkOutDate = new Date(b.checkOut);
    return checkOutDate >= now;
  });

  const pastBookings = bookings.filter(b => {
    if (b.status === 'Cancelled') return true;
    const checkOutDate = new Date(b.checkOut);
    return checkOutDate < now;
  });

  return (
    <div className="section" style={{ maxWidth: '1100px', margin: '0 auto', padding: '20px' }}>
      <h1 style={{ marginBottom: '5px' }}>My Stays</h1>
      <p className="muted" style={{ marginBottom: '24px' }}>Manage your active reservations or explore your past stay history and reviews.</p>

      {err && <div className="error" style={{ marginBottom: '16px', color: '#ff5252' }}>{err}</div>}
      {successMsg && <div className="success" style={{ marginBottom: '16px', color: 'var(--gold)' }}>{successMsg}</div>}

      <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr', gap: '30px', alignItems: 'start' }}>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <button 
            onClick={() => setActiveTab('active')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px 18px',
              textAlign: 'left',
              borderRadius: '6px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              border: 'none',
              background: activeTab === 'active' ? 'var(--gold, #d4af37)' : 'rgba(15,42,60,0.8)',
              color: activeTab === 'active' ? '#0a1922' : '#fff',
              transition: 'background 0.2s ease, color 0.2s ease',
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
            My Bookings ({activeBookings.length})
          </button>

          <button 
            onClick={() => setActiveTab('history')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px 18px',
              textAlign: 'left',
              borderRadius: '6px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              border: 'none',
              background: activeTab === 'history' ? 'var(--gold, #d4af37)' : 'rgba(15,42,60,0.8)',
              color: activeTab === 'history' ? '#0a1922' : '#fff',
              transition: 'background 0.2s ease, color 0.2s ease',
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12 6 12 12 16 14"></polyline>
            </svg>
            Booking History ({pastBookings.length})
          </button>
        </div>

        <div>
          {activeTab === 'active' && (
            <div>
              <h2 style={{ fontSize: '1.4rem', color: '#fff', marginBottom: '15px' }}>Upcoming / Active Stays</h2>
              {activeBookings.length === 0 ? (
                <div className="card" style={{ padding: '30px', textAlign: 'center' }}>
                  <p className="muted">You have no active bookings at the moment.</p>
                  <button className="btn btn-gold" onClick={() => nav('/rooms')} style={{ marginTop: '12px' }}>
                    Browse Rooms
                  </button>
                </div>
              ) : (
                <div style={{ display: 'grid', gap: '20px' }}>
                  {activeBookings.map(booking => renderBookingCard(booking, false))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'history' && (
            <div>
              <h2 style={{ fontSize: '1.4rem', color: '#fff', marginBottom: '15px' }}>Booking History & Past Stays</h2>
              {pastBookings.length === 0 ? (
                <div className="card" style={{ padding: '30px', textAlign: 'center' }}>
                  <p className="muted">No past booking history found.</p>
                </div>
              ) : (
                <div style={{ display: 'grid', gap: '20px' }}>
                  {pastBookings.map(booking => renderBookingCard(booking, true))}
                </div>
              )}
            </div>
          )}
        </div>

      </div>

      {selectedBooking && renderRoomDetailModal(selectedBooking)}
    </div>
  );

  function renderBookingCard(booking, isPast) {
    const isPaid = booking.paymentStatus === 'Paid';
    const isCancelled = booking.status === 'Cancelled';
    const roomNum = booking.roomNumber || booking.room_number || '301';
    
    const rawFloor = booking.floor || '3';
    const floorNum = rawFloor.toString().toLowerCase().includes('floor') ? rawFloor : `Floor ${rawFloor}`;

    const totalPrice = Number(booking.totalPrice || 0);
    const paidOnline = Number(booking.downpaymentAmount || totalPrice * 0.5);
    const balance = Number(booking.remainingBalance || 0);
    const isFullPayment = balance === 0;

    return (
      <div 
        key={booking.id} 
        className="card" 
        style={{ 
          padding: '24px', 
          borderRadius: '12px', 
          background: isCancelled ? 'rgba(15,28,38,0.85)' : 'rgba(15,42,60,0.92)', 
          border: `1px solid ${isCancelled ? 'rgba(244,67,54,0.3)' : 'var(--bg-border)'}` 
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '10px' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#fff' }}>{booking.roomName}</h3>
            <span style={{ fontSize: '12px', color: 'var(--gold)', fontWeight: '600' }}>
              Ref: {booking.bookingReference || `BK-${booking.id}`}
            </span>
          </div>
          <span style={{ padding: '4px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: 'bold', background: isCancelled ? 'rgba(244,67,54,0.15)' : 'rgba(76,175,80,0.15)', color: isCancelled ? '#ff5252' : '#4caf50' }}>
            {booking.status}
          </span>
        </div>

        <div style={{ fontSize: '14px', color: '#e0e0e0', marginBottom: '10px' }}>
          <div><strong>Check-In:</strong> {booking.checkIn} &nbsp;|&nbsp; <strong>Check-Out:</strong> {booking.checkOut}</div>
          <div><strong>Location:</strong> {floorNum} — Room {roomNum}</div>
        </div>

        <div style={{ background: 'rgba(0,0,0,0.2)', padding: '10px 14px', borderRadius: '8px', marginBottom: '12px', fontSize: '13px', color: '#ccc' }}>
          <div><span>Paid Online ({isFullPayment ? 'Full Payment' : '50% Downpayment'}):</span> <strong style={{ color: '#4caf50' }}>₱{paidOnline.toFixed(2)}</strong></div>
          <div><span>Balance Due at Hotel:</span> <strong style={{ color: isFullPayment ? '#4caf50' : '#ff9800' }}>₱{balance.toFixed(2)}</strong></div>
        </div>

        <div style={{ margin: '12px 0 6px' }}>
          <button 
            className="btn btn-ghost btn-sm" 
            onClick={() => setSelectedBooking(booking)}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
              <circle cx="12" cy="12" r="3"></circle>
            </svg>
            View Room Details
          </button>
        </div>

        {isPast && !isCancelled && (
          <div style={{ marginTop: '15px', background: 'rgba(0,0,0,0.25)', padding: '15px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
            {booking.rating ? (
              <div>
                <div style={{ color: 'var(--gold)', fontWeight: 'bold' }}>
                  <span style={{ color: '#d4af37' }}>{'★'.repeat(Number(booking.rating) || 5)}</span> Your Rating: {booking.rating} / 5 Stars
                </div>
                <p style={{ fontSize: '13px', color: '#ccc', margin: '5px 0 0 0' }}>"{booking.reviewComment || 'No comment provided.'}"</p>
              </div>
            ) : (
              <div>
                {reviewingId === booking.id ? (
                  <form onSubmit={(e) => handleReviewSubmit(booking, e)} style={{ display: 'grid', gap: '10px' }}>
                    <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#fff' }}>Rate your stay & leave a comment:</div>
                    <select 
                      value={rating} 
                      onChange={(e) => setRating(e.target.value)} 
                      style={{ padding: '8px', borderRadius: '4px', background: '#0a1922', color: '#fff', border: '1px solid #333' }}
                    >
                      <option value="5">★★★★★ 5 - Excellent</option>
                      <option value="4">★★★★ 4 - Very Good</option>
                      <option value="3">★★★ 3 - Average</option>
                      <option value="2">★★ 2 - Poor</option>
                      <option value="1">★ 1 - Terrible</option>
                    </select>
                    <textarea 
                      placeholder="Share details about your experience..." 
                      value={comment} 
                      onChange={(e) => setComment(e.target.value)}
                      style={{ padding: '8px', borderRadius: '4px', background: '#0a1922', color: '#fff', border: '1px solid #333' }}
                      rows="2"
                    />
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button type="submit" className="btn btn-gold btn-sm">Submit Review</button>
                      <button type="button" className="btn btn-ghost btn-sm" onClick={() => setReviewingId(null)}>Cancel</button>
                    </div>
                  </form>
                ) : (
                  <button className="btn btn-gold btn-sm" onClick={() => setReviewingId(booking.id)}>
                    Leave a Review & Rating
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '12px', marginTop: '12px' }}>
          <div style={{ fontSize: '16px', fontWeight: 'bold', color: 'var(--gold)' }}>
            Total Stay Cost: ₱{totalPrice.toFixed(2)}
          </div>
          {isPaid && (
            <button type="button" className="btn btn-gold btn-sm" onClick={() => handlePrintReceipt(booking)}>
              Print Receipt
            </button>
          )}
        </div>
      </div>
    );
  }

  function renderRoomDetailModal(booking) {
    const displayImg = getRoomImageUrl(booking);
    
    let amenitiesList = ['WiFi', 'AirCon', 'Mini Bar', 'Bathtub'];
    if (booking.roomAmenities) {
      if (Array.isArray(booking.roomAmenities)) {
        amenitiesList = booking.roomAmenities;
      } else if (typeof booking.roomAmenities === 'string') {
        amenitiesList = booking.roomAmenities.split(',').map(a => a.trim());
      }
    }

    const maxGuests = booking.maxGuests || 2;
    const bedType = booking.bedType || '1 King Bed';

    return (
      <div 
        style={{ 
          position: 'fixed', 
          top: 0, 
          left: 0, 
          right: 0, 
          bottom: 0, 
          background: 'rgba(0,0,0,0.75)', 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          zIndex: 1000,
          padding: '20px'
        }}
        onClick={() => setSelectedBooking(null)}
      >
        <div 
          className="card" 
          style={{ 
            maxWidth: '560px', 
            width: '100%', 
            maxHeight: '90vh', 
            overflowY: 'auto', 
            padding: 0, 
            borderRadius: '12px', 
            background: '#0a1922', 
            border: '1px solid var(--gold)' 
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div style={{ width: '100%', height: '220px', position: 'relative', overflow: 'hidden' }}>
            <img 
              src={displayImg} 
              alt={booking.roomName} 
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = 'https://images.unsplash.com/photo-1611892440504-42a792e24d32';
              }}
            />
            <button 
              onClick={() => setSelectedBooking(null)}
              style={{ 
                position: 'absolute', 
                top: '12px', 
                right: '12px', 
                background: 'rgba(0,0,0,0.6)', 
                color: '#fff', 
                border: 'none', 
                borderRadius: '50%', 
                width: '32px', 
                height: '32px', 
                cursor: 'pointer',
                fontSize: '16px',
                fontWeight: 'bold'
              }}
            >
              ✕
            </button>
          </div>

          <div style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
              <h2 style={{ margin: 0, fontSize: '1.4rem', color: '#fff' }}>{booking.roomName}</h2>
              <span style={{ fontSize: '12px', color: 'var(--gold)', fontWeight: 'bold' }}>
                Ref: {booking.bookingReference || `BK-${booking.id}`}
              </span>
            </div>

            <p style={{ fontSize: '13px', color: '#a0b0c0', margin: '0 0 16px 0' }}>
              {bedType} &bull; Max {maxGuests} Guests
            </p>

            {booking.roomDescription && (
              <p style={{ fontSize: '13px', color: '#ccc', lineHeight: '1.5', marginBottom: '18px' }}>
                {booking.roomDescription}
              </p>
            )}

            <div style={{ marginBottom: '20px' }}>
              <div style={{ fontSize: '13px', fontWeight: 'bold', color: 'var(--gold)', marginBottom: '10px' }}>
                Included Amenities:
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {amenitiesList.map((item, idx) => (
                  <span 
                    key={idx} 
                    style={{ 
                      background: 'rgba(212,175,55,0.12)', 
                      border: '1px solid rgba(212,175,55,0.3)', 
                      color: '#e0e0e0', 
                      padding: '4px 10px', 
                      borderRadius: '4px', 
                      fontSize: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px'
                    }}
                  >
                    <span style={{ color: 'var(--gold)' }}>✓</span> {item}
                  </span>
                ))}
              </div>
            </div>

            <div style={{ background: 'rgba(0,0,0,0.3)', padding: '14px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#ddd', marginBottom: '6px' }}>
                <span>Check-In Date:</span>
                <strong>{booking.checkIn}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#ddd', marginBottom: '6px' }}>
                <span>Check-Out Date:</span>
                <strong>{booking.checkOut}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#ddd' }}>
                <span>Total Stay Price:</span>
                <strong style={{ color: 'var(--gold)' }}>₱{Number(booking.totalPrice || 0).toFixed(2)}</strong>
              </div>
            </div>

            <div style={{ marginTop: '20px', textAlign: 'right' }}>
              <button className="btn btn-gold" onClick={() => setSelectedBooking(null)}>
                Close Details
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
}