"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const routes_1 = __importDefault(require("./routes"));
const app = (0, express_1.default)();
const PORT = 3000;
//Start Express Server
app.use("/api", routes_1.default);
app.listen(PORT, () => {
    return console.log(`Server Started at http://localhost:${PORT}`);
});
//# sourceMappingURL=app.js.map