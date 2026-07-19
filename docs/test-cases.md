# Functional test cases

Run with `npm test`. Each case is automated in `test/` with the same TC id in
the test name, executed against an in-memory database. Current result: all 26
pass.

| ID | Function under test | Journey phase | Expected result | Result |
|---|---|---|---|---|
| TC-01 | Register with valid details | 1 Authentication | Account created, session starts, redirect to dashboard | Pass |
| TC-02 | Register with short password | 1 Authentication | Rejected with "at least 8 characters", no account | Pass |
| TC-03 | Register with taken email | 1 Authentication | Rejected with "already exists", no duplicate account | Pass |
| TC-04 | Login with correct credentials | 1 Authentication | Session starts, redirect to dashboard | Pass |
| TC-05 | Login with wrong password | 1 Authentication | 401, "Invalid email or password", no session | Pass |
| TC-06 | Route guard on protected pages | Cross-cutting | Every app page redirects to /login without a session | Pass |
| TC-07 | Logout | 1 Authentication | Session destroyed, dashboard no longer reachable | Pass |
| TC-08 | Add pantry item | 3 Inventory | Item persisted and listed, counter updates | Pass |
| TC-09 | Add item validation | 3 Inventory | Empty name / negative quantity rejected with field errors | Pass |
| TC-10 | Duplicate item handling | 3 Inventory | Same item added twice merges quantities into one row | Pass |
| TC-11 | Edit item | 3 Inventory | Updated values persisted and shown | Pass |
| TC-12 | Delete item | 3 Inventory | Row removed, empty state shown | Pass |
| TC-13 | Search and category filter | 3 Inventory | Only matching items returned | Pass |
| TC-14 | Expiration tracking | 2 Orientation | Item expiring in 2 days appears under "Needs attention"; far-dated item does not | Pass |
| TC-15 | Inventory CSV export | 3 Inventory | text/csv response containing the items | Pass |
| TC-16 | Recipe ranking | 4 Recipes | Fully-stocked recipe ranks first with ready-to-cook badge | Pass |
| TC-17 | Dietary filter | 4 Recipes | Non-vegetarian recipes excluded when filtering vegetarian | Pass |
| TC-18 | Missing ingredient computation | 4 Recipes | Details separate owned ingredients from missing ones | Pass |
| TC-19 | Save and unsave recipe | 4 Recipes | Saved recipe listed on recipes page; unsave removes it | Pass |
| TC-20 | Unknown recipe id | 4 Recipes | 404 page | Pass |
| TC-21 | Missing ingredients to shopping list | 5 Completion | Recipe's missing ingredients appear with the recipe named as source | Pass |
| TC-22 | Shopping list dedup | 5 Completion | Adding the same ingredient repeatedly keeps a single row | Pass |
| TC-23 | Mark item bought | 5 Completion | Open-items counter decreases | Pass |
| TC-24 | Remove shopping item | 5 Completion | Item deleted, empty state shown | Pass |
| TC-25 | Analytics accuracy | 6 Payoff | Fresh/soon/expired counts, category chart and waste rate match the data exactly | Pass |
| TC-26 | Analytics with empty pantry | 6 Payoff | Page renders with empty states, no errors | Pass |
