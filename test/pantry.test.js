const { test } = require('node:test');
const assert = require('node:assert');
const { loggedInAgent, addItem, daysFromNow } = require('./helpers');

test('TC-08 adding a pantry item shows it in the inventory', async () => {
  const agent = await loggedInAgent('p1@example.com');
  const res = await addItem(agent, { name: 'Oats', quantity: 500, unit: 'g', category: 'Grains' });
  assert.strictEqual(res.status, 302);

  const list = await agent.get('/inventory');
  assert.match(list.text, /Oats/);
  assert.match(list.text, /1 item in your pantry/);
});

test('TC-09 add item rejects an empty name and a negative quantity', async () => {
  const agent = await loggedInAgent('p2@example.com');

  const noName = await addItem(agent, { name: '   ', quantity: 1 });
  assert.strictEqual(noName.status, 400);
  assert.match(noName.text, /name is required/i);

  const negative = await addItem(agent, { name: 'Flour', quantity: -2 });
  assert.strictEqual(negative.status, 400);
  assert.match(negative.text, /positive number/);

  const list = await agent.get('/inventory');
  assert.match(list.text, /Your pantry is empty/);
});

test('TC-10 adding the same item again merges the quantities', async () => {
  const agent = await loggedInAgent('p3@example.com');
  await addItem(agent, { name: 'Pasta', quantity: 500, unit: 'g', category: 'Grains' });
  await addItem(agent, { name: 'pasta', quantity: 250, unit: 'g', category: 'Grains' });

  const list = await agent.get('/inventory');
  assert.match(list.text, /750 g/);
  assert.match(list.text, /1 item in your pantry/);
});

test('TC-11 editing an item updates its values', async () => {
  const agent = await loggedInAgent('p4@example.com');
  await addItem(agent, { name: 'Milk', quantity: 1, unit: 'L', category: 'Dairy' });
  const id = (await agent.get('/inventory')).text.match(/\/inventory\/(\d+)\/edit/)[1];

  const res = await agent.post(`/inventory/${id}`).type('form').send({
    name: 'Milk', quantity: 2, unit: 'L', category: 'Dairy', expires_on: ''
  });
  assert.strictEqual(res.status, 302);

  const list = await agent.get('/inventory');
  assert.match(list.text, /2 L/);
});

test('TC-12 deleting an item removes it from the inventory', async () => {
  const agent = await loggedInAgent('p5@example.com');
  await addItem(agent, { name: 'Crackers', category: 'Snacks' });
  const id = (await agent.get('/inventory')).text.match(/\/inventory\/(\d+)\/edit/)[1];

  await agent.post(`/inventory/${id}/delete`);
  const list = await agent.get('/inventory');
  assert.doesNotMatch(list.text, /<td>Crackers<\/td>/);
  assert.match(list.text, /Your pantry is empty/);
});

test('TC-13 search and category filters narrow the list', async () => {
  const agent = await loggedInAgent('p6@example.com');
  await addItem(agent, { name: 'Milk', category: 'Dairy' });
  await addItem(agent, { name: 'Rice', category: 'Grains' });

  const search = await agent.get('/inventory?q=milk');
  assert.match(search.text, /Milk/);
  assert.doesNotMatch(search.text, /<td>Rice<\/td>/);

  const byCategory = await agent.get('/inventory?category=Grains');
  assert.match(byCategory.text, /Rice/);
  assert.doesNotMatch(byCategory.text, /<td>Milk<\/td>/);
});

test('TC-14 items expiring soon appear on the dashboard', async () => {
  const agent = await loggedInAgent('p7@example.com');
  await addItem(agent, { name: 'Spinach', category: 'Produce', expires_on: daysFromNow(2) });
  await addItem(agent, { name: 'Rice', category: 'Grains', expires_on: daysFromNow(200) });

  const dashboard = await agent.get('/dashboard');
  const attention = dashboard.text.slice(dashboard.text.indexOf('Needs attention'));
  assert.match(attention, /Spinach/);
  assert.doesNotMatch(attention.slice(0, attention.indexOf('Recipe ideas')), /<td>Rice<\/td>/);
});

test('TC-15 inventory exports as CSV', async () => {
  const agent = await loggedInAgent('p8@example.com');
  await addItem(agent, { name: 'Beans', quantity: 2, category: 'Canned' });

  const res = await agent.get('/inventory/export');
  assert.strictEqual(res.status, 200);
  assert.match(res.headers['content-type'], /text\/csv/);
  assert.match(res.text, /name,quantity,unit,category,expires_on/);
  assert.match(res.text, /"Beans"/);
});
