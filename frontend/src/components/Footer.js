import { useEffect, useState } from 'react';
import { api } from '../api';

export default function Footer() {
  const [info, setInfo] = useState({});

  useEffect(() => {
    api.hotelInfo().then(setInfo).catch(() => {});
  }, []);

  return (
    <footer className="footer">
      <div className="footer-inner">
        <div>
          <h4>{info.name || 'Moonveil Hotel'}</h4>
          <p>{info.description || 'A serene escape in the heart of the city.'}</p>
        </div>
        <div>
          <h5>Contact</h5>
          <p>{info.address || '123 Serenity Ave, Manila'}</p>
          <p>{info.phone || '+63 2 8888 0000'}</p>
          <p>{info.email || 'info@moonveil.com'}</p>
        </div>
        <div>
          <h5>Check-in / Check-out</h5>
          <p>Check-in: {info.check_in_time || '14:00'}</p>
          <p>Check-out: {info.check_out_time || '12:00'}</p>
        </div>
      </div>
      <div className="footer-bottom">
        © {new Date().getFullYear()} Moonveil Hotel. All rights reserved.
      </div>
    </footer>
  );
}