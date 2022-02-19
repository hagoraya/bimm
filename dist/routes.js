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
const axios_1 = __importDefault(require("axios"));
const xml_js_1 = __importDefault(require("xml-js"));
const getAllMakesUrl = "https://vpic.nhtsa.dot.gov/api/vehicles/getallmakes?format=XML";
const getVehicalTypesForMakeIdUrl = "https://vpic.nhtsa.dot.gov/api/vehicles/GetVehicleTypesForMakeId/";
const router = express_1.default.Router();
router.get("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const allMakesData = yield getAllMakes();
        res.status(200).send(allMakesData);
    }
    catch (error) {
        res.status(500).send(error.message);
    }
}));
function getAllMakes() {
    var _a, _b;
    return __awaiter(this, void 0, void 0, function* () {
        const allMakesResp = yield axios_1.default.get(getAllMakesUrl);
        if (allMakesResp.status === 200) {
            const data = xml_js_1.default.xml2json(allMakesResp.data, {
                compact: true,
            });
            try {
                const jsonData = JSON.parse(data);
                return (_b = (_a = jsonData === null || jsonData === void 0 ? void 0 : jsonData.Response) === null || _a === void 0 ? void 0 : _a.Results) === null || _b === void 0 ? void 0 : _b.AllVehicleMakes;
            }
            catch (error) {
                throw new Error(`Unable to parse JSON data`);
            }
        }
        else {
            throw new Error(`Failed to fetch all makes data. NHTSA Api responded with status: ${allMakesResp.status} `);
        }
    });
}
function GetVehiclesForMakeId(makeId) {
    return __awaiter(this, void 0, void 0, function* () { });
}
exports.default = router;
//# sourceMappingURL=routes.js.map