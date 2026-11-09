import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';

const todayPlus = (d) => {
  const x = new Date();
  x.setDate(x.getDate() + d);
  return x.toISOString().slice(0, 10);
};

const nextDayISO = (dateString) => {
  const date = new Date(dateString);
  date.setDate(date.getDate() + 1);
  return date.toISOString().slice(0, 10);
};

const roomAddOnPriceMap = {
  'None': 0,
  'Extra bed': 800,
  'Extra pillow': 80,
  'Towel set': 120,
  'Mattress topper': 350,
  'Bathrobe set': 180,
  'Fan request': 100,
};

const paymentPlatformMeta = {
  gcash: {
    label: 'GCash',
    note: 'Use GCash to complete your secure online transaction.',
    qr: 'GCASH',
  },
  paymaya: {
    label: 'PayMaya',
    note: 'Use PayMaya to complete your secure online transaction.',
    qr: 'PAYMAYA',
  },
  credit_card: {
    label: 'Credit Card (Visa / Mastercard)',
    note: 'Enter your credit card details for a secure simulated payment.',
    isCard: true,
  },
  debit_card: {
    label: 'Debit Card',
    note: 'Enter your debit card details for a secure simulated payment.',
    isCard: true,
  },
};

const roomsByFloorMap = {
  'Floor 1': [
    { number: '101', label: 'Room 101 (Accessible, near lobby)' },
    { number: '102', label: 'Room 102 (Garden access)' },
  ],
  'Floor 2': [
    { number: '201', label: 'Room 201 (Mid Level, Standard)' },
    { number: '202', label: 'Room 202 (Poolside view)' },
  ],
  'Floor 3': [
    { number: '301', label: 'Room 301 (Near Elevator)' },
    { number: '302', label: 'Room 302 (Quiet Corner)' },
    { number: '303', label: 'Room 303 (Balcony View)' },
  ],
  'Floor 4': [
    { number: '401', label: 'Room 401 (Executive Suite, Corner View)' },
    { number: '402', label: 'Room 402 (Executive Suite, City View)' },
  ],
  'Floor 5': [
    { number: '501', label: 'Room 501 (Penthouse Suite, Panoramic View)' },
    { number: '502', label: 'Room 502 (Penthouse Suite, Private Terrace)' },
  ],
};

const getFreshBookingForm = (defaultFloor = 'Floor 3', defaultRoom = '301') => ({
  checkIn: todayPlus(1),
  checkInTime: '14:00',
  checkOut: todayPlus(3),
  checkOutTime: '12:00',
  adults: 2,
  children: 0,
  guestName: '',
  guestPhone: '',
  guestEmail: '',
  paymentContactNumber: '',
  roomAddOns: 'None',
  paymentMethod: 'gcash',
  paymentType: 'downpayment', // 'downpayment' (50%) or 'full' (100%)
  floor: defaultFloor,      
  roomNumber: defaultRoom,     
});

