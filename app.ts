import express from 'express';
import routes from './routes';
import * as redis from 'redis';

const app = express();
const PORT = process.env.PORT || 4000;
const REDIS_URL = process.env.REDIS_URL || 'redis://redis-cache:6379';

console.log(REDIS_URL);

//Redis Connection
let redisClient = null;
const initRedisClient = async () => {
  redisClient = redis.createClient({ url: REDIS_URL });
  redisClient.on('error', (err) => {
    console.log('Redis Client Error', err);
  });
  await redisClient.connect();
};

(async () => {
  initRedisClient();
})();

//Start Express Server
app.use('/api', routes);
app.listen(PORT, () => {
  return console.log(`Server Started at http://localhost:${PORT}`);
});

export default redisClient;
