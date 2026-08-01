# Golden Hour Immersive — palette note

This variant did not only restructure the homepage; it also warmed the global
theme tokens in `client/src/index.css`:

| Token | On `dev` | Proposed |
|---|---|---|
| `--color-background` | `hsl(36, 20%, 95%)` | `hsl(34, 26%, 95%)` |
| `--color-background-secondary` | `hsl(36, 20%, 90%)` | `hsl(34, 26%, 90%)` |
| `--color-muted` | `hsl(40 10% 90%)` | `hsl(34 24% 89%)` |

That is a site-wide change. Applying it in the gallery would have repainted the
other five variants too, and there would be no honest comparison left — every
variant would look warmer, and it would be impossible to tell which difference
came from which design.

So the shift is scoped to this variant's page instead: `page.tsx` wraps its
content in `.variant-warm-immersive`, and `index.css` overrides the affected
background utilities beneath that class. A CSS-variable override on the wrapper
would not work, because Tailwind's `@theme inline` substitutes token values
literally rather than emitting `var()` references.

**Caveat when reviewing:** the scoping covers `bg-background`,
`bg-background-secondary`, `bg-card`, and `bg-muted`. Anywhere the warmer cream
would show through a token this override does not name — or through elements
rendered outside the wrapper, such as the cart drawer or cookie banner — you
are still seeing the current palette. Judge the layout here; judge the palette
by flipping the three tokens in `@theme` temporarily.
