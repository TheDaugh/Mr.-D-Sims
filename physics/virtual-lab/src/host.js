// The physics lab page hands the shared lab app (chemistry/virtual-lab/src/ui/app.js) its lab, its lab kind, its room art and its icons.
// index.html loads this file first, then the shared app, which reads window.VLAB_HOST once when it starts.
import * as fancart from "./ui/fancart.js";
import { art, icons } from "./ui/art.js";

window.VLAB_HOST = {
  base: "../../chemistry/virtual-lab/",          // species, reactions, hazards and config live with the shared app; the lab and room files are in this folder
  course: "physics",                              // which class period the clock and locked mode follow
  labs: { "05-fan-cart": "05-fan-cart.json" },
  defaultLab: "05-fan-cart",
  kinds: { fancart },
  art, icons
};
