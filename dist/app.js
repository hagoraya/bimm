"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const routes_1 = __importDefault(require("./routes"));
const redis_1 = require("redis");
const app = (0, express_1.default)();
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
(() => __awaiter(void 0, void 0, void 0, function* () {
    const client = (0, redis_1.createClient)();
    client.on("error", (err) => console.log("Redis Client Error", err));
    yield client.connect();
    yield client.set("key", "value");
    const value = yield client.get("key");
}))();
//Start Express Server
app.use("/api", routes_1.default);
app.listen(PORT, () => {
    return console.log(`Server Started at http://localhost:${PORT}`);
});
// export default redisClient;
//# sourceMappingURL=app.js.map