# Pages

This folder will contain route-level screen components.

Current migration plan:

- Keep existing screens in `src/components` until each route is moved safely.
- Move one page at a time into this folder.
- Update `src/App.jsx` only when a moved page needs a new import path.
- Keep reusable UI pieces in `src/components`.

This keeps the app working during the refactor while slowly separating pages
from shared components.
