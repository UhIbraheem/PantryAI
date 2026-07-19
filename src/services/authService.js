const bcrypt = require('bcryptjs');
const db = require('../db');

function register({ name, email, password, dietary }) {
  const hash = bcrypt.hashSync(password, 10);
  const result = db
    .prepare('INSERT INTO users (name, email, password_hash, dietary) VALUES (?, ?, ?, ?)')
    .run(name, email.toLowerCase(), hash, dietary || '');
  return findById(result.lastInsertRowid);
}

function verify(email, password) {
  const row = db
    .prepare('SELECT * FROM users WHERE email = ?')
    .get((email || '').toLowerCase());
  if (!row) return null;
  if (!bcrypt.compareSync(password || '', row.password_hash)) return null;
  return publicUser(row);
}

function findByEmail(email) {
  const row = db
    .prepare('SELECT * FROM users WHERE email = ?')
    .get((email || '').toLowerCase());
  return row ? publicUser(row) : null;
}

function findById(id) {
  const row = db.prepare('SELECT * FROM users WHERE id = ?').get(id);
  return row ? publicUser(row) : null;
}

// never hand the password hash to the rest of the app
function publicUser(row) {
  return { id: row.id, name: row.name, email: row.email, dietary: row.dietary };
}

module.exports = { register, verify, findByEmail, findById };
