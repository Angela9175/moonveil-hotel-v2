const assert = require('node:assert/strict');
const { generateEmployeeId } = require('../controllers/userController');

(async () => {
  const managerId = await generateEmployeeId();
  const frontDeskId = await generateEmployeeId();
  const maintenanceId = await generateEmployeeId();

  assert.match(managerId, /^MOON-\d{3}$/);
  assert.match(frontDeskId, /^MOON-\d{3}$/);
  assert.match(maintenanceId, /^MOON-\d{3}$/);

  console.log('Employee ID generation verified.');
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
