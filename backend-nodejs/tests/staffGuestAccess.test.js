const assert = require('node:assert/strict');
const { isGuestAccountRole } = require('../controllers/userController');

assert.equal(isGuestAccountRole('user'), true);
assert.equal(isGuestAccountRole('guest'), true);
assert.equal(isGuestAccountRole('staff'), false);
assert.equal(isGuestAccountRole('admin'), false);

console.log('Staff guest account access check verified.');
