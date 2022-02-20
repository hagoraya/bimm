import express from "express";
import axios, { AxiosResponse } from "axios";
import xml2js from "xml-js";

import { ApiError } from "./errors";
import { AllMakesResponse, VehicleTypesForMakeIdsResp } from "./types";
import redisClient from "./app";

const AllMakesUrl =
  "https://vpic.nhtsa.dot.gov/api/vehicles/getallmakes?format=XML";
const VehicalTypesForMakeIdBaseUrl =
  "https://vpic.nhtsa.dot.gov/api/vehicles/GetVehicleTypesForMakeId/";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const allMakesData = await getAllMakes();

    const allVehiclasTypes = await GetVehiclesForMakeId(
      allMakesData[0].Make_ID._text
    );

    res.status(200).send(allVehiclasTypes);
  } catch (error) {
    res.status(error.statusCode ? error.statusCode : 500).send(error.message);
  }
});

async function getAllMakes(): Promise<AllMakesResponse> {
  const allMakesResp = await axios.get(AllMakesUrl);
  const data = handleApiResponse(allMakesResp);

  try {
    const jsonData = JSON.parse(data);
    return jsonData.Response.Results.AllVehicleMakes;
  } catch (error) {
    throw new ApiError("Failed to parse response data", 500);
  }
}

async function GetVehiclesForMakeId(
  makeId: String
): Promise<VehicleTypesForMakeIdsResp> {
  const getVehiclesFromMakeIdUrl = `${VehicalTypesForMakeIdBaseUrl}/${makeId}?format=xml`;
  const getVehiclesResp = await axios.get(getVehiclesFromMakeIdUrl);
  const data = handleApiResponse(getVehiclesResp);

  try {
    const jsonData = JSON.parse(data);
    return jsonData.Response.Results.VehicleTypesForMakeIds;
  } catch (error) {
    throw new ApiError("Failed to parse response data", 500);
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
      `Failed to fetch data. NHTSA API responded with status: ${response.status}`,
      500
    );
  }
}

export default router;
