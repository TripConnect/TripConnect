const http = require('http');
import express, { Request, Response } from 'express';
const { Server } = require("socket.io");

import { TripMemberLocation } from './services/socketio';

const app = express();
const server = http.createServer(app);
const io = new Server(server);
const PORT = process.env.PORT || 3000;

new TripMemberLocation(io).listen();

app.get('/', (req: Request, res: Response) => {
  res.send('Hello, Express with TypeScript!');
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
