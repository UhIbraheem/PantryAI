// every test file gets its own in-memory database
process.env.DB_PATH = ':memory:';

const request = require('supertest');
const app = require('../app');

// registers a user and returns an agent that stays logged in
async function loggedInAgent(email, extras = {}) {
  const agent = request.agent(app);
  await agent.post('/register').type('form').send({
    name: extras.name || 'Test User',
    email,
    password: 'password123',
    confirm: 'password123',
    dietary: extras.dietary || ''
  });
  return agent;
}

function daysFromNow(n) {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toLocaleDateString('en-CA');
}

async function addItem(agent, item) {
  return agent.post('/inventory').type('form').send({
    name: item.name,
    quantity: item.quantity ?? 1,
    unit: item.unit ?? '',
    category: item.category ?? 'Other',
    expires_on: item.expires_on ?? ''
  });
}

module.exports = { app, request, loggedInAgent, addItem, daysFromNow };
