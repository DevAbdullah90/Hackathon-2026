# TypeScript Best Practices for BloodLink State Management

## DO
- **Strict typing everywhere** – enable `strict` in `tsconfig.json`.
- **Define interfaces in the `types/` folder** and import them – prevents duplication.
- **Use union types** (`BloodGroup`, `RequestStatus`) instead of plain strings.
- **Reset all stores on logout** via `useLogoutAllStores` – avoids data leakage.
- **Leverage TanStack Query** for every server‑side data fetch; never store raw API responses in Zustand.
- **Never use `any`** – prefer `unknown` or `Record<string, unknown>` when absolutely necessary.

## DON'T
- **Store server data in Zustand** – it should only hold UI selections, flags, temporary UI state.
- **Duplicate types** across files – keep a single source of truth in `types/`.
- **Mutate state directly** – always use actions defined in the store.
- **Store sensitive information** (e.g., auth tokens) in client‑side stores.

## TypeScript Tips
- `create<StoreType>()` requires the generic to enforce shape.
- Actions belong on the store interface – they get type‑checked.
- Use `Partial<T>` for optional overrides in tests.
- Prefer `Record<string, unknown>` over `any` for loosely‑typed payloads.

## BloodLink Specific
- **Emergency mode** lives only in `globalStore` – triggers UI red theme `#DC2626`.
- **Language setting** (`en` / `ur`) toggles RTL support for Urdu.
- **Map markers** are always derived from `donorStore` → never stored separately.
- **Unread notification count** drives badge numbers; ensure it never goes negative.
