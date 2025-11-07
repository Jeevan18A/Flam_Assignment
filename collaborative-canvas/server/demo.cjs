import { io } from "socket.io-client";
const SERVER_URL = "http://localhost:3000"; 
const NUM_CLIENTS = 5;                      
const DRAW_INTERVAL_MS = 2000;              
const ACTION_PROBABILITIES = {
  draw: 0.8,  // 80% chance to draw
  undo: 0.1,  // 10% chance to undo
  redo: 0.1,  // 10% chance to redo
};

const clients = [];

function getRandomColor() {
    const colors = ["#FF5733", "#33FF57", "#3357FF", "#FF33A8", "#FFD433"];
    return colors[Math.floor(Math.random() * colors.length)];
}

function randomStroke(userId) {
    const stroke = {
        id: Date.now() + "-" + Math.random().toString(36).substr(2, 5),
        userId,
        type: "stroke",
        tool: "pen",
        color: getRandomColor(),
        width: Math.floor(Math.random() * 3) + 2,
        points: [],
};

// Generate random line points
for (let i = 0; i < 10; i++) {
    stroke.points.push({
      x: Math.random() * 800, 
      y: Math.random() * 600,
    });
}
return stroke;
}

function createClient(id) {
    const socket = io(SERVER_URL, { transports: ["websocket"] });
    const userId = `user-${id}`;

socket.on("connect", () => {
    console.log(`✅ Client ${userId} connected: ${socket.id}`);
});

socket.on("disconnect", () => {
    console.log(`❌ Client ${userId} disconnected`);
});

socket.on("update-history", (history) => {
    console.log(`📜 Client ${userId} received updated history (${history.length} ops)`);
});

// Random drawing loop
setInterval(() => {
    const rand = Math.random();
    if (rand < ACTION_PROBABILITIES.draw) {
        const stroke = randomStroke(userId);
        socket.emit("stroke", stroke);
        console.log(`✏️  ${userId} drew a stroke (${stroke.points.length} pts)`);
    } else if (rand < ACTION_PROBABILITIES.draw + ACTION_PROBABILITIES.undo) {
        socket.emit("undo");
        console.log(`↩️  ${userId} requested UNDO`);
    } else {
        socket.emit("redo");
        console.log(`↪️  ${userId} requested REDO`);
    }
}, DRAW_INTERVAL_MS);

return socket;
}

// Launch all simulated clients
console.log(`🚀 Launching ${NUM_CLIENTS} simulated clients...`);
for (let i = 0; i < NUM_CLIENTS; i++) {
    clients.push(createClient(i + 1));
}

// Handle exit
process.on("SIGINT", () => {
    console.log("\n🛑 Closing all client connections...");
    clients.forEach((c) => c.disconnect());
    process.exit();
});
