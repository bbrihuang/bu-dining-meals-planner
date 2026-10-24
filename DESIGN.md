---
name: Dining Hall Planner
description: A plate for every meal, from what your dining hall is serving today, on calm white meal cards.
colors:
  ground: "#eef0f3"
  card: "#ffffff"
  surface: "#f6f7f9"
  ink: "#16181d"
  muted: "#5d636e"
  line: "#e3e6eb"
  line-strong: "#c9ced6"
  control: "#8b919c"
  school-bu: "#cc0000"
  danger: "#c42b1c"
  danger-ink: "#a8231a"
  danger-soft: "#fdecea"
  good: "#1f7a46"
  good-soft: "#e5f4ea"
  warn-soft: "#fff4d6"
  protein: "#3b5bdb"
  carbs: "#d98a1c"
  fat: "#5e8c4a"
typography:
  display:
    fontFamily: "Figtree Variable, ui-sans-serif, system-ui, -apple-system, Segoe UI, sans-serif"
    fontSize: "3rem"
    fontWeight: 700
    lineHeight: 1
    letterSpacing: "-0.025em"
    fontFeature: "tnum"
  headline:
    fontFamily: "Figtree Variable, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.875rem"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "-0.025em"
    fontFeature: "tnum"
  figure:
    fontFamily: "Figtree Variable, ui-sans-serif, system-ui, sans-serif"
    fontSize: "2rem"
    fontWeight: 700
    lineHeight: 1.25
    letterSpacing: "-0.025em"
    fontFeature: "tnum"
  title:
    fontFamily: "Figtree Variable, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 700
    lineHeight: 1.4
    letterSpacing: "-0.025em"
    fontFeature: "tnum"
  section:
    fontFamily: "Figtree Variable, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 700
    lineHeight: 1.55
    fontFeature: "tnum"
  body:
    fontFamily: "Figtree Variable, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 500
    lineHeight: 1.375
    fontFeature: "tnum"
  control:
    fontFamily: "Figtree Variable, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.9375rem"
    fontWeight: 650
    lineHeight: 1.5
    fontFeature: "tnum"
  small:
    fontFamily: "Figtree Variable, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.43
    fontFeature: "tnum"
  label:
    fontFamily: "Figtree Variable, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 600
    lineHeight: 1.33
    fontFeature: "tnum"
  tag:
    fontFamily: "Figtree Variable, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.6875rem"
    fontWeight: 600
    lineHeight: 1rem
    fontFeature: "tnum"
rounded:
  mark: "8px"
  control: "12px"
  tile: "16px"
  card: "18px"
  sheet: "24px"
  pill: "999px"
spacing:
  hairline: "2px"
  xs: "4px"
  sm: "8px"
  md: "12px"
  lg: "16px"
  card: "20px"
  xl: "24px"
  section: "32px"
