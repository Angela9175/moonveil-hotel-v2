const PAYMENT_METHODS = {
  cash: { label: 'Cash', paymentStatus: 'Pending', pendingStatus: 'Pending' },
  pay_at_hotel: { label: 'Walk-in / Pay at Hotel', paymentStatus: 'Pending', pendingStatus: 'Pending' },
  credit_card: { label: 'Credit Card', paymentStatus: 'Pending', pendingStatus: 'Pending' },
  card: { label: 'Credit Card', paymentStatus: 'Pending', pendingStatus: 'Pending' },
  gcash: { label: 'Online Payment - GCash', paymentStatus: 'Pending', pendingStatus: 'Pending' },
  paymaya: { label: 'Online Payment - PayMaya', paymentStatus: 'Pending', pendingStatus: 'Pending' },
  bank_transfer: { label: 'Bank Transfer', paymentStatus: 'Pending', pendingStatus: 'Pending' },
  bank: { label: 'Bank Transfer', paymentStatus: 'Pending', pendingStatus: 'Pending' },
  paypal: { label: 'PayPal', paymentStatus: 'Pending', pendingStatus: 'Pending' },
  online_payment: { label: 'Online Payment', paymentStatus: 'Pending', pendingStatus: 'Pending' },
  online: { label: 'Online Payment', paymentStatus: 'Pending', pendingStatus: 'Pending' },
};

function normalizePaymentMethod(value) {
  if (!value) return 'pay_at_hotel';

  const normalized = String(value)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_|_$/g, '');

  if (PAYMENT_METHODS[normalized]) return normalized;

  if (normalized.includes('gcash')) return 'gcash';
  if (normalized.includes('paymaya') || normalized.includes('maya')) return 'paymaya';
  if (normalized.includes('cash')) return 'cash';
  if (normalized.includes('credit') || normalized.includes('card')) return 'credit_card';
  if (normalized.includes('bank') || normalized.includes('transfer')) return 'bank_transfer';
  if (normalized.includes('paypal')) return 'paypal';
  if (normalized.includes('online') || normalized.includes('e_payment') || normalized.includes('ecommerce')) return 'online_payment';
  if (normalized.includes('hotel') || normalized.includes('arrival')) return 'pay_at_hotel';

  return 'pay_at_hotel';
}

function getPaymentStatusForMethod(method, explicitStatus) {
  const normalized = normalizePaymentMethod(method);
  if (explicitStatus && ['Paid', 'Pending'].includes(explicitStatus)) return explicitStatus;
  return PAYMENT_METHODS[normalized]?.pendingStatus || PAYMENT_METHODS[normalized]?.paymentStatus || 'Pending';
}

function getPaymentMethodLabel(method) {
  const normalized = normalizePaymentMethod(method);
  return PAYMENT_METHODS[normalized]?.label || 'Walk-in / Pay at Hotel';
}

module.exports = {
  PAYMENT_METHODS,
  normalizePaymentMethod,
  getPaymentStatusForMethod,
  getPaymentMethodLabel,
};
