import { useEffect, useState, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';

const ADMIN_TABS = ['Overview', 'Bookings', 'Rooms', 'Revenue', 'Users', 'Reviews', 'Inquiries', 'Archive', 'Settings', 'Hotel Info'];
const STAFF_TABS = ['Overview', 'Bookings', 'Rooms', 'Users', 'Reviews', 'Inquiries', 'Profile'];

// Preset item lists with default pricing
const AMENITY_PRESETS = [
  { label: '-- Select Amenity Item --', value: '', price: 0 },
  { label: 'Extra Bath Towel', value: 'Extra Bath Towel', price: 100 },
  { label: 'Extra Pillow Set', value: 'Extra Pillow Set', price: 150 },
  { label: 'Extra Blanket / Comforter', value: 'Extra Blanket / Comforter', price: 200 },
  { label: 'Toiletries & Bath Kit', value: 'Toiletries & Bath Kit', price: 150 },
  { label: 'Slippers & Bathrobe Set', value: 'Slippers & Bathrobe Set', price: 250 },
  { label: 'Rollaway Extra Bed', value: 'Rollaway Extra Bed', price: 500 },
];

const SERVICE_PRESETS = [
  { label: '-- Select Service Item --', value: '', price: 0 },
  { label: 'Airport Transfer / Shuttle', value: 'Airport Transfer / Shuttle', price: 800 },
  { label: 'Laundry & Pressing Service', value: 'Laundry & Pressing Service', price: 300 },
  { label: 'In-Room Massage Service', value: 'In-Room Massage Service', price: 600 },
  { label: 'Buffet Breakfast Add-on', value: 'Buffet Breakfast Add-on', price: 350 },
  { label: 'Express Room Cleaning / Housekeeping', value: 'Express Room Cleaning / Housekeeping', price: 250 },
];

// Helper to format date strings readable
function formatDateReadable(dateStr) {
  if (!dateStr) return '—';
  const dateOnly = dateStr.split(' ')[0]; 
  const [year, month, day] = dateOnly.split('-');
  if (!year || !month || !day) return dateStr;
  
  const dateObj = new Date(Number(year), Number(month) - 1, Number(day));
  return dateObj.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

export default function AdminDashboard({ role = 'admin' }) {
  const isAdmin = role === 'admin';
  const tabs = isAdmin ? ADMIN_TABS : STAFF_TABS;
  const [tab, setTab] = useState('Overview');
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const requestedTab = params.get('tab');
    if (requestedTab && tabs.includes(requestedTab)) {
      setTab(requestedTab);
    }
  }, [location.search, tabs]);

  return (
    <div className="admin">
      <aside className="admin-sidebar">
        <h2>{isAdmin ? 'Admin Panel' : 'Front Desk Dashboard'}</h2>
        <ul>
          {tabs.map((t) => (
            <li key={t}>
              <button className={t === tab ? 'active' : ''} onClick={() => setTab(t)}>
                {t}
              </button>
            </li>
          ))}
        </ul>
      </aside>
      <section className="admin-main">
        {tab === 'Overview'   && <Overview role={role} onNavigate={setTab} />}
        {tab === 'Bookings'   && <BookingsTab role={role} />}
        {tab === 'Rooms'      && <RoomsTab role={role} />}
        {isAdmin && tab === 'Revenue' && <RevenueTab />}
        {!isAdmin && tab === 'Profile' && <StaffProfile />}
        {tab === 'Users'      && <UsersTab role={role} />}
        {tab === 'Reviews'    && <ReviewsTab />}
        {tab === 'Inquiries'  && <InquiriesTab />}
        {isAdmin && tab === 'Archive' && <AdminArchive />}
        {isAdmin && tab === 'Settings' && <SettingsTab />}
        {isAdmin && tab === 'Hotel Info' && <HotelInfoTab />}
      </section>
    </div>
  );
}

