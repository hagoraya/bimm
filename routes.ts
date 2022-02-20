import express from 'express';
import axios, { AxiosResponse } from 'axios';
import xml2js from 'xml-js';
import redisClient from './app';

import { ApiError } from './errors';
import {
  AllMakesResponse,
  VehicleTypesForMakeIdsResp,
  MakeAndVehicle,
  MakeIdModal,
} from './types';

const AllMakesUrl =
  'https://vpic.nhtsa.dot.gov/api/vehicles/getallmakes?format=XML';
const VehicalTypesForMakeIdBaseUrl =
  'https://vpic.nhtsa.dot.gov/api/vehicles/GetVehicleTypesForMakeId';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    //Check if Makes data exists in redis
    let cachedData = await redisClient.LRANGE('VehicalData', 0, -1);
    console.log('cachedData', cachedData);
    if (cachedData.length) {
      const jsonData = cachedData.map((data) => {
        const obj = JSON.parse(data);
        const keys = Object.keys(obj);
        return obj[keys[0]];
      });
      res.status(200).send(jsonData);
      return;
    }

    const allMakesData = await getAllMakes();

    let normalizedMakesData = allMakesData.map((make: MakeIdModal) => {
      return {
        makeId: make.Make_ID._text,
        makeName: make.Make_Name._text,
      };
    });

    console.log('Size of all Makes: ', normalizedMakesData.length);

    const promises = [];

    let redisData = [];
    normalizedMakesData.forEach((make) => {
      promises.push(make.makeId);
      redisData.push(JSON.stringify({ [make.makeId]: make }));
    });
    console.log(redisData);
    await redisClient.RPUSH('VehicalData', redisData);

    const dataInRedis = await redisClient.LRANGE('VehicalData', 0, -1);
    const jsonData = dataInRedis.map((data) => {
      const obj = JSON.parse(data);
      const keys = Object.keys(obj);
      return obj[keys[0]];
    });

    res.status(200).send(jsonData);
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

async function GetVehiclesForMakeId(
  makeId: String
): Promise<VehicleTypesForMakeIdsResp> {
  console.log('Getting data for: ', makeId);
  const getVehiclesFromMakeIdUrl = `${VehicalTypesForMakeIdBaseUrl}/${makeId}?format=xml`;
  const getVehiclesResp = await axios.get(getVehiclesFromMakeIdUrl);
  const data = handleApiResponse(getVehiclesResp);

  try {
    const jsonData = JSON.parse(data);
    return jsonData.Response.Results.VehicleTypesForMakeIds;
  } catch (error) {
    throw new ApiError('Failed to parse response data', 500);
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
