type AllMakesResponse = [MakeIdModal];

type MakeIdModal = {
  Make_ID: {
    _text: string;
  };
  Make_Name: {
    _text: string;
  };
};

type VehicleTypesForMakeIdsResp = [VehicleTypeResp];

type VehicleTypeResp = {
  VehicleTypeId: {
    _text: string;
  };
  VehicleTypeName: {
    _text: string;
  };
};

export { AllMakesResponse, VehicleTypesForMakeIdsResp };
