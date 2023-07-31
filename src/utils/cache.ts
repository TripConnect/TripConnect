const redis = require('redis');

const client = redis.createClient({
    url: process.env.REDIS_URL,
});

client.on('error', (err: any) => console.log('Redis Client Error', err));

export async function cacheSocketId(user_id: string, socketId: string): Promise<void> {
    await client.set(`user:${user_id}:socket`, socketId);
}

export async function getSocketId(user_id: string): Promise<string> {
    let socketId = await client.get(`user:${user_id}:socket`) as string;
    return socketId;
}
