// client/main.js
(function () {

  window.emitStroke = window.emitStroke || function (s) { console.warn("emitStroke not ready", s); };
  window.emitCursor = window.emitCursor || function (c) { console.warn("emitCursor not ready", c); };
  window.emitUndo = window.emitUndo || function () { console.warn("emitUndo not ready"); };
  window.emitRedo = window.emitRedo || function () { console.warn("emitRedo not ready"); };
  window.emitClear = window.emitClear || function () { console.warn("emitClear not ready"); };

  // set simple ready status when socket connects
  const statusEl = document.getElementById("status");
  if (statusEl) {
    statusEl.innerText = "Ready";
  }
})();