import express from "express";
import axios, { AxiosResponse } from "axios";
import xml2js from "xml-js";

import { ApiError } from "./errors";

const getAllMakesUrl =
  "https://vpic.nhtsa.dot.gov/api/vehicles/getallmakes?format=XML";
const getVehicalTypesForMakeIdUrl =
  "https://vpic.nhtsa.dot.gov/api/vehicles/GetVehicleTypesForMakeId/";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const allMakesData = await getAllMakes();
    res.status(200).send(allMakesData);
  } catch (error) {
    res.status(error.statusCode ? error.statusCode : 500).send(error.message);
  }
});

async function getAllMakes() {
  const allMakesResp = await axios.get(getAllMakesUrl);
  const data = handleApiResponse(allMakesResp);
  try {
    const jsonData = JSON.parse(data);
    return jsonData.Response.Results.AllVehicleMakes;
  } catch (error) {
    throw new ApiError("Failed to parse data", 500);
  }
}

async function GetVehiclesForMakeId(makeId: String) {
  const allMakesResp = await axios.get(getAllMakesUrl);
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
