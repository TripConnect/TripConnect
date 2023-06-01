const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');

import User from "../../database/models/user";
import UserCredential from "../../database/models/user_credential";

const resolvers = {
    Query: {
        access_token: () => ({ user_id: "u001", access_token: "abc", refresh_token: "def" }),
    },
    Mutation: {
        login: async (
            _: any,
            { username, password }: { username: string, password: string },
            // { dataSources }: { dataSources: any }
        ) => {
            return {
                token: { user_id: "u001", access_token: "abc", refresh_token: "def" }
            }
        },

        register: async (
            _: any,
            { username, password }: { username: string, password: string },
            // { dataSources }: { dataSources: any }
        ) => {
            const salt = await bcrypt.genSalt(12);
            const hashedPassword = await bcrypt.hash(password, salt);

            let user_id = uuidv4();

            await User.create({
                user_id,
                username,
                created_at: new Date(),
                updated_at: new Date(),
            });

            await UserCredential.create({
                user_id: uuidv4(),
                credential: hashedPassword,
                created_at: new Date(),
                updated_at: new Date(),
            });

            const isPasswordValid = await bcrypt.compare(password, hashedPassword);
            if (isPasswordValid) {
                return { user_id: "u002" }
            } else {
                throw new Error("User invalid")
            }
        },
    },
};

export default resolvers;
