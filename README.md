# PantryAI

Track what's in your pantry, find recipes you can cook right now, and build a
shopping list from whatever is missing.

Working prototype for the Pantry Guardian project (Software Engineering II,
Deliverable 5).

## Stack

- Node.js + Express, server-rendered EJS views
- SQLite (better-sqlite3) for storage
- bcryptjs + express-session for accounts and sessions
- Hand-written CSS, no frontend framework, no build step

## Run it

```
npm install
npm run seed    # optional: demo account with sample data
npm start       # http://localhost:3000
```

Demo login after seeding: `demo@pantryai.app` / `demo12345`

## Tests

```
npm test
```

26 functional test cases (TC-01 to TC-26) covering auth, inventory, recipes,
shopping and analytics. They run with the built-in Node test runner and
supertest against an in-memory database, so they never touch your real data.

## How it's organized

```
server.js        starts the app
app.js           express setup and route mounting
src/db.js        sqlite connection, runs schema.sql
src/schema.sql   users, pantry_items, saved_recipes, shopping_items
src/services/    business logic (auth, pantry, recipes, shopping, analytics)
src/routes/      one router per screen area
src/middleware/  login guard and input validation
src/data/        seed recipe dataset
views/           EJS templates for every screen
public/          styles, logo and a small client script
test/            functional test suite
docs/            architecture and user journey notes
```

The recipe recommendations are a rule-based pantry match: each recipe is scored
by how many of its ingredients are already in your pantry, and missing ones can
be pushed to the shopping list. See `docs/architecture.md` for how the code maps
to the system design, and `docs/component-design.md` for the reusable components
each screen is assembled from.
