import { useEffect, useState } from 'react';
import { api } from '../api';

export default function HotelInfoPage() {
  const [info, setInfo] = useState({});
  const [settings, setSettings] = useState({});

  useEffect(() => {
    api.hotelInfo().then(setInfo).catch(() => {});
    api.hotelSettings().then(setSettings).catch(() => {});
  }, []);

  return (
    <div className="section hotel-info">
      <h1>{info.name || 'Hotel Information'}</h1>

      <div className="card info-card">
        <p><strong>Address:</strong> {info.address || '—'}</p>
        <p><strong>Phone:</strong> {info.phone || '—'}</p>
        <p><strong>Email:</strong> {info.email || '—'}</p>
        <p><strong>Check-in:</strong> {info.check_in_time || '—'}</p>
        <p><strong>Check-out:</strong> {info.check_out_time || '—'}</p>
        <p style={{ marginTop: 12 }}>{info.description}</p>
      </div>

      <div className="card info-card">
        <h3>Policies</h3>
        <p>Currency: <strong>{settings.currency || 'PHP'}</strong></p>
        <p>Tax rate: <strong>{settings.tax_rate || '0'}%</strong></p>
        <p>Late checkout fee: <strong>₱{settings.late_checkout_fee || '0'}</strong></p>
        <p>Extra guest fee: <strong>₱{settings.extra_guest_fee || '0'}</strong></p>
      </div>
    </div>
  );
}