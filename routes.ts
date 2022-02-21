import express from 'express';
import axios, { AxiosResponse } from 'axios';
import xml2js from 'xml-js';
//import redisClient from './app';

import { ApiError } from './errors';
import {
  AllMakesResponse,
  VehicleTypesForMakeIdsResp,
  MakeAndVehicle,
  MakeIdModal,
  VehicleType,
} from './types';

const AllMakesUrl =
  'https://vpic.nhtsa.dot.gov/api/vehicles/getallmakes?format=XML';
const VehicalTypesForMakeIdBaseUrl =
  'https://vpic.nhtsa.dot.gov/api/vehicles/GetVehicleTypesForMakeId';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    //Check if Makes data exists in redis
    //let cachedData = await redisClient.LRANGE('VehicalData', 0, -1);
    // if (cachedData.length) {
    //   const jsonData = cachedData.map((data) => {
    //     const obj = JSON.parse(data);
    //     const keys = Object.keys(obj);
    //     return obj[keys[0]];
    //   });
    //   res.status(200).send(jsonData);
    //   return;
    // }

    const allMakesData = await getAllMakes();

    let normalizedMakesData = allMakesData.map((make: MakeIdModal) => {
      const make_vehicale: MakeAndVehicle = {
        makeId: make.Make_ID._text,
        makeName: make.Make_Name._text,
        vehicleTypes: [],
      };
      return make_vehicale;
    });

    console.log('Size of all Makes: ', normalizedMakesData.length);

    const promises = [];

    let resultsMap = new Map();
    normalizedMakesData.forEach((make) => {
      if (resultsMap.size <= 5) {
        resultsMap.set(make.makeId, make);
      }
      //redisData.push(JSON.stringify({ [make.makeId]: make }));
    });
    //await redisClient.RPUSH('VehicalData', redisData);

    //const dataInRedis = await redisClient.LRANGE('VehicalData', 0, -1);
    // const jsonData = dataInRedis.map((data) => {
    //   const obj = JSON.parse(data);
    //   const keys = Object.keys(obj);
    //   return obj[keys[0]];
    // });

    const results = await GetVehiclesForMakeId(resultsMap);
    //console.log(results);
    res.status(200).send(results);
  } catch (error) {
    console.log('Error: ', error);
    res.status(error.statusCode).send(error.message);
  }
});

async function getAllMakes(): Promise<AllMakesResponse> {
  const allMakesResp = await axios.get(AllMakesUrl);
  const data = handleApiResponse(allMakesResp);

  try {
    const jsonData = JSON.parse(data);
    return jsonData.Response.Results.AllVehicleMakes;
  } catch (error) {
    throw new ApiError('Failed to parse response data', 500);
  }
}

async function GetVehiclesForMakeId(resultsMap) {
  const result = await Promise.allSettled(
    Array.from(resultsMap, async ([key, value]) => {
      const vehicleTypeArray = await fetchVehicleDetails(key);
      let normalizedVehicleTypes = null;

      //Some response can return a single object instead for array of objects for VehicleTypesForMakeIds
      if (!Array.isArray(vehicleTypeArray)) {
        normalizedVehicleTypes = {
          typeId: vehicleTypeArray.VehicleTypeId._text,
          typeName: vehicleTypeArray.VehicleTypeName._text,
        };
      } else {
        normalizedVehicleTypes = vehicleTypeArray.map((vtype) => {
          return {
            typeId: vtype.VehicleTypeId._text,
            typeName: vtype.VehicleTypeName._text,
          };
        });
      }

      return [
        key,
        (value = {
          ...value,
          vehicleTypes: normalizedVehicleTypes,
        }),
      ];
    })
  );

  return result;

  // try {
  //   const jsonData = JSON.parse(data);
  //   return jsonData.Response.Results.VehicleTypesForMakeIds;
  // } catch (error) {
  //   throw new ApiError('Failed to parse response data', 500);
  // }
}

async function fetchVehicleDetails(makeId) {
  const getVehiclesFromMakeIdUrl = `${VehicalTypesForMakeIdBaseUrl}/${makeId}?format=xml`;
  const getVehiclesResp = await axios.get(getVehiclesFromMakeIdUrl);

  const data = handleApiResponse(getVehiclesResp);

  const jsonData = JSON.parse(data).Response.Results.VehicleTypesForMakeIds;
  if (makeId == '444' || makeId == '445') {
    console.log(makeId, jsonData);
  }
  return jsonData;
}

function handleApiResponse(response: AxiosResponse) {
  if (response.status === 200) {
    const data = xml2js.xml2json(response.data, {
      compact: true,
    });
    return data;
  } else {
    throw new ApiError(
      `Failed to fetch data. NHTSA API responded with: ${response}`,
      500
    );
  }
}

export default router;
