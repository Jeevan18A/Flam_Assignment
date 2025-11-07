// client/canvas.js
// Enhanced canvas: smoothing, batching, throttles, cursor, replay

(function () {
  const APP = {};
  window.APP = APP;

  const canvas = document.getElementById("drawCanvas");
  const cursorsContainer = document.getElementById("cursors");
  const ctx = canvas.getContext("2d", { alpha: true });

  const toolSelect = document.getElementById("toolSelect");
  const colorPicker = document.getElementById("colorPicker");
  const widthRange = document.getElementById("widthRange");
  const undoBtn = document.getElementById("undoBtn");
  const redoBtn = document.getElementById("redoBtn");
  const clearBtn = document.getElementById("clearBtn");

  let deviceRatio = window.devicePixelRatio || 1;
  let drawing = false;
  let strokeBuffer = null; // current stroke
  let lastEmit = 0;
  let emitInterval = 60; // ms
  let cursorThrottle = 50;
  let lastCursorSent = 0;

  // resize & DPR handling
  function resizeCanvas() {
    const maxW = Math.min(window.innerWidth - 40, 1400);
    const maxH = Math.max(360, window.innerHeight - 180);
    deviceRatio = window.devicePixelRatio || 1;
    canvas.style.width = `${maxW}px`;
    canvas.style.height = `${maxH}px`;
    canvas.width = Math.floor(maxW * deviceRatio);
    canvas.height = Math.floor(maxH * deviceRatio);
    ctx.setTransform(deviceRatio, 0, 0, deviceRatio, 0, 0);
    redrawFromHistory();
  }
  window.addEventListener("resize", resizeCanvas);

  // history cache (local mirror)
  let historyCache = [];

  // smoothing helpers (midpoint quadratic)
  function drawSmoothLine(points, stroke) {
    if (!points || points.length === 0) return;
    ctx.save();
    if (stroke.tool === "eraser")
      ctx.globalCompositeOperation = "destination-out";
    else ctx.globalCompositeOperation = "source-over";

    ctx.lineWidth = stroke.width;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = stroke.color;

    if (points.length === 1) {
      ctx.beginPath();
      ctx.arc(points[0].x, points[0].y, stroke.width / 2, 0, Math.PI * 2);
      ctx.fillStyle = stroke.color;
      ctx.fill();
      ctx.restore();
      return;
    }

    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length - 1; i++) {
      const midX = (points[i].x + points[i + 1].x) / 2;
      const midY = (points[i].y + points[i + 1].y) / 2;
      ctx.quadraticCurveTo(points[i].x, points[i].y, midX, midY);
    }
    // last segment
    const last = points[points.length - 1];
    ctx.lineTo(last.x, last.y);
    ctx.stroke();
    ctx.restore();
  }

  // drawing operations
  function beginStroke() {
    strokeBuffer = {
      id: genId("stroke"),
      userId: window.ME ? window.ME.id : null,
      userName: window.ME ? window.ME.name : null,
      type: "stroke",
      tool: toolSelect.value || "brush",
      color: colorPicker.value || "#000",
      width: Number(widthRange.value) || 4,
      points: [],
      timestamp: Date.now(),
    };
  }
  function pushPoint(p) {
    if (!strokeBuffer) return;
    strokeBuffer.points.push(p);
  }
  function flushStroke(final = false) {
    if (!strokeBuffer || strokeBuffer.points.length === 0) return;
    // draw locally (final draw)
    drawSmoothLine(strokeBuffer.points, strokeBuffer);
    // add to local history cache
    historyCache.push(JSON.parse(JSON.stringify(strokeBuffer)));
    // emit to server (batched)
    emitStrokeBatched(strokeBuffer);
    if (final) strokeBuffer = null;
    else {
      // keep stroke id for next batch
      strokeBuffer.points = [];
    }
  }

  // batched emission
  function emitStrokeBatched(stroke) {
    const nowT = Date.now();
    if (nowT - lastEmit >= emitInterval) {
      window.emitStroke && window.emitStroke(stroke);
      lastEmit = nowT;
    } else {
      // schedule small timeout to send the batch
      setTimeout(() => {
        window.emitStroke && window.emitStroke(stroke);
        lastEmit = Date.now();
      }, emitInterval - (nowT - lastEmit));
    }
  }

  // pointer handling (pointer events for unified mouse/touch)
  function getPosFromEvent(e) {
    const rect = canvas.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }

  canvas.addEventListener("pointerdown", (e) => {
    e.preventDefault();
    canvas.setPointerCapture(e.pointerId);
    drawing = true;
    beginStroke();
    const p = getPosFromEvent(e);
    pushPoint(p);
    drawSmoothLine([p], {
      tool: strokeBuffer.tool,
      color: strokeBuffer.color,
      width: strokeBuffer.width,
    });
    // notify cursor
    emitCursorThrottled(p);
  });

  canvas.addEventListener("pointermove", (e) => {
    const p = getPosFromEvent(e);
    emitCursorThrottled(p);
    if (!drawing || !strokeBuffer) return;
    pushPoint(p);
    const pts = strokeBuffer.points.slice(
      Math.max(0, strokeBuffer.points.length - 6)
    );
    drawSmoothLine(pts, strokeBuffer);
    // emit periodically
    const nowT = Date.now();
    if (nowT - lastEmit > emitInterval) {
      const toSend = { ...strokeBuffer, points: strokeBuffer.points.slice() };
      window.emitStroke && window.emitStroke(toSend);
      lastEmit = nowT;
      strokeBuffer.points = strokeBuffer.points.slice(-2);
    }
  });

  canvas.addEventListener("pointerup", (e) => {
    if (!drawing) return;
    drawing = false;
    // finalize stroke
    if (strokeBuffer) {
      // finalize, re-render final stroke snapshot to ensure continuity
      drawSmoothLine(strokeBuffer.points, strokeBuffer);
      historyCache.push(JSON.parse(JSON.stringify(strokeBuffer)));
      window.emitStroke && window.emitStroke(strokeBuffer);
      strokeBuffer = null;
    }
  });
  canvas.addEventListener("pointercancel", () => {
    drawing = false;
    strokeBuffer = null;
  });
  canvas.addEventListener("pointerleave", () => {});

  APP.applyRemoteStroke = function (stroke) {
    if (!stroke || !stroke.points) return;
    drawSmoothLine(stroke.points, stroke);
    historyCache.push(JSON.parse(JSON.stringify(stroke)));
  };

  function redrawFromHistory() {
    clearCanvas();
    historyCache.forEach((op) => {
      if (op.type === "clear") {
        clearCanvas();
      } else {
        drawSmoothLine(op.points, op);
      }
    });
  }

  APP.replayHistory = function (history) {
    historyCache = Array.isArray(history) ? history.slice() : [];
    redrawFromHistory();
  };

  function clearCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }
  APP.clearCanvasLocal = function () {
    historyCache = [];
    clearCanvas();
  };

  // cursor logic
  const remoteCursors = new Map();
  const cursorTimers = new Map();
  function getCursorEl(userId) {
    if (remoteCursors.has(userId)) return remoteCursors.get(userId);
    const el = document.createElement("div");
    el.className = "cursor";
    el.innerHTML = `<div class="dot"></div><div class="label"></div>`;
    cursorsContainer.appendChild(el);
    remoteCursors.set(userId, el);
    return el;
  }
  APP.showRemoteCursor = function ({ x, y, userId, name, color }) {
    const el = getCursorEl(userId);
    el.style.left = `${x}px`;
    el.style.top = `${y}px`;
    const dot = el.querySelector(".dot");
    if (dot) dot.style.background = color || dot.style.background;
    const label = el.querySelector(".label");
    if (label) label.textContent = name || "User";
    scheduleCursorCleanup(userId);
  };
  function scheduleCursorCleanup(userId) {
    if (cursorTimers.has(userId)) clearTimeout(cursorTimers.get(userId));
    const t = setTimeout(() => {
      const el = remoteCursors.get(userId);
      if (el) el.remove();
      remoteCursors.delete(userId);
      cursorTimers.delete(userId);
    }, 4000);
    cursorTimers.set(userId, t);
  }

  // cursor emit throttle
  function emitCursorThrottled(pos) {
    const nowT = Date.now();
    if (nowT - lastCursorSent > cursorThrottle) {
      window.emitCursor && window.emitCursor({ x: pos.x, y: pos.y });
      lastCursorSent = nowT;
    }
  }

  // UI buttons
  undoBtn.addEventListener("click", () => window.emitUndo && window.emitUndo());
  redoBtn.addEventListener("click", () => window.emitRedo && window.emitRedo());
  clearBtn.addEventListener("click", () => {
    if (!confirm("Clear canvas for everyone?")) return;
    window.emitClear && window.emitClear();
  });

  function genId(prefix = "id") {
    return `${prefix}-${Math.random()
      .toString(36)
      .slice(2, 9)}-${Date.now().toString(36)}`;
  }

  // redraw on demand
  function redrawFromCache() {
    clearCanvas();
    historyCache.forEach((op) => {
      if (op.type === "clear") clearCanvas();
      else drawSmoothLine(op.points, op);
    });
  }

  // expose some debug
  APP.redrawFromCache = redrawFromCache;

  // initial setup
  resizeCanvas();
})();
