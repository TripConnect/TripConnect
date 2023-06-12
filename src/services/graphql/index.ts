import { ApolloServer } from '@apollo/server';

import typeDefs from "./schemas";
import resolvers from "./resolvers";

interface CustomContext {
    token?: String;
}

const gqlServer = new ApolloServer<CustomContext>({
    typeDefs,
    resolvers,
});

export default gqlServer;
