# Implementation Plan - Events Panel and CTECC Panel Integration

We will build the `EventsPanel.tsx` and `CTECCPanel.tsx` components to display detailed emergency incidents and multi-department dispatch statuses on the Kemetra dashboard.

## User Review Required

> [!IMPORTANT]
> - We will create [EventsPanel.tsx](file:///c:/Users/HP/Desktop/hackathon/Hackathon-2026/web_frontend/components/dashboard/EventsPanel.tsx) to showcase detailed accident records.
> - We will create [CTECCPanel.tsx](file:///c:/Users/HP/Desktop/hackathon/Hackathon-2026/web_frontend/components/dashboard/CTECCPanel.tsx) to capture multi-department emergency responder dispatch statuses.
> - We will modify [page.tsx](file:///c:/Users/HP/Desktop/hackathon/Hackathon-2026/web_frontend/app/dashboard/page.tsx) to present both panels at the bottom inside a responsive grid layout container.

## Proposed Changes

### Dashboard Components Layer

#### [NEW] [EventsPanel.tsx](file:///c:/Users/HP/Desktop/hackathon/Hackathon-2026/web_frontend/components/dashboard/EventsPanel.tsx)
- Outermost wrapper card with `bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden`.
- Header: Alert icon, title `"Events"`, details (Camera, Settings, Bookmark, Update times, Event ID).
- Body:
  - Accident alert title, 5-dot urgency rating indicator (4 orange, 1 gray).
  - 2-Column responsive grid:
    - Left column: Detailed textual log of the lane obstruction incident.
    - Right column: Bullet list of key telemetry properties styled with green (#16a34a) and gray (#374151) value states.

#### [NEW] [CTECCPanel.tsx](file:///c:/Users/HP/Desktop/hackathon/Hackathon-2026/web_frontend/components/dashboard/CTECCPanel.tsx)
- Outermost wrapper card with same styling.
- Header: Bell icon, title `"CTECC"`, and associated action controls.
- Body: Status list showing 6 distinct department levels (Medical, Police, Fire, Water, Transport, V2X) with custom colored badge states (In Progress, Dispatched, Notified, Triggered).

#### [MODIFY] [page.tsx](file:///c:/Users/HP/Desktop/hackathon/Hackathon-2026/web_frontend/app/dashboard/page.tsx)
- Embed `<EventsPanel />` and `<CTECCPanel />` in a responsive `grid grid-cols-1 lg:grid-cols-2 gap-4 pb-4` right below the `<TrafficInsights />` container.

## Verification Plan

### Automated Verification
- Verify successful compilation and formatting.
