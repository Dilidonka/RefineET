# UX Guidelines — EffectiveTours Hotel Management Dashboard

## Sources
- [PMS UX Explained — Hospitality Net](https://www.hospitalitynet.org/opinion/4127256.html)
- [Cloudbeds PMS UX Report](https://www.cloudbeds.com/hotel-pms-ux/)
- [rezStream — 14 Things Your Hotel Tape Chart Should Do](https://www.rezstream.com/blog/14-things-your-hotel-tape-chart-should-do/)
- [WebRezPro — Interactive Tape Chart](https://webrezpro.com/getting-know-webrezpro-interactive-tape-chart/)
- [Pencil & Paper — Data Table Design UX Patterns](https://www.pencilandpaper.io/articles/ux-pattern-analysis-enterprise-data-tables)
- [Pencil & Paper — Drag & Drop UX](https://www.pencilandpaper.io/articles/ux-pattern-drag-and-drop)
- [Smart Interface Design Patterns — Drag-and-Drop UX](https://smart-interface-design-patterns.com/articles/drag-and-drop-ux/)
- [Andrew Coyle — UI Considerations for Large Data Tables](https://coyleandrew.medium.com/ui-considerations-for-designing-large-data-tables-aa6c1ea93797)

---

## 1. Tape Chart (Reservation Grid)

### 1.1 Sticky Headers & Frozen Columns
- Always freeze the first column (room number/name) so users never lose row context while scrolling horizontally.
- Sticky date headers must remain visible during vertical scroll.
- Use a subtle shadow on the frozen column/row edge to indicate scroll depth.

### 1.2 Color Coding
- Use a limited, purposeful color palette (max 5-6 colors) for reservation statuses.
- Reserve bright/saturated colors (red, amber) for actionable states.
- Keep the base grid neutral (white/light grey).
- Provide a color legend that is always accessible.

### 1.3 Drag-and-Drop
- Dragged reservations must show a ghost/shadow at the original position and an elevated card following the cursor.
- Use snap-to-grid behavior — reservations align to room rows and date columns.
- Show drop zone highlighting — valid targets light up green; invalid show red/disabled.
- Animate the drop (100ms ease).
- Provide keyboard alternatives: Space to grab, Arrow keys to move, Space to drop.

### 1.4 Information Density
- Show guest last name + nights on the reservation bar.
- Full details via click/hover popup (progressive disclosure).
- Support condensed vs. comfortable view toggle.

### 1.5 Interaction Patterns
- Click empty cell to create a new reservation.
- Click existing reservation to open detail drawer/modal.
- Support multi-select for bulk operations on group bookings.

---

## 2. Rate & Inventory Matrix (Spreadsheet Grid)

### 2.1 Grid Structure
- Use full grid lines (horizontal + vertical) for dense data matrices.
- Use zebra striping on alternating rows.
- Minimum cell padding: 8px horizontal, 4px vertical.

### 2.2 Sticky Elements
- Freeze the rate name column during horizontal scroll.
- Sticky date row header during vertical scroll.

### 2.3 Inline Editing
- Cells become editable on click — show subtle border/highlight on hover.
- Tab key advances to the next cell.
- Batch save — accumulate changes and show a floating "Save Changes" action bar.
- Highlight dirty cells with a colored indicator.

### 2.4 Buy vs. Sell Price Visibility
- For distributor company types: hide _buy columns entirely.
- For direct company types: show both buy and sell with visual grouping.

### 2.5 Bulk Operations
- Support range selection for bulk edits.
- Provide a bulk edit toolbar.
- Show confirmation summary before applying bulk changes.

---

## 3. Global Application UX

### 3.1 Hotel Selector
- Place the active hotel selector prominently in the header.
- Show current hotel name clearly; use a dropdown with search.
- When switching hotels, show a brief loading state.

### 3.2 Navigation & Layout
- Use a left sidebar for primary navigation.
- Keep the sidebar collapsible.
- Use breadcrumbs for location context.

### 3.3 Performance & Feedback
- Implement virtualized scrolling for large data sets.
- Show skeleton loaders during data fetches, never blank screens.
- Toast notifications for async operations.

### 3.4 Accessibility
- Minimum contrast ratio: 4.5:1 for all text.
- All interactive elements must be keyboard navigable.
- Drag-and-drop must have keyboard alternatives.

### 3.5 Error Handling
- Inline validation errors next to the affected field.
- For API errors (422), map server errors to specific form fields.
- Network errors: show a retry banner.

---

## 4. Common Pitfalls to Avoid

| Pitfall | Mitigation |
|---|---|
| No sticky headers on tape chart | Always freeze room column + date row |
| Rainbow color scheme for statuses | Limit to 5-6 purposeful colors |
| Auto-save on every cell edit | Batch changes with explicit save action |
| Showing buy prices to distributors | Conditionally hide based on company type |
| No loading states during hotel switch | Always show transition indicator |
| Tiny click targets on grid cells | Minimum 32px touch target |
| No undo for drag-and-drop | Implement undo/snackbar after moves |
| Overloading the tape chart with data | Progressive disclosure via hover/click popups |
