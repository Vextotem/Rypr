import Redis from "ioredis";

const redisClient = new Redis("rediss://default:AZuUAAIjcDE0MmJhNzJjZjJmYmU0M2U1YjVlMmI4NTI0OTQxNDQ4MHAxMA@frank-oryx-39828.upstash.io:6379");

redisClient.on("error", (err) => console.error("Redis Error:", err));

export default redisClient;
