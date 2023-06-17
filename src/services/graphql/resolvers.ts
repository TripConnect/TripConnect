import bcrypt from "bcrypt";
import { v4 as uuidv4 } from 'uuid';
import jwt from 'jsonwebtoken';

import User from "../../database/models/user";
import UserCredential from "../../database/models/user_credential";

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

                let accessToken = jwt.sign({ username: user.username, password: userCredential.credential }, 'shhhhh');

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
    },
};

export default resolvers;
