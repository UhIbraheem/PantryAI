const db = require('../db');
const pantryService = require('./pantryService');
const recipes = require('../data/recipes.json');

const CUISINES = [...new Set(recipes.map((r) => r.cuisine))].sort();
const DIFFICULTIES = ['easy', 'medium', 'hard'];
const DIETARY = ['vegetarian', 'vegan', 'gluten free'];

// loose comparison so "Tomatoes" in the pantry covers "tomato" in a recipe
function norm(text) {
  return text.toLowerCase().trim().replace(/s\b/g, '');
}

function inPantry(ingredient, items) {
  const ing = norm(ingredient);
  return items.some((item) => {
    const name = norm(item.name);
    return ing.includes(name) || name.includes(ing);
  });
}

function scoreRecipe(recipe, items) {
  const matched = recipe.ingredients.filter((ing) => inPantry(ing, items));
  const missing = recipe.ingredients.filter((ing) => !inPantry(ing, items));
  return {
    ...recipe,
    matched,
    missing,
    score: matched.length / recipe.ingredients.length
  };
}

// rank all recipes by how much of them is already in the user's pantry
function match(userId, filters = {}) {
  const items = pantryService.listForUser(userId);
  let results = recipes.map((r) => scoreRecipe(r, items));

  if (filters.cuisine) {
    results = results.filter((r) => r.cuisine === filters.cuisine);
  }
  if (filters.difficulty) {
    results = results.filter((r) => r.difficulty === filters.difficulty);
  }
  if (filters.dietary) {
    results = results.filter((r) => r.dietary.includes(filters.dietary));
  }

  return results.sort((a, b) => b.score - a.score || a.missing.length - b.missing.length);
}

function getRecipe(userId, id) {
  const recipe = recipes.find((r) => r.id === id);
  if (!recipe) return null;
  const items = pantryService.listForUser(userId);
  return scoreRecipe(recipe, items);
}

function saveRecipe(userId, recipeId) {
  db.prepare('INSERT OR IGNORE INTO saved_recipes (user_id, recipe_id) VALUES (?, ?)')
    .run(userId, recipeId);
}

function unsaveRecipe(userId, recipeId) {
  db.prepare('DELETE FROM saved_recipes WHERE user_id = ? AND recipe_id = ?')
    .run(userId, recipeId);
}

function savedIds(userId) {
  return db
    .prepare('SELECT recipe_id FROM saved_recipes WHERE user_id = ?')
    .all(userId)
    .map((row) => row.recipe_id);
}

function savedRecipes(userId) {
  const ids = savedIds(userId);
  const items = pantryService.listForUser(userId);
  return recipes.filter((r) => ids.includes(r.id)).map((r) => scoreRecipe(r, items));
}

module.exports = {
  CUISINES, DIFFICULTIES, DIETARY,
  match, getRecipe, saveRecipe, unsaveRecipe, savedIds, savedRecipes
};
