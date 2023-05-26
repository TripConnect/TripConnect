const http = require('http');
import express, { Request, Response } from 'express';
import { Server } from 'socket.io';


import { Test, TripMemberLocation } from './services/socketio';

const app = express();
const server = http.createServer(app);
const io = new Server(server);
const PORT = process.env.PORT || 3000;

io.on("connection", async (socket) => {
  console.info("connected");

  socket.on(Test.TOPIC, (payload) => Test.handle(server, JSON.parse(payload)));
  socket.on(TripMemberLocation.TOPIC, (payload) => TripMemberLocation.handle(server, JSON.parse(payload)));
});

app.get('/', (req: Request, res: Response) => {
  res.send('Hello, Express with TypeScript!');
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