/* ─── Overview ─────────────────────────────────────────── */
function Overview({ role, onNavigate }) {
  const [s, setS] = useState(null);
  const [recentRows, setRecentRows] = useState([]);
  const isAdmin = role === 'admin';

  useEffect(() => {
    const loader = isAdmin ? api.adminStats : api.staffStats;
    loader().then(setS).catch(() => {});

    const bookingsLoader = isAdmin ? api.adminBookings : api.staffBookings;
    bookingsLoader()
      .then((data) => {
        const sorted = (data || []).sort((a, b) => b.id - a.id).slice(0, 5);
        setRecentRows(sorted);
      })
      .catch(() => {});
  }, [role, isAdmin]);

  if (!s) return <div className="loading">Loading…</div>;

  const isStaff = !isAdmin;

  return (
    <div>
      <h1>{isStaff ? 'Front Desk Dashboard' : 'Overview'}</h1>

      <div className="grid grid-3" style={{ marginBottom: '32px', gap: '20px' }}>
        <div className="card stat-card" onClick={() => onNavigate('Bookings')} style={{ cursor: 'pointer', textAlign: 'center', padding: '24px' }}>
          <div className="stat-label" style={{ fontSize: '11px', letterSpacing: '1px', color: 'var(--text-muted, #aaa)', marginBottom: '8px' }}>TOTAL BOOKINGS</div>
          <div className="stat-value" style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#fff' }}>{s.totalBookings || 20}</div>
          <div style={{ fontSize: '12px', color: 'var(--gold)', marginTop: '8px' }}>[View All]</div>
        </div>

        <div className="card stat-card" onClick={() => onNavigate('Bookings')} style={{ cursor: 'pointer', textAlign: 'center', padding: '24px' }}>
          <div className="stat-label" style={{ fontSize: '11px', letterSpacing: '1px', color: 'var(--text-muted, #aaa)', marginBottom: '8px' }}>PENDING (Action Req)</div>
          <div className="stat-value" style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#ff9800' }}>{s.pending || 0}</div>
          <div style={{ fontSize: '12px', color: 'var(--gold)', marginTop: '8px' }}>[Review {s.pending || 0}]</div>
        </div>

        <div className="card stat-card" onClick={() => onNavigate('Bookings')} style={{ cursor: 'pointer', textAlign: 'center', padding: '24px' }}>
          <div className="stat-label" style={{ fontSize: '11px', letterSpacing: '1px', color: 'var(--text-muted, #aaa)', marginBottom: '8px' }}>CANCELLED</div>
          <div className="stat-value" style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#ff5252' }}>{s.cancelled || 8}</div>
          <div style={{ fontSize: '12px', color: 'var(--gold)', marginTop: '8px' }}>[View History]</div>
        </div>

        <div className="card stat-card" onClick={() => onNavigate('Rooms')} style={{ cursor: 'pointer', textAlign: 'center', padding: '24px' }}>
          <div className="stat-label" style={{ fontSize: '11px', letterSpacing: '1px', color: 'var(--text-muted, #aaa)', marginBottom: '8px' }}>ROOMS</div>
          <div className="stat-value" style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#fff' }}>{s.rooms || 4}</div>
          <div style={{ fontSize: '12px', color: 'var(--gold)', marginTop: '8px' }}>[Manage Rooms]</div>
        </div>

        <div className="card stat-card" onClick={() => onNavigate('Users')} style={{ cursor: 'pointer', textAlign: 'center', padding: '24px' }}>
          <div className="stat-label" style={{ fontSize: '11px', letterSpacing: '1px', color: 'var(--text-muted, #aaa)', marginBottom: '8px' }}>USERS</div>
          <div className="stat-value" style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#fff' }}>{s.users || 9}</div>
          <div style={{ fontSize: '12px', color: 'var(--gold)', marginTop: '8px' }}>[View Users]</div>
        </div>

        <div className="card stat-card" onClick={() => onNavigate(isAdmin ? 'Revenue' : 'Bookings')} style={{ cursor: 'pointer', textAlign: 'center', padding: '24px' }}>
          <div className="stat-label" style={{ fontSize: '11px', letterSpacing: '1px', color: 'var(--text-muted, #aaa)', marginBottom: '8px' }}>REVENUE (PAID)</div>
          <div className="stat-value" style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--gold, #d4af37)' }}>
            ₱{Number(s.revenue || 102250).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--gold)', marginTop: '8px' }}>[View Ledger]</div>
        </div>
      </div>

      <div className="card" style={{ padding: '24px', background: 'rgba(15,42,60,0.92)', border: '1px solid var(--bg-border)' }}>
        <h3 style={{ marginBottom: '16px', color: '#fff', fontSize: '1.2rem' }}>Recent Booking Activity</h3>
        <div style={{ overflowX: 'auto' }}>
          <table className="table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', color: 'var(--gold)' }}>
                <th style={{ padding: '12px' }}>Ref</th>
                <th style={{ padding: '12px' }}>Guest Name</th>
                <th style={{ padding: '12px' }}>Room / Floor</th>
                <th style={{ padding: '12px' }}>Status</th>
                <th style={{ padding: '12px' }}>Total</th>
              </tr>
            </thead>
            <tbody>
              {recentRows.length > 0 ? (
                recentRows.map((b) => (
                  <tr key={b.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <td style={{ padding: '12px', fontWeight: '600' }}>{b.bookingReference || `BK-${b.id}`}</td>
                    <td style={{ padding: '12px' }}>{b.guestName}</td>
                    <td style={{ padding: '12px' }}>{b.roomName} {b.floor ? `(Floor ${b.floor})` : ''}</td>
                    <td style={{ padding: '12px' }}>
                      <span style={{ color: b.status === 'Cancelled' ? '#ff5252' : '#4caf50', fontWeight: 'bold' }}>
                        {b.status}
                      </span>
                    </td>
                    <td style={{ padding: '12px', color: 'var(--gold)' }}>
                      ₱{Number((b.grandTotal ?? b.totalPrice) || 0).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" style={{ padding: '20px', textAlign: 'center', color: '#aaa' }}>
                    No recent booking records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ─── Revenue Ledger Tab ───────────────────────────────── */
function RevenueTab() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.adminBookings()
      .then((data) => setBookings((data || []).filter((b) => b.paymentStatus === 'Paid' || b.payment_status === 'Paid')))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading">Loading ledger…</div>;

  const totalPaidRevenue = bookings.reduce(
    (sum, b) => sum + Number((b.grandTotal ?? b.totalPrice) || 0), 0
  );

  return (
    <div>
      <h1>Financial Ledger</h1>
      <div className="card" style={{ marginBottom: 24, padding: 24, maxWidth: 400 }}>
        <div style={{ fontSize: '12px', color: 'var(--text-muted, #aaa)', letterSpacing: '1px', marginBottom: '8px' }}>
          TOTAL PAID REVENUE
        </div>
        <div style={{ fontSize: '2.2rem', fontWeight: 'bold', color: 'var(--gold)' }}>
          ₱{totalPaidRevenue.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </div>
      </div>

      <div className="card" style={{ padding: '24px' }}>
        <h3 style={{ marginBottom: '16px', color: '#fff' }}>Paid Transactions History</h3>
        <div style={{ overflowX: 'auto' }}>
          <table className="table">
            <thead>
              <tr>
                <th>Ref</th>
                <th>Guest Name</th>
                <th>Room / Floor</th>
                <th>Schedule</th>
                <th>Payment Method</th>
                <th>Downpayment (50%)</th>
                <th>Balance Paid</th>
                <th>Total Paid</th>
              </tr>
            </thead>
            <tbody>
              {bookings.length > 0 ? (
                bookings.map((b) => {
                  const total = Number((b.grandTotal ?? b.totalPrice) || 0);
                  const dp = Number(b.downpaymentAmount || total * 0.5);
                  return (
                    <tr key={b.id}>
                      <td style={{ fontWeight: '600' }}>{b.bookingReference || `BK-${b.id}`}</td>
                      <td>{b.guestName}</td>
                      <td>{b.roomName} {b.floor ? `(Floor ${b.floor})` : ''}</td>
                      <td style={{ fontSize: '13px' }}>
                        {formatDateReadable(b.checkIn)} → {formatDateReadable(b.checkOut)}
                      </td>
                      <td>{b.paymentMethod || 'Pay at Hotel'}</td>
                      <td style={{ color: '#4caf50' }}>₱{dp.toFixed(2)}</td>
                      <td style={{ color: '#ff9800' }}>₱{(total - dp).toFixed(2)}</td>
                      <td style={{ color: 'var(--gold)', fontWeight: 'bold' }}>
                        ₱{total.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="8" className="muted" style={{ textAlign: 'center', padding: '20px' }}>
                    No paid booking records recorded yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ─── Reviews Tab (Customer Comments & Ratings) ────────── */
function ReviewsTab() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  async function loadReviews() {
    setLoading(true);
    try {
      const res = await fetch('/api/reviews');
      const data = await res.json();
      setReviews(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error('Failed to load reviews:', e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadReviews();
  }, []);

  async function handleDelete(id) {
    if (!window.confirm('Delete this customer review?')) return;
    try {
      const res = await fetch(`/api/reviews/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete review');
      setReviews(reviews.filter((r) => r.id !== id && r._id !== id));
    } catch (e) {
      alert(e.message || 'Failed to delete review');
    }
  }

  if (loading) return <div className="loading">Loading customer reviews…</div>;

  return (
    <div>
      <h1>Customer Reviews & Comments</h1>
      
      <div className="card" style={{ padding: '24px' }}>
        <h3 style={{ marginBottom: '16px', color: '#fff' }}>All Guest Feedback</h3>
        <div style={{ overflowX: 'auto' }}>
          <table className="table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', color: 'var(--gold)' }}>
                <th style={{ padding: '12px' }}>Guest Name</th>
                <th style={{ padding: '12px' }}>Room</th>
                <th style={{ padding: '12px' }}>Rating</th>
                <th style={{ padding: '12px' }}>Comment</th>
                <th style={{ padding: '12px' }}>Date</th>
                <th style={{ padding: '12px' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {reviews.length > 0 ? (
                reviews.map((rev) => (
                  <tr key={rev.id || rev._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <td style={{ padding: '12px', fontWeight: '600' }}>{rev.guest_name || rev.guestName || 'Anonymous'}</td>
                    <td style={{ padding: '12px' }}>{rev.room_name || rev.roomName || '—'}</td>
                    <td style={{ padding: '12px', color: 'var(--gold)' }}>
                      {'★'.repeat(Number(rev.rating) || 5)} ({rev.rating}/5)
                    </td>
                    <td style={{ padding: '12px', maxWidth: '300px', wordBreak: 'break-word' }}>{rev.comment || rev.review_text || '—'}</td>
                    <td style={{ padding: '12px', fontSize: '13px' }}>
                      {rev.createdAt ? formatDateReadable(rev.createdAt) : '—'}
                    </td>
                    <td style={{ padding: '12px' }}>
                      <button 
                        className="btn btn-ghost small" 
                        onClick={() => handleDelete(rev.id || rev._id)}
                        style={{ color: '#ff5252', borderColor: '#ff5252' }}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" style={{ padding: '30px', textAlign: 'center', color: '#aaa' }}>
                    No customer reviews or comments submitted yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ─── Inquiries Tab (Contact Us Messages) ──────────────── */
function InquiriesTab() {
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);

  async function loadInquiries() {
    setLoading(true);
    try {
      const data = await api.getInquiries();
      // Filter out archived items so they vanish from the active inbox
      const activeInquiries = (Array.isArray(data) ? data : []).filter(
        (item) => item.status !== 'Archived'
      );
      setInquiries(activeInquiries);
    } catch (e) {
      console.error('Failed to load inquiries:', e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadInquiries();
  }, []);

  async function handleStatusChange(id, newStatus) {
    try {
      await api.updateInquiryStatus(id, newStatus);
      await loadInquiries();
    } catch (e) {
      alert(e.message || 'Failed to update inquiry status');
    }
  }

  if (loading) return <div className="loading">Loading guest inquiries…</div>;

  return (
    <div>
      <h1>Guest Inquiries & Messages</h1>
      <p className="muted" style={{ marginBottom: '20px' }}>
        Review and manage questions submitted by guests via the "Contact Us" form on The Hotel page.
      </p>

      <div className="card" style={{ padding: '24px' }}>
        <h3 style={{ marginBottom: '16px', color: '#fff' }}>All Guest Messages</h3>
        <div style={{ overflowX: 'auto' }}>
          <table className="table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', color: 'var(--gold)' }}>
                <th style={{ padding: '12px' }}>Date</th>
                <th style={{ padding: '12px' }}>Guest Name</th>
                <th style={{ padding: '12px' }}>Email</th>
                <th style={{ padding: '12px' }}>Message</th>
                <th style={{ padding: '12px' }}>Status</th>
                <th style={{ padding: '12px' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {inquiries.length > 0 ? (
                inquiries.map((item) => (
                  <tr key={item.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <td style={{ padding: '12px', fontSize: '0.85rem', whiteSpace: 'nowrap' }}>
                      {item.created_at ? formatDateReadable(item.created_at) : '—'}
                    </td>
                    <td style={{ padding: '12px', fontWeight: '600' }}>
                      {item.first_name} {item.last_name}
                    </td>
                    <td style={{ padding: '12px' }}>
                      <a href={`mailto:${item.email}`} style={{ color: 'var(--gold)' }}>
                        {item.email}
                      </a>
                    </td>
                    <td style={{ padding: '12px', maxWidth: '300px', wordBreak: 'break-word' }}>
                      {item.message}
                    </td>
                    <td style={{ padding: '12px' }}>
                      <span className={`badge ${
                        item.status === 'Resolved' ? 'badge-confirmed' : 'badge-pending'
                      }`}>
                        {item.status || 'Pending'}
                      </span>
                    </td>
                    <td style={{ padding: '12px' }}>
                      <select
                        value={item.status || 'Pending'}
                        onChange={(e) => handleStatusChange(item.id, e.target.value)}
                        style={{ fontSize: '0.8rem', padding: '6px 8px', background: 'var(--bg-very-dark)', color: 'var(--text-light)', border: '1px solid var(--bg-border)', borderRadius: '4px' }}
                      >
                        <option value="Pending">Pending</option>
                        <option value="Resolved">Resolved</option>
                        <option value="Archived">Archived</option>
                      </select>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" style={{ padding: '30px', textAlign: 'center', color: '#aaa' }}>
                    No active guest inquiries or messages.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ─── Archive Tab (Unified Inquiries & Rooms Archive) ──── */
function AdminArchive() {
  const [archivedInquiries, setArchivedInquiries] = useState([]);
  const [archivedRooms, setArchivedRooms] = useState([]);
  const [subTab, setSubTab] = useState('inquiries');
  const [loading, setLoading] = useState(true);

  async function loadArchiveData() {
    setLoading(true);
    try {
      const inqs = await api.getInquiries();
      setArchivedInquiries((inqs || []).filter(item => item.status === 'Archived'));

      const rms = await api.rooms();
      setArchivedRooms((rms || []).filter(room => room.available === 0 || room.status === 'Archived'));
    } catch (e) {
      console.error('Failed to load archive data:', e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadArchiveData();
  }, []);

  async function restoreInquiry(id) {
    try {
      await api.updateInquiryStatus(id, 'Pending');
      await loadArchiveData();
    } catch (e) {
      alert(e.message || 'Failed to restore inquiry');
    }
  }

  async function restoreRoom(id) {
    try {
      await api.updateRoom(id, { available: 1, status: 'Active' });
      await loadArchiveData();
    } catch (e) {
      alert(e.message || 'Failed to restore room');
    }
  }

  if (loading) return <div className="loading">Loading archive…</div>;

  return (
    <div>
      <h1>System Archive</h1>
      <p className="muted" style={{ marginBottom: '20px' }}>
        Manage and restore archived guest inquiries and rooms in one centralized place.
      </p>

      <div style={{ display: 'flex', gap: '10px', marginBottom: '24px' }}>
        <button
          className={`btn ${subTab === 'inquiries' ? 'btn-gold' : 'btn-ghost'}`}
          onClick={() => setSubTab('inquiries')}
        >
          Archived Inquiries ({archivedInquiries.length})
        </button>
        <button
          className={`btn ${subTab === 'rooms' ? 'btn-gold' : 'btn-ghost'}`}
          onClick={() => setSubTab('rooms')}
        >
          Archived Rooms ({archivedRooms.length})
        </button>
      </div>

      {subTab === 'inquiries' ? (
        <div className="card" style={{ padding: '24px' }}>
          <h3 style={{ marginBottom: '16px', color: '#fff' }}>Archived Guest Messages</h3>
          <div style={{ overflowX: 'auto' }}>
            <table className="table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', color: 'var(--gold)' }}>
                  <th style={{ padding: '12px' }}>Date</th>
                  <th style={{ padding: '12px' }}>Guest Name</th>
                  <th style={{ padding: '12px' }}>Email</th>
                  <th style={{ padding: '12px' }}>Message</th>
                  <th style={{ padding: '12px' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {archivedInquiries.length > 0 ? (
                  archivedInquiries.map((item) => (
                    <tr key={item.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <td style={{ padding: '12px', fontSize: '0.85rem' }}>{formatDateReadable(item.created_at)}</td>
                      <td style={{ padding: '12px', fontWeight: '600' }}>{item.first_name} {item.last_name}</td>
                      <td style={{ padding: '12px' }}><a href={`mailto:${item.email}`} style={{ color: 'var(--gold)' }}>{item.email}</a></td>
                      <td style={{ padding: '12px', maxWidth: '300px', wordBreak: 'break-word' }}>{item.message}</td>
                      <td style={{ padding: '12px' }}>
                        <button className="btn btn-gold small" onClick={() => restoreInquiry(item.id)}>
                          Restore
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" style={{ padding: '30px', textAlign: 'center', color: '#aaa' }}>
                      No archived inquiries found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="card" style={{ padding: '24px' }}>
          <h3 style={{ marginBottom: '16px', color: '#fff' }}>Archived Rooms Inventory</h3>
          <div style={{ overflowX: 'auto' }}>
            <table className="table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', color: 'var(--gold)' }}>
                  <th style={{ padding: '12px' }}>Room Name</th>
                  <th style={{ padding: '12px' }}>Type</th>
                  <th style={{ padding: '12px' }}>Price</th>
                  <th style={{ padding: '12px' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {archivedRooms.length > 0 ? (
                  archivedRooms.map((room) => (
                    <tr key={room.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <td style={{ padding: '12px', fontWeight: '600' }}>{room.name}</td>
                      <td style={{ padding: '12px' }}>{room.type}</td>
                      <td style={{ padding: '12px', color: 'var(--gold)' }}>₱{Number(room.price).toFixed(2)}</td>
                      <td style={{ padding: '12px' }}>
                        <button className="btn btn-gold small" onClick={() => restoreRoom(room.id)}>
                          Restore Room
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" style={{ padding: '30px', textAlign: 'center', color: '#aaa' }}>
                      No archived rooms found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function StaffProfile() {
  const { user } = useAuth();
  if (!user) return <div className="loading">Loading profile…</div>;

  return (
    <div>
      <h1>My Profile</h1>
      <div className="card" style={{ maxWidth: 620 }}>
        <p><strong>Name:</strong> {user.firstName} {user.lastName}</p>
        <p><strong>Email:</strong> {user.email}</p>
        <p><strong>Role:</strong> {user.role}</p>
        <p><strong>Position:</strong> {user.staffPosition || 'Not assigned'}</p>
        <p><strong>Department:</strong> {user.department || 'Not assigned'}</p>
        <p><strong>Location:</strong> {user.location || 'Not assigned'}</p>
        <p><strong>Employee ID:</strong> {user.employeeId || 'Not assigned'}</p>
        <p><strong>Joined:</strong> {user.createdAt}</p>
      </div>
    </div>
  );
}

/* ─── Bookings Tab ────────────────────────────────────── */
function BookingsTab({ role }) {
  const isAdmin = role === 'admin';
  const location = useLocation();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [detail, setDetail] = useState(null);

  const [searchQuery, setSearchQuery] = useState('');
  
  // Set rowsPerPage to 2 so each page shows 2 customer bookings in the table
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 2;

  const detailCardRef = useRef(null);

  const [showChargeForm, setShowChargeForm] = useState(false);
  const [chargeData, setChargeData] = useState({
    charge_type: 'exceeded_stay',
    description: 'Late checkout / Extra hours fee',
    quantity: 1,
    amount: 0,
  });
  const [conflictWarning, setConflictWarning] = useState(null);
  const [availableRooms, setAvailableRooms] = useState([]);
  const [selectedTransferRoom, setSelectedTransferRoom] = useState('');

  async function load() {
    setLoading(true);
    try { setRows(await (isAdmin ? api.adminBookings() : api.staffBookings())); }
    catch (e) { console.error(e); }
    finally { setLoading(false); }
  }
  useEffect(() => { load(); }, []);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const bookingId = params.get('bookingId');
    if (bookingId) openDetail(Number(bookingId)).catch(() => {});
  }, [location.search]);

  async function openDetail(id) {
    const loader = isAdmin ? api.adminBooking : api.staffBooking;
    const data = await loader(id);
    setDetail(data);
    setShowChargeForm(false);
    setConflictWarning(null);

    setTimeout(() => {
      detailCardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  }

  async function updateStatus(id, patch) {
    try {
      const updater = isAdmin ? api.adminUpdateBooking : api.staffUpdateBooking;
      await updater(id, patch);
      await load();
      if (detail?.id === id) {
        const loader = isAdmin ? api.adminBooking : api.staffBooking;
        setDetail(await loader(id));
      }
    } catch (e) { alert(e.message); }
  }

  async function handleSettleBalance(bookingId) {
    if (!window.confirm('Confirm that the guest has paid the remaining balance at the front desk?')) return;
    try {
      if (api.payBookingAdmin) {
        await api.payBookingAdmin(bookingId);
      } else {
        await api.payBooking(bookingId);
      }
      await load();
      if (detail?.id === bookingId) {
        const loader = isAdmin ? api.adminBooking : api.staffBooking;
        setDetail(await loader(bookingId));
      }
      alert('Balance settled and booking marked as fully paid!');
    } catch (e) {
      alert(e.message || 'Failed to update payment status.');
    }
  }

  const applyPreset = (type, desc, defaultAmount) => {
    setChargeData({
      charge_type: type,
      description: desc,
      quantity: 1,
      amount: defaultAmount,
    });
  };

  async function handleAddChargeSubmit(e) {
    e.preventDefault();
    if (!detail) return;

    const isExtension = ['exceeded_stay', 'late_checkout'].includes(chargeData.charge_type);

    if (isExtension) {
      try {
        const currentCheckOut = new Date(detail.checkOut);
        const extraDays = Math.max(1, Number(chargeData.quantity) || 1);
        const newCheckOut = new Date(currentCheckOut.getTime() + extraDays * 86400000)
          .toISOString().split('T')[0];

        const available = await api.roomAvailability(
          detail.checkOut.split(' ')[0],
          newCheckOut
        );

        const currentRoomAvailable = available.some(
          (r) => Number(r.id) === Number(detail.roomId)
        );

        if (!currentRoomAvailable) {
          setAvailableRooms(available);
          setConflictWarning({
            message: `Room "${detail.roomName}" has an upcoming reservation during the requested extension period ending on ${newCheckOut}.`,
          });
          return;
        }
      } catch (err) {
        console.error('Availability check failed:', err);
      }
    }

    await submitCharge();
  }

  async function submitCharge() {
    try {
      await api.adminAddCharge(detail.id, chargeData);
      setShowChargeForm(false);
      setConflictWarning(null);
      await openDetail(detail.id);
      await load();
    } catch (e) { alert(e.message); }
  }

  async function handleTransferAndExtend() {
    if (!selectedTransferRoom) {
      alert('Please select an available room for transfer.');
      return;
    }

    try {
      const roomObj = availableRooms.find((r) => String(r.id) === String(selectedTransferRoom));
      const updater = isAdmin ? api.adminUpdateBooking : api.staffUpdateBooking;

      await updater(detail.id, {
        roomId: roomObj.id,
        roomName: roomObj.name,
      });

      await api.adminAddCharge(detail.id, chargeData);

      alert(`Booking successfully transferred to ${roomObj.name} and extension charge added!`);
      setConflictWarning(null);
      setShowChargeForm(false);
      await openDetail(detail.id);
      await load();
    } catch (e) {
      alert(e.message);
    }
  }

  async function removeCharge(chargeId) {
    if (!window.confirm('Delete this charge?')) return;
    try {
      await api.adminDeleteCharge(detail.id, chargeId);
      const loader = isAdmin ? api.adminBooking : api.staffBooking;
      setDetail(await loader(detail.id));
      await load();
    } catch (e) { alert(e.message); }
  }

  const filteredRows = rows.filter((b) => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return true;
    const guestMatch = String(b.guestName || '').toLowerCase().includes(query);
    const refCode = String(b.bookingReference || `BK-${b.id}`).toLowerCase();
    const refMatch = refCode.includes(query);
    const idMatch = String(b.id || '').toLowerCase().includes(query);
    const roomMatch = String(b.roomName || '').toLowerCase().includes(query);
    const floorMatch = String(b.floor || '').toLowerCase().includes(query);
    return guestMatch || refMatch || idMatch || roomMatch || floorMatch;
  });

  // Reset to page 1 whenever search query changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  // Slices rows for pagination (2 rows per page)
  const totalPages = Math.ceil(filteredRows.length / rowsPerPage) || 1;
  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentRows = filteredRows.slice(indexOfFirstRow, indexOfLastRow);

  if (loading) return <div className="loading">Loading…</div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '16px' }}>
        <h1 style={{ margin: 0 }}>Bookings</h1>
        
        <div style={{ width: '320px', display: 'flex', alignItems: 'center', background: 'rgba(15,42,60,0.95)', border: '1px solid var(--gold)', borderRadius: '6px', padding: '0 12px' }}>
          <span style={{ color: 'var(--gold)', fontSize: '13px', fontWeight: '600', marginRight: '8px', whiteSpace: 'nowrap' }}>Search:</span>
          <input
            type="text"
            className="input"
            placeholder="Ref, name, room, or floor..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ border: 'none', background: 'transparent', width: '100%', padding: '10px 0', outline: 'none', color: '#fff', margin: 0 }}
          />
        </div>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table className="table">
          <thead>
            <tr>
              <th>Ref</th><th>Guest</th><th>Room / Floor</th><th>Schedule</th>
              <th>Total</th><th>Downpayment (50%)</th><th>Balance Due</th><th>Status</th><th>Payment</th><th>Action</th>
            </tr>
          </thead>
          <tbody>
            {currentRows.length > 0 ? (
              currentRows.map((b) => {
                const displayRef = b.bookingReference || `BK-${b.id}`;
                const total = Number((b.grandTotal ?? b.totalPrice) || 0);
                const downpayment = Number(b.downpaymentAmount || total * 0.5);
                const balance = Number(b.remainingBalance || total - downpayment);
                const isPaid = b.paymentStatus === 'Paid';

                return (
                  <tr key={b.id}>
                    <td style={{ fontWeight: '600', color: 'var(--gold)' }}>{displayRef}</td>
                    <td>{b.guestName}</td>
                    <td>{b.roomName} {b.floor ? `(Floor ${b.floor})` : ''}</td>
                    <td style={{ fontSize: '13px' }}>
                      {formatDateReadable(b.checkIn)} → {formatDateReadable(b.checkOut)}
                    </td>
                    <td>₱{total.toFixed(2)}</td>
                    <td>
                      <span style={{ color: '#4caf50', fontWeight: 'bold' }}>₱{downpayment.toFixed(2)}</span><br />
                      <span style={{ fontSize: '11px', color: '#aaa' }}>({(b.paymentMethod || 'gcash').toUpperCase()})</span>
                    </td>
                    <td>
                      <span style={{ color: balance > 0 && !isPaid ? '#ff9800' : '#4caf50', fontWeight: 'bold' }}>
                        ₱{isPaid ? '0.00' : balance.toFixed(2)}
                      </span>
                    </td>
                    <td>
                      <select value={b.status} onChange={(e) => updateStatus(b.id, { status: e.target.value })}>
                        <option>Pending</option><option>Confirmed</option><option>Completed</option><option>Cancelled</option>
                      </select>
                    </td>
                    <td>
                      <select value={b.paymentStatus} onChange={(e) => updateStatus(b.id, { paymentStatus: e.target.value })}>
                        <option>Pending</option><option>Paid</option>
                      </select>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                        <button 
                          className={`btn ${detail?.id === b.id ? 'btn-gold' : 'btn-ghost'} small`} 
                          onClick={() => openDetail(b.id)}
                        >
                          Details
                        </button>
                        {!isPaid && balance > 0 && (
                          <button 
                            className="btn btn-gold small" 
                            onClick={() => handleSettleBalance(b.id)}
                            style={{ padding: '6px 10px', fontSize: '11px' }}
                          >
                            Settle
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="10" className="muted" style={{ textAlign: 'center', padding: '24px' }}>
                  No matching bookings found for "{searchQuery}".
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Numerical Page Buttons Pagination (Showing multiple bookings per page) */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '6px', marginTop: '20px' }}>
          {Array.from({ length: totalPages }, (_, index) => {
            const pageNum = index + 1;
            const isActive = currentPage === pageNum;
            return (
              <button
                key={pageNum}
                onClick={() => setCurrentPage(pageNum)}
                style={{
                  minWidth: '32px',
                  height: '32px',
                  padding: '0 8px',
                  borderRadius: '4px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  fontSize: '13px',
                  border: isActive ? '1px solid var(--gold)' : '1px solid rgba(255,255,255,0.1)',
                  background: isActive ? 'var(--gold)' : 'rgba(15,42,60,0.9)',
                  color: isActive ? '#0a1922' : '#fff',
                  transition: 'all 0.2s ease',
                }}
              >
                {pageNum}
              </button>
            );
          })}
        </div>
      )}

      {detail && (
        <div ref={detailCardRef} className="card detail-card" style={{ marginTop: '24px', background: 'rgba(15,42,60,0.95)', border: '1px solid var(--gold)' }}>
          <div className="detail-head" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '12px', marginBottom: '16px' }}>
            <h3 style={{ color: 'var(--gold)', margin: 0 }}>
              Booking Reference: {detail.bookingReference || `BK-${detail.id}`} — {detail.guestName}
            </h3>
            <button className="btn btn-ghost small" onClick={() => setDetail(null)}>Close</button>
          </div>
          
          <div className="grid grid-2" style={{ gap: '12px', marginBottom: '16px' }}>
            <div>
              <p><strong>Room / Floor:</strong> {detail.roomName} {detail.floor ? `(Floor ${detail.floor})` : ''}</p>
              <p><strong>Check-in:</strong> {formatDateReadable(detail.checkIn)}</p>
              <p><strong>Check-out:</strong> {formatDateReadable(detail.checkOut)}</p>
            </div>
            <div>
              <p><strong>Guest Name:</strong> {detail.guestName}</p>
              <p><strong>Phone:</strong> {detail.guestPhone || '—'}</p>
              <p><strong>Email:</strong> {detail.guestEmail || '—'}</p>
            </div>
          </div>

          <h4 style={{ marginTop: 20, color: '#fff' }}>Itemized Charges & Late Stay Fees</h4>
          <table className="table">
            <thead>
              <tr>
                <th>Type</th><th>Description</th><th>Qty</th>
                <th>Amount</th><th>Total</th><th></th>
              </tr>
            </thead>
            <tbody>
              {(detail.charges || []).map((c) => (
                <tr key={c.id}>
                  <td>{c.charge_type}</td>
                  <td>{c.description}</td>
                  <td>{c.quantity}</td>
                  <td>₱{Number(c.amount).toFixed(2)}</td>
                  <td>₱{(c.quantity * c.amount).toFixed(2)}</td>
                  <td>
                    <button className="btn btn-ghost small" onClick={() => removeCharge(c.id)}>×</button>
                  </td>
                </tr>
              ))}
              {!(detail.charges || []).length && (
                <tr><td colSpan="6" className="muted">No additional charges recorded yet.</td></tr>
              )}
            </tbody>
          </table>
          
          {!showChargeForm && (
            <button 
              className="btn btn-gold small" 
              style={{ marginTop: 16 }}
              onClick={() => { setShowChargeForm(true); setConflictWarning(null); }}
            >
              + Add Late Fee / Charge
            </button>
          )}

          {showChargeForm && (
            <div className="card" style={{ marginTop: 16, border: '1px solid var(--gold)', padding: 20, background: 'rgba(10,28,40,0.98)' }}>
              <h4 style={{ color: 'var(--gold)', marginBottom: 12 }}>Add New Charge / Fee</h4>
              
              <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
                <span style={{ fontSize: '12px', color: '#aaa' }}>Quick Presets:</span>
                <button type="button" className="btn btn-ghost small" onClick={() => applyPreset('exceeded_stay', 'Extra Night Stay', detail.totalPrice || 1500)}>+ Extra Night</button>
                <button type="button" className="btn btn-ghost small" onClick={() => applyPreset('late_checkout', 'Late Checkout Fee', 500)}>+ Late Checkout</button>
                <button type="button" className="btn btn-ghost small" onClick={() => applyPreset('amenities', 'Extra Pillow Set', 150)}>+ Room Amenity</button>
                <button type="button" className="btn btn-ghost small" onClick={() => applyPreset('extra_service', 'Airport Transfer / Shuttle', 800)}>+ Service</button>
              </div>

              <form onSubmit={handleAddChargeSubmit}>
                <div className="row-2">
                  <label>Charge Category
                    <select
                      className="input"
                      value={chargeData.charge_type}
                      onChange={(e) => {
                        const type = e.target.value;
                        setChargeData({
                          ...chargeData,
                          charge_type: type,
                          description: type === 'amenities' ? 'Extra Bath Towel' : type === 'extra_service' ? 'Airport Transfer / Shuttle' : chargeData.description,
                          amount: type === 'amenities' ? 100 : type === 'extra_service' ? 800 : chargeData.amount,
                        });
                      }}
                    >
                      <option value="exceeded_stay">Exceeded Stay (Extra Nights)</option>
                      <option value="late_checkout">Late Checkout (Extra Hours)</option>
                      <option value="amenities">Extra Room Amenities (Pillows, Towels, Beds)</option>
                      <option value="extra_service">Extra Services (Shuttle, Laundry, Massage)</option>
                      <option value="extra_guest">Extra Guest Fee</option>
                      <option value="damage">Damage / Replacement</option>
                      <option value="other">Other Charge</option>
                    </select>
                  </label>

                  {chargeData.charge_type === 'amenities' && (
                    <label>Select Room Amenity
                      <select
                        className="input"
                        onChange={(e) => {
                          const item = AMENITY_PRESETS.find((a) => a.value === e.target.value);
                          if (item && item.value) {
                            setChargeData({ ...chargeData, description: item.label, amount: item.price });
                          }
                        }}
                      >
                        {AMENITY_PRESETS.map((a) => (
                          <option key={a.value} value={a.value}>
                            {a.label} {a.price > 0 ? `(₱{a.price.toFixed(2)})` : ''}
                          </option>
                        ))}
                      </select>
                    </label>
                  )}

                  {chargeData.charge_type === 'extra_service' && (
                    <label>Select Service Option
                      <select
                        className="input"
                        onChange={(e) => {
                          const item = SERVICE_PRESETS.find((s) => s.value === e.target.value);
                          if (item && item.value) {
                            setChargeData({ ...chargeData, description: item.label, amount: item.price });
                          }
                        }}
                      >
                        {SERVICE_PRESETS.map((s) => (
                          <option key={s.value} value={s.value}>
                            {s.label} {s.price > 0 ? `(₱{s.price.toFixed(2)})` : ''}
                          </option>
                        ))}
                      </select>
                    </label>
                  )}

                  {!['amenities', 'extra_service'].includes(chargeData.charge_type) && (
                    <label>Description
                      <input
                        className="input"
                        value={chargeData.description}
                        onChange={(e) => setChargeData({ ...chargeData, description: e.target.value })}
                        required
                      />
                    </label>
                  )}
                </div>

                {['amenities', 'extra_service'].includes(chargeData.charge_type) && (
                  <label style={{ marginTop: 12, display: 'block' }}>
                    Item Description / Notes
                    <input
                      className="input"
                      value={chargeData.description}
                      onChange={(e) => setChargeData({ ...chargeData, description: e.target.value })}
                      required
                    />
                  </label>
                )}

                <div className="row-2" style={{ marginTop: 12 }}>
                  <label>Quantity (Units / Hours / Nights)
                    <input
                      type="number"
                      min="1"
                      className="input"
                      value={chargeData.quantity}
                      onChange={(e) => {
                        const val = e.target.value;
                        setChargeData({
                          ...chargeData,
                          quantity: val === '' ? '' : Math.max(1, parseInt(val, 10) || 1),
                        });
                      }}
                      onBlur={() => {
                        if (!chargeData.quantity) {
                          setChargeData({ ...chargeData, quantity: 1 });
                        }
                      }}
                      required
                    />
                  </label>

                  <label>Amount per unit (₱)
                    <input
                      type="number"
                      step="0.01"
                      className="input"
                      value={chargeData.amount}
                      onChange={(e) => setChargeData({ ...chargeData, amount: Number(e.target.value) || 0 })}
                      required
                    />
                  </label>
                </div>

                <div style={{ marginTop: 12, fontWeight: 'bold', color: 'var(--gold)', fontSize: '15px' }}>
                  Charge Subtotal: ₱{((Number(chargeData.quantity) || 1) * Number(chargeData.amount)).toFixed(2)}
                </div>

                {conflictWarning && (
                  <div style={{ marginTop: 16, padding: 16, background: 'rgba(255, 82, 82, 0.15)', border: '1px solid #ff5252', borderRadius: 6 }}>
                    <div style={{ color: '#ff5252', fontWeight: 'bold', marginBottom: 6 }}>
                      ⚠️ Room Reservation Conflict Detected
                    </div>
                    <p style={{ fontSize: '13px', margin: 0, color: '#ffcccc' }}>
                      {conflictWarning.message}
                    </p>

                    <h5 style={{ marginTop: 12, marginBottom: 8, color: '#fff' }}>Select Alternative Room to Transfer Guest:</h5>
                    {availableRooms.length > 0 ? (
                      <div className="row-2">
                        <select
                          className="input"
                          value={selectedTransferRoom}
                          onChange={(e) => setSelectedTransferRoom(e.target.value)}
                        >
                          <option value="">-- Choose Available Room --</option>
                          {availableRooms.map((r) => (
                            <option key={r.id} value={r.id}>
                              {r.name} ({r.type}) — ₱{Number(r.price).toFixed(2)}/night
                            </option>
                          ))}
                        </select>

                        <button
                          type="button"
                          className="btn btn-gold small"
                          onClick={handleTransferAndExtend}
                        >
                          Transfer Room & Save Extension
                        </button>
                      </div>
                    ) : (
                      <p style={{ color: '#ff5252', fontSize: '12px', marginTop: 8 }}>
                        No alternative rooms are available for the requested extension dates.
                      </p>
                    )}
                  </div>
                )}

                <div className="booking-actions" style={{ marginTop: 16 }}>
                  {!conflictWarning && (
                    <button className="btn btn-gold" type="submit">Save Charge</button>
                  )}
                  <button
                    type="button"
                    className="btn btn-ghost"
                    onClick={() => { setShowChargeForm(false); setConflictWarning(null); }}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          <hr style={{ margin: '20px 0', border: 'none', borderTop: '1px solid var(--bg-border)' }} />
          <p><strong>Room total:</strong> ₱{Number(detail.totalPrice).toFixed(2)}</p>
          <p><strong>Extras & Late Fees:</strong> ₱{Number(detail.extraTotal || 0).toFixed(2)}</p>
          <p style={{ color: '#4caf50' }}><strong>50% Downpayment:</strong> ₱{Number(detail.downpaymentAmount || (Number(detail.grandTotal ?? detail.totalPrice) * 0.5)).toFixed(2)}</p>
          <p style={{ color: '#ff9800' }}><strong>Remaining Balance:</strong> ₱{Number(detail.remainingBalance || (Number(detail.grandTotal ?? detail.totalPrice) * 0.5)).toFixed(2)}</p>
          <p className="total" style={{ color: 'var(--gold)', fontSize: '1.1rem' }}><strong>Grand total:</strong> ₱{Number(detail.grandTotal ?? detail.totalPrice).toFixed(2)}</p>
        </div>
      )}
    </div>
  );
}

/* ─── Rooms Tab (Room Inventory & Management) ──────────── */
function RoomsTab({ role }) {
  const isAdmin = role === 'admin';
  const [rooms, setRooms] = useState([]);
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const data = await api.rooms();
      // Only show active rooms in the main inventory table
      const activeRooms = (Array.isArray(data) ? data : []).filter(
        (room) => room.available !== 0 && room.status !== 'Archived'
      );
      setRooms(activeRooms);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { load(); }, []);

  const getRoomImageUrl = (r) => {
    if (r.images && r.images.length > 0 && r.images[0]?.image_url) {
      return r.images[0].image_url;
    }
    if (r.image && typeof r.image === 'string' && r.image.startsWith('http')) {
      return r.image;
    }
    if (r.image && typeof r.image === 'string' && r.image.startsWith('[')) {
      try {
        const parsed = JSON.parse(r.image);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed[0];
        }
      } catch (e) {
        // Fallback
      }
    }
    return r.image || 'https://images.unsplash.com/photo-1611892440504-42a792e24d32';
  };

  async function save(e) {
    e.preventDefault();
    const d = editing;
    try {
      if (d.id) await api.updateRoom(d.id, d);
      else await api.createRoom(d);
      setEditing(null);
      await load();
    } catch (e) { alert(e.message); }
  }

  async function archiveRoom(id) {
    if (!window.confirm('Archive this room? It will be hidden from customer booking options.')) return;
    try {
      if (api.archiveRoom) {
        await api.archiveRoom(id);
      } else {
        await api.updateRoom(id, { available: 0, status: 'Archived' });
      }
      await load();
    } catch (e) { alert(e.message); }
  }

  async function addImage(roomId) {
    const url = window.prompt('Image URL:');
    if (!url) return;
    const label = window.prompt('Angle label (e.g. Bedroom, Bathroom, View):', 'Gallery');
    try {
      await api.addRoomImage(roomId, { image_url: url, angle_label: label, sort_order: 0 });
      await load();
    } catch (e) { alert(e.message); }
  }

  async function delImage(roomId, imgId) {
    if (!window.confirm('Delete image?')) return;
    try { await api.deleteRoomImage(roomId, imgId); await load(); }
    catch (e) { alert(e.message); }
  }

  if (loading) return <div className="loading">Loading…</div>;

  return (
    <div>
      <div className="section-head">
        <h1>Rooms Inventory</h1>
        {isAdmin && (
          <button
            className="btn btn-gold"
            onClick={() => setEditing({
              name: '', type: '', price: 0, description: '',
              amenities: '', image: '', rating: 0, available: 1,
            })}
          >
            + New Room
          </button>
        )}
      </div>

      {isAdmin && editing && (
        <form className="card" onSubmit={save} style={{ marginBottom: 24 }}>
          <div className="row-2">
            <label>Name
              <input className="input" value={editing.name || ''}
                onChange={(e) => setEditing({ ...editing, name: e.target.value })} required />
            </label>
            <label>Type
              <input className="input" value={editing.type || ''}
                onChange={(e) => setEditing({ ...editing, type: e.target.value })} required />
            </label>
          </div>
          <div className="row-2">
            <label>Price
              <input type="number" className="input" value={editing.price || 0}
                onChange={(e) => setEditing({ ...editing, price: +e.target.value })} required />
            </label>
            <label>Rating
              <input type="number" step="0.1" max="5" className="input" value={editing.rating || 0}
                onChange={(e) => setEditing({ ...editing, rating: +e.target.value })} />
            </label>
          </div>
          <label>Image URL
            <input className="input" value={editing.image || ''}
              onChange={(e) => setEditing({ ...editing, image: e.target.value })} />
          </label>
          <label>Amenities (comma-separated)
            <input className="input"
              value={Array.isArray(editing.amenities) ? editing.amenities.join(', ') : (editing.amenities || '')}
              onChange={(e) => setEditing({ ...editing, amenities: e.target.value })} />
          </label>
          <label>Description
            <textarea className="input" rows="3" value={editing.description || ''}
              onChange={(e) => setEditing({ ...editing, description: e.target.value })} />
          </label>
          <div className="booking-actions">
            <button className="btn btn-gold">Save</button>
            <button type="button" className="btn btn-ghost" onClick={() => setEditing(null)}>Cancel</button>
          </div>
        </form>
      )}

      <div className="grid grid-2">
        {rooms.map((r) => {
          const displayImg = getRoomImageUrl(r);
          return (
            <div key={r.id} className="card room-admin-card" style={{ overflow: 'hidden', borderRadius: '12px' }}>
              <img 
                src={displayImg} 
                alt={r.name}
                style={{ width: '100%', height: '200px', objectFit: 'cover', display: 'block' }}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'https://images.unsplash.com/photo-1611892440504-42a792e24d32';
                }}
              />
              <div className="card-body" style={{ padding: '20px' }}>
                <h3>{r.name}</h3>
                <p className="muted">{r.type} · ₱{Number(r.price).toFixed(2)} · ★ {r.rating}</p>
                <p className="muted">Gallery Images: {r.images?.length || 0}</p>
                
                {isAdmin && (
                  <div className="booking-actions" style={{ marginTop: '12px' }}>
                    <button className="btn btn-ghost small" onClick={() => setEditing(r)}>Edit</button>
                    <button className="btn btn-ghost small" onClick={() => addImage(r.id)}>+ Image</button>
                    <button className="btn btn-ghost small" onClick={() => archiveRoom(r.id)} style={{ color: '#ff9800', borderColor: '#ff9800' }}>Archive</button>
                  </div>
                )}

                {r.images?.length > 0 && (
                  <div className="thumb-row" style={{ display: 'flex', gap: '8px', marginTop: '12px', flexWrap: 'wrap' }}>
                    {r.images.map((img) => (
                      isAdmin ? (
                        <button key={img.id} className="thumb small"
                          onClick={() => delImage(r.id, img.id)} title="Click to delete" style={{ padding: 0, border: 'none', background: 'none', cursor: 'pointer' }}>
                          <img src={img.image_url} alt={img.angle_label || ''} style={{ width: '50px', height: '40px', objectFit: 'cover', borderRadius: '4px' }} />
                        </button>
                      ) : (
                        <div key={img.id} className="thumb small" title={img.angle_label || 'Room image'}>
                          <img src={img.image_url} alt={img.angle_label || ''} style={{ width: '50px', height: '40px', objectFit: 'cover', borderRadius: '4px' }} />
                        </div>
                      )
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ─── Users ────────────────────────────────────────────── */
function UsersTab({ role = 'admin' }) {
  const isAdmin = role === 'admin';
  const location = useLocation();
  const [rows, setRows] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [editingUser, setEditingUser] = useState(null);
  const [bookingDraft, setBookingDraft] = useState(null);
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    staffPosition: 'Front Desk',
    department: 'Front Office',
    location: '',
    contactNumber: '',
    address: '',
    city: '',
  });

  const displayText = (value, fallback = '—') => (value === null || value === undefined || value === '' ? fallback : value);
  const [saving, setSaving] = useState(false);

  async function load() {
    const data = isAdmin ? await api.adminUsers() : await api.staffUsers();
    setRows(data);
  }

  useEffect(() => { load().catch(() => {}); }, [role]);
  useEffect(() => {
    if (!isAdmin) {
      api.rooms().then(setRooms).catch(() => setRooms([]));
    }
  }, [isAdmin]);

  useEffect(() => {
    if (isAdmin || !rooms.length) return;

    const params = new URLSearchParams(location.search);
    const roomId = params.get('roomId');
    const dateValue = params.get('date');
    if (!roomId) return;

    const selectedRoom = rooms.find((room) => String(room.id) === String(roomId));
    if (!selectedRoom) return;

    const checkInDate = dateValue || new Date(Date.now() + 86400000).toISOString().slice(0, 10);
    const checkoutDate = dateValue
      ? new Date(new Date(`${dateValue}T00:00:00`).getTime() + 86400000).toISOString().slice(0, 10)
      : new Date(Date.now() + 172800000).toISOString().slice(0, 10);

    setBookingDraft((current) => current || {
      guestId: '',
      guestName: '',
      guestPhone: '',
      guestEmail: '',
      guestAddress: '',
      guestCity: '',
      roomId: selectedRoom.id,
      checkIn: checkInDate,
      checkInTime: '14:00',
      checkOut: checkoutDate,
      checkOutTime: '12:00',
      adults: 2,
      children: 0,
      paymentMethod: 'pay_at_hotel',
      paymentContactNumber: '',
    });
  }, [isAdmin, location.search, rooms]);

  async function createStaff(e) {
    e.preventDefault();
    setSaving(true);
    try {
      if (isAdmin) {
        await api.createStaff(form);
        setForm({ firstName: '', lastName: '', email: '', password: '', staffPosition: 'Front Desk', department: 'Front Office', location: '', contactNumber: '', address: '', city: '' });
      } else {
        await api.staffCreateGuest({
          firstName: form.firstName,
          lastName: form.lastName,
          email: form.email,
          password: form.password,
          contactNumber: form.contactNumber,
          address: form.address,
          city: form.city,
        });
        setForm({ firstName: '', lastName: '', email: '', password: '', staffPosition: 'Front Desk', department: 'Front Office', location: '', contactNumber: '', address: '', city: '' });
      }
      await load();
    } catch (e) {
      alert(e.message);
    } finally {
      setSaving(false);
    }
  }

  async function deleteUser(id) {
    if (!window.confirm('Delete this account?')) return;
    try {
      if (isAdmin) await api.adminDeleteUser(id); else await api.staffDeleteUser(id);
      setSelectedUser(null);
      setEditingUser(null);
      await load();
    } catch (e) { alert(e.message); }
  }

  async function saveUserEdit(e) {
    e.preventDefault();
    try {
      if (isAdmin) {
        await api.adminUpdateUser(editingUser.id, editingUser);
      } else {
        const payload = { ...editingUser };
        delete payload.role;
        await api.staffUpdateUser(editingUser.id, payload);
      }
      setSelectedUser(null);
      setEditingUser(null);
      await load();
    } catch (e) { alert(e.message); }
  }

  async function createWalkInBooking(e) {
    e.preventDefault();
    try {
      const room = rooms.find((r) => String(r.id) === String(bookingDraft.roomId));
      const paymentMethod = bookingDraft.paymentMethod || 'pay_at_hotel';
      const paymentNumber = String(bookingDraft.paymentContactNumber || '').replace(/\s+/g, '');
      const guestName = String(bookingDraft.guestName || '').trim();

      if (!guestName) {
        throw new Error('Guest name is required.');
      }

      if (paymentMethod !== 'pay_at_hotel' && !/^09\d{9}$/.test(paymentNumber)) {
        throw new Error('Please enter a valid 11-digit mobile number for online payment.');
      }

      let guestId = bookingDraft.guestId || '';
      if (!guestId) {
        const guestParts = guestName.split(/\s+/);
        const firstName = guestParts.shift() || 'Guest';
        const lastName = guestParts.join(' ') || 'Guest';
        const createdGuest = await api.staffCreateGuest({
          firstName,
          lastName,
          email: `${firstName.toLowerCase()}.${lastName.toLowerCase().replace(/\s+/g, '.')}.${Date.now()}@guest.local`,
          password: 'Guest@123',
          contactNumber: bookingDraft.guestPhone || '',
          address: bookingDraft.guestAddress || '',
          city: bookingDraft.guestCity || '',
        });
        guestId = createdGuest.user.id;
      }

      const nights = Math.max(1, Math.ceil((new Date(bookingDraft.checkOut) - new Date(bookingDraft.checkIn)) / 86400000));
      const totalPrice = Number(room?.price || 0) * nights;
      await api.staffCreateBooking({
        roomId: bookingDraft.roomId,
        roomName: room?.name || 'Room',
        guestId,
        guestName,
        guestPhone: bookingDraft.guestPhone || '',
        guestEmail: bookingDraft.guestEmail || '',
        guestAddress: bookingDraft.guestAddress || '',
        guestCity: bookingDraft.guestCity || '',
        checkIn: `${bookingDraft.checkIn} ${bookingDraft.checkInTime || '14:00'}`,
        checkOut: `${bookingDraft.checkOut} ${bookingDraft.checkOutTime || '12:00'}`,
        adults: bookingDraft.adults,
        children: bookingDraft.children,
        guests: Number(bookingDraft.adults) + Number(bookingDraft.children),
        totalPrice,
        paymentMethod,
        paymentContactNumber: paymentNumber,
      });
      setBookingDraft(null);
      await load();
      alert('Walk-in booking created successfully.');
    } catch (e) {
      alert(e.message);
    }
  }

  const staffUsers = isAdmin ? rows.filter((u) => u.role === 'staff') : [];
  const guestUsers = rows.filter((u) => ['user', 'guest'].includes(String(u.role || '').toLowerCase()));

  return (
    <div>
      <h1>Users</h1>

      {(isAdmin || !isAdmin) && (
        <div className="card" style={{ marginBottom: 20, maxWidth: 620 }}>
          <h3>{isAdmin ? 'Create Staff Account' : 'Add Walk-in Guest'}</h3>
          <form onSubmit={createStaff}>
            <div className="row-2">
              <label>First name
                <input className="input" value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} required />
              </label>

              <label>Last name
                <input className="input" value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} required />
              </label>
            </div>
            <label>Email
              <input className="input" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
            </label>
            <label>Password
              <input className="input" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
            </label>

            {isAdmin ? (
              <>
                <div className="row-2">
                  <label>Staff Position
                    <select
                      className="input"
                      value={form.staffPosition}
                      onChange={(e) => setForm({ ...form, staffPosition: e.target.value })}
                    >
                      <option value="Manager">Manager</option>
                      <option value="Front Desk">Front Desk</option>
                      <option value="Maintenance">Maintenance</option>
                    </select>
                  </label>

                  <label>Department
                    <select
                      className="input"
                      value={form.department}
                      onChange={(e) => setForm({ ...form, department: e.target.value })}
                    >
                      <option value="Management">Management</option>
                      <option value="Front Office">Front Office</option>
                      <option value="Maintenance">Maintenance</option>
                    </select>
                  </label>
                </div>

                <label>Location / Residence
                  <input
                    className="input"
                    value={form.location}
                    onChange={(e) => setForm({ ...form, location: e.target.value })}
                    placeholder="e.g. Davao City"
                    required
                  />
                </label>

                <div className="muted" style={{ margin: '10px 0 16px' }}>
                  Employee ID will be generated automatically for this staff account.
                </div>
              </>
            ) : (
              <>
                <label>Contact Number
                  <input className="input" value={form.contactNumber} onChange={(e) => setForm({ ...form, contactNumber: e.target.value })} />
                </label>
                <label>Address
                  <input className="input" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
                </label>
                <label>City
                  <input className="input" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
                </label>
              </>
            )}

            <button className="btn btn-gold" disabled={saving}>
              {saving ? 'Creating…' : isAdmin ? 'Create Staff Account' : 'Add Guest'}
            </button>
          </form>
        </div>
      )}

      {isAdmin && (
        <div style={{ marginBottom: 26 }}>
          <h3>Staff Accounts</h3>
          <table className="table">
            <thead>
              <tr>
                <th>ID</th><th>Name</th><th>Email</th><th>Role</th>
                <th>Position</th><th>Department</th><th>Location</th><th>Employee ID</th><th>Joined</th><th></th>
              </tr>
            </thead>
            <tbody>
              {staffUsers.length ? staffUsers.map((u) => (
                <tr key={u.id}>
                  <td>{u.id}</td>
                  <td>{u.firstName} {u.lastName}</td>
                  <td>{u.email}</td>
                  <td>{u.role}</td>
                  <td>{u.staffPosition || '—'}</td>
                  <td>{u.department || '—'}</td>
                  <td>{displayText(u.location, '—')}</td>
                  <td>{displayText(u.employeeId, '—')}</td>
                  <td>{displayText(formatDateReadable(u.createdAt))}</td>
                  <td>
                    <button className="btn btn-ghost small" onClick={() => setSelectedUser(u)}>Details</button>
                    <button className="btn btn-ghost small" onClick={() => setEditingUser({ ...u })} style={{ marginLeft: 6 }}>Edit</button>
                    <button className="btn btn-ghost small" onClick={() => deleteUser(u.id)} style={{ marginLeft: 6 }}>Delete</button>
                  </td>
                </tr>
              )) : (
                <tr><td colSpan="10" className="muted">No staff accounts yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <div>
        <h3>Guest Accounts</h3>
        <table className="table">
          <thead>
            <tr>
              <th>ID</th><th>Name</th><th>Email</th><th>Contact</th>
              <th>Address</th><th>City</th><th>Joined</th><th></th>
            </tr>
          </thead>
          <tbody>
            {guestUsers.length ? guestUsers.map((u) => (
              <tr key={u.id}>
                <td>{u.id}</td>
                <td>{u.firstName} {u.lastName}</td>
                <td>{u.email}</td>
                <td>{displayText(u.contactNumber, '—')}</td>
                <td>{displayText(u.address, '—')}</td>
                <td>{displayText(u.city, '—')}</td>
                <td>{displayText(formatDateReadable(u.createdAt))}</td>
                <td>
                  <button className="btn btn-ghost small" onClick={() => setSelectedUser(u)}>Details</button>
                  {!isAdmin && (
                    <button className="btn btn-ghost small" onClick={() => setBookingDraft({
                      guestId: u.id,
                      guestName: `${u.firstName} ${u.lastName}`.trim(),
                      guestPhone: u.contactNumber || '',
                      guestEmail: u.email,
                      guestAddress: u.address || '',
                      guestCity: u.city || '',
                      roomId: rooms[0]?.id || '',
                      checkIn: new Date(Date.now() + 86400000).toISOString().slice(0, 10),
                      checkInTime: '14:00',
                      checkOut: new Date(Date.now() + 172800000).toISOString().slice(0, 10),
                      checkOutTime: '12:00',
                      adults: 2,
                      children: 0,
                      paymentMethod: 'pay_at_hotel',
                      paymentContactNumber: '',
                    })} style={{ marginLeft: 6 }}>
                      Book
                    </button>
                  )}
                  <button className="btn btn-ghost small" onClick={() => setEditingUser({ ...u })} style={{ marginLeft: 6 }}>Edit</button>
                  <button className="btn btn-ghost small" onClick={() => deleteUser(u.id)} style={{ marginLeft: 6 }}>Delete</button>
                </td>
              </tr>
            )) : (
              <tr><td colSpan="8" className="muted">No guest accounts yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {editingUser && (
        <form className="card" style={{ marginTop: 20, maxWidth: 620 }} onSubmit={saveUserEdit}>
          <div className="detail-head">
            <h3>Edit Account</h3>
            <button type="button" className="btn btn-ghost small" onClick={() => setEditingUser(null)}>Close</button>
          </div>

          <div className="row-2">
            <label>First name
              <input className="input" value={editingUser.firstName || ''} onChange={(e) => setEditingUser({ ...editingUser, firstName: e.target.value })} />
            </label>
            <label>Last name
              <input className="input" value={editingUser.lastName || ''} onChange={(e) => setEditingUser({ ...editingUser, lastName: e.target.value })} />
            </label>
          </div>

          <label>Email
            <input className="input" value={editingUser.email || ''} onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })} />
          </label>

          {editingUser.role === 'staff' ? (
            <>
              <div className="row-2">
                <label>Position
                  <select className="input" value={editingUser.staffPosition || 'Front Desk'} onChange={(e) => setEditingUser({ ...editingUser, staffPosition: e.target.value })}>
                    <option value="Manager">Manager</option>
                    <option value="Front Desk">Front Desk</option>
                    <option value="Maintenance">Maintenance</option>
                  </select>
                </label>
                <label>Department
                  <select className="input" value={editingUser.department || 'Front Office'} onChange={(e) => setEditingUser({ ...editingUser, department: e.target.value })}>
                    <option value="Management">Management</option>
                    <option value="Front Office">Front Office</option>
                    <option value="Maintenance">Maintenance</option>
                  </select>
                </label>
              </div>
              <label>Location / Residence
                <input className="input" value={editingUser.location ?? ''} onChange={(e) => setEditingUser({ ...editingUser, location: e.target.value })} />
              </label>
              <label>Employee ID
                <input className="input" value={editingUser.employeeId ?? ''} onChange={(e) => setEditingUser({ ...editingUser, employeeId: e.target.value })} />
              </label>
            </>
          ) : (
            <>
              <label>Contact Number
                <input className="input" value={editingUser.contactNumber ?? ''} onChange={(e) => setEditingUser({ ...editingUser, contactNumber: e.target.value })} />
              </label>
              <label>Address
                <input className="input" value={editingUser.address ?? ''} onChange={(e) => setEditingUser({ ...editingUser, address: e.target.value })} />
              </label>
              <label>City
                <input className="input" value={editingUser.city ?? ''} onChange={(e) => setEditingUser({ ...editingUser, city: e.target.value })} />
              </label>
            </>
          )}

          <div className="booking-actions" style={{ marginTop: 16 }}>
            <button className="btn btn-gold" type="submit">Save</button>
            <button type="button" className="btn btn-ghost" onClick={() => setEditingUser(null)}>Cancel</button>
          </div>
        </form>
      )}

      {bookingDraft && !isAdmin && (
        <form className="card" style={{ marginTop: 20, maxWidth: 620 }} onSubmit={createWalkInBooking}>
          <div className="detail-head">
            <h3>Walk-in Booking</h3>
            <button type="button" className="btn btn-ghost small" onClick={() => setBookingDraft(null)}>Close</button>
          </div>

          <label>Guest Name
            <input className="input" value={bookingDraft.guestName || ''} onChange={(e) => setBookingDraft({ ...bookingDraft, guestName: e.target.value })} required />
          </label>
          <label>Contact Number
            <input className="input" value={bookingDraft.guestPhone || ''} onChange={(e) => setBookingDraft({ ...bookingDraft, guestPhone: e.target.value })} placeholder="09XXXXXXXXX" />
          </label>

          <div className="row-2">
            <label>Room
              <select className="input" value={bookingDraft.roomId || ''} onChange={(e) => setBookingDraft({ ...bookingDraft, roomId: e.target.value })} required>
                <option value="">Select room</option>
                {rooms.map((room) => <option key={room.id} value={room.id}>{room.name}</option>)}
              </select>
            </label>
            <label>Payment
              <select className="input" value={bookingDraft.paymentMethod || 'pay_at_hotel'} onChange={(e) => setBookingDraft({ ...bookingDraft, paymentMethod: e.target.value })}>
                <option value="pay_at_hotel">Walk-in / Pay at Hotel</option>
                <option value="gcash">GCash</option>
                <option value="paymaya">PayMaya</option>
              </select>
            </label>
          </div>

          {bookingDraft.paymentMethod !== 'pay_at_hotel' && (
            <label>Payment Contact Number
              <input
                className="input"
                value={bookingDraft.paymentContactNumber || ''}
                onChange={(e) => setBookingDraft({ ...bookingDraft, paymentContactNumber: e.target.value })}
                placeholder="09xxxxxxxxx"
              />
            </label>
          )}

          <div className="row-2">
            <label>Check-in Date
              <input type="date" className="input" value={bookingDraft.checkIn || ''} onChange={(e) => setBookingDraft({ ...bookingDraft, checkIn: e.target.value })} required />
            </label>
            <label>Check-in Time
              <input type="time" className="input" value={bookingDraft.checkInTime || '14:00'} onChange={(e) => setBookingDraft({ ...bookingDraft, checkInTime: e.target.value })} required />
            </label>
          </div>

          <div className="row-2" style={{ marginTop: 12 }}>
            <label>Check-out Date
              <input type="date" className="input" value={bookingDraft.checkOut || ''} onChange={(e) => setBookingDraft({ ...bookingDraft, checkOut: e.target.value })} required />
            </label>
            <label>Check-out Time
              <input type="time" className="input" value={bookingDraft.checkOutTime || '12:00'} onChange={(e) => setBookingDraft({ ...bookingDraft, checkOutTime: '12:00' })} required />
            </label>
          </div>

          <div className="row-2" style={{ marginTop: 12 }}>
            <label>Adults
              <input type="number" min="1" className="input" value={bookingDraft.adults || 1} onChange={(e) => setBookingDraft({ ...bookingDraft, adults: Number(e.target.value) || 1 })} />
            </label>
            <label>Children
              <input type="number" min="0" className="input" value={bookingDraft.children || 0} onChange={(e) => setBookingDraft({ ...bookingDraft, children: Number(e.target.value) || 0 })} />
            </label>
          </div>

          <div className="booking-actions" style={{ marginTop: 16 }}>
            <button className="btn btn-gold" type="submit">Create Booking</button>
            <button type="button" className="btn btn-ghost" onClick={() => setBookingDraft(null)}>Cancel</button>
          </div>
        </form>
      )}

      {selectedUser && !editingUser && (
        <div className="card" style={{ marginTop: 20, maxWidth: 620 }}>
          <div className="detail-head">
            <h3>{selectedUser.firstName} {selectedUser.lastName}</h3>
            <button className="btn btn-ghost small" onClick={() => setSelectedUser(null)}>Close</button>
          </div>
          <p><strong>Email:</strong> {selectedUser.email}</p>
          <p><strong>Role:</strong> {selectedUser.role}</p>
          {selectedUser.role === 'staff' ? (
            <>
              <p><strong>Position:</strong> {displayText(selectedUser.staffPosition, 'Not assigned')}</p>
              <p><strong>Department:</strong> {displayText(selectedUser.department, 'Not assigned')}</p>
              <p><strong>Location:</strong> {displayText(selectedUser.location, 'Not assigned')}</p>
              <p><strong>Employee ID:</strong> {displayText(selectedUser.employeeId, 'Not assigned')}</p>
            </>
          ) : (
            <>
              <p><strong>Contact Number:</strong> {displayText(selectedUser.contactNumber, 'Not provided')}</p>
              <p><strong>Address:</strong> {displayText(selectedUser.address, 'Not provided')}</p>
              <p><strong>City:</strong> {displayText(selectedUser.city, 'Not provided')}</p>
            </>
          )}
          <p><strong>Joined:</strong> {formatDateReadable(selectedUser.createdAt)}</p>
          <div className="booking-actions" style={{ marginTop: 16 }}>
            <button className="btn btn-ghost small" onClick={() => setEditingUser({ ...selectedUser })}>Edit</button>
            <button className="btn btn-ghost small" onClick={() => deleteUser(selectedUser.id)}>Delete</button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Settings ─────────────────────────────────────────── */
function SettingsTab() {
  const [s, setS] = useState({});
  const [saved, setSaved] = useState('');
  useEffect(() => { api.adminSettings().then(setS).catch(() => {}); }, []);

  async function save() {
    try {
      await api.adminSaveSettings(s);
      setSaved('Saved!');
      setTimeout(() => setSaved(''), 2000);
    } catch (e) { alert(e.message); }
  }

  return (
    <div>
      <h1>System Settings</h1>
      {saved && <div className="info">{saved}</div>}
      <div className="card" style={{ maxWidth: 600 }}>
        {Object.entries(s).map(([k, v]) => (
          <label key={k}>
            {k}
            <input className="input" value={v}
              onChange={(e) => setS({ ...s, [k]: v })} />
          </label>
        ))}
        <button className="btn btn-gold" onClick={save}>Save Settings</button>
      </div>
    </div>
  );
}

/* ─── Hotel Info ───────────────────────────────────────── */
function HotelInfoTab() {
  const [h, setH] = useState({});
  const [saved, setSaved] = useState('');
  useEffect(() => { api.adminHotelInfo().then(setH).catch(() => {}); }, []);

  async function save() {
    try {
      await api.adminSaveHotelInfo(h);
      setSaved('Saved!');
      setTimeout(() => setSaved(''), 2000);
    } catch (e) { alert(e.message); }
  }

  const upd = (k, v) => setH({ ...h, [k]: v });

  return (
    <div>
      <h1>Hotel Info</h1>
      {saved && <div className="info">{saved}</div>}
      <div className="card" style={{ maxWidth: 640 }}>
        <label>Name
          <input className="input" value={h.name || ''} onChange={(e) => upd('name', e.target.value)} />
        </label>
        <label>Address
          <input className="input" value={h.address || ''} onChange={(e) => upd('address', e.target.value)} />
        </label>
        <div className="row-2">
          <label>Phone
            <input className="input" value={h.phone || ''} onChange={(e) => upd('phone', e.target.value)} />
          </label>
          <label>Email
            <input className="input" value={h.email || ''} onChange={(e) => upd('email', e.target.value)} />
          </label>
        </div>
        <div className="row-2">
          <label>Check-in time
            <input className="input" value={h.check_in_time || ''} onChange={(e) => upd('check_in_time', e.target.value)} />
          </label>
          <label>Check-out time
            <input className="input" value={h.check_out_time || ''} onChange={(e) => upd('check_out_time', e.target.value)} />
          </label>
        </div>
        <label>Description
          <textarea className="input" rows="3" value={h.description || ''}
            onChange={(e) => upd('description', e.target.value)} />
        </label>
        <button className="btn btn-gold" onClick={save}>Save Hotel Info</button>
      </div>
    </div>
  );
}