import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';

export default function RoomDetailPage() {
  const { id } = useParams();
  const nav = useNavigate();
  const { user } = useAuth();
  const [room, setRoom] = useState(null);
  const [active, setActive] = useState(0);

  useEffect(() => {
    api.room(id)
      .then((r) => { setRoom(r); setActive(0); })
      .catch(() => nav('/rooms'));
  }, [id, nav]);

  if (!room) return <div className="loading">Loading…</div>;

  // Robust image parser for JSON arrays stored in room.image or room.images
  let rawImages = [];
  if (room.images && Array.isArray(room.images) && room.images.length > 0) {
    rawImages = room.images;
  } else if (room.image) {
    if (typeof room.image === 'string' && room.image.startsWith('[')) {
      try {
        rawImages = JSON.parse(room.image);
      } catch (e) {
        rawImages = [room.image];
      }
    } else {
      rawImages = [room.image];
    }
  } else {
    rawImages = ['https://via.placeholder.com/800x500/132f4c/d4af37'];
  }

  const images = rawImages.map((img, i) => {
    if (typeof img === 'string') {
      return { image_url: img, angle_label: i === 0 ? 'Main' : `View ${i + 1}` };
    }
    return {
      image_url: img.image_url || img,
      angle_label: img.angle_label || (i === 0 ? 'Main' : `View ${i + 1}`)
    };
  });

  const current = images[active] || images[0];

  const handleBook = () => {
    if (!user) {
      nav('/login');
      return;
    }

    if (user.role === 'staff') {
      nav(`/staff?tab=Users&roomId=${room.id}`);
      return;
    }

    if (user.role === 'admin') {
      nav(`/admin?tab=Users&roomId=${room.id}`);
      return;
    }

    nav(`/book/${room.id}`);
  };

  return (
    <div className="section room-detail">
      <div>
        <div className="gallery-main">
          <img src={current.image_url} alt={current.angle_label || room.name} />
        </div>
        {images.length > 1 && (
          <div className="gallery-thumbs">
            {images.map((img, i) => (
              <button
                key={i}
                className={i === active ? 'thumb active' : 'thumb'}
                onClick={() => setActive(i)}
              >
                <img src={img.image_url} alt={img.angle_label || `View ${i + 1}`} />
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="room-info">
        <h1>{room.name}</h1>
        <p className="muted">{room.type} · ★ {room.rating}</p>
        <p style={{ marginTop: 14 }}>{room.description}</p>

        {Array.isArray(room.amenities) && room.amenities.length > 0 && (
          <>
            <h3 style={{ marginTop: 20 }}>Amenities</h3>
            <ul className="amenities">
              {room.amenities.map((a, i) => <li key={i}>{a}</li>)}
            </ul>
          </>
        )}

        <p className="price-lg">₱{Number(room.price).toFixed(2)} / night</p>

        <div className="booking-actions">
          <button className="btn btn-gold btn-lg" onClick={handleBook}>Book Now</button>
          <Link to="/rooms" className="btn btn-ghost">Back to rooms</Link>
        </div>
      </div>
    </div>
  );
}