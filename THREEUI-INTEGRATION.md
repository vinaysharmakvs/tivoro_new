# Motion reference, adapted to Tivoro

The user clarified that the ThreeUI paper scene was an animation reference. The literal Nocturne certificate, wordmark, embedded demo and original React scene are removed from the live site.

The existing AK Interiors project preview now uses its real screenshot as a lightly bending paper surface. src/project-flow.js adapts the reference bend mathematics to a landscape project visual, with much smaller amplitude, pointer lighting and eased tilt. Other portfolio cards use subtle pointer depth. The intro-first content order and current Tivoro branding remain intact.

The reference archive remains unchanged in packages/threeui for provenance. Only the bundled Three.js r149 library (including its MIT notice) and Tivoro's custom project-flow script are published. React and the original ThreeDPaper component are not loaded by the website. motion.html redirects to the actual portfolio section.

The original static project screenshot remains visible for reduced motion, screenshot exports or unavailable WebGL. Rendering pauses when the featured project is offscreen or the document is hidden.
