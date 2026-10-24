---
version: 1
slug: "src-pages-hallpage-tsx"
primary_target: "src/pages/HallPage.tsx"
related_targets: ["src/pages/Home.tsx","src/pages/SchoolPage.tsx"]
---

# Surface brief: Dining Hall Planner (all routes)

Scope: home, school page, hall page (plan + full menu), calculator dialog, 404. Mode: **Operate**. The owner asked for a UI rework because the current one is "too tacky and cluttered", tailored "to the average user".

Audience and job: a student on a phone between classes who wants to know what to eat at one hall today. Most are not macro experts: calories (and maybe protein) are what they act on; the full macro breakdown is for the few who track it.

Constraints: PRODUCT.md holds. All functionality stays (targets, calculator, plan, another option, not this, bring back, full menu with search/details/CYO, dietary tags, light/dark, shareable date/view links). Nothing BU-specific beyond data and the school colour token. Never imply affiliation. Unattended run: the owner delegated every decision.

## Direction contract

THESIS: The day is planned on your meal card. Your goal sits on one card with your school's colour band, and each meal is a card with exactly what to take, numbers only as deep as you ask. It refuses the macro-tracker dashboard (KPI tiles, rings, glyph legends) and the dark brutalist grid the app had.

OWN-WORLD: Student ID / meal-plan card. Soft grey ground, white rounded cards with a real shadow, ink text, one school-colour band on the goal card and the selected day only (scarlet for BU, a token for any school). Figtree throughout, tabular numbers. Pill chips for days, views and diet tags; ink buttons for actions; an "Open now" status chip on halls and meals. Macro colours appear only inside the optional breakdown.

STORY: The student picks a hall, sees today's plan immediately with each meal's amounts in plain servings, swaps a plate or rules out a dish with one tap, and only opens the protein/carbs/fat breakdown or the calculator if they want them.

FIRST VIEWPORT: Hall page on a phone: back link, hall name with switcher, day pills, then the goal card (band, "2,200 cal a day", one line of macros, Edit) and the plan bar ("2,190 of 2,200 cal"), and the first meal card starting above the fold. Desktop: goal card and day total in a left column, meal cards in the right.

FORM: Student ID and meal-plan card, candidate 4 of 7 on the ordered list. seed:33c9c602a34209b7
Raises: first plate above the fold on a phone (from Japanese high-density: no pixel wasted where it matters). Live state on every meal and hall: open now, later, closed (from the transit diagram). One text size for dish lines; hierarchy by weight (from the acetate manual). Macro detail is a layer that appears only on request (from the star atlas). Every number appears once (from the factory catalog). Changing targets re-plans live with no button (from the type specimen).
Signature interaction: the plate swap. "Another option" turns the meal card over to the next plate (a quick 180ms flip on the card face), and ruled-out dishes leave with a short collapse; both stay instant under reduced motion.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
