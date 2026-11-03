import paper from "paper";
import {initialize} from "./main"

export function Sketch() {
  window.onload = function () {
    // Do not call paper.install(window): it copies paper's classes onto the
    // global object, including `Symbol` (paper's SymbolDefinition), which
    // replaces the native Symbol. Babel's helpers in the production build rely
    // on the native Symbol.iterator, so spreading a Map iterator then throws
    // and RUN does nothing. All code uses the imported `paper` object instead.
    paper.setup("paperCanvas");

    // initialize();
  };

  // Must return null
  return null;
}
