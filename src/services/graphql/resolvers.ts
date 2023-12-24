import bcrypt from "bcrypt";
import { v4 as uuidv4 } from 'uuid';
import jwt from 'jsonwebtoken';
import { GraphQLError } from 'graphql';
import { QueryTypes, Op } from "sequelize";

import User from "../../database/models/user";
import UserCredential from "../../database/models/user_credential";
import Trip from "../../database/models/trip";
import logger from "../../utils/logging";
import TripUserList from "../../database/models/trip_user_list";
import Message from "../../database/models/message";
import Conversation from "../../database/models/conversation";
import db from "../../database/models";
import UserConversationList from "../../database/models/user_conversation_list";
import { log } from "winston";

const resolvers = {
    Query: {
        status: async () => {
            return { status: true };
        },
        user: async (
            _: any,
            { user_id }: { user_id: string }
        ) => {
            let user = await User.findOne({ where: { user_id }, limit: 50 });
            if (!user) throw new Error("User not found");
            let userCredential = await UserCredential.findOne({ where: { user_id: user.user_id } });
            let accessToken = jwt.sign(
                {
                    user_id: user.user_id,
                    username: user.username,
                    credential: userCredential.credential,
                },
                process.env.SECRET_KEY || ""
            );
            return {
                id: user.user_id,
                username: user.username,
                displayName: user.display_name,
                token: {
                    accessToken,
                },
            };
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
            { searchTerm }: { searchTerm: number },
            { token }: { token: string }
        ) => {
            let users = await User.findAll({
                where: {
                    display_name: { [Op.like]: `%${searchTerm}%` }
                }
            });
            return users.map((user: { [key: string]: any; }) => ({
                id: user.user_id,
                username: user.username,
                displayName: user.display_name,
                token: null,
            }))
        },
        conversations: async (
            _: any,
            { page = 1, limit = 10 }: { page: number, limit: number },
            { token }: { token: string }
        ) => {
            const nearByConversations = await db.sequelize.query(
                `SELECT DISTINCT conversation_id
                FROM message
                ORDER BY created_at
                LIMIT ${limit}
                OFFSET ${(page - 1) * limit}`,
                { type: QueryTypes.SELECT }
            );

            let conversations: object[] = [];
            for (let nearByConversation of nearByConversations) {
                let messages = await Message.findAll({
                    where: { conversation_id: nearByConversation.conversation_id },
                    order: ["created_at", "DESC" ? page < 0 : "ASC"],
                    limit: limit,
                    offset: (Math.abs(page) - 1) * limit,
                });
                let conversation = await Conversation.findOne({ where: { id: nearByConversation.conversation_id } });
                conversations.push({
                    conversation_id: nearByConversation.conversation_id,
                    name: conversation.name,
                    messages,
                })
            }
            return conversations;
        },
        conversation: async (
            _: any,
            { conversation_id, page = -1, limit = 100 }: { conversation_id: number, page: number, limit: number },
            { token }: { token: string }
        ) => {
            console.log({
                where: { conversation_id },
                order: [["created_at", page < 0 ? "DESC" : "ASC"]],
                limit: limit,
                offset: (Math.abs(page) - 1) * limit,
            });

            let messages = await Message.findAll({
                where: { conversation_id },
                order: [["created_at", page < 0 ? "DESC" : "ASC"]],
                limit: limit,
                offset: (Math.abs(page) - 1) * limit,
            });
            let conversation = await Conversation.findOne({ where: { id: conversation_id } });
            return {
                conversation_id,
                name: conversation.name,
                messages,
            }
        }
    },
    Mutation: {
        login: async (
            _: any,
            { username, password }: { username: string, password: string },
        ) => {
            try {
                let user = await User.findOne({ where: { username } });
                if (!user) throw new GraphQLError("User not found", {
                    extensions: {
                        code: 'NOT_FOUND',
                    }
                });

                let userCredential = await UserCredential.findOne({ where: { user_id: user.user_id } });
                const isPasswordValid = await bcrypt.compare(password, userCredential.credential);
                if (!isPasswordValid) throw new Error("Authorization failed");

                let accessToken = jwt.sign(
                    {
                        user_id: user.user_id,
                        username: user.username,
                        credential: userCredential.credential,
                    },
                    process.env.SECRET_KEY || ""
                );

                logger.info({ message: "Login success", user_id: user.user_id });
                return {
                    id: user.user_id,
                    username: user.username,
                    displayName: user.display_name,
                    token: {
                        accessToken,
                        refreshToken: "",
                    },
                }
            } catch (error) {
                console.log(error);

                return { token: null };
            }
        },

        signup: async (
            _: any,
            { username, password, display_name }: { username: string, password: string, display_name: string },
        ) => {
            try {
                const salt = await bcrypt.genSalt(12);
                const hashedPassword = await bcrypt.hash(password, salt);

                let user_id = uuidv4();

                let user = await User.create({
                    user_id,
                    username,
                    display_name,
                    created_at: new Date(),
                    updated_at: new Date(),
                });
                let userCredential = await UserCredential.create({
                    user_id: user.user_id,
                    credential: hashedPassword,
                });

                let accessToken = jwt.sign(
                    {
                        user_id: user.user_id,
                        username: user.username,
                        credential: userCredential.credential,
                    },
                    process.env.SECRET_KEY || ""
                );

                return {
                    id: user.user_id,
                    username: user.username,
                    displayName: user.display_name,
                    token: {
                        accessToken,
                    },
                };
            } catch (error) {
                throw new Error("Login incorrect");
            }
        },

        // createTrip: async (
        //     _: any,
        //     { name, description }: { name: string, description: string },
        //     { token }: { token: string }
        // ) => {
        //     let decoded = jwt.verify(token, process.env.SECRET_KEY || "") as { user_id: string };

        //     let trip = await Trip.create({
        //         name,
        //         description,
        //         created_by: decoded.user_id,
        //         created_at: new Date(),
        //     })
        //     return { trip_id: trip.id };
        // },

        // joinTrip: async (
        //     _: any,
        //     { trip_id }: { trip_id: number },
        //     { token }: { token: string }
        // ) => {
        //     let { user_id } = jwt.verify(token, process.env.SECRET_KEY || "") as { user_id: string };

        //     if (!Trip.findOne({ where: { id: trip_id } })) {
        //         throw new GraphQLError("Trip not found", {
        //             extensions: {
        //                 code: 'NOT_FOUND',
        //             }
        //         });
        //     }
        //     if (TripUserList.findOne({ where: { trip_id, user_id } })) {
        //         throw new GraphQLError("User in trip already", {
        //             extensions: {
        //                 code: 'BAD_REQUEST',
        //             }
        //         });
        //     }

        //     let tripUser = await TripUserList.create({
        //         trip_id,
        //         user_id,
        //     });
        //     return { trip_id: tripUser.trip_id, user_id: tripUser.user_id };
        // },

        createConversation: async (
            _: any,
            { name, members, type }: { name: string, members: string[], type: string },
            { token, currentUserId }: { token: string, currentUserId: string }
        ) => {
            let conversation: any;
            if (type === 'private') {
                let conversations = await db.sequelize.query(
                    `SELECT DISTINCT T1.conversation_id
                    FROM user_conversation_list T1 JOIN user_conversation_list T2
                    ON
                        T1.conversation_id = T2.conversation_id
                        AND T1.user_id = '${members[0]}'
                        AND T2.user_id = '${members[1]}';`,
                    { type: QueryTypes.SELECT }
                );
                if (conversations.length) {
                    conversation = await Conversation.findOne({
                        where: {
                            id: conversations[0].conversation_id
                        }
                    })
                } else {
                    conversation = await Conversation.create({ name, type });
                    for (let user_id of members) {
                        await UserConversationList.create({
                            conversation_id: conversation.id,
                            user_id,
                        })
                    }
                }
            } else {
                conversation = await Conversation.create({ name, type });
                for (let user_id of members) {
                    await UserConversationList.create({
                        conversation_id: conversation.id,
                        user_id,
                    })
                }
            }

            return {
                conversation_id: conversation.id,
                name: conversation.name,
                messages: [],
            };
        },
    },
};

export default resolvers;
