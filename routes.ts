import express from 'express';
import axios, { AxiosResponse } from 'axios';
import xml2js, { js2xml } from 'xml-js';
import redisClient from './app';

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
    const makeIds = await redisClient.keys('*');

    const allMakesData = await getAllMakes();

    let normalizedMakesData = allMakesData.map((make: MakeIdModal) => {
      const make_vehicale: MakeAndVehicle = {
        makeId: make.Make_ID._text,
        makeName: make.Make_Name._text,
        vehicleTypes: [],
      };
      return make_vehicale;
    });

    const promises = [];

    let resultsMap = new Map();
    normalizedMakesData.forEach((make) => {
      if (resultsMap.size <= 500) {
        resultsMap.set(make.makeId, make);
      }
    });
    const results = await GetVehiclesForMakeId(resultsMap);
    const realMap = new Map();
    const cacheArray = [];

    const normalizedResults = results.forEach((obj) => {
      if (obj.status === 'fulfilled') {
        realMap.set(obj.value[0], obj.value[1]);
        cacheArray.push(obj.value[0]);
        cacheArray.push(JSON.stringify(obj.value[1]));
      }
    });

    await redisClient.MSET(cacheArray, (err, reply) => {
      if (err) {
        res.status(500).send('Error saving data');
      }
    });

    const cache = await redisClient.GET('440');
    res.status(200).send([...realMap.values()]);
  } catch (error) {
    res.status(error.statusCode || 500).send(error.message);
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
      const cachedData = await redisClient.GET(key);
      if (cachedData) {
        console.log(`Cached ${key}`);
        const vehicleTypes = JSON.parse(cachedData).vehicleTypes;
        return [
          key,
          (value = {
            ...value,
            vehicleTypes,
          }),
        ];
      }
      console.log(`Fetching ${key}`);

      const vehicleTypeArray = await fetchVehicleDetails(key);
      const normalizedVehicleTypes = vehicleTypeArray.map((vtype) => {
        return {
          typeId: vtype.VehicleTypeId._text,
          typeName: vtype.VehicleTypeName._text,
        };
      });
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
}

async function fetchVehicleDetails(makeId) {
  const getVehiclesFromMakeIdUrl = `${VehicalTypesForMakeIdBaseUrl}/${makeId}?format=xml`;
  const getVehiclesResp = await axios.get(getVehiclesFromMakeIdUrl);

  const data = handleApiResponse(getVehiclesResp);

  const jsonData = JSON.parse(data).Response.Results.VehicleTypesForMakeIds;
  if (Array.isArray(jsonData)) {
    return jsonData;
  } else {
    return [jsonData];
  }
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
