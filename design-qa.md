# Owner app — calm clinical editorial QA

## Comparison target

- Source visual truth: `docs/design/owner-calm-clinical-editorial-reference.png`
- Implementation: `docs/qa/owner-today-calm-editorial.png`
- Combined comparison: `docs/qa/owner-today-calm-editorial-comparison.png` (source left, implementation right)
- Viewport: 390 x 844 CSS px, mobile web preview, device scale factor 1
- Source pixels: 853 x 1844; normalized with centered `ImageOps.fit` to 390 x 844 for comparison
- Implementation pixels: 390 x 844
- State: signed-in Owner, Max selected, one Omega-3 dose pending, light theme

## Comparison history

1. Initial capture found a P2 layout issue: the Expo tab header duplicated the app’s own brand heading and pushed the dose CTA below the phone viewport. The care card also used deprecated web shadow props.
2. Fixed the issue by removing tab headers, reducing the hero and media proportions, tightening care-card rhythm, and using borders rather than deprecated shadow props.
3. Post-fix evidence is `docs/qa/owner-today-calm-editorial.png`. The primary action and bottom navigation are visible together in the 390 x 844 capture.

## Findings

No actionable P0, P1, or P2 findings remain.

### Required fidelity surfaces

- **Fonts and typography:** The implementation uses a strong native sans hierarchy with heavy display weights, compact all-caps labels, and clear body sizes. It intentionally uses the platform system font rather than the mock’s rendered typeface, while preserving its editorial scale and wrapping.
- **Spacing and layout rhythm:** The hero, care module, and tab bar follow the selected direction’s generous vertical flow. The final view keeps the decisive care CTA above the tab bar without crowding.
- **Colors and visual tokens:** Pearl canvas, deep teal action color, mint verification state, warm editorial photography, and restrained orange notification accents are consistently tokenized in `packages/ui`.
- **Image quality and asset fidelity:** Max, Luna, and the Omega-3 visual are generated editorial raster assets saved in `apps/furr-owner/assets/furr/`; they replace text/avatar placeholders and match the selected direction’s soft clinical art direction.
- **Copy and content:** Copy remains specific to Max’s real demo care context: current vaccination record, 8:00 PM Omega-3 dose, verification state, and timeline activity.

## Interaction checks

- Native tab navigation: Today, Pets, and Care routes opened correctly.
- Primary task: “Mark dose as given” changed to “Recorded for Max.”
- Browser console: no errors observed. The current log buffer retained two earlier deprecated-shadow warnings from before the fix; no new warning was emitted after the refined route loaded.

## Follow-up polish

- P3: Once the production brand font license/name is finalized, load it through `expo-font` to replace the native system fallback.
- P3: Add an owner avatar/photo only after profile-photo consent and upload rules are implemented.

final result: passed
