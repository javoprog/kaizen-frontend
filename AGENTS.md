# Kaizen frontend rules

All frontend work must follow [`docs/DESIGN_SYSTEM.md`](docs/DESIGN_SYSTEM.md).

- Put UX, clarity, and accessibility before decoration.
- Prefer system consistency over local novelty.
- Reuse the source-owned primitives in `src/components/ui` before creating a control.
- Fix shared controls at the primitive or token level; do not restyle inputs, buttons, tabs, selects, or dialogs per page.
- Use semantic Tailwind tokens for normal product colors. Keep literal colors inside the centralized theme or a controlled visualization.
- Do not depend on undocumented third-party DOM or internal selectors.
- Do not add a second UI component library. Radix-backed shadcn primitives are canonical.
- Preserve responsive behavior, keyboard use, focus visibility, labels, and reduced-motion support.
- Cards group real entities or concepts; whitespace and typography should do most layout work.
- Keep Motion purposeful: state, progress, and reward—not ordinary control decoration.
