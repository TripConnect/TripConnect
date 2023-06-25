import { readFileSync } from 'fs';
import { ApolloServer } from '@apollo/server';

import resolvers from "./resolvers";
const typeDefs = readFileSync(__dirname + '/schema.graphql', { encoding: 'utf-8' });

interface CustomContext {
    token?: String;
}

const gqlServer = new ApolloServer<CustomContext>({
    typeDefs,
    resolvers,
});

export default gqlServer;