components:
  card:
    backgroundColor: "{colors.card}"
    rounded: "{rounded.card}"
    padding: "16px 20px"
  button-ink:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.card}"
    typography: "{typography.control}"
    rounded: "{rounded.control}"
    padding: "0 18px"
    height: "44px"
  button-soft:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    typography: "{typography.control}"
    rounded: "{rounded.control}"
    padding: "0 18px"
    height: "44px"
  button-soft-hover:
    backgroundColor: "{colors.line}"
  pill:
    backgroundColor: "{colors.card}"
    textColor: "{colors.ink}"
    typography: "{typography.control}"
    rounded: "{rounded.pill}"
    padding: "0 16px"
    height: "44px"
  pill-selected:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.card}"
    rounded: "{rounded.pill}"
  day-pill-selected:
    backgroundColor: "{colors.school-bu}"
    textColor: "{colors.card}"
    rounded: "{rounded.pill}"
  field:
    backgroundColor: "{colors.card}"
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
    padding: "0 14px"
    height: "44px"
  school-tile:
    backgroundColor: "{colors.school-bu}"
    textColor: "{colors.card}"
    rounded: "{rounded.tile}"
    size: "56px"
  goal-band:
    backgroundColor: "{colors.school-bu}"
    height: "8px"
  state-chip-open:
    backgroundColor: "{colors.good-soft}"
    textColor: "{colors.good}"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    padding: "4px 10px"
  state-chip-idle:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.muted}"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    padding: "4px 10px"
  diet-tag:
    backgroundColor: "{colors.good-soft}"
    textColor: "{colors.good}"
    typography: "{typography.tag}"
    rounded: "{rounded.pill}"
    padding: "2px 8px"
  notice-alert:
    backgroundColor: "{colors.danger-soft}"
    textColor: "{colors.ink}"
    typography: "{typography.small}"
    rounded: "{rounded.tile}"
    padding: "12px 16px"
  notice-status:
    backgroundColor: "{colors.warn-soft}"
    textColor: "{colors.ink}"
    typography: "{typography.small}"
    rounded: "{rounded.tile}"
    padding: "12px 16px"
---

# Design System: Dining Hall Planner

## Overview

**Creative North Star: "The Meal-Plan Card"**

The app reads like a student ID and a meal-plan card laid on a desk: a calm grey ground, white rounded cards with a soft real shadow, ink text and ink actions. Your goal sits on one card with your school's colour band across its top; each meal is its own card listing exactly what to take, amount first ("1½ cups Confetti Rice"). Numbers go only as deep as you ask: calories by default, protein, carbs and fat behind one switch.

Density is phone-first and quiet. One family (Figtree) carries everything, hierarchy comes from weight and size rather than colour, and every figure is tabular so columns of calories line up. Colour is rationed by meaning: the school colour marks identity only on school pages, green means "open now" and dietary tags, a separate red means something went wrong, and the three macro colours exist only inside the optional breakdown, each beside its name. The system rejects the macro-tracker dashboard (KPI tiles, rings, glyph legends) and the dark brutalist grid the app had before.

