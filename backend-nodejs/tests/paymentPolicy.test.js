const assert = require('node:assert');
const { getPaymentStatusForMethod, getPaymentMethodLabel, normalizePaymentMethod } = require('../utils/paymentPolicy');

assert.strictEqual(getPaymentStatusForMethod('cash'), 'Pending');
assert.strictEqual(getPaymentStatusForMethod('pay_at_hotel'), 'Pending');
assert.strictEqual(getPaymentStatusForMethod('credit_card'), 'Pending');
assert.strictEqual(getPaymentStatusForMethod('bank_transfer'), 'Pending');
assert.strictEqual(getPaymentStatusForMethod('gcash'), 'Pending');
assert.strictEqual(getPaymentStatusForMethod('paymaya'), 'Pending');
assert.strictEqual(getPaymentStatusForMethod('online_payment'), 'Pending');
assert.strictEqual(getPaymentStatusForMethod('credit_card', 'Paid'), 'Paid');
assert.strictEqual(getPaymentStatusForMethod('gcash', 'Paid'), 'Paid');
assert.strictEqual(getPaymentStatusForMethod('online_payment', 'Paid'), 'Paid');
assert.strictEqual(normalizePaymentMethod('online payment gcash'), 'gcash');
assert.strictEqual(normalizePaymentMethod('online payment paymaya'), 'paymaya');
assert.strictEqual(getPaymentMethodLabel('pay_at_hotel'), 'Walk-in / Pay at Hotel');
assert.strictEqual(getPaymentMethodLabel('gcash'), 'Online Payment - GCash');
assert.strictEqual(getPaymentMethodLabel('paymaya'), 'Online Payment - PayMaya');

console.log('payment policy tests passed');
