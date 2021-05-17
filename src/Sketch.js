import paper from "paper";
import {initialize} from "./main"

export function Sketch() {
  window.onload = function () {
    paper.install(window);
    paper.setup("paperCanvas");

    initialize();
  };

  // Must return null
  return null;
}
