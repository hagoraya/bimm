type AllMakesResponse = [MakeIdModal];

type MakeIdModal = {
  Make_ID: {
    _text: string;
  };
  Make_Name: {
    _text: string;
  };
};

type MakeId = String;

type VehicleTypeResp = {
  VehicleTypeId: {
    _text: string;
  };
  VehicleTypeName: {
    _text: string;
  };
};

type MakeAndVehicle = {
  makeId: string;
  makeName: string;
  vehicleTypes: [] | [VehicleType];
};

type VehicleType = {
  typeId: string;
  typeName: string;
};

export {
  AllMakesResponse,
  VehicleTypesForMakeIdsResp,
  MakeAndVehicle,
  MakeIdModal,
  MakeId,
  VehicleType,
};
