"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
exports.__esModule = true;
var express_1 = require("express");
var axios_1 = require("axios");
var xml_js_1 = require("xml-js");
var app_1 = require("./app");
var errors_1 = require("./errors");
var AllMakesUrl = 'https://vpic.nhtsa.dot.gov/api/vehicles/getallmakes?format=XML';
var VehicalTypesForMakeIdBaseUrl = 'https://vpic.nhtsa.dot.gov/api/vehicles/GetVehicleTypesForMakeId';
var router = express_1["default"].Router();
router.get('/', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var allMakesData, normalizedMakesData, resultsMap_1, vehicalsData, cacheArray_1, responseMap_1, cache, error_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 5, , 6]);
                return [4 /*yield*/, getAllMakes()];
            case 1:
                allMakesData = _a.sent();
                normalizedMakesData = allMakesData.map(function (make) {
                    var make_vehicale = {
                        makeId: make.Make_ID._text,
                        makeName: make.Make_Name._text,
                        vehicleTypes: []
                    };
                    return make_vehicale;
                });
                resultsMap_1 = new Map();
                normalizedMakesData.forEach(function (make) {
                    if (resultsMap_1.size <= 5) {
                        resultsMap_1.set(make.makeId, make);
                    }
                });
                return [4 /*yield*/, GetVehiclesForMakeId(resultsMap_1)];
            case 2:
                vehicalsData = _a.sent();
                cacheArray_1 = [];
                responseMap_1 = new Map();
                vehicalsData.forEach(function (obj) {
                    if (obj.status === 'fulfilled') {
                        responseMap_1.set(obj.value[0], obj.value[1]);
                        cacheArray_1.push(obj.value[0]);
                        cacheArray_1.push(JSON.stringify(obj.value[1]));
                    }
                });
                return [4 /*yield*/, app_1["default"].MSET(cacheArray_1, function (err) {
                        if (err) {
                            res.status(500).send('Error saving data');
                        }
                    })];
            case 3:
                _a.sent();
                return [4 /*yield*/, app_1["default"].GET('440')];
            case 4:
                cache = _a.sent();
                res.status(200).send(__spreadArray([], responseMap_1.values(), true));
                return [3 /*break*/, 6];
            case 5:
                error_1 = _a.sent();
                res.status(error_1.statusCode || 500).send(error_1.message);
                return [3 /*break*/, 6];
            case 6: return [2 /*return*/];
        }
    });
}); });
function getAllMakes() {
    return __awaiter(this, void 0, void 0, function () {
        var allMakesResp, data, jsonData;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, axios_1["default"].get(AllMakesUrl)];
                case 1:
                    allMakesResp = _a.sent();
                    data = handleApiResponse(allMakesResp);
                    try {
                        jsonData = JSON.parse(data);
                        return [2 /*return*/, jsonData.Response.Results.AllVehicleMakes];
                    }
                    catch (error) {
                        throw new errors_1.ApiError('Failed to parse response data', 500);
                    }
                    return [2 /*return*/];
            }
        });
    });
}
function GetVehiclesForMakeId(resultsMap) {
    return __awaiter(this, void 0, void 0, function () {
        var result;
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, Promise.allSettled(Array.from(resultsMap, function (_a) {
                        var key = _a[0], value = _a[1];
                        return __awaiter(_this, void 0, void 0, function () {
                            var cachedData, vehicleTypes, vehicleTypeArray, normalizedVehicleTypes;
                            return __generator(this, function (_b) {
                                switch (_b.label) {
                                    case 0: return [4 /*yield*/, app_1["default"].GET(key)];
                                    case 1:
                                        cachedData = _b.sent();
                                        if (cachedData) {
                                            vehicleTypes = JSON.parse(cachedData).vehicleTypes;
                                            return [2 /*return*/, [
                                                    key,
                                                    (value = __assign(__assign({}, value), { vehicleTypes: vehicleTypes })),
                                                ]];
                                        }
                                        return [4 /*yield*/, fetchVehicleDetails(key)];
                                    case 2:
                                        vehicleTypeArray = _b.sent();
                                        normalizedVehicleTypes = vehicleTypeArray.map(function (vtype) {
                                            return {
                                                typeId: vtype.VehicleTypeId._text,
                                                typeName: vtype.VehicleTypeName._text
                                            };
                                        });
                                        return [2 /*return*/, [
                                                key,
                                                (value = __assign(__assign({}, value), { vehicleTypes: normalizedVehicleTypes })),
                                            ]];
                                }
                            });
                        });
                    }))];
                case 1:
                    result = _a.sent();
                    return [2 /*return*/, result];
            }
        });
    });
}
function fetchVehicleDetails(makeId) {
    return __awaiter(this, void 0, void 0, function () {
        var getVehiclesFromMakeIdUrl, getVehiclesResp, data, jsonData;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    getVehiclesFromMakeIdUrl = "".concat(VehicalTypesForMakeIdBaseUrl, "/").concat(makeId, "?format=xml");
                    return [4 /*yield*/, axios_1["default"].get(getVehiclesFromMakeIdUrl)];
                case 1:
                    getVehiclesResp = _a.sent();
                    data = handleApiResponse(getVehiclesResp);
                    jsonData = JSON.parse(data).Response.Results.VehicleTypesForMakeIds;
                    if (Array.isArray(jsonData)) {
                        return [2 /*return*/, jsonData];
                    }
                    else {
                        return [2 /*return*/, [jsonData]];
                    }
                    return [2 /*return*/];
            }
        });
    });
}
function handleApiResponse(response) {
    if (response.status === 200) {
        var data = xml_js_1["default"].xml2json(response.data, {
            compact: true
        });
        return data;
    }
    else {
        throw new errors_1.ApiError("Failed to fetch data. NHTSA API responded with: ".concat(response), 500);
    }
}
exports["default"] = router;
