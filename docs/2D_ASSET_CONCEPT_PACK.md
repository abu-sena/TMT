# TMT 2D Asset Concept Pack

## Visual direction

Use a cheerful, polished 2D mobile-game style with rounded silhouettes and soft bevels. The shared palette is cobalt and sky blue for frames, warm cream for panels, emerald for primary actions, coral for close or cancel actions, and marigold gold for rewards. Keep labels and live values in the app UI so they remain readable, localizable, and accessible.

## Generated concepts

| Asset | Intended role | Notes |
|---|---|---|
| `public/assets/2d/concepts/tmt-ui-sprite-atlas-v1.png` | Original UI component atlas | Retained as the first concept. Its child portraits are superseded by the faceless shinobi portraits in v2. |
| `public/assets/2d/concepts/tmt-ui-sprite-atlas-v2.png` | Updated UI atlas with replacement profile portraits | Transparent 1254 × 1254 PNG. The rest of the atlas keeps the same panel, buttons, reward tiles, icons, and medals. Crop individual elements before production use. |
| `public/assets/2d/concepts/tmt-avatar-icons-v2.png` | Source art for the in-game profile avatars | Transparent 1536 × 1024 PNG: three boys and three girls; all girls wear hijab. Faces are intentionally featureless. The game uses an optimized WebP derivative at `public/assets/2d/concepts/tmt-avatar-icons-v2.webp` and crops each sprite with CSS. |
| `public/assets/2d/concepts/tmt-forest-map-bg-v1.png` | Portrait forest-and-river map background | 1054 × 1493 PNG. The winding path leaves room for level nodes rendered by the app; no labels or controls are baked in. |
| `public/assets/2d/concepts/tmt-level-complete-modal-v1.png` | Level-complete reward popup illustration | Transparent 1024 × 1536 PNG with blank title, reward, and button areas for real UI text and controls. Introduces an original red-panda guide as concept art. |

## Integration direction

- Use the map art as a background layer in the adventure map while keeping stage nodes, progress, and navigation as interactive React elements.
- Use the popup art as decorative framing in the result or reward screen; render the title, score, reward amount, and actions as accessible app controls.
- Slice the atlas into individual image files or CSS-ready pieces before shipping. Avoid scaling the full atlas as one screen image.
- Use `tmt-avatar-icons-v2.png` as the source for profile choices; it provides six portraits with blank faces and hijab on every girl character. Keep its row-major mapping stable: blue boy, teal-hijab girl, green boy, pink-hijab girl, orange boy, dark-green-hijab girl. The app serves a compressed WebP derivative and selects cells from the 3-column by 2-row sheet with CSS background positioning.
- Treat the red-panda guide as a visual proposal. Decide whether it becomes a recurring TMT character or is replaced with an established story companion before using it throughout the game.
- The avatar sheet is integrated into profile selection, profile cards, map markers, and player surfaces. Other files in this pack remain concept assets; existing gameplay screens have not yet adopted those other concepts.
