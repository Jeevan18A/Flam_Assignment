// client/websocket.js
const socket = io();

socket.on("connect", () => setStatus(`Connected (${socket.id})`));
socket.on("disconnect", () =>
  setStatus("Disconnected — trying to reconnect...")
);

socket.on("me", (user) => {
  window.ME = user;
  updateMeInfo(user);
});

socket.on("users", (users) => {
  renderUsers(users);
});

socket.on("init", (history) => {
  // rehydrate canvas on init
  window.APP && window.APP.replayHistory(history);
});

socket.on("stroke", (stroke) => {
  window.APP && window.APP.applyRemoteStroke(stroke);
});

socket.on("cursor", (cursor) => {
  window.APP && window.APP.showRemoteCursor(cursor);
});

socket.on("update-history", (history) => {
  window.APP && window.APP.replayHistory(history);
});

socket.on("clear-canvas", () => {
  window.APP && window.APP.clearCanvasLocal();
});

socket.on("user-joined", (user) => {
  // optional toast
});

socket.on("user-left", (id) => {
  // optional cleanup
});

// helpers exported for canvas
function emitStroke(stroke) {
  socket.emit("stroke", stroke);
}
function emitCursor(cursor) {
  socket.emit("cursor", cursor);
}
function emitUndo() {
  socket.emit("undo");
}
function emitRedo() {
  socket.emit("redo");
}
function emitClear() {
  socket.emit("clear");
}

function setStatus(t) {
  const s = document.getElementById("status");
  if (s) s.textContent = t;
}
function updateMeInfo(user) {
  const el = document.getElementById("meInfo");
  if (!el) return;
  el.textContent = `${user.name}`;
  el.style.color = user.color;
}
function renderUsers(list) {
  const ul = document.getElementById("usersList");
  if (!ul) return;
  ul.innerHTML = "";
  list.forEach((u) => {
    const div = document.createElement("div");
    div.className = "user";
    div.innerHTML = `<span style="width:10px;height:10px;border-radius:50%;background:${u.color};display:inline-block"></span><span>${u.name}</span>`;
    ul.appendChild(div);
  });
}
