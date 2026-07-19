const express = require('express');
const pantry = require('../services/pantryService');
const recipeService = require('../services/recipeService');
const { requireLogin } = require('../middleware/auth');

const router = express.Router();

router.get('/dashboard', requireLogin, (req, res) => {
  const userId = req.session.user.id;
  res.render('dashboard', {
    title: 'Dashboard', active: 'dashboard',
    stats: pantry.stats(userId),
    expiring: [...pantry.expired(userId), ...pantry.expiringSoon(userId)],
    suggestions: recipeService.match(userId).filter((r) => r.score > 0).slice(0, 3),
    statusOf: pantry.statusOf
  });
});

module.exports = router;
