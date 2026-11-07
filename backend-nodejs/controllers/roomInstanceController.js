const RoomInstance = require('../models/RoomInstance');
const Room = require('../models/Room');

const formatInstance = (i) => ({
  _id: i.id, id: i.id,
  typeId: i.type_id, roomNumber: i.room_number, floor: i.floor,
  status: i.status, typeName: i.type_name, price: parseFloat(i.price),
  createdAt: i.created_at, updatedAt: i.updated_at,
});

const getAllRoomInstances = async (_req, res) => {
  try { res.json((await RoomInstance.findAll()).map(formatInstance)); }
  catch (e) { res.status(500).json({ message: 'Error', error: e.message }); }
};

const getRoomInstancesByType = async (req, res) => {
  try { res.json((await RoomInstance.findByTypeId(req.params.typeId)).map(formatInstance)); }
  catch (e) { res.status(500).json({ message: 'Error', error: e.message }); }
};

const getAvailableRoomInstances = async (_req, res) => {
  try { res.json((await RoomInstance.findAvailable()).map(formatInstance)); }
  catch (e) { res.status(500).json({ message: 'Error', error: e.message }); }
};

const createRoomInstance = async (req, res) => {
  try {
    const { typeId, roomNumber, floor } = req.body;
    const type = await Room.findById(typeId);
    if (!type) return res.status(404).json({ message: 'Room type not found' });
    const inst = await RoomInstance.create({
      typeId, roomNumber, floor, typeName: type.name, price: type.price,
    });
    res.status(201).json({ message: 'Instance created', instance: formatInstance(inst) });
  } catch (e) {
    res.status(500).json({ message: 'Error', error: e.message });
  }
};

const updateRoomInstance = async (req, res) => {
  try {
    const inst = await RoomInstance.update(req.params.id, req.body);
    if (!inst) return res.status(404).json({ message: 'Not found' });
    res.json({ message: 'Updated', instance: formatInstance(inst) });
  } catch (e) {
    res.status(500).json({ message: 'Error', error: e.message });
  }
};

const deleteRoomInstance = async (req, res) => {
  try {
    const inst = await RoomInstance.deleteById(req.params.id);
    if (!inst) return res.status(404).json({ message: 'Not found' });
    res.json({ message: 'Deleted' });
  } catch (e) {
    res.status(500).json({ message: 'Error', error: e.message });
  }
};

module.exports = {
  getAllRoomInstances, getRoomInstancesByType, getAvailableRoomInstances,
  createRoomInstance, updateRoomInstance, deleteRoomInstance,
};