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
const errors_1 = require("./errors");
const AllMakesUrl = "https://vpic.nhtsa.dot.gov/api/vehicles/getallmakes?format=XML";
const VehicalTypesForMakeIdBaseUrl = "https://vpic.nhtsa.dot.gov/api/vehicles/GetVehicleTypesForMakeId/";
const router = express_1.default.Router();
router.get("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const allMakesData = yield getAllMakes();
        const allVehiclasTypes = yield GetVehiclesForMakeId(allMakesData[0].Make_ID._text);
        res.status(200).send(allVehiclasTypes);
    }
    catch (error) {
        res.status(error.statusCode ? error.statusCode : 500).send(error.message);
    }
}));
function getAllMakes() {
    return __awaiter(this, void 0, void 0, function* () {
        const allMakesResp = yield axios_1.default.get(AllMakesUrl);
        const data = handleApiResponse(allMakesResp);
        try {
            const jsonData = JSON.parse(data);
            return jsonData.Response.Results.AllVehicleMakes;
        }
        catch (error) {
            throw new errors_1.ApiError("Failed to parse response data", 500);
        }
    });
}
function GetVehiclesForMakeId(makeId) {
    return __awaiter(this, void 0, void 0, function* () {
        const getVehiclesFromMakeIdUrl = `${VehicalTypesForMakeIdBaseUrl}/${makeId}?format=xml`;
        const getVehiclesResp = yield axios_1.default.get(getVehiclesFromMakeIdUrl);
        const data = handleApiResponse(getVehiclesResp);
        try {
            const jsonData = JSON.parse(data);
            return jsonData.Response.Results.VehicleTypesForMakeIds;
        }
        catch (error) {
            throw new errors_1.ApiError("Failed to parse response data", 500);
        }
    });
}
function handleApiResponse(response) {
    if (response.status === 200) {
        const data = xml_js_1.default.xml2json(response.data, {
            compact: true,
        });
        return data;
    }
    else {
        throw new errors_1.ApiError(`Failed to fetch data. NHTSA API responded with status: ${response.status}`, 500);
    }
}
exports.default = router;
//# sourceMappingURL=routes.js.map