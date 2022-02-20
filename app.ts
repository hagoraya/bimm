import express from "express";
import routes from "./routes";
import { createClient } from "redis";

const app = express();
const PORT = 3000;

//Start Redis Connection

// let redisClient = null;
// const initRedisClient = async () => {
//   redisClient = createClient();
//   redisClient.on("error", (err) => {
//     console.log("Redis Client Error", err);
//   });
//   await redisClient.connect();
// };

// (async () => {
//   initRedisClient();
// })();

(async () => {
  const client = createClient();

  client.on("error", (err) => console.log("Redis Client Error", err));

  await client.connect();

  await client.set("key", "value");
  const value = await client.get("key");
})();

//Start Express Server
app.use("/api", routes);
app.listen(PORT, () => {
  return console.log(`Server Started at http://localhost:${PORT}`);
});

// export default redisClient;
