const express = require('express');
const analytics = require('../services/analyticsService');
const { requireLogin } = require('../middleware/auth');

const router = express.Router();

router.get('/analytics', requireLogin, (req, res) => {
  res.render('analytics', {
    title: 'Analytics', active: 'analytics',
    summary: analytics.summary(req.session.user.id)
  });
});

module.exports = router;
