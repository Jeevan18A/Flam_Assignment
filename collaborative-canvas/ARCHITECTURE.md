Here’s a **clean, polished, and professionally formatted** version of your `ARCHITECTURE.md` file — fully proofread, with consistent markdown styling, spacing, and improved clarity.

---

# 🧩 ARCHITECTURE.md

## 1️⃣ Overview

This application is a **real-time collaborative drawing canvas**.

Users draw on an HTML5 `<canvas>` and share their strokes via **Socket.io**. The server maintains a synchronized drawing history and handles **Undo/Redo** globally. Each connected client stays in sync with every other in real-time.

---

## 2️⃣ System Architecture Overview

The system follows a **Client–Server Model** using **WebSockets** for real-time bidirectional communication.

```text
+----------------+        WebSocket Events        +----------------+
|   Client A     | <----------------------------> |   Node Server  |
|  (Browser)     |                               |   (Socket.io)  |
+----------------+                               +----------------+
       ↑                                                ↓
+----------------+                               +----------------+
|   Client B     | <----------------------------> |  DrawingState  |
|  (Browser)     |         Shared Canvas          | (History Mgmt) |
+----------------+                               +----------------+
```

---

## 3️⃣ Data Flow Diagram

### ✏️ Drawing Event Flow

```text
User draws on canvas
→ Client captures stroke coordinates
→ Emits 'draw' event via WebSocket
→ Server receives event
→ Broadcasts to all other connected clients
→ Each client updates their local canvas in real-time
```

### ↩️ Undo/Redo Flow

```text
Client clicks Undo
→ Emits 'undo' event
→ Server updates global history stack
→ Server broadcasts updated canvas state
→ All clients redraw canvas from the new history
```

---

## 4️⃣ High-Level Data Flow

1. Client draws → collects points in a `stroke` object.
2. Client emits batched `stroke` events to the server.
3. Server validates and appends to the global `history`.
4. Server broadcasts the stroke to other clients.
5. Other clients render the incoming strokes in real-time.
6. Undo/Redo:

   * Client emits `undo` or `redo`.
   * Server modifies `history`.
   * Server emits `update-history`.
   * All clients clear and replay updated `history`.

---

## 5️⃣ WebSocket Protocol

### 🔌 Message Types

| Event Name       | Direction       | Description                                   |
| ---------------- | --------------- | --------------------------------------------- |
| `me`             | Server → Client | Assigns user `{ id, name, color }`            |
| `init`           | Server → Client | Sends full canvas history when a client joins |
| `users`          | Server → All    | Broadcasts updated list of online users       |
| `stroke`         | Client ↔ Server | Sends and receives stroke data                |
| `cursor`         | Client ↔ Server | Sends and receives cursor positions           |
| `undo` / `redo`  | Client → Server | Request to update global history              |
| `update-history` | Server → All    | Sends full history after undo/redo            |
| `clear`          | Client → Server | Request to clear canvas                       |
| `clear-canvas`   | Server → All    | Broadcasts clear action                       |

---

## 6️⃣ Operation & History Model

* Each drawing action = one **operation** (`stroke` or `clear`).
* `history` stores all operations chronologically.
* `redoStack` holds undone operations for possible re-application.
* Undo pops the last item from `history` → `redoStack`.
* Redo pops from `redoStack` → back to `history`.

### ✅ Pros

* Simple, deterministic ordering.
* Global undo/redo ensures consistency.

### ⚠️ Cons

* Global undo can remove another user’s last stroke (intentional design).
* Replaying very long histories can affect performance.

---

## 7️⃣ Undo/Redo Strategy (Global)

* The **server** maintains the single global history timeline.
* Undo removes the **most recent** operation globally.
* Redo restores the **last undone** operation.
* After each update, server emits `update-history` → all clients replay the updated state.

**Alternative (Not Implemented):**
Per-user undo or CRDT-based concurrent editing (requires complex conflict resolution).

---

## 8️⃣ Performance Optimizations

| Optimization                      | Description                                            |
| --------------------------------- | ------------------------------------------------------ |
| **Batched strokes**               | Clients send grouped points to minimize socket traffic |
| **Throttled cursor updates**      | Reduces event spam                                     |
| **Canvas scaling**                | Adjusts for high-DPI displays                          |
| **History snapshotting (future)** | Store periodic snapshots for faster replay             |

---

## 9️⃣ Conflict Resolution

* Deterministic order based on **server timestamp + push order**.
* **Last-writer-wins** — no merging complexity; drawings simply overlay sequentially.

---

## 🔒 10. Security & Robustness

* Server validates strokes (`id`, `points[]` present).
* CORS open for dev; restrict origins in production.
* Limit Socket.io buffer sizes for safety.
* No authentication (for assignment); production should include:

  * Auth tokens
  * User isolation (per-room setup)

---

## 11️⃣ Room Support (Future Enhancement)

To support multiple drawing rooms:

* Maintain `historyByRoom` instead of global history.
* Clients join via `socket.join(roomId)`.
* Broadcasts scoped to specific rooms.

---

## 12️⃣ Scalability Considerations

| Concern            | Scalable Solution                             |
| ------------------ | --------------------------------------------- |
| 1000+ users        | Use Redis/Kafka for distributed socket events |
| Canvas persistence | Store strokes in MongoDB or Redis             |
| Load balancing     | Nginx / HAProxy with sticky sessions          |
| Latency reduction  | Delta compression for stroke data             |

---

## 13️⃣ File Responsibilities

| File                      | Purpose                                    |
| ------------------------- | ------------------------------------------ |
| `server/server.js`        | Sets up backend WebSocket server           |
| `server/rooms.js`         | Tracks connected users and assigns colors  |
| `server/drawing-state.js` | Manages global history and undo/redo       |
| `client/websocket.js`     | Manages socket connections and listeners   |
| `client/canvas.js`        | Handles canvas drawing and rendering logic |
| `client/main.js`          | Initializes and binds all frontend modules |

---

## 14️⃣ Conclusion

This project demonstrates:

* **Efficient real-time synchronization** using Socket.io
* **Global shared state management** for collaborative drawing
* **Undo/Redo** consistency across multiple users
* **Clear modular architecture**, separating backend, frontend, and state logic

---

**Designed & Developed by:** *A Jeevan Reddy*
**Environment:** Visual Studio Code
**Date:** November 2025
**For:** *Flam Company Assignment*

---

> 💡 **Optional Extension:**
> Would you like me to include a `demo.js` testing script that automatically spawns multiple WebSocket clients to simulate concurrent users for stress testing?
> It’s a great addition for demonstrating scalability during your review or interview.

---

