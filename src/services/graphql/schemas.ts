import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';

const typeDefs = `
  type Token {
    user_id: ID!
    access_token: String
    refresh_token: String
  }

  type Query {
    access_token: Token
  }
`;


export default typeDefs;