export default function BookingPage() {
  const { roomId } = useParams();
  const nav = useNavigate();
  const { user } = useAuth();
  const [room, setRoom] = useState(null);
  const [form, setForm] = useState(() => getFreshBookingForm());
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const [paymentReceipt, setPaymentReceipt] = useState(null);
  const [unavailableRooms, setUnavailableRooms] = useState([]);

  useEffect(() => {
    api.room(roomId).then((fetchedRoom) => {
      setRoom(fetchedRoom);
      const allowedFloorsRaw = fetchedRoom?.allowed_floors || '1,2,3';
      const firstFloorNum = allowedFloorsRaw.split(',')[0].trim();
      const defaultFloorKey = `Floor ${firstFloorNum}`;
      const defaultRoomNum = roomsByFloorMap[defaultFloorKey]?.[0]?.number || '301';

      setForm(getFreshBookingForm(defaultFloorKey, defaultRoomNum));
    }).catch(() => nav('/rooms'));
  }, [roomId, nav]);

  useEffect(() => {
    if (room) {
      const allowedFloorsRaw = room?.allowed_floors || '1,2,3';
      const firstFloorNum = allowedFloorsRaw.split(',')[0].trim();
      const defaultFloorKey = `Floor ${firstFloorNum}`;
      const defaultRoomNum = roomsByFloorMap[defaultFloorKey]?.[0]?.number || '301';
      setForm(getFreshBookingForm(defaultFloorKey, defaultRoomNum));
    }
    setErr('');
    setPaymentReceipt(null);
  }, [user?.id, roomId]);

  // Live availability check for room numbers on selected dates
  useEffect(() => {
    async function checkAvailability() {
      if (!form.checkIn || !form.checkOut) return;
      try {
        const bookings = await api.getAllBookingsAdmin?.() || [];
        const conflictRoomNumbers = bookings
          .filter(b => {
            if (b.status === 'Cancelled') return false;
            const bCheckIn = new Date(b.checkIn || b.check_in);
            const bCheckOut = new Date(b.checkOut || b.check_out);
            const reqCheckIn = new Date(form.checkIn);
            const reqCheckOut = new Date(form.checkOut);
            
            const isOverlap = reqCheckIn < bCheckOut && reqCheckOut > bCheckIn;
            return isOverlap && String(b.roomId || b.room_id) === String(roomId);
          })
          .map(b => String(b.roomNumber || b.room_number));

        setUnavailableRooms(conflictRoomNumbers);
      } catch (e) {
        setUnavailableRooms([]);
      }
    }
    checkAvailability();
  }, [form.checkIn, form.checkOut, roomId]);

  const maxCapacity = room?.capacity || 2;

  const handleAdultsChange = (val) => {
    const newAdults = Math.max(1, Number(val) || 1);
    const currentChildren = Number(form.children) || 0;
    
    if (newAdults + currentChildren > maxCapacity) {
      const allowedChildren = Math.max(0, maxCapacity - newAdults);
      setForm(f => ({ ...f, adults: newAdults, children: allowedChildren }));
    } else {
      setForm(f => ({ ...f, adults: newAdults }));
    }
  };

  const handleChildrenChange = (val) => {
    const newChildren = Math.max(0, Number(val) || 0);
    const currentAdults = Number(form.adults) || 1;
    
    if (currentAdults + newChildren > maxCapacity) {
      const allowedChildren = Math.max(0, maxCapacity - currentAdults);
      setForm(f => ({ ...f, children: allowedChildren }));
    } else {
      setForm(f => ({ ...f, children: newChildren }));
    }
  };

  const allowedFloorsList = room?.allowed_floors 
    ? room.allowed_floors.split(',').map(f => {
        const num = f.trim();
        const floorKey = `Floor ${num}`;
        const descriptions = {
          '1': 'Floor 1 (Ground Level, Garden View)',
          '2': 'Floor 2 (Mid Level, Pool View)',
          '3': 'Floor 3 (High Floor, City View)',
          '4': 'Floor 4 (Executive Level, Sky View)',
          '5': 'Floor 5 (Penthouse Level, Panoramic View)'
        };
        return { key: floorKey, label: descriptions[num] || `Floor ${num}` };
      })
    : [
        { key: 'Floor 1', label: 'Floor 1 (Ground Level, Garden View)' },
        { key: 'Floor 2', label: 'Floor 2 (Mid Level, Pool View)' },
        { key: 'Floor 3', label: 'Floor 3 (High Floor, City View)' },
        { key: 'Floor 4', label: 'Floor 4 (Executive Level, Sky View)' },
        { key: 'Floor 5', label: 'Floor 5 (Penthouse Level, Panoramic View)' },
      ];

  const isValidPaymentNumber = (value) => /^09\d{9}$/.test(String(value || '').replace(/\s+/g, ''));

  const nights = room
    ? Math.max(1, Math.ceil((new Date(form.checkOut) - new Date(form.checkIn)) / 86400000))
    : 1;

  const standardCheckOutHour = 12;
  const userCheckOutHour = parseInt((form.checkOutTime || '12:00').split(':')[0], 10) || 12;
  const extraHours = Math.max(0, userCheckOutHour - standardCheckOutHour);
  const hourlyLateFeeRate = room ? (Number(room.price) / 24) * 1.5 : 0; 
  const lateStayFee = extraHours > 0 ? extraHours * hourlyLateFeeRate : 0;

  const adultCount = Math.max(1, Number(form.adults) || 1);
  const childCount = Math.max(0, Number(form.children) || 0);
  const nightlyRate = room ? Number(room.price) : 0;
  const standardAdultCount = 2;
  const childDiscountRate = 0.15;
  const extraAdultSurcharge = Math.max(0, adultCount - standardAdultCount) * nightlyRate * 0.2;
  const childDiscount = childCount * nightlyRate * childDiscountRate;
  const roomBaseBeforeExtras = nightlyRate * nights + extraAdultSurcharge - childDiscount + lateStayFee;
  const baseTotal = room ? Math.max(0, roomBaseBeforeExtras) : 0;
  const selectedAddOnCharge = roomAddOnPriceMap[form.roomAddOns] || 0;
  const total = baseTotal + selectedAddOnCharge;

  const downpaymentAmount = total * 0.50;
  const remainingBalanceType = form.paymentType === 'full' ? 0 : total - downpaymentAmount;
  const amountPaidNow = form.paymentType === 'full' ? total : downpaymentAmount;

  const upd = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleFloorChange = (selectedFloor) => {
    const availableRooms = roomsByFloorMap[selectedFloor] || [];
    const defaultRoomNumber = availableRooms[0]?.number || '';

    setForm((prev) => ({
      ...prev,
      floor: selectedFloor,
      roomNumber: defaultRoomNumber,
    }));
  };

  const handleCheckInChange = (value) => {
    setForm((f) => {
      const nextCheckIn = value;
      const currentCheckOut = new Date(f.checkOut);
      const incomingCheckIn = new Date(value);
      const nextCheckOut = incomingCheckIn >= currentCheckOut ? nextDayISO(value) : f.checkOut;

      return { ...f, checkIn: nextCheckIn, checkOut: nextCheckOut };
    });
  };

  const handleCheckOutChange = (value) => {
    setForm((f) => {
      const nextCheckOut = value;
      const incomingCheckOut = new Date(value);
      const currentCheckIn = new Date(f.checkIn);

      if (incomingCheckOut <= currentCheckIn) {
        return { ...f, checkOut: nextDayISO(f.checkIn) };
      }

      return { ...f, checkOut: nextCheckOut };
    });
  };

  const createPaymentReceipt = (method, paidNow, balance, type) => {
    const base = method === 'gcash' ? 'GCASH' : method === 'paymaya' ? 'PAYMAYA' : 'CARD';
    const refNumber = String(Math.floor(Date.now() / 1000) % 1000000).padStart(6, '0');
    const paymentLabel = paymentPlatformMeta[method]?.label || 'Online Payment';

    return {
      method,
      label: paymentLabel,
      paidNow,
      balance,
      type,
      reference: `${base}-${refNumber}`,
      status: type === 'full' ? 'Fully Paid Online' : '50% Downpayment Paid',
    };
  };

  async function submit(e) {
    e.preventDefault();
    setErr('');
    setBusy(true);
    try {
      const paymentMethod = form.paymentMethod;
      const guestName = form.guestName.trim();

      if (!guestName) {
        throw new Error('Please enter the guest name.');
      }

      if (unavailableRooms.includes(String(form.roomNumber))) {
        throw new Error(`Room ${form.roomNumber} is already booked for the selected dates. Please choose another room number.`);
      }

      const isCard = paymentPlatformMeta[paymentMethod]?.isCard;
      if (!isCard) {
        const paymentNumber = String(form.paymentContactNumber || '').replace(/\s+/g, '');
        if (!isValidPaymentNumber(paymentNumber)) {
          throw new Error('Please enter a valid 11-digit mobile number for online payment.');
        }
      }

      const extraCharges = (roomAddOnPriceMap[form.roomAddOns] || 0) + lateStayFee;
      const roomSubtotal = Math.max(0, (Number(room.price) * nights) + Math.max(0, adultCount - 2) * Number(room.price) * 0.2 - (childCount * Number(room.price) * 0.5));

      await api.createBooking({
        roomId,
        roomName: room.name,
        guestName,
        guestPhone: form.guestPhone || '',
        guestEmail: form.guestEmail || '',
        checkIn: `${form.checkIn} ${form.checkInTime}`,
        checkOut: `${form.checkOut} ${form.checkOutTime}`,
        adults: form.adults,
        children: form.children,
        guests: Number(form.adults) + Number(form.children),
        roomAddOns: form.roomAddOns === 'None' ? '' : form.roomAddOns,
        totalPrice: roomSubtotal,
        extraCharges,
        paymentMethod,
        floor: form.floor,           
        roomNumber: form.roomNumber, 
      });

      setPaymentReceipt(createPaymentReceipt(paymentMethod, amountPaidNow, remainingBalanceType, form.paymentType));
    } catch (e) {
      setErr(e.message);
    } finally {
      setBusy(false);
    }
  }

  if (!room) return <div className="loading">Loading room…</div>;

  if (paymentReceipt) {
    return (
      <div className="section">
        <div className="card" style={{ maxWidth: 620, margin: '40px auto', background: 'rgba(15,42,60,0.96)', borderColor: 'var(--bg-border)' }}>
          <h2 style={{ marginBottom: 6 }}>Payment & Booking Receipt</h2>
          <p className="muted" style={{ marginBottom: 20 }}>Your reservation has been secured successfully online.</p>

          <div style={{ display: 'grid', gap: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, padding: '12px 14px', borderRadius: 8, background: 'rgba(255,255,255,0.03)', border: '1px solid var(--bg-border)' }}>
              <span style={{ color: 'var(--text-muted)' }}>Payment method</span>
              <strong>{paymentReceipt.label}</strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, padding: '12px 14px', borderRadius: 8, background: 'rgba(255,255,255,0.03)', border: '1px solid var(--bg-border)' }}>
              <span style={{ color: 'var(--text-muted)' }}>Amount Paid Online ({paymentReceipt.type === 'full' ? '100%' : '50%'})</span>
              <strong style={{ color: '#4caf50' }}>₱{Number(paymentReceipt.paidNow).toFixed(2)}</strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, padding: '12px 14px', borderRadius: 8, background: 'rgba(255,255,255,0.03)', border: '1px solid var(--bg-border)' }}>
              <span style={{ color: 'var(--text-muted)' }}>Balance Due at Hotel</span>
              <strong style={{ color: '#ff9800' }}>₱{Number(paymentReceipt.balance).toFixed(2)}</strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, padding: '12px 14px', borderRadius: 8, background: 'rgba(255,255,255,0.03)', border: '1px solid var(--bg-border)' }}>
              <span style={{ color: 'var(--text-muted)' }}>Reference code</span>
              <strong style={{ color: 'var(--gold)' }}>{paymentReceipt.reference}</strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, padding: '12px 14px', borderRadius: 8, background: 'rgba(212,175,55,0.08)', border: '1px solid var(--gold)' }}>
              <span style={{ color: 'var(--text-muted)' }}>Status</span>
              <strong style={{ color: 'var(--gold)' }}>{paymentReceipt.status}</strong>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 12, marginTop: 22, flexWrap: 'wrap' }}>
            <button type="button" className="btn btn-gold" onClick={() => nav('/my-bookings')}>
              View My Bookings
            </button>
            <button type="button" className="btn btn-ghost" onClick={() => nav('/rooms')}>
              Browse Rooms
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="section">
      <style>{`
        input[type="date"]::-webkit-calendar-picker-indicator,
        input[type="time"]::-webkit-calendar-picker-indicator {
          filter: invert(1) brightness(20);
          cursor: pointer;
        }
      `}</style>

      <h1>Book: {room.name}</h1>
      <p className="muted">₱{Number(room.price).toFixed(2)} / night &bull; Max Capacity: {maxCapacity} Guests </p>

      <div className="booking-grid">
        <form className="booking-form card" onSubmit={submit}>
          {err && <div className="error">{err}</div>}

          <div className="row-2">
            <label>Check-in Date
              <input
                type="date"
                className="input"
                min={todayPlus(0)}
                value={form.checkIn}
                onChange={(e) => handleCheckInChange(e.target.value)}
                required
              />
            </label>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-main, #fff)' }}>Check-in Time</span>
                <span style={{ fontSize: '11px', color: 'var(--gold)', fontWeight: 600, letterSpacing: '0.5px' }}>[ Hours : Minutes ]</span>
              </div>
              <input
                type="time"
                className="input"
                value={form.checkInTime}
                onChange={(e) => upd('checkInTime', e.target.value)}
                required
              />
            </div>
          </div>

          <div className="row-2" style={{ marginTop: 12 }}>
            <label>Check-out Date
              <input
                type="date"
                className="input"
                min={nextDayISO(form.checkIn)}
                value={form.checkOut}
                onChange={(e) => handleCheckOutChange(e.target.value)}
                required
              />
            </label>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-main, #fff)' }}>Check-out Time</span>
                <span style={{ fontSize: '11px', color: 'var(--gold)', fontWeight: 600, letterSpacing: '0.5px' }}>[ Hours : Minutes ]</span>
              </div>
              <input
                type="time"
                className="input"
                value={form.checkOutTime}
                onChange={(e) => upd('checkOutTime', e.target.value)}
                required
              />
            </div>
          </div>

          <div style={{ marginTop: 12, padding: '16px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--bg-border)', borderRadius: 8 }}>
            <div className="row-2">
              <label>Preferred Floor
                <select
                  className="input"
                  value={form.floor}
                  onChange={(e) => handleFloorChange(e.target.value)}
                >
                  {allowedFloorsList.map((f) => (
                    <option key={f.key} value={f.key}>
                      {f.label}
                    </option>
                  ))}
                </select>
              </label>
              <label>Room Number
                <select
                  className="input"
                  value={form.roomNumber}
                  onChange={(e) => upd('roomNumber', e.target.value)}
                >
                  {(roomsByFloorMap[form.floor] || []).map((roomOption) => {
                    const isBooked = unavailableRooms.includes(roomOption.number);
                    return (
                      <option key={roomOption.number} value={roomOption.number} disabled={isBooked}>
                        {roomOption.label} {isBooked ? ' — [Booked / Unavailable]' : ' — [Available]'}
                      </option>
                    );
                  })}
                </select>
              </label>
            </div>
          </div>

          <div className="row-2" style={{ marginTop: 12 }}>
            <label>Adults (Max Total: {maxCapacity})
              <input
                type="number"
                min="1"
                max={maxCapacity}
                className="input"
                value={form.adults}
                onChange={(e) => handleAdultsChange(e.target.value)}
                required
              />
            </label>
            <label>Children (Max Total: {maxCapacity})
              <input
                type="number"
                min="0"
                max={maxCapacity}
                className="input"
                value={form.children}
                onChange={(e) => handleChildrenChange(e.target.value)}
              />
            </label>
          </div>

          <div className="row-2">
            <label>Guest name
              <input
                type="text"
                className="input"
                value={form.guestName}
                onChange={(e) => upd('guestName', e.target.value)}
                placeholder="Full name"
                required
              />
            </label>
            <label>Contact number
              <input
                type="tel"
                className="input"
                value={form.guestPhone}
                onChange={(e) => upd('guestPhone', e.target.value)}
                placeholder="09xx xxx xxxx"
              />
            </label>
          </div>

          <label>Guest email
            <input
              type="email"
              className="input"
              value={form.guestEmail}
              onChange={(e) => upd('guestEmail', e.target.value)}
              placeholder="guest@email.com"
              required
            />
          </label>

          <label>Room add-ons
            <select
              className="input"
              value={form.roomAddOns}
              onChange={(e) => upd('roomAddOns', e.target.value)}
            >
              <option value="None">None - ₱0</option>
              <option value="Extra bed">Extra bed - ₱800</option>
              <option value="Extra pillow">Extra pillow - ₱80</option>
              <option value="Towel set">Towel set - ₱120</option>
              <option value="Mattress topper">Mattress topper - ₱350</option>
              <option value="Bathrobe set">Bathrobe set - ₱180</option>
              <option value="Fan request">Fan request - ₱100</option>
            </select>
          </label>

          <label style={{ marginTop: 12 }}>Payment Option
            <select
              className="input"
              value={form.paymentType}
              onChange={(e) => upd('paymentType', e.target.value)}
            >
              <option value="downpayment">50% Downpayment (Secure Room, Balance at Hotel)</option>
              <option value="full">Full Payment (100% Paid Online)</option>
            </select>
          </label>

          <label style={{ marginTop: 12, display: 'block' }}>Online Payment Method
            <select
              className="input"
              value={form.paymentMethod}
              onChange={(e) => upd('paymentMethod', e.target.value)}
            >
              <option value="gcash">GCash</option>
              <option value="paymaya">PayMaya</option>
              <option value="credit_card">Credit Card (Visa / Mastercard)</option>
              <option value="debit_card">Debit Card</option>
            </select>
          </label>

          {paymentPlatformMeta[form.paymentMethod] && (
            <div className="info" style={{ marginTop: 10 }}>
              <strong>{paymentPlatformMeta[form.paymentMethod].label}</strong>
              <div style={{ marginTop: 8 }}>{paymentPlatformMeta[form.paymentMethod].note}</div>

              {paymentPlatformMeta[form.paymentMethod].isCard ? (
                <div style={{ marginTop: 12, display: 'grid', gap: 10 }}>
                  <label>Card Number
                    <input
                      type="text"
                      className="input"
                      maxLength={19}
                      placeholder="4111 2222 3333 4444"
                      onChange={(e) => upd('paymentContactNumber', e.target.value)}
                    />
                  </label>
                  <div className="row-2">
                    <label>Expiry (MM/YY)
                      <input type="text" className="input" maxLength={5} placeholder="MM/YY" />
                    </label>
                    <label>CVV
                      <input type="password" className="input" maxLength={4} placeholder="123" />
                    </label>
                  </div>
                </div>
              ) : (
                <>
                  <label style={{ marginTop: 12, display: 'block' }}>
                    Payment mobile number
                    <input
                      type="tel"
                      className="input"
                      value={form.paymentContactNumber}
                      inputMode="numeric"
                      maxLength={11}
                      placeholder="09XXXXXXXXX"
                      onChange={(e) => {
                        const digits = e.target.value.replace(/\D/g, '').slice(0, 11);
                        upd('paymentContactNumber', digits);
                      }}
                    />
                  </label>

                  <div style={{ marginTop: 12, padding: 12, border: '1px solid var(--bg-border)', borderRadius: 8, background: 'rgba(0,0,0,0.18)' }}>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8 }}>Online Payment Simulation</div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                      <div>
                        <div style={{ fontWeight: 700, color: 'var(--gold)' }}>{paymentPlatformMeta[form.paymentMethod].qr}</div>
                        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Due Now: ₱{amountPaidNow.toFixed(2)}</div>
                        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Reference: MOONVEIL-{String(amountPaidNow.toFixed(0)).padStart(4, '0')}</div>
                      </div>
                      <div style={{ width: 64, height: 64, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(212,175,55,0.12)', border: '1px solid var(--gold)', color: 'var(--gold)', fontWeight: 700 }}>
                        QR
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          <button className="btn btn-gold btn-lg" disabled={busy} style={{ marginTop: 16 }}>
            {busy ? 'Processing…' : `Pay ₱${amountPaidNow.toFixed(2)} (${form.paymentType === 'full' ? 'Full Payment' : '50% Downpayment'})`}
          </button>
        </form>

        <aside className="booking-summary card">
          <h3>Summary & Payment</h3>
          <p><span>Room</span><span>{room.name}</span></p>
          <p><span>Floor & Room</span><span>{form.floor} | Room {form.roomNumber}</span></p>
          <p><span>Rate</span><span>₱{Number(room.price).toFixed(2)} × {nights} night(s)</span></p>
          <p><span>Max Capacity</span><span>{maxCapacity} Guests</span></p>
          <p><span>Check-in</span><span>{form.checkIn} @ {form.checkInTime}</span></p>
          <p><span>Check-out</span><span>{form.checkOut} @ {form.checkOutTime}</span></p>
          <p><span>Adults</span><span>{adultCount}</span></p>
          <p><span>Children</span><span>{childCount}</span></p>
          {adultCount > 2 && <p><span>Extra adult fee</span><span>₱{extraAdultSurcharge.toFixed(2)}</span></p>}
          {childCount > 0 && <p><span>Child discount</span><span>-₱{childDiscount.toFixed(2)}</span></p>}
          {lateStayFee > 0 && <p style={{ color: 'var(--gold)' }}><span>Late stay / Extra hours fee</span><span>₱{lateStayFee.toFixed(2)}</span></p>}
          {selectedAddOnCharge > 0 && (
            <p><span>Room add-on</span><span>₱{selectedAddOnCharge.toFixed(2)}</span></p>
          )}
          <hr />
          <p><span>Total Cost</span><span>₱{total.toFixed(2)}</span></p>
          <p style={{ color: '#4caf50', fontWeight: 'bold' }}>
            <span>Amount Paid Now ({form.paymentType === 'full' ? '100%' : '50%'})</span>
            <span>₱{amountPaidNow.toFixed(2)}</span>
          </p>
          <p style={{ color: '#ff9800' }}>
            <span>Balance Due at Hotel</span>
            <span>₱{remainingBalanceType.toFixed(2)}</span>
          </p>
          <hr />
          <p className="total"><span>Pay Today</span><span>₱{amountPaidNow.toFixed(2)}</span></p>
        </aside>
      </div>
    </div>
  );
}