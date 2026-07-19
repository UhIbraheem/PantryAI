const db = require('../db');
const recipeService = require('./recipeService');

function list(userId) {
  return db
    .prepare('SELECT * FROM shopping_items WHERE user_id = ? ORDER BY done, lower(name)')
    .all(userId);
}

function find(userId, name) {
  return db
    .prepare('SELECT * FROM shopping_items WHERE user_id = ? AND lower(name) = lower(?)')
    .get(userId, name.trim());
}

// items are deduped by name so the same ingredient never shows up twice
function add(userId, name, source = '') {
  if (find(userId, name)) return false;
  db.prepare('INSERT INTO shopping_items (user_id, name, source) VALUES (?, ?, ?)')
    .run(userId, name.trim(), source);
  return true;
}

function addMissingFromRecipe(userId, recipeId) {
  const recipe = recipeService.getRecipe(userId, recipeId);
  if (!recipe) return null;
  let added = 0;
  for (const ingredient of recipe.missing) {
    if (add(userId, ingredient, recipe.name)) added += 1;
  }
  return { recipe, added, skipped: recipe.missing.length - added };
}

function toggle(userId, id) {
  return db
    .prepare('UPDATE shopping_items SET done = 1 - done WHERE id = ? AND user_id = ?')
    .run(id, userId).changes > 0;
}

function remove(userId, id) {
  return db
    .prepare('DELETE FROM shopping_items WHERE id = ? AND user_id = ?')
    .run(id, userId).changes > 0;
}

function toCsv(items) {
  const esc = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
  const rows = items.map((i) => [i.name, i.source, i.done ? 'yes' : 'no'].map(esc).join(','));
  return ['item,for,bought', ...rows].join('\n');
}

module.exports = { list, add, addMissingFromRecipe, toggle, remove, toCsv };
