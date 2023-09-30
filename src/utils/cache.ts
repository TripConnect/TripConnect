const redis = require('redis');

const client = redis.createClient({
    url: process.env.REDIS_URL,
});

client.on('error', (err: any) => console.error('Redis Client Error', err));

export function cacheSocketId(user_id: string, socketId: string, callback: Function = () => { }): void {
    client.set(`user:${user_id}:socket`, socketId, callback);
}

export function getSocketId(user_id: string, callback: Function): void {
    client.get(`user:${user_id}:socket`, callback);
}
