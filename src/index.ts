const http = require('http');
import 'dotenv/config';
import express, { Request, Response } from 'express';
import { Server } from 'socket.io';
import cors from 'cors';
import { json } from 'body-parser';
const fs = require('fs')
const path = require('path');
import { expressMiddleware } from '@apollo/server/express4';
import jwt from 'jsonwebtoken';
import morgan from 'morgan';

import gqlServer from './services/graphql';
import { cacheSocketId, getSocketId } from './utils/cache';
import logger from './utils/logging';
import Message from './database/models/message';
import User from './database/models/user';
import Conversation from './database/models/conversation';
import { Op } from 'sequelize';

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
    let { token } = socket.handshake.auth;
    if (!token) {
        socket.disconnect(true);
        return;
    }
    let { user_id } = jwt.verify(token, process.env.SECRET_KEY || "") as { user_id: string };
    let user = await User.findOne({ where: { user_id } });
    await cacheSocketId(user.user_id, socket.id);

    socket.on("chat", async (payload) => {
        console.debug({ "topic": "chat", payload })
        const SIMULATION_USER_IDS = ["fddb3428-9c04-45b3-9455-dbd7650bb8ba"];

        let { token } = socket.handshake.auth;
        let { user_id } = jwt.verify(token, process.env.SECRET_KEY || "") as { user_id: string };
        let { toUserId, content, conversationId } = payload;
        let to_socket_id = await getSocketId(toUserId);

        if (!SIMULATION_USER_IDS.find(user_id_item => user_id_item === user_id)) {
            await Message.create({
                conversation_id: conversationId,
                from_user_id: user_id,
                to_user_id: toUserId,
                content,
                created_at: new Date(),
                state: 'sent',
            });
        }

        socket.to(to_socket_id).emit("chat", JSON.stringify({ fromUserId: user_id, toUserId: toUserId, content }));
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
                let accessToken = req.headers.authorization?.split(" ")[1] as string;
                let user_id: string | null = null;
                if (accessToken) {
                    let encoded = jwt.verify(accessToken, process.env.SECRET_KEY || "") as { user_id: string };
                    user_id = encoded.user_id;
                }
                return {
                    token: accessToken,
                    currentUserId: user_id,
                }
            }
        })
    ));

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
