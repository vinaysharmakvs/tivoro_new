import { createRoot } from "react-dom/client";
import { ThreeDPaper } from "@designcodeio/threeui";
import "@designcodeio/threeui/style.css";

export function Scene() {
  return (
    <div className="shader-frame">
      <ThreeDPaper variant="original" />
    </div>
  );
}

const host = document.getElementById("paper-scene");
if (host) createRoot(host).render(<Scene />);
