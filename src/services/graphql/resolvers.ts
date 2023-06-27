import bcrypt from "bcrypt";
import { v4 as uuidv4 } from 'uuid';
import jwt from 'jsonwebtoken';
import { GraphQLError } from 'graphql';

import User from "../../database/models/user";
import UserCredential from "../../database/models/user_credential";
import Trip from "../../database/models/trip";
import logger from "../../utils/logging";
import TripUserList from "../../database/models/trip_user_list";
import { log } from "winston";

const resolvers = {
    Query: {
        status: async () => {
            return { status: true };
        }
    },
    Mutation: {
        login: async (
            _: any,
            { username, password }: { username: string, password: string },
        ) => {
            try {
                let user = await User.findOne({ where: { username } });
                if (!user) throw new Error("User not found");

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
                    token: { user_id: user.user_id, access_token: accessToken }
                }
            } catch (error) {
                console.log(error);

                return { token: null };
            }
        },

        register: async (
            _: any,
            { username, password }: { username: string, password: string },
        ) => {
            try {
                const salt = await bcrypt.genSalt(12);
                const hashedPassword = await bcrypt.hash(password, salt);

                let user_id = uuidv4();

                let user = await User.create({
                    user_id,
                    username,
                    created_at: new Date(),
                    updated_at: new Date(),
                });

                await UserCredential.create({
                    user_id: user.user_id,
                    credential: hashedPassword,
                });

                return { user_id: user.user_id };
            } catch (error) {
                return { user_id: null };
            }
        },

        createTrip: async (
            _: any,
            { name, description }: { name: string, description: string },
            { token }: { token: string }
        ) => {
            let decoded = jwt.verify(token, process.env.SECRET_KEY || "") as { user_id: string };

            let trip = await Trip.create({
                name,
                description,
                created_by: decoded.user_id,
                created_at: new Date(),
            })
            return { trip_id: trip.id };
        },

        joinTrip: async (
            _: any,
            { trip_id }: { trip_id: number },
            { token }: { token: string }
        ) => {
            let { user_id } = jwt.verify(token, process.env.SECRET_KEY || "") as { user_id: string };

            if (!Trip.findOne({ where: { id: trip_id } })) {
                throw new GraphQLError("Trip not found", {
                    extensions: {
                        code: 'NOT_FOUND',
                    }
                });
            }
            if (TripUserList.findOne({ where: { trip_id, user_id } })) {
                throw new GraphQLError("User in trip already", {
                    extensions: {
                        code: 'BAD_REQUEST',
                    }
                });
            }

            let tripUser = await TripUserList.create({
                trip_id,
                user_id,
            });
            return { trip_id: tripUser.trip_id, user_id: tripUser.user_id };
        },

        loadTripMembers: async (
            _: any,
            { trip_id }: { trip_id: number },
            { token }: { token: string }
        ) => {
            let { user_id } = jwt.verify(token, process.env.SECRET_KEY || "") as { user_id: string };
            if (!TripUserList.findOne({ where: { trip_id, user_id } })) {
                throw new GraphQLError("Cannot get trip members", {
                    extensions: {
                        code: 'FORBIDDEN',
                    }
                });
            }
            let tripMembers = await TripUserList.findAll({ where: { trip_id } });
            return tripMembers.map((member: { [key: string]: any; }) => ({ trip_id: member.trip_id, user_id: member.user_id }));
        },
    },
};

export default resolvers;
