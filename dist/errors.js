"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiError = void 0;
class ApiError extends Error {
    constructor(msg, statusCode) {
        super(msg);
        this.message = msg;
        this.statusCode = statusCode;
    }
}
exports.ApiError = ApiError;
//# sourceMappingURL=errors.js.map