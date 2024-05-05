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
import ChatService from "../grpc/chatService";
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
            { page = 1, limit = 100, messageLimit = 10 }: { page: number, limit: number, messageLimit: number },
            { token, currentUserId }: { token: string, currentUserId: string }
        ) => {
            let result = [];
            let rpcConversations = await ChatService.searchConversations({ memberIds: [currentUserId], page, limit, messageLimit });
            for (let conversation of rpcConversations) {
                let rpcMembers = await UserService.searchUser({ userIds: conversation.members });
                result.push({
                    id: conversation.conversationId,
                    name: conversation?.name,
                    type: conversation?.type,
                    createdBy: null,
                    createdAt: conversation?.createdAt,
                    lastMessageAt: null,
                    members: rpcMembers.users,
                    messages: rpcConversations.messages,
                });
            }
            return result;
        },
        conversation: async (
            _: any,
            { id, page = -1, limit = 100 }: { id: string, page: number, limit: number },
            { token }: { token: string }
        ) => {
            try {
                let rpcConversation = await ChatService.findConversation({ conversationId: id, page: page, limit: limit });
                let rpcMembers = await UserService.searchUser({ userIds: rpcConversation.memberIds });

                let responseConversation = {
                    ...rpcConversation,
                    members: rpcMembers.users,
                };
                return responseConversation;
            } catch (error: any) {
                switch (error.code) {
                    case grpc.status.NOT_FOUND:
                        throw new GraphQLError("Conversation not found", {
                            extensions: {
                                code: StatusCode.BAD_REQUEST,
                            }
                        });
                    default:
                        logger.error(error.message);
                        throw new GraphQLError("Something went wrong", {
                            extensions: {
                                code: StatusCode.INTERNAL_SERVER_ERROR,
                            }
                        });
                }
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
            { type, name, members }: { type: string, name: string, members: string },
            { token, currentUserId }: { token: string, currentUserId: string }
        ) => {
            // Note: The new private conversation will not created if that is exist already
            try {
                let memberIds = members.split(",");
                let membersInfo = await UserService.searchUser({ userIds: memberIds });

                if (membersInfo.users.length !== memberIds.length) {
                    throw new GraphQLError("Member not found", {
                        extensions: {
                            code: StatusCode.NOT_FOUND,
                        }
                    });
                }

                let data = await ChatService.createConversation({
                    ownerId: currentUserId,
                    name,
                    memberIds: memberIds,
                    type,
                });

                return {
                    ...data,
                    members: membersInfo.users,
                };
            } catch (error: any) {
                if (error instanceof GraphQLError) throw error;
                switch (error.code) {
                    case grpc.status.NOT_FOUND:
                        throw new GraphQLError("Member not found", {
                            extensions: {
                                code: StatusCode.NOT_FOUND,
                            }
                        });
                    default:
                        logger.error(error.message);
                        throw new GraphQLError("Something went wrong", {
                            extensions: {
                                code: StatusCode.INTERNAL_SERVER_ERROR,
                            }
                        });
                }
            }
        },
    },
};

export default resolvers;
