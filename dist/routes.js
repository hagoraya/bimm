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
const app_1 = __importDefault(require("./app"));
const errors_1 = require("./errors");
const AllMakesUrl = 'https://vpic.nhtsa.dot.gov/api/vehicles/getallmakes?format=XML';
const VehicalTypesForMakeIdBaseUrl = 'https://vpic.nhtsa.dot.gov/api/vehicles/GetVehicleTypesForMakeId';
const LIMIT_API_TO = process.env.LIMIT_API_TO || 500;
const router = express_1.default.Router();
router.get('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const allMakesData = yield getAllMakes();
        let normalizedMakesData = allMakesData.map((make) => {
            const make_vehicale = {
                makeId: make.Make_ID._text,
                makeName: make.Make_Name._text,
                vehicleTypes: [],
            };
            return make_vehicale;
        });
        let resultsMap = new Map();
        normalizedMakesData.forEach((make) => {
            if (resultsMap.size <= LIMIT_API_TO) {
                resultsMap.set(make.makeId, make);
            }
        });
        const vehicalsData = yield GetVehiclesForMakeId(resultsMap);
        const cacheArray = [];
        const responseMap = new Map();
        vehicalsData.forEach((obj) => {
            if (obj.status === 'fulfilled') {
                responseMap.set(obj.value[0], obj.value[1]);
                cacheArray.push(obj.value[0]);
                cacheArray.push(JSON.stringify(obj.value[1]));
            }
        });
        yield app_1.default.MSET(cacheArray, (err) => {
            if (err) {
                res.status(500).send('Error saving data');
            }
        });
        const cache = yield app_1.default.GET('440');
        res.status(200).send([...responseMap.values()]);
    }
    catch (error) {
        res.status(error.statusCode || 500).send(error.message);
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
            throw new errors_1.ApiError('Failed to parse response data', 500);
        }
    });
}
function GetVehiclesForMakeId(resultsMap) {
    return __awaiter(this, void 0, void 0, function* () {
        const result = yield Promise.allSettled(Array.from(resultsMap, ([key, value]) => __awaiter(this, void 0, void 0, function* () {
            const cachedData = yield app_1.default.GET(key);
            if (cachedData) {
                const vehicleTypes = JSON.parse(cachedData).vehicleTypes;
                return [
                    key,
                    (value = Object.assign(Object.assign({}, value), { vehicleTypes })),
                ];
            }
            const vehicleTypeArray = yield fetchVehicleDetails(key);
            const normalizedVehicleTypes = vehicleTypeArray.map((vtype) => {
                return {
                    typeId: vtype.VehicleTypeId._text,
                    typeName: vtype.VehicleTypeName._text,
                };
            });
            return [
                key,
                (value = Object.assign(Object.assign({}, value), { vehicleTypes: normalizedVehicleTypes })),
            ];
        })));
        return result;
    });
}
function fetchVehicleDetails(makeId) {
    return __awaiter(this, void 0, void 0, function* () {
        const getVehiclesFromMakeIdUrl = `${VehicalTypesForMakeIdBaseUrl}/${makeId}?format=xml`;
        const getVehiclesResp = yield axios_1.default.get(getVehiclesFromMakeIdUrl);
        const data = handleApiResponse(getVehiclesResp);
        const jsonData = JSON.parse(data).Response.Results.VehicleTypesForMakeIds;
        if (Array.isArray(jsonData)) {
            return jsonData;
        }
        else {
            return [jsonData];
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
        throw new errors_1.ApiError(`Failed to fetch data. NHTSA API responded with: ${response}`, 500);
    }
}
exports.default = router;
//# sourceMappingURL=routes.js.map