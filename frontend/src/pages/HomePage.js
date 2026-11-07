import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';

export default function HomePage() {
  const [rooms, setRooms] = useState([]);
  const [info, setInfo] = useState({});

  useEffect(() => {
    api.rooms().then((rs) => setRooms(rs.slice(0, 3))).catch(() => {});
    api.hotelInfo().then(setInfo).catch(() => {});
  }, []);

  return (
    <div>
      <section className="hero">
        <div className="hero-inner">
          <h1>{info.name || 'Welcome to Moonveil Hotel'}</h1>
          <p>{info.description || 'Luxury stays, unforgettable memories.'}</p>
          <Link to="/rooms" className="btn btn-gold btn-lg">Browse Rooms</Link>
        </div>
      </section>

      <section className="section">
        <h2>Featured Rooms</h2>
        <div className="grid grid-3" style={{ marginTop: 24 }}>
          {rooms.map((r) => (
            <div key={r.id} className="card room-card" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
              <Link to={`/rooms/${r.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                <img
                  src={r.image || 'https://via.placeholder.com/400x260/132f4c/d4af37'}
                  alt={r.name}
                  style={{ width: '100%', height: '220px', objectFit: 'cover' }}
                />
              </Link>
              <div className="card-body" style={{ display: 'flex', flexDirection: 'column', flexGrow: 1, justifyContent: 'space-between' }}>
                <div>
                  <Link to={`/rooms/${r.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                    <h3 style={{ marginBottom: '8px' }}>{r.name}</h3>
                  </Link>
                  <p className="muted" style={{ marginBottom: '6px' }}>{r.type} · ★ {r.rating}</p>
                  <p className="price" style={{ marginBottom: '16px', fontWeight: 'bold' }}>₱{Number(r.price).toFixed(2)} / night</p>
                </div>
                
                <Link to={`/rooms/${r.id}`} className="btn btn-gold" style={{ width: '100%', textAlign: 'center', boxSizing: 'border-box' }}>
                  View Room Details
                </Link>
              </div>
            </div>
          ))}
          {!rooms.length && <p className="muted">Loading rooms…</p>}
        </div>
      </section>
    </div>
  );
}