const resolvers = {
    Query: {
        access_token: () => ({ user_id: "u001", access_token: "abc", refresh_token: "def" }),
    },
};

export default resolvers;
