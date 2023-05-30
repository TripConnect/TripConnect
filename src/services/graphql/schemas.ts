const typeDefs = `
    type User {
        user_id: ID!
    }

    type Token {
        user_id: ID!
        access_token: String!
        refresh_token: String!
    }

    type AuthPayload {
        token: Token
    }

    type Query {
        access_token: Token!
    }

    type Mutation {
        login(username: String!, password: String!): AuthPayload!
        register(username: String!, password: String!): User
    }
`;


export default typeDefs;
