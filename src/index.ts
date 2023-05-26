const http = require('http');
import express, { Request, Response } from 'express';
import { TripMemberLocation } from './services/socketio';

const app = express();

const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

new TripMemberLocation(io).listen();


const PORT = process.env.PORT || 3000;

app.get('/', (req: Request, res: Response) => {
  res.send('Hello, Express with TypeScript!');
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
