

type MessageParsed = {
  point_id: string,
  code: string,
  value: number,
  hardware_address: number,
  remote_time: Date,
  incoming_time: Date,
  growth?: number
};

type RemoteData = {
  _id: Object
  remote_key: string,
  params: RemoteParam[],
  timestamp: Date
};

type ExpectedAMQPMessage = {
  point_id: string,
  hardware_address: number,
  code: string,
  value: any,
  remote_time: string,
  incoming_time: string
}


type RemoteParam = {
  code: string,
  value: number,
  hardware_address: number,
  timestamp?: Date,
  remote_key?: string,
  remote_data_timestamp?: Date,
  growth?: number,
  point_id?: string

};

type ParamCodeValue = {
  code: string,
  value: string | number,
  hardware_address: number,
  server_timestamp: Date,
  remote_data_timestamp: Date
};

// { hardware_address: { code: value } }
type RemoteDataHash = {
  [key: string]: {
    [key: string]: CodeObject
  }
};

type CodeObject = {
  value: string | number,
  timestamp: number
};

type RemoteDataStatus = {
  remote_key: string,
  hardware_address: string,
  timestamp: Date,
};

// { remote_key: { hardware_address: Date (lastActivity) } }
type remoteDataStatusHash = {
  [key: string]: {
    [key: string]: Date
  }
};

type RemoteDataFinance = {
  hardware_address: string,
  finance: CodeValueHash[]
};

type CodeValueHash = {
  code: string,
  value: string
};

// { hardware_address: remoteData_current_day_finance[] }
type RemoteDataCurrentDayHash = {
  [key: string]: string[]
};

type AntNotification = {
  _id?:string,
  pointId: string,
  param: Param,
  condition: {
    cond: string,
    value: number
  }
}
