function toDate(value) {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return d;
}

function hasDateConflict(checkInA, checkOutA, checkInB, checkOutB) {
  const startA = toDate(checkInA);
  const endA = toDate(checkOutA);
  const startB = toDate(checkInB);
  const endB = toDate(checkOutB);

  if (!startA || !endA || !startB || !endB) return false;

  return startA < endB && startB < endA;
}

module.exports = { hasDateConflict };
