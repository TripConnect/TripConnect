const { io } = require("socket.io-client");
require('dotenv').config()


const PORT = process.env.PORT || 3000


const socket = io(`ws://127.0.0.1:${PORT}`, {
    reconnectionDelayMax: 10000,
    auth: {
        token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiZmRkYjM0MjgtOWMwNC00NWIzLTk0NTUtZGJkNzY1MGJiOGJhIiwidXNlcm5hbWUiOiJ0cmlwY29ubmVjdGdpcmwiLCJjcmVkZW50aWFsIjoiJDJiJDEyJFdVY1lFUzNnN0M4V0FNaE55VjUxdi5IVGIuL1R4V3BvUHZ2eXJXMG03QXRlOWJjaFNOSkouIiwiaWF0IjoxNjk1MzA5MDY0fQ.uxQwZxar3BcDYs9pHCa8899CfUe8pTapZfYCtLuoQN8"
    },
});

console.log(`ws://127.0.0.1:${PORT}`);

socket.on("connect", () => { console.log("connected"); });
socket.on("ping", () => { console.log("ping"); });
socket.on("disconnect", () => { console.log("disconnect"); });

let count = 0;

setInterval(() => {
    count++;
    socket.emit("chat", {
        toUserId: "63b51031-7efe-4874-a13c-f9cd314e453f",
        content: `Em yeu em ${count}!`,
        conversationId: 1
    });
}, 1000);
