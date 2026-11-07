const API_BASE = '/api';

export const getToken = () => localStorage.getItem('token');

async function request(path, { method = 'GET', body, auth = true } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (auth) {
    const t = getToken();
    if (t) headers.Authorization = `Bearer ${t}`;
  }
  const res = await fetch(API_BASE + path, {
    method, headers, body: body ? JSON.stringify(body) : undefined,
  });

  const text = await res.text();
  const contentType = res.headers.get('content-type') || '';

  let data = {};
  if (text) {
    const looksJson = contentType.includes('application/json') || text.trim().startsWith('{') || text.trim().startsWith('[');
    if (looksJson) {
      try { data = JSON.parse(text); }
      catch { throw new Error('The server returned an invalid JSON response.'); }
    } else {
      throw new Error('The server is unavailable or returned an unexpected response.');
    }
  }

  if (!res.ok) throw new Error(data.message || data.error || `HTTP ${res.status}`);
  return data;
}

export const api = {
  // ── Auth ─────────────────────────────────────────────
  register: (d) => request('/auth/register', { method: 'POST', body: d, auth: false }),
  login:    (d) => request('/auth/login',    { method: 'POST', body: d, auth: false }),
  me:       () => request('/auth/me'),
  forgot:   (email) => request('/auth/forgot-password', { method: 'POST', body: { email }, auth: false }),
  reset:    (token, password) => request('/auth/reset-password', { method: 'POST', body: { token, password }, auth: false }),

  // ── Rooms ────────────────────────────────────────────
  rooms:            () => request('/rooms', { auth: false }),
  roomAvailability: (from, to) => request(`/rooms/availability?from=${encodeURIComponent(from || '')}&to=${encodeURIComponent(to || '')}`, { auth: false }),
  room:             (id) => request(`/rooms/${id}`, { auth: false }),
  createRoom:       (d) => request('/rooms', { method: 'POST', body: d }),
  updateRoom:       (id, d) => request(`/rooms/${id}`, { method: 'PUT', body: d }),
  deleteRoom:       (id) => request(`/rooms/${id}`, { method: 'DELETE' }),
  addRoomImage:     (id, d) => request(`/rooms/${id}/images`, { method: 'POST', body: d }),
  deleteRoomImage:  (roomId, imgId) => request(`/rooms/${roomId}/images/${imgId}`, { method: 'DELETE' }),

  // ── Bookings ─────────────────────────────────────────
  createBooking: (d) => request('/bookings', { method: 'POST', body: d }),
  createStaff:   (d) => request('/users/staff', { method: 'POST', body: d }),
  myBookings:    () => request('/bookings'),
  booking:       (id) => request(`/bookings/${id}`),
  cancelBooking: (id, reason) => request(`/bookings/${id}/cancel`, { method: 'POST', body: { reason } }),
  payBooking:    (id) => request(`/bookings/${id}/pay`, { method: 'POST' }),
  bookingCharges:(id) => request(`/bookings/${id}/charges`),

  // ── Admin / Staff ────────────────────────────────────
  staffBookings:      () => request('/staff/bookings'),
  staffBooking:       (id) => request(`/staff/bookings/${id}`),
  staffCreateBooking: (d) => request('/staff/bookings', { method: 'POST', body: d }),
  staffUpdateBooking: (id, d) => request(`/staff/bookings/${id}`, { method: 'PUT', body: d }),
  staffStats:         () => request('/staff/stats'),
  staffUsers:         () => request('/staff/users'),
  staffCreateGuest:   (d) => request('/staff/guests', { method: 'POST', body: d }),
  staffUpdateUser:    (id, d) => request(`/staff/users/${id}`, { method: 'PUT', body: d }),
  staffDeleteUser:    (id) => request(`/staff/users/${id}`, { method: 'DELETE' }),

  adminBookings:      () => request('/admin/bookings'),
  adminBooking:       (id) => request(`/admin/bookings/${id}`),
  adminUpdateBooking: (id, d) => request(`/admin/bookings/${id}`, { method: 'PUT', body: d }),
  adminDeleteBooking: (id) => request(`/admin/bookings/${id}`, { method: 'DELETE' }),
  adminPayments:      () => request('/admin/payments'),
  adminUsers:         () => request('/admin/users'),
  adminUpdateUser:    (id, d) => request(`/admin/users/${id}`, { method: 'PUT', body: d }),
  adminDeleteUser:    (id) => request(`/admin/users/${id}`, { method: 'DELETE' }),
  adminStats:         () => request('/admin/stats'),
  adminHotelInfo:     () => request('/admin/hotel-info'),
  adminSaveHotelInfo: (d) => request('/admin/hotel-info', { method: 'PUT', body: d }),
  adminSettings:      () => request('/admin/settings'),
  adminSaveSettings:  (d) => request('/admin/settings', { method: 'PUT', body: d }),
  
  // Charge endpoints configured to route through the shared bookings path
  adminAddCharge:     (bookingId, d) => request(`/bookings/${bookingId}/charges`, { method: 'POST', body: d }),
  adminDeleteCharge:  (bookingId, chargeId) => request(`/bookings/${bookingId}/charges/${chargeId}`, { method: 'DELETE' }),

  // ── Reviews & Comments ───────────────────────────────
  getReviews:          (roomId) => request(`/reviews${roomId ? `?roomId=${roomId}` : ''}`, { auth: false }),
  submitReview:        (d) => request('/reviews', { method: 'POST', body: d, auth: false }),
  submitBookingReview: (d) => request('/reviews', { method: 'POST', body: d, auth: false }),
  adminReviews:        () => request('/reviews'),
  deleteReview:        (id) => request(`/reviews/${id}`, { method: 'DELETE' }),

  // ── Hotel (public) ───────────────────────────────────
  hotelInfo:     () => request('/hotel/info', { auth: false }),
  hotelSettings: () => request('/hotel/settings', { auth: false }),
};