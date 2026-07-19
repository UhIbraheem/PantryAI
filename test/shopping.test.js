const { test } = require('node:test');
const assert = require('node:assert');
const { loggedInAgent, addItem } = require('./helpers');

test('TC-21 missing recipe ingredients land on the shopping list', async () => {
  const agent = await loggedInAgent('s1@example.com');
  // pantry covers most of veggie fried rice (r4), but not soy sauce
  for (const name of ['Rice', 'Eggs', 'Bell pepper', 'Onions', 'Garlic']) {
    await addItem(agent, { name });
  }

  const res = await agent.post('/shopping/from/r4');
  assert.strictEqual(res.status, 302);

  const list = await agent.get('/shopping');
  assert.match(list.text, /soy sauce/);
  assert.match(list.text, /Veggie fried rice/);
});

test('TC-22 the shopping list never duplicates an item', async () => {
  const agent = await loggedInAgent('s2@example.com');
  await agent.post('/shopping').type('form').send({ name: 'Soy sauce' });
  await agent.post('/shopping').type('form').send({ name: 'soy sauce' });
  await agent.post('/shopping/from/r4'); // r4 is missing soy sauce too

  const list = await agent.get('/shopping');
  const matches = list.text.match(/[Ss]oy sauce/g).length;
  assert.strictEqual((list.text.match(/<td class="">[Ss]oy sauce<\/td>/g) || []).length, 1);
});

test('TC-23 marking an item bought moves it out of the open count', async () => {
  const agent = await loggedInAgent('s3@example.com');
  await agent.post('/shopping').type('form').send({ name: 'Lemons' });
  await agent.post('/shopping').type('form').send({ name: 'Limes' });
  const id = (await agent.get('/shopping')).text.match(/\/shopping\/(\d+)\/toggle/)[1];

  await agent.post(`/shopping/${id}/toggle`);
  const list = await agent.get('/shopping');
  assert.match(list.text, /1 item left to buy/);
});

test('TC-24 removing an item deletes it from the list', async () => {
  const agent = await loggedInAgent('s4@example.com');
  await agent.post('/shopping').type('form').send({ name: 'Basil' });
  const id = (await agent.get('/shopping')).text.match(/\/shopping\/(\d+)\/toggle/)[1];
  await agent.post(`/shopping/${id}/delete`);

  const list = await agent.get('/shopping');
  assert.doesNotMatch(list.text, /Basil/);
  assert.match(list.text, /Your list is empty/);
});
