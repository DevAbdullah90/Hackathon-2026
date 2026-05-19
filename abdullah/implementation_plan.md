# Implementation Plan - Interactive Real-Time Sonar Danger Alerts

This plan introduces a high-end, tactile in-app notification alerts system to both the Web Dashboard and the Mobile App. When a new crisis incident is confirmed in the backend, the user will be instantly notified with a pulsing emergency banner, sound effects, and interactive deep-link navigation.

---

## User Review Required

> [!IMPORTANT]
> The alerts will utilize a high-end, synthetically generated computer sonar chime using the **HTML5 Web Audio API** on the web dashboard. This provides a zero-dependency, ultra-immersive sound effect that is highly robust and performs perfectly without loading large audio files over the network.

---

## Proposed Changes

### 1. Web Dashboard (Next.js)
#### [MODIFY] [page.tsx](file:///c:/Users/hp/OneDrive/Desktop/Hackathon%20AISeekho/web_frontend/app/dashboard/page.tsx)
- Integrate a global active incident tracker that polls the API every 3 seconds.
- Create a `seenIncidentIds` system to detect newly added incidents.
- Build a gorgeous **Tactical Sonar Toast** UI overlay with glassmorphic styles, custom neon colors, red warning icons, and pulsing animation.
- Implement a pure **Web Audio API Synth** that plays a retro-tactical sonar chime when a notification is triggered.
- Connect the **[LOCATE HAZARD]** button to select the incident, focus the Google Map, and trigger the Swarm progress tracking.

---

### 2. Mobile App (Expo / React Native)
#### [MODIFY] [index.tsx](file:///c:/Users/hp/OneDrive/Desktop/Hackathon%20AISeekho/frontend/app/index.tsx)
- Add a new incident detection trigger inside the `fetchIncidents` polling hook.
- Implement a beautiful neon float toast banner sliding from the top of the mobile screen.
- Provide a pulsing **Emergency Warning Badge** with a flashing danger border.
- Wire the **[ENGAGE UNIT]** action to navigate the user immediately to `Reasoning` or `Map` to visualize the crisis details in real-time.

---

## Verification Plan

### Automated & Manual Verification
- **Web Verification**: 
  - Inject a mock signal on the dashboard using the "Trigger Simulated Crisis" button.
  - Verify that when the pipeline finishes and registers a new active incident, a high-severity red alert toast drops down.
  - Verify that a tactical cyber-beep audio chime is played.
  - Click **LOCATE HAZARD** and confirm the map centers on the new Karachi incident coordinates.
- **Mobile Verification**:
  - Open the mobile index.tsx interface.
  - Trigger a mock signal.
  - Verify a gorgeous warning toast drops down showing active hazard status for Gulistan-e-Jauhar Block 18.
