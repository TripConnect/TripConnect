const http = require('http');
import 'dotenv/config';
import express, { Request, Response } from 'express';
import { Server } from 'socket.io';
import { instrument } from "@socket.io/admin-ui";
import cors from 'cors';
import { json } from 'body-parser';
const fs = require('fs')
const path = require('path');
import { expressMiddleware } from '@apollo/server/express4';
import jwt from 'jsonwebtoken';
import morgan from 'morgan';

import gqlServer from './services/graphql';
import logger from './utils/logging';
import { connect } from "mongoose";
import Conversations from './mongo/models/conversations';
import Messages from './mongo/models/messages';
import { graphqlUploadExpress } from 'graphql-upload-ts';
import ChatService from './services/grpc/chatService';

const PORT = process.env.PORT || 3107;
let accessLogStream = fs.createWriteStream(path.join(__dirname, '../log/access.log'), { flags: 'a' });

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
    }
});

app.use(morgan(':method :url :status :res[content-length] - :response-time ms', { stream: accessLogStream }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(graphqlUploadExpress({ maxFileSize: 10000000, maxFiles: 10 }))

connect(process.env.MONGODB_CONNECTION_STRING as string);

const chatNamespace = io.of('/chat');
chatNamespace.on("connection", async (socket) => {
    console.info("connected");
    let { token } = socket.handshake.auth;
    if (!token) {
        socket.disconnect(true);
        logger.warn({ "message": "Reject socketio connection" })
        return;
    }
    let { userId } = jwt.verify(token, process.env.SECRET_KEY || "") as { userId: string };
    socket.data.userId = userId;

    let rpcConversations = await ChatService.searchConversations({ memberIds: [userId] });

    for (let conversation of rpcConversations.conversations) {
        let room: String = conversation.conversationId;
        logger.info({
            message: "Join conversation",
            userId: socket.data.userId,
            conversationId: room,
        })
        socket.join(String(room));
    }

    socket.on("message", async (event) => {
        try {
            let { conversationId, content } = event;
            let rpcMessage = await ChatService.createChatMessage({ conversationId, messageContent: content, fromUserId: socket.data.userId });
            
            let chatPayload = {
                conversationId,
                fromUserId: socket.data.userId,
                content,
                createdAt: rpcMessage.createdAt,
            }
            logger.info(chatPayload);
            chatNamespace.to(conversationId).emit("message", chatPayload);
        } catch (error: any) {
            console.error(error);
            logger.error(error.message);
        }
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
                let userId: string | null = null;
                if (accessToken) {
                    let encoded = jwt.verify(accessToken, process.env.SECRET_KEY || "") as { userId: string };
                    userId = encoded.userId;
                }
                return {
                    token: accessToken,
                    currentUserId: userId,
                }
            }
        })
    ));

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
