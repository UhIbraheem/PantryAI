# Architecture

The prototype follows the layered component design from Deliverable 4:
UI layer, functional component layer, middleware layer and data layer. Every
request flows UI -> route -> validation/guard -> service -> database -> view.

## UI layer (views/)

| Component design screen | Template | Route |
|---|---|---|
| Start/Login Screen | `views/login.ejs` | `GET /login` |
| Registration Screen | `views/register.ejs` | `GET /register` |
| Pantry Dashboard | `views/dashboard.ejs` | `GET /dashboard` |
| Pantry Inventory Screen | `views/inventory.ejs` | `GET /inventory` |
| Add Pantry Item Screen | `views/itemform.ejs` | `GET /inventory/new` |
| Edit Pantry Item Screen | `views/itemform.ejs` | `GET /inventory/:id/edit` |
| AI Recipe Recommendation Screen | `views/recipes.ejs` | `GET /recipes` |
| Recipe Details Screen | `views/recipe.ejs` | `GET /recipes/:id` |
| Shopping Assistant Screen | `views/shopping.ejs` | `GET /shopping` |
| Analytics Dashboard | `views/analytics.ejs` | `GET /analytics` |

Screens from the component design that are out of scope for this prototype:
Image Recognition, Barcode Scanner, Forgot Password, Notification Center,
Reports and the Admin Panel. They are documented as future work.

## Functional component layer (src/services/)

| Component design name | Module |
|---|---|
| Authentication Component | `src/services/authService.js` |
| User Profile and Preference Component | `src/services/authService.js` (dietary preference) |
| Pantry Inventory Management Component | `src/services/pantryService.js` |
| AI Recipe Recommendation Component | `src/services/recipeService.js` |
| Saved Recipes and Favorites Component | `src/services/recipeService.js` |
| Shopping Assistant Component | `src/services/shoppingService.js` |
| Analytics and Food Waste Component | `src/services/analyticsService.js` |
| Notification Component | expiry checks in `pantryService` surfaced on the dashboard |

The recommendation engine is a rule-based pantry match for the prototype: each
recipe is scored by `ingredients in pantry / total ingredients`, ranked, and its
missing ingredients are computed for the shopping flow.

## Middleware layer

| Component design name | Module |
|---|---|
| REST API / Service Layer | `src/routes/*.js` (express routers) |
| Authentication and Security Middleware | `src/middleware/auth.js`, bcrypt hashing, sessions |
| Validation Middleware | `src/middleware/validate.js` |
| Database Access Layer | `src/db.js` + prepared statements in services |
| Report Generation Service | CSV export in pantry and shopping services |

## Data layer

`src/schema.sql` defines four tables: `users`, `pantry_items`, `saved_recipes`
and `shopping_items`. SQLite keeps the prototype self-contained; the schema
would move to a hosted database unchanged.
