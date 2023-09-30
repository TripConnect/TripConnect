const redis = require("redis");
const client = redis.createClient();

client.on("error", function (error) {
    console.error(error);
});

client.set("key", "value");
client.get("key", (err, res) => {
    console.log({ err, res });
});