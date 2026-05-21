# Fix Backend Connectivity and API Fallback Toggling

This plan outlines the changes required to resolve data fetching failures and WebSocket connection issues on both the mobile application (EAS Android APK preview build) and the Next.js web dashboard.

## User Review Required

> [!IMPORTANT]
> - **Production Backend URL**: The changes hardcode `https://hackathon-2026-production-ff6c.up.railway.app` as the default backend for production preview builds of the mobile app to bypass cleartext HTTP (`http://`) blocks on Android devices.
> - **CORS Updates**: We are updating the backend to dynamic-echo origin headers using `allow_origin_regex` to support credentials (`allow_credentials=True`) on multi-domain environments (e.g., Vercel previews).

## Open Questions

> [!NOTE]
> - Are there any other environments or domains (besides local development and Vercel production) that need explicit exclusions in the CORS setup, or is the wildcard regex `https?://.*` fully acceptable?

---

## Proposed Changes

### Backend Component

#### [MODIFY] [main.py](file:///c:/Users/hp/OneDrive/Desktop/Hackathon%20AISeekho/backend/app/main.py)
- Filter out wildcard `*` from `allow_origins` when `allow_credentials=True`.
- Use `allow_origin_regex="https?://.*"` to dynamic-echo the requester's origin, resolving credentials-based CORS blocks in modern browsers.

#### [MODIFY] [incidents.py](file:///c:/Users/hp/OneDrive/Desktop/Hackathon%20AISeekho/backend/app/api/api_v1/endpoints/incidents.py)
- Change path parameter `incident_id: UUID` to `incident_id: str`.
- Validate/convert `incident_id` inside route logic to UUID. If conversion fails, return a standard 404 (Not Found) error rather than a 422 (Unprocessable Content) path parameter validation error, letting frontends fall back cleanly when mock incident IDs (e.g. `inc-jauhar`) are clicked.

#### [MODIFY] [simulation.py](file:///c:/Users/hp/OneDrive/Desktop/Hackathon%20AISeekho/backend/app/api/api_v1/endpoints/simulation.py)
- Update `incident_id: uuid.UUID` path parameters to `incident_id: str` and apply the same `try-except` UUID conversion check.

---

### Web Frontend Component

#### [MODIFY] [api.ts](file:///c:/Users/hp/OneDrive/Desktop/Hackathon%20AISeekho/web_frontend/lib/api.ts)
- Update the concurrency fallback logic in `makeRequest`.
- Capture the `currentBaseUrl` before making the fetch call.
- Only switch `API_BASE_URL` globally if the current global URL still matches the URL that failed. This prevents concurrent requests from creating an endless toggle race condition loop.

---

### Mobile Frontend Component

#### [MODIFY] [config.ts](file:///c:/Users/hp/OneDrive/Desktop/Hackathon%20AISeekho/frontend/constants/config.ts)
- Use a `__DEV__` switch for `API_BASE_URL` and `WS_BASE_URL`.
- During development, dynamically resolve Metro host machine IP. In production/preview builds (`__DEV__` is false), default directly to the HTTPS production Railway URL and secure WSS WebSocket server.

#### [MODIFY] [api.ts](file:///c:/Users/hp/OneDrive/Desktop/Hackathon%20AISeekho/frontend/lib/api.ts)
- Implement the same concurrent-safe fallback correction in `makeRequest`.
- Add an `api.getActiveWsUrl(path)` utility function that replaces `http` with `ws` on the active API URL dynamically so that WebSocket streams update their target protocol and host when the backend falls back.

#### [MODIFY] [LiveLogStream.tsx](file:///c:/Users/hp/OneDrive/Desktop/Hackathon%20AISeekho/frontend/components/LiveLogStream.tsx)
- Retrieve the WebSocket connection URL dynamically using `api.getActiveWsUrl`.

#### [MODIFY] [map.tsx](file:///c:/Users/hp/OneDrive/Desktop/Hackathon%20AISeekho/frontend/app/map.tsx)
- Retrieve the global stream WebSocket connection URL dynamically using `api.getActiveWsUrl`.

#### [MODIFY] [map.web.tsx](file:///c:/Users/hp/OneDrive/Desktop/Hackathon%20AISeekho/frontend/app/map.web.tsx)
- Retrieve the global stream WebSocket connection URL dynamically using `api.getActiveWsUrl`.

#### [MODIFY] [simulation.tsx](file:///c:/Users/hp/OneDrive/Desktop/Hackathon%20AISeekho/frontend/app/simulation.tsx)
- Retrieve the simulation stream WebSocket connection URL dynamically using `api.getActiveWsUrl`.

---

## Verification Plan

### Automated Tests
- Run `npx tsc --skipLibCheck` inside the `frontend` folder to compile the modified TypeScript files.
- Compile `frontend/lib/api.ts` to `frontend/lib/api.js` using `npx tsc --skipLibCheck` or verify JS is up to date.

### Manual Verification
- Test local Web Dashboard behavior: verify it connects to the production Railway backend when the local FastAPI server is offline, without entering a toggling loop.
- Push changes to trigger the Railway backend deployment, then run EAS preview build:
  `eas build -p android --profile preview`
- Verify the generated APK correctly fetches active incidents and establishes live WebSocket streaming on launch.
