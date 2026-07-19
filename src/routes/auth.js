const express = require('express');
const authService = require('../services/authService');
const { isEmail, required, minLength } = require('../middleware/validate');

const router = express.Router();

router.get('/login', (req, res) => {
  if (req.session.user) return res.redirect('/dashboard');
  res.render('login', { title: 'Log in', errors: {}, values: {} });
});

router.post('/login', (req, res) => {
  const { email, password } = req.body;
  const user = authService.verify(email, password);
  if (!user) {
    return res.status(401).render('login', {
      title: 'Log in',
      errors: { form: 'Invalid email or password.' },
      values: { email }
    });
  }
  req.session.user = user;
  req.session.flash = { type: 'ok', message: `Welcome back, ${user.name}.` };
  res.redirect('/dashboard');
});

router.get('/register', (req, res) => {
  if (req.session.user) return res.redirect('/dashboard');
  res.render('register', { title: 'Create account', errors: {}, values: {} });
});

router.post('/register', (req, res) => {
  const { name, email, password, confirm, dietary } = req.body;
  const errors = {};

  if (!required(name)) errors.name = 'Name is required.';
  if (!isEmail(email)) errors.email = 'Enter a valid email address.';
  else if (authService.findByEmail(email)) errors.email = 'An account with this email already exists.';
  if (!minLength(password, 8)) errors.password = 'Password must be at least 8 characters.';
  else if (password !== confirm) errors.confirm = 'Passwords do not match.';

  if (Object.keys(errors).length > 0) {
    return res.status(400).render('register', {
      title: 'Create account',
      errors,
      values: { name, email, dietary }
    });
  }

  const user = authService.register({ name: name.trim(), email, password, dietary });
  req.session.user = user;
  req.session.flash = { type: 'ok', message: `Welcome to PantryAI, ${user.name}.` };
  res.redirect('/dashboard');
});

router.post('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/login');
  });
});

module.exports = router;
