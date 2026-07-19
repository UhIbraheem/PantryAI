const express = require('express');
const { requireLogin } = require('../middleware/auth');

const router = express.Router();

router.get('/dashboard', requireLogin, (req, res) => {
  res.render('dashboard', { title: 'Dashboard', active: 'dashboard' });
});

module.exports = router;
