import {Server} from "./server";


export interface CustomResponse{
  timeStamp: Date;
  statusCode: number;
  status: String;
  reason: String;
  message: String;
  developerMessage: String;
  data: {servers?: Server[], server?: Server}

}
