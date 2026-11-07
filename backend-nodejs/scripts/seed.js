const bcrypt = require('bcryptjs');
const { pool, initDB } = require('../config/db');

const seed = async () => {
  await initDB();
  console.log('Seeding data...');

  // ─── Users ───────────────────────────────────────────────
  const adminPassword = await bcrypt.hash('admin123', 10);
  const staffPassword = await bcrypt.hash('staff123', 10);
  const userPassword = await bcrypt.hash('password123', 10);

  const [existingAdmin] = await pool.query('SELECT id FROM users WHERE email = ?', ['admin@moonveil.com']);
  if (!existingAdmin.length) {
    await pool.query(
      `INSERT INTO users (first_name, last_name, email, password, role)
       VALUES (?, ?, ?, ?, ?)`,
      ['Admin', 'User', 'admin@moonveil.com', adminPassword, 'admin']
    );
    console.log('  ✅ admin@moonveil.com / admin123');
  }

  const [existingStaff] = await pool.query('SELECT id FROM users WHERE email = ?', ['staff@moonveil.com']);
  if (!existingStaff.length) {
    await pool.query(
      `INSERT INTO users (first_name, last_name, email, password, role)
       VALUES (?, ?, ?, ?, ?)`,
      ['Staff', 'Member', 'staff@moonveil.com', staffPassword, 'staff']
    );
    console.log('  ✅ staff@moonveil.com / staff123');
  }

  const [existingJohn] = await pool.query('SELECT id FROM users WHERE email = ?', ['john@example.com']);
  if (!existingJohn.length) {
    await pool.query(
      `INSERT INTO users (first_name, last_name, email, password, role)
       VALUES (?, ?, ?, ?, ?)`,
      ['John', 'Doe', 'john@example.com', userPassword, 'user']
    );
    console.log('  ✅ john@example.com / password123');
  }

  // ─── Rooms + images ──────────────────────────────────────
  const rooms = [
    {
      name: 'Deluxe Room', type: 'Deluxe', price: 3500, rating: 4.5,
      description: 'Elegant room with city view.',
      amenities: ['WiFi', 'AC', 'TV', 'Breakfast'],
      images: [
        { url: 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=800', label: 'Bedroom' },
        { url: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800', label: 'Bathroom' },
      ],
    },
    {
      name: 'Executive Suite', type: 'Suite', price: 6500, rating: 4.8,
      description: 'Spacious suite with lounge.',
      amenities: ['WiFi', 'AC', 'TV', 'Breakfast', 'Minibar', 'Bathtub'],
      images: [
        { url: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800', label: 'Bedroom' },
        { url: 'https://images.unsplash.com/photo-1591088398332-8a7791972843?w=800', label: 'Living' },
      ],
    },
    {
      name: 'Standard Room', type: 'Standard', price: 2200, rating: 4.0,
      description: 'Cozy room for solo travelers.',
      amenities: ['WiFi', 'AC', 'TV'],
      images: [
        { url: 'https://images.unsplash.com/photo-1595576508898-0ad5c879a061?w=800', label: 'Bedroom' },
      ],
    },
    {
      name: 'Penthouse', type: 'Penthouse', price: 15000, rating: 5.0,
      description: 'Top-floor luxury with private terrace.',
      amenities: ['WiFi', 'AC', 'TV', 'Kitchen', 'Jacuzzi', 'Terrace', 'Butler'],
      images: [
        { url: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800', label: 'View' },
        { url: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=800', label: 'Living' },
      ],
    },
  ];

  for (const r of rooms) {
    const [exist] = await pool.query('SELECT id FROM rooms WHERE name = ?', [r.name]);
    if (exist.length) continue;

    const [res] = await pool.query(
      `INSERT INTO rooms (name, type, price, description, amenities, image, rating, available)
       VALUES (?, ?, ?, ?, ?, ?, ?, 1)`,
      [r.name, r.type, r.price, r.description, JSON.stringify(r.amenities), r.images[0].url, r.rating]
    );
    const roomId = res.insertId;

    for (let i = 0; i < r.images.length; i++) {
      await pool.query(
        `INSERT INTO room_images (room_id, image_url, angle_label, sort_order)
         VALUES (?, ?, ?, ?)`,
        [roomId, r.images[i].url, r.images[i].label, i]
      );
    }
    console.log(`  ✅ Room: ${r.name}`);
  }

  // ─── Hotel info ──────────────────────────────────────────
  const [hi] = await pool.query('SELECT id FROM hotel_info LIMIT 1');
  if (!hi.length) {
    await pool.query(
      `INSERT INTO hotel_info (name, address, phone, email, description, check_in_time, check_out_time)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      ['Moonveil Hotel', '123 Serenity Ave, Manila', '+63 2 8888 0000',
       'info@moonveil.com', 'A serene escape in the heart of the city.',
       '14:00:00', '12:00:00']
    );
    console.log('  ✅ Hotel info seeded');
  }

  // ─── System settings ─────────────────────────────────────
  const settings = [
    ['hotel_name', 'Moonveil Hotel'],
    ['currency', 'PHP'],
    ['tax_rate', '12'],
    ['online_booking_enabled', '1'],
    ['max_children_per_room', '2'],
    ['late_checkout_fee', '500'],
    ['extra_guest_fee', '300'],
  ];
  for (const [k, v] of settings) {
    await pool.query(
      'INSERT INTO system_settings (`key`,`value`) VALUES (?,?) ON DUPLICATE KEY UPDATE `value`=VALUES(`value`)',
      [k, v]
    );
  }
  console.log('  ✅ System settings seeded');

  console.log('\n🎉 Seed complete.\n');
  await pool.end();
};

seed().catch((e) => { console.error(e); process.exit(1); });