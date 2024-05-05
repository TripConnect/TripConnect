import bcrypt from "bcrypt";
import { v4 as uuidv4 } from 'uuid';
import jwt from 'jsonwebtoken';
import { GraphQLError } from 'graphql';
import { QueryTypes, Op } from "sequelize";
let grpc = require('@grpc/grpc-js');

import User from "../../database/models/user";
import UserCredential from "../../database/models/user_credential";
import logger from "../../utils/logging";
import Conversations from "../../mongo/models/conversations";
import Messages from "../../mongo/models/messages";
import { StatusCode } from "../../utils/graphql";
import { log } from "console";
import { finished } from "stream/promises";
import Trip from "../../database/models/trip";
import UserService from "../grpc/userService";
const { GraphQLUpload } = require('graphql-upload-ts');

const resolvers = {
    Upload: GraphQLUpload,
    Query: {
        status: async () => {
            return { status: true };
        },
        user: async (
            _: any,
            { user_id }: { user_id: string }
        ) => {
            let data = await UserService.findUser({ userId: user_id });
            return data;
        },
        // loadTripMembers: async (
        //     _: any,
        //     { trip_id }: { trip_id: number },
        //     { token }: { token: string }
        // ) => {
        //     let { user_id } = jwt.verify(token, process.env.SECRET_KEY || "") as { user_id: string };
        //     if (!TripUserList.findOne({ where: { trip_id, user_id } })) {
        //         throw new GraphQLError("Cannot get trip members", {
        //             extensions: {
        //                 code: 'FORBIDDEN',
        //             }
        //         });
        //     }
        //     let tripMembers = await TripUserList.findAll({ where: { trip_id } });
        //     return tripMembers.map((member: { [key: string]: any; }) => ({ trip_id: member.trip_id, user_id: member.user_id }));
        // },
        users: async (
            _: any,
            { searchTerm }: { searchTerm: string },
            { token }: { token: string }
        ) => {
            let data = await UserService.searchUser({ term: searchTerm });
            return data.users;
        },
        conversations: async (
            _: any,
            { page = 1, limit = 100 }: { page: number, limit: number },
            { token }: { token: string }
        ) => {
            let result: any = [];
            let conversations = await Conversations
                .find()
                .skip(limit * (Math.abs(page) - 1))
                .limit(limit)
                .exec();
            for (let conversation of conversations) {
                let messages = await Messages
                    .find({ conversationId: conversation.conversationId })
                    .sort({ createdAt: -1 })
                    .skip(limit * (Math.abs(page) - 1))
                    .limit(limit)
                    .exec();

                let members = await Promise.all(conversation.members.map(userId => User.findOne({ where: { user_id: userId } })));
                result.push({
                    id: conversation.conversationId,
                    name: conversation?.name,
                    type: conversation?.type,
                    createdBy: null,
                    createdAt: conversation?.createdAt,
                    lastMessageAt: null,
                    members: members.map(({ user_id, display_name }) => ({ id: user_id, displayName: display_name })),
                    messages: messages.map(({ messageId, fromUserId, messageContent, createdAt }) => {
                        let fromUser = { id: fromUserId }
                        return { id: messageId, messageContent, createdAt, fromUser }
                    }),
                });
            }
            return result;
        },
        conversation: async (
            _: any,
            { id, page = -1, limit = 100 }: { id: string, page: number, limit: number },
            { token }: { token: string }
        ) => {
            let conversation = await Conversations.findOne({ conversationId: id });
            if (!conversation) {
                throw new GraphQLError("Conversation not found", {
                    extensions: { code: StatusCode.NOT_FOUND }
                });
            }
            console.log({ id });
            let messages = await Messages
                .find({ conversationId: id })
                .sort({ createdAt: page < 0 ? -1 : 1 })
                .skip(limit * (Math.abs(page) - 1))
                .limit(limit)
                .exec();

            let members = await Promise.all(conversation.members.map(userId => User.findOne({ where: { user_id: userId } })));
            return {
                id,
                name: conversation?.name,
                type: conversation?.type,
                createdBy: null,
                createdAt: conversation?.createdAt,
                lastMessageAt: null,
                members: members.map(({ user_id, display_name }) => ({ id: user_id, displayName: display_name })),
                messages: messages.map(({ messageId, fromUserId, messageContent, createdAt }) => {
                    let fromUser = { id: fromUserId }
                    return { id: messageId, messageContent, createdAt, fromUser }
                }),
            }
        }
    },
    Mutation: {
        signin: async (
            _: any,
            { username, password }: { username: string, password: string },
        ) => {
            try {
                let response = await UserService.signin({ username, password });
                return response;
            } catch (err: any) {
                switch (err.code) {
                    case grpc.status.INVALID_ARGUMENT:
                        throw new GraphQLError("Authorization failed", {
                            extensions: {
                                code: StatusCode.BAD_REQUEST,
                            }
                        });
                    default:
                        throw new GraphQLError("Something went wrong", {
                            extensions: {
                                code: StatusCode.INTERNAL_SERVER_ERROR,
                            }
                        });
                }             
            }
        },

        signup: async (
            _: any,
            { username, password, displayName, avatar }: { username: string, password: string, displayName: string, avatar: Promise<any> },
        ) => {
            let avatarURL = null;
            if (avatar !== undefined) {
                const { createReadStream, filename, mimetype, encoding } = await avatar;
                const stream = createReadStream();
                avatarURL = `/upload/${uuidv4()}.${filename.split('.').at(-1)}`;
                const out = require('fs').createWriteStream(process.env.STATIC_DIRECTORY + avatarURL);
                stream.pipe(out);
                await finished(out);
            }
            try {
                let response = await UserService.signup({ username, password, displayName, avatarURL });
                return response;
            } catch (err: any) {
                switch (err.code) {
                    case grpc.status.INVALID_ARGUMENT:
                        throw new GraphQLError("Username is already exist", {
                            extensions: {
                                code: StatusCode.CONFLICT,
                            }
                        });
                    default:
                        throw new GraphQLError("Something went wrong", {
                            extensions: {
                                code: StatusCode.INTERNAL_SERVER_ERROR,
                            }
                        });
                }
            }
        },

        createTrip: async (
            _: any,
            { name, description }: { name: string, description: string },
            { token, currentUserId }: { token: string, currentUserId: string }
        ) => {
            let trip = await Trip.create({
                id: uuidv4(),
                name,
                description,
                created_at: new Date(),
                created_by: currentUserId,
            });
            return {
                id: trip.id,
                name: trip.name,
                description: trip.description,
                createdBy: {
                    id: currentUserId,
                },
                members: [],
                points: [],
                createdAt: trip.createdAt,
            };
        },

        createConversation: async (
            _: any,
            { name, members, type }: { name: string, members: string, type: string },
            { token, currentUserId }: { token: string, currentUserId: string }
        ) => {
            switch (type) {
                case "PRIVATE":
                    console.log({ members });
                    let existConversation = await Conversations.findOne({
                        type: "PRIVATE",
                        members: { $all: members.split(",") }
                    });
                    if (existConversation) {
                        return {
                            id: existConversation.conversationId,
                            name: existConversation.name,
                            members: existConversation.members,
                            messages: [],
                            type: existConversation.type,
                            createdBy: existConversation.createdBy,
                            createdAt: existConversation.createdAt,
                            lastMessageAt: existConversation.lastMessageAt,
                        }
                    }

                    let conversation = await new Conversations({
                        conversationId: uuidv4(),
                        name: null,
                        type,
                        members: members.split(","),
                        createdBy: currentUserId,
                        lastMessageAt: null,
                    }).save();

                    return {
                        id: conversation.conversationId,
                        name: conversation.baseModelName,
                        members: conversation.members,
                        messages: [],
                        type: conversation.type,
                        createdBy: conversation.createdBy,
                        createdAt: conversation.createdAt,
                        lastMessageAt: conversation.lastMessageAt,
                    }
            }
        },
    },
};

export default resolvers;
