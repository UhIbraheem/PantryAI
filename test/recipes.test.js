const { test } = require('node:test');
const assert = require('node:assert');
const { loggedInAgent, addItem } = require('./helpers');

// gives the user everything for a spinach omelette (r1)
async function stockOmelettePantry(agent) {
  for (const name of ['Eggs', 'Spinach', 'Butter', 'Milk', 'Cheddar cheese']) {
    await addItem(agent, { name });
  }
}

test('TC-16 recipes are ranked by pantry match score', async () => {
  const agent = await loggedInAgent('r1@example.com');
  await stockOmelettePantry(agent);

  const res = await agent.get('/recipes');
  const rows = [...res.text.matchAll(/href="\/recipes\/(r\d+)"/g)].map((m) => m[1]);
  assert.strictEqual(rows[0], 'r1', 'spinach omelette should rank first with a full pantry match');
  assert.match(res.text, /Ready to cook/);
});

test('TC-17 dietary filter hides recipes that do not match', async () => {
  const agent = await loggedInAgent('r2@example.com');
  const res = await agent.get('/recipes?dietary=vegetarian');
  assert.doesNotMatch(res.text, /Chicken fajitas/);
  assert.match(res.text, /Tomato garlic pasta/);
});

test('TC-18 recipe details separate owned and missing ingredients', async () => {
  const agent = await loggedInAgent('r3@example.com');
  await addItem(agent, { name: 'Rice', category: 'Grains' });
  await addItem(agent, { name: 'Eggs', category: 'Dairy' });

  const res = await agent.get('/recipes/r4');
  assert.match(res.text, /You have \d of 6 ingredients/);
  assert.match(res.text, /soy sauce — not in pantry/);
});

test('TC-19 saving a recipe keeps it on the recipes page', async () => {
  const agent = await loggedInAgent('r4@example.com');
  await agent.post('/recipes/r3/save');

  const res = await agent.get('/recipes');
  const savedSection = res.text.slice(res.text.indexOf('Saved recipes'));
  assert.match(savedSection, /Black bean quesadillas/);

  await agent.post('/recipes/r3/unsave');
  const after = await agent.get('/recipes');
  assert.doesNotMatch(after.text, /Saved recipes/);
});

test('TC-20 unknown recipe ids return a 404 page', async () => {
  const agent = await loggedInAgent('r5@example.com');
  const res = await agent.get('/recipes/nope');
  assert.strictEqual(res.status, 404);
});
