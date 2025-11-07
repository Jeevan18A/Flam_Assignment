// server/server.js
const path = require("path");
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const rooms = require("./rooms");
const drawingState = require("./drawing-state");
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: { origin: "*" },
    maxHttpBufferSize: 1e6
});

app.use(express.static(path.join(__dirname, "..", "client")));
const PORT = process.env.PORT || 3000;
io.on("connection", (socket) => {
    console.log(`connect: ${socket.id}`);

// register user & send info
const user = rooms.addUser(socket.id);
socket.emit("me", user);

// send users list & initial history
io.emit("users", rooms.listUsers());
socket.emit("init", drawingState.getHistory());

// broadcast join
socket.broadcast.emit("user-joined", user);

// Stroke: complete stroke object (batched points)
socket.on("stroke", (stroke) => {
    try {
        if (!stroke || !stroke.id || !Array.isArray(stroke.points)) return;
        // annotate server-side
        stroke.userId = socket.id;
        stroke.timestamp = Date.now();
        drawingState.addOperation(stroke);
        socket.broadcast.emit("stroke", stroke);
    } catch (err) {
        console.error("stroke handler error", err);
    }
});

// Cursor broadcasts lightweight, include name/color
    socket.on("cursor", (c) => {
        if (!c) return;
        const u = rooms.getUser(socket.id);
        const payload = {
        x: c.x,
        y: c.y,
        userId: socket.id,
        name: u ? u.name : "User",
        color: u ? u.color : "#000"
    };
        socket.broadcast.emit("cursor", payload);
});

socket.on("undo", () => {
    try {
        const hist = drawingState.undo();
        io.emit("update-history", hist);
    } catch (err) {
        console.error("undo error", err);
    }
});

socket.on("redo", () => {
    try {
        const hist = drawingState.redo();
        io.emit("update-history", hist);
    } catch (err) {
        console.error("redo error", err);
    }
});

socket.on("clear", () => {
        drawingState.clear(socket.id);
        io.emit("clear-canvas");
});

socket.on("disconnect", (reason) => {
        console.log(`disconnect: ${socket.id} (${reason})`);
        rooms.removeUser(socket.id);
        io.emit("users", rooms.listUsers());
        socket.broadcast.emit("user-left", socket.id);
    });

socket.on("error", (err) => {
        console.error("socket error", err);
    });
    });

server.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
