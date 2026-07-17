import { UserModel } from "../../user/models/user.model";


export interface GroupModel {
  id: number;
  name: string;
  createdAt: string;
  members: UserModel[];
}

export interface GroupCreateRequest {
  name: string;
  createdBy: number;
  memberIds: number[];
}