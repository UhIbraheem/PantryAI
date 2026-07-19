const { test } = require('node:test');
const assert = require('node:assert');
const { app, request } = require('./helpers');

test('TC-01 register with valid details creates an account and logs in', async () => {
  const agent = request.agent(app);
  const res = await agent.post('/register').type('form').send({
    name: 'Maria',
    email: 'maria@example.com',
    password: 'password123',
    confirm: 'password123',
    dietary: 'vegetarian'
  });
  assert.strictEqual(res.status, 302);
  assert.strictEqual(res.headers.location, '/dashboard');

  const dashboard = await agent.get('/dashboard');
  assert.strictEqual(dashboard.status, 200);
  assert.match(dashboard.text, /Hi Maria/);
});

test('TC-02 register rejects a password under 8 characters', async () => {
  const res = await request(app).post('/register').type('form').send({
    name: 'Sam',
    email: 'sam@example.com',
    password: 'short',
    confirm: 'short'
  });
  assert.strictEqual(res.status, 400);
  assert.match(res.text, /at least 8 characters/);
});

test('TC-03 register rejects an email that is already taken', async () => {
  const agent = request.agent(app);
  await agent.post('/register').type('form').send({
    name: 'First', email: 'taken@example.com',
    password: 'password123', confirm: 'password123'
  });
  const res = await request(app).post('/register').type('form').send({
    name: 'Second', email: 'taken@example.com',
    password: 'password123', confirm: 'password123'
  });
  assert.strictEqual(res.status, 400);
  assert.match(res.text, /already exists/);
});

test('TC-04 login succeeds with correct credentials', async () => {
  await request(app).post('/register').type('form').send({
    name: 'Lee', email: 'lee@example.com',
    password: 'password123', confirm: 'password123'
  });
  const agent = request.agent(app);
  const res = await agent.post('/login').type('form').send({
    email: 'lee@example.com', password: 'password123'
  });
  assert.strictEqual(res.status, 302);
  assert.strictEqual(res.headers.location, '/dashboard');
});

test('TC-05 login fails with a wrong password', async () => {
  await request(app).post('/register').type('form').send({
    name: 'Kim', email: 'kim@example.com',
    password: 'password123', confirm: 'password123'
  });
  const res = await request(app).post('/login').type('form').send({
    email: 'kim@example.com', password: 'wrong-password'
  });
  assert.strictEqual(res.status, 401);
  assert.match(res.text, /Invalid email or password/);
});

test('TC-06 protected pages redirect to login without a session', async () => {
  for (const path of ['/dashboard', '/inventory', '/recipes', '/shopping', '/analytics']) {
    const res = await request(app).get(path);
    assert.strictEqual(res.status, 302, `${path} should redirect`);
    assert.strictEqual(res.headers.location, '/login');
  }
});

test('TC-07 logout ends the session', async () => {
  const agent = request.agent(app);
  await agent.post('/register').type('form').send({
    name: 'Ana', email: 'ana@example.com',
    password: 'password123', confirm: 'password123'
  });
  const out = await agent.post('/logout');
  assert.strictEqual(out.headers.location, '/login');

  const after = await agent.get('/dashboard');
  assert.strictEqual(after.status, 302);
  assert.strictEqual(after.headers.location, '/login');
});
