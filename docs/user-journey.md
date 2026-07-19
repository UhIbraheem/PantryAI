# User journey

## Stakeholders and primary users

| Stakeholder | Role |
|---|---|
| Household users | Manage pantry inventory, get recipe ideas, build shopping lists |
| Household administrator | Owns the account setup and preferences |
| Grocery product data (future) | External lookup for barcode/product info |
| System administrator (future) | Maintains the platform |

Primary user for the demo: a busy student who wants to cook with what she
already has before it expires.

## Journey phases

Each phase lists what the user does, what the UI shows, and how the system
responds. All six phases are implemented in the prototype.

### 1. Authentication — Login / Register screens
- User action: create an account (name, email, password, dietary preference) or log in.
- UI: field-level validation errors, password rules, redirect on success.
- System: validates input, hashes the password with bcrypt, starts a session.

### 2. Orientation — Pantry Dashboard
- User action: scan the state of the pantry.
- UI: stat strip (items, categories, expiring soon, expired), "Needs attention" list, recipe ideas.
- System: computes stats and expiry status live from the database.

### 3. Inventory management — Inventory / Add / Edit screens
- User action: add, edit, delete items; search and filter.
- UI: inventory table with expiry badges, add/edit forms with validation, CSV export.
- System: persists changes, merges duplicate items instead of creating copies, recomputes expiry.

### 4. Recipe discovery — Recipes / Recipe details screens
- User action: browse ranked recipes, apply cuisine/difficulty/dietary filters, open one, save it.
- UI: match score per recipe ("5 of 6 ingredients"), ready-to-cook badge, owned vs missing ingredients.
- System: scores every recipe against the pantry and computes the missing list.

### 5. Completion — Shopping list screen
- User action: push a recipe's missing ingredients to the shopping list, add extras, tick items off.
- UI: deduplicated list with source recipe, open-items counter, CSV export.
- System: dedupes by name, tracks bought state.

### 6. Payoff — Analytics screen
- User action: review how the pantry is being used.
- UI: category bar chart, freshness breakdown, waste rate, activity summary.
- System: aggregates everything from live data; nothing is hard-coded.

## Out of prototype scope

Image recognition, barcode scanning, password recovery, notification delivery
(email/SMS), reports and the admin panel are part of the full component design
but intentionally out of this prototype. The dashboard's expiring-soon panel
stands in for the notification component's in-app alerts.
