const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD ?? '',
  database: process.env.DB_NAME || 'moonveil_v2',
  port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 3307, // Added custom port support
  waitForConnections: true,
  connectionLimit: 10,
  dateStrings: true,
});

const initDB = async () => {
  const conn = await pool.getConnection();
  try {
    await conn.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        first_name VARCHAR(255) NOT NULL,
        last_name  VARCHAR(255) NOT NULL,
        email      VARCHAR(255) UNIQUE NOT NULL,
        password   VARCHAR(255) NOT NULL,
        role       VARCHAR(50) DEFAULT 'user',
        staff_position VARCHAR(100) NULL,
        department VARCHAR(100) NULL,
        location VARCHAR(255) NULL,
        employee_id VARCHAR(50) NULL,
        contact_number VARCHAR(50) NULL,
        address VARCHAR(255) NULL,
        city VARCHAR(100) NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    await conn.query(`
      CREATE TABLE IF NOT EXISTS rooms (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        type VARCHAR(100) NOT NULL,
        price DECIMAL(10,2) NOT NULL,
        description TEXT NOT NULL,
        amenities TEXT,
        image VARCHAR(500),
        rating DECIMAL(2,1) DEFAULT 0,
        available TINYINT(1) DEFAULT 1,
        bookings INT DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    await conn.query(`
      CREATE TABLE IF NOT EXISTS room_instances (
        id INT AUTO_INCREMENT PRIMARY KEY,
        type_id INT,
        room_number VARCHAR(100) UNIQUE NOT NULL,
        floor INT NOT NULL,
        status VARCHAR(50) DEFAULT 'Available',
        type_name VARCHAR(255),
        price DECIMAL(10,2),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        CONSTRAINT fk_instance_room FOREIGN KEY (type_id)
          REFERENCES rooms(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    await conn.query(`
      CREATE TABLE IF NOT EXISTS bookings (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT,
        room_id INT,
        room_instance_id INT,
        room_name VARCHAR(255) NOT NULL,
        room_number VARCHAR(100),
        floor INT,
        guest_name VARCHAR(255) NOT NULL,
        guest_email VARCHAR(255) NOT NULL,
        guest_phone VARCHAR(50) NULL,
        check_in DATE NOT NULL,
        check_out DATE NOT NULL,
        booking_date DATETIME DEFAULT CURRENT_TIMESTAMP,
        booking_reference VARCHAR(50) NULL,
        guests INT DEFAULT 1,
        adults INT NOT NULL DEFAULT 1,
        children INT NOT NULL DEFAULT 0,
        special_requests TEXT,
        total_price DECIMAL(10,2) NOT NULL,
        extra_charges DECIMAL(10,2) NOT NULL DEFAULT 0,
        status VARCHAR(50) DEFAULT 'Pending',
        payment_status VARCHAR(50) DEFAULT 'Pending',
        payment_method VARCHAR(50),
        payment_date DATETIME,
        checked_in_at DATETIME NULL,
        checked_out_at DATETIME NULL,
        cancelled_at DATETIME NULL,
        cancelled_by INT NULL,
        cancellation_reason VARCHAR(255) NULL,
        notes TEXT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        CONSTRAINT fk_bk_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        CONSTRAINT fk_bk_room FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE SET NULL,
        CONSTRAINT fk_bk_instance FOREIGN KEY (room_instance_id) REFERENCES room_instances(id) ON DELETE SET NULL,
        CONSTRAINT fk_bk_cancelled FOREIGN KEY (cancelled_by) REFERENCES users(id) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    const [guestPhoneColumns] = await conn.query("SHOW COLUMNS FROM bookings LIKE 'guest_phone'");
    if (!guestPhoneColumns.length) {
      await conn.query('ALTER TABLE bookings ADD COLUMN guest_phone VARCHAR(50) NULL');
    }

    const columnsToAdd = [
      ['users', 'staff_position', 'ALTER TABLE users ADD COLUMN staff_position VARCHAR(100) NULL'],
      ['users', 'department', 'ALTER TABLE users ADD COLUMN department VARCHAR(100) NULL'],
      ['users', 'location', 'ALTER TABLE users ADD COLUMN location VARCHAR(255) NULL'],
      ['users', 'employee_id', 'ALTER TABLE users ADD COLUMN employee_id VARCHAR(50) NULL'],
      ['users', 'contact_number', 'ALTER TABLE users ADD COLUMN contact_number VARCHAR(50) NULL'],
      ['users', 'address', 'ALTER TABLE users ADD COLUMN address VARCHAR(255) NULL'],
      ['users', 'city', 'ALTER TABLE users ADD COLUMN city VARCHAR(100) NULL'],
      ['bookings', 'guest_address', 'ALTER TABLE bookings ADD COLUMN guest_address VARCHAR(255) NULL'],
      ['bookings', 'guest_city', 'ALTER TABLE bookings ADD COLUMN guest_city VARCHAR(100) NULL'],
      ['bookings', 'booking_date', 'ALTER TABLE bookings ADD COLUMN booking_date DATETIME DEFAULT CURRENT_TIMESTAMP'],
      ['bookings', 'booking_reference', 'ALTER TABLE bookings ADD COLUMN booking_reference VARCHAR(50) NULL'],
      ['bookings', 'checked_in_at', 'ALTER TABLE bookings ADD COLUMN checked_in_at DATETIME NULL'],
      ['bookings', 'checked_out_at', 'ALTER TABLE bookings ADD COLUMN checked_out_at DATETIME NULL'],
      ['bookings', 'notes', 'ALTER TABLE bookings ADD COLUMN notes TEXT NULL'],
    ];

    for (const [table, column, query] of columnsToAdd) {
      const [rows] = await conn.query(`SHOW COLUMNS FROM ${table} LIKE ?`, [column]);
      if (!rows.length) await conn.query(query);
    }

    const [staffRows] = await conn.query("SELECT id, employee_id FROM users WHERE role = 'staff' AND (employee_id IS NULL OR employee_id = '')");
    if (staffRows.length) {
      const [existingIds] = await conn.query("SELECT employee_id FROM users WHERE role = 'staff' AND employee_id IS NOT NULL AND employee_id LIKE 'MOON-%'");
      const values = existingIds
        .map((row) => row.employee_id)
        .filter(Boolean)
        .map((value) => {
          const match = value.match(/(\d+)$/);
          return match ? Number(match[1]) : 0;
        });

      let nextNumber = values.length ? Math.max(...values) + 1 : 1;
      for (const row of staffRows) {
        const nextEmployeeId = `MOON-${String(nextNumber).padStart(3, '0')}`;
        await conn.query('UPDATE users SET employee_id = ? WHERE id = ?', [nextEmployeeId, row.id]);
        nextNumber += 1;
      }
    }

    await conn.query(`
      CREATE TABLE IF NOT EXISTS room_images (
        id INT AUTO_INCREMENT PRIMARY KEY,
        room_id INT NOT NULL,
        image_url VARCHAR(500) NOT NULL,
        angle_label VARCHAR(100) NULL,
        sort_order INT DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT fk_roomimg_room FOREIGN KEY (room_id)
          REFERENCES rooms(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    await conn.query(`
      CREATE TABLE IF NOT EXISTS booking_charges (
        id INT AUTO_INCREMENT PRIMARY KEY,
        booking_id INT NOT NULL,
        charge_type VARCHAR(50) NOT NULL DEFAULT 'extra_service',
        description VARCHAR(255) NOT NULL,
        quantity INT NOT NULL DEFAULT 1,
        amount DECIMAL(10,2) NOT NULL,
        added_by INT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT fk_charge_booking FOREIGN KEY (booking_id)
          REFERENCES bookings(id) ON DELETE CASCADE,
        CONSTRAINT fk_charge_user FOREIGN KEY (added_by)
          REFERENCES users(id) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    await conn.query(`
      CREATE TABLE IF NOT EXISTS password_resets (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        token_hash VARCHAR(255) NOT NULL,
        expires_at DATETIME NOT NULL,
        used_at DATETIME NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT fk_reset_user FOREIGN KEY (user_id)
          REFERENCES users(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    await conn.query(`
      CREATE TABLE IF NOT EXISTS hotel_info (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(150),
        address VARCHAR(255),
        phone VARCHAR(50),
        email VARCHAR(150),
        description TEXT,
        check_in_time TIME,
        check_out_time TIME
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    await conn.query(`
      CREATE TABLE IF NOT EXISTS system_settings (
        \`key\` VARCHAR(100) PRIMARY KEY,
        \`value\` VARCHAR(255)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    const [guestCountRows] = await conn.query("SELECT COUNT(*) AS total FROM users WHERE role = 'user'");
    if (Number(guestCountRows[0].total) === 0) {
      const sampleGuests = [
        ['John', 'Doe', 'john@example.com', 'guest123', '09170000001', '123 Main Street', 'Davao City'],
        ['Maria', 'Santos', 'maria.santos@example.com', 'guest123', '09170000002', '45 Rizal Street', 'Cebu City'],
        ['Cherry', 'Dela Cruz', 'cherry@example.com', 'guest123', '09170000003', '88 Sunset Avenue', 'Bacolod City'],
      ];

      for (const [firstName, lastName, email, password, contactNumber, address, city] of sampleGuests) {
        const hashed = await bcrypt.hash(password, 10);
        await conn.query(
          `INSERT INTO users (first_name, last_name, email, password, role, contact_number, address, city)
            VALUES (?, ?, ?, ?, 'user', ?, ?, ?)
            ON DUPLICATE KEY UPDATE first_name = VALUES(first_name), last_name = VALUES(last_name), password = VALUES(password), contact_number = VALUES(contact_number), address = VALUES(address), city = VALUES(city)`,
          [firstName, lastName, email, hashed, contactNumber, address, city]
        );
      }
    }

    await conn.query('DROP VIEW IF EXISTS booking_totals');
    await conn.query(`
      CREATE VIEW booking_totals AS
      SELECT b.id AS booking_id,
             b.total_price,
             COALESCE(SUM(c.quantity * c.amount), 0) AS extra_total,
             b.total_price + COALESCE(SUM(c.quantity * c.amount), 0) AS grand_total
      FROM bookings b
      LEFT JOIN booking_charges c ON c.booking_id = b.id
      GROUP BY b.id, b.total_price;
    `);

    console.log('✅ MySQL tables initialized');
  } finally {
    conn.release();
  }
};

module.exports = { pool, initDB };