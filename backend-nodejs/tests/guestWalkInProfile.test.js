const assert = require('node:assert');
const { buildGuestAutoProfile } = require('../controllers/userController');

const profile = buildGuestAutoProfile({
  firstName: 'John',
  lastName: 'Doe',
  contactNumber: '09170000001',
}, { seed: 42 });

assert.strictEqual(profile.firstName, 'John');
assert.strictEqual(profile.lastName, 'Doe');
assert.strictEqual(profile.email, 'john.doe.42@guest.local');
assert.strictEqual(profile.password, 'Guest@123');
assert.strictEqual(profile.contactNumber, '09170000001');

console.log('guest walk-in profile tests passed');
