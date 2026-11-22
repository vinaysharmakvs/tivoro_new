# Scroll and navigation responsiveness

The project reel previously interpolated toward the scroll position over repeated frames while running a Three.js image deformation and per-card perspective effects. It now maps native page scrolling directly to one translated track in a single scheduled frame. The homepage no longer requests the Three.js runtime or project-flow bundle (614,392 bytes of JavaScript removed from the active page).

The previous page transition waited 520 ms before starting navigation, then covered the destination for a 760 ms reveal. Links now retain their default navigation action. A 220 ms arrival animation runs on the visible hero content after the destination is ready. Document snapshot transitions are disabled for compatibility with hosted preview controls. No canvas cover or pending-page curtain remains. Primary destinations are prefetched at idle or on intent, respecting Save-Data. Public links use canonical routes to avoid the .html redirect.

The approved logo, seven business pages, five-project pinned reel, mobile controls and reduced-motion behavior remain. The older ThreeUI reference files and build output are retained for provenance but are not requested by the homepage.

Browser checks: desktop and mobile track positions matched the native scroll offset within 0.001 CSS px in the sampled scroll observations; zero canvases on the homepage; native page changes completed with no covering overlay; hero arrival animation configured at 0.22 s; no console errors. These are interaction checks, not an FPS benchmark on the user's hardware.

## Softer motion follow-up

The reel now uses 1.3 times native scroll travel, reducing visual speed by about 23%. Desktop wheel motion has a 60ms damping constant, a 48px maximum lead/lag and a 200ms settling window; touch retains native inertia. Only the one track transform animates. Hero entrances use 720ms, supporting copy 600ms and page arrival 420ms with a gentler easing curve. Navigation still starts immediately with no cover or exit delay. Reduced motion still disables the pinned scene and arrival effects.
