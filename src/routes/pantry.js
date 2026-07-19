const express = require('express');
const pantry = require('../services/pantryService');
const { requireLogin } = require('../middleware/auth');
const { required, isPositiveNumber, isDate } = require('../middleware/validate');

const router = express.Router();
router.use(requireLogin);

function validateItem(body) {
  const errors = {};
  if (!required(body.name)) errors.name = 'Item name is required.';
  if (!isPositiveNumber(body.quantity)) errors.quantity = 'Quantity must be a positive number.';
  if (!pantry.CATEGORIES.includes(body.category)) errors.category = 'Pick a category.';
  if (body.expires_on && !isDate(body.expires_on)) errors.expires_on = 'Use a valid date.';
  return errors;
}

router.get('/inventory', (req, res) => {
  const filters = {
    q: (req.query.q || '').trim(),
    category: req.query.category || '',
    expiring: req.query.expiring || ''
  };
  const items = pantry.listForUser(req.session.user.id, filters);
  res.render('inventory', {
    title: 'Inventory', active: 'inventory',
    items, filters,
    categories: pantry.CATEGORIES,
    statusOf: pantry.statusOf
  });
});

router.get('/inventory/export', (req, res) => {
  const items = pantry.listForUser(req.session.user.id);
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="pantry.csv"');
  res.send(pantry.toCsv(items));
});

router.get('/inventory/new', (req, res) => {
  res.render('itemform', {
    title: 'Add item', active: 'inventory',
    mode: 'add', item: {}, errors: {},
    categories: pantry.CATEGORIES, units: pantry.UNITS
  });
});

router.post('/inventory', (req, res) => {
  const errors = validateItem(req.body);
  if (Object.keys(errors).length > 0) {
    return res.status(400).render('itemform', {
      title: 'Add item', active: 'inventory',
      mode: 'add', item: req.body, errors,
      categories: pantry.CATEGORIES, units: pantry.UNITS
    });
  }
  const { item, merged } = pantry.addItem(req.session.user.id, req.body);
  req.session.flash = merged
    ? { type: 'ok', message: `${item.name} was already in your pantry, so the quantities were merged.` }
    : { type: 'ok', message: `${item.name} added to your pantry.` };
  res.redirect('/inventory');
});

router.get('/inventory/:id/edit', (req, res) => {
  const item = pantry.getItem(req.session.user.id, req.params.id);
  if (!item) return res.status(404).render('404');
  res.render('itemform', {
    title: 'Edit item', active: 'inventory',
    mode: 'edit', item, errors: {},
    categories: pantry.CATEGORIES, units: pantry.UNITS
  });
});

router.post('/inventory/:id', (req, res) => {
  const item = pantry.getItem(req.session.user.id, req.params.id);
  if (!item) return res.status(404).render('404');
  const errors = validateItem(req.body);
  if (Object.keys(errors).length > 0) {
    return res.status(400).render('itemform', {
      title: 'Edit item', active: 'inventory',
      mode: 'edit', item: { ...req.body, id: item.id }, errors,
      categories: pantry.CATEGORIES, units: pantry.UNITS
    });
  }
  pantry.updateItem(req.session.user.id, item.id, req.body);
  req.session.flash = { type: 'ok', message: `${req.body.name} updated.` };
  res.redirect('/inventory');
});

router.post('/inventory/:id/delete', (req, res) => {
  const item = pantry.getItem(req.session.user.id, req.params.id);
  if (item) {
    pantry.removeItem(req.session.user.id, item.id);
    req.session.flash = { type: 'ok', message: `${item.name} removed.` };
  }
  res.redirect('/inventory');
});

module.exports = router;
