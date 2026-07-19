const express = require('express');
const shopping = require('../services/shoppingService');
const { requireLogin } = require('../middleware/auth');
const { required } = require('../middleware/validate');

const router = express.Router();
router.use(requireLogin);

router.get('/shopping', (req, res) => {
  res.render('shopping', {
    title: 'Shopping', active: 'shopping',
    items: shopping.list(req.session.user.id)
  });
});

router.post('/shopping', (req, res) => {
  const { name } = req.body;
  if (!required(name)) {
    req.session.flash = { type: 'error', message: 'Type an item name first.' };
  } else if (shopping.add(req.session.user.id, name)) {
    req.session.flash = { type: 'ok', message: `${name.trim()} added to your list.` };
  } else {
    req.session.flash = { type: 'error', message: `${name.trim()} is already on your list.` };
  }
  res.redirect('/shopping');
});

router.post('/shopping/from/:recipeId', (req, res) => {
  const result = shopping.addMissingFromRecipe(req.session.user.id, req.params.recipeId);
  if (!result) return res.status(404).render('404');
  req.session.flash = {
    type: 'ok',
    message: result.added > 0
      ? `Added ${result.added} missing ingredient${result.added === 1 ? '' : 's'} for ${result.recipe.name}.`
      : `Everything for ${result.recipe.name} is already on your list.`
  };
  res.redirect('/shopping');
});

router.post('/shopping/:id/toggle', (req, res) => {
  shopping.toggle(req.session.user.id, req.params.id);
  res.redirect('/shopping');
});

router.post('/shopping/:id/delete', (req, res) => {
  shopping.remove(req.session.user.id, req.params.id);
  res.redirect('/shopping');
});

router.get('/shopping/export', (req, res) => {
  const items = shopping.list(req.session.user.id);
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="shopping-list.csv"');
  res.send(shopping.toCsv(items));
});

module.exports = router;
