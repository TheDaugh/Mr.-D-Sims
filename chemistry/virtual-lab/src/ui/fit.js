// Scale the fixed-size stage to fit the window. Zooming the browser only changes the window size,
// so the stage re-fits and nothing inside it gets bigger or smaller relative to the rest.
export function fitStage(stage, W = 1280, H = 720) {
  const f = () => { const s = Math.min(innerWidth / W, innerHeight / H); stage.style.transform = `translate(-50%, -50%) scale(${s})`; };
  addEventListener("resize", f); f();
}
