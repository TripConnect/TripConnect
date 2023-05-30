import { ApolloServer } from '@apollo/server';

import typeDefs from "./schemas";
import resolvers from "./resolvers";

const gqlServer = new ApolloServer({
    typeDefs,
    resolvers,
});

export default gqlServer;
