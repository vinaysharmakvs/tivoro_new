# Inner-page motion

Shared page-motion assets complement the existing title and text entrances on all seven pages. Work has five project media reveals, captions, numbered labels, a finite scroll cue and small scroll-driven screenshot depth. Product prototypes, analytics nodes, portraits, founder profiles and form rows have purpose-specific staggered entrances. Service detail rules draw once. Navigation, card arrows, prototypes and inputs provide hover/focus feedback.

One scroll scheduler updates only visible images from cached screenshot geometry; screenshot depth is disabled on narrow/coarse-pointer layouts. No new dependencies, canvases, wheel handlers or delayed navigation. Entrances run once, content is readable by default, and reduced motion cancels Web Animations and disables CSS movement. The approved layout, story copy, logo and page routes remain intact.


## Page changes — 19 October 2026

Internal page links retain immediate native navigation and intent prefetch. An early, session-scoped arrival marker triggers a 620ms fade/glide on the first section and a 700ms, 65ms-staggered entrance on the next section. Mobile uses 540/600ms and smaller distances. The header stays still, with a 720ms terracotta top line. There is no exit delay or blocking overlay. Reduced motion and capture mode disable this effect; bfcache restoration clears the marker.

Verified locally: Work → About → Work, browser Back, and mobile menu → Contact (390px, 540ms arrival, no horizontal overflow). Shared bundle/static checks passed for nine pages plus 404.


## Final frontend polish — 20 October 2026

Added a finite, sequential signal to the analytics illustration and a short sweep through the product prototype. Both begin on intersection and finish within four seconds. The handover rows, planning panel, feature caption and page end now follow the shared entrance rhythm; the closing invitation draws a quiet terracotta rule. The measurement selector animates its changed copy with cancellation on rapid changes and announces the result politely. Project media uses opacity and translation rather than a large animated clip mask. No dependencies, scroll interception or page exit delays were added.

Checks: static build and local references for nine pages plus 404; browser verification of the analytics signal, rapid goal changes, prototype signal, mobile menu to Contact and no horizontal overflow. Reduced-motion and capture rules keep all new decoration static. Frontend only; enquiries still prepare email drafts.


## Navigation correction and calmer motion — 20 October 2026

A shared head bootstrap now makes new internal pages begin at x=0/y=0 with instant scroll positioning before and after initial layout. Intentional hash destinations and Back/Forward retain native behaviour. Native restoration is suspended only for initial fresh navigation and restored on pageshow; user input stops late resets. The build inserts the same bootstrap into all nine pages and 404. Restored navigation menus close immediately.

Removed the overlapping whole-section arrival animations and top transition stripe. Hero lines use a readable 12px entrance over 420ms; headings enter as one piece rather than word-by-word masks. Dropdowns sit above the page with a viewport-bounded width.

Browser regression checks passed: homepage footer → Work (0,0), browser Back restoring 6174px, footer → Contact (0,0), Tools (0,0), Services hash landing, Back with menus closed, medium-width overflow check, and mobile footer → Contact at y=0 with no horizontal overflow.
