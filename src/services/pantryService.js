const db = require('../db');

const CATEGORIES = [
  'Produce', 'Dairy', 'Meat & Fish', 'Grains', 'Canned',
  'Frozen', 'Spices', 'Snacks', 'Drinks', 'Other'
];

const UNITS = ['', 'g', 'kg', 'ml', 'L', 'oz', 'lb'];

const SOON_DAYS = 7;

function today() {
  return new Date().toLocaleDateString('en-CA');
}

function soonCutoff() {
  const d = new Date();
  d.setDate(d.getDate() + SOON_DAYS);
  return d.toLocaleDateString('en-CA');
}

// 'expired', 'soon' or 'ok' for an item, based on its expiry date
function statusOf(item) {
  if (!item.expires_on) return 'ok';
  if (item.expires_on < today()) return 'expired';
  if (item.expires_on <= soonCutoff()) return 'soon';
  return 'ok';
}

function listForUser(userId, filters = {}) {
  let sql = 'SELECT * FROM pantry_items WHERE user_id = ?';
  const params = [userId];

  if (filters.q) {
    sql += ' AND name LIKE ?';
    params.push(`%${filters.q}%`);
  }
  if (filters.category) {
    sql += ' AND category = ?';
    params.push(filters.category);
  }

  sql += ' ORDER BY expires_on IS NULL, expires_on, name';
  let items = db.prepare(sql).all(...params);

  if (filters.expiring === 'soon') {
    items = items.filter((i) => statusOf(i) === 'soon');
  } else if (filters.expiring === 'expired') {
    items = items.filter((i) => statusOf(i) === 'expired');
  }

  return items;
}

function getItem(userId, id) {
  return db
    .prepare('SELECT * FROM pantry_items WHERE id = ? AND user_id = ?')
    .get(id, userId);
}

// adding an item that already exists (same name, category and unit)
// merges the quantities instead of creating a duplicate row
function addItem(userId, { name, quantity, unit, category, expires_on }) {
  const existing = db
    .prepare(
      `SELECT * FROM pantry_items
       WHERE user_id = ? AND lower(name) = lower(?) AND category = ? AND unit = ?`
    )
    .get(userId, name.trim(), category, unit || '');

  if (existing) {
    db.prepare('UPDATE pantry_items SET quantity = quantity + ?, expires_on = ? WHERE id = ?')
      .run(Number(quantity), expires_on || existing.expires_on, existing.id);
    return { item: getItem(userId, existing.id), merged: true };
  }

  const result = db
    .prepare(
      `INSERT INTO pantry_items (user_id, name, quantity, unit, category, expires_on)
       VALUES (?, ?, ?, ?, ?, ?)`
    )
    .run(userId, name.trim(), Number(quantity), unit || '', category, expires_on || null);

  return { item: getItem(userId, result.lastInsertRowid), merged: false };
}

function updateItem(userId, id, { name, quantity, unit, category, expires_on }) {
  const result = db
    .prepare(
      `UPDATE pantry_items
       SET name = ?, quantity = ?, unit = ?, category = ?, expires_on = ?
       WHERE id = ? AND user_id = ?`
    )
    .run(name.trim(), Number(quantity), unit || '', category, expires_on || null, id, userId);
  return result.changes > 0;
}

function removeItem(userId, id) {
  return db
    .prepare('DELETE FROM pantry_items WHERE id = ? AND user_id = ?')
    .run(id, userId).changes > 0;
}

function expiringSoon(userId) {
  return listForUser(userId).filter((i) => statusOf(i) === 'soon');
}

function expired(userId) {
  return listForUser(userId).filter((i) => statusOf(i) === 'expired');
}

function stats(userId) {
  const items = listForUser(userId);
  return {
    total: items.length,
    categories: new Set(items.map((i) => i.category)).size,
    soon: items.filter((i) => statusOf(i) === 'soon').length,
    expired: items.filter((i) => statusOf(i) === 'expired').length
  };
}

function toCsv(items) {
  const esc = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
  const rows = items.map((i) =>
    [i.name, i.quantity, i.unit, i.category, i.expires_on || ''].map(esc).join(',')
  );
  return ['name,quantity,unit,category,expires_on', ...rows].join('\n');
}

module.exports = {
  CATEGORIES, UNITS, SOON_DAYS,
  listForUser, getItem, addItem, updateItem, removeItem,
  expiringSoon, expired, stats, statusOf, toCsv
};
