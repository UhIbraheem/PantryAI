const express = require('express');
const recipeService = require('../services/recipeService');
const { requireLogin } = require('../middleware/auth');

const router = express.Router();
router.use(requireLogin);

router.get('/recipes', (req, res) => {
  const filters = {
    cuisine: req.query.cuisine || '',
    difficulty: req.query.difficulty || '',
    dietary: req.query.dietary || ''
  };
  res.render('recipes', {
    title: 'Recipes', active: 'recipes',
    results: recipeService.match(req.session.user.id, filters),
    saved: recipeService.savedRecipes(req.session.user.id),
    filters,
    cuisines: recipeService.CUISINES,
    difficulties: recipeService.DIFFICULTIES,
    dietaryOptions: recipeService.DIETARY
  });
});

router.get('/recipes/:id', (req, res) => {
  const recipe = recipeService.getRecipe(req.session.user.id, req.params.id);
  if (!recipe) return res.status(404).render('404');
  res.render('recipe', {
    title: recipe.name, active: 'recipes',
    recipe,
    isSaved: recipeService.savedIds(req.session.user.id).includes(recipe.id)
  });
});

router.post('/recipes/:id/save', (req, res) => {
  const recipe = recipeService.getRecipe(req.session.user.id, req.params.id);
  if (!recipe) return res.status(404).render('404');
  recipeService.saveRecipe(req.session.user.id, recipe.id);
  req.session.flash = { type: 'ok', message: `${recipe.name} saved.` };
  res.redirect(`/recipes/${recipe.id}`);
});

router.post('/recipes/:id/unsave', (req, res) => {
  const recipe = recipeService.getRecipe(req.session.user.id, req.params.id);
  if (!recipe) return res.status(404).render('404');
  recipeService.unsaveRecipe(req.session.user.id, recipe.id);
  req.session.flash = { type: 'ok', message: `${recipe.name} removed from saved.` };
  res.redirect(`/recipes/${recipe.id}`);
});

module.exports = router;
