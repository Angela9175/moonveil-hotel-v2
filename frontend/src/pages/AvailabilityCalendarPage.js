import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';

const formatDateInput = (date) => {
  const d = new Date(date);
  const offset = d.getTimezoneOffset();
  const local = new Date(d.getTime() - offset * 60 * 1000);
  return local.toISOString().slice(0, 10);
};

const formatDayLabel = (dateStr) => {
  const date = new Date(`${dateStr}T00:00:00`);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const formatWeekday = (dateStr) => {
  const date = new Date(`${dateStr}T00:00:00`);
  return date.toLocaleDateString('en-US', { weekday: 'short' });
};

const monthNames = ['January','February','March','April','May','June','July','August','September','October','November','December'];

export default function AvailabilityCalendarPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const [year, setYear] = useState(currentYear);
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth());
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const dates = useMemo(() => {
    const result = [];
    const start = new Date(year, selectedMonth, 1, 0, 0, 0);
    const end = new Date(year, selectedMonth + 1, 0, 0, 0, 0);
    const cursor = new Date(start);

    while (cursor <= end) {
      result.push(formatDateInput(cursor));
      cursor.setDate(cursor.getDate() + 1);
    }

    return result;
  }, [year, selectedMonth]);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        setLoading(true);
        setError('');
        const startOfMonth = `${year}-${String(selectedMonth + 1).padStart(2, '0')}-01`;
        const endOfMonth = new Date(year, selectedMonth + 1, 0).toISOString().slice(0, 10);
        const data = await api.roomAvailability(startOfMonth, endOfMonth);
        if (!cancelled) {
          setRooms(data.rooms || []);
        }
      } catch (e) {
        if (!cancelled) {
          setError(e.message || 'Unable to load availability.');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => { cancelled = true; };
  }, [year, selectedMonth]);

  const handleDayClick = (room, day) => {
    if (day.status === 'Occupied' && day.bookingId) {
      const dashboardPath = user?.role === 'admin' ? '/admin' : '/staff';
      navigate(`${dashboardPath}?tab=Bookings&bookingId=${day.bookingId}`);
      return;
    }

    if (day.status === 'Available') {
      const dashboardPath = user?.role === 'admin' ? '/admin' : user?.role === 'staff' ? '/staff' : '/login';
      if (dashboardPath === '/login') {
        navigate('/login');
        return;
      }
      navigate(`${dashboardPath}?tab=Users&roomId=${room.id}&date=${day.date}`);
      return;
    }

    if (day.status === 'Under Maintenance') {
      const dashboardPath = user?.role === 'admin' ? '/admin' : '/staff';
      navigate(`${dashboardPath}?tab=Users&roomId=${room.id}&date=${day.date}&maintenance=true`);
    }
  };

  return (
    <div className="section availability-page">
      <div className="calendar-shell card">
        <div className="calendar-topbar">
          <div>
            <p className="muted small-label">Front desk overview</p>
            <h2>Booking Calendar</h2>
          </div>
          <button className="btn btn-gold" onClick={() => navigate(user?.role === 'admin' ? '/admin?tab=Users' : user?.role === 'staff' ? '/staff?tab=Users' : '/login')}>
            New Booking
          </button>
        </div>

        <div className="calendar-toolbar">
          <select className="input mini-input" value={selectedMonth} onChange={(e) => setSelectedMonth(Number(e.target.value))}>
            {monthNames.map((month, index) => (
              <option key={month} value={index}>{month}</option>
            ))}
          </select>

          <select className="input mini-input" value={year} onChange={(e) => setYear(Number(e.target.value))}>
            {Array.from({ length: 5 }, (_, i) => currentYear - 2 + i).map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>

          <select className="input mini-input">
            <option>All room types</option>
            <option>Standard</option>
            <option>Deluxe</option>
            <option>Suite</option>
          </select>

          <select className="input mini-input">
            <option>All status</option>
            <option>Available</option>
            <option>Occupied</option>
            <option>Under Maintenance</option>
          </select>
        </div>

        <div className="availability-legend" aria-label="Calendar legend">
          <span className="legend-item"><span className="legend-dot available-dot" /> Available</span>
          <span className="legend-item"><span className="legend-dot occupied-dot" /> Occupied</span>
          <span className="legend-item"><span className="legend-dot maintenance-dot" /> Under Maintenance</span>
        </div>

        {error && <div className="error">{error}</div>}

        <div className="month-title">{monthNames[selectedMonth]} {year}</div>

        {loading ? (
          <div className="loading">Loading calendar…</div>
        ) : (
          <div className="availability-table-wrap">
            <table className="availability-table">
              <thead>
                <tr>
                  <th className="room-header">Room</th>
                  {dates.map((date) => (
                    <th key={date} className="day-header">
                      <span>{formatWeekday(date)}</span>
                      <strong>{new Date(`${date}T00:00:00`).getDate()}</strong>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rooms.length === 0 ? (
                  <tr>
                    <td colSpan={dates.length + 1}>No room records found.</td>
                  </tr>
                ) : (
                  rooms.map((room) => (
                    <tr key={room.id}>
                      <td className="room-name-cell">
                        <strong>{room.name}</strong>
                        <span className="room-type-badge" data-type={String(room.type || '').toLowerCase()}>{room.type}</span>
                        <div className="room-status-summary">
                          <span className="room-status-badge" data-status={room.status}>{room.status}</span>
                        </div>
                      </td>
                      {room.calendar.map((day) => {
                        const statusClass = day.status === 'Available'
                          ? 'day available'
                          : day.status === 'Occupied'
                            ? 'day occupied'
                            : 'day maintenance';

                        const title = day.status === 'Available'
                          ? `${room.name} is available on ${day.date}`
                          : day.status === 'Occupied'
                            ? `${room.name} is occupied on ${day.date}`
                            : `${room.name} is under maintenance on ${day.date}`;

                        return (
                          <td
                            key={`${room.id}-${day.date}`}
                            className={statusClass}
                            title={title}
                            onClick={() => handleDayClick(room, day)}
                          >
                            <span className="day-status">{day.status}</span>
                          </td>
                        );
                      })}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
