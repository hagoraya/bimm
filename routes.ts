import express from "express";
import axios from "axios";
import xml2js from "xml-js";

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
    res.status(500).send(error.message);
  }
});

async function getAllMakes() {
  const allMakesResp = await axios.get(getAllMakesUrl);
  if (allMakesResp.status === 200) {
    const data = xml2js.xml2json(allMakesResp.data, {
      compact: true,
    });
    try {
      const jsonData = JSON.parse(data);
      return jsonData?.Response?.Results?.AllVehicleMakes;
    } catch (error) {
      throw new Error(`Unable to parse JSON data`);
    }
  } else {
    throw new Error(
      `Failed to fetch all makes data. NHTSA Api responded with status: ${allMakesResp.status} `
    );
  }
}

async function GetVehiclesForMakeId(makeId: String) {}

export default router;
