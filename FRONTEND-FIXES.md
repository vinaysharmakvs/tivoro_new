# Front-end review fixes

This pass follows the 19 October audit and the user's follow-up instruction to deliver the front end only. The Site remains static and public. No database, inbox, email provider, account allowlist or tracking provider was configured.

## Delivered

- Responsive WebP versions of the large backdrop and founder photos, image dimensions, async decoding and appropriate lazy loading. The 1920px backdrop is 147,150 bytes; the three 960px portraits total 160,532 bytes (originals: 2,191,678 and 5,286,312 bytes respectively).
- A genuine path-based SVG of the approved wordmark, approximately 17KB instead of the 759KB raster-backed SVG. The logo design is preserved. Superseded assets are kept under `design-references/assets`, outside the published tree.
- Clickable Work screenshots and captions, clear external-link labels, and H2 project headings.
- Larger essential mobile text, 44px header contact target and a stacked analytics diagram.
- A shorter project reel with slightly smaller desktop previews, retained bounded glide, all five projects and a clear “Skip to services” action.
- An accessible desktop Services disclosure with direct destinations and current-service indication. Escape closes it and returns focus.
- Service-aware Contact URLs and preselection; tap-to-call; honest email-draft preparation; copyable/viewable project brief; explicit polite status announcements. No personal values are stored by the page. A backend submission is intentionally not represented as working.
- Clear scoping, inputs, milestones and handover content on service pages, without invented prices or delivery promises.
- A working front-end measurement-goal planner with enquiry, booking and purchase examples, labelled as a planning demo without live business data.
- Matching Privacy and Website Use pages describing this actual browser-only flow. Old student/tool wording is removed. Final business/policy review is still needed before a domain launch.
- Current branded social artwork, distinct descriptions/Open Graph titles, canonical URLs, organisation markup, robots and sitemap files. All preview pages deliberately use `noindex, follow`; the final domain/indexing configuration must be changed for launch.
- A branded 404 page with static hosting `404-page` handling. Existing removed-student redirects remain; the old review route redirects to Work.
- One approximately 21KB shared script bundle, shared motion easing, and removal of obsolete full-screen transition/WebGL build steps. Existing motion remains responsive and reduced-motion aware.
- Nonpersonal interaction hooks for future measurement. No analytics network requests are made by these hooks.

## Validation

- Build/reference checks passed; CSS parsing and local fragment checks passed.
- Nine pages were checked at mobile width: no horizontal overflow, no failed completed images, one shared script and no console errors in the observed checks.
- Desktop service navigation, service preselection, keyboard disclosure open/Escape, tap-to-call, Work link structure and the measurement planner were checked.
- A synthetic project brief copied successfully without sending a message.
- Local Privacy, Terms, robots and sitemap routes returned 200; the unknown route returned the branded 404 with status 404. Hosted edge recovery remains subject to the hosting layer's routing.
- These are browser and build checks, not an FPS or Core Web Vitals benchmark on physical devices.

## Deliberately awaiting verified information

- Backend enquiry delivery/storage, inbox account and email-provider configuration: deferred by the user.
- Approved client testimonials, measured outcomes, founder experience/profile links and any specific reply/timing/support commitments: do not invent these.
- Final legal business identity and final domain settings.

The earlier audit's browser attribute sample missed the existing `role=status` on the contact status element. This pass preserves that role and adds explicit `aria-live`/`aria-atomic`; the improvement is the clearer draft/copy feedback and fallback.


## Review fixes — 20 October 2026

- Reduced heading sizes and vertical spacing. The mobile contact form comes first in the reading order and first name field is visible around 478px from the top at a 358px viewport. Desktop keeps a paired information/form layout.
- Raised analytics labels from 9px to 12px, supporting copy from 11px to 15px, and captions to 13px. Updated prototype text, project details, process copy and service links to match.
- Shortened the desktop project sequence with narrower cards and reduced travel. A local 1174px check measured about 2360px of reel height; mobile uses a native swipe rail around 740px tall, with project buttons and keyboard controls.
- Website service uses a browser-framed real screenshot; Product uses clearly labelled prototype cards; Analytics uses a measurement-plan panel with an illustrative route and readable workflow. No client metrics were invented.
- Added problem/contribution/experience summaries to five Work projects. Image previews open a native modal with next/previous, keyboard arrows, Escape, focus return and external website links.
- Shared motion tokens distinguish 240ms controls, 420ms hero arrival, 520ms content entrances and 620ms media. Reduced motion remains supported.
- Moved charset metadata before the shared navigation bootstrap.

Validation: build/asset/metadata checks for nine pages plus 404; five complete project summaries/previews; desktop and mobile page layouts; no horizontal overflow; first-field placement; native mobile rail selection; keyboard modal traversal and focus restoration; all tested page changes at y=0; no browser console errors. Enquiries remain frontend email-draft preparation.
