# FURR Owner Design System

## Visual World

Modern care companion. The product should feel reassuring and current: soft mineral surfaces, a deep green-teal action color, generous whitespace, and intimate pet imagery. It is warm without becoming childish, and clear without looking clinical.

## Mode

Operate. The UI exists to help owners complete short, important care tasks with confidence.

## Tokens

- Canvas: misted cool green, with white elevated surfaces.
- Accent: teal for actions, selection, and trusted states. Coral is reserved for supportive warmth and never replaces semantic error colors.
- Corners: 12px for inputs and controls, 16px for panels, 24px for signature surfaces, full-pill only for compact circular actions.
- Type: native sans with strong, compact headings and relaxed 13-15px supporting text.
- Elevation: one soft teal-tinted shadow for raised task surfaces. Flat tinted blocks do not also receive borders and shadows.
- Spacing: 4px and 8px increments only. Related text sits close; unrelated content steps out by at least 24px.

## Composition

- Top-level screens open with a direct title and one useful line of context.
- Today combines an image-led health-home moment with one dominant care action.
- Content groups are separated by whitespace, not repeated card outlines.
- Bottom navigation is compact, familiar, and consistent across platforms.

## Interaction

- Tap feedback is a short scale/opacity response.
- Buttons and navigation meet platform-sized touch targets.
- Every action names its result. Empty states teach the next meaningful step.
- The completion moment is the emotional peak: a care action resolves into an affirmative summary, then the screen ends with a gentle next-record prompt.

## Constraints

- Preserve routes, data contracts, form fields, and existing Firebase interactions.
- Use the existing Ionicons family rather than decorative glyphs.
- Avoid decorative motion, custom platform controls, and non-semantic status color.
