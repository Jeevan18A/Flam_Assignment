// server/drawing-state.js
// Keeps ordered list of operations for global undo/redo

const history = []; // applied ops
const redoStack = [];

function addOperation(op) {
    if (!op || !op.id) return false;

    // basic clone to keep immutability
    history.push(JSON.parse(JSON.stringify(op)));

    // clear redo on new operation
    redoStack.length = 0;
    return true;
}

function undo() {
    if (history.length === 0) return getHistory();
    const op = history.pop();
    redoStack.push(op);
    return getHistory();
}

function redo() {
    if (redoStack.length === 0) return getHistory();
    const op = redoStack.pop();
    history.push(op);
    return getHistory();
}

function clear(requesterId = null) {
    const op = {
        id: `clear-${Date.now()}`,
        userId: requesterId,
        type: "clear",
        tool: "clear",
        points: [],
        timestamp: Date.now()
    };
    history.push(op);
    redoStack.length = 0;
}

function getHistory() {
    return history.slice();
}

module.exports = { addOperation, undo, redo, clear, getHistory };
