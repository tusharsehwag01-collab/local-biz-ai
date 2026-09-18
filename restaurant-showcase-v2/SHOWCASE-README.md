# Restaurant Showcase V2 — review and opening guide

Date: 2026-09-18

## Open the gallery

Local gallery:

`http://127.0.0.1:8877/index.html`

Direct pages:

- `http://127.0.0.1:8877/quiet-editorial.html`
- `http://127.0.0.1:8877/night-market.html`
- `http://127.0.0.1:8877/garden-table.html`

The pages are fictional design studies. They contain sample content, no live restaurant services, no real prices, no real phone numbers or addresses, and no real ordering or reservation handoff.

## New review

### Quiet Editorial

Best for a premium, intimate, history-led or chef-led identity.

Strong points:

- Strongest editorial overlap and asymmetrical composition.
- Clear serif/sans contrast and restrained terracotta palette.
- Feels authored rather than like a reskinned template.
- Menu, practical information, and sample request paths remain reachable.

Watch-outs:

- The vertical decorative cue is not immediately functional or understandable.
- Small labels and repeated sample notices need careful mobile sizing.
- A real client would need approved photography and verified story content.

### Night Market

Best for energetic takeout, fusion, market, late-night, or social dining brands.

Strong points:

- Most visibly different structure: poster-like hero, tilted card, ticker, and menu board.
- Strong color jobs: lime marks activity, orange marks warmth, indigo holds the system together.
- Menu appears early and filters work without pretending to be a checkout.
- The slogan and dish naming give the concept a specific voice.

Watch-outs:

- The action strip looks very functional, so preview-only status should stay visible near it.
- Large typography and the six-action row need real-device checks for a production client.
- AI-generated imagery is appropriate only as clearly disclosed concept art.

### Garden Table

Best for neighbourhood, family, community, vegetarian, or everyday gathering brands.

Strong points:

- Calmest and most welcoming direction.
- Organic image crop, rounded panels, sage, forest green, and plum create a coherent identity.
- Human copy such as “Tear, dip, pass along” feels warmer than generic marketing language.
- Accordion menu and group/catering path add useful variation without clutter.

Watch-outs:

- The long editorial scroll could bury practical information on a live site.
- Hero actions should be simplified or consistently marked as sample actions.
- Small uppercase labels, rules, and disclaimers need contrast and size checks.

## Verdict

The new set is materially better than the first three as a design study because the pages now differ in structure, not only in colour and typography:

- Quiet Editorial = asymmetrical magazine spread.
- Night Market = high-energy market board.
- Garden Table = organic neighbourhood composition.

Garden Table is the safest default for most Ottawa neighbourhood businesses. Night Market is the strongest sales demo for a bold restaurant. Quiet Editorial is the strongest premium/brand-story direction.

For a real client, keep the practical backbone: menu or services, hours, call, directions, ordering, reservations, and catering must remain easy to reach. Treat story, texture, and asymmetry as client-specific layers, never as a new universal template.

## Verification

- Static checker: PASS — 132 checks.
- Browser checker: PASS — all four pages at 1440px and 375px.
- Keyboard focus, dialogs, accordions, Night Market filters, reduced motion, no-JavaScript fallbacks, local links, image loading, and overflow: PASS.
- Existing `restaurant-showcase/` files were left unchanged.
