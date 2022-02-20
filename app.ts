import express from "express";
import routes from "./routes";
import redis from "redis";

const app = express();
const PORT = 3000;

//Start Redis Connection

let redisClient = null;
const initRedisClient = () => {
  redisClient = redis.createClient();
  redisClient.on("error", (err) => {
    console.log("Redis Client Error", err);
  });
};

(async () => {
  initRedisClient();
})();

//Start Express Server
app.use("/api", routes);
app.listen(PORT, () => {
  return console.log(`Server Started at http://localhost:${PORT}`);
});

export default redisClient;
