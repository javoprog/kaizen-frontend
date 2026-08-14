# Kaizen design system

## Direction

Kaizen is dark, predominantly monochrome, calm, precise, and premium. Editorial headings, restrained atmosphere, goal visualization, and mature progression moments give it personality. Color communicates state or reward; it is not general decoration.

## Foundation

- Tailwind CSS v4 and semantic variables live in `src/index.css`.
- Source-owned shadcn-style primitives live in `src/components/ui` and use Radix where interaction semantics matter.
- Lucide is the icon system. Motion is used for transitions and earned feedback. Recharts and React Flow remain controlled visualization exceptions.
- `components.json` and the `@/` alias are configured for future shadcn additions.

## Tokens and hierarchy

- `background` is the application canvas; `card` groups content; `popover` is elevated; `control-bg` distinguishes form controls.
- Use `foreground`, `muted-foreground`, `border`, `input`, and `ring` rather than page-level literal colors.
- `success`, `warning`, and `destructive` are semantic. `xp` is reserved for XP, achievements, and level-up. `brand` is a quiet atmospheric/selection accent.
- Radii use only small, medium, and large tokens: 6px, 8px, and 12px. Full pills are reserved for compact status and metadata.
- Shadows are restrained and mainly communicate elevation for dialogs, popovers, and major focus surfaces.

## Typography and spacing

Display and page headings may be expressive; section headings are compact; card titles, labels, metadata, and helper text use the shared type scale in `src/index.css`. Preserve generous page rhythm while keeping application controls dense and readable. Do not invent one-off type sizes or spacing to make a single card special.

## Standard controls

- `Button`: `primary/default`, `secondary`, `ghost`, `destructive`, and `destructive-ghost`; sizes are default, small, large, and icon.
- `Input`, `Textarea`, and `Select`: the same neutral control surface, border, focus ring, disabled treatment, label, and helper text everywhere.
- `Tabs`: segmented on compact switchers; underline navigation for workspace sections through the documented `secondary` composition.
- `Dialog`: elevated popover surface, dimmed backdrop, constrained sizes, close affordance, focus trapping, and responsive padding.
- `Card`: one restrained base surface. Feature classes may arrange Card content but must not redefine the primitive control system.
- `Progress`, `Alert`, `Disclosure`, and `Tooltip`: reuse their primitives; extend variants at the source when a repeated need appears.

## Navigation and composition

Desktop uses a persistent sidebar; mobile uses a compact top bar and bottom navigation. Active navigation is quiet and distinct. Cards represent meaningful entities or grouped decisions. Avoid nesting cards solely to create visual interest.

## State, reward, and motion

Completed uses success, risk uses warning, failure uses destructive, and current/selected is mainly neutral contrast with restrained brand support. XP and achievements use warm gold. Motion should explain a transition, completion, XP gain, level-up, achievement, or meaningful progress change. Respect `prefers-reduced-motion`.

## Responsive and accessible behavior

Design from 320px upward. No page-level horizontal overflow; intentional canvases may pan internally. Dialogs must fit the viewport, tabs may scroll within their own row, touch targets stay usable, and the mobile nav must not obscure reachable content. Every control needs a visible label or accessible name, keyboard operation, visible focus, and correct disabled/loading state.

## Do not

- Add arbitrary product colors in page JSX or create gradient controls/cards as a default pattern.
- Patch a standard control with selectors such as `.habit-modal input` or `.coach textarea`.
- Use `!important`, undocumented library slots, arbitrary radii, or a second component system.
- Animate ordinary hover states heavily, turn every surface into a card, or make every control a pill.
