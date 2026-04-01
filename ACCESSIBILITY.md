# ♿ Accessibility Guidelines — Constellation

This document lists the accessibility rules to follow across the entire Constellation project.
They apply to all React components created in `client/src/`.

---

## 1. `aria-label` Attributes

Any interactive element whose label is not explicit in the DOM must have an `aria-label`.

```tsx
// ❌ Avoid
<button onClick={handleClose}>✕</button>

// ✅ Correct
<button aria-label="Close window" onClick={handleClose}>✕</button>
```

**Rules:**
- Icons without visible text must always have an `aria-label`.
- Links with generic text ("See more", "Click here") must be enriched: `aria-label="Learn more about the Amazon project"`.
- Use `aria-labelledby` when an existing heading element can serve that role.

---

## 2. `alt` Attribute on Images

Every `<img>` tag must have an `alt` attribute.

```tsx
// ❌ Avoid
<img src="/project-amazon.jpg" />

// ✅ Informative image
<img src="/project-amazon.jpg" alt="Amazon rainforest at sunrise" />

// ✅ Decorative image (do not describe it)
<img src="/decoration-star.svg" alt="" aria-hidden="true" />
```

**Rules:**
- **Informative** image → describe the image content in one sentence.
- **Decorative** image → `alt=""` + `aria-hidden="true"`.
- Never omit the `alt` attribute (even if empty).

---

## 3. WCAG AA Contrast Ratios

All text/background color combinations must meet the minimum ratios for **WCAG AA** level:

| Text type | Minimum ratio |
|-----------|---------------|
| Normal text (< 18px) | 4.5 : 1 |
| Large text (≥ 18px or ≥ 14px bold) | 3 : 1 |
| UI components (buttons, inputs) | 3 : 1 |

**Recommended tools:**
- [Colour Contrast Analyser](https://www.tpgi.com/color-contrast-checker/) (desktop app)
- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/) (online)
- VS Code extension: *axe Accessibility Linter*

**Rule:** Every CSS color variable defined in `index.css` must be verified with one of these tools before being used in production.

---

## 4. Keyboard Navigation

The entire site must be fully usable with a keyboard only.

**Keys involved:**
- `Tab` / `Shift+Tab` → move between interactive elements
- `Enter` / `Space` → activate a button or link
- `Escape` → close a modal or dropdown menu
- `Arrow keys` → navigate inside select, menu, or carousel components

**Rules:**
- Never remove the **visible focus** (`outline`). If the default style is unappealing, replace it with a custom style — do not hide it.
- **Modals** must implement a **focus trap**: focus must not leave the modal while it is open.
- Tab order must follow the visual order of the page.
- Any custom component (dropdown, accordion, tabs) must reproduce the expected keyboard behavior per the [ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/).

```css
/* ❌ Never do this */
*:focus {
  outline: none;
}

/* ✅ Acceptable custom focus style */
*:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 3px;
}
```

---

## 5. Form Labels

Every form field must be associated with a visible and programmatic label.

```tsx
// ❌ Avoid
<input type="email" placeholder="Your email" />

// ✅ Correct
<label htmlFor="email">Email address</label>
<input
  id="email"
  type="email"
  aria-describedby="email-error"
  placeholder="example@mail.com"
/>
<span id="email-error" role="alert">
  {error && error}
</span>
```

**Rules:**
- Every `<input>`, `<select>`, and `<textarea>` must have a `<label>` with a `htmlFor` matching the field's `id`.
- The `placeholder` is **not** a substitute for a label (it disappears on input).
- Error messages must be linked to the field via `aria-describedby` and have a `role="alert"` to be announced by screen readers.
- Required fields must be indicated both visually **and** with `aria-required="true"` (or the native `required` attribute).

---

## Resources

- [WCAG 2.1](https://www.w3.org/TR/WCAG21/)
- [RGAA 4.1 (FR)](https://www.numerique.gouv.fr/publications/rgaa-accessibilite/)
- [ARIA Authoring Practices Guide](https://www.w3.org/WAI/ARIA/apg/)
- [axe DevTools](https://www.deque.com/axe/devtools/) — automated audit