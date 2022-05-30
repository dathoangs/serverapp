import {Status} from "../enum/status.enum";

export interface Server{
  id: number;
  ipAddress: String;
  name: String;
  memory: String;
  type: String;
  imageUrl: String;
  status: Status;
}
