// seeds a demo account with a realistic pantry, safe to run repeatedly
const db = require('./db');
const authService = require('./services/authService');

const EMAIL = 'demo@pantryai.app';
const PASSWORD = 'demo12345';

function daysFromNow(n) {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toLocaleDateString('en-CA');
}

let user = authService.findByEmail(EMAIL);
if (!user) {
  user = authService.register({
    name: 'Maria',
    email: EMAIL,
    password: PASSWORD,
    dietary: 'vegetarian'
  });
}

db.prepare('DELETE FROM pantry_items WHERE user_id = ?').run(user.id);

const items = [
  ['Milk', 1, 'L', 'Dairy', daysFromNow(2)],
  ['Spinach', 1, '', 'Produce', daysFromNow(3)],
  ['Greek yogurt', 2, '', 'Dairy', daysFromNow(-1)],
  ['Eggs', 12, '', 'Dairy', daysFromNow(14)],
  ['Cheddar cheese', 200, 'g', 'Dairy', daysFromNow(21)],
  ['Butter', 250, 'g', 'Dairy', daysFromNow(30)],
  ['Tomatoes', 4, '', 'Produce', daysFromNow(5)],
  ['Onions', 3, '', 'Produce', daysFromNow(20)],
  ['Garlic', 1, '', 'Produce', daysFromNow(25)],
  ['Bell pepper', 2, '', 'Produce', daysFromNow(6)],
  ['Pasta', 500, 'g', 'Grains', daysFromNow(300)],
  ['Rice', 1, 'kg', 'Grains', daysFromNow(300)],
  ['Tortillas', 8, '', 'Grains', daysFromNow(10)],
  ['Black beans', 2, '', 'Canned', daysFromNow(400)],
  ['Olive oil', 500, 'ml', 'Other', null]
];

const insert = db.prepare(
  `INSERT INTO pantry_items (user_id, name, quantity, unit, category, expires_on)
   VALUES (?, ?, ?, ?, ?, ?)`
);
for (const [name, quantity, unit, category, expires] of items) {
  insert.run(user.id, name, quantity, unit, category, expires);
}

console.log(`Seeded ${items.length} pantry items for ${EMAIL} (password: ${PASSWORD})`);
