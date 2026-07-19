const pantryService = require('./pantryService');
const recipeService = require('./recipeService');
const shoppingService = require('./shoppingService');

// everything on the analytics page is computed straight from the database
function summary(userId) {
  const items = pantryService.listForUser(userId);
  const byStatus = { ok: 0, soon: 0, expired: 0 };
  for (const item of items) {
    byStatus[pantryService.statusOf(item)] += 1;
  }

  const counts = {};
  for (const item of items) {
    counts[item.category] = (counts[item.category] || 0) + 1;
  }
  const byCategory = Object.entries(counts)
    .map(([category, count]) => ({ category, count }))
    .sort((a, b) => b.count - a.count || a.category.localeCompare(b.category));

  const dated = items.filter((i) => i.expires_on).length;
  const shoppingItems = shoppingService.list(userId);

  return {
    total: items.length,
    fresh: byStatus.ok,
    soon: byStatus.soon,
    expired: byStatus.expired,
    wasteRate: dated > 0 ? Math.round((byStatus.expired / dated) * 100) : 0,
    byCategory,
    maxCategory: byCategory.length > 0 ? byCategory[0].count : 0,
    savedCount: recipeService.savedIds(userId).length,
    shopping: {
      total: shoppingItems.length,
      bought: shoppingItems.filter((i) => i.done).length
    }
  };
}

module.exports = { summary };
