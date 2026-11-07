import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';

export default function RoomsPage() {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter States
  const [q, setQ] = useState('');
  const [roomType, setRoomType] = useState('all');
  const [maxPrice, setMaxPrice] = useState(15000);
  const [selectedAmenities, setSelectedAmenities] = useState({
    wifi: false,
    aircon: false,
    miniBar: false,
    bathtub: false,
    smartTv: false,
    balcony: false,
    oceanView: false,
    roomService: false,
    safe: false,
    coffeeMaker: false,
    breakfast: false,
    poolAccess: false,
  });

  useEffect(() => {
    api.rooms()
      .then(setRooms)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleAmenityChange = (amenityKey) => {
    setSelectedAmenities(prev => ({ ...prev, [amenityKey]: !prev[amenityKey] }));
  };

  const handleResetFilters = () => {
    setQ('');
    setRoomType('all');
    setMaxPrice(15000);
    setSelectedAmenities({
      wifi: false,
      aircon: false,
      miniBar: false,
      bathtub: false,
      smartTv: false,
      balcony: false,
      oceanView: false,
      roomService: false,
      safe: false,
      coffeeMaker: false,
      breakfast: false,
      poolAccess: false,
    });
  };

  const filtered = rooms.filter((r) => {
    const matchesSearch = (r.name + ' ' + (r.description || '') + ' ' + r.type).toLowerCase().includes(q.toLowerCase());
    const matchesType = roomType === 'all' || r.type?.toLowerCase() === roomType.toLowerCase();
    const matchesPrice = Number(r.price) <= maxPrice;

    const amenitiesList = r.amenities || [];
    const checkAmenity = (key, label) => !selectedAmenities[key] || amenitiesList.includes(label);

    const matchesAmenities = 
      checkAmenity('wifi', 'WiFi') &&
      checkAmenity('aircon', 'Aircon') &&
      checkAmenity('miniBar', 'Mini Bar') &&
      checkAmenity('bathtub', 'Bathtub') &&
      checkAmenity('smartTv', 'Smart TV') &&
      checkAmenity('balcony', 'Balcony') &&
      checkAmenity('oceanView', 'Ocean View') &&
      checkAmenity('roomService', 'Room Service') &&
      checkAmenity('safe', 'Safe') &&
      checkAmenity('coffeeMaker', 'Coffee Maker') &&
      checkAmenity('breakfast', 'Free Breakfast') &&
      checkAmenity('poolAccess', 'Pool Access');

    return matchesSearch && matchesType && matchesPrice && matchesAmenities;
  });

  if (loading) return <div className="loading">Loading rooms…</div>;

  return (
    <div className="section" style={{ maxWidth: '1400px', margin: '0 auto', padding: '20px' }}>
      <h1 style={{ textAlign: 'center', color: '#d4af37', marginBottom: '30px', fontSize: '2.5rem', fontFamily: "'Fredoka', sans-serif" }}>Our Rooms</h1>

      <div style={{ display: 'flex', gap: '30px', alignItems: 'flex-start' }}>
        
        {/* FILTERS SIDEBAR */}
        <aside style={{
          width: '320px',
          backgroundColor: '#0f2238',
          border: '1px solid #1e3a5f',
          borderRadius: '12px',
          padding: '24px',
          color: '#fff',
          boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
          flexShrink: 0
        }}>
          <h3 style={{ color: '#d4af37', marginBottom: '20px', fontSize: '1.25rem' }}>Filters</h3>

          {/* Search Input */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '8px', color: '#a0aec0' }}>Search</label>
            <input
              className="input"
              placeholder="Search rooms…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              style={{ width: '100%', backgroundColor: '#132f4c', border: '1px solid #2d4a6f', color: '#fff', padding: '10px', borderRadius: '6px', boxSizing: 'border-box' }}
            />
          </div>

          {/* Room Type */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '8px', color: '#a0aec0' }}>Room Type</label>
            <select
              value={roomType}
              onChange={(e) => setRoomType(e.target.value)}
              style={{ width: '100%', backgroundColor: '#132f4c', border: '1px solid #2d4a6f', color: '#fff', padding: '10px', borderRadius: '6px', boxSizing: 'border-box' }}
            >
              <option value="all">All Room Types</option>
              <option value="Standard">Standard Room</option>
              <option value="Deluxe">Deluxe Room</option>
              <option value="Suite">Executive Suite</option>
              <option value="Presidential">Presidential Suite</option>
              <option value="Family">Family Room</option>
            </select>
          </div>

          {/* Price Range Slider */}
          <div style={{ marginBottom: '25px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '8px', color: '#a0aec0' }}>
              <span>Max Price</span>
              <span style={{ color: '#d4af37', fontWeight: 'bold' }}>₱{maxPrice.toLocaleString()}</span>
            </div>
            <input
              type="range"
              min="1000"
              max="25000"
              step="500"
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              style={{ width: '100%', accentColor: '#d4af37', cursor: 'pointer' }}
            />
          </div>

          {/* Comprehensive Amenities Checkboxes */}
          <div style={{ marginBottom: '25px' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '12px', color: '#a0aec0' }}>Amenities</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '0.82rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                <input type="checkbox" checked={selectedAmenities.wifi} onChange={() => handleAmenityChange('wifi')} accentColor="#d4af37" /> WiFi
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                <input type="checkbox" checked={selectedAmenities.aircon} onChange={() => handleAmenityChange('aircon')} accentColor="#d4af37" /> AirCon
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                <input type="checkbox" checked={selectedAmenities.miniBar} onChange={() => handleAmenityChange('miniBar')} accentColor="#d4af37" /> Mini Bar
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                <input type="checkbox" checked={selectedAmenities.bathtub} onChange={() => handleAmenityChange('bathtub')} accentColor="#d4af37" /> Bathtub
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                <input type="checkbox" checked={selectedAmenities.smartTv} onChange={() => handleAmenityChange('smartTv')} accentColor="#d4af37" /> Smart TV
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                <input type="checkbox" checked={selectedAmenities.balcony} onChange={() => handleAmenityChange('balcony')} accentColor="#d4af37" /> Balcony
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                <input type="checkbox" checked={selectedAmenities.oceanView} onChange={() => handleAmenityChange('oceanView')} accentColor="#d4af37" /> Ocean View
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                <input type="checkbox" checked={selectedAmenities.roomService} onChange={() => handleAmenityChange('roomService')} accentColor="#d4af37" /> Room Service
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                <input type="checkbox" checked={selectedAmenities.safe} onChange={() => handleAmenityChange('safe')} accentColor="#d4af37" /> In-room Safe
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                <input type="checkbox" checked={selectedAmenities.coffeeMaker} onChange={() => handleAmenityChange('coffeeMaker')} accentColor="#d4af37" /> Coffee Maker
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                <input type="checkbox" checked={selectedAmenities.breakfast} onChange={() => handleAmenityChange('breakfast')} accentColor="#d4af37" /> Breakfast
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                <input type="checkbox" checked={selectedAmenities.poolAccess} onChange={() => handleAmenityChange('poolAccess')} accentColor="#d4af37" /> Pool Access
              </label>
            </div>
          </div>

          {/* Reset Filters Button */}
          <button
            onClick={handleResetFilters}
            style={{
              width: '100%',
              backgroundColor: 'transparent',
              border: '1px solid #d4af37',
              color: '#d4af37',
              padding: '10px',
              borderRadius: '6px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            Reset Filters
          </button>
        </aside>

        {/* ROOMS GRID */}
        <div style={{ flex: 1, display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
          {filtered.map((r) => {
            // Safely parse JSON array or fall back to plain URL/placeholder
            let imageUrl = 'https://via.placeholder.com/400x260/132f4c/d4af37';
            if (r.image) {
              if (r.image.startsWith('[')) {
                try {
                  const parsedImages = JSON.parse(r.image);
                  if (parsedImages.length > 0) imageUrl = parsedImages[0];
                } catch (e) {
                  imageUrl = r.image;
                }
              } else {
                imageUrl = r.image;
              }
            }

            // Foolproof capacity resolver supporting API property variants & name fallbacks
            const getRoomCapacity = (room) => {
              if (room.capacity) return Number(room.capacity);
              if (room.max_guests) return Number(room.max_guests);
              if (room.maxGuests) return Number(room.maxGuests);
              
              const name = (room.name || '').toLowerCase();
              if (name.includes('penthouse')) return 6;
              if (name.includes('presidential')) return 5;
              if (name.includes('family') || name.includes('executive')) return 4;
              if (name.includes('loft') || name.includes('junior') || name.includes('twin') || name.includes('accessible')) return 3;
              return 2;
            };

            const maxCap = getRoomCapacity(r);
            const bedInfo = r.bed_type || '1 King Bed';

            return (
              <div
                key={r.id}
                style={{
                  backgroundColor: '#0f2238',
                  border: '1px solid #1e3a5f',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                  transition: 'transform 0.2s ease'
                }}
              >
                <div>
                  <Link to={`/rooms/${r.id}`}>
                    <img
                      src={imageUrl}
                      alt={r.name}
                      style={{ width: '100%', height: '220px', objectFit: 'cover' }}
                    />
                  </Link>
                  <div style={{ padding: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <h3 style={{ margin: 0, fontSize: '1.25rem', color: '#fff' }}>{r.name}</h3>
                      <span style={{ color: '#d4af37', fontWeight: '600', fontSize: '0.9rem' }}>★ {r.rating || '4.5'}</span>
                    </div>

                    <p style={{ color: '#a0aec0', fontSize: '0.85rem', marginBottom: '12px' }}>
                      {r.type} &bull; 🛏️ {bedInfo} &bull; 👤 Max {maxCap} Guests
                    </p>

                    <p style={{ color: '#cbd5e0', fontSize: '0.9rem', marginBottom: '16px', lineHeight: '1.4' }}>
                      {r.description || 'Spacious room with stunning city view and premium comfort amenities.'}
                    </p>

                    {/* Amenities Badges Container */}
                    <div style={{
                      backgroundColor: '#132f4c',
                      borderRadius: '8px',
                      padding: '12px',
                      marginBottom: '20px',
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gap: '8px',
                      fontSize: '0.82rem',
                      color: '#cbd5e0'
                    }}>
                      <span>✓ WiFi</span>
                      <span>✓ Mini Bar</span>
                      <span>✓ Aircon</span>
                      <span>✓ Bathtub</span>
                    </div>
                  </div>
                </div>

                {/* Bottom Price & View Room Details Button */}
                <div style={{ padding: '0 20px 20px 20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.85rem', color: '#a0aec0' }}>Per Night:</span>
                    <span style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#d4af37' }}>₱{Number(r.price).toFixed(2)}</span>
                  </div>

                  <Link
                    to={`/rooms/${r.id}`}
                    className="btn btn-gold"
                    style={{
                      backgroundColor: '#d4af37',
                      color: '#0f2238',
                      textAlign: 'center',
                      padding: '12px',
                      borderRadius: '6px',
                      textDecoration: 'none',
                      fontWeight: '700',
                      display: 'block',
                      width: '100%',
                      boxSizing: 'border-box'
                    }}
                  >
                    View Room Details
                  </Link>
                </div>
              </div>
            );
          })}
          {!filtered.length && <p className="muted" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px' }}>No rooms match your search or filter criteria.</p>}
        </div>

      </div>
    </div>
  );
}