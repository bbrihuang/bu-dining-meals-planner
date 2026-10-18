# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Students who track their calories and macros and eat in campus dining halls. They open the site on a phone, often between classes, to find out what to eat at a given hall today to hit their daily numbers. They already know their targets, or need help working them out.

## Product Purpose

Dining Hall Planner takes a student's daily calories, protein, carbs and fat, and builds a plate for every meal from what the chosen dining hall is actually serving that day, in amounts a person can take (whole pieces, quarter cups, whole ounces). Success is a student who leaves with a plan they can follow at the hall, and trusts that the day adds up to their targets.

## Positioning

It builds the plate for you. Official menu pages list dishes and nutrition; this site turns daily macro targets into specific dishes and exact portions for every meal, aiming each meal at what is left of the day. A menu page cannot copy that without doing the planning.

## Operating Context

- Menus are read from each school's own pages at build time and refreshed twice a day (about 5 am and 2 pm Boston time); visitors never trigger a scrape.
- Menus are published up to two weeks ahead. The site is static: no accounts, no server, no database.
- Targets and calculator answers are remembered in the visitor's own browser only.
- Boston University is the first school (Warren Towers, Marciano Commons, West Campus, Fenway). More schools are planned; adding one should not require redesigning anything.

## Capabilities and Constraints

- Pick school, dining hall, and day (up to two weeks ahead).
- Set daily targets by typing them in, or with the "Calculate my macros" calculator (body, activity, goal, macro balance).
- Meal plan view: one plate per meal, "Another option" to swap a plate, "Not this" to rule a dish out and re-plan the day, "Bring back" to undo.
- Full menu view: every dish by station with calories and macros, search, details (fiber, sugar, sodium, allergens), "Create Your Own" stations, and dietary tags (vegan, vegetarian, halal, gluten free).
- Light and dark mode. Shareable links carry the date and view.
- Dining halls only; cafés and retail are out of scope.
- Nutrition and allergen data are only as accurate and complete as each school's published menu.

## Brand Commitments

- Name: Dining Hall Planner.
- Voice: plain, friendly, direct ("Welcome!", "Pick your dining hall", "Another option").
- It is an unofficial student-built tool. It is not run, endorsed or sponsored by BU Dining, Sodexo, or any school, and must never imply otherwise.

## Evidence on Hand

- Real scraped menus for BU's four halls (generated into `public/data/` at build time, not committed).
- Saved copies of BU's and Sodexo's menu pages in `test/fixtures/`, and tests against real BU days.
- No testimonials, usage numbers, or user research exist. Do not invent any.

## Product Principles

1. **Plates, not lists.** The product's value is a plan that adds up; browsing the menu supports that, it doesn't replace it.
2. **Portions a person can take.** Amounts are real servings ("1½ cups", "3 links"), never arbitrary grams.
3. **Honest about its data.** Numbers come from the school's menus; say so, and never present estimates, allergen info, or calculator output as authoritative or medical.
4. **Fast on a phone, no sign-in.** A student between classes gets a plan in seconds with nothing to create or install.
5. **Any school fits.** Nothing about the experience should be specific to BU beyond data and a name.

## Accessibility & Inclusion

- Allergen information must not be presented as authoritative; direct people with serious allergies to dining staff.
- The calculator is an estimate for healthy adults, not medical advice, and does not suggest going below a safe calorie floor.
- Dietary tags (vegan, vegetarian, halal, gluten free) must stay visible and unambiguous.
