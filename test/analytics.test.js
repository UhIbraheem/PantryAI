const { test } = require('node:test');
const assert = require('node:assert');
const { loggedInAgent, addItem, daysFromNow } = require('./helpers');

test('TC-25 analytics reflects what is actually in the database', async () => {
  const agent = await loggedInAgent('a1@example.com');
  await addItem(agent, { name: 'Milk', category: 'Dairy', expires_on: daysFromNow(2) });
  await addItem(agent, { name: 'Yogurt', category: 'Dairy', expires_on: daysFromNow(-1) });
  await addItem(agent, { name: 'Rice', category: 'Grains', expires_on: daysFromNow(300) });

  const res = await agent.get('/analytics');
  assert.match(res.text, /Fresh · 1/);
  assert.match(res.text, /Expiring soon · 1/);
  assert.match(res.text, /Expired · 1/);
  assert.match(res.text, /title="Dairy: 2"/);
  assert.match(res.text, /title="Grains: 1"/);
  // 1 of 3 dated items expired = 33%
  assert.match(res.text, />33%</);
});

test('TC-26 analytics handles an empty pantry without errors', async () => {
  const agent = await loggedInAgent('a2@example.com');
  const res = await agent.get('/analytics');
  assert.strictEqual(res.status, 200);
  assert.match(res.text, /Nothing to measure yet/);
});
