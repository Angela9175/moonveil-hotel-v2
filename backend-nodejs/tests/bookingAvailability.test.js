const assert = require('node:assert');
const { hasDateConflict } = require('../utils/bookingAvailability');

assert.strictEqual(hasDateConflict('2026-10-10', '2026-10-12', '2026-10-11', '2026-10-13'), true);
assert.strictEqual(hasDateConflict('2026-10-10', '2026-10-12', '2026-10-12', '2026-10-14'), false);
assert.strictEqual(hasDateConflict('2026-10-10', '2026-10-12', '2026-10-09', '2026-10-10'), false);

console.log('booking availability tests passed');
