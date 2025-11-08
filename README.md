Sure — here’s your cleaned and properly formatted **`README.md`** version, with **no emojis or symbols**, and ready for **direct upload to GitHub**:

---

```markdown
# Real-Time Collaborative Drawing Canvas

## Overview
A multi-user real-time drawing application that allows multiple users to draw simultaneously on the same shared canvas.  
Each user is assigned a unique color and can see others' drawings in real-time, including cursor positions, stroke colors, and undo/redo actions.

Developed using Node.js, Socket.io, and Vanilla JavaScript (HTML5 Canvas) — with no external drawing or frontend frameworks.

---

## Features

- Drawing Tools: Brush, eraser, color palette, stroke width adjustment  
- Global Undo/Redo: Shared action history across all users  
- Real-Time Sync: Low-latency updates via WebSockets  
- User Management: Tracks active users and assigns unique colors  
- Conflict Resolution: Consistent shared canvas state for all users  
- Live Cursor Indicators: See where others are drawing  
- Touch Support: Mobile-friendly drawing support  

---

## Tech Stack

| Component | Technology |
|------------|-------------|
| Frontend | HTML5, CSS3, Vanilla JavaScript |
| Realtime Communication | Socket.io |
| Backend | Node.js + Express |
| Canvas Rendering | HTML5 Canvas API |
| Environment | Visual Studio Code |

---

## Folder Structure

```

collaborative-canvas/
├── client/
│   ├── index.html          # UI and Canvas
│   ├── style.css           # Styles
│   ├── main.js             # Initializes app
│   ├── canvas.js           # Canvas logic
│   ├── websocket.js        # WebSocket client handling
│
├── server/
│   ├── server.js           # Express + Socket.io server
│   ├── rooms.js            # User management
│   └── drawing-state.js    # Undo/redo + stroke history
│
├── package-lock.json
├── package.json
├── README.md
└── ARCHITECTURE.md

````

---

## Installation and Setup

### Step 1: Clone the Repository
```bash
git clone https://github.com/your-username/collaborative-canvas.git
cd collaborative-canvas
````

### Step 2: Install Dependencies

```bash
npm install
```

### Step 3: Start the Server

```bash
node server/server.js
```

The server runs at:
[http://localhost:3000](http://localhost:3000)

---

## Testing Instructions

1. Open multiple browser tabs or windows at:
   [http://localhost:3000](http://localhost:3000)

2. Start drawing in one tab — strokes should appear on all tabs in real-time.

3. Use the toolbar to:

   * Change color or stroke size
   * Switch between brush and eraser
   * Perform undo/redo

4. Observe the user list update when users join or leave.

---

## Known Limitations

* Canvas data is not persisted after server restart.
* Undo/redo may lag slightly with more than 10 concurrent users.
* No authentication or custom room creation yet.

---

## Future Enhancements

| Feature              | Description                                        |
| -------------------- | -------------------------------------------------- |
| Session Persistence  | Store canvas states on the server or in a database |
| Room System          | Multiple canvases (rooms) per session              |
| User Authentication  | Login and identity preservation                    |
| Latency Optimization | Client-side prediction and smooth rendering        |

---

## Author

Developed by: A Jeevan Reddy
For: Flam Company Assignment
Environment: Visual Studio Code
Date: November 2025

---

## Run Command Summary

| Command               | Description                      |
| --------------------- | -------------------------------- |
| npm install           | Install all dependencies         |
| node server/server.js | Start backend and serve frontend |
| ctrl + c              | Stop the running server          |

---

## Demo

After starting the app, open:

* [http://localhost:3000](http://localhost:3000) → Tab 1
* [http://localhost:3000](http://localhost:3000) → Tab 2

Draw in one tab — it should instantly reflect in the other.

---

## Output
<img width="1919" height="1082" alt="image" src="https://github.com/user-attachments/assets/a806d37f-137a-4208-89a7-83c5faf40deb" />

---

## License

This project is provided for educational and assessment purposes under Flam Company’s assignment guidelines.

```
