import { readFileSync } from 'fs';
import { ApolloServer } from '@apollo/server';
const { ApolloServerPluginLandingPageLocalDefault } = require('apollo-server-core');

import resolvers from "./resolvers";
const typeDefs = readFileSync(__dirname + '/schema.graphql', { encoding: 'utf-8' });

interface CustomContext {
    token?: String;
}

const gqlServer = new ApolloServer<CustomContext>({
    typeDefs,
    resolvers,
    csrfPrevention: true,
    cache: 'bounded',
    plugins: [ApolloServerPluginLandingPageLocalDefault({ embed: true })],
});

export default gqlServer;
