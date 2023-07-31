const http = require('http');
import 'dotenv/config';
import express, { Request, Response } from 'express';
import { Server } from 'socket.io';
import cors from 'cors';
import { json } from 'body-parser';
const fs = require('fs')
const path = require('path');
import { expressMiddleware } from '@apollo/server/express4';
import morgan from 'morgan';

import gqlServer from './services/graphql';
import { cacheSocketId, getSocketId } from './utils/cache';
import logger from './utils/logging';

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
    }
});
const PORT = process.env.PORT || 3000;

let accessLogStream = fs.createWriteStream(path.join(__dirname, 'log/access.log'), { flags: 'a' });
app.use(morgan(':method :url :status :res[content-length] - :response-time ms', { stream: accessLogStream }));

io.on("connection", async (socket) => {
    console.info("connected");

    socket.on("login", async (payload) => {
        let { user_id } = payload;
        logger.debug({ message: "User login", user_id, socketId: socket.id });
        await cacheSocketId(user_id, socket.id);
    });

    socket.on("chat", async (payload) => {
        let { to_user_id, message } = JSON.parse(payload);
        let to_socket_id = await getSocketId(to_user_id);
        logger.debug({ message: "Chat", chatMessage: message, to_user_id });
        socket.to(to_socket_id).emit("chat", JSON.stringify({ message }));
    });
});

app.get('/status', (req: Request, res: Response) => {
    res.status(200).json({ status: "OK", });
});

gqlServer
    .start()
    .then(() => app.use(
        '/graphql',
        cors<cors.CorsRequest>(),
        json(),
        expressMiddleware(gqlServer, {
            context: async ({ req, res }) => {
                return {
                    token: req.headers.authorization?.split(" ")[1],
                }
            }
        })
    ));

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