The same world works in light and dark: a near-black ground (#0f1114) with raised charcoal cards (#181b20), light ink (#f1f3f5), and every semantic colour retuned for the dark ground. The school colour is recomputed per mode so any school stays legible.

**Key Characteristics:**
- Grey ground, white cards (18px radius, soft two-layer shadow), ink text.
- Figtree Variable as the only family, tabular numbers everywhere.
- School colour only inside school scope: goal-card band, selected day, school tile.
- Amount-first plate rows; calories always, macros on request.
- Ink for the single primary action, soft buttons for repeated per-meal actions, pills for choices.
- 44px minimum targets, ease-out motion, press scale 0.97, reduced motion honoured.

## Colors

A neutral grey-and-ink palette with one borrowed accent (the school's own colour) and small, strictly scoped semantic colours.

### Primary
- **School Colour** (BU Scarlet, `school-bu`): not a site colour but a school's, read from the school record (`data/schools.ts`). It appears only inside a school scope: the 8px band across the goal card, the selected day pill, and the 56px school initials tile (on the home list and the school header). It also tints text selection and the input caret inside that scope. Outside a school scope the school token falls back to ink. Dark mode lightens the colour only until it reaches 3:1 against the dark ground (BU scarlet already does, so it stays as is); text on it is white when white reaches 4.5:1, otherwise ink.

### Neutral
- **Desk Grey** (`ground`): the page. Dark #0f1114.
- **Card White** (`card`): every container, and the text colour on ink fills. Dark #181b20.
- **Soft Surface** (`surface`): soft buttons, idle state chips, opened menu rows, the "ruled out" strip, round icon buttons. Dark #1f2329.
- **Ink** (`ink`): text, primary actions, selected view pills, focus outlines, progress bars, slider fill. Dark #f1f3f5.
- **Muted Slate** (`muted`): secondary text: units ("cal"), station names, hours, card labels, footer. Dark #a0a7b2.
- **Hairline** (`line`): dividers inside cards, pill edges, bar tracks. Dark #2a2e35.
- **Strong Hairline** (`line-strong`): pill hover edge, empty slider track, switch off-state, scrollbar thumb. Dark #3b4049.
- **Field Edge** (`control`): the 1px edge of a text field, 3:1 against the card so it can be found. Dark #7c838e.

### Semantic
- **Error Red** (`danger`, `danger-ink`, `danger-soft`): invalid field ring, error notices, warning text ("Unusual numbers"). Dark #f2554a / #ff8a80 / #3a1917.
- **Open Green** (`good`, `good-soft`): "Open now" chip and its dot, dietary tags. Dark #57c785 / #15291e.
- **Caution Cream** (`warn-soft`): non-error status notices (stale menus). Dark #2e2611.
- **Macro colours** (`protein` cobalt, `carbs` amber, `fat` sage): dots and bars inside the optional breakdown and the goal editor only. Dark #7b93ff / #f0b44f / #8fb07a.

### Named Rules
**The School Scope Rule.** The school colour exists only inside a school scope (goal-card band, selected day, school tile). Everything else, including the logo, stays neutral, so any school fits without redesign.

**The Own Red Rule.** Errors use their own red, never the school colour, so a red (or green) school never reads as a warning.

**The Named Macro Rule.** A protein, carbs or fat colour never appears without its word next to it, and only inside the breakdown the student switched on.

## Typography

**Display Font:** Figtree Variable (with ui-sans-serif, system-ui, -apple-system, Segoe UI)
**Body Font:** Figtree Variable
**Label/Mono Font:** none; labels are Figtree too.

**Character:** One friendly geometric sans in several weights (400 to 700, with 650 for controls). Tabular numbers are set on the body, so every count and calorie aligns.

### Hierarchy
- **Display** (700, 3rem, 3.75rem from sm, line-height 1, tight tracking): the home welcome only.
- **Headline** (700, 1.875rem to 2.25rem from sm, tight): school and hall names at the top of a page.
- **Figure** (700, 2rem): the day's calorie total on the goal card, with its unit in 1rem medium muted.
- **Title** (700, 1.25rem, tight): meal names on meal cards; hall cards use 1.5rem; school names in the home list 1.25rem.
- **Section** (700, 1.125rem): "Pick your school", "Pick your dining hall".
- **Body** (500, 1rem, snug): dish lines. One size for every dish; the amount is bold (700) and the dish name medium (500).
- **Control** (600 pills, 650 buttons, 0.9375rem): pills and buttons.
- **Small** (400, 0.875rem): station lines, hours, notices, per-row calories (figure at 600).
- **Label** (600, 0.75rem): state chips, macro labels, provenance and footer lines (400).
- **Tag** (600, 0.6875rem, 1rem line): diet tags.

### Named Rules
**The Weight Not Size Rule.** Inside a plate, hierarchy is weight: amount bold, name medium, station muted. Dish lines never change size.

**The Tabular Rule.** Every number is tabular (`font-variant-numeric: tabular-nums` on body); no figure is set in proportional digits.

## Layout

A centred column up to 72rem with 16px side gutters (24px from sm). A sticky 64px header carries the logo and the theme toggle on the ground colour. Home is a single narrow column (42rem). The school page lists hall cards in one column, two from sm. The hall page stacks back link, hall name with switcher, day pills (scrolling sideways on phones with the scrollbar hidden), the goal card, the plan/menu switch, and the meal cards; from lg it becomes a 22rem left column (goal card, sticky at 6rem from the top) and the meal cards on the right, with a 32px gap. Cards stack 16px apart; pills sit 8px apart; inside a card, content is inset 20px with 12px plate rows. On a phone the first meal card starts above the fold. Headings balance their lines; paragraphs and list items use pretty wrapping.

## Elevation & Depth

A lifted-card system: one soft, ambient shadow lifts every card off the grey ground; nothing else casts a shadow. Pills, soft buttons and fields draw their edges with inset 1px hairlines rather than borders or shadows. The calculator dialog sits over a 45% near-black backdrop.

### Shadow Vocabulary
- **Card lift** (`box-shadow: 0 1px 2px rgb(22 24 29 / 0.06), 0 6px 20px -10px rgb(22 24 29 / 0.18)`; dark `0 1px 2px rgb(0 0 0 / 0.4), 0 8px 24px -12px rgb(0 0 0 / 0.6)`): every card and the calculator sheet.
- **Hairline edge** (`inset 0 0 0 1px` line / line-strong / control): pills, soft buttons, fields; 2px ink on field focus, 2px danger when invalid.
- **Slider thumb** (`0 0 0 2px ink, 0 2px 6px rgb(0 0 0 / 0.2)`): the range thumb only.

### Named Rules
**The One Lift Rule.** Cards are the only lifted surfaces, and they share one shadow. Don't stack cards inside cards or add a second elevation level.

## Shapes

Soft, friendly rounding that grows with the size of the object: the logo mark at 8px, buttons, fields and plate rows at 12px, notices and the school tile at 16px, cards at 18px, the calculator sheet at 24px (top corners only on a phone, where it rises from the bottom), and full pills for day, view, state and diet chips, the switch and round icon buttons. The logo is a plate: a white disc with a thin hairline ring on an ink rounded square. Icons are thin inline SVG strokes (1.5 to 2px, round caps), drawn in currentColor.

## Components

### Buttons
Calm and solid; the darkest thing on the screen is the thing to press.
- **Shape:** gently rounded (12px), at least 44px tall, 18px side padding, 0.9375rem at 650.
- **Ink (primary):** ink fill, card-coloured text. Used once per context: "Use these numbers" in the calculator (48px, full width), "Try again" on a failed load.
- **Soft (repeated):** surface fill with a hairline edge, ink text. Used for actions that repeat per card or are secondary: "Another option" (with its "1 of 3" count in muted medium), "Edit goal".
- **Compact:** `.button-compact` draws a 36px button (14px text) for secondary spots inside a card ("Edit goal", "Try again"; "Another option" at 40px) and extends its hit area 4px past the edge, so the touch target stays at 44px or more.
- **Hover / Focus:** hover only on devices with a fine pointer (`(hover: hover) and (pointer: fine)`; Tailwind's `hover:` variant is redefined to the same query in index.css): ink mixes 15% toward the card colour, soft goes to the line colour. Focus is a 2px ink outline, offset 2px. Press scales to 0.97 over 120ms ease-out.
- **Text links:** semibold ink with an underline offset 4px ("Set your own", "Bring back", "Official menu").
- **Icon buttons:** 44px round, muted icon, surface on hover ("Not this" ×, close, theme toggle).

### Chips
- **Pills (choices):** card fill, 1px hairline edge (strong on hover), 44px tall, 16px padding, 0.9375rem at 600. Selected view and segmented pills go ink with card text. The selected day pill goes school colour with on-school text; the date beside the weekday is muted when unselected.
- **State chips:** small full pills, 0.75rem semibold. "Open now" is green on soft green with a 6px green dot; "Later today" and "Closed" are muted on surface.
- **Diet tags:** full words (Vegan, Vegetarian, Halal, Gluten free), green on soft green, 0.6875rem semibold. Vegetarian is hidden when Vegan is present.

### Cards / Containers
- **Corner Style:** 18px.
- **Background:** card colour on the grey ground.
- **Shadow Strategy:** Card lift (see Elevation).
- **Border:** none; internal dividers are 1px line (meal-card footer, hall-card hours).
- **Internal Padding:** 20px sides; meal-card header 16px top, footer 12px vertical.
- **Linked cards** (school, hall) press to 0.99 and nudge their arrow 4px right on hover.

### Inputs / Fields
- **Style:** card fill, 1px control-colour inset edge, 12px radius, 44px tall, 14px padding; leading search icon in muted.
- **Focus:** the edge becomes 2px ink.
- **Error:** the edge becomes 2px danger; the message sits in a danger-soft box in danger-ink text. Plans keep the last valid numbers.
- **Switch:** 40 by 24px track, line-strong off, ink on, card-coloured knob, 150ms.
- **Range:** 6px rounded track filled in ink to the thumb over line-strong; 22px card-coloured thumb ringed in ink, growing 1.12x while dragged.

### Navigation
A sticky header with the logo and "Dining Hall Planner" (1.0625rem bold) on the left and a 44px round theme toggle on the right. Pages open with a muted back link with an arrow ("All schools", the school name), 44px tall. The hall name is itself the hall switcher (a native select under the headline, with a chevron). Plan and menu are a two-pill segmented control.

### Goal Card (signature)
The goal card is the student's ID card: an 8px school-colour band across the top, a muted "Your day" label with a soft "Edit goal" button, the calorie figure ("2,174 of 2,200 cal planned") over an ink progress bar on a hairline track, then the "Show protein, carbs & fat" switch. Switched on, a three-column breakdown fades in with each macro's dot, name, figures and coloured bar. Edit opens the four number fields, a macro share bar, and a check that the macros add up to the calorie goal.

### Meal Card (signature)
Header: meal name (title), state chip, hours on the right in muted. Body: amount-first plate rows ("**1½ cups** Rhett's Pumped Up Scramble"), station and diet tags beneath, calories at the right, and a 44px "Not this" ×. Footer, above a hairline: the plate's calories and the soft "Another option" button. Swapping the plate turns it over (`plate-in`: 200ms, ease-out, a 12° tilt from the top edge with a 6px drop and fade).

### Calculator Sheet
A native dialog: on a phone it rises from the bottom (24px top corners, up to 92% of the viewport), on desktop it sits centred, 40rem wide; it enters over 260ms ease-out with a 24px rise. Numbered steps use 28px surface discs.

### Motion
One curve, `cubic-bezier(0.23, 1, 0.32, 1)`, for movement; colours change over 150ms. Press 0.97 (cards 0.99), plate-in 200ms, sheet 260ms, fades 180ms, progress bars 300ms. Under `prefers-reduced-motion: reduce` every animation and transition collapses to 0.01ms.

## Do's and Don'ts

### Do:
- **Do** keep the ground grey (`ground`) and put content on white 18px cards with the single card shadow.
- **Do** use Figtree Variable for every role and keep numbers tabular.
- **Do** apply school colour only through `schoolScope()` and only to the goal-card band, the selected day and the school tile.
- **Do** write plate rows amount-first in real servings, with the amount bold and the dish name medium.
- **Do** show calories by default and keep protein, carbs and fat behind "Show protein, carbs & fat".
- **Do** use one ink button for the single primary action and soft buttons for actions repeated on every card.
- **Do** keep every target at least 44px, gate hover to `(hover: hover) and (pointer: fine)`, press to 0.97, and respect reduced motion.
- **Do** spell diet tags and state chips out in words.

### Don't:
- **Don't** use the school colour for errors, links, buttons or anywhere outside a school scope; errors use `danger`.
- **Don't** show a macro colour without its name beside it, or outside the optional breakdown.
- **Don't** build KPI tiles, progress rings or glyph legends; the goal card's bars are the only meter.
- **Don't** add a second font family or proportional figures.
- **Don't** give the logo a school colour; it stays ink and white.
- **Don't** add a second shadow level, borders around cards, or cards inside cards.

### Known drift (recorded, not canonized)
- The brief planned a 180ms plate flip; the build ships 200ms. The build value is recorded.
