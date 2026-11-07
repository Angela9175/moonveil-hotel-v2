import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const nav = useNavigate();

  const handleLogout = () => {
    const ok = window.confirm('Are you sure you want to log out?');
    if (!ok) return;
    logout();
    nav('/');
  };

  const isStaffOrAdmin = user?.role === 'admin' || user?.role === 'staff';

  return (
    <nav className="navbar">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fredoka:wght@500;600;700&display=swap');
        .navbar-brand-logo {
          font-family: 'Fredoka', sans-serif;
          font-weight: 700;
          display: flex;
          align-items: center;
          text-decoration: none;
        }
      `}</style>

      <div className="nav-container">
        <Link to="/" className="navbar-brand-logo">
          <svg width="180" height="48" viewBox="0 0 200 50" fill="none" xmlns="http://www.w3.org/2000/svg">
            <text x="0" y="36" fontFamily="'Fredoka', sans-serif" fontSize="32" fontWeight="700" fill="#d4af37">MOONV</text>
            <g transform="translate(125, 6)">
              <path d="M18 3C10.268 3 4 9.268 4 17C4 24.732 10.268 31 18 31C20.211 31 22.316 30.418 24.184 29.356C19.982 28.232 17 24.417 17 19.914C17 15.411 19.982 11.596 24.184 10.472C22.316 9.41 20.211 8.828 18 8.828V3Z" fill="#7fffd4"/>
              <path d="M12 18L12.7 19.5L14.2 20.2L12.7 20.9L12 22.4L11.3 20.9L9.8 20.2L11.3 19.5L12 18Z" fill="#d4af37"/>
              <path d="M25 15L25.6 16.3L26.9 16.9L25.6 17.5L25 18.8L24.4 17.5L23.1 16.9L24.4 16.3L25 15Z" fill="#d4af37"/>
              <text x="28" y="5" fontFamily="'Fredoka', sans-serif" fontSize="11" fontWeight="600" fill="#c7e3dc">z</text>
              <text x="33" y="-1" fontFamily="'Fredoka', sans-serif" fontSize="13" fontWeight="600" fill="#c7e3dc">z</text>
              <text x="39" y="-8" fontFamily="'Fredoka', sans-serif" fontSize="16" fontWeight="700" fill="#c7e3dc">Z</text>
            </g>
            <text x="163" y="36" fontFamily="'Fredoka', sans-serif" fontSize="32" fontWeight="700" fill="#d4af37">IL</text>
          </svg>
        </Link>

        <ul className="nav-links">
          <li><NavLink to="/" end>Home</NavLink></li>
          <li><NavLink to="/rooms">Rooms</NavLink></li>
          {isStaffOrAdmin && <li><NavLink to="/availability">Availability</NavLink></li>}
          <li><NavLink to="/hotel">Hotel Info</NavLink></li>
          {user && <li><NavLink to="/my-bookings">My Bookings</NavLink></li>}
          {user?.role === 'admin' && <li><NavLink to="/admin">Operations</NavLink></li>}
          {user?.role === 'staff' && <li><NavLink to="/staff">Operations</NavLink></li>}
        </ul>

        <div className="nav-auth">
          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span className="user-tag">Hi, {user.firstName}</span>
              
              {/* Customer Profile Icon Button */}
              <Link 
                to="/profile" 
                title="Manage Profile" 
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  width: '36px', 
                  height: '36px', 
                  borderRadius: '50%', 
                  background: 'rgba(212,175,55,0.15)', 
                  border: '1px solid var(--gold)', 
                  color: 'var(--gold)',
                  transition: 'background 0.2s'
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
              </Link>

              <button className="btn btn-ghost" onClick={handleLogout}>Logout</button>
            </div>
          ) : (
            <>
              <Link to="/login" className="btn btn-ghost">Login</Link>
              <Link to="/register" className="btn btn-gold">Register</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
