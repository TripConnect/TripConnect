const typeDefs = `
    type User {
        user_id: ID
    }

    type Token {
        user_id: ID!
        access_token: String!
    }

    type Trip {
        trip_id: String!
    }

    type AuthPayload {
        token: Token
    }

    type StatusPayload {
        status: Boolean!
    }

    type Query {
        status: StatusPayload
    }

    type Mutation {
        login(username: String!, password: String!): AuthPayload!
        register(username: String!, password: String!): User
        createTrip(name: String!): Trip!
    }
`;


export default typeDefs;
