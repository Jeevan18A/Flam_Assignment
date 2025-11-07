// server/rooms.js
const users = new Map();

function randomColor() {
    const hue = Math.floor(Math.random() * 360);
    return `hsl(${hue} 70% 45%)`;
}

function shortId() {
    return Math.random().toString(36).slice(2, 7).toUpperCase();
}

function addUser(socketId) {
    const user = {
        id: socketId,
        name: `User-${shortId()}`,
        color: randomColor(),
        joinedAt: Date.now()
    };
    users.set(socketId, user);
    return user;
}

function removeUser(socketId) {
    users.delete(socketId);
}

function getUser(socketId) {
    return users.get(socketId);
}

function listUsers() {
    return Array.from(users.values()).map(({ id, name, color }) => ({ id, name, color }));
}

module.exports = { addUser, removeUser, getUser, listUsers };