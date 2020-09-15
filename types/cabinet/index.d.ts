import { Types } from "mongoose";
import ObjectId = Types.ObjectId;

type Cabinet = {
    _id?: ObjectId,
    name: string,
    owner?: string,
    newUser?: User,
    author: string,
    status: string,
    balance: {
      value: number,
      updated: string
    },
    points?: Point[],
    users?: string[]
  notifications?: string[]
  }
  type User = {
    _id?: ObjectId;
    name: string;
    surname?: string;
    login: string;
    password: string;
    role: string[],
    hash?: string,
    phone?: string,
    address?: string,
    status: boolean,
    token?: string;
    remember?: boolean,
    timeOfHashLife?: number,
    created?: {
      id: string,
      date: Date
    },
    author: string,
    cabinet: string,
    type?: string
  };