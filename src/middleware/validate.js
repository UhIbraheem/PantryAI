// small validation helpers shared by the routes

function isEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value || '');
}

function required(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

function minLength(value, n) {
  return typeof value === 'string' && value.length >= n;
}

function isPositiveNumber(value) {
  const n = Number(value);
  return Number.isFinite(n) && n > 0;
}

function isDate(value) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value || '') && !Number.isNaN(Date.parse(value));
}

module.exports = { isEmail, required, minLength, isPositiveNumber, isDate };
