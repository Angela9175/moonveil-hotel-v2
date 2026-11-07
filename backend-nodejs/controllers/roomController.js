const Room = require('../models/Room');
const Booking = require('../models/Booking');
const { pool } = require('../config/db');

const formatRoom = (room) => ({
  _id: room.id,
  id: room.id,
  name: room.name,
  type: room.type,
  price: parseFloat(room.price),
  description: room.description,
  amenities: (() => {
    if (!room.amenities) return [];
    if (Array.isArray(room.amenities)) return room.amenities;
    try { return JSON.parse(room.amenities); } catch { return [room.amenities]; }
  })(),
  image: room.image,
  rating: parseFloat(room.rating),
  available: !!room.available,
  bookings: room.bookings,
  createdAt: room.created_at,
  updatedAt: room.updated_at,
});

const getAllRooms = async (req, res) => {
  try {
    const rooms = await Room.findAll();
    const out = [];
    for (const r of rooms) {
      const images = await Room.findImages(r.id);
      out.push({ ...formatRoom(r), images });
    }
    res.json(out);
  } catch (e) {
    res.status(500).json({ message: 'Error fetching rooms', error: e.message });
  }
};

const getAvailabilityCalendar = async (req, res) => {
  try {
    const { from, to } = req.query;
    const startDate = from ? new Date(`${from}T00:00:00`) : new Date();
    const endDate = to ? new Date(`${to}T00:00:00`) : new Date(Date.now() + 13 * 24 * 60 * 60 * 1000);

    if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime()) || endDate < startDate) {
      return res.status(400).json({ message: 'Invalid availability date range.' });
    }

    const rooms = await Room.findAll();
    const bookings = await Booking.findAll();
    const [roomInstances] = await pool.query('SELECT * FROM room_instances');
    const dates = [];
    const cursor = new Date(startDate);
    while (cursor <= endDate) {
      dates.push(new Date(cursor));
      cursor.setDate(cursor.getDate() + 1);
    }

    const maintenanceByRoom = new Map();
    for (const instance of roomInstances) {
      const statusText = String(instance.status || '').trim().toLowerCase();
      if (statusText.includes('maintenance') || statusText.includes('repair') || statusText.includes('out of order')) {
        maintenanceByRoom.set(Number(instance.type_id), true);
      }
    }

    const roomCalendar = rooms.map((room) => {
      const roomIsUnderMaintenance = maintenanceByRoom.get(Number(room.id)) || room.available === false;
      const calendar = dates.map((dateObj) => {
        const dateStr = dateObj.toISOString().slice(0, 10);

        const matchedBooking = bookings.find((booking) => {
          if (Number(booking.room_id) !== Number(room.id)) return false;
          if (booking.status === 'Cancelled') return false;
          if (booking.status === 'Rejected') return false;
          return dateStr >= booking.check_in && dateStr < booking.check_out;
        });

        const isBooked = !!matchedBooking;

        let status = 'Available';
        if (roomIsUnderMaintenance) {
          status = 'Under Maintenance';
        } else if (isBooked) {
          status = 'Occupied';
        }

        return {
          date: dateStr,
          status,
          bookingId: matchedBooking ? matchedBooking.id : null,
          guestName: matchedBooking ? (matchedBooking.guest_name || matchedBooking.user_first_name || 'Guest') : null,
          available: status === 'Available',
          occupied: status === 'Occupied',
          underMaintenance: status === 'Under Maintenance',
        };
      });

      const overallStatus = roomIsUnderMaintenance
        ? 'Under Maintenance'
        : calendar.some((d) => d.status === 'Occupied')
          ? 'Occupied'
          : 'Available';

      return {
        id: room.id,
        name: room.name,
        type: room.type,
        price: Number(room.price),
        status: overallStatus,
        calendar,
      };
    });

    res.json({
      from: startDate.toISOString().slice(0, 10),
      to: endDate.toISOString().slice(0, 10),
      rooms: roomCalendar,
    });
  } catch (e) {
    res.status(500).json({ message: 'Error fetching room availability', error: e.message });
  }
};

const getRoomById = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room) return res.status(404).json({ message: 'Room not found' });
    const images = await Room.findImages(room.id);
    res.json({ ...formatRoom(room), images });
  } catch (e) {
    res.status(500).json({ message: 'Error fetching room', error: e.message });
  }
};

const createRoom = async (req, res) => {
  try {
    const { name, type, price, description, amenities, image, rating } = req.body;
    if (!name || !type || !price)
      return res.status(400).json({ message: 'Name, type, price are required' });

    const newRoom = await Room.create({
      name, type, price, description, amenities: amenities || [],
      image: image || '', rating: rating || 0,
    });
    if (image) {
      await Room.addImage({ roomId: newRoom.id, imageUrl: image, angleLabel: 'Main', sortOrder: 0 });
    }
    res.status(201).json({ message: 'Room created', room: formatRoom(newRoom) });
  } catch (e) {
    res.status(500).json({ message: 'Error creating room', error: e.message });
  }
};

const updateRoom = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room) return res.status(404).json({ message: 'Room not found' });
    const updated = await Room.update(req.params.id, req.body);
    res.json({ message: 'Room updated', room: formatRoom(updated) });
  } catch (e) {
    res.status(500).json({ message: 'Error updating room', error: e.message });
  }
};

const deleteRoom = async (req, res) => {
  try {
    const room = await Room.deleteById(req.params.id);
    if (!room) return res.status(404).json({ message: 'Room not found' });
    res.json({ message: 'Room deleted' });
  } catch (e) {
    res.status(500).json({ message: 'Error deleting room', error: e.message });
  }
};

const addRoomImage = async (req, res) => {
  try {
    const { image_url, angle_label, sort_order } = req.body;
    if (!image_url) return res.status(400).json({ message: 'image_url required' });
    const r = await Room.addImage({
      roomId: req.params.id,
      imageUrl: image_url,
      angleLabel: angle_label || null,
      sortOrder: sort_order || 0,
    });
    res.status(201).json({ message: 'Image added', id: r.id });
  } catch (e) {
    res.status(500).json({ message: 'Error adding image', error: e.message });
  }
};

const deleteRoomImage = async (req, res) => {
  try {
    await Room.deleteImage(req.params.imageId, req.params.roomId);
    res.json({ message: 'Image deleted' });
  } catch (e) {
    res.status(500).json({ message: 'Error deleting image', error: e.message });
  }
};

module.exports = {
  getAllRooms, getRoomById, createRoom, updateRoom, deleteRoom,
  addRoomImage, deleteRoomImage, getAvailabilityCalendar,
};